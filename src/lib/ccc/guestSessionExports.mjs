/** Guest attendance report. Read-only, loaded roster only; never infers payment or consent. */
const safe=value=>{const raw=String(value??'').replace(/\r\n?/g,'\n');const escaped=/^[\s\u0000-\u001f]*[=+@-]/.test(raw)?"'"+raw:raw;return '"'+escaped.replaceAll('"','""')+'"'};
export function guestSessionAttendanceCsv(bookings=[],marks={}){
 const columns=['Booking ID','Guest name','Email','Mobile','Booking status','Attendance','Needs attendance review'];
 const rows=bookings.map(b=>{const eligible=['confirmed','cash_due'].includes(b.booking_status);const attendance=eligible?(marks[b.id]||'unconfirmed'):'not_eligible';return [b.id,b.full_name,b.email,b.mobile,b.booking_status,attendance,eligible&&attendance==='unconfirmed'?'yes':'no']});
 return '\uFEFF'+[columns,...rows].map(r=>r.map(safe).join(',')).join('\r\n')+'\r\n';
}
export function guestSessionExportReview(bookings=[],marks={}){
 const ids=new Set(),duplicates=[];let outstanding=0,excluded=0;
 for(const b of bookings){if(!b?.id)continue;if(ids.has(b.id)){duplicates.push(b.id);continue}ids.add(b.id);if(!['confirmed','cash_due'].includes(b.booking_status))excluded++;else if(!marks[b.id]||marks[b.id]==='unconfirmed')outstanding++}
 return {loaded:bookings.length,outstanding,excluded,duplicates,complete:false,reason:'Guest roster pagination and backend attendance completeness are not independently verified'};
}
