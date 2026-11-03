import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
/** Server-side full-inventory reconciliation, read-only and deliberately not a closure button. */
export default function ClubAuthoritativeCloseout({activityId,tenantId,clubId}){
 const {data,isFetching,isError,refetch}=useQuery({queryKey:['ccc-closure-readiness',tenantId,clubId,activityId],queryFn:async()=>{const response=await base44.functions.invoke('cccActivity',{action:'closure_readiness',id:activityId});if(!response.data?.success)throw Error(response.data?.error||'Close-out review failed');return response.data},enabled:!!activityId&&!!tenantId&&!!clubId,staleTime:15000,retry:false});
 return <section aria-label="Authoritative close-out review" className="mt-4 rounded-xl border p-3 text-sm"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Full-record close-out review</h3><button type="button" disabled={isFetching} onClick={()=>refetch()} className="rounded border px-3 py-1 disabled:opacity-50">{isFetching?'Reviewing…':'Refresh review'}</button></div>
 {isError&&<p role="alert">Unable to verify full records. Closure must remain blocked.</p>}
 {data&&<><p className="mt-2">Internal reconciliation: <strong>{data.internalReady?'Ready for external verification':'Blocked'}</strong></p><p>{data.counts.registrations} registrations · {data.counts.confirmed} confirmed · {data.counts.attendanceUnresolved} attendance unresolved · {data.counts.bookingPending} booking/payment pending · {data.counts.paymentRecords} payment records</p>{data.issues.length>0&&<p role="alert" className="mt-2">Outstanding: {data.issues.join(', ').replaceAll('_',' ')}</p>}<p className="mt-2 text-xs text-muted-foreground">External SumUp settlement and communication delivery remain unverified. This review never closes the event or sends messages.</p></>}
 </section>;
}
