/**
 * Read-only, current-state delivery guard. Queued messages are snapshots;
 * membership-like stop rules must be re-evaluated immediately before send.
 */
export function reasonForTournivalDelivery(purpose:string,reg:any,payment:any,hasCheckIns:boolean){
 if(!reg)return 'Registration not found in this event';
 if(reg.registration_status==='withdrawn')return 'Registration withdrawn';
 switch(purpose){
  case 'tournival_registration_received':
   if(reg.registration_status!=='confirmed')return 'Registration is no longer confirmed';
   break;
  case 'tournival_waitlist_added':
   if(reg.registration_status!=='waitlisted')return 'Waitlist entry is no longer active';
   break;
  case 'tournival_waitlist_promoted':
   if(reg.registration_status!=='confirmed')return 'Waitlist promotion is no longer confirmed';
   break;
  case 'tournival_payment_required':
   if(reg.registration_status!=='pending_payment'||reg.payment_status!=='pending')
    return 'Payment request is no longer outstanding';
   if(!payment||payment.payment_status!=='pending'||!payment.provider_checkout_url)
    return 'A verified pending checkout is missing';
   break;
  case 'tournival_refund_confirmed':
   if(reg.payment_status!=='refunded')
    return 'Refund has not been verified and recorded';
   break;
  case 'tournival_payment_confirmed':
   if(reg.registration_status!=='confirmed'||reg.payment_status!=='paid')
    return 'Payment has not been verified as paid';
   break;
  case 'tournival_post_event_thanks':
  case 'tournival_results':
   if(reg.registration_status!=='confirmed'||!['paid','not_required','simulated'].includes(reg.payment_status))
    return 'Recipient is not confirmed and payment complete';
   if(hasCheckIns&&!reg.checked_in_at)return 'Recipient did not check in';
   break;
  default:return 'Unrecognised Tournival delivery purpose';
 }
 return '';
}
export async function validateTournivalDeliveryEligibility(base44:any,{
 tenantId,clubId,campaign,recipient
}:any){
 const t=(await base44.asServiceRole.entities.Tournament.filter({
  id:campaign.source_record_id,tenant_id:tenantId,host_club_id:clubId
 },'-created_date',1))?.[0];
 if(!t||String(t.format).toLowerCase()!=='tournival')
  return {eligible:false,reason:'Tournival not found in the tenant and club'};
 const purpose=String(campaign.purpose||'');
 if(purpose==='tournival_host_invite'){
  if(['Completed','Cancelled'].includes(t.status))return {eligible:false,reason:'Event already finished'};
  // Host invitations carry a private token; it must remain valid at send time.
  const link=String(recipient.personalisation?.HOST_LINK||'');
  const found=link.match(/\/tournival\/host\/(th_[0-9a-f]{48})$/);
  if(!found)return {eligible:false,reason:'Approved host invitation link unavailable'};
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',
   new TextEncoder().encode(found[1]))),x=>x.toString(16).padStart(2,'0')).join('');
  const access=(await base44.asServiceRole.entities.TournivalAccessToken.filter({
    tournament_id:t.id,tenant_id:tenantId,token_type:'host',token_hash:hash
  },'-created_at',1))?.[0];
  return access&&!access.revoked_at&&(!access.expires_at||Date.parse(access.expires_at)>Date.now())?
   {eligible:true}:{eligible:false,reason:'Host link expired or revoked'};
 }
 const source=String(recipient.source_record_id||'');
 const prefix=purpose==='tournival_post_event_thanks'?'thanks:':
  purpose==='tournival_results'?'results:':
  purpose==='tournival_waitlist_promoted'?'promoted:':
  purpose==='tournival_refund_confirmed'?'refund:':
  purpose==='tournival_payment_confirmed'?'paid:':
  purpose==='tournival_payment_required'?'payment-required:':'';
 if(prefix&&!source.startsWith(prefix))return {eligible:false,reason:'Unexpected source record for purpose'};
 const regId=prefix?source.slice(prefix.length):source;
 const reg=(await base44.asServiceRole.entities.TournivalRegistration.filter({
  id:regId,tournament_id:t.id,tenant_id:tenantId
 },'-created_date',1))?.[0];
 let payment=null,checkIns=false;
 if(purpose==='tournival_refund_confirmed'){
  if(!reg?.payment_record_id)return {eligible:false,reason:'Refund payment is unavailable'};
  const refundRows=await base44.asServiceRole.entities.PaymentRefund.filter({
   payment_record_id:reg.payment_record_id,tenant_id:tenantId,purpose_id:reg.id,status:'succeeded'
  },'-completed_at',3);
  if(!refundRows?.length)return {eligible:false,reason:'No successful SumUp refund recorded'};
 }
 if(purpose==='tournival_payment_required'&&reg?.payment_record_id)
  payment=(await base44.asServiceRole.entities.PaymentRecord.filter({
   id:reg.payment_record_id,tenant_id:tenantId,purpose_id:reg.id
  },'-created_date',1))?.[0]||null;
 if(['tournival_results','tournival_post_event_thanks'].includes(purpose)){
  const all=await base44.asServiceRole.entities.TournivalRegistration.filter({
   tournament_id:t.id,tenant_id:tenantId,registration_status:'confirmed'
  },'-created_date',500);
  checkIns=(all||[]).some((x:any)=>!!x.checked_in_at);
 }
 const reason=reasonForTournivalDelivery(purpose,reg,payment,checkIns);
 if(reason)return {eligible:false,reason};
 if(purpose==='tournival_payment_required'&&
    payment.provider_checkout_url!==recipient.personalisation?.PAYMENT_LINK)
   return {eligible:false,reason:'Checkout URL changed; regenerate the approved request'};
 return {eligible:true};
}
