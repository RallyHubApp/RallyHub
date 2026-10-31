import test from 'node:test';
import assert from 'node:assert/strict';
import {paymentLedger,paymentReconciliationSummary} from '../../src/lib/ccc/paymentReconciliation.js';
const p=(id,status,extra={})=>({id,tenant_id:'t',club_id:'c',payment_status:status,amount:5,currency:'EUR',...extra});
test('payment ledger preserves provider status and isolates club',()=>{
 const rows=paymentLedger({tenantId:'t',clubId:'c',payments:[p('a','paid'),p('b','failed'),p('x','paid',{club_id:'other'})]});
 assert.deepEqual(rows.map(r=>r.id),['a','b']);
 assert.deepEqual(paymentReconciliationSummary(rows),{records:2,paid:1,pending:0,failed:1,refunded:0,duplicates:0,unknownAmount:0});
});
test('repeated provider transaction is flagged and not double-counted',()=>{
 const rows=paymentLedger({tenantId:'t',clubId:'c',payments:[p('a','paid',{provider:'sumup',provider_transaction_id:'tx'}),p('b','paid',{provider:'sumup',provider_transaction_id:'tx'})]});
 assert.equal(rows[1].duplicateTransaction,true);
 assert.equal(paymentReconciliationSummary(rows).paid,1);
});
test('unknown amount stays unknown; pending is not paid',()=>{
 const rows=paymentLedger({tenantId:'t',clubId:'c',payments:[p('a','pending',{amount:null})]});
 assert.equal(rows[0].amount,null);assert.equal(rows[0].settled,false);
 assert.equal(paymentReconciliationSummary(rows).unknownAmount,1);
});
