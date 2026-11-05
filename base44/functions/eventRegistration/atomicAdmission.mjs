import {occupied,duplicate} from './rules.js';
/** Hold the event lease until registration is durably readable. */
export async function admitAtomically({tournaments,registrations,eventId,tenantId,capacity,email,operationId,create,read,now=()=>Date.now()}){
 const stamp=new Date(now()).toISOString(), leaseUntil=new Date(now()+120000).toISOString();
 const lock=await tournaments.updateMany({id:eventId,tenant_id:tenantId,$or:[{event_payment_confirmation_lease:null},{event_payment_confirmation_lease:{$lt:stamp}}]},{$set:{event_payment_confirmation_lease:leaseUntil}});
 if(lock?.updated!==1)return {kind:'busy'};
 try{
  const rows=await read();
  if(rows.some(r=>r.operation_id===operationId))return {kind:'existing'};
  if(duplicate(rows,email))return {kind:'duplicate'};
  const accepted=occupied(rows,now())<capacity;
  const saved=await create(accepted);
  if(!saved?.id)throw Error('Registration not saved');
  const verified=await registrations.get(saved.id);
  if(!verified||verified.operation_id!==operationId)throw Error('Registration persistence verification failed');
  return {kind:'created',accepted,saved,verified};
 }finally{await tournaments.updateMany({id:eventId,tenant_id:tenantId,event_payment_confirmation_lease:leaseUntil},{$set:{event_payment_confirmation_lease:null}});}
}
