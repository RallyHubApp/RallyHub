/** Review-only post-event triage. Never produces send authorisation. */
export function triageFollowupCandidates(candidates=[],{complete=true}={}){
 const seen=new Set(),rows=[],counts={total:0,invalidEmail:0,duplicateEmail:0,consentReview:0,suppressionReview:0,templateReview:0,readyToSend:0};
 for(const candidate of candidates){
  if(!candidate?.registrationId||seen.has(candidate.registrationId))continue;
  seen.add(candidate.registrationId);
  const reasons=new Set(candidate.reviewReasons||[]);
  const email=String(candidate.email||'').trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email))reasons.add('email_missing_or_invalid');
  if(reasons.has('email_missing_or_invalid'))counts.invalidEmail++;
  if(reasons.has('duplicate_email'))counts.duplicateEmail++;
  if(reasons.has('consent_not_verified'))counts.consentReview++;
  if(reasons.has('suppression_not_verified'))counts.suppressionReview++;
  if(reasons.has('approved_template_not_verified'))counts.templateReview++;
  rows.push({...candidate,reviewReasons:[...reasons],sendEligible:false,reviewComplete:false});
 }
 counts.total=rows.length;
 return {rows,counts,complete,reviewRequired:true,deliveryEnabled:false,readyToSend:0};
}
