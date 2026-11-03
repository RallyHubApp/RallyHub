/** Read-only recovery classification for incomplete provider and booking transitions. */
export function reviewBookingRecovery(registrations=[],payments=[],{tenantId,clubId,eventId,complete=false}={}){
 const byRegistration=new Map(),cases=[];
 for(const p of payments){if(p.tenant_id!==tenantId||p.club_id!==clubId||p.purpose_type!=='event')continue;const list=byRegistration.get(p.purpose_id)||[];list.push(p);byRegistration.set(p.purpose_id,list)}
 const ids=new Set();
 for(const r of registrations){
  if(r.tenant_id!==tenantId||r.club_id!==clubId||r.event_id!==eventId)continue;
  ids.add(r.id);const linked=byRegistration.get(r.id)||[],issues=[];
  if(r.payment_status==='approval_processing')issues.push('approval_lock_stuck_reconcile_before_retry');
  if(r.registration_status==='approved_payment_hold'&&!r.payment_checkout_id)issues.push('hold_missing_checkout');
  if(r.registration_status==='approved_payment_hold'&&r.payment_checkout_id&&!linked.some(p=>p.provider_checkout_id===r.payment_checkout_id))issues.push('checkout_missing_payment_record');
  if(r.registration_status==='confirmed'&&r.payment_status==='paid'&&!linked.some(p=>p.payment_status==='paid'))issues.push('confirmed_payment_missing_ledger');
  if(linked.some(p=>p.payment_status==='paid')&&r.registration_status!=='confirmed')issues.push('provider_paid_booking_not_confirmed');
  if(linked.some(p=>p.payment_status==='refund_pending'))issues.push('refund_reconciliation_required');
  if(issues.length)cases.push({registrationId:r.id,issues});
 }
 for(const [id,list] of byRegistration){if(!ids.has(id))cases.push({registrationId:id,issues:['payment_without_scoped_registration'],paymentCount:list.length})}
 return {cases,caseCount:cases.length,complete,requiresReview:!complete||cases.length>0,automaticRetryAllowed:false,providerVerified:false,readOnly:true};
}
