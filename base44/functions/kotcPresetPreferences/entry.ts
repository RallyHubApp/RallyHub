import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
const str=(x:any)=>String(x||'').trim().slice(0,180);
const digest=async(x:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x)))).map(b=>b.toString(16).padStart(2,'0')).join('');
Deno.serve(async(req)=>{try{
 const base44=createClientFromRequest(req),body=await req.json(),action=str(body.action),user=await base44.auth.me().catch(()=>null);
 const token=str(body.shareToken),shares=token?await base44.asServiceRole.entities.KotcSessionShare.filter({token,status:'active'}):[];
 const share=shares?.[0],sessionId=str(body.sessionId||share?.session_id);
 const session=(await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}))?.[0];
 if(!session||share&&String(share.session_id)!==String(session.id))return Response.json({error:'Session unavailable'},{status:404});
 const hostGrants=user?.id?await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'}):[];
 const host=!!user&&(user.role==='admin'||(hostGrants||[]).some((g:any)=>['session_host','assistant_host'].includes(g.role)&&String(g.tenant_id)===String(session.tenant_id)&&(!g.starts_at||Date.parse(g.starts_at)<=Date.now())&&(!g.ends_at||Date.parse(g.ends_at)>Date.now())));
 const participants=await base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id});
 const eligible=participants.filter((p:any)=>!['withdrawn','replaced','no_show','left'].includes(p.status));const ids=new Set(eligible.map((p:any)=>String(p.id)));
 const rows=await base44.asServiceRole.entities.KotcPresetPreference.filter({session_id:session.id});
 if(action==='host_list'){if(!host)return Response.json({error:'Host access required'},{status:403});return Response.json({success:true,preferences:rows,participants:eligible.map((p:any)=>({id:p.id,name:p.display_name})),closed:['completed','finalised','cancelled'].includes(session.status)});}
 if(action!=='save')return Response.json({error:'Unknown action'},{status:400});
 if(['completed','finalised','cancelled'].includes(session.status))return Response.json({error:'Session is closed'},{status:409});
 const participantId=str(body.participantId),partner=str(body.partnerId),opponent=str(body.opponentId),second=str(body.secondChoiceId);
 if(!ids.has(participantId))return Response.json({error:'Player not in session'},{status:400});
 if([partner,opponent,second].some(id=>id&&(!ids.has(id)||id===participantId))||[partner,opponent,second].filter(Boolean).length!==new Set([partner,opponent,second].filter(Boolean)).size)return Response.json({error:'Choose distinct players from this session'},{status:400});
 if(!host){
  if(!share||!body.deviceToken)return Response.json({error:'Verified player link required'},{status:403});
  const hash=await digest(str(body.deviceToken));
  const access=(await base44.asServiceRole.entities.KotcPlayerDeviceAccess.filter({session_id:session.id,share_id:share.id,participant_id:participantId,device_token_hash:hash,status:'approved'}))?.[0];
  if(!access||access.expires_at&&Date.parse(access.expires_at)<Date.now())return Response.json({error:'Verify your player device before saving preferences'},{status:403});
 }
 const existing=rows.find((r:any)=>String(r.participant_id)===participantId);const data={tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,participant_id:participantId,partner_id:partner,opponent_id:opponent,second_choice_id:second,updated_by_host:host};
 if(existing)await base44.asServiceRole.entities.KotcPresetPreference.update(existing.id,data);else await base44.asServiceRole.entities.KotcPresetPreference.create(data);
 return Response.json({success:true});
}catch(e){return Response.json({error:(e as any)?.message||'Preferences unavailable'},{status:500});}});