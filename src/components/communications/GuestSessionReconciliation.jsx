import React,{useState} from 'react';
import {reconcileGuestSession} from '@/lib/ccc/guestAttendanceReconciliation';

/** Guest session reconciliation uses the existing booking attendance_save action. */
export default function GuestSessionReconciliation({bookings=[],attendance={},onMark,busy=false}){
 const [selected,setSelected]=useState(null);
 const {counts,outstanding,complete}=reconcileGuestSession(bookings,attendance);
 return <section className="rounded-xl border p-4" aria-label="Guest attendance reconciliation">
  <h3 className="font-semibold">Guest attendance reconciliation</h3>
  <p className="mt-1 text-xs text-muted-foreground">Confirmed and cash-due bookings only. Outstanding check-ins are not assumed to be no-shows.</p>
  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{[['Expected',counts.eligible],['Attended',counts.attended],['No-show',counts.noShow],['Outstanding',counts.unconfirmed]].map(([label,n])=><div key={label} className="rounded-lg border p-2"><div className="text-xs text-muted-foreground">{label}</div><div className="font-semibold tabular-nums">{n}</div></div>)}</div>
  {counts.duplicates>0&&<p role="alert" className="mt-2 text-sm text-destructive">Duplicate booking IDs detected. Investigate before closing attendance.</p>}
  <p className="mt-3 text-sm">{complete?'All eligible guest bookings have a recorded attendance outcome.':`${outstanding.length} eligible bookings still need attendance review.`}</p>
  <div className="mt-2 max-h-64 space-y-2 overflow-auto">{outstanding.map(r=><div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-sm"><div><strong>{r.name}</strong><div className="text-xs text-muted-foreground">{r.email} {r.mobile}</div></div><div className="flex gap-1">{[['attended','Attended'],['no_show','No-show'],['cancelled','Cancelled']].map(([value,label])=><button key={value} type="button" disabled={busy} onClick={()=>setSelected({id:r.id,name:r.name,status:value})} className="rounded border px-2 py-1 text-xs disabled:opacity-50">{label}</button>)}</div></div>)}</div>
  {selected&&<div role="group" aria-label="Confirm guest attendance" className="mt-3 rounded-lg border p-3"><p className="text-sm font-semibold">Mark {selected.name} as {selected.status.replaceAll('_',' ')}?</p><div className="mt-2 flex gap-2"><button type="button" disabled={busy} className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={()=>{const item=selected;setSelected(null);onMark(item.id,item.status)}}>Confirm</button><button type="button" disabled={busy} className="rounded border px-3 py-2 text-sm" onClick={()=>setSelected(null)}>Cancel</button></div></div>}
  <p className="mt-3 text-xs text-muted-foreground">No automatic follow-up emails. Attended recipients still require the existing template, consent and send review.</p>
 </section>;
}
