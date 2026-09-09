import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

function randomToken(){const b=new Uint8Array(32);crypto.getRandomValues(b);return Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('');}
function validHostAccess(a:any,tenantId:string,sessionId:string){if(!a||a.status!=='active'||a.role!=='session_host')return false;if(String(a.tenant_id||'')!==String(tenantId)||String(a.session_id||'')!==String(sessionId))return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}

Deno.serve(async req=>{try{
 const base44=createClientFromRequest(req);const user=await base44.auth.me();if(!user)return Response.json({error:'Unauthorized'},{status:401});
 const body=await req.json().catch(()=>({}));const sessionId=String(body.sessionId||''),action=String(body.action||'get_or_create');if(!sessionId)return Response.json({error:'sessionId required'},{status:400});
 const session=(await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}))?.[0];if(!session)return Response.json({error:'KOTC session not found'},{status:404});
 let allowed=user.role==='admin';if(!allowed){const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'});allowed=(grants||[]).some((g:any)=>validHostAccess(g,session.tenant_id,session.id));}if(!allowed)return Response.json({error:'Primary session host access required'},{status:403});
 let existing=(await base44.asServiceRole.entities.KotcScorerToken.filter({session_id:session.id,status:'active'})).sort((a:any,b:any)=>Date.parse(b.created_at||b.created_date||0)-Date.parse(a.created_at||a.created_date||0));
 for(const row of existing.filter((x:any)=>x.expires_at&&Date.parse(x.expires_at)<Date.now()))await base44.asServiceRole.entities.KotcScorerToken.update(row.id,{status:'revoked'});
 existing=existing.filter((x:any)=>!x.expires_at||Date.parse(x.expires_at)>=Date.now());
 if(action==='revoke'){for(const row of existing)await base44.asServiceRole.entities.KotcScorerToken.update(row.id,{status:'revoked'});return Response.json({success:true,revoked:existing.length});}
 let scorer=existing[0]||null;if(!scorer){const now=new Date().toISOString();scorer=await base44.asServiceRole.entities.KotcScorerToken.create({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,token:randomToken(),status:'active',created_by_user_id:user.id,created_at:now,expires_at:new Date(Date.now()+18*60*60*1000).toISOString(),use_count:0});}
 return Response.json({success:true,token:scorer.token,scorerId:scorer.id,expires_at:scorer.expires_at,scorerPath:`/kotc-score/${scorer.token}`});
}catch(error){return Response.json({error:error?.message||'Unexpected scorer-link error'},{status:500});}});