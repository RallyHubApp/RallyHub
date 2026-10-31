/** Authoritative CCC grants. Active UI context is only a selector, never an authorisation grant. */
const inWindow=(record,now)=>{const start=record?.starts_at?Date.parse(record.starts_at):null,end=record?.ends_at?Date.parse(record.ends_at):null;return (start===null||Number.isFinite(start)&&start<=now)&&(end===null||Number.isFinite(end)&&end>now)};
export function cccAccessDecision({user,tenantId,clubId,tenantGrants=[],clubGrants=[],now=Date.now()}={}){
 const deny=(reason)=>({admin:false,member:false,reason});
 if(!user?.id||!tenantId||!clubId||user.active_tenant_id!==tenantId||user.active_club_id!==clubId)return deny('context_mismatch');
 if(user.approval_status&&user.approval_status!=='approved')return deny('user_not_approved');
 const tenant=tenantGrants.some(g=>g?.user_id===user.id&&g.tenant_id===tenantId&&g.status==='active'&&['owner','admin'].includes(g.role)&&inWindow(g,now));
 const club=clubGrants.some(g=>g?.user_id===user.id&&g.tenant_id===tenantId&&g.club_id===clubId&&g.status==='active'&&inWindow(g,now));
 const clubAdmin=clubGrants.some(g=>g?.user_id===user.id&&g.tenant_id===tenantId&&g.club_id===clubId&&g.status==='active'&&g.permission_bundle==='club_admin'&&inWindow(g,now));
 // Tenant grant must not override an explicitly revoked/suspended club record.
 const blocked=clubGrants.some(g=>g?.user_id===user.id&&g.tenant_id===tenantId&&g.club_id===clubId&&['suspended','revoked'].includes(g.status));
 if(blocked)return deny('club_access_blocked');
 return {admin:tenant||clubAdmin,member:tenant||club,reason:tenant||club?'authorised':'no_active_grant'};
}
export async function readCccAccess(sdk,user,tenantId,clubId){
 if(!user?.id||!tenantId||!clubId)return cccAccessDecision({user,tenantId,clubId});
 const [tenantGrants,clubGrants]=await Promise.all([
  sdk.asServiceRole.entities.TenantUserAccess.filter({tenant_id:tenantId,user_id:user.id},'-created_date',100),
  sdk.asServiceRole.entities.ClubUserAccess.filter({tenant_id:tenantId,club_id:clubId,user_id:user.id},'-created_date',100)
 ]);
 if(!Array.isArray(tenantGrants)||!Array.isArray(clubGrants)||tenantGrants.length===100||clubGrants.length===100)throw Error('Access grant review incomplete');
 return cccAccessDecision({user,tenantId,clubId,tenantGrants,clubGrants});
}
