import test from 'node:test';
import assert from 'node:assert/strict';
import {readEventAdminPage} from '../base44/functions/eventRegistration/adminPage.mjs';
const record={id:'r1',event_id:'event',tenant_id:'tenant',club_id:'club',full_name:'Sample Player',registration_status:'pending_approval',payment_status:'pending'};
test('roster-only endpoint returns registrations without calling payment service',async()=>{
 const registrations={filter:async()=>[record]};const payments={filter:async()=>{throw Error('payment service unavailable')}};
 const result=await readEventAdminPage(registrations,payments,{eventId:'event',tenantId:'tenant',clubId:'club',includePayments:false});
 assert.equal(result.registrations.length,1);assert.equal(result.registrations[0].name,'Sample Player');assert.equal(result.paymentVerified,false);assert.equal(result.registrations[0].refundableAmount,0);
});
test('normal roster fails closed when payment verification fails',async()=>{
 await assert.rejects(readEventAdminPage({filter:async()=>[record]},{filter:async()=>{throw Error('payment service unavailable')}},{eventId:'event',tenantId:'tenant',clubId:'club'}),/payment service unavailable/);
});
