/** Internal event payment review. Provider settlement is the financial source of truth. */
const paidStatuses=new Set(['paid','partially_refunded','refunded']);
const cents=v=>Math.round(Number(v||0)*100);
const money=v=>Math.round(v)/100;
export function summariseEventFinance(registrations=[],payments=[]){
 const registrationIds=new Set(registrations.map(r=>r.id).filter(Boolean));
 const groups=new Map();
 for(const p of payments){
  if(!registrationIds.has(p.purpose_id))continue;
  const rows=groups.get(p.purpose_id)||[];rows.push(p);groups.set(p.purpose_id,rows);
 }
 const byRegistration=new Map(),anomalies=[];
 let grossCents=0,refundedCents=0,pendingCents=0,matchedPaymentRecords=0;
 for(const r of registrations){
  const list=groups.get(r.id)||[];
  if(list.length>1)anomalies.push({registrationId:r.id,code:'multiple_payment_records'});
  if(list.length)byRegistration.set(r.id,list[0]);
  matchedPaymentRecords+=list.length;
  const settled=list.filter(p=>paidStatuses.has(p.payment_status));
  if(r.payment_status==='paid'&&!settled.length)anomalies.push({registrationId:r.id,code:'paid_registration_without_matching_payment'});
  if(r.registration_status==='confirmed'&&r.payment_status==='pending')anomalies.push({registrationId:r.id,code:'confirmed_with_pending_payment'});
  for(const p of list){
   const amount=cents(p.amount),refund=cents(p.amount_refunded);
   if(!Number.isFinite(amount)||!Number.isFinite(refund)||amount<0||refund<0)anomalies.push({registrationId:r.id,code:'invalid_payment_amount'});
   if(refund>amount)anomalies.push({registrationId:r.id,code:'refund_exceeds_payment'});
   if(p.payment_status==='pending')pendingCents+=Number.isFinite(amount)?amount:0;
   if(paidStatuses.has(p.payment_status)){grossCents+=Number.isFinite(amount)?amount:0;refundedCents+=Number.isFinite(refund)?refund:0;}
  }
 }
 return {gross:money(grossCents),refunded:money(refundedCents),net:money(grossCents-refundedCents),pending:money(pendingCents),anomalies,matchedPaymentRecords,authoritative:false,byRegistration};
}
