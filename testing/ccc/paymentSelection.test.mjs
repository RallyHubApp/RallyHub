import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectRefundableEventPayment,selectCheckoutPayment} from '../../base44/functions/eventRegistration/paymentSelection.mjs';
const source=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8');
const reg={id:'r1',payment_record_id:'p1',payment_checkout_id:'checkout1'};
const paid=(id='p1',extra={})=>({id,purpose_id:'r1',payment_status:'paid',provider_checkout_id:'checkout1',provider_transaction_id:'tx1',amount:10,amount_refunded:0,...extra});
test('refund selects settled payment instead of latest pending retry',()=>{
 const result=selectRefundableEventPayment([{id:'new',purpose_id:'r1',payment_status:'pending'},paid()],reg);
 assert.equal(result.payment.id,'p1');
});
test('refund blocks ambiguous settled payments when no authoritative payment link',()=>{
 const result=selectRefundableEventPayment([paid('p1'),paid('p2')],{id:'r1',payment_checkout_id:'checkout1'});
 assert.equal(result.payment,null);assert.equal(result.reason,'ambiguous_refundable_payments');
});
test('refund selects the registration-linked settled payment among retries',()=>{
 const result=selectRefundableEventPayment([paid('p2'),paid('p1')],reg);
 assert.equal(result.payment.id,'p1');
});
test('refund blocks wrong checkout, missing transaction and over-refunded payment',()=>{
 assert.equal(selectRefundableEventPayment([paid('p1',{provider_checkout_id:'other'})],reg).reason,'checkout_mismatch');
 assert.equal(selectRefundableEventPayment([paid('p1',{provider_transaction_id:''})],{...reg,payment_transaction_id:''}).reason,'missing_transaction');
 assert.equal(selectRefundableEventPayment([paid('p1',{amount_refunded:11})],reg).reason,'invalid_refundable_amount');
});
test('checkout selection ignores pending payments from other checkouts',()=>{
 const result=selectCheckoutPayment([paid('old',{provider_checkout_id:'old'}),paid('p1')],reg);
 assert.equal(result.payment.id,'p1');
});
test('checkout selection refuses multiple matching checkout records',()=>{
 const result=selectCheckoutPayment([paid('p1'),paid('p2')],reg);
 assert.equal(result.reason,'ambiguous_checkout_payments');
});
test('refund and verification paths use scoped selection helpers',()=>{
 assert.match(source,/const selection=selectRefundableEventPayment\(payments,registration\)/);
 assert.match(source,/const selectedCheckout=selectCheckoutPayment\(existingPayments,registration\)/);
 assert.doesNotMatch(source,/const payment=payments\?\.\[0\]/);
});
