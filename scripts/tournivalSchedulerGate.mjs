import assert from 'node:assert/strict';
import {generateGroupFixtures,validateTournivalScore} from '../src/lib/tournivalEngine.js';
import {indexTournivalMatches,scheduleTournivalCourts,verifyCourtIntegrity,recordTournivalResult} from '../src/lib/tournivalScheduler.js';
for(const count of [16,24,32])for(const courts of [2,4,6]) {
 const rounds=generateGroupFixtures(Array.from({length:count},(_,i)=>'p'+i),courts,3);
 let matches=indexTournivalMatches(rounds);
 let n=0;
 while(matches.some(m=>m.status==='waiting'||m.status==='playing')) {
  const scheduled=scheduleTournivalCourts(matches,{courts});
  matches=scheduled.matches;
  assert.ok(scheduled.assignments.length||matches.some(m=>m.status==='playing'),'deadlock');
  verifyCourtIntegrity(matches,courts);
  for(const m of matches.filter(m=>m.status==='playing')) {
    const result=recordTournivalResult(matches,{matchId:m.id,expectedRevision:m.revision,
      idempotencyKey:`test-${m.id}`,scoreA:11,scoreB:7},validateTournivalScore);
    const retry=recordTournivalResult(result.matches,{matchId:m.id,expectedRevision:m.revision,
      idempotencyKey:`test-${m.id}`,scoreA:11,scoreB:7},validateTournivalScore);
    assert.equal(retry.duplicate,true);
    assert.throws(()=>recordTournivalResult(result.matches,{matchId:m.id,expectedRevision:m.revision,
      idempotencyKey:`different-${m.id}`,scoreA:11,scoreB:7},validateTournivalScore));
    matches=result.matches;n++;
  }
  assert.ok(n<1000);
 }
 assert.equal(n,matches.length);
 assert.equal(matches.filter(m=>m.status==='completed').length,matches.length);
}
{
 const matches=indexTournivalMatches(generateGroupFixtures(Array.from({length:16},(_,i)=>'p'+i),4,2));
 const first=scheduleTournivalCourts(matches,{courts:4,unavailable:matches[0].teamA});
 assert.ok(!first.assignments.some(a=>a.matchId===matches[0].id));
 assert.ok(first.assignments.length>0,'later eligible work fills court');
 const paused=scheduleTournivalCourts(matches,{courts:4,paused:true});
 assert.equal(paused.assignments.length,0);
}
console.log('TOURNIVAL SCHEDULER PASS: 9 full queue completions, idempotency, stale revisions, overlap, blocked fixtures, pause.');
