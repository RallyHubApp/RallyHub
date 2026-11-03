/** Fast public availability read; final booking still requires full roster and atomic capacity claim. */
export async function countActiveEventRegistrations(entity,{eventId,tenantId,clubId,now=new Date().toISOString()}){
 if(!eventId||!tenantId||!clubId)throw Error('Availability scope required');
 if(typeof entity.count!=='function')throw Error('Availability count unavailable');
 const scope={event_id:eventId,tenant_id:tenantId,club_id:clubId};
 // Base44 entity SDK does not reliably expose count(). Use bounded scoped rows
 // for the public event window; never report an unverified remaining capacity.
 const rows=await entity.filter(scope,'-created_date',500);
 if(!Array.isArray(rows))throw Error('Availability SDK response unavailable');
 if(rows.length>=500)throw Error('Availability exceeds safe SDK row limit');
 let active=0,holds=0;
 for(const row of rows){
  if(!row?.id||row.event_id!==eventId||row.tenant_id!==tenantId||row.club_id!==clubId)throw Error('Availability scope violation');
  if(['pending_approval','confirmed','cash_confirmed'].includes(row.registration_status))active++;
  if(row.registration_status==='approved_payment_hold'&&String(row.payment_hold_expires_at||'')>now)holds++;
 }

 return active+holds;
}
