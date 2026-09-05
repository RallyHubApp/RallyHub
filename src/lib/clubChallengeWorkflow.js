import { analyseClubChallengeFairness, calculateClubChallengeScore, validateClubChallengeScore, checkResultRevision } from './clubChallengeEngine';

export const CLUB_CHALLENGE_RULES_VERSION = '1.0';

export function createChallengeEventDraft({ tournament, hostClub, opponent, setup }) {
  if (!tournament?.id || !tournament?.tenant_id) throw new Error('Club Challenge requires a tenant-owned Tournament.');
  if (!hostClub?.name || !opponent?.name) throw new Error('Both clubs require a name.');
  return {
    tenant_id: tournament.tenant_id,
    tournament_id: tournament.id,
    host_club_id: tournament.host_club_id || hostClub.id || '',
    rules_version: CLUB_CHALLENGE_RULES_VERSION,
    status: 'draft',
    club_a_name: hostClub.name,
    club_a_logo_url: hostClub.logo_url || '',
    club_a_primary_colour: hostClub.primary_colour || '',
    club_a_secondary_colour: hostClub.secondary_colour || '',
    club_b_name: opponent.name,
    club_b_logo_url: opponent.logo_url || '',
    club_b_primary_colour: opponent.primary_colour || '',
    club_b_secondary_colour: opponent.secondary_colour || '',
    courts: Number(setup.courts),
    available_minutes: Number(setup.availableMinutes),
    play_minutes: Number(setup.playMinutes),
    changeover_minutes: Number(setup.changeoverMinutes || 0),
    include_break: !!setup.includeBreak,
    break_minutes: Number(setup.breakMinutes || 0),
    break_after_round: setup.breakAfterRound ? Number(setup.breakAfterRound) : undefined,
    normal_match_type: setup.matchFormat?.type || 'timed',
    normal_target_points: setup.matchFormat?.target,
    normal_win_by: setup.matchFormat?.winBy,
    timed_draws_allowed: setup.matchFormat?.drawsAllowed !== false,
    win_points: Number(setup.winPoints ?? 2), draw_points: Number(setup.drawPoints ?? 1), loss_points: Number(setup.lossPoints ?? 0),
    composition_mode: setup.compositionMode || 'open',
    allow_overall_draw: setup.allowOverallDraw !== false,
    showcase_enabled: !!setup.showcaseEnabled,
    showcase_points: Number(setup.showcasePoints || 0),
    pot_enabled: !!setup.potEnabled,
    pot_status: setup.potEnabled ? 'closed' : 'disabled',
    draw_version: 0, current_round: 0, event_pack_version: 0, event_pack_stale: true,
  };
}

export function buildApprovedDraw({ schedule, clubAPlayers, clubBPlayers, previousVersion = 0, approvedBy, approvedAt = new Date().toISOString() }) {
  const fairness = analyseClubChallengeFairness({ schedule, clubAPlayers, clubBPlayers });
  if (fairness.duplicatePlayerRoundIssues || fairness.sameClubIntegrityIssues || !fairness.equalGames) {
    throw new Error('Draw cannot be approved because hard fairness constraints failed.');
  }
  return { draw_version: Number(previousVersion || 0) + 1, status: 'draw_approved', draw_approved_by: approvedBy || '', draw_approved_at: approvedAt, fairness_json: JSON.stringify(fairness), event_pack_stale: true };
}

export function fixtureRecordsFromSchedule({ event, schedule, participantMap = {} }) {
  let matchNumber = 0;
  return schedule.rounds.flatMap(round => round.courts.map(court => {
    matchNumber++;
    return {
      tenant_id: event.tenant_id, challenge_event_id: event.id, tournament_id: event.tournament_id,
      draw_version: event.draw_version, round_number: round.roundNumber, court_number: court.courtNumber,
      club_a_participant_ids: court.clubA, club_b_participant_ids: court.clubB,
      club_a_names: court.clubA.map(id => participantMap[id]?.display_name || participantMap[id]?.name || id),
      club_b_names: court.clubB.map(id => participantMap[id]?.display_name || participantMap[id]?.name || id),
      status: 'scheduled', winner: 'none', revision: 0, correction_count: 0, is_showcase: false, match_number: matchNumber,
    };
  }));
}

export function prepareScoreMutation({ match, scoreA, scoreB, matchFormat, expectedRevision, userId, now = new Date().toISOString() }) {
  const revision = checkResultRevision({ expectedRevision, currentRevision: match.revision || 0 });
  if (revision.conflict) return { ok: false, conflict: true, current: match, attempted: { scoreA, scoreB } };
  const validation = validateClubChallengeScore({ scoreA, scoreB, matchFormat });
  if (!validation.valid) return { ok: false, conflict: false, error: validation.error };
  const isCorrection = ['completed', 'draw'].includes(match.status);
  const winner = validation.outcome === 'clubA' ? 'club_a' : validation.outcome === 'clubB' ? 'club_b' : 'draw';
  return {
    ok: true,
    update: {
      score_a: Number(scoreA), score_b: Number(scoreB), winner,
      status: winner === 'draw' ? 'draw' : 'completed', revision: revision.nextRevision,
      scored_by_user_id: match.scored_by_user_id || userId || '', scored_at: match.scored_at || now,
      ...(isCorrection ? { last_corrected_by_user_id: userId || '', last_corrected_at: now, correction_count: Number(match.correction_count || 0) + 1 } : {}),
    },
    audit: isCorrection ? { action: 'score_corrected', old_value_json: JSON.stringify({ score_a: match.score_a, score_b: match.score_b, winner: match.winner }), new_value_json: JSON.stringify({ score_a: Number(scoreA), score_b: Number(scoreB), winner }), occurred_at: now } : null,
  };
}

export function scoreFromMatchRecords(matches, points = {}) {
  return calculateClubChallengeScore((matches || []).map(m => ({ scoreA: m.score_a, scoreB: m.score_b, status: ['completed', 'draw'].includes(m.status) ? m.status : 'missing' })), points);
}

export function replaceParticipantInFutureMatches({ matches, outgoingParticipantId, incomingParticipantId, effectiveRound }) {
  return (matches || []).map(match => {
    if (match.round_number < effectiveRound || ['completed', 'draw', 'retired', 'forfeit', 'abandoned'].includes(match.status)) return match;
    const replace = ids => (ids || []).map(id => id === outgoingParticipantId ? incomingParticipantId : id);
    return { ...match, club_a_participant_ids: replace(match.club_a_participant_ids), club_b_participant_ids: replace(match.club_b_participant_ids), revision: Number(match.revision || 0) + 1 };
  });
}

export function finalisationIssues({ matches, showcaseEnabled, showcaseComplete, potEnabled, potStatus }) {
  const missing = (matches || []).filter(m => !['completed', 'draw', 'retired', 'forfeit', 'abandoned', 'not_played'].includes(m.status));
  const issues = [];
  if (missing.length) issues.push(`${missing.length} match result${missing.length === 1 ? '' : 's'} unresolved.`);
  if (showcaseEnabled && !showcaseComplete) issues.push('Showcase Final is incomplete.');
  if (potEnabled && potStatus === 'open') issues.push('Player of the Tournament voting is still open.');
  return issues;
}
