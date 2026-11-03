/** Read the complete event roster before making capacity/duplicate decisions. Fail closed if unverified. */
export async function readBookingRegistrations(entity,{eventId,tenantId,clubId,pageSize=250,maxPages=100}){
 if(!eventId||!tenantId||!clubId)throw Error('Event scope required');
 const query={event_id:eventId,tenant_id:tenantId,club_id:clubId};
 // Base44's deployed SDK filter returns an array with positional sort/limit args.
 // For small live events, use that contract directly; refuse an at-limit result
 // rather than treating a potentially truncated roster as complete.
 const sdkRows=await entity.filter(query,'-created_date',500);
 if(Array.isArray(sdkRows)){
  if(sdkRows.length>=500)throw Error('Event registration verification exceeds safe SDK page limit');
  const unique=new Map();
  for(const row of sdkRows){
   if(!row?.id)throw Error('Event registration missing ID');
   if(row.event_id!==eventId||row.tenant_id!==tenantId||row.club_id!==clubId)throw Error('Event registration scope violation');
   unique.set(row.id,row);
  }
  return [...unique.values()];
 }

 const rows=[],seen=new Set();let cursor,hasMore=false,pages=0;
 do{
  const options={sort:'-created_date',limit:pageSize};
  if(cursor)options.cursor=cursor;
  const page=await entity.filter(query,options);
  if(!page||!Array.isArray(page.items))throw Error('Event registration pagination unavailable');
  for(const row of page.items){if(!row?.id)throw Error('Event registration missing ID');if(row.event_id!==eventId||row.tenant_id!==tenantId||row.club_id!==clubId)throw Error('Event registration scope violation');if(!seen.has(row.id)){seen.add(row.id);rows.push(row)}}
  pages++;hasMore=page.has_more===true;
  if(!hasMore)break;
  if(!page.next_cursor||page.next_cursor===cursor)throw Error('Event registration pagination stalled');
  cursor=page.next_cursor;
 }while(pages<maxPages);
 if(hasMore)throw Error('Event registration verification exceeds safety limit');
 return rows;
}
