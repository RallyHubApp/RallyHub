const paidStatuses=new Set(['paid','partially_refunded','refunded']);
const cents=v=>Math.round(Number(v||0)*100);
export function summariseEventFinance(registrations=[],payments=[]){
 const registrationIds=new Set(registrations.map(r=>r.id));
 const byRegistration=new Map();
 const duplicates=new Set();
 for(const p of payments){if(!registrationIds.has(p.purpose_id))continue;if(byRegistration.has(p.purpose_id)){duplicates.add(p.purpose_id);continue}byRegistration.set(p.purpose_id,p)}
 const matched=[...byRegistration.values()];
 const grossCents=matched.filter(p=>paidStatuses.has(p.payment_status)).reduce((n,p)=>n+cents(p.amount),0);
 const refundedCents=matched.filter(p=>paidStatuses.has(p.payment_status)).reduce((n,p)=>n+cents(p.amount_refunded),0);
 const pendingCents=matched.filter(p=>p.payment_status==='pending').reduce((n,p)=>n+cents(p.amount),0);
 const anomalies=[];
 for(const r of registrations){
  const p=byRegistration.get(r.id);
  if(duplicates.has(r.id))anomalies.push({registrationId:r.id,code:'multiple_payment_records'});
  if(r.payment_status==='paid'&&(!p||!paidStatuses.has(p.payment_status)))anomalies.push({registrationId:r.id,code:'paid_registration_without_matching_payment'});
  if(p&&cents(p.amount_refunded)>cents(p.amount))anomalies.push({registrationId:r.id,code:'refund_exceeds_payment'});
  if(r.registration_status==='confirmed'&&r.payment_status==='pending')anomalies.push({registrationId:r.id,code:'confirmed_with_pending_payment'});
 }
 return {gross:grossCents/100,refunded:refundedCents/100,net:(grossCents-refundedCents)/100,pending:pendingCents/100,anomalies,matchedPaymentRecords:matched.length,authoritative:false,byRegistration};
}
