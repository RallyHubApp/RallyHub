/** Read-only financial reconciliation. Never treats browser redirects as paid. */
const FINAL=new Set(['paid','partially_refunded','refunded']);
export function paymentLedger({tenantId,clubId,payments=[]}={}){
 if(!tenantId||!clubId)return [];
 const seen=new Set();
 return (Array.isArray(payments)?payments:[]).filter(p=>p?.tenant_id===tenantId&&p?.club_id===clubId&&p?.id).map(p=>{
  const duplicate=!!p.provider_transaction_id&&seen.has(p.provider+':'+p.provider_transaction_id);
  if(p.provider_transaction_id)seen.add(p.provider+':'+p.provider_transaction_id);
  return {id:p.id,personId:p.person_id||null,purpose:p.purpose_type||'other',purposeId:p.purpose_id||null,status:p.payment_status,amount:Number.isFinite(p.amount)?p.amount:null,currency:p.currency||'EUR',provider:p.provider||null,duplicateTransaction:duplicate,settled:FINAL.has(p.payment_status)};
 });
}
export function paymentReconciliationSummary(ledger=[]){
 const result={records:ledger.length,paid:0,pending:0,failed:0,refunded:0,duplicates:0,unknownAmount:0};
 for(const p of ledger){
  if(p.duplicateTransaction){result.duplicates++;continue;}
  if(p.amount===null)result.unknownAmount++;
  if(p.status==='paid')result.paid++;
  else if(p.status==='pending'||p.status==='refund_pending')result.pending++;
  else if(p.status==='failed'||p.status==='refund_failed')result.failed++;
  else if(['refunded','partially_refunded'].includes(p.status))result.refunded++;
 }
 return result;
}
