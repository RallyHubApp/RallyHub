/** Read-only legacy GuestSessionLink collision review. These links have no court ID:
 * matching venue/time is an advisory whole-venue overlap, not a booking lock.
 */
const normalise=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const clock=/^([01]\d|2[0-3]):[0-5]\d$/;
export function reviewLegacySessionOverlaps(occurrences=[],sessions=[],{tenantId,clubId,venueName,complete=false}={}){
 const venue=normalise(venueName);
 const byDate=new Map();
 for(const s of sessions){
  if(!s?.id||s.tenant_id!==tenantId||s.club_id!==clubId||s.archived_at||!s.session_date)continue;
  if(!byDate.has(s.session_date))byDate.set(s.session_date,[]);
  byDate.get(s.session_date).push(s);
 }
 const results=[];let ambiguous=0,conflicted=0;
 for(const occurrence of occurrences){
  const date=occurrence.startsAt?.slice(0,10),start=occurrence.startsAt?.slice(11,16),end=occurrence.endsAt?.slice(11,16);
  const overlaps=[],unmapped=[];
  for(const s of byDate.get(date)||[]){
   if(!clock.test(s.start_time||'')||!clock.test(s.end_time||'')||s.end_time<=s.start_time){unmapped.push(s.id);continue}
   if(!(start<s.end_time&&s.start_time<end))continue;
   const name=normalise(s.venue_name),key=normalise(s.venue_key);
   if(venue&&(name===venue||key===venue))overlaps.push({sessionId:s.id,status:s.active===false?'closed':'active'});
   else if(!name&&!key)unmapped.push(s.id);
   else if(!venue)unmapped.push(s.id);
  }
  if(overlaps.length)conflicted++;
  if(unmapped.length)ambiguous++;
  results.push({week:occurrence.week,legacyOverlaps:overlaps,legacyUnmapped:unmapped});
 }
 return {occurrences:results,complete,conflictedWeeks:conflicted,unmappedWeeks:ambiguous,ready:complete&&conflicted===0&&ambiguous===0,advisoryOnly:true,mutationPerformed:false};
}
