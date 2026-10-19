import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

function isoOrNull(value:any){
  if(!value)return null;
  const parsed=Date.parse(String(value));
  if(!Number.isFinite(parsed))throw new Error('Invalid access expiry date/time.');
  return new Date(parsed).toISOString();
}

Deno.serve(async(req)=>{try{
  const base44=createClientFromRequest(req);
  const caller=await base44.auth.me();
  if(!caller)return Response.json({error:'Unauthorized'},{status:401});
  if(caller.role!=='admin')return Response.json({error:'Platform admin access required'},{status:403});

  const body=await req.json().catch(()=>({}));
  const action=String(body.action||'grant');
  const sessionId=String(body.sessionId||'');
  if(!sessionId)return Response.json({error:'sessionId required'},{status:400});
  const session=(await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}))?.[0];
  if(!session)return Response.json({error:'KOTC session not found'},{status:404});

  if(action==='search_hosts'){
    // Compare names without punctuation or spacing: "Mary Frances Darcy" matches "MaryFrances D'Arcy".
    const norm=(v:any)=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
    const q=norm(body.query);
    if(q.length<2)return Response.json({people:[]});
    const [tournaments,clubPlayers,members,persons]=await Promise.all([
      base44.asServiceRole.entities.Tournament.filter({id:session.tournament_id,tenant_id:session.tenant_id,host_club_id:session.club_id}),
      base44.asServiceRole.entities.Player.filter({tenant_id:session.tenant_id,club_id:session.club_id}),
      base44.asServiceRole.entities.ClubMembership.filter({tenant_id:session.tenant_id,club_id:session.club_id}),
      base44.asServiceRole.entities.Person.filter({tenant_id:session.tenant_id})
    ]);
    const rosterIds=new Set((tournaments?.[0]?.player_ids||[]).map(String));
    const memberIds=new Set((members||[]).filter((m:any)=>!['inactive','former_member'].includes(String(m.membership_status||''))).map((m:any)=>String(m.person_id)));
    const personById=new Map((persons||[]).map((p:any)=>[String(p.id),p]));
    const candidates=new Map<string,any>();
    for(const p of clubPlayers||[]){
      if(String(p.status||'Active').toLowerCase()!=='active'||['archived','suspended'].includes(String(p.relationship_status||'active').toLowerCase()))continue;
      const person=personById.get(String(p.person_id||'')) as any;
      const member=memberIds.has(String(p.person_id||''));
      if(!member&&!rosterIds.has(String(p.id)))continue;
      const name=String(person?.full_name||p.full_name||'');
      if(![name,p.full_name,person?.preferred_name].some(v=>norm(v).includes(q)))continue;
      const email=String(person?.primary_email||p.linked_user_email||p.email||'').trim();
      candidates.set(String(p.person_id||p.id),{id:p.id,name,email,inTonightRoster:rosterIds.has(String(p.id)),isMember:member});
    }
    for(const person of persons||[]){
      if(!memberIds.has(String(person.id))||candidates.has(String(person.id)))continue;
      if(![person.full_name,person.preferred_name].some(v=>norm(v).includes(q)))continue;
      candidates.set(String(person.id),{id:person.id,name:person.full_name,email:String(person.primary_email||'').trim(),inTonightRoster:false,isMember:true});
    }
    const people=[...candidates.values()].sort((a:any,b:any)=>Number(b.inTonightRoster)-Number(a.inTonightRoster)||a.name.localeCompare(b.name)).slice(0,20);
    return Response.json({people});
  }

  if(action==='list'){
    const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id});
    const users=await base44.asServiceRole.entities.User.list('-created_date',500);
    const byId=Object.fromEntries((users||[]).map((u:any)=>[u.id,u]));
    return Response.json({grants:(grants||[]).map((g:any)=>({...g,user_email:byId[g.user_id]?.email||'',user_name:byId[g.user_id]?.full_name||byId[g.user_id]?.email||g.user_id}))});
  }

  if(action==='revoke'){
    const userId=String(body.userId||'');
    if(!userId)return Response.json({error:'userId required'},{status:400});
    const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:userId,status:'active'});
    for(const grant of grants||[])await base44.asServiceRole.entities.KotcSessionAccess.update(grant.id,{status:'revoked'});
    return Response.json({success:true,revoked:(grants||[]).length});
  }

  const email=String(body.email||'').trim().toLowerCase();
  if(!email)return Response.json({error:'Host email required'},{status:400});
  const users=await base44.asServiceRole.entities.User.filter({email});
  const target=(users||[])[0];
  if(!target)return Response.json({error:'No RallyHub user exists with that email yet. Ask the host to register/sign in once, then grant the session link.'},{status:404});

  const role=['session_host','assistant_host'].includes(body.role)?body.role:'session_host';
  const now=new Date().toISOString();
  const endsAt=isoOrNull(body.endsAt) || new Date(Date.now()+12*60*60*1000).toISOString();
  const existing=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:target.id});
  const active=(existing||[]).find((g:any)=>g.status==='active');
  let grant;
  if(active){
    grant=await base44.asServiceRole.entities.KotcSessionAccess.update(active.id,{role,status:'active',starts_at:now,ends_at:endsAt,granted_by_user_id:caller.id});
  }else{
    grant=await base44.asServiceRole.entities.KotcSessionAccess.create({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,user_id:target.id,role,status:'active',starts_at:now,ends_at:endsAt,granted_by_user_id:caller.id});
  }
  return Response.json({success:true,grant,user:{id:target.id,email:target.email,full_name:target.full_name||target.email},hostPath:`/kotc-host/${session.id}`});
}catch(error){return Response.json({error:error?.message||'Unexpected KOTC host access error'},{status:500});}});
