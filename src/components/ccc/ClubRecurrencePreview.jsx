import React,{useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
/** Explicitly read-only. Recurrence never creates scheduled activities. */
export default function ClubRecurrencePreview({tenantId,clubId,draft,activityId}){
 const [weeks,setWeeks]=useState(4),[result,setResult]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const key=[tenantId,clubId,activityId,draft?.venue_id,draft?.court_id,draft?.starts_at,draft?.ends_at].join('|');
 useEffect(()=>{setResult(null);setError('')},[key,weeks]);
 const run=async()=>{setBusy(true);setError('');setResult(null);try{
  const res=await base44.functions.invoke('cccActivity',{action:'recurrence_review',id:activityId||'',draft:{venue_id:draft?.venue_id,court_id:draft?.court_id,starts_at:draft?.starts_at,ends_at:draft?.ends_at},weeks});
  if(!res.data?.success)throw Error(res.data?.error||'Recurrence review unavailable');setResult(res.data);
 }catch(e){setError(e?.response?.data?.error||e?.message||'Recurrence review unavailable')}finally{setBusy(false)}};
 return <section className="mt-3 rounded-xl border p-3" aria-label="Weekly recurrence preview"><h4 className="text-sm font-semibold">Weekly recurrence preview</h4><p className="mt-1 text-xs text-muted-foreground">Preview the same weekday and local clock time for up to 12 weeks. No sessions are created or published.</p>
 <div className="mt-2 flex flex-wrap items-end gap-2"><label className="text-sm">Number of weeks<select className="ml-2 rounded-lg border bg-background p-2" value={weeks} onChange={e=>setWeeks(Number(e.target.value))}>{Array.from({length:12},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}</option>)}</select></label><button type="button" disabled={busy||!tenantId||!clubId||!draft?.venue_id||!draft?.starts_at||!draft?.ends_at} onClick={run} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">{busy?'Reviewing…':'Preview weekly dates'}</button></div>
 {error&&<p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
 {result&&<div className="mt-2 text-sm" role="status"><p className={result.ready?'text-emerald-700':'text-amber-700'}>{!result.valid?'Invalid recurrence dates':!result.complete?'Activity inventory incomplete — availability unverified':result.ready?'No CCC overlaps found in preview':result.conflictedWeeks+' weeks overlap existing CCC activities'}</p>
 <div className="mt-2 max-h-60 space-y-1 overflow-y-auto">{result.occurrences.map(o=><div key={o.week} className="flex flex-wrap justify-between gap-2 rounded border p-2 text-xs"><span>Week {o.week}: {o.startsAt.replace('T',' ')} – {o.endsAt.replace('T',' ')}</span><span className={o.conflicts.length?'font-semibold text-amber-700':''}>{o.conflicts.length?o.conflicts.length+' CCC overlap(s)':'No CCC overlap'}</span></div>)}</div><p className="mt-2 text-xs text-muted-foreground">External hall bookings, time-zone transitions and live capacity are not verified. Recheck each date before any future publication.</p></div>}
 </section>;
}
