import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { resolveEmailTransport, sendWithConfiguredEmailTransport } from './emailRouter.ts';
import { resolveApprovedTournivalTemplate } from './tournivalTemplates.ts';
import {queueTournivalCommunication,listTournivalAudience,TOURNIVAL_EVENTS} from './tournivalDelivery.ts';
const clean=(v:any,max=5000)=>String(v??'').trim().slice(0,max);
Deno.serve(async(req)=>{
 try{
  const base44=createClientFromRequest(req); const user=await base44.auth.me();
  if(!user) return Response.json({error:'Authentication required'},{status:401});
  if(user.role!=='admin') return Response.json({error:'Communications admin access required'},{status:403});
  const body=await req.json().catch(()=>({})); const action=clean(body.action,60);
  const ownerScope=body.ownerScope==='platform'?'platform':'tenant';
  const purpose=clean(body.purpose,120); if(!purpose)return Response.json({error:'purpose required'},{status:400});
  const tenantId=clean(body.tenantId||user.active_tenant_id,180); const clubId=clean(body.clubId,180)||null;
  if(ownerScope==='tenant'&&!tenantId)return Response.json({error:'tenantId required for tenant communication'},{status:400});
  const scope:any=ownerScope==='platform'?{scopeType:'platform',purpose}:{scopeType:'tenant',purpose,tenantId,clubId};
  // Read-only preview/validation. Tournival never dispatches via its own mailer.
  // Actual deliveries must be registered, approved and sent by this Centre.
  if(action==='preview_tournival'){
    if(ownerScope!=='tenant'||!clubId)return Response.json({
      error:'Tournival requires an explicit tenant and club scope'
    },{status:400});
    const channel=body.channel==='whatsapp'?'whatsapp':'email';
    try{
      const rendered=await resolveApprovedTournivalTemplate(base44,{
        tenantId,clubId,purpose,channel,fields:body.fields||{}
      });
      return Response.json({success:true,previewOnly:true,deliveryPerformed:false,
        ...rendered});
    }catch(error:any){
      return Response.json({success:false,deliveryPerformed:false,
        error:error?.message||'Approved tenant template unavailable'},{status:409});
    }
  }
  if(action==='tournival_audience'){
    if(ownerScope!=='tenant'||!clubId||!clean(body.eventId,120))
      return Response.json({error:'Tenant, club and event required'},{status:400});
    const event=await base44.asServiceRole.entities.Tournament.filter({
      id:clean(body.eventId,120),tenant_id:tenantId,host_club_id:clubId
    },'-created_date',1);
    if(!event?.length)return Response.json({error:'Tournament not in selected tenant and club'},{status:404});
    const audience=await listTournivalAudience(base44,{tenantId,eventId:event[0].id});
    return Response.json({success:true,sourceModule:'Tournival',eventId:event[0].id,audience});
  }
  if(action==='queue_tournival'||action==='resend_tournival'){
    if(ownerScope!=='tenant'||!clubId||!Object.values(TOURNIVAL_EVENTS).includes(purpose as any))
      return Response.json({error:'Explicit tenant, club and approved event purpose required'},{status:400});
    const eventId=clean(body.eventId,120),sourceRecordId=clean(body.sourceRecordId,120);
    const event=await base44.asServiceRole.entities.Tournament.filter({
      id:eventId,tenant_id:tenantId,host_club_id:clubId
    },'-created_date',1);
    if(!event?.length||String(event[0].format).toLowerCase()!=='tournival')
      return Response.json({error:'Tournival event not found within selected tenant'},{status:404});
    const recipient=body.recipient||{};
    const channel=body.channel==='whatsapp'?'whatsapp':'email';
    const version=Number(body.deliveryVersion||1);
    if(!sourceRecordId||!recipient.id||!Number.isSafeInteger(version)||version<1||version>100)
      return Response.json({error:'Valid source, recipient and delivery version required'},{status:400});
    if(action==='resend_tournival' && (version<=1||clean(body.resendReason,500).length<8))
      return Response.json({error:'Resend needs a new attempt number and documented reason'},{status:400});
    const rendered=await resolveApprovedTournivalTemplate(base44,{
      tenantId,clubId,purpose,channel,fields:body.fields||{}
    });
    const queued=await queueTournivalCommunication(base44,{
      tenantId,clubId,eventId,purpose,recipient,channel,fields:body.fields||{},
      rendered,sourceRecordId,operationId:clean(body.operationId,120),
      deliveryVersion:version,resendReason:clean(body.resendReason,500)
    });
    return Response.json({success:true,deliveryPerformed:false,
      ...queued,channel,purpose,deliveryVersion:version});
  }
  // Only the operator can release a pre-queued email. Claim the attempt
  // atomically before provider contact. Ambiguous sends stay 'sending' and
  // require investigation rather than unsafe automatic retries.
  if(action==='dispatch_tournival'){
    if(ownerScope!=='tenant'||!clubId||body.confirmDispatch!==true)
      return Response.json({error:'Explicit tenant and operator send confirmation required'},{status:400});
    const attemptId=clean(body.attemptId,120);
    const attempts=await base44.asServiceRole.entities.CommunicationDeliveryAttempt.filter({
      id:attemptId,tenant_id:tenantId
    },'-created_date',1);
    const attempt=attempts?.[0];
    if(!attempt||attempt.status!=='queued')
      return Response.json({error:'Delivery not queued or already claimed'},{status:409});
    if(attempt.channel!=='email')
      return Response.json({error:'WhatsApp provider is not connected for automatic delivery'},{status:409});
    const [messages,recipients,campaigns]=await Promise.all([
      base44.asServiceRole.entities.CommunicationMessage.filter({
        id:attempt.message_id,tenant_id:tenantId
      },'-created_date',1),
      base44.asServiceRole.entities.CommunicationRecipient.filter({
        id:attempt.recipient_id,tenant_id:tenantId
      },'-created_date',1),
      base44.asServiceRole.entities.CommunicationCampaign.filter({
        id:attempt.campaign_id,tenant_id:tenantId,club_id:clubId
      },'-created_date',1)
    ]);
    const [message,recipient,campaign]=[messages?.[0],recipients?.[0],campaigns?.[0]];
    if(!message||!recipient||!campaign||campaign.source_module!=='Tournival'||
       recipient.eligibility_status!=='eligible'||!recipient.email)
      return Response.json({error:'Recipient or campaign is not authorised for delivery'},{status:409});
    let transport:any;
    try{
      transport=await resolveEmailTransport(base44,{
        scopeType:'tenant',tenantId,clubId,purpose:campaign.purpose
      });
    }catch{
      return Response.json({error:'No tenant sender configured for this communication purpose; message remains queued'},{status:409});
    }
    if(transport.status!=='configured')
      return Response.json({error:'Tenant sender is not configured; message remains queued'},{status:409});
    if(transport.provider==='base44_core')
      return Response.json({error:'This tenant sender cannot deliver the approved branded HTML email; message remains queued'},{status:409});
    // Honour tenant channel suppressions and explicit withdrawn preferences
    // immediately before any provider call, including operator resends.
    const people=await base44.asServiceRole.entities.Person.filter({
      tenant_id:tenantId,primary_email:recipient.email
    },'-updated_date',2);
    const personId=recipient.person_id||people?.[0]?.id||'';
    const digest=await crypto.subtle.digest('SHA-256',
      new TextEncoder().encode(recipient.email.trim().toLowerCase()));
    const endpointHash=Array.from(new Uint8Array(digest),
      b=>b.toString(16).padStart(2,'0')).join('');
    const [suppressions,preferences]=await Promise.all([
      base44.asServiceRole.entities.CommunicationSuppression.filter({
        owner_scope:'tenant',tenant_id:tenantId,channel:'email',active:true
      },'-created_date',500),
      personId?base44.asServiceRole.entities.CommunicationPreference.filter({
        owner_scope:'tenant',tenant_id:tenantId,person_id:personId,channel:'email'
      },'-updated_date',100):Promise.resolve([])
    ]);
    const blocked=(suppressions||[]).some((r:any)=>
      (personId&&r.person_id===personId)||(r.endpoint_hash&&r.endpoint_hash===endpointHash))||
      (preferences||[]).some((r:any)=>r.status==='withdrawn'&&
        (!r.purpose||r.purpose===campaign.purpose));
    if(blocked){
      await base44.asServiceRole.entities.CommunicationDeliveryAttempt.updateMany({
        id:attempt.id,tenant_id:tenantId,status:'queued'
      },{$set:{status:'suppressed',error_code:'recipient_suppressed'}});
      await base44.asServiceRole.entities.CommunicationEvent.create({
        campaign_id:campaign.id,message_id:message.id,recipient_id:recipient.id,
        delivery_attempt_id:attempt.id,tenant_id:tenantId,
        event_type:'suppressed',occurred_at:new Date().toISOString(),
        actor_user_id:user.id,metadata:{reason:'centre_channel_suppression'}
      });
      return Response.json({error:'Recipient suppressed by tenant communications preferences; no message sent'},{status:409});
    }
    const claimed=await base44.asServiceRole.entities.CommunicationDeliveryAttempt.updateMany({
      id:attempt.id,tenant_id:tenantId,status:'queued'
    },{$set:{status:'sending'}});
    if(claimed.updated!==1)return Response.json({error:'Another sender claimed this attempt'},{status:409});
    try{
      const sent=await sendWithConfiguredEmailTransport(base44,{
        scopeType:'tenant',tenantId,clubId,purpose:campaign.purpose
      },{to:recipient.email,subject:message.subject,textBody:message.plain_text_body,htmlBody:message.html_body});
      await base44.asServiceRole.entities.CommunicationDeliveryAttempt.update(attempt.id,{
        status:'sent',provider:sent.provider,sent_at:new Date().toISOString()
      });
      await base44.asServiceRole.entities.CommunicationEvent.create({
        campaign_id:campaign.id,message_id:message.id,recipient_id:recipient.id,
        delivery_attempt_id:attempt.id,tenant_id:tenantId,event_type:'sent',
        occurred_at:new Date().toISOString(),actor_user_id:user.id
      });
      return Response.json({success:true,deliveryAttemptId:attempt.id,status:'sent'});
    }catch(e:any){
      // Unknown provider outcome. Do not requeue without a new operator audit.
      await base44.asServiceRole.entities.CommunicationDeliveryAttempt.update(attempt.id,{
        status:'sending',error_code:'unverified_provider_outcome',
        error_message:clean(e?.message||'Unverified provider outcome',500)
      });
      return Response.json({error:'Provider outcome unverified; investigate before resend',
        deliveryAttemptId:attempt.id},{status:502});
    }
  }
  if(action==='transport_health'){
    const config=await resolveEmailTransport(base44,scope);
    return Response.json({success:true,provider:config.provider,status:config.status,senderName:config.sender_name,senderEmail:config.sender_email,replyTo:config.reply_to||config.sender_email});
  }
  if(action==='test_email'){
    const to=clean(body.to,240).toLowerCase(),subject=clean(body.subject,500),textBody=clean(body.textBody,20000),htmlBody=String(body.htmlBody||'').slice(0,100000);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)||!subject||!textBody||!htmlBody)return Response.json({error:'Valid test recipient, subject, HTML and plain text are required.'},{status:400});
    const idem=clean(body.idempotencyKey,500); if(!idem)return Response.json({error:'idempotencyKey required'},{status:400});
    const existing=await base44.asServiceRole.entities.CommunicationDeliveryAttempt.filter({idempotency_key:idem},'-created_date',1);
    if(existing?.length)return Response.json({success:true,deduplicated:true,deliveryAttempt:existing[0]});
    const attempt=await base44.asServiceRole.entities.CommunicationDeliveryAttempt.create({campaign_id:clean(body.campaignId,180)||'test',message_id:clean(body.messageId,180)||'test',recipient_id:clean(body.recipientId,180)||to,tenant_id:tenantId||null,channel:'email',provider:'pending',status:'sending',attempt_number:1,idempotency_key:idem,queued_at:new Date().toISOString(),metadata:{test:true,requested_by_user_id:user.id}});
    try{
      const sent=await sendWithConfiguredEmailTransport(base44,scope,{to,subject,textBody,htmlBody,senderName:clean(body.senderName,180)||null});
      await base44.asServiceRole.entities.CommunicationDeliveryAttempt.update(attempt.id,{provider:sent.provider,status:'sent',sent_at:new Date().toISOString(),metadata:{test:true,requested_by_user_id:user.id,sender_email:sent.senderEmail}});
      return Response.json({success:true,deduplicated:false,deliveryAttemptId:attempt.id,provider:sent.provider});
    }catch(e:any){
      await base44.asServiceRole.entities.CommunicationDeliveryAttempt.update(attempt.id,{status:'failed',error_message:clean(e?.message,1000)});
      throw e;
    }
  }
  return Response.json({error:'Unknown action'},{status:400});
 }catch(e:any){console.error('communicationsEngine error',e);return Response.json({error:e?.message||'Communications Engine failed'},{status:500});}
});
