/** Scoped, bounded event payment lookup using the Base44 SDK positional filter API. */
export async function readAdminEventPayments(entity,{tenantId,clubId,registrationIds,batchSize=40,pageSize=200,maxPages=20}){
 const ids=[...new Set(registrationIds.filter(Boolean))],payments=[],seen=new Set();
 for(let i=0;i<ids.length;i+=batchSize){
  const query={tenant_id:tenantId,club_id:clubId,purpose_type:'event',purpose_id:{$in:ids.slice(i,i+batchSize)}};
  let offset=0,more=false;
  for(let pageNumber=0;pageNumber<maxPages;pageNumber++){
   const page=await entity.filter(query,'-created_date',pageSize+1,offset);
   if(!Array.isArray(page))throw Error('Event payment pagination unavailable');
   for(const p of page.slice(0,pageSize)){if(!p?.id)throw Error('Event payment record missing ID');if(!seen.has(p.id)){seen.add(p.id);payments.push(p)}}
   more=page.length>pageSize;
   if(!more)break;
   offset+=pageSize;
  }
  if(more)throw Error('Event payment verification exceeds safety limit');
 }
 return payments;
}
