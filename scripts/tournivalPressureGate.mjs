import assert from 'node:assert/strict';
import {generateGroupFixtures,validateTournivalScore} from '../src/lib/tournivalEngine.js';
import {indexTournivalMatches,scheduleTournivalCourts,recordTournivalResult,verifyCourtIntegrity} from '../src/lib/tournivalScheduler.js';
let submitted=0,duplicates=0,stales=0;
for(const count of [16,24,32])for(const courts of [2,4,6,8])for(const format of ['first_11_by1','timed_10']){
 const ids=Array.from({length:count},(_,i)=>'p'+i);
 let matches=indexTournivalMatches(generateGroupFixtures(ids,courts,6));
 let loops=0;
 const start=performance.now();
 while(matches.some(m=>m.status!=='completed')){
  const next=scheduleTournivalCourts(matches,{courts});matches=next.matches;
  assert.ok(++loops<500,'scheduler deadlock');
  verifyCourtIntegrity(matches,courts);
  const active=matches.filter(m=>m.status==='playing');
  assert.ok(active.length>0,'active fixtures must exist');
  // Multiple simulated devices read the same immutable snapshot/version.
  const first=active[0],payload={
   matchId:first.id,expectedRevision:first.revision,idempotencyKey:'device:'+first.id,
   scoreA:format==='timed_10'?8:11,scoreB:5,matchFormat:format};
  const committed=recordTournivalResult(matches,payload,validateTournivalScore);
  const repeat=recordTournivalResult(committed.matches,payload,validateTournivalScore);
  assert.equal(repeat.duplicate,true);
  duplicates++;
  assert.throws(()=>recordTournivalResult(committed.matches,{
   ...payload,idempotencyKey:'other-device:'+first.id
  },validateTournivalScore));
  stales++;
  matches=committed.matches;
  submitted++;
 }
 assert.equal(submitted>0,true);
 assert.ok(performance.now()-start<3000,'pure simulation exceeds local CPU budget');
}
console.log(`TOURNIVAL PRESSURE PASS: 24 six-round simulations; ${submitted} match commits, ${duplicates} duplicate retries, ${stales} conflicting writes rejected at pure model boundary.`);
