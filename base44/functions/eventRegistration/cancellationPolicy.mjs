import {occupied} from './rules.js';
/** Cancellation is safe only for unpaid registrations; paid cases require refund reconciliation. */
export function reviewEventCancellation({rows,event,registrationId,now=Date.now()}={}){
 const issues=[];
 if(!Array.isArray(rows)||!event?.id||!event?.tenant_id||!event?.host_club_id)issues.push('roster_or_event_unavailable');
 const scoped=Array.isArray(rows)?rows:[];
 if(scoped.some(r=>r.event_id!==event?.id||r.tenant_id!==event?.tenant_id||r.club_id!==event?.host_club_id))issues.push('registration_scope');
 const row=scoped.find(r=>r.id===registrationId);
 if(!row)issues.push('registration_not_found');
 if(row&&['cancelled','declined','expired'].includes(row.registration_status))issues.push('already_inactive');
 if(row&&!['waitlisted','pending_approval','approved_payment_hold'].includes(row.registration_status))issues.push('requires_refund_or_manual_review');
 if(row&&!['not_required','pending','unpaid',null,undefined].includes(row.payment_status))issues.push('payment_needs_reconciliation');
 if(row?.payment_transaction_id)issues.push('provider_payment_present');
 if(row?.registration_status==='approved_payment_hold'&&row?.payment_checkout_id)issues.push('checkout_requires_provider_verification');
 const releasesCapacity=!!row&&['pending_approval','approved_payment_hold'].includes(row.registration_status)&&(row.registration_status!=='approved_payment_hold'||Date.parse(row.payment_hold_expires_at)>now);
 return {allowed:issues.length===0,issues,row:issues.length===0?row:null,releasesCapacity,occupied:occupied(scoped,now)};
}
