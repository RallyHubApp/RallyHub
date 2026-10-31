/** Bounded event-scoped reads; no club-wide payment scans. */
export async function readEventPayments(entity,{tenantId,clubId,registrationIds,batchSize=40,perBatchLimit=200}){
 const ids=[...new Set((registrationIds||[]).filter(Boolean))];
 const rows=[];let possiblyTruncated=false;let batches=0;
 for(let start=0;start<ids.length;start+=batchSize){
  const batch=ids.slice(start,start+batchSize);
  const result=await entity.filter({tenant_id:tenantId,club_id:clubId,purpose_type:'event',purpose_id:{$in:batch}},'-created_date',perBatchLimit);
  batches++;
  if((result||[]).length>=perBatchLimit)possiblyTruncated=true;
  rows.push(...(result||[]));
 }
 return {payments:rows,possiblyTruncated,batches,registrationCount:ids.length};
}
