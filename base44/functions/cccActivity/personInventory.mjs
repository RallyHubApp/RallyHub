/** Strict person-scoped cursor reader for tenant + platform preferences and suppressions. */
export async function readPersonInventory(entity,{personId,channel='',pageSize=100,maxPages=5}={}){
 if(!personId||typeof personId!=='string')throw Error('Verified Person ID required');
 const rows=[],seen=new Set();let cursor,complete=false;
 for(let i=0;i<maxPages;i++){
  const query={person_id:personId};if(channel)query.channel=channel;
  const opts={sort:'-created_date',limit:pageSize};if(cursor)opts.cursor=cursor;
  const page=await entity.filter(query,opts);
  if(!page||!Array.isArray(page.items))throw Error('Person inventory pagination unavailable');
  for(const row of page.items){
   if(!row?.id||row.person_id!==personId)throw Error('Person inventory scope violation');
   if(!seen.has(row.id)){seen.add(row.id);rows.push(row)}
  }
  if(page.has_more!==true){complete=true;break}
  if(!page.next_cursor||page.next_cursor===cursor)throw Error('Person inventory cursor stalled');
  cursor=page.next_cursor;
 }
 return {rows,complete};
}
