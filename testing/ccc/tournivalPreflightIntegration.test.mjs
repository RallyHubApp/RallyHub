import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTournivalEvent,registerTournivalPlayer,checkInTournivalPlayer,
  startTournival,applyTournivalMatchChange
} from '../../src/lib/tournivalOperations.js';

function eventWithPlayers() {
  let event=createTournivalEvent({id:'event1',tenantId:'tenant1',clubId:'club1',rehearsal:true});
  for (const playerId of ['a','b','c','d','e','f','g','h']) {
    event=registerTournivalPlayer(event,{playerId,name:playerId,operationId:'register-'+playerId}).event;
    event=checkInTournivalPlayer(event,{playerId});
  }
  return event;
}
const fixture=(id,players,status='waiting',court=null)=>({
  id,teamA:players.slice(0,2),teamB:players.slice(2),status,court,revision:0,result:null
});
const snapshot=event=>JSON.stringify(event);

test('Tournival starts with valid checked-in fixtures',()=>{
  const event=eventWithPlayers();
  const started=startTournival(event,{matches:[fixture('m1',['a','b','c','d'])]});
  assert.equal(started.phase,'qualification');
  assert.equal(started.matches.length,1);
});
test('Tournival start rejects duplicate player in a fixture without mutating event',()=>{
  const event=eventWithPlayers(),before=snapshot(event);
  assert.throws(()=>startTournival(event,{matches:[fixture('m1',['a','a','c','d'])]}),/duplicate_player_in_match/);
  assert.equal(snapshot(event),before);
});
test('Tournival start rejects unchecked players without mutating event',()=>{
  let event=eventWithPlayers();
  event=checkInTournivalPlayer(event,{playerId:'d',present:false});
  assert.throws(()=>startTournival(event,{matches:[fixture('m1',['a','b','c','d'])]}),/unchecked_player/);
});
test('Tournival start rejects duplicate fixture IDs',()=>{
  const event=eventWithPlayers();
  assert.throws(()=>startTournival(event,{matches:[
    fixture('same',['a','b','c','d']),fixture('same',['e','f','g','h'])
  ]}),/duplicate_match_id/);
});
test('Tournival court updates reject overlapping active players and courts',()=>{
  const started=startTournival(eventWithPlayers(),{matches:[
    fixture('m1',['a','b','c','d']),fixture('m2',['e','f','g','h'])
  ]});
  const before=snapshot(started);
  const playing=[
    fixture('m1',['a','b','c','d'],'playing',1),
    fixture('m2',['e','f','g','h'],'playing',1)
  ];
  assert.throws(()=>applyTournivalMatchChange(started,{matches:playing}),/active_court_collision/);
  assert.equal(snapshot(started),before);
});
test('Tournival court updates preserve completed result protection',()=>{
  const started=startTournival(eventWithPlayers(),{matches:[fixture('m1',['a','b','c','d'])]});
  const changed=applyTournivalMatchChange(started,{matches:[fixture('m1',['a','b','c','d'],'playing',1)]});
  assert.equal(changed.matches[0].court,1);
});
