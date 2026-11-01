/** Organiser remediation plan. Only actions already supported by the event engine are linked. */
const ACTIONS={
 expired_hold_verify_provider:{action:'admin_expire_hold',label:'Verify expired hold',confirmation:'Provider verification is mandatory before expiry'},
 refunded_booking_closure:{action:'admin_close_refunded_booking',label:'Close refunded booking',confirmation:'Full refund history must reconcile before closure'},
};
export function planEventOperations({review,rows}={}){
 if(!review?.previewOnly||!Array.isArray(review.queue)||!Array.isArray(rows))throw Error('Verified operations review required');
 const ids=new Set(rows.map(r=>r.id));
 if(ids.size!==rows.length)throw Error('Duplicate registration IDs');
 const blocked=new Set();
 for(const item of review.queue){if(item.priority===1&&item.registrationId)blocked.add(item.registrationId)}
 const tasks=review.queue.map(item=>{
  const mapping=ACTIONS[item.code];
  const eligible=!!mapping&&!!item.registrationId&&ids.has(item.registrationId)&&!blocked.has(item.registrationId)&&!review.capacityIssue;
  return {...item,action:eligible?mapping.action:null,actionLabel:eligible?mapping.label:null,requiresConfirmation:eligible,reason:eligible?mapping.confirmation:!mapping?'Manual reconciliation required':review.capacityIssue?'Capacity reconciliation required':'Conflicting registration issues require review'};
 });
 return {tasks,actionable:tasks.filter(x=>x.action).length,requiresManualReview:tasks.filter(x=>!x.action).length,previewOnly:true};
}
