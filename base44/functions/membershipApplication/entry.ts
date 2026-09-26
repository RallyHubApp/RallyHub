import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { createCheckout, retrievePayment, providerConfigured, type ProviderAccount } from './payments.ts';
import { sendWithConfiguredEmailTransport } from './emailRouter.ts';

function clean(v:any,max=500){return String(v??'').trim().replace(/\s+/g,' ').slice(0,max)}
function raw(v:any,max=20000){return String(v??'').trim().slice(0,max)}
function emailKey(v:any){return clean(v,240).toLowerCase()}
function phoneDigits(v:any){return clean(v,80).replace(/\D/g,'')}
function publicToken(){return `ma_${crypto.randomUUID().replaceAll('-','')}`}
function validPublicToken(v:any){return /^ma_[0-9a-f]{32}$/i.test(String(v||''))}
function confirmation(){return `M${crypto.randomUUID().replaceAll('-','').slice(0,8).toUpperCase()}`}
function firstName(v:any){return clean(v,160).split(/\s+/).filter(Boolean)[0]||'there'}
function escapeHtml(v:any){return String(v??'').replace(/[&<>"']/g,(ch)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } as any)[ch])}
function money(v:any,currency='EUR'){try{return new Intl.NumberFormat('en-IE',{style:'currency',currency}).format(Number(v||0))}catch{return `${currency} ${Number(v||0).toFixed(2)}`}}
function dateLabel(v:any){try{return new Intl.DateTimeFormat('en-IE',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${v}T12:00:00Z`))}catch{return String(v||'')}}
async function hashText(v:string){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return Array.from(new Uint8Array(buf)).map(x=>x.toString(16).padStart(2,'0')).join('')}

async function first(base44:any,entity:string,filter:any,sort='-updated_date'){
  const rows=await base44.asServiceRole.entities[entity].filter(filter,sort,20);
  return rows?.[0]||null;
}
async function clubBrand(base44:any,clubId:string,tenantId=''){
  const club=await first(base44,'Club',{id:clubId,...(tenantId?{tenant_id:tenantId}:{})});
  if(!club)return null;
  return {id:club.id,name:club.name||'',slug:club.slug||'',logo_url:club.logo_url||'',primary_colour:club.primary_colour||'#2563eb',secondary_colour:club.secondary_colour||'#facc15'};
}
async function activeConfig(base44:any,publicSlug:string){
  const rows=await base44.asServiceRole.entities.MembershipApplicationConfig.filter({public_slug:publicSlug,status:'active'},'-updated_date',20);
  const now=Date.now();
  return (rows||[]).find((c:any)=>{
    const starts=!c.active_from||Date.parse(`${c.active_from}T00:00:00Z`)<=now;
    const ends=!c.active_until||Date.parse(`${c.active_until}T23:59:59Z`)>=now;
    return starts&&ends;
  })||null;
}
async function configForClub(base44:any,tenantId:string,clubId:string){
  const rows=await base44.asServiceRole.entities.MembershipApplicationConfig.filter({tenant_id:tenantId,club_id:clubId},'-updated_date',20);
  return (rows||[]).find((c:any)=>c.status==='active')||(rows||[])[0]||null;
}
async function activeAdultPolicy(base44:any,tenantId:string,clubId:string){
  const rows=await base44.asServiceRole.entities.ClubPolicy.filter({tenant_id:tenantId,club_id:clubId,policy_type:'adult_participation',status:'active'},'-effective_from',20);
  return rows?.[0]||null;
}
async function legalDocs(base44:any,config:any){
  const map:any={privacy:config.privacy_document_id,waiver:config.waiver_document_id,code:config.code_document_id,health:config.health_document_id,photo:config.photo_document_id,terms:config.terms_document_id};
  const out:any={};
  for(const [key,id] of Object.entries(map)){
    if(!id)continue;
    const doc=await first(base44,'ClubLegalDocument',{id,tenant_id:config.tenant_id,club_id:config.club_id});
    if(doc)out[key]={
      id:doc.id,type:doc.document_type,title:doc.title,version:doc.version,bodyText:doc.body_text,
      consentLabel:doc.consent_label||'I agree',required:doc.required_consent!==false
    };
  }
  return out;
}
function safeConfig(config:any,club:any,docs:any,adultPolicy:any=null){
  return {
    id:config.id,publicSlug:config.public_slug,title:config.title||`${club?.name||'Club'} Membership`,
    seasonLabel:config.season_label,membershipFee:Number(config.membership_fee||0),currency:config.currency||'EUR',
    allowNew:config.allow_new!==false,allowRenewal:config.allow_renewal!==false,paymentRequired:config.payment_required!==false,
    minimumAge:Number(adultPolicy?.minimum_age||0)||null,
    club,legal:docs
  };
}
async function gatewayAccount(base44:any,config:any){
  let row=null;
  if(config.payment_gateway_account_id){
    row=await first(base44,'PaymentGatewayAccount',{id:config.payment_gateway_account_id,tenant_id:config.tenant_id,club_id:config.club_id});
  }
  if(!row){
    const rows=await base44.asServiceRole.entities.PaymentGatewayAccount.filter({tenant_id:config.tenant_id,club_id:config.club_id},'-updated_date',50);
    row=(rows||[]).find((x:any)=>x.status==='connected'&&x.is_default)||(rows||[]).find((x:any)=>x.status==='connected')||(rows||[]).find((x:any)=>x.is_default)||(rows||[])[0]||null;
  }
  if(!row)return null;
  const account:ProviderAccount={provider:row.provider,merchantAccountId:row.merchant_account_id||undefined,credentialSecretName:row.credential_reference||undefined,connectionMode:row.connection_mode||undefined};
  return {row,account};
}
async function findPersonByIdentity(base44:any,tenantId:string,email:string,dob:string){
  const rows=await base44.asServiceRole.entities.Person.filter({tenant_id:tenantId},'-updated_date',500);
  const targetEmail=emailKey(email);
  return (rows||[]).find((p:any)=>{
    const emails=[p.primary_email,...(p.alternate_emails||[])].map(emailKey).filter(Boolean);
    return emails.includes(targetEmail)&&String(p.date_of_birth||'')===String(dob||'');
  })||null;
}
async function currentOrLatestMembership(base44:any,tenantId:string,clubId:string,personId:string,season=''){
  const rows=await base44.asServiceRole.entities.ClubMembership.filter({tenant_id:tenantId,club_id:clubId,person_id:personId},'-updated_date',100);
  if(season){
    const current=(rows||[]).find((m:any)=>m.membership_season===season);
    if(current)return current;
  }
  return (rows||[])[0]||null;
}
async function nextMemberId(base44:any,config:any){
  const prefix=clean(config.member_id_prefix,50);
  if(!prefix)return '';
  const digits=Math.max(2,Math.min(8,Number(config.member_id_digits||4)));
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
async function ensureRelationship(base44:any,config:any,person:any,membership:any){
  let rel=await first(base44,'ClubRelationship',{tenant_id:config.tenant_id,club_id:config.club_id,person_id:person.id});
  const patch:any={
    relationship_type:'member',
    status:membership.membership_status==='paid_active'?'active':'pending',
    entry_route:'direct_membership',
    membership_id:membership.member_id||undefined,
    membership_type:membership.membership_type||undefined,
    membership_season:membership.membership_season,
    payment_status:membership.payment_status,
    payment_date:membership.payment_date||undefined,
    membership_amount:Number(membership.membership_fee||0),
    membership_category:'paid',
    last_synced_at:new Date().toISOString(),
  };
  if(rel)return await base44.asServiceRole.entities.ClubRelationship.update(rel.id,patch);
  return await base44.asServiceRole.entities.ClubRelationship.create({tenant_id:config.tenant_id,club_id:config.club_id,person_id:person.id,...patch,start_date:new Date().toISOString().slice(0,10)});
}

function emailShell({club,headline,preheader,content}:any){
  const name=escapeHtml(club?.name||'RallyHub Club');
  const logo=escapeHtml(club?.logo_url||'');
  const primary=escapeHtml(club?.primary_colour||'#2563eb');
  const secondary=escapeHtml(club?.secondary_colour||'#facc15');
  return `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader||headline||'')}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border:1px solid #d9e1ec;border-radius:18px;overflow:hidden;">
<tr><td style="height:6px;background:${primary};border-bottom:3px solid ${secondary};"></td></tr>
<tr><td style="padding:26px 28px 18px;text-align:center;">${logo?`<img src="${logo}" alt="${name} logo" width="72" height="72" style="display:block;margin:0 auto 12px;object-fit:contain;border-radius:12px;">`:''}<div style="font-size:25px;font-weight:800;">${name}</div><div style="margin-top:5px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;">Membership</div></td></tr>
<tr><td style="padding:0 28px 28px;"><h1 style="margin:0 0 18px;font-size:23px;line-height:1.25;">${escapeHtml(headline)}</h1>${content}</td></tr>
<tr><td style="padding:18px 28px;background:#f7f9fc;border-top:1px solid #e4e9f1;text-align:center;font-size:11px;color:#7b8494;">Powered by <strong>RallyHub</strong> · membership technology for clubs</td></tr>
</table></td></tr></table></body></html>`;
}
function detailRow(label:string,value:any){return `<tr><td style="padding:7px 0;color:#6b7280;font-size:13px;width:38%;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:7px 0;color:#172033;font-size:13px;font-weight:700;vertical-align:top;">${escapeHtml(value)}</td></tr>`}
function signoffText(config:any,club:any){return `${config.signatory_name||club?.name||'Club team'}\n${config.signatory_title||''}${config.signatory_title?'\n':''}${club?.name||''}\n\nPowered by RallyHub`.trim()}
function signoffHtml(config:any,club:any){return `<p style="margin:24px 0 0;font-size:15px;line-height:1.5;"><strong>${escapeHtml(config.signatory_name||club?.name||'Club team')}</strong>${config.signatory_title?`<br>${escapeHtml(config.signatory_title)}`:''}<br>${escapeHtml(club?.name||'')}</p>`}
async function sendSubmittedEmails(base44:any,config:any,club:any,app:any,paymentUrl:string,force=false){
  const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:config.tenant_id,clubId:config.club_id};
  const now=new Date().toISOString();
  const fee=money(app.membership_fee,app.currency||config.currency||'EUR');
  if((force||!app.admin_notification_sent_at)&&config.notification_email){
    try{
      const textBody=`New ${app.application_type==='renewal'?'membership renewal':'membership application'} received.

Applicant: ${app.full_name}
Email: ${app.email}
Mobile: ${app.mobile}
Season: ${app.membership_season}
Fee: ${fee}
Payment status: ${app.payment_status}
Reference: ${app.confirmation_code}

Review in RallyHub Membership Console.

${signoffText(config,club)}`;
      const htmlBody=emailShell({club,headline:'New membership application received',preheader:`${app.full_name} · ${app.membership_season}`,content:`
<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151;">A ${app.application_type==='renewal'?'renewal':'new member'} application has been submitted.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:18px;">${detailRow('Applicant',app.full_name)}${detailRow('Email',app.email)}${detailRow('Mobile',app.mobile)}${detailRow('Season',app.membership_season)}${detailRow('Fee',fee)}${detailRow('Payment',app.payment_status)}${detailRow('Reference',app.confirmation_code)}</table>
<p style="margin:0;font-size:13px;color:#6b7280;">The application and recorded consent versions are available in the RallyHub Membership Console.</p>${signoffHtml(config,club)}`});
      await sendWithConfiguredEmailTransport(base44,scope,{to:config.notification_email,subject:config.admin_notification_subject||`New ${club.name} membership application`,textBody,htmlBody});
      app=await base44.asServiceRole.entities.MembershipApplication.update(app.id,{admin_notification_sent_at:now});
    }catch(e){console.error('membership admin notification failed',e?.message||e)}
  }
  if(app.email && (force||!app.confirmation_email_sent_at)){
    try{
      const hello=firstName(app.full_name);
      const paymentLine=app.payment_status==='pending'&&paymentUrl?`\nContinue to secure payment: ${paymentUrl}\n`:'';
      const textBody=`Hi ${hello},

Thank you. Your ${club.name} membership ${app.application_type==='renewal'?'renewal':'application'} for ${app.membership_season} has been received.

Membership fee: ${fee}
Application reference: ${app.confirmation_code}
Payment status: ${app.payment_status}${paymentLine}
Your details, declarations and consent choices have been recorded.

${signoffText(config,club)}`;
      const button=app.payment_status==='pending'&&paymentUrl?`<div style="text-align:center;margin:22px 0;"><a href="${escapeHtml(paymentUrl)}" style="display:inline-block;padding:14px 24px;border-radius:10px;background:${escapeHtml(club.primary_colour||'#2563eb')};color:#fff;text-decoration:none;font-size:16px;font-weight:800;">Pay ${escapeHtml(fee)} securely</a></div>`:'';
      const htmlBody=emailShell({club,headline:`Application received, ${hello}`,preheader:`${club.name} membership · ${app.membership_season}`,content:`
<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">Thank you. Your membership ${app.application_type==='renewal'?'renewal':'application'} has been received.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:12px;">${detailRow('Season',app.membership_season)}${detailRow('Membership fee',fee)}${detailRow('Application reference',app.confirmation_code)}${detailRow('Payment status',app.payment_status)}</table>
${button}
<p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">Your contact details, membership declarations and consent choices have been recorded. Your membership is confirmed once the required payment has been received.</p>${signoffHtml(config,club)}`});
      await sendWithConfiguredEmailTransport(base44,scope,{to:app.email,subject:config.confirmation_email_subject||`Your ${club.name} membership application`,textBody,htmlBody});
      app=await base44.asServiceRole.entities.MembershipApplication.update(app.id,{confirmation_email_sent_at:now});
    }catch(e){console.error('membership applicant acknowledgement failed',e?.message||e)}
  }
  return app;
}
async function sendPaidConfirmation(base44:any,config:any,club:any,app:any,force=false){
  if(!app.email||(!force&&app.status==='approved'&&app.follow_up_status==='complete'&&app.paid_at&&app.admin_notes?.includes('paid-confirmation-sent')))return app;
  const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:config.tenant_id,clubId:config.club_id};
  const hello=firstName(app.full_name);
  const fee=money(app.membership_fee,app.currency||config.currency||'EUR');
  const textBody=`Hi ${hello},

Your ${club.name} membership for ${app.membership_season} is confirmed.

Payment received: ${fee}
Membership reference: ${app.confirmation_code}

Thank you for being part of ${club.name}.

${signoffText(config,club)}`;
  const htmlBody=emailShell({club,headline:`Membership confirmed, ${hello}`,preheader:`${club.name} membership confirmed`,content:`
<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">Your membership for <strong>${escapeHtml(app.membership_season)}</strong> is now confirmed.</p>
<div style="margin:0 0 20px;padding:16px;border-radius:14px;background:#eef8f1;border:1px solid #b9e2c4;"><div style="font-size:15px;font-weight:800;color:#23452d;">Payment received · ${escapeHtml(fee)}</div><div style="margin-top:5px;font-size:13px;color:#3f6348;">Membership reference: ${escapeHtml(app.confirmation_code)}</div></div>
<p style="margin:0;font-size:15px;line-height:1.65;color:#374151;">Thank you for being part of ${escapeHtml(club.name)}.</p>${signoffHtml(config,club)}`});
  try{
    await sendWithConfiguredEmailTransport(base44,scope,{to:app.email,subject:`${club.name} membership confirmed · ${app.membership_season}`,textBody,htmlBody});
    const note=`${clean(app.admin_notes,1200)} paid-confirmation-sent`.trim();
    return await base44.asServiceRole.entities.MembershipApplication.update(app.id,{admin_notes:note,follow_up_status:'complete'});
  }catch(e){console.error('membership paid confirmation failed',e?.message||e);return app}
}

async function recordConsents(base44:any,config:any,docs:any,person:any,app:any,consents:any){
  const now=new Date().toISOString();
  const map:any=[
    ['privacy',docs.privacy,true],
    ['liability_waiver',docs.waiver,true],
    ['code_of_conduct',docs.code,true],
    ['health_declaration',docs.health,true],
    ['membership_terms',docs.terms,true],
    ['photo_video',docs.photo,false],
  ];
  for(const [key,doc,required] of map){
    if(!doc)continue;
    const accepted=key==='photo_video'?consents.photoVideo==='yes':consents[key]===true;
    if(required&&!accepted)throw new Error(`Please accept ${doc.title}.`);
    if(key==='photo_video'&&!['yes','no'].includes(String(consents.photoVideo||'')))throw new Error('Please choose Yes or No for photography/video consent.');
    await base44.asServiceRole.entities.ConsentRecord.create({
      tenant_id:config.tenant_id,club_id:config.club_id,person_id:person.id,membership_application_id:app.id,legal_document_id:doc.id,
      consent_type:key,status:accepted?'accepted':'declined',response_text:accepted?(doc.consentLabel||'Accepted'):'Declined',
      consent_version:doc.version,wording_hash:await hashText(doc.bodyText||''),recorded_at:now,source_system:'rallyhub_membership_application'
    });
  }
}
async function paymentForApplication(base44:any,config:any,club:any,app:any,membership:any,forceNew=false){
  if(config.payment_required===false||Number(config.membership_fee||0)<=0){
    return {app:await base44.asServiceRole.entities.MembershipApplication.update(app.id,{payment_status:'not_required',status:'approved',approved_at:new Date().toISOString(),follow_up_status:'complete'}),payment:null,paymentUrl:''};
  }
  const existing=await base44.asServiceRole.entities.PaymentRecord.filter({tenant_id:config.tenant_id,club_id:config.club_id,club_membership_id:membership.id,purpose_type:'membership'},'-created_date',20);
  let payment=(existing||[]).find((p:any)=>p.payment_status==='pending'&&p.provider_checkout_url&&!forceNew)||(existing||[]).find((p:any)=>p.payment_status==='paid')||null;
  if(payment?.payment_status==='paid'){
    return {app:await syncPaid(base44,config,app,membership,payment,null),payment,paymentUrl:''};
  }
  if(!payment){
    const gateway=await gatewayAccount(base44,config);
    if(!gateway||!providerConfigured(gateway.row.provider,gateway.account))throw new Error('The club payment gateway is not available right now.');
    const provider=String(gateway.row.provider||'').toLowerCase();
    const ref=`membership-${String(app.id).slice(-16)}-${Date.now().toString(36)}`.slice(0,64);
    const redirectUrl=`https://rallyhub.ie/membership/${encodeURIComponent(config.public_slug)}?application=${encodeURIComponent(app.public_token)}&payment=return`;
    const returnUrl=`https://rallyhub.ie/api/apps/6a01dc00702b7dd2a2978c28/functions/paymentGatewayWebhook?provider=${encodeURIComponent(provider)}`;
    const checkout=await createCheckout({
      provider,account:gateway.account,amount:Number(config.membership_fee),currency:config.currency||'EUR',reference:ref,
      description:`${club.name} membership ${config.season_label}`,redirectUrl,returnUrl
    });
    payment=await base44.asServiceRole.entities.PaymentRecord.create({
      tenant_id:config.tenant_id,club_id:config.club_id,person_id:app.person_id,club_membership_id:membership.id,
      membership_season:config.season_label,purpose_type:'membership',purpose_id:membership.id,payment_type:'membership',
      amount:Number(config.membership_fee),currency:config.currency||'EUR',payment_method:provider,payment_status:'pending',
      provider,provider_account_id:gateway.row.id,provider_checkout_id:checkout.checkoutId,provider_checkout_url:checkout.checkoutUrl,
      provider_status:checkout.providerStatus,external_payment_reference:checkout.reference,source_system:'rallyhub_membership_application',
      notes:`Membership application ${app.id}`
    });
  }
  const updated=await base44.asServiceRole.entities.MembershipApplication.update(app.id,{payment_record_id:payment.id,payment_status:'pending',status:'pending_payment',follow_up_status:'payment_due'});
  return {app:updated,payment,paymentUrl:payment.provider_checkout_url||''};
}
async function syncPaid(base44:any,config:any,app:any,membership:any,payment:any,result:any){
  const now=new Date().toISOString();
  if(payment&&payment.payment_status!=='paid'){
    await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{
      payment_status:'paid',payment_date:now.slice(0,10),provider_status:result?.providerStatus||payment.provider_status||'PAID',
      provider_transaction_id:result?.transactionId||payment.provider_transaction_id||'',
      provider_payment_reference:result?.transactionCode||payment.provider_payment_reference||'',
      external_payment_reference:result?.transactionCode||payment.external_payment_reference||''
    });
  }
  const memberPatch:any={payment_status:'paid',membership_status:'paid_active',payment_date:now.slice(0,10)};
  if(!membership.member_id)memberPatch.member_id=await nextMemberId(base44,config);
  const updatedMembership=await base44.asServiceRole.entities.ClubMembership.update(membership.id,memberPatch);
  const person=await first(base44,'Person',{id:membership.person_id,tenant_id:config.tenant_id});
  if(person)await ensureRelationship(base44,config,person,updatedMembership);
  return await base44.asServiceRole.entities.MembershipApplication.update(app.id,{status:'approved',payment_status:'paid',paid_at:app.paid_at||now,approved_at:app.approved_at||now,follow_up_status:'complete'});
}
async function reconcile(base44:any,config:any,app:any){
  if(!app.club_membership_id)return {app,payment:null,paymentUrl:''};
  const membership=await first(base44,'ClubMembership',{id:app.club_membership_id,tenant_id:config.tenant_id,club_id:config.club_id});
  if(!membership)return {app,payment:null,paymentUrl:''};
  const payments=await base44.asServiceRole.entities.PaymentRecord.filter({tenant_id:config.tenant_id,club_id:config.club_id,club_membership_id:membership.id,purpose_type:'membership'},'-created_date',20);
  let payment=(payments||[])[0]||null;
  if(!payment)return {app,payment:null,paymentUrl:''};
  if(payment.payment_status==='paid'||membership.payment_status==='paid'){
    return {app:await syncPaid(base44,config,app,membership,payment,null),payment,paymentUrl:''};
  }
  if(payment.provider_checkout_id&&payment.provider){
    try{
      const gateway=await gatewayAccount(base44,config);
      if(gateway){
        const result=await retrievePayment(payment.provider,payment.provider_checkout_id,gateway.account);
        if(result.normalizedStatus==='paid'){
          app=await syncPaid(base44,config,app,membership,payment,result);
          payment=await first(base44,'PaymentRecord',{id:payment.id});
          return {app,payment,paymentUrl:''};
        }
        if(['failed','expired'].includes(result.normalizedStatus)){
          await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{payment_status:'failed',provider_status:result.providerStatus});
          await base44.asServiceRole.entities.ClubMembership.update(membership.id,{payment_status:'failed',membership_status:'pending_payment'});
          app=await base44.asServiceRole.entities.MembershipApplication.update(app.id,{status:'payment_failed',payment_status:'failed',follow_up_status:'payment_due'});
          return {app,payment,paymentUrl:''};
        }
      }
    }catch(e){console.error('membership payment reconciliation failed',e?.message||e)}
  }
  return {app,payment,paymentUrl:payment.provider_checkout_url||''};
}
async function requireClubManager(base44:any){
  const user=await base44.auth.me();
  if(!user)throw new Error('Unauthorized');
  const tenantId=clean(user.active_tenant_id,120);
  const clubId=clean(user.active_club_id,120);
  if(!tenantId||!clubId)throw new Error('Choose an active RallyHub club first.');
  if(user.role!=='admin'){
    const access=await base44.asServiceRole.entities.ClubUserAccess.filter({tenant_id:tenantId,club_id:clubId,user_id:user.id,status:'active',permission_bundle:'club_admin'},'-updated_date',10);
    if(!(access||[]).length)throw new Error('Club admin access required.');
  }
  return {user,tenantId,clubId};
}
function safeApplication(app:any,paymentUrl=''){
  return {id:app.id,publicToken:app.public_token||'',applicationType:app.application_type,status:app.status,paymentStatus:app.payment_status,confirmationCode:app.confirmation_code,fullName:app.full_name,seasonLabel:app.membership_season,membershipFee:Number(app.membership_fee||0),currency:app.currency||'EUR',paymentUrl};
}
function whatsappReminder(config:any,club:any,app:any,paymentUrl:string){
  const fee=money(app.membership_fee,app.currency||config.currency||'EUR');
  return `Hi ${firstName(app.full_name)}, just a quick reminder about your ${club.name} membership ${app.application_type==='renewal'?'renewal':'application'} for ${app.membership_season}. The membership fee is ${fee}.${paymentUrl?` You can complete payment securely here: ${paymentUrl}`:''} If you have already paid, please ignore this message. Thanks, ${config.signatory_name||club.name} · ${club.name}`;
}
function reminderContent(config:any,club:any,app:any,paymentUrl:string){
  const fee=money(app.membership_fee,app.currency||config.currency||'EUR');
  const text=whatsappReminder(config,club,app,paymentUrl);
  const subject=`${club.name} membership payment reminder`;
  const button=paymentUrl?`<div style="text-align:center;margin:22px 0;"><a href="${escapeHtml(paymentUrl)}" style="display:inline-block;padding:14px 24px;border-radius:10px;background:${escapeHtml(club.primary_colour||'#2563eb')};color:#fff;text-decoration:none;font-size:16px;font-weight:800;">Pay ${escapeHtml(fee)} securely</a></div>`:'';
  const html=emailShell({club,headline:'Membership payment reminder',preheader:`${club.name} membership · ${app.membership_season}`,content:`<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">Hi ${escapeHtml(firstName(app.full_name))}, just a quick reminder that your membership application is awaiting payment.</p>${button}<p style="margin:0;font-size:13px;color:#6b7280;">If you have already paid, please ignore this message.</p>${signoffHtml(config,club)}`});
  return {subject,text,html,paymentUrl};
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'public_get',60);

    if(action.startsWith('admin_')){
      let ctx;
      try{ctx=await requireClubManager(base44)}catch(e){return Response.json({error:e?.message||'Unauthorized'},{status:String(e?.message||'').includes('Unauthorized')?401:403})}
      const {user,tenantId,clubId}=ctx;
      const config=await configForClub(base44,tenantId,clubId);
      if(!config)return Response.json({error:'Membership applications are not configured for this club.'},{status:404});
      const club=await clubBrand(base44,clubId,tenantId);

      if(action==='admin_count'){
        const apps=await base44.asServiceRole.entities.MembershipApplication.filter({tenant_id:tenantId,club_id:clubId},'-submitted_at',300);
        const actionable=(apps||[]).filter((app:any)=>['submitted','pending_payment','payment_failed'].includes(String(app.status||''))&&app.payment_status!=='paid');
        return Response.json({success:true,pendingCount:actionable.length,total:(apps||[]).length});
      }

      if(action==='admin_list'){
        const apps=await base44.asServiceRole.entities.MembershipApplication.filter({tenant_id:tenantId,club_id:clubId},'-submitted_at',300);
        const rows=[];
        for(const app of apps||[]){
          let paymentUrl='';
          if(app.payment_record_id){
            const p=await first(base44,'PaymentRecord',{id:app.payment_record_id,tenant_id:tenantId,club_id:clubId});
            paymentUrl=p?.provider_checkout_url||'';
          }
          rows.push({
            id:app.id,applicationType:app.application_type,status:app.status,paymentStatus:app.payment_status,
            fullName:app.full_name,email:app.email,mobile:app.mobile,seasonLabel:app.membership_season,
            membershipFee:Number(app.membership_fee||0),currency:app.currency||config.currency||'EUR',
            confirmationCode:app.confirmation_code,submittedAt:app.submitted_at||app.created_date,paidAt:app.paid_at||'',
            reminderCount:Number(app.reminder_count||0),lastReminderAt:app.last_reminder_at||'',followUpStatus:app.follow_up_status||'none',
            paymentUrl,clubMembershipId:app.club_membership_id||'',personId:app.person_id||''
          });
        }
        const counts={
          total:rows.length,
          awaitingPayment:rows.filter(x=>['pending','failed'].includes(x.paymentStatus)).length,
          paid:rows.filter(x=>x.paymentStatus==='paid').length,
          newMembers:rows.filter(x=>x.applicationType==='new').length,
          renewals:rows.filter(x=>x.applicationType==='renewal').length
        };
        return Response.json({success:true,config:safeConfig(config,club,{}),publicUrl:`https://rallyhub.ie/membership/${encodeURIComponent(config.public_slug)}`,counts,applications:rows});
      }

      const appId=clean(body.applicationId,120);
      let app=await first(base44,'MembershipApplication',{id:appId,tenant_id:tenantId,club_id:clubId});
      if(!app)return Response.json({error:'Membership application not found.'},{status:404});

      if(action==='admin_verify_payment'){
        const result=await reconcile(base44,config,app);
        app=result.app;
        if(app.payment_status==='paid')app=await sendPaidConfirmation(base44,config,club,app);
        return Response.json({success:true,application:safeApplication(app,result.paymentUrl)});
      }

      if(action==='admin_preview_reminder'){
        const result=await reconcile(base44,config,app);
        app=result.app;
        if(app.payment_status==='paid')return Response.json({success:true,alreadyPaid:true,application:safeApplication(app,'')});
        const content=reminderContent(config,club,app,result.paymentUrl||'');
        return Response.json({
          success:true,
          application:safeApplication(app,result.paymentUrl||''),
          preview:{
            email:{to:app.email,subject:content.subject,textBody:content.text,htmlBody:content.html},
            whatsapp:{message:content.text},
            paymentUrl:content.paymentUrl
          }
        });
      }

      if(action==='admin_send_reminder'){
        let result=await reconcile(base44,config,app);
        app=result.app;
        if(app.payment_status==='paid'){
          app=await sendPaidConfirmation(base44,config,club,app);
          return Response.json({success:true,alreadyPaid:true,application:safeApplication(app,'')});
        }
        let paymentUrl=result.paymentUrl;
        if(!paymentUrl){
          const membership=await first(base44,'ClubMembership',{id:app.club_membership_id,tenant_id:tenantId,club_id:clubId});
          if(membership){
            const pay=await paymentForApplication(base44,config,club,app,membership,true);
            app=pay.app; paymentUrl=pay.paymentUrl;
          }
        }
        const channel=clean(body.channel,20).toLowerCase()==='whatsapp'?'whatsapp':'email';
        const content=reminderContent(config,club,app,paymentUrl);
        const now=new Date().toISOString();
        if(channel==='email'){
          const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId,clubId};
          await sendWithConfiguredEmailTransport(base44,scope,{to:app.email,subject:content.subject,textBody:content.text,htmlBody:content.html});
        }
        const count=Number(app.reminder_count||0)+1;
        app=await base44.asServiceRole.entities.MembershipApplication.update(app.id,{reminder_count:count,last_reminder_at:now,last_reminder_channel:channel,follow_up_status:count>1?'second_reminder':'reminded'});
        return Response.json({success:true,channel,message:content.text,paymentUrl,application:safeApplication(app,paymentUrl)});
      }

      if(action==='admin_resend_confirmation'){
        const result=await reconcile(base44,config,app);
        app=result.app;
        if(app.payment_status!=='paid')return Response.json({error:'Payment has not been confirmed yet.'},{status:409});
        app=await sendPaidConfirmation(base44,config,club,app,true);
        return Response.json({success:true,application:safeApplication(app,'')});
      }

      if(action==='admin_mark_no_response'){
        app=await base44.asServiceRole.entities.MembershipApplication.update(app.id,{follow_up_status:'no_response'});
        return Response.json({success:true,application:safeApplication(app,'')});
      }

      return Response.json({error:'Invalid membership admin action.'},{status:400});
    }

    const slug=clean(body.clubSlug||body.publicSlug,120);
    const config=await activeConfig(base44,slug);
    if(!config)return Response.json({error:'Membership applications are not currently open for this club.'},{status:404});
    const club=await clubBrand(base44,config.club_id,config.tenant_id);
    const [docs,adultPolicy]=await Promise.all([
      legalDocs(base44,config),
      activeAdultPolicy(base44,config.tenant_id,config.club_id)
    ]);

    if(action==='public_get'){
      return Response.json({success:true,config:safeConfig(config,club,docs,adultPolicy)});
    }

    if(action==='public_lookup_renewal'){
      if(config.allow_renewal===false)return Response.json({error:'Renewals are not open right now.'},{status:409});
      const email=emailKey(body.email);
      const dob=clean(body.dateOfBirth,20);
      if(!email||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||!/^\d{4}-\d{2}-\d{2}$/.test(dob))return Response.json({error:'Enter the email address and date of birth from your previous membership.'},{status:400});
      const person=await findPersonByIdentity(base44,config.tenant_id,email,dob);
      if(!person)return Response.json({error:'We could not match those details to an existing member. Check the email and date of birth, or choose New Member if appropriate.'},{status:404});
      const membership=await currentOrLatestMembership(base44,config.tenant_id,config.club_id,person.id,config.season_label);
      if(!membership)return Response.json({error:'We found your RallyHub profile but not a previous membership for this club. Please contact the club or choose New Member.'},{status:404});
      if(membership.membership_season===config.season_label&&membership.payment_status==='paid')return Response.json({error:'This membership is already paid and active for the current season.'},{status:409});
      let draft=(await base44.asServiceRole.entities.MembershipApplication.filter({config_id:config.id,person_id:person.id,application_type:'renewal',status:'draft'},'-created_date',20))?.[0]||null;
      if(!draft){
        draft=await base44.asServiceRole.entities.MembershipApplication.create({
          tenant_id:config.tenant_id,club_id:config.club_id,config_id:config.id,application_type:'renewal',status:'draft',
          public_token:publicToken(),confirmation_code:confirmation(),person_id:person.id,existing_membership_id:membership.id,
          membership_season:config.season_label,membership_type:'renewal',membership_fee:Number(config.membership_fee||0),currency:config.currency||'EUR',
          full_name:person.full_name,email:emailKey(person.primary_email||email),full_postal_address:person.full_postal_address||'',
          postal_code:person.postal_code||'',mobile:person.mobile||'',date_of_birth:person.date_of_birth||dob,
          emergency_contact_name:person.emergency_contact_name||'',emergency_contact_relationship:person.emergency_contact_relationship||'',
          emergency_mobile:person.emergency_mobile||'',emergency_contact_raw:person.emergency_contact_raw||'',payment_status:'not_started',
          source_system:'rallyhub_membership_application'
        });
      }
      return Response.json({success:true,renewalToken:draft.public_token,profile:{
        fullName:person.full_name||'',fullPostalAddress:person.full_postal_address||'',postalCode:person.postal_code||'',
        email:person.primary_email||email,mobile:person.mobile||'',dateOfBirth:person.date_of_birth||dob,
        emergencyContactName:person.emergency_contact_name||'',emergencyContactRelationship:person.emergency_contact_relationship||'',
        emergencyMobile:person.emergency_mobile||'',emergencyContactRaw:person.emergency_contact_raw||''
      }});
    }

    if(action==='public_status'||action==='public_retry_payment'){
      const tokenValue=clean(body.applicationToken,80);
      if(!validPublicToken(tokenValue))return Response.json({error:'Application reference is invalid.'},{status:404});
      let app=await first(base44,'MembershipApplication',{public_token:tokenValue,config_id:config.id});
      if(!app)return Response.json({error:'Membership application not found.'},{status:404});
      let result=await reconcile(base44,config,app);
      app=result.app;
      if(action==='public_retry_payment'&&app.payment_status!=='paid'){
        const membership=await first(base44,'ClubMembership',{id:app.club_membership_id,tenant_id:config.tenant_id,club_id:config.club_id});
        if(membership){
          result=await paymentForApplication(base44,config,club,app,membership,true);
          app=result.app;
        }
      }
      if(app.payment_status==='paid')app=await sendPaidConfirmation(base44,config,club,app);
      return Response.json({success:true,application:safeApplication(app,result.paymentUrl||'')});
    }

    if(action!=='public_submit')return Response.json({error:'Invalid membership application action.'},{status:400});

    const applicationType=clean(body.applicationType,20).toLowerCase();
    if(!['new','renewal'].includes(applicationType))return Response.json({error:'Choose New Member or Renewal.'},{status:400});
    if(applicationType==='new'&&config.allow_new===false)return Response.json({error:'New membership applications are not open right now.'},{status:409});
    if(applicationType==='renewal'&&config.allow_renewal===false)return Response.json({error:'Renewals are not open right now.'},{status:409});

    const fullName=clean(body.fullName,160);
    const fullPostalAddress=raw(body.fullPostalAddress,1200);
    const postalCode=clean(body.postalCode,40);
    const email=emailKey(body.email);
    const mobile=clean(body.mobile,80);
    const dob=clean(body.dateOfBirth,20);
    const emergencyName=clean(body.emergencyContactName,160);
    const emergencyRelationship=clean(body.emergencyContactRelationship,100);
    const emergencyMobile=clean(body.emergencyMobile,80);
    if(!fullName||fullName.split(/\s+/).length<2)return Response.json({error:'Please enter your full name.'},{status:400});
    if(!fullPostalAddress)return Response.json({error:'Please enter your full postal address.'},{status:400});
    if(!postalCode)return Response.json({error:'Please enter your Eircode / postcode.'},{status:400});
    if(!email||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return Response.json({error:'Please enter a valid email address.'},{status:400});
    if(phoneDigits(mobile).length<8)return Response.json({error:'Please enter a valid mobile number.'},{status:400});
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dob))return Response.json({error:'Please enter your date of birth.'},{status:400});
    const minimumAge=Number(adultPolicy?.minimum_age||0);
    if(minimumAge>0){
      const birthDate=new Date(`${dob}T12:00:00Z`);
      const today=new Date();
      const qualifyingBirthday=new Date(Date.UTC(birthDate.getUTCFullYear()+minimumAge,birthDate.getUTCMonth(),birthDate.getUTCDate(),12));
      if(!Number.isFinite(birthDate.getTime())||today.getTime()<qualifyingBirthday.getTime())return Response.json({error:`${club?.name||'This club'} currently requires applicants to be ${minimumAge} or over.`},{status:400});
    }
    if(!emergencyName||phoneDigits(emergencyMobile).length<8)return Response.json({error:'Please provide an emergency contact name and mobile number.'},{status:400});
    if(applicationType==='renewal'&&body.dataReviewConfirmed!==true)return Response.json({error:'Please confirm that you have reviewed all of your membership details.'},{status:400});

    const submittedConsents=body.consents||{};
    const requiredConsentChecks:any=[
      ['privacy',docs.privacy],
      ['liability_waiver',docs.waiver],
      ['code_of_conduct',docs.code],
      ['health_declaration',docs.health],
      ['membership_terms',docs.terms],
    ];
    for(const [key,doc] of requiredConsentChecks){
      if(!doc)return Response.json({error:'A required club membership declaration is not configured. Please contact the club.'},{status:409});
      if(submittedConsents[key]!==true)return Response.json({error:`Please accept ${doc.title}.`},{status:400});
    }
    if(docs.photo&&!['yes','no'].includes(String(submittedConsents.photoVideo||'')))return Response.json({error:'Please choose Yes or No for photography/video consent.'},{status:400});

    let person=null;
    let existingMembership=null;
    let app=null;
    if(applicationType==='renewal'){
      const renewalToken=clean(body.renewalToken,80);
      if(!validPublicToken(renewalToken))return Response.json({error:'Please verify your renewal details again.'},{status:400});
      app=await first(base44,'MembershipApplication',{public_token:renewalToken,config_id:config.id,application_type:'renewal'});
      if(!app||!app.person_id)return Response.json({error:'Please verify your renewal details again.'},{status:404});
      person=await first(base44,'Person',{id:app.person_id,tenant_id:config.tenant_id});
      existingMembership=await currentOrLatestMembership(base44,config.tenant_id,config.club_id,person.id,config.season_label);
    }else{
      person=await findPersonByIdentity(base44,config.tenant_id,email,dob);
      if(person){
        const priorApplications=await base44.asServiceRole.entities.MembershipApplication.filter({
          config_id:config.id,person_id:person.id,application_type:'new'
        },'-created_date',20);
        app=(priorApplications||[]).find((candidate:any)=>['submitted','pending_payment','payment_failed','paid','approved'].includes(String(candidate.status||'')))||null;
        const prior=await currentOrLatestMembership(base44,config.tenant_id,config.club_id,person.id,config.season_label);
        if(prior&&prior.relationship_type==='member'&&!app)return Response.json({error:'We found an existing club membership for these details. Please choose Renewal so you can review and update your existing information.'},{status:409});
      }
    }

    if(app&&['pending_payment','submitted','payment_failed','paid','approved'].includes(app.status)){
      const result=await reconcile(base44,config,app);
      return Response.json({success:true,reused:true,application:safeApplication(result.app,result.paymentUrl)});
    }

    const personPatch:any={
      full_name:fullName,primary_email:email,mobile,date_of_birth:dob,full_postal_address:fullPostalAddress,postal_code:postalCode,
      emergency_contact_name:emergencyName,emergency_contact_relationship:emergencyRelationship,emergency_mobile:emergencyMobile,
      emergency_contact_raw:`${emergencyName}${emergencyRelationship?` (${emergencyRelationship})`:''} – ${emergencyMobile}`,
      source_system:person?.source_system||'rallyhub_membership_application',last_synced_at:new Date().toISOString()
    };
    if(person)person=await base44.asServiceRole.entities.Person.update(person.id,personPatch);
    else person=await base44.asServiceRole.entities.Person.create({tenant_id:config.tenant_id,...personPatch});

    let membership=await currentOrLatestMembership(base44,config.tenant_id,config.club_id,person.id,config.season_label);
    const previousMembership=existingMembership&&existingMembership.membership_season!==config.season_label?existingMembership:null;
    if(membership&&membership.membership_season===config.season_label&&membership.payment_status==='paid')return Response.json({error:'This membership is already paid and active for the current season.'},{status:409});
    if(!membership||membership.membership_season!==config.season_label){
      membership=await base44.asServiceRole.entities.ClubMembership.create({
        tenant_id:config.tenant_id,club_id:config.club_id,person_id:person.id,
        member_id:previousMembership?.member_id||undefined,membership_season:config.season_label,membership_type:applicationType,
        membership_status:config.payment_required===false?'paid_active':'pending_payment',relationship_type:'member',
        join_date:previousMembership?.join_date||new Date().toISOString().slice(0,10),
        renewal_date:applicationType==='renewal'?new Date().toISOString().slice(0,10):undefined,
        expiry_date:config.active_until||undefined,membership_fee:Number(config.membership_fee||0),
        payment_status:config.payment_required===false?'not_required':'pending',
        previous_member_ids:previousMembership?.member_id?[previousMembership.member_id]:[],
        source_system:'rallyhub_membership_application',last_synced_at:new Date().toISOString()
      });
    }else{
      membership=await base44.asServiceRole.entities.ClubMembership.update(membership.id,{
        membership_type:applicationType,membership_status:config.payment_required===false?'paid_active':'pending_payment',
        relationship_type:'member',membership_fee:Number(config.membership_fee||0),payment_status:config.payment_required===false?'not_required':'pending',
        renewal_date:applicationType==='renewal'?new Date().toISOString().slice(0,10):membership.renewal_date||undefined,
        last_synced_at:new Date().toISOString()
      });
    }
    await ensureRelationship(base44,config,person,membership);

    const changedFields=Array.isArray(body.changedFields)?body.changedFields.map((x:any)=>clean(x,80)).filter(Boolean).slice(0,30):[];
    const applicationPatch:any={
      tenant_id:config.tenant_id,club_id:config.club_id,config_id:config.id,application_type:applicationType,
      status:config.payment_required===false?'approved':'submitted',public_token:app?.public_token||publicToken(),confirmation_code:app?.confirmation_code||confirmation(),
      person_id:person.id,existing_membership_id:existingMembership?.id||app?.existing_membership_id||undefined,club_membership_id:membership.id,
      membership_season:config.season_label,membership_type:applicationType,membership_fee:Number(config.membership_fee||0),currency:config.currency||'EUR',
      full_name:fullName,full_postal_address:fullPostalAddress,postal_code:postalCode,email,mobile,date_of_birth:dob,
      emergency_contact_name:emergencyName,emergency_contact_relationship:emergencyRelationship,emergency_mobile:emergencyMobile,
      emergency_contact_raw:personPatch.emergency_contact_raw,changed_fields:changedFields,data_review_confirmed:applicationType==='renewal'?true:body.dataReviewConfirmed===true,
      payment_status:config.payment_required===false?'not_required':'not_started',submitted_at:new Date().toISOString(),
      follow_up_status:config.payment_required===false?'complete':'payment_due',source_system:'rallyhub_membership_application'
    };
    if(app)app=await base44.asServiceRole.entities.MembershipApplication.update(app.id,applicationPatch);
    else app=await base44.asServiceRole.entities.MembershipApplication.create(applicationPatch);

    try{await recordConsents(base44,config,docs,person,app,submittedConsents)}catch(e){return Response.json({error:e?.message||'Please accept the membership declarations.'},{status:400})}

    let pay={app,payment:null,paymentUrl:''};
    if(config.payment_required!==false)pay=await paymentForApplication(base44,config,club,app,membership,false);
    else{
      if(!membership.member_id){
        const memberId=await nextMemberId(base44,config);
        if(memberId)membership=await base44.asServiceRole.entities.ClubMembership.update(membership.id,{member_id:memberId});
      }
      await ensureRelationship(base44,config,person,membership);
    }
    app=await sendSubmittedEmails(base44,config,club,pay.app,pay.paymentUrl);
    if(app.payment_status==='not_required')app=await sendPaidConfirmation(base44,config,club,app);
    try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:config.tenant_id,club_id:config.club_id,user_id:'public:membership',action:'membership_application_submitted',entity_type:'MembershipApplication',entity_id:app.id,scope_type:'Person',scope_id:person.id,after_state:JSON.stringify({applicationType,season:config.season_label,paymentStatus:app.payment_status}),reason:'Public membership application submitted'})}catch{}
    return Response.json({success:true,application:safeApplication(app,pay.paymentUrl)});
  }catch(error){
    console.error('membershipApplication error',error);
    return Response.json({error:error?.message||'Membership application failed.'},{status:500});
  }
});
