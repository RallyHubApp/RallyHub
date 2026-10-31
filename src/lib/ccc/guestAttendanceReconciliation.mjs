const eligible=new Set(['confirmed','cash_due']);
export function reconcileGuestSession(bookings=[],marks={}){
 const counts={eligible:0,attended:0,noShow:0,cancelled:0,unconfirmed:0,excluded:0,duplicates:0};
 const outstanding=[],seen=new Set();
 for(const booking of bookings){
  if(!booking?.id)continue;
  if(seen.has(booking.id)){counts.duplicates++;continue}
  seen.add(booking.id);
  if(!eligible.has(booking.booking_status)){counts.excluded++;continue}
  counts.eligible++;
  const status=marks[booking.id]||'unconfirmed';
  if(status==='attended')counts.attended++;
  else if(status==='no_show')counts.noShow++;
  else if(status==='cancelled')counts.cancelled++;
  else {counts.unconfirmed++;outstanding.push({id:booking.id,name:booking.full_name||'',email:booking.email||'',mobile:booking.mobile||''})}
 }
 return {counts,outstanding,complete:counts.unconfirmed===0&&counts.duplicates===0};
}
