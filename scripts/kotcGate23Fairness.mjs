import assert from 'node:assert/strict';
import {
  applyCompletedRoundFairnessMetrics,
  applySlotPreservingSubstitutions,
  buildDestinationByParticipant,
  explainFairnessSelection,
  planRoundBench,
  selectFairnessBench,
} from '../src/lib/kotcV2Fairness.js';

const ids = (n) => Array.from({ length: n }, (_, i) => `p${i + 1}`);
const makeParticipants = (n) => ids(n).map((id) => ({
  id,
  fairness_benches: 0,
  rounds_played: 0,
  consecutive_rounds_played: 0,
  consecutive_court1_rounds: 0,
  recent_fairness_burden: 0,
}));

// 15 players / 3 courts: exactly three fairness benches.
let participants15 = makeParticipants(15);
let plan = planRoundBench({ participants: participants15, venueCourtLimit: 3, seed: '15-cycle-r1' });
assert.equal(plan.activeCourts, 3);
assert.equal(plan.fairnessBenchIds.length, 3);
assert.equal(plan.allNonPlayingIds.length, 3);

// Five rounds should complete a full fairness cycle before any repeat for 15 players.
const satAcrossCycle = new Set();
for (let round = 1; round <= 5; round += 1) {
  plan = planRoundBench({ participants: participants15, venueCourtLimit: 3, seed: `15-cycle-r${round}` });
  for (const id of plan.fairnessBenchIds) {
    assert.equal(satAcrossCycle.has(id), false, `Repeated ${id} before 15-player fairness cycle completed`);
    satAcrossCycle.add(id);
  }
  const played = ids(15).filter((id) => !plan.fairnessBenchIds.includes(id));
  participants15 = applyCompletedRoundFairnessMetrics({ participants: participants15, playedParticipantIds: played, fairnessBenchIds: plan.fairnessBenchIds, court1ParticipantIds: played.slice(0, 4) });
}
assert.equal(satAcrossCycle.size, 15);
assert.ok(participants15.every((p) => p.fairness_benches === 1));

// 14 players / 3 courts: two fairness benches each round, full cycle in seven rounds.
let participants14 = makeParticipants(14);
const sat14 = new Set();
for (let round = 1; round <= 7; round += 1) {
  const roundPlan = planRoundBench({ participants: participants14, venueCourtLimit: 3, seed: `14-cycle-r${round}` });
  assert.equal(roundPlan.activeCourts, 3);
  assert.equal(roundPlan.fairnessBenchIds.length, 2);
  for (const id of roundPlan.fairnessBenchIds) {
    assert.equal(sat14.has(id), false, `Repeated ${id} before 14-player fairness cycle completed`);
    sat14.add(id);
  }
  const played = ids(14).filter((id) => !roundPlan.fairnessBenchIds.includes(id));
  participants14 = applyCompletedRoundFairnessMetrics({ participants: participants14, playedParticipantIds: played, fairnessBenchIds: roundPlan.fairnessBenchIds, court1ParticipantIds: played.slice(0, 4) });
}
assert.equal(sat14.size, 14);

// A just-returned player is protected when an otherwise equivalent alternative exists.
const protectedSelection = selectFairnessBench({
  participants: [
    { id: 'returned', fairness_benches: 0, rounds_played: 4, consecutive_rounds_played: 4, just_returned_from_fairness_bench: true },
    { id: 'other', fairness_benches: 0, rounds_played: 4, consecutive_rounds_played: 4 },
  ],
  requiredFairnessBenchCount: 1,
  seed: 'protect-return',
});
assert.deepEqual(protectedSelection.fairnessBenchIds, ['other']);

// Nobody with one fairness bench can sit again while a zero-bench alternative exists.
const noSecondBeforeCycle = selectFairnessBench({
  participants: [
    { id: 'already-sat', fairness_benches: 1, rounds_played: 8, consecutive_rounds_played: 8, consecutive_court1_rounds: 4 },
    { id: 'not-sat', fairness_benches: 0, rounds_played: 1, consecutive_rounds_played: 1 },
  ],
  requiredFairnessBenchCount: 1,
  seed: 'cycle-protection',
});
assert.deepEqual(noSecondBeforeCycle.fairnessBenchIds, ['not-sat']);

// Winners / Court 1 players are eligible to rest; Court 1 tenure can make them the fair choice.
const court1Selection = selectFairnessBench({
  participants: [
    { id: 'court1-winner', fairness_benches: 0, rounds_played: 5, consecutive_rounds_played: 5, consecutive_court1_rounds: 2 },
    { id: 'lower-court-loser', fairness_benches: 0, rounds_played: 3, consecutive_rounds_played: 3, consecutive_court1_rounds: 0 },
  ],
  requiredFairnessBenchCount: 1,
  destinationByParticipant: { 'court1-winner': 1, 'lower-court-loser': 3 },
  seed: 'winner-can-rest',
});
assert.deepEqual(court1Selection.fairnessBenchIds, ['court1-winner']);
assert.match(explainFairnessSelection('court1-winner', court1Selection.ranking), /Court 1/);

// Historical burden protects a player when current-session metrics are otherwise equal.
const historySelection = selectFairnessBench({
  participants: [
    { id: 'high-history-burden', fairness_benches: 0, rounds_played: 4, consecutive_rounds_played: 4, recent_fairness_burden: 3 },
    { id: 'low-history-burden', fairness_benches: 0, rounds_played: 4, consecutive_rounds_played: 4, recent_fairness_burden: 0 },
  ],
  requiredFairnessBenchCount: 1,
  seed: 'history-protection',
});
assert.deepEqual(historySelection.fairnessBenchIds, ['low-history-burden']);

// Voluntary rest occupies a non-playing place but does not earn fairness credit.
const voluntaryParticipants = makeParticipants(15);
const voluntaryPlan = planRoundBench({
  participants: voluntaryParticipants,
  venueCourtLimit: 3,
  voluntaryRestIds: ['p15'],
  seed: 'voluntary-15',
});
assert.equal(voluntaryPlan.activeCourts, 3);
assert.equal(voluntaryPlan.voluntaryRestIds.length, 1);
assert.equal(voluntaryPlan.fairnessBenchIds.length, 2);
assert.equal(voluntaryPlan.allNonPlayingIds.length, 3);
assert.equal(voluntaryPlan.fairnessBenchIds.includes('p15'), false);
const voluntaryUpdated = applyCompletedRoundFairnessMetrics({
  participants: voluntaryParticipants,
  playedParticipantIds: ids(15).filter((id) => !voluntaryPlan.allNonPlayingIds.includes(id)),
  fairnessBenchIds: voluntaryPlan.fairnessBenchIds,
});
assert.equal(voluntaryUpdated.find((p) => p.id === 'p15').fairness_benches, 0);

// 16 present with one voluntary rest means only 15 playable: 3 courts, 1 voluntary + 3 fairness benches.
const voluntary16 = planRoundBench({ participants: makeParticipants(16), venueCourtLimit: 4, voluntaryRestIds: ['p16'], seed: 'voluntary-16' });
assert.equal(voluntary16.activeCourts, 3);
assert.equal(voluntary16.fairnessBenchIds.length, 3);
assert.equal(voluntary16.allNonPlayingIds.length, 4);

// Slot-preserving substitution changes only the exact vacated slots and never cascades other players.
const sportingSlots = [
  { participant_id: 'p1', ladder_court_rank: 1, team_side: 'A', slot_number: 1 },
  { participant_id: 'p2', ladder_court_rank: 1, team_side: 'A', slot_number: 2 },
  { participant_id: 'p3', ladder_court_rank: 1, team_side: 'B', slot_number: 1 },
  { participant_id: 'p4', ladder_court_rank: 1, team_side: 'B', slot_number: 2 },
  { participant_id: 'p5', ladder_court_rank: 2, team_side: 'A', slot_number: 1 },
  { participant_id: 'p6', ladder_court_rank: 2, team_side: 'A', slot_number: 2 },
  { participant_id: 'p7', ladder_court_rank: 2, team_side: 'B', slot_number: 1 },
  { participant_id: 'p8', ladder_court_rank: 2, team_side: 'B', slot_number: 2 },
];
const substitution = applySlotPreservingSubstitutions({
  sportingSlots,
  outgoing: { p1: 'voluntary_rest' },
  replacementParticipantIds: ['p9'],
  seed: 'slot-preserve',
});
assert.equal(substitution.substitutions[0].preservedCourtRank, 1);
assert.equal(substitution.slots.find((s) => s.participant_id === 'p9').ladder_court_rank, 1);
for (const id of ['p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']) {
  const before = sportingSlots.find((s) => s.participant_id === id);
  const after = substitution.slots.find((s) => s.participant_id === id);
  assert.deepEqual(after, before, `${id} moved during a one-player substitution cascade`);
}

// Multiple substitutions preserve each vacancy's court and slot identity.
const multiSub = applySlotPreservingSubstitutions({
  sportingSlots,
  outgoing: { p1: 'fairness_bench', p6: 'injury' },
  replacementParticipantIds: ['p9', 'p10'],
  seed: 'multi-slot',
});
assert.equal(multiSub.substitutions.length, 2);
assert.deepEqual(multiSub.substitutions.map((s) => s.preservedCourtRank).sort(), [1, 2]);

// Destination map is independent from win/loss labels and can include Court 1 winners in fairness pool.
const destinationMap = buildDestinationByParticipant([
  { participantId: 'winner', earnedCourtRank: 1, result: 'win' },
  { participantId: 'loser', earnedCourtRank: 2, result: 'loss' },
]);
assert.deepEqual(destinationMap, { winner: 1, loser: 2 });

// Full player/court matrix: fairness plan must always produce valid complete-doubles arithmetic.
let matrixScenarios = 0;
for (let playerCount = 4; playerCount <= 18; playerCount += 1) {
  for (let venueCourts = 1; venueCourts <= 4; venueCourts += 1) {
    const matrixParticipants = makeParticipants(playerCount);
    const matrixPlan = planRoundBench({
      participants: matrixParticipants,
      venueCourtLimit: venueCourts,
      seed: `matrix-${playerCount}-${venueCourts}`,
    });
    assert.equal(matrixPlan.courtPlaces, matrixPlan.activeCourts * 4);
    assert.equal(matrixPlan.courtPlaces + matrixPlan.fairnessBenchIds.length, playerCount);
    assert.equal(new Set(matrixPlan.fairnessBenchIds).size, matrixPlan.fairnessBenchIds.length);
    assert.ok(matrixPlan.activeCourts <= venueCourts);
    assert.ok(matrixPlan.courtPlaces <= playerCount);
    matrixScenarios += 1;
  }
}
assert.equal(matrixScenarios, 60);

console.log('KOTC Gate 2.3 fairness & bench engine: PASS');
console.log(`Validated fairness cycles, no avoidable repeat benches, return protection, Court 1/winner eligibility, recent-history protection, voluntary rest, slot-preserving substitutions, and ${matrixScenarios} player/court matrix scenarios.`);
