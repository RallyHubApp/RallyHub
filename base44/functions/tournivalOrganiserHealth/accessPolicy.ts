/** Require explicit active scoped club administrator access; platform admins need the same club grant. */
export function canReviewTournivalHealth(user:any,grants:any,tenantId:string,clubId:string,now=Date.now()){
 if(!user?.id||!tenantId||!clubId||!Array.isArray(grants))return false;
 return grants.some((grant:any)=>grant?.tenant_id===tenantId&&grant?.club_id===clubId&&grant?.user_id===user.id&&
  grant?.status==='active'&&grant?.permission_bundle==='club_admin'&&
  (!grant.starts_at||(Number.isFinite(Date.parse(grant.starts_at))&&Date.parse(grant.starts_at)<=now))&&
  (!grant.ends_at||(Number.isFinite(Date.parse(grant.ends_at))&&Date.parse(grant.ends_at)>=now)));
}
