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
 const date=event.start_date?new Date(`${event.start_date}T12:00:00Z`):null;
 const eventDate=date&&!Number.isNaN(date.getTime())?new Intl.DateTimeFormat('en-IE',{timeZone:'Europe/Dublin',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date):String(event.start_date||'');
 const start=String(event.event_start_time||'').slice(0,5),end=String(event.event_end_time||'').slice(0,5);
 const time=start&&end?`${start}–${end}`:start;
 const venue=String(event.location||'');
 const maps=String(event.event_map_url||'').trim();
 const mapUrl=/^https:\/\//i.test(maps)?maps:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
 const host=String(event.event_contact||'Event organiser');
 const phone=String(event.event_contact_phone||'').trim();
 const whatsapp=phone?`https://wa.me/${phone.replace(/\D/g,'').replace(/^0/,'353')}`:'';
 return {FIRST_NAME:String(registration.full_name||'there').trim().split(' ')[0],EVENT_NAME:event.name||'',EVENT_DATE:eventDate,EVENT_TIME:time,EVENT_VENUE:venue,EVENT_HOST:host,HOST_PHONE:phone,HOST_WHATSAPP:whatsapp,GOOGLE_MAPS_URL:mapUrl,PAYMENT_LINK:link,PAYMENT_DEADLINE:deadline};
}
