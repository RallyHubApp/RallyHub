const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Dublin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
const wall=/^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::00)?$/;
/** Reject ambiguous or nonexistent Europe/Dublin local times. */
export function reviewDublinWallTime(value){
 const raw=String(value||'');
 if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(raw)){
  const instant=Date.parse(raw);
  return Number.isFinite(instant)?{valid:true,issue:null,possibleInstants:[new Date(instant).toISOString()]}:{valid:false,issue:'invalid_absolute_timestamp',possibleInstants:[]};
 }
 const match=wall.exec(raw);
 if(!match)return {valid:false,issue:'invalid_wall_clock',possibleInstants:[]};
 const [,year,month,day,hour,minute]=match;
 const naive=Date.UTC(Number(year),Number(month)-1,Number(day),Number(hour),Number(minute));
 const dt=new Date(naive);
 if(dt.getUTCFullYear()!==Number(year)||dt.getUTCMonth()!==Number(month)-1||dt.getUTCDate()!==Number(day))return {valid:false,issue:'invalid_calendar_date',possibleInstants:[]};
 const target=year+'-'+month+'-'+day+'T'+hour+':'+minute,possibleInstants=[];
 for(let offset=-180;offset<=180;offset+=30){
  const utc=naive+offset*60000;
  const p=Object.fromEntries(formatter.formatToParts(new Date(utc)).map(x=>[x.type,x.value]));
  if([p.year,p.month,p.day].join('-')+'T'+p.hour+':'+p.minute===target)possibleInstants.push(new Date(utc).toISOString());
 }
 return {valid:possibleInstants.length===1,issue:possibleInstants.length===0?'nonexistent_local_time':possibleInstants.length>1?'ambiguous_local_time':null,possibleInstants};
}
export function reviewDublinOccurrences(occurrences=[]){
 const issues=[],rows=occurrences.map(o=>{
  const start=reviewDublinWallTime(o.startsAt),end=reviewDublinWallTime(o.endsAt),flags=[];
  if(!start.valid)flags.push('start_'+start.issue);
  if(!end.valid)flags.push('end_'+end.issue);
  if(start.valid&&end.valid&&Date.parse(end.possibleInstants[0])<=Date.parse(start.possibleInstants[0]))flags.push('nonpositive_actual_duration');
  if(flags.length)issues.push({week:o.week,issues:flags});
  return {...o,localTimeIssues:flags,startUtc:start.valid?start.possibleInstants[0]:null,endUtc:end.valid?end.possibleInstants[0]:null};
 });
 return {occurrences:rows,ready:issues.length===0,issues,timezone:'Europe/Dublin',daylightSavingChecked:true};
}
