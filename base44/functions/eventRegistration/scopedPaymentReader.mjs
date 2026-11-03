/** Read payment records per registration with the SDK's supported positional filter contract. */
export async function readAdminEventPayments(entity,{tenantId,clubId,registrationIds}){
 const ids=[...new Set((registrationIds||[]).filter(Boolean))],payments=[],seen=new Set();
 for(const id of ids){
  const query={tenant_id:tenantId,club_id:clubId,purpose_type:'event',purpose_id:id};
  const rows=await entity.filter(query,'-created_date',500);
  if(!Array.isArray(rows)||rows.length>=500)throw Error('Event payment verification incomplete');
  for(const p of rows){
   if(!p?.id||p.tenant_id!==tenantId||p.club_id!==clubId||p.purpose_type!=='event'||p.purpose_id!==id)throw Error('Event payment scope violation');
   if(!seen.has(p.id)){seen.add(p.id);payments.push(p)}
  }
 }
 return payments;
}
