import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';

/** Read-only operational status; no hidden publishing, booking or payment mutations. */
export default function ClubOperationsBoard({tenantId,clubId}){
 const {data,isLoading,isError,refetch,isFetching}=useQuery({
  queryKey:['ccc-operations',tenantId,clubId],
  enabled:!!tenantId&&!!clubId,
  queryFn:async()=>{const res=await base44.functions.invoke('cccActivity',{action:'operations_summary'});if(!res.data?.success)throw Error(res.data?.error||'Operations unavailable');return res.data},
  retry:false,staleTime:30000
 });
 const labels={draft:'Draft',ready:'Ready',scheduled:'Scheduled',registration_open:'Registration open',registration_closed:'Registration closed',in_progress:'In progress',completed:'Completed',cancelled:'Cancelled',archived:'Archived'};
 const alerts={unknown_activity_status:'Unrecognised status',invalid_schedule:'Invalid activity dates',missing_event_link:'Event not linked',event_link_not_verified:'Linked event not verified',past_activity_not_closed:'Past activity still open'};
 return <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-label="Club operations board">
  <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">Operations board</h2><p className="text-xs text-muted-foreground">Club activities · Read-only operational review</p></div><button type="button" onClick={()=>refetch()} disabled={isFetching||!tenantId||!clubId} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50">{isFetching?'Refreshing…':'Refresh'}</button></div>
  {isLoading&&<p className="mt-3 text-sm">Loading operational activity…</p>}
  {isError&&<p role="alert" className="mt-3 text-sm text-destructive">Operations are temporarily unavailable. Existing bookings are unaffected.</p>}
  {data&&<><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{[['All activities',data.total],['Upcoming',data.upcomingCount||0],['In progress',data.counts?.in_progress||0],['Needs review',data.alertCount||0]].map(([name,count])=><div key={name} className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">{name}</div><div className="text-xl font-semibold tabular-nums">{count}</div></div>)}</div>
   {data.resultsMayBeTruncated&&<p role="alert" className="mt-2 text-sm text-amber-700">The activity read is incomplete. These figures are partial and must not be used as full club totals.</p>}
   {data.alertCount>0&&<div className="mt-3 rounded-lg border p-3"><h3 className="text-sm font-semibold">Items needing review</h3><ul className="mt-2 space-y-1 text-xs">{(data.alerts||[]).slice(0,12).map((a,i)=><li key={a.activityId+'-'+a.code+'-'+i}>{alerts[a.code]||a.code} · Activity {a.activityId}</li>)}</ul>{data.alertCount>12&&<p className="mt-1 text-xs text-muted-foreground">Showing 12 of {data.alertCount} issues.</p>}</div>}
   <h3 className="mt-4 text-sm font-semibold">Upcoming and active activities</h3>{!data.upcoming?.length?<p className="mt-2 text-sm text-muted-foreground">No upcoming activities in the current records.</p>:<div className="mt-2 space-y-2">{data.upcoming.slice(0,12).map(a=><div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"><div><div className="text-sm font-medium">{a.title}</div><div className="text-xs text-muted-foreground">{new Date(a.startsAt).toLocaleString('en-IE',{dateStyle:'medium',timeStyle:'short'})}</div></div><span className="rounded-full border px-2 py-1 text-xs">{labels[a.status]||a.status}</span></div>)}</div>}
   <p className="mt-3 text-xs text-muted-foreground">Counts cover Club Command Centre activities only. No payment, registration or provider settlement totals are included.</p>
  </>}
 </section>;
}
