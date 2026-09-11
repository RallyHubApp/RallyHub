import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const RESOLVED=new Set(['completed','retired','abandoned','not_played']);
function int0(v:any){const n=Number(v);return Number.isInteger(n)&&n>=0?n:null;}
function nowIso(){return new Date().toISOString();}
function sleep(ms:number){return new Promise(resolve=>setTimeout(resolve,ms));}
function isRateLimit(error:any){return /rate limit|too many requests|\b429\b/i.test(String(error?.message||error||''));}
async function withRateLimitRetry<T>(label:string,fn:()=>Promise<T>,attempts=4){let last:any;for(let i=0;i<attempts;i++){try{return await fn();}catch(error){last=error;if(!isRateLimit(error)||i===attempts-1)throw error;const delay=Math.min(1600,250*Math.pow(2,i))+Math.floor(Math.random()*100);console.warn('KOTC score rate limit — retrying',{label,attempt:i+1,delay});await sleep(delay);}}throw last;}
function validAccess(a:any,tenantId:string,sessionId:string){if(!a||a.status!=='active'||String(a.tenant_id)!==String(tenantId)||String(a.session_id)!==String(sessionId)||!['session_host','assistant_host'].includes(a.role))return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}
function validateFinalScore(body:any,session:any){
  const a=int0(body.teamAScore),b=int0(body.teamBScore);if(a==null||b==null)return{error:'Scores must be non-negative whole numbers.'};if(a>99||b>99)return{error:'KOTC scores cannot exceed 99.'};
  if(session.scoring_mode==='timed'){
    if(a===b){if(!['A','B'].includes(body.servingSideAtHorn))return{error:'A tied timed match requires the serving side at the horn.'};return{a,b,winner:body.servingSideAtHorn==='B'?'B':'A',method:'timed_serving_tiebreak'};}
    return{a,b,winner:a>b?'A':'B',method:'normal'};
  }
  if(session.scoring_mode!=='first_to')return{error:'Unknown KOTC scoring mode.'};
  if(a===b)return{error:'First-to scoring requires a winner.'};
  const target=Number(session.score_target||11),cap=Number(session.score_cap||0),winner=Math.max(a,b),loser=Math.min(a,b);
  if(!Number.isInteger(target)||target<1)return{error:'Invalid score target.'};
  if(winner<target)return{error:`Winner must reach at least ${target}.`};
  if(cap>0&&winner>cap)return{error:`Score cannot exceed cap of ${cap}.`};
  if(session.win_by_two&&winner-loser<2&&!(cap>0&&winner===cap))return{error:'Winner must lead by 2 unless the score cap is reached.'};
  if(!session.win_by_two&&winner>target&&!(cap>0&&winner===cap))return{error:`Match should finish when a team reaches ${target}.`};
  return{a,b,winner:a>b?'A':'B',method:'normal'};
}

Deno.serve(async(req)=>{try{
  const base44=createClientFromRequest(req);const user=await base44.auth.me();if(!user)return Response.json({error:'Unauthorized'},{status:401});
  const body=await req.json().catch(()=>({}));const sessionId=String(body.sessionId||''),matchId=String(body.matchId||''),commandId=String(body.commandId||'');
  if(!sessionId||!matchId||!commandId)return Response.json({error:'sessionId, matchId and commandId are required'},{status:400});
  const session=(await withRateLimitRetry('score session read',()=>base44.asServiceRole.entities.KotcSession.filter({id:sessionId})))?.[0];if(!session)return Response.json({error:'KOTC session not found'},{status:404});
  let allowed=user.role==='admin';if(!allowed){const grants=await withRateLimitRetry('score access read',()=>base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'}));allowed=(grants||[]).some((a:any)=>validAccess(a,session.tenant_id,session.id));}if(!allowed)return Response.json({error:'KOTC scoring permission required'},{status:403});
  if(session.status!=='in_progress')return Response.json({error:`Scores can only be saved while the session is live. Current status: ${session.status}.`},{status:409});
  const match=(await withRateLimitRetry('score match read',()=>base44.asServiceRole.entities.KotcMatch.filter({id:matchId,session_id:session.id})))?.[0];if(!match)return Response.json({error:'Match not found'},{status:404});
  const score:any=validateFinalScore(body,session);if(score.error)return Response.json({error:score.error},{status:400});

  // If the client timed out after Base44 committed the score, a retry with the same values
  // must report success instead of forcing the host into a confusing correction flow.
  if(RESOLVED.has(match.status)){
    const same=Number(match.team_a_score)===score.a&&Number(match.team_b_score)===score.b&&String(match.winner_side||'')===String(score.winner);
    if(same)return Response.json({success:true,alreadySaved:true,match});
    return Response.json({error:'A different score is already saved for this court. Use Undo / Update Score to correct it.'},{status:409});
  }
  const expected=Number(body.expectedMatchRevision),current=Number(match.revision||0);if(expected!==current)return Response.json({error:'Match changed since you opened it. Refresh and try again.',conflict:true,currentMatchRevision:current},{status:409});
  const activeOwner=String(match.scoring_lock_owner||'');const activeLock=!!(activeOwner&&match.scoring_lock_expires_at&&Date.parse(match.scoring_lock_expires_at)>Date.now());const hostOwner=`host:${user.id}`;
  if(activeLock&&activeOwner!==hostOwner)return Response.json({error:`Court ${match.ladder_court_rank} is already being entered by a player. Wait for them to save or cancel, then refresh player scores.`,locked:true},{status:423});
  const now=nowIso();const displacedScorer=false;
  const updated=await withRateLimitRetry('score match save',()=>base44.asServiceRole.entities.KotcMatch.update(match.id,{team_a_score:score.a,team_b_score:score.b,winner_side:score.winner,result_method:score.method,serving_side_at_horn:score.method==='timed_serving_tiebreak'?body.servingSideAtHorn:null,status:'completed',completed_at:now,revision:current+1,command_id:commandId,scored_by_user_id:user.id,scoring_lock_owner:null,scoring_lock_acquired_at:null,scoring_lock_expires_at:null,scorer_correction_owner_client_id:null}));
  try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_score_completed',entity_type:'KotcMatch',entity_id:match.id,scope_type:'KotcSession',scope_id:session.id,after_state:JSON.stringify({team_a_score:score.a,team_b_score:score.b,winner_side:score.winner,revision:current+1})});}catch(error){console.warn('KOTC score audit skipped',{sessionId:session.id,matchId:match.id,error:String((error as any)?.message||error)});}
  return Response.json({success:true,match:updated,displacedScorer});
}catch(error){return Response.json({error:(error as any)?.message||'Unexpected KOTC score error'},{status:isRateLimit(error)?503:500});}});
