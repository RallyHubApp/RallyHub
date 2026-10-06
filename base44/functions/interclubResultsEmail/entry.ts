import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { sendClubEmail } from './emailRouter.ts';
import { interclubResultsHtml, interclubResultsText } from './resultsEmailTemplate.ts';
const clean=(v:any,max=4000)=>String(v??'').trim().slice(0,max); const now=()=>new Date().toISOString();
function esc(v:any){return String(v??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));}
function firstName(v:any){return clean(v,120).split(/\s+/)[0]||'Player';}
function validEmail(v:any){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(v,320).toLowerCase());}
function validGrant(a:any,tenantId:string){if(!a||a.status!=='active'||String(a.tenant_id||'')!==tenantId)return false;const t=Date.now();return !(a.starts_at&&Date.parse(a.starts_at)>t)&&!(a.ends_at&&Date.parse(a.ends_at)<t);}
async function authorised(base44:any,user:any,event:any){if(user?.role==='admin')return true;const rows=await base44.asServiceRole.entities.TournamentUserAccess.filter({tournament_id:event.tournament_id,user_id:user.id,status:'active'});return (rows||[]).some((a:any)=>validGrant(a,String(event.tenant_id))&&['event_manager','event_host'].includes(a.role));}
async function resultUrl(base44:any,event:any,p:any,source='system'){let rows=await base44.asServiceRole.entities.InterclubParticipantResultToken.filter({challenge_event_id:event.id,participant_id:p.id,status:'active'},'-created_at',5);let row=rows?.[0];if(!row)row=await base44.asServiceRole.entities.InterclubParticipantResultToken.create({tenant_id:event.tenant_id,club_id:event.host_club_id||undefined,challenge_event_id:event.id,participant_id:p.id,token:`ipr_${crypto.randomUUID().replaceAll('-','')}`,status:'active',source,created_at:now()});return `https://rallyhub.ie/interclub-results/${row.token}`;}
async function alertsUrlFor(base44:any,p:any,event:any){
  const email=clean(p?.email,320).toLowerCase();
  if(validEmail(email)){
    try{
      const rows=await base44.asServiceRole.entities.DirectoryPlayerSubscriber.filter({email},'-updated_at',5);
      const row=rows?.[0];
      if(row?.unsubscribe_token)return `https://rallyhub.ie/directory/player-updates?token=${encodeURIComponent(row.unsubscribe_token)}`;
    }catch{}
  }
  let mobile='',county='';
  if(p?.source_person_id){
    try{
      const people=await base44.asServiceRole.entities.Person.filter({id:p.source_person_id},'-updated_date',1);
      const person=people?.[0];
      mobile=clean(person?.mobile,80);
      county=clean(person?.county_region,100);
    }catch{}
  }
  if(!county){
    const club=String(p?.side)==='club_b'?String(event?.club_b_name||''):String(event?.club_a_name||'');
    if(/clare/i.test(club))county='Clare'; else if(/galway/i.test(club))county='Galway';
  }
  const q=new URLSearchParams({join:'1',firstName:firstName(p?.display_name),email,mobile,county,utm_source:'interclub_results',utm_medium:'email',utm_campaign:'clare_galway_2026'});
  return `https://rallyhub.ie/directory?${q.toString()}`;
}
Deno.serve(async(req)=>{try{const base44=createClientFromRequest(req),user=await base44.auth.me();if(!user)return Response.json({error:'Authentication required'},{status:401});const body=await req.json().catch(()=>({}));const eventId=clean(body.eventId,180),action=clean(body.action||'status',40);const event=(await base44.asServiceRole.entities.ClubChallengeEvent.filter({id:eventId}))?.[0];if(!event)return Response.json({error:'Interclub event not found'},{status:404});if(!(await authorised(base44,user,event)))return Response.json({error:'Event manager permission required'},{status:403});if(!['completed','archived'].includes(event.status))return Response.json({error:'Results email is available after the Interclub is completed.'},{status:409});const participants=(await base44.asServiceRole.entities.ClubChallengeParticipant.filter({challenge_event_id:event.id},'event_rank',200)).filter((p:any)=>['club_a','club_b'].includes(p.side)&&!['withdrawn','replaced'].includes(p.status));const recipients=Array.from(new Map(participants.filter((p:any)=>validEmail(p.email)).map((p:any)=>[clean(p.email,320).toLowerCase(),p])).values());const missing=participants.filter((p:any)=>!validEmail(p.email)).map((p:any)=>({id:p.id,name:p.display_name,side:p.side}));const sample=recipients[0];if(!sample)return Response.json({error:'No participant email addresses are available.'},{status:409});const sampleUrl=await resultUrl(base44,event,sample,'admin_test');const sampleAlertsUrl=await alertsUrlFor(base44,sample,event);const subject=`${event.club_a_name} v ${event.club_b_name} Interclub | Your Results`;const previewHtml=interclubResultsHtml({event,name:sample.display_name,url:sampleUrl,alertsUrl:sampleAlertsUrl,origin:clean(body.origin,500)});const editedHtml=clean(body.htmlOverride,120000);if(action==='status'||action==='preview')return Response.json({success:true,subject,recipientCount:recipients.length,totalPlayers:participants.length,missing,previewName:sample.display_name,previewHtml,editableHtml:previewHtml,sampleResultUrl:sampleUrl,sampleAlertsUrl,sampleFirstName:firstName(sample.display_name)});const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:String(event.tenant_id),clubId:event.host_club_id?String(event.host_club_id):null};if(action==='test'){const to=clean(body.testEmail,320).toLowerCase();if(!validEmail(to))return Response.json({error:'Enter a valid test email address.'},{status:400});await sendClubEmail(base44,scope,{to,subject:`TEST — ${subject}`,textBody:interclubResultsText({event,name:sample.display_name,url:sampleUrl,alertsUrl:sampleAlertsUrl}),htmlBody:editedHtml||previewHtml});return Response.json({success:true,to});}if(action!=='send')return Response.json({error:'Unknown action'},{status:400});let sent=0,failed=0;const failures:any[]=[];for(const p of recipients){try{const url=await resultUrl(base44,event,p,'system');const alertsUrl=await alertsUrlFor(base44,p,event);await sendClubEmail(base44,scope,{to:clean(p.email,320).toLowerCase(),subject,textBody:interclubResultsText({event,name:p.display_name,url,alertsUrl}),htmlBody:editedHtml?editedHtml.replaceAll(sampleUrl,url).replaceAll(sampleAlertsUrl,alertsUrl).replaceAll(firstName(sample.display_name),firstName(p.display_name)):interclubResultsHtml({event,name:p.display_name,url,alertsUrl,origin:clean(body.origin,500)})});sent++;}catch(e){failed++;failures.push({name:p.display_name,email:p.email,error:clean((e as any)?.message||'Send failed',300)});}}try{await base44.asServiceRole.entities.ClubChallengeAudit.create({tenant_id:event.tenant_id,challenge_event_id:event.id,action:'results_email_sent',user_id:user.id,occurred_at:now(),new_value_json:JSON.stringify({recipient_count:recipients.length,sent,failed,missing:missing.map((m:any)=>m.name)}),note:'Personal Interclub results email sent.'});}catch{}return Response.json({success:true,recipientCount:recipients.length,sent,failed,missing,failures:failures.slice(0,10)});}catch(e){console.error('interclubResultsEmail',e);return Response.json({error:(e as any)?.message||'Could not prepare Interclub results email.'},{status:500});}});
