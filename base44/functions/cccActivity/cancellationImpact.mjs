/** Read-only, conservative impact review. Never treats this as permission to cancel or refund. */
export function reviewCancellationImpact({registrations=[],payments=[],registrationComplete=false,paymentComplete=false}={}){
 const active=registrations.filter(r=>['pending_approval','approved_payment_hold','confirmed','cash_confirmed','waitlisted'].includes(r.registration_status));
 const paid=payments.filter(p=>['paid','partially_refunded','refunded'].includes(p.payment_status));
 const unresolved=payments.filter(p=>['pending','unknown','refund_pending','refund_failed'].includes(p.payment_status));
 const issues=[];
 if(!registrationComplete)issues.push('registration_inventory_incomplete');
 if(!paymentComplete)issues.push('payment_inventory_incomplete');
 if(active.length)issues.push('active_registrations_require_authoritative_cancellation');
 if(paid.length||unresolved.length)issues.push('payments_require_individual_provider_reconciliation');
 return {complete:registrationComplete&&paymentComplete,activeRegistrations:active.length,paidPaymentRecords:paid.length,unresolvedPaymentRecords:unresolved.length,issues,canCancelAutomatically:false,canRefundAutomatically:false,mutationPerformed:false};
}
