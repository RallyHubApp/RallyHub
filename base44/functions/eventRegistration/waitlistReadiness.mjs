import {occupied} from './rules.js';
/** Advisory only: promotion still requires fresh capacity reservation. */
export function inspectWaitlistReadiness({rows,event,now=Date.now()}={}){
 const issues=[];
 if(!Array.isArray(rows)||!event?.id||!event?.tenant_id||!event?.host_club_id)issues.push('roster_unavailable');
 const list=Array.isArray(rows)?rows:[];
 if(list.some(r=>r.event_id!==event?.id||r.tenant_id!==event?.tenant_id||r.club_id!==event?.host_club_id))issues.push('scope_mismatch');
 const capacity=Number(event?.event_capacity);
 if(!Number.isSafeInteger(capacity)||capacity<1)issues.push('invalid_capacity');
 if(event?.event_waitlist_enabled!==true)issues.push('waitlist_disabled');
 const waiting=list.filter(r=>r.registration_status==='waitlisted').sort((a,b)=>String(a.created_at||a.created_date||'').localeCompare(String(b.created_at||b.created_date||''))||String(a.id).localeCompare(String(b.id)));
 const available=Math.max(0,capacity-occupied(list,now));
 return {ready:issues.length===0&&available>0&&waiting.length>0,issues,available,waiting:waiting.length,next:issues.length===0&&available>0?waiting[0]?.id||null:null,advisoryOnly:true};
}
