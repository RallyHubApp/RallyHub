/** Provider-neutral payment webhook decision; no browser return can settle a booking. */
export function reviewPaymentWebhook({payment,event,registration,seenEventIds=[],expectedRevision}={}){
 const issues=[];
 if(!event?.id||!event.provider||!event.transactionId||!event.status)issues.push('provider_event_invalid');
 if(event?.verified!==true)issues.push('signature_unverified');
 if(!payment?.id||!registration?.id||payment.tenant_id!==registration.tenant_id||payment.club_id!==registration.club_id||payment.purpose_id!==registration.id)issues.push('payment_scope_mismatch');
 if(payment?.provider!==event?.provider||payment?.provider_transaction_id!==event?.transactionId)issues.push('transaction_mismatch');
 if(!Number.isSafeInteger(expectedRevision)||expectedRevision!==Number(payment?.revision||0))issues.push('stale_revision');
 if(seenEventIds.includes(event?.id))return issues.length?{allowed:false,issues}:{allowed:true,idempotent:true,mutation:false};
 if(!['paid','failed','refunded'].includes(event?.status))issues.push('unsupported_status');
 if(event?.status==='paid'&&(!Number.isFinite(event.amount)||event.amount!==payment?.amount||event.currency!==payment?.currency))issues.push('amount_currency_mismatch');
 if(event?.status==='paid'&&registration?.registration_status!=='approved_payment_hold')issues.push('booking_not_held');
 if(event?.status==='paid'&&registration?.hold_expires_at&&(!Number.isFinite(Date.parse(registration.hold_expires_at))||Date.parse(registration.hold_expires_at)<=Date.now()))issues.push('booking_hold_expired');
 if(event?.status==='paid'&&payment?.payment_status==='paid')issues.push('already_settled_different_event');
 if(event?.status==='refunded'&&!['paid','refund_pending'].includes(payment?.payment_status))issues.push('refund_not_authorised');
 if(issues.length)return {allowed:false,issues:[...new Set(issues)]};
 return {allowed:true,idempotent:false,mutation:true,paymentStatus:event.status,registrationStatus:event.status==='paid'?'confirmed':event.status==='failed'?'payment_failed':undefined,atomicConditions:{id:payment.id,tenant_id:payment.tenant_id,club_id:payment.club_id,revision:expectedRevision},eventId:event.id,auditAction:`ccc.payment.${event.status}`};
}
