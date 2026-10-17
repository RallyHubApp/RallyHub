import React from 'react';
import {computeLeaderboard} from '@/lib/tournivalEngine';
/** Versioned read-only projection; does not expose contact, payment or tokens. */
export default function TournivalHall({tournament,state,playerMap={}}){
 if(!state)return <p>Event has not started.</p>;
 const rounds=state.rounds||[],current=state.currentRound||1;
 const active=rounds[current-1]?.courts||[];
 const standings=computeLeaderboard(state.playerIds||[],rounds,state.results||{},playerMap);
 return <section className="glass rounded-xl p-5 space-y-4" aria-live="polite">
  <header><h2 className="font-semibold text-lg">{tournament.name||'Tournival'} — Live Hall</h2>
   <p className="text-xs text-muted-foreground">Confirmed state revision {state.revision||0} · Qualification round {Math.min(current,rounds.length)} of {rounds.length}</p></header>
  <div className="grid gap-3 sm:grid-cols-2">{active.map(c=>{
    const result=state.results?.[current]?.[c.courtNumber];
    return <article key={c.courtNumber} className="rounded-lg border border-border p-3">
      <h3 className="text-sm font-semibold">Court {c.courtNumber}</h3>
      <p className="text-xs">{c.teamA.map(id=>playerMap[id]||id).join(' & ')}</p>
      <p className="text-center text-sm font-bold">{result?`${result.scoreA} — ${result.scoreB}`:'v'}</p>
      <p className="text-xs">{c.teamB.map(id=>playerMap[id]||id).join(' & ')}</p>
      <p className="text-xs text-muted-foreground">{result?'Result confirmed':'Awaiting score'}</p>
    </article>;
  })}</div>
  <h3 className="font-semibold text-sm">Qualification standings</h3>
  <ol className="text-xs space-y-1">{standings.slice(0,10).map((p,i)=><li key={p.id}>{i+1}. {p.name} — {p.wins} wins ({p.diff>=0?'+':''}{p.diff})</li>)}</ol>
  {!!state.knockoutState?.bracket?.length&&<section><h3 className="font-semibold text-sm">Knockout progress</h3>
    {state.knockoutState.bracket.map(m=><p key={m.id} className="text-xs">{m.stage} · {m.label||m.id} {m.result?`${m.result.scoreA}–${m.result.scoreB}`:'awaiting result'}</p>)}
   </section>}
 </section>;
}
