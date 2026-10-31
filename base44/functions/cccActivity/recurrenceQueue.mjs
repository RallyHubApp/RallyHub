import {readScopedActivities} from './activityReader.mjs';
import {reviewDraftResourceCollisions} from './recurrenceCollisionReview.mjs';
import {reviewRecurrenceIntegrity} from './recurrenceIntegrity.mjs';
/** Club-scoped operational queue, with no personal data or mutations. */
export async function readRecurrenceQueue(entity,{tenantId,clubId}={}){
 if(!tenantId||!clubId)throw Error('Tenant and club scope required');
 const inventory=await readScopedActivities(entity,{tenantId,clubId,pageSize:200,maxPages:25});
 const batches=inventory.activities.filter(a=>a.recurrence_batch_key).map(a=>({
  id:a.id,title:a.title||'Untitled activity',venueId:a.venue_id,
  state:a.recurrence_batch_state||'unknown',expectedCount:a.recurrence_expected_count??null,
  revision:a.revision,startsAt:a.starts_at,batchKey:a.recurrence_batch_key,
  integrity:reviewRecurrenceIntegrity(a,inventory.activities.filter(child=>child.configuration?.recurrence_source_activity_id===a.id),{inventoryComplete:inventory.complete})
 }));
 const counts={creating:0,needs_recovery:0,complete:0,unknown:0};
 for(const b of batches)counts[b.state]===undefined?counts.unknown++:counts[b.state]++;
 const draftCollisions=reviewDraftResourceCollisions(inventory.activities,{complete:inventory.complete});
 return {complete:inventory.complete,total:batches.length,counts,draftCollisions,batches:batches.sort((a,b)=>Number(a.state!=='needs_recovery')-Number(b.state!=='needs_recovery')||String(a.startsAt||'').localeCompare(String(b.startsAt||''))),mutationPerformed:false};
}
