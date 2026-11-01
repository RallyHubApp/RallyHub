/** Read-only provider reconciliation queue; no retries, no lock changes. */
const unresolved=new Set(['processing','requested','pending','unknown','needs_reconciliation']);
export function refundRecoveryQueue(payments=[],refunds=[],{tenantId,clubId,complete=false}={}){
 const scopedPayments=(payments||[]).filter(p=>p?.tenant_id===tenantId&&p?.club_id===clubId&&p?.id);
 const scopedRefunds=(refunds||[]).filter(r=>r?.tenant_id===tenantId&&r?.club_id===clubId&&r?.id);
 const byPayment=new Map();
 for(const refund of scopedRefunds){const id=refund.payment_record_id;if(!byPayment.has(id))byPayment.set(id,[]);byPayment.get(id).push(refund)}
 const cases=[];
 for(const payment of scopedPayments){
  const rows=byPayment.get(payment.id)||[],issues=[];
  if(payment.payment_status==='refund_pending')issues.push('refund_lock_pending');
  if(rows.some(r=>unresolved.has(r.status)))issues.push('refund_operation_unresolved');
  if(rows.some(r=>['unknown','needs_reconciliation'].includes(r.status)))issues.push('provider_reconciliation_required');
  const succeeded=rows.filter(r=>r.status==='succeeded').reduce((sum,r)=>sum+Number(r.amount||0),0);
  const recorded=Number(payment.amount_refunded||0),amount=Number(payment.amount||0);
  if(!Number.isFinite(recorded)||recorded<0||!Number.isFinite(succeeded)||succeeded<0||succeeded>amount+0.001||Math.abs(succeeded-recorded)>0.001)issues.push('refund_ledger_mismatch');
  if(issues.length)cases.push({paymentRecordId:payment.id,registrationId:payment.purpose_type==='event'?payment.purpose_id||null:null,bookingId:payment.purpose_type==='booking'?payment.purpose_id||null:null,paymentStatus:payment.payment_status,refundRecordCount:rows.length,issues:[...new Set(issues)],unresolvedRefundIds:rows.filter(r=>unresolved.has(r.status)).map(r=>r.id)});
 }
 const orphanRefunds=scopedRefunds.filter(r=>!scopedPayments.some(p=>p.id===r.payment_record_id));
 return {cases,caseCount:cases.length,orphanRefundCount:orphanRefunds.length,orphanRefundIds:orphanRefunds.map(r=>r.id),complete,requiresReview:cases.length>0||orphanRefunds.length>0||!complete,authorisedToRetry:false,mutationPerformed:false,providerSettlementVerified:false};
}
