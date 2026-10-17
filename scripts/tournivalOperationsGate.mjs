import assert from 'node:assert/strict';
import {createTournivalEvent,registerTournivalPlayer,confirmTournivalPayment,checkInTournivalPlayer,withdrawTournivalPlayer,tournivalPublicSnapshot,tournivalDuprEligibility,tournivalPrintData,assertRehearsalIsolation} from '../src/lib/tournivalOperations.js';
let cases=0;
for(const rehearsal of [false,true]) for(const capacity of [16,24,32]) {
 let e=createTournivalEvent({id:'test',tenantId:'tenant',clubId:'club',capacity,fee:5,rehearsal,duprEnabled:true});
 for(let i=0;i<capacity+2;i++){
  const op={playerId:'p'+i,name:'Player '+i,email:'p'+i+'@invalid.test',operationId:'op'+i};
  let r=registerTournivalPlayer(e,op);e=r.event;
  assert.equal(registerTournivalPlayer(e,op).duplicate,true);cases++;
 }
 assert.equal(e.registrations.filter(r=>r.status==='waitlisted').length,2);
 if(!rehearsal){
  const r=e.registrations[0];
  assert.throws(()=>confirmTournivalPayment(e,{registrationId:r.id,providerReference:'ref',verified:false,amount:5}));
  e=confirmTournivalPayment(e,{registrationId:r.id,providerReference:'ref',verified:true,amount:5}).event;
  assert.equal(confirmTournivalPayment(e,{registrationId:r.id,providerReference:'ref',verified:true,amount:5}).duplicate,true);
  e=checkInTournivalPlayer(e,{playerId:'p0'});
 }else{
  assert.throws(()=>confirmTournivalPayment(e,{registrationId:e.registrations[0].id,providerReference:'ref',verified:true,amount:5}));
  e=checkInTournivalPlayer(e,{playerId:'p0'});
  assertRehearsalIsolation(e);
 }
 e=withdrawTournivalPlayer(e,{playerId:'p0',reason:'injury'});
 assert.equal(e.registrations.filter(r=>r.status==='waitlisted').length,1);
 const snap=tournivalPublicSnapshot(e);
 assert.ok(!JSON.stringify(snap).includes('@invalid.test'),'private emails must not leak');
 assert.equal(tournivalPrintData(e).printVersion,e.revision);
 assert.equal(tournivalDuprEligibility(e,{status:'completed',result:{},teamA:['p0','p1'],teamB:['p2','p3'],matchFormat:'timed_10'}).eligible,false);
 cases+=5;
}
console.log('TOURNIVAL OPERATIONS PASS',cases,'registration, waitlist, payment verification, isolation, snapshot and DUPR checks');
