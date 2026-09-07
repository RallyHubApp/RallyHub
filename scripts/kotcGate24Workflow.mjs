import assert from 'node:assert/strict';
import {
  buildRecoverySnapshot,
  canGenerateNextRound,
  checkCommandEnvelope,
  finalisationIssues,
  nextCheckpointSequence,
  prepareHostTakeover,
  prepareMatchCompletion,
  prepareMatchCorrection,
  prepareRegeneratedRoundProposal,
  prepareRoundTransition,
  prepareScoreAutosave,
  prepareSessionTransition,
  validateKotcScore,
  validateRecoverySnapshot,
} from '../src/lib/kotcV2Workflow.js';

const timedSession = { id: 's1', status: 'in_progress', revision: 4, scoring_mode: 'timed' };
const pointsSession = { id: 's2', status: 'in_progress', revision: 1, scoring_mode: 'first_to', score_target: 11, win_by_two: true, score_cap: 15 };

// Idempotency and stale-device protection.
let envelope = checkCommandEnvelope({ commandId: 'c1', commandType: 'autosave_score', expectedSessionRevision: 4, currentSessionRevision: 4, priorCommands: [] });
assert.equal(envelope.ok, true);
assert.equal(envelope.nextRevision, 5);
envelope = checkCommandEnvelope({ commandId: 'c1', commandType: 'autosave_score', expectedSessionRevision: 4, currentSessionRevision: 5, priorCommands: [{ command_id: 'c1', result_json: '{"ok":true}' }] });
assert.equal(envelope.duplicate, true);
envelope = checkCommandEnvelope({ commandId: 'c2', commandType: 'autosave_score', expectedSessionRevision: 4, currentSessionRevision: 5, priorCommands: [] });
assert.equal(envelope.conflict, true);

// Partial score autosave is independently revision protected.
const openMatch = { id: 'm1', status: 'scheduled', revision: 0 };
let autosave = prepareScoreAutosave({ match: openMatch, teamAScore: 5, teamBScore: 3, expectedRevision: 0, commandId: 'score-1', now: '2026-09-07T12:00:00Z' });
assert.equal(autosave.ok, true);
assert.equal(autosave.update.status, 'in_progress');
assert.equal(autosave.update.revision, 1);
assert.equal(autosave.update.team_a_score, 5);
autosave = prepareScoreAutosave({ match: { ...openMatch, revision: 1 }, teamAScore: 6, teamBScore: 3, expectedRevision: 0, commandId: 'stale' });
assert.equal(autosave.conflict, true);

// Timed tie: preserve raw tied score and use serving side metadata only for winner.
let score = validateKotcScore({ teamAScore: 8, teamBScore: 8, session: timedSession, servingSideAtHorn: 'B', final: true });
assert.equal(score.valid, true);
assert.equal(score.teamAScore, 8);
assert.equal(score.teamBScore, 8);
assert.equal(score.winnerSide, 'B');
assert.equal(score.resultMethod, 'timed_serving_tiebreak');
score = validateKotcScore({ teamAScore: 8, teamBScore: 8, session: timedSession, final: true });
assert.equal(score.valid, false);

// First-to validation including win-by-two and cap.
assert.equal(validateKotcScore({ teamAScore: 11, teamBScore: 9, session: pointsSession, final: true }).valid, true);
assert.equal(validateKotcScore({ teamAScore: 11, teamBScore: 10, session: pointsSession, final: true }).valid, false);
assert.equal(validateKotcScore({ teamAScore: 15, teamBScore: 14, session: pointsSession, final: true }).valid, true);
assert.equal(validateKotcScore({ teamAScore: 16, teamBScore: 14, session: pointsSession, final: true }).valid, false);

// Match completion and correction provenance.
let completion = prepareMatchCompletion({ match: { id: 'm2', status: 'in_progress', revision: 2 }, session: timedSession, teamAScore: 9, teamBScore: 7, expectedRevision: 2, commandId: 'complete-1', userId: 'u1', now: '2026-09-07T12:05:00Z' });
assert.equal(completion.ok, true);
assert.equal(completion.update.status, 'completed');
assert.equal(completion.update.revision, 3);

const resolved = { id: 'm2', status: 'completed', revision: 3, team_a_score: 9, team_b_score: 7, winner_side: 'A', result_method: 'normal', correction_count: 0 };
let correction = prepareMatchCorrection({ match: resolved, session: timedSession, teamAScore: 7, teamBScore: 9, expectedRevision: 3, commandId: 'corr-1', userId: 'u2', reason: 'Score entered on wrong side', nextRound: { id: 'r2', status: 'proposed' }, now: '2026-09-07T12:10:00Z' });
assert.equal(correction.ok, true);
assert.equal(correction.update.winner_side, 'B');
assert.equal(correction.update.correction_count, 1);
assert.equal(correction.roundRepair.regenerateProposal, true);
assert.ok(correction.update.original_result_json.includes('"winner_side":"A"'));

correction = prepareMatchCorrection({ match: resolved, session: timedSession, teamAScore: 7, teamBScore: 9, expectedRevision: 3, commandId: 'corr-2', userId: 'u2', reason: 'Late correction', nextRound: { id: 'r2', status: 'started' } });
assert.equal(correction.ok, true);
assert.equal(correction.roundRepair.regenerateProposal, false);
assert.equal(correction.roundRepair.preserveStartedLayout, true);
assert.equal(correction.roundRepair.repairAtNextSafeTransition, true);

// Proposal versioning: only an unstarted proposal can be superseded.
const proposal = { id: 'r2', round_number: 2, status: 'proposed', proposal_revision: 4, active_court_count: 3, bench_count: 2 };
const regenerated = prepareRegeneratedRoundProposal({ round: proposal, commandId: 'regen-1', inputHash: 'in', outputHash: 'out' });
assert.equal(regenerated.ok, true);
assert.equal(regenerated.supersedeUpdate.status, 'superseded');
assert.equal(regenerated.replacement.proposal_revision, 5);
assert.equal(regenerated.replacement.supersedes_round_id, 'r2');
assert.equal(prepareRegeneratedRoundProposal({ round: { ...proposal, status: 'started' }, commandId: 'x' }).ok, false);

// Round and session lifecycle revisions.
const confirmed = prepareRoundTransition({ round: { status: 'proposed', proposal_revision: 2 }, toStatus: 'confirmed', expectedProposalRevision: 2, commandId: 'rc', userId: 'u1', now: '2026-09-07T12:00:00Z' });
assert.equal(confirmed.ok, true);
assert.equal(confirmed.update.status, 'confirmed');
assert.equal(prepareRoundTransition({ round: { status: 'started', proposal_revision: 2 }, toStatus: 'confirmed', expectedProposalRevision: 2 }).ok, false);
const paused = prepareSessionTransition({ session: timedSession, toStatus: 'paused', expectedRevision: 4, commandId: 'pause', userId: 'u1' });
assert.equal(paused.ok, true);
assert.equal(paused.update.revision, 5);
assert.equal(prepareSessionTransition({ session: timedSession, toStatus: 'paused', expectedRevision: 3, commandId: 'stale', userId: 'u1' }).conflict, true);

// Finalisation blockers and safe next-round generation.
let issues = finalisationIssues({ session: { status: 'completed' }, rounds: [{ status: 'completed' }], matches: [{ status: 'completed' }, { status: 'in_progress' }], pendingCorrections: [] });
assert.equal(issues.length, 1);
assert.match(issues[0], /1 match result/);
issues = finalisationIssues({ session: { status: 'completed' }, rounds: [{ status: 'completed' }], matches: [{ status: 'completed' }], pendingCorrections: [] });
assert.deepEqual(issues, []);
assert.equal(canGenerateNextRound({ currentRound: { round_number: 1, status: 'completed' }, matches: [{ round_number: 1, status: 'completed' }] }).allowed, true);
assert.equal(canGenerateNextRound({ currentRound: { round_number: 1, status: 'started' }, matches: [{ round_number: 1, status: 'completed' }] }).allowed, false);

// Persistent recovery snapshot must contain real persisted results; no result fabrication.
const snapshot = buildRecoverySnapshot({
  session: { id: 's1', status: 'in_progress', revision: 7 },
  participants: [{ id: 'p1' }, { id: 'p2' }],
  rounds: [{ id: 'r1', round_number: 1, status: 'completed' }],
  matches: [{ id: 'm1', round_number: 1, status: 'completed', team_a_score: 8, team_b_score: 8, winner_side: 'A', result_method: 'timed_serving_tiebreak' }],
});
assert.equal(validateRecoverySnapshot(snapshot).valid, true);
const badSnapshot = buildRecoverySnapshot({ session: { id: 's1' }, matches: [{ id: 'm1', status: 'completed', team_a_score: 8, team_b_score: 8 }] });
assert.equal(validateRecoverySnapshot(badSnapshot).valid, false);
assert.equal(nextCheckpointSequence([{ sequence: 1 }, { sequence: 4 }, { sequence: 3 }]), 5);

// Host takeover is revision protected and auditable.
let takeover = prepareHostTakeover({ activeLease: { holder_user_id: 'u1', lease_revision: 3, status: 'active' }, newUserId: 'u2', expectedLeaseRevision: 3, reason: 'Primary host phone failed', now: '2026-09-07T12:20:00Z' });
assert.equal(takeover.ok, true);
assert.equal(takeover.supersedeCurrent.status, 'superseded');
assert.equal(takeover.newLease.lease_revision, 4);
assert.equal(takeover.newLease.holder_user_id, 'u2');
takeover = prepareHostTakeover({ activeLease: { holder_user_id: 'u1', lease_revision: 3, status: 'active' }, newUserId: 'u2', expectedLeaseRevision: 2, reason: 'stale device' });
assert.equal(takeover.conflict, true);

console.log('KOTC Gate 2.4 persistence/workflow layer: PASS');
console.log('Validated command idempotency, session/match revisions, partial score autosave, score corrections, proposal versioning, finalisation blockers, recovery snapshots, and host takeover.');
