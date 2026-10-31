import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';

/** Candidate review only: does not send, queue or imply consent. */
export default function ClubEventFollowupCandidates({activityId,tenantId,clubId}){
 const {data,isLoading,isError,error,refetch}=useQuery({
  queryKey:['ccc-followup-candidates',tenantId,clubId,activityId],
  queryFn:async()=>{const res=await base44.functions.invoke('cccActivity',{action:'followup_candidates',id:activityId});if(!res.data?.success)throw Error(res.data?.error||'Follow-up candidates unavailable');return res.data},
  enabled:!!activityId&&!!tenantId&&!!clubId,retry:false,staleTime:30000
 });
 return <section className="mt-4 rounded-xl border p-3" aria-label="Post-event follow-up review">
  <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">Post-event follow-up review</h3><button type="button" className="rounded-lg border px-3 py-1 text-sm" onClick={()=>refetch()}>Refresh</button></div>
  <p className="mt-1 text-xs text-muted-foreground">Attendance-based candidates only. Consent, suppression, duplicate sends and approved template checks are not yet complete. No messages can be sent from this panel.</p>
  {isLoading&&<p className="text-sm">Loading candidates…</p>}
  {isError&&<p role="alert" className="text-sm text-destructive">{error?.message||'Unable to load candidates'}</p>}
  {data&&<><p className="mt-2 text-sm">{data.candidates.length} attended participants to review</p>{data.resultsMayBeTruncated&&<p role="alert" className="text-sm text-destructive">List may be incomplete. Further attendance pages were not retrieved.</p>}
   <div className="mt-2 max-h-48 overflow-auto">{data.candidates.map(r=><div key={r.registrationId} className="flex justify-between gap-2 border-b py-2 text-sm"><span>{r.name}</span><span className="text-muted-foreground">{r.reviewReasons?.includes('email_missing_or_invalid')?'Email missing or invalid':r.reviewReasons?.includes('duplicate_email')?'Duplicate email · review':'Consent and suppression review required'}</span></div>)}{!data.candidates.length&&<p className="text-sm text-muted-foreground">No confirmed attendees recorded.</p>}</div>
  </>}
 </section>;
}
