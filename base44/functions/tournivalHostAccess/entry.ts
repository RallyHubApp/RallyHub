import {createClientFromRequest} from 'npm:@base44/sdk@0.8.29';
import {validateTournivalStateTransition} from './tournivalStateValidation.ts';
import {validateDelegatedTournivalHostEdit} from './permissions.ts';
const clean=(v:any,max=160)=>String(v??'').trim().slice(0,max);
const SPORT_FIELDS=['rounds','seedOrder','playerIds','numCourts','numRounds','matchFormat',
  'knockoutPairs','knockoutState','duprEnabled','venueMinutes','matchMinutes','changeoverMinutes'];
async function hash(token:string){
 const data=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 return Array.from(new Uint8Array(data),x=>x.toString(16).padStart(2,'0')).join('');
}
Deno.serve(async(req)=>{
 if(req.method!=='POST')return Response.json({error:'POST required'},{status:405});
 if(Number(req.headers.get('content-length')||0)>1_100_000)
  return Response.json({error:'Request too large'},{status:413});
 try{
  const body=await req.json().catch(()=>({}));
  const token=clean(body.token,120),action=clean(body.action||'get',30);
  if(!/^th_[0-9a-f]{48}$/.test(token))return Response.json({error:'Invalid delegated host link'},{status:404});
  const base44=createClientFromRequest(req);
  const links=await base44.asServiceRole.entities.TournivalAccessToken.filter({
   token_hash:await hash(token),token_type:'host'
  },'-created_at',5);
  const link=links?.find((l:any)=>!l.revoked_at&&(!l.expires_at||Date.parse(l.expires_at)>Date.now()));
  if(!link)return Response.json({error:'Host link expired or revoked'},{status:403});
  const tournament=(await base44.asServiceRole.entities.Tournament.filter({
    id:link.tournament_id,tenant_id:link.tenant_id
  }))?.[0];
  if(!tournament||String(tournament.format).toLowerCase()!=='tournival')
   return Response.json({error:'Tournival unavailable'},{status:404});
  const sessions=await base44.asServiceRole.entities.TournivalSession.filter({
   tournament_id:tournament.id,tenant_id:tournament.tenant_id
  },'-created_at',5);
  if(sessions?.length!==1)return Response.json({error:'Tournival session not ready or requires reconciliation'},{status:409});
  const session=sessions[0];
  if(session.rehearsal)return Response.json({error:'Delegated live host access cannot control rehearsal'},{status:409});
  const state=JSON.parse(session.state_json||'{}');
  if(action==='get'){
   const ids=Array.isArray(state.playerIds)?state.playerIds:[];
   const players=ids.length?await base44.asServiceRole.entities.Player.filter({
    tenant_id:tournament.tenant_id
   },'-created_date',500):[];
   const playerMap=Object.fromEntries((players||[]).filter((p:any)=>ids.includes(p.id)).map((p:any)=>[
    p.id,clean(p.full_name,120)
   ]));
   return Response.json({success:true,event:{id:tournament.id,name:tournament.name,
    location:tournament.location,start_date:tournament.start_date,status:tournament.status},
    state,playerMap,role:'delegated_host',permissions:{
     score:true,courts:true,announcements:true,timing:true,finance:false,configuration:false,dupr:false
    }});
  }
  if(action!=='save')return Response.json({error:'Action not permitted for delegated host'},{status:403});
  const expectedRevision=Number(body.expectedRevision);
  const operationId=clean(body.operationId,120);
  if(!operationId||!Number.isInteger(expectedRevision)||expectedRevision<0)
   return Response.json({error:'Expected revision and operation ID required'},{status:400});
  if(state.lastOperationId===operationId)return Response.json({success:true,duplicate:true,revision:state.revision||0});
  if(Number(state.revision||0)!==expectedRevision)
   return Response.json({error:'Host state changed; refresh and review before retry',revision:state.revision||0},{status:409});
  const raw=String(body.stateJson||'');
  if(!raw||raw.length>1_000_000)return Response.json({error:'Invalid host payload'},{status:400});
  let next:any;
  try{next=JSON.parse(raw)}catch{return Response.json({error:'Invalid host JSON'},{status:400})}
  if(!next||typeof next!=='object')return Response.json({error:'Invalid host state'},{status:400});
  for(const field of SPORT_FIELDS){
   if(JSON.stringify(state[field]??null)!==JSON.stringify(next[field]??null))
    return Response.json({error:'Host link cannot alter tournament configuration or bracket'},{status:403});
  }
  // For delegated links, new completed matches must be recorded with a score and
  // may advance qualification, but they must not force finalisation.
  if(next.status==='Completed')return Response.json({error:'Finalisation requires organiser review'},{status:403});
  if(next.status==='Group Complete'&&!(next.matches||[]).every((m:any)=>m.status==='completed'))
   return Response.json({error:'Cannot complete qualification with unfinished matches'},{status:409});
  const hostPermissions=validateDelegatedTournivalHostEdit(state,next);
  if(!hostPermissions.valid)return Response.json({error:(hostPermissions as any).error},{status:403});
  const guard=validateTournivalStateTransition(state,next,{
   playerIds:Array.isArray(tournament.player_ids)?tournament.player_ids:[],
   correctionReason:clean(body.correctionReason,500)
  });
  if(!guard.valid)return Response.json({error:(guard as any).error},{status:409});
  // Prevent remove/replacement of an existing match, including a scored match.
  const previous=new Map((state.matches||[]).map((m:any)=>[m.id,m]));
  if(previous.size!==(next.matches||[]).length)
   return Response.json({error:'Host link cannot change fixture count'},{status:409});
  for(const m of next.matches||[]){
   const prior:any=previous.get(m.id);
   if(!prior||JSON.stringify(prior.teamA)!==JSON.stringify(m.teamA)||
     JSON.stringify(prior.teamB)!==JSON.stringify(m.teamB))
    return Response.json({error:'Host link cannot redraw fixtures'},{status:409});
  }
  next.revision=expectedRevision+1;
  next.lastOperationId=operationId;
  // Atomic compare-and-swap: reject contenders who read the same prior revision.
  // Base44 updateMany applies the filter and $set in one database operation.
  const save=await base44.asServiceRole.entities.TournivalSession.updateMany({
   id:session.id,tenant_id:tournament.tenant_id,state_revision:expectedRevision
  },{$set:{
   state_json:JSON.stringify(next),state_revision:next.revision,last_operation_id:operationId,
   updated_at:new Date().toISOString()
  }});
  if(save.updated!==1)return Response.json({
   error:'Host state changed during save; refresh before retrying',revision:expectedRevision
  },{status:409});
  await base44.asServiceRole.entities.Tournament.update(tournament.id,{
   tournival_state:JSON.stringify(next),
   status:next.status==='Group Complete'?'In Progress':tournament.status
  });
  try{
   await base44.asServiceRole.entities.AuditLog.create({
    tenant_id:tournament.tenant_id,club_id:tournament.host_club_id||undefined,
    action:'tournival_delegated_host_update',entity_type:'TournivalSession',entity_id:session.id,
    scope_type:'tournament',scope_id:tournament.id,user_id:'delegated-host-token',
    reason:clean(body.correctionReason,500)||'delegated_host_operation',
    after_state:JSON.stringify({revision:next.revision,operationId})
   });
  }catch(e){console.warn('Tournival host audit deferred',(e as any)?.message||e);}
  return Response.json({success:true,revision:next.revision});
 }catch(e){
  console.error('tournivalHostAccess failed',(e as any)?.message||e);
  return Response.json({error:'Unable to process host action safely'},{status:500});
 }
});
