/** Advisory, person-scoped consent review. Never authorises delivery.
 * Endpoint-hash-only suppressions cannot be cleared by person ID and must be checked
 * by the authoritative communications service before any send.
 */
export function reviewPersonCommunications({tenantId,clubId,personId,channel,purpose,consents=[],preferences=[],suppressions=[],complete=false}={}){
 const issues=[];
 if(!tenantId||!clubId||!personId)issues.push('scope_missing');
 if(!['email','sms','whatsapp'].includes(channel))issues.push('channel_invalid');
 if(!['marketing','transactional'].includes(purpose))issues.push('purpose_invalid');
 if(!complete)issues.push('records_incomplete');
 const matchingConsent=consents.filter(c=>c?.tenant_id===tenantId&&c?.club_id===clubId&&c?.person_id===personId&&c?.consent_type==='marketing');
 const consentAccepted=matchingConsent.some(c=>c.status==='accepted'&&Array.isArray(c.channels)&&c.channels.includes(channel)&&!!c.recorded_at&&!!c.consent_version);
 const consentDeclined=matchingConsent.some(c=>c.status==='declined');
 const relevantPreferences=preferences.filter(p=>p?.person_id===personId&&p.channel===channel&&p.purpose===purpose&&(p.owner_scope==='platform'||p.owner_scope==='tenant'&&p.tenant_id===tenantId));
 const withdrawn=relevantPreferences.some(p=>p.status==='withdrawn');
 const preferenceAccepted=relevantPreferences.some(p=>p.status==='accepted'&&!!p.confirmed_at);
 const relevantSuppressions=suppressions.filter(s=>s?.active!==false&&s.channel===channel&&s.person_id===personId&&(s.owner_scope==='platform'||s.owner_scope==='tenant'&&s.tenant_id===tenantId));
 if(relevantSuppressions.length)issues.push('active_suppression');
 if(withdrawn)issues.push('preference_withdrawn');
 if(purpose==='marketing'&&(!consentAccepted||consentDeclined))issues.push('marketing_consent_unverified');
 if(purpose==='marketing'&&!preferenceAccepted)issues.push('marketing_preference_unverified');
 // A separate endpoint-hash suppression search is required even when no person-scoped record exists.
 issues.push('endpoint_suppression_not_checked','provider_and_template_not_checked');
 return {personId,channel,purpose,consentRecordCount:matchingConsent.length,preferenceRecordCount:relevantPreferences.length,personSuppressionCount:relevantSuppressions.length,consentEvidencePresent:consentAccepted&&!consentDeclined,preferenceEvidencePresent:preferenceAccepted&&!withdrawn,issues:[...new Set(issues)],complete,sendEligible:false,deliveryEnabled:false,mutationPerformed:false};
}
