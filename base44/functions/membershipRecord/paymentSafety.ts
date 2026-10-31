export function assessMembershipPaymentLink({membership,payments,provider,amount,currency}:any){
 const issues:string[]=[];
 if(!membership?.id||!Number.isFinite(amount)||amount<=0||!provider||!currency)issues.push('invalid_payment_request');
 if(membership?.payment_status==='paid'||membership?.membership_status==='paid_active')issues.push('membership_already_paid');
 if(!Array.isArray(payments))issues.push('payment_inventory_unavailable');
 const scoped=Array.isArray(payments)?payments.filter((p:any)=>p?.club_membership_id===membership?.id):[];
 if(scoped.some((p:any)=>p.payment_status==='paid'))issues.push('existing_settled_payment');
 if(scoped.some((p:any)=>['refund_pending','refunded','partially_refunded','chargeback','disputed'].includes(p.payment_status)))issues.push('payment_requires_finance_review');
 if(scoped.some((p:any)=>p.payment_status==='pending'&&!p.provider_checkout_url))issues.push('pending_checkout_missing_url');
 const pending=scoped.filter((p:any)=>p.payment_status==='pending'&&p.provider_checkout_url);
 const exact=pending.filter((p:any)=>p.provider===provider&&Number(p.amount)===amount&&String(p.currency||'').toUpperCase()===String(currency).toUpperCase());
 if(pending.some((p:any)=>!exact.includes(p)))issues.push('different_pending_checkout_exists');
 if(exact.length>1)issues.push('duplicate_pending_checkout');
 return {allowed:issues.length===0,issues,reusable:issues.length===0?exact[0]||null:null};
}
export function assessMembershipPaymentVerification({membership,payment,result}:any){
 const issues:string[]=[];
 if(!membership?.id||!payment?.id||payment.club_membership_id!==membership.id)issues.push('payment_membership_mismatch');
 if(!payment?.provider_checkout_id||!payment?.provider)issues.push('checkout_identity_missing');
 const status=String(result?.normalizedStatus||'');
 if(!['paid','pending','failed','expired'].includes(status))issues.push('provider_status_requires_review');
 if(['refunded','refund_pending','partially_refunded','chargeback','disputed'].includes(payment?.payment_status))issues.push('refund_or_dispute_requires_review');
 if(payment?.payment_status==='paid'&&status!=='paid')issues.push('settled_payment_cannot_be_downgraded');
 if((membership?.payment_status==='paid'||membership?.membership_status==='paid_active')&&status!=='paid')issues.push('settled_membership_cannot_be_downgraded');
 if(status==='paid'&&result?.provider&&result.provider!==payment?.provider)issues.push('provider_mismatch');
 return {allowed:issues.length===0,issues,normalizedStatus:status==='expired'?'failed':status,markMemberPaid:status==='paid'&&issues.length===0};
}
/** Prevent verifying an arbitrary checkout when a member has several provider sessions. */
export function selectMembershipCheckoutForVerification({membership,payments}:any){
 const issues:string[]=[];
 if(!membership?.id||!Array.isArray(payments))return {payment:null,issues:['payment_inventory_unavailable']};
 const scoped=payments.filter((p:any)=>p?.club_membership_id===membership.id&&p.purpose_type==='membership');
 const paid=scoped.filter((p:any)=>p.payment_status==='paid');
 if(paid.length>1)issues.push('multiple_settled_payments');
 if(paid.length===1&&membership.payment_status!=='paid')issues.push('paid_record_membership_out_of_sync');
 const candidates=scoped.filter((p:any)=>p.provider_checkout_id&&p.provider&&p.payment_status!=='paid'&& !['refunded','refund_pending','chargeback','disputed'].includes(p.payment_status));
 if(candidates.length>1)issues.push('multiple_checkouts_require_selection');
 if(candidates.length===0)issues.push('no_verifiable_checkout');
 return {payment:issues.length===0?candidates[0]:null,issues};
}
/** Read-only financial integrity summary for administrator review. */
export function assessMembershipPaymentHealth({membership,payments}:any){
 const issues:string[]=[];
 if(!membership?.id||!Array.isArray(payments))return {healthy:false,issues:['payment_inventory_unavailable'],automaticRepair:false};
 const scoped=payments.filter((p:any)=>p.club_membership_id===membership.id&&p.purpose_type==='membership');
 const settled=scoped.filter((p:any)=>p.payment_status==='paid');
 const pending=scoped.filter((p:any)=>p.payment_status==='pending');
 if(settled.length>1)issues.push('multiple_settled_payments');
 if(settled.length&&membership.payment_status!=='paid')issues.push('settled_payment_membership_not_paid');
 if(!settled.length&&membership.payment_status==='paid')issues.push('paid_membership_without_settled_payment_record');
 if(pending.length>1)issues.push('multiple_pending_checkouts');
 if(pending.some((p:any)=>!p.provider_checkout_url))issues.push('pending_checkout_missing_url');
 if(scoped.some((p:any)=>['refunded','refund_pending','partially_refunded','chargeback','disputed'].includes(p.payment_status)))issues.push('refund_or_dispute_requires_review');
 return {healthy:issues.length===0,issues,settledCount:settled.length,pendingCount:pending.length,automaticRepair:false};
}
