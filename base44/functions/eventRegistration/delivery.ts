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
 const body=eventNoticeBody(type,first,event.name,detail);
 const escaped=body.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','<br>');
 const html=renderBasicBrandedEmail('<p style="line-height:1.7">'+escaped+'</p>',kit,club,club.name,'Event booking update');
 const recipients=eventNoticeRecipients(type,registration.email,event.event_booking_policy||{});
 return await sendWithConfiguredEmailTransport(base44,{scopeType:'tenant',purpose:'club_comms',tenantId:event.tenant_id,clubId:event.host_club_id},{...recipients,senderName:club.name,subject:`${event.name} · ${type.replaceAll('_',' ')}`,textBody:body,htmlBody:html});
}
