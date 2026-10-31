import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const page=read('../../src/pages/ClubCommandCentre.jsx'),routes=read('../../src/App.jsx'),sidebar=read('../../src/components/layout/Sidebar.jsx');
test('native Command Centre has an authenticated app route and sidebar entry',()=>{
 assert.match(routes,/path="club-command-centre" element=\{<ClubCommandCentre \/>\}/);
 assert.match(sidebar,/path: '\/app\/club-command-centre'/);
});
test('four distinct workspaces preserve authoritative existing journeys',()=>{
 for(const section of ['people','activities','operations','management'])assert.match(page,new RegExp("id:'"+section+"'"));
 for(const path of ['/app/membership','/app/guest-bookings','/app/events','/app/finance','/app/communications'])assert.ok(page.includes(path));
 assert.match(page,/ClubActivityPlanner/);assert.match(page,/ClubHostWorkspace/);assert.match(page,/ClubOperationsBoard/);
});
test('member accounts cannot access CCC and club admins cannot use admin-only planning',()=>{
 assert.match(page,/if\(!permitted\)return/);
 assert.match(page,/active==='activities'&&admin&&<ClubActivityPlanner/);
 assert.match(page,/active==='operations'&&<><ClubHostWorkspace/);
 assert.match(page,/tenantId=user\?\.active_tenant_id,clubId=user\?\.active_club_id/);
});
test('navigation does not create a second booking or payment implementation',()=>{
 assert.doesNotMatch(page,/PaymentRecord\.create|EventRegistration\.create|sendEmail|checkout\.create/);
 assert.match(page,/no automatic contact-based merges are performed/);
});
