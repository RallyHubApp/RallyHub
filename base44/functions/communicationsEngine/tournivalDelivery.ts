/**
 * Communications Centre delivery ledger. This never sends on event ingestion.
 * Every external send must claim a queued attempt atomically in the Centre.
 */
export const TOURNIVAL_EVENTS={
 registration:'tournival_registration_received',
 payment_required:'tournival_payment_required',
 payment_confirmed:'tournival_payment_confirmed',
 waitlisted:'tournival_waitlist_added',
 promoted:'tournival_waitlist_promoted',
 host:'tournival_host_invite',
 results:'tournival_results'
} as const;
const emailKey=(value:any)=>String(value||'').trim().toLowerCase();
export function makeTournivalDeliveryKey({tenantId,eventId,purpose,recipientId,channel,version='1'}:any){
 for(const x of [tenantId,eventId,purpose,recipientId,channel,version])
  if(!String(x||'').trim()||String(x).length>200||String(x).includes('|'))throw Error('Invalid delivery key input');
 return ['tournival',tenantId,eventId,purpose,recipientId,channel,version].join('|');
}
export async function queueTournivalCommunication(base44:any,{
 tenantId,clubId,eventId,purpose,recipient,channel,fields,rendered,sourceRecordId,operationId,deliveryVersion,resendReason
}:any){
 if(!tenantId||!clubId||!eventId||!sourceRecordId||!recipient?.id||
  !Object.values(TOURNIVAL_EVENTS).includes(purpose)||
  !['email','whatsapp'].includes(channel)||!rendered?.templateId||!rendered?.brandKitId)
  throw Error('Approved Tournival tenant communication required');
 const address=channel==='email'?emailKey(recipient.email):String(recipient.mobile||'').trim();
 if(!address||(channel==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)))
  throw Error('Recipient channel address unavailable');
 const ledger=base44.asServiceRole.entities.CommunicationDeliveryAttempt;
 const key=makeTournivalDeliveryKey({tenantId,eventId,purpose,recipientId:sourceRecordId,channel,version:String(deliveryVersion||1)});
 const existing=await ledger.filter({tenant_id:tenantId,idempotency_key:key},'-created_date',2);
 if(existing?.length)return {queued:false,duplicate:true,attemptId:existing[0].id,status:existing[0].status};
 // Base44 service role does not support upsert in every runtime. The event's
 // dedupe-key array is conditionally updated atomically instead.
 const claim=await base44.asServiceRole.entities.Tournament.updateMany({
  id:eventId,tenant_id:tenantId,host_club_id:clubId,
  tournival_communication_keys:{$ne:key}
 },{$addToSet:{tournival_communication_keys:key}});
 if(claim.updated!==1)return {queued:false,duplicate:true,status:'already_reserved'};
 let attempt:any;
 try{
  attempt=await ledger.create({tenant_id:tenantId,idempotency_key:key,
   campaign_id:'pending',recipient_id:sourceRecordId,channel,status:'queued',
   attempt_number:Number(deliveryVersion||1),provider:'none',queued_at:new Date().toISOString(),
   metadata:{source_module:'Tournival',event_id:eventId,operation_id:operationId||'',delivery_version:deliveryVersion||1,resend_reason:String(resendReason||'').slice(0,500)}
  });
 }catch(e){
  // Do NOT release the durable reservation on an ambiguous entity-create
  // failure: the create may have committed while its response was lost.
  // Reconciliation is safer than a second externally deliverable attempt.
  throw e;
 }
 try{
 const campaign=await base44.asServiceRole.entities.CommunicationCampaign.create({
  owner_scope:'tenant',tenant_id:tenantId,club_id:clubId,source_module:'Tournival',
  source_record_id:eventId,kind:'transactional',purpose,name:purpose,status:'queued',
  audience_definition:{source:'tournival',eventId,channel},recipient_count:1,
  eligible_count:1,idempotency_key:key,brand_kit_id:rendered.brandKitId,
  created_by_user_id:'tournival-workflow',metadata:{sourceRecordId,operationId:operationId||'',deliveryVersion:deliveryVersion||1,resendReason:String(resendReason||'').slice(0,500)}
 });
 const message=await base44.asServiceRole.entities.CommunicationMessage.create({
  campaign_id:campaign.id,tenant_id:tenantId,channel,template_id:rendered.templateId,
  subject:rendered.subject||'',html_body:rendered.html||'',plain_text_body:rendered.text||'',
  channel_body:channel==='whatsapp'?rendered.text:'',
  merge_schema:fields||{},status:'queued',metadata:{eventId,purpose,sourceRecordId}
 });
 const audience=await base44.asServiceRole.entities.CommunicationRecipient.create({
  campaign_id:campaign.id,tenant_id:tenantId,person_id:recipient.personId||undefined,source_module:'Tournival',
  source_record_id:sourceRecordId,display_name:String(recipient.name||'').slice(0,120),
  email:emailKey(recipient.email),mobile:String(recipient.mobile||'').slice(0,50),
  eligible_channels:[channel],selected_channels:[channel],eligibility_status:'eligible',
  dedupe_key:key,personalisation:fields||{},resolved_at:new Date().toISOString()
 });
 await ledger.update(attempt.id,{campaign_id:campaign.id,message_id:message.id,recipient_id:audience.id});
 await base44.asServiceRole.entities.CommunicationEvent.create({
  campaign_id:campaign.id,message_id:message.id,recipient_id:audience.id,
  delivery_attempt_id:attempt.id,tenant_id:tenantId,event_type:'queued',
  occurred_at:new Date().toISOString(),metadata:{purpose,sourceRecordId,operationId:operationId||'',resendReason:String(resendReason||'').slice(0,500)}
 });
 return {queued:true,duplicate:false,attemptId:attempt.id,campaignId:campaign.id,recipientId:audience.id};
 }catch(e:any){
  // The key and initial attempt deliberately remain reserved. Never
  // silently recreate the communication after a partial write or timeout.
  try{
   const current=(await ledger.filter({id:attempt.id,tenant_id:tenantId},'-created_date',1))?.[0];
   if(current){
    await ledger.update(attempt.id,{error_code:'incomplete_ledger',
      error_message:String(e?.message||e).slice(0,250)});
   }
  }catch{}
  throw e;
 }
}
export async function listTournivalAudience(base44:any,{tenantId,eventId}:any){
 const campaigns=await base44.asServiceRole.entities.CommunicationCampaign.filter({
  tenant_id:tenantId,source_module:'Tournival',source_record_id:eventId
 },'-created_date',250);
 const ids=(campaigns||[]).map((c:any)=>c.id);
 if(!ids.length)return [];
 // Batch tenant-scoped reads: constant query count rather than two calls per
 // campaign during host/operator bursts.
 const [recipients,attempts]=await Promise.all([
  base44.asServiceRole.entities.CommunicationRecipient.filter({
   tenant_id:tenantId,campaign_id:{$in:ids}
  },'-created_date',1000),
  base44.asServiceRole.entities.CommunicationDeliveryAttempt.filter({
   tenant_id:tenantId,campaign_id:{$in:ids}
  },'-created_date',1000)
 ]);
 const byCampaign=new Map((campaigns||[]).map((c:any)=>[c.id,c]));
 const originalByKey=new Map<string,any>();
 for(const r of recipients||[]){
  const key=String(r.dedupe_key||'');
  if(!key.endsWith('|1'))continue;
  const parts=key.split('|');
  if(parts.length<7)continue;
  originalByKey.set(parts.slice(0,-1).join('|'),r);
 }
 const result=[];
 for(const recipient of recipients||[]){
  const c:any=byCampaign.get(recipient.campaign_id);
  if(!c)continue;
  const delivery=(attempts||[]).filter((a:any)=>a.recipient_id===recipient.id).sort(
   (a:any,b:any)=>Number(b.attempt_number)-Number(a.attempt_number))[0];
  result.push({campaignId:c.id,purpose:c.purpose,recipientId:recipient.id,
   name:recipient.display_name,email:recipient.email,mobile:recipient.mobile,
   eligibility:recipient.eligibility_status,sourceRecordId:recipient.source_record_id,
   // All resends must reuse original private links and address snapshot, never
   // later ad-hoc copies that may have omitted personalisation.
   fields:originalByKey.get(String(recipient.dedupe_key||'').split('|').slice(0,-1).join('|'))?.personalisation||
      recipient.personalisation||{},
   channel:delivery?.channel||'email',
   deliveryId:delivery?.id||null,deliveryStatus:delivery?.status||'not_queued',
   attemptNumber:delivery?.attempt_number||0});
 }
 return result;
}
