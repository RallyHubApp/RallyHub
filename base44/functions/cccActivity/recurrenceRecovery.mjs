import {readScopedActivities} from './activityReader.mjs';
/** Read-only, bounded recovery review. Never creates, retries or deletes. */
export async function inspectRecurrenceBatch(entity,source,{tenantId,clubId}={}){
 if(!source?.id||source.tenant_id!==tenantId||source.club_id!==clubId)return {valid:false,reason:'source_scope_mismatch'};
 if(!source.recurrence_batch_key)return {valid:false,reason:'no_batch_claim'};
 const inventory=await readScopedActivities(entity,{tenantId,clubId,pageSize:200,maxPages:25});
 const children=inventory.activities.filter(a=>a.configuration?.recurrence_source_activity_id===source.id);
 const issues=[],weeks=new Set();
 for(const a of children){
  const w=a.configuration?.recurrence_week;
  if(!Number.isSafeInteger(w)||w<1||w>12||weeks.has(w))issues.push('duplicate_or_invalid_week');
  weeks.add(w);
  if(a.status!=='draft'||a.linked_event_id)issues.push('child_not_unlinked_draft');
  if(a.tenant_id!==tenantId||a.club_id!==clubId||a.venue_id!==source.venue_id)issues.push('child_scope_or_venue_mismatch');
  if(!a.idempotency_key?.startsWith('ccc-rec-'+source.id+'-'))issues.push('unexpected_operation_id');
 }
 if(!inventory.complete)issues.push('inventory_incomplete');
 const expected=source.recurrence_expected_count;
 if(!Number.isSafeInteger(expected)||expected<1||expected>12)issues.push('expected_count_unknown');
 else if(children.length!==expected)issues.push('child_count_mismatch');
 if(!['creating','complete','needs_recovery'].includes(source.recurrence_batch_state))issues.push('unknown_batch_state');
 return {valid:true,sourceActivityId:source.id,batchKey:source.recurrence_batch_key,batchState:source.recurrence_batch_state,complete:inventory.complete,expectedCount:source.recurrence_expected_count??null,childCount:children.length,children:children.map(a=>({id:a.id,week:a.configuration?.recurrence_week,status:a.status,startsAt:a.starts_at,endsAt:a.ends_at})).sort((a,b)=>a.week-b.week),issues:[...new Set(issues)],requiresManualReview:source.recurrence_batch_state!=='complete'||issues.length>0,safeToAutoRetry:false,mutationPerformed:false};
}
