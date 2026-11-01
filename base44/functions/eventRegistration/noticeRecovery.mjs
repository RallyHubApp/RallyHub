import {EVENT_NOTICE_TYPES} from './notificationPolicy.js';
/** Advisory notice-recovery triage. Never re-sends automatically. */
export function reviewEventNoticeRecovery({event,rows,noticeType='booking_confirmed'}={}){
 if(!event?.id||!event.tenant_id||!event.host_club_id||!Array.isArray(rows)||!EVENT_NOTICE_TYPES.includes(noticeType))throw Error('Valid scoped notice review required');
 const seen=new Set(),tasks=[];
 for(const r of rows){
  if(!r?.id||seen.has(r.id)||r.event_id!==event.id||r.tenant_id!==event.tenant_id||r.club_id!==event.host_club_id)throw Error('Registration scope mismatch');seen.add(r.id);
  const email=String(r.email||'').trim();const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const status=r.registration_status,payment=r.payment_status;
  const allowed=noticeType==='booking_confirmed'?status==='confirmed'&&payment==='paid':noticeType==='payment_required'?status==='approved_payment_hold'&&payment==='pending'&&!!r.payment_checkout_id:noticeType==='booking_cancelled'?status==='cancelled':noticeType==='waitlist_joined'?status==='waitlisted':noticeType==='place_available'?status==='pending_approval':noticeType==='refund_confirmed'?payment==='refunded':noticeType==='event_reminder'?status==='confirmed':noticeType==='application_received'||noticeType==='approval_required'?status==='pending_approval':false;
  if(allowed||!validEmail){tasks.push({registrationId:r.id,noticeType,eligible:allowed&&validEmail,reason:!validEmail?'recipient_missing_or_invalid':allowed?'manual_delivery_review_required':'status_not_eligible',requiresApprovedPreview:true,requiresDeliveryAudit:true});}
 }
 return {noticeType,tasks,eligible:tasks.filter(t=>t.eligible).length,blocked:tasks.filter(t=>!t.eligible).length,previewOnly:true,warning:'Email transport outcome and prior sends are not verified. Do not resend without a delivery audit.'};
}
