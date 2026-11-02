/** Read complete event roster with Base44's positional filter API; fail closed on incomplete pages. */
export async function readBookingRegistrations(entity,{eventId,tenantId,clubId,pageSize=250,maxPages=100}){
 if(!eventId||!tenantId||!clubId)throw Error('Event scope required');
 if(!Number.isSafeInteger(pageSize)||pageSize<1||pageSize>499)throw Error('Invalid event page size');
 const query={event_id:eventId,tenant_id:tenantId,club_id:clubId};
 const rows=[],seen=new Set();let hasMore=false;
 for(let page=0;page<maxPages;page++){
  const batch=await entity.filter(query,'-created_date',pageSize+1,page*pageSize);
  if(!Array.isArray(batch))throw Error('Event registration pagination unavailable');
  for(const row of batch.slice(0,pageSize)){
   if(!row?.id)throw Error('Event registration missing ID');
   if(seen.has(row.id))throw Error('Event registration pagination unstable');
   seen.add(row.id);rows.push(row);
  }
  hasMore=batch.length>pageSize;
  if(!hasMore)return rows;
 }
 if(hasMore)throw Error('Event registration verification exceeds safety limit');
 return rows;
}
