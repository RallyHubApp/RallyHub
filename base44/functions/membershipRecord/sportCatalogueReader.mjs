/** Read the public active-sport catalogue completely; no fixed 100-row cut-off. */
export async function readActiveSportCatalogue(entity,{pageSize=100,maxPages=20}={}){
 if(!Number.isSafeInteger(pageSize)||pageSize<1||pageSize>500||!Number.isSafeInteger(maxPages)||maxPages<1)throw Error('Invalid sport catalogue limits');
 const rows=[],seen=new Map(),cursors=new Set();let cursor;
 for(let pageIndex=0;pageIndex<maxPages;pageIndex++){
  const options={sort:'name',limit:pageSize};if(cursor)options.cursor=cursor;
  const page=await entity.filter({status:'active'},options);
  if(!page||!Array.isArray(page.items))throw Error('Sport catalogue pagination unavailable');
  for(const sport of page.items){
   if(!sport?.id||sport.status!=='active')throw Error('Sport catalogue scope violation');
   if(seen.has(sport.id)){
    if(JSON.stringify(seen.get(sport.id))!==JSON.stringify(sport))throw Error('Conflicting sport catalogue record');
   }else{seen.set(sport.id,sport);rows.push(sport)}
  }
  if(page.has_more!==true)return rows;
  if(!page.next_cursor||page.next_cursor===cursor||cursors.has(page.next_cursor))throw Error('Sport catalogue cursor stalled');
  cursors.add(page.next_cursor);cursor=page.next_cursor;
 }
 throw Error('Sport catalogue exceeds verification limit');
}
