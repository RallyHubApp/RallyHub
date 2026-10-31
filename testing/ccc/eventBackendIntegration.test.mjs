import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {readBookingRegistrations} from '../../base44/functions/eventRegistration/scopedRegistrationReader.mjs';
import {readAdminEventPayments} from '../../base44/functions/eventRegistration/scopedPaymentReader.mjs';
import {readPaymentRefundHistory,refundRemaining} from '../../base44/functions/eventRegistration/scopedRefundReader.mjs';
import {selectRefundableEventPayment,selectCheckoutPayment} from '../../base44/functions/eventRegistration/paymentSelection.mjs';
import {readEventAdminPage} from '../../base44/functions/eventRegistration/adminPage.mjs';
import {occupied,duplicate,consentEvidence,canConfirm} from '../../base44/functions/eventRegistration/rules.js';
const source=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'');
const js=transformSync(source,{loader:'ts',format:'cjs'}).code;
const initial={
 Tournament:[{id:'event',tenant_id:'t1',host_club_id:'c1',name:'Test event',event_capacity:2000,event_booking_enabled:true,event_registration_mode:'rallyhub',event_publish_status:'published',event_public_visible:true,event_fee_amount:10}],
 EventRegistration:[{id:'r1',event_id:'event',tenant_id:'t1',club_id:'c1',full_name:'Player',email:'player@example.ie',registration_status:'confirmed',payment_status:'paid',payment_record_id:'p1',payment_checkout_id:'checkout1'}],
 PaymentRecord:[{id:'p1',tenant_id:'t1',club_id:'c1',purpose_type:'event',purpose_id:'r1',payment_status:'paid',amount:10,amount_refunded:0,provider:'sumup',provider_transaction_id:'tx1',provider_checkout_id:'checkout1'}],
 PaymentRefund:[],PaymentGatewayAccount:[{id:'gateway',tenant_id:'t1',club_id:'c1',provider:'sumup',status:'connected',is_default:true}],ClubLegalDocument:[],CommunicationBrandKit:[],Club:[]
};
const matches=(row,query)=>Object.entries(query||{}).every(([key,value])=>value&&typeof value==='object'&&'$in'in value?value.$in.includes(row[key]):row[key]===value);
function harness({user={id:'admin',role:'admin',active_tenant_id:'t1',active_club_id:'c1'},refundResult={refundId:'provider-refund',providerStatus:'REFUNDED'},lockAllowed=true}={}){
 const db=structuredClone(initial),calls={refund:0,notice:0,locks:0};
 const entities=Object.fromEntries(Object.entries(db).map(([name,records])=>[name,{
  filter:async(query={},sort,limit)=>{const rows=records.filter(r=>matches(r,query));if(sort&&typeof sort==='object'){const start=Number(sort.cursor||0),end=start+(sort.limit||200);return {items:rows.slice(start,end),has_more:end<rows.length,next_cursor:end<rows.length?String(end):null}}return rows.slice(0,limit||1000)},
  updateMany:async(query,patch)=>{calls.locks++;if(!lockAllowed)return {updated:0};let updated=0;for(const row of records)if(matches(row,query)){Object.assign(row,patch.$set||{});updated++}return {updated}},
  update:async(id,patch)=>{const row=records.find(r=>r.id===id);if(!row)throw Error('Record missing');Object.assign(row,patch);return row},
  create:async(record)=>{const saved={...record,id:'new'+(records.length+1)};records.push(saved);return saved},
  get:async(id)=>records.find(r=>r.id===id)
 }]));
 const sdk={auth:{me:async()=>user},asServiceRole:{entities}};
 let handler;
 const context={Deno:{serve:fn=>{handler=fn}},createClientFromRequest:()=>sdk,readBookingRegistrations,readAdminEventPayments,readPaymentRefundHistory,refundRemaining,selectRefundableEventPayment,selectCheckoutPayment,readEventAdminPage,occupied,duplicate,consentEvidence,canConfirm,createCheckout:async()=>({checkoutId:'newCheckout',checkoutUrl:'https://example.invalid'}),retrievePayment:async()=>({normalizedStatus:'paid',transactionId:'tx1'}),refundPayment:async()=>{calls.refund++;if(refundResult instanceof Error)throw refundResult;return refundResult},providerConfigured:()=>true,deliverEventNotice:async()=>{calls.notice++},eventNoticeRecipients:()=>({}),eventNoticeBody:()=>'',EVENT_NOTICE_TYPES:[],renderBasicBrandedEmail:()=>'',Response,Date,console};
 vm.runInNewContext(js,context);
 return {db,calls,call:async(action,fields={})=>{const response=await handler({method:'POST',json:async()=>({action,eventId:'event',...fields})});return {status:response.status,data:await response.json()}}};
}
test('admin pagination runs through backend without full roster scan and respects scope',async()=>{
 const h=harness();
 for(let i=2;i<402;i++)h.db.EventRegistration.push({...h.db.EventRegistration[0],id:'r'+i});
 const first=await h.call('admin_list');
 assert.equal(first.status,200);assert.equal(first.data.registrations.length,200);assert.equal(first.data.hasMore,true);
 const next=await h.call('admin_page',{cursor:first.data.nextCursor});
 assert.equal(next.status,200);assert.equal(next.data.registrations.length,200);
 assert.equal(h.calls.refund,0);
});
test('admin page denies cross-club users before reading private data',async()=>{
 const h=harness({user:{id:'admin',role:'admin',active_tenant_id:'t1',active_club_id:'other'}});
 assert.equal((await h.call('admin_list')).status,403);
 assert.equal((await h.call('admin_page',{cursor:'200'})).status,403);
});
test('refund locks payment before provider call and updates ledger after success',async()=>{
 const h=harness();
 const response=await h.call('admin_refund_payment',{registrationId:'r1',confirmRefund:true,reason:'Organiser cancelled',refundAmount:4});
 assert.equal(response.status,200);
 assert.equal(h.calls.refund,1);assert.equal(h.calls.locks,1);
 assert.equal(h.db.PaymentRecord[0].payment_status,'partially_refunded');
 assert.equal(h.db.PaymentRecord[0].amount_refunded,4);
 assert.equal(h.db.PaymentRefund[0].status,'succeeded');
});
test('refund contention fails without calling provider',async()=>{
 const h=harness({lockAllowed:false});
 const response=await h.call('admin_refund_payment',{registrationId:'r1',confirmRefund:true,reason:'Cancelled'});
 assert.equal(response.status,409);assert.equal(h.calls.refund,0);assert.equal(h.db.PaymentRefund.length,0);
});
test('provider refund failure retains lock and records reconciliation requirement',async()=>{
 const h=harness({refundResult:new Error('Provider timeout')});
 const response=await h.call('admin_refund_payment',{registrationId:'r1',confirmRefund:true,reason:'Cancelled'});
 assert.equal(response.status,503);assert.equal(h.db.PaymentRecord[0].payment_status,'refund_pending');
 assert.equal(h.db.PaymentRefund[0].status,'needs_reconciliation');
 assert.equal(h.calls.refund,1);
});
