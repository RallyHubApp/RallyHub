import React,{useState} from 'react';
import {reconcileEventAttendance} from '@/lib/ccc/attendanceReconciliation';

/** Explicit one-person-at-a-time reconciliation; never infers no-show from absence. */
export default function ClubAttendanceReconciliation({registrations=[],hasMore=false,busy=false,onMark}){
 const [selected,setSelected]=useState(null);
 const result=reconcileEventAttendance(registrations,{hasMore});
 const {counts,queue}=result;
 return <section className="mt-4 rounded-xl border p-3" aria-label="Attendance reconciliation">
  <h3 className="font-semibold">Attendance reconciliation</h3>
  <p className="mt-1 text-xs text-muted-foreground">Confirmed bookings only. Review each outstanding participant against the actual session roster. Missing check-in is not automatically treated as a no-show.</p>
  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">{[['Confirmed',counts.confirmed],['Attended',counts.attended],['No-show',counts.noShow],['Excused',counts.excused],['Outstanding',counts.unmarked]].map(([label,n])=><div key={label} className="rounded-lg border p-2"><div className="text-xs text-muted-foreground">{label}</div><div className="text-lg font-semibold tabular-nums">{n}</div></div>)}</div>
  {!result.allPagesLoaded&&<p role="alert" className="mt-2 text-sm text-amber-700">Additional registration pages remain. These are loaded-page counts only; reconciliation cannot be closed yet.</p>}
  {counts.duplicateIds>0&&<p role="alert" className="mt-2 text-sm text-destructive">{counts.duplicateIds} duplicate registration IDs in the loaded roster. Reload and investigate before closing.</p>}
  {result.closed?<p role="status" className="mt-3 text-sm">All confirmed registrations in the fully loaded roster have an attendance outcome. No outstanding check-ins.</p>:<p className="mt-3 text-sm font-medium">{queue.length} confirmed participants require an attendance decision in the loaded roster.</p>}
  <div className="mt-2 max-h-72 space-y-2 overflow-auto">{queue.map(r=><div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-sm"><div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}{r.mobile?' · '+r.mobile:''}</div></div><div className="flex flex-wrap gap-1">{[['attended','Attended'],['no_show','No-show'],['excused','Excused']].map(([value,label])=><button type="button" key={value} disabled={busy} onClick={()=>setSelected({row:r,value})} className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50">{label}</button>)}</div></div>)}</div>
  {selected&&<div role="group" aria-label="Confirm attendance reconciliation" className="mt-3 rounded-lg border p-3"><p className="text-sm font-semibold">Record {selected.row.name} as {selected.value.replaceAll('_',' ')}?</p><p className="mt-1 text-xs text-muted-foreground">This updates one existing confirmed registration and is recorded in the audit trail. Check the actual attendance before confirming.</p><div className="mt-2 flex gap-2"><button type="button" disabled={busy} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50" onClick={()=>{const choice=selected;setSelected(null);onMark(choice.row,choice.value)}}>Confirm attendance</button><button type="button" disabled={busy} className="rounded-lg border px-3 py-2 text-sm" onClick={()=>setSelected(null)}>Cancel</button></div></div>}
  <p className="mt-3 text-xs text-muted-foreground">{result.closed?'Reconciliation complete for the loaded event roster.':'Outstanding records or incomplete pages require review.'} Follow-up candidates are restricted to attended participants; consent and suppression must be checked separately.</p>
 </section>;
}
