/** Tenant Events registration. Explicitly gated until full payment, notice and admin workflows pass UAT. */
import {createClientFromRequest} from 'npm:@base44/sdk@0.8.48';
import {occupied,duplicate,consentEvidence,canConfirm} from './rules.js';
import {createCheckout,retrievePayment,refundPayment,providerConfigured} from './payments.ts';
import {eventNoticeRecipients,eventNoticeBody,EVENT_NOTICE_TYPES} from './notificationPolicy.js';
import {renderBasicBrandedEmail} from './communicationsBasicRenderer.ts';
import {deliverEventNotice} from './delivery.ts';
import {readBookingRegistrations} from './scopedRegistrationReader.mjs';
import {readAdminEventPayments} from './scopedPaymentReader.mjs';
import {selectRefundableEventPayment,selectCheckoutPayment} from './paymentSelection.mjs';
import {readPaymentRefundHistory,refundRemaining} from './scopedRefundReader.mjs';
import {readEventAdminPage} from './adminPage.mjs';
import {countActiveEventRegistrations} from './availabilityCount.mjs';
import {requireEventAdminGrant} from './adminAccess.mjs';
import {acquireEventApprovalLock} from './approvalLock.mjs';
import {claimPaidEventConfirmation} from './confirmationLock.mjs';
import {reviewVerifiedEventCheckout} from './verifiedCheckout.mjs';
import {resolveEventCheckoutUrls} from './checkoutUrls.mjs';
import {sendWithConfiguredEmailTransport} from './emailRouter.ts';
import {eventTemplateValues} from './templateResolver.js';
const clean=(v:any,n=200)=>String(v??'').trim().replace(/\s+/g,' ').slice(0,n);
const fail=(message:string,status=400)=>Response.json({success:false,error:message},{status});
Deno.serve(async(req)=>{
 let stage='request';
 if(req.method!=='POST')return fail('POST required',405);
 try{
  const b=await req.json();const action=clean(b.action||'get',30);const id=clean(b.eventId,80);
  if(!id)return fail('Event required');
  const base44=createClientFromRequest(req);
  const t=(await base44.asServiceRole.entities.Tournament.filter({id},'-created_date',1))?.[0];
  const adminActions=['admin_list','admin_page','admin_approve','admin_verify','admin_refund_payment','admin_notice_preview','admin_resend_payment_link','admin_alternative_dates','admin_comms_templates','admin_comms_save_draft','admin_comms_send'];
  const isAdminAction=adminActions.includes(action);
  const privateAccess=!!(t?.event_private_invitation_token&&clean(b.invitationToken,100)===t.event_private_invitation_token);
  if(!t||(!isAdminAction&&(!t.event_booking_enabled||t.event_registration_mode!=='rallyhub'||t.event_publish_status!=='published'||(!t.event_public_visible&&!privateAccess))))return fail('Bookings are not open for this event',404);
  if(isAdminAction){const user=await base44.auth.me().catch(()=>null);if(!user||!t.tenant_id||!t.host_club_id||!await requireEventAdminGrant(base44,user,t))return fail('Active tenant or club administrator grant required',403);}
  const capacity=Number(t.event_capacity||0);if(!Number.isSafeInteger(capacity)||capacity<1)return fail('Event capacity is not configured',503);
  if(action==='admin_list'||action==='admin_page'){
   const cursor=action==='admin_page'?clean(b.cursor,2048):'';
   if(action==='admin_page'&&!cursor)return fail('Continuation cursor required',400);
   stage='admin_page';
   const page=await readEventAdminPage(base44.asServiceRole.entities.EventRegistration,base44.asServiceRole.entities.PaymentRecord,{eventId:id,tenantId:t.tenant_id,clubId:t.host_club_id,cursor});
   return Response.json({success:true,event:{id:t.id,name:t.name,capacity},...page,summaryIsPartial:page.hasMore||!!cursor});
  }
  if(action==='check'){
   const operationId=clean(b.operationId,100);
   if(!operationId)return fail('Application reference required');
   const matches=await base44.asServiceRole.entities.EventRegistration.filter({event_id:id,tenant_id:t.tenant_id,club_id:t.host_club_id,operation_id:operationId},'-created_date',2);
   return Response.json({success:true,saved:matches.length>0});
  }
  if(['admin_comms_templates','admin_comms_save_draft','admin_comms_send'].includes(action)){
   const templateEntity=base44.asServiceRole.entities.CommunicationTemplate;
   if(action==='admin_comms_save_draft'){
    const name=clean(b.name,120),subject=clean(b.subject,200),body=String(b.body||'').trim().slice(0,12000);
    if(!name||!subject||!body)return fail('Template name, subject and body required');
    const user=await base44.auth.me();
    const draft=await templateEntity.create({owner_scope:'tenant',tenant_id:t.tenant_id,club_id:t.host_club_id,module:'Events',name,purpose:'event_manual_followup',version:'1.0',status:'draft',subject_template:subject,plain_text_template:body,created_by_user_id:user.id});
    return Response.json({success:true,draftId:draft.id,status:'draft',sent:false});
   }
   const templates=await templateEntity.filter({tenant_id:t.tenant_id,status:'approved'},'-updated_date',100);
   if(!Array.isArray(templates)||templates.length>=100)return fail('Approved template inventory incomplete',503);
   const eligible=templates.filter((x:any)=>x.owner_scope==='tenant'&&(!x.club_id||x.club_id===t.host_club_id)&&x.subject_template&&(x.plain_text_template||x.html_template));
   if(action==='admin_comms_templates')return Response.json({success:true,templates:eligible.map((x:any)=>({id:x.id,name:x.name,purpose:x.purpose,subject:x.subject_template,body:x.plain_text_template||''}))});
   const registrationId=clean(b.registrationId,100);
   const registrations=await readBookingRegistrations(base44.asServiceRole.entities.EventRegistration,{eventId:id,tenantId:t.tenant_id,clubId:t.host_club_id});
   const registration=registrations.find((x:any)=>x.id===registrationId);
   if(!registration||!registration.email||!/^\S+@\S+\.\S+$/.test(registration.email))return fail('Verified event recipient required',400);
   const template=eligible.find((x:any)=>x.id===clean(b.templateId,100));
   if(!template)return fail('Approved tenant template required',409);
   const values=eventTemplateValues(t,registration,registration.payment_checkout_url?`Payment link: ${registration.payment_checkout_url}`:'');
   const interpolate=(v:string)=>String(v||'').replace(/\{\{\s*([A-Z_]+)\s*\}\}/g,(_:string,k:string)=>String(values[k]??''));
   const subject=String(b.subjectOverride||'').trim()?clean(b.subjectOverride,200):interpolate(template.subject_template);
   const body=String(b.bodyOverride||'').trim()?clean(b.bodyOverride,12000):interpolate(template.plain_text_template);
   if(!subject||!body)return fail('Message content missing',409);
   if(b.confirmSend!==true)return Response.json({success:true,preview:true,recipient:registration.email,subject,body,templateId:template.id});
   // Fail closed until the shared Communications Engine checks endpoint-level suppression, consent and idempotency.
   return fail('Manual sending is unavailable until consent, suppression and duplicate-send checks are integrated',503);
   if(clean(b.confirmRecipient,200).toLowerCase()!==String(registration.email).toLowerCase())return fail('Recipient confirmation does not match',409);
   const club=(await base44.asServiceRole.entities.Club.filter({id:t.host_club_id},'-created_date',1))?.[0];
   if(!club)return fail('Club branding unavailable',503);
   const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({tenant_id:t.tenant_id,owner_scope:'tenant',status:'active'},'-updated_date',30);
   const kit=kits.find((x:any)=>!x.club_id||x.club_id===t.host_club_id);
   if(!kit)return fail('Approved club brand kit missing',503);
   const safe=body.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','<br>');
   const html=renderBasicBrandedEmail(`<p>${safe}</p>`,kit,club,club.name,'Event communication');
   const delivery=await sendWithConfiguredEmailTransport(base44,{scopeType:'tenant',purpose:'club_comms',tenantId:t.tenant_id,clubId:t.host_club_id},{to:registration.email,subject,textBody:body,htmlBody:html,senderName:club.name});
   const user=await base44.auth.me();
   await base44.asServiceRole.entities.CommunicationMessage.create({campaign_id:`event_${id}`,tenant_id:t.tenant_id,channel:'email',template_id:template.id,template_version:template.version||'1.0',subject,plain_text_body:body,status:'sent',created_by_user_id:user.id,metadata:{event_id:id,registration_id:registration.id,recipient_email:registration.email,provider:delivery.provider,kind:'event_manual_send'}});
   return Response.json({success:true,sent:true,recipient:registration.email});
  }
  if(action==='admin_alternative_dates'){
   const candidates=await base44.asServiceRole.entities.Tournament.filter({tenant_id:t.tenant_id,host_club_id:t.host_club_id,event_registration_mode:'rallyhub',event_booking_enabled:true,event_publish_status:'published',event_public_visible:true},'start_date',100);
   const alternatives=[];
   for(const candidate of candidates){
    if(candidate.id===t.id||candidate.location!==t.location||!candidate.event_capacity||!candidate.event_slug||String(candidate.start_date||'')<new Date().toISOString().slice(0,10))continue;
    const used=await countActiveEventRegistrations(base44.asServiceRole.entities.EventRegistration,{eventId:candidate.id,tenantId:t.tenant_id,clubId:t.host_club_id});
    if(used<Number(candidate.event_capacity))alternatives.push({id:candidate.id,name:candidate.name,date:candidate.start_date,slug:candidate.event_slug,placesRemaining:Number(candidate.event_capacity)-used});
   }
   return Response.json({success:true,alternatives,readOnly:true});
  }
  if(action==='admin_notice_preview'){
   const noticeType=clean(b.noticeType||'booking_confirmed',50);
   if(!EVENT_NOTICE_TYPES.includes(noticeType))return fail('Unknown notice type');
   const club=(await base44.asServiceRole.entities.Club.filter({id:t.host_club_id},'-created_date',1))?.[0]||{name:'Clare Pickleball'};
   const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({tenant_id:t.tenant_id,owner_scope:'tenant',status:'active'},'-updated_date',30);
   const kit=kits.find((k:any)=>!k.club_id||k.club_id===t.host_club_id);
   const body=eventNoticeBody(noticeType,clean(b.firstName||'Participant',60),t.name,clean(b.detail||'',300));
   const recipients=eventNoticeRecipients(noticeType,clean(b.email||'participant@example.invalid'),t.event_booking_policy||{});
   const html=renderBasicBrandedEmail('<p style="white-space:pre-line">'+body.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','<br>')+'</p>',kit,club,club.name||'Clare Pickleball','Event booking update');
   return Response.json({success:true,noticeType,subject:`${t.name} · ${noticeType.replaceAll('_',' ')}`,body,html,recipients,delivery:'preview_only'});
  }
  if(action==='get'){
   const used=await countActiveEventRegistrations(base44.asServiceRole.entities.EventRegistration,{eventId:id,tenantId:t.tenant_id,clubId:t.host_club_id});
   const publicEvent={id:t.id,name:t.name,date:t.start_date,venue:t.location,capacity,placesRemaining:Math.max(0,capacity-used),fee:Number(t.event_fee_amount||0),currency:t.event_currency||'EUR',approvalRequired:t.event_booking_policy?.approval_required!==false};
   const otherDates=await base44.asServiceRole.entities.Tournament.filter({tenant_id:t.tenant_id,host_club_id:t.host_club_id,event_registration_mode:'rallyhub',event_booking_enabled:true,event_publish_status:'published',event_public_visible:true},'-start_date',100);
   const alternatives=otherDates.filter((e:any)=>e.id!==id&&e.event_capacity>0&&e.location===t.location&&e.name?.includes('Taster')&&e.start_date>=new Date().toISOString().slice(0,10)).sort((a:any,b:any)=>String(a.start_date).localeCompare(String(b.start_date)));
   let alternative=null;
   for(const candidate of alternatives){const candidateUsed=await countActiveEventRegistrations(base44.asServiceRole.entities.EventRegistration,{eventId:candidate.id,tenantId:t.tenant_id,clubId:t.host_club_id});if(candidateUsed<Number(candidate.event_capacity)){alternative=candidate;break;}}
   const docs=await base44.asServiceRole.entities.ClubLegalDocument.filter({tenant_id:t.tenant_id,club_id:t.host_club_id,active:true},'-effective_from',100);
   return Response.json({success:true,event:{...publicEvent,alternative:alternative?{name:alternative.name,date:alternative.start_date,slug:alternative.event_slug}:null},consents:docs.filter((d:any)=>['liability_waiver','code_of_conduct','health_declaration','privacy_data','photo_video'].includes(d.document_type)).map((d:any)=>({type:d.document_type,version:d.version,label:d.consent_label||d.document_type,content:d.body_text||'',optional:d.document_type==='photo_video'}))});
  }
  stage='roster_verification';
  const rows=await readBookingRegistrations(base44.asServiceRole.entities.EventRegistration,{eventId:id,tenantId:t.tenant_id,clubId:t.host_club_id});
  if(action==='admin_approve'||action==='admin_verify'||action==='admin_refund_payment'||action==='admin_resend_payment_link'){
   const registration=rows.find((r:any)=>r.id===clean(b.registrationId,100));if(!registration)return fail('Registration not found',404);
   const accountRows=await base44.asServiceRole.entities.PaymentGatewayAccount.filter({tenant_id:t.tenant_id,club_id:t.host_club_id,provider:'sumup',status:'connected',is_default:true},'-updated_date',5);
   const accountRow=accountRows?.[0];const account=accountRow?{provider:'sumup',merchantAccountId:accountRow.merchant_account_id||'',credentialSecretName:accountRow.credential_reference||'SUMUP_API_KEY',connectionMode:accountRow.connection_mode||'api_key'}:null;
   if(action==='admin_refund_payment'){
    if(b.confirmRefund!==true)return fail('Explicit refund confirmation required');
    const reason=clean(b.reason,500);if(!reason)return fail('Refund reason required');
    const payments=await readAdminEventPayments(base44.asServiceRole.entities.PaymentRecord,{tenantId:t.tenant_id,clubId:t.host_club_id,registrationIds:[registration.id]});
    const selection=selectRefundableEventPayment(payments,registration);if(!selection.payment)return fail('Refund requires payment reconciliation: '+selection.reason,409);
    const payment=selection.payment;
    const transactionId=clean(payment.provider_transaction_id||registration.payment_transaction_id,120);
    if(!transactionId)return fail('SumUp transaction reference missing; verify payment first',409);
    const previous=await readPaymentRefundHistory(base44.asServiceRole.entities.PaymentRefund,{paymentId:payment.id,tenantId:t.tenant_id,clubId:t.host_club_id});
    const refundBalance=refundRemaining(payment,previous);if(refundBalance.blocked)return fail('Refund requires reconciliation: '+refundBalance.blocked,409);
    const alreadyRefunded=Number(payment.amount||0)-refundBalance.remaining;
    const remaining=refundBalance.remaining;
    const amount=b.refundAmount===undefined?remaining:Math.round(Number(b.refundAmount)*100)/100;
    if(!Number.isFinite(amount)||amount<=0||amount>remaining)return fail('Invalid refund amount',400);
    // Atomically reserve this payment for one refund operation before calling SumUp.
    // If an operation fails or times out, leave refund_pending for manual reconciliation; never blindly retry.
    const refundLock=await base44.asServiceRole.entities.PaymentRecord.updateMany({id:payment.id,tenant_id:t.tenant_id,club_id:t.host_club_id,payment_status:payment.payment_status},{$set:{payment_status:'refund_pending'}});
    if(refundLock?.updated!==1)return fail('Refund already in progress or payment changed. Refresh and reconcile.',409);
    const now=new Date().toISOString();
    const refund=await base44.asServiceRole.entities.PaymentRefund.create({tenant_id:t.tenant_id,club_id:t.host_club_id,payment_record_id:payment.id,person_id:payment.person_id||'',purpose_type:'event',purpose_id:registration.id,provider:'sumup',provider_account_id:payment.provider_account_id||'',provider_transaction_id:transactionId,amount,currency:payment.currency||'EUR',status:'processing',reason,requested_by_user_id:(await base44.auth.me()).id,requested_at:now,source_system:'rallyhub_event'});
    let providerOutcome:any=null;
    try{
     const result=await refundPayment({provider:'sumup',account,transactionId,amount:alreadyRefunded===0&&amount===Number(payment.amount)?undefined:amount,currency:payment.currency||'EUR'});providerOutcome=result;
     const total=Math.round((alreadyRefunded+amount)*100)/100,full=total>=Number(payment.amount)-0.001;
     await base44.asServiceRole.entities.PaymentRefund.update(refund.id,{status:'succeeded',provider_refund_id:result.refundId||'',provider_status:result.providerStatus||'REFUNDED',completed_at:new Date().toISOString()});
     await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{payment_status:full?'refunded':'partially_refunded',amount_refunded:total,last_refund_at:new Date().toISOString(),provider_status:result.providerStatus||'REFUNDED'});
     await base44.asServiceRole.entities.EventRegistration.update(registration.id,{payment_status:full?'refunded':'partially_refunded'});
     return Response.json({success:true,refundAmount:amount,refundId:refund.id,status:full?'refunded':'partially_refunded',bookingStatus:registration.registration_status});
    }catch(error){await base44.asServiceRole.entities.PaymentRefund.update(refund.id,{status:'needs_reconciliation',provider_status:providerOutcome?.providerStatus||'UNKNOWN',provider_refund_id:providerOutcome?.refundId||''});throw error;}
   }
   if(action==='admin_resend_payment_link'){
    if(registration.registration_status!=='approved_payment_hold'||registration.payment_status!=='pending')return fail('No outstanding approved payment request',409);
    const expires=Date.parse(registration.payment_hold_expires_at||'');
    if(!Number.isFinite(expires)||expires<=Date.now())return fail('Payment hold expired. Do not resend an expired checkout; reconcile before creating a new one.',409);
    if(!registration.payment_checkout_id||!registration.payment_checkout_url)return fail('No existing checkout to resend',409);
    const paymentRows=await base44.asServiceRole.entities.PaymentRecord.filter({id:registration.payment_record_id,tenant_id:t.tenant_id,club_id:t.host_club_id,purpose_type:'event',purpose_id:registration.id},'-created_date',2);
    if(paymentRows.length!==1||paymentRows[0].payment_status!=='pending'||paymentRows[0].provider_checkout_id!==registration.payment_checkout_id)return fail('Payment record needs reconciliation before resend',409);
    const result=await retrievePayment('sumup',registration.payment_checkout_id,account);
    if(result.normalizedStatus==='paid')return fail('Payment may already be complete. Verify payment before resending.',409);
    if(!['pending','unpaid','unknown'].includes(String(result.normalizedStatus||'').toLowerCase()))return fail('Provider checkout is not confirmed outstanding',409);
    await deliverEventNotice(base44,t,registration,'payment_required',`Payment link: ${registration.payment_checkout_url}`);
    return Response.json({success:true,resent:true,checkoutUrl:registration.payment_checkout_url,expiresAt:registration.payment_hold_expires_at});
   }
   if(action==='admin_approve'){
    if(registration.registration_status!=='pending_approval')return fail('Application is not awaiting approval',409);
    const amount=Number(t.event_fee_amount||0);
    if(amount>0&&(!account||!providerConfigured('sumup',account)))return fail('Tenant SumUp is not connected',503);
    let checkoutUrls:any=null;
    if(amount>0){try{checkoutUrls=resolveEventCheckoutUrls({callbackBase:Deno.env.get('RALLYHUB_EVENT_CALLBACK_BASE_URL'),publicBase:Deno.env.get('RALLYHUB_EVENT_PUBLIC_BASE_URL'),slug:t.event_slug})}catch{return fail('Tenant checkout callback is not configured; approval has not been changed',503)}}
    const expires=new Date(Date.now()+Math.min(120,Math.max(1,Number(t.event_booking_policy?.payment_hold_minutes??30)))*60000).toISOString();
    const approvalLocked=await acquireEventApprovalLock(base44.asServiceRole.entities.EventRegistration,{registration,eventId:id,tenantId:t.tenant_id,clubId:t.host_club_id});
    if(!approvalLocked)return fail('Approval already in progress or registration changed. Refresh and reconcile.',409);
    // A failed or timed-out provider call intentionally leaves approval_processing for reconciliation.
    // Never create a second checkout automatically after an uncertain provider response.
    if(amount===0){await base44.asServiceRole.entities.EventRegistration.update(registration.id,{registration_status:'confirmed',payment_status:'not_required',approved_at:new Date().toISOString(),confirmed_at:new Date().toISOString()});await deliverEventNotice(base44,t,registration,'booking_confirmed');return Response.json({success:true,status:'confirmed'});}
    const checkout=await createCheckout({provider:'sumup',account,amount,currency:t.event_currency||'EUR',reference:`ev_${registration.id}`.slice(0,64),description:t.name,...checkoutUrls});
    // Register checkout before customer pays: the SumUp webhook resolves this record.
    const payment=await base44.asServiceRole.entities.PaymentRecord.create({tenant_id:t.tenant_id,club_id:t.host_club_id,person_id:registration.person_id||'',purpose_type:'event',purpose_id:registration.id,payment_type:'event_registration',amount,currency:t.event_currency||'EUR',payment_method:'sumup',payment_status:'pending',provider:'sumup',provider_account_id:accountRow?.id||'',provider_checkout_id:checkout.checkoutId,provider_checkout_url:checkout.checkoutUrl,provider_status:'PENDING',source_system:'rallyhub_event'});
    await base44.asServiceRole.entities.EventRegistration.update(registration.id,{registration_status:'approved_payment_hold',payment_status:'pending',payment_record_id:payment.id,payment_hold_expires_at:expires,payment_checkout_id:checkout.checkoutId,payment_checkout_url:checkout.checkoutUrl,approved_at:new Date().toISOString()});
    await deliverEventNotice(base44,t,{...registration,payment_hold_expires_at:expires},'payment_required',`Payment link: ${checkout.checkoutUrl}`);return Response.json({success:true,status:'approved_payment_hold',checkoutUrl:checkout.checkoutUrl,expiresAt:expires});
   }
   if(!registration.payment_checkout_id)return fail('No checkout recorded',409);
   const result=await retrievePayment('sumup',registration.payment_checkout_id,account);
   if(result.normalizedStatus!=='paid')return Response.json({success:true,status:registration.registration_status,paymentStatus:result.normalizedStatus});
   const paymentReview=reviewVerifiedEventCheckout(result,{amount:Number(t.event_fee_amount||0),currency:t.event_currency||'EUR',merchantCode:account?.merchantAccountId,checkoutId:registration.payment_checkout_id});
   if(!paymentReview.verified)return fail('SumUp payment requires reconciliation: '+paymentReview.issues.join(', '),409);
   if(registration.registration_status!=='confirmed'&&!canConfirm(registration,Date.now()))return fail('Paid checkout requires manual reconciliation: hold expired or already processed',409);
   const existingPayments=await readAdminEventPayments(base44.asServiceRole.entities.PaymentRecord,{tenantId:t.tenant_id,clubId:t.host_club_id,registrationIds:[registration.id]});
   const selectedCheckout=selectCheckoutPayment(existingPayments,registration);if(selectedCheckout.reason)return fail('Payment requires manual reconciliation: '+selectedCheckout.reason,409);
   let payment=selectedCheckout.payment;
   if(!payment)payment=await base44.asServiceRole.entities.PaymentRecord.create({tenant_id:t.tenant_id,club_id:t.host_club_id,person_id:registration.person_id||'',purpose_type:'event',purpose_id:registration.id,payment_type:'event_registration',amount:Number(t.event_fee_amount||0),currency:t.event_currency||'EUR',payment_method:'sumup',payment_status:'paid',provider:'sumup',provider_account_id:accountRow?.id||'',provider_checkout_id:registration.payment_checkout_id,provider_checkout_url:registration.payment_checkout_url||'',provider_transaction_id:result.transactionId,provider_payment_reference:result.transactionCode||'',provider_status:result.providerStatus||'PAID',source_system:'rallyhub_event'});
   if(payment.payment_status!=='paid')await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{payment_status:'paid',payment_date:new Date().toISOString().slice(0,10),provider_status:result.providerStatus||'PAID',provider_transaction_id:result.transactionId,provider_payment_reference:result.transactionCode||'',external_payment_reference:result.transactionCode||''});
   const claimed=await claimPaidEventConfirmation(base44.asServiceRole.entities.EventRegistration,{registration,tenantId:t.tenant_id,clubId:t.host_club_id,eventId:id,paymentId:payment.id,transactionId:result.transactionId});
   if(claimed)await deliverEventNotice(base44,t,registration,'booking_confirmed');
   return Response.json({success:true,status:claimed?'confirmed':'confirmation_already_processed_or_changed',paymentStatus:'paid',notificationClaimed:claimed});
  }
  if(action==='payment_status'){
   const operationId=clean(b.operationId,100);
   if(!operationId)return fail('Booking reference required');
   const matches=await base44.asServiceRole.entities.EventRegistration.filter({event_id:id,tenant_id:t.tenant_id,club_id:t.host_club_id,operation_id:operationId},'-created_date',2);
   const reg=matches?.[0];if(!reg)return fail('Booking not found',404);
   return Response.json({success:true,status:reg.registration_status,paymentStatus:reg.payment_status,confirmed:reg.registration_status==='confirmed'});
  }
  if(action!=='apply')return fail('Unsupported action');
  const name=clean(b.fullName,120),email=clean(b.email,180).toLowerCase(),mobile=clean(b.mobile,40),emergencyName=clean(b.emergencyContactName,120),emergencyMobile=clean(b.emergencyContactMobile,40),operationId=clean(b.operationId,100);
  if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)||!mobile||!emergencyName||!emergencyMobile||!operationId)return fail('Name, email, mobile, emergency contact and operation ID required');
  if(rows.some((r:any)=>r.operation_id===operationId))return Response.json({success:true,received:true,status:rows.find((r:any)=>r.operation_id===operationId)?.registration_status,message:'Your application has already been received.'});
  if(duplicate(rows,email))return fail('This email may already have an application. Please contact the organiser.',409);
  const docs=await base44.asServiceRole.entities.ClubLegalDocument.filter({tenant_id:t.tenant_id,club_id:t.host_club_id,active:true},'-effective_from',100);
  stage='consent';
  const now=new Date().toISOString();const evidence=consentEvidence(b,docs,now);
  // Initialise from existing active applications once, then atomically reserve.
  stage='capacity_check';
  const current=await readBookingRegistrations(base44.asServiceRole.entities.EventRegistration,{eventId:id,tenantId:t.tenant_id,clubId:t.host_club_id});
  if(current.some((r:any)=>r.operation_id===operationId))return Response.json({success:true,received:true,message:'Your application has already been received.'});
  if(duplicate(current,email))return fail('This email may already have an application. Please contact the organiser.',409);
  const observedOccupied=occupied(current);
  await base44.asServiceRole.entities.Tournament.updateMany({id,tenant_id:t.tenant_id,event_reserved_count:null},{$set:{event_reserved_count:observedOccupied}});
  // Never trust a stale under-counted counter: raise it atomically to at least the observed active roster.
  await base44.asServiceRole.entities.Tournament.updateMany({id,tenant_id:t.tenant_id,event_reserved_count:{$lt:observedOccupied}},{$set:{event_reserved_count:observedOccupied}});
  // Validate checkout configuration before reserving a paid place; do not strand a capacity hold for a missing gateway.
  if(t.event_booking_policy?.approval_required===false&&Number(t.event_fee_amount||0)>0){
   const accounts=await base44.asServiceRole.entities.PaymentGatewayAccount.filter({tenant_id:t.tenant_id,club_id:t.host_club_id,provider:'sumup',status:'connected',is_default:true},'-updated_date',5);
   const row=accounts?.[0];const account=row?{provider:'sumup',merchantAccountId:row.merchant_account_id||'',credentialSecretName:row.credential_reference||'SUMUP_API_KEY',connectionMode:row.connection_mode||'api_key'}:null;
   if(!account||!providerConfigured('sumup',account))return fail('The club SumUp connection is unavailable. No place has been reserved.',503);
   try{resolveEventCheckoutUrls({callbackBase:Deno.env.get('RALLYHUB_EVENT_CALLBACK_BASE_URL'),publicBase:Deno.env.get('RALLYHUB_EVENT_PUBLIC_BASE_URL'),slug:t.event_slug})}catch{return fail('SumUp callback configuration is unavailable. No place has been reserved.',503)}
  }
  const claim=await base44.asServiceRole.entities.Tournament.updateMany({id,tenant_id:t.tenant_id,event_reserved_count:{$lt:capacity}},{$inc:{event_reserved_count:1}});
  const accepted=claim.updated===1;
  const status=accepted?'pending_approval':'waitlisted';
  if(!accepted&&!t.event_waitlist_enabled)return fail('Event is full',409);
  stage='record_create';
  try{
   const saved=await base44.asServiceRole.entities.EventRegistration.create({tenant_id:t.tenant_id,club_id:t.host_club_id,event_id:id,full_name:name,email,email_key:email,mobile,emergency_contact_name:emergencyName,emergency_contact_mobile:emergencyMobile,previous_experience:clean(b.previousExperience,250),previous_sports:Array.isArray(b.previousSports)?b.previousSports.filter((x:any)=>typeof x==='string').slice(0,12):[],health_declaration_applies:b.healthDeclarationApplies===true,medical_note:clean(b.medicalNote,1000),consent_evidence:evidence,photo_video_consent:!!b.consents?.photo_video,registration_status:status,payment_status:'not_required',operation_id:operationId,created_at:now});
   if(!saved?.id)throw Error('Registration create returned no record ID');
   const persisted=await base44.asServiceRole.entities.EventRegistration.get(saved.id);
   if(!persisted||persisted.operation_id!==operationId)throw Error('Registration persistence verification failed');
   if(accepted&&t.event_booking_policy?.approval_required===false){
    stage='automatic_checkout';
    const amount=Number(t.event_fee_amount||0);
    if(amount===0){await base44.asServiceRole.entities.EventRegistration.update(saved.id,{registration_status:'confirmed',payment_status:'not_required',confirmed_at:new Date().toISOString()});await deliverEventNotice(base44,t,saved,'booking_confirmed');return Response.json({success:true,received:true,status:'confirmed',message:'Your free booking is confirmed.'});}
    const accounts=await base44.asServiceRole.entities.PaymentGatewayAccount.filter({tenant_id:t.tenant_id,club_id:t.host_club_id,provider:'sumup',status:'connected',is_default:true},'-updated_date',5);
    const row=accounts?.[0];const account=row?{provider:'sumup',merchantAccountId:row.merchant_account_id||'',credentialSecretName:row.credential_reference||'SUMUP_API_KEY',connectionMode:row.connection_mode||'api_key'}:null;
    if(!account||!providerConfigured('sumup',account))return fail('SumUp unavailable. Your place is reserved; contact the organiser. Do not submit again.',503);
    const urls=resolveEventCheckoutUrls({callbackBase:Deno.env.get('RALLYHUB_EVENT_CALLBACK_BASE_URL'),publicBase:Deno.env.get('RALLYHUB_EVENT_PUBLIC_BASE_URL'),slug:t.event_slug});
    if(privateAccess){const site=new URL(Deno.env.get('RALLYHUB_EVENT_PUBLIC_BASE_URL')||'');urls.redirectUrl=new URL('/private-event/'+encodeURIComponent(id)+'/'+encodeURIComponent(b.invitationToken),site).toString();}
    const locked=await acquireEventApprovalLock(base44.asServiceRole.entities.EventRegistration,{registration:persisted,eventId:id,tenantId:t.tenant_id,clubId:t.host_club_id});
    if(!locked)return fail('Payment is being prepared. Contact the organiser before retrying.',409);
    const checkout=await createCheckout({provider:'sumup',account,amount,currency:t.event_currency||'EUR',reference:`ev_${saved.id}`.slice(0,64),description:t.name,...urls});
    const payment=await base44.asServiceRole.entities.PaymentRecord.create({tenant_id:t.tenant_id,club_id:t.host_club_id,purpose_type:'event',purpose_id:saved.id,payment_type:'event_registration',amount,currency:t.event_currency||'EUR',payment_method:'sumup',payment_status:'pending',provider:'sumup',provider_account_id:row.id,provider_checkout_id:checkout.checkoutId,provider_checkout_url:checkout.checkoutUrl,provider_status:'PENDING',source_system:'rallyhub_event'});
    const expires=new Date(Date.now()+Math.min(120,Math.max(1,Number(t.event_booking_policy?.payment_hold_minutes??15)))*60000).toISOString();
    await base44.asServiceRole.entities.EventRegistration.update(saved.id,{registration_status:'approved_payment_hold',payment_status:'pending',payment_record_id:payment.id,payment_hold_expires_at:expires,payment_checkout_id:checkout.checkoutId,payment_checkout_url:checkout.checkoutUrl,approved_at:new Date().toISOString()});
    await deliverEventNotice(base44,t,{...saved,payment_hold_expires_at:expires},'payment_required',`Payment link: ${checkout.checkoutUrl}`);
    return Response.json({success:true,received:true,status:'approved_payment_hold',checkoutUrl:checkout.checkoutUrl,operationId,expiresAt:expires,message:'Continue to secure SumUp payment. Your booking is confirmed only after payment verification.'});
   }
  }catch(error){
   if(stage==='automatic_checkout')throw error;
   if(accepted)await base44.asServiceRole.entities.Tournament.updateMany({id,tenant_id:t.tenant_id,event_reserved_count:{$gt:0}},{$inc:{event_reserved_count:-1}});
   throw error;
  }
  try{await deliverEventNotice(base44,t,{full_name:name,email},accepted?'application_received':'waitlist_joined');}catch(noticeError){console.error('Event application saved but notification delivery failed',noticeError);}
  return Response.json({success:true,received:true,status,message:accepted?'Application received. Await organiser approval.':'Event full. You have joined the waiting list.'});
 }catch(e){const message=String(e?.message||e||'Unknown error');console.error('event registration error',stage,message,e?.stack);if(message.startsWith('Event payment verification')||message.startsWith('Event payment pagination')||message.startsWith('Event payment record missing ID'))return fail('Event payment records could not be fully verified. No financial action was taken; please try again later.',503);if(message.startsWith('Event registration verification')||message.startsWith('Event registration pagination')||message.startsWith('Event registration missing ID'))return fail('Booking records could not be fully verified. No new booking has been accepted; please try again later or contact the organiser.',503);if(message.startsWith('Required consent missing:'))return fail('Please accept the required document: '+message.split(':')[1].trim().replaceAll('_',' '),400);return fail(`Registration could not be saved (stage: ${stage}). Your details remain in the form. Please contact the organiser.`,503)}
});