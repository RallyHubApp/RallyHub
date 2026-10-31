/** Review-only attendance follow-up. No record is send-eligible until consent and suppression are independently verified. */
export function buildFollowupReview(registrations=[]){
 const seen=new Set(),candidates=[];
 for(const r of registrations){
  if(!['confirmed','cash_confirmed'].includes(r.registration_status)||r.attendance_status!=='attended')continue;
  const email=String(r.email||'').trim().toLowerCase();
  const reasons=[];
  if(!/^\S+@\S+\.\S+$/.test(email))reasons.push('email_missing_or_invalid');
  else if(seen.has(email))reasons.push('duplicate_email');
  if(email)seen.add(email);
  reasons.push('consent_not_verified','suppression_not_verified','approved_template_not_verified');
  candidates.push({registrationId:r.id,name:r.full_name||'',email:r.email||'',hasEmail:!reasons.includes('email_missing_or_invalid'),attendance:'attended',reviewReasons:reasons,sendEligible:false});
 }
 return {candidates,reviewRequired:true,deliveryEnabled:false,consentAndSuppressionNotChecked:true};
}
