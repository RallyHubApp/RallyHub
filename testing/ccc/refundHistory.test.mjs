import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readPaymentRefundHistory,refundRemaining} from '../../base44/functions/eventRegistration/scopedRefundReader.mjs';
const source=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8');
const payment={amount:10,amount_refunded:4};
test('refund history reads all 501 records across three pages with tenant and club scope',async()=>{
 const calls=[];const rows=Array.from({length:501},(_,i)=>({id:'refund'+i,status:'failed',amount:0}));
 const entity={async filter(query,options){calls.push(query);const start=Number(options.cursor||0),end=start+options.limit;return {items:rows.slice(start,end),has_more:end<rows.length,next_cursor:end<rows.length?String(end):null}}};
 const result=await readPaymentRefundHistory(entity,{paymentId:'p1',tenantId:'t1',clubId:'c1'});
 assert.equal(result.length,501);assert.equal(calls.length,3);
 for(const q of calls)assert.deepEqual(q,{payment_record_id:'p1',tenant_id:'t1',club_id:'c1'});
});
test('refund history fails closed when cursor or page limit is invalid',async()=>{
 await assert.rejects(()=>readPaymentRefundHistory({async filter(){return {items:[],has_more:true,next_cursor:'repeat'}}},{paymentId:'p',tenantId:'t',clubId:'c'}),/stalled/);
 const entity={async filter(q,options){return {items:[{id:options.cursor||'a'}],has_more:true,next_cursor:String(Number(options.cursor||0)+1)}}};
 await assert.rejects(()=>readPaymentRefundHistory(entity,{paymentId:'p',tenantId:'t',clubId:'c',maxPages:2}),/safety limit/);
});
test('refund balance verifies ledger against payment record',()=>{
 assert.deepEqual(refundRemaining(payment,[{status:'succeeded',amount:4}]),{remaining:6,blocked:null});
 assert.equal(refundRemaining(payment,[{status:'succeeded',amount:3}]).blocked,'refund_ledger_mismatch');
});
test('refund balance blocks processing and unknown refunds',()=>{
 assert.equal(refundRemaining({amount:10,amount_refunded:0},[{status:'needs_reconciliation',amount:2}]).blocked,'unresolved_refund');
 assert.equal(refundRemaining({amount:10,amount_refunded:0},[{status:'processing',amount:2}]).blocked,'unresolved_refund');
});
test('refund balance detects over-refunds and invalid amounts',()=>{
 assert.equal(refundRemaining({amount:10,amount_refunded:11},[]).blocked,'over_refunded');
 assert.equal(refundRemaining({amount:NaN,amount_refunded:0},[]).blocked,'invalid_refund_amount');
});
test('refund locks the payment atomically before calling SumUp and fails closed on contention',()=>{
 const lock=source.indexOf('const refundLock=await base44.asServiceRole.entities.PaymentRecord.updateMany');
 const refund=source.indexOf('const refund=await base44.asServiceRole.entities.PaymentRefund.create');
 const provider=source.indexOf('const result=await refundPayment(');
 assert.ok(lock>0&&lock<refund&&refund<provider);
 assert.match(source,/payment_status:'refund_pending'/);
 assert.match(source,/refundLock\?\.updated!==1/);
});
test('event refund action uses scoped complete refund history and ledger validation',()=>{
 assert.match(source,/readPaymentRefundHistory\(base44\.asServiceRole\.entities\.PaymentRefund/);
 assert.match(source,/const refundBalance=refundRemaining\(payment,previous\)/);
 assert.doesNotMatch(source,/PaymentRefund\.filter\(\{payment_record_id:payment\.id\},'-requested_at',100\)/);
});
