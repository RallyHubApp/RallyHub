import test from 'node:test';
import assert from 'node:assert/strict';
import {summariseLoadedRegistrations} from '../../src/lib/ccc/pagedEventOverview.js';
const rows=[{id:'a',status:'confirmed',attendance:'attended'},{id:'b',status:'pending_approval',attendance:'not_marked'},{id:'c',status:'cash_confirmed',attendance:'no_show'}];
const money=(gross,net)=>({gross,refunded:gross-net,pending:0,net,matchedPaymentRecords:1,excludedPaymentRecords:0,anomalies:[],complete:true});
test('pagination rollup sums all loaded pages in cents, de-duplicates registrations',()=>{
 const r=summariseLoadedRegistrations([...rows,rows[0]],[{finance:money(20.01,18.01)}],{hasMore:false,initialPaymentReadComplete:true,initialFinance:money(10.02,10.02)});
 assert.equal(r.summary.total,3);assert.equal(r.summary.confirmed,2);assert.equal(r.summary.attended,1);assert.equal(r.summary.noShows,1);
 assert.equal(r.finance.gross,30.03);assert.equal(r.finance.net,28.03);assert.equal(r.complete,true);
});
test('continuation, payment truncation or anomalies block completed finance',()=>{
 assert.equal(summariseLoadedRegistrations(rows,[],{hasMore:true,initialPaymentReadComplete:true,initialFinance:money(10,10)}).complete,false);
 assert.equal(summariseLoadedRegistrations(rows,[],{hasMore:false,initialPaymentReadComplete:false,initialFinance:money(10,10)}).complete,false);
 assert.equal(summariseLoadedRegistrations(rows,[{finance:{...money(2,2),complete:false}}],{hasMore:false,initialPaymentReadComplete:true,initialFinance:money(10,10)}).complete,false);
});
test('no linked payment records never implies provider settlement',()=>{
 const r=summariseLoadedRegistrations(rows,[],{hasMore:false,initialPaymentReadComplete:true,initialFinance:money(0,0)});
 assert.equal(r.finance.net,0);assert.equal(r.summary.total,3);
});
