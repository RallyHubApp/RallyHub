import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {summariseEventFinance} from '../../base44/functions/cccActivity/reconciliation.mjs';
import {isConfiguredHost} from '../../base44/functions/cccActivity/hostPolicy.mjs';
import {readEventPayments} from '../../base44/functions/cccActivity/eventPaymentReader.mjs';
import {readEventRegistrations} from '../../base44/functions/cccActivity/registrationReader.mjs';
import {readScopedActivities} from '../../base44/functions/cccActivity/activityReader.mjs';
import {buildFollowupReview} from '../../base44/functions/cccActivity/followupReview.mjs';
import {validateEventLink} from '../../base44/functions/cccActivity/eventLinkPolicy.mjs';
import {readActivityAudit} from '../../base44/functions/cccActivity/activityAuditReader.mjs';
import {summariseClubOperations} from '../../base44/functions/cccActivity/operationsSummary.mjs';
import {readScopedInventory,summarisePeopleInventory,summariseManagementInventory} from '../../base44/functions/cccActivity/managementReaders.mjs';
import {validateHostVenueMapping,validatePersonAccessLink} from '../../base44/functions/cccActivity/managementActions.mjs';
import {communicationReadiness} from '../../base44/functions/cccActivity/communicationReadiness.mjs';
import {reviewHostRevocation} from '../../base44/functions/cccActivity/hostRevocation.mjs';
import {activityScheduleConflicts} from '../../base44/functions/cccActivity/activitySchedulePolicy.mjs';
import {reviewPersonCommunications} from '../../base44/functions/cccActivity/consentReview.mjs';
import {readPersonInventory} from '../../base44/functions/cccActivity/personInventory.mjs';
import {refundRecoveryQueue} from '../../base44/functions/cccActivity/refundRecovery.mjs';
const source=readFileSync(new URL('../../base44/functions/cccActivity/entry.ts',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'');
const js=transformSync(source,{loader:'ts',format:'cjs'}).code;
const records={
 User:[{id:'host',email:'host@example.ie',active_tenant_id:'t1',active_club_id:'c1',approval_status:'approved',role:'user',active_club_role:'member'}],
 Venue:[{id:'v1',tenant_id:'t1',club_id:'c1',name:'Ennistymon',status:'active'}],
 MembershipVenueHostConfig:[{id:'cfg',tenant_id:'t1',club_id:'c1',venue_key:'ennistymon',active:true,host_emails:['host@example.ie']}],
 Person:[{id:'p1',tenant_id:'t1',full_name:'Player One'}],
 ClubActivity:[{id:'a1',tenant_id:'t1',club_id:'c1',venue_id:'v1',title:'Wednesday play',starts_at:'2026-11-04T19:00:00',status:'scheduled',linked_event_id:'e1',revision:1}],
 Tournament:[{id:'e1',tenant_id:'t1',host_club_id:'c1',name:'Wednesday play',event_capacity:16,event_registration_mode:'rallyhub'}],
 EventRegistration:[{id:'r1',event_id:'e1',tenant_id:'t1',club_id:'c1',full_name:'Player One',email:'private@example.ie',medical_note:'private',registration_status:'confirmed',attendance_status:'not_marked'}],
 ConsentRecord:[],CommunicationPreference:[],CommunicationSuppression:[],
 CommunicationTemplate:[{id:'template1',tenant_id:'t1',owner_scope:'tenant',status:'approved',club_id:'c1'}],ClubUserAccess:[],MembershipApplication:[],PaymentRecord:[],PaymentRefund:[],AuditLog:[]
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
 vm.runInNewContext(js,{Deno:{serve:fn=>{handler=fn}},createClientFromRequest:()=>sdk,summariseEventFinance,isConfiguredHost,readEventPayments,readEventRegistrations,readScopedActivities,buildFollowupReview,validateEventLink,readActivityAudit,summariseClubOperations,readScopedInventory,summarisePeopleInventory,summariseManagementInventory,validateHostVenueMapping,validatePersonAccessLink,communicationReadiness,reviewHostRevocation,activityScheduleConflicts,reviewPersonCommunications,readPersonInventory,refundRecoveryQueue,Response,Date,console});
 const call=async(action,fields={})=>{const response=await handler({method:'POST',json:async()=>({action,...fields})});return {status:response.status,data:await response.json()}};
 return {call,db,reads};
}
test('host roster continues beyond 250 participants with scoped cursor and no private fields',async()=>{
 const h=makeHarness();
 for(let i=2;i<=560;i++)h.db.EventRegistration.push({...h.db.EventRegistration[0],id:'r'+i,full_name:'Player '+i,email:'private'+i+'@example.ie'});
 const first=await h.call('host_roster',{id:'a1'});
 assert.equal(first.status,200);assert.equal(first.data.participants.length,250);
 assert.ok(first.data.nextCursor);
 const second=await h.call('host_roster_page',{id:'a1',cursor:first.data.nextCursor});
 assert.equal(second.status,200);assert.equal(second.data.participants.length,250);
 const third=await h.call('host_roster_page',{id:'a1',cursor:second.data.nextCursor});
 assert.equal(third.status,200);assert.equal(third.data.participants.length,60);
 assert.equal(third.data.nextCursor,null);
 assert.equal(JSON.stringify(second.data).includes('private@example.ie'),false);
 assert.equal(JSON.stringify(second.data).includes('medical_note'),false);
});
test('revoked host cannot continue a previously loaded roster',async()=>{
 const h=makeHarness();h.db.MembershipVenueHostConfig[0].active=false;
 assert.equal((await h.call('host_roster_page',{id:'a1',cursor:'250'})).status,403);
});
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
test('host discovery reads more than 100 activities with cursor paging',async()=>{
 const h=makeHarness();
 for(let i=2;i<303;i++)h.db.ClubActivity.push({...h.db.ClubActivity[0],id:'a'+i});
 const result=await h.call('host_activities');
 assert.equal(result.status,200);assert.equal(result.data.activities.length,302);
 assert.equal(result.data.resultsMayBeTruncated,false);
 assert.equal(h.reads.ClubActivity,2);
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
test('event link requires approved template, authorised host and exact venue match',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 Object.assign(h.db.ClubActivity[0],{status:'draft',capacity:16,registration_mode:'approval',payment_method:'none',host_user_id:'host',communication_template_id:'template1'});
 Object.assign(h.db.Tournament[0],{event_capacity:16,event_fee_amount:0,venue_id:'v1',start_date:'2026-11-04'});
 const first=await h.call('link_event',{id:'a1',eventId:'e1',expectedRevision:1});
 assert.equal(first.status,200);assert.equal(first.data.bridgeStatus,'linked_unverified');
 assert.equal(h.db.ClubActivity[0].revision,2);
 assert.equal(h.db.AuditLog.length,1);
});
test('event link fails closed if approved template or venue ID is missing',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 Object.assign(h.db.ClubActivity[0],{status:'draft',capacity:16,registration_mode:'approval',payment_method:'none',host_user_id:'host',communication_template_id:'template1'});
 Object.assign(h.db.Tournament[0],{event_capacity:16,event_fee_amount:0,start_date:'2026-11-04'});
 const missingVenue=await h.call('link_event',{id:'a1',eventId:'e1',expectedRevision:1});
 assert.equal(missingVenue.status,409);assert.equal(h.db.ClubActivity[0].revision,1);
 h.db.Tournament[0].venue_id='v1';h.db.CommunicationTemplate[0].status='draft';
 const missingTemplate=await h.call('link_event',{id:'a1',eventId:'e1',expectedRevision:1});
 assert.equal(missingTemplate.status,409);assert.equal(h.db.ClubActivity[0].revision,1);
});
test('activity list reads more than 100 drafts without silently truncating',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 for(let i=2;i<=305;i++)h.db.ClubActivity.push({...h.db.ClubActivity[0],id:'a'+i});
 const result=await h.call('list');assert.equal(result.status,200);
 assert.equal(result.data.activities.length,305);assert.equal(result.data.resultsMayBeTruncated,false);
});
test('operations summary is club-scoped, admin-only and read-only',async()=>{
 const admin=makeHarness({...records.User[0],role:'admin'});
 admin.db.ClubActivity.push({...admin.db.ClubActivity[0],id:'outside',club_id:'c2',email:'hidden@example.ie'});
 const result=await admin.call('operations_summary');
 assert.equal(result.status,200);assert.equal(result.data.total,1);
 assert.equal(JSON.stringify(result.data).includes('hidden@example.ie'),false);
 assert.equal(result.data.financialTotalsIncluded,false);
 assert.equal((await makeHarness().call('operations_summary')).status,403);
});
test('event cannot be linked to a second activity within the same club',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 Object.assign(h.db.ClubActivity[0],{status:'draft',capacity:16,registration_mode:'approval',payment_method:'none',host_user_id:'host',communication_template_id:'template1'});
 Object.assign(h.db.Tournament[0],{event_capacity:16,event_fee_amount:0,venue_id:'v1',start_date:'2026-11-04'});
 h.db.ClubActivity.push({...h.db.ClubActivity[0],id:'a2',linked_event_id:'e1'});
 const result=await h.call('link_event',{id:'a1',eventId:'e1',expectedRevision:1});
 assert.equal(result.status,409);assert.match(result.data.error,/already linked/);
 assert.equal(h.db.ClubActivity[0].revision,1);
});
test('People inventory is scoped to the active club and excludes personal details',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.ClubUserAccess.push({id:'access1',tenant_id:'t1',club_id:'c1',status:'active',person_id:'p1',email:'private@example.ie'});
 h.db.ClubUserAccess.push({id:'access2',tenant_id:'t1',club_id:'c2',status:'active'});
 h.db.MembershipApplication.push({id:'app1',tenant_id:'t1',club_id:'c1',status:'submitted',full_name:'Private Person'});
 h.db.MembershipApplication.push({id:'app2',tenant_id:'t2',club_id:'c1',status:'submitted'});
 const response=await h.call('people_summary');
 assert.equal(response.status,200);assert.equal(response.data.access.total,1);assert.equal(response.data.applications.total,1);
 assert.equal(response.data.access.linkedPeople,1);assert.equal(response.data.identityLinksAreExplicit,true);
 assert.equal(JSON.stringify(response.data).includes('private@example.ie'),false);
 assert.equal(JSON.stringify(response.data).includes('Private Person'),false);
 assert.equal((await makeHarness().call('people_summary')).status,403);
});
test('Management inventory filters templates to tenant and club, hides host emails and HTML',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.CommunicationTemplate.push({id:'wrong-club',tenant_id:'t1',club_id:'c2',owner_scope:'tenant',name:'Wrong club',html_template:'SECRET'});
 h.db.CommunicationTemplate.push({id:'wrong-tenant',tenant_id:'t2',club_id:'c1',owner_scope:'tenant',name:'Wrong tenant'});
 h.db.CommunicationTemplate[0].html_template='PRIVATE BODY';
 const response=await h.call('management_summary');
 assert.equal(response.status,200);assert.equal(response.data.templates.length,1);
 assert.equal(response.data.hosts.length,1);assert.equal(response.data.hosts[0].configuredHosts,1);
 assert.equal(JSON.stringify(response.data).includes('host@example.ie'),false);
 assert.equal(JSON.stringify(response.data).includes('PRIVATE BODY'),false);
 assert.equal(response.data.sendingEnabled,false);
 assert.equal((await makeHarness().call('management_summary')).status,403);
});
test('explicit Person link requires review, verified identity and a reason before CAS update',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.ClubUserAccess.push({id:'access1',tenant_id:'t1',club_id:'c1',user_id:'host',status:'active'});
 const review=await h.call('person_link_review',{accessId:'access1',personId:'p1'});
 assert.equal(review.status,200);assert.equal(review.data.mutationPerformed,false);assert.equal(h.db.ClubUserAccess[0].person_id,undefined);
 assert.equal((await h.call('person_link_confirm',{accessId:'access1',personId:'p1',confirmIdentityVerified:true,reason:'short'})).status,400);
 assert.equal((await h.call('person_link_confirm',{accessId:'access1',personId:'p1',reason:'Independently verified'})).status,400);
 const saved=await h.call('person_link_confirm',{accessId:'access1',personId:'p1',confirmIdentityVerified:true,reason:'Membership card checked'});
 assert.equal(saved.status,200);assert.equal(saved.data.mutationPerformed,true);
 assert.equal(h.db.ClubUserAccess[0].person_id,'p1');assert.equal(h.db.AuditLog.length,1);
 const repeat=await h.call('person_link_confirm',{accessId:'access1',personId:'p1',confirmIdentityVerified:true,reason:'Membership card checked'});
 assert.equal(repeat.data.alreadyLinked,true);assert.equal(h.db.AuditLog.length,1);
});
test('Person link rejects cross-tenant Person and conflicting user identity',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.ClubUserAccess.push({id:'access1',tenant_id:'t1',club_id:'c1',user_id:'host',status:'active'});
 h.db.Person.push({id:'p2',tenant_id:'t2',full_name:'Other'});
 assert.equal((await h.call('person_link_review',{accessId:'access1',personId:'p2'})).status,409);
 h.db.Person[0].linked_user_id='another';
 assert.equal((await h.call('person_link_review',{accessId:'access1',personId:'p1'})).status,409);
 assert.equal((await makeHarness().call('person_link_review',{accessId:'access1',personId:'p1'})).status,403);
});
test('host venue mapping requires explicit review and preserves existing host emails',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 const review=await h.call('host_venue_review',{configId:'cfg',venueId:'v1'});
 assert.equal(review.status,200);assert.equal(review.data.configuredHostCount,1);
 assert.equal(review.data.mutationPerformed,false);
 assert.equal((await h.call('host_venue_confirm',{configId:'cfg',venueId:'v1',reason:'Verified venue assignment'})).status,400);
 const saved=await h.call('host_venue_confirm',{configId:'cfg',venueId:'v1',confirmVenueVerified:true,reason:'Verified venue assignment'});
 assert.equal(saved.status,200);assert.equal(h.db.MembershipVenueHostConfig[0].venue_id,'v1');
 assert.deepEqual(h.db.MembershipVenueHostConfig[0].host_emails,['host@example.ie']);
 assert.equal(h.db.AuditLog.length,1);
});
test('host venue mapping fails closed for cross-club or inactive venues and revoked admins',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.Venue.push({id:'v2',tenant_id:'t1',club_id:'c2',status:'active'});
 assert.equal((await h.call('host_venue_review',{configId:'cfg',venueId:'v2'})).status,409);
 h.db.Venue[0].status='inactive';
 assert.equal((await h.call('host_venue_review',{configId:'cfg',venueId:'v1'})).status,409);
 assert.equal((await makeHarness().call('host_venue_review',{configId:'cfg',venueId:'v1'})).status,403);
});
test('Person link cannot claim an identity already linked to another club user',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.ClubUserAccess.push({id:'a',tenant_id:'t1',club_id:'c1',user_id:'host',status:'active'});
 h.db.ClubUserAccess.push({id:'b',tenant_id:'t1',club_id:'c1',user_id:'other',person_id:'p1',status:'active'});
 assert.equal((await h.call('person_link_review',{accessId:'a',personId:'p1'})).status,409);
 assert.equal(h.db.ClubUserAccess[0].person_id,undefined);
});
test('communications readiness is admin-only, tenant and club scoped, and cannot send',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.CommunicationTemplate.push({id:'otherclub',tenant_id:'t1',club_id:'c2',owner_scope:'tenant',purpose:'payment_link',status:'approved',html_template:'PRIVATE OTHER CLUB'});
 h.db.CommunicationTemplate.push({id:'othertenant',tenant_id:'t2',club_id:'c1',owner_scope:'tenant',purpose:'payment_failed',status:'approved'});
 const response=await h.call('communications_readiness');
 assert.equal(response.status,200);assert.equal(response.data.readyPurposeCount,0);
 assert.equal(response.data.authorisedToSend,false);assert.equal(response.data.deliveryEnabled,false);
 assert.equal(JSON.stringify(response.data).includes('PRIVATE OTHER CLUB'),false);
 assert.equal((await makeHarness().call('communications_readiness')).status,403);
});
test('delegated host revocation requires review and explicit confirmation, then denies host access',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 const review=await h.call('host_revoke_review',{configId:'cfg'});
 assert.equal(review.status,200);assert.equal(review.data.affectedHostCount,1);
 assert.equal(h.db.MembershipVenueHostConfig[0].active,true);
 assert.equal((await h.call('host_revoke_confirm',{configId:'cfg',reason:'Verified committee decision'})).status,400);
 const saved=await h.call('host_revoke_confirm',{configId:'cfg',confirmRevocation:true,reason:'Verified committee decision'});
 assert.equal(saved.status,200);assert.equal(saved.data.mutationPerformed,true);
 assert.equal(h.db.MembershipVenueHostConfig[0].active,false);
 assert.equal((await h.call('host_revoke_review',{configId:'cfg'})).status,409);
 assert.equal(h.db.AuditLog[0].action,'ccc.host.revoke');
 const host=makeHarness();host.db.MembershipVenueHostConfig[0].active=false;
 assert.equal((await host.call('host_roster',{id:'a1'})).status,403);
});
test('revocation is scoped and non-admins cannot disable host configurations',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.MembershipVenueHostConfig.push({id:'other',tenant_id:'t1',club_id:'c2',active:true,host_emails:['x@y.ie']});
 assert.equal((await h.call('host_revoke_review',{configId:'other'})).status,409);
 assert.equal((await makeHarness().call('host_revoke_confirm',{configId:'cfg',confirmRevocation:true,reason:'Committee decision confirmed'})).status,403);
});
test('Ready transition rejects an overlapping scheduled activity at the same venue',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 Object.assign(h.db.ClubActivity[0],{status:'draft',starts_at:'2026-11-04T19:00:00Z',ends_at:'2026-11-04T20:30:00Z'});
 h.db.ClubActivity.push({...h.db.ClubActivity[0],id:'conflict',status:'scheduled',revision:1,starts_at:'2026-11-04T20:00:00Z',ends_at:'2026-11-04T21:00:00Z'});
 const result=await h.call('transition',{id:'a1',to:'ready',expectedRevision:1});
 assert.equal(result.status,409);assert.match(result.data.error,/overlapping active activity/);
 assert.equal(h.db.ClubActivity[0].status,'draft');
});
test('Ready transition allows an adjacent session and ignores cancelled activity',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 Object.assign(h.db.ClubActivity[0],{status:'draft',starts_at:'2026-11-04T19:00:00Z',ends_at:'2026-11-04T20:30:00Z'});
 h.db.ClubActivity.push({...h.db.ClubActivity[0],id:'adjacent',status:'scheduled',starts_at:'2026-11-04T20:30:00Z',ends_at:'2026-11-04T21:00:00Z'});
 h.db.ClubActivity.push({...h.db.ClubActivity[0],id:'cancelled',status:'cancelled'});
 const result=await h.call('transition',{id:'a1',to:'ready',expectedRevision:1});
 assert.equal(result.status,200);assert.equal(h.db.ClubActivity[0].status,'ready');
});
test('schedule review returns scoped conflict details without mutating any activity',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.ClubActivity[0].ends_at='2026-11-04T20:30:00Z';
 h.db.ClubActivity.push({...h.db.ClubActivity[0],id:'otherclub',club_id:'c2'});
 const before=JSON.stringify(h.db.ClubActivity);
 const review=await h.call('schedule_review',{draft:{venue_id:'v1',starts_at:'2026-11-04T19:30:00Z',ends_at:'2026-11-04T20:30:00Z'}});
 assert.equal(review.status,200);assert.equal(review.data.ready,false);
 assert.equal(review.data.conflicts.length,1);assert.equal(review.data.conflicts[0].activityId,'a1');
 assert.equal(review.data.mutationPerformed,false);assert.equal(JSON.stringify(h.db.ClubActivity),before);
 assert.equal((await makeHarness().call('schedule_review',{draft:{venue_id:'v1',starts_at:'2026-11-04T19:30:00Z',ends_at:'2026-11-04T20:30:00Z'}})).status,403);
});
test('person communication review requires active linked club identity, stays read-only and never authorises send',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.ClubUserAccess.push({id:'access1',tenant_id:'t1',club_id:'c1',person_id:'p1',status:'active',user_id:'host'});
 h.db.ConsentRecord.push({id:'consent1',tenant_id:'t1',club_id:'c1',person_id:'p1',consent_type:'marketing',status:'accepted',channels:['email'],recorded_at:'2026-10-01',consent_version:'1'});
 h.db.CommunicationSuppression.push({id:'s1',person_id:'p1',owner_scope:'platform',channel:'email',active:true});
 const before=JSON.stringify(h.db);
 const result=await h.call('person_communication_review',{personId:'p1',channel:'email',purpose:'marketing'});
 assert.equal(result.status,200);assert.equal(result.data.sendEligible,false);assert.equal(result.data.personSuppressionCount,1);
 assert.ok(result.data.issues.includes('active_suppression'));
 assert.equal(JSON.stringify(h.db),before);
 assert.equal((await h.call('person_communication_review',{personId:'unknown',channel:'email',purpose:'marketing'})).status,409);
 assert.equal((await makeHarness().call('person_communication_review',{personId:'p1',channel:'email',purpose:'marketing'})).status,403);
});
test('refund recovery queue is scoped, read-only, and flags unresolved refund lock',async()=>{
 const h=makeHarness({...records.User[0],role:'admin'});
 h.db.PaymentRecord.push({id:'p1',tenant_id:'t1',club_id:'c1',payment_status:'refund_pending',amount:20,amount_refunded:0,purpose_type:'event',purpose_id:'r1'});
 h.db.PaymentRecord.push({id:'p2',tenant_id:'t1',club_id:'c2',payment_status:'refund_pending',amount:20,amount_refunded:0});
 const before=JSON.stringify(h.db);
 const result=await h.call('refund_recovery_queue');
 assert.equal(result.status,200);assert.equal(result.data.caseCount,1);
 assert.equal(result.data.cases[0].paymentRecordId,'p1');assert.equal(result.data.authorisedToRetry,false);
 assert.equal(JSON.stringify(h.db),before);
 assert.equal((await makeHarness().call('refund_recovery_queue')).status,403);
});
