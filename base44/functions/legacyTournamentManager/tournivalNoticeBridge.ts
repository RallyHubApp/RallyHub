import {resolveApprovedTournivalTemplate} from './tournivalTemplates.ts';
import {queueTournivalCommunication} from './tournivalDelivery.ts';
import {dispatchNewTournivalNotice} from './tournivalAutoDispatch.ts';
/**
 * Event-side bridge: ledger only. Never sends or fabricates a brand/template.
 * Missing approval leaves an auditable server warning and is recoverable
 * through the Centre operator's queue/resend action.
 */
export async function queueApprovedTournivalNotice(base44:any,details:any){
 const {tenantId,clubId,eventId,purpose,recipient,sourceRecordId,fields}=details;
 if(!tenantId||!clubId||!eventId||!recipient?.id||!sourceRecordId)throw Error('Incomplete tenant event communication');
 const channel='email';
 const rendered=await resolveApprovedTournivalTemplate(base44,{
  tenantId,clubId,purpose,channel,fields
 });
 return queueTournivalCommunication(base44,{
  ...details,tenantId,clubId,eventId,purpose,recipient,sourceRecordId,
  fields,channel,rendered,deliveryVersion:1
 });
}
export async function safelyQueueTournivalNotice(base44:any,details:any){
 try{
  const queued=await queueApprovedTournivalNotice(base44,details);
  // New original event only; never trigger on duplicate, recovery or resend.
  if(!queued.queued)return queued;
  try{
   const dispatch=await dispatchNewTournivalNotice(base44,details,queued);
   if(dispatch.sent!==true){
    try{await base44.asServiceRole.entities.CommunicationEvent.create({
      tenant_id:details.tenantId,delivery_attempt_id:queued.attemptId,
      event_type:'tournival_auto_delivery_needs_review',occurred_at:new Date().toISOString(),
      metadata:{purpose:details.purpose,eventId:details.eventId,
        reason:String(dispatch.reason||'Unverified provider delivery').slice(0,170)}
    })}catch{}
   }
   return {...queued,automaticallySent:dispatch.sent===true,
    deliveryNeedsReview:dispatch.sent!==true};
  }catch(e:any){
   console.warn('Tournival email dispatch needs Centre review',details.purpose,
    String(e?.message||e).slice(0,160));
   return {...queued,automaticallySent:false,deliveryNeedsReview:true};
  }
 }catch(e:any){
  // No send, no fallback, and do not fail a completed payment/registration.
  console.warn('Tournival Centre queue requires review',details?.purpose,
   details?.eventId,String(e?.message||e).slice(0,180));
  // Track failed automation centrally without disclosing magic links or PII.
  try{
   await base44.asServiceRole.entities.CommunicationEvent.create({
    tenant_id:details?.tenantId||'',
    event_type:'tournival_queue_blocked',occurred_at:new Date().toISOString(),
    metadata:{source_module:'Tournival',eventId:details?.eventId||'',
      purpose:details?.purpose||'',sourceRecordId:details?.sourceRecordId||'',
      error:String(e?.message||e).slice(0,160)}
   });
  }catch{}
  return {queued:false,needsCommunicationReview:true};
 }
}
