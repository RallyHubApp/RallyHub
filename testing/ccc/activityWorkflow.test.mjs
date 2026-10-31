import test from 'node:test';import assert from 'node:assert/strict';
import {planActivityDraft,planActivityTransition} from '../../src/lib/ccc/activityWorkflow.js';
const activity={id:'a1',tenant_id:'t1',club_id:'c1',sport:'pickleball',type:'clinic',title:'Training',venue_id:'v1',starts_at:'2026-11-10T18:00:00Z',ends_at:'2026-11-10T19:30:00Z',capacity:16,status:'scheduled',revision:3};
const scope={tenant_id:'t1',club_id:'c1'};
const venue={id:'v1',tenant_id:'t1',club_id:'c1'};
const host={id:'h1'};
const ready={venue,host,registrationMode:'approval',paymentMethod:'cash',approvedTemplate:{id:'tpl1'}};
test('activity draft preflight validates tenant, club, venue and capacity',()=>{
 assert.equal(planActivityDraft({activity,scope,venue}).valid,true);
 assert.ok(planActivityDraft({activity:{...activity,capacity:0},scope,venue}).issues.includes('capacity_invalid'));
 assert.ok(planActivityDraft({activity,scope,venue:{...venue,club_id:'other'}}).issues.includes('venue_club_mismatch'));
});
test('opening registration requires complete readiness and expected revision',()=>{
 const result=planActivityTransition({activity,to:'registration_open',scope,expectedRevision:3,...ready});
 assert.equal(result.allowed,true);
 assert.deepEqual(result.next,{id:'a1',from:'scheduled',to:'registration_open',revision:3});
 assert.ok(planActivityTransition({activity,to:'registration_open',scope,expectedRevision:2,...ready}).issues.includes('stale_revision'));
});
test('registration cannot open without approved communication template',()=>{
 const result=planActivityTransition({activity,to:'registration_open',scope,...ready,approvedTemplate:null});
 assert.equal(result.allowed,false);
 assert.ok(result.issues.includes('approved_communication_template_required'));
});
test('cross-tenant and cross-club transitions fail closed',()=>{
 assert.deepEqual(planActivityTransition({activity,to:'registration_open',scope:{tenant_id:'other',club_id:'c1'},...ready}).issues,['scope_denied']);
 assert.deepEqual(planActivityTransition({activity,to:'registration_open',scope:{tenant_id:'t1',club_id:'other'},...ready}).issues,['scope_denied']);
});
test('illegal lifecycle skips and unsupported activity types are rejected',()=>{
 assert.ok(planActivityTransition({activity,to:'completed',scope}).issues.includes('invalid_transition'));
 assert.ok(planActivityTransition({activity:{...activity,type:'unknown'},to:'registration_open',scope,...ready}).issues.includes('unsupported_activity_type'));
});
test('draft scope and venue mismatches cannot be saved as valid plans',()=>{
 const result=planActivityDraft({activity,scope,venue:{...venue,id:'v2'}});
 assert.equal(result.valid,false);
 assert.ok(result.issues.includes('venue_id_mismatch'));
});
