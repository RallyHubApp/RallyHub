import {occupied} from './rules.js';
import {inspectWaitlistReadiness} from './waitlistReadiness.mjs';
/** Full scoped snapshot. Recommendations are read-only, not payment-provider verification. */
export function reviewEventOperations({event,rows,payments,now=Date.now()}={}){
 if(!event?.id||!event.tenant_id||!event.host_club_id||!Array.isArray(rows)||!Array.isArray(payments))throw Error('Complete scoped event snapshot required');
 if(rows.some(r=>r.event_id!==event.id||r.tenant_id!==event.tenant_id||r.club_id!==event.host_club_id))throw Error('Registration scope mismatch');
 const ids=new Set(rows.map(r=>r.id));
 if(ids.size!==rows.length)throw Error('Duplicate registration identifiers');
 if(payments.some(p=>p.tenant_id!==event.tenant_id||p.club_id!==event.host_club_id||p.purpose_type!=='event'||!ids.has(p.purpose_id)))throw Error('Payment scope mismatch');
 const ledger=new Map();for(const p of payments){const group=ledger.get(p.purpose_id)||[];group.push(p);ledger.set(p.purpose_id,group)}
 const queue=[];
 const add=(r,code,priority,description)=>queue.push({registrationId:r.id,code,priority,description});
 for(const r of rows){
  const group=ledger.get(r.id)||[];
  if(r.registration_status==='approved_payment_hold'){
   const expiry=Date.parse(r.payment_hold_expires_at||'');
   if(!Number.isFinite(expiry))add(r,'hold_expiry_missing',1,'Review missing hold expiry and payment ledger');
   else if(expiry<=now)add(r,'expired_hold_verify_provider',2,'Verify SumUp checkout before releasing capacity');
   if(!r.payment_checkout_id||group.length!==1||group.some(p=>p.provider_checkout_id!==r.payment_checkout_id))add(r,'checkout_ledger_mismatch',1,'Reconcile checkout and payment record');
  }
  if(r.registration_status==='confirmed'&&r.payment_status==='refunded')add(r,'refunded_booking_closure',2,'Verify full refund history before closing booking');
  if(r.payment_status==='paid'&&r.registration_status!=='confirmed')add(r,'paid_booking_not_confirmed',1,'Reconcile payment and booking status');
  if(group.some(p=>['refund_pending','needs_reconciliation','unknown','disputed','chargeback'].includes(p.payment_status)))add(r,'payment_reconciliation',1,'Review unresolved payment or refund');
  if(group.length>1)add(r,'multiple_payment_records',1,'Review multiple payment records before action');
 }
 const reserved=Number(event.event_reserved_count);
 const active=occupied(rows,now);
 const capacityIssue=!Number.isSafeInteger(reserved)||reserved!==active;
 const waiting=inspectWaitlistReadiness({rows,event,now});
 if(capacityIssue)queue.unshift({registrationId:null,code:'capacity_counter_mismatch',priority:1,description:'Reconcile reserved counter against active bookings before new offers'});
 queue.sort((a,b)=>a.priority-b.priority||String(a.registrationId||'').localeCompare(String(b.registrationId||''))||a.code.localeCompare(b.code));
 return {total:rows.length,active,reserved:Number.isSafeInteger(reserved)?reserved:null,capacityIssue,queue,summary:{critical:queue.filter(x=>x.priority===1).length,review:queue.filter(x=>x.priority===2).length},waitlist:{...waiting,ready:waiting.ready&&!capacityIssue,issues:capacityIssue?[...waiting.issues,'capacity_counter_mismatch']:waiting.issues},previewOnly:true};
}
