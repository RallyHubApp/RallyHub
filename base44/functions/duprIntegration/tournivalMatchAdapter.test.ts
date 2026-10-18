import {strict as assert} from 'node:assert';
const assertEquals=(a:any,b:any)=>assert.deepEqual(a,b);
import {prepareTournivalDuprBatch} from './tournivalMatchAdapter.ts';
const ids=['a','b','c','d'];
const players=Object.fromEntries(ids.map(id=>[id,{duprId:'UAT-'+id}]));
const fixture={roundNumber:1,courts:[{courtNumber:1,teamA:['a','b'],teamB:['c','d']}]};
const final={id:'F1',stage:'Final',result:{scoreA:11,scoreB:9},
 pair1:{player1:{id:'a'},player2:{id:'b'}},
 pair2:{player1:{id:'c'},player2:{id:'d'}}};
const state={status:'Completed',duprEnabled:true,rehearsal:false,matchFormat:'first_11_by1',
 rounds:[fixture],results:{1:{1:{scoreA:11,scoreB:9}}},knockoutState:{bracket:[final]}};
const prepare=(override:any={},consents:any=ids)=>prepareTournivalDuprBatch({
 state:{...state,...override},tournamentId:'e1',eventName:'Test Tournival',
 matchDate:'2026-10-17',location:'Ennis',players,consents});
Deno.test('confirmed eligible results map to official DUPR API schema',()=>{
 const out=prepare();assertEquals(out.matches.length,2);assertEquals(out.excluded.length,0);
 for(const m of out.matches){
  assertEquals(m.format,'DOUBLES');assertEquals(m.matchSource,'PARTNER');
  assertEquals(m.matchCompletionType,'COMPLETED');assertEquals(m.teamA.game1,11);
  assert(m.identifier.startsWith('RH-TRN-e1'));
 }
});
Deno.test('rehearsals, opt-out and incomplete finals cannot be submitted',()=>{
 for(const override of [{rehearsal:true},{duprEnabled:false},{status:'In Progress'},{knockoutState:{bracket:[]}}]){
  assertEquals(prepare(override).matches.length,0);
 }
});
Deno.test('impossible calendar dates are excluded',()=>{
 const out=prepareTournivalDuprBatch({
  state,tournamentId:'e1',eventName:'Test Tournival',matchDate:'2026-02-30',
  location:'Ennis',players,consents:ids
 });
 assertEquals(out.matches.length,0);
 assertEquals(out.excluded[0].reason,'event_metadata_missing');
});
Deno.test('distinct players cannot share a DUPR identity in one match',()=>{
 const duplicatePlayers={...players,b:{duprId:players.a.duprId}};
 const out=prepareTournivalDuprBatch({
  state,tournamentId:'e1',eventName:'Test Tournival',matchDate:'2026-10-17',
  location:'Ennis',players:duplicatePlayers,consents:ids
 });
 assertEquals(out.matches.length,0);
 assert(out.excluded.every(x=>x.reason==='duplicate_dupr_identity'));
});
Deno.test('unconsented, timed and invalid scores are excluded',()=>{
 assertEquals(prepare({},['a','b','c']).matches.length,0);
 assertEquals(prepare({matchFormat:'timed_10'}).matches.length,0);
 assertEquals(prepare({results:{1:{1:{scoreA:6,scoreB:6}}}}).matches.length,1);
});
