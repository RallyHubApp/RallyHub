import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewRecurrenceIntegrity} from '../../base44/functions/cccActivity/recurrenceIntegrity.mjs';
const source={id:'s',tenant_id:'t',club_id:'c',venue_id:'v',court_id:'',revision:5,recurrence_batch_key:'ccc-batch-abcdefgh',recurrence_batch_state:'complete',recurrence_expected_count:2};
const child=(week)=>({id:'child'+week,tenant_id:'t',club_id:'c',venue_id:'v',court_id:'',status:'draft',linked_event_id:'',idempotency_key:'ccc-rec-s-3-'+week,configuration:{recurrence_source_activity_id:'s',recurrence_source_revision:3,recurrence_week:week}});
test('complete contiguous draft batch passes integrity review',()=>{
 const r=reviewRecurrenceIntegrity(source,[child(1),child(2)],{inventoryComplete:true});
 assert.equal(r.consistent,true);assert.equal(r.requiresManualReview,false);assert.equal(r.safeToAutoRetry,false);
});
test('missing week and incomplete inventory fail closed',()=>{
 const r=reviewRecurrenceIntegrity(source,[child(1)],{inventoryComplete:false});
 assert.ok(r.issues.includes('missing_week'));assert.ok(r.issues.includes('inventory_incomplete'));assert.equal(r.consistent,false);
});
test('duplicate operation IDs and mismatched courts are flagged',()=>{
 const bad={...child(2),idempotency_key:child(1).idempotency_key,court_id:'other'};
 const r=reviewRecurrenceIntegrity(source,[child(1),bad],{inventoryComplete:true});
 assert.ok(r.issues.includes('duplicate_or_missing_operation_id'));assert.ok(r.issues.includes('child_scope_or_resource_mismatch'));
});
test('linked or non-draft child cannot be certified',()=>{
 const r=reviewRecurrenceIntegrity(source,[child(1),{...child(2),status:'scheduled',linked_event_id:'event'}],{inventoryComplete:true});
 assert.ok(r.issues.includes('child_not_unlinked_draft'));assert.equal(r.consistent,false);
});
