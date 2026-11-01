import {refundRemaining} from './scopedRefundReader.mjs';
/** Only a fully reconciled refund can release a confirmed paid booking. */
export function reviewRefundedBookingClosure({registration,payment,refunds,event}={}){
 const issues=[];
 if(!registration?.id||registration.event_id!==event?.id||registration.tenant_id!==event?.tenant_id||registration.club_id!==event?.host_club_id)issues.push('registration_scope');
 if(!payment?.id||payment.purpose_type!=='event'||payment.purpose_id!==registration?.id||payment.tenant_id!==event?.tenant_id||payment.club_id!==event?.host_club_id)issues.push('payment_scope');
 if(registration?.registration_status!=='confirmed')issues.push('not_confirmed');
 if(registration?.payment_status!=='refunded'||payment?.payment_status!=='refunded')issues.push('refund_not_complete');
 if(!Array.isArray(refunds))issues.push('refund_history_unavailable');
 const history=Array.isArray(refunds)?refunds:[];
 if(history.some(r=>r.payment_record_id!==payment?.id||r.tenant_id!==event?.tenant_id||r.club_id!==event?.host_club_id))issues.push('refund_scope');
 if(history.some(r=>r.status!=='succeeded'))issues.push('unresolved_refund');
 if(payment?.id){const balance=refundRemaining(payment,history);if(balance.blocked||balance.remaining!==0)issues.push('refund_ledger_mismatch')}
 return {allowed:issues.length===0,issues};
}
