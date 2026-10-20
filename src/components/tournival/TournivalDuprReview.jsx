import React,{useState} from 'react';
import {Button} from '@/components/ui/button';
import {base44} from '@/api/base44Client';
/**
 * Host preview is deliberately read-only. UAT writing requires separately
 * verified identities, privileges, provider test conditions and explicit approval.
 */
export default function TournivalDuprReview({tournament,state,isAdmin}){
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [scoringType,setScoringType]=useState('SIDEOUT');
 const [selected,setSelected]=useState([]);
 const [confirm,setConfirm]=useState(false);
 const [receipt,setReceipt]=useState(null);
 if(!isAdmin)return null;
 const preview=async()=>{
  setBusy(true);setError('');
  try{
   const res=await base44.functions.invoke('duprIntegration',{
    action:'preview_tournival_uat',tournamentId:tournament.id,scoringType
   });
   if(res.data?.error)throw Error(res.data.error);
   setData(res.data);
   setSelected((res.data?.matchRecords||[]).filter(r=>r.status==='not_submitted').map(r=>r.identifier));
  }catch(e){setError(e?.response?.data?.error||e?.message||'DUPR preview unavailable');}
  finally{setBusy(false);}
 };
 const submit=async()=>{
  setBusy(true);setError('');setReceipt(null);
  try{
   const res=await base44.functions.invoke('duprIntegration',{
    action:'submit_tournival_uat',tournamentId:tournament.id,scoringType,
    confirmUatTest:true,identifiers:selected
   });
   if(!res.data?.success)throw Error(res.data?.error||'DUPR UAT submission unsuccessful');
   setReceipt(res.data);
   const view=await base44.functions.invoke('duprIntegration',{
    action:'preview_tournival_uat',tournamentId:tournament.id,scoringType
   });
   if(view.data?.success)setData(view.data);
   setSelected([]);
  }catch(e){setError(e?.response?.data?.error||e?.message||'DUPR UAT submission failed');}
  finally{setBusy(false);setConfirm(false);}
 };
 return <section className="glass rounded-xl p-5 space-y-3">
  <h3 className="font-semibold">Optional DUPR reporting</h3>
  <p className="text-xs text-muted-foreground">Only completed, eligible point-scored results with consent and verified DUPR identities are considered. Timed matches are excluded until DUPR explicitly confirms their eligibility.</p>
  <p className="text-xs">{state?.duprEnabled?'DUPR review enabled for this event':'DUPR reporting is switched off for this event'}</p>
  <label className="text-xs flex items-center gap-2">Scoring method
   <select className="bg-secondary border border-border rounded p-1" value={scoringType} onChange={e=>setScoringType(e.target.value)}>
    <option value="SIDEOUT">Side-out</option><option value="RALLY">Rally</option>
   </select>
  </label>
  <Button size="sm" disabled={busy||!state?.duprEnabled} onClick={preview}>
   {busy?'Checking…':'Review DUPR-eligible results (no submission)'}
  </Button>
  {error&&<p role="alert" className="text-xs text-destructive">{error}</p>}
  {data&&<div className="text-sm">
   <p>Eligible: {data.eligibleCount} · Excluded: {data.excludedCount}</p>
   {Object.entries(data.reasons||{}).map(([reason,count])=><p key={reason} className="text-xs">{reason}: {count}</p>)}
   {(data.matchRecords||[]).map(r=><label key={r.identifier} className="flex items-center gap-2 text-xs py-1">
    <input type="checkbox" checked={selected.includes(r.identifier)}
     disabled={busy||r.status!=='not_submitted'} onChange={e=>setSelected(prev=>e.target.checked?[...prev,r.identifier]:prev.filter(x=>x!==r.identifier))}/>
    <span className="break-all">{r.identifier} · {r.status} {r.matchCode?'· DUPR '+r.matchCode:''}</span>
   </label>)}
   <p className="text-xs text-muted-foreground mt-2">Eligibility review is read-only. Actual submission uses server-stored results and the four verified UAT identities.</p>
  </div>}
  {data&&<div className="border-t pt-3 space-y-2">
   <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)}/> Confirm authorised DUPR UAT test only (never live DUPR)</label>
   <Button size="sm" disabled={busy||!confirm||selected.length===0||state?.status!=='Completed'}
    onClick={submit}>{busy?'Submitting…':'Submit selected stored results to DUPR UAT'}</Button>
   {receipt&&<pre className="text-xs max-h-48 overflow-auto">{JSON.stringify(receipt,null,2)}</pre>}
  </div>}
 </section>;
}
