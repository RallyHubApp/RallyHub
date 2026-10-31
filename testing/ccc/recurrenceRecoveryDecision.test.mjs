import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewRecurrenceCompletion} from '../../base44/functions/cccActivity/recurrenceRecoveryDecision.mjs';
const source={recurrence_batch_state:'needs_recovery',recurrence_batch_key:'ccc-batch-12345678',recurrence_expected_count:2};
const review={valid:true,complete:true,batchKey:source.recurrence_batch_key,childCount:2,issues:[],children:[{week:1},{week:2}]};
test('complete draft inventory may be explicitly reconciled, never published',()=>{const r=reviewRecurrenceCompletion(source,review);assert.equal(r.allowed,true);assert.equal(r.mayPublish,false);assert.equal(r.mayCreateChildren,false)});
test('missing child, duplicate week, changed key or incomplete inventory blocks completion',()=>{
 for(const v of [{...review,childCount:1},{...review,children:[{week:1},{week:1}]},{...review,batchKey:'other'},{...review,complete:false},{...review,issues:['child_linked_event']}])assert.equal(reviewRecurrenceCompletion(source,v).allowed,false);
});
test('only interrupted batches can be reconciled',()=>assert.equal(reviewRecurrenceCompletion({...source,recurrence_batch_state:'complete'},review).allowed,false));
