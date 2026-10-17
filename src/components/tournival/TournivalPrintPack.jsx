import React from 'react';
import {Button} from '@/components/ui/button';
import {Printer} from 'lucide-react';
import {computeLeaderboard} from '@/lib/tournivalEngine';

/** A4 operational pack, sourced from the actual confirmed fixture/scores snapshot. */
export default function TournivalPrintPack({tournament,state,playerMap={},currentRevision}) {
 if(!state)return null;
 const revision=Number(state.revision||0);
 const stale=currentRevision!==undefined && currentRevision!==null && Number(currentRevision)!==revision;
 const rounds=state.rounds||[];
 const leaderboard=computeLeaderboard(state.playerIds||[],rounds,state.results||{},playerMap);
 const generatedAt=new Date().toLocaleString('en-IE');
 return <article className="glass rounded-xl p-5 print:bg-white print:text-black print:p-0">
   <div className="flex items-center justify-between gap-2 print:hidden">
     <h3 className="font-semibold">Tournival Operational Print Pack</h3>
     <Button variant="outline" onClick={()=>window.print()}><Printer className="w-4 h-4 mr-2"/>Print A4 Pack</Button>
   </div>
   {stale&&<p role="alert" className="font-bold text-destructive">STALE PACK — regenerate against the current event revision before use.</p>}
   <div className="my-3 text-xs"><strong>{tournament.name||'Tournival'}</strong> · {tournament.location||'Venue pending'} · {tournament.start_date||'Date pending'} · Rev {revision} · Generated {generatedAt}</div>
   <div className="text-xs mb-3">Format: {state.matchFormat} · {state.numCourts} courts · {state.numRounds} qualification rounds · Final mandatory · Venue booking {state.venueMinutes||'not set'} min</div>
   <h4 className="font-semibold text-sm mt-4">Roster and check-in</h4>
   <table className="w-full text-xs border-collapse"><thead><tr><th className="text-left">Player</th><th>Present</th><th>Notes</th></tr></thead>
    <tbody>{(state.playerIds||[]).map(id=><tr key={id} className="border-t border-border"><td>{playerMap[id]||id}</td><td className="text-center">□</td><td>________________</td></tr>)}</tbody></table>
   <h4 className="font-semibold text-sm mt-4">Qualification fixtures and result recovery</h4>
   {rounds.map(round=><section key={round.roundNumber} className="my-3 break-inside-avoid">
    <h5 className="font-semibold text-xs">Round {round.roundNumber}</h5>
    <table className="w-full text-xs border-collapse"><thead><tr><th>Match ID</th><th>Team A</th><th>Team B</th><th>Score</th></tr></thead>
    <tbody>{round.courts.map((court,i)=>{
      const result=state.results?.[round.roundNumber]?.[court.courtNumber];
      return <tr key={i} className="border-t border-border">
       <td>Q:{round.roundNumber}:{i+1}</td><td>{court.teamA.map(p=>playerMap[p]||p).join(' / ')}</td>
       <td>{court.teamB.map(p=>playerMap[p]||p).join(' / ')}</td>
       <td>{result?`${result.scoreA}–${result.scoreB}`:'___ – ___'}</td>
      </tr>;
    })}</tbody></table>
   </section>)}
   <h4 className="font-semibold text-sm mt-4">Qualification standings</h4>
   <table className="w-full text-xs"><thead><tr><th>Rank</th><th>Player</th><th>Wins</th><th>Points diff</th></tr></thead>
    <tbody>{leaderboard.map((row,i)=><tr key={row.id} className="border-t border-border">
      <td>{i+1}</td><td>{row.name}</td><td>{row.wins}</td><td>{row.diff}</td></tr>)}</tbody></table>
   <h4 className="font-semibold text-sm mt-4">Knockout / final</h4>
   {(state.knockoutState?.bracket||[]).length? (state.knockoutState.bracket.map(m=><p key={m.id} className="text-xs my-1">
    {m.stage} · {m.id}: {m.pair1?.player1?.name} / {m.pair1?.player2?.name} v {m.pair2?.player1?.name} / {m.pair2?.player2?.name} — {m.result?`${m.result.scoreA}–${m.result.scoreB}`:'___ – ___'}
   </p>)):<p className="text-xs">Bracket pending qualification. Reserve scorecards for semifinals and final.</p>}
   <h4 className="font-semibold text-sm mt-4">Recovery instructions</h4>
   <p className="text-xs">Record match ID, round, teams, scores, scorer and local completion time. After reconnection, refresh the authoritative server state, compare revision and results, reconcile discrepancies with the host, and enter each missing result once. Never overwrite an existing confirmed result without audit.</p>
   <style>{`@media print{ @page{size:A4;margin:12mm} body{background:white!important;color:black!important} button{display:none!important} table{width:100%;border-collapse:collapse}th,td{padding:3px;border-bottom:1px solid #ccc}section{break-inside:avoid} }`}</style>
 </article>;
}
