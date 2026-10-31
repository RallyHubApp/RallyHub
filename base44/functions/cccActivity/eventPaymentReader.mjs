/** Cursor-paged, tenant/club/event-registration-scoped payment reads. */
export async function readEventPayments(entity,{tenantId,clubId,registrationIds,batchSize=40,perBatchLimit=200,maxPagesPerBatch=20}){
 const ids=[...new Set((registrationIds||[]).filter(Boolean))];
 const rows=[];let possiblyTruncated=false,batches=0,pages=0;
 const seen=new Set();
 for(let start=0;start<ids.length;start+=batchSize){
  const batch=ids.slice(start,start+batchSize);
  const query={tenant_id:tenantId,club_id:clubId,purpose_type:'event',purpose_id:{$in:batch}};
  let cursor,hasMore=false,round=0;
  do{
   const options={sort:'-created_date',limit:perBatchLimit};
   if(cursor)options.cursor=cursor;
   const result=await entity.filter(query,options);
   if(!result||!Array.isArray(result.items))throw Error('Base44 payment cursor response invalid');
   for(const p of result.items){if(p?.id&&!seen.has(p.id)){seen.add(p.id);rows.push(p)}}
   round++;pages++;hasMore=result.has_more===true;
   if(!hasMore)break;
   if(!result.next_cursor||result.next_cursor===cursor)throw Error('Base44 payment cursor did not advance');
   cursor=result.next_cursor;
  }while(round<maxPagesPerBatch);
  if(hasMore)possiblyTruncated=true;
  batches++;
 }
 return {payments:rows,possiblyTruncated,batches,pages,registrationCount:ids.length};
}
