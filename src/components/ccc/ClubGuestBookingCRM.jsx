import React,{useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {Link} from 'react-router-dom';

/** Read-only operational CRM queue backed by the authoritative guest journey. */
export default function ClubGuestBookingCRM({tenantId,clubId}){
 const [filter,setFilter]=useState('pending_approval');
 const [search,setSearch]=useState('');
 const [selected,setSelected]=useState('');
 const {data,isLoading,isError,refetch,isFetching}=useQuery({queryKey:['ccc-guest-crm',tenantId,clubId],enabled:!!tenantId&&!!clubId,queryFn:async()=>{const res=await base44.functions.invoke('guestAccessJourney',{action:'admin_list'});if(!res.data?.success)throw Error(res.data?.error||'Guest requests unavailable');return res.data},retry:false,staleTime:15000});
 const all=data?.requests||[];
 const shown=all.filter(r=>(filter==='all'||r.status===filter)&&[r.fullName,r.email,r.venueName].some(x=>String(x||'').toLowerCase().includes(search.toLowerCase())));
 const active=all.find(r=>r.id===selected);
 const pending=all.filter(r=>r.status==='pending_approval').length;
 const approved=all.filter(r=>r.status==='approved').length;
 return <section className="rounded-xl border bg-card p-4" aria-label="Guest booking CRM">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">Guest booking CRM</h3><p className="text-sm text-muted-foreground">One queue for requests, approvals, booking completion and payment follow-up.</p></div><button type="button" onClick={()=>refetch()} disabled={isFetching} className="rounded-lg border px-3 py-2 text-sm">{isFetching?'Refreshing…':'Refresh'}</button></div>
  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{[['Awaiting approval',pending],['Approved',approved],['All requests',all.length]].map(([label,value])=><div key={label} className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="text-xl font-bold">{value}</div></div>)}</div>
  <div className="mt-4 flex flex-wrap gap-2"><label className="text-sm">Status <select className="ml-2 rounded-lg border bg-background p-2" value={filter} onChange={e=>setFilter(e.target.value)}><option value="pending_approval">Awaiting approval</option><option value="approved">Approved</option><option value="all">All</option></select></label><input className="rounded-lg border bg-background p-2 text-sm" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search guest, email or venue" aria-label="Search guest requests"/></div>
  {isLoading&&<p className="mt-3 text-sm">Loading guest requests…</p>}{isError&&<p className="mt-3 text-sm text-destructive" role="alert">Unable to load guest requests. No bookings have been changed.</p>}
  {!isLoading&&!isError&&<div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div className="max-h-[30rem] space-y-2 overflow-y-auto">{shown.map(r=><button key={r.id} type="button" onClick={()=>setSelected(r.id)} aria-pressed={selected===r.id} className={'w-full rounded-lg border p-3 text-left text-sm hover:bg-muted '+(selected===r.id?'border-primary bg-muted':'')}><span className="font-semibold">{r.fullName}</span><span className="ml-2 text-xs text-muted-foreground">{r.status.replaceAll('_',' ')}</span><div className="mt-1 text-xs">{r.venueName} · {r.day} {r.start}{r.end?'–'+r.end:''}</div><div className="mt-1 text-xs text-muted-foreground">{r.bookingStatus||'Booking not completed'} · {r.paymentStatus||'Payment not started'}</div></button>)}{!shown.length&&<p className="text-sm text-muted-foreground">No matching guest requests.</p>}</div><div className="rounded-lg border p-4 text-sm">{active?<><h4 className="font-semibold">{active.fullName}</h4><p className="mt-2">{active.email}</p><p>{active.mobile}</p><p className="mt-2">Requested: {active.venueName} · {active.day} {active.start}</p><p>Experience: {active.experienceLevel||'Not specified'}</p><p>Status: {active.status.replaceAll('_',' ')}</p><p>Booking: {active.bookingStatus||'Not completed'}</p><p>Payment: {active.paymentStatus||'Not started'}</p><p className="mt-3 text-xs text-muted-foreground">Review-only workspace. Approval and email actions remain in the existing authorised booking engine until their integrated controls pass UAT.</p><Link to="/app/guest-bookings" className="mt-3 inline-block rounded-lg border px-3 py-2 text-primary">Open existing booking controls</Link></>:<p className="text-muted-foreground">Select a guest to view their booking journey.</p>}</div></div>}
 </section>;
}
