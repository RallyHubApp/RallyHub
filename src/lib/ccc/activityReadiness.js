/** Non-mutating preflight for an activity before opening registration. */
export function activityReadiness({activity,venue,host,capacity,registrationMode,paymentMethod,approvedTemplate}={}){
 const issues=[];
 if(!activity?.tenant_id||!activity?.club_id)issues.push('activity_scope_required');
 if(!activity?.id)issues.push('activity_id_required');
 if(!venue?.id)issues.push('venue_required');
 if(!host?.id)issues.push('host_required');
 if(!Number.isSafeInteger(capacity)||capacity<1)issues.push('capacity_required');
 if(!['approval','automatic','closed'].includes(registrationMode))issues.push('registration_mode_required');
 if(!['none','cash','online'].includes(paymentMethod))issues.push('payment_method_required');
 if(registrationMode!=='closed'&&!approvedTemplate?.id)issues.push('approved_communication_template_required');
 if(activity?.tenant_id&&venue?.tenant_id&&activity.tenant_id!==venue.tenant_id)issues.push('venue_tenant_mismatch');
 if(activity?.club_id&&venue?.club_id&&activity.club_id!==venue.club_id)issues.push('venue_club_mismatch');
 return {ready:issues.length===0,issues};
}
