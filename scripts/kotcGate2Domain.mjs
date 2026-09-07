import assert from 'node:assert/strict';
import {
  activeCourtCount,
  benchCount,
  canTransitionRound,
  canTransitionSession,
  podiumGroupForRank,
  validateRoundLayout,
} from '../src/lib/kotcV2Domain.js';

for (let players = 4; players <= 18; players += 1) {
  for (let courts = 1; courts <= 4; courts += 1) {
    const active = activeCourtCount(players, courts);
    const bench = benchCount(players, courts);
    assert.equal(active, Math.min(courts, Math.floor(players / 4)));
    assert.equal(active * 4 + bench, players);
    assert.ok(bench >= 0);
  }
}

assert.equal(activeCourtCount(15, 4), 3);
assert.equal(benchCount(15, 4), 3);
assert.equal(activeCourtCount(11, 4), 2);
assert.equal(benchCount(11, 4), 3);
assert.equal(activeCourtCount(7, 4), 1);
assert.equal(benchCount(7, 4), 3);

assert.equal(canTransitionSession('draft', 'ready'), true);
assert.equal(canTransitionSession('draft', 'finalised'), false);
assert.equal(canTransitionSession('finalised', 'in_progress'), false);
assert.equal(canTransitionRound('proposed', 'confirmed'), true);
assert.equal(canTransitionRound('started', 'superseded'), false);

assert.equal(podiumGroupForRank(1, 'rotating_doubles'), 'gold');
assert.equal(podiumGroupForRank(2, 'rotating_doubles'), 'gold');
assert.equal(podiumGroupForRank(3, 'rotating_doubles'), 'silver');
assert.equal(podiumGroupForRank(6, 'rotating_doubles'), 'bronze');
assert.equal(podiumGroupForRank(1, 'singles'), 'gold');
assert.equal(podiumGroupForRank(2, 'singles'), 'silver');
assert.equal(podiumGroupForRank(3, 'singles'), 'bronze');
assert.equal(podiumGroupForRank(4, 'singles'), 'none');

const slots = Array.from({ length: 8 }, (_, index) => ({
  participant_id: `p${index + 1}`,
  ladder_court_rank: index < 4 ? 1 : 2,
}));
const valid = validateRoundLayout({
  slots,
  eligibleParticipantIds: Array.from({ length: 10 }, (_, index) => `p${index + 1}`),
  activeCourts: 2,
});
assert.equal(valid.valid, true, valid.errors.join('; '));

const duplicate = validateRoundLayout({
  slots: [...slots.slice(0, 7), { participant_id: 'p1', ladder_court_rank: 2 }],
  eligibleParticipantIds: Array.from({ length: 10 }, (_, index) => `p${index + 1}`),
  activeCourts: 2,
});
assert.equal(duplicate.valid, false);

console.log('KOTC Gate 2 domain foundation: PASS');
console.log('Validated player/court allocation matrix: players 4-18 x venue courts 1-4');
