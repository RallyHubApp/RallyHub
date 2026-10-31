import test from 'node:test';
import assert from 'node:assert/strict';
import {readRecurrenceQueue} from '../../base44/functions/cccActivity/recurrenceQueue.mjs';
const rows=[{id:'a',tenant_id:'t',club_id:'c',recurrence_batch_key:'ccc-batch-12345678',recurrence_batch_state:'needs_recovery',recurrence_expected_count:2},{id:'b',tenant_id:'t',club_id:'c',recurrence_batch_key:'ccc-batch-87654321',recurrence_batch_state:'complete'},{id:'c',tenant_id:'t',club_id:'c'}];
test('queue reports scoped batches without personal data',async()=>{
 const entity={filter:async(q)=>({items:rows.filter(r=>r.tenant_id===q.tenant_id&&r.club_id===q.club_id),has_more:false})};
 const r=await readRecurrenceQueue(entity,{tenantId:'t',clubId:'c'});
 assert.equal(r.total,2);assert.equal(r.counts.needs_recovery,1);assert.equal(r.batches[0].id,'a');assert.equal(r.complete,true);assert.equal(r.mutationPerformed,false);
});
test('queue rejects missing scope',async()=>{await assert.rejects(readRecurrenceQueue({},{tenantId:'t'}))});
