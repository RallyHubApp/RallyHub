import test from 'node:test';
import assert from 'node:assert/strict';
import {readActivityAudit} from '../../base44/functions/cccActivity/activityAuditReader.mjs';
test('audit reads beyond old 100 record limit, strips sensitive snapshots and enforces scope',async()=>{
 const calls=[],rows=Array.from({length:450},(_,i)=>({id:'log'+i,action:'ccc.activity.transition',user_id:'admin',created_date:'2026-10-31',before_state:'secret',after_state:'secret'}));
 const entity={async filter(query,opts){calls.push(query);const start=Number(opts.cursor||0),end=start+opts.limit;return {items:rows.slice(start,end),has_more:end<rows.length,next_cursor:end<rows.length?String(end):null}}};
 const result=await readActivityAudit(entity,{tenantId:'t',clubId:'c',activityId:'a'});
 assert.equal(result.entries.length,450);assert.equal(result.resultsMayBeTruncated,false);assert.equal(calls.length,3);
 assert.equal(JSON.stringify(result).includes('secret'),false);
 for(const query of calls)assert.deepEqual(query,{tenant_id:'t',club_id:'c',entity_type:'ClubActivity',entity_id:'a'});
});
test('audit filters unrelated actions and deduplicates by ID',async()=>{
 const entity={async filter(){return {items:[{id:'a',action:'ccc.activity.transition'},{id:'a',action:'ccc.activity.transition'},{id:'b',action:'other'}],has_more:false}}};
 const result=await readActivityAudit(entity,{tenantId:'t',clubId:'c',activityId:'a'});
 assert.equal(result.entries.length,1);
});
test('audit detects invalid and stalled cursors',async()=>{
 await assert.rejects(()=>readActivityAudit({async filter(){return []}},{tenantId:'t',clubId:'c',activityId:'a'}),/unavailable/);
 await assert.rejects(()=>readActivityAudit({async filter(){return {items:[],has_more:true,next_cursor:'same'}}},{tenantId:'t',clubId:'c',activityId:'a',pageSize:1}),/did not advance/);
});
