/** Read-only, club-scoped operational overview. Partial reads never imply complete totals. */
const actionable=new Set(['draft','ready','scheduled','registration_open','registration_closed','in_progress']);
const validStatuses=new Set(['draft','ready','scheduled','registration_open','registration_closed','in_progress','completed','cancelled','archived']);
export function summariseClubOperations(activities=[],{complete=true,now=new Date().toISOString()}={}){
 const counts=Object.fromEntries([...validStatuses].map(k=>[k,0]));
 const alerts=[],upcoming=[],recent=[],seen=new Set();
 const addAlert=(a,code)=>alerts.push({activityId:a.id,activityTitle:String(a.title||'Untitled activity').slice(0,160),code});
 for(const a of activities){
  if(!a?.id||seen.has(a.id))continue;seen.add(a.id);
  if(validStatuses.has(a.status))counts[a.status]++;
  if(a.recurrence_batch_state==='needs_recovery')addAlert(a,'recurrence_batch_needs_recovery');
  if(a.recurrence_batch_state==='creating')addAlert(a,'recurrence_batch_creation_unverified');
  if(a.recurrence_batch_key&&(!Number.isSafeInteger(a.recurrence_expected_count)||a.recurrence_expected_count<1||a.recurrence_expected_count>12))addAlert(a,'recurrence_expected_count_invalid');
  if(!validStatuses.has(a.status))addAlert(a,'unknown_activity_status');
  const start=Date.parse(a.starts_at),end=Date.parse(a.ends_at);
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start){addAlert(a,'invalid_schedule');continue;}
  if(actionable.has(a.status)&&!a.linked_event_id&&['scheduled','registration_open','registration_closed','in_progress'].includes(a.status))addAlert(a,'missing_event_link');
  if(a.linked_event_id&&a.bridge_status!=='verified'&&['scheduled','registration_open','registration_closed','in_progress'].includes(a.status))addAlert(a,'event_link_not_verified');
  if(['registration_open','scheduled'].includes(a.status)&&end<Date.parse(now))addAlert(a,'past_activity_not_closed');
  const item={id:a.id,title:String(a.title||'Untitled activity').slice(0,160),status:a.status,startsAt:a.starts_at,endsAt:a.ends_at,venueId:a.venue_id||'',linkedEventId:a.linked_event_id||'',bridgeStatus:a.bridge_status||'unverified'};
  if(end>=Date.parse(now)&&actionable.has(a.status))upcoming.push(item);
  else if(['completed','cancelled'].includes(a.status))recent.push(item);
 }
 upcoming.sort((a,b)=>a.startsAt.localeCompare(b.startsAt)||a.id.localeCompare(b.id));
 recent.sort((a,b)=>b.startsAt.localeCompare(a.startsAt)||a.id.localeCompare(b.id));
 return {counts,total:seen.size,upcomingCount:upcoming.length,recentCount:recent.length,upcoming:upcoming.slice(0,20),recent:recent.slice(0,10),alerts:alerts.slice(0,100),alertCount:alerts.length,complete,resultsMayBeTruncated:!complete,financialTotalsIncluded:false,bookingTotalsIncluded:false};
}
