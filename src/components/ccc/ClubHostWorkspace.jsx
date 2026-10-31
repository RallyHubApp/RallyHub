import React,{useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';

/** Delegated host check-in. Never exposes financial, medical or contact details. */
export default function ClubHostWorkspace({tenantId,clubId}){
 const [activityId,setActivityId]=useState('');
 const [search,setSearch]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const client=useQueryClient();
 const enabled=!!tenantId&&!!clubId;
 const activities=useQuery({queryKey:['ccc-host-activities',tenantId,clubId],queryFn:async()=>{const r=await base44.functions.invoke('cccActivity',{action:'host_activities'});if(!r.data?.success)throw Error(r.data?.error||'Host activities unavailable');return r.data},enabled,retry:false,staleTime:30000});
 const selected=activityId&&activities.data?.activities?.some(a=>a.id===activityId)?activityId:'';
 const roster=useQuery({queryKey:['ccc-host-roster',tenantId,clubId,selected],queryFn:async()=>{const r=await base44.functions.invoke('cccActivity',{action:'host_roster',id:selected});if(!r.data?.success)throw Error(r.data?.error||'Host roster unavailable');return r.data},enabled:!!selected&&enabled,retry:false,staleTime:10000});
 const update=async(r,attendance)=>{if(busy)return;setBusy(true);setError('');setNotice('');try{const result=await base44.functions.invoke('cccActivity',{action:'host_checkin',id:selected,registrationId:r.id,attendance,expectedRevision:r.attendanceRevision});if(!result.data?.success)throw Error(result.data?.error||'Check-in failed');setNotice(r.name+' · '+attendance.replaceAll('_',' '));await client.invalidateQueries({queryKey:['ccc-host-roster',tenantId,clubId,selected]})}catch(e){setError(e?.response?.data?.error||e?.message||'Check-in failed; refresh the roster');if(e?.response?.status===409)await client.invalidateQueries({queryKey:['ccc-host-roster',tenantId,clubId,selected]})}finally{setBusy(false)}};
 if(!enabled||(!activities.isLoading&&!activities.isError&&!activities.data?.activities?.length))return null;
 const rows=(roster.data?.participants||[]).filter(r=>r.name.toLowerCase().includes(search.toLowerCase().trim()));
 const confirmed=(roster.data?.participants||[]).filter(r=>['confirmed','cash_confirmed'].includes(r.bookingStatus));
 return <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-label="Host check-in workspace">
  <h2 className="text-lg font-bold">Host check-in</h2><p className="text-sm text-muted-foreground">Your authorised club sessions only. No payment, approval or customer messaging controls.</p>
  {activities.isLoading&&<p>Loading assigned sessions…</p>}{activities.isError&&<p role="alert">Unable to load host sessions.</p>}
  {activities.data?.activities?.length>0&&<label className="mt-3 block text-sm font-medium">Session<select value={selected} onChange={e=>{setActivityId(e.target.value);setSearch('');setNotice('');setError('')}} className="mt-1 w-full rounded-lg border bg-background p-2"><option value="">Select a session</option>{activities.data.activities.map(a=><option key={a.id} value={a.id}>{a.title} · {a.startsAt} · {a.status.replaceAll('_',' ')}</option>)}</select></label>}
  {activities.data?.resultsMayBeTruncated&&<p role="alert" className="text-sm">Session list may be incomplete. Contact a club administrator.</p>}
  {selected&&<><div className="mt-3 flex flex-wrap gap-2"><input aria-label="Find player" placeholder="Find player" value={search} onChange={e=>setSearch(e.target.value)} className="rounded-lg border bg-background p-2 text-sm"/><button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={()=>roster.refetch()}>Refresh roster</button></div>
   {roster.isLoading&&<p className="text-sm">Loading roster…</p>}{roster.isError&&<p role="alert">Unable to load this session's roster.</p>}
   {roster.data&&<><p className="mt-2 text-sm">{confirmed.filter(r=>r.attendance==='attended').length} attended · {confirmed.filter(r=>r.attendance==='no_show').length} no-show · {confirmed.filter(r=>r.attendance==='not_marked').length} awaiting check-in</p>
    {roster.data.resultsMayBeTruncated&&<p role="alert" className="text-sm text-destructive">Roster may be incomplete (500-record limit).</p>}
    <div className="mt-3 max-h-96 overflow-auto">{rows.map(r=><div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2"><div className="text-sm"><strong>{r.name}</strong><p className="text-xs text-muted-foreground">{r.bookingStatus.replaceAll('_',' ')}</p></div>{['confirmed','cash_confirmed'].includes(r.bookingStatus)?<select aria-label={'Attendance for '+r.name} value={r.attendance} disabled={busy} onChange={e=>update(r,e.target.value)} className="rounded-lg border bg-background p-2 text-sm"><option value="not_marked">Not marked</option><option value="attended">Attended</option><option value="no_show">No-show</option><option value="excused">Excused</option></select>:<span className="text-xs text-muted-foreground">Not eligible for check-in</span>}</div>)}{!rows.length&&<p className="text-sm text-muted-foreground">No matching participants.</p>}</div>
   </>}
  </>}{error&&<p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}{notice&&<p role="status" className="mt-2 text-sm">{notice}</p>}
 </section>;
}
