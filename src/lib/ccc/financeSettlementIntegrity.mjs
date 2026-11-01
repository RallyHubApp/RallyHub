/** Detect payment and membership settlement drift without performing mutations. */
export function reviewFinanceSettlement({membership,payments=[]}={}){
 const issues=[];
 if(!membership?.id||!membership?.tenant_id||!membership?.club_id)issues.push('membership_scope_missing');
 if(!Array.isArray(payments))return {healthy:false,issues:[...issues,'ledger_unavailable'],automaticRepair:false};
 const scoped=payments.filter(p=>p?.membership_id===membership?.id&&p?.tenant_id===membership?.tenant_id&&p?.club_id===membership?.club_id);
 if(scoped.length!==payments.length)issues.push('ledger_scope_mismatch');
 const settled=scoped.filter(p=>p.payment_status==='paid');
 if(settled.length>1)issues.push('multiple_settlements');
 if(settled.length&&membership?.payment_status!=='paid')issues.push('paid_ledger_member_unsettled');
 if(membership?.payment_status==='paid'&&!settled.length)issues.push('paid_member_no_settlement');
 if(scoped.some(p=>['refunded','disputed','chargeback'].includes(p.payment_status)))issues.push('refund_or_dispute_review');
 return {healthy:issues.length===0,issues,settledCount:settled.length,automaticRepair:false};
}
