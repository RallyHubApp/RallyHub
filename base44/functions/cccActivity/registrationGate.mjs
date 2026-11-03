/** Pure activation gate: configuration must match the already published event. */
export function registrationGate(activity,{event,venue,hostVerified,templateApproved,now=Date.now()}={}){
 const issues=[];
 if(!['scheduled','registration_closed'].includes(activity.status))issues.push('activity_not_scheduled');
 if(!Number.isSafeInteger(activity.capacity)||activity.capacity<1)issues.push('invalid_capacity');
 if(!Number.isFinite(Date.parse(activity.starts_at))||Date.parse(activity.starts_at)<=now)issues.push('activity_start_not_future');
 if(!venue)issues.push('venue_not_active');
 if(!activity.host_user_id)issues.push('host_required');else if(!hostVerified)issues.push('host_not_verified_for_club');
 if(!['approval','automatic'].includes(activity.registration_mode))issues.push('registration_policy_closed');
 if(!['none','cash','online'].includes(activity.payment_method))issues.push('payment_policy_invalid');
 if(!activity.communication_template_id)issues.push('approved_template_required');else if(!templateApproved)issues.push('approved_template_not_found');
 if(!activity.linked_event_id)issues.push('event_link_missing');else if(!event)issues.push('linked_event_not_found');
 if(event){
  if(event.event_registration_mode!=='rallyhub')issues.push('event_registration_mode_invalid');
  if(!event.event_booking_enabled||event.event_publish_status!=='published'||!event.event_public_visible)issues.push('event_not_bookable');
  if(Number(event.event_capacity)!==Number(activity.capacity))issues.push('event_capacity_mismatch');
  if(event.venue_id&&event.venue_id!==activity.venue_id)issues.push('event_venue_mismatch');
  if(event.start_date&&String(event.start_date).slice(0,10)!==String(activity.starts_at).slice(0,10))issues.push('event_date_mismatch');
  if(Number(event.event_fee_amount||0)>0&&activity.payment_method!=='online')issues.push('paid_event_requires_online_payment');
 }
 return {ready:issues.length===0,issues};
}
