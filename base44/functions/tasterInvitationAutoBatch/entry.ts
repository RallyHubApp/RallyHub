import {createClientFromRequest} from 'npm:@base44/sdk@0.8.48';



type EmailScope =
  | { scopeType:'platform'; purpose:string }
  | { scopeType:'tenant'; purpose:string; tenantId:string; clubId?:string|null };

async function resolveEmailTransport(base44:any,scope:EmailScope){
  const filter:any={scope_type:scope.scopeType,purpose:scope.purpose};
  if(scope.scopeType==='tenant'){
    filter.tenant_id=scope.tenantId;
    if(scope.clubId)filter.club_id=scope.clubId;
  }
  const rows=await base44.asServiceRole.entities.EmailTransportConfig.filter(filter,'-updated_date',20);
  let config=(rows||[]).find((r:any)=>r.status!=='disabled')||null;
  // Reuse the same tenant sender for all approved Communications Centre
  // templates. Never borrow a sender from another tenant or another club.
  if(!config&&scope.scopeType==='tenant'){
    const candidates=await base44.asServiceRole.entities.EmailTransportConfig.filter({
      scope_type:'tenant',tenant_id:scope.tenantId,status:'configured'
    },'-updated_date',100);
    const relevant=(candidates||[]).filter((r:any)=>
      !scope.clubId||!r.club_id||r.club_id===scope.clubId);
    const marked=relevant.filter((r:any)=>r.is_default===true);
    if(marked.length===1)config=marked[0];
    else if(marked.length===0&&relevant.length===1)config=relevant[0];
  }
  if(!config)throw new Error('No authorised tenant sender is configured for this purpose.');
  return config;
}
async function requireConfiguredEmailTransport(base44:any,scope:EmailScope){
  const c=await resolveEmailTransport(base44,scope);
  if(c.status!=='configured') throw new Error(`Email transport for ${scope.scopeType}:${scope.purpose} is not active yet.`);
  return c;
}
function utf8Base64(v:string){const bytes=new TextEncoder().encode(v);let b='';for(const x of bytes)b+=String.fromCharCode(x);return btoa(b)}
function mimeHeader(v:string){return `=?UTF-8?B?${utf8Base64(v)}?=`}
function gmailRawEmail({to,senderEmail,senderName,replyTo,subject,textBody,htmlBody}:any){
 const boundary=`rallyhub_${crypto.randomUUID().replace(/-/g,'')}`;
 const h=[`From: ${mimeHeader(senderName)} <${senderEmail}>`,`To: ${to}`,`Reply-To: ${replyTo||senderEmail}`,`Subject: ${mimeHeader(subject)}`,'MIME-Version: 1.0'];
 const mime=htmlBody?[...h,`Content-Type: multipart/alternative; boundary="${boundary}"`,'',`--${boundary}`,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: 8bit','',textBody,`--${boundary}`,'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: 8bit','',htmlBody,`--${boundary}--`,''].join('\r\n'):[...h,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: 8bit','',textBody].join('\r\n');
 return utf8Base64(mime).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
}
async function sendWithConfiguredEmailTransport(base44:any,scope:EmailScope,message:{to:string;subject:string;textBody:string;htmlBody?:string|null;senderName?:string|null}){
 const c=await requireConfiguredEmailTransport(base44,scope); const senderName=String(message.senderName||c.sender_name||'RallyHub').trim();
 if(c.provider==='gmail_connector'){
  const {accessToken}=await base44.asServiceRole.connectors.getConnection('gmail'); if(!accessToken)throw new Error('The Gmail connector is not authorised.');
  const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({raw:gmailRawEmail({to:message.to,senderEmail:c.sender_email,senderName,replyTo:c.reply_to,subject:message.subject,textBody:message.textBody,htmlBody:message.htmlBody})})});
  const payload=await response.json().catch(()=>({})); if(!response.ok)throw new Error(payload?.error?.message||`Gmail send failed (${response.status})`); return {provider:c.provider,senderEmail:c.sender_email,payload};
 }
 if(c.provider==='google_apps_script'){
  const url=String(c.gateway_url||'').trim(), env=String(c.secret_env_var||'').trim(), secret=env?Deno.env.get(env):'';
  if(!url||!/^https:\/\//i.test(url))throw new Error('The tenant mail gateway URL is not configured.'); if(!secret)throw new Error('The tenant mail gateway secret is not configured.');
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret,to:message.to,subject:message.subject,textBody:message.textBody,htmlBody:message.htmlBody||'',senderName,replyTo:c.reply_to||c.sender_email})});
  const payload=await response.json().catch(()=>({})); if(!response.ok||payload?.ok===false)throw new Error(payload?.error||`Tenant mail gateway failed (${response.status})`); return {provider:c.provider,senderEmail:c.sender_email,payload};
 }
 if(c.provider==='base44_core'){await base44.asServiceRole.integrations.Core.SendEmail({to:message.to,from_name:senderName,subject:message.subject,body:message.textBody});return {provider:c.provider,senderEmail:c.sender_email};}
 throw new Error(`Email provider ${c.provider} is configured but its secure transport endpoint is not connected yet.`);
}

function rallyHubEmailShell(_x:any){throw new Error("Platform shell not available for tenant-only campaign")}
const APP_BASE_URL='******';
function escapeHtml(value:string){return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function basicStyle(style:any={},fallback:any={}){const s={...fallback,...(style||{})};return `font-size:${Number(s.size||13)}px;font-weight:${s.bold?800:400};font-style:${s.italic?'italic':'normal'};text-decoration:${s.underline?'underline':'none'};color:${escapeHtml(String(s.color||'#172033'))};text-align:${['center','right'].includes(String(s.align||''))?String(s.align):'left'};${s.shadow?'text-shadow:0 1px 2px rgba(15,23,42,.22);':''}`;}
function basicSignatureBlock(brandKit:any){const contact=brandKit?.contact||{};const sb=brandKit?.channel_overrides?.email?.signature_block||{};if(sb.enabled_default===false||!contact?.name)return '';const styles=sb.styles||{};const primary=String(brandKit?.colours?.primary||'#0755a8');const secondary=String(brandKit?.colours?.secondary||'#f2cf33');const websiteLabel=String(sb.website_label||contact.website||'').replace(/^https?:\/\//,'').replace(/\/$/,'');const whatsappLabel='';const emailLabel=String(sb.email_label||contact.email||'');const phone=sb.show_phone===false||!contact.phone_whatsapp?'':`<div style="margin-top:2px;font-size:12px;line-height:18px;color:#334155">Phone / WhatsApp: <a href="${escapeHtml(contact.phone_href||'tel:+353878100333')}" style="color:${escapeHtml(primary)};text-decoration:none;font-weight:700">${escapeHtml(contact.phone_whatsapp)}</a>${whatsappLabel?`<span style="color:#94a3b8;padding:0 7px">•</span><a href="${escapeHtml(contact.whatsapp_href||'https://wa.me/353878100333')}" style="color:#078e48;text-decoration:none;font-weight:700">${escapeHtml(whatsappLabel)}</a>`:''}</div>`;const email=sb.show_email===false||!contact.email?'':`<div style="margin-top:2px;font-size:12px;line-height:18px"><a href="${escapeHtml(contact.email_href||`mailto:${contact.email}`)}" style="color:#475569;text-decoration:none">${escapeHtml(emailLabel)}</a></div>`;const website=sb.show_website===false||!contact.website?'':`<div style="margin-top:2px;font-size:12px;line-height:18px"><a href="${escapeHtml(contact.website)}" target="_blank" style="color:${escapeHtml(primary)};text-decoration:none;font-weight:700">${escapeHtml(websiteLabel)}</a></div>`;const cta=sb.cta_enabled&&sb.cta_label&&sb.cta_url?`<div style="margin-top:12px;text-align:${escapeHtml(styles.cta?.align||'left')}"><a href="${escapeHtml(sb.cta_url)}" target="_blank" style="display:inline-block;padding:9px 14px;border-radius:7px;background:${escapeHtml(primary)};text-decoration:none;${basicStyle(styles.cta,{bold:true,size:12,color:'#ffffff'})}">${escapeHtml(sb.cta_label)}</a></div>`:'';const identity=`<div style="${basicStyle(styles.signoff,{size:13,color:'#64748b'})}">${escapeHtml(contact.signoff||'Yours in sport,')}</div><div style="margin-top:5px;${basicStyle(styles.name,{bold:true,size:19,color:primary})}">${escapeHtml(contact.name||'')}</div>${contact.role?`<div style="margin-top:2px;${basicStyle(styles.role,{bold:true,size:12,color:'#172033'})}">${escapeHtml(contact.role)}</div>`:''}${contact.organisation?`<div style="margin-top:1px;${basicStyle(styles.organisation,{bold:true,size:12,color:primary})}">${escapeHtml(contact.organisation)}</div>`:''}<div style="height:10px;font-size:0;line-height:0">&nbsp;</div>${phone}${email}${website}${cta}`;return `<div style="margin-top:24px;padding-top:18px;border-top:1px solid #dbe5f1;font-family:${escapeHtml(String(brandKit?.typography?.body_font||'Arial,Helvetica,sans-serif'))}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:separate;background:#f8fafc;border:1px solid #dbe5f1;border-radius:12px;overflow:hidden"><tr><td width="4" bgcolor="${escapeHtml(secondary)}" style="width:4px;background:${escapeHtml(secondary)};font-size:0;line-height:0">&nbsp;</td><td valign="middle" style="padding:16px 18px">${identity}</td></tr></table></div>`;}
function basicUtilityBlock(brandKit:any,root:string,playerLink:string='',forceClare:boolean=false,resultsLink:string='',guidePageUrl:string=''){const uf=brandKit?.channel_overrides?.email?.utility_footer||{};if(uf.enabled_default!==true&&!forceClare)return '';const primary=String(brandKit?.colours?.primary||'#0755a8');const render=(links:any[])=>links.map(([label,url,accent],i)=>`${i?'<span style="color:#cbd5e1;padding:0 5px">|</span>':''}<a href="${escapeHtml(url)}" target="_blank" style="color:${escapeHtml(primary)};font-weight:${accent?800:600};text-decoration:underline;text-underline-offset:2px">${escapeHtml(label)}</a>`).join('');if(forceClare){const line1:any[]=[];if(guidePageUrl)line1.push(['Player Link Infographic',guidePageUrl,false]);line1.push(['Facebook',brandKit?.social_links?.facebook||'https://www.facebook.com/ClarePickleball/'],['Instagram',brandKit?.social_links?.instagram||'https://www.instagram.com/clarepickleball/'],['Feedback',`${root}/contact`]);const line2:any[]=[['RallyHub Directory',`${root}/directory`],['Events',`${root}/events`]];return `<tr><td style="padding:10px 14px 11px;border-top:1px solid #e4e9f1;background:#ffffff;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:18px;color:#64748b"><div>${render(line1)}</div><div style="margin-top:2px">${render(line2)}</div></td></tr>`;}const links:any[]=[];if(uf.links?.website)links.push(['Website',brandKit?.contact?.website||root]);if(uf.links?.directory)links.push(['RallyHub Directory',`${root}/directory`]);if(uf.links?.events)links.push(['Events',`${root}/events`]);if(uf.links?.feedback)links.push(['Feedback',`${root}/contact`]);if(uf.links?.facebook&&(brandKit?.social_links?.facebook||forceClare))links.push(['Facebook',brandKit?.social_links?.facebook||'https://www.facebook.com/ClarePickleball/']);if(uf.links?.instagram&&(brandKit?.social_links?.instagram||forceClare))links.push(['Instagram',brandKit?.social_links?.instagram||'https://www.instagram.com/clarepickleball/']);if(!links.length)return '';return `<tr><td style="padding:11px 14px 12px;border-top:1px solid #e4e9f1;background:#ffffff;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:18px;color:#64748b">${render(links)}</td></tr>`;}
function renderBasicBrandedEmail(bodyHtml:string,brandKit:any,club:any,clubName:string,headerTitle:string,headerSubtitle:string='',guidePageUrl:string=''){if(/^rallyhub$/i.test(String(clubName||'').trim()))return rallyHubEmailShell({title:headerTitle||'RallyHub update',content:bodyHtml,footerNote:'RallyHub Directory'});const colours=brandKit?.colours||{};const typography=brandKit?.typography||{};const layout=brandKit?.layout||{};const footer=brandKit?.compliance_footer||{};const primary=String(colours.primary||club?.primary_colour||'#2667F2');const secondary=String(colours.secondary||club?.secondary_colour||'#FACC15');const text=String(colours.text||'#172033');const muted=String(colours.muted_text||'#667085');const pageBg=String(colours.page_background||'#f4f7fb');const border=String(colours.border||'#d9e1ec');const isPlatformBrand=/^rallyhub$/i.test(String(clubName||'').trim());const logo=isPlatformBrand?'******/assets/brand/master-review/C3-primary-with-strapline.png':String(brandKit?.logos?.primary||club?.logo_url||'').trim();const font=String(typography.body_font||'Arial, Helvetica, sans-serif');const bodySize=Number(typography.body_size_px||16);const bodyLine=Number(typography.body_line_height||1.6);const maxWidth=Number(layout.email_max_width||640);const radius=Number(layout.card_radius_px||18);const outerPad=Number(layout.outer_padding_px||24);const bodyPad=Number(layout.body_padding_px||30);const inner=bodyHtml;const signature=basicSignatureBlock(brandKit);const root=APP_BASE_URL;const isClare=/^clare pickleball$/i.test(String(clubName||'').trim());const isPlatform=/^rallyhub$/i.test(String(clubName||'').trim());const utility=basicUtilityBlock(brandKit,root,'',isClare,'',guidePageUrl);const powered=isPlatform?'<div style="text-align:center;background:#081342;padding:14px"><a href="******/" style="display:inline-block"><img src="******/assets/brand/master-review/rallyhub-master-02-reversed.png" width="145" style="width:145px;max-width:100%;height:auto;border:0" alt="RallyHub"></a></div>':String(footer.powered_by_html||`<div style="text-align:center;line-height:1.3"><div style="font:11px Arial,sans-serif;color:#667085;margin-bottom:5px">Powered by</div><a href="******/" target="_blank" style="display:inline-block;text-decoration:none"><img src="******/assets/brand/master-review/C3-primary-with-strapline.png" alt="RallyHub" width="126" style="display:block;width:126px;max-width:100%;height:auto;border:0;margin:auto"></a></div>`);const htmlBody=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><style>html,body{margin:0!important;padding:0!important;width:100%!important}table{border-spacing:0}img{max-width:100%;height:auto}@media only screen and (max-width:600px){.email-shell{width:calc(100% - 12px)!important;max-width:calc(100% - 12px)!important}.email-pad{padding-left:18px!important;padding-right:18px!important}}</style></head><body bgcolor="${escapeHtml(pageBg)}" style="margin:0;background:${escapeHtml(pageBg)};font-family:${escapeHtml(font)};color:${escapeHtml(text)}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${escapeHtml(pageBg)};padding:${outerPad}px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-shell" style="max-width:${maxWidth}px;background:#fff;border:1px solid ${escapeHtml(border)};border-radius:${radius}px;overflow:hidden"><tr><td style="height:6px;background:${escapeHtml(primary)};border-bottom:3px solid ${escapeHtml(secondary)}"></td></tr><tr><td style="padding:26px 28px 18px;text-align:center">${logo?`<img src="${escapeHtml(logo)}" alt="${escapeHtml(clubName)} logo" width="${isPlatform?260:72}" style="display:block;width:${isPlatform?260:72}px;max-width:100%;height:auto;margin:0 auto 12px;object-fit:contain;border:0">`:''}${isPlatform?"":`<div style="font-size:25px;font-weight:800;color:${escapeHtml(text)}">${escapeHtml(clubName)}</div>`}<div style="margin-top:5px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${escapeHtml(muted)}">${escapeHtml(headerTitle||'')}</div>${headerSubtitle?`<div style="margin-top:5px;font-size:12px;font-weight:600;color:${escapeHtml(muted)}">${escapeHtml(headerSubtitle)}</div>`:''}</td></tr><tr><td class="email-pad" style="padding:0 ${bodyPad}px ${bodyPad}px;font-size:${bodySize}px;line-height:${bodyLine};color:${escapeHtml(text)}">${inner}${signature}</td></tr>${utility}<tr><td style="padding:16px 20px;background:#f7f9fc;border-top:1px solid #e4e9f1">${powered}</td></tr></table></td></tr></table></body></html>`;return htmlBody;}

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
  
  const refs=campaign.audience_snapshot?.recipient_refs||[];
  if(refs.some((r:any)=>r.source!=='waiting_list'))throw Error('Unexpected audience source');
  const allowed=new Set(refs.map((r:any)=>r.id)),attempted=new Set(history.filter((x:any)=>String(x.idempotency_key||'').startsWith('taster-invite:')).map((x:any)=>x.recipient_id));
  const cutoff=Date.now()-3600000;
  const hourly=history.filter((x:any)=>Date.parse(x.queued_at||x.created_date||'')>=cutoff).length;
  const available=Math.max(0,10-hourly);
  if(!available)return Response.json({success:true,sent:0,reason:'hourly_limit',remaining:refs.length-attempted.size});
  const url=['https:', '', 'rallyhub.ie', 'private-event',encodeURIComponent(EVENT),encodeURIComponent(event.event_private_invitation_token)].join('/');
  const date=event.start_date?new Intl.DateTimeFormat('en-IE',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Dublin'}).format(new Date(event.start_date+'T12:00:00Z')):'';
  const unsubscribe='mailto:clarepb2025@gmail.com?subject='+encodeURIComponent('Unsubscribe from Clare Pickleball event invitations');
  const occupied=Number(event.event_reserved_count||0);
  let sent=0,blocked=0;
  for(const r of rows){
   if(sent>=available)break;
   if(!allowed.has(r.id)||attempted.has(r.id)||r.active===false||r.status!=='waiting'||r.gdpr_consent!==true||!/^\S+@\S+\.\S+$/.test(r.email||''))continue;
   const fields:any={FIRST_NAME:String(r.full_name||'').trim().split(/\s+/)[0],EVENT_NAME:event.name||'',EVENT_DATE:date,EVENT_START_TIME:event.event_start_time||'',EVENT_END_TIME:event.event_end_time||'',EVENT_VENUE:event.location||'',EVENT_FEE:Number(event.event_fee_amount||0).toFixed(2),EVENT_CAPACITY:event.event_capacity||'',PLACES_REMAINING:Math.max(0,Number(event.event_capacity||0)-occupied),PRIVATE_BOOKING_URL:url,UNSUBSCRIBE_URL:unsubscribe};
   const replace=(s:string)=>String(s||'').replace(/{{\s*([A-Z_]+)\s*}}/g,(match,key)=>fields[key]===undefined?match:String(fields[key]));
   const subject='Correction: Your Clare Pickleball taster booking link — '+date;
   const body=replace(template.plain_text_template).replace(/Unsubscribe from promotional event invitations:.*$/m,'To stop receiving Clare Pickleball event invitations, reply to this email with UNSUBSCRIBE in the subject.');
   if(/{{[^}]+}}/.test(subject+body))throw Error('Unresolved approved template field');
   const cleanBody=body.replace(/BOOKING YOUR PLACE[\s\S]*?If this date or time/, 'BOOKING YOUR PLACE\nUse the booking button below to reserve your place. Complete your registration and pay securely through SumUp.\n\nIf this date or time');
   const paragraphs=cleanBody.split(/\n\s*\n/).filter(Boolean).map((p:string)=>'<p style="white-space:pre-line">'+esc(p)+'</p>').join('');
   const button='<div style="text-align:center;margin:24px 0"><a href="'+esc(url)+'" style="display:inline-block;background:#102a60;color:#ffffff;padding:16px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:700">BOOK YOUR PLACE</a></div>';
   const html=renderBasicBrandedEmail('<p style="font-size:15px;font-weight:700">Important correction: the booking button in our earlier invitation did not work. We apologise. Please use the corrected button below.</p>'+button+paragraphs,kit,null,'Clare Pickleball',esc(replace(template.channel_templates?.email?.heading||template.name)),esc(replace(template.channel_templates?.email?.subheading||'')));
   if(!html.includes('href="'+esc(url)+'"')||html.includes('http://******/private-event')||html.includes('{{'))throw Error('Corrected booking button validation failed');
   const idem='taster-correction-v1:'+CAMPAIGN+':'+EVENT+':'+r.id;
   const old=await e.CommunicationDeliveryAttempt.filter({idempotency_key:idem},'-created_date',1);
   if(old.length)continue;
   const attempt=await e.CommunicationDeliveryAttempt.create({campaign_id:CAMPAIGN,message_id:TEMPLATE,recipient_id:r.id,tenant_id:TENANT,channel:'email',provider:'pending',status:'sending',attempt_number:1,idempotency_key:idem,queued_at:new Date().toISOString(),metadata:{eventId:EVENT,automated:true}});
   try{
    const outcome=await sendWithConfiguredEmailTransport(b,{scopeType:'tenant',purpose:'event_invitation',tenantId:TENANT,clubId:CLUB},{to:String(r.email).trim().toLowerCase(),subject,textBody:'Correction: The previous booking link was faulty. Use this working link: '+url+'\n\n'+cleanBody,htmlBody:html,senderName:'Clare Pickleball'});
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
