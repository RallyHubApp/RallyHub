import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const MARKER='RALLYHUB_KOTC_SANDBOX_V1';
const RUNTIME_VERSION='kotc-sandbox-2026-09-11-r1';
function nowIso(){return new Date().toISOString();}
function pad(n:number){return String(n).padStart(2,'0');}
function isSandboxTournament(t:any){return String(t?.description||'').includes(MARKER);}

Deno.serve(async(req)=>{try{
  const base44=createClientFromRequest(req);
  const user=await base44.auth.me();
  if(!user)return Response.json({error:'Unauthorized',runtimeVersion:RUNTIME_VERSION},{status:401});
  if(user.role!=='admin')return Response.json({error:'Super Admin access required for the KOTC Test Sandbox.',runtimeVersion:RUNTIME_VERSION},{status:403});
  const body=await req.json().catch(()=>({}));
  const action=String(body.action||'create');

  if(action==='create'){
    const tenantId=String(user.active_tenant_id||'');
    const clubId=String(user.active_club_id||'');
    if(!tenantId||!clubId)return Response.json({error:'Select an active tenant and club before creating a KOTC Test Sandbox.',runtimeVersion:RUNTIME_VERSION},{status:409});
    const stamp=Date.now().toString(36);
    const guests=Array.from({length:18},(_,i)=>({
      guest_id:`kotc-sandbox-${stamp}-${pad(i+1)}`,
      display_name:`Test Player ${pad(i+1)}`,
      added_at:nowIso(),
    }));
    const tournament=await base44.asServiceRole.entities.Tournament.create({
      name:`KOTC Test Sandbox — ${new Date().toLocaleDateString('en-IE',{day:'2-digit',month:'2-digit',year:'numeric'})}`,
      format:'King of the Court',partnership_type:'Singles',status:'Draft',
      tenant_id:tenantId,host_club_id:clubId,player_ids:[],partner_pairs:[],
      kotc_guest_roster:guests,kotc_num_courts:4,kotc_num_rounds:30,kotc_score_format:'timed',
      description:`${MARKER}\nIsolated RallyHub KOTC test event. Dummy guest identities only. Never include in member records, KOTC aggregates or club leaderboards.`,
    });
    return Response.json({success:true,tournamentId:tournament.id,tournament,playerCount:guests.length,isolated:true,runtimeVersion:RUNTIME_VERSION});
  }

  if(action==='fill_current_round_scores'){
    const sessionId=String(body.sessionId||'');
    if(!sessionId)return Response.json({error:'sessionId required',runtimeVersion:RUNTIME_VERSION},{status:400});
    const session=(await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}))?.[0];
    if(!session)return Response.json({error:'KOTC session not found',runtimeVersion:RUNTIME_VERSION},{status:404});
    if(session.demo_mode!==true||session.exclude_from_aggregates!==true)return Response.json({error:'REFUSED: score population is restricted to an isolated KOTC demo session.',runtimeVersion:RUNTIME_VERSION},{status:403});
    const tournament=session.tournament_id?(await base44.asServiceRole.entities.Tournament.filter({id:session.tournament_id}))?.[0]:null;
    if(!isSandboxTournament(tournament))return Response.json({error:'REFUSED: this session is not a RallyHub KOTC Test Sandbox.',runtimeVersion:RUNTIME_VERSION},{status:403});
    const participants=await base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id});
    if(!participants.length||participants.some((p:any)=>!!p.player_id||p.participant_type!=='guest'))return Response.json({error:'REFUSED: sandbox participants must be guest-only and have no Player/member identity.',runtimeVersion:RUNTIME_VERSION},{status:409});
    if(session.status!=='in_progress')return Response.json({error:`Start the current test round first. Current session status: ${session.status}.`,runtimeVersion:RUNTIME_VERSION},{status:409});
    const round=(await base44.asServiceRole.entities.KotcRound.filter({id:session.current_round_id,session_id:session.id}))?.[0];
    if(!round||round.status!=='started')return Response.json({error:'Start the current test round before filling scores.',runtimeVersion:RUNTIME_VERSION},{status:409});
    const matches=(await base44.asServiceRole.entities.KotcMatch.filter({round_id:round.id,session_id:session.id})).sort((a:any,b:any)=>Number(a.ladder_court_rank)-Number(b.ladder_court_rank));
    const unresolved=matches.filter((m:any)=>!['completed','retired','abandoned','not_played'].includes(m.status));
    if(!unresolved.length)return Response.json({success:true,alreadyFilled:true,matches,roundNumber:round.round_number,runtimeVersion:RUNTIME_VERSION});
    const now=nowIso();
    const updates=unresolved.map((m:any)=>{
      const aWins=(Number(round.round_number)+Number(m.ladder_court_rank))%2===0;
      const loser=5+((Number(round.round_number)+Number(m.ladder_court_rank))%4);
      return {id:m.id,team_a_score:aWins?11:loser,team_b_score:aWins?loser:11,winner_side:aWins?'A':'B',result_method:'normal',serving_side_at_horn:null,status:'completed',completed_at:now,revision:Number(m.revision||0)+1,command_id:`sandbox-fill-r${round.round_number}-c${m.ladder_court_rank}-${Date.now()}`,scored_by_user_id:user.id,scoring_lock_owner:null,scoring_lock_acquired_at:null,scoring_lock_expires_at:null,scorer_correction_owner_client_id:null};
    });
    const saved=await base44.asServiceRole.entities.KotcMatch.bulkUpdate(updates);
    try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_sandbox_round_scores_filled',entity_type:'KotcRound',entity_id:round.id,scope_type:'KotcSession',scope_id:session.id,after_state:JSON.stringify({round_number:round.round_number,matches:updates.length}),reason:'TEST SANDBOX deterministic score population'});}catch{}
    return Response.json({success:true,roundNumber:round.round_number,filled:updates.length,matches:saved,runtimeVersion:RUNTIME_VERSION});
  }

  return Response.json({error:'Unknown sandbox action',runtimeVersion:RUNTIME_VERSION},{status:400});
}catch(error){return Response.json({error:(error as any)?.message||'Unexpected KOTC sandbox error',runtimeVersion:RUNTIME_VERSION},{status:500});}});