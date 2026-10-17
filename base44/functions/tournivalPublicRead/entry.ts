import {createClientFromRequest} from 'npm:@base44/sdk@0.8.29';
const clean=(v:any,max=120)=>String(v??'').trim().slice(0,max);
Deno.serve(async(req)=>{
 if(req.method!=='POST')return Response.json({error:'POST required'},{status:405});
 try{
  const body=await req.json().catch(()=>({}));
  const id=clean(body.tournamentId,100);
  if(!id)return Response.json({error:'Event ID required'},{status:400});
  const base44=createClientFromRequest(req);
  const tournaments=await base44.asServiceRole.entities.Tournament.filter({id});
  const tournament=tournaments?.[0];
  if(!tournament||String(tournament.format).toLowerCase()!=='tournival'||
    !['In Progress','Completed'].includes(tournament.status))
    return Response.json({error:'Live Hall is not published for this event'},{status:404});
  const sessions=await base44.asServiceRole.entities.TournivalSession.filter({
   tournament_id:tournament.id,tenant_id:tournament.tenant_id
  },'-created_at',5);
  if(sessions?.length>1)return Response.json({error:'Tournament state requires reconciliation'},{status:409});
  let state:any;
  try {
   const raw=sessions?.[0]?.state_json??tournament.tournival_state??tournament.kotc_state;
   state=raw?(typeof raw==='string'?JSON.parse(raw):raw):null;
  }catch {state=null}
  if(!state)return Response.json({error:'Confirmed sporting state is unavailable'},{status:404});
  const revision=Number(state.revision||0);
  if(Number(body.clientRevision)===revision&&body.clientRevision!==undefined)
   return Response.json({success:true,unchanged:true,revision});
  const publicState={
   revision,currentRound:state.currentRound||1,
   numCourts:state.numCourts||4,numRounds:state.numRounds||4,
   matchFormat:state.matchFormat||'first_11_by1',
   playerIds:Array.isArray(state.playerIds)?state.playerIds.slice(0,200):[],
   rounds:(state.rounds||[]).map((r:any)=>({
    roundNumber:r.roundNumber,
    courts:(r.courts||[]).map((c:any)=>({
     courtNumber:c.courtNumber,teamA:c.teamA,teamB:c.teamB
    }))
   })),
   results:state.results||{},
   knockoutState:state.knockoutState?{
    currentStage:state.knockoutState.currentStage,
    bracket:(state.knockoutState.bracket||[]).map((m:any)=>({
     id:m.id,label:m.label,stage:m.stage,pair1:m.pair1,pair2:m.pair2,result:m.result
    }))
   }:null
  };
  const roster=publicState.playerIds;
  const players=roster.length?await base44.asServiceRole.entities.Player.filter({
   tenant_id:tournament.tenant_id
  },'-created_date',500):[];
  const names=Object.fromEntries((players||[]).filter((p:any)=>roster.includes(p.id)).map((p:any)=>[p.id,clean(p.full_name,120)]));
  return Response.json({success:true,revision,
   event:{id:tournament.id,name:clean(tournament.name,180),date:tournament.start_date||'',
    venue:clean(tournament.location,180),status:tournament.status},
   state:publicState,playerMap:names
  });
 }catch(e){
  console.error('tournivalPublicRead failed',(e as any)?.message||e);
  return Response.json({error:'Live Hall temporarily unavailable'},{status:500});
 }
});
