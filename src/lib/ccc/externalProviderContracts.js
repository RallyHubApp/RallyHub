/** CCC v2.1 provider-neutral integration contracts.
 * No provider calls, credential reads or live side effects. Existing
 * Communications Centre and payment gateway remain authoritative.
 */
export const PROVIDER_CHANNELS=Object.freeze(['email','whatsapp','sms','payment']);
export const PROVIDER_STATES=Object.freeze(['disabled','test','configured']);
export const DELIVERY_STATES=Object.freeze(['queued','sending','accepted','sent','delivered','read','failed','retried','suppressed']);

export function providerReadiness({config,channel,tenantId,environment='production'}={}){
 const errors=[];
 if(!PROVIDER_CHANNELS.includes(channel))errors.push('unsupported_channel');
 if(!tenantId)errors.push('tenant_required');
 if(!config||config.owner_scope!=='tenant'||config.tenant_id!==tenantId)errors.push('tenant_provider_not_found');
 if(config?.channel!==channel)errors.push('channel_mismatch');
 if(!PROVIDER_STATES.includes(config?.status)||config?.status==='disabled')errors.push('provider_disabled');
 if(environment==='production'&&config?.status!=='configured')errors.push('provider_not_live');
 if(!config?.provider)errors.push('provider_name_required');
 if(!config?.sender_identity||!Object.keys(config.sender_identity).length)errors.push('sender_identity_required');
 if(config?.health?.verified!==true)errors.push('provider_verification_required');
 return {ready:errors.length===0,errors,channel,tenantId};
}

/** Prepare an idempotent outbox request; this never sends a message. */
export function prepareProviderDispatch({tenantId,personId,channel,templateId,consentEvidence,recipient,idempotencyKey,provider,approved=false}={}){
 const errors=[];
 if(!tenantId||!personId||!recipient)errors.push('recipient_scope_required');
 if(!PROVIDER_CHANNELS.includes(channel)||channel==='payment')errors.push('invalid_messaging_channel');
 if(!templateId)errors.push('approved_template_required');
 if(!idempotencyKey)errors.push('idempotency_key_required');
 if(!provider?.ready)errors.push('provider_not_ready');
 if(!approved)errors.push('human_approval_required');
 if(channel==='whatsapp'&&!consentEvidence?.whatsapp_opt_in)errors.push('whatsapp_opt_in_required');
 return {ready:errors.length===0,errors,request:errors.length?null:{tenant_id:tenantId,person_id:personId,channel,template_id:templateId,recipient,idempotency_key:idempotencyKey,status:'queued',consent_evidence:consentEvidence??null}};
}

/** Map provider-specific delivery events to existing Communications records. */
export function normalizeDeliveryEvent({channel,providerMessageId,eventType,verified=false}={}){
 const mapping={queued:'queued',accepted:'accepted',sent:'sent',delivered:'delivered',read:'read',failed:'failed',retry:'retried',suppressed:'suppressed'};
 if(!verified)return {accepted:false,reason:'unverified_webhook'};
 if(!PROVIDER_CHANNELS.includes(channel)||channel==='payment'||!providerMessageId)return {accepted:false,reason:'invalid_provider_event'};
 if(!mapping[eventType])return {accepted:false,reason:'unsupported_event'};
 return {accepted:true,provider_message_id:providerMessageId,channel,status:mapping[eventType]};
}
