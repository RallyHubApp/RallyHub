/** Single tenant/club scoped payment read for the event roster.
 * Avoid one network call per registration (N+1), which previously made the
 * live roster and dashboard counter vulnerable to SDK request throttling.
 * Fail closed on incomplete results or mismatched payment scope.
 */
export async function readAdminEventPayments(entity,{tenantId,clubId,registrationIds}){
 const ids=new Set((registrationIds||[]).filter(Boolean));
 if(!tenantId||!clubId)throw Error('Event payment scope required');
 if(!ids.size)return [];
 const rows=await entity.filter({tenant_id:tenantId,club_id:clubId,purpose_type:'event'},'-created_date',500);
 if(!Array.isArray(rows)||rows.length>=500)throw Error('Event payment verification incomplete: scoped record limit reached');
 const payments=[],seen=new Set();
 for(const p of rows){
  if(!p?.id||p.tenant_id!==tenantId||p.club_id!==clubId||p.purpose_type!=='event'||!p.purpose_id)throw Error('Event payment scope violation');
  if(ids.has(p.purpose_id)&&!seen.has(p.id)){seen.add(p.id);payments.push(p)}
 }
 return payments;
}
