import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

function nowIso(){return new Date().toISOString();}
function allowedAccess(a:any,tenantId:string,sessionId:string){if(!a||a.status!=='active'||String(a.tenant_id||'')!==String(tenantId||'')||String(a.session_id||'')!==String(sessionId||''))return false;if(a.role!=='session_host')return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}

Deno.serve(async(req)=>{try{
 const base44=createClientFromRequest(req);const user=await base44.auth.me();if(!user)return Response.json({error:'Unauthorized'},{status:401});
 const body=await req.json().catch(()=>({}));const sessionId=String(body.sessionId||''),action=String(body.action||'');if(!sessionId||!['finish','abandon'].includes(action))return Response.json({error:'sessionId and valid action are required'},{status:400});
 const session=(await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}))?.[0];if(!session)return Response.json({error:'KOTC session not found'},{status:404});
 let allowed=user.role==='admin';if(!allowed){const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'});allowed=(grants||[]).some((a:any)=>allowedAccess(a,session.tenant_id,session.id));}if(!allowed)return Response.json({error:'Primary session host access required'},{status:403});
 if(['completed','finalised','abandoned'].includes(session.status))return Response.json({success:true,alreadyEnded:true,session});
 if(!['ready','in_progress','paused'].includes(session.status))return Response.json({error:`Session cannot be ended from ${session.status}`},{status:409});
 const now=nowIso();const matches=await base44.asServiceRole.entities.KotcMatch.filter({session_id:session.id});
 if(action==='finish'){
   for(const m of (matches||[]).filter((m:any)=>!['completed','retired','abandoned','not_played'].includes(m.status))){await base44.asServiceRole.entities.KotcMatch.update(m.id,{status:'not_played',result_method:'not_played',completed_at:now,revision:Number(m.revision||0)+1});}
 }
 const rounds=await base44.asServiceRole.entities.KotcRound.filter({session_id:session.id});
 for(const r of (rounds||[]).filter((r:any)=>['proposed','confirmed','started'].includes(r.status))){const rm=(matches||[]).filter((m:any)=>String(m.round_id)===String(r.id));const played=rm.some((m:any)=>m.status==='completed');await base44.asServiceRole.entities.KotcRound.update(r.id,{status:played?'completed':'abandoned',completed_at:played?now:undefined,abandonment_reason:played?undefined:(action==='finish'?'Session finished before this round was played':String(body.reason||'Session abandoned by host'))});}
 const update:any={status:action==='finish'?'completed':'abandoned',actual_session_end:now,revision:Number(session.revision||0)+1,last_command_id:String(body.commandId||`end-${Date.now()}`)};if(action==='abandon')update.abandonment_reason=String(body.reason||'Session abandoned by host');
 const updated=await base44.asServiceRole.entities.KotcSession.update(session.id,update);
 if(session.tournament_id)await base44.asServiceRole.entities.Tournament.update(session.tournament_id,{status:action==='finish'?'Completed':'Cancelled',finalised_at:action==='finish'?now:undefined});
 await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:action==='finish'?'kotc_session_finished':'kotc_session_abandoned',entity_type:'KotcSession',entity_id:session.id,scope_type:'KotcSession',scope_id:session.id,before_state:JSON.stringify({status:session.status,revision:session.revision}),after_state:JSON.stringify({status:updated.status,revision:updated.revision}),reason:action==='finish'?'Host finished session and preserved completed results':String(body.reason||'Session abandoned by host')});
 return Response.json({success:true,session:updated,completedMatches:(matches||[]).filter((m:any)=>m.status==='completed').length});
}catch(error){return Response.json({error:error?.message||'Unexpected session-end error'},{status:500});}});