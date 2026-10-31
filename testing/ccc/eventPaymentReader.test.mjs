import test from 'node:test';
import assert from 'node:assert/strict';
import {readEventPayments} from '../../base44/functions/cccActivity/eventPaymentReader.mjs';
const makeEntity=()=>({calls:[],async filter(query,opts){this.calls.push({query,opts});const all=query.purpose_id.$in.map(id=>({id:'p-'+id,purpose_id:id,payment_status:'paid',amount:5}));const start=Number(opts.cursor||0),end=start+opts.limit;return {items:all.slice(start,end),has_more:end<all.length,next_cursor:end<all.length?String(end):null}}});
test('payment reader splits 105 registration IDs into bounded scoped batches',async()=>{
 const entity=makeEntity();const ids=Array.from({length:105},(_,i)=>'r'+i);
 const result=await readEventPayments(entity,{tenantId:'t',clubId:'c',registrationIds:ids});
 assert.equal(entity.calls.length,3);assert.equal(result.payments.length,105);
 assert.deepEqual(entity.calls.map(c=>c.query.purpose_id.$in.length),[40,40,25]);
 for(const call of entity.calls){assert.equal(call.query.tenant_id,'t');assert.equal(call.query.club_id,'c');assert.equal(call.query.purpose_type,'event');assert.equal(call.opts.limit,200)}
});
test('reader deduplicates registration IDs',async()=>{
 const entity=makeEntity();const result=await readEventPayments(entity,{tenantId:'t',clubId:'c',registrationIds:['a','a','b']});
 assert.equal(result.payments.length,2);assert.equal(result.registrationCount,2);
});
test('reader pages through more than 200 payments in a single batch',async()=>{
 const entity={async filter(query,opts){const start=Number(opts.cursor||0),end=start+opts.limit;const items=Array.from({length:450},(_,i)=>({id:'p'+i,purpose_id:'a'}));return {items:items.slice(start,end),has_more:end<items.length,next_cursor:end<items.length?String(end):null}}};
 const result=await readEventPayments(entity,{tenantId:'t',clubId:'c',registrationIds:['a']});
 assert.equal(result.payments.length,450);assert.equal(result.pages,3);assert.equal(result.possiblyTruncated,false);
});
test('reader marks truncated payment batches when safety limit reached',async()=>{
 const entity={async filter(query,opts){return {items:[{id:opts.cursor||'p0',purpose_id:'a'}],has_more:true,next_cursor:String(Number(opts.cursor||0)+1)}}};
 const result=await readEventPayments(entity,{tenantId:'t',clubId:'c',registrationIds:['a'],maxPagesPerBatch:2});
 assert.equal(result.possiblyTruncated,true);
});
test('no registrations means no payment reads',async()=>{
 const entity=makeEntity();const result=await readEventPayments(entity,{tenantId:'t',clubId:'c',registrationIds:[]});
 assert.equal(entity.calls.length,0);assert.equal(result.payments.length,0);
});
