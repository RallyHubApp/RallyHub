/** Creates draft-only recurrence under a compare-and-set claim on the source.
 * Never books venue slots or publishes anything. On partial failure it retains
 * the claim for explicit reconciliation; no automatic blind retry.
 */
export async function createRecurrenceDraftBatch(entity,{source,manifest,batchKey,userId,drafts,audit}){
 const {id,tenant_id,club_id,revision}=source;
 if(!/^ccc-batch-[a-zA-Z0-9_-]{8,80}$/.test(batchKey)||!manifest.valid||!drafts.length||drafts.length!==manifest.rows.length)throw Error('Invalid batch');
 if(source.status!=='draft'||source.linked_event_id||source.recurrence_batch_key)throw Error('Source is not available for recurrence');
 const claim=await entity.updateMany({id,tenant_id,club_id,status:'draft',revision,recurrence_batch_key:{$exists:false}},{$set:{recurrence_batch_key:batchKey,recurrence_batch_state:'creating',recurrence_expected_count:drafts.length,revision:revision+1,updated_by_user_id:userId}});
 if(claim.updated!==1)return {success:false,reason:'concurrent_claim',createdIds:[]};
 const createdIds=[];
 try{
  for(const draft of drafts){
   const existing=await entity.filter({tenant_id,club_id,idempotency_key:draft.idempotency_key},'-created_date',2);
   if(existing?.length)throw Error('Existing operation ID requires reconciliation');
   const created=await entity.create(draft);
   if(!created?.id)throw Error('Create result missing ID');
   createdIds.push(created.id);
  }
  const done=await entity.updateMany({id,tenant_id,club_id,recurrence_batch_key:batchKey,recurrence_batch_state:'creating',revision:revision+1},{$set:{recurrence_batch_state:'complete',revision:revision+2}});
  if(done.updated!==1)throw Error('Completion CAS failed');
  try{await audit?.(createdIds)}catch(_){return {success:false,reason:'audit_reconciliation_required',createdIds,batchKey}}
  return {success:true,createdIds,batchKey,sourceRevision:revision+2,published:false,bookingsOpened:false};
 }catch(_){
  try{await entity.updateMany({id,tenant_id,club_id,recurrence_batch_key:batchKey,recurrence_batch_state:'creating'},{$set:{recurrence_batch_state:'needs_recovery'}})}catch(_){}
  return {success:false,reason:'manual_reconciliation_required',createdIds,batchKey};
 }
}
