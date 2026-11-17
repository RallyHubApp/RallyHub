import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
Deno.serve(async req=>{try{
 const base44=createClientFromRequest(req),user=await base44.auth.me();if(!user)return Response.json({error:'Unauthorised'},{status:401});
 const body=await req.json(),session=(await base44.asServiceRole.entities.KotcSession.filter({id:String(body.sessionId||'')}))?.[0];if(!session)return Response.json({error:'Session not found'},{status:404});
 let allowed=user.role==='admin';if(!allowed){const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'});allowed=(grants||[]).some((a:any)=>a.role==='session_host'&&String(a.tenant_id)===String(session.tenant_id)&&(!a.ends_at||Date.parse(a.ends_at)>Date.now())&&(!a.starts_at||Date.parse(a.starts_at)<=Date.now()));}if(!allowed)return Response.json({error:'Primary host access required'},{status:403});
 if(session.scoring_mode!=='timed')return Response.json({error:'Preset Finish is available in timed King of the Court sessions only.'},{status:409});
 if(Number(body.expectedSessionRevision)!==Number(session.revision||0))return Response.json({error:'Session changed. Refresh and retry.',conflict:true},{status:409});
 const presets=body.presets;if(!Array.isArray(presets)||presets.length<1||presets.length>2)return Response.json({error:'Save one or two presets.'},{status:400});
 const rounds=await base44.asServiceRole.entities.KotcRound.filter({session_id:session.id});if(rounds.some((r:any)=>r.preset_finish_index&& !['abandoned','superseded'].includes(r.status)))return Response.json({error:'Cannot edit saved presets after a preset has been activated.'},{status:409});
 const people=await base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id});const eligible=people.filter((p:any)=>['registered','confirmed','present','leaving_early'].includes(p.status)&&!(p.scheduled_departure_at&&Date.parse(p.scheduled_departure_at)<=Date.now()));const ids=new Set(eligible.map((p:any)=>String(p.id)));
 const count=Math.min(Number(session.available_court_limit||session.venue_court_limit||4),Math.floor(eligible.length/4));if(count<1)return Response.json({error:'At least four eligible players are required.'},{status:409});
 for(const [index,preset] of presets.entries()){
  if(!Number.isInteger(Number(preset.minutes))||Number(preset.minutes)<1||Number(preset.minutes)>60)return Response.json({error:`Preset ${index+1}: duration must be 1–60 minutes.`},{status:400});
  if(!Array.isArray(preset.courts)||preset.courts.length!==count)return Response.json({error:`Preset ${index+1}: expected ${count} courts.`},{status:400});
  const assigned=preset.courts.flatMap((c:any)=>[...(c.A||[]),...(c.B||[])]).map(String);
  if(preset.courts.some((c:any)=>c.A?.length!==2||c.B?.length!==2)||assigned.length!==count*4||new Set(assigned).size!==assigned.length||assigned.some((id:string)=>!ids.has(id)))return Response.json({error:`Preset ${index+1}: duplicate, incomplete or unavailable player assignment.`},{status:400});
 }
 const updated=await base44.asServiceRole.entities.KotcSession.update(session.id,{preset_finish_json:JSON.stringify({presets}),revision:Number(session.revision||0)+1});
 return Response.json({success:true,session:updated});
}catch(error){return Response.json({error:(error as any)?.message||'Could not save presets'},{status:500});}});