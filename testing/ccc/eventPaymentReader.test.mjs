import test from 'node:test';
import assert from 'node:assert/strict';
import {readEventPayments} from '../../base44/functions/cccActivity/eventPaymentReader.mjs';
const makeEntity=()=>({calls:[],async filter(query,sort,limit){this.calls.push({query,sort,limit});return query.purpose_id.$in.map(id=>({id:'p-'+id,purpose_id:id,payment_status:'paid',amount:5}))}});
test('payment reader splits 105 registration IDs into bounded scoped batches',async()=>{
 const entity=makeEntity();const ids=Array.from({length:105},(_,i)=>'r'+i);
 const result=await readEventPayments(entity,{tenantId:'t',clubId:'c',registrationIds:ids});
 assert.equal(entity.calls.length,3);assert.equal(result.payments.length,105);
 assert.deepEqual(entity.calls.map(c=>c.query.purpose_id.$in.length),[40,40,25]);
 for(const call of entity.calls){assert.equal(call.query.tenant_id,'t');assert.equal(call.query.club_id,'c');assert.equal(call.query.purpose_type,'event');assert.equal(call.limit,200)}
});
test('reader deduplicates registration IDs',async()=>{
 const entity=makeEntity();const result=await readEventPayments(entity,{tenantId:'t',clubId:'c',registrationIds:['a','a','b']});
 assert.equal(result.payments.length,2);assert.equal(result.registrationCount,2);
});
test('reader marks potentially truncated payment batches',async()=>{
 const entity={async filter(){return Array.from({length:3},(_,i)=>({id:'p'+i}))}};
 const result=await readEventPayments(entity,{tenantId:'t',clubId:'c',registrationIds:['a'],perBatchLimit:3});
 assert.equal(result.possiblyTruncated,true);
});
test('no registrations means no payment reads',async()=>{
 const entity=makeEntity();const result=await readEventPayments(entity,{tenantId:'t',clubId:'c',registrationIds:[]});
 assert.equal(entity.calls.length,0);assert.equal(result.payments.length,0);
});
