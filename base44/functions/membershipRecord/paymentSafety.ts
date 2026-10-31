export function assessMembershipPaymentLink({membership,payments,provider,amount,currency}:any){
 const issues:string[]=[];
 if(!membership?.id||!Number.isFinite(amount)||amount<=0||!provider||!currency)issues.push('invalid_payment_request');
 if(membership?.payment_status==='paid'||membership?.membership_status==='paid_active')issues.push('membership_already_paid');
 if(!Array.isArray(payments))issues.push('payment_inventory_unavailable');
 const scoped=Array.isArray(payments)?payments.filter((p:any)=>p?.club_membership_id===membership?.id):[];
 if(scoped.some((p:any)=>p.payment_status==='paid'))issues.push('existing_settled_payment');
 if(scoped.some((p:any)=>['refund_pending','refunded','partially_refunded','chargeback','disputed'].includes(p.payment_status)))issues.push('payment_requires_finance_review');
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
 if(!['paid','pending','failed','expired','refunded','unknown'].includes(status))issues.push('provider_status_invalid');
 if(['refunded','refund_pending','partially_refunded','chargeback','disputed'].includes(payment?.payment_status))issues.push('refund_or_dispute_requires_review');
 if(payment?.payment_status==='paid'&&status!=='paid')issues.push('settled_payment_cannot_be_downgraded');
 if((membership?.payment_status==='paid'||membership?.membership_status==='paid_active')&&status!=='paid')issues.push('settled_membership_cannot_be_downgraded');
 if(status==='paid'&&result?.provider&&result.provider!==payment?.provider)issues.push('provider_mismatch');
 return {allowed:issues.length===0,issues,normalizedStatus:status==='expired'?'failed':status,markMemberPaid:status==='paid'&&issues.length===0};
}
