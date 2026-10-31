/** Conservative validation for linking an existing event; never publishes it. */
export function validateEventLink(activity,event,{venue,hostVerified,templateVerified}={}){
 const issues=[];
 if(!activity||!event)return ['missing_activity_or_event'];
 if(!activity.tenant_id||!activity.club_id||event.tenant_id!==activity.tenant_id||event.host_club_id!==activity.club_id)issues.push('event_scope_mismatch');
 if(event.event_registration_mode!=='rallyhub')issues.push('event_registration_mode_mismatch');
 if(!Number.isSafeInteger(Number(activity.capacity))||Number(activity.capacity)<1||Number(event.event_capacity)!==Number(activity.capacity))issues.push('event_capacity_mismatch');
 if(!activity.venue_id||!venue||venue.id!==activity.venue_id||venue.status!=='active'||venue.tenant_id!==activity.tenant_id||venue.club_id!==activity.club_id)issues.push('venue_unavailable');
 if(!event.venue_id||event.venue_id!==activity.venue_id)issues.push('event_venue_mismatch');
 if(!Number.isFinite(Date.parse(activity.starts_at))||!event.start_date||String(event.start_date).slice(0,10)!==String(activity.starts_at).slice(0,10))issues.push('event_date_mismatch');
 if(!activity.host_user_id||hostVerified!==true)issues.push('host_not_verified');
 if(!activity.communication_template_id||templateVerified!==true)issues.push('template_not_verified');
 if(!['approval','automatic'].includes(activity.registration_mode))issues.push('registration_policy_unavailable');
 if(!['none','cash','online'].includes(activity.payment_method))issues.push('payment_policy_invalid');
 if(Number(event.event_fee_amount||0)>0&&activity.payment_method!=='online')issues.push('paid_event_requires_online');
 if(Number(event.event_fee_amount||0)===0&&activity.payment_method==='online')issues.push('free_event_payment_mismatch');
 return issues;
}
