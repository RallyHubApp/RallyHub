import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';
import { sendWithConfiguredEmailTransport } from './emailRouter.ts';

const clean=(value:any,max=500)=>String(value??'').trim().slice(0,max);
const validEmail=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const escapeHtml=(value:any)=>String(value??'').replace(/[&<>"']/g,(char)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]||char));

function isInvitationOnly(event:any){
  return (event?.event_tags||[]).some((tag:any)=>String(tag||'').trim().toLowerCase()==='invitation only');
}
function isFull(event:any){
  return String(event?.event_status_override||'').toLowerCase()==='full' || String(event?.status||'').toLowerCase()==='full';
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action,80);
    if(action!=='future_invitation') return Response.json({error:'Unknown event enquiry action.'},{status:400});

    // Simple anti-bot trap. Real users never see or fill this field.
    if(clean(body.website,200)) return Response.json({success:true});

    const eventId=clean(body.eventId,180);
    const eventSlug=clean(body.eventSlug,180);
    const senderName=clean(body.name,160);
    const senderEmail=clean(body.email,240).toLowerCase();
    const message=clean(body.message,1200);
    if(!eventId&&!eventSlug) return Response.json({error:'Event identifier required.'},{status:400});
    if(!validEmail(senderEmail)) return Response.json({error:'Enter a valid email address.'},{status:400});

    const query:any={event_public_visible:true,event_publish_status:'published'};
    if(eventId) query.id=eventId; else query.event_slug=eventSlug;
    const rows=await base44.asServiceRole.entities.Tournament.filter(query,'-updated_date',2);
    const event=(rows||[]).find((row:any)=>row.status!=='Archived');
    if(!event) return Response.json({error:'Public event not found.'},{status:404});
    if(!isInvitationOnly(event)) return Response.json({error:'This organiser is not accepting future invitation requests through this event.'},{status:400});
    if(!isFull(event)) return Response.json({error:'Use the event registration/contact option for this event.'},{status:400});

    const recipient=clean(event.event_contact,240);
    if(!validEmail(recipient)) return Response.json({error:'The organiser does not have an enquiry email configured.'},{status:409});

    // Prevent repeated submissions from hammering an organiser while still allowing a genuine retry later.
    const prior=await base44.asServiceRole.entities.EventEnquiry.filter({event_id:event.id,sender_email:senderEmail,enquiry_type:'future_invitation'},'-sent_at',10).catch(()=>[]);
    const recent=(prior||[]).find((row:any)=>row.delivery_status==='sent'&&Date.now()-Date.parse(String(row.sent_at||row.created_date||''))<6*60*60*1000);
    if(recent) return Response.json({success:true,alreadySent:true});

    const hostRows=event.host_club_id?await base44.asServiceRole.entities.Club.filter({id:event.host_club_id},'-updated_date',1).catch(()=>[]):[];
    const host=hostRows?.[0]||null;
    const eventUrl=`https://rallyhub.ie/events/${event.event_slug}`;
    const subject=`RallyHub enquiry – Future ${host?.name||'event'} invitation`;
    const displayName=senderName||'A RallyHub visitor';
    const textBody=[
      'A player has asked to be considered for a future invitation through RallyHub.',
      '',
      `Organiser: ${host?.name||'Event organiser'}`,
      `Event they viewed: ${event.name}`,
      `Event page: ${eventUrl}`,
      '',
      `Name: ${displayName}`,
      `Email: ${senderEmail}`,
      message?`Message: ${message}`:'Message: —',
      '',
      'This enquiry was generated through RallyHub. Replying to this email will reply to the player.',
    ].join('\n');
    const htmlBody=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#17325f"><div style="padding:22px;border-radius:16px;background:#f4fbfc;border:1px solid #dbe6e8"><div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#078e48">RALLYHUB EVENTS</div><h2 style="margin:8px 0 8px;color:#07184c">Future invitation enquiry</h2><p style="line-height:1.6">A player has asked to be considered for a future invitation through RallyHub.</p><div style="margin:18px 0;padding:16px;border-radius:12px;background:white;border:1px solid #dbe6e8"><p><strong>Event viewed:</strong> ${escapeHtml(event.name)}</p><p><strong>Name:</strong> ${escapeHtml(displayName)}</p><p><strong>Email:</strong> <a href="mailto:${escapeHtml(senderEmail)}">${escapeHtml(senderEmail)}</a></p>${message?`<p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g,'<br>')}</p>`:''}</div><p style="font-size:13px;line-height:1.6;color:#52627d">This enquiry was generated through <strong>RallyHub</strong>. Replying to this email will reply directly to the player.</p><p style="font-size:13px"><a href="${eventUrl}" style="color:#078e48;font-weight:700">View the RallyHub event page</a></p></div></div>`;

    try{
      const delivery=await sendWithConfiguredEmailTransport(base44,{scopeType:'platform',purpose:'directory'},{to:recipient,replyTo:senderEmail,subject,textBody,htmlBody});
      await base44.asServiceRole.entities.EventEnquiry.create({
        event_id:event.id,event_slug:event.event_slug,event_name:event.name,host_club_id:event.host_club_id||'',host_name:host?.name||'',
        enquiry_type:'future_invitation',sender_name:senderName,sender_email:senderEmail,message,source_path:`/events/${event.event_slug}`,
        delivery_status:'sent',delivery_provider:delivery?.provider||'',sent_at:new Date().toISOString()
      });
      return Response.json({success:true});
    }catch(error){
      await base44.asServiceRole.entities.EventEnquiry.create({
        event_id:event.id,event_slug:event.event_slug,event_name:event.name,host_club_id:event.host_club_id||'',host_name:host?.name||'',
        enquiry_type:'future_invitation',sender_name:senderName,sender_email:senderEmail,message,source_path:`/events/${event.event_slug}`,
        delivery_status:'failed',delivery_provider:'',sent_at:new Date().toISOString()
      }).catch(()=>{});
      throw error;
    }
  }catch(error){
    console.error('eventInterest failed',error);
    return Response.json({error:String(error?.message||'Could not send enquiry.')},{status:500});
  }
});