import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const backend=read('../../base44/functions/cccActivity/entry.ts');
const workspace=read('../../src/components/ccc/ClubHostWorkspace.jsx');
const dashboard=read('../../src/pages/Dashboard.jsx');
const planner=read('../../src/components/ccc/ClubActivityPlanner.jsx');
test('delegated host must be approved and venue-scoped',()=>{
 assert.match(backend,/const isClubHost=async/);
 assert.match(backend,/MembershipVenueHostConfig\.filter\(\{tenant_id,club_id,active:true\}/);
 assert.match(backend,/active_tenant_id:tenant_id,active_club_id:club_id,approval_status:'approved'/);
 assert.match(backend,/norm\(c\.venue_key\)===norm\(venue\.name\)/);
 assert.match(backend,/user\.approval_status!=='approved'/);
});
test('non-admins can only use explicitly authorised host actions',()=>{
 assert.match(backend,/user\.role!=='admin'&&!hostAction/);
 assert.match(backend,/host_activities/);
 assert.match(backend,/host_roster/);
 assert.match(backend,/host_checkin/);
 assert.match(backend,/if\(!\['confirmed','cash_confirmed'\]\.includes\(r\.registration_status\)\)/);
 assert.match(backend,/attendance_revision:prior/);
});
test('host roster excludes contact, payment, health and consent fields',()=>{
 const section=backend.slice(backend.indexOf("if(body.action==='host_roster')"),backend.indexOf("if(!['scheduled'"));
 assert.match(section,/name:r\.full_name/);
 assert.doesNotMatch(section,/email:r\.email|mobile:r\.mobile|medical_note|payment_status|consent_evidence/);
 assert.match(workspace,/No payment, approval or customer messaging controls/);
 assert.match(dashboard,/ClubHostWorkspace/);
});
test('planner host options follow selected venue',()=>{
 assert.match(planner,/venueId:form\.venue_id/);
 assert.match(planner,/setHostId\(''\)/);
 assert.match(planner,/delegated host/);
});
