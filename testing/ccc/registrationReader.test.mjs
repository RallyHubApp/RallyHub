import test from 'node:test';
import assert from 'node:assert/strict';
import {readEventRegistrations} from '../../base44/functions/cccActivity/registrationReader.mjs';
function entity(rows){const calls=[];return {calls,async filter(query,opts){calls.push({query,opts});const start=Number(opts.cursor||0),end=start+opts.limit;return {items:rows.slice(start,end),has_more:end<rows.length,next_cursor:end<rows.length?String(end):null}}}}
test('reads all 1251 records using six cursor pages',async()=>{
 const rows=Array.from({length:1251},(_,i)=>({id:'r'+i})),sdk=entity(rows);
 const result=await readEventRegistrations(sdk,{tenantId:'t',clubId:'c',eventId:'e'});
 assert.equal(result.registrations.length,1251);assert.equal(result.pages,6);assert.equal(result.complete,true);
 assert.equal(sdk.calls[1].opts.cursor,'250');
 for(const call of sdk.calls)assert.deepEqual(call.query,{event_id:'e',tenant_id:'t',club_id:'c'});
});
test('stops at explicit safety bound and flags incomplete result',async()=>{
 const sdk=entity(Array.from({length:1200},(_,i)=>({id:'r'+i})));
 const result=await readEventRegistrations(sdk,{tenantId:'t',clubId:'c',eventId:'e',pageSize:200,maxPages:3});
 assert.equal(result.registrations.length,600);assert.equal(result.hasMore,true);assert.equal(result.complete,false);
});
test('repeated cursor is rejected rather than silently looping',async()=>{
 const sdk={async filter(){return {items:[{id:'a'}],has_more:true,next_cursor:'same'}}};
 await assert.rejects(()=>readEventRegistrations(sdk,{tenantId:'t',clubId:'c',eventId:'e'}),/did not advance/);
});
test('duplicate rows across pages are not double-counted',async()=>{
 const sdk={async filter(query,opts){return opts.cursor?{items:[{id:'a'},{id:'b'}],has_more:false}:{items:[{id:'a'}],has_more:true,next_cursor:'next'}}};
 const result=await readEventRegistrations(sdk,{tenantId:'t',clubId:'c',eventId:'e'});
 assert.deepEqual(result.registrations.map(r=>r.id),['a','b']);
});
test('extra filters cannot override mandatory tenant club event scope',async()=>{
 const sdk=entity([{id:'a'}]);
 await readEventRegistrations(sdk,{tenantId:'t',clubId:'c',eventId:'e',extraFilters:{tenant_id:'wrong',attendance_status:'attended'}});
 assert.equal(sdk.calls[0].query.tenant_id,'t');assert.equal(sdk.calls[0].query.attendance_status,'attended');
});
