import {resolveEventTemplate,eventTemplateValues,EVENT_TEMPLATE_PURPOSES} from './templateResolver.js';
import {eventNoticeRecipients,eventNoticeBody} from './notificationPolicy.js';
import {renderBasicBrandedEmail} from './communicationsBasicRenderer.ts';
import {sendWithConfiguredEmailTransport} from './emailRouter.ts';
export async function deliverEventNotice(base44:any,event:any,registration:any,type:string,detail=''){
 const club=(await base44.asServiceRole.entities.Club.filter({id:event.host_club_id},'-created_date',1))?.[0];
 if(!club)throw Error('Event club not found');
 const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({tenant_id:event.tenant_id,owner_scope:'tenant',status:'active'},'-updated_date',30);
 const kit=kits.find((k:any)=>!k.club_id||k.club_id===event.host_club_id);
 if(!kit)throw Error('Active tenant email brand kit missing');
 const first=String(registration.full_name||'there').trim().split(' ')[0];
 const purpose=EVENT_TEMPLATE_PURPOSES[type];
 const templates=purpose?await base44.asServiceRole.entities.CommunicationTemplate.filter({tenant_id:event.tenant_id,purpose,status:'approved'},'-updated_date',20):[];
 const approved=resolveEventTemplate(templates,type,eventTemplateValues(event,registration,detail));
 const body=approved?.body||eventNoticeBody(type,first,event.name,detail);
 const paymentUrl=type==='payment_required'?String(eventTemplateValues(event,registration,detail).PAYMENT_LINK||''):'';
 const safePaymentUrl=/^https:\/\/[^\s"'<>]+$/.test(paymentUrl)?paymentUrl.replaceAll('&','&amp;').replaceAll('\"','&quot;'):'';
 const paymentButton=safePaymentUrl?`<div style="text-align:center;margin:24px 0"><a href="${safePaymentUrl}" style="display:inline-block;background:#0755a8;color:#ffffff;font-size:17px;font-weight:700;text-decoration:none;padding:16px 30px;border-radius:8px">Click here to pay securely</a></div>`:'';
 const escaped=body.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','<br>');
 const templateHtml=approved?.html||'<p style="line-height:1.7">'+escaped+'</p>';
 const paymentHtml=type==='payment_required'&&paymentButton?templateHtml.replace(/Please complete payment using the secure link below/gi,'Please click the blue payment button below').replace(/\{\{PAYMENT_LINK\}\}/g,paymentButton).replaceAll(paymentUrl,paymentButton):templateHtml;
 const html=renderBasicBrandedEmail(paymentHtml,kit,club,club.name,'Event booking update');
 const recipients=eventNoticeRecipients(type,registration.email,event.event_booking_policy||{});
 return await sendWithConfiguredEmailTransport(base44,{scopeType:'tenant',purpose:'club_comms',tenantId:event.tenant_id,clubId:event.host_club_id},{...recipients,senderName:club.name,subject:approved?.subject||`${event.name} · ${type.replaceAll('_',' ')}`,textBody:body,htmlBody:html});
}
