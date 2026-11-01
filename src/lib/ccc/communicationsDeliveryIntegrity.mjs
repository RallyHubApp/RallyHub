/** Read-only branded communication delivery integrity check. */
export function reviewCommunicationDelivery({message,consent,suppression}={}){
 const issues=[];
 if(!message?.tenant_id||!message?.club_id||!message?.person_id)issues.push('scope_missing');
 if(!message?.approved_template_id)issues.push('approved_template_missing');
 if(message?.brand_scope!=='tenant'&&message?.brand_scope!=='platform')issues.push('brand_scope_invalid');
 if(message?.purpose==='marketing'&&!(consent?.status==='accepted'&&consent?.tenant_id===message?.tenant_id&&consent?.person_id===message?.person_id))issues.push('marketing_consent_missing');
 if(suppression?.active!==false&&suppression?.person_id===message?.person_id)issues.push('recipient_suppressed');
 if(message?.delivery_status==='delivered'&&!message?.provider_message_id)issues.push('delivery_without_provider_receipt');
 return {healthy:issues.length===0,issues,automaticSend:false};
}
