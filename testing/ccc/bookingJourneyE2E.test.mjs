import test from 'node:test';import assert from 'node:assert/strict';
import {createBookingJourney} from '../../src/lib/ccc/bookingJourneyHarness.mjs';
test('complete synthetic journey: request, approve, checkout, verified payment, queued/delivered notification',()=>{
 const j=createBookingJourney({now:Date.now()});assert.equal(j.request({id:'r1',operationId:'op1',emailKey:'member@example.ie'}).decision,'request');
 assert.equal(j.request({id:'r1b',operationId:'op1',emailKey:'member@example.ie'}).decision,'idempotent');
 assert.equal(j.act('r1','approve').next.registration_status,'approved_payment_hold');
 assert.equal(j.checkout('r1','tx1').allowed,true);
 const e={id:'wh1',provider:'sumup',transactionId:'tx1',status:'paid',verified:true,amount:5.5,currency:'EUR'};
 assert.equal(j.webhook('r1',e).registrationStatus,'confirmed');assert.equal(j.webhook('r1',e).idempotent,true);
 assert.equal(j.queueMessage('r1','confirmation').allowed,true);assert.equal(j.queueMessage('r1','confirmation').idempotent,true);
 const id=j.state.outbox[0].id;for(const status of ['provider_accepted','sent','delivered'])assert.equal(j.advanceMessage(id,status).allowed,true);
 assert.equal(j.state.outbox[0].status,'delivered');assert.equal(j.state.registrations[0].registration_status,'confirmed');assert.equal(j.state.payments[0].payment_status,'paid');
});
test('full synthetic journey: capacity, waitlist, cancellation, promotion and hold expiration',()=>{
 const now=Date.now(),j=createBookingJourney({capacity:1,now});j.request({id:'r1',operationId:'o1',emailKey:'one@example.ie'});j.act('r1','approve');
 j.request({id:'r2',operationId:'o2',emailKey:'two@example.ie'});assert.equal(j.act('r2','promote').allowed,false);
 assert.equal(j.act('r1','expire',now+16*60000).allowed,true);
 assert.equal(j.act('r2','promote').next.registration_status,'approved_payment_hold');
 j.request({id:'r3',operationId:'o3',emailKey:'three@example.ie'});assert.equal(j.act('r3','promote').allowed,false);
 assert.equal(j.act('r2','cancel').allowed,true);assert.equal(j.act('r3','promote').allowed,true);
});
test('forged webhook cannot confirm, notification cannot queue before approval',()=>{
 const j=createBookingJourney();j.request({id:'r1',operationId:'op',emailKey:'a@example.ie'});assert.equal(j.queueMessage('r1','confirmation').allowed,false);
 j.act('r1','approve');j.checkout('r1','tx1');const e={id:'fake',provider:'sumup',transactionId:'tx1',status:'paid',verified:false,amount:5.5,currency:'EUR'};
 assert.equal(j.webhook('r1',e).allowed,false);assert.equal(j.state.registrations[0].registration_status,'approved_payment_hold');
});
