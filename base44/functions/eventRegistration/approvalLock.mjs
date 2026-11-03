/** Durable CAS: only one approval may transition the same scoped pending application. */
export async function acquireEventApprovalLock(entity,{registration,eventId,tenantId,clubId}){
 if(!registration?.id||!eventId||!tenantId||!clubId||registration.registration_status!=='pending_approval')return false;
 const result=await entity.updateMany({id:registration.id,event_id:eventId,tenant_id:tenantId,club_id:clubId,registration_status:'pending_approval',payment_status:registration.payment_status||'not_required'},{$set:{payment_status:'approval_processing'}});
 return result?.updated===1;
}
