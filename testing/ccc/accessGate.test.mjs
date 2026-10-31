import test from 'node:test';
import assert from 'node:assert/strict';
import {cccAccessDecision,readCccAccess} from '../../base44/functions/cccActivity/accessGate.mjs';
const user={id:'u1',active_tenant_id:'t1',active_club_id:'c1',approval_status:'approved',role:'admin'};
const scope={user,tenantId:'t1',clubId:'c1'};
const tenant={user_id:'u1',tenant_id:'t1',role:'admin',status:'active'};
const club={user_id:'u1',tenant_id:'t1',club_id:'c1',permission_bundle:'club_admin',status:'active'};
test('platform role or active context alone never grants club admin',()=>{
 assert.equal(cccAccessDecision(scope).admin,false);
 assert.equal(cccAccessDecision({...scope,user:{...user,active_club_role:'club_admin'}}).admin,false);
});
test('active tenant or club grant permits admin, expired and revoked deny',()=>{
 assert.equal(cccAccessDecision({...scope,tenantGrants:[tenant]}).admin,true);
 assert.equal(cccAccessDecision({...scope,clubGrants:[club]}).admin,true);
 assert.equal(cccAccessDecision({...scope,tenantGrants:[{...tenant,status:'revoked'}]}).admin,false);
 assert.equal(cccAccessDecision({...scope,clubGrants:[{...club,ends_at:'2026-01-01T00:00:00Z'}],now:Date.parse('2026-11-01')}).admin,false);
});
test('suspended club overrides tenant grant; wrong tenant and unapproved users deny',()=>{
 assert.equal(cccAccessDecision({...scope,tenantGrants:[tenant],clubGrants:[{...club,status:'suspended'}]}).admin,false);
 assert.equal(cccAccessDecision({...scope,user:{...user,approval_status:'pending'},tenantGrants:[tenant]}).admin,false);
 assert.equal(cccAccessDecision({...scope,tenantId:'t2',tenantGrants:[tenant]}).admin,false);
});
test('readCccAccess refuses truncated grants',async()=>{
 const sdk={asServiceRole:{entities:{TenantUserAccess:{filter:async()=>Array.from({length:100},(_,i)=>({...tenant,id:String(i)}))},ClubUserAccess:{filter:async()=>[]}}}};
 await assert.rejects(()=>readCccAccess(sdk,user,'t1','c1'),/incomplete/);
});
test('live legacy admin User may omit approval_status but must have an active grant',()=>{
 const legacy={...user};delete legacy.approval_status;
 assert.equal(cccAccessDecision({...scope,user:legacy,tenantGrants:[tenant]}).admin,true);
 assert.equal(cccAccessDecision({...scope,user:legacy}).admin,false);
});
