import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { resolveEmailTransport, sendWithConfiguredEmailTransport } from './emailRouter.ts';
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
