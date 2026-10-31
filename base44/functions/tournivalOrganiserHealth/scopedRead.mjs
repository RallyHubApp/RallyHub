/** Complete cursor-paged, scoped Base44 entity read; never trust a truncated inventory. */
export async function readScopedTournivalRecords(entity,query,{pageSize=100,maxPages=50}={}){
 if(!query?.tenant_id||!Number.isSafeInteger(pageSize)||pageSize<1||pageSize>500||!Number.isSafeInteger(maxPages)||maxPages<1)throw Error('Invalid scoped read');
 const rows=[],seen=new Map(),cursors=new Set();let cursor;
 for(let i=0;i<maxPages;i++){
  const options={sort:'-created_date',limit:pageSize};if(cursor)options.cursor=cursor;
  const page=await entity.filter(query,options);
  if(!page||!Array.isArray(page.items))throw Error('Cursor read unavailable');
  for(const row of page.items){
   if(!row?.id||Object.entries(query).some(([key,value])=>row[key]!==value))throw Error('Record scope mismatch');
   if(seen.has(row.id)){if(JSON.stringify(seen.get(row.id))!==JSON.stringify(row))throw Error('Conflicting duplicate record');}
   else{seen.set(row.id,row);rows.push(row);}
  }
  if(page.has_more!==true)return rows;
  if(!page.next_cursor||page.next_cursor===cursor||cursors.has(page.next_cursor))throw Error('Cursor stalled');
  cursors.add(page.next_cursor);cursor=page.next_cursor;
 }
 throw Error('Scoped inventory exceeds safe read limit');
}
