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
  return Response.json({success:true,grant,user:{id:target.id,email:target.email,full_name:target.full_name||target.email},hostPath:`/app/kotc-host/${session.id}`});
}catch(error){return Response.json({error:error?.message||'Unexpected KOTC host access error'},{status:500});}});
