import test from 'node:test';
import assert from 'node:assert/strict';
import {eventAdminGrant,requireEventAdminGrant} from '../../base44/functions/eventRegistration/adminAccess.mjs';
const user={id:'u1',role:'admin',active_tenant_id:'t1',active_club_id:'c1'};
const event={tenant_id:'t1',host_club_id:'c1'};
const tenant={user_id:'u1',tenant_id:'t1',role:'owner',status:'active'};
const club={user_id:'u1',tenant_id:'t1',club_id:'c1',permission_bundle:'club_admin',status:'active'};
test('profile role alone never grants event administration',()=>{assert.equal(eventAdminGrant(user,event),false)});
test('active tenant or club grants allow administration',()=>{
 assert.equal(eventAdminGrant(user,event,[tenant]),true);
 assert.equal(eventAdminGrant(user,event,[],[club]),true);
});
test('club suspension overrides tenant grant, and scope cannot be switched',()=>{
 assert.equal(eventAdminGrant(user,event,[tenant],[{...club,status:'suspended'}]),false);
 assert.equal(eventAdminGrant({...user,active_club_id:'c2'},event,[tenant]),false);
 assert.equal(eventAdminGrant(user,{...event,tenant_id:'t2'},[tenant]),false);
});
test('expired grants and unapproved users fail closed',()=>{
 assert.equal(eventAdminGrant(user,event,[{...tenant,ends_at:'2026-01-01T00:00:00Z'}],[],Date.parse('2026-11-01')),false);
 assert.equal(eventAdminGrant({...user,approval_status:'pending'},event,[tenant]),false);
});
test('incomplete grant inventory throws rather than granting access',async()=>{
 const sdk={asServiceRole:{entities:{TenantUserAccess:{filter:async()=>Array.from({length:100},()=>tenant)},ClubUserAccess:{filter:async()=>[]}}}};
 await assert.rejects(()=>requireEventAdminGrant(sdk,user,event),/incomplete/);
});
