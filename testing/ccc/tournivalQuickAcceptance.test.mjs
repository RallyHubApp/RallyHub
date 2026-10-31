import test from 'node:test';
import assert from 'node:assert/strict';
import {runQuickAcceptance,quickTestReport,createQuickScenario,finishQuickQualification,finishQuickKnockout} from '../../src/lib/tournivalQuickTest.js';
for(const options of [{players:8,courts:2,rounds:3},{players:12,courts:3,rounds:4},{players:16,courts:4,rounds:4},{players:24,courts:6,rounds:3}]){
 test('synthetic Tournival qualification and knockout completes safely: '+JSON.stringify(options),()=>{
  const result=runQuickAcceptance(options),report=quickTestReport(result);
  assert.equal(report.allScored,true);assert.equal(report.isolated,true);
  assert.equal(report.checkedIn,options.players);assert.equal(report.registered,options.players);
  assert.equal(report.qualificationScored,report.qualificationExpected);
  assert.ok(report.knockoutScored>0);
  assert.equal(result.event.outbox.length,0);
 });
}
test('quick acceptance enforces the phase order',()=>{
 const initial=createQuickScenario({players:8,courts:2,rounds:3});
 assert.throws(()=>finishQuickKnockout(initial),/Finish qualification/);
 const qualified=finishQuickQualification(initial);
 assert.throws(()=>finishQuickQualification(qualified),/Start a qualification/);
});
test('quick acceptance rejects invalid court and player configurations',()=>{
 assert.throws(()=>createQuickScenario({players:8,courts:9,rounds:3}),/available number of courts/);
 assert.throws(()=>createQuickScenario({players:9,courts:2,rounds:3}),/groups of four/);
});
