import {strict as assert} from 'node:assert';
import {startTournivalKnockout,scoreTournivalKnockout} from './knockoutDomain.ts';
const ids=Array.from({length:16},(_,i)=>'p'+i);
const rounds=[{roundNumber:1,courts:Array.from({length:4},(_,i)=>({
 courtNumber:i+1,teamA:[ids[4*i],ids[4*i+1]],teamB:[ids[4*i+2],ids[4*i+3]]
}))}];
const matches=rounds[0].courts.map((c,i)=>({
 id:'Q:1:'+i,teamA:c.teamA,teamB:c.teamB,status:'completed',result:{scoreA:11,scoreB:6,winner:'A'}
}));
const state={playerIds:ids,rounds,matches,knockoutPairs:4,matchFormat:'first_11_by1'};
Deno.test('server creates legal knockout without client-supplied pairings',()=>{
 const out=startTournivalKnockout(state);
 assert.equal(out.knockoutState.bracket.length,2);
 assert.equal(out.knockoutState.currentStage,'SF');
 assert.throws(()=>startTournivalKnockout(out));
});
Deno.test('server advances semis to final and 3rd; final awaits review',()=>{
 let s=startTournivalKnockout(state);
 for(const m of [...s.knockoutState.bracket]){
  s=scoreTournivalKnockout(s,{matchId:m.id,scoreA:11,scoreB:7}).state;
 }
 assert.equal(s.knockoutState.currentStage,'Final');
 assert.equal(s.knockoutState.bracket.length,4);
 s=scoreTournivalKnockout(s,{matchId:'Final_0',scoreA:11,scoreB:7}).state;
 assert.equal(s.status,'Knockout In Progress');
 s=scoreTournivalKnockout(s,{matchId:'3rd_0',scoreA:11,scoreB:7}).state;
 assert.equal(s.status,'Pending Final Review');
});
Deno.test('invalid scores and downstream-changing corrections blocked',()=>{
 let s=startTournivalKnockout(state);
 assert.throws(()=>scoreTournivalKnockout(s,{matchId:'SF_0',scoreA:10,scoreB:10}));
 assert.throws(()=>scoreTournivalKnockout(s,{matchId:'fake',scoreA:11,scoreB:5}));
 s=scoreTournivalKnockout(s,{matchId:'SF_0',scoreA:11,scoreB:5}).state;
 assert.throws(()=>scoreTournivalKnockout(s,{matchId:'SF_0',scoreA:11,scoreB:9}));
});
