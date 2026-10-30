export const EVENT_TEMPLATE_PURPOSES={application_received:'event_application_received',payment_required:'event_payment_required',booking_confirmed:'event_booking_confirmed'};
export function resolveEventTemplate(rows,type,values){
 const purpose=EVENT_TEMPLATE_PURPOSES[type];
 if(!purpose)return null;
 const template=(rows||[]).find(t=>t.purpose===purpose&&t.status==='approved');
 if(!template)return null;
 const replace=s=>String(s||'').replace(/\{\{\s*([A-Z_]+)\s*\}\}/g,(_,key)=>String(values[key]??''));
 return {subject:replace(template.subject_template),body:replace(template.plain_text_template),html:replace(template.html_template)};
}
export function eventTemplateValues(event,registration,detail=''){
 const link=String(detail).split('Payment link: ')[1]?.split(' ')[0]||'';
 const deadline=registration.payment_hold_expires_at?new Date(registration.payment_hold_expires_at).toLocaleString('en-IE',{timeZone:'Europe/Dublin',dateStyle:'medium',timeStyle:'short'}):'';
 return {FIRST_NAME:String(registration.full_name||'there').trim().split(' ')[0],EVENT_NAME:event.name||'',EVENT_DATE:event.start_date||'',EVENT_VENUE:event.location||'',PAYMENT_LINK:link,PAYMENT_DEADLINE:deadline};
}
