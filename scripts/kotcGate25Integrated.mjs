import assert from 'node:assert/strict';
import { runKotcV2ProductionSimulation, simulateSteadyKotcSession } from '../src/lib/kotcV2Simulator.js';

const full = runKotcV2ProductionSimulation({ rounds: 9 });
assert.equal(full.steadyScenarioCount, 60);
assert.equal(full.scenarioCount, 62);
assert.equal(full.passed, true, JSON.stringify(full.failedChecks.slice(0, 20), null, 2));
assert.equal(full.failureCount, 0);

// Run longer stress cases at the awkward bench counts where fairness cycles are most visible.
for (const [players, courts, rounds] of [
  [7, 4, 12],
  [11, 4, 12],
  [15, 4, 12],
  [14, 3, 14],
  [18, 4, 12],
]) {
  const run = simulateSteadyKotcSession({ playerCount: players, venueCourtLimit: courts, rounds });
  assert.equal(run.passed, true, `${run.scenario}: ${JSON.stringify(run.checks.filter((c) => !c.passed), null, 2)}`);
}

console.log('KOTC Gate 2.5 integrated production simulator: PASS');
console.log(`Production V2 modules used directly. ${full.steadyScenarioCount} player/court scenarios x 9 rounds + workflow and transition safety scenarios.`);
console.log(`${full.checkCount} integrated invariant checks, ${full.failureCount} failures.`);
