import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readEventAdminPage} from '../../base44/functions/eventRegistration/adminPage.mjs';
const backend=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/components/events/EventRegistrationsAdmin.jsx',import.meta.url),'utf8');
const registrations=Array.from({length:550},(_,i)=>({id:'r'+i,full_name:'Guest '+i,email:'g'+i+'@example.ie',registration_status:'pending_approval',payment_status:'not_required'}));
function entities(){const calls=[];return {calls,registration:{async filter(query,opts){calls.push({type:'registrations',query,opts});const start=Number(opts.cursor||0),end=start+opts.limit;return {items:registrations.slice(start,end),has_more:end<registrations.length,next_cursor:end<registrations.length?String(end):null}}},payment:{async filter(query,opts){calls.push({type:'payments',query,opts});return {items:[],has_more:false,next_cursor:null}}}}}
test('admin list fetches 200 records per request with cursor continuation beyond 500',async()=>{
 const e=entities(),scope={eventId:'event',tenantId:'tenant',clubId:'club'};
 const first=await readEventAdminPage(e.registration,e.payment,scope);
 assert.equal(first.registrations.length,200);assert.equal(first.hasMore,true);
 const second=await readEventAdminPage(e.registration,e.payment,{...scope,cursor:first.nextCursor});
 assert.equal(second.registrations.length,200);
 const third=await readEventAdminPage(e.registration,e.payment,{...scope,cursor:second.nextCursor});
 assert.equal(third.registrations.length,150);assert.equal(third.hasMore,false);
 assert.equal(e.calls.filter(c=>c.type==='registrations').length,3);
 for(const c of e.calls){assert.equal(c.query.tenant_id,'tenant');assert.equal(c.query.club_id,'club')}
});
test('admin page does not return unrelated financial or medical fields',async()=>{
 const e=entities(),result=await readEventAdminPage(e.registration,e.payment,{eventId:'e',tenantId:'t',clubId:'c'});
 assert.equal(result.registrations[0].medical_note,undefined);
 assert.equal(result.registrations[0].amount,0);
});
test('admin page fails closed on non-advancing cursor',async()=>{
 const e=entities();e.registration.filter=async()=>({items:[],has_more:true,next_cursor:'same'});
 await assert.rejects(()=>readEventAdminPage(e.registration,e.payment,{eventId:'e',tenantId:'t',clubId:'c',cursor:'same'}),/stalled/);
});
test('backend admin list and continuation are protected by same admin scope',()=>{
 assert.match(backend,/adminActions=\['admin_list','admin_page'/);
 assert.match(backend,/if\(action==='admin_list'\|\|action==='admin_page'\)/);
 assert.match(backend,/readEventAdminPage\(base44\.asServiceRole\.entities\.EventRegistration/);
});
test('event management interface supports loading further pages',()=>{
 assert.match(ui,/action:'admin_page'/);assert.match(ui,/Load more applications/);
 assert.match(ui,/Counts refer to loaded records only/);
});
