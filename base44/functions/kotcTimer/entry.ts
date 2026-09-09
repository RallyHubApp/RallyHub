import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

function allowedAccess(a:any, tenantId:string, sessionId:string){if(!a||a.status!=='active')return false;if(String(a.tenant_id||'')!==String(tenantId||''))return false;if(String(a.session_id||'')!==String(sessionId||''))return false;if(!['session_host','assistant_host'].includes(a.role))return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}
function clamp(v:any,min:number,max:number){const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;}

Deno.serve(async(req)=>{try{
 const base44=createClientFromRequest(req);const user=await base44.auth.me();if(!user)return Response.json({error:'Unauthorized'},{status:401});
 const body=await req.json().catch(()=>({}));const sessionId=String(body.sessionId||''),roundId=String(body.roundId||''),action=String(body.action||'get');if(!sessionId||!roundId)return Response.json({error:'sessionId and roundId required'},{status:400});
 let session=(await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}))?.[0];if(!session)return Response.json({error:'KOTC session not found'},{status:404});
 let allowed=user.role==='admin';if(!allowed){const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'});allowed=(grants||[]).some((a:any)=>allowedAccess(a,session.tenant_id,session.id));}if(!allowed)return Response.json({error:'KOTC host permission required'},{status:403});
 const round=(await base44.asServiceRole.entities.KotcRound.filter({id:roundId,session_id:session.id}))?.[0];if(!round)return Response.json({error:'Round not found'},{status:404});
 const duration=Math.max(1,Number(session.play_minutes||8))*60;let state:any=null;try{state=session.timer_state_json?JSON.parse(session.timer_state_json):null;}catch{}
 if(!state||String(state.roundId)!==roundId){const started=round.started_at?Date.parse(round.started_at):NaN;const elapsed=Number.isFinite(started)?Math.max(0,Math.floor((Date.now()-started)/1000)):0;state={roundId,roundNumber:Number(round.round_number||0),durationSeconds:duration,remainingSeconds:Math.max(0,duration-elapsed),running:round.status==='started'&&elapsed<duration,deadlineAt:round.status==='started'&&elapsed<duration?new Date(Date.now()+Math.max(0,duration-elapsed)*1000).toISOString():null,lastAction:round.status==='started'?'start':'reset'};}
 if(state.running&&state.deadlineAt){state.remainingSeconds=Math.max(0,Math.ceil((Date.parse(state.deadlineAt)-Date.now())/1000));if(state.remainingSeconds===0){state.running=false;state.deadlineAt=null;state.lastAction='finish';}}
 if(action!=='get'){
  if(!['start','pause','resume','reset'].includes(action))return Response.json({error:'Unknown timer action'},{status:400});
  const requested=clamp(body.remainingSeconds,0,duration);
  if(action==='start'||action==='resume'){const remaining=action==='start'?duration:requested;state={...state,durationSeconds:duration,remainingSeconds:remaining,running:true,deadlineAt:new Date(Date.now()+remaining*1000).toISOString(),lastAction:action};}
  if(action==='pause'){state={...state,durationSeconds:duration,remainingSeconds:requested,running:false,deadlineAt:null,lastAction:'pause'};}
  if(action==='reset'){state={...state,durationSeconds:duration,remainingSeconds:duration,running:false,deadlineAt:null,lastAction:'reset'};}
 }
 state.updatedAt=new Date().toISOString();state.updatedByUserId=user.id;
 session=await base44.asServiceRole.entities.KotcSession.update(session.id,{timer_state_json:JSON.stringify(state)});
 return Response.json({success:true,state});
}catch(e){return Response.json({error:e?.message||'KOTC timer error'},{status:500});}});