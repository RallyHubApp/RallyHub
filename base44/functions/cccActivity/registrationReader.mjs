/** Base44 v2 cursor pagination: no offset drift or fixed 500-row cut-off. */
export async function readEventRegistrations(entity,{tenantId,clubId,eventId,extraFilters={},startCursor='',pageSize=250,maxPages=40}){
 const query={...extraFilters,event_id:eventId,tenant_id:tenantId,club_id:clubId};
 const rows=[];let cursor=startCursor||undefined,hasMore=false,pages=0;
 const seen=new Set();
 do{
  const options={sort:'-created_date',limit:pageSize};
  if(cursor)options.cursor=cursor;
  const page=await entity.filter(query,options);
  if(!page||!Array.isArray(page.items))throw Error('Base44 cursor response invalid');
  for(const row of page.items){if(row?.id&&!seen.has(row.id)){rows.push(row);seen.add(row.id)}}
  pages++;
  hasMore=page.has_more===true;
  if(!hasMore)break;
  if(!page.next_cursor||page.next_cursor===cursor)throw Error('Base44 cursor did not advance');
  cursor=page.next_cursor;
 }while(pages<maxPages);
 return {registrations:rows,pages,hasMore,complete:!hasMore,nextCursor:hasMore?cursor:null};
}
