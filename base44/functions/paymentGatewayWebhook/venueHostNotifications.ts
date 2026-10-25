import { renderBasicBrandedEmail } from './communicationsBasicRenderer.ts';
// Shared member activation notices for application polling and payment webhook.
const CLARE_JOINING_VENUES=['ennistymon','shannon','corofin','clarecastle'];
function isClareVenuePolicy(club:any){return String(club?.name||'').trim().toLowerCase()==='clare pickleball'}
// Venue hosts are explicitly configured by a club administrator. Never infer them from
// a guest booking creator or public contact address, which may be an unrelated person.
export async function notifyJoiningVenueHosts(base44:any,config:any,club:any,app:any,dependencies:any){
  const {sendWithConfiguredEmailTransport,escapeHtml,emailKey}=dependencies;
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
  const templates=await base44.asServiceRole.entities.CommunicationTemplate.filter({tenant_id:config.tenant_id,purpose:'membership_venue_host_activated'},'-updated_date',30);
  const template=(templates||[]).find((t:any)=>t.status==='approved'&&(!t.club_id||t.club_id===config.club_id));
  if(!template?.subject_template||!template?.plain_text_template||!template?.html_template||!template?.brand_kit_id){
    return await base44.asServiceRole.entities.MembershipApplication.update(app.id,{host_notification_status:'template_missing'});
  }
  const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({tenant_id:config.tenant_id},'-updated_date',40);
  const brandKit=(kits||[]).find((k:any)=>k.id===template.brand_kit_id&&k.status==='active'&&(!k.club_id||k.club_id===config.club_id));
  if(!brandKit)return await base44.asServiceRole.entities.MembershipApplication.update(app.id,{host_notification_status:'brand_kit_missing'});
  const merge=(value:string,fields:Record<string,string>,html=false)=>String(value||'').replace(/{{\s*([A-Za-z_]+)\s*}}/g,(_match,key)=>html?escapeHtml(fields[key]??''):fields[key]??'');
  const sent=new Set(Array.isArray(app.host_notified_emails)?app.host_notified_emails.map(emailKey):[]);
  const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:config.tenant_id,clubId:config.club_id};
  let failed=false;
  for(const to of emails){
    if(sent.has(to))continue;
    const venue=app.primary_venue[0].toUpperCase()+app.primary_venue.slice(1);
    const fields={MEMBER_NAME:String(app.full_name||''),PRIMARY_VENUE:venue,MEMBERSHIP_STATUS:'Active',CLUB_NAME:String(club.name||'Clare Pickleball')};
    const subject=merge(template.subject_template,fields);
    const textBody=merge(template.plain_text_template,fields);
    const bodyHtml=merge(template.html_template,fields,true);
    const headerTitle=merge(template.channel_templates?.email?.header_title||'New member at your venue',fields);
    const headerSubtitle=merge(template.channel_templates?.email?.header_subtitle||'',fields);
    const htmlBody=renderBasicBrandedEmail(bodyHtml,brandKit,club,String(club.name||'Clare Pickleball'),headerTitle,headerSubtitle);
    try{
      await sendWithConfiguredEmailTransport(base44,scope,{to,subject,textBody,htmlBody});
      sent.add(to);
      app=await base44.asServiceRole.entities.MembershipApplication.update(app.id,{host_notified_emails:[...sent],host_notification_status:'pending',host_notification_last_at:new Date().toISOString()});
    }catch(e:any){failed=true;console.error('member host notification delivery failed',e?.message||e)}
  }
  return await base44.asServiceRole.entities.MembershipApplication.update(app.id,{host_notification_status:failed?'failed':emails.every((e:string)=>sent.has(e))?'sent':'pending'});
}

