/** Bounded tenant/club activity discovery using Base44 v2 cursors. */
export async function readScopedActivities(entity,{tenantId,clubId,pageSize=200,maxPages=25}){
 const query={tenant_id:tenantId,club_id:clubId};
 const activities=[];const ids=new Set();let cursor,hasMore=false,pages=0;
 do{
  const page=await entity.filter(query,'-starts_at',pageSize,cursor?{cursor}:undefined);
  const legacyArray=Array.isArray(page);
  if(!legacyArray&&(!page||!Array.isArray(page.items)))throw Error('Base44 activity cursor response invalid');
  const items=legacyArray?page:page.items;
  for(const item of items)if(item?.id&&!ids.has(item.id)){ids.add(item.id);activities.push(item)}
  pages++;hasMore=legacyArray?items.length>=pageSize:page.has_more===true;
  if(legacyArray||!hasMore)break;
  if(!page.next_cursor||page.next_cursor===cursor)throw Error('Base44 activity cursor did not advance');
  cursor=page.next_cursor;
 }while(pages<maxPages);
 return {activities,complete:!hasMore,pages};
}
