/** Non-privileged delegated host mutation boundary; cannot access finance/DUPR/configuration. */
const CONFIG=['rounds','seedOrder','playerIds','numCourts','numRounds','matchFormat',
 'knockoutPairs','knockoutState','duprEnabled','venueMinutes','matchMinutes','changeoverMinutes'];
export function validateDelegatedTournivalHostEdit(before:any,after:any){
 const invalid=(error:string)=>({valid:false,error});
 if(!before||!after)return invalid('Missing host state');
 for(const field of CONFIG)if(JSON.stringify(before[field]??null)!==JSON.stringify(after[field]??null))
  return invalid('Host link cannot alter tournament configuration or bracket');
 if(after.status==='Completed')return invalid('Host cannot finalise tournament');
 const originals=before.matches||[],updated=after.matches||[];
 if(!Array.isArray(originals)||!Array.isArray(updated))return invalid('Invalid match list');
 if(new Set(originals.map((m:any)=>m?.id)).size!==originals.length||
    new Set(updated.map((m:any)=>m?.id)).size!==updated.length||
    updated.some((m:any)=>typeof m?.id!=='string'||!m.id))return invalid('Duplicate or missing match identity');
 if(originals.length!==updated.length)return invalid('Fixture count changed');
 const byId=new Map<string,any>(originals.map((m:any)=>[m.id,m]));
 const occupied=new Set(),players=new Set();
 for(const match of updated) {
  const prior=byId.get(match.id);
  if(!prior||JSON.stringify(prior.teamA)!==JSON.stringify(match.teamA)||
   JSON.stringify(prior.teamB)!==JSON.stringify(match.teamB))
   return invalid('Host cannot change assigned players or fixtures');
  if(!Number.isInteger(match.revision)||match.revision<0||match.revision<(prior.revision||0))
   return invalid('Invalid match revision');
  if(prior.status==='completed'&&(match.revision!==prior.revision||JSON.stringify(prior.result)!==JSON.stringify(match.result)))
   return invalid('Confirmed match result and revision are immutable');
  if(prior.status==='completed'&&match.status!=='completed')
   return invalid('Host cannot silently reopen confirmed result');
  if(prior.status==='waiting'&&match.status==='completed')
   return invalid('Match must start before score completion');
  if(!['waiting','playing','completed'].includes(match.status))return invalid('Invalid match status');
  if(prior.status==='playing'&&match.status==='waiting'&&match.result)return invalid('Reset cannot retain a score');
  if(match.status==='playing'){
   if(!Number.isInteger(match.court)||match.court<1||match.court>after.numCourts||
     occupied.has(match.court))return invalid('Court collision');
   occupied.add(match.court);
   for(const pid of [...match.teamA,...match.teamB]){
    if(players.has(pid))return invalid('Concurrent player collision');
    players.add(pid);
   }
  }
  if(match.status==='completed'){
   if(!match.result||!Number.isInteger(match.result.scoreA)||!Number.isInteger(match.result.scoreB)||
      match.result.scoreA<0||match.result.scoreB<0||match.result.scoreA===match.result.scoreB||
      match.result.winner!==(match.result.scoreA>match.result.scoreB?'A':'B'))
    return invalid('Completed match has no valid confirmed result');
   const roundResults=after.results?.[match.round];
   const score=roundResults?.[match.order+1];
   if(!score||JSON.stringify(score)!==JSON.stringify(match.result))
    return invalid('Recorded score and authoritative match result do not agree');
  }
 }
 if(after.status==='Group Complete'&&updated.some((m:any)=>m.status!=='completed'))
  return invalid('Qualification still has unfinished fixtures');
 return {valid:true};
}
