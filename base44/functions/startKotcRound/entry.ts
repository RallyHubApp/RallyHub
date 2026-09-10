import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const RUNTIME_VERSION='kotc-start-2026-09-10-r8';
function nowIso(){return new Date().toISOString();}
function sleep(ms:number){return new Promise(resolve=>setTimeout(resolve,ms));}
function isRateLimit(error:any){return /rate limit|too many requests|\b429\b/i.test(String(error?.message||error||''));}
async function retry<T>(label:string,fn:()=>Promise<T>,attempts=5){let last:any;for(let i=0;i<attempts;i++){try{return await fn();}catch(error){last=error;if(!isRateLimit(error)||i===attempts-1)throw error;const delay=Math.min(1600,180*Math.pow(2,i))+Math.floor(Math.random()*80);console.warn('KOTC start rate limit — retrying',{label,attempt:i+1,delay});await sleep(delay);}}throw last;}
function validAccess(a:any,tenantId:string,sessionId:string){if(!a||a.status!=='active'||String(a.tenant_id)!==String(tenantId)||String(a.session_id)!==String(sessionId)||a.role!=='session_host')return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}

Deno.serve(async(req)=>{try{
 const base44=createClientFromRequest(req);const user=await base44.auth.me();if(!user)return Response.json({error:'Unauthorized',runtimeVersion:RUNTIME_VERSION},{status:401});
 const body=await req.json().catch(()=>({}));const sessionId=String(body.sessionId||''),roundId=String(body.roundId||''),commandId=String(body.commandId||'');
 if(!sessionId||!roundId||!commandId)return Response.json({error:'sessionId, roundId and commandId are required',runtimeVersion:RUNTIME_VERSION},{status:400});
 let session=(await retry('session read',()=>base44.asServiceRole.entities.KotcSession.filter({id:sessionId})))?.[0];if(!session)return Response.json({error:'KOTC session not found',runtimeVersion:RUNTIME_VERSION},{status:404});
 let allowed=user.role==='admin';if(!allowed){const grants=await retry('access read',()=>base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'}));allowed=(grants||[]).some((a:any)=>validAccess(a,session.tenant_id,session.id));}if(!allowed)return Response.json({error:'Primary session host access required',runtimeVersion:RUNTIME_VERSION},{status:403});
 let round=(await retry('round read',()=>base44.asServiceRole.entities.KotcRound.filter({id:roundId,session_id:session.id})))?.[0];if(!round)return Response.json({error:'Round not found',runtimeVersion:RUNTIME_VERSION},{status:404});
 // Lost-response/retry repair: once the round is started, make the session pointer/status agree
 // and return success. The host must never be stranded by a partial final acknowledgement.
 if(round.status==='started'){
   if(String(session.current_round_id||'')!==String(round.id)||Number(session.current_round_number)!==Number(round.round_number)||session.status==='ready'){
     session=await retry('repair started session',()=>base44.asServiceRole.entities.KotcSession.update(session.id,{status:'in_progress',current_round_id:round.id,current_round_number:round.round_number,revision:Number(session.revision||0)+1,last_command_id:commandId,actual_first_round_start:session.actual_first_round_start||round.started_at||nowIso()}));
   }
   const slots=await retry('started slots read',()=>base44.asServiceRole.entities.KotcRoundSlot.filter({round_id:round.id,session_id:session.id}));
   const matches=await retry('started matches read',()=>base44.asServiceRole.entities.KotcMatch.filter({round_id:round.id,session_id:session.id}));
   return Response.json({success:true,alreadyStarted:true,session,round,slots,matches,runtimeVersion:RUNTIME_VERSION});
 }
 if(round.status!=='proposed')return Response.json({error:`Round cannot start from ${round.status}.`,runtimeVersion:RUNTIME_VERSION},{status:409});
 if(Number(body.expectedProposalRevision)!==Number(round.proposal_revision||1))return Response.json({error:'Round proposal changed since you opened it. Reloading is required before starting.',conflict:true,currentProposalRevision:Number(round.proposal_revision||1),runtimeVersion:RUNTIME_VERSION},{status:409});
 const slots=(await retry('slots read',()=>base44.asServiceRole.entities.KotcRoundSlot.filter({round_id:round.id,session_id:session.id}))).sort((a:any,b:any)=>Number(a.ladder_court_rank)-Number(b.ladder_court_rank)||String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number));
 const participants=await retry('participants read',()=>base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id}));
 const lockRows=await retry('locks read',()=>base44.asServiceRole.entities.KotcFixedPair.filter({session_id:session.id,status:'active'}));
 const eligible=new Set((participants||[]).filter((p:any)=>['registered','confirmed','present','leaving_early'].includes(p.status)).map((p:any)=>String(p.id)));
 const requested=body.slotParticipantIds||{};const nextIds=slots.map((s:any)=>String(requested[s.id]||s.participant_id));const expected=Number(round.active_court_count||0)*4;
 if(slots.length!==expected||nextIds.length!==expected)return Response.json({error:`Round not ready: expected ${expected} court positions.`,runtimeVersion:RUNTIME_VERSION},{status:409});
 if(new Set(nextIds).size!==nextIds.length)return Response.json({error:'Round not ready: a player appears more than once.',runtimeVersion:RUNTIME_VERSION},{status:409});
 if(nextIds.some((id:string)=>!eligible.has(id)))return Response.json({error:'Round not ready: an unavailable player is assigned.',runtimeVersion:RUNTIME_VERSION},{status:409});
 const teams:any={};for(let i=0;i<slots.length;i++){const s=slots[i],key=`${s.ladder_court_rank}-${s.team_side}`;(teams[key]||(teams[key]=[])).push(nextIds[i]);}
 for(const team of Object.values(teams) as any[])if(team.length!==2)return Response.json({error:'Round not ready: every team must contain two players.',runtimeVersion:RUNTIME_VERSION},{status:409});
 const locks=(lockRows||[]).filter((p:any)=>p.pair_source==='host_selected');for(const l of locks){const a=String(l.participant1_id),b=String(l.participant2_id);if(nextIds.includes(a)&&nextIds.includes(b)&&!Object.values(teams).some((t:any)=>t.includes(a)&&t.includes(b)))return Response.json({error:`Round not ready: locked pair ${l.pair_name||''} is split.`,runtimeVersion:RUNTIME_VERSION},{status:409});}
 const changedIndexes:number[]=[];const changedCourts=new Set<number>();for(let i=0;i<slots.length;i++)if(nextIds[i]!==String(slots[i].participant_id)){changedIndexes.push(i);changedCourts.add(Number(slots[i].ladder_court_rank));}
 let committedSlots=slots;
 let committedMatches:any[]=[];
 if(changedIndexes.length){
   const slotUpdates=changedIndexes.map(i=>({id:slots[i].id,participant_id:nextIds[i],assignment_type:'manual_override',assignment_revision:Number(slots[i].assignment_revision||1)+1}));
   await retry('manual slots bulk save',()=>base44.asServiceRole.entities.KotcRoundSlot.bulkUpdate(slotUpdates));
   committedSlots=slots.map((s:any,i:number)=>changedIndexes.includes(i)?{...s,participant_id:nextIds[i],assignment_type:'manual_override',assignment_revision:Number(s.assignment_revision||1)+1}:s);
   const matches=await retry('changed matches read',()=>base44.asServiceRole.entities.KotcMatch.filter({round_id:round.id,session_id:session.id}));
   const matchUpdates=(matches||[]).filter((m:any)=>changedCourts.has(Number(m.ladder_court_rank))).map((m:any)=>{const court=committedSlots.filter((s:any)=>Number(s.ladder_court_rank)===Number(m.ladder_court_rank));return{id:m.id,team_a_participant_ids:court.filter((s:any)=>s.team_side==='A').sort((a:any,b:any)=>Number(a.slot_number)-Number(b.slot_number)).map((s:any)=>s.participant_id),team_b_participant_ids:court.filter((s:any)=>s.team_side==='B').sort((a:any,b:any)=>Number(a.slot_number)-Number(b.slot_number)).map((s:any)=>s.participant_id),revision:Number(m.revision||0)+1,command_id:commandId};});
   if(matchUpdates.length)await retry('manual matches bulk save',()=>base44.asServiceRole.entities.KotcMatch.bulkUpdate(matchUpdates));
   const updateById=Object.fromEntries(matchUpdates.map((m:any)=>[m.id,m]));committedMatches=(matches||[]).map((m:any)=>updateById[m.id]?{...m,...updateById[m.id]}:m);
 }else{
   committedMatches=await retry('current matches read',()=>base44.asServiceRole.entities.KotcMatch.filter({round_id:round.id,session_id:session.id}));
 }
 const now=nowIso();
 // Critical sporting commit is sequential to avoid Base44 request bursts. Tournament status was
 // already set when the KOTC session was created, so no redundant tournament write is needed here.
 round=await retry('round start save',()=>base44.asServiceRole.entities.KotcRound.update(round.id,{status:'started',confirmed_at:now,confirmed_by_user_id:user.id,started_at:now}));
 const sessionUpdate:any={status:'in_progress',revision:Number(session.revision||0)+1,last_command_id:commandId,current_round_number:round.round_number,current_round_id:round.id};if(!session.actual_first_round_start)sessionUpdate.actual_first_round_start=now;
 session=await retry('session start save',()=>base44.asServiceRole.entities.KotcSession.update(session.id,sessionUpdate));
 try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_round_started',entity_type:'KotcRound',entity_id:round.id,scope_type:'KotcSession',scope_id:session.id,after_state:JSON.stringify({round_number:round.round_number,started_at:now,manual_courts:[...changedCourts]})});}catch(error){console.warn('KOTC start audit skipped',{sessionId:session.id,error:String((error as any)?.message||error)});}
 return Response.json({success:true,session,round,slots:committedSlots,matches:committedMatches,runtimeVersion:RUNTIME_VERSION});
}catch(error){return Response.json({error:(error as any)?.message||'Unexpected KOTC start error',runtimeVersion:RUNTIME_VERSION},{status:isRateLimit(error)?503:500});}});