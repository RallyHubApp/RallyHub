import { runKotcV2ProductionSimulation } from '../src/lib/kotcV2Simulator.js';

const playerCounts=Array.from({length:37},(_,i)=>i+4); // 4..40
const courtLimits=Array.from({length:10},(_,i)=>i+1); // 1..10
const sim=runKotcV2ProductionSimulation({rounds:9,playerCounts,courtLimits});
if(!sim.passed){
  console.error('KOTC scale simulation: FAIL');
  console.error(JSON.stringify(sim.failedChecks.slice(0,20),null,2));
  process.exit(1);
}
console.log(`KOTC scale simulation: PASS\n${sim.checkCount} invariant checks across ${sim.steadyScenarioCount} steady scenarios (4-40 players / 1-10 courts), plus workflow and court-transition safety.`);
