import test from 'node:test';import assert from 'node:assert/strict';import {reviewEventCancellation as review} from '../../base44/functions/eventRegistration/cancellationPolicy.mjs';
const event={id:'e',tenant_id:'t',host_club_id:'c'};
const r={id:'r',event_id:'e',tenant_id:'t',club_id:'c',registration_status:'pending_approval',payment_status:'not_required'};
const check=(row)=>review({rows:[row],event,registrationId:'r'});
test('unpaid pending approval cancellation releases capacity',()=>{assert.equal(check(r).allowed,true);assert.equal(check(r).releasesCapacity,true)});
test('waitlisted cancellation does not release capacity',()=>{const v=check({...r,registration_status:'waitlisted'});assert.equal(v.allowed,true);assert.equal(v.releasesCapacity,false)});
test('paid booking cannot be cancelled without refund workflow',()=>assert.ok(check({...r,registration_status:'confirmed',payment_status:'paid'}).issues.includes('requires_refund_or_manual_review')));
test('unsettled checkout with provider transaction requires review',()=>assert.ok(check({...r,payment_transaction_id:'tx'}).issues.includes('provider_payment_present')));
test('foreign club scope rejected',()=>assert.ok(check({...r,club_id:'foreign'}).issues.includes('registration_scope')));
test('expired payment hold does not double release capacity',()=>{const v=review({rows:[{...r,registration_status:'approved_payment_hold',payment_status:'pending',payment_hold_expires_at:'2020-01-01T00:00:00Z'}],event,registrationId:'r'});assert.equal(v.allowed,true);assert.equal(v.releasesCapacity,false)});

test('checkout-backed hold cannot be cancelled without checking SumUp',()=>assert.ok(check({...r,registration_status:'approved_payment_hold',payment_status:'pending',payment_checkout_id:'checkout'}).issues.includes('checkout_requires_provider_verification')));
