import test from 'node:test';
import assert from 'node:assert/strict';
import {readEventAdminPage} from '../../base44/functions/eventRegistration/adminPage.mjs';
const scope={eventId:'e',tenantId:'t',clubId:'c'};
test('admin page uses positional SDK filter and returns registrations without payments',async()=>{
 const calls=[];const registrations={filter:async(...args)=>{calls.push(args);return [{id:'r',event_id:'e',tenant_id:'t',club_id:'c',full_name:'Test Member'}]}};
 const payments={filter:async(...args)=>{calls.push(args);return []}};
 const result=await readEventAdminPage(registrations,payments,scope);
 assert.equal(result.registrations.length,1);assert.equal(result.hasMore,false);
 assert.equal(calls.length,2);assert.equal(calls[0][1],'-created_date');assert.equal(calls[0][2],500);
 assert.equal(calls[1][0].purpose_id,'r');
});
test('rejects unverified full pages',async()=>{
 const entity={filter:async()=>Array.from({length:500},(_,i)=>({id:String(i)}))};
 await assert.rejects(()=>readEventAdminPage(entity,entity,scope),/incomplete/);
});
