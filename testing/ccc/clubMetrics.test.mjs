import test from 'node:test';import assert from 'node:assert/strict';import {clubMetrics} from '../../src/lib/ccc/clubMetrics.js';
const s=(id,extra={})=>({id,tenant_id:'t',club_id:'c',...extra});
test('metrics reconcile latest attendance and unique settled transactions',()=>{
 const result=clubMetrics({tenantId:'t',clubId:'c',registrations:[s('a'),s('b')],attendance:[s('x',{booking_id:'a',status:'no_show',marked_at:'2026-11-01T10:00:00Z'}),s('y',{booking_id:'a',status:'attended',marked_at:'2026-11-01T11:00:00Z'}),s('z',{booking_id:'b',status:'no_show'})],payments:[s('p1',{payment_status:'paid',amount:5,provider:'sumup',provider_transaction_id:'tx'}),s('p2',{payment_status:'paid',amount:5,provider:'sumup',provider_transaction_id:'tx'}),s('p3',{payment_status:'pending',amount:5})]});
 assert.deepEqual(result,{registrations:2,attended:1,noShows:1,paidTransactions:1,paidAmount:5,unverifiedAmount:0});
});
test('cross-club payments are excluded and invalid amounts are flagged',()=>{const result=clubMetrics({tenantId:'t',clubId:'c',payments:[s('p',{payment_status:'paid',amount:null}),s('q',{club_id:'other',payment_status:'paid',amount:99})]});assert.equal(result.paidAmount,0);assert.equal(result.unverifiedAmount,1);});
test('missing scope returns zero metrics',()=>assert.equal(clubMetrics({}).paidTransactions,0));
