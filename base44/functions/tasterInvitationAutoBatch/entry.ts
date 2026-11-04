import {createClientFromRequest} from 'npm:@base44/sdk@0.8.48';
import {sendWithConfiguredEmailTransport} from '../communicationsEngine/emailRouter.ts';
import {renderBasicBrandedEmail} from '../communicationsBasicRenderer.ts';

const TENANT='6a9b7790bc4a8d299938bda9',CLUB='6a9b779684daba85b3ffdeb5',CAMPAIGN='6aeb39070d79bdfcb2854fcd',EVENT='6aeb5da42261671df1b817df',TEMPLATE='6aeb9d976b7985fe4a0d8717';
const esc=(v:any)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
Deno.serve(async(req)=>{
 try{
  const b=createClientFromRequest(req),e=b.asServiceRole.entities;
  const [campaigns,events,templates,kits,rows,history]=await Promise.all([
   e.CommunicationCampaign.filter({id:CAMPAIGN,tenant_id:TENANT,club_id:CLUB},'-created_date',1),
   e.Tournament.filter({id:EVENT,tenant_id:TENANT,host_club_id:CLUB},'-created_date',1),
   e.CommunicationTemplate.filter({id:TEMPLATE,tenant_id:TENANT,status:'approved'},'-created_date',1),
   e.CommunicationBrandKit.filter({owner_scope:'tenant',tenant_id:TENANT,status:'active'},'-updated_date',20),
   e.WaitingListEntry.filter({tenant_id:TENANT,club_id:CLUB},'-created_date',500),
   e.CommunicationDeliveryAttempt.filter({campaign_id:CAMPAIGN,tenant_id:TENANT},'-created_date',200)
  ]);
  const event=events[0],template=templates[0],campaign=campaigns[0],kit=kits[0];
  if(!campaign||!event||!template||!kit?.logos?.primary||!kit?.compliance_footer||!event.event_private_invitation_token||rows.length===500||history.length===200)throw Error('Campaign, approved template, brand kit or complete records unavailable');
  if(event.start_date&&event.start_date<new Date().toISOString().slice(0,10))return Response.json({success:true,stopped:'event_date_passed'});
  const refs=campaign.audience_snapshot?.recipient_refs||[];
  if(refs.some((r:any)=>r.source!=='waiting_list'))throw Error('Unexpected audience source');
  const allowed=new Set(refs.map((r:any)=>r.id)),attempted=new Set(history.filter((x:any)=>String(x.idempotency_key||'').startsWith('taster-invite:')).map((x:any)=>x.recipient_id));
  const cutoff=Date.now()-3600000;
  const hourly=history.filter((x:any)=>String(x.idempotency_key||'').startsWith('taster-invite:')&&Date.parse(x.queued_at||x.created_date||'')>=cutoff).length;
  const available=Math.max(0,10-hourly);
  if(!available)return Response.json({success:true,sent:0,reason:'hourly_limit',remaining:refs.length-attempted.size});
  const url='******/private-event/'+encodeURIComponent(EVENT)+'/'+encodeURIComponent(event.event_private_invitation_token);
  const date=event.start_date?new Intl.DateTimeFormat('en-IE',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Dublin'}).format(new Date(event.start_date+'T12:00:00Z')):'';
  const unsubscribe='mailto:clarepb2025@gmail.com?subject='+encodeURIComponent('Unsubscribe from Clare Pickleball event invitations');
  const occupied=Number(event.event_reserved_count||0);
  let sent=0,blocked=0;
  for(const r of rows){
   if(sent>=available)break;
   if(!allowed.has(r.id)||attempted.has(r.id)||r.active===false||r.status!=='waiting'||r.gdpr_consent!==true||!/^\S+@\S+\.\S+$/.test(r.email||''))continue;
   const fields:any={FIRST_NAME:String(r.full_name||'').trim().split(/\s+/)[0],EVENT_NAME:event.name||'',EVENT_DATE:date,EVENT_START_TIME:event.event_start_time||'',EVENT_END_TIME:event.event_end_time||'',EVENT_VENUE:event.location||'',EVENT_FEE:Number(event.event_fee_amount||0).toFixed(2),EVENT_CAPACITY:event.event_capacity||'',PLACES_REMAINING:Math.max(0,Number(event.event_capacity||0)-occupied),PRIVATE_BOOKING_URL:url,UNSUBSCRIBE_URL:unsubscribe};
   const replace=(s:string)=>String(s||'').replace(/{{\s*([A-Z_]+)\s*}}/g,(match,key)=>fields[key]===undefined?match:String(fields[key]));
   const subject=replace(template.subject_template),body=replace(template.plain_text_template);
   if(/{{[^}]+}}/.test(subject+body))throw Error('Unresolved approved template field');
   const paragraphs=body.split(/\n\s*\n/).filter(Boolean).map((p:string)=>p.includes(url)?'<p style="white-space:pre-line">'+esc(p).replace(esc(url),'<a href="'+esc(url)+'">BOOK YOUR PLACE</a>')+'</p>':'<p style="white-space:pre-line">'+esc(p)+'</p>').join('');
   const html=renderBasicBrandedEmail(paragraphs,kit,null,'Clare Pickleball',esc(replace(template.channel_templates?.email?.heading||template.name)),esc(replace(template.channel_templates?.email?.subheading||'')));
   const idem='taster-invite:'+CAMPAIGN+':'+EVENT+':'+r.id;
   const old=await e.CommunicationDeliveryAttempt.filter({idempotency_key:idem},'-created_date',1);
   if(old.length)continue;
   const attempt=await e.CommunicationDeliveryAttempt.create({campaign_id:CAMPAIGN,message_id:TEMPLATE,recipient_id:r.id,tenant_id:TENANT,channel:'email',provider:'pending',status:'sending',attempt_number:1,idempotency_key:idem,queued_at:new Date().toISOString(),metadata:{eventId:EVENT,automated:true}});
   try{
    const outcome=await sendWithConfiguredEmailTransport(b,{scopeType:'tenant',purpose:'event_invitation',tenantId:TENANT,clubId:CLUB},{to:String(r.email).trim().toLowerCase(),subject,textBody:body,htmlBody:html,senderName:'Clare Pickleball'});
    await e.CommunicationDeliveryAttempt.update(attempt.id,{provider:outcome.provider,status:'sent',sent_at:new Date().toISOString()});
    sent++;
   }catch(err:any){
    await e.CommunicationDeliveryAttempt.update(attempt.id,{status:'sending',error_code:'unverified_provider_outcome',error_message:String(err?.message||'Unknown').slice(0,500)});
    blocked++;break;
   }
  }
  return Response.json({success:blocked===0,sent,blocked,remaining:refs.length-attempted.size-sent});
 }catch(err:any){return Response.json({error:String(err?.message||err)},{status:500})}
});
