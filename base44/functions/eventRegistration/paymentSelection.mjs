/** Pick only a provably refundable event payment. Never refund a pending/failed retry. */
const REFUNDABLE=new Set(['paid','partially_refunded','refund_failed']);
export function selectRefundableEventPayment(payments,registration){
 if((payments||[]).some(p=>p?.purpose_id===registration.id&&p.payment_status==='refund_pending'))return {payment:null,reason:'refund_in_progress'};
 const rows=(payments||[]).filter(p=>p&&p.purpose_id===registration.id&&REFUNDABLE.has(p.payment_status));
 if(!rows.length)return {payment:null,reason:'no_refundable_payment'};
 const exact=rows.filter(p=>registration.payment_record_id&&p.id===registration.payment_record_id);
 const chosen=exact.length===1?exact:rows;
 if(chosen.length!==1)return {payment:null,reason:'ambiguous_refundable_payments'};
 const payment=chosen[0];
 if(registration.payment_checkout_id&&payment.provider_checkout_id&&registration.payment_checkout_id!==payment.provider_checkout_id)return {payment:null,reason:'checkout_mismatch'};
 const transactionId=String(payment.provider_transaction_id||registration.payment_transaction_id||'').trim();
 if(!transactionId)return {payment:null,reason:'missing_transaction'};
 const amount=Number(payment.amount),refunded=Number(payment.amount_refunded||0);
 if(!Number.isFinite(amount)||!Number.isFinite(refunded)||amount<=0||refunded<0||refunded>=amount)return {payment:null,reason:'invalid_refundable_amount'};
 return {payment,reason:null};
}
export function selectCheckoutPayment(payments,registration){
 const rows=(payments||[]).filter(p=>p&&p.purpose_id===registration.id&&p.provider_checkout_id===registration.payment_checkout_id);
 if(!registration.payment_checkout_id)return {payment:null,reason:'missing_checkout'};
 if(rows.length>1)return {payment:null,reason:'ambiguous_checkout_payments'};
 return {payment:rows[0]||null,reason:null};
}
