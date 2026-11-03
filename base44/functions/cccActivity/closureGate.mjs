/** Fail-closed internal event close-out review; never substitutes for SumUp settlement. */
const settled=new Set(['paid','partially_refunded','refunded']);
export function reviewScopedEventClosure({activity,event,registrations=[],payments=[],registrationComplete=false,paymentComplete=false}={}){
 const issues=[];
 if(!activity?.id||!event?.id||activity.linked_event_id!==event.id||activity.tenant_id!==event.tenant_id||activity.club_id!==event.host_club_id)issues.push('event_scope_mismatch');
 if(!registrationComplete)issues.push('roster_incomplete');
 if(!paymentComplete)issues.push('payments_incomplete');
 if(activity?.status!=='completed')issues.push('activity_not_completed');
 const ids=new Set(),byRegistration=new Map();let confirmed=0,attended=0,noShows=0;
 for(const r of registrations){
  if(!r?.id||ids.has(r.id)||r.event_id!==event?.id||r.tenant_id!==activity?.tenant_id||r.club_id!==activity?.club_id){issues.push('invalid_or_duplicate_registration');continue;}
  ids.add(r.id);byRegistration.set(r.id,r);
  if(['pending_approval','approved_payment_hold'].includes(r.registration_status)||['approval_processing','pending'].includes(r.payment_status)&&r.registration_status==='confirmed')issues.push('unresolved_registration_'+r.id);
  if(['confirmed','cash_confirmed'].includes(r.registration_status)){
   confirmed++;
   if(r.attendance_status==='attended')attended++;
   else if(r.attendance_status==='no_show')noShows++;
   else if(r.attendance_status!=='excused')issues.push('attendance_unmarked_'+r.id);
  }
 }
 const paid=new Map(),seenTransactions=new Set();
 for(const p of payments){
  if(!p?.id||!ids.has(p.purpose_id)||p.tenant_id!==activity?.tenant_id||p.club_id!==activity?.club_id){issues.push('unmatched_payment');continue;}
  if(['pending','refund_pending','approval_processing'].includes(p.payment_status))issues.push('payment_unresolved_'+p.id);
  if(settled.has(p.payment_status)){
   paid.set(p.purpose_id,(paid.get(p.purpose_id)||0)+1);
   const transaction=String(p.provider_transaction_id||'').trim();
   if(!transaction)issues.push('missing_provider_transaction_'+p.id);
   else if(seenTransactions.has(transaction))issues.push('duplicate_provider_transaction_'+p.id);
   else seenTransactions.add(transaction);
  }
 }
 for(const [id,r] of byRegistration){
  if(r.payment_status==='paid'&&!paid.has(id))issues.push('paid_booking_without_payment_'+id);
  if(paid.has(id)&&!['confirmed','cash_confirmed','cancelled'].includes(r.registration_status))issues.push('paid_booking_unresolved_'+id);
  if((paid.get(id)||0)>1)issues.push('multiple_settled_payments_'+id);
 }
 return {operationallyReady:issues.length===0,issues:[...new Set(issues)],summary:{registrations:registrations.length,confirmed,attended,noShows,payments:payments.length},providerSettlementVerified:false,communicationDeliveryVerified:false,closeOutApproved:false,readOnly:true};
}
