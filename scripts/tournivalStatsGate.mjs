import assert from 'node:assert/strict';
import {calculateTournivalStats,completedTournivalMatchRecords} from '../src/lib/tournivalStatistics.js';
const ids=['a','b','c','d'];
const state={
 playerIds:ids,rounds:[{roundNumber:1,courts:[{courtNumber:1,teamA:['a','b'],teamB:['c','d']}]}],
 results:{1:{1:{scoreA:11,scoreB:7}}},
 knockoutState:{bracket:[{id:'f',stage:'Final',pair1:{player1:{id:'a'},player2:{id:'b'}},
 pair2:{player1:{id:'c'},player2:{id:'d'}},result:{scoreA:11,scoreB:9}}]}
};
const matches=completedTournivalMatchRecords(state);
assert.equal(matches.length,2);
let result=calculateTournivalStats({playerIds:ids,matches});
assert.equal(result.players.find(x=>x.playerId==='a').wins,2);
assert.equal(result.players.find(x=>x.playerId==='a').pointsFor,22);
assert.equal(result.players.find(x=>x.playerId==='c').losses,2);
const dedup=calculateTournivalStats({playerIds:ids,matches:[...matches,...matches]});
assert.deepEqual(dedup,result);
assert.equal(calculateTournivalStats({playerIds:ids,matches,rehearsal:true}).excluded,true);
result=calculateTournivalStats({playerIds:ids,matches,podium:{first:['a','b'],second:['c','d']}});
assert.equal(result.players.find(x=>x.playerId==='a').podium,'first');
assert.equal(result.players.find(x=>x.playerId==='a').partners.b,2);
console.log('TOURNIVAL STATISTICS GATE PASS: qualification, knockout, deduplication, rehearsal isolation and podium');
