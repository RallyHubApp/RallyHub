import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';

/** Read-only operational view. No approval, payment, refund or notification actions. */
export default function ClubEventRegistrationOverview({activityId,tenantId,clubId}){
 const {data,isLoading,isError,error,refetch,isFetching}=useQuery({
  queryKey:['ccc-event-registration-overview',tenantId,clubId,activityId],
  queryFn:async()=>{const res=await base44.functions.invoke('cccActivity',{action:'registration_overview',id:activityId});if(!res.data?.success)throw Error(res.data?.error||'Registration overview unavailable');return res.data},
  enabled:!!activityId&&!!tenantId&&!!clubId,retry:false,staleTime:30000
 });
 if(!activityId)return null;
 return <section className="mt-4 rounded-xl border p-3" aria-label="Event registrations">
  <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">Linked event registrations</h3><button type="button" onClick={()=>refetch()} disabled={isFetching} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50">Refresh</button></div>
  {isLoading&&<p className="text-sm">Loading registrations…</p>}
  {isError&&<p role="alert" className="text-sm text-destructive">{error?.message||'Unable to load registrations'}</p>}
  {data&&<><p className="mt-1 text-xs text-muted-foreground">Read-only · {data.event?.name} · Capacity {data.event?.capacity}</p>
   <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{[['Total',data.summary.total],['Confirmed',data.summary.confirmed],['Awaiting approval',data.summary.pending],['Waitlisted',data.summary.waitlisted],['Payment holds',data.summary.paymentHolds],['Cancelled',data.summary.cancelled],['Net collected (€)',Number(data.summary.netCollected||0).toFixed(2)]].map(([label,value])=><div key={label} className="rounded-lg border p-2"><div className="text-xs text-muted-foreground">{label}</div><div className="font-semibold">{value}</div></div>)}</div>
   <div className="mt-3 max-h-80 overflow-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b"><th className="p-2">Participant</th><th className="p-2">Booking</th><th className="p-2">Payment</th></tr></thead><tbody>{data.registrations.map(r=><tr key={r.id} className="border-b"><td className="p-2">{r.name}<div className="text-muted-foreground">{r.email}</div></td><td className="p-2">{r.status.replaceAll('_',' ')}</td><td className="p-2">{r.paymentStatus.replaceAll('_',' ')}{r.amount>0?' · €'+r.amount.toFixed(2):''}</td></tr>)}</tbody></table>{!data.registrations.length&&<p className="p-2 text-muted-foreground">No registrations found.</p>}</div>
  </>}
 </section>;
}
