/** Permit reconciliation only when one scoped settled membership ledger record exists. */
export function reviewMembershipActivationReconciliation({membership,payments,tenantId,clubId,personId}:any){
 const issues:string[]=[];
 if(!membership?.id||membership.tenant_id!==tenantId||membership.club_id!==clubId||membership.person_id!==personId)issues.push('membership_scope');
 if(!Array.isArray(payments))issues.push('ledger_unavailable');
 const rows=Array.isArray(payments)?payments:[];
 if(rows.some((p:any)=>p.tenant_id!==tenantId||p.club_id!==clubId||p.person_id!==personId||p.club_membership_id!==membership?.id||p.purpose_type!=='membership'))issues.push('ledger_scope');
 const paid=rows.filter((p:any)=>p.payment_status==='paid');
 if(paid.length!==1)issues.push('single_settled_payment_required');
 if(rows.some((p:any)=>['refund_pending','refunded','partially_refunded','chargeback','disputed'].includes(p.payment_status)))issues.push('refund_or_dispute');
 if(rows.some((p:any)=>p.payment_status==='pending'&&p.id!==paid[0]?.id))issues.push('other_pending_checkout');
 if(membership.payment_status==='paid'&&membership.membership_status==='paid_active')return {allowed:false,alreadyActive:true,issues};
 if(!['pending_payment','pending_approval','paid_active'].includes(membership.membership_status))issues.push('membership_status_review');
 return {allowed:issues.length===0,alreadyActive:false,issues,payment:issues.length===0?paid[0]:null};
}
