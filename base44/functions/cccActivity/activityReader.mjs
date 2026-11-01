/** Bounded tenant/club activity discovery using Base44 v2 cursors. */
export async function readScopedActivities(entity,{tenantId,clubId,pageSize=200,maxPages=25}){
 const query={tenant_id:tenantId,club_id:clubId};
 const activities=[];const ids=new Set();let cursor,hasMore=false,pages=0;
 do{
  const page=await entity.filter(query,'-starts_at',pageSize);
  const arrayResult=Array.isArray(page);
  if(!arrayResult&&(!page||!Array.isArray(page.items)))throw Error('Base44 activity response invalid');
  const items=arrayResult?page:page.items;
  for(const item of items)if(item?.id&&!ids.has(item.id)){ids.add(item.id);activities.push(item)}
  pages++;if(arrayResult)return {activities,complete:items.length<pageSize,pages};
  hasMore=page.has_more===true;if(!hasMore)break;
  if(!page.next_cursor||page.next_cursor===cursor)throw Error('Base44 activity cursor did not advance');
  cursor=page.next_cursor;
 }while(pages<maxPages);
 return {activities,complete:!hasMore,pages};
}
