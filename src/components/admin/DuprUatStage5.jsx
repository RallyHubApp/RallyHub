import React,{useCallback,useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
const today=()=>new Date().toISOString().slice(0,10);
const errorText=e=>e?.response?.data?.error||e?.message||'DUPR UAT request failed';
function matchFor(accounts,clubId,id,loser){
 const idFor=slot=>accounts.find(a=>a.slot===slot)?.duprId;
 return {identifier:id,matchSource:'CLUB',clubId:Number(clubId),event:'RallyHub DUPR UAT acceptance',
  bracket:'Controlled doubles',location:'Ennis, Ireland',matchDate:today(),format:'DOUBLES',matchType:'RALLY',
  matchPlayType:'TOURNAMENT',matchCompletionType:'COMPLETED',
  teamA:{player1:idFor('brian'),player2:idFor('marie'),game1:11},
  teamB:{player1:idFor('roisin'),player2:idFor('rallyhub'),game1:Number(loser)}};
}
export default function DuprUatStage5(){
 const [gate,setGate]=useState(null),[records,setRecords]=useState([]),[ratings,setRatings]=useState(null);
 const [score,setScore]=useState('9'),[correction,setCorrection]=useState('10'),[identifier,setIdentifier]=useState('');
 const [busy,setBusy]=useState(''),[error,setError]=useState(''),[out,setOut]=useState(null),[confirmed,setConfirmed]=useState(false);
 const call=useCallback(async(action,data={})=>{
  const response=await base44.functions.invoke('duprIntegration',{action,...data});
  if(!response.data?.success)throw Error(response.data?.error||'DUPR operation unsuccessful');
  return response.data;
 },[]);
 const refresh=useCallback(async()=>{
  const [preflight,matches]=await Promise.all([call('uat_match_preflight'),call('uat_match_records')]);
  setGate(preflight);setRecords(matches.records||[]);
 },[call]);
 useEffect(()=>{refresh().catch(e=>setError(errorText(e)));},[refresh]);
 const selected=records.find(x=>x.identifier===identifier);
 const submitter=gate?.accounts?.find(x=>x.clubAdmin)?.slot;
 const permitted=gate?.ready===true&&submitter==='brian';
 const build=(id,points)=>matchFor(gate.accounts,gate.clubId,id,points);
 const flags=()=>({confirmUatTest:true,submitterSlot:submitter});
 const run=async(name,fn)=>{
  setBusy(name);setError('');setOut(null);
  try{const value=await fn();setOut({operation:name,...value});await refresh();}
  catch(e){setError(errorText(e));}finally{setBusy('');setConfirmed(false);}
 };
 const active=records.filter(x=>x.status!=='deleted');
 return <section className="rounded-lg border border-border p-4 space-y-3" aria-label="DUPR Stage 5 match testing">
  <h3 className="font-semibold">Stage 5 — controlled DUPR match testing (UAT only)</h3>
  <p className="text-xs text-muted-foreground">Brian + Marie versus Róisín + RallyHub App. Real DUPR UAT submission, not live DUPR. Keep a test match active until you have checked the downstream rating webhook.</p>
  <p className="text-sm">{permitted?'Four eligible UAT players and Brian club authorisation confirmed':'UAT preflight not ready — submission disabled'} · Club {gate?.clubId||'checking'}</p>
  <div className="flex flex-wrap gap-3">
   <label className="text-sm">Initial score 11–<select aria-label="Initial losing score" className="ml-1 rounded border border-border bg-background p-2" value={score} onChange={e=>setScore(e.target.value)}><option value="9">9 (win by two)</option><option value="10">10 (win by one)</option></select></label>
   <label className="text-sm">Correction 11–<select aria-label="Corrected losing score" className="ml-1 rounded border border-border bg-background p-2" value={correction} onChange={e=>setCorrection(e.target.value)}><option value="10">10 (win by one)</option><option value="9">9 (win by two)</option></select></label>
  </div>
  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> Confirm authorised DUPR UAT test only</label>
  <div className="flex flex-wrap gap-2">
   <Button disabled={!!busy||!permitted||!confirmed} onClick={()=>run('Submit match',async()=>{
    const id='RH-UAT-STAGE5-'+Date.now()+'-'+Math.floor(Math.random()*1000000);
    const response=await call('uat_submit_match',{match:build(id,score),...flags()});
    setIdentifier(id);return response;
   })}>Submit 11–{score} test match</Button>
   <Button variant="outline" disabled={!!busy||!permitted||!confirmed||!selected||selected.status==='deleted'} onClick={()=>run('Duplicate protection',async()=>{
    let blocked=false;let explanation='';
    try{await call('uat_submit_match',{match:build(identifier,score),...flags()});}catch(e){explanation=errorText(e);blocked=/previously used|reconciliation|already/i.test(explanation);}
    if(!blocked)throw Error('Duplicate rejection not confirmed: '+explanation);
    return {success:true,duplicateBlocked:true,identifier};
   })}>Test duplicate rejection</Button>
   <Button variant="outline" disabled={!!busy||!permitted||!confirmed||!selected?.matchCode||selected.status==='deleted'} onClick={()=>run('Correct match',()=>call('uat_update_match',{identifier,match:build(identifier,correction),...flags()}))}>Correct to 11–{correction}</Button>
   <Button variant="outline" disabled={!!busy} onClick={()=>run('Inspect rating events',async()=>{
    const response=await call('uat_rating_events');setRatings(response.events);return response;
   })}>Check rating notifications</Button>
   <Button variant="destructive" disabled={!!busy||!permitted||!confirmed||!selected?.matchCode||selected.status==='deleted'} onClick={()=>run('Delete UAT match',()=>call('uat_delete_match',{identifier,...flags()}))}>Delete selected match</Button>
   <Button variant="outline" disabled={!!busy} onClick={()=>run('Refresh',async()=>({success:true}))}>Refresh test records</Button>
  </div>
  <p className="text-xs text-muted-foreground">Submission, score correction and deletion are independent actions. Leave one match active until the downstream rating check is completed.</p>
  <label className="block text-sm">Saved UAT test submissions
   <select aria-label="Select existing DUPR match" className="mt-1 block w-full rounded border border-border bg-background p-2" value={identifier} onChange={e=>{setIdentifier(e.target.value);setConfirmed(false);}}>
    <option value="">Select test match</option>{records.map(r=><option key={r.identifier} value={r.identifier}>{r.identifier} · {r.status} {r.matchCode?'· DUPR '+r.matchCode:''}</option>)}
   </select>
  </label>
  {active.some(x=>x.status==='needs_reconciliation')&&<p role="alert" className="text-sm text-destructive">A submission needs reconciliation. Do not create replacement results until its provider status has been established.</p>}
  <p className="text-xs">Unresolved/active: {active.length} · Deleted: {records.length-active.length}</p>
  {busy&&<p>Running {busy}…</p>}
  {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  {out&&<pre className="max-h-64 overflow-auto rounded border p-2 text-xs">{JSON.stringify(out,null,2)}</pre>}
  {ratings&&<pre className="max-h-64 overflow-auto rounded border p-2 text-xs">{JSON.stringify(ratings,null,2)}</pre>}
 </section>;
}
