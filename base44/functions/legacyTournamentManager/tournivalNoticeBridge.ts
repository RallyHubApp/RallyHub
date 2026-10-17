import {resolveApprovedTournivalTemplate} from './tournivalTemplates.ts';
import {queueTournivalCommunication} from './tournivalDelivery.ts';
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
 try{return await queueApprovedTournivalNotice(base44,details)}
 catch(e:any){
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
