/** Safe draft-only recurrence payloads. Never reserve venues or open registration. */
export function recurrenceDraftPayloads(source,manifest,{userId}={}){
 if(!manifest?.valid||!Array.isArray(manifest.rows)||!manifest.rows.length||!userId)throw Error('Invalid recurrence manifest');
 if(source?.status!=='draft'||source?.linked_event_id)throw Error('Source is not an unlinked draft');
 return manifest.rows.map(row=>{
  if(row.sourceActivityId!==source.id||row.sourceRevision!==source.revision||row.venueId!==source.venue_id||row.courtId!==(source.court_id||null))throw Error('Manifest/source mismatch');
  return {
   tenant_id:source.tenant_id,club_id:source.club_id,centre_id:source.centre_id||'',
   sport:source.sport,type:source.type,title:source.title,venue_id:source.venue_id,
   court_id:source.court_id||'',starts_at:row.startsAt,ends_at:row.endsAt,
   capacity:source.capacity,registration_mode:source.registration_mode,
   payment_method:source.payment_method,host_user_id:source.host_user_id||'',
   communication_template_id:source.communication_template_id||'',
   status:'draft',revision:1,linked_event_id:'',bridge_status:'unlinked',
   idempotency_key:row.operationId,created_by_user_id:userId,updated_by_user_id:userId,
   configuration:{recurrence_source_activity_id:source.id,recurrence_source_revision:source.revision,recurrence_week:row.week}
  };
 });
}
