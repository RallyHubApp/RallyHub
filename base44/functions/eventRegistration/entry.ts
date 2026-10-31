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
  const adminActions=['admin_list','admin_page','admin_approve','admin_verify','admin_refund_payment','admin_notice_preview'];
  const isAdminAction=adminActions.includes(action);
  if(!t||(!isAdminAction&&(!t.event_booking_enabled||t.event_registration_mode!=='rallyhub'||t.event_publish_status!=='published'||!t.event_public_visible)))return fail('Bookings are not open for this event',404);
  if(isAdminAction){const user=await base44.auth.me().catch(()=>null);if(!user||user.role!=='admin')return fail('Admin access required',403);if(!t.tenant_id||!t.host_club_id||String(user.active_tenant_id||'')!==String(t.tenant_id)||String(user.active_club_id||'')!==String(t.host_club_id))return fail('Event outside selected tenant or club',403);}
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
  stage='roster_verification';
  const rows=await readBookingRegistrations(base44.asServiceRole.entities.EventRegistration,{eventId:id,tenantId:t.tenant_id,clubId:t.host_club_id});
  const publicEvent={id:t.id,name:t.name,date:t.start_date,venue:t.location,capacity,placesRemaining:Math.max(0,capacity-occupied(rows)),fee:Number(t.event_fee_amount||0),currency:t.event_currency||'EUR'};
  if(action==='get'){
   const used=await countActiveEventRegistrations(base44.asServiceRole.entities.EventRegistration,{eventId:id,tenantId:t.tenant_id,clubId:t.host_club_id});
   const publicEvent={id:t.id,name:t.name,date:t.start_date,venue:t.location,capacity,placesRemaining:Math.max(0,capacity-used),fee:Number(t.event_fee_amount||0),currency:t.event_currency||'EUR'};
   const otherDates=await base44.asServiceRole.entities.Tournament.filter({tenant_id:t.tenant_id,host_club_id:t.host_club_id,event_registration_mode:'rallyhub',event_booking_enabled:true,event_publish_status:'published',event_public_visible:true},'-start_date',100);
   const alternatives=otherDates.filter((e:any)=>e.id!==id&&e.event_capacity>0&&e.location===t.location&&e.name?.includes('Taster')&&e.start_date>=new Date().toISOString().slice(0,10)).sort((a:any,b:any)=>String(a.start_date).localeCompare(String(b.start_date)));
   let alternative=null;
   for(const candidate of alternatives){const candidateUsed=await countActiveEventRegistrations(base44.asServiceRole.entities.EventRegistration,{eventId:candidate.id,tenantId:t.tenant_id,clubId:t.host_club_id});if(candidateUsed<Number(candidate.event_capacity)){alternative=candidate;break;}}
   const docs=await base44.asServiceRole.entities.ClubLegalDocument.filter({tenant_id:t.tenant_id,club_id:t.host_club_id,active:true},'-effective_from',100);
   return Response.json({success:true,event:{...publicEvent,alternative:alternative?{name:alternative.name,date:alternative.start_date,slug:alternative.event_slug}:null},consents:docs.filter((d:any)=>['liability_waiver','code_of_conduct','health_declaration','privacy_data','photo_video'].includes(d.document_type)).map((d:any)=>({type:d.document_type,version:d.version,label:d.consent_label||d.document_type,content:d.body_text||'',optional:d.document_type==='photo_video'}))});
  }
  if(action==='admin_approve'||action==='admin_verify'||action==='admin_refund_payment'){
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
    try{
     const result=await refundPayment({provider:'sumup',account,transactionId,amount:alreadyRefunded===0&&amount===Number(payment.amount)?undefined:amount,currency:payment.currency||'EUR'});
     const total=Math.round((alreadyRefunded+amount)*100)/100,full=total>=Number(payment.amount)-0.001;
     await base44.asServiceRole.entities.PaymentRefund.update(refund.id,{status:'succeeded',provider_refund_id:result.refundId||'',provider_status:result.providerStatus||'REFUNDED',completed_at:new Date().toISOString()});
     await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{payment_status:full?'refunded':'partially_refunded',amount_refunded:total,last_refund_at:new Date().toISOString(),provider_status:result.providerStatus||'REFUNDED'});
     await base44.asServiceRole.entities.EventRegistration.update(registration.id,{payment_status:full?'refunded':'partially_refunded'});
     return Response.json({success:true,refundAmount:amount,refundId:refund.id,status:full?'refunded':'partially_refunded',bookingStatus:registration.registration_status});
    }catch(error){await base44.asServiceRole.entities.PaymentRefund.update(refund.id,{status:'needs_reconciliation',provider_status:'UNKNOWN'});throw error;}
   }
   if(action==='admin_approve'){
    if(registration.registration_status!=='pending_approval')return fail('Application is not awaiting approval',409);
    const amount=Number(t.event_fee_amount||0);
    if(amount>0&&(!account||!providerConfigured('sumup',account)))return fail('Tenant SumUp is not connected',503);
    const expires=new Date(Date.now()+Math.min(120,Math.max(1,Number(t.event_booking_policy?.payment_hold_minutes??30)))*60000).toISOString();
    if(amount===0){await base44.asServiceRole.entities.EventRegistration.update(registration.id,{registration_status:'confirmed',payment_status:'not_required',approved_at:new Date().toISOString(),confirmed_at:new Date().toISOString()});await deliverEventNotice(base44,t,registration,'booking_confirmed');return Response.json({success:true,status:'confirmed'});}
    const checkout=await createCheckout({provider:'sumup',account,amount,currency:t.event_currency||'EUR',reference:`ev_${registration.id}`.slice(0,64),description:t.name,redirectUrl:`https://rallyhub.ie/events/${t.event_slug}`,returnUrl:"https://rallyhub.ie/api/apps/6a01dc00702b7dd2a2978c28/functions/paymentGatewayWebhook?provider=sumup"});
    // Register checkout before customer pays: the SumUp webhook resolves this record.
    const payment=await base44.asServiceRole.entities.PaymentRecord.create({tenant_id:t.tenant_id,club_id:t.host_club_id,person_id:registration.person_id||'',purpose_type:'event',purpose_id:registration.id,payment_type:'event_registration',amount,currency:t.event_currency||'EUR',payment_method:'sumup',payment_status:'pending',provider:'sumup',provider_account_id:accountRow?.id||'',provider_checkout_id:checkout.checkoutId,provider_checkout_url:checkout.checkoutUrl,provider_status:'PENDING',source_system:'rallyhub_event'});
    await base44.asServiceRole.entities.EventRegistration.update(registration.id,{registration_status:'approved_payment_hold',payment_status:'pending',payment_record_id:payment.id,payment_hold_expires_at:expires,payment_checkout_id:checkout.checkoutId,payment_checkout_url:checkout.checkoutUrl,approved_at:new Date().toISOString()});
    await deliverEventNotice(base44,t,{...registration,payment_hold_expires_at:expires},'payment_required',`Payment link: ${checkout.checkoutUrl}`);return Response.json({success:true,status:'approved_payment_hold',checkoutUrl:checkout.checkoutUrl,expiresAt:expires});
   }
   if(!registration.payment_checkout_id)return fail('No checkout recorded',409);
   const result=await retrievePayment('sumup',registration.payment_checkout_id,account);
   if(result.normalizedStatus!=='paid')return Response.json({success:true,status:registration.registration_status,paymentStatus:result.normalizedStatus});
   if(registration.registration_status!=='confirmed'&&!canConfirm(registration,Date.now()))return fail('Paid checkout requires manual reconciliation: hold expired or already processed',409);
   const existingPayments=await readAdminEventPayments(base44.asServiceRole.entities.PaymentRecord,{tenantId:t.tenant_id,clubId:t.host_club_id,registrationIds:[registration.id]});
   const selectedCheckout=selectCheckoutPayment(existingPayments,registration);if(selectedCheckout.reason)return fail('Payment requires manual reconciliation: '+selectedCheckout.reason,409);
   let payment=selectedCheckout.payment;
   if(!payment)payment=await base44.asServiceRole.entities.PaymentRecord.create({tenant_id:t.tenant_id,club_id:t.host_club_id,person_id:registration.person_id||'',purpose_type:'event',purpose_id:registration.id,payment_type:'event_registration',amount:Number(t.event_fee_amount||0),currency:t.event_currency||'EUR',payment_method:'sumup',payment_status:'paid',provider:'sumup',provider_account_id:accountRow?.id||'',provider_checkout_id:registration.payment_checkout_id,provider_checkout_url:registration.payment_checkout_url||'',provider_transaction_id:result.transactionId,provider_payment_reference:result.transactionCode||'',provider_status:result.providerStatus||'PAID',source_system:'rallyhub_event'});
   if(payment.payment_status!=='paid')await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{payment_status:'paid',payment_date:new Date().toISOString().slice(0,10),provider_status:result.providerStatus||'PAID',provider_transaction_id:result.transactionId,provider_payment_reference:result.transactionCode||'',external_payment_reference:result.transactionCode||''});
   await base44.asServiceRole.entities.EventRegistration.update(registration.id,{registration_status:'confirmed',payment_status:'paid',payment_record_id:payment.id,payment_transaction_id:result.transactionId,confirmed_at:registration.confirmed_at||new Date().toISOString()});
   if(registration.registration_status!=='confirmed')await deliverEventNotice(base44,t,registration,'booking_confirmed');return Response.json({success:true,status:'confirmed',paymentStatus:'paid'});
  }
  if(action!=='apply')return fail('Unsupported action');
  const name=clean(b.fullName,120),email=clean(b.email,180).toLowerCase(),mobile=clean(b.mobile,40),emergencyName=clean(b.emergencyContactName,120),emergencyMobile=clean(b.emergencyContactMobile,40),operationId=clean(b.operationId,100);
  if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)||!mobile||!emergencyName||!emergencyMobile||!operationId)return fail('Name, email, mobile, emergency contact and operation ID required');
  if(rows.some((r:any)=>r.operation_id===operationId))return Response.json({success:true,received:true,message:'Your application has already been received.'});
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
  }catch(error){
   if(accepted)await base44.asServiceRole.entities.Tournament.updateMany({id,tenant_id:t.tenant_id,event_reserved_count:{$gt:0}},{$inc:{event_reserved_count:-1}});
   throw error;
  }
  try{await deliverEventNotice(base44,t,{full_name:name,email},accepted?'application_received':'waitlist_joined');}catch(noticeError){console.error('Event application saved but notification delivery failed',noticeError);}
  return Response.json({success:true,received:true,status,message:accepted?'Application received. Await organiser approval.':'Event full. You have joined the waiting list.'});
 }catch(e){const message=String(e?.message||e||'Unknown error');console.error('event registration error',stage,message,e?.stack);if(message.startsWith('Event payment verification')||message.startsWith('Event payment pagination')||message.startsWith('Event payment record missing ID'))return fail('Event payment records could not be fully verified. No financial action was taken; please try again later.',503);if(message.startsWith('Event registration verification')||message.startsWith('Event registration pagination')||message.startsWith('Event registration missing ID'))return fail('Booking records could not be fully verified. No new booking has been accepted; please try again later or contact the organiser.',503);if(message.startsWith('Required consent missing:'))return fail('Please accept the required document: '+message.split(':')[1].trim().replaceAll('_',' '),400);return fail(`Registration could not be saved (stage: ${stage}). Your details remain in the form. Please contact the organiser.`,503)}
});