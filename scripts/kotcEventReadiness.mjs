import assert from 'node:assert/strict';
import { runKotcV2ProductionSimulation } from '../src/lib/kotcV2Simulator.js';
import { buildSportingMovements } from '../src/lib/kotcV2Engine.js';

const result = runKotcV2ProductionSimulation({ rounds: 12 });
assert.equal(result.passed, true, `${result.failureCount} KOTC simulator checks failed`);

// Named regression: sporting movement is sacred after Round 1.
const courts = [
  { courtRank:1, teamA:['p1','p2'], teamB:['p3','p4'] },
  { courtRank:2, teamA:['p5','p6'], teamB:['p7','p8'] },
  { courtRank:3, teamA:['p9','p10'], teamB:['p11','p12'] },
  { courtRank:4, teamA:['p13','p14'], teamB:['p15','p16'] },
];
const results = {1:{winnerSide:'A'},2:{winnerSide:'A'},3:{winnerSide:'A'},4:{winnerSide:'A'}};
const moves = buildSportingMovements({ courts, resultsByCourt:results });
const byId = Object.fromEntries(moves.map(m => [m.participantId, m]));
for (const id of ['p1','p2']) assert.equal(byId[id].destinationCourtRank,1,'Court 1 winner must stay on Court 1');
for (const id of ['p3','p4']) assert.equal(byId[id].destinationCourtRank,2,'Court 1 loser must move toward bottom court');
for (const id of ['p5','p6']) assert.equal(byId[id].destinationCourtRank,1,'Court 2 winner must move toward Court 1');
for (const id of ['p7','p8']) assert.equal(byId[id].destinationCourtRank,3,'Court 2 loser must move toward bottom court');
for (const id of ['p9','p10']) assert.equal(byId[id].destinationCourtRank,2,'Court 3 winner must move toward Court 1');
for (const id of ['p11','p12']) assert.equal(byId[id].destinationCourtRank,4,'Court 3 loser must move toward bottom court');
for (const id of ['p13','p14']) assert.equal(byId[id].destinationCourtRank,3,'Court 4 winner must move toward Court 1');
for (const id of ['p15','p16']) assert.equal(byId[id].destinationCourtRank,4,'Bottom-court loser must stay on bottom court');

console.log('RALLYHUB KOTC — EVENT READINESS ENGINE GATE PASS');
console.log(`Scenarios: ${result.scenarioCount}`);
console.log(`Checks: ${result.checkCount + 16}`);
console.log('Failures: 0');
console.log('Named regression: winner/loser court movement PASS');
console.log('Availability/court transitions, fairness, recovery, stale commands, duplicate commands and score workflow PASS');
