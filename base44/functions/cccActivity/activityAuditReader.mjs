/** Scoped audit cursor reader; returns only explicitly permitted action metadata. */
const ALLOWED=new Set(['ccc.activity.link_event','ccc.activity.transition','ccc.activity.save_draft']);
export async function readActivityAudit(entity,{tenantId,clubId,activityId,pageSize=200,maxPages=10}){
 if(!tenantId||!clubId||!activityId)throw Error('Audit scope required');
 const query={tenant_id:tenantId,club_id:clubId,entity_type:'ClubActivity',entity_id:activityId};
 const entries=[],seen=new Set();let cursor,hasMore=false,pages=0;
 do{
  const options={sort:'-created_date',limit:pageSize};if(cursor)options.cursor=cursor;
  const page=await entity.filter(query,options);
  if(!page||!Array.isArray(page.items))throw Error('Audit pagination unavailable');
  for(const log of page.items){
   if(!log?.id||seen.has(log.id)||!ALLOWED.has(log.action))continue;
   seen.add(log.id);entries.push({id:log.id,action:log.action,userId:log.user_id,createdAt:log.created_date||''});
  }
  pages++;hasMore=page.has_more===true;if(!hasMore)break;
  if(!page.next_cursor||page.next_cursor===cursor)throw Error('Audit cursor did not advance');
  cursor=page.next_cursor;
 }while(pages<maxPages);
 return {entries,resultsMayBeTruncated:hasMore,auditIsBestEffort:true};
}
