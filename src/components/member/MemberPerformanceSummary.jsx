import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Crown, Gauge, Minus, Sparkles, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function signed(value) {
  const n = Number(value || 0);
  return `${n > 0 ? '+' : ''}${Math.round(n)}`;
}

function Trend({ value, suffix = '' }) {
  const n = Number(value || 0);
  const Icon = n > 0 ? TrendingUp : n < 0 ? TrendingDown : Minus;
  return <span className={`inline-flex items-center gap-1 text-xs font-bold ${n > 0 ? 'text-emerald-500' : n < 0 ? 'text-rose-500' : 'text-muted-foreground'}`}><Icon className="w-3.5 h-3.5" />{n > 0 ? '+' : ''}{n}{suffix}</span>;
}

function FormDots({ results = [] }) {
  if (!results.length) return <span className="text-xs text-muted-foreground">No recent matches yet</span>;
  return <div className="flex items-center gap-1.5" aria-label="Recent form">{results.map((r, i) => <span key={`${r}-${i}`} className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-black ${r === 'win' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : r === 'draw' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'}`}>{r === 'win' ? 'W' : r === 'draw' ? 'D' : 'L'}</span>)}</div>;
}

function Metric({ label, value, detail, icon: Icon }) {
  return <div className="rounded-xl border border-border bg-secondary/25 p-3 min-w-0">
    <div className="flex items-center justify-between gap-2"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>{Icon && <Icon className="w-4 h-4 text-primary/80" />}</div>
    <p className="mt-1 text-xl sm:text-2xl font-black tracking-tight truncate">{value}</p>
    {detail && <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{detail}</p>}
  </div>;
}

export default function MemberPerformanceSummary({ performance, loading = false }) {
  if (loading) return <section className="glass rounded-2xl p-4 sm:p-5"><div className="h-44 animate-pulse rounded-xl bg-secondary/50" /></section>;
  const p = performance?.profile;
  if (!p) return <section className="glass rounded-2xl p-4 sm:p-5">
    <div className="flex items-start gap-3"><Trophy className="w-5 h-5 text-primary mt-0.5"/><div><h2 className="font-bold">My performance</h2><p className="text-sm text-muted-foreground mt-1">Your RallyHub results will appear here as eligible matches are recorded against your member profile.</p></div></div>
  </section>;

  const s = p.season || {};
  const ratingData = (p.rating_history || []).map((row, index) => ({...row, index, label: row.date ? new Date(row.date).toLocaleDateString('en-IE',{day:'numeric',month:'short'}) : ''}));
  const rankMove = Number(p.week?.rank_change || 0);
  const weeklyWinDelta = Math.round((Number(p.week?.win_rate || 0) - Number(p.week?.previous_win_rate || 0)) * 100);
  const h2h = p.head_to_head?.[0];
  const partner = p.partners?.[0];

  return <section className="glass rounded-2xl overflow-hidden" data-testid="member-performance-summary">
    <div className="p-4 sm:p-5 border-b border-border bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary"/><p className="text-xs font-black uppercase tracking-[.16em] text-primary">My performance</p></div>
          <h2 className="text-xl sm:text-2xl font-black mt-2">Your season at a glance</h2>
          <p className="text-xs text-muted-foreground mt-1">All eligible KOTC, Interclub and tournament matches feed the same RallyHub record.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Season {performance?.season?.label || 'current'}</Badge>
          <Link to="/app/my-profile?tab=results"><Button size="sm" variant="outline">Details <ArrowRight className="w-3.5 h-3.5 ml-1"/></Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
        <Metric label="Club rank" value={s.rank ? `#${s.rank}` : '—'} detail={rankMove ? `${rankMove > 0 ? 'Up' : 'Down'} ${Math.abs(rankMove)} this week` : 'No rank movement'} icon={Crown}/>
        <Metric label="Leaderboard" value={`${s.leaderboard_points || 0} pts`} detail={`${s.wins || 0}W · ${s.draws || 0}D · ${s.losses || 0}L`} icon={Trophy}/>
        <Metric label="Points diff" value={signed(s.score_difference)} detail={`${s.points_for || 0} for · ${s.points_against || 0} against`} icon={TrendingUp}/>
        <Metric label="Win rate" value={`${Math.round(Number(s.win_rate || 0) * 100)}%`} detail={`${s.matches_played || 0} matches`} icon={Gauge}/>
      </div>
    </div>

    <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-0">
      <div className="p-4 sm:p-5 lg:border-r border-border">
        <div className="flex items-start justify-between gap-3 mb-3"><div><p className="text-sm font-bold">Performance trend</p><p className="text-[11px] text-muted-foreground">Internal RallyHub performance model · used for forecasts, not leaderboard points</p></div><Badge className="bg-primary/10 text-primary">{p.rallyhub_rating || 1500}</Badge></div>
        <div className="h-36 sm:h-44">
          {ratingData.length > 1 ? <ResponsiveContainer width="100%" height="100%"><LineChart data={ratingData} margin={{top:8,right:6,left:6,bottom:0}}><XAxis dataKey="label" hide/><Tooltip formatter={(value)=>[Math.round(Number(value)),'Performance']} labelFormatter={(label)=>label}/><Line type="monotone" dataKey="rating" stroke="currentColor" className="text-primary" strokeWidth={3} dot={false} activeDot={{r:4}}/></LineChart></ResponsiveContainer> : <div className="h-full rounded-xl bg-secondary/25 grid place-items-center text-center p-4"><div><Sparkles className="w-6 h-6 text-primary/60 mx-auto"/><p className="text-xs text-muted-foreground mt-2">Your trend line will build as more RallyHub matches are recorded.</p></div></div>}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/30 p-3">
          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Recent form</p><div className="mt-1.5"><FormDots results={p.recent_form || []}/></div></div>
          <div className="text-right"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Week on week</p><div className="mt-1.5 flex items-center gap-3"><Trend value={rankMove} suffix=" places"/><Trend value={weeklyWinDelta} suffix="% win rate"/></div></div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        <div className="rounded-xl border border-border p-3"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Most-played opponent</p>{h2h ? <><p className="font-bold mt-1">{h2h.opponent_name}</p><p className="text-xs text-muted-foreground mt-1">{h2h.wins}–{h2h.losses}{h2h.draws ? `–${h2h.draws}` : ''} · {h2h.meetings} meetings</p></> : <p className="text-xs text-muted-foreground mt-2">Head-to-head history will build automatically.</p>}</div>
        <div className="rounded-xl border border-border p-3"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Most-played partner</p>{partner ? <><p className="font-bold mt-1">{partner.partner_name}</p><p className="text-xs text-muted-foreground mt-1">{partner.wins}–{partner.losses}{partner.draws ? `–${partner.draws}` : ''} · {partner.meetings} together</p></> : <p className="text-xs text-muted-foreground mt-2">Partnership history will build automatically.</p>}</div>
        <Link to="/app/forecast" className="block rounded-xl border border-primary/30 bg-primary/5 p-3 hover:bg-primary/10 transition-colors">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-primary/15 grid place-items-center"><Sparkles className="w-4 h-4 text-primary"/></div><div className="flex-1"><p className="text-sm font-bold">RallyHub Forecast · Beta</p><p className="text-[11px] text-muted-foreground mt-0.5">Pick four players and see the current win prediction.</p></div><ArrowRight className="w-4 h-4 text-primary"/></div>
        </Link>
      </div>
    </div>
  </section>;
}
