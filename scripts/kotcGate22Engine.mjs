import assert from 'node:assert/strict';
import {
  assertSportingMovement,
  buildSportingDestinationPairs,
  crossSplitResultPairs,
  generateNextRoundFixed,
  generateNextRoundRotating,
  generateRound1Fixed,
  generateRound1Rotating,
  orderParticipantsForRound1,
  recordRoundHistory,
  splitFourRotating,
} from '../src/lib/kotcV2Engine.js';

const ids = (n) => Array.from({ length: n }, (_, i) => `p${i + 1}`);

const seededA = orderParticipantsForRound1(ids(12).map((id, i) => ({ id, seed_rank: i + 1 })), { seedingMode: 'manual' });
assert.deepEqual(seededA, ids(12));
const seededRandom1 = orderParticipantsForRound1(ids(12).map((id) => ({ id })), { seedingMode: 'random_seeded', seed: 'abc' });
const seededRandom2 = orderParticipantsForRound1(ids(12).map((id) => ({ id })), { seedingMode: 'random_seeded', seed: 'abc' });
assert.deepEqual(seededRandom1, seededRandom2);

const split1 = splitFourRotating(['a', 'b', 'c', 'd'], {}, 'seed');
const split2 = splitFourRotating(['a', 'b', 'c', 'd'], {}, 'seed');
assert.deepEqual(split1, split2);
assert.equal(new Set([...split1.teamA, ...split1.teamB]).size, 4);

const cross1 = crossSplitResultPairs(['a', 'b'], ['c', 'd'], {}, 'seed');
const cross2 = crossSplitResultPairs(['a', 'b'], ['c', 'd'], {}, 'seed');
assert.deepEqual(cross1, cross2);
assert.equal(cross1.teamA.filter((id) => ['a', 'b'].includes(id)).length, 1);
assert.equal(cross1.teamA.filter((id) => ['c', 'd'].includes(id)).length, 1);

const round1 = generateRound1Rotating({ participantIds: ids(12), activeCourts: 3, benchIds: [], seed: 'session-1' });
assert.equal(round1.courts.length, 3);
assert.equal(round1.slots.length, 12);

const results = {
  1: { winnerSide: 'A' },
  2: { winnerSide: 'B' },
  3: { winnerSide: 'A' },
};
const destinations = buildSportingDestinationPairs({ courts: round1.courts, resultsByCourt: results });
assert.equal(destinations[1].pairOne.length, 2);
assert.equal(destinations[1].pairTwo.length, 2);
assert.equal(destinations[2].pairOne.length, 2);
assert.equal(destinations[2].pairTwo.length, 2);
assert.equal(destinations[3].pairOne.length, 2);
assert.equal(destinations[3].pairTwo.length, 2);

const round2 = generateNextRoundRotating({ currentRound: round1, resultsByCourt: results, history: {}, seed: 'session-1' });
assert.equal(round2.courts.length, 3);
assert.equal(round2.slots.length, 12);
assertSportingMovement({ currentRound: round1, nextRound: round2, resultsByCourt: results });

const round2Repeat = generateNextRoundRotating({ currentRound: round1, resultsByCourt: results, history: {}, seed: 'session-1' });
assert.deepEqual(round2Repeat, round2);

const history = recordRoundHistory({}, round1.courts);
for (const court of round1.courts) {
  const keyA = [...court.teamA].sort().join('|');
  const keyB = [...court.teamB].sort().join('|');
  assert.equal(history.partnerCounts[keyA], 1);
  assert.equal(history.partnerCounts[keyB], 1);
}

for (let courtCount = 1; courtCount <= 4; courtCount += 1) {
  const participants = ids(courtCount * 4);
  const r1 = generateRound1Rotating({ participantIds: participants, activeCourts: courtCount, benchIds: [], seed: `cc-${courtCount}` });
  for (let roundNo = 1; roundNo <= 12; roundNo += 1) {
    const resultMap = Object.fromEntries(r1.courts.map((court) => [court.courtRank, { winnerSide: court.courtRank % 2 ? 'A' : 'B' }]));
    const next = generateNextRoundRotating({ currentRound: { ...r1, roundNumber: roundNo }, resultsByCourt: resultMap, history: {}, seed: `cc-${courtCount}` });
    assertSportingMovement({ currentRound: { ...r1, roundNumber: roundNo }, nextRound: next, resultsByCourt: resultMap });
  }
}

const fixedParticipants = [
  { id: 'p1', fixed_pair_id: 'pair1' }, { id: 'p2', fixed_pair_id: 'pair1' },
  { id: 'p3', fixed_pair_id: 'pair2' }, { id: 'p4', fixed_pair_id: 'pair2' },
  { id: 'p5', fixed_pair_id: 'pair3' }, { id: 'p6', fixed_pair_id: 'pair3' },
  { id: 'p7', fixed_pair_id: 'pair4' }, { id: 'p8', fixed_pair_id: 'pair4' },
];
const fixedR1 = generateRound1Fixed({ participants: fixedParticipants, activeCourts: 2, benchPairIds: [], seed: 'fixed' });
const fixedResults = { 1: { winnerSide: 'A' }, 2: { winnerSide: 'B' } };
const fixedR2 = generateNextRoundFixed({ currentRound: fixedR1, resultsByCourt: fixedResults });
assert.equal(fixedR2.courts.length, 2);
assertSportingMovement({ currentRound: fixedR1, nextRound: fixedR2, resultsByCourt: fixedResults });

const fixedPairSets = fixedR2.courts.flatMap((c) => [c.teamA, c.teamB]).map((pair) => [...pair].sort().join('|'));
for (const pair of ['p1|p2', 'p3|p4', 'p5|p6', 'p7|p8']) assert.ok(fixedPairSets.includes(pair));

assert.throws(() => generateRound1Rotating({ participantIds: ids(11), activeCourts: 3, benchIds: [], seed: 'bad' }), /exactly 12 court players/);
assert.throws(() => generateRound1Fixed({ participants: fixedParticipants.slice(0, 7), activeCourts: 2 }), /exactly two participants/);

console.log('KOTC Gate 2.2 deterministic sporting engine: PASS');
console.log('Validated rotating doubles, fixed doubles, deterministic seeding/splits, movement invariants, and 1-4 court ladders.');
