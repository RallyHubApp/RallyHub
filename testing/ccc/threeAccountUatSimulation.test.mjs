import test from 'node:test';
import assert from 'node:assert/strict';
import {readCccAccess} from '../../base44/functions/cccActivity/accessGate.mjs';
import {requireEventAdminGrant} from '../../base44/functions/eventRegistration/adminAccess.mjs';

const tenantId='6ae7160dd5b86620c9516200',clubId='6ae7161061e735ba0e0c343b';
const event={id:'synthetic-event',tenant_id:tenantId,host_club_id:clubId};
const identities=[
 {email:'brian.moore007@gmail.com',id:'uat-brian',role:'super_admin',tenantRole:'owner',clubBundle:'club_admin',admin:true},
 {email:'marievcmoore@gmail.com',id:'uat-marie',role:'club_admin',tenantRole:null,clubBundle:'club_admin',admin:true},
 {email:'roisintennis@gmail.com',id:'uat-roisin',role:'member',tenantRole:null,clubBundle:'member',admin:false}
];
function session(identity,{club=clubId,approval='approved',clubStatus='active',tenantStatus='active',expiresAt}={}){
 const user={id:identity.id,email:identity.email,role:identity.role,active_tenant_id:tenantId,active_club_id:club,approval_status:approval};
 const tenantGrants=identity.tenantRole?[{user_id:identity.id,tenant_id:tenantId,role:identity.tenantRole,status:tenantStatus,ends_at:expiresAt}]:[];
 const clubGrants=[{user_id:identity.id,tenant_id:tenantId,club_id:clubId,permission_bundle:identity.clubBundle,status:clubStatus,ends_at:expiresAt}];
 const sdk={asServiceRole:{entities:{TenantUserAccess:{filter:async()=>tenantGrants},ClubUserAccess:{filter:async()=>clubGrants}}}};
 return {user,sdk};
}
for(const identity of identities){
 test(`simulated account: ${identity.email} sees only its authorised CCC and event administration`,async()=>{
  const {user,sdk}=session(identity);
  const ccc=await readCccAccess(sdk,user,tenantId,clubId);
  const eventAllowed=await requireEventAdminGrant(sdk,user,event);
  assert.equal(ccc.admin,identity.admin);
  assert.equal(ccc.member,true);
  assert.equal(eventAllowed,identity.admin);
  assert.equal(ccc.admin,eventAllowed,'CCC and booking administration must agree');
 });
 test(`simulated account: ${identity.email} cannot escalate by changing active club`,async()=>{
  const {user,sdk}=session(identity,{club:'another-club'});
  const ccc=await readCccAccess(sdk,user,tenantId,clubId);
  assert.equal(ccc.admin,false);assert.equal(ccc.member,false);
  assert.equal(await requireEventAdminGrant(sdk,user,event),false);
 });
 test(`simulated account: ${identity.email} loses access when club grant suspended`,async()=>{
  const {user,sdk}=session(identity,{clubStatus:'suspended'});
  const ccc=await readCccAccess(sdk,user,tenantId,clubId);
  assert.equal(ccc.admin,false);assert.equal(ccc.member,false);
  assert.equal(await requireEventAdminGrant(sdk,user,event),false);
 });
 test(`simulated account: ${identity.email} cannot access as unapproved identity`,async()=>{
  const {user,sdk}=session(identity,{approval:'pending'});
  assert.equal((await readCccAccess(sdk,user,tenantId,clubId)).admin,false);
  assert.equal(await requireEventAdminGrant(sdk,user,event),false);
 });
 test(`simulated account: ${identity.email} cannot use expired grants`,async()=>{
  const {user,sdk}=session(identity,{expiresAt:'2025-01-01T00:00:00Z'});
  assert.equal((await readCccAccess(sdk,user,tenantId,clubId)).admin,false);
  assert.equal(await requireEventAdminGrant(sdk,user,event),false);
 });
}
