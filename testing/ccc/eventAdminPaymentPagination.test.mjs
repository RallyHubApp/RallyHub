import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readAdminEventPayments} from '../../base44/functions/eventRegistration/scopedPaymentReader.mjs';
const source=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8');
function entity(ids,perId=1){const calls=[];return {calls,async filter(query,options){calls.push({query,options});const rows=query.purpose_id.$in.flatMap(id=>Array.from({length:perId},(_,i)=>({id:'p-'+id+'-'+i,purpose_id:id,payment_status:'paid',amount:5})));const start=Number(options.cursor||0),end=start+options.limit;return {items:rows.slice(start,end),has_more:end<rows.length,next_cursor:end<rows.length?String(end):null}}}}
test('legacy event admin payments are no longer capped at 500 tenant-wide records',async()=>{
 const ids=Array.from({length:850},(_,i)=>'r'+i),sdk=entity(ids);
 const payments=await readAdminEventPayments(sdk,{tenantId:'t',clubId:'c',registrationIds:ids});
 assert.equal(payments.length,850);assert.equal(sdk.calls.length,22);
 for(const call of sdk.calls){assert.equal(call.query.tenant_id,'t');assert.equal(call.query.club_id,'c');assert.equal(call.query.purpose_type,'event');assert.ok(call.query.purpose_id.$in.length<=40)}
});
test('admin payment lookup follows cursor across more than 200 records in one batch',async()=>{
 const sdk=entity(['r1'],420);
 const payments=await readAdminEventPayments(sdk,{tenantId:'t',clubId:'c',registrationIds:['r1']});
 assert.equal(payments.length,420);assert.equal(sdk.calls.length,3);
});
test('admin payment lookup fails closed when a batch cannot be fully verified',async()=>{
 await assert.rejects(()=>readAdminEventPayments(entity(['r1'],500),{tenantId:'t',clubId:'c',registrationIds:['r1'],maxPages:2}),/safety limit/);
});
test('admin payment lookup cannot be used to read unrelated tenant records',async()=>{
 const sdk=entity(['r1']);
 await readAdminEventPayments(sdk,{tenantId:'t',clubId:'c',registrationIds:['r1']});
 assert.deepEqual(sdk.calls[0].query.purpose_id.$in,['r1']);
});
test('event admin list invokes scoped payment reader rather than tenant-wide 500 query',()=>{
 assert.match(source,/const payments=await readAdminEventPayments/);
 assert.doesNotMatch(source,/PaymentRecord\.filter\(\{tenant_id:t\.tenant_id,club_id:t\.host_club_id,purpose_type:'event'\},'-created_date',500\)/);
});
