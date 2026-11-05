/** Serialise paid confirmations per event using an atomic, expiring tournament lease. */
export async function confirmWithinCapacity({tournaments,registrations,eventId,tenantId,clubId,registration,paymentId,transactionId,claim,now=Date.now()}){
 if(!eventId||!tenantId||!clubId||!registration?.id||!paymentId||!transactionId)return {confirmed:false,reason:'invalid_scope'};
 const leaseUntil=new Date(now+120000).toISOString(),stamp=new Date(now).toISOString();
 const lock=await tournaments.updateMany({id:eventId,tenant_id:tenantId,$or:[{event_payment_confirmation_lease:null},{event_payment_confirmation_lease:{$lt:stamp}}]},{$set:{event_payment_confirmation_lease:leaseUntil}});
 if(lock?.updated!==1)return {confirmed:false,reason:'confirmation_busy'};
 try{
  const event=(await tournaments.filter({id:eventId,tenant_id:tenantId},'-created_date',1))?.[0];
  const capacity=Number(event?.event_capacity);
  if(!Number.isSafeInteger(capacity)||capacity<1)return {confirmed:false,reason:'invalid_capacity'};
  const rows=await registrations.filter({event_id:eventId,tenant_id:tenantId,club_id:clubId},'-created_date',500);
  if(!Array.isArray(rows)||rows.length>=500)return {confirmed:false,reason:'roster_incomplete'};
  const confirmed=rows.filter(r=>['confirmed','cash_confirmed'].includes(r.registration_status));
  if(confirmed.length>=capacity)return {confirmed:false,reason:'capacity_full'};
  const current=rows.find(r=>r.id===registration.id);
  if(!current||current.registration_status!=='approved_payment_hold'||current.payment_status!=='pending'||current.payment_checkout_id!==registration.payment_checkout_id)return {confirmed:false,reason:'registration_changed'};
  const success=await claim(registrations,{registration:current,tenantId,clubId,eventId,paymentId,transactionId});
  return {confirmed:!!success,reason:success?'confirmed':'confirmation_changed'};
 }finally{
  await tournaments.updateMany({id:eventId,tenant_id:tenantId,event_payment_confirmation_lease:leaseUntil},{$set:{event_payment_confirmation_lease:null}});
 }
}