import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { sendWithConfiguredEmailTransport } from './emailRouter.ts';

function clean(v:any,max=500){return String(v??'').trim().slice(0,max)}
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
<tr><td style="padding:26px 28px 18px;text-align:center;">${logo?`<img src="${logo}" alt="${name} logo" width="72" height="72" style="display:block;margin:0 auto 12px;object-fit:contain;border-radius:12px;">`:''}<div style="font-size:25px;font-weight:800;color:#10182b;">${name}</div><div style="margin-top:5px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;">Guest Session Booking</div></td></tr>
<tr><td style="padding:0 28px 28px;"><h1 style="margin:0 0 18px;font-size:23px;line-height:1.25;color:#10182b;">${escapeHtml(headline)}</h1>${content}</td></tr>
<tr><td style="padding:18px 28px;background:#f7f9fc;border-top:1px solid #e4e9f1;text-align:center;font-size:11px;line-height:1.5;color:#7b8494;">Powered by <strong>RallyHub</strong> · booking technology for clubs</td></tr>
</table></td></tr></table></body></html>`;
}

async function clubBrand(base44:any,clubId:string){
  try{
    const rows=await base44.asServiceRole.entities.Club.filter({id:clubId},'-updated_date',5);
    const club=rows?.[0]||null;
    if(!club)return null;
    return {id:club.id,name:club.name||'',logo_url:club.logo_url||'',primary_colour:club.primary_colour||'',secondary_colour:club.secondary_colour||''};
  }catch{return null}
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
  const summary=`GUEST BOOKING – ${session.venue_name}
${dateLabel} · ${timeLabel}

Guest: ${booking.full_name}
Mobile: ${booking.mobile}
Emergency contact: ${booking.emergency_contact_name} – ${booking.emergency_contact_mobile}
Payment: ${paymentLabel}
Booking ref: ${booking.confirmation_code}

Waiver, Code of Conduct, privacy notice and 24-hour cancellation policy accepted.
Venue: ${session.venue_address}, ${session.venue_eircode}
Map: ${session.google_maps_url}${booking.medical_note?`\nEmergency note: ${booking.medical_note}`:''}`;

  if(!booking.notification_sent_at && session.notification_email){
    const adminText=`New ${club.name} guest booking confirmed.

${summary}

Guest email: ${booking.email}

Copy the host block above into WhatsApp, or forward this email.

${club.name}
Powered by RallyHub`;
    const adminHtml=emailShell({
      club,headline:'New guest booking confirmed',preheader:`${booking.full_name} · ${dateLabel} · ${timeLabel}`,
      content:`<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151;">A guest booking has been confirmed and payment status verified automatically.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 20px;">
${detailRow('Guest',booking.full_name)}${detailRow('Email',booking.email)}${detailRow('Mobile',booking.mobile)}${detailRow('Session',`${dateLabel} · ${timeLabel}`)}${detailRow('Venue',session.venue_name)}${detailRow('Payment',paymentLabel)}${detailRow('Booking reference',booking.confirmation_code)}
</table>
<div style="margin:0 0 20px;padding:14px 16px;border-radius:12px;background:#eef8f1;border:1px solid #b9e2c4;font-size:13px;line-height:1.55;color:#23452d;"><strong>Waiver and policies recorded</strong><br>Guest waiver, Code of Conduct, privacy notice and 24-hour cancellation policy accepted.</div>
<div style="margin:0 0 8px;font-size:13px;font-weight:800;color:#172033;">Copy for the session host / WhatsApp</div>
<div style="white-space:pre-wrap;margin:0 0 20px;padding:14px 16px;border-radius:12px;background:#f7f9fc;border:1px solid #dfe5ee;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#172033;">${escapeHtml(summary)}</div>`,
    });
    await sendWithConfiguredEmailTransport(base44,scope,{to:session.notification_email,subject:`Guest booking confirmed · ${booking.full_name} · ${session.venue_name} · ${session.start_time}`,textBody:adminText,htmlBody:adminHtml});
    updates.notification_sent_at=now;
  }

  if(!booking.guest_confirmation_sent_at && booking.email){
    const guestFirst=firstName(booking.full_name);
    const guestText=`Hi ${guestFirst},

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
      content:`<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">Your guest session is confirmed. We look forward to welcoming you on court.</p>
<div style="margin:0 0 20px;padding:16px;border-radius:14px;background:#f7f9fc;border:1px solid #dfe5ee;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${detailRow('Date',dateLabel)}${detailRow('Time',timeLabel)}${detailRow('Venue',session.venue_name)}${detailRow('Address',`${session.venue_address}, ${session.venue_eircode}`)}${detailRow('Payment',paymentLabel)}${detailRow('Booking reference',booking.confirmation_code)}</table></div>
<div style="text-align:center;margin:0 0 22px;"><a href="${escapeHtml(session.google_maps_url)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#078e48;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;">View venue in Google Maps</a></div>
<div style="margin:0 0 18px;padding:14px 16px;border-radius:12px;background:#fff8ea;border:1px solid #f2d18a;font-size:13px;line-height:1.55;color:#624717;"><strong>Cancellation policy</strong><br>Cancellations made less than 24 hours before the session are non-refundable.</div>
<p style="margin:0 0 22px;font-size:12px;line-height:1.55;color:#6b7280;">Your guest waiver, Code of Conduct and privacy acknowledgement have been recorded with this booking.</p>
<p style="margin:0;font-size:15px;line-height:1.65;color:#374151;">Thank you for your booking.</p><p style="margin:10px 0 0;font-size:15px;line-height:1.5;color:#172033;"><strong>Brian Moore</strong><br>Chairperson<br>Clare Pickleball</p>`,
    });
    await sendWithConfiguredEmailTransport(base44,scope,{to:booking.email,subject:`${club.name} · Guest booking confirmed · ${dateLabel} ${session.start_time}`,textBody:guestText,htmlBody:guestHtml});
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
  const response=await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(checkoutId)}`,{headers:{Authorization:`Bearer ${apiKey}`}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data?.message||`SumUp checkout verification failed (${response.status}).`);
  const returnedMerchant=clean(data?.merchant_code,120);
  if(returnedMerchant&&merchantCode&&returnedMerchant!==merchantCode)throw new Error('SumUp checkout merchant does not match the RallyHub tenant gateway.');
  const tx=(Array.isArray(data?.transactions)?data.transactions:[]).find((t:any)=>String(t?.status||'').toUpperCase()==='SUCCESSFUL')||data?.transactions?.[0]||{};
  return {status:String(data?.status||'PENDING').toUpperCase(),transactionId:clean(tx?.id||data?.transaction_id,160),transactionCode:clean(tx?.transaction_code||data?.transaction_code,160),merchantCode:returnedMerchant||merchantCode};
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

    if(status==='PAID'){
      const update:any={
        payment_status:'paid',payment_date:now.slice(0,10),provider_status:'PAID',
        provider_account_id:verified.merchantCode||payment.provider_account_id||'',
        provider_transaction_id:verified.transactionId||payment.provider_transaction_id||'',
        provider_payment_reference:verified.transactionCode||payment.provider_payment_reference||'',
        external_payment_reference:verified.transactionCode||payment.external_payment_reference||'',
      };
      await base44.asServiceRole.entities.PaymentRecord.update(payment.id,update);

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
          await base44.asServiceRole.entities.ClubMembership.update(membership.id,{
            payment_status:'paid',membership_status:'paid_active',payment_date:now.slice(0,10)
          });
          const relationships=await base44.asServiceRole.entities.ClubRelationship.filter({
            tenant_id:payment.tenant_id,club_id:payment.club_id,person_id:membership.person_id
          },'-updated_date',20);
          const relationship=relationships?.[0]||null;
          if(relationship)await base44.asServiceRole.entities.ClubRelationship.update(relationship.id,{
            status:'active',payment_status:'paid',payment_date:now.slice(0,10)
          });
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
      const local=status.toLowerCase();
      await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{payment_status:local,provider_status:status});
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
        }
      }
    }
    return new Response('',{status:204});
  }catch(e){
    console.error('paymentGatewayWebhook failed',e?.message||e);
    return new Response('',{status:500});
  }
});