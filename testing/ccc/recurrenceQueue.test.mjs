import test from 'node:test';
import assert from 'node:assert/strict';
import {readRecurrenceQueue} from '../../base44/functions/cccActivity/recurrenceQueue.mjs';
const rows=[{id:'a',tenant_id:'t',club_id:'c',recurrence_batch_key:'ccc-batch-12345678',recurrence_batch_state:'needs_recovery',recurrence_expected_count:2},{id:'b',tenant_id:'t',club_id:'c',recurrence_batch_key:'ccc-batch-87654321',recurrence_batch_state:'complete'},{id:'c',tenant_id:'t',club_id:'c'}];
test('queue reports scoped batches without personal data',async()=>{
 const entity={filter:async(q)=>({items:rows.filter(r=>r.tenant_id===q.tenant_id&&r.club_id===q.club_id),has_more:false})};
 const r=await readRecurrenceQueue(entity,{tenantId:'t',clubId:'c'});
 assert.equal(r.total,2);assert.equal(r.counts.needs_recovery,1);assert.equal(r.batches[0].id,'a');assert.equal(r.complete,true);assert.equal(r.mutationPerformed,false);
});
test('queue exposes cross-source draft collisions and batch integrity without booking mutations',async()=>{
 const child=(id,source)=>({id,tenant_id:'t',club_id:'c',venue_id:'v',status:'draft',starts_at:'2026-11-11T19:00',ends_at:'2026-11-11T20:30',idempotency_key:'ccc-rec-'+source+'-1-1',configuration:{recurrence_source_activity_id:source,recurrence_source_revision:1,recurrence_week:1}});
 const entity={filter:async()=>({items:[...rows,child('x','a'),child('y','b')],has_more:false})};
 const r=await readRecurrenceQueue(entity,{tenantId:'t',clubId:'c'});
 assert.equal(r.draftCollisions.collisionCount,1);assert.equal(r.draftCollisions.venueReservationConfirmed,false);
 assert.ok(r.batches.find(b=>b.id==='a').integrity.issues.length>0);
});
test('queue rejects missing scope',async()=>{await assert.rejects(readRecurrenceQueue({},{tenantId:'t'}))});
