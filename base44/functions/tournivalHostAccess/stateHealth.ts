/** Read-only health assessment for the authoritative TournivalSession and tournament mirror. */
export function assessTournivalHostStateHealth(session:any,tournament:any){
 const issues:string[]=[];
 const state=(()=>{try{return JSON.parse(session?.state_json||'{}')}catch{return null}})();
 if(!state||typeof state!=='object')issues.push('session_state_invalid');
 if(!session?.id||!session?.tenant_id||!session?.tournament_id)issues.push('session_scope_missing');
 if(!tournament?.id||session?.tournament_id!==tournament?.id||session?.tenant_id!==tournament?.tenant_id)
  issues.push('session_tournament_scope_mismatch');
 if(!Number.isInteger(session?.state_revision)||session.state_revision<0||
    !Number.isInteger(state?.revision)||state.revision!==session.state_revision)issues.push('session_revision_mismatch');
 const mirror=(()=>{try{return JSON.parse(tournament?.tournival_state||'{}')}catch{return null}})();
 if(!mirror||typeof mirror!=='object'||!Number.isInteger(mirror.revision))issues.push('tournament_mirror_unavailable');
 else if(state&&mirror.revision!==state.revision)issues.push('tournament_mirror_revision_mismatch');
 if(state&&!Array.isArray(state.matches))issues.push('session_matches_missing');
 if(state&&Array.isArray(state.matches)){
  const ids=state.matches.map((m:any)=>m?.id);
  if(new Set(ids).size!==ids.length||ids.some((id:any)=>typeof id!=='string'||!id))issues.push('session_match_ids_invalid');
 }
 return {healthy:issues.length===0,issues,sessionRevision:state?.revision??null,
  mirrorRevision:mirror?.revision??null,requiresReconciliation:issues.length>0,automaticRepair:false};
}
