/** CCC v2.1 schedule projection from existing session links.
 * Read-only: never creates recurring sessions or mutates host assignments.
 */
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const TIME=/^([01]\d|2[0-3]):[0-5]\d$/;
export function sessionCalendar({tenantId,clubId,sessions=[],fromDate,toDate}={}){
 if(!tenantId||!clubId||!DATE.test(fromDate||'')||!DATE.test(toDate||'')||fromDate>toDate)return [];
 return (Array.isArray(sessions)?sessions:[]).filter(s=>s?.tenant_id===tenantId&&s?.club_id===clubId&&s?.id&&DATE.test(s.session_date||'')&&s.session_date>=fromDate&&s.session_date<=toDate&&TIME.test(s.start_time||''))
 .map(s=>({id:s.id,date:s.session_date,startTime:s.start_time,endTime:TIME.test(s.end_time||'')?s.end_time:null,venue:s.venue_name||'',venueKey:s.venue_key||'',label:s.session_label||'',capacity:Number.isSafeInteger(s.capacity)&&s.capacity>0?s.capacity:null,status:s.archived_at?'archived':s.active===false?'closed':'open'}))
 .sort((a,b)=>a.date.localeCompare(b.date)||a.startTime.localeCompare(b.startTime)||a.id.localeCompare(b.id));
}
export function scheduleConflicts(sessions=[]){
 const conflicts=[];
 const groups=new Map();
 for(const s of sessions){
  if(s.status==='archived'||!s.endTime||s.endTime<=s.startTime||!s.venueKey)continue;
  const key=s.date+':'+s.venueKey;
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(s);
 }
 for(const rows of groups.values()){
  rows.sort((a,b)=>a.startTime.localeCompare(b.startTime)||a.id.localeCompare(b.id));
  for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
   if(rows[j].startTime>=rows[i].endTime)break;
   if(rows[j].startTime<rows[i].endTime&&rows[j].endTime>rows[i].startTime)conflicts.push({firstId:rows[i].id,secondId:rows[j].id,date:rows[i].date,venueKey:rows[i].venueKey});
  }
 }
 return conflicts;
}
