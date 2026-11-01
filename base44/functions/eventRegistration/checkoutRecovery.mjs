/** Provider checkout recovery preview: no payment or registration mutations. */
export function reviewCheckoutRecovery({event,rows,payments}={}){
 if(!event?.id||!event.tenant_id||!event.host_club_id||!Array.isArray(rows)||!Array.isArray(payments))throw Error('Complete event checkout snapshot required');
 const ids=new Set();for(const r of rows){if(!r?.id||ids.has(r.id)||r.event_id!==event.id||r.tenant_id!==event.tenant_id||r.club_id!==event.host_club_id)throw Error('Invalid scoped registration');ids.add(r.id)}
 const byRegistration=new Map();for(const p of payments){if(!p?.id||p.tenant_id!==event.tenant_id||p.club_id!==event.host_club_id||p.purpose_type!=='event'||!ids.has(p.purpose_id))throw Error('Invalid scoped payment');const group=byRegistration.get(p.purpose_id)||[];group.push(p);byRegistration.set(p.purpose_id,group)}
 const tasks=[];
 for(const r of rows){const group=byRegistration.get(r.id)||[];const checkout=String(r.payment_checkout_id||'').trim();if(!checkout)continue;
  const matches=group.filter(p=>p.provider_checkout_id===checkout);
  const unresolved=group.some(p=>['refund_pending','needs_reconciliation','unknown','disputed','chargeback'].includes(p.payment_status));
  const settled=group.some(p=>['paid','refunded','partially_refunded'].includes(p.payment_status)||!!p.provider_transaction_id);
  const conflicts=group.length>1||matches.length!==1||unresolved||group.some(p=>p.provider_checkout_id!==checkout);
  const eligible=r.registration_status==='approved_payment_hold'&&r.payment_status==='pending'&&!conflicts&&!settled&&matches[0]?.payment_status==='pending';
  const issue=conflicts?'ledger_conflict':settled&&r.registration_status!=='confirmed'?'settled_requires_manual_reconciliation':eligible?'provider_verification_available':r.registration_status==='confirmed'?'already_confirmed':'manual_review';
  if(issue!=='already_confirmed')tasks.push({registrationId:r.id,issue,checkoutId:checkout,action:eligible?'admin_verify':null,requiresProviderCheck:eligible,manualReview:!eligible});
 }
 return {tasks,verifyReady:tasks.filter(x=>x.action).length,manualReview:tasks.filter(x=>x.manualReview).length,previewOnly:true};
}
