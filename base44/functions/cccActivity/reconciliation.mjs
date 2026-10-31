/** Internal event payment review only. Provider settlement remains authoritative. */
const settled=new Set(['paid','partially_refunded','refunded']);
const asCents=value=>{
 if(typeof value!=='number'&&typeof value!=='string')return null;
 if(typeof value==='string'&&!/^\d+(?:\.\d{1,2})?$/.test(value.trim()))return null;
 const n=Number(value);
 if(!Number.isFinite(n)||n<0||!Number.isSafeInteger(Math.round(n*100))||Math.abs(n*100-Math.round(n*100))>1e-7)return null;
 return Math.round(n*100);
};
const euros=value=>value/100;
export function summariseEventFinance(registrations=[],payments=[]){
 const ids=new Set(registrations.map(r=>r.id).filter(Boolean)),groups=new Map(),anomalies=[];
 for(const p of payments){
  if(!ids.has(p.purpose_id))continue;
  const group=groups.get(p.purpose_id)||[];group.push(p);groups.set(p.purpose_id,group);
 }
 const byRegistration=new Map();let gross=0,refunded=0,pending=0,matchedPaymentRecords=0,excludedPaymentRecords=0;
 for(const r of registrations){
  const list=groups.get(r.id)||[];matchedPaymentRecords+=list.length;
  if(list.length>1)anomalies.push({registrationId:r.id,code:'multiple_payment_records'});
  if(list.length)byRegistration.set(r.id,list.find(p=>settled.has(p.payment_status))||list[0]);
  const paid=list.filter(p=>settled.has(p.payment_status));
  if(r.payment_status==='paid'&&!paid.length)anomalies.push({registrationId:r.id,code:'paid_registration_without_matching_payment'});
  if(r.registration_status==='confirmed'&&r.payment_status==='pending')anomalies.push({registrationId:r.id,code:'confirmed_with_pending_payment'});
  const transactionIds=new Set();
  for(const p of list){
   const amount=asCents(p.amount),refund=asCents(p.amount_refunded??0);
   if(amount===null||refund===null){anomalies.push({registrationId:r.id,code:'invalid_payment_amount'});excludedPaymentRecords++;continue;}
   if(refund>amount){anomalies.push({registrationId:r.id,code:'refund_exceeds_payment'});excludedPaymentRecords++;continue;}
   const currency=String(p.currency||'EUR').trim().toUpperCase();
   if(currency!=='EUR'){anomalies.push({registrationId:r.id,code:'currency_mismatch'});excludedPaymentRecords++;continue;}
   const transaction=String(p.provider_transaction_id||p.sumup_transaction_id||p.transaction_id||'').trim();
   if(settled.has(p.payment_status)&&transaction){
    if(transactionIds.has(transaction)){anomalies.push({registrationId:r.id,code:'duplicate_provider_transaction'});excludedPaymentRecords++;continue;}
    transactionIds.add(transaction);
   }
   if(p.payment_status==='pending')pending+=amount;
   if(settled.has(p.payment_status)){gross+=amount;refunded+=refund;}
  }
 }
 return {gross:euros(gross),refunded:euros(refunded),net:euros(gross-refunded),pending:euros(pending),anomalies,matchedPaymentRecords,excludedPaymentRecords,authoritative:false,byRegistration};
}
