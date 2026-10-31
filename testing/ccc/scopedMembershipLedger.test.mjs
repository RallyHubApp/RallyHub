import test from 'node:test';
import assert from 'node:assert/strict';
import {readScopedMembershipLedger as read} from '../../base44/functions/membershipRecord/scopedLedgerReader.mjs';
const make=(n)=>Array.from({length:n},(_,i)=>({id:'p'+i,tenant_id:'t',club_id:'c'}));
const entity=(rows)=>({filter:async(query,opts)=>{const start=Number(opts.cursor||0);return {items:rows.slice(start,start+opts.limit),has_more:start+opts.limit<rows.length,next_cursor:String(start+opts.limit)}}});
test('reads 1,250 scoped membership rows across five pages',async()=>{const result=await read(entity(make(1250)),{tenant_id:'t',club_id:'c'});assert.equal(result.rows.length,1250);assert.equal(result.pages,5);assert.equal(result.complete,true)});
test('does not count duplicate IDs twice',async()=>{const result=await read(entity([...make(1),...make(1)]),{tenant_id:'t',club_id:'c'},{pageSize:1});assert.equal(result.rows.length,1)});
test('rejects cross-club records even if provider returns them',async()=>assert.rejects(()=>read(entity([{id:'x',tenant_id:'t',club_id:'other'}]),{tenant_id:'t',club_id:'c'}),/scope violation/));
test('rejects legacy array response rather than trusting 500-row cap',async()=>assert.rejects(()=>read({filter:async()=>make(500)},{tenant_id:'t'}),/pagination unavailable/));
test('rejects stalled cursor',async()=>assert.rejects(()=>read({filter:async()=>({items:[],has_more:true,next_cursor:''})},{tenant_id:'t'}),/cursor stalled/));
test('fails closed when maxPages reached',async()=>assert.rejects(()=>read(entity(make(20)),{tenant_id:'t',club_id:'c'},{pageSize:5,maxPages:2}),/verified pagination limit/));
test('rejects absent tenant scope',async()=>assert.rejects(()=>read(entity([]),{club_id:'c'}),/tenant scope/));
test('rejects missing row IDs',async()=>assert.rejects(()=>read(entity([{tenant_id:'t'}]),{tenant_id:'t'}),/scope violation/));

test('rejects conflicting duplicate record versions across pages',async()=>assert.rejects(()=>read(entity([{id:'a',tenant_id:'t',club_id:'c',status:'paid'},{id:'a',tenant_id:'t',club_id:'c',status:'pending'}]),{tenant_id:'t',club_id:'c'},{pageSize:1}),/conflicting duplicate/));
test('rejects cursor cycles that return to an earlier cursor',async()=>{let count=0;await assert.rejects(()=>read({filter:async()=>({items:[],has_more:true,next_cursor:count++%2?'first':'second'})},{tenant_id:'t'}),/cursor stalled/)});
test('rejects invalid page sizes and excessive pages',async()=>{await assert.rejects(()=>read(entity([]),{tenant_id:'t'},{pageSize:501}),/pagination limits/);await assert.rejects(()=>read(entity([]),{tenant_id:'t'},{maxPages:0}),/pagination limits/)});
