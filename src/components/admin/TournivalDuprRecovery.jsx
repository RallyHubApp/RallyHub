import React,{useState} from 'react';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';

/** Manual recovery always re-reads authoritative TournivalSession on the server.
 * Never accept scores, player IDs or arbitrary external DUPR payloads in the browser. */
export default function TournivalDuprRecovery(){
 const [tournamentId,setTournamentId]=useState('');
 const [preview,setPreview]=useState(null);
 const [selected,setSelected]=useState([]);
 const [confirmed,setConfirmed]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [receipt,setReceipt]=useState(null);
 const call=async(action,more={})=>{
  const response=await base44.functions.invoke('duprIntegration',{
   action,tournamentId:tournamentId.trim(),scoringType:'SIDEOUT',...more
  });
  if(!response.data?.success)throw Error(response.data?.error||'DUPR UAT recovery failed');
  return response.data;
 };
 const inspect=async()=>{
  setBusy(true);setError('');setReceipt(null);
  try{
   const view=await call('preview_tournival_uat');
   setPreview(view);
   setSelected((view.matchRecords||[]).filter(m=>m.status==='not_submitted').map(m=>m.identifier));
  }catch(e){setError(e?.response?.data?.error||e.message);setPreview(null);}
  finally{setBusy(false);setConfirmed(false);}
 };
 const recover=async()=>{
  setBusy(true);setError('');setReceipt(null);
  try{
   const response=await call('submit_tournival_uat',{
    identifiers:selected,confirmUatTest:true
   });
   setReceipt(response);
   const view=await call('preview_tournival_uat');
   setPreview(view);setSelected([]);
  }catch(e){setError(e?.response?.data?.error||e.message);}
  finally{setBusy(false);setConfirmed(false);}
 };
 return <section className="rounded-lg border border-border p-4 space-y-3">
  <h3 className="font-semibold">Tournival → DUPR UAT · Super Admin recovery</h3>
  <p className="text-xs text-muted-foreground">Select results already saved in a completed Tournival. Only consented, eligible matches belonging to the four verified UAT accounts can be sent. Existing acknowledgements are never resubmitted. Unknown provider outcomes must be reconciled, not retried automatically.</p>
  <label className="block text-sm">Tournival tournament ID
   <input className="block mt-1 w-full rounded border border-border bg-background p-2"
    value={tournamentId} onChange={e=>{setTournamentId(e.target.value);setPreview(null);setSelected([]);setReceipt(null);setConfirmed(false);}}
    placeholder="Paste existing Tournival tournament ID"/>
  </label>
  <Button variant="outline" disabled={busy||!tournamentId.trim()} onClick={inspect}>
   {busy?'Working…':'Inspect stored eligible results'}
  </Button>
  {preview&&<div className="space-y-2 text-sm">
   <p>Eligible: {preview.eligibleCount} · Excluded: {preview.excludedCount}</p>
   {Object.entries(preview.reasons||{}).map(([reason,count])=><p key={reason} className="text-xs">{reason}: {count}</p>)}
   {(preview.matchRecords||[]).map(m=><label key={m.identifier} className="flex gap-2 items-center text-xs">
    <input type="checkbox" disabled={busy||m.status!=='not_submitted'}
     checked={selected.includes(m.identifier)}
     onChange={e=>setSelected(ids=>e.target.checked?[...ids,m.identifier]:ids.filter(id=>id!==m.identifier))}/>
    <span className="break-all">{m.identifier} · {m.status}{m.matchCode?' · DUPR '+m.matchCode:''}</span>
   </label>)}
   <label className="flex gap-2 items-center text-xs"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>
    I authorise this selected UAT-only Tournival recovery submission</label>
   <Button disabled={busy||!confirmed||selected.length===0} onClick={recover}>
    Submit {selected.length} selected stored match{selected.length===1?'':'es'} to DUPR UAT
   </Button>
  </div>}
  {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  {receipt&&<pre className="text-xs max-h-64 overflow-auto">{JSON.stringify(receipt,null,2)}</pre>}
 </section>;
}
