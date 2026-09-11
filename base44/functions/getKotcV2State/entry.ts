import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const RUNTIME_VERSION='kotc-state-2026-09-10-r8';
function validAccess(a:any, tenantId:string, sessionId:string){if(!a||a.status!=='active')return false;if(String(a.tenant_id||'')!==String(tenantId||''))return false;if(String(a.session_id||'')!==String(sessionId||''))return false;if(!['session_host','assistant_host','viewer'].includes(a.role))return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}
function sleep(ms:number){return new Promise(resolve=>setTimeout(resolve,ms));}
function isRateLimit(error:any){return /rate limit|too many requests|\b429\b/i.test(String(error?.message||error||''));}
async function retry<T>(label:string,fn:()=>Promise<T>,attempts=4){let last:any;for(let i=0;i<attempts;i++){try{return await fn();}catch(error){last=error;if(!isRateLimit(error)||i===attempts-1)throw error;const delay=Math.min(1400,180*Math.pow(2,i))+Math.floor(Math.random()*80);console.warn('KOTC state rate limit — retrying',{label,attempt:i+1,delay});await sleep(delay);}}throw last;}

Deno.serve(async(req)=>{try{
 const base44=createClientFromRequest(req); const user=await base44.auth.me(); if(!user)return Response.json({error:'Unauthorized'},{status:401}); const body=await req.json().catch(()=>({}));
 const tournamentId=String(body.tournamentId||''); const sessionId=String(body.sessionId||''); const liveScoresOnly=body.liveScoresOnly===true; if(!tournamentId&&!sessionId)return Response.json({error:'tournamentId or sessionId required'},{status:400});
 let sessions:any[]=[]; if(sessionId)sessions=await retry('session read',()=>base44.asServiceRole.entities.KotcSession.filter({id:sessionId})); else sessions=await retry('tournament session read',()=>base44.asServiceRole.entities.KotcSession.filter({tournament_id:tournamentId}));
 const session=(sessions||[]).filter((s:any)=>s.status!=='cancelled').sort((a:any,b:any)=>Date.parse(b.created_date||0)-Date.parse(a.created_date||0))[0]||null;
 if(!session)return Response.json({session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[],currentUserId:user.id,currentAccessRole:user.role==='admin'?'admin':null,isAdmin:user.role==='admin',runtimeVersion:RUNTIME_VERSION});
 let allowed=user.role==='admin'; let currentAccessRole=user.role==='admin'?'admin':null;
 if(!allowed){const access=await retry('access read',()=>base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'}));const valid=(access||[]).filter((a:any)=>validAccess(a,session.tenant_id,session.id));allowed=valid.length>0;currentAccessRole=valid[0]?.role||null;}
 if(!allowed)return Response.json({error:'KOTC session access required'},{status:403});
 if(liveScoresOnly){
  const currentRoundId=String(session.current_round_id||'');
  const matches=currentRoundId?await retry('live score matches read',()=>base44.asServiceRole.entities.KotcMatch.filter({session_id:session.id,round_id:currentRoundId},'ladder_court_rank',30)):[];
  const scoreFields=(matches||[]).map((m:any)=>({id:m.id,status:m.status,team_a_score:m.team_a_score,team_b_score:m.team_b_score,winner_side:m.winner_side,serving_side_at_horn:m.serving_side_at_horn,result_method:m.result_method,revision:Number(m.revision||0),correction_count:Number(m.correction_count||0),completed_at:m.completed_at,last_corrected_at:m.last_corrected_at,last_corrected_by_user_id:m.last_corrected_by_user_id,last_correction_reason:m.last_correction_reason,original_result_json:m.original_result_json,command_id:m.command_id}));
  return Response.json({liveScoresOnly:true,session:{id:session.id,status:session.status,current_round_id:session.current_round_id,current_round_number:session.current_round_number,revision:Number(session.revision||0),timer_state_json:session.timer_state_json},matches:scoreFields,runtimeVersion:RUNTIME_VERSION});
 }
 // Live host state is intentionally lean. Historic slots, participation events, court
 // metadata, leases, partnership phases and contact records are not part of the hot path.
 const participants=await retry('participants read',()=>base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id},'seed_rank',100));
 const rounds=await retry('rounds read',()=>base44.asServiceRole.entities.KotcRound.filter({session_id:session.id},'round_number',100));
 const matches=await retry('matches read',()=>base44.asServiceRole.entities.KotcMatch.filter({session_id:session.id},'round_number',500));
 const fixedPairs=await retry('pair locks read',()=>base44.asServiceRole.entities.KotcFixedPair.filter({session_id:session.id},'phase_order',100));
 const currentRound=(rounds||[]).filter((r:any)=>Number(r.round_number)===Number(session.current_round_number)&&!['superseded'].includes(r.status)).sort((a:any,b:any)=>Number(b.proposal_revision||0)-Number(a.proposal_revision||0))[0]||null;
 const slots=currentRound?await retry('current slots read',()=>base44.asServiceRole.entities.KotcRoundSlot.filter({session_id:session.id,round_id:currentRound.id},'ladder_court_rank',100)):[];
 return Response.json({session,participants,rounds,slots,matches,fixedPairs:fixedPairs||[],contactDirectory:{},currentUserId:user.id,currentAccessRole,isAdmin:user.role==='admin',runtimeVersion:RUNTIME_VERSION});
}catch(error){return Response.json({error:error?.message||'Unexpected KOTC state error',runtimeVersion:RUNTIME_VERSION},{status:isRateLimit(error)?503:500});}});