import React,{useState} from 'react';
import {attendanceAuditCsv,exportReadiness,registrationRosterCsv,safeExportFilename} from '@/lib/ccc/registrationExports';
/** Local exports of already-loaded admin roster; no network, no mutations or settlement claims. */
export default function ClubRegistrationExports({eventId,rows=[],hasMore=false,initialPaymentReadComplete=false,extraReview=false,busy=false}){
 const [confirm,setConfirm]=useState(null);
 const readiness=exportReadiness(rows,{hasMore,initialPaymentReadComplete,extraReview});
 const download=kind=>{
  if(busy||!rows.length)return;
  const content=kind==='attendance'?attendanceAuditCsv(rows):registrationRosterCsv(rows);
  const blob=new Blob([content],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  try{const anchor=document.createElement('a');anchor.href=url;anchor.download=safeExportFilename(eventId,kind);document.body.appendChild(anchor);anchor.click();anchor.remove()}finally{URL.revokeObjectURL(url);setConfirm(null)}
 };
 return <section className="mt-4 rounded-xl border p-3" aria-label="Registration exports"><h3 className="font-semibold">Registration and attendance exports</h3><p className="mt-1 text-xs text-muted-foreground">Export only the registrations currently loaded in this admin view. Contains personal contact details; store securely and delete local copies when no longer needed. No emails or payments are triggered.</p>
 <p className="mt-2 text-sm">{readiness.loaded} loaded records · {readiness.complete?'All registration pages loaded':'Partial or duplicate roster — review required'}</p>
 {readiness.warnings.map(w=><p key={w} role="alert" className="mt-1 text-xs text-amber-700">{w}</p>)}
 <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={!rows.length||busy} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50" onClick={()=>setConfirm('roster')}>Export loaded roster CSV</button><button type="button" disabled={!rows.length||busy} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50" onClick={()=>setConfirm('attendance')}>Export attendance audit CSV</button></div>
 {confirm&&<div role="group" aria-label="Confirm personal data export" className="mt-3 rounded-lg border p-3"><p className="text-sm font-semibold">Export {confirm==='roster'?'registration roster':'attendance audit'} with personal data?</p><p className="mt-1 text-xs text-muted-foreground">{readiness.loaded} loaded rows available. {readiness.complete?'Registration pages loaded.':'This is a partial export.'} Payment values are internal records only, not verified SumUp settlement.</p><div className="mt-2 flex gap-2"><button type="button" className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={()=>download(confirm)}>Download CSV</button><button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={()=>setConfirm(null)}>Cancel</button></div></div>}
 </section>;
}
