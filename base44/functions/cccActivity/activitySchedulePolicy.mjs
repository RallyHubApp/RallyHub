/** Exact venue ID, half-open time windows; no cross-tenant schedule reads. */
const blockingStatuses=new Set(['ready','scheduled','registration_open','registration_closed','in_progress']);
export function activityScheduleConflicts(candidate,activities=[]){
 const start=Date.parse(candidate?.starts_at),end=Date.parse(candidate?.ends_at);
 if(!candidate?.tenant_id||!candidate?.club_id||!candidate?.venue_id||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return {valid:false,conflicts:[]};
 const conflicts=[];
 for(const a of activities){
  if(!a?.id||a.id===candidate.id||a.tenant_id!==candidate.tenant_id||a.club_id!==candidate.club_id||a.venue_id!==candidate.venue_id||!blockingStatuses.has(a.status))continue;
  const otherStart=Date.parse(a.starts_at),otherEnd=Date.parse(a.ends_at);
  if(!Number.isFinite(otherStart)||!Number.isFinite(otherEnd))continue;
  // An unassigned court reserves the entire venue. Distinct explicit courts may overlap.
  if(candidate.court_id&&a.court_id&&candidate.court_id!==a.court_id)continue;
  if(start<otherEnd&&otherStart<end)conflicts.push({activityId:a.id,status:a.status});
 }
 return {valid:true,conflicts};
}
