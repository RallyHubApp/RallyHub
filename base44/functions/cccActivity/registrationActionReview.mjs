/** Read-only, scoped operational review before using authoritative eventRegistration actions.
 * No capacity or payment writes here. Existing eventRegistration remains the writer.
 */
export function registrationActionReview({activity,event,registration,registrations=[],complete=false,action,now=Date.now()}={}){
 const issues=[];
 if(!activity?.id||!event?.id||!registration?.id||activity.linked_event_id!==event.id||registration.event_id!==event.id||activity.tenant_id!==event.tenant_id||activity.club_id!==event.host_club_id||registration.tenant_id!==activity.tenant_id||registration.club_id!==activity.club_id)issues.push('scope_or_event_mismatch');
 if(!complete)issues.push('registration_inventory_incomplete');
 if(!registrations.some(r=>r.id===registration?.id&&r.event_id===event?.id&&r.tenant_id===activity?.tenant_id&&r.club_id===activity?.club_id))issues.push('registration_missing_from_inventory');
 if(!Number.isSafeInteger(Number(event?.event_capacity))||Number(event.event_capacity)<1)issues.push('capacity_invalid');
 const occupied=registrations.filter(r=>{
  if(r.tenant_id!==activity?.tenant_id||r.club_id!==activity?.club_id||r.event_id!==event?.id)return false;
  if(['pending_approval','confirmed','cash_confirmed'].includes(r.registration_status))return true;
  return r.registration_status==='approved_payment_hold'&&(!r.payment_hold_expires_at||!Number.isFinite(Date.parse(r.payment_hold_expires_at))||Date.parse(r.payment_hold_expires_at)>now);
 }).length;
 if(action==='admin_approve'){
  if(registration?.registration_status!=='pending_approval')issues.push('approval_state_invalid');
  if(occupied>Number(event?.event_capacity))issues.push('capacity_exhausted');
  if(!['scheduled','registration_open'].includes(activity?.status))issues.push('activity_not_open');
 }else if(action==='admin_verify'){
  if(registration?.registration_status!=='approved_payment_hold')issues.push('payment_hold_not_active');
  if(!registration?.payment_hold_expires_at||!Number.isFinite(Date.parse(registration.payment_hold_expires_at)))issues.push('payment_hold_expiry_missing_or_invalid');
  else if(Date.parse(registration.payment_hold_expires_at)<=now)issues.push('payment_hold_expired');
  if(!registration?.payment_checkout_id)issues.push('checkout_reference_missing');
 }else issues.push('unsupported_action');
 return {ready:issues.length===0,issues,occupied,capacity:Number(event?.event_capacity)||0,requiresAuthoritativeBackendRecheck:true,mutationPerformed:false};
}
