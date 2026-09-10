import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function nowIso(){return new Date().toISOString();}
function validAccess(a:any,tenantId:string,sessionId:string){
  if(!a||a.status!=='active'||String(a.tenant_id)!==String(tenantId)||String(a.session_id)!==String(sessionId)||a.role!=='session_host')return false;
  const now=Date.now();
  if(a.starts_at&&Date.parse(a.starts_at)>now)return false;
  if(a.ends_at&&Date.parse(a.ends_at)<now)return false;
  return true;
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me();
    if(!user)return Response.json({error:'Unauthorized'},{status:401});
    const body=await req.json().catch(()=>({}));
    const sessionId=String(body.sessionId||''),p1=String(body.participant1Id||''),p2=String(body.participant2Id||''),locked=body.locked!==false;
    if(!sessionId||!p1||!p2||p1===p2)return Response.json({error:'Choose two different session players for the pair lock.'},{status:400});
    let session=(await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}))?.[0];
    if(!session)return Response.json({error:'KOTC session not found.'},{status:404});
    let allowed=user.role==='admin';
    if(!allowed){const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'});allowed=(grants||[]).some((a:any)=>validAccess(a,session.tenant_id,session.id));}
    if(!allowed)return Response.json({error:'Session Host access required.'},{status:403});
    if(['completed','finalised','abandoned','cancelled'].includes(session.status))return Response.json({error:'Pair locks cannot be changed after the session has ended.'},{status:409});
    const participants=await base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id});
    const byId=new Map((participants||[]).map((p:any)=>[String(p.id),p]));
    if(!byId.has(p1)||!byId.has(p2))return Response.json({error:'Both pair-lock players must belong to this session.'},{status:400});
    const active=(await base44.asServiceRole.entities.KotcFixedPair.filter({session_id:session.id,status:'active'}))||[];
    const hostLocks=active.filter((p:any)=>p.pair_source==='host_selected');
    const exact=hostLocks.find((p:any)=>new Set([String(p.participant1_id),String(p.participant2_id)]).size===2&&[String(p.participant1_id),String(p.participant2_id)].includes(p1)&&[String(p.participant1_id),String(p.participant2_id)].includes(p2));
    if(locked&&exact)return Response.json({success:true,alreadyApplied:true,locked:true,pair:exact,session,runtimeVersion:'kotc-2026-09-10-r5'});
    if(!locked&&!exact)return Response.json({success:true,alreadyApplied:true,locked:false,pair:null,session,runtimeVersion:'kotc-2026-09-10-r5'});
    for(const pair of hostLocks){
      const ids=[String(pair.participant1_id),String(pair.participant2_id)];
      if(ids.some(id=>id===p1||id===p2))await base44.asServiceRole.entities.KotcFixedPair.update(pair.id,{status:'withdrawn'});
    }
    let pair=null;
    if(locked){pair=await base44.asServiceRole.entities.KotcFixedPair.create({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,pair_name:`${byId.get(p1)?.display_name||'Player'} / ${byId.get(p2)?.display_name||'Player'}`,participant1_id:p1,participant2_id:p2,pair_source:'host_selected',status:'active'});}
    session=await base44.asServiceRole.entities.KotcSession.update(session.id,{revision:Number(session.revision||0)+1,last_command_id:`pair-lock-${Date.now()}`});
    try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:locked?'kotc_pair_locked':'kotc_pair_unlocked',entity_type:'KotcSession',entity_id:session.id,scope_type:'KotcSession',scope_id:session.id,after_state:JSON.stringify({participant1_id:p1,participant2_id:p2,locked}),reason:locked?'Host locked pair':'Host unlocked pair'});}catch(error){console.warn('KOTC pair-lock audit skipped',{sessionId:session.id,error:String((error as any)?.message||error)});}
    return Response.json({success:true,locked,pair,session,runtimeVersion:'kotc-2026-09-10-r5'});
  }catch(error){return Response.json({error:(error as any)?.message||'Unexpected pair-lock error',runtimeVersion:'kotc-2026-09-10-r5'},{status:500});}
});
