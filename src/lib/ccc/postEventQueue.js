/** Post-session follow-up candidates; no messages are sent by this module. */
const SENT=new Set(['queued','sending','sent','accepted','delivered','opened','clicked','action_completed']);
export function postEventQueue({tenantId,clubId,sessionLinkId,roster=[],attempts=[]}={}){
 if(!tenantId||!clubId||!sessionLinkId)return [];
 const scoped=(Array.isArray(attempts)?attempts:[]).filter(a=>a?.tenant_id===tenantId&&a?.campaign_id==='guest_session_followup:'+sessionLinkId);
 return (Array.isArray(roster)?roster:[]).filter(r=>r?.bookingId).map(r=>{
  const previous=scoped.filter(a=>a.recipient_id===r.bookingId);
  const alreadySent=previous.some(a=>SENT.has(a.status));
  const eligible=r.attendanceStatus==='attended'&&['confirmed','cash_due'].includes(r.bookingStatus);
  return {bookingId:r.bookingId,name:r.name,attendanceStatus:r.attendanceStatus,eligible,alreadySent,needsFollowUp:eligible&&!alreadySent};
 }).sort((a,b)=>a.name.localeCompare(b.name)||a.bookingId.localeCompare(b.bookingId));
}
export function postEventSummary(queue=[]){
 return {attended:queue.filter(r=>r.attendanceStatus==='attended').length,noShow:queue.filter(r=>r.attendanceStatus==='no_show').length,followUpReady:queue.filter(r=>r.needsFollowUp).length,alreadySent:queue.filter(r=>r.alreadySent).length};
}
