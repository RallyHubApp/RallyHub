import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {summariseEventFinance} from '../../base44/functions/cccActivity/reconciliation.mjs';
import {isConfiguredHost} from '../../base44/functions/cccActivity/hostPolicy.mjs';
import {readEventPayments} from '../../base44/functions/cccActivity/eventPaymentReader.mjs';
import {readEventRegistrations} from '../../base44/functions/cccActivity/registrationReader.mjs';
const source=readFileSync(new URL('../../base44/functions/cccActivity/entry.ts',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'');
const js=transformSync(source,{loader:'ts',format:'cjs'}).code;
const records={
 User:[{id:'host',email:'host@example.ie',active_tenant_id:'t1',active_club_id:'c1',approval_status:'approved',role:'user',active_club_role:'member'}],
 Venue:[{id:'v1',tenant_id:'t1',club_id:'c1',name:'Ennistymon',status:'active'}],
 MembershipVenueHostConfig:[{id:'cfg',tenant_id:'t1',club_id:'c1',venue_key:'ennistymon',active:true,host_emails:['host@example.ie']}],
 ClubActivity:[{id:'a1',tenant_id:'t1',club_id:'c1',venue_id:'v1',title:'Wednesday play',starts_at:'2026-11-04T19:00:00',status:'scheduled',linked_event_id:'e1',revision:1}],
 Tournament:[{id:'e1',tenant_id:'t1',host_club_id:'c1',name:'Wednesday play',event_capacity:16,event_registration_mode:'rallyhub'}],
 EventRegistration:[{id:'r1',event_id:'e1',tenant_id:'t1',club_id:'c1',full_name:'Player One',email:'private@example.ie',medical_note:'private',registration_status:'confirmed',attendance_status:'not_marked'}],
 PaymentRecord:[],AuditLog:[]
};
const matches=(item,query)=>Object.entries(query).every(([k,v])=>v&&typeof v==='object'&&'$in'in v?v.$in.includes(item[k]):v&&typeof v==='object'&&'$exists'in v?(v.$exists?item[k]!==undefined:item[k]===undefined):item[k]===v);
function makeHarness(user=records.User[0]){
 const db=structuredClone(records);const reads={};
 const entities=Object.fromEntries(Object.keys(db).map(name=>[name,{
  filter:async(query={},sort,limit)=>{reads[name]=(reads[name]||0)+1;const rows=db[name].filter(row=>matches(row,query));if(sort&&typeof sort==='object'){const start=Number(sort.cursor||0),size=sort.limit||250;return {items:rows.slice(start,start+size),has_more:start+size<rows.length,next_cursor:start+size<rows.length?String(start+size):null}}return rows.slice(0,limit||1000)},
  updateMany:async(query,patch)=>{let updated=0;for(const row of db[name])if(matches(row,query)){Object.assign(row,patch.$set||{});updated++}return {updated}},
  create:async(record)=>{db[name].push(record);return record}
 }]));
 let handler;
 const sdk={auth:{me:async()=>user},asServiceRole:{entities}};
 vm.runInNewContext(js,{Deno:{serve:fn=>{handler=fn}},createClientFromRequest:()=>sdk,summariseEventFinance,isConfiguredHost,readEventPayments,readEventRegistrations,Response,Date,console});
 const call=async(action,fields={})=>{const response=await handler({method:'POST',json:async()=>({action,...fields})});return {status:response.status,data:await response.json()}};
 return {call,db,reads};
}
test('delegated host lists assigned activities and sees only confirmed names',async()=>{
 const h=makeHarness();
 const list=await h.call('host_activities');assert.equal(list.status,200);assert.deepEqual(list.data.activities.map(x=>x.id),['a1']);
 const roster=await h.call('host_roster',{id:'a1'});assert.equal(roster.status,200);assert.equal(roster.data.participants[0].name,'Player One');
 assert.equal(JSON.stringify(roster.data).includes('private@example.ie'),false);
 assert.equal(JSON.stringify(roster.data).includes('medical_note'),false);
});
test('host activity discovery uses batched lookups, not one query per activity',async()=>{
 const h=makeHarness();
 for(let i=0;i<30;i++)h.db.ClubActivity.push({...h.db.ClubActivity[0],id:'a'+(i+2)});
 const result=await h.call('host_activities');
 assert.equal(result.data.activities.length,31);
 assert.equal(h.reads.User,1);assert.equal(h.reads.Venue,1);assert.equal(h.reads.MembershipVenueHostConfig,1);
});
test('delegated host is denied admin options and cross-club activity access',async()=>{
 const h=makeHarness();
 assert.equal((await h.call('options')).status,403);
 assert.equal((await h.call('host_roster',{id:'different'})).status,404);
});
test('attendance is revision-checked, audit-logged and rejects stale updates',async()=>{
 const h=makeHarness();
 const first=await h.call('host_checkin',{id:'a1',registrationId:'r1',attendance:'attended',expectedRevision:0});
 assert.equal(first.status,200);assert.equal(first.data.revision,1);
 assert.equal(h.db.EventRegistration[0].attendance_status,'attended');
 assert.equal(h.db.AuditLog.length,1);
 const stale=await h.call('host_checkin',{id:'a1',registrationId:'r1',attendance:'no_show',expectedRevision:0});
 assert.equal(stale.status,409);
 assert.equal(h.db.EventRegistration[0].attendance_status,'attended');
});
test('revoked host is immediately denied roster and check-in',async()=>{
 const h=makeHarness();
 h.db.MembershipVenueHostConfig[0].active=false;
 assert.equal((await h.call('host_roster',{id:'a1'})).status,403);
 assert.equal((await h.call('host_checkin',{id:'a1',registrationId:'r1',attendance:'attended',expectedRevision:0})).status,403);
});
test('non-confirmed registrations cannot be checked in',async()=>{
 const h=makeHarness();
 h.db.EventRegistration[0].registration_status='waitlisted';
 assert.equal((await h.call('host_roster',{id:'a1'})).data.participants.length,0);
 assert.equal((await h.call('host_checkin',{id:'a1',registrationId:'r1',attendance:'attended',expectedRevision:0})).status,409);
});
test('activity audit history is scoped and strips before/after snapshots',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.AuditLog.push({id:'audit-1',tenant_id:'t1',club_id:'c1',entity_type:'ClubActivity',entity_id:'a1',action:'ccc.activity.transition',user_id:'admin',created_date:'2026-10-31',before_state:'private',after_state:'private'});
 h.db.AuditLog.push({id:'audit-2',tenant_id:'t1',club_id:'c2',entity_type:'ClubActivity',entity_id:'a1',action:'ccc.activity.transition',user_id:'other'});
 const result=await h.call('activity_audit',{id:'a1'});
 assert.equal(result.status,200);assert.equal(result.data.entries.length,1);
 assert.equal(result.data.entries[0].action,'ccc.activity.transition');
 assert.equal(JSON.stringify(result.data).includes('private'),false);
 assert.equal(result.data.auditIsBestEffort,true);
});
test('delegated host cannot access activity audit history',async()=>{
 const h=makeHarness();
 assert.equal((await h.call('activity_audit',{id:'a1'})).status,403);
});
test('event overview only counts payments linked to selected registrations',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.PaymentRecord.push({id:'p1',tenant_id:'t1',club_id:'c1',purpose_type:'event',purpose_id:'r1',amount:12.5,amount_refunded:2.5,payment_status:'partially_refunded'});
 h.db.PaymentRecord.push({id:'p2',tenant_id:'t1',club_id:'c1',purpose_type:'event',purpose_id:'other',amount:999,payment_status:'paid'});
 const result=await h.call('registration_overview',{id:'a1'});
 assert.equal(result.status,200);assert.equal(result.data.finance.gross,12.5);
 assert.equal(result.data.finance.refunded,2.5);assert.equal(result.data.finance.net,10);
 assert.equal(result.data.finance.authoritative,false);
 assert.equal(result.data.registrations.length,1);
 assert.equal(result.data.registrations[0].name,'Player One');
 assert.equal(JSON.stringify(result.data).includes('medical_note'),false);
});
test('financial overview fetches all 500 registrations via cursor pages',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 for(let i=0;i<499;i++)h.db.EventRegistration.push({...h.db.EventRegistration[0],id:'extra-'+i});
 const result=await h.call('registration_overview',{id:'a1'});
 assert.equal(result.status,200);assert.equal(result.data.registrations.length,500);
 assert.equal(result.data.finance.complete,true);
 assert.equal(result.data.resultsMayBeTruncated,false);
 assert.equal(h.reads.EventRegistration,2);
});
test('registration continuation loads beyond the bounded initial page without losing tenant scope',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 for(let i=2;i<1506;i++)h.db.EventRegistration.push({...h.db.EventRegistration[0],id:'r'+i});
 const first=await h.call('registration_overview',{id:'a1'});
 assert.equal(first.status,200);assert.equal(first.data.registrations.length,1000);assert.equal(first.data.summaryIsPartial,true);
 assert.equal(first.data.resultsMayBeTruncated,true);
 assert.equal(first.data.finance.complete,false);
 assert.ok(first.data.registrationNextCursor);
 const second=await h.call('registration_page',{id:'a1',cursor:first.data.registrationNextCursor});
 assert.equal(second.status,200);assert.equal(second.data.registrations.length,250);
 assert.equal(second.data.hasMore,true);
 assert.equal(second.data.financeNotIncluded,false);
 assert.equal(second.data.registrations[0].email,'private@example.ie');
 const third=await h.call('registration_page',{id:'a1',cursor:second.data.nextCursor});
 assert.equal(third.status,200);assert.equal(third.data.registrations.length,250);
 const last=await h.call('registration_page',{id:'a1',cursor:third.data.nextCursor});
 assert.equal(last.status,200);assert.equal(last.data.registrations.length,5);assert.equal(last.data.hasMore,false);
});
test('continuation loads matched payments for registrations beyond initial overview',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 for(let i=2;i<1003;i++)h.db.EventRegistration.push({...h.db.EventRegistration[0],id:'r'+i});
 h.db.PaymentRecord.push({id:'payment-late',tenant_id:'t1',club_id:'c1',purpose_type:'event',purpose_id:'r1002',payment_status:'paid',amount:9.5});
 const first=await h.call('registration_overview',{id:'a1'});
 const later=await h.call('registration_page',{id:'a1',cursor:first.data.registrationNextCursor});
 assert.equal(later.status,200);
 const row=later.data.registrations.find(r=>r.id==='r1002');
 assert.equal(row.amount,9.5);assert.equal(row.paymentStatus,'paid');
 assert.equal(later.data.financeNotIncluded,false);
});
test('continuation denies missing cursor and cross-club event',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 assert.equal((await h.call('registration_page',{id:'a1',cursor:''})).status,400);
 h.db.Tournament[0].host_club_id='other';
 assert.equal((await h.call('registration_page',{id:'a1',cursor:'250'})).status,404);
});
test('event overview and roster enforce linked event tenant and club',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.Tournament[0].host_club_id='other';
 assert.equal((await h.call('registration_overview',{id:'a1'})).status,404);
 assert.equal((await h.call('host_roster',{id:'a1'})).status,404);
});
test('host cannot check in participants from another event',async()=>{
 const h=makeHarness();
 h.db.EventRegistration[0].event_id='other-event';
 assert.equal((await h.call('host_checkin',{id:'a1',registrationId:'r1',attendance:'attended',expectedRevision:0})).status,404);
});
test('invalid attendance values and revisions are rejected',async()=>{
 const h=makeHarness();
 assert.equal((await h.call('host_checkin',{id:'a1',registrationId:'r1',attendance:'approved',expectedRevision:0})).status,400);
 assert.equal((await h.call('host_checkin',{id:'a1',registrationId:'r1',attendance:'attended',expectedRevision:-1})).status,400);
});
test('missing authentication and tenant context are denied',async()=>{
 assert.equal((await makeHarness(null).call('host_activities')).status,403);
 assert.equal((await makeHarness({id:'host',role:'user'}).call('host_activities')).status,409);
});
