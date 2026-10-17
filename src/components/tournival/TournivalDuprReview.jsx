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
 if(!isAdmin)return null;
 const preview=async()=>{
  setBusy(true);setError('');
  try{
   const res=await base44.functions.invoke('duprIntegration',{
    action:'preview_tournival_uat',tournamentId:tournament.id,scoringType
   });
   if(res.data?.error)throw Error(res.data.error);
   setData(res.data);
  }catch(e){setError(e?.response?.data?.error||e?.message||'DUPR preview unavailable');}
  finally{setBusy(false);}
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
   <p className="text-xs text-muted-foreground mt-2">UAT dry run only. Nothing has been sent to DUPR.</p>
  </div>}
 </section>;
}
