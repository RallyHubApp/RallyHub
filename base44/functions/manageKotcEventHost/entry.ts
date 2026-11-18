import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
const active=(g:any)=>g.status==='active'&&(!g.starts_at||Date.parse(g.starts_at)<=Date.now())&&(!g.ends_at||Date.parse(g.ends_at)>Date.now());
Deno.serve(async(req)=>{try{
 const b=createClientFromRequest(req),user=await b.auth.me();if(!user)return Response.json({error:'Sign in required'},{status:401});
 const body=await req.json().catch(()=>({})),id=String(body.tournamentId||''),action=String(body.action||'state');
 const t=(await b.asServiceRole.entities.Tournament.filter({id}))?.[0];if(!t||t.format!=='King of the Court')return Response.json({error:'KOTC event not found'},{status:404});
 const grants=await b.asServiceRole.entities.TournamentUserAccess.filter({tournament_id:id,tenant_id:t.tenant_id,status:'active'});
 const permitted=user.role==='admin'||grants.some((g:any)=>String(g.user_id)===String(user.id)&&['event_host','event_manager'].includes(g.role)&&active(g));
 if(!permitted)return Response.json({error:'Not an appointed host for this event'},{status:403});
 const sessions=await b.asServiceRole.entities.KotcSession.filter({tournament_id:id});const session=(sessions||[]).find((s:any)=>!['abandoned','cancelled'].includes(s.status));
 if(action==='state'){
  const players=await b.asServiceRole.entities.Player.filter({tenant_id:t.tenant_id,club_id:t.host_club_id});
  return Response.json({tournament:t,players:(players||[]).filter((p:any)=>!['archived','inactive'].includes(String(p.relationship_status||'').toLowerCase())),sessionId:session?.id||null,canAppoint:user.role==='admin',hosts:grants.filter((g:any)=>g.role==='event_host'&&active(g)).map((g:any)=>({user_id:g.user_id,id:g.id}))});
 }
 if(action==='grant'||action==='revoke'){
  if(user.role!=='admin')return Response.json({error:'Super Admin only'},{status:403});
  const email=String(body.email||'').trim().toLowerCase();const users=await b.asServiceRole.entities.User.list('-created_date',500);const target=(users||[]).find((u:any)=>String(u.email||'').toLowerCase()===email);
  if(!target)return Response.json({error:'Host must have an existing RallyHub account'},{status:404});
  const prior=grants.find((g:any)=>g.role==='event_host'&&String(g.user_id)===String(target.id));
  if(action==='revoke'){if(prior)await b.asServiceRole.entities.TournamentUserAccess.update(prior.id,{status:'revoked'});return Response.json({success:true});}
  if(prior)return Response.json({success:true,alreadyGranted:true});
  await b.asServiceRole.entities.TournamentUserAccess.create({tenant_id:t.tenant_id,tournament_id:id,user_id:target.id,role:'event_host',status:'active',granted_by_user_id:user.id,starts_at:new Date().toISOString()});return Response.json({success:true});
 }
 if(action==='roster'){
  if(session)return Response.json({error:'Round 1 already created; use live roster controls'},{status:409});
  const ids=body.player_ids;if(!Array.isArray(ids)||ids.length>200||ids.some((x:any)=>typeof x!=='string'))return Response.json({error:'Invalid roster'},{status:400});
  const known=new Set((await b.asServiceRole.entities.Player.filter({tenant_id:t.tenant_id,club_id:t.host_club_id})).map((p:any)=>p.id));if(ids.some((x:string)=>!known.has(x)))return Response.json({error:'Player outside this club'},{status:403});
  await b.asServiceRole.entities.Tournament.update(id,{player_ids:[...new Set(ids)],kotc_player_order:[]});return Response.json({success:true});
 }
 return Response.json({error:'Unsupported action'},{status:400});
}catch(e){return Response.json({error:e?.message||'Event host action failed'},{status:500});}});
