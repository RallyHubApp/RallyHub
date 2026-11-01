import test from 'node:test';import assert from 'node:assert/strict';import {planEventOperations as plan} from '../../base44/functions/eventRegistration/operationsActionPlan.mjs';
const rows=[{id:'a'},{id:'b'}];
const item=(registrationId,code,priority=2)=>({registrationId,code,priority,description:'Review'});
const run=(queue,capacityIssue=false)=>plan({rows,review:{queue,previewOnly:true,capacityIssue}});
test('safe expired hold can be opened for explicit provider verification',()=>{const r=run([item('a','expired_hold_verify_provider')]);assert.equal(r.tasks[0].action,'admin_expire_hold');assert.equal(r.tasks[0].requiresConfirmation,true)});
test('safe refunded booking can be reviewed for closure',()=>assert.equal(run([item('a','refunded_booking_closure')]).tasks[0].action,'admin_close_refunded_booking'));
test('critical issues on same registration block automated action',()=>assert.equal(run([item('a','refunded_booking_closure'),item('a','payment_reconciliation',1)]).actionable,0));
test('capacity mismatch blocks action shortcuts',()=>assert.equal(run([item('a','expired_hold_verify_provider')],true).actionable,0));
test('unknown issues stay manual',()=>assert.equal(run([item('a','paid_booking_not_confirmed',1)]).tasks[0].action,null));
test('foreign or missing registration never linked',()=>assert.equal(run([item('outside','expired_hold_verify_provider')]).actionable,0));
test('unverified review rejected',()=>assert.throws(()=>plan({rows,review:{queue:[]}}),/Verified/));

test('active hold can be checked against SumUp without overriding status',()=>assert.equal(run([item('a','active_hold_verify_payment')]).tasks[0].action,'admin_verify'));
