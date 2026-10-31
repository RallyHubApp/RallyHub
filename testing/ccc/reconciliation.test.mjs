import test from 'node:test';
import assert from 'node:assert/strict';
import {summariseEventFinance} from '../../base44/functions/cccActivity/reconciliation.mjs';
const registration=(id,overrides={})=>({id,registration_status:'confirmed',payment_status:'paid',...overrides});
const payment=(purpose_id,amount,payment_status='paid',extra={})=>({purpose_id,amount,payment_status,amount_refunded:0,...extra});
test('gross, refunds and pending are separate and use cents',()=>{
 const result=summariseEventFinance([registration('a'),registration('b',{payment_status:'pending'}),registration('c')],[payment('a',5.55,'partially_refunded',{amount_refunded:1.2}),payment('b',7,'pending'),payment('c',2.25)]);
 assert.deepEqual([result.gross,result.refunded,result.net,result.pending],[7.8,1.2,6.6,7]);
 assert.equal(result.authoritative,false);
});
test('unrelated payments never enter event totals',()=>{
 const result=summariseEventFinance([registration('a')],[payment('a',10),payment('other',999)]);
 assert.equal(result.gross,10);assert.equal(result.matchedPaymentRecords,1);
});
test('duplicates, over-refunds, missing paid records and pending confirmations are flagged',()=>{
 const result=summariseEventFinance([registration('a'),registration('b'),registration('c',{payment_status:'pending'})],[payment('a',5,'paid',{amount_refunded:7}),payment('a',5),payment('c',3,'pending')]);
 const codes=result.anomalies.map(x=>x.code);
 for(const code of ['multiple_payment_records','refund_exceeds_payment','paid_registration_without_matching_payment','confirmed_with_pending_payment'])assert.ok(codes.includes(code),code);
});
test('empty records produce zero values and no anomalies',()=>{
 const result=summariseEventFinance([],[]);
 assert.equal(result.net,0);assert.deepEqual(result.anomalies,[]);
});
