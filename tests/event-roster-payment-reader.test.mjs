import test from 'node:test';
import assert from 'node:assert/strict';
import {readAdminEventPayments} from '../base44/functions/eventRegistration/scopedPaymentReader.mjs';
test('loads event payment records in one scoped query and filters by registration',async()=>{
 let calls=0;const entity={filter:async(query,sort,limit)=>{calls++;assert.deepEqual(query,{tenant_id:'tenant',club_id:'club',purpose_type:'event'});assert.equal(limit,500);return [{id:'p1',tenant_id:'tenant',club_id:'club',purpose_type:'event',purpose_id:'r1'},{id:'p2',tenant_id:'tenant',club_id:'club',purpose_type:'event',purpose_id:'another-event'}]}};
 const result=await readAdminEventPayments(entity,{tenantId:'tenant',clubId:'club',registrationIds:['r1','r2']});assert.equal(calls,1);assert.deepEqual(result.map(x=>x.id),['p1']);
});
test('rejects a truncated tenant payment inventory',async()=>{await assert.rejects(readAdminEventPayments({filter:async()=>Array.from({length:500},(_,i)=>({id:String(i)}))},{tenantId:'t',clubId:'c',registrationIds:['r']}),/incomplete/)});
test('rejects payment records outside authorised scope',async()=>{await assert.rejects(readAdminEventPayments({filter:async()=>[{id:'x',tenant_id:'other',club_id:'c',purpose_type:'event',purpose_id:'r'}]},{tenantId:'t',clubId:'c',registrationIds:['r']}),/scope violation/)});
test('empty roster does not query payment records',async()=>{const result=await readAdminEventPayments({filter:()=>{throw Error('should not run')}},{tenantId:'t',clubId:'c',registrationIds:[]});assert.deepEqual(result,[])});
