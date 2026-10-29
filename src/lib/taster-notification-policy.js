// Sandbox-only policy: describes intended recipients; never sends emails.
export const TASTER_CONTACT={sender:'clarepb2025@gmail.com',senderName:'Clare Pickleball',hostEmail:'brona.mcbreen@gmail.com',hostName:'Brona McBreen',whatsapp:'0870526786'};
export function tasterRecipients(eventType,participantEmail){
 const confirmed=eventType==='booking_confirmed'||eventType==='cash_booking_confirmed';
 return {to:participantEmail,cc:confirmed?[TASTER_CONTACT.hostEmail]:[],hostNotification:confirmed,from:TASTER_CONTACT.sender};
}
export function tasterFooter(){return `Questions? WhatsApp ${TASTER_CONTACT.hostName} on ${TASTER_CONTACT.whatsapp}.`;}
