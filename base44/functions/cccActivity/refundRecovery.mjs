/** Read-only reconciliation queue. Never changes locks or retries SumUp refunds. */
export function refundRecoveryQueue(payments=[],refunds=[],{tenantId,clubId,complete=false}={}){
 const scopedPayment=(payments||[]).filter(p=>p?.tenant_id===tenantId&&p?.club_id===clubId&&p?.id);
 const scopedRefund=(refunds||[]).filter(r=>r?.tenant_id===tenantId&&r?.club_id===clubId&&r?.id);
 const byPayment=new Map();
 for(const r of scopedRefund){if(!byPayment.has(r.payment_record_id))byPayment.set(r.payment_record_id,[]);byPayment.get(r.payment_record_id).push(r)}
 const cases=[];
 for(const p of scopedPayment){
  const rows=byPayment.get(p.id)||[],issues=[];
  if(p.payment_status==='refund_pending')issues.push('refund_lock_pending');
  if(rows.some(r=>['processing','requested'].includes(r.status)))issues.push('refund_operation_unresolved');
  if(rows.some(r=>r.status==='needs_reconciliation'))issues.push('provider_reconciliation_required');
  const succeeded=rows.filter(r=>r.status==='succeeded').reduce((sum,r)=>sum+Number(r.amount||0),0);
  const recorded=Number(p.amount_refunded||0);
  if(!Number.isFinite(recorded)||recorded<0||!Number.isFinite(succeeded)||succeeded<0||succeeded>Number(p.amount||0)+0.001||Math.abs(succeeded-recorded)>0.001)issues.push('refund_ledger_mismatch');
  if(issues.length)cases.push({paymentRecordId:p.id,registrationId:p.purpose_type==='event'?p.purpose_id||null:null,paymentStatus:p.payment_status,refundRecordCount:rows.length,issues:[...new Set(issues)]});
 }
 const orphanRefunds=scopedRefund.filter(r=>!scopedPayment.some(p=>p.id===r.payment_record_id)).length;
 return {cases,caseCount:cases.length,orphanRefundCount:orphanRefunds,complete,requiresReview:cases.length>0||orphanRefunds>0||!complete,authorisedToRetry:false,mutationPerformed:false,providerSettlementVerified:false};
}
