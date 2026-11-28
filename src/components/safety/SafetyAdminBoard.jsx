import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
const labels={SafetyIncident:'Incidents and hazards',SafetyVenueProfile:'Venue safety profiles',SafetyFirstAider:'First aiders',SafetyKitItem:'Kit stock items',SafetyFollowUp:'Follow-up actions',SafetyGuidance:'Guidance records'};
export default function SafetyAdminBoard({tenantId,clubId}){
 const q=useQuery({queryKey:['safety-admin-summary',tenantId,clubId],enabled:!!tenantId&&!!clubId,retry:false,queryFn:async()=>{const r=await base44.functions.invoke('clubSafety',{action:'admin_summary'});if(!r.data?.success)throw Error('Safety summary unavailable');return r.data;}});
 return <section className="rounded-xl border bg-card p-4" aria-label="Health and Safety"><h2 className="font-bold text-lg">Health, Safety & First Aid</h2><p className="text-sm">Development preview — management actions are not enabled.</p>{q.isLoading&&<p>Loading safety records…</p>}{q.isError&&<p role="alert">Safety service unavailable or access denied. No counts verified.</p>}{q.data&&<><div className="grid grid-cols-2 gap-2 mt-3">{Object.entries(labels).map(([key,label])=><div key={key} className="rounded border p-3"><strong>{q.data.counts[key]}{q.data.counts[key]===100?'+':''}</strong><p>{label}</p></div>)}</div>{q.data.possiblyTruncated&&<p>Counts may be incomplete.</p>}</>}</section>;
}
