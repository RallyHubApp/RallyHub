import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {newActivityDraft,normaliseActivityForm,activityWizardReview,ACTIVITY_STEPS} from '../../src/lib/ccc/activityWizard.js';
const scope={tenant_id:'t',club_id:'c'};
const form={...newActivityDraft({tenantId:'t',clubId:'c'}),type:'clinic',title:'Coaching',sport:'pickleball',venue_id:'v',starts_at:'2026-11-10T19:00',ends_at:'2026-11-10T20:30',capacity:12};
const venue={id:'v',tenant_id:'t',club_id:'c'},host={id:'h'};
const base={form,scope,venue,host,registrationMode:'approval',paymentMethod:'none',approvedTemplate:{id:'tpl'}};
test('planner contains all four sequential review steps',()=>assert.deepEqual(ACTIVITY_STEPS,['basics','schedule','registration','review']));
test('planner normalises tenant scope from active context rather than editable form',()=>{
 const result=normaliseActivityForm({...form,tenant_id:'other',club_id:'other'},scope);
 assert.equal(result.tenant_id,'t');assert.equal(result.club_id,'c');
});
test('valid activity passes draft and registration readiness preflights',()=>{
 const result=activityWizardReview(base);
 assert.equal(result.valid,true);assert.equal(result.registrationReady,true);
});
test('missing template blocks registration, not draft planning',()=>{
 const result=activityWizardReview({...base,approvedTemplate:null});
 assert.equal(result.valid,true);assert.equal(result.registrationReady,false);
 assert.ok(result.registrationIssues.includes('approved_communication_template_required'));
});
test('venue mismatch, missing host and invalid dates are surfaced',()=>{
 const mismatch=activityWizardReview({...base,venue:{...venue,club_id:'other'}});
 assert.equal(mismatch.valid,false);
 assert.ok(mismatch.issues.includes('venue_club_mismatch'));
 assert.ok(activityWizardReview({...base,host:null}).issues.includes('host_required'));
 assert.ok(activityWizardReview({...base,form:{...form,ends_at:'2026-11-10T18:00'}}).issues.includes('time_invalid'));
});
test('invalid capacity and unsupported registration modes fail closed',()=>{
 assert.ok(activityWizardReview({...base,form:{...form,capacity:0}}).issues.includes('capacity_invalid'));
 assert.ok(activityWizardReview({...base,registrationMode:'public_anyone'}).issues.includes('registration_mode_required'));
});
test('planner UI is admin gated, scoped by club key, and saves drafts only through backend',()=>{
 const dashboard=readFileSync(new URL('../../src/pages/Dashboard.jsx',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../../src/components/ccc/ClubActivityPlanner.jsx',import.meta.url),'utf8');
 assert.match(dashboard,/currentUser\?\.role === 'admin' && <ClubActivityPlanner/);
 assert.match(dashboard,/key=\{\x60\$\{currentUser\?\.active_tenant_id/);
 assert.match(ui,/Draft only · No publication or messages/);
 assert.match(ui,/base44\.functions\.invoke\('cccActivity'/);
 assert.match(ui,/action:'save_draft'/);
 assert.doesNotMatch(ui,/action:'activate'|action:'publish'/);
});
