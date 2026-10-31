/** Tenant/club-scoped event payment lookup for legacy admin list. */
export async function readAdminEventPayments(entity,{tenantId,clubId,registrationIds,batchSize=40,pageSize=200,maxPages=20}){
 const ids=[...new Set(registrationIds.filter(Boolean))],payments=[],seen=new Set();
 for(let i=0;i<ids.length;i+=batchSize){
  const query={tenant_id:tenantId,club_id:clubId,purpose_type:'event',purpose_id:{$in:ids.slice(i,i+batchSize)}};
  let cursor,more=false,pageCount=0;
  do{
   const options={sort:'-created_date',limit:pageSize};if(cursor)options.cursor=cursor;
   const page=await entity.filter(query,options);
   if(!page||!Array.isArray(page.items))throw Error('Event payment pagination unavailable');
   for(const p of page.items){if(!p?.id)throw Error('Event payment record missing ID');if(!seen.has(p.id)){seen.add(p.id);payments.push(p)}}
   pageCount++;more=page.has_more===true;if(!more)break;
   if(!page.next_cursor||page.next_cursor===cursor)throw Error('Event payment pagination stalled');
   cursor=page.next_cursor;
  }while(pageCount<maxPages);
  if(more)throw Error('Event payment verification exceeds safety limit');
 }
 return payments;
}
