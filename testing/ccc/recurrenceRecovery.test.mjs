import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectRecurrenceBatch} from '../../base44/functions/cccActivity/recurrenceRecovery.mjs';
const source={id:'a1',tenant_id:'t1',club_id:'c1',venue_id:'v1',recurrence_batch_key:'ccc-batch-12345678',recurrence_batch_state:'needs_recovery'};
function entity(rows,complete=true){return {filter:async(q,o)=>({items:rows,has_more:!complete,next_cursor:!complete?'cursor2':null})}}
const child=(id,week)=>({id,tenant_id:'t1',club_id:'c1',venue_id:'v1',status:'draft',idempotency_key:'ccc-rec-a1-1-'+week,configuration:{recurrence_source_activity_id:'a1',recurrence_week:week}});
test('partial recurrence batch is visible without writes or automatic retries',async()=>{
 const r=await inspectRecurrenceBatch(entity([child('b1',1),child('b2',2)]),source,{tenantId:'t1',clubId:'c1'});
 assert.equal(r.valid,true);assert.equal(r.childCount,2);assert.equal(r.requiresManualReview,true);assert.equal(r.safeToAutoRetry,false);assert.equal(r.mutationPerformed,false);
});
test('scope and missing claims fail closed',async()=>{
 assert.equal((await inspectRecurrenceBatch(entity([]),source,{tenantId:'t2',clubId:'c1'})).valid,false);
 assert.equal((await inspectRecurrenceBatch(entity([]),{...source,recurrence_batch_key:''},{tenantId:'t1',clubId:'c1'})).valid,false);
});
test('duplicate weeks and linked children require review',async()=>{
 const r=await inspectRecurrenceBatch(entity([child('b1',1),{...child('b2',1),linked_event_id:'event'}]),{...source,recurrence_batch_state:'complete'},{tenantId:'t1',clubId:'c1'});
 assert.ok(r.issues.includes('duplicate_or_invalid_week'));assert.ok(r.issues.includes('child_not_unlinked_draft'));assert.equal(r.requiresManualReview,true);
});
