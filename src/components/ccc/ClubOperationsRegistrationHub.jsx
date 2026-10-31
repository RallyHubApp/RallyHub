import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import ClubEventRegistrationOverview from './ClubEventRegistrationOverview';

/** Reuses the authoritative registration, attendance and follow-up workflow. */
export default function ClubOperationsRegistrationHub({tenantId,clubId,activities=[]}){
 const [selected,setSelected]=useState('');
 const [search,setSearch]=useState('');
 useEffect(()=>{setSelected('');setSearch('')},[tenantId,clubId]);
 const eligible=activities.filter(a=>a?.id&&a.linkedEventId&&a.bridgeStatus==='verified'&&['scheduled','registration_open','registration_closed','in_progress','completed'].includes(a.status));
 const visible=eligible.filter(a=>[a.title,a.id].some(v=>String(v||'').toLowerCase().includes(search.trim().toLowerCase())));
 const chosen=eligible.find(a=>a.id===selected);
 return <section className="mt-4 rounded-xl border bg-card p-4" aria-label="Registration to attendance workflow">
  <h3 className="font-semibold">Registration → attendance → follow-up</h3>
  <p className="mt-1 text-xs text-muted-foreground">Select a verified linked event to review registrations, payment exceptions, check-in and attended-only follow-up candidates. Existing controls enforce authorisation and revision checks. No automatic messages or refunds.</p>
  <label className="mt-3 block text-sm">Find an activity<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Activity title or ID" className="mt-1 w-full max-w-md rounded-lg border bg-background p-2"/></label>
  <div className="mt-3 max-h-56 space-y-2 overflow-auto">{visible.map(a=><div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-sm"><div><div className="font-medium">{a.title}</div><div className="text-xs text-muted-foreground">{a.status.replaceAll('_',' ')} · {a.startsAt?new Date(a.startsAt).toLocaleString('en-IE',{dateStyle:'medium',timeStyle:'short'}):'Date unavailable'}</div></div><div className="flex gap-2"><button type="button" className="rounded-lg border px-3 py-1 text-sm" onClick={()=>setSelected(selected===a.id?'':a.id)}>{selected===a.id?'Close roster':'Open roster'}</button><Link className="rounded-lg border px-3 py-1 text-sm text-primary" to={'/app/club-command-centre?section=activities&activityId='+encodeURIComponent(a.id)}>Planner</Link></div></div>)}{!visible.length&&<p className="text-sm text-muted-foreground">No verified linked activities match this search in the loaded operational records.</p>}</div>
  {chosen&&<div className="mt-4"><h4 className="font-semibold">{chosen.title}: registrations and attendance</h4><ClubEventRegistrationOverview key={[tenantId,clubId,chosen.id].join(':')} activityId={chosen.id} tenantId={tenantId} clubId={clubId} activityStatus={chosen.status}/></div>}
  <p className="mt-3 text-xs text-muted-foreground">This activity list is limited to the current operational summary. Open the Activity Planner for older records. Payment figures are internal ledger reviews, not confirmed SumUp settlement.</p>
 </section>;
}
