/** Bounded concurrent scoped roster reads; no tenant-wide list truncation or partial results. */
export async function loadTournivalHostPlayerMap(entity:any,tenantId:string,ids:unknown){
 if(typeof tenantId!=='string'||!tenantId.trim()||!Array.isArray(ids)||ids.length>256||
  ids.some(id=>typeof id!=='string'||!id.trim()||id.length>160))
  return {playerMap:{},missingPlayerIds:[],error:'invalid_player_scope'};
 const unique=[...new Set(ids as string[])];
 const found:(string|null)[]=Array(unique.length).fill(null);
 let cursor=0,failed=false;
 const workers=Array.from({length:Math.min(8,unique.length)},async()=>{
  while(cursor<unique.length&&!failed){
   const index=cursor++,id=unique[index];
   try{
    const records=await entity.filter({id,tenant_id:tenantId},'-created_date',2);
    if(!Array.isArray(records))throw Error('invalid_player_response');
    const matching=records.filter((p:any)=>p?.id===id&&p?.tenant_id===tenantId);
    if(matching.length>1)throw Error('ambiguous_player_identity');
    if(matching.length===1)found[index]=String(matching[0].full_name||'').trim().slice(0,120);
   }catch{failed=true;}
  }
 });
 await Promise.all(workers);
 if(failed)return {playerMap:{},missingPlayerIds:[],error:'player_lookup_failed'};
 const playerMap:Record<string,string>={},missingPlayerIds:string[]=[];
 for(let i=0;i<unique.length;i++){
  if(found[i]===null)missingPlayerIds.push(unique[i]);
  else playerMap[unique[i]]=found[i] as string;
 }
 return {playerMap,missingPlayerIds,error:null};
}
