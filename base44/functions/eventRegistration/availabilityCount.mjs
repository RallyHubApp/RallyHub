/** Fast public availability read; final booking still requires full roster and atomic capacity claim. */
export async function countActiveEventRegistrations(entity,{eventId,tenantId,clubId,now=new Date().toISOString()}){
 if(!eventId||!tenantId||!clubId)throw Error('Availability scope required');
 if(typeof entity.count!=='function')throw Error('Availability count unavailable');
 const scope={event_id:eventId,tenant_id:tenantId,club_id:clubId};
 const [active,holds]=await Promise.all([
  entity.count({...scope,registration_status:{$in:['pending_approval','confirmed','cash_confirmed']}}),
  entity.count({...scope,registration_status:'approved_payment_hold',payment_hold_expires_at:{$gt:now}})
 ]);
 if(!Number.isSafeInteger(active)||active<0||!Number.isSafeInteger(holds)||holds<0)throw Error('Availability count invalid');
 return active+holds;
}
