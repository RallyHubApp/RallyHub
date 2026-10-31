/** Event administration is authorised by explicit active tenant/club grants, not User.role. */
const active=(g,now)=>g?.status==='active'&&(!g.starts_at||Date.parse(g.starts_at)<=now)&&(!g.ends_at||Date.parse(g.ends_at)>now);
export function eventAdminGrant(user,event,tenantGrants=[],clubGrants=[],now=Date.now()){
 if(!user?.id||!event?.tenant_id||!event?.host_club_id||user.active_tenant_id!==event.tenant_id||user.active_club_id!==event.host_club_id)return false;
 if(user.approval_status&&user.approval_status!=='approved')return false;
 const scoped=clubGrants.filter(g=>g.user_id===user.id&&g.tenant_id===event.tenant_id&&g.club_id===event.host_club_id);
 if(scoped.some(g=>['revoked','suspended'].includes(g.status)))return false;
 return tenantGrants.some(g=>g.user_id===user.id&&g.tenant_id===event.tenant_id&&['owner','admin'].includes(g.role)&&active(g,now))||
 scoped.some(g=>g.permission_bundle==='club_admin'&&active(g,now));
}
export async function requireEventAdminGrant(sdk,user,event){
 if(!user?.id)return false;
 const [tenantGrants,clubGrants]=await Promise.all([
  sdk.asServiceRole.entities.TenantUserAccess.filter({tenant_id:event.tenant_id,user_id:user.id},'-created_date',100),
  sdk.asServiceRole.entities.ClubUserAccess.filter({tenant_id:event.tenant_id,club_id:event.host_club_id,user_id:user.id},'-created_date',100)
 ]);
 if(!Array.isArray(tenantGrants)||!Array.isArray(clubGrants)||tenantGrants.length>=100||clubGrants.length>=100)throw Error('Event administration grant inventory incomplete');
 return eventAdminGrant(user,event,tenantGrants,clubGrants);
}
