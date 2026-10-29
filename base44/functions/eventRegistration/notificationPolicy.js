export const EVENT_NOTICE_TYPES=['application_received','approval_required','payment_required','booking_confirmed','cash_booking_confirmed','waitlist_joined','place_available','booking_cancelled','refund_confirmed','event_reminder'];
export function eventNoticeRecipients(type,participantEmail,policy={}){
 const cc=String(policy.confirmation_cc||'').split(/[;,]/).map(s=>s.trim().toLowerCase()).filter(s=>/^\S+@\S+\.\S+$/.test(s));
 return {to:participantEmail,cc:['booking_confirmed','cash_booking_confirmed'].includes(type)?[...new Set(cc.filter(e=>e!==String(participantEmail).toLowerCase()))]:[]};
}
export function eventNoticeBody(type,firstName,eventName,detail=''){
 const greetings=`Hi ${firstName||'there'},`;
 const content={application_received:'We have received your application. We will let you know when it has been reviewed.',approval_required:'Your application is awaiting organiser approval.',payment_required:'Your application has been approved. Please complete payment using the secure link before your reservation expires.',booking_confirmed:'Your booking and payment are confirmed.',cash_booking_confirmed:'Your booking has been confirmed by the organiser.',waitlist_joined:'The event is full and you have been added to the waiting list.',place_available:'A place has become available. Please follow the instructions from the organiser.',booking_cancelled:'Your booking has been cancelled.',refund_confirmed:'Your refund has been confirmed.',event_reminder:'This is your reminder about the upcoming event.'};
 if(!content[type])throw Error('Unknown notice type');
 return `${greetings}\n\n${content[type]}\n\nEvent: ${eventName}${detail?'\n'+detail:''}`;
}
