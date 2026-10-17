/**
 * DUPR Partner API UAT match adapter, based on official 2026 OpenAPI:
 * POST /api/match/v1.0/batch, ExternalMatchRequest.
 * Pure transform, no provider calls or secrets. Never reports rehearsal results.
 */
export type DuprMatchCandidate={
 identifier:string;matchDate:string;event:string;location:string;format:'DOUBLES';
 bracket:string;matchType:'SIDEOUT'|'RALLY';matchSource:'PARTNER';
 matchPlayType:'TOURNAMENT';matchCompletionType:'COMPLETED';
 teamA:{player1:string;player2:string;game1:number};
 teamB:{player1:string;player2:string;game1:number};
};
type Excluded={matchId:string;reason:string};
type Result={matches:DuprMatchCandidate[];excluded:Excluded[]};
const clean=(v:any)=>String(v??'').trim();
const validDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s));
function validScore(a:any,b:any,format:string){
 const x=Number(a),y=Number(b);
 if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x===y)return false;
 const winner=Math.max(x,y),loser=Math.min(x,y);
 if(format==='first_11_by1')return winner===11 && loser<=10;
 if(format==='first_11_by2')return winner>=11&&winner-loser>=2&&
    (winner===11||winner-loser===2);
 return false;
}
export function prepareTournivalDuprBatch({
 state,tournamentId,eventName,matchDate,location,players,consents,
 scoringType='RALLY',
}:{
 state:any;tournamentId:string;eventName:string;matchDate:string;location?:string;
 players:Record<string,{duprId?:string}>;consents:Set<string>|string[];
 scoringType?:'SIDEOUT'|'RALLY';
}):Result {
 const matches:DuprMatchCandidate[]=[],excluded:Excluded[]=[];
 if(state?.rehearsal===true)return {matches,excluded:[{matchId:'*',reason:'rehearsal_excluded'}]};
 if(state?.duprEnabled!==true)return {matches,excluded:[{matchId:'*',reason:'event_not_opted_in'}]};
 if(state?.status!=='Completed'&&state?.status!=='completed')return {matches,excluded:[{matchId:'*',reason:'event_not_finalised'}]};
 if(!state?.knockoutState?.bracket?.some((m:any)=>m.stage==='Final'&&m.result))
  return {matches,excluded:[{matchId:'*',reason:'final_not_confirmed'}]};
 if(!validDate(matchDate)||!clean(eventName)||!clean(tournamentId))
  return {matches,excluded:[{matchId:'*',reason:'event_metadata_missing'}]};
 const consentSet=consents instanceof Set?consents:new Set(consents||[]);
 const add=(id:string,stage:string,a:string[],b:string[],result:any,format:string)=>{
   if(!result){excluded.push({matchId:id,reason:'score_unconfirmed'});return;}
   if(String(format).startsWith('timed_')){excluded.push({matchId:id,reason:'timed_match_not_verified_for_dupr'});return;}
   if(result.method&&result.method!=='normal'){excluded.push({matchId:id,reason:'non_standard_match_outcome'});return;}
   if(!validScore(result.scoreA,result.scoreB,format)){
    excluded.push({matchId:id,reason:'invalid_points_result'});return;
   }
   const ids=[...a,...b];
   if(a.length!==2||b.length!==2||new Set(ids).size!==4){
    excluded.push({matchId:id,reason:'invalid_doubles_players'});return;
   }
   if(ids.some(x=>!consentSet.has(x))){
    excluded.push({matchId:id,reason:'player_consent_missing'});return;
   }
   if(ids.some(x=>!clean(players[x]?.duprId))){
    excluded.push({matchId:id,reason:'verified_dupr_id_missing'});return;
   }
   matches.push({
    identifier:`RH-TRN-${tournamentId}-${id}`.slice(0,180),
    event:clean(eventName).slice(0,180),matchDate,location:clean(location),
    format:'DOUBLES',bracket:stage,matchType:scoringType,
    matchSource:'PARTNER',matchPlayType:'TOURNAMENT',matchCompletionType:'COMPLETED',
    teamA:{player1:clean(players[a[0]].duprId),player2:clean(players[a[1]].duprId),game1:Number(result.scoreA)},
    teamB:{player1:clean(players[b[0]].duprId),player2:clean(players[b[1]].duprId),game1:Number(result.scoreB)}
   });
 };
 for(const round of state.rounds||[]){
   for(const [i,c] of (round.courts||[]).entries()){
    add(`Q:${round.roundNumber}:${i+1}`,`Qualification ${round.roundNumber}`,
      c.teamA||[],c.teamB||[],state.results?.[round.roundNumber]?.[c.courtNumber],state.matchFormat);
   }
 }
 for(const m of state.knockoutState.bracket||[]){
   add(`KO:${m.id}`,m.stage||'Knockout',
    [m.pair1?.player1?.id,m.pair1?.player2?.id].filter(Boolean),
    [m.pair2?.player1?.id,m.pair2?.player2?.id].filter(Boolean),
    m.result,state.knockoutMatchFormat||state.matchFormat);
 }
 const identifiers=matches.map(m=>m.identifier);
 if(new Set(identifiers).size!==identifiers.length)throw Error('DUPR match identifiers are not unique');
 return {matches,excluded};
}
