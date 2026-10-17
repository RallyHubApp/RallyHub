/**
 * Validates inbound Tournival host state before persistence. Independent of KOTC.
 * This guards sporting invariants and corrections but is NOT an atomic DB lock.
 */
export function validateTournivalStateTransition(current:any,next:any,{
  playerIds=[],correctionReason=''
}: {playerIds?:string[];correctionReason?:string}={}) {
 const fail=(message:string)=>({valid:false,error:message});
 if(!next||typeof next!=='object'||!Array.isArray(next.rounds))
  return fail('A valid Tournival fixture structure is required.');
 if(!Number.isInteger(next.numRounds)||next.numRounds<2||next.numRounds>6)
  return fail('Qualification rounds must be between 2 and 6.');
 if(!Number.isInteger(next.numCourts)||next.numCourts<1||next.numCourts>16)
  return fail('Invalid Tournival court count.');
 if(next.rounds.length!==0&&next.rounds.length!==next.numRounds)
  return fail('Draw must contain exactly the configured qualification rounds.');
 const eligible=new Set(playerIds);
 for(const round of next.rounds) {
  const assigned=new Set<string>();
  if(!Number.isInteger(round.roundNumber)||round.roundNumber<1||round.roundNumber>next.numRounds)
   return fail('Invalid qualification round number.');
  if(!Array.isArray(round.courts)||round.courts.length>next.numCourts)
   return fail('Too many fixtures for configured courts.');
  for(const court of round.courts){
   const a=court.teamA||[],b=court.teamB||[],ids=[...a,...b];
   if(a.length!==2||b.length!==2||new Set(ids).size!==4)
    return fail('Each qualification match requires four distinct players.');
   if(ids.some(id=>!eligible.has(id)||assigned.has(id)))
    return fail('Unavailable, unknown or overlapping player in qualification round.');
   for(const id of ids)assigned.add(id);
  }
 }
 if(next.status==='Completed' && !next.knockoutState?.bracket?.some((m:any)=>m.stage==='Final'&&m.result))
  return fail('Final cannot be published without a confirmed final result.');
 if(next.results && (typeof next.results!=='object'||Array.isArray(next.results)))
  return fail('Invalid result record.');
 const format=String(next.matchFormat||'first_11_by1');
 function validScore(result:any,matchFormat:string) {
  if(!result)return false;
  const a=Number(result.scoreA),b=Number(result.scoreB);
  if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a===b)return false;
  if(result.winner!==(a>b?'A':'B'))return false;
  if(matchFormat.startsWith('timed_'))return true;
  const winner=Math.max(a,b),loser=Math.min(a,b);
  if(matchFormat==='first_11_by1')return winner===11&&loser<=10;
  if(matchFormat==='first_11_by2')return winner>=11&&winner-loser>=2&&(winner===11||winner-loser===2);
  return false;
 }
 const fixtures=new Map<string,any>();
 for(const round of next.rounds)for(const court of round.courts){
  fixtures.set(`${round.roundNumber}:${court.courtNumber}`,court);
 }
 const currentResults=current?.results||{},nextResults=next.results||{};
 let corrections=0,added=0;
 for(const [roundNumber,record] of Object.entries(nextResults)){
  if(!record||typeof record!=='object')return fail('Invalid round scores.');
  for(const [courtNumber,result] of Object.entries(record as any)){
   if(!fixtures.has(`${roundNumber}:${courtNumber}`))
    return fail('Score refers to an unknown fixture.');
   if(!validScore(result,format))return fail('Score violates match format.');
   const prior=currentResults?.[roundNumber]?.[courtNumber];
   if(prior){
    if(JSON.stringify(prior)!==JSON.stringify(result))corrections++;
   }else added++;
  }
 }
 for(const [roundNumber,record] of Object.entries(currentResults)){
  for(const [courtNumber,prior] of Object.entries((record||{}) as any)){
   const updated=nextResults?.[roundNumber]?.[courtNumber];
   if(!updated)return fail('A confirmed score cannot be silently removed.');
   if(JSON.stringify(prior)!==JSON.stringify(updated))corrections++;
  }
 }
 if(corrections&&String(correctionReason).trim().length<6)
  return fail('Score corrections require an audit reason.');
 if(current?.matches?.length){
  const previous=new Map(current.matches.map((m:any)=>[m.id,m]));
  for(const match of next.matches||[]){
   const old=previous.get(match.id);
   if(!old) return fail('Unexpected fixture added; controlled redraw required.');
   if(old.status==='completed'&&JSON.stringify(old.result)!==JSON.stringify(match.result)
      &&String(correctionReason).trim().length<6)
    return fail('Completed match cannot be changed without correction reason.');
   if(match.status==='completed'&&!validScore(match.result,format))
    return fail('Invalid completed match score.');
  }
 }
 const snapshot=next.knockoutState?.bracket||[];
 for(const match of snapshot){
  if(match.result&&!validScore(match.result,String(next.knockoutMatchFormat||format)))
   return fail('Invalid knockout result.');
 }
 if(current?.knockoutState?.bracket?.length){
  const priorById=new Map(current.knockoutState.bracket.map((m:any)=>[m.id,m]));
  for(const match of snapshot){
   const prior:any=priorById.get(match.id);
   if(prior?.result&&JSON.stringify(prior.result)!==JSON.stringify(match.result)
      &&String(correctionReason).trim().length<6)return fail('Knockout correction requires an audit reason.');
  }
 }
 return {valid:true,corrections,added};
}
