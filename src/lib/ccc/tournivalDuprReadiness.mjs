/** DUPR submission is never performed here. Preflight is fail-closed until provider approval. */
export function reviewTournivalDuprReadiness(event,identities={}, {providerRulesVerified=false,ssoVerified=false}={}) {
 const issues=[],add=(code,matchId=null)=>issues.push({code,matchId});
 if(!event?.id||!event?.tenantId||!event?.clubId)add('event_scope_missing');
 if(event?.rehearsal)add('rehearsal_isolated');
 if(!event?.duprEnabled)add('dupr_not_enabled');
 if(!providerRulesVerified)add('provider_rules_unverified');
 if(!ssoVerified)add('sso_unverified');
 if(!Array.isArray(event?.matches)||!event.matches.length)add('no_matches');
 const seen=new Set(),candidates=[];
 for(const match of Array.isArray(event?.matches)?event.matches:[]){
  const id=match?.id;
  if(!id||seen.has(id))add('invalid_match_identity',id);
  seen.add(id);
  if(match?.status!=='completed'||!match?.result){add('match_not_completed',id);continue;}
  if(match.matchFormat?.startsWith('timed_'))add('timed_format_unverified',id);
  const players=[...(Array.isArray(match.teamA)?match.teamA:[]),...(Array.isArray(match.teamB)?match.teamB:[])];
  if(players.length!==4||new Set(players).size!==4)add('invalid_doubles_players',id);
  for(const playerId of players){
   if(!identities?.[playerId]?.duprId)add('dupr_identity_missing',id);
   if(identities?.[playerId]?.consent!==true)add('dupr_consent_missing',id);
  }
  if(!Number.isFinite(match.result.scoreA)||!Number.isFinite(match.result.scoreB)||match.result.scoreA===match.result.scoreB)add('invalid_score',id);
  candidates.push(id);
 }
 return {eligible:issues.length===0,issues,candidateCount:candidates.length,submissionAttempted:false,requiresExplicitSubmissionApproval:true};
}
