import React,{useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {forecastTournivalProgress} from '@/lib/tournivalTiming';
import {indexTournivalMatches} from '@/lib/tournivalScheduler';

export default function TournivalTimingMonitor({state,onSaveState,isAdmin}) {
 const [editing,setEditing]=useState(false);
 const [venueEnd,setVenueEnd]=useState(state?.venueEndAt||'');
 const [failure,setFailure]=useState(''),[saving,setSaving]=useState(false);
 const matches=state?.matches||indexTournivalMatches(state?.rounds||[]);
 const duration=state?.matchMinutes||Number(String(state?.matchFormat||'').replace('timed_',''))||18;
 let timing;
 try{timing=forecastTournivalProgress({matches,courts:state?.numCourts||4,
    minutesPerMatch:duration,changeoverMinutes:state?.changeoverMinutes??3,
    venueEndAt:state?.venueEndAt,actualStartedAt:state?.actualStartedAt||'',
    paused:state?.paused===true});}
 catch(e){return <p role="alert" className="text-xs text-destructive">{e.message}</p>;}
 const saveDeadline=async()=>{
  if(!isAdmin||saving)return;
  setSaving(true);setFailure('');
  try{
   const stamp=venueEnd?new Date(venueEnd).toISOString():'';
   await onSaveState({...state,venueEndAt:stamp});
   setEditing(false);
  }catch(e){setFailure(e.message||'Unable to save venue deadline');}
  finally{setSaving(false);}
 };
 return <section className="glass rounded-xl p-4 space-y-3">
  <div><h3 className="font-semibold">Live Schedule Monitor</h3>
    <p className="text-xs text-muted-foreground">Interclub-style operational forecast; warnings only. Never silently changes scoring rules or fixtures.</p></div>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
   <div className="rounded border border-border p-2"><strong className="block text-lg">{timing.completed}/{timing.total}</strong>Completed</div>
   <div className="rounded border border-border p-2"><strong className="block text-lg">{timing.active}</strong>Active courts</div>
   <div className="rounded border border-border p-2"><strong className="block text-lg">{timing.waiting}</strong>Waiting</div>
   <div className="rounded border border-border p-2"><strong className="block text-lg">{timing.estimatedRemainingMinutes}m</strong>Estimated remaining</div>
  </div>
  <p className="text-xs">Current court utilisation: {timing.courtUtilisationPercent}% · Projected qualification completion: {new Date(timing.projectedEndAt).toLocaleString('en-IE')}</p>
  {timing.projectedOverrunMinutes>0&&<div role="alert" className="space-y-1">
   <p className="font-semibold text-amber-400">Projected venue overrun: {timing.projectedOverrunMinutes} minutes</p>
   {timing.recoveries.map(item=><p className="text-xs" key={item}>{item}</p>)}
  </div>}
  {!state?.venueEndAt&&<p className="text-xs text-amber-400">Set the venue deadline to enable overrun warnings.</p>}
  {isAdmin&&<div className="space-y-2">
    <Button variant="outline" size="sm" onClick={()=>setEditing(x=>!x)}>{editing?'Cancel':'Set venue deadline'}</Button>
    {editing&&<div className="flex gap-2">
      <Input aria-label="Venue closing date and time" type="datetime-local" value={venueEnd?new Date(venueEnd).toISOString().slice(0,16):''} onChange={e=>setVenueEnd(e.target.value)}/>
      <Button size="sm" disabled={saving} onClick={saveDeadline}>Save</Button>
    </div>}
  </div>}
  {failure&&<p role="alert" className="text-xs text-destructive">{failure}</p>}
 </section>;
}
