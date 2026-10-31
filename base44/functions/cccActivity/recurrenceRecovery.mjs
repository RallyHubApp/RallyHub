/** Scoped recurrence recovery inspection. Never retries, deletes or publishes. */
export async function inspectRecurrenceBatch(entity,source,{tenantId,clubId,maxPages=20,pageSize=200}={}){
 if(!source?.id||source.tenant_id!==tenantId||source.club_id!==clubId)return {valid:false,reason:'source_scope_mismatch'};
 if(!source.recurrence_batch_key)return {valid:false,reason:'no_batch_claim'};
 const rows=[];let cursor='',complete=false;const seen=new Set();
 for(let page=0;page<maxPages;page++){
  const query={tenant_id:tenantId,club_id:clubId};
  const response=await entity.filter(query,'-created_date',pageSize,cursor||undefined);
  if(!Array.isArray(response))return {valid:false,reason:'inventory_unavailable'};
  for(const row of response){
   if(!row?.id||seen.has(row.id))continue;
   seen.add(row.id);
   if(row.configuration?.recurrence_source_activity_id===source.id&&row.configuration?.recurrence_source_revision===source.revision-1||row.configuration?.recurrence_source_activity_id===source.id&&row.idempotency_key?.startsWith('ccc-rec-'+source.id+'-'))rows.push(row);
  }
  if(response.length<pageSize){complete=true;break}
  const next=response.at(-1)?.id;
  if(!next||next===cursor)return {valid:false,reason:'pagination_stalled'};
  cursor=next;
 }
 const weeks=new Set(),issues=[];
 for(const row of rows){
  const week=row.configuration?.recurrence_week;
  if(!Number.isSafeInteger(week)||week<1||week>12||weeks.has(week))issues.push('duplicate_or_invalid_week');
  weeks.add(week);
  if(row.status!=='draft')issues.push('child_not_draft');
  if(row.linked_event_id)issues.push('child_linked_event');
  if(row.tenant_id!==tenantId||row.club_id!==clubId||row.venue_id!==source.venue_id)issues.push('child_scope_or_venue_mismatch');
 }
 if(!complete)issues.push('inventory_incomplete');
 if(!['creating','complete','needs_recovery'].includes(source.recurrence_batch_state))issues.push('unknown_batch_state');
 return {valid:true,sourceActivityId:source.id,batchKey:source.recurrence_batch_key,batchState:source.recurrence_batch_state,sourceRevision:source.revision,complete,childCount:rows.length,children:rows.map(r=>({id:r.id,week:r.configuration?.recurrence_week,status:r.status,startsAt:r.starts_at,endsAt:r.ends_at})).sort((a,b)=>a.week-b.week),issues:[...new Set(issues)],safeToAutoRetry:false,requiresManualReview:source.recurrence_batch_state!=='complete'||issues.length>0,mutationPerformed:false};
}
