// Draft-only preparation: no email transport is invoked by this module.
export const FOLLOWUP_TEMPLATE_ID = "guest_session_followup";
export const FOLLOWUP_CC_NAMES = Object.freeze(["John McLoughlin","Bróna McBreen","Liz Daly","Jenny Martin","Mary Fahey"]);
/** @param {{bookings?:any[],attendance?:Record<string,string>,selectedIds?:string[],ccNames?:string[],contacts?:any[],template?:{id:string,status:string,subject:string,plainText?:string}}} [options] */
export function prepareGuestFollowup({bookings=[],attendance={},selectedIds=[],ccNames=[],contacts=[],template}={}){
  if(!template || template.id!==FOLLOWUP_TEMPLATE_ID || template.status!=="draft") throw new Error("Pending-approval follow-up template required.");
  const allowed=new Set(FOLLOWUP_CC_NAMES);
  if(ccNames.some(name=>!allowed.has(name))) throw new Error("Unrecognised CC contact.");
  const cc=ccNames.map(name=>{
    const contact=contacts.find(c=>c.name===name);
    if(!contact?.email) throw new Error("Missing verified email for "+name);
    return {name,email:contact.email};
  });
  const selected=new Set(selectedIds);
  const messages=bookings.filter(b=>selected.has(b.id)).map(b=>{
    if(attendance[b.id]!=="attended") throw new Error("Attendance not confirmed for "+b.full_name);
    if(b.booking_status==="cancelled") throw new Error("Cancelled booking cannot receive follow-up.");
    if(!b.email) throw new Error("Missing guest email.");
    const first=(b.full_name||"").trim().split(/\s+/)[0]||"there";
    const replace=s=>(s||"").replaceAll("{{recipient.first_name}}",first);
    return {bookingId:b.id,to:b.email,cc,subject:replace(template.subject),plainText:replace(template.plainText),status:"draft"};
  });
  if(messages.length!==selected.size) throw new Error("One or more selected bookings were not found.");
  return {templateId:FOLLOWUP_TEMPLATE_ID,approvalRequired:true,sendEnabled:false,messages};
}
