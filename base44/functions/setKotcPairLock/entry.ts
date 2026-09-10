import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const RUNTIME_VERSION='kotc-2026-09-10-r7';
function sleep(ms:number){return new Promise(resolve=>setTimeout(resolve,ms));}
function isRateLimit(error:any){return /rate limit|too many requests|\b429\b/i.test(String(error?.message||error||''));}
async function retry<T>(label:string,fn:()=>Promise<T>,attempts=4){let last:any;for(let i=0;i<attempts;i++){try{return await fn();}catch(error){last=error;if(!isRateLimit(error)||i===attempts-1)throw error;const delay=Math.min(1600,250*Math.pow(2,i))+Math.floor(Math.random()*100);console.warn('KOTC pair-lock rate limit — retrying',{label,attempt:i+1,delay});await sleep(delay);}}throw last;}
function validAccess(a:any,tenantId:string,sessionId:string){if(!a||a.status!=='active'||String(a.tenant_id)!==String(tenantId)||String(a.session_id)!==String(sessionId)||a.role!=='session_host')return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}
function samePair(pair:any,p1:string,p2:string){const ids=[String(pair?.participant1_id||''),String(pair?.participant2_id||'')];return ids.includes(p1)&&ids.includes(p2);}

Deno.serve(async(req)=>{try{
  const base44=createClientFromRequest(req);const user=await base44.auth.me();if(!user)return Response.json({error:'Unauthorized',runtimeVersion:RUNTIME_VERSION},{status:401});
  const body=await req.json().catch(()=>({}));
  const sessionId=String(body.sessionId||''),p1=String(body.participant1Id||''),p2=String(body.participant2Id||''),locked=body.locked!==false;
  const roundId=String(body.roundId||'');const requested=body.slotParticipantIds&&typeof body.slotParticipantIds==='object'?body.slotParticipantIds:null;
  if(!sessionId||!p1||!p2||p1===p2)return Response.json({error:'Choose two different session players for the pair lock.',runtimeVersion:RUNTIME_VERSION},{status:400});

  let session=(await retry('session read',()=>base44.asServiceRole.entities.KotcSession.filter({id:sessionId})))?.[0];
  if(!session)return Response.json({error:'KOTC session not found.',runtimeVersion:RUNTIME_VERSION},{status:404});
  let allowed=user.role==='admin';
  if(!allowed){const grants=await retry('host access read',()=>base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'}));allowed=(grants||[]).some((a:any)=>validAccess(a,session.tenant_id,session.id));}
  if(!allowed)return Response.json({error:'Session Host access required.',runtimeVersion:RUNTIME_VERSION},{status:403});
  if(['completed','finalised','abandoned','cancelled'].includes(session.status))return Response.json({error:'Pair locks cannot be changed after the session has ended.',runtimeVersion:RUNTIME_VERSION},{status:409});

  const participants=await retry('participant read',()=>base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id}));
  const byId=new Map((participants||[]).map((p:any)=>[String(p.id),p]));
  if(!byId.has(p1)||!byId.has(p2))return Response.json({error:'Both pair-lock players must belong to this session.',runtimeVersion:RUNTIME_VERSION},{status:400});

  // If a host locks a pair from a proposed-round draft, persist that exact draft first.
  // This prevents split state where the pair is saved in Base44 but the court swap exists
  // only in the phone/browser until START ROUND is pressed.
  let returnedRound:any=null;let returnedSlots:any[]=[];let returnedMatches:any[]=[];let draftSaved=false;const changedCourts=new Set<number>();
  if(locked&&roundId&&requested){
    const round=(await retry('round read',()=>base44.asServiceRole.entities.KotcRound.filter({id:roundId,session_id:session.id})))?.[0];
    if(!round)return Response.json({error:'Round not found.',runtimeVersion:RUNTIME_VERSION},{status:404});
    if(round.status!=='proposed')return Response.json({error:'Pair changes can only be saved while the round is still being prepared.',runtimeVersion:RUNTIME_VERSION},{status:409});
    if(body.expectedProposalRevision!=null&&Number(body.expectedProposalRevision)!==Number(round.proposal_revision||1))return Response.json({error:'Round proposal changed since you opened it. Refresh and try again.',conflict:true,currentProposalRevision:Number(round.proposal_revision||1),runtimeVersion:RUNTIME_VERSION},{status:409});
    let slots=(await retry('round slot read',()=>base44.asServiceRole.entities.KotcRoundSlot.filter({round_id:round.id,session_id:session.id})))||[];
    slots=[...slots].sort((a:any,b:any)=>Number(a.ladder_court_rank)-Number(b.ladder_court_rank)||String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number));
    const eligible=new Set((participants||[]).filter((p:any)=>['registered','confirmed','present','leaving_early'].includes(p.status)).map((p:any)=>String(p.id)));
    const nextIds=slots.map((s:any)=>String(requested[s.id]||s.participant_id));const expected=Number(round.active_court_count||0)*4;
    if(slots.length!==expected||nextIds.length!==expected)return Response.json({error:`Round not ready: expected ${expected} court positions.`,runtimeVersion:RUNTIME_VERSION},{status:409});
    if(new Set(nextIds).size!==nextIds.length)return Response.json({error:'Round not ready: a player appears more than once.',runtimeVersion:RUNTIME_VERSION},{status:409});
    if(nextIds.some((id:string)=>!eligible.has(id)))return Response.json({error:'Round not ready: an unavailable player is assigned.',runtimeVersion:RUNTIME_VERSION},{status:409});
    const teams:any={};for(let i=0;i<slots.length;i++){const s=slots[i],key=`${s.ladder_court_rank}-${s.team_side}`;(teams[key]||(teams[key]=[])).push(nextIds[i]);}
    const pairTogether=Object.values(teams).some((team:any)=>team.includes(p1)&&team.includes(p2));
    if(!pairTogether)return Response.json({error:'Put the two players on the same team before locking the pair.',runtimeVersion:RUNTIME_VERSION},{status:409});

    for(let i=0;i<slots.length;i++){
      const slot=slots[i],nextId=nextIds[i];if(nextId===String(slot.participant_id))continue;
      const updated=await retry('draft slot save',()=>base44.asServiceRole.entities.KotcRoundSlot.update(slot.id,{participant_id:nextId,assignment_type:'manual_override',assignment_revision:Number(slot.assignment_revision||1)+1}));
      slots[i]=updated;changedCourts.add(Number(slot.ladder_court_rank));draftSaved=true;
    }
    let matches=(await retry('round match read',()=>base44.asServiceRole.entities.KotcMatch.filter({round_id:round.id,session_id:session.id})))||[];
    for(let i=0;i<matches.length;i++){
      const match=matches[i],rank=Number(match.ladder_court_rank);if(!changedCourts.has(rank))continue;
      const court=slots.filter((s:any)=>Number(s.ladder_court_rank)===rank);
      matches[i]=await retry('draft match save',()=>base44.asServiceRole.entities.KotcMatch.update(match.id,{team_a_participant_ids:court.filter((s:any)=>s.team_side==='A').sort((a:any,b:any)=>Number(a.slot_number)-Number(b.slot_number)).map((s:any)=>s.participant_id),team_b_participant_ids:court.filter((s:any)=>s.team_side==='B').sort((a:any,b:any)=>Number(a.slot_number)-Number(b.slot_number)).map((s:any)=>s.participant_id),revision:Number(match.revision||0)+1}));
    }
    returnedRound=draftSaved?await retry('round proposal revision',()=>base44.asServiceRole.entities.KotcRound.update(round.id,{proposal_revision:Number(round.proposal_revision||1)+1})):round;
    returnedSlots=slots;returnedMatches=matches;
  }

  const active=(await retry('pair read',()=>base44.asServiceRole.entities.KotcFixedPair.filter({session_id:session.id,status:'active'})))||[];
  const hostLocks=active.filter((p:any)=>p.pair_source==='host_selected');const exact=hostLocks.find((p:any)=>samePair(p,p1,p2));
  let pair:any=exact||null;let pairChanged=false;let alreadyApplied=false;
  if(locked){
    if(exact){alreadyApplied=true;}else{
      for(const oldPair of hostLocks){const ids=[String(oldPair.participant1_id),String(oldPair.participant2_id)];if(ids.some(id=>id===p1||id===p2))await retry('conflicting pair withdraw',()=>base44.asServiceRole.entities.KotcFixedPair.update(oldPair.id,{status:'withdrawn'}));}
      pair=await retry('pair create',()=>base44.asServiceRole.entities.KotcFixedPair.create({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,pair_name:`${byId.get(p1)?.display_name||'Player'} / ${byId.get(p2)?.display_name||'Player'}`,participant1_id:p1,participant2_id:p2,pair_source:'host_selected',status:'active'}));pairChanged=true;
    }
  }else{
    if(!exact){alreadyApplied=true;}else{await retry('pair withdraw',()=>base44.asServiceRole.entities.KotcFixedPair.update(exact.id,{status:'withdrawn'}));pair=null;pairChanged=true;}
  }

  if(pairChanged||draftSaved){session=await retry('session revision update',()=>base44.asServiceRole.entities.KotcSession.update(session.id,{revision:Number(session.revision||0)+1,last_command_id:`pair-lock-${Date.now()}`}));}
  try{if(pairChanged||draftSaved)await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:pairChanged?(locked?'kotc_pair_locked':'kotc_pair_unlocked'):'kotc_round_draft_saved',entity_type:'KotcSession',entity_id:session.id,scope_type:'KotcSession',scope_id:session.id,after_state:JSON.stringify({participant1_id:p1,participant2_id:p2,locked,draft_saved:draftSaved,changed_courts:[...changedCourts]}),reason:locked?'Host saved and locked pair':'Host unlocked pair'});}catch(error){console.warn('KOTC pair-lock audit skipped',{sessionId:session.id,error:String((error as any)?.message||error)});}
  return Response.json({success:true,alreadyApplied,locked,pair,session,round:returnedRound,slots:returnedSlots,matches:returnedMatches,draftSaved,changedCourts:[...changedCourts],runtimeVersion:RUNTIME_VERSION});
}catch(error){return Response.json({error:(error as any)?.message||'Unexpected pair-lock error',runtimeVersion:RUNTIME_VERSION},{status:500});}});