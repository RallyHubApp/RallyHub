const confirmed=new Set(['confirmed','cash_confirmed']);
const resolved=new Set(['attended','no_show','excused']);
/** Deterministic reconciliation of the loaded registration pages only. */
export function reconcileEventAttendance(registrations=[],{hasMore=false}={}){
 const seen=new Set(),queue=[],counts={confirmed:0,attended:0,noShow:0,excused:0,unmarked:0,notEligible:0,duplicateIds:0};
 for(const r of registrations){
  if(!r?.id)continue;
  if(seen.has(r.id)){counts.duplicateIds++;continue}
  seen.add(r.id);
  if(!confirmed.has(r.status)){counts.notEligible++;continue}
  counts.confirmed++;
  const state=r.attendance||'not_marked';
  if(state==='attended')counts.attended++;
  else if(state==='no_show')counts.noShow++;
  else if(state==='excused')counts.excused++;
  else {counts.unmarked++;queue.push({id:r.id,name:r.name||'Unnamed participant',email:r.email||'',mobile:r.mobile||'',attendanceRevision:r.attendanceRevision,status:r.status})}
 }
 return {counts,queue,complete:!hasMore&&counts.duplicateIds===0,requiresReview:hasMore||counts.duplicateIds>0||counts.unmarked>0,closed:!hasMore&&counts.duplicateIds===0&&counts.unmarked===0,allPagesLoaded:!hasMore};
}
