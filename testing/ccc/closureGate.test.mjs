import test from 'node:test';import assert from 'node:assert/strict';
import {reviewScopedEventClosure as review} from '../../base44/functions/cccActivity/closureGate.mjs';
const activity={id:'a',tenant_id:'t',club_id:'c',linked_event_id:'e',status:'completed'};
const event={id:'e',tenant_id:'t',host_club_id:'c'};
const r={id:'r',event_id:'e',tenant_id:'t',club_id:'c',registration_status:'confirmed',payment_status:'paid',attendance_status:'attended'};
const p={id:'p',purpose_id:'r',tenant_id:'t',club_id:'c',payment_status:'paid',provider_transaction_id:'tx1'};
const run=(x={})=>review({activity,event,registrations:[r],payments:[p],registrationComplete:true,paymentComplete:true,...x});
test('completed, attended, internally paid event passes operational checks but never claims external settlement',()=>{const v=run();assert.equal(v.operationallyReady,true);assert.equal(v.closeOutApproved,false);assert.equal(v.providerSettlementVerified,false);assert.equal(v.communicationDeliveryVerified,false)});
test('closure blocks unmarked attendance and processing payments',()=>{const v=run({registrations:[{...r,attendance_status:'not_marked'}],payments:[{...p,payment_status:'refund_pending'}]});assert.equal(v.operationallyReady,false);assert.ok(v.issues.some(x=>x.startsWith('attendance_unmarked')));assert.ok(v.issues.some(x=>x.startsWith('payment_unresolved')))});
test('closure fails closed on incomplete reads, duplicates and wrong club',()=>{const v=run({registrationComplete:false,paymentComplete:false,registrations:[r,r,{...r,id:'foreign',club_id:'other'}]});assert.equal(v.operationallyReady,false);assert.ok(v.issues.includes('roster_incomplete'));assert.ok(v.issues.includes('payments_incomplete'));assert.ok(v.issues.includes('invalid_or_duplicate_registration'))});
test('closure does not approve pending bookings or incomplete activity',()=>{const v=run({activity:{...activity,status:'in_progress'},registrations:[{...r,registration_status:'pending_approval'}]});assert.equal(v.operationallyReady,false);assert.ok(v.issues.includes('activity_not_completed'))});

test('paid booking with missing payment record blocks closure',()=>{const v=run({payments:[]});assert.ok(v.issues.includes('paid_booking_without_payment_r'))});
test('duplicate SumUp transaction across registrations blocks closure',()=>{const r2={...r,id:'r2'};const v=run({registrations:[r,r2],payments:[p,{...p,id:'p2',purpose_id:'r2'}]});assert.ok(v.issues.includes('duplicate_provider_transaction_p2'))});
test('settled checkout with unresolved booking blocks closure',()=>{const v=run({registrations:[{...r,registration_status:'approved_payment_hold'}]});assert.ok(v.issues.includes('paid_booking_unresolved_r'))});
test('settled payment lacking provider transaction reference blocks closure',()=>{const v=run({payments:[{...p,provider_transaction_id:''}]});assert.ok(v.issues.includes('missing_provider_transaction_p'))});
