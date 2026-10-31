/** Explicit review decision for a previously interrupted draft-only batch. */
export function reviewRecurrenceCompletion(source,review){
 const issues=[];
 if(!review?.valid||!review?.complete)issues.push('inventory_not_verified');
 if(source?.recurrence_batch_state!=='needs_recovery')issues.push('batch_not_in_recovery');
 if(!source?.recurrence_batch_key||review?.batchKey!==source.recurrence_batch_key)issues.push('batch_key_mismatch');
 if(!Number.isSafeInteger(source?.recurrence_expected_count)||source.recurrence_expected_count<1||source.recurrence_expected_count>12)issues.push('invalid_expected_count');
 if(review?.childCount!==source?.recurrence_expected_count)issues.push('missing_or_extra_children');
 if(review?.issues?.length)issues.push(...review.issues);
 const weeks=(review?.children||[]).map(c=>c.week).sort((a,b)=>a-b);
 if(weeks.some((w,i)=>w!==i+1))issues.push('non_contiguous_weeks');
 return {allowed:issues.length===0,issues:[...new Set(issues)],requiresHumanConfirmation:true,mayCreateChildren:false,mayDeleteChildren:false,mayPublish:false};
}
