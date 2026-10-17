import React,{useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {validateTournivalScore} from '@/lib/tournivalEngine';
import {indexTournivalMatches,scheduleTournivalCourts,recordTournivalResult} from '@/lib/tournivalScheduler';

/**
 * Independent asynchronous Tournival court workflow.
 * All commands go through the enclosing authenticated version-checked host save.
 * No KOTC state or operations. The authoritative state is always the server reply.
 */
export default function TournivalLiveScoring({state,playerMap={},onSaveState,isAdmin}) {
 const busyRef=useRef(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [drafts,setDrafts]=useState({});
 const matches=state.matches||indexTournivalMatches(state.rounds||[]);
 const courtLimit=Number(state.numCourts||4);
 const active=matches.filter(m=>m.status==='playing').sort((a,b)=>a.court-b.court);
 const waiting=matches.filter(m=>m.status==='waiting');
 const complete=matches.filter(m=>m.status==='completed');
 const format=state.matchFormat||'first_11_by1';
 const apply=async makeNext=>{
   if(busyRef.current)return;
   busyRef.current=true;setBusy(true);setError('');
   try{
     const next=makeNext();
     await onSaveState(next);
   }catch(e){setError(e?.message||'Save failed; refresh and check confirmed state.');}
   finally{busyRef.current=false;setBusy(false);}
 };
 const allocate=()=>apply(()=>{
   const scheduled=scheduleTournivalCourts(matches,{courts:courtLimit,
     unavailable:state.unavailablePlayerIds||[],restUntil:state.restUntil||{},paused:state.paused===true});
   if(!scheduled.assignments.length)throw Error('No eligible match can be assigned. Check holds, rest and player availability.');
   return {...state,matches:scheduled.matches};
 });
 const submit=match=>apply(()=>{
   const d=drafts[match.id]||{};
   const validated=validateTournivalScore(d.a,d.b,format);
   if(!validated.valid)throw Error(validated.error);
   const saved=recordTournivalResult(matches,{matchId:match.id,
     expectedRevision:match.revision,idempotencyKey:crypto.randomUUID(),scoreA:d.a,scoreB:d.b,matchFormat:format},validateTournivalScore);
   const scheduled=scheduleTournivalCourts(saved.matches,{courts:courtLimit,
     unavailable:state.unavailablePlayerIds||[],restUntil:state.restUntil||{},paused:state.paused===true});
   const results={...state.results};
   for(const m of scheduled.matches.filter(x=>x.status==='completed')){
     results[m.round]={...(results[m.round]||{}),[m.order+1]:m.result};
   }
   const allComplete=scheduled.matches.every(m=>m.status==='completed');
   const nextRound=allComplete?(state.rounds?.length||0)+1:Math.min(...scheduled.matches.filter(m=>m.status!=='completed').map(m=>m.round));
   return {...state,matches:scheduled.matches,results,currentRound:nextRound,status:allComplete?'Group Complete':'In Progress'};
 });
 const label=ids=>ids.map(id=>playerMap[id]||id).join(' & ');
 const missing=matches.length===0;
 return <section className="space-y-4">
  <div className="glass rounded-xl p-4"><h3 className="font-semibold">Continuous Tournival Court Control</h3>
   <p className="text-xs text-muted-foreground">{complete.length}/{matches.length} qualification matches confirmed · {active.length} active · {waiting.length} waiting · {courtLimit} courts</p>
  </div>
  {isAdmin&&<div className="flex gap-2">
    <Button onClick={allocate} disabled={busy||missing||waiting.length===0}>Allocate free courts</Button>
    <Button variant="outline" onClick={()=>apply(()=>({...state,paused:!state.paused}))} disabled={busy||missing}>{state.paused?'Resume allocations':'Pause allocations'}</Button>
   </div>}
  {state.paused&&<p className="text-xs text-amber-400">Court allocations paused. Existing matches remain visible.</p>}
  {error&&<p role="alert" className="text-xs text-destructive">{error}</p>}
  {missing&&<p role="alert">No fixture records found. Generate a draw in Setup.</p>}
  <div className="grid sm:grid-cols-2 gap-3">{active.map(match=>{
    const d=drafts[match.id]||{};
    return <article key={match.id} className="glass rounded-xl p-4 space-y-2">
      <h4 className="font-semibold text-sm">Court {match.court} · Qualification {match.round}</h4>
      <p className="text-xs">{label(match.teamA)}</p>
      <p className="text-center">v</p>
      <p className="text-xs">{label(match.teamB)}</p>
      {isAdmin&&<div className="flex items-center gap-2">
        <Input aria-label={`A score ${match.id}`} type="number" min="0" value={d.a??''} onChange={e=>setDrafts(prev=>({...prev,[match.id]:{...prev[match.id],a:e.target.value}}))}/>
        <span>–</span>
        <Input aria-label={`B score ${match.id}`} type="number" min="0" value={d.b??''} onChange={e=>setDrafts(prev=>({...prev,[match.id]:{...prev[match.id],b:e.target.value}}))}/>
        <Button onClick={()=>submit(match)} disabled={busy}>Save score</Button>
      </div>}
    </article>;
  })}</div>
  {waiting.length>0&&<p className="text-xs text-muted-foreground">{waiting.length} waiting fixtures are allocated as courts and eligible players become free.</p>}
  {matches.length>0&&complete.length===matches.length&&<p role="status" className="font-semibold text-primary">Qualification complete. Review standings, then create the mandatory knockout and final.</p>}
 </section>;
}
