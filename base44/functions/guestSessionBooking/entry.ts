import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { createCheckout, retrievePayment, refundPayment, providerConfigured, verifyProviderConnection, type ProviderAccount } from './payments.ts';
import { sendWithConfiguredEmailTransport } from './emailRouter.ts';

const PRIVACY_VERSION='clare-guest-session-privacy-v1-2026-09';
const CANCELLATION_VERSION='clare-guest-session-cancellation-v1-2026-09';
const ADULT_AGE_VERSION='clare-adult-18plus-v1-2026-09';

const maps=(q:string)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const VENUES:any={
  doora:{
    key:'doora',
    name:'St. Josephs Doora Barefield GAA Club',
    address:'Gurteen, Quin Road, Co. Clare, Ireland',
    eircode:'V95 PD36',
    mapsUrl:'https://maps.app.goo.gl/8JuFsTbr6dJT8pQJA',
  },
  ennistymon:{
    key:'ennistymon',
    name:'Ennistymon Community Centre',
    address:'Parliament Street, Ennistymon, County Clare, Ireland',
    eircode:'V95 X8XC',
    mapsUrl:maps('Ennistymon Community Centre, Parliament Street, Ennistymon, County Clare, V95 X8XC'),
  },
  corofin:{
    key:'corofin',
    name:'Corofin (Clare) GAA Sports Hall',
    address:'Corofin, County Clare, Ireland',
    eircode:'V95 XD56',
    mapsUrl:'https://maps.app.goo.gl/U4BMNDqiMzShuJV58',
  },
};

const TEMPLATES:any={
  doora_mon_1900:{key:'doora_mon_1900',venueKey:'doora',weekday:'Monday',start:'19:00',end:'20:30',fee:5.50,payment:'sumup',label:'Monday 7:00 pm'},
  doora_mon_2030:{key:'doora_mon_2030',venueKey:'doora',weekday:'Monday',start:'20:30',end:'22:00',fee:5.50,payment:'sumup',label:'Monday 8:30 pm'},
  doora_thu_1900:{key:'doora_thu_1900',venueKey:'doora',weekday:'Thursday',start:'19:00',end:'20:30',fee:5.50,payment:'sumup',label:'Thursday 7:00 pm'},
  doora_thu_2030:{key:'doora_thu_2030',venueKey:'doora',weekday:'Thursday',start:'20:30',end:'22:00',fee:5.50,payment:'sumup',label:'Thursday 8:30 pm'},
  ennistymon_wed_1900:{key:'ennistymon_wed_1900',venueKey:'ennistymon',weekday:'Wednesday',start:'19:00',end:'20:00',fee:5.50,payment:'sumup',label:'Wednesday 7:00 pm'},
  ennistymon_wed_2000:{key:'ennistymon_wed_2000',venueKey:'ennistymon',weekday:'Wednesday',start:'20:00',end:'21:00',fee:5.50,payment:'sumup',label:'Wednesday 8:00 pm'},
  corofin_wed_1130:{key:'corofin_wed_1130',venueKey:'corofin',weekday:'Wednesday',start:'11:30',end:'13:30',fee:5.00,payment:'cash',label:'Wednesday 11:30 am'},
};

function clean(v:any,max=250){return String(v??'').trim().replace(/\s+/g,' ').slice(0,max)}
function emailKey(v:any){return clean(v,200).toLowerCase()}
function mobileKey(v:any){return clean(v,50).replace(/[^0-9]/g,'')}
function token(){return `gs_${crypto.randomUUID().replaceAll('-','')}`}
function validToken(v:string){return /^gs_[0-9a-f]{32}$/i.test(v)}
function confirmation(){return `G${crypto.randomUUID().replaceAll('-','').slice(0,7).toUpperCase()}`}
function weekday(date:string){
  const d=new Date(`${date}T12:00:00Z`);
  return Number.isFinite(d.getTime())?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getUTCDay()]:'';
}
function templateOut(t:any){
  const v=VENUES[t.venueKey];
  return {...t,venueName:v.name,venueAddress:v.address,eircode:v.eircode,mapsUrl:v.mapsUrl};
}
function safeSession(s:any){
  return {
    id:s.id,token:s.token,active:s.active,sessionDate:s.session_date,weekday:s.weekday,
    startTime:s.start_time,endTime:s.end_time,venueKey:s.venue_key,venueName:s.venue_name,
    venueAddress:s.venue_address,eircode:s.venue_eircode,mapsUrl:s.google_maps_url,
    sessionLabel:s.session_label||'',capacity:s.capacity||null,feeAmount:Number(s.fee_amount||0),
    currency:s.currency||'EUR',paymentMethod:s.payment_method,
  };
}
async function clubBrand(base44:any,clubId:string){
  try{
    const rows=await base44.asServiceRole.entities.Club.filter({id:clubId},'-updated_date',5);
    const club=rows?.[0]||null;
    if(!club)return null;
    return {
      id:club.id,name:club.name||'',slug:club.slug||'',
      logo_url:club.logo_url||'',
      primary_colour:club.primary_colour||'',
      secondary_colour:club.secondary_colour||'',
    };
  }catch{return null}
}
async function activeClubLegalDocument(base44:any,tenantId:string,clubId:string,documentType:string){
  const rows=await base44.asServiceRole.entities.ClubLegalDocument.filter({tenant_id:tenantId,club_id:clubId,document_type:documentType,active:true},'-effective_from',20);
  const doc=(rows||[])[0];
  if(!doc) throw Object.assign(new Error(`This club has no active ${documentType.replaceAll('_',' ')} configured.`),{status:409});
  return doc;
}
async function activeAdultPolicy(base44:any,tenantId:string,clubId:string){
  const rows=await base44.asServiceRole.entities.ClubPolicy.filter({tenant_id:tenantId,club_id:clubId,policy_type:'adult_participation',status:'active'},'-effective_from',20);
  return rows?.[0]||null;
}
async function legal(base44:any,session:any){
  const [waiver,code,adultPolicy]=await Promise.all([
    activeClubLegalDocument(base44,session.tenant_id,session.club_id,'liability_waiver'),
    activeClubLegalDocument(base44,session.tenant_id,session.club_id,'code_of_conduct'),
    activeAdultPolicy(base44,session.tenant_id,session.club_id)
  ]);
  return {
    waiverVersion:waiver.version,
    waiverTitle:waiver.title,
    waiverText:waiver.body_text,
    waiverConsentLabel:waiver.consent_label||'I have read and accept the Clare Pickleball Participation Declaration, Assumption of Risk & Liability Notice.',
    codeVersion:code.version,
    codeTitle:code.title,
    codeText:code.body_text,
    codeConsentLabel:code.consent_label||'I have read and agree to abide by the club Code of Conduct.',
    minimumAge:Number(adultPolicy?.minimum_age||0)||null,
    privacyVersion:PRIVACY_VERSION,
    privacyText:'Your details are used to administer this guest booking, payment, emergency/safety arrangements and necessary session communications. A guest booking does not make you a Clare Pickleball member. Your booking history may later be linked to the same RallyHub person record if you join the club, so RallyHub does not create duplicate identities.',
    cancellationVersion:CANCELLATION_VERSION,
    cancellationText:'Cancellations made less than 24 hours before the session are non-refundable.',
  };
}
function formatDate(d:string){
  try{return new Intl.DateTimeFormat('en-IE',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Dublin'}).format(new Date(`${d}T12:00:00Z`))}catch{return d}
}
function escapeHtml(value:any){
  return String(value??'').replace(/[&<>"']/g,(ch)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } as any)[ch]);
}
function firstName(value:any){
  return clean(value,120).split(/\s+/).filter(Boolean)[0]||'there';
}
function money(value:any,currency='EUR'){
  try{return new Intl.NumberFormat('en-IE',{style:'currency',currency}).format(Number(value||0))}catch{return `€${Number(value||0).toFixed(2)}`}
}
function emailShell({club,headline,preheader,content}:any){
  const name=escapeHtml(club?.name||'Clare Pickleball');
  const logo=escapeHtml(club?.logo_url||'');
  const primary=escapeHtml(club?.primary_colour||'#2667f2');
  const secondary=escapeHtml(club?.secondary_colour||'#facc15');
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader||headline||'')}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #d9e1ec;border-radius:18px;overflow:hidden;">
<tr><td style="height:6px;background:${primary};border-bottom:3px solid ${secondary};"></td></tr>
<tr><td style="padding:26px 28px 18px;text-align:center;">
${logo?`<img src="${logo}" alt="${name} logo" width="72" height="72" style="display:block;margin:0 auto 12px;object-fit:contain;border-radius:12px;">`:''}
<div style="font-size:25px;font-weight:800;color:#10182b;">${name}</div>
<div style="margin-top:5px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;">Guest Session Booking</div>
</td></tr>
<tr><td style="padding:0 28px 28px;">
<h1 style="margin:0 0 18px;font-size:23px;line-height:1.25;color:#10182b;">${escapeHtml(headline)}</h1>
${content}
</td></tr>
<tr><td style="padding:18px 28px;background:#f7f9fc;border-top:1px solid #e4e9f1;text-align:center;font-size:11px;line-height:1.5;color:#7b8494;">
Powered by <strong>RallyHub</strong> · booking technology for clubs
</td></tr>
</table>
</td></tr></table></body></html>`;
}
function detailRow(label:string,value:any){
  return `<tr><td style="padding:7px 0;color:#6b7280;font-size:13px;width:38%;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:7px 0;color:#172033;font-size:13px;font-weight:700;vertical-align:top;">${escapeHtml(value)}</td></tr>`;
}
function hostText(session:any,b:any){
  const pay=b.payment_method==='cash'
    ? (b.payment_status==='paid'?'Cash €'+Number(b.amount).toFixed(2)+' paid':'€'+Number(b.amount).toFixed(2)+' cash due on arrival')
    : '€'+Number(b.amount).toFixed(2)+' paid online';
  return `GUEST BOOKING – ${session.venue_name}
${formatDate(session.session_date)} · ${session.start_time}${session.end_time?'–'+session.end_time:''}

Guest: ${b.full_name}
Mobile: ${b.mobile}
Emergency contact: ${b.emergency_contact_name} – ${b.emergency_contact_mobile}
Payment: ${pay}
Booking ref: ${b.confirmation_code}

Waiver, Code of Conduct, privacy notice and 24-hour cancellation policy accepted.
Venue: ${session.venue_address}, ${session.venue_eircode}
Map: ${session.google_maps_url}${b.medical_note ? `\nEmergency note: ${b.medical_note}` : ''}`;
}
async function sendConfirmations(base44:any,session:any,booking:any,force=false){
  if(!force && booking.notification_sent_at && booking.guest_confirmation_sent_at) return booking;
  const summary=hostText(session,booking);
  const now=new Date().toISOString();
  const updates:any={};
  const club=(await clubBrand(base44,session.club_id))||{
    name:'Clare Pickleball',
    logo_url:'https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/6e59058fc_ClarePBLogo.jpg',
    primary_colour:'#2667f2',secondary_colour:'#facc15',
  };
  const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:session.tenant_id,clubId:session.club_id};
  const amount=money(booking.amount,booking.currency||'EUR');
  const dateLabel=formatDate(session.session_date);
  const timeLabel=`${session.start_time}${session.end_time?'–'+session.end_time:''}`;
  const paymentLabel=booking.payment_method==='cash'
    ? (booking.payment_status==='paid'? `${amount} cash paid` : `${amount} cash on arrival`)
    : `${amount} paid online`;

  if((force||!booking.notification_sent_at) && session.notification_email){
    try{
      const adminText=`New Clare Pickleball guest booking confirmed.

${summary}

Guest email: ${booking.email}

Copy the host block above into WhatsApp, or forward this email.

Clare Pickleball
Powered by RallyHub`;
      const adminHtml=emailShell({
        club,
        headline:'New guest booking confirmed',
        preheader:`${booking.full_name} · ${dateLabel} · ${timeLabel}`,
        content:`
<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151;">A guest booking has been confirmed and payment status verified.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 20px;">
${detailRow('Guest',booking.full_name)}
${detailRow('Email',booking.email)}
${detailRow('Mobile',booking.mobile)}
${detailRow('Session',`${dateLabel} · ${timeLabel}`)}
${detailRow('Venue',session.venue_name)}
${detailRow('Payment',paymentLabel)}
${detailRow('Booking reference',booking.confirmation_code)}
</table>
<div style="margin:0 0 20px;padding:14px 16px;border-radius:12px;background:#eef8f1;border:1px solid #b9e2c4;font-size:13px;line-height:1.55;color:#23452d;">
<strong>Waiver and policies recorded</strong><br>
Guest waiver, Code of Conduct, privacy notice and 24-hour cancellation policy accepted.
</div>
<div style="margin:0 0 8px;font-size:13px;font-weight:800;color:#172033;">Copy for the session host / WhatsApp</div>
<div style="white-space:pre-wrap;margin:0 0 20px;padding:14px 16px;border-radius:12px;background:#f7f9fc;border:1px solid #dfe5ee;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#172033;">${escapeHtml(summary)}</div>
<p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;">You can forward this email directly to the session host if preferred.</p>`,
      });
      await sendWithConfiguredEmailTransport(base44,scope,{
        to:session.notification_email,
        subject:`Guest booking confirmed · ${booking.full_name} · ${session.venue_name} · ${session.start_time}`,
        textBody:adminText,
        htmlBody:adminHtml,
      });
      updates.notification_sent_at=now;
    }catch(e){console.error('guest admin notification failed',e?.message||e)}
  }

  const guestEligible=booking.email && (
    (booking.payment_method==='sumup' && ['paid','partially_refunded','refunded'].includes(booking.payment_status))
    || (booking.payment_method==='cash' && booking.payment_status==='paid')
  );
  if((force||!booking.guest_confirmation_sent_at) && guestEligible){
    try{
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
        club,
        headline:`Thanks for your booking, ${guestFirst}`,
        preheader:`${dateLabel} · ${timeLabel} · ${session.venue_name}`,
        content:`
<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">Your guest session is confirmed. We look forward to welcoming you on court.</p>
<div style="margin:0 0 20px;padding:16px;border-radius:14px;background:#f7f9fc;border:1px solid #dfe5ee;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
${detailRow('Date',dateLabel)}
${detailRow('Time',timeLabel)}
${detailRow('Venue',session.venue_name)}
${detailRow('Address',`${session.venue_address}, ${session.venue_eircode}`)}
${detailRow('Payment',paymentLabel)}
${detailRow('Booking reference',booking.confirmation_code)}
</table>
</div>
<div style="text-align:center;margin:0 0 22px;">
<a href="${escapeHtml(session.google_maps_url)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#078e48;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;">View venue in Google Maps</a>
</div>
<div style="margin:0 0 18px;padding:14px 16px;border-radius:12px;background:#fff8ea;border:1px solid #f2d18a;font-size:13px;line-height:1.55;color:#624717;">
<strong>Cancellation policy</strong><br>
Cancellations made less than 24 hours before the session are non-refundable.
</div>
<p style="margin:0 0 22px;font-size:12px;line-height:1.55;color:#6b7280;">Your guest waiver, Code of Conduct and privacy acknowledgement have been recorded with this booking.</p>
<p style="margin:0;font-size:15px;line-height:1.65;color:#374151;">Thank you for your booking.</p>
<p style="margin:10px 0 0;font-size:15px;line-height:1.5;color:#172033;"><strong>Brian Moore</strong><br>Chairperson<br>Clare Pickleball</p>`,
      });
      await sendWithConfiguredEmailTransport(base44,scope,{
        to:booking.email,
        subject:`${club.name} · Guest booking confirmed · ${dateLabel} ${session.start_time}`,
        textBody:guestText,
        htmlBody:guestHtml,
      });
      updates.guest_confirmation_sent_at=now;
    }catch(e){console.error('guest confirmation failed',e?.message||e)}
  }
  if(Object.keys(updates).length){
    return await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,updates);
  }
  return booking;
}
async function gatewayAccount(base44:any,tenantId:string,clubId:string,provider:string){
  try{
    const rows=await base44.asServiceRole.entities.PaymentGatewayAccount.filter({tenant_id:tenantId,club_id:clubId,provider},'-updated_date',20);
    const row=(rows||[]).find((x:any)=>x.status==='connected'&&x.is_default) || (rows||[]).find((x:any)=>x.status==='connected') || (rows||[]).find((x:any)=>x.is_default) || rows?.[0] || null;
    if(!row)return null;
    const account:ProviderAccount={
      provider,
      merchantAccountId:clean(row.merchant_account_id,120)||undefined,
      credentialSecretName:clean(row.credential_reference,120)||undefined,
      connectionMode:row.connection_mode||undefined,
    };
    return {row,account};
  }catch{return null}
}
async function createProviderCheckout(base44:any,session:any,booking:any,req:Request){
  const provider=clean(session.payment_provider||session.payment_method,30).toLowerCase();
  const gateway=await gatewayAccount(base44,session.tenant_id,session.club_id,provider);
  const ref=`RH-GUEST-${String(booking.id).slice(-18)}-${Date.now().toString(36)}`.slice(0,64);
  const origin=clean(req.headers.get('origin')||'',250);
  const safeOrigin=/^https:\/\/([a-z0-9-]+\.)?(rallyhub\.ie|base44\.app)$/i.test(origin)?origin:'https://rallyhub.ie';
  const redirectUrl=`${safeOrigin}/guest-session/${encodeURIComponent(session.token)}?booking=${encodeURIComponent(booking.id)}&payment=return`;
  const returnUrl='https://rallyhub.ie/api/apps/6a01dc00702b7dd2a2978c28/functions/paymentGatewayWebhook?provider=sumup';
  const brand=await clubBrand(base44,session.club_id);
  const checkout=await createCheckout({
    provider,account:gateway?.account||null,amount:Number(session.fee_amount),currency:session.currency||'EUR',
    reference:ref,description:`${brand?.name||'RallyHub club'} guest session ${session.session_date} ${session.start_time}`,
    redirectUrl,returnUrl,
  });
  return {id:checkout.checkoutId,url:checkout.checkoutUrl,reference:checkout.reference,status:checkout.providerStatus,provider,merchantAccountId:checkout.merchantAccountId};
}
async function retrieveProviderCheckout(base44:any,session:any,checkoutId:string){
  const provider=clean(session.payment_provider||session.payment_method,30).toLowerCase();
  const gateway=await gatewayAccount(base44,session.tenant_id,session.club_id,provider);
  const result=await retrievePayment(provider,checkoutId,gateway?.account||null);
  return {
    status:result.normalizedStatus==='paid'?'PAID':result.normalizedStatus==='failed'?'FAILED':result.normalizedStatus==='expired'?'EXPIRED':result.providerStatus,
    transaction_id:result.transactionId,transaction_code:result.transactionCode,
    transactions:result.transactionId?[{id:result.transactionId,transaction_code:result.transactionCode}]:[],
    provider:result.provider,merchant_account_id:result.merchantAccountId,_normalized:result.normalizedStatus,
  };
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'public_get',40);

    if(['admin_templates','admin_list','admin_create','admin_close','admin_send_invite','admin_mark_cash_paid','admin_verify_payment','admin_refund_payment','admin_resend_emails'].includes(action)){
      const user=await base44.auth.me();
      if(!user)return Response.json({error:'Unauthorized'},{status:401});
      if(user.role!=='admin')return Response.json({error:'Admin access required.'},{status:403});
      const tenantId=clean(user.active_tenant_id,100);
      const clubId=clean(user.active_club_id,100);
      if(!tenantId||!clubId)return Response.json({error:'Choose an active RallyHub club first.'},{status:400});
      const sumupGateway=await gatewayAccount(base44,tenantId,clubId,'sumup');
      let sumupConfigured=providerConfigured('sumup',sumupGateway?.account||null);
      let sumupMerchantName='';
      if(sumupConfigured){
        const verification=await verifyProviderConnection('sumup',sumupGateway?.account||null);
        sumupConfigured=verification.ok===true;
        sumupMerchantName=clean(verification.merchantName,160);
        if(sumupGateway?.row){
          const gatewayUpdates:any={
            status:verification.ok?'connected':'error',
            last_verified_at:new Date().toISOString(),
            supports_payments:true,supports_refunds:true,
          };
          if(verification.ok){
            if(verification.merchantAccountId)gatewayUpdates.merchant_account_id=verification.merchantAccountId;
            if(!sumupGateway.row.connected_at)gatewayUpdates.connected_at=new Date().toISOString();
          }
          await base44.asServiceRole.entities.PaymentGatewayAccount.update(sumupGateway.row.id,gatewayUpdates);
        }
      }

      if(action==='admin_templates'){
        return Response.json({success:true,templates:Object.values(TEMPLATES).map(templateOut),sumupConfigured,sumupMerchantName});
      }

      if(action==='admin_list'){
        const sessions=await base44.asServiceRole.entities.GuestSessionLink.filter({tenant_id:tenantId,club_id:clubId},'-session_date',100);
        const rows=[];
        for(const s of sessions||[]){
          const bookings=await base44.asServiceRole.entities.GuestSessionBooking.filter({session_link_id:s.id},'-registered_at',200);
          const bookingRows=[];
          for(const b of bookings||[]){
            const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'booking',purpose_id:b.id},'-created_date',10);
            const payment=payments?.[0]||null;
            const originalAmount=Number(payment?.amount||b.amount||0);
            const refundedAmount=Number(payment?.amount_refunded||0);
            bookingRows.push({
              id:b.id,fullName:b.full_name,email:b.email,mobile:b.mobile,bookingStatus:b.booking_status,
              paymentMethod:b.payment_method,paymentStatus:b.payment_status,amount:b.amount,
              refundedAmount,refundableAmount:Math.max(0,Math.round((originalAmount-refundedAmount)*100)/100),
              provider:payment?.provider||b.payment_method||'',providerTransactionId:payment?.provider_transaction_id||'',
              registeredAt:b.registered_at,paidAt:b.paid_at||'',confirmationCode:b.confirmation_code||'',
              hostMessage:hostText(s,b),
            });
          }
          rows.push({...safeSession(s),notificationEmail:s.notification_email||'',bookings:bookingRows});
        }
        return Response.json({success:true,sessions:rows,sumupConfigured});
      }

      if(action==='admin_create'){
        const t=TEMPLATES[clean(body.templateKey,80)];
        const date=clean(body.sessionDate,20);
        if(!t)return Response.json({error:'Choose a valid Clare Pickleball session slot.'},{status:400});
        if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return Response.json({error:'Choose the session date.'},{status:400});
        if(weekday(date)!==t.weekday)return Response.json({error:`That date is not a ${t.weekday}.`},{status:400});

        const v=VENUES[t.venueKey];
        const cap=Number(body.capacity||0);
        const capacity=Number.isFinite(cap)&&cap>0?Math.floor(cap):undefined;
        const feeInput=body.feeAmount===undefined||body.feeAmount===null||body.feeAmount===''?Number(t.fee):Number(body.feeAmount);
        const feeAmount=Math.round(feeInput*100)/100;
        if(!Number.isFinite(feeAmount)||feeAmount<=0)return Response.json({error:'Enter a valid session price greater than €0.'},{status:400});
        const now=new Date().toISOString();
        const row=await base44.asServiceRole.entities.GuestSessionLink.create({
          tenant_id:tenantId,club_id:clubId,token:token(),active:true,
          session_date:date,weekday:t.weekday,start_time:t.start,end_time:t.end,
          venue_key:t.venueKey,venue_name:v.name,venue_address:v.address,venue_eircode:v.eircode,google_maps_url:v.mapsUrl,
          session_label:t.label,capacity,fee_amount:feeAmount,currency:'EUR',payment_method:t.payment,
          notification_email:emailKey(body.notificationEmail||user.email||''),notification_name:clean(user.full_name||user.email||'',120),
          created_by_user_id:user.id,created_at:now,
        });
        return Response.json({success:true,session:safeSession(row),sumupConfigured});
      }

      if(action==='admin_close'){
        const sessionId=clean(body.sessionId,100);
        const row=(await base44.asServiceRole.entities.GuestSessionLink.filter({id:sessionId,tenant_id:tenantId,club_id:clubId}))?.[0];
        if(!row)return Response.json({error:'Guest session not found.'},{status:404});
        const updated=await base44.asServiceRole.entities.GuestSessionLink.update(row.id,{active:false,closed_at:new Date().toISOString()});
        return Response.json({success:true,session:safeSession(updated)});
      }

      if(action==='admin_send_invite'){
        const sessionId=clean(body.sessionId,100);
        const recipientEmail=emailKey(body.recipientEmail||'');
        const recipientName=clean(body.recipientName||'',120);
        if(!recipientEmail||!recipientEmail.includes('@'))return Response.json({error:'Enter the guest email address.'},{status:400});
        const session=(await base44.asServiceRole.entities.GuestSessionLink.filter({id:sessionId,tenant_id:tenantId,club_id:clubId}))?.[0];
        if(!session)return Response.json({error:'Guest session not found.'},{status:404});
        if(!session.active)return Response.json({error:'This booking link is closed.'},{status:409});
        const club=(await clubBrand(base44,clubId))||{
          name:'Clare Pickleball',
          logo_url:'https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/6e59058fc_ClarePBLogo.jpg',
          primary_colour:'#2667f2',secondary_colour:'#facc15',
        };
        const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId,clubId};
        const bookingUrl=`https://rallyhub.ie/book/${encodeURIComponent(session.token)}`;
        const dateLabel=formatDate(session.session_date);
        const timeLabel=`${session.start_time}${session.end_time?'–'+session.end_time:''}`;
        const amount=money(session.fee_amount,session.currency||'EUR');
        const hello=recipientName?firstName(recipientName):'there';
        const actionLabel=session.payment_method==='cash'?'Reserve your place':`Book & Pay ${amount}`;
        const textBody=`Hi ${hello},

You are invited to book a ${club.name} guest session.

Date: ${dateLabel}
Time: ${timeLabel}
Venue: ${session.venue_name}
Fee: ${amount}${session.payment_method==='cash'?' cash on arrival':' online payment'}

Complete your booking, waiver and payment here:
${bookingUrl}

Cancellations made less than 24 hours before the session are non-refundable.

Brian Moore
Chairperson, Clare Pickleball

Powered by RallyHub`;
        const htmlBody=emailShell({
          club,
          headline:recipientName?`Guest session invitation for ${firstName(recipientName)}`:'Guest session invitation',
          preheader:`${dateLabel} · ${timeLabel} · ${session.venue_name}`,
          content:`
<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">You are invited to book a Clare Pickleball guest session.</p>
<div style="margin:0 0 22px;padding:16px;border-radius:14px;background:#f7f9fc;border:1px solid #dfe5ee;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
${detailRow('Date',dateLabel)}
${detailRow('Time',timeLabel)}
${detailRow('Venue',session.venue_name)}
${detailRow('Address',`${session.venue_address}, ${session.venue_eircode}`)}
${detailRow('Fee',session.payment_method==='cash'?`${amount} cash on arrival`:`${amount} online`)}
</table>
</div>
<div style="text-align:center;margin:6px 0 24px;">
<a href="${escapeHtml(bookingUrl)}" style="display:inline-block;padding:14px 24px;border-radius:10px;background:#2667f2;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;">${escapeHtml(actionLabel)}</a>
</div>
<p style="margin:0 0 18px;text-align:center;font-size:12px;color:#6b7280;">The button opens your secure Clare Pickleball booking page.</p>
<div style="margin:0 0 20px;padding:14px 16px;border-radius:12px;background:#fff8ea;border:1px solid #f2d18a;font-size:13px;line-height:1.55;color:#624717;"><strong>Cancellation policy</strong><br>Cancellations made less than 24 hours before the session are non-refundable.</div>
<p style="margin:0;font-size:15px;line-height:1.5;color:#172033;"><strong>Brian Moore</strong><br>Chairperson<br>Clare Pickleball</p>`,
        });
        await sendWithConfiguredEmailTransport(base44,scope,{
          to:recipientEmail,
          subject:`${club.name} · Guest session · ${dateLabel} ${session.start_time}`,
          textBody,htmlBody,
        });
        return Response.json({success:true});
      }

      const bookingId=clean(body.bookingId,100);
      const booking=(await base44.asServiceRole.entities.GuestSessionBooking.filter({id:bookingId,tenant_id:tenantId,club_id:clubId}))?.[0];
      if(!booking)return Response.json({error:'Booking not found.'},{status:404});
      const session=(await base44.asServiceRole.entities.GuestSessionLink.filter({id:booking.session_link_id,tenant_id:tenantId,club_id:clubId}))?.[0];
      if(!session)return Response.json({error:'Session not found.'},{status:404});

      if(action==='admin_mark_cash_paid'){
        if(booking.payment_method!=='cash')return Response.json({error:'This is not a cash booking.'},{status:409});
        const now=new Date().toISOString();
        let updated=await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,{payment_status:'paid',booking_status:'confirmed',paid_at:now});
        const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'booking',purpose_id:booking.id},'-created_date',10);
        if(payments?.[0])await base44.asServiceRole.entities.PaymentRecord.update(payments[0].id,{payment_status:'paid',payment_date:now.slice(0,10)});
        updated=await sendConfirmations(base44,session,updated);
        return Response.json({success:true,booking:updated});
      }

      if(action==='admin_resend_emails'){
        if(booking.payment_status!=='paid' && booking.payment_status!=='partially_refunded' && booking.payment_status!=='refunded'){
          return Response.json({error:'Confirm the payment before resending booking emails.'},{status:409});
        }
        const updated=await sendConfirmations(base44,session,booking,true);
        return Response.json({success:true,booking:updated});
      }

      if(action==='admin_verify_payment'){
        if(booking.payment_method!=='sumup'||!booking.sumup_checkout_id)return Response.json({error:'No SumUp checkout is attached to this booking.'},{status:409});
        const checkout=await retrieveProviderCheckout(base44,session,booking.sumup_checkout_id);
        const status=String(checkout?.status||'PENDING').toUpperCase();
        if(status==='PAID'){
          const now=new Date().toISOString();
          let updated=await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,{payment_status:'paid',booking_status:'confirmed',paid_at:now});
          const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'booking',purpose_id:booking.id},'-created_date',10);
          if(payments?.[0])await base44.asServiceRole.entities.PaymentRecord.update(payments[0].id,{payment_status:'paid',payment_date:now.slice(0,10),provider:checkout?.provider||'sumup',provider_account_id:checkout?.merchant_account_id||'',provider_transaction_id:checkout?.transaction_id||checkout?.transactions?.[0]?.id||'',provider_payment_reference:checkout?.transaction_code||checkout?.transactions?.[0]?.transaction_code||'',provider_status:checkout?.status||'PAID',external_payment_reference:checkout?.transaction_code||checkout?.transactions?.[0]?.transaction_code||''});
          updated=await sendConfirmations(base44,session,updated);
          return Response.json({success:true,status:'paid',booking:updated});
        }
        if(status==='FAILED'||status==='EXPIRED'){
          const localStatus=status.toLowerCase();
          const updated=await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,{payment_status:localStatus,booking_status:'pending_payment'});
          const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'booking',purpose_id:booking.id},'-created_date',10);
          if(payments?.[0])await base44.asServiceRole.entities.PaymentRecord.update(payments[0].id,{payment_status:localStatus,provider_status:status});
          return Response.json({success:true,status:localStatus,booking:updated});
        }
        return Response.json({success:true,status:status.toLowerCase()});
      }

      if(action==='admin_refund_payment'){
        if(booking.payment_method==='cash')return Response.json({error:'Cash refunds are recorded manually; there is no online gateway transaction to refund.'},{status:409});
        if(body.confirmRefund!==true)return Response.json({error:'Refund confirmation is required.'},{status:400});
        const reason=clean(body.reason,500);
        if(!reason)return Response.json({error:'Enter a reason for the refund.'},{status:400});

        const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'booking',purpose_id:booking.id},'-created_date',10);
        let payment=payments?.[0]||null;
        if(!payment)return Response.json({error:'Payment record not found.'},{status:404});
        if(!['paid','partially_refunded','refund_failed'].includes(String(payment.payment_status||''))){
          return Response.json({error:'Only a completed online payment can be refunded.'},{status:409});
        }

        let transactionId=clean(payment.provider_transaction_id,120);
        let provider=clean(payment.provider||booking.payment_method,30).toLowerCase();
        let merchantAccountId=clean(payment.provider_account_id,120);
        if(!transactionId && booking.sumup_checkout_id){
          const checkout=await retrieveProviderCheckout(base44,session,booking.sumup_checkout_id);
          transactionId=clean(checkout?.transaction_id||checkout?.transactions?.[0]?.id,120);
          provider=clean(checkout?.provider||provider,30).toLowerCase();
          merchantAccountId=clean(checkout?.merchant_account_id||merchantAccountId,120);
          if(transactionId){
            payment=await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{
              provider,provider_account_id:merchantAccountId,provider_transaction_id:transactionId,
              provider_payment_reference:checkout?.transaction_code||'',provider_status:checkout?.status||'PAID',
            });
          }
        }
        if(!transactionId)return Response.json({error:'RallyHub could not identify the gateway transaction to refund. Verify the payment first.'},{status:409});

        const previous=await base44.asServiceRole.entities.PaymentRefund.filter({payment_record_id:payment.id},'-requested_at',100);
        const alreadyRefunded=(previous||[]).filter((x:any)=>x.status==='succeeded').reduce((sum:number,x:any)=>sum+Number(x.amount||0),0);
        const originalAmount=Number(payment.amount||booking.amount||0);
        const remaining=Math.max(0,Math.round((originalAmount-alreadyRefunded)*100)/100);
        if(remaining<=0)return Response.json({error:'This payment has already been fully refunded.'},{status:409});

        const requestedRaw=body.refundAmount===undefined||body.refundAmount===null||body.refundAmount===''?remaining:Number(body.refundAmount);
        const refundAmount=Math.round(requestedRaw*100)/100;
        if(!Number.isFinite(refundAmount)||refundAmount<=0||refundAmount>remaining){
          return Response.json({error:`Refund amount must be between €0.01 and €${remaining.toFixed(2)}.`},{status:400});
        }

        const gateway=await gatewayAccount(base44,tenantId,clubId,provider);
        const now=new Date().toISOString();
        let refundRow=await base44.asServiceRole.entities.PaymentRefund.create({
          tenant_id:tenantId,club_id:clubId,payment_record_id:payment.id,person_id:booking.person_id||'',
          purpose_type:'booking',purpose_id:booking.id,provider,
          provider_account_id:merchantAccountId,provider_transaction_id:transactionId,
          amount:refundAmount,currency:payment.currency||booking.currency||'EUR',status:'processing',
          reason,policy_override:body.policyOverride===true,requested_by_user_id:user.id,requested_at:now,
          source_system:'rallyhub_guest_session',
        });

        try{
          const fullOriginalRefund=alreadyRefunded<=0.001 && refundAmount>=originalAmount-0.001;
          const result=await refundPayment({
            provider,account:gateway?.account||null,transactionId,
            amount:fullOriginalRefund?undefined:refundAmount,currency:payment.currency||'EUR',
          });
          const completedAt=new Date().toISOString();
          refundRow=await base44.asServiceRole.entities.PaymentRefund.update(refundRow.id,{
            status:'succeeded',provider_refund_id:result.refundId||'',provider_status:result.providerStatus||'REFUNDED',completed_at:completedAt,
          });
          const totalRefunded=Math.round((alreadyRefunded+refundAmount)*100)/100;
          const fullyRefunded=totalRefunded>=originalAmount-0.001;
          await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{
            payment_status:fullyRefunded?'refunded':'partially_refunded',amount_refunded:totalRefunded,last_refund_at:completedAt,
            provider_status:result.providerStatus||'REFUNDED',
          });
          const updatedBooking=await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,{
            payment_status:fullyRefunded?'refunded':'partially_refunded',
          });

          if(booking.email){
            try{
              const club=(await clubBrand(base44,session.club_id))||{name:'Clare Pickleball',logo_url:'',primary_colour:'#2667f2',secondary_colour:'#facc15'};
              const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:session.tenant_id,clubId:session.club_id};
              const refundLabel=money(refundAmount,payment.currency||booking.currency||'EUR');
              const guestFirst=firstName(booking.full_name);
              const refundText=`Hi ${guestFirst},

A refund of ${refundLabel} has been issued for your ${club.name} guest booking.

Session: ${formatDate(session.session_date)} · ${session.start_time}${session.end_time?'–'+session.end_time:''}
Venue: ${session.venue_name}
Booking reference: ${booking.confirmation_code}
Reason: ${reason}

The refund is being returned to the original payment method.

Brian Moore
Chairperson, Clare Pickleball

Powered by RallyHub`;
              const refundHtml=emailShell({
                club,
                headline:`Refund issued, ${guestFirst}`,
                preheader:`${refundLabel} refund · ${session.venue_name}`,
                content:`
<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">A refund of <strong>${escapeHtml(refundLabel)}</strong> has been issued for your guest booking.</p>
<div style="margin:0 0 20px;padding:16px;border-radius:14px;background:#f7f9fc;border:1px solid #dfe5ee;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
${detailRow('Session',`${formatDate(session.session_date)} · ${session.start_time}${session.end_time?'–'+session.end_time:''}`)}
${detailRow('Venue',session.venue_name)}
${detailRow('Refund',refundLabel)}
${detailRow('Booking reference',booking.confirmation_code)}
${detailRow('Reason',reason)}
</table>
</div>
<p style="margin:0 0 22px;font-size:13px;line-height:1.55;color:#6b7280;">The refund is being returned to the original payment method.</p>
<p style="margin:0;font-size:15px;line-height:1.5;color:#172033;"><strong>Brian Moore</strong><br>Chairperson<br>Clare Pickleball</p>`,
              });
              await sendWithConfiguredEmailTransport(base44,scope,{
                to:booking.email,
                subject:`${club.name} · Refund issued · ${refundLabel}`,
                textBody:refundText,
                htmlBody:refundHtml,
              });
            }catch(e){console.error('refund confirmation email failed',e?.message||e)}
          }

          return Response.json({
            success:true,refundId:refundRow.id,refundAmount,totalRefunded,
            refundableAmount:Math.max(0,Math.round((originalAmount-totalRefunded)*100)/100),
            paymentStatus:fullyRefunded?'refunded':'partially_refunded',booking:updatedBooking,
          });
        }catch(e){
          await base44.asServiceRole.entities.PaymentRefund.update(refundRow.id,{
            status:'failed',failure_message:clean(e?.message||'Refund failed',500),completed_at:new Date().toISOString(),
          });
          await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{payment_status:'refund_failed'});
          return Response.json({error:e?.message||'The payment gateway could not issue the refund.'},{status:502});
        }
      }
    }

    const tokenValue=clean(body.token,80);
    if(!validToken(tokenValue))return Response.json({error:'Guest booking link is invalid or unavailable.'},{status:404});
    const session=(await base44.asServiceRole.entities.GuestSessionLink.filter({token:tokenValue,active:true},'-created_at',5))?.[0];
    if(!session)return Response.json({error:'Guest booking link is closed or unavailable.'},{status:404});

    const bookings=await base44.asServiceRole.entities.GuestSessionBooking.filter({session_link_id:session.id},'-registered_at',250);
    const active=(bookings||[]).filter((b:any)=>b.booking_status!=='cancelled');
    const cap=Number(session.capacity||0);
    const remaining=cap>0?Math.max(0,cap-active.length):null;

    if(action==='public_get'){
      return Response.json({success:true,session:safeSession(session),clubBrand:await clubBrand(base44,session.club_id),legal:await legal(base44,session),spotsRemaining:remaining});
    }

    if(action==='public_status'){
      const bookingId=clean(body.bookingId,100);
      let booking=(bookings||[]).find((b:any)=>b.id===bookingId);
      if(!booking)return Response.json({error:'Booking not found.'},{status:404});

      if(booking.payment_method==='sumup'&&booking.sumup_checkout_id&&booking.payment_status!=='paid'){
        try{
          const checkout=await retrieveProviderCheckout(base44,session,booking.sumup_checkout_id);
          const status=String(checkout?.status||'PENDING').toUpperCase();
          if(status==='PAID'){
            const now=new Date().toISOString();
            booking=await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,{payment_status:'paid',booking_status:'confirmed',paid_at:now});
            const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'booking',purpose_id:booking.id},'-created_date',10);
            if(payments?.[0])await base44.asServiceRole.entities.PaymentRecord.update(payments[0].id,{payment_status:'paid',payment_date:now.slice(0,10),provider:checkout?.provider||'sumup',provider_account_id:checkout?.merchant_account_id||'',provider_transaction_id:checkout?.transaction_id||checkout?.transactions?.[0]?.id||'',provider_payment_reference:checkout?.transaction_code||checkout?.transactions?.[0]?.transaction_code||'',provider_status:checkout?.status||'PAID',external_payment_reference:checkout?.transaction_code||checkout?.transactions?.[0]?.transaction_code||''});
          }else if(status==='FAILED'||status==='EXPIRED'){
            const localStatus=status.toLowerCase();
            booking=await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,{payment_status:localStatus,booking_status:'pending_payment'});
            const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'booking',purpose_id:booking.id},'-created_date',10);
            if(payments?.[0])await base44.asServiceRole.entities.PaymentRecord.update(payments[0].id,{payment_status:localStatus,provider_status:status});
          }
        }catch(e){console.error('sumup status check failed',e?.message||e)}
      }

      if(booking.booking_status==='confirmed'||booking.booking_status==='cash_due'){
        booking=await sendConfirmations(base44,session,booking);
      }

      return Response.json({success:true,booking:{
        id:booking.id,fullName:booking.full_name,bookingStatus:booking.booking_status,paymentStatus:booking.payment_status,
        paymentMethod:booking.payment_method,confirmationCode:booking.confirmation_code,
      },session:safeSession(session)});
    }

    if(action!=='public_submit')return Response.json({error:'Invalid guest booking action.'},{status:400});
    if(remaining!==null&&remaining<=0)return Response.json({error:'This guest session is full.'},{status:409});
    const legalBundle=await legal(base44,session);

    const fullName=clean(body.fullName,120);
    const email=emailKey(body.email);
    const mobile=clean(body.mobile,50);
    const mobileK=mobileKey(mobile);
    const emergencyName=clean(body.emergencyContactName,120);
    const emergencyMobile=clean(body.emergencyContactMobile,50);
    const medicalNote=clean(body.medicalNote,1200);
    const photo=clean(body.photoVideoConsent,10).toLowerCase();

    if(!fullName||fullName.split(' ').length<2)return Response.json({error:'Please enter your full name.'},{status:400});
    if(!email||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return Response.json({error:'Please enter a valid email address.'},{status:400});
    if(mobileK.length<8)return Response.json({error:'Please enter a valid mobile number.'},{status:400});
    if(!emergencyName||mobileKey(emergencyMobile).length<8)return Response.json({error:'Please provide an emergency contact name and mobile number.'},{status:400});
    if(Number(legalBundle.minimumAge||0)>0&&body.ageConfirmed!==true)return Response.json({error:`Guest sessions are currently for participants aged ${legalBundle.minimumAge} or over.`},{status:400});
    if(body.waiverAccepted!==true||body.codeAccepted!==true||body.privacyAcknowledged!==true||body.cancellationAccepted!==true){
      return Response.json({error:'Please accept the waiver, Code of Conduct, privacy notice and cancellation policy.'},{status:400});
    }
    if(!['yes','no'].includes(photo))return Response.json({error:'Please choose Yes or No for photo/video consent.'},{status:400});

    const duplicate=(bookings||[]).find((b:any)=>b.email_key===email&&b.booking_status!=='cancelled');
    if(duplicate){
      let paymentUrl=duplicate.sumup_checkout_url||'';
      let paymentStatus=duplicate.payment_status;
      if(session.payment_method==='sumup' && duplicate.booking_status!=='confirmed' && duplicate.sumup_checkout_id && !['failed','expired'].includes(String(paymentStatus||'').toLowerCase())){
        try{
          const existingCheckout=await retrieveProviderCheckout(base44,session,duplicate.sumup_checkout_id);
          const remoteStatus=String(existingCheckout?.status||'PENDING').toUpperCase();
          if(remoteStatus==='PAID'){
            const now=new Date().toISOString();
            let updated=await base44.asServiceRole.entities.GuestSessionBooking.update(duplicate.id,{payment_status:'paid',booking_status:'confirmed',paid_at:now});
            const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'booking',purpose_id:duplicate.id},'-created_date',10);
            if(payments?.[0])await base44.asServiceRole.entities.PaymentRecord.update(payments[0].id,{payment_status:'paid',payment_date:now.slice(0,10),provider:existingCheckout?.provider||'sumup',provider_account_id:existingCheckout?.merchant_account_id||'',provider_transaction_id:existingCheckout?.transaction_id||existingCheckout?.transactions?.[0]?.id||'',provider_payment_reference:existingCheckout?.transaction_code||existingCheckout?.transactions?.[0]?.transaction_code||'',provider_status:'PAID'});
            updated=await sendConfirmations(base44,session,updated);
            return Response.json({success:true,alreadyBooked:true,bookingId:duplicate.id,paymentUrl:'',session:safeSession(session),bookingStatus:'confirmed',paymentStatus:'paid',message:'Your payment is already confirmed for this session.'});
          }
          if(remoteStatus==='FAILED'||remoteStatus==='EXPIRED'){
            paymentStatus=remoteStatus.toLowerCase();
            await base44.asServiceRole.entities.GuestSessionBooking.update(duplicate.id,{payment_status});
            const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'booking',purpose_id:duplicate.id},'-created_date',10);
            if(payments?.[0])await base44.asServiceRole.entities.PaymentRecord.update(payments[0].id,{payment_status:paymentStatus,provider_status:remoteStatus});
          }
        }catch(e){console.error('SumUp duplicate status check failed',e?.message||e)}
      }
      if(session.payment_method==='sumup' && duplicate.booking_status!=='confirmed' && (!paymentUrl || ['failed','expired'].includes(String(paymentStatus||'').toLowerCase()))){
        try{
          const checkout=await createProviderCheckout(base44,session,duplicate,req);
          await base44.asServiceRole.entities.GuestSessionBooking.update(duplicate.id,{
            sumup_checkout_id:checkout.id,sumup_checkout_url:checkout.url,sumup_checkout_reference:checkout.reference,
            payment_status:'pending',booking_status:'pending_payment',
          });
          const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'booking',purpose_id:duplicate.id},'-created_date',10);
          if(payments?.[0])await base44.asServiceRole.entities.PaymentRecord.update(payments[0].id,{
            payment_status:'pending',provider:checkout.provider||'sumup',provider_account_id:checkout.merchantAccountId||'',provider_checkout_id:checkout.id,provider_checkout_url:checkout.url,provider_payment_reference:checkout.reference,provider_status:checkout.status||'PENDING',sumup_checkout_id:checkout.id,sumup_payment_link:checkout.url,external_payment_reference:checkout.reference,
          });
          paymentUrl=checkout.url;paymentStatus='pending';
        }catch(e){console.error('SumUp retry checkout failed',e?.message||e)}
      }
      return Response.json({
        success:true,alreadyBooked:true,bookingId:duplicate.id,paymentUrl,
        session:safeSession(session),bookingStatus:duplicate.booking_status,paymentStatus,
        message:duplicate.booking_status==='confirmed'?'You are already confirmed for this session.':'You already started this booking. Complete payment to confirm your place.',
      });
    }

    let person:any=null;
    const byEmail=await base44.asServiceRole.entities.Person.filter({tenant_id:session.tenant_id,primary_email:email},'-updated_date',10);
    person=byEmail?.[0]||null;
    if(!person&&mobileK){
      const byMobile=await base44.asServiceRole.entities.Person.filter({tenant_id:session.tenant_id,mobile},'-updated_date',10);
      person=byMobile?.[0]||null;
    }
    const personData:any={
      full_name:fullName,primary_email:email,mobile,
      emergency_contact_name:emergencyName,emergency_mobile:emergencyMobile,
      source_system:'rallyhub_guest_session',last_synced_at:new Date().toISOString(),profile_visibility:'private',
    };
    if(person) person=await base44.asServiceRole.entities.Person.update(person.id,personData);
    else person=await base44.asServiceRole.entities.Person.create({tenant_id:session.tenant_id,...personData});

    const now=new Date().toISOString();
    const initialStatus=session.payment_method==='cash'?'cash_due':'pending_payment';
    const initialPayment=session.payment_method==='cash'?'cash_due':'pending';
    let booking=await base44.asServiceRole.entities.GuestSessionBooking.create({
      tenant_id:session.tenant_id,club_id:session.club_id,session_link_id:session.id,person_id:person.id,
      full_name:fullName,email,email_key:email,mobile,mobile_key:mobileK,
      emergency_contact_name:emergencyName,emergency_contact_mobile:emergencyMobile,medical_note:medicalNote,
      waiver_version:legalBundle.waiverVersion,waiver_accepted:true,
      code_of_conduct_version:legalBundle.codeVersion,code_of_conduct_accepted:true,
      privacy_notice_version:PRIVACY_VERSION,privacy_acknowledged:true,
      cancellation_policy_version:CANCELLATION_VERSION,cancellation_policy_accepted:true,
      photo_video_consent:photo,booking_status:initialStatus,payment_method:session.payment_method,payment_status:initialPayment,
      amount:Number(session.fee_amount||0),currency:session.currency||'EUR',registered_at:now,
      confirmation_code:confirmation(),source_system:'rallyhub_guest_session',
    });

    for(const c of [
      {consent_type:'adult_age_confirmation',status:'accepted',response_text:'Confirmed 18 or over',consent_version:ADULT_AGE_VERSION},
      {consent_type:'guest_session_waiver',status:'accepted',response_text:'Accepted',consent_version:legalBundle.waiverVersion},
      {consent_type:'guest_session_code_of_conduct',status:'accepted',response_text:'Accepted',consent_version:legalBundle.codeVersion},
      {consent_type:'guest_session_privacy_notice',status:'accepted',response_text:'Acknowledged',consent_version:PRIVACY_VERSION},
      {consent_type:'guest_session_cancellation_policy',status:'accepted',response_text:'Accepted',consent_version:CANCELLATION_VERSION},
      {consent_type:'guest_session_photo_video',status:photo==='yes'?'accepted':'declined',response_text:photo==='yes'?'Yes':'No',consent_version:PRIVACY_VERSION},
    ]){
      try{
        await base44.asServiceRole.entities.ConsentRecord.create({
          tenant_id:session.tenant_id,club_id:session.club_id,person_id:person.id,...c,
          recorded_at:now,source_system:'rallyhub_guest_session',source_row:booking.id,
          notes:`${session.venue_name} · ${session.session_date} · ${session.start_time}`,
        });
      }catch(e){console.error('consent record failed',e?.message||e)}
    }

    let paymentRecord=await base44.asServiceRole.entities.PaymentRecord.create({
      tenant_id:session.tenant_id,club_id:session.club_id,person_id:person.id,
      purpose_type:'booking',purpose_id:booking.id,payment_type:'guest_session',
      amount:Number(session.fee_amount||0),currency:session.currency||'EUR',
      payment_method:session.payment_method,payment_status:'pending',provider:session.payment_method,amount_refunded:0,
      source_system:'rallyhub_guest_session',source_row:booking.id,
      notes:`${session.venue_name} · ${session.session_date} · ${session.start_time}`,
    });

    if(session.payment_method==='cash'){
      booking=await sendConfirmations(base44,session,booking);
      return Response.json({
        success:true,alreadyBooked:false,bookingId:booking.id,session:safeSession(session),
        bookingStatus:'cash_due',paymentStatus:'cash_due',paymentUrl:'',
        message:`Your place is reserved. Please bring €${Number(session.fee_amount||0).toFixed(2)} cash on arrival.`,
      });
    }

    try{
      const checkout=await createProviderCheckout(base44,session,booking,req);
      booking=await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,{
        sumup_checkout_id:checkout.id,sumup_checkout_url:checkout.url,sumup_checkout_reference:checkout.reference,
      });
      await base44.asServiceRole.entities.PaymentRecord.update(paymentRecord.id,{
        provider:checkout.provider||'sumup',provider_account_id:checkout.merchantAccountId||'',provider_checkout_id:checkout.id,provider_checkout_url:checkout.url,provider_payment_reference:checkout.reference,provider_status:checkout.status||'PENDING',sumup_checkout_id:checkout.id,sumup_payment_link:checkout.url,external_payment_reference:checkout.reference,
      });
      return Response.json({
        success:true,alreadyBooked:false,bookingId:booking.id,session:safeSession(session),
        bookingStatus:'pending_payment',paymentStatus:'pending',paymentUrl:checkout.url,
        message:`Your details are saved. Complete the €${Number(session.fee_amount||0).toFixed(2)} SumUp payment to confirm your place.`,
      });
    }catch(e){
      console.error('SumUp create failed',e?.message||e);
      return Response.json({
        error:e?.message||'Your details were saved, but RallyHub could not open SumUp payment. Please contact Clare Pickleball.',
        bookingId:booking.id,
      },{status:503});
    }
  }catch(error){
    console.error('guestSessionBooking failed',error?.message||error);
    return Response.json({error:error?.message||'Unable to process the guest booking right now.'},{status:500});
  }
});