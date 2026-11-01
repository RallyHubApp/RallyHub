/** Cross-check a complete tournament result against its authoritative session. */
export function reviewTournamentResults({tournament,session}={}){
 const issues=[];
 if(!tournament?.id||!session?.id||session?.tournament_id!==tournament?.id||session?.tenant_id!==tournament?.tenant_id||session?.club_id!==tournament?.host_club_id)issues.push('session_scope_mismatch');
 let state,mirror;
 try{state=JSON.parse(session?.state_json);mirror=JSON.parse(tournament?.tournival_state);}catch{issues.push('invalid_state_json');}
 if(!Number.isSafeInteger(state?.revision)||state?.revision!==session?.state_revision)issues.push('revision_invalid');
 if(state?.revision!==mirror?.revision)issues.push('mirror_revision_mismatch');
 if(!Array.isArray(state?.matches)||!Array.isArray(state?.results))issues.push('result_inventory_invalid');
 if(Array.isArray(state?.matches)&&new Set(state.matches.map(m=>m?.id)).size!==state.matches.length)issues.push('duplicate_match_ids');
 if(Array.isArray(state?.results)&&state.results.some(r=>!r?.match_id||!state?.matches?.some(m=>m.id===r.match_id)))issues.push('orphan_result');
 return {healthy:issues.length===0,issues,automaticRepair:false};
}
