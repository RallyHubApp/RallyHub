import React,{useMemo,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {generateGroupFixtures,createKnockoutPairs,createKnockoutBracket,computeLeaderboard,validateTournivalScore} from '@/lib/tournivalEngine';
import {indexTournivalMatches,scheduleTournivalCourts,recordTournivalResult} from '@/lib/tournivalScheduler';
import {createTournivalEvent,registerTournivalPlayer,checkInTournivalPlayer,startTournival,applyTournivalMatchChange,tournivalPublicSnapshot,assertRehearsalIsolation} from '@/lib/tournivalOperations';

const syntheticIds=n=>Array.from({length:n},(_,i)=>`rehearsal-player-${i+1}`);
const play=(match,scoreA,scoreB)=>recordTournivalResult([match],{
  matchId:match.id,expectedRevision:match.revision,
  idempotencyKey:`rehearsal:${match.id}:${match.revision}`,
  scoreA,scoreB,matchFormat:'timed_10'
},validateTournivalScore).matches[0];

/**
 * Deliberately self-contained local rehearsal. No Base44 writes, gateway calls,
 * provider requests, real communication or live-statistics effects.
 */
export default function TournivalRehearsal() {
 const [players,setPlayers]=useState(16);
 const [courts,setCourts]=useState(4);
 const [rounds,setRounds]=useState(4);
 const [event,setEvent]=useState(null);
 const [error,setError]=useState('');
 const [history,setHistory]=useState([]);
 const [qualification,setQualification]=useState([]);
 const [knockout,setKnockout]=useState([]);
 const [phase,setPhase]=useState('not_started');
 const [manualA,setManualA]=useState(8);
 const [manualB,setManualB]=useState(5);
 const playerNames=useMemo(()=>Object.fromEntries(syntheticIds(players).map((id,i)=>[id,`Rehearsal Player ${i+1}`])),[players]);
 const action=fn=>{try{setError('');fn();}catch(e){setError(e.message||'Action failed');}};
 const initialise=()=>action(()=>{
   let next=createTournivalEvent({id:'REHEARSAL-LOCAL',tenantId:'simulation',clubId:'simulation',capacity:players,fee:5,rehearsal:true});
   for(const id of syntheticIds(players)){
     next=registerTournivalPlayer(next,{playerId:id,name:playerNames[id],operationId:`register:${id}`}).event;
     next=checkInTournivalPlayer(next,{playerId:id}).event;
   }
   const fixtures=generateGroupFixtures(syntheticIds(players),courts,rounds);
   const matches=indexTournivalMatches(fixtures);
   next=startTournival(next,{matches});
   assertRehearsalIsolation(next);
   setEvent(next);setQualification(fixtures);setKnockout([]);setPhase('qualification');
   setHistory([ 'Rehearsal started: synthetic players checked in; all external integrations disabled.' ]);
 });
 const advance=()=>action(()=>{
   if(!event||phase==='complete')return;
   if(phase==='qualification'){
     const scheduled=scheduleTournivalCourts(event.matches,{courts});
     if(scheduled.assignments.length){
       setEvent(applyTournivalMatchChange(event,{matches:scheduled.matches,action:'court_allocate'}));
       setHistory(h=>[`Allocated ${scheduled.assignments.length} courts`,...h].slice(0,20));
       return;
     }
     if(event.matches.some(m=>m.status==='playing')){setError('Score active matches first');return;}
     if(event.matches.some(m=>m.status==='waiting')){setError('Remaining matches blocked');return;}
     const results={};
     for(const m of event.matches){
       if(!results[m.round])results[m.round]={};
       results[m.round][m.order+1]=m.result;
     }
     const ranked=computeLeaderboard(syntheticIds(players),qualification,results,playerNames);
     const num= Math.min(8,2**Math.floor(Math.log2(Math.floor(players/2))));
     const pairs=createKnockoutPairs(ranked.slice(0,num*2));
     const bracket=createKnockoutBracket(pairs).map((m,i)=>({
       id:`knockout:0:${i}`,round:rounds+1,order:i,stage:m.match.startsWith('QF')?'QF':m.match.startsWith('SF')?'SF':'Final',
       pair1:m.pair1,pair2:m.pair2,teamA:[m.pair1.player1.id,m.pair1.player2.id],teamB:[m.pair2.player1.id,m.pair2.player2.id],
       status:'waiting',court:null,revision:0,result:null,matchFormat:'timed_10'
     }));
     setKnockout(bracket);setPhase('knockout');
     setHistory(h=>['Qualification complete; knockout drawn without fabricated results.',...h].slice(0,20));
     return;
   }
   const existing=knockout;
   const scheduled=scheduleTournivalCourts(existing,{courts});
   if(scheduled.assignments.length){setKnockout(scheduled.matches);return;}
   if(existing.some(m=>m.status==='playing')){setError('Score active knockout matches first');return;}
   if(existing.some(m=>m.status==='waiting'))throw Error('Knockout scheduling blocked');
   const current=existing.at(-1).stage;
   if(current==='Final'){setPhase('complete');setHistory(h=>['Rehearsal final completed.',...h]);return;}
   const winners=existing.filter(m=>m.stage===current).map(m=>m.result.winner==='A'?m.pair1:m.pair2);
   if(winners.length<2)throw Error('Bracket incomplete');
   const following=createKnockoutBracket(winners).map((m,i)=>({
     id:`knockout:${existing.length}:${i}`,round:rounds+2,order:i,
     stage:winners.length===2?'Final':'SF',pair1:m.pair1,pair2:m.pair2,
     teamA:[m.pair1.player1.id,m.pair1.player2.id],teamB:[m.pair2.player1.id,m.pair2.player2.id],
     status:'waiting',court:null,revision:0,result:null,matchFormat:'timed_10'
   }));
   setKnockout([...existing,...following]);
 });
 const score=(id)=>action(()=>{
   const scoreA=Number(manualA),scoreB=Number(manualB);
   const check=validateTournivalScore(scoreA,scoreB,'timed_10');
   if(!check.valid)throw Error(check.error);
   if(phase==='qualification'){
     const match=event.matches.find(m=>m.id===id);
     const next=event.matches.map(m=>m.id===id?play(match,scoreA,scoreB):m);
     setEvent(applyTournivalMatchChange(event,{matches:next,action:'rehearsal_score'}));
   }else{
     const match=knockout.find(m=>m.id===id);
     setKnockout(old=>old.map(m=>m.id===id?play(match,scoreA,scoreB):m));
   }
 });
 const active=phase==='qualification'?event?.matches||[]:knockout;
 const snapshot=event?tournivalPublicSnapshot(event):null;
 return <section className="glass p-4 rounded-xl space-y-3">
  <div><h3 className="font-semibold">Isolated Tournival Rehearsal</h3>
   <p className="text-xs text-muted-foreground">All participants and results are synthetic. No live records, payments, communications, DUPR submissions or statistics.</p></div>
  <div className="grid grid-cols-3 gap-2">
   <label className="text-xs">Players <Input aria-label="Rehearsal players" type="number" min="8" max="32" step="4" value={players} onChange={e=>setPlayers(Math.max(8,Math.min(32,Number(e.target.value))))} /></label>
   <label className="text-xs">Courts <Input aria-label="Rehearsal courts" type="number" min="1" max="8" value={courts} onChange={e=>setCourts(Math.max(1,Math.min(8,Number(e.target.value))))} /></label>
   <label className="text-xs">Rounds <Input aria-label="Rehearsal rounds" type="number" min="2" max="6" value={rounds} onChange={e=>setRounds(Math.max(2,Math.min(6,Number(e.target.value))))} /></label>
  </div>
  <Button onClick={initialise} variant="outline">Start / Reset Rehearsal</Button>
  {event&&<div className="space-y-2">
    <p className="text-xs">Phase: <strong>{phase}</strong> · Revision {event.revision} · {snapshot?.registered} checked-in synthetic participants</p>
    <Button onClick={advance} disabled={phase==='complete'}>Allocate / Advance Tournament</Button>
    <div className="flex gap-2">
     <label className="text-xs">Team A score <Input aria-label="Rehearsal score A" type="number" min="0" value={manualA} onChange={e=>setManualA(e.target.value)}/></label>
     <label className="text-xs">Team B score <Input aria-label="Rehearsal score B" type="number" min="0" value={manualB} onChange={e=>setManualB(e.target.value)}/></label>
    </div>
    <div className="space-y-1 max-h-80 overflow-auto">
      {active.filter(m=>m.status==='playing').map(m=><div key={m.id} className="flex items-center justify-between gap-2 border border-border rounded-lg p-2 text-xs">
        <span>{m.stage||`Round ${m.round}`} · Court {m.court} · {m.id}</span>
        <Button size="sm" onClick={()=>score(m.id)}>Save simulated score</Button>
      </div>)}
    </div>
   </div>}
  {error&&<p role="alert" className="text-xs text-destructive">{error}</p>}
  <div aria-label="Rehearsal activity" className="text-xs text-muted-foreground">{history.slice(0,6).map((line,i)=><p key={i}>{line}</p>)}</div>
 </section>;
}
