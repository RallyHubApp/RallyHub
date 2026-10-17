import React from 'react';
import {calculateTournivalStats,completedTournivalMatchRecords} from '@/lib/tournivalStatistics';
export default function TournivalStatistics({state,playerMap={}}) {
 if(!state)return null;
 const final=(state.knockoutState?.bracket||[]).find(m=>m.stage==='Final'&&m.result);
 const podium=final?{
  first:[final.result.winner==='A'?final.pair1?.player1?.id:final.pair2?.player1?.id,
         final.result.winner==='A'?final.pair1?.player2?.id:final.pair2?.player2?.id].filter(Boolean),
  second:[final.result.winner==='A'?final.pair2?.player1?.id:final.pair1?.player1?.id,
          final.result.winner==='A'?final.pair2?.player2?.id:final.pair1?.player2?.id].filter(Boolean)
 }:{};
 const stats=calculateTournivalStats({
  playerIds:state.playerIds||[],matches:completedTournivalMatchRecords(state),
  podium,rehearsal:state.rehearsal===true
 });
 if(stats.excluded)return <p>Rehearsal statistics are excluded from permanent records.</p>;
 return <section className="glass rounded-xl p-5">
  <h2 className="font-semibold">Tournival Event Statistics</h2>
  <p className="text-xs text-muted-foreground">Calculated from each confirmed match ID, not cumulative counters. Corrections recompute totals without duplicating appearances.</p>
  <div className="overflow-x-auto">
   <table className="text-xs w-full mt-3"><thead><tr className="text-left">
    <th>Player</th><th>Played</th><th>Won</th><th>Lost</th><th>For</th><th>Against</th><th>Diff</th><th>Podium</th>
   </tr></thead><tbody>{stats.players.map(p=><tr key={p.playerId} className="border-t border-border">
    <td>{playerMap[p.playerId]||p.playerId}</td><td>{p.played}</td><td>{p.wins}</td>
    <td>{p.losses}</td><td>{p.pointsFor}</td><td>{p.pointsAgainst}</td><td>{p.pointDiff}</td><td>{p.podium||'–'}</td>
   </tr>)}</tbody></table>
  </div>
 </section>;
}
