/** Payment/approval commits must not be represented as failed because a notice transport failed. */
export async function confirmAndNotify({commit,notify,successStatus='confirmed'}){
 const saved=await commit();
 let noticeNeedsReview=false;
 try{await notify(saved)}catch(error){noticeNeedsReview=true;console.error('Event registration confirmed but notice delivery needs review',error instanceof Error?error.message:String(error))}
 return {success:true,status:successStatus,noticeNeedsReview};
}
export function eventRefundProviderOutcome({refundId,providerOutcome,error}){
 const accepted=!!providerOutcome;
 return {success:accepted,refundId,providerRefundSucceeded:accepted,requiresReconciliation:true,
  warning:accepted?'Provider accepted the refund but local records require reconciliation. Do not issue another refund.':'Refund outcome is uncertain. Reconcile with SumUp before retrying.',
  status:accepted?'provider_accepted_reconciliation':'provider_unknown_reconciliation'};
}
