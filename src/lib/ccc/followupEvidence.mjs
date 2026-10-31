export function followupEvidenceState(review){
 if(!review)return {checked:false,sendEligible:false,issues:['evidence_not_checked']};
 return {checked:true,sendEligible:false,issues:[...new Set([...(review.issues||[]),'endpoint_suppression_not_checked','provider_and_template_not_checked'])]};
}
