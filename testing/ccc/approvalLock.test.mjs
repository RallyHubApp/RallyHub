import test from 'node:test';import assert from 'node:assert/strict';
import {acquireEventApprovalLock} from '../../base44/functions/eventRegistration/approvalLock.mjs';
const registration={id:'r',registration_status:'pending_approval',payment_status:'not_required'};
const args={registration,eventId:'event',tenantId:'tenant',clubId:'club'};
test('concurrent approvals create exactly one processing reservation',async()=>{
 let record={...registration,event_id:'event',tenant_id:'tenant',club_id:'club'};
 const entity={updateMany:async(filter,mutation)=>{await Promise.resolve();if(Object.entries(filter).some(([k,v])=>record[k]!==v))return {updated:0};record={...record,...mutation.$set};return {updated:1}}};
 const results=await Promise.all(Array.from({length:12},()=>acquireEventApprovalLock(entity,args)));
 assert.equal(results.filter(Boolean).length,1);assert.equal(record.payment_status,'approval_processing');
});
test('approval lock rejects incorrect scope and nonpending registration',async()=>{
 const entity={updateMany:async()=>({updated:0})};assert.equal(await acquireEventApprovalLock(entity,args),false);
 assert.equal(await acquireEventApprovalLock(entity,{...args,registration:{...registration,registration_status:'confirmed'}}),false);
});
