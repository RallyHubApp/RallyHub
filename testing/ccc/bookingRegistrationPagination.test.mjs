import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readBookingRegistrations} from '../../base44/functions/eventRegistration/scopedRegistrationReader.mjs';
import {occupied,duplicate} from '../../base44/functions/eventRegistration/rules.js';
const source=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8');
function mock(rows){const calls=[];return {calls,async filter(query,opts){calls.push({query,opts});const start=Number(opts.cursor||0),end=start+opts.limit;return {items:rows.slice(start,end),has_more:end<rows.length,next_cursor:end<rows.length?String(end):null}}}}
test('booking roster reads all 1250 registrations and counts capacity beyond former 500 cap',async()=>{
 const rows=Array.from({length:1250},(_,i)=>({id:'r'+i,registration_status:'confirmed',email:'guest'+i+'@example.ie'}));
 const sdk=mock(rows);const result=await readBookingRegistrations(sdk,{eventId:'event',tenantId:'tenant',clubId:'club'});
 assert.equal(result.length,1250);assert.equal(occupied(result),1250);assert.equal(sdk.calls.length,5);
 for(const call of sdk.calls)assert.deepEqual(call.query,{event_id:'event',tenant_id:'tenant',club_id:'club'});
});
test('duplicate application beyond first 500 records is still rejected',async()=>{
 const rows=Array.from({length:700},(_,i)=>({id:'r'+i,email:'guest'+i+'@example.ie',registration_status:'pending_approval'}));
 const result=await readBookingRegistrations(mock(rows),{eventId:'e',tenantId:'t',clubId:'c'});
 assert.equal(duplicate(result,'guest699@example.ie'),true);
});
test('booking reader fails closed on incomplete pagination',async()=>{
 const sdk=mock(Array.from({length:751},(_,i)=>({id:'r'+i})));
 await assert.rejects(()=>readBookingRegistrations(sdk,{eventId:'e',tenantId:'t',clubId:'c',maxPages:2}),/safety limit/);
});
test('booking reader fails closed on cursor loops and invalid SDK response',async()=>{
 await assert.rejects(()=>readBookingRegistrations({async filter(){return {items:[],has_more:true,next_cursor:'stuck'}}},{eventId:'e',tenantId:'t',clubId:'c'}),/stalled/);
 await assert.rejects(()=>readBookingRegistrations({async filter(){return []}},{eventId:'e',tenantId:'t',clubId:'c'}),/unavailable/);
});
test('booking reader enforces complete tenant club event scope',async()=>{
 await assert.rejects(()=>readBookingRegistrations(mock([]),{eventId:'e',tenantId:'t',clubId:''}),/scope required/);
});
test('live booking service uses full cursor roster for initial and pre-commit checks and alternatives',()=>{
 const calls=source.match(/readBookingRegistrations\(/g)||[];
 assert.ok(calls.length>=3);
 assert.doesNotMatch(source,/EventRegistration\.filter\(\{event_id:id,tenant_id:t\.tenant_id\},'-created_date',500\)/);
 assert.match(source,/const current=await readBookingRegistrations/);
 assert.match(source,/const candidateRows=await readBookingRegistrations/);
});
