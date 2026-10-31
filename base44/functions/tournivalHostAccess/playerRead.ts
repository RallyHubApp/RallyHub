/** Scoped player lookups avoid truncated tenant-wide reads. */
export async function loadTournivalHostPlayerMap(entity:any,tenantId:string,ids:unknown){
 if(!Array.isArray(ids)||ids.length>256||ids.some(id=>typeof id!=='string'||!id||id.length>160))return {playerMap:{},missingPlayerIds:[],error:'invalid_player_scope'};
 const playerMap:Record<string,string>={},missingPlayerIds:string[]=[];
 for(const id of new Set(ids as string[])){
  const records=await entity.filter({id,tenant_id:tenantId},'-created_date',2);
  const player=records?.find((p:any)=>p.id===id&&p.tenant_id===tenantId);
  if(!player){missingPlayerIds.push(id);continue;}
  playerMap[id]=String(player.full_name||'').trim().slice(0,120);
 }
 return {playerMap,missingPlayerIds,error:null};
}
