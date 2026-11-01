/** Deterministic, fair, scoped waitlist promotion preflight. */
import {occupied} from './rules.js';
export function reviewWaitlistPromotion({rows,event,registrationId,now=Date.now()}={}){
 const issues=[];
 if(!event?.id||!event?.tenant_id||!event?.host_club_id||!Number.isSafeInteger(Number(event.event_capacity))||Number(event.event_capacity)<1)issues.push('event_scope_or_capacity');
 if(!Array.isArray(rows))issues.push('roster_incomplete');
 const scoped=Array.isArray(rows)?rows:[];
 if(scoped.some(r=>r.event_id!==event?.id||r.tenant_id!==event?.tenant_id||r.club_id!==event?.host_club_id))issues.push('registration_scope');
 const candidate=scoped.find(r=>r.id===registrationId);
 if(!candidate||candidate.registration_status!=='waitlisted')issues.push('not_waitlisted');
 const queue=scoped.filter(r=>r.registration_status==='waitlisted').sort((a,b)=>String(a.created_at||a.created_date||'').localeCompare(String(b.created_at||b.created_date||''))||String(a.id).localeCompare(String(b.id)));
 if(candidate&&queue[0]?.id!==candidate.id)issues.push('earlier_waitlist_candidate');
 const used=occupied(scoped,now);
 if(used>=Number(event?.event_capacity||0))issues.push('no_verified_capacity');
 if(event?.event_waitlist_enabled!==true)issues.push('waitlist_disabled');
 return {allowed:issues.length===0,issues,candidate:issues.length===0?candidate:null,occupied:used,capacity:Number(event?.event_capacity||0),queuePosition:queue.findIndex(r=>r.id===registrationId)+1};
}
