import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingCapacitySnapshot,registrationDecision,isPaymentConfirmationEligible} from '../../src/lib/ccc/bookingPolicy.js';
const r=(id,status,extra={})=>({id,registration_status:status,...extra});
test('active payment holds consume capacity, cancelled and waitlisted do not',()=>{
 const snap=bookingCapacitySnapshot([r('a','confirmed'),r('b','approved_payment_hold'),r('c','cancelled'),r('d','waitlisted')],3);
 assert.deepEqual(snap,{capacity:3,occupied:2,remaining:1,full:false});
});
test('full capacity moves new request to waitlist',()=>{
 assert.equal(registrationDecision({registrations:[r('a','confirmed')],capacity:1,operationId:'op2',emailKey:'new'}).decision,'waitlist');
});
test('operation idempotency and duplicate person protection precede capacity',()=>{
 const rows=[r('a','confirmed',{operation_id:'op1',person_id:'p1',email_key:'a@example.com'})];
 assert.deepEqual(registrationDecision({registrations:rows,capacity:1,operationId:'op1',personId:'p1'}),{decision:'idempotent',registrationId:'a'});
 assert.deepEqual(registrationDecision({registrations:rows,capacity:1,operationId:'op2',personId:'p1'}),{decision:'duplicate',registrationId:'a'});
});
test('requires operation and identity; no payment confirmation from redirect alone',()=>{
 assert.equal(registrationDecision({capacity:10,emailKey:'a'}).reason,'operation_id_required');
 assert.equal(registrationDecision({capacity:10,operationId:'op'}).reason,'identity_required');
 assert.equal(isPaymentConfirmationEligible(r('a','pending_approval',{payment_checkout_id:'checkout'})),false);
 assert.equal(isPaymentConfirmationEligible(r('a','approved_payment_hold',{payment_checkout_id:'checkout'})),true);
});
