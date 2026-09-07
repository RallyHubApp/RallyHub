import { canTransitionRound, canTransitionSession } from './kotcV2Domain.js';

export const KOTC_COMMAND_TYPES = Object.freeze([
  'confirm_round',
  'start_round',
  'autosave_score',
  'complete_match',
  'correct_match',
  'generate_next_round',
  'pause_session',
  'resume_session',
  'finish_after_round',
  'finish_session_now',
  'abandon_session',
  'takeover_host',
]);

const RESOLVED_MATCH_STATUSES = new Set(['completed', 'retired', 'abandoned', 'not_played']);

function wholeNonNegative(value) {
  return Number.isInteger(Number(value)) && Number(value) >= 0;
}

export function checkRevision({ expectedRevision, currentRevision, label = 'Session' }) {
  const expected = Number(expectedRevision);
  const current = Number(currentRevision);
  if (!Number.isInteger(expected) || expected < 0 || !Number.isInteger(current) || current < 0) {
    throw new Error(`${label} revisions must be non-negative integers`);
  }
  return {
    canWrite: expected === current,
    conflict: expected !== current,
    nextRevision: current + 1,
  };
}

export function checkCommandEnvelope({ commandId, commandType, expectedSessionRevision, currentSessionRevision, priorCommands = [] }) {
  if (!commandId || typeof commandId !== 'string') throw new Error('commandId is required');
  if (!KOTC_COMMAND_TYPES.includes(commandType)) throw new Error(`Unsupported KOTC command: ${commandType}`);

  const duplicate = (priorCommands ?? []).find((entry) => entry.command_id === commandId || entry.commandId === commandId);
  if (duplicate) {
    return {
      ok: false,
      duplicate: true,
      conflict: false,
      priorResult: duplicate.result_json ?? duplicate.resultJson ?? null,
      currentRevision: Number(currentSessionRevision),
    };
  }

  const revision = checkRevision({ expectedRevision: expectedSessionRevision, currentRevision: currentSessionRevision, label: 'Session' });
  if (revision.conflict) {
    return {
      ok: false,
      duplicate: false,
      conflict: true,
      currentRevision: Number(currentSessionRevision),
      expectedRevision: Number(expectedSessionRevision),
    };
  }

  return { ok: true, duplicate: false, conflict: false, nextRevision: revision.nextRevision };
}

export function validateKotcScore({ teamAScore, teamBScore, session, servingSideAtHorn = null, final = false }) {
  const a = Number(teamAScore);
  const b = Number(teamBScore);
  if (!wholeNonNegative(a) || !wholeNonNegative(b)) {
    return { valid: false, error: 'Scores must be non-negative whole numbers.' };
  }

  if (!final) return { valid: true, teamAScore: a, teamBScore: b, winnerSide: a === b ? null : a > b ? 'A' : 'B', resultMethod: null };

  if (session?.scoring_mode === 'timed') {
    if (a === b) {
      if (!['A', 'B'].includes(servingSideAtHorn)) {
        return { valid: false, error: 'A tied timed match requires the serving side at the horn.' };
      }
      return { valid: true, teamAScore: a, teamBScore: b, winnerSide: servingSideAtHorn, resultMethod: 'timed_serving_tiebreak' };
    }
    return { valid: true, teamAScore: a, teamBScore: b, winnerSide: a > b ? 'A' : 'B', resultMethod: 'normal' };
  }

  if (session?.scoring_mode !== 'first_to') return { valid: false, error: 'Unknown KOTC scoring mode.' };
  if (a === b) return { valid: false, error: 'First-to scoring requires a winner.' };

  const target = Number(session?.score_target ?? 11);
  const winByTwo = Boolean(session?.win_by_two);
  const cap = Number(session?.score_cap || 0);
  const winner = Math.max(a, b);
  const loser = Math.min(a, b);
  const lead = winner - loser;

  if (!Number.isInteger(target) || target < 1) return { valid: false, error: 'Invalid score target.' };
  if (winner < target) return { valid: false, error: `Winner must reach at least ${target}.` };
  if (cap > 0 && winner > cap) return { valid: false, error: `Score cannot exceed cap of ${cap}.` };
  if (winByTwo && lead < 2 && !(cap > 0 && winner === cap)) return { valid: false, error: 'Winner must lead by 2 unless the score cap is reached.' };
  if (!winByTwo && winner > target && !(cap > 0 && winner === cap)) return { valid: false, error: `Match should finish when a team reaches ${target}.` };

  return { valid: true, teamAScore: a, teamBScore: b, winnerSide: a > b ? 'A' : 'B', resultMethod: 'normal' };
}

export function prepareScoreAutosave({ match, teamAScore, teamBScore, expectedRevision, commandId, now = new Date().toISOString() }) {
  const revision = checkRevision({ expectedRevision, currentRevision: match?.revision ?? 0, label: 'Match' });
  if (revision.conflict) return { ok: false, conflict: true, current: match };
  if (!wholeNonNegative(teamAScore) || !wholeNonNegative(teamBScore)) return { ok: false, conflict: false, error: 'Scores must be non-negative whole numbers.' };
  if (RESOLVED_MATCH_STATUSES.has(match?.status)) return { ok: false, conflict: false, error: 'Resolved matches require a correction command.' };

  return {
    ok: true,
    update: {
      team_a_score: Number(teamAScore),
      team_b_score: Number(teamBScore),
      status: match?.status === 'scheduled' ? 'in_progress' : match?.status,
      revision: revision.nextRevision,
      command_id: commandId,
      autosaved_at: now,
    },
  };
}

export function prepareMatchCompletion({ match, session, teamAScore, teamBScore, servingSideAtHorn, expectedRevision, commandId, userId, now = new Date().toISOString() }) {
  const revision = checkRevision({ expectedRevision, currentRevision: match?.revision ?? 0, label: 'Match' });
  if (revision.conflict) return { ok: false, conflict: true, current: match };
  if (RESOLVED_MATCH_STATUSES.has(match?.status)) return { ok: false, conflict: false, error: 'Match is already resolved; use correction.' };

  const score = validateKotcScore({ teamAScore, teamBScore, session, servingSideAtHorn, final: true });
  if (!score.valid) return { ok: false, conflict: false, error: score.error };

  return {
    ok: true,
    update: {
      team_a_score: score.teamAScore,
      team_b_score: score.teamBScore,
      winner_side: score.winnerSide,
      serving_side_at_horn: score.resultMethod === 'timed_serving_tiebreak' ? servingSideAtHorn : undefined,
      result_method: score.resultMethod,
      status: 'completed',
      completed_at: now,
      revision: revision.nextRevision,
      command_id: commandId,
      scored_by_user_id: userId,
    },
  };
}

export function prepareMatchCorrection({ match, session, teamAScore, teamBScore, servingSideAtHorn, expectedRevision, commandId, userId, reason, nextRound = null, now = new Date().toISOString() }) {
  const revision = checkRevision({ expectedRevision, currentRevision: match?.revision ?? 0, label: 'Match' });
  if (revision.conflict) return { ok: false, conflict: true, current: match };
  if (!RESOLVED_MATCH_STATUSES.has(match?.status)) return { ok: false, conflict: false, error: 'Only resolved matches can be corrected.' };
  if (!String(reason || '').trim()) return { ok: false, conflict: false, error: 'A correction reason is required.' };

  const score = validateKotcScore({ teamAScore, teamBScore, session, servingSideAtHorn, final: true });
  if (!score.valid) return { ok: false, conflict: false, error: score.error };

  const nextRoundStarted = nextRound && ['started', 'completed'].includes(nextRound.status);
  const correction = {
    ok: true,
    update: {
      team_a_score: score.teamAScore,
      team_b_score: score.teamBScore,
      winner_side: score.winnerSide,
      serving_side_at_horn: score.resultMethod === 'timed_serving_tiebreak' ? servingSideAtHorn : undefined,
      result_method: score.resultMethod,
      status: 'completed',
      revision: revision.nextRevision,
      correction_count: Number(match?.correction_count || 0) + 1,
      last_corrected_at: now,
      last_corrected_by_user_id: userId,
      last_correction_reason: String(reason).trim(),
      original_result_json: match?.original_result_json || JSON.stringify({
        team_a_score: match?.team_a_score,
        team_b_score: match?.team_b_score,
        winner_side: match?.winner_side,
        result_method: match?.result_method,
        revision: match?.revision ?? 0,
      }),
      command_id: commandId,
    },
    roundRepair: nextRoundStarted
      ? { regenerateProposal: false, preserveStartedLayout: true, repairAtNextSafeTransition: true }
      : { regenerateProposal: Boolean(nextRound), preserveStartedLayout: false, repairAtNextSafeTransition: false },
    audit: {
      action: 'kotc_score_corrected',
      reason: String(reason).trim(),
      before: {
        team_a_score: match?.team_a_score,
        team_b_score: match?.team_b_score,
        winner_side: match?.winner_side,
        revision: match?.revision ?? 0,
      },
      after: {
        team_a_score: score.teamAScore,
        team_b_score: score.teamBScore,
        winner_side: score.winnerSide,
        revision: revision.nextRevision,
      },
    },
  };
  return correction;
}

export function unresolvedMatches(matches = []) {
  return matches.filter((match) => !RESOLVED_MATCH_STATUSES.has(match.status));
}

export function finalisationIssues({ session, rounds = [], matches = [], pendingCorrections = [] }) {
  const issues = [];
  const unresolved = unresolvedMatches(matches);
  if (unresolved.length) issues.push(`${unresolved.length} match result${unresolved.length === 1 ? '' : 's'} unresolved.`);
  if (rounds.some((round) => ['proposed', 'confirmed', 'started'].includes(round.status))) issues.push('A round is still open.');
  if ((pendingCorrections ?? []).length) issues.push(`${pendingCorrections.length} pending correction${pendingCorrections.length === 1 ? '' : 's'}.`);
  if (!['completed', 'finalised'].includes(session?.status)) issues.push('Session must be completed before finalisation.');
  return issues;
}

export function prepareSessionTransition({ session, toStatus, expectedRevision, commandId, userId, reason = '', now = new Date().toISOString() }) {
  const revision = checkRevision({ expectedRevision, currentRevision: session?.revision ?? 0, label: 'Session' });
  if (revision.conflict) return { ok: false, conflict: true, current: session };
  if (!canTransitionSession(session?.status, toStatus)) return { ok: false, conflict: false, error: `Invalid session transition ${session?.status} -> ${toStatus}` };

  const update = { status: toStatus, revision: revision.nextRevision, last_command_id: commandId };
  if (toStatus === 'completed') update.actual_session_end = now;
  if (toStatus === 'finalised') {
    update.finalised_at = now;
    update.finalised_by_user_id = userId;
  }
  if (toStatus === 'abandoned') {
    update.actual_session_end = now;
    update.abandonment_reason = String(reason || '').trim();
  }
  return { ok: true, update };
}

export function prepareRoundTransition({ round, toStatus, expectedProposalRevision = null, commandId, userId, now = new Date().toISOString() }) {
  if (!canTransitionRound(round?.status, toStatus)) return { ok: false, error: `Invalid round transition ${round?.status} -> ${toStatus}` };
  if (expectedProposalRevision != null && Number(expectedProposalRevision) !== Number(round?.proposal_revision ?? 1)) {
    return { ok: false, conflict: true, currentProposalRevision: Number(round?.proposal_revision ?? 1) };
  }
  const update = { status: toStatus, generated_by_command_id: round?.generated_by_command_id || commandId };
  if (toStatus === 'confirmed') {
    update.confirmed_at = now;
    update.confirmed_by_user_id = userId;
  }
  if (toStatus === 'started') update.started_at = now;
  if (toStatus === 'completed') update.completed_at = now;
  return { ok: true, update };
}

export function prepareRegeneratedRoundProposal({ round, commandId, inputHash, outputHash }) {
  if (!['proposed', 'confirmed'].includes(round?.status)) return { ok: false, error: 'Only an unstarted round proposal can be regenerated.' };
  return {
    ok: true,
    supersedeUpdate: { status: 'superseded' },
    replacement: {
      round_number: round.round_number,
      status: 'proposed',
      proposal_revision: Number(round.proposal_revision || 1) + 1,
      supersedes_round_id: round.id,
      generated_by_command_id: commandId,
      active_court_count: round.active_court_count,
      bench_count: round.bench_count,
      engine_input_hash: inputHash,
      engine_output_hash: outputHash,
    },
  };
}

export function buildRecoverySnapshot({ session, participants = [], rounds = [], slots = [], matches = [], participationEvents = [], sessionCourts = [] }) {
  return {
    schemaVersion: 1,
    session: { ...session },
    participants: participants.map((item) => ({ ...item })),
    rounds: rounds.map((item) => ({ ...item })),
    slots: slots.map((item) => ({ ...item })),
    matches: matches.map((item) => ({ ...item })),
    participationEvents: participationEvents.map((item) => ({ ...item })),
    sessionCourts: sessionCourts.map((item) => ({ ...item })),
  };
}

export function validateRecoverySnapshot(snapshot) {
  const errors = [];
  if (!snapshot || snapshot.schemaVersion !== 1) errors.push('Unsupported or missing recovery snapshot version.');
  if (!snapshot?.session?.id && !snapshot?.session?.session_id) errors.push('Recovery snapshot is missing the session identity.');
  const ids = (snapshot?.participants ?? []).map((p) => p.id ?? p.participant_id).filter(Boolean);
  if (new Set(ids).size !== ids.length) errors.push('Recovery snapshot contains duplicate participant identities.');
  for (const match of snapshot?.matches ?? []) {
    if (match.status === 'completed' && !['A', 'B'].includes(match.winner_side)) errors.push(`Completed match ${match.id ?? '?'} has no valid winner.`);
  }
  return { valid: errors.length === 0, errors };
}

export function nextCheckpointSequence(existing = []) {
  return Math.max(0, ...existing.map((checkpoint) => Number(checkpoint.sequence || 0))) + 1;
}

export function prepareHostTakeover({ activeLease, newUserId, expectedLeaseRevision, reason, now = new Date().toISOString() }) {
  if (!newUserId) return { ok: false, error: 'New host user ID is required.' };
  if (!String(reason || '').trim()) return { ok: false, error: 'Host takeover reason is required.' };
  const currentRevision = Number(activeLease?.lease_revision || 0);
  if (Number(expectedLeaseRevision) !== currentRevision) return { ok: false, conflict: true, currentLeaseRevision: currentRevision };
  if (activeLease?.holder_user_id === newUserId && activeLease?.status === 'active') return { ok: true, alreadyHolder: true, current: activeLease };

  return {
    ok: true,
    supersedeCurrent: activeLease ? {
      status: 'superseded',
      released_at: now,
      superseded_by_user_id: newUserId,
      takeover_reason: String(reason).trim(),
    } : null,
    newLease: {
      holder_user_id: newUserId,
      lease_revision: currentRevision + 1,
      status: 'active',
      acquired_at: now,
      last_heartbeat_at: now,
      takeover_reason: String(reason).trim(),
    },
  };
}

export function canGenerateNextRound({ currentRound, matches = [] }) {
  if (currentRound?.status !== 'completed') return { allowed: false, reason: 'Current round must be completed.' };
  const currentMatches = matches.filter((match) => Number(match.round_number) === Number(currentRound.round_number));
  const unresolved = unresolvedMatches(currentMatches);
  if (unresolved.length) return { allowed: false, reason: `${unresolved.length} current-round match result(s) unresolved.` };
  return { allowed: true };
}
