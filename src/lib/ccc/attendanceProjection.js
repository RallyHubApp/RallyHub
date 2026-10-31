/** CCC v2.1 attendance projection; read-only and tenant-scoped.
 * Keeps manual check-in and no-show records separate from payment status.
 */
const ATTENDANCE=new Set(['attended','no_show','cancelled','unconfirmed']);
export function attendanceRoster({tenantId,clubId,sessionLinkId,bookings=[],attendance=[]}={}){
 if(!tenantId||!clubId||!sessionLinkId)return [];
 const eligible=Array.isArray(bookings)?bookings.filter(b=>b?.tenant_id===tenantId&&b?.club_id===clubId&&b?.session_link_id===sessionLinkId&&!!b?.id):[];
 const marks=new Map();
 for(const mark of Array.isArray(attendance)?attendance:[]){
  if(mark?.tenant_id!==tenantId||mark?.club_id!==clubId||mark?.session_link_id!==sessionLinkId||!ATTENDANCE.has(mark?.status)||!mark?.booking_id)continue;
  const prior=marks.get(mark.booking_id);
  if(!prior||(mark.marked_at||'')>(prior.marked_at||''))marks.set(mark.booking_id,mark);
 }
 return eligible.map(b=>({bookingId:b.id,personId:b.person_id||null,name:b.full_name||'',bookingStatus:b.status||b.booking_status||'',attendanceStatus:marks.get(b.id)?.status||'unconfirmed',paymentStatus:b.payment_status||'unknown'})).sort((a,b)=>a.name.localeCompare(b.name)||a.bookingId.localeCompare(b.bookingId));
}
export function attendanceSummary(roster=[]){
 const result={total:roster.length,attended:0,noShow:0,cancelled:0,unconfirmed:0};
 for(const row of roster){if(row.attendanceStatus==='attended')result.attended++;else if(row.attendanceStatus==='no_show')result.noShow++;else if(row.attendanceStatus==='cancelled')result.cancelled++;else result.unconfirmed++;}
 return result;
}
