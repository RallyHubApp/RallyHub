/** F10: Explicit centre finance delegation; never infer finance access from host/member status. */
const within=(g,now)=>{const start=g.starts_at?Date.parse(g.starts_at):null,end=g.ends_at?Date.parse(g.ends_at):null;return(start===null||Number.isFinite(start)&&start<=now)&&(end===null||Number.isFinite(end)&&end>now)};
export function financeCentreAccess({user,tenantId,clubId,centreId,grants=[],now=Date.now()}={}){
 if(!user?.id||!tenantId||!clubId||!centreId||user.active_tenant_id!==tenantId||user.active_club_id!==clubId||user.approval_status!=='approved')return false;
 if(grants.some(g=>g.user_id===user.id&&g.tenant_id===tenantId&&g.club_id===clubId&&g.centre_id===centreId&&['revoked','suspended'].includes(g.status)))return false;
 return grants.some(g=>g.user_id===user.id&&g.tenant_id===tenantId&&g.club_id===clubId&&g.centre_id===centreId&&g.status==='active'&&g.permission==='finance_read'&&g.approved_by_user_id&&g.approved_at&&within(g,now));
}
export function scopedFinanceEvidence(finance,centreId){
 if(!finance?.complete||!centreId)throw Error('Complete centre finance evidence required');
 return {...finance,centres:finance.centres.filter(c=>c.centreId===centreId),issues:[],issuesWithheldForCentreScope:true,refundReconciliation:null,financeAudit:{entries:[],complete:false,centreFilterSupported:false},financeAccess:{scope:'centre_finance_read',centreId,centreDelegationVerified:true},readOnly:true};
}
