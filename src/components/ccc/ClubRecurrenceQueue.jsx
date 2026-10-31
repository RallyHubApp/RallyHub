import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
/** Read-only queue. Detailed reconciliation happens against the source activity. */
export default function ClubRecurrenceQueue({tenantId,clubId}){
 const {data,isLoading,isError,refetch,isFetching}=useQuery({
  queryKey:['ccc-recurrence-queue',tenantId,clubId],enabled:!!tenantId&&!!clubId,
  queryFn:async()=>{const r=await base44.functions.invoke('cccActivity',{action:'recurrence_queue'});if(!r.data?.success)throw Error(r.data?.error||'Queue unavailable');return r.data},
  staleTime:30000,retry:false
 });
 return <section className="mt-4 rounded-xl border p-3" aria-label="Recurring session batches">
  <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Recurring session batches</h3><button type="button" className="rounded-lg border px-3 py-1 text-sm" onClick={()=>refetch()} disabled={isFetching}>{isFetching?'Refreshing…':'Refresh batches'}</button></div>
  {isLoading&&<p className="mt-2 text-sm">Loading batches…</p>}
  {isError&&<p role="alert" className="mt-2 text-sm text-destructive">Batch queue unavailable.</p>}
  {data&&<><p className="mt-2 text-sm">{data.counts?.needs_recovery||0} need recovery · {data.counts?.creating||0} creating · {data.counts?.complete||0} complete</p>
  {!data.complete&&<p role="alert" className="text-sm text-amber-700">Partial activity inventory; some batches may be missing.</p>}
  <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">{data.batches?.slice(0,30).map(b=><div key={b.id} className="rounded-lg border p-2 text-sm"><div className="font-medium">{b.title}</div><div className="text-xs text-muted-foreground">State: {b.state.replaceAll('_',' ')} · Expected drafts: {b.expectedCount??'unknown'} · Activity ID: {b.id}</div>{b.state==='needs_recovery'&&<p className="text-xs text-amber-700">Open this source activity in the planner to inspect and reconcile. No automatic retry.</p>}</div>)}</div>
  {data.total>30&&<p className="text-xs text-muted-foreground">Showing first 30 of {data.total} batches.</p>}</>}
 </section>;
}
