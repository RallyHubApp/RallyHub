import test from 'node:test';
import assert from 'node:assert/strict';
import {refundRecoveryQueue} from '../../base44/functions/cccActivity/refundRecovery.mjs';
const payment=(id,extra={})=>({id,tenant_id:'t1',club_id:'c1',purpose_type:'event',purpose_id:'r1',amount:20,amount_refunded:0,payment_status:'paid',...extra});
const refund=(id,paymentId,extra={})=>({id,tenant_id:'t1',club_id:'c1',payment_record_id:paymentId,amount:10,status:'processing',...extra});
const scope={tenantId:'t1',clubId:'c1',complete:true};
test('pending lock without refund record is surfaced for manual review',()=>{
 const result=refundRecoveryQueue([payment('p1',{payment_status:'refund_pending'})],[],scope);
 assert.equal(result.caseCount,1);assert.deepEqual(result.cases[0].issues,['refund_lock_pending']);assert.equal(result.authorisedToRetry,false);
});
test('provider reconciliation and ledger mismatches are visible but no provider calls occur',()=>{
 const result=refundRecoveryQueue([payment('p1',{amount_refunded:5})],[refund('f1','p1',{status:'needs_reconciliation'})],scope);
 assert.ok(result.cases[0].issues.includes('provider_reconciliation_required'));assert.ok(result.cases[0].issues.includes('refund_ledger_mismatch'));assert.equal(result.providerSettlementVerified,false);
});
test('fully reconciled refunds do not create false positives',()=>{
 const result=refundRecoveryQueue([payment('p1',{payment_status:'partially_refunded',amount_refunded:10})],[refund('f1','p1',{status:'succeeded'})],scope);
 assert.equal(result.caseCount,0);assert.equal(result.requiresReview,false);
});
test('cross-club rows excluded and orphan refunds flagged',()=>{
 const result=refundRecoveryQueue([payment('other',{club_id:'c2'})],[refund('f1','missing')],scope);
 assert.equal(result.caseCount,0);assert.equal(result.orphanRefundCount,1);assert.equal(result.requiresReview,true);
});
test('incomplete inventory never declares reconciliation complete',()=>{
 const result=refundRecoveryQueue([],[],{...scope,complete:false});
 assert.equal(result.complete,false);assert.equal(result.requiresReview,true);
});
