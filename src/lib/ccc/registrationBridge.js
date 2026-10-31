/** Explicit integration contract for CCC activity -> existing tenant event registration.
 * No implicit creation, payment, communication, or public activation.
 */
export const REGISTRATION_BRIDGE_VERSION=1;
export const REGISTRATION_BRIDGE_STATES=Object.freeze(['unlinked','linked_unverified','verified','blocked']);
export function registrationBridgePreflight({activity,event,tenantId,clubId,providerReady=false,communicationsReady=false}={}){
 const issues=[];
 if(!activity?.id||!activity?.tenant_id||!activity?.club_id)issues.push('activity_missing');
 if(activity?.tenant_id!==tenantId||activity?.club_id!==clubId)issues.push('activity_scope_denied');
 if(!event?.id)issues.push('event_link_missing');
 else {
  if(event.tenant_id!==tenantId||event.host_club_id!==clubId)issues.push('event_scope_denied');
  if(event.event_registration_mode!=='rallyhub')issues.push('event_registration_mode_invalid');
  if(event.event_publish_status!=='published'||!event.event_public_visible||!event.event_booking_enabled)issues.push('event_not_bookable');
  if(Number(event.event_capacity)!==Number(activity?.capacity))issues.push('capacity_mismatch');
  if(event.event_fee_amount>0&&!providerReady)issues.push('payment_provider_unavailable');
 }
 if(!communicationsReady)issues.push('communications_unverified');
 if(!['scheduled','registration_closed'].includes(activity?.status))issues.push('activity_not_scheduled');
 return {ready:issues.length===0,issues:[...new Set(issues)],bridgeVersion:REGISTRATION_BRIDGE_VERSION};
}
export function registrationBridgeStatus({activity,event,tenantId,clubId,providerReady,communicationsReady}={}){
 if(!event?.id)return 'unlinked';
 const result=registrationBridgePreflight({activity,event,tenantId,clubId,providerReady,communicationsReady});
 return result.ready?'verified':result.issues.some(x=>x.endsWith('scope_denied'))?'blocked':'linked_unverified';
}
