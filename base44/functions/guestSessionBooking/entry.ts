import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { createCheckout, retrievePayment, refundPayment, providerConfigured, type ProviderAccount } from './payments.ts';

const WAIVER_VERSION='clare-guest-session-waiver-v1-2026-09';
const CODE_VERSION='clare-guest-session-code-v1-2026-09';
const PRIVACY_VERSION='clare-guest-session-privacy-v1-2026-09';
const CANCELLATION_VERSION='clare-guest-session-cancellation-v1-2026-09';

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
function legal(){
  return {
    waiverVersion:WAIVER_VERSION,
    waiverTitle:'Clare Pickleball Guest Session Declaration & Liability Waiver',
    waiverText:`I understand that taking part in pickleball and related club activities involves physical activity and carries inherent risks, including the risk of injury.

I confirm that I am voluntarily participating and that I am responsible for deciding that I am fit to take part. I will not participate if I am unwell, injured, or aware of a medical or health condition that makes participation unsafe.

I accept the normal risks associated with using sporting equipment and facilities and with taking part in pickleball. I agree to follow the safety instructions, rules of play and reasonable directions of Clare Pickleball, its session leaders and the venue.

I release Clare Pickleball, its officers, volunteers, coaches and session leaders, and the venue/facility providers from claims arising from the ordinary risks of my participation, except where liability cannot lawfully be excluded.

If emergency assistance is reasonably required, I consent to the organisers seeking appropriate medical help on my behalf.`,
    codeVersion:CODE_VERSION,
    codeTitle:'Clare Pickleball Guest Code of Conduct',
    codeText:`Please play in the friendly and respectful spirit of Clare Pickleball.

• Treat players, volunteers and venue staff with respect.
• Follow court etiquette, safety instructions and the rules of play.
• Stop immediately when “Ball on court” is called.
• Do not use aggressive, intimidating, abusive or discriminatory language or behaviour.
• Respect line calls, court rotation and other players’ equipment.
• Wear suitable footwear and do not play where a court or surrounding area is unsafe.
• Guest sessions are for players with pickleball experience. Beginners should use the club’s beginner programme rather than a guest walk-in session.`,
    privacyVersion:PRIVACY_VERSION,
    privacyText:'Your details are used to administer this guest booking, payment, emergency/safety arrangements and necessary session communications. A guest booking does not make you a Clare Pickleball member. Your booking history may later be linked to the same RallyHub person record if you join the club, so RallyHub does not create duplicate identities.',
    cancellationVersion:CANCELLATION_VERSION,
    cancellationText:'Cancellations made less than 24 hours before the session are non-refundable.',
  };
}
function formatDate(d:string){
  try{return new Intl.DateTimeFormat('en-IE',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Dublin'}).format(new Date(`${d}T12:00:00Z`))}catch{return d}
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
async function sendConfirmations(base44:any,session:any,booking:any){
  if(booking.notification_sent_at && booking.guest_confirmation_sent_at) return booking;
  const summary=hostText(session,booking);
  const now=new Date().toISOString();
  const updates:any={};

  if(!booking.notification_sent_at && session.notification_email){
    try{
      await base44.asServiceRole.integrations.Core.SendEmail({
        to:session.notification_email,
        from_name:'RallyHub · Clare Pickleball',
        subject:`[Guest Booking] ${booking.full_name} · ${session.venue_name} · ${session.session_date} ${session.start_time}`,
        body:`A guest booking is confirmed in RallyHub.

${summary}

Guest email: ${booking.email}

Copy/paste the block above into WhatsApp for the session host, or simply forward this email.

RallyHub Guest Bookings`,
      });
      updates.notification_sent_at=now;
    }catch(e){console.error('guest admin notification failed',e?.message||e)}
  }

  if(!booking.guest_confirmation_sent_at && booking.email && booking.payment_method==='sumup' && booking.payment_status==='paid'){
    try{
      const paymentLine=booking.payment_method==='cash'
        ? `Payment: €${Number(booking.amount).toFixed(2)} cash on arrival.`
        : `Payment: €${Number(booking.amount).toFixed(2)} paid online.`;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to:booking.email,
        from_name:'Clare Pickleball via RallyHub',
        subject:`Clare Pickleball guest booking confirmed · ${session.session_date} ${session.start_time}`,
        body:`Hi ${booking.full_name},

Your Clare Pickleball guest session is confirmed.

${formatDate(session.session_date)}
${session.start_time}${session.end_time?'–'+session.end_time:''}
${session.venue_name}
${session.venue_address}, ${session.venue_eircode}
Map: ${session.google_maps_url}

${paymentLine}
Booking reference: ${booking.confirmation_code}

Cancellation policy: cancellations made less than 24 hours before the session are non-refundable.

You have accepted the guest session waiver, Code of Conduct and privacy notice.

See you on court,
Clare Pickleball`,
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
    const row=(rows||[]).find((x:any)=>x.status==='connected'&&x.is_default) || (rows||[]).find((x:any)=>x.status==='connected') || null;
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
  const checkout=await createCheckout({
    provider,account:gateway?.account||null,amount:Number(session.fee_amount),currency:session.currency||'EUR',
    reference:ref,description:`Clare Pickleball guest session ${session.session_date} ${session.start_time}`,
    redirectUrl,
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

    if(['admin_templates','admin_list','admin_create','admin_close','admin_mark_cash_paid','admin_verify_payment','admin_refund_payment'].includes(action)){
      const user=await base44.auth.me();
      if(!user)return Response.json({error:'Unauthorized'},{status:401});
      if(user.role!=='admin')return Response.json({error:'Admin access required.'},{status:403});
      const tenantId=clean(user.active_tenant_id,100);
      const clubId=clean(user.active_club_id,100);
      if(!tenantId||!clubId)return Response.json({error:'Choose an active RallyHub club first.'},{status:400});
      const sumupConfigured=providerConfigured('sumup');

      if(action==='admin_templates'){
        return Response.json({success:true,templates:Object.values(TEMPLATES).map(templateOut),sumupConfigured});
      }

      if(action==='admin_list'){
        const sessions=await base44.asServiceRole.entities.GuestSessionLink.filter({tenant_id:tenantId,club_id:clubId},'-session_date',100);
        const rows=[];
        for(const s of sessions||[]){
          const bookings=await base44.asServiceRole.entities.GuestSessionBooking.filter({session_link_id:s.id},'-registered_at',200);
          rows.push({...safeSession(s),notificationEmail:s.notification_email||'',bookings:(bookings||[]).map((b:any)=>({
            id:b.id,fullName:b.full_name,email:b.email,mobile:b.mobile,bookingStatus:b.booking_status,
            paymentMethod:b.payment_method,paymentStatus:b.payment_status,amount:b.amount,
            registeredAt:b.registered_at,paidAt:b.paid_at||'',confirmationCode:b.confirmation_code||'',
            hostMessage:hostText(s,b),
          }))});
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
        const now=new Date().toISOString();
        const row=await base44.asServiceRole.entities.GuestSessionLink.create({
          tenant_id:tenantId,club_id:clubId,token:token(),active:true,
          session_date:date,weekday:t.weekday,start_time:t.start,end_time:t.end,
          venue_key:t.venueKey,venue_name:v.name,venue_address:v.address,venue_eircode:v.eircode,google_maps_url:v.mapsUrl,
          session_label:t.label,capacity,fee_amount:t.fee,currency:'EUR',payment_method:t.payment,
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
          const result=await refundPayment({
            provider,account:gateway?.account||null,transactionId,amount:refundAmount,currency:payment.currency||'EUR',
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
              await base44.asServiceRole.integrations.Core.SendEmail({
                to:booking.email,from_name:'Clare Pickleball via RallyHub',
                subject:`Refund issued · Clare Pickleball · ${session.session_date} ${session.start_time}`,
                body:`Hi ${booking.full_name},

A refund of €${refundAmount.toFixed(2)} has been issued for your Clare Pickleball guest booking.

Session: ${formatDate(session.session_date)} · ${session.start_time}
Venue: ${session.venue_name}
Booking reference: ${booking.confirmation_code}
Reason: ${reason}

The refund is being returned through the same payment method used for the original payment.

Clare Pickleball`,
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
      return Response.json({success:true,session:safeSession(session),legal:legal(),spotsRemaining:remaining});
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
            booking=await base44.asServiceRole.entities.GuestSessionBooking.update(booking.id,{payment_status:status.toLowerCase(),booking_status:'pending_payment'});
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
    if(body.waiverAccepted!==true||body.codeAccepted!==true||body.privacyAcknowledged!==true||body.cancellationAccepted!==true){
      return Response.json({error:'Please accept the waiver, Code of Conduct, privacy notice and cancellation policy.'},{status:400});
    }
    if(!['yes','no'].includes(photo))return Response.json({error:'Please choose Yes or No for photo/video consent.'},{status:400});

    const duplicate=(bookings||[]).find((b:any)=>b.email_key===email&&b.booking_status!=='cancelled');
    if(duplicate){
      let paymentUrl=duplicate.sumup_checkout_url||'';
      let paymentStatus=duplicate.payment_status;
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
      waiver_version:WAIVER_VERSION,waiver_accepted:true,
      code_of_conduct_version:CODE_VERSION,code_of_conduct_accepted:true,
      privacy_notice_version:PRIVACY_VERSION,privacy_acknowledged:true,
      cancellation_policy_version:CANCELLATION_VERSION,cancellation_policy_accepted:true,
      photo_video_consent:photo,booking_status:initialStatus,payment_method:session.payment_method,payment_status:initialPayment,
      amount:Number(session.fee_amount||0),currency:session.currency||'EUR',registered_at:now,
      confirmation_code:confirmation(),source_system:'rallyhub_guest_session',
    });

    for(const c of [
      {consent_type:'guest_session_waiver',status:'accepted',response_text:'Accepted',consent_version:WAIVER_VERSION},
      {consent_type:'guest_session_code_of_conduct',status:'accepted',response_text:'Accepted',consent_version:CODE_VERSION},
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