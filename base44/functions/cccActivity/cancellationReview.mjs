/** Cancellation is not the same as cancelling an authoritative event booking.
 * Prevent silent cancellation of linked activities while participants/payments
 * may remain active in the separate event-registration service.
 */
export function reviewActivityCancellation(activity,{linkedEvent=null}={}){
 const issues=[];
 if(!activity?.id||!activity?.tenant_id||!activity?.club_id)issues.push('activity_scope_missing');
 if(!['draft','ready','scheduled','registration_open','registration_closed','in_progress'].includes(activity?.status))issues.push('cancellation_unavailable');
 if(activity?.linked_event_id){
  issues.push('linked_event_requires_authoritative_cancellation');
  if(!linkedEvent)issues.push('linked_event_not_verified');
  else if(linkedEvent.tenant_id!==activity.tenant_id||linkedEvent.host_club_id!==activity.club_id||linkedEvent.id!==activity.linked_event_id)issues.push('linked_event_scope_mismatch');
 }
 return {allowed:issues.length===0,issues,requiresBookingReview:!!activity?.linked_event_id,requiresPaymentReview:!!activity?.linked_event_id,requiresCustomerCommunicationReview:!!activity?.linked_event_id,mutationPerformed:false};
}
