import test from 'node:test';import assert from 'node:assert/strict';import {claimPaidEventConfirmation as claim} from '../../base44/functions/eventRegistration/confirmationLock.mjs';
const registration={id:'r',tenant_id:'t',club_id:'c',event_id:'e',registration_status:'approved_payment_hold'};
const args={registration,tenantId:'t',clubId:'c',eventId:'e',paymentId:'p',transactionId:'tx'};
test('concurrent webhook and admin verification claim confirmation only once',async()=>{
 let state={...registration};const entity={updateMany:async(filter,change)=>{await Promise.resolve();if(Object.entries(filter).some(([k,v])=>state[k]!==v))return {updated:0};state={...state,...change.$set};return {updated:1}}};
 const results=await Promise.all(Array.from({length:20},()=>claim(entity,args)));
 assert.equal(results.filter(Boolean).length,1);assert.equal(state.payment_status,'paid');assert.equal(state.registration_status,'confirmed');
});
test('wrong tenant and event cannot claim',async()=>{const entity={updateMany:async()=>{throw Error('should not call')}};assert.equal(await claim(entity,{...args,tenantId:'other'}),false);assert.equal(await claim(entity,{...args,eventId:'other'}),false)});
