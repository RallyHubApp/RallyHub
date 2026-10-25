// Shared member activation notices for application polling and payment webhook.
const CLARE_JOINING_VENUES=['ennistymon','shannon','corofin','clarecastle'];
function isClareVenuePolicy(club:any){return String(club?.name||'').trim().toLowerCase()==='clare pickleball'}
// Venue hosts are explicitly configured by a club administrator. Never infer them from
// a guest booking creator or public contact address, which may be an unrelated person.
export async function notifyJoiningVenueHosts(base44:any,config:any,club:any,app:any,dependencies:any){
  const {sendWithConfiguredEmailTransport,emailShell,escapeHtml,emailKey}=dependencies;
  if(!isClareVenuePolicy(club)||app.application_type!=='new'||!CLARE_JOINING_VENUES.includes(app.primary_venue))return app;
  if(app.host_notification_status==='sent')return app;
  if(!['paid','not_required'].includes(String(app.payment_status||'')))return app;
  const hosts=await base44.asServiceRole.entities.MembershipVenueHostConfig.filter({tenant_id:config.tenant_id,club_id:config.club_id,venue_key:app.primary_venue,active:true},'-updated_at',10);
  const emails=[...new Set((hosts||[]).flatMap((x:any)=>Array.isArray(x.host_emails)?x.host_emails:[]).map((email:any)=>emailKey(email)).filter((email:string)=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)))];
  if(!emails.length){
    return await base44.asServiceRole.entities.MembershipApplication.update(app.id,{host_notification_status:'needs_configuration'});
  }
  // Persist each delivered address independently: retrying after a partial failure
  // must not resend to hosts who were already notified.
  const sent=new Set(Array.isArray(app.host_notified_emails)?app.host_notified_emails.map(emailKey):[]);
  const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:config.tenant_id,clubId:config.club_id};
  let failed=false;
  for(const to of emails){
    if(sent.has(to))continue;
    const venue=app.primary_venue[0].toUpperCase()+app.primary_venue.slice(1);
    const subject=`New Clare Pickleball member · ${venue}`;
    const textBody=`A new Clare Pickleball member has joined your venue.\n\nMember: ${app.full_name}\nPrimary joining venue: ${venue}\nMembership: Active\n\nFor information only. No action required unless your session arrangements need updating.\n\nPowered by RallyHub`;
    const htmlBody=emailShell({club,headline:'New member at your venue',preheader:venue+' · Member activated',content:`<p>A new Clare Pickleball member has joined your venue.</p><p><strong>Member:</strong> ${escapeHtml(app.full_name)}<br><strong>Primary joining venue:</strong> ${escapeHtml(venue)}<br><strong>Status:</strong> Active</p><p>For information only; no action required unless your session arrangements need updating.</p>`});
    try{
      await sendWithConfiguredEmailTransport(base44,scope,{to,subject,textBody,htmlBody});
      sent.add(to);
      app=await base44.asServiceRole.entities.MembershipApplication.update(app.id,{host_notified_emails:[...sent],host_notification_status:'pending',host_notification_last_at:new Date().toISOString()});
    }catch(e:any){failed=true;console.error('member host notification delivery failed',e?.message||e)}
  }
  return await base44.asServiceRole.entities.MembershipApplication.update(app.id,{host_notification_status:failed?'failed':emails.every((e:string)=>sent.has(e))?'sent':'pending'});
}

