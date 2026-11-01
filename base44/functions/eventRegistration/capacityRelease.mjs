/** Release one place only when the counter still matches the verified pre-mutation roster. */
export async function releaseEventPlace(entity,{eventId,tenantId,expectedOccupied}){
 if(!eventId||!tenantId||!Number.isSafeInteger(expectedOccupied)||expectedOccupied<1)return {released:false,requiresReconciliation:true,reason:'invalid_observed_occupancy'};
 try{
  const result=await entity.updateMany({id:eventId,tenant_id:tenantId,event_reserved_count:expectedOccupied},{$inc:{event_reserved_count:-1}});
  if(result?.updated===1)return {released:true,requiresReconciliation:false};
  return {released:false,requiresReconciliation:true,reason:'concurrent_capacity_change'};
 }catch(error){return {released:false,requiresReconciliation:true,reason:'capacity_write_uncertain'};}
}
