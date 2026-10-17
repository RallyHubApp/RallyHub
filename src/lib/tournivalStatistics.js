/**
 * Reproducible projection of confirmed Tournival event results. Always recalculate
 * from match identities rather than incrementing aggregate counters on retries.
 */
export function calculateTournivalStats({playerIds=[],matches=[],podium={},rehearsal=false}={}){
 if(rehearsal)return {excluded:true,players:[]};
 const records=new Map(playerIds.map(id=>[id,{
  playerId:id,played:0,wins:0,losses:0,pointsFor:0,pointsAgainst:0,
  partners:{},opponents:{},podium:null
 }]));
 const visited=new Set();
 const increment=(obj,key)=>{obj[key]=(obj[key]||0)+1;};
 for(const match of matches){
  if(!match?.id||visited.has(match.id))continue;
  visited.add(match.id);
  if(match.status!=='completed'||!match.result)continue;
  const a=match.teamA||[],b=match.teamB||[];
  const scoreA=Number(match.result.scoreA),scoreB=Number(match.result.scoreB);
  if(a.length!==2||b.length!==2||new Set([...a,...b]).size!==4||
     !Number.isInteger(scoreA)||!Number.isInteger(scoreB)||scoreA<0||scoreB<0||scoreA===scoreB)continue;
  for(const [members,other,forPoints,againstPoints,won] of [
   [a,b,scoreA,scoreB,scoreA>scoreB],[b,a,scoreB,scoreA,scoreB>scoreA]
  ]){
   for(const pid of members){
    if(!records.has(pid))records.set(pid,{
     playerId:pid,played:0,wins:0,losses:0,pointsFor:0,pointsAgainst:0,
     partners:{},opponents:{},podium:null
    });
    const p=records.get(pid);
    p.played++;if(won)p.wins++;else p.losses++;
    p.pointsFor+=forPoints;p.pointsAgainst+=againstPoints;
    for(const teammate of members)if(teammate!==pid)increment(p.partners,teammate);
    for(const opponent of other)increment(p.opponents,opponent);
   }
  }
 }
 for(const [place,pair] of Object.entries(podium)){
  const members=Array.isArray(pair)?pair:pair?.playerIds||[];
  for(const id of members)if(records.has(id))records.get(id).podium=place;
 }
 return {excluded:false,players:[...records.values()].map(p=>({...p,pointDiff:p.pointsFor-p.pointsAgainst}))
  .sort((a,b)=>b.wins-a.wins||b.pointDiff-a.pointDiff||String(a.playerId).localeCompare(String(b.playerId)))};
}
export function completedTournivalMatchRecords(state){
 const fixtures=state?.matches||[];
 const indexed=new Map(fixtures.map(m=>[m.id,m]));
 for(const round of state?.rounds||[])for(const [i,court] of (round.courts||[]).entries()){
  const id=`qualification:${round.roundNumber}:${i+1}`;
  if(indexed.has(id))continue;
  const result=state?.results?.[round.roundNumber]?.[court.courtNumber];
  indexed.set(id,{id,round:round.roundNumber,teamA:court.teamA,teamB:court.teamB,
   status:result?'completed':'waiting',result:result||null});
 }
 for(const match of state?.knockoutState?.bracket||[]){
  const a=[match.pair1?.player1?.id,match.pair1?.player2?.id].filter(Boolean);
  const b=[match.pair2?.player1?.id,match.pair2?.player2?.id].filter(Boolean);
  indexed.set(`knockout:${match.id}`,{id:`knockout:${match.id}`,teamA:a,teamB:b,
   status:match.result?'completed':'waiting',result:match.result||null});
 }
 return [...indexed.values()];
}
