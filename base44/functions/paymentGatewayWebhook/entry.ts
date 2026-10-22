import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { sendWithConfiguredEmailTransport } from './emailRouter.ts';
import { membershipPaidTemplate } from './membershipPaidTemplate.ts';
import { safelyQueueTournivalNotice } from './tournivalNoticeBridge.ts';

function clean(v:any,max=500){return String(v??'').trim().slice(0,max)}
function nameKey(v:any){return clean(v,180).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function emailKey(v:any){return clean(v,240).toLowerCase()}
function formatDate(d:string){
  try{return new Intl.DateTimeFormat('en-IE',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Dublin'}).format(new Date(`${d}T12:00:00Z`))}catch{return d}
}
function firstName(v:any){return clean(v,120).split(/\s+/).filter(Boolean)[0]||'there'}
function money(value:any,currency='EUR'){
  try{return new Intl.NumberFormat('en-IE',{style:'currency',currency}).format(Number(value||0))}catch{return `€${Number(value||0).toFixed(2)}`}
}
function escapeHtml(value:any){
  return String(value??'').replace(/[&<>"']/g,(ch)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } as any)[ch]);
}
function detailRow(label:string,value:any){
  return `<tr><td style="padding:7px 0;color:#6b7280;font-size:13px;width:38%;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:7px 0;color:#172033;font-size:13px;font-weight:700;vertical-align:top;">${escapeHtml(value)}</td></tr>`;
}
function emailShell({club,headline,preheader,content}:any){
  const name=escapeHtml(club?.name||'Clare Pickleball');
  const logo=escapeHtml(club?.logo_url||'');
  const primary=escapeHtml(club?.primary_colour||'#2667f2');
  const secondary=escapeHtml(club?.secondary_colour||'#facc15');
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader||headline||'')}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #d9e1ec;border-radius:18px;overflow:hidden;">
<tr><td style="height:6px;background:${primary};border-bottom:3px solid ${secondary};"></td></tr>
<tr><td style="padding:26px 28px 18px;text-align:center;">${logo?`<img src="${logo}" alt="${name} logo" width="72" height="72" style="display:block;margin:0 auto 12px;object-fit:contain;border-radius:12px;">`:''}<div style="font-size:25px;font-weight:800;color:#10182b;">${name}</div><div style="margin-top:5px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;">Session Booking</div></td></tr>
<tr><td style="padding:0 28px 28px;"><h1 style="margin:0 0 18px;font-size:23px;line-height:1.25;color:#10182b;">${escapeHtml(headline)}</h1>${content}</td></tr>
<tr><td style="padding:0 28px 22px;"><div style="border-top:1px solid #dbe5f1;padding-top:18px;font-size:14px;line-height:1.65;color:#172033;">Yours in sport,<br><strong>Brian Moore</strong><br>Chairperson, Clare Pickleball<br><a href="tel:+353878100333" style="color:#0755a8;text-decoration:none;">087 810 0333</a> · <a href="https://wa.me/353878100333" style="color:#078e48;text-decoration:none;font-weight:700;">WhatsApp</a><br><a href="mailto:clarepb2025@gmail.com" style="color:#0755a8;text-decoration:none;">clarepb2025@gmail.com</a> · <a href="https://clarepickleball.ie/" style="color:#0755a8;text-decoration:none;">ClarePickleball.ie</a></div></td></tr>
<tr><td style="padding:16px 20px;background:#f7f9fc;border-top:1px solid #e4e9f1;text-align:center;"><div style="font:11px Arial,sans-serif;color:#667085;margin-bottom:5px">Powered by</div><a href="https://rallyhub.ie/" target="_blank" style="display:inline-block;text-decoration:none"><img src="https://rallyhub.ie/assets/brand/master-review/rallyhub-master-01-horizontal.png" alt="RallyHub" width="126" style="display:block;width:126px;max-width:100%;height:auto;border:0;margin:auto"></a></td></tr>
</table></td></tr></table></body></html>`;
}

async function clubBrand(base44:any,clubId:string){
  try{
    const rows=await base44.asServiceRole.entities.Club.filter({id:clubId},'-updated_date',5);
    const club=rows?.[0]||null;
    if(!club)return null;
    return {id:club.id,name:club.name||'',slug:club.slug||'',logo_url:club.logo_url||'',primary_colour:club.primary_colour||'',secondary_colour:club.secondary_colour||''};
  }catch{return null}
}

async function resolveSessionHostContact(base44:any,session:any){
  try{
    const club=(await base44.asServiceRole.entities.Club.filter({id:session.club_id,tenant_id:session.tenant_id},'-updated_date',5))?.[0];
    if(!club?.slug)return null;
    const profile=(await base44.asServiceRole.entities.DirectoryListingProfile.filter({listing_slug:club.slug,status:'active'},'-updated_at',5))?.[0];
    const data=profile?.public_json?JSON.parse(profile.public_json):{};
    const sessions=Array.isArray(data?.sessions)?data.sessions:[];
    let configured=sessions.find((s:any)=>String(s.id||'')===String(session.session_label||''));
    if(!configured){
      configured=sessions.find((s:any)=>String(s.venueId||'')===String(session.venue_key||'')&&String(s.day||'')===String(session.weekday||'')&&String(s.start||'')===String(session.start_time||''));
    }
    const hostName=clean(configured?.host||'',120);
    if(!hostName)return null;
    const people=await base44.asServiceRole.entities.Person.filter({tenant_id:session.tenant_id},'full_name',500);
    const person=(people||[]).find((p:any)=>nameKey(p.full_name)===nameKey(hostName));
    return {name:clean(person?.full_name||hostName,120),email:emailKey(person?.primary_email||''),mobile:clean(person?.mobile||'',80)};
  }catch(e){console.error('webhook session host resolution failed',(e as any)?.message||e);return null}
}

async function sendHostBookingEmail(base44:any,scope:any,club:any,session:any,booking:any,host:any,summary:string){
  if(!host?.email)return false;
  const isMember=booking.participant_type==='member';
  const dateLabel=formatDate(session.session_date);
  const timeLabel=`${session.start_time}${session.end_time?'–'+session.end_time:''}`;
  const hostFirst=firstName(host.name||'');
  const textBody=`Hi ${hostFirst},\n\nA ${isMember?'member':'guest'} has booked your ${club.name} session.\n\n${summary}\n\nThis notification was generated automatically by RallyHub.\n\n${club.name}\nPowered by RallyHub`;
  const htmlBody=emailShell({club,headline:`New ${isMember?'member':'guest'} booking for your session`,preheader:`${booking.full_name} · ${dateLabel} · ${timeLabel}`,content:`
<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151;">Hi ${escapeHtml(hostFirst)}, a ${isMember?'member':'guest'} booking has been confirmed for the session you host.</p>
<div style="white-space:pre-wrap;margin:0 0 20px;padding:14px 16px;border-radius:12px;background:#f7f9fc;border:1px solid #dfe5ee;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#172033;">${escapeHtml(summary)}</div>
<p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;">You are receiving this because you are recorded as the host for this club session.</p>`});
  await sendWithConfiguredEmailTransport(base44,scope,{to:host.email,subject:`Session booking confirmed · ${booking.full_name} · ${session.venue_name} · ${session.start_time}`,textBody,htmlBody});
  return true;
}

async function membershipConfig(base44:any,tenantId:string,clubId:string,configId=''){
  if(configId){
    const rows=await base44.asServiceRole.entities.MembershipApplicationConfig.filter({id:configId,tenant_id:tenantId,club_id:clubId},'-updated_date',5);
    if(rows?.[0])return rows[0];
  }
  const rows=await base44.asServiceRole.entities.MembershipApplicationConfig.filter({tenant_id:tenantId,club_id:clubId},'-updated_date',20);
  return (rows||[]).find((x:any)=>x.status==='active')||(rows||[])[0]||null;
}

async function nextMemberId(base44:any,config:any){
  const prefix=clean(config?.member_id_prefix,50);
  if(!prefix)return '';
  const digits=Math.max(2,Math.min(8,Number(config?.member_id_digits||4)));
  const rows=await base44.asServiceRole.entities.ClubMembership.filter({tenant_id:config.tenant_id,club_id:config.club_id},'member_id',500);
  let max=0;
  for(const row of rows||[]){
    const id=String(row.member_id||'');
    if(!id.startsWith(prefix))continue;
    const n=Number(id.slice(prefix.length).replace(/\D/g,''));
    if(Number.isFinite(n))max=Math.max(max,n);
  }
  return `${prefix}${String(max+1).padStart(digits,'0')}`;
}

function membershipEmailShell({club,headline,preheader,content}:any){
  const name=escapeHtml(club?.name||'RallyHub Club');
  const logo=escapeHtml(club?.logo_url||'');
  const primary=escapeHtml(club?.primary_colour||'#2563eb');
  const secondary=escapeHtml(club?.secondary_colour||'#facc15');
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader||headline||'')}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #d9e1ec;border-radius:18px;overflow:hidden;">
<tr><td style="height:6px;background:${primary};border-bottom:3px solid ${secondary};"></td></tr>
<tr><td style="padding:26px 28px 18px;text-align:center;">${logo?`<img src="${logo}" alt="${name} logo" width="72" height="72" style="display:block;margin:0 auto 12px;object-fit:contain;border-radius:12px;">`:''}<div style="font-size:25px;font-weight:800;color:#10182b;">${name}</div><div style="margin-top:5px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;">Membership</div></td></tr>
<tr><td style="padding:0 28px 28px;"><h1 style="margin:0 0 18px;font-size:23px;line-height:1.25;color:#10182b;">${escapeHtml(headline)}</h1>${content}</td></tr>
<tr><td style="padding:18px 28px;background:#f7f9fc;border-top:1px solid #e4e9f1;text-align:center;font-size:11px;line-height:1.5;color:#7b8494;">Powered by <strong>RallyHub</strong> · membership technology for clubs</td></tr>
</table></td></tr></table></body></html>`;
}

async function sendMembershipPaidEmail(base44:any,config:any,club:any,application:any){
  if(!application?.email||String(application.admin_notes||'').includes('paid-confirmation-sent'))return application;
  const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:application.tenant_id,clubId:application.club_id};
  const hello=firstName(application.full_name);
  const fee=money(application.membership_fee,application.currency||config?.currency||'EUR');
  const signatoryName=clean(config?.signatory_name,120)||club?.name||'Club team';
  const signatoryTitle=clean(config?.signatory_title,120);
  const textBody=`Hi ${hello},

Your ${club.name} membership for ${application.membership_season} is confirmed.

Payment received: ${fee}
Membership reference: ${application.confirmation_code}

Thank you for being part of ${club.name}.

${signatoryName}${signatoryTitle?`\n${signatoryTitle}`:''}
${club.name}

Powered by RallyHub`;
  const htmlBody=membershipEmailShell({club,headline:`Membership confirmed, ${hello}`,preheader:`${club.name} membership confirmed`,content:`
<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">Your membership for <strong>${escapeHtml(application.membership_season)}</strong> is now confirmed.</p>
<div style="margin:0 0 20px;padding:16px;border-radius:14px;background:#eef8f1;border:1px solid #b9e2c4;"><div style="font-size:15px;font-weight:800;color:#23452d;">Payment received · ${escapeHtml(fee)}</div><div style="margin-top:5px;font-size:13px;color:#3f6348;">Membership reference: ${escapeHtml(application.confirmation_code)}</div></div>
<p style="margin:0;font-size:15px;line-height:1.65;color:#374151;">Thank you for being part of ${escapeHtml(club.name)}.</p>
<p style="margin:24px 0 0;font-size:15px;line-height:1.5;"><strong>${escapeHtml(signatoryName)}</strong>${signatoryTitle?`<br>${escapeHtml(signatoryTitle)}`:''}<br>${escapeHtml(club.name)}</p>`});
  try{
    const content=await membershipPaidTemplate(base44,config,club,application,{subject:`${club.name} membership confirmed · ${application.membership_season}`,textBody,htmlBody});
    await sendWithConfiguredEmailTransport(base44,scope,{to:application.email,...content});
    return await base44.asServiceRole.entities.MembershipApplication.update(application.id,{
      admin_notes:`${clean(application.admin_notes,1200)} paid-confirmation-sent`.trim(),follow_up_status:'complete'
    });
  }catch(e){
    console.error('membership webhook confirmation email failed',(e as any)?.message||e);
    return application;
  }
}

async function sendMembershipPaymentFailureEmail(base44:any,payment:any,application:any){
  if(!application?.email||application.payment_status==='paid')return;
  const marker='payment-failed-notified:'+payment.id;
  if(String(application.admin_notes||'').includes(marker))return;
  const config=await membershipConfig(base44,payment.tenant_id,payment.club_id,application.config_id||'');
  const club=await clubBrand(base44,payment.club_id);
  if(!config||!club||!application.public_token)return;
  const retryUrl='https://rallyhub.ie/membership/'+encodeURIComponent(config.public_slug)+'?application='+encodeURIComponent(application.public_token)+'&retry=1';
  const hello=firstName(application.full_name);
  const subject=club.name+' membership — your payment did not complete';
  const textBody='Hi '+hello+',\n\nYour recent SumUp membership payment did not complete, so your membership is not yet active. You can try again using your private payment recovery page:\n'+retryUrl+'\n\nThat page will prepare a fresh secure SumUp checkout for you. If you have already paid or need assistance, please contact the club.\n\n'+club.name;
  const htmlBody=membershipEmailShell({club,headline:'Your membership payment did not complete',preheader:subject,content:'<p>Hi '+escapeHtml(hello)+', your recent SumUp payment did not complete. No successful membership payment has been recorded.</p><p>Please use the link below to return securely to your application and create a fresh payment link.</p><p style="margin:20px 0"><a href="'+escapeHtml(retryUrl)+'" style="display:inline-block;background:'+escapeHtml(club.primary_colour||'#2563eb')+';color:white;padding:14px 22px;border-radius:9px;text-decoration:none;font-weight:bold">Try payment again</a></p><p>If you have already paid, or need help, please contact the club.</p>'});
  const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:payment.tenant_id,clubId:payment.club_id};
  try{
    await sendWithConfiguredEmailTransport(base44,scope,{to:application.email,subject,textBody,htmlBody});
    await base44.asServiceRole.entities.MembershipApplication.update(application.id,{admin_notes:(clean(application.admin_notes,1200)+' '+marker).trim()});
  }catch(e){console.error('membership payment failure notification failed',(e as any)?.message||e)}
}

async function syncMembershipApplication(base44:any,payment:any,membership:any,status:'paid'|'failed',now:string){
  const apps=await base44.asServiceRole.entities.MembershipApplication.filter({
    tenant_id:payment.tenant_id,club_id:payment.club_id,club_membership_id:membership.id
  },'-submitted_at',20);
  let application=(apps||[])[0]||null;
  if(!application)return;
  if(status==='paid'){
    application=await base44.asServiceRole.entities.MembershipApplication.update(application.id,{
      status:'approved',payment_status:'paid',paid_at:application.paid_at||now,approved_at:application.approved_at||now,follow_up_status:'complete'
    });
    const config=await membershipConfig(base44,payment.tenant_id,payment.club_id,application.config_id||'');
    const club=await clubBrand(base44,payment.club_id);
    if(config&&club)await sendMembershipPaidEmail(base44,config,club,application);
  }else if(application.payment_status!=='paid'){
    application=await base44.asServiceRole.entities.MembershipApplication.update(application.id,{
      status:'payment_failed',payment_status:'failed',follow_up_status:'payment_due'
    });
    await sendMembershipPaymentFailureEmail(base44,payment,application);
  }
}

async function sendBookingEmails(base44:any,session:any,booking:any){
  if(booking.notification_sent_at && booking.guest_confirmation_sent_at)return booking;
  const club=(await clubBrand(base44,session.club_id))||{
    name:'Clare Pickleball',
    logo_url:'https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/6e59058fc_ClarePBLogo.jpg',
    primary_colour:'#2667f2',secondary_colour:'#facc15',
  };
  const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:session.tenant_id,clubId:session.club_id};
  const now=new Date().toISOString();
  const updates:any={};
  const dateLabel=formatDate(session.session_date);
  const timeLabel=`${session.start_time}${session.end_time?'–'+session.end_time:''}`;
  const amount=money(booking.amount,booking.currency||'EUR');
  const paymentLabel=booking.payment_method==='cash'?`${amount} cash paid`:`${amount} paid online`;
  const isMember=booking.participant_type==='member';
  const participantLabel=isMember?'Member':'Guest';
  const summary=isMember
    ? `MEMBER BOOKING – ${session.venue_name}\n${dateLabel} · ${timeLabel}\n\nMember: ${booking.full_name}\nMobile: ${booking.mobile||'—'}\nPayment: ${paymentLabel}\nBooking ref: ${booking.confirmation_code}${booking.booking_note?`\nNote: ${booking.booking_note}`:''}\n\nVenue: ${session.venue_address}, ${session.venue_eircode}\nMap: ${session.google_maps_url}`
    : `GUEST BOOKING – ${session.venue_name}\n${dateLabel} · ${timeLabel}\n\nGuest: ${booking.full_name}\nMobile: ${booking.mobile}\nEmergency contact: ${booking.emergency_contact_name} – ${booking.emergency_contact_mobile}\nPrevious sports: ${(booking.previous_sports||[]).join(', ')||'—'}${booking.sporting_background_note?`\nOther sporting background: ${booking.sporting_background_note}`:''}\nHealth/medical screening: ${booking.health_declaration_applies?'YES – details supplied':'No issues declared'}${booking.health_declaration_applies&&booking.medical_note?`\nHealth/medical details: ${booking.medical_note}`:''}\nPayment: ${paymentLabel}\nBooking ref: ${booking.confirmation_code}${booking.booking_note?`\nNote: ${booking.booking_note}`:''}\n\nWaiver, Code of Conduct, privacy notice and 24-hour cancellation policy accepted.\nVenue: ${session.venue_address}, ${session.venue_eircode}\nMap: ${session.google_maps_url}`;

  if(!booking.notification_sent_at){
    const host=await resolveSessionHostContact(base44,session);
    let organiserExpected=false;
    if(session.notification_email){
      organiserExpected=true;
      const adminText=`New ${club.name} ${participantLabel.toLowerCase()} booking confirmed.\n\n${summary}\n\n${participantLabel} email: ${booking.email||'—'}\n\nThis session notification was generated automatically by RallyHub.\n\n${club.name}\nPowered by RallyHub`;
      const adminHtml=emailShell({
        club,headline:`New ${participantLabel.toLowerCase()} booking confirmed`,preheader:`${booking.full_name} · ${dateLabel} · ${timeLabel}`,
        content:`<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151;">A ${participantLabel.toLowerCase()} booking has been confirmed and payment status verified automatically.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 20px;">
${detailRow(participantLabel,booking.full_name)}${detailRow('Email',booking.email||'—')}${detailRow('Mobile',booking.mobile||'—')}${detailRow('Session',`${dateLabel} · ${timeLabel}`)}${detailRow('Venue',session.venue_name)}${detailRow('Payment',paymentLabel)}${detailRow('Booking reference',booking.confirmation_code)}${booking.booking_note?detailRow('Note',booking.booking_note):''}
</table>
${isMember?'':`<div style="margin:0 0 20px;padding:14px 16px;border-radius:12px;background:#eef8f1;border:1px solid #b9e2c4;font-size:13px;line-height:1.55;color:#23452d;"><strong>Waiver and policies recorded</strong><br>Guest waiver, Code of Conduct, privacy notice and 24-hour cancellation policy accepted.</div>`}
<div style="margin:0 0 8px;font-size:13px;font-weight:800;color:#172033;">Session host summary</div>
<div style="white-space:pre-wrap;margin:0 0 20px;padding:14px 16px;border-radius:12px;background:#f7f9fc;border:1px solid #dfe5ee;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#172033;">${escapeHtml(summary)}</div>`,
      });
      await sendWithConfiguredEmailTransport(base44,scope,{to:session.notification_email,subject:`${participantLabel} booking confirmed · ${booking.full_name} · ${session.venue_name} · ${session.start_time}`,textBody:adminText,htmlBody:adminHtml});
    }
    if(host?.email&&emailKey(host.email)!==emailKey(session.notification_email||'')){
      organiserExpected=true;
      await sendHostBookingEmail(base44,scope,club,session,booking,host,summary);
    }
    if(organiserExpected)updates.notification_sent_at=now;
  }

  if(!booking.guest_confirmation_sent_at && booking.email){
    const guestFirst=firstName(booking.full_name);
    const guestText=isMember?`Hi ${guestFirst},\n\nThank you for your booking. Your ${club.name} session is confirmed.\n\nSession: ${dateLabel} · ${timeLabel}\nVenue: ${session.venue_name}\nAddress: ${session.venue_address}, ${session.venue_eircode}\nPayment: ${paymentLabel}\nBooking reference: ${booking.confirmation_code}\n\nGoogle Maps:\n${session.google_maps_url}\n\nCancellation policy:\nCancellations made less than 24 hours before the session are non-refundable.\n\nThank you for your booking.\n\nBrian Moore\nChairperson, Clare Pickleball\n\nPowered by RallyHub`:`Hi ${guestFirst},

Thank you for your booking. Your ${club.name} guest session is confirmed.

Session: ${dateLabel} · ${timeLabel}
Venue: ${session.venue_name}
Address: ${session.venue_address}, ${session.venue_eircode}
Payment: ${paymentLabel}
Booking reference: ${booking.confirmation_code}

Google Maps:
${session.google_maps_url}

Cancellation policy:
Cancellations made less than 24 hours before the session are non-refundable.

Your guest waiver, Code of Conduct and privacy acknowledgement have been recorded.

Thank you for your booking.

Brian Moore
Chairperson, Clare Pickleball

Powered by RallyHub`;
    const guestHtml=emailShell({
      club,headline:`Thanks for your booking, ${guestFirst}`,preheader:`${dateLabel} · ${timeLabel} · ${session.venue_name}`,
      content:`<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">Your ${isMember?'club':'guest'} session is confirmed. We look forward to seeing you on court.</p>
<div style="margin:0 0 20px;padding:16px;border-radius:14px;background:#f7f9fc;border:1px solid #dfe5ee;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${detailRow('Date',dateLabel)}${detailRow('Time',timeLabel)}${detailRow('Venue',session.venue_name)}${detailRow('Address',`${session.venue_address}, ${session.venue_eircode}`)}${detailRow('Payment',paymentLabel)}${detailRow('Booking reference',booking.confirmation_code)}</table></div>
<div style="text-align:center;margin:0 0 22px;"><a href="${escapeHtml(session.google_maps_url)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#078e48;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;">View venue in Google Maps</a></div>
<div style="margin:0 0 18px;padding:14px 16px;border-radius:12px;background:#fff8ea;border:1px solid #f2d18a;font-size:13px;line-height:1.55;color:#624717;"><strong>Cancellation policy</strong><br>Cancellations made less than 24 hours before the session are non-refundable.</div>
${isMember?'':`<p style="margin:0 0 22px;font-size:12px;line-height:1.55;color:#6b7280;">Your guest waiver, Code of Conduct and privacy acknowledgement have been recorded with this booking.</p>`}
<p style="margin:0;font-size:15px;line-height:1.65;color:#374151;">Thank you for your booking.</p><p style="margin:10px 0 0;font-size:15px;line-height:1.5;color:#172033;"><strong>Brian Moore</strong><br>Chairperson<br>Clare Pickleball</p>`,
    });
    await sendWithConfiguredEmailTransport(base44,scope,{to:booking.email,subject:`${club.name} · ${participantLabel} booking confirmed · ${dateLabel} ${session.start_time}`,textBody:guestText,htmlBody:guestHtml});
    updates.guest_confirmation_sent_at=now;
  }

  if(Object.keys(updates).length)return await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,updates);
  return booking;
}

async function resolveGateway(base44:any,payment:any){
  const rows=await base44.asServiceRole.entities.PaymentGatewayAccount.filter({
    tenant_id:payment.tenant_id,club_id:payment.club_id,provider:'sumup'
  },'-updated_date',20);
  const row=(rows||[]).find((x:any)=>x.status==='connected'&&x.is_default)||(rows||[]).find((x:any)=>x.status==='connected')||(rows||[]).find((x:any)=>x.is_default)||rows?.[0]||null;
  const secretName=clean(row?.credential_reference,120)||'SUMUP_API_KEY';
  const apiKey=Deno.env.get(secretName)||'';
  const merchantCode=clean(row?.merchant_account_id,120)||Deno.env.get('SUMUP_MERCHANT_CODE')||'';
  if(!apiKey||!merchantCode)throw new Error('SumUp credentials are not configured for this tenant.');
  return {apiKey,merchantCode,row};
}

async function verifyCheckout(base44:any,payment:any,checkoutId:string){
  const {apiKey,merchantCode}=await resolveGateway(base44,payment);
  // Bind webhook verification to the merchant captured on checkout creation.
  // A club switching its default gateway must not verify another merchant's sale.
  if(payment.payment_type==='tournival_registration' && payment.provider_account_id &&
     String(payment.provider_account_id)!==merchantCode)
    throw new Error('Tournival checkout merchant differs from the recorded club merchant; manual reconciliation required.');

  const response=await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(checkoutId)}`,{headers:{Authorization:`Bearer ${apiKey}`}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data?.message||`SumUp checkout verification failed (${response.status}).`);
  const returnedMerchant=clean(data?.merchant_code,120);
  if(returnedMerchant&&merchantCode&&returnedMerchant!==merchantCode)throw new Error('SumUp checkout merchant does not match the RallyHub tenant gateway.');
  const tx=(Array.isArray(data?.transactions)?data.transactions:[]).find((t:any)=>String(t?.status||'').toUpperCase()==='SUCCESSFUL')||data?.transactions?.[0]||{};
  return {status:String(data?.status||'PENDING').toUpperCase(),transactionId:clean(tx?.id||data?.transaction_id,160),transactionCode:clean(tx?.transaction_code||data?.transaction_code,160),merchantCode:returnedMerchant||merchantCode,amount:Number(data?.amount),currency:clean(data?.currency,10).toUpperCase()};
}

Deno.serve(async(req)=>{
  if(req.method!=='POST')return new Response('',{status:405});
  try{
    const url=new URL(req.url);
    if((url.searchParams.get('provider')||'sumup').toLowerCase()!=='sumup')return new Response('',{status:204});
    const event=await req.json().catch(()=>({}));
    if(String(event?.event_type||'')!=='CHECKOUT_STATUS_CHANGED')return new Response('',{status:204});
    const checkoutId=clean(event?.id,180);
    if(!checkoutId)return new Response('',{status:204});

    const base44=createClientFromRequest(req);
    let payments=await base44.asServiceRole.entities.PaymentRecord.filter({provider:'sumup',provider_checkout_id:checkoutId},'-created_date',10);
    if(!payments?.length)payments=await base44.asServiceRole.entities.PaymentRecord.filter({sumup_checkout_id:checkoutId},'-created_date',10);
    const payment=payments?.[0]||null;
    if(!payment)return new Response('',{status:204});

    const verified=await verifyCheckout(base44,payment,checkoutId);
    const status=verified.status;
    const now=new Date().toISOString();

    // A late failed/cancelled provider notification must never reverse an already
    // verified paid Tournival registration. Refund is a separate audited workflow.
    if(payment.purpose_type==='event'&&payment.payment_type==='tournival_registration'&&
       payment.payment_status==='paid'&&status!=='PAID'){
      return new Response('',{status:204});
    }

    if(status==='PAID'){
      const update:any={
        payment_status:'paid',payment_date:now.slice(0,10),provider_status:'PAID',
        provider_account_id:verified.merchantCode||payment.provider_account_id||'',
        provider_transaction_id:verified.transactionId||payment.provider_transaction_id||'',
        provider_payment_reference:verified.transactionCode||payment.provider_payment_reference||'',
        external_payment_reference:verified.transactionCode||payment.external_payment_reference||'',
      };
      if(payment.purpose_type==='event'&&payment.payment_type==='tournival_registration'){
        if(!Number.isFinite(verified.amount)||
          Math.round(verified.amount*100)!==Math.round(Number(payment.amount)*100)||
          verified.currency!==String(payment.currency||'EUR').toUpperCase()) {
          console.warn('Tournival checkout not confirmed due to amount/currency mismatch',payment.id);
          return new Response('',{status:204});
        }
      }
      await base44.asServiceRole.entities.PaymentRecord.update(payment.id,update);

      // Tournival event fees: never confirm without verified SumUp checkout and
      // exact amount/currency match. This is independent of sporting state.
      if(payment.purpose_type==='event'&&payment.payment_type==='tournival_registration'&&payment.purpose_id){
        const registrations=await base44.asServiceRole.entities.TournivalRegistration.filter({
          id:payment.purpose_id,tenant_id:payment.tenant_id,club_id:payment.club_id
        },'-created_date',5);
        const reg=registrations?.[0]||null;
        if(reg && reg.registration_status!=='withdrawn'){
          if(!Number.isFinite(verified.amount)||
            Math.round(verified.amount*100)!==Math.round(Number(payment.amount)*100)||
            verified.currency!==String(payment.currency||'EUR').toUpperCase()) {
            console.warn('Tournival SumUp checkout amount/currency reconciliation required:',payment.id);
            await base44.asServiceRole.entities.TournivalRegistration.update(reg.id,{
              last_error:'Provider amount/currency mismatch; manual reconciliation required.'
            });
          }else if(reg.payment_status!=='paid'){
            await base44.asServiceRole.entities.TournivalRegistration.update(reg.id,{
              payment_status:'paid',registration_status:'confirmed',
              confirmed_at:reg.confirmed_at||now,payment_record_id:payment.id,
              payment_reference:verified.transactionId||verified.transactionCode||checkoutId
            });
            // Add only confirmed paid players to the Tournival sporting roster;
            // keep the event's other sporting state and completed results intact.
            const tournaments=await base44.asServiceRole.entities.Tournament.filter({
              id:reg.tournament_id,tenant_id:reg.tenant_id
            },'-created_date',5);
            const eventTournament=tournaments?.[0];
            if(eventTournament&&String(eventTournament.format).toLowerCase()==='tournival'){
              await base44.asServiceRole.entities.Tournament.updateMany({
                id:eventTournament.id,tenant_id:reg.tenant_id
              },{$addToSet:{player_ids:reg.player_id}});
              const paidBytes=crypto.getRandomValues(new Uint8Array(24));
              const paidToken='trp_'+Array.from(paidBytes,
                b=>b.toString(16).padStart(2,'0')).join('');
              const paidDigest=await crypto.subtle.digest('SHA-256',
                new TextEncoder().encode(paidToken));
              const paidHash=Array.from(new Uint8Array(paidDigest),
                b=>b.toString(16).padStart(2,'0')).join('');
              await base44.asServiceRole.entities.TournivalAccessToken.create({
                tenant_id:reg.tenant_id,club_id:reg.club_id,
                tournament_id:eventTournament.id,token_hash:paidHash,token_type:'player',
                player_id:reg.player_id,registration_id:reg.id,
                created_at:new Date().toISOString(),created_by_user_id:'verified_payment_webhook'
              });
              await safelyQueueTournivalNotice(base44,{
                tenantId:reg.tenant_id,clubId:reg.club_id,eventId:eventTournament.id,
                sourceRecordId:'paid:'+reg.id,operationId:'payment:'+payment.id,
                purpose:'tournival_payment_confirmed',
                recipient:{id:reg.id,name:reg.full_name,email:reg.email,mobile:reg.mobile},
                fields:{FIRST_NAME:String(reg.full_name||'Player').split(' ')[0],
                  EVENT_NAME:String(eventTournament.name||''),
                  PAYMENT_STATUS:'Paid',PAYMENT_REFERENCE:String(payment.provider_payment_reference||''),
                  PLAYER_LINK:'https://rallyhub.ie/tournival/player/'+paidToken}
              });
            }
          }
        }
      }
      if(payment.purpose_type==='booking'&&payment.purpose_id){
        const bookings=await base44.asServiceRole.entities.GuestSessionBooking.filter({id:payment.purpose_id},'-created_date',5);
        let booking=bookings?.[0]||null;
        if(booking){
          if(booking.payment_status!=='paid'||booking.booking_status!=='confirmed'){
            booking=await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,{payment_status:'paid',booking_status:'confirmed',paid_at:booking.paid_at||now});
          }
          const sessions=await base44.asServiceRole.entities.GuestSessionLink.filter({id:booking.session_link_id},'-created_at',5);
          const session=sessions?.[0]||null;
          if(session)await sendBookingEmails(base44,session,booking);
        }
      }
      if(payment.purpose_type==='membership'&&(payment.club_membership_id||payment.purpose_id)){
        const membershipId=clean(payment.club_membership_id||payment.purpose_id,180);
        const memberships=await base44.asServiceRole.entities.ClubMembership.filter({
          id:membershipId,tenant_id:payment.tenant_id,club_id:payment.club_id
        },'-updated_date',5);
        const membership=memberships?.[0]||null;
        if(membership){
          const config=await membershipConfig(base44,payment.tenant_id,payment.club_id);
          const membershipPatch:any={payment_status:'paid',membership_status:'paid_active',payment_date:now.slice(0,10)};
          if(!membership.member_id&&config){
            const generatedId=await nextMemberId(base44,config);
            if(generatedId)membershipPatch.member_id=generatedId;
          }
          const updatedMembership=await base44.asServiceRole.entities.ClubMembership.update(membership.id,membershipPatch);
          const relationships=await base44.asServiceRole.entities.ClubRelationship.filter({
            tenant_id:payment.tenant_id,club_id:payment.club_id,person_id:membership.person_id
          },'-updated_date',20);
          const relationship=(relationships||[]).find((r:any)=>r.relationship_type==='member')||null;
          if(relationship)await base44.asServiceRole.entities.ClubRelationship.update(relationship.id,{
            status:'active',payment_status:'paid',payment_date:now.slice(0,10),
            ...(updatedMembership.member_id?{membership_id:updatedMembership.member_id}:{})
          });
          for(const guest of (relationships||[]).filter((r:any)=>r.relationship_type==='guest'&&r.status==='active')){
            await base44.asServiceRole.entities.ClubRelationship.update(guest.id,{
              status:'inactive',end_date:now.slice(0,10),
              notes:(clean(guest.notes,700)+' Converted to paid membership; guest booking history retained.').trim(),
              last_synced_at:now
            });
          }
          await syncMembershipApplication(base44,payment,updatedMembership,'paid',now);
          try{await base44.asServiceRole.entities.AuditLog.create({
            tenant_id:payment.tenant_id,club_id:payment.club_id,user_id:'system:webhook',
            action:'membership_payment_confirmed',entity_type:'ClubMembership',entity_id:membership.id,
            scope_type:'Person',scope_id:membership.person_id,
            after_state:JSON.stringify({payment_record_id:payment.id,provider:payment.provider||'sumup',provider_transaction_id:verified.transactionId||''}),
            reason:'Payment gateway webhook verified the membership payment'
          });}catch{}
        }
      }
      return new Response('',{status:204});
    }

    if(status==='FAILED'||status==='EXPIRED'){
      const local='failed';
      await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{payment_status:local,provider_status:status});
      if(payment.purpose_type==='event'&&payment.payment_type==='tournival_registration'&&payment.purpose_id){
        const registrations=await base44.asServiceRole.entities.TournivalRegistration.filter({
          id:payment.purpose_id,tenant_id:payment.tenant_id,club_id:payment.club_id
        },'-created_date',5);
        const reg=registrations?.[0];
        if(reg&&reg.payment_status!=='paid')
          await base44.asServiceRole.entities.TournivalRegistration.update(reg.id,{payment_status:local});
      }
      if(payment.purpose_type==='booking'&&payment.purpose_id){
        const bookings=await base44.asServiceRole.entities.GuestSessionBooking.filter({id:payment.purpose_id},'-created_date',5);
        const booking=bookings?.[0]||null;
        if(booking&&booking.payment_status!=='paid'){
          await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,{payment_status:local,booking_status:'pending_payment'});
        }
      }
      if(payment.purpose_type==='membership'&&(payment.club_membership_id||payment.purpose_id)){
        const membershipId=clean(payment.club_membership_id||payment.purpose_id,180);
        const memberships=await base44.asServiceRole.entities.ClubMembership.filter({
          id:membershipId,tenant_id:payment.tenant_id,club_id:payment.club_id
        },'-updated_date',5);
        const membership=memberships?.[0]||null;
        if(membership&&membership.payment_status!=='paid'){
          await base44.asServiceRole.entities.ClubMembership.update(membership.id,{payment_status:'failed',membership_status:'pending_payment'});
          const relationships=await base44.asServiceRole.entities.ClubRelationship.filter({
            tenant_id:payment.tenant_id,club_id:payment.club_id,person_id:membership.person_id
          },'-updated_date',20);
          const relationship=relationships?.[0]||null;
          if(relationship)await base44.asServiceRole.entities.ClubRelationship.update(relationship.id,{status:'pending',payment_status:'failed'});
          await syncMembershipApplication(base44,payment,membership,'failed',now);
        }
      }
    }
    return new Response('',{status:204});
  }catch(e){
    console.error('paymentGatewayWebhook failed',(e as any)?.message||e);
    return new Response('',{status:500});
  }
});