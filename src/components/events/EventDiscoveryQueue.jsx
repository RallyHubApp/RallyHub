import React,{useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {toast} from 'sonner';

export default function EventDiscoveryQueue({hostClubId,tenantId}){
 const qc=useQueryClient();const [busy,setBusy]=useState('');
 const {data,refetch,isLoading}=useQuery({queryKey:['event-discovery-approval'],queryFn:async()=>{const r=await base44.functions.invoke('eventDiscoveryApproval',{action:'list'});if(r.data?.error)throw Error(r.data.error);return r.data},staleTime:15000});
 const candidates=(data?.candidates||[]).filter(c=>['pending','held','duplicate'].includes(c.status));
 const decide=async(c,decision)=>{
  if(decision==='approved'&&!window.confirm(`Publish ${c.name} to the public Events Directory?`))return;
  setBusy(c.id);
  try{const r=await base44.functions.invoke('eventDiscoveryApproval',{action:'decide',id:c.id,decision,host_club_id:hostClubId,tenant_id:tenantId});if(r.data?.error)throw Error(r.data.error);toast.success(decision==='approved'?'Event published':`Event ${decision}`);await refetch();await qc.invalidateQueries({queryKey:['tenant-events']})}catch(e){toast.error(e.message)}finally{setBusy('')}
 };
 return <section className="rounded-xl border p-4 space-y-3" data-testid="event-discovery-queue">
  <div><h2 className="font-bold">Event Discovery · Super Admin approvals</h2><p className="text-xs text-muted-foreground">Discovered events remain private until approved. Select the host organisation above before publishing. Duplicates cannot be approved.</p></div>
  {isLoading?<p>Loading proposals…</p>:candidates.length===0?<p className="text-sm text-muted-foreground">No pending event proposals.</p>:candidates.map(c=><div key={c.id} className="rounded-lg border p-3 space-y-2"><div className="font-semibold">{c.name} <span className="text-xs font-normal">({c.status})</span></div><div className="text-sm">{c.start_date} · {c.location||'Location unconfirmed'} · {c.organiser||'Organiser unconfirmed'}</div><a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-sm underline">View original source</a>{c.poster_url&&<a href={c.poster_url} target="_blank" rel="noopener noreferrer" className="ml-3 text-sm underline">View poster</a>}
  {c.duplicateEventId?<p className="text-sm text-amber-700">Already listed in RallyHub — publication blocked.</p>:<div className="flex flex-wrap gap-2"><button type="button" className="rounded border px-3 py-1 text-sm" disabled={!!busy||!hostClubId||!tenantId} onClick={()=>decide(c,'approved')}>Approve & publish</button><button type="button" className="rounded border px-3 py-1 text-sm" disabled={!!busy} onClick={()=>decide(c,'held')}>Hold</button><button type="button" className="rounded border px-3 py-1 text-sm" disabled={!!busy} onClick={()=>decide(c,'rejected')}>Reject</button></div>}</div>)}
 </section>;
}
