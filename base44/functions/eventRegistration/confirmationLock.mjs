/** Claim confirmation exactly once after verified provider payment. */
export async function claimPaidEventConfirmation(entity,{registration,tenantId,clubId,eventId,paymentId,transactionId,now=new Date().toISOString()}={}){
 if(!registration?.id||!tenantId||!clubId||!eventId||!paymentId||!transactionId||registration.event_id!==eventId||registration.tenant_id!==tenantId||registration.club_id!==clubId)return false;
 if(registration.registration_status!=='approved_payment_hold')return false;
 const result=await entity.updateMany({id:registration.id,tenant_id:tenantId,club_id:clubId,event_id:eventId,registration_status:'approved_payment_hold'},{$set:{registration_status:'confirmed',payment_status:'paid',payment_record_id:paymentId,payment_transaction_id:transactionId,confirmed_at:now}});
 return result?.updated===1;
}
