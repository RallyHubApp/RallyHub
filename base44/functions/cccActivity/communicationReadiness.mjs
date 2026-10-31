/** CCC communications readiness is advisory only: never sends, renders or infers consent. */
const requiredPurposes=['membership_request','membership_approved','payment_link','payment_failed','payment_confirmed','host_access','guest_waiting_list','event_followup'];
const requiredFields=['subject_template','html_template','plain_text_template'];
export function reviewTemplate(template){
 const issues=[];
 if(!template||template.owner_scope!=='tenant')return {ready:false,issues:['tenant_template_required']};
 if(template.status!=='approved')issues.push('template_not_approved');
 if(!template.approved_at||!template.approved_by_user_id)issues.push('approval_evidence_missing');
 if(!template.brand_kit_id)issues.push('brand_kit_missing');
 if(!template.version)issues.push('version_missing');
 for(const field of requiredFields)if(!String(template[field]||'').trim())issues.push(field+'_missing');
 return {ready:issues.length===0,issues};
}
export function communicationReadiness(templates=[],{complete=true}={}){
 const purposeRows=requiredPurposes.map(purpose=>{
  const matches=templates.filter(t=>t?.owner_scope==='tenant'&&t.purpose===purpose);
  const checked=matches.map(t=>({id:t.id,version:String(t.version||''),...reviewTemplate(t)}));
  const ready=checked.filter(t=>t.ready);
  return {purpose,templateCount:matches.length,approvedReadyCount:ready.length,issues:matches.length===0?['template_missing']:[...new Set(checked.flatMap(t=>t.issues))],templates:checked};
 });
 const allReady=complete&&purposeRows.every(p=>p.approvedReadyCount>0);
 return {purposes:purposeRows,requiredPurposeCount:requiredPurposes.length,readyPurposeCount:purposeRows.filter(p=>p.approvedReadyCount>0).length,complete,allTemplatesReady:allReady,deliveryEnabled:false,consentVerified:false,suppressionVerified:false,providerConfigured:false,authorisedToSend:false};
}
export {requiredPurposes};
