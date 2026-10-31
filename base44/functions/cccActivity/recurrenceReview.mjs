import {activityScheduleConflicts} from './activitySchedulePolicy.mjs';
/** Preview only: preserve wall-clock time across weekly dates; no activity writes.
 * This is a venue-level advisory; external hall calendars are not queried.
 */
const wallClock=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;
function parseWall(value){
 const m=wallClock.exec(String(value||''));if(!m)return null;
 const [y,mo,d,h,mi,sec]=m.slice(1).map(Number);
 const date=new Date(Date.UTC(y,mo-1,d,h,mi,sec||0));
 if(date.getUTCFullYear()!==y||date.getUTCMonth()!==mo-1||date.getUTCDate()!==d||date.getUTCHours()!==h||date.getUTCMinutes()!==mi||date.getUTCSeconds()!==(sec||0))return null;
 return date;
}
function addWeeks(date,index){
 const copy=new Date(date.getTime());copy.setUTCDate(copy.getUTCDate()+index*7);
 return copy.toISOString().slice(0,16);
}
export function reviewWeeklyRecurrence(candidate,activities=[],{weeks=4,complete=false,maxWeeks=12}={}){
 const count=Number(weeks),start=parseWall(candidate?.starts_at),end=parseWall(candidate?.ends_at);
 const invalid=!candidate?.tenant_id||!candidate?.club_id||!candidate?.venue_id||!Number.isSafeInteger(count)||count<1||count>maxWeeks||!start||!end||end<=start||end.getTime()-start.getTime()>24*3600000;
 if(invalid)return {valid:false,ready:false,complete,occurrences:[],issues:['invalid_weekly_recurrence'],mutationPerformed:false};
 const occurrences=[];let conflicted=0;
 for(let i=0;i<count;i++){
  const occurrence={...candidate,starts_at:addWeeks(start,i),ends_at:addWeeks(end,i)};
  const checked=activityScheduleConflicts(occurrence,activities);
  if(!checked.valid)return {valid:false,ready:false,complete,occurrences:[],issues:['invalid_occurrence'],mutationPerformed:false};
  if(checked.conflicts.length)conflicted++;
  occurrences.push({week:i+1,startsAt:occurrence.starts_at,endsAt:occurrence.ends_at,conflicts:checked.conflicts});
 }
 return {valid:true,ready:complete&&conflicted===0,complete,occurrences,conflictedWeeks:conflicted,issues:complete?[]:['activity_inventory_incomplete'],externalCalendarChecked:false,bookingCapacityVerified:false,mutationPerformed:false};
}
