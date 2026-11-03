/** v2.1 deterministic registration approval, waitlist and payment-hold contract.
 * Caller must commit revisions and capacity reservations atomically in the backend.
 */
const OPEN=new Set(['requested','waitlisted','approved_payment_hold','confirmed','cash_confirmed']);
const FINAL=new Set(['cancelled','declined','expired']);
const REQUESTED=new Set(['requested','pending_approval']);
export function reviewRegistrationAction({registration,action,expectedRevision,actor,capacity,registrations=[],now=Date.now(),holdMinutes=15}={}){
 const issues=[];
 if(!registration?.id||!registration.tenant_id||!registration.club_id||!registration.event_id)issues.push('registration_scope_required');
 if(!actor?.id||actor.tenant_id!==registration?.tenant_id||actor.club_id!==registration?.club_id||!['club_admin','host','super_admin'].includes(actor.role))issues.push('actor_denied');
 if(!Number.isSafeInteger(expectedRevision)||expectedRevision!==Number(registration?.revision||0))issues.push('stale_revision');
 if(!Number.isSafeInteger(capacity)||capacity<1)issues.push('invalid_capacity');
 if(!['approve','decline','cancel','promote','expire'].includes(action))issues.push('unsupported_action');
 const status=registration?.registration_status;
 if(action==='approve'&&!REQUESTED.has(status))issues.push('invalid_state');
 if(action==='promote'&&status!=='waitlisted')issues.push('invalid_state');
 if(action==='decline'&&!['requested','waitlisted'].includes(status))issues.push('invalid_state');
 if(action==='cancel'&&!OPEN.has(status))issues.push('invalid_state');
 if(action==='expire'&&status!=='approved_payment_hold')issues.push('invalid_state');
 const active=registrations.filter(r=>r?.id!==registration?.id&&r?.tenant_id===registration?.tenant_id&&r?.club_id===registration?.club_id&&r?.event_id===registration?.event_id&&['confirmed','cash_confirmed','approved_payment_hold'].includes(r.registration_status)&&(!r.hold_expires_at||Date.parse(r.hold_expires_at)>now)).length;
 if(['approve','promote'].includes(action)&&Number.isSafeInteger(capacity)&&active>=capacity)issues.push('capacity_exhausted');
 if(action==='promote'){
  const queue=registrations.filter(r=>r?.tenant_id===registration?.tenant_id&&r?.club_id===registration?.club_id&&r?.event_id===registration?.event_id&&r.registration_status==='waitlisted').sort((a,b)=>Date.parse(a.requested_at||a.created_date||0)-Date.parse(b.requested_at||b.created_date||0)||String(a.id).localeCompare(String(b.id)));
  if(queue[0]?.id!==registration?.id)issues.push('waitlist_order_violation');
 }
 if(action==='expire'&&(!Number.isFinite(Date.parse(registration?.hold_expires_at))||Date.parse(registration.hold_expires_at)>now))issues.push('hold_not_expired');
 if(issues.length)return {allowed:false,issues:[...new Set(issues)]};
 const paid=registration.payment_required===true;
 const nextStatus=action==='decline'?'declined':action==='cancel'?'cancelled':action==='expire'?'expired':paid?'approved_payment_hold':'confirmed';
 const next={registration_status:nextStatus,revision:expectedRevision+1};
 if(['approve','promote'].includes(action)&&paid)next.hold_expires_at=new Date(now+holdMinutes*60000).toISOString();
 return {allowed:true,issues:[],next,atomicConditions:{id:registration.id,tenant_id:registration.tenant_id,club_id:registration.club_id,event_id:registration.event_id,revision:expectedRevision},requiresAtomicCapacityCheck:['approve','promote'].includes(action),auditAction:`ccc.registration.${action}`};
}
