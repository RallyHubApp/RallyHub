/** Read-only operational readiness signals; avoid conflating unknown with healthy. */
export function operationalHealth({tenantId,clubId,checks=[]}={}){
 if(!tenantId||!clubId)return {status:'unknown',checks:[],issues:['scope_required']};
 const scoped=(Array.isArray(checks)?checks:[]).filter(c=>c?.tenant_id===tenantId&&c?.club_id===clubId&&c?.id);
 const issues=scoped.filter(c=>c.status==='failed').map(c=>c.id);
 const unknown=scoped.filter(c=>!['passed','failed'].includes(c.status)).map(c=>c.id);
 return {status:issues.length?'attention':unknown.length||!scoped.length?'unknown':'healthy',checks:scoped.map(c=>({id:c.id,status:c.status,checkedAt:c.checked_at||null})),issues,unknown};
}
