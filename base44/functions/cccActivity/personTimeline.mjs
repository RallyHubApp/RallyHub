/** Read-only, explicit Person-ID-only club CRM timeline; never infer identity from email/phone. */
const types={EventRegistration:'event_booking',GuestSessionBooking:'guest_booking',MembershipApplication:'membership_application',ClubMembership:'membership',PaymentRecord:'payment',ConsentRecord:'consent',CommunicationEvent:'communication',TrainingRecord:'training'};
export function buildPersonTimeline(inventories,{tenantId,clubId,personId}={}){
 if(!tenantId||!clubId||!personId)throw Error('Verified Person scope required');
 const entries=[],sources=[];let complete=true;
 for(const [entity,read] of Object.entries(inventories||{})){
  if(!types[entity])throw Error('Unrecognised timeline source');
  if(!read||!Array.isArray(read.rows))throw Error('Invalid timeline source');
  if(read.complete!==true)complete=false;
  sources.push({entity,complete:read.complete===true,count:read.rows.length});
  for(const row of read.rows){
   if(row.tenant_id!==tenantId||row.club_id!==clubId||row.person_id!==personId||!row.id)throw Error('CRM timeline scope violation');
   entries.push({id:entity+':'+row.id,sourceType:entity,sourceId:row.id,kind:types[entity],at:row.updated_date||row.created_date||'',status:String(row.registration_status||row.payment_status||row.status||row.attendance_status||'recorded').slice(0,60)});
  }
 }
 entries.sort((a,b)=>String(b.at).localeCompare(String(a.at))||a.id.localeCompare(b.id));
 return {entries,complete,sources,identityVerifiedByExplicitLink:true,readOnly:true,mayBeIncomplete:!complete};
}
