import React,{useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {triageFollowupCandidates} from '@/lib/ccc/followupTriage';
import ClubFollowupEvidenceReview from './ClubFollowupEvidenceReview';
const labels={email_missing_or_invalid:'Invalid email',duplicate_email:'Duplicate email',consent_not_verified:'Consent not verified',suppression_not_verified:'Suppression not verified',approved_template_not_verified:'Template not verified'};
/** Review only. No sending, queuing or permission inference. */
export default function ClubEventFollowupCandidates({activityId,tenantId,clubId}){
 const [filter,setFilter]=useState('all'),[search,setSearch]=useState('');
 const {data,isLoading,isError,error,refetch,isFetching}=useQuery({queryKey:['ccc-followup-candidates',tenantId,clubId,activityId],queryFn:async()=>{const res=await base44.functions.invoke('cccActivity',{action:'followup_candidates',id:activityId});if(!res.data?.success)throw Error(res.data?.error||'Follow-up candidates unavailable');return res.data},enabled:!!activityId&&!!tenantId&&!!clubId,retry:false,staleTime:30000});
 const triage=triageFollowupCandidates(data?.candidates||[],{complete:!data?.resultsMayBeTruncated});
 const visible=triage.rows.filter(r=>(filter==='all'||r.reviewReasons.includes(filter))&&(!search||[r.name,r.email,r.registrationId].some(x=>String(x||'').toLowerCase().includes(search.toLowerCase().trim()))));
 return <section className="mt-4 rounded-xl border p-3" aria-label="Post-event follow-up review"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Post-event communications reconciliation</h3><button type="button" disabled={isFetching} className="rounded-lg border px-3 py-1 text-sm" onClick={()=>refetch()}>Refresh</button></div>
 <p className="mt-1 text-xs text-muted-foreground">Attended confirmed registrations only. Consent, suppression (including endpoint hashes), approved templates and delivery safeguards must be verified separately. No messages can be sent from this panel.</p>
 {isLoading&&<p className="text-sm">Loading candidates…</p>}{isError&&<p role="alert" className="text-sm text-destructive">{error?.message||'Unable to load candidates'}</p>}
 {data&&<><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{[['Attended to review',triage.counts.total],['Invalid email',triage.counts.invalidEmail],['Duplicate email',triage.counts.duplicateEmail],['Consent checks',triage.counts.consentReview],['Suppression checks',triage.counts.suppressionReview],['Template checks',triage.counts.templateReview],['Approved to send',0]].map(([label,value])=><div key={label} className="rounded-lg border p-2"><div className="text-xs text-muted-foreground">{label}</div><div className="font-semibold tabular-nums">{value}</div></div>)}</div>
 {data.resultsMayBeTruncated&&<p role="alert" className="mt-2 text-sm text-destructive">Candidate read is incomplete. Totals are partial.</p>}
 <div className="mt-3 flex flex-wrap gap-2"><input type="search" aria-label="Search follow-up candidates" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name or email" className="rounded-lg border bg-background p-2 text-sm"/><select aria-label="Follow-up review issue" value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-lg border bg-background p-2 text-sm"><option value="all">All candidates</option>{Object.entries(labels).map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></div>
 <div className="mt-2 max-h-72 overflow-auto">{visible.map(r=><div key={r.registrationId} className="border-b py-2 text-sm"><div className="font-medium">{r.name||'Unnamed participant'}</div><div className="text-xs text-muted-foreground">{r.email||'No email'} · {r.reviewReasons.map(code=>labels[code]||code).join(' · ')}</div></div>)}{!visible.length&&<p className="text-sm text-muted-foreground">No candidates match this filter.</p>}</div><p className="mt-3 text-xs text-muted-foreground">{visible.length} shown · {triage.counts.total} loaded · zero authorised recipients. Manual walk-ins are excluded until separately verified.</p></>}
 <ClubFollowupEvidenceReview key={[tenantId,clubId,activityId].join(':')}/>
 </section>;
}
