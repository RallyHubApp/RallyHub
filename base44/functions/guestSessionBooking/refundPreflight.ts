/** Fail closed on incomplete or ambiguous refund history. The provider call must never be retried blindly. */
export function guestRefundPreflight({booking,payment,history,tenantId,clubId,amount}:any){
 const issues:string[]=[];
 if(!booking?.id||booking.tenant_id!==tenantId||booking.club_id!==clubId)issues.push('booking_scope');
 if(!payment?.id||payment.purpose_type!=='booking'||payment.purpose_id!==booking?.id||payment.tenant_id!==tenantId||payment.club_id!==clubId)issues.push('payment_scope');
 if(!Array.isArray(history))issues.push('history_unavailable');
 const rows=Array.isArray(history)?history:[];
 if(rows.length>=100)issues.push('history_incomplete');
 if(rows.some((r:any)=>r.payment_record_id!==payment?.id||r.tenant_id!==tenantId||r.club_id!==clubId))issues.push('history_scope');
 if(rows.some((r:any)=>['processing','pending','requested','unknown'].includes(String(r.status||''))))issues.push('unresolved_refund');
 const succeeded=rows.filter((r:any)=>r.status==='succeeded').reduce((sum:number,r:any)=>sum+Number(r.amount||0),0);
 const original=Number(payment?.amount);
 const remaining=Math.round((original-succeeded)*100)/100;
 if(!Number.isFinite(original)||original<=0||!Number.isFinite(remaining)||remaining<0)issues.push('invalid_amount');
 if(!Number.isFinite(amount)||amount<=0||amount>remaining)issues.push('amount_exceeds_remaining');
 return {allowed:issues.length===0,issues,remaining:Math.max(0,remaining),alreadyRefunded:succeeded};
}
