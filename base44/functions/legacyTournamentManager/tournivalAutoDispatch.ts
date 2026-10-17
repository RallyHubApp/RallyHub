import {resolveEmailTransport,sendWithConfiguredEmailTransport} from './emailRouter.ts';
import {validateTournivalDeliveryEligibility} from './tournivalEligibility.ts';
import {assessTournivalConsent} from './tournivalConsent.ts';

/**
 * A new Tournival event sends only its OWN freshly created attempt. Never
 * sweep the tenant queue or re-send old/incomplete/uncertain attempts.
 *
 * The persisted Communications Centre ledger is the audit trail. The atomic
 * queued -> sending claim prevents duplicate provider calls on concurrent
 * webhook replay. An unknown provider outcome stays sending for reconciliation.
 */
export async function dispatchNewTournivalNotice(base44:any,details:any,queued:any){
 if(!queued?.queued||!queued.attemptId)return {sent:false,skipped:true};
 const {tenantId,clubId}=details;
 const ledger=base44.asServiceRole.entities.CommunicationDeliveryAttempt;
 // Base44's freshly written queue rows may not be query-visible immediately.
 // Bounded read-after-write retries use the SAME attempt; never recreate a send.
 let attempt:any=null,message:any=null,recipient:any=null,campaign:any=null;
 for(let retry=0;retry<6;retry++){
  const found=await ledger.filter({id:queued.attemptId,tenant_id:tenantId},'-created_date',1);
  attempt=found?.[0]||null;
  if(attempt?.status&&attempt.status!=='queued')
   return {sent:false,skipped:true,reason:'Already claimed or no longer queued'};
  if(attempt?.channel==='email'&&attempt.campaign_id&&attempt.campaign_id!=='pending'&&
     attempt.message_id&&attempt.recipient_id){
   const [messages,recipients,campaigns]=await Promise.all([
    base44.asServiceRole.entities.CommunicationMessage.filter({id:attempt.message_id,tenant_id:tenantId},'-created_date',1),
    base44.asServiceRole.entities.CommunicationRecipient.filter({id:attempt.recipient_id,tenant_id:tenantId},'-created_date',1),
    base44.asServiceRole.entities.CommunicationCampaign.filter({id:attempt.campaign_id,tenant_id:tenantId,club_id:clubId},'-created_date',1)
   ]);
   [message,recipient,campaign]=[messages?.[0],recipients?.[0],campaigns?.[0]];
   if(message&&recipient&&campaign)break;
  }
  if(retry<5)await new Promise(resolve=>setTimeout(resolve,200*(retry+1)));
 }
 if(!message||!recipient||!campaign||!attempt||campaign.source_module!=='Tournival'||
    campaign.purpose!==details.purpose||recipient.eligibility_status!=='eligible'||
    !recipient.email||recipient.email.toLowerCase()!==String(details.recipient?.email||'').toLowerCase())
   return {sent:false,skipped:true,reason:'New Centre audience not visible or mismatched after bounded retries'};
 const allowed=await validateTournivalDeliveryEligibility(base44,{tenantId,clubId,campaign,recipient});
 if(!allowed.eligible)return {sent:false,skipped:true,reason:allowed.reason};
 let transport:any;
 try {
  transport=await resolveEmailTransport(base44,{scopeType:'tenant',tenantId,clubId,purpose:campaign.purpose});
 }catch{return {sent:false,skipped:true,reason:'Tenant sender unavailable'};}
 if(transport.status!=='configured'||transport.provider==='base44_core')
  return {sent:false,skipped:true,reason:'Branded HTML sender unavailable'};
 const people=await base44.asServiceRole.entities.Person.filter({
  tenant_id:tenantId,primary_email:recipient.email
 },'-updated_date',2);
 const personId=recipient.person_id||people?.[0]?.id||'';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(recipient.email.trim().toLowerCase()));
 const endpointHash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 const [suppressions,preferences]=await Promise.all([
  base44.asServiceRole.entities.CommunicationSuppression.filter({
   owner_scope:'tenant',tenant_id:tenantId,channel:'email',active:true
  },'-created_date',500),
  personId?base44.asServiceRole.entities.CommunicationPreference.filter({
   owner_scope:'tenant',tenant_id:tenantId,person_id:personId,channel:'email'
  },'-updated_date',100):Promise.resolve([])
 ]);
 const consent=assessTournivalConsent({channel:'email',purpose:campaign.purpose,
  personId,endpointHash,suppressions:suppressions||[],preferences:preferences||[]});
 if(!consent.allowed){
  const suppressed=await ledger.updateMany({id:attempt.id,tenant_id:tenantId,status:'queued'},
   {$set:{status:'suppressed',error_code:'recipient_suppressed'}});
  if(suppressed.updated===1)await base44.asServiceRole.entities.CommunicationEvent.create({
   tenant_id:tenantId,campaign_id:campaign.id,message_id:message.id,
   recipient_id:recipient.id,delivery_attempt_id:attempt.id,
   event_type:'suppressed',occurred_at:new Date().toISOString(),
   metadata:{reason:'centre_channel_suppression',automatic:true}
  });
  return {sent:false,skipped:true,reason:'Recipient suppressed'};
 }
 const claimed=await ledger.updateMany({id:attempt.id,tenant_id:tenantId,status:'queued'},
   {$set:{status:'sending'}});
 if(claimed.updated!==1)return {sent:false,skipped:true,reason:'Already claimed'};
 try {
  const sent=await sendWithConfiguredEmailTransport(base44,{
   scopeType:'tenant',tenantId,clubId,purpose:campaign.purpose
  },{to:recipient.email,subject:message.subject,textBody:message.plain_text_body,
   htmlBody:message.html_body});
  await ledger.update(attempt.id,{status:'sent',provider:sent.provider,
   sent_at:new Date().toISOString()});
  await base44.asServiceRole.entities.CommunicationEvent.create({
   tenant_id:tenantId,campaign_id:campaign.id,message_id:message.id,
   recipient_id:recipient.id,delivery_attempt_id:attempt.id,
   event_type:'sent',occurred_at:new Date().toISOString(),
   metadata:{automatic:true,trigger:campaign.purpose}
  });
  // Keep the Centre's campaign and message view consistent with the provider
  // delivery attempt. These are audit projections; never retry the provider
  // merely because the projection update failed.
  try{
   await Promise.all([
    base44.asServiceRole.entities.CommunicationMessage.update(message.id,{status:'sent'}),
    base44.asServiceRole.entities.CommunicationCampaign.update(campaign.id,{status:'completed'})
   ]);
  }catch(e:any){console.warn('Tournival delivery history projection needs review',
    attempt.id,String(e?.message||e).slice(0,120));}
  return {sent:true,attemptId:attempt.id};
 }catch(e:any){
  // The provider MAY have delivered before returning an error; never auto retry.
  await ledger.update(attempt.id,{status:'sending',error_code:'unverified_provider_outcome',
   error_message:String(e?.message||e).slice(0,250)});
  return {sent:false,uncertain:true,attemptId:attempt.id};
 }
}
