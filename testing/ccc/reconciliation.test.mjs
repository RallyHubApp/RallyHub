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
test('multiple distinct settled records are included but flagged for review',()=>{
 const result=summariseEventFinance([registration('a')],[payment('a',4.5),payment('a',2.25)]);
 assert.equal(result.gross,6.75);assert.equal(result.net,6.75);
 assert.equal(result.matchedPaymentRecords,2);
 assert.ok(result.anomalies.some(x=>x.code==='multiple_payment_records'));
});
test('a later paid record satisfies an earlier failed payment attempt',()=>{
 const result=summariseEventFinance([registration('a')],[payment('a',5,'failed'),payment('a',5,'paid')]);
 assert.equal(result.gross,5);
 assert.equal(result.anomalies.some(x=>x.code==='paid_registration_without_matching_payment'),false);
});
test('invalid and over-refunded amounts require review',()=>{
 const result=summariseEventFinance([registration('a')],[payment('a',-5,'paid',{amount_refunded:6})]);
 assert.ok(result.anomalies.some(x=>x.code==='invalid_payment_amount'));
 assert.ok(result.anomalies.some(x=>x.code==='refund_exceeds_payment'));
});
test('empty records produce zero values and no anomalies',()=>{
 const result=summariseEventFinance([],[]);
 assert.equal(result.net,0);assert.deepEqual(result.anomalies,[]);
});
test('invalid negative or excessive precision amounts never enter financial totals',()=>{
 const result=summariseEventFinance([registration('a')],[payment('a',-5,'paid',{amount_refunded:6}),payment('a','4.999','paid'),payment('a',3.5,'paid')]);
 assert.equal(result.gross,3.5);assert.equal(result.net,3.5);assert.equal(result.excludedPaymentRecords,2);
});
test('non-EUR payment records are excluded from euro reporting',()=>{
 const result=summariseEventFinance([registration('a')],[payment('a',100,'paid',{currency:'USD'}),payment('a',5,'paid',{currency:'EUR'})]);
 assert.equal(result.gross,5);assert.equal(result.excludedPaymentRecords,1);
 assert.ok(result.anomalies.some(x=>x.code==='currency_mismatch'));
});
test('identical provider transaction IDs are not counted twice',()=>{
 const result=summariseEventFinance([registration('a')],[payment('a',5,'paid',{provider_transaction_id:'txn1'}),payment('a',5,'paid',{provider_transaction_id:'txn1'})]);
 assert.equal(result.gross,5);assert.equal(result.excludedPaymentRecords,1);
 assert.ok(result.anomalies.some(x=>x.code==='duplicate_provider_transaction'));
});
test('separate provider transactions are both counted but flagged for review',()=>{
 const result=summariseEventFinance([registration('a')],[payment('a',5,'paid',{provider_transaction_id:'txn1'}),payment('a',2,'paid',{provider_transaction_id:'txn2'})]);
 assert.equal(result.gross,7);assert.equal(result.excludedPaymentRecords,0);
 assert.ok(result.anomalies.some(x=>x.code==='multiple_payment_records'));
});
test('refund exceeding payment is excluded from totals',()=>{
 const result=summariseEventFinance([registration('a')],[payment('a',5,'refunded',{amount_refunded:8})]);
 assert.equal(result.gross,0);assert.equal(result.refunded,0);assert.equal(result.excludedPaymentRecords,1);
});
