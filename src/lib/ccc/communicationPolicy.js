/** CCC v2.1 outbound communication preflight.
 * Pure policy only. Approved tenant/platform brand kits and the existing
 * Communications Centre remain the sole rendering and sending pathway.
 */
export const CHANNELS=Object.freeze(['email','whatsapp','sms']);
export function communicationPreflight({tenantId,clubId,personId,channel,purpose,consents=[],suppressions=[],brandScope,templateId,recipient}={}){
 const errors=[];
 if(!tenantId||!clubId||!personId)errors.push('scope_required');
 if(!CHANNELS.includes(channel))errors.push('channel_unsupported');
 if(!['transactional','marketing'].includes(purpose))errors.push('purpose_unsupported');
 if(!['tenant','platform'].includes(brandScope))errors.push('brand_scope_required');
 if(!templateId)errors.push('approved_template_required');
 if(!recipient)errors.push('recipient_required');
 const suppressed=suppressions.some(s=>s?.active!==false&&s?.channel===channel&&s?.person_id===personId&&(s?.owner_scope==='platform'||s?.tenant_id===tenantId));
 if(suppressed)errors.push('recipient_suppressed');
 if(purpose==='marketing'){
  const permitted=consents.some(c=>c?.tenant_id===tenantId&&c?.club_id===clubId&&c?.person_id===personId&&c?.status==='accepted'&&c?.consent_type==='marketing'&&Array.isArray(c.channels)&&c.channels.includes(channel));
  if(!permitted)errors.push('marketing_consent_required');
 }
 return {allowed:errors.length===0,errors};
}
export function providerSelection({channel,configuredProviders={}}={}){
 if(!CHANNELS.includes(channel))return {available:false,reason:'channel_unsupported'};
 const provider=configuredProviders[channel];
 return provider?.enabled&&provider?.providerId?{available:true,providerId:provider.providerId}:{available:false,reason:'provider_not_configured'};
}
