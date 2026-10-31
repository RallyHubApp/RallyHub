/** Complete refund history is required before issuing another refund. */
export async function readPaymentRefundHistory(entity,{paymentId,tenantId,clubId,pageSize=200,maxPages=20}){
 if(!paymentId||!tenantId||!clubId)throw Error('Refund scope required');
 const query={payment_record_id:paymentId,tenant_id:tenantId,club_id:clubId};
 const refunds=[],seen=new Set();let cursor,hasMore=false,pages=0;
 do{
  const options={sort:'-requested_at',limit:pageSize};if(cursor)options.cursor=cursor;
  const page=await entity.filter(query,options);
  if(!page||!Array.isArray(page.items))throw Error('Refund history pagination unavailable');
  for(const row of page.items){if(!row?.id)throw Error('Refund history record missing ID');if(!seen.has(row.id)){seen.add(row.id);refunds.push(row)}}
  pages++;hasMore=page.has_more===true;if(!hasMore)break;
  if(!page.next_cursor||page.next_cursor===cursor)throw Error('Refund history pagination stalled');
  cursor=page.next_cursor;
 }while(pages<maxPages);
 if(hasMore)throw Error('Refund history verification exceeds safety limit');
 return refunds;
}
export function refundRemaining(payment,refunds){
 if(refunds.some(r=>['processing','needs_reconciliation','unknown'].includes(r.status)))return {remaining:0,blocked:'unresolved_refund'};
 const succeeded=refunds.filter(r=>r.status==='succeeded').reduce((sum,r)=>sum+Math.round(Number(r.amount||0)*100),0);
 const amount=Math.round(Number(payment.amount||0)*100);
 const recorded=Math.round(Number(payment.amount_refunded||0)*100);
 if(!Number.isSafeInteger(amount)||amount<=0||!Number.isSafeInteger(succeeded)||succeeded<0||!Number.isSafeInteger(recorded)||recorded<0)return {remaining:0,blocked:'invalid_refund_amount'};
 if(succeeded>amount||recorded>amount)return {remaining:0,blocked:'over_refunded'};
 if(recorded!==succeeded)return {remaining:0,blocked:'refund_ledger_mismatch'};
 return {remaining:(amount-succeeded)/100,blocked:null};
}
