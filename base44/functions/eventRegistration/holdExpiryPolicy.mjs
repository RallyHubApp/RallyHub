/** A payment hold can expire only after provider verification rules out settlement. */
export function reviewEventHoldExpiry({registration,event,payments,providerStatus,now=Date.now()}={}){
 const issues=[];
 if(!registration?.id||registration?.event_id!==event?.id||registration?.tenant_id!==event?.tenant_id||registration?.club_id!==event?.host_club_id)issues.push('scope_mismatch');
 if(registration?.registration_status!=='approved_payment_hold'||registration?.payment_status!=='pending')issues.push('not_pending_hold');
 const expires=Date.parse(registration?.payment_hold_expires_at||'');
 if(!Number.isFinite(expires)||expires>now)issues.push('hold_not_expired');
 if(!registration?.payment_checkout_id)issues.push('checkout_missing');
 if(!Array.isArray(payments))issues.push('ledger_unavailable');
 const records=Array.isArray(payments)?payments:[];
 if(records.some(p=>p.tenant_id!==event?.tenant_id||p.club_id!==event?.host_club_id||p.purpose_type!=='event'||p.purpose_id!==registration?.id))issues.push('ledger_scope');
 if(records.some(p=>p.provider_checkout_id!==registration?.payment_checkout_id))issues.push('checkout_mismatch');
 if(records.some(p=>['paid','refunded','partially_refunded','refund_pending','disputed','chargeback'].includes(p.payment_status)||p.provider_transaction_id))issues.push('settled_or_disputed_payment');
 if(!['failed','expired'].includes(providerStatus))issues.push('provider_not_final');
 return {allowed:issues.length===0,issues,releasesCapacity:issues.length===0};
}
