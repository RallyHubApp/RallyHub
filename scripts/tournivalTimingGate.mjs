import assert from 'node:assert/strict';
import {forecastTournivalProgress} from '../src/lib/tournivalTiming.js';
const now=Date.UTC(2026,9,17,11,0,0);
for(const courts of [1,2,4,8])for(const playing of [0,1,2,4]){
 const active=Array.from({length:Math.min(courts,playing)},(_,i)=>({id:'playing'+i,status:'playing'}));
 const waiting=Array.from({length:16},(_,i)=>({id:'waiting'+i,status:'waiting'}));
 const result=forecastTournivalProgress({matches:[...active,...waiting],courts,
   minutesPerMatch:8,changeoverMinutes:2,now,venueEndAt:new Date(now+45*60000).toISOString()});
 assert.equal(result.remaining,active.length+waiting.length);
 assert.ok(result.estimatedRemainingMinutes>=0);
 assert.equal(result.courtUtilisationPercent,Math.round(active.length/courts*100));
 assert.ok(result.projectedEndAt);
 if(result.projectedOverrunMinutes>0)assert.ok(result.recoveries.length>0);
}
assert.equal(forecastTournivalProgress({matches:[],courts:4,now}).remaining,0);
assert.throws(()=>forecastTournivalProgress({matches:[],courts:0}));
console.log('TOURNIVAL TIMING GATE PASS: 18 projections, overrun, utilization and input rejection');
