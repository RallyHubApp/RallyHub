import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Swords, Users, Trophy, CalendarRange } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/shared/GlassCard';

const signed=n=>`${Number(n||0)>0?'+':''}${Math.round(Number(n||0))}`;

export default function MemberPerformanceDetails({ performance }) {
  const p=performance?.profile;
  if(!p)return <GlassCard><p className="text-sm text-muted-foreground text-center py-6">No eligible RallyHub performance history yet.</p></GlassCard>;
  const s=p.season||{},all=p.all_time||{};
  const formats=Object.entries(s.formats||{}).sort((a,b)=>Number(b[1]?.matches_played||0)-Number(a[1]?.matches_played||0));
  return <div className="space-y-4">
    <div className="grid sm:grid-cols-2 gap-3">
      <GlassCard className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Current season</p><p className="text-2xl font-black mt-1">#{s.rank||'—'} · {s.leaderboard_points||0} pts</p></div><Trophy className="w-6 h-6 text-primary"/></div><p className="text-xs text-muted-foreground mt-2">{s.matches_played||0} matches · {s.wins||0}W {s.draws||0}D {s.losses||0}L · {signed(s.score_difference)} diff</p></GlassCard>
      <GlassCard className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">All time</p><p className="text-2xl font-black mt-1">#{all.rank||'—'} · {all.leaderboard_points||0} pts</p></div><CalendarRange className="w-6 h-6 text-primary"/></div><p className="text-xs text-muted-foreground mt-2">{all.matches_played||0} matches · {all.wins||0}W {all.draws||0}D {all.losses||0}L · {signed(all.score_difference)} diff</p></GlassCard>
    </div>

    <GlassCard>
      <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">By competition</h3><p className="text-xs text-muted-foreground mt-1">One overall record, broken down by where you played.</p></div><Badge variant="outline">Season {performance?.season?.label}</Badge></div>
      {formats.length?<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">{formats.map(([name,row])=><div key={name} className="rounded-xl border border-border p-3"><p className="text-xs font-black">{name}</p><p className="text-xl font-black mt-2">{row.leaderboard_points||0} pts</p><p className="text-[11px] text-muted-foreground mt-1">{row.matches_played||0} matches · {row.wins||0}W {row.draws||0}D {row.losses||0}L</p><p className="text-[11px] text-muted-foreground">PF {row.points_for||0} · PA {row.points_against||0} · {signed(row.score_difference)}</p></div>)}</div>:<p className="text-xs text-muted-foreground mt-4">No competition breakdown yet.</p>}
    </GlassCard>

    <div className="grid lg:grid-cols-2 gap-4">
      <GlassCard>
        <div className="flex items-center gap-2"><Swords className="w-4 h-4 text-primary"/><h3 className="font-bold">Head-to-head</h3></div>
        <p className="text-xs text-muted-foreground mt-1">Your most frequent opponents across eligible RallyHub matches.</p>
        <div className="mt-3 space-y-2">{(p.head_to_head||[]).slice(0,6).map(row=><div key={row.opponent_id} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-sm font-bold truncate">{row.opponent_name}</p><p className="text-[11px] text-muted-foreground">{row.meetings} meetings · PF {row.points_for} / PA {row.points_against}</p></div><div className="text-right shrink-0"><p className="font-black">{row.wins}–{row.losses}{row.draws?`–${row.draws}`:''}</p><p className="text-[10px] text-muted-foreground">{Math.round(Number(row.win_rate||0)*100)}% wins</p></div></div>)}{!p.head_to_head?.length&&<p className="text-xs text-muted-foreground py-4">Head-to-head history will appear as you face other recorded club members.</p>}</div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary"/><h3 className="font-bold">Partnerships</h3></div>
        <p className="text-xs text-muted-foreground mt-1">How your most frequent pairings have performed together.</p>
        <div className="mt-3 space-y-2">{(p.partners||[]).slice(0,6).map(row=><div key={row.partner_id} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-sm font-bold truncate">{row.partner_name}</p><p className="text-[11px] text-muted-foreground">{row.meetings} together · PF {row.points_for} / PA {row.points_against}</p></div><div className="text-right shrink-0"><p className="font-black">{row.wins}–{row.losses}{row.draws?`–${row.draws}`:''}</p><p className="text-[10px] text-muted-foreground">{Math.round(Number(row.win_rate||0)*100)}% wins</p></div></div>)}{!p.partners?.length&&<p className="text-xs text-muted-foreground py-4">Partnership history will appear as your doubles results build.</p>}</div>
      </GlassCard>
    </div>

    <GlassCard>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><h3 className="font-bold">Recent matches</h3><p className="text-xs text-muted-foreground mt-1">The detail behind your totals.</p></div><Link to="/app/forecast"><Badge className="bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer"><Sparkles className="w-3 h-3 mr-1"/>Forecast a match <ArrowRight className="w-3 h-3 ml-1"/></Badge></Link></div>
      <div className="mt-3 space-y-2">{(p.recent_matches||[]).map(row=><div key={row.id} className="rounded-xl border border-border p-3 flex items-center gap-3"><div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-black shrink-0 ${row.result==='win'?'bg-emerald-500/15 text-emerald-500':row.result==='draw'?'bg-amber-500/15 text-amber-500':'bg-rose-500/15 text-rose-500'}`}>{row.result==='win'?'W':row.result==='draw'?'D':'L'}</div><div className="min-w-0 flex-1"><p className="text-sm font-bold truncate">{row.event_name}</p><p className="text-[11px] text-muted-foreground">{row.format}{row.round!=null?` · Round ${row.round}`:''}{row.court!=null?` · Court ${row.court}`:''}</p></div><div className="text-right shrink-0"><p className="font-mono font-black">{row.score_for}–{row.score_against}</p><p className="text-[10px] text-muted-foreground">{row.date?new Date(row.date).toLocaleDateString('en-IE',{day:'numeric',month:'short'}):''}</p></div></div>)}{!p.recent_matches?.length&&<p className="text-xs text-muted-foreground py-5 text-center">No eligible matches yet.</p>}</div>
    </GlassCard>
  </div>;
}
