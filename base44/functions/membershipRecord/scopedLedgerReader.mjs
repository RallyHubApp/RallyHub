/** Complete scoped Base44 v2 cursor reads for membership dashboards; fail closed on uncertainty. */
export async function readScopedMembershipLedger(entity,query,{pageSize=250,maxPages=80,sort='-created_date'}={}){
 if(!query?.tenant_id||!Number.isSafeInteger(pageSize)||pageSize<1||pageSize>500||!Number.isSafeInteger(maxPages)||maxPages<1)throw Error('Valid tenant scope and pagination limits required');
 const rows=[],seen=new Set();let cursor,pages=0;
 while(pages<maxPages){
  const opts={sort,limit:pageSize};if(cursor)opts.cursor=cursor;
  const page=await entity.filter(query,opts);
  if(!page||!Array.isArray(page.items))throw Error('Membership ledger cursor pagination unavailable');
  for(const row of page.items){
   if(!row?.id||Object.entries(query).some(([key,value])=>row[key]!==value))throw Error('Membership ledger scope violation');
   if(!seen.has(row.id)){seen.add(row.id);rows.push(row)}
  }
  pages++;
  if(page.has_more!==true)return {rows,complete:true,pages};
  if(!page.next_cursor||page.next_cursor===cursor)throw Error('Membership ledger cursor stalled');
  cursor=page.next_cursor;
 }
 throw Error('Membership ledger exceeds verified pagination limit');
}
