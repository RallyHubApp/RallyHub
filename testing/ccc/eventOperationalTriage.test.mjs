import test from 'node:test';import assert from 'node:assert/strict';import {reviewEventOperations as review} from '../../base44/functions/eventRegistration/operationalTriage.mjs';
const event={id:'e',tenant_id:'t',host_club_id:'c',event_capacity:2,event_reserved_count:1,event_waitlist_enabled:true};
const row=(id,status,payment_status='pending')=>({id,event_id:'e',tenant_id:'t',club_id:'c',registration_status:status,payment_status});
const rows=[row('a','confirmed','paid'),row('b','waitlisted')];
const run=(extra={})=>review({event,rows,payments:[],...extra});
test('scoped roster provides waitlist preview',()=>{const r=run();assert.equal(r.waitlist.ready,true);assert.equal(r.summary.critical,1);assert.equal(r.previewOnly,true)});
test('counter mismatch blocks waitlist readiness',()=>{const r=run({event:{...event,event_reserved_count:2}});assert.equal(r.capacityIssue,true);assert.equal(r.waitlist.ready,false)});
test('expired payment hold is provider verification task',()=>{const r=run({rows:[row('a','approved_payment_hold'),rows[1]],event:{...event,event_reserved_count:0}});assert.ok(r.queue.some(x=>x.code==='hold_expiry_missing'))});
test('refunded confirmed booking requires closure review',()=>assert.ok(run({rows:[row('a','confirmed','refunded'),rows[1]]}).queue.some(x=>x.code==='refunded_booking_closure')));
test('foreign payment fails closed',()=>assert.throws(()=>run({payments:[{id:'p',purpose_id:'a',purpose_type:'event',tenant_id:'foreign',club_id:'c'}]}),/scope mismatch/));
test('duplicate registration fails closed',()=>assert.throws(()=>run({rows:[rows[0],rows[0]]}),/Duplicate/));

test('active payment hold creates provider verification follow-up',()=>{const hold={...row('a','approved_payment_hold'),payment_checkout_id:'checkout-1',payment_hold_expires_at:new Date(Date.now()+600000).toISOString()};const payment={id:'p',tenant_id:'t',club_id:'c',purpose_type:'event',purpose_id:'a',payment_status:'pending',provider_checkout_id:'checkout-1'};const r=run({rows:[hold,rows[1]],payments:[payment]});assert.ok(r.queue.some(x=>x.code==='active_hold_verify_payment'))});

test('orphan checkout before approval is flagged to prevent duplicate charge',()=>assert.ok(run({rows:[row('a','pending_approval'),rows[1]],payments:[{id:'p',tenant_id:'t',club_id:'c',purpose_type:'event',purpose_id:'a',payment_status:'pending'}],event:{...event,event_reserved_count:1}}).queue.some(x=>x.code==='orphan_checkout_review')));
test('paid confirmation without ledger is critical',()=>assert.ok(run().queue.some(x=>x.code==='missing_paid_ledger')));
test('cancelled paid booking requires financial review',()=>assert.ok(run({rows:[row('a','cancelled'),rows[1]],event:{...event,event_reserved_count:0},payments:[{id:'p',tenant_id:'t',club_id:'c',purpose_type:'event',purpose_id:'a',payment_status:'paid'}]}).queue.some(x=>x.code==='cancelled_booking_payment_review')));
