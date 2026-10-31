/** Advisory-only recovery review. Never resumes matches or mutates state. */
export function reviewTournivalRecovery(event,{courts=4,expectedRevision=null}={}) {
 const issues=[],actions=[];
 const add=(code,matchId=null)=>issues.push({code,matchId});
 if(!event||!Array.isArray(event.matches))return {safeToResume:false,issues:[{code:'missing_event_or_matches'}],actions:[],requiresHostReview:true};
 if(!event.id||!event.tenantId||!event.clubId)add('missing_event_scope');
 if(!Number.isInteger(event.revision)||event.revision<0)add('invalid_event_revision');
 if(expectedRevision!==null&&event.revision!==expectedRevision)add('stale_event_revision');
 if(!Number.isInteger(courts)||courts<1||courts>64)add('invalid_courts');
 if(!['qualification','knockout'].includes(event.phase))add('invalid_phase');
 const ids=new Set(),occupied=new Set(),activePlayers=new Set();
 for(const match of event.matches){
  const id=match?.id;
  if(typeof id!=='string'||!id||ids.has(id))add('invalid_match_id',id);
  ids.add(id);
  if(!Number.isInteger(match?.revision)||match.revision<0)add('invalid_match_revision',id);
  const team=[...(Array.isArray(match?.teamA)?match.teamA:[]),...(Array.isArray(match?.teamB)?match.teamB:[])];
  if(team.length!==4||new Set(team).size!==4||team.some(p=>typeof p!=='string'||!p))add('invalid_team',id);
  if(match?.status==='playing'){
   if(!Number.isInteger(match.court)||match.court<1||match.court>courts||occupied.has(match.court))add('court_collision',id);
   occupied.add(match.court);
   if(team.some(p=>activePlayers.has(p)))add('overlapping_players',id);
   team.forEach(p=>activePlayers.add(p));
   actions.push({matchId:id,action:'host_verify_live_score',automated:false});
  }else if(match?.status==='waiting')actions.push({matchId:id,action:'host_review_before_allocation',automated:false});
  else if(match?.status==='completed'){
   if(!match.result||!Number.isFinite(match.result.scoreA)||!Number.isFinite(match.result.scoreB))add('missing_result',id);
  }else if(match?.status!=='cancelled')add('invalid_status',id);
 }
 if(!event.matches.length)add('no_fixtures');
 return {safeToResume:issues.length===0&&!event.matches.some(m=>m.status==='playing'),issues,actions,requiresHostReview:true,automatedRecovery:false};
}
