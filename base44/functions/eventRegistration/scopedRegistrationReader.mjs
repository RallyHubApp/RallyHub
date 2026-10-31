/** Read the complete event roster before making capacity/duplicate decisions. Fail closed if unverified. */
export async function readBookingRegistrations(entity,{eventId,tenantId,clubId,pageSize=250,maxPages=100}){
 if(!eventId||!tenantId||!clubId)throw Error('Event scope required');
 const query={event_id:eventId,tenant_id:tenantId,club_id:clubId};
 const rows=[],seen=new Set();let cursor,hasMore=false,pages=0;
 do{
  const options={sort:'-created_date',limit:pageSize};
  if(cursor)options.cursor=cursor;
  const page=await entity.filter(query,options);
  if(!page||!Array.isArray(page.items))throw Error('Event registration pagination unavailable');
  for(const row of page.items){if(!row?.id)throw Error('Event registration missing ID');if(!seen.has(row.id)){seen.add(row.id);rows.push(row)}}
  pages++;hasMore=page.has_more===true;
  if(!hasMore)break;
  if(!page.next_cursor||page.next_cursor===cursor)throw Error('Event registration pagination stalled');
  cursor=page.next_cursor;
 }while(pages<maxPages);
 if(hasMore)throw Error('Event registration verification exceeds safety limit');
 return rows;
}
