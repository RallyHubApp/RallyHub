import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown,Play,Settings2,ListOrdered,Users,CheckCircle2 } from 'lucide-react';

const seedingLabel={roster:'Roster order',manual:'Manual ranking',dupr:'Genuine DUPR',previous_kotc:'Previous KOTC'};
const drawLabel={balanced:'Balanced Random',pure_random:'Pure Random',strict:'Strict Ranking'};

export default function KotcSetupPanel({
  players,courts,requiredBench,
  venueCourts,setVenueCourts,duration,setDuration,
  scoringMode,setScoringMode,playMinutes,setPlayMinutes,scoreTarget,setScoreTarget,winByTwo,setWinByTwo,
  seedingSource,applySeedingSource,drawMethod,setDrawMethod,kotcAggregates,
  rankingOpen,setRankingOpen,orderedPlayers,setPlayerOrder,setSeedingSource,
  benchIds,toggleBench,creating,createSession,
}){
  const benchReady=benchIds.length===requiredBench;
  const selectedRemaining=Math.max(0,requiredBench-benchIds.length);
  const scoringSummary=scoringMode==='timed'?`${playMinutes} min timed rounds`:`First to ${scoreTarget}${winByTwo?' · win by 2':' · win by 1'}`;
  return <div className="space-y-5" data-testid="kotc-setup">
    <header className="glass rounded-2xl p-5 sm:p-6 border border-primary/15">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3"><div className="rounded-xl bg-primary/10 p-2.5"><Crown className="w-6 h-6 text-yellow-400"/></div><div><p className="text-[10px] uppercase tracking-[.22em] text-primary font-bold">King of the Court</p><h2 className="text-xl sm:text-2xl font-bold mt-1">Set up tonight’s session</h2><p className="text-sm text-muted-foreground mt-1">Confirm the hall settings, decide the Round 1 draw and choose the bench. You can review the actual courts before anything starts.</p></div></div>
        <div className="flex flex-wrap gap-2 sm:justify-end"><Badge variant="outline" className="text-sm">{players.length} players</Badge><Badge variant="outline" className="text-sm">{courts} court{courts===1?'':'s'}</Badge><Badge variant="outline" className="text-sm">{requiredBench} bench</Badge></div>
      </div>
    </header>

    <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
      <div className="space-y-4 min-w-0">
        <section className="glass rounded-2xl p-4 sm:p-5" data-testid="kotc-setup-session-settings">
          <div className="flex items-start gap-3 mb-4"><div className="rounded-lg bg-secondary p-2"><Settings2 className="w-4 h-4"/></div><div><p className="font-semibold">1 · Session settings</p><p className="text-xs text-muted-foreground mt-0.5">The essentials for this hall and tonight’s scoring.</p></div></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Venue courts</Label><Input className="mt-1 min-h-11" type="number" min="1" max="20" value={venueCourts} onChange={e=>setVenueCourts(e.target.value)}/></div>
            <div><Label>Hall / session duration</Label><div className="relative mt-1"><Input className="min-h-11 pr-14" type="number" min="15" value={duration} onChange={e=>setDuration(e.target.value)}/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span></div></div>
            <div><Label>Scoring</Label><Select value={scoringMode} onValueChange={setScoringMode}><SelectTrigger className="mt-1 min-h-11"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="timed">Timed rounds</SelectItem><SelectItem value="first_to">First to score</SelectItem></SelectContent></Select></div>
            {scoringMode==='timed'?<div><Label>Round duration</Label><div className="relative mt-1"><Input className="min-h-11 pr-14" type="number" min="1" value={playMinutes} onChange={e=>setPlayMinutes(e.target.value)}/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span></div></div>:<><div><Label>Score target</Label><Input className="mt-1 min-h-11" type="number" min="1" value={scoreTarget} onChange={e=>setScoreTarget(e.target.value)}/></div><div><Label>Winning margin</Label><Select value={winByTwo?'2':'1'} onValueChange={v=>setWinByTwo(v==='2')}><SelectTrigger className="mt-1 min-h-11"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="1">Win by 1</SelectItem><SelectItem value="2">Win by 2</SelectItem></SelectContent></Select></div></>}
          </div>
        </section>

        <section className="glass rounded-2xl p-4 sm:p-5" data-testid="kotc-setup-round1">
          <div className="flex items-start gap-3 mb-4"><div className="rounded-lg bg-secondary p-2"><ListOrdered className="w-4 h-4"/></div><div><p className="font-semibold">2 · Round 1 setup</p><p className="text-xs text-muted-foreground mt-0.5">Choose how the starting order is built and how that order is distributed across courts.</p></div></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Starting order</Label><Select value={seedingSource} onValueChange={applySeedingSource}><SelectTrigger className="mt-1 min-h-11" data-testid="kotc-seeding-source"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="roster">Roster order</SelectItem><SelectItem value="manual">Manual ranking</SelectItem><SelectItem value="dupr">Genuine DUPR</SelectItem><SelectItem value="previous_kotc">Previous KOTC performance</SelectItem></SelectContent></Select><p className="text-[11px] text-muted-foreground mt-1.5">This sets the starting order only. RallyHub does not invent ratings.</p></div>
            <div><Label>Round 1 draw</Label><Select value={drawMethod} onValueChange={setDrawMethod}><SelectTrigger className="mt-1 min-h-11" data-testid="kotc-draw-method"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="balanced">Balanced Random</SelectItem><SelectItem value="pure_random">Pure Random</SelectItem><SelectItem value="strict">Strict Ranking</SelectItem></SelectContent></Select><p className="text-[11px] text-muted-foreground mt-1.5">Balanced Random spreads the starting order across courts while keeping some variety.</p></div>
          </div>
          {seedingSource==='dupr'&&players.some(p=>p.dupr_rating==null)&&<div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2.5 text-xs text-amber-600 mt-3">{players.filter(p=>p.dupr_rating==null).length} player{players.filter(p=>p.dupr_rating==null).length===1?' has':'s have'} no genuine DUPR rating. They stay below rated players rather than receiving a made-up value.</div>}
          {seedingSource==='previous_kotc'&&kotcAggregates.length===0&&<div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2.5 text-xs text-amber-600 mt-3">No previous KOTC history is stored for this roster yet. Choose Roster order, Manual ranking or Genuine DUPR.</div>}
          <Button type="button" variant="outline" className="w-full justify-between min-h-11 mt-4" onClick={()=>setRankingOpen(v=>!v)}><span>Review player order <span className="text-muted-foreground">({players.length})</span></span><span className="text-xs text-muted-foreground">{rankingOpen?'Hide':'Show'}</span></Button>
          {rankingOpen&&<div className="mt-3 rounded-xl border bg-secondary/15 overflow-hidden"><div className="px-3 py-2 border-b bg-secondary/30 flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-semibold">Current starting order</p><p className="text-[10px] text-muted-foreground">Moving anyone manually changes the source to Manual ranking.</p></div><Badge variant="outline">{seedingLabel[seedingSource]||seedingSource}</Badge></div><div className="max-h-[420px] overflow-y-auto divide-y" data-testid="kotc-player-order">{orderedPlayers.map((p,i)=><div key={p.id} className="flex items-center gap-2 px-3 py-2.5" data-testid={`kotc-player-order-${i+1}`}><span className="w-7 text-xs font-bold text-muted-foreground">#{i+1}</span><span className="flex-1 text-sm font-medium min-w-0 truncate">{p.full_name}</span>{p.dupr_rating!=null&&<Badge variant="outline" className="hidden sm:inline-flex">DUPR {Number(p.dupr_rating).toFixed(2)}</Badge>}<div className="flex gap-1"><Button variant="ghost" size="sm" aria-label={`Move ${p.full_name} up`} disabled={i===0} onClick={()=>{setSeedingSource('manual');setPlayerOrder(o=>{const n=[...o];[n[i-1],n[i]]=[n[i],n[i-1]];return n;});}}>↑</Button><Button variant="ghost" size="sm" aria-label={`Move ${p.full_name} down`} disabled={i===orderedPlayers.length-1} onClick={()=>{setSeedingSource('manual');setPlayerOrder(o=>{const n=[...o];[n[i],n[i+1]]=[n[i+1],n[i]];return n;});}}>↓</Button></div></div>)}</div></div>}
        </section>

        {requiredBench>0&&<section className="glass rounded-2xl p-4 sm:p-5" data-testid="kotc-setup-bench">
          <div className="flex items-start justify-between gap-3 mb-4"><div className="flex items-start gap-3"><div className="rounded-lg bg-secondary p-2"><Users className="w-4 h-4"/></div><div><p className="font-semibold">3 · Choose Round 1 bench</p><p className="text-xs text-muted-foreground mt-0.5">Choose exactly {requiredBench}. You can still swap the proposed Round 1 courts before starting.</p></div></div><Badge variant={benchReady?'default':'outline'}>{benchIds.length}/{requiredBench}</Badge></div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">{players.map(p=>{const selected=benchIds.includes(p.id);return <button type="button" key={p.id} onClick={()=>toggleBench(p.id)} aria-pressed={selected} className={`min-h-11 text-left rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${selected?'border-primary bg-primary/10 ring-1 ring-primary/20':'border-border hover:bg-secondary/40'}`}><span className="flex items-center justify-between gap-2"><span className="truncate">{p.full_name}</span>{selected&&<span className="text-primary font-bold">✓</span>}</span></button>})}</div>
        </section>}
      </div>

      <aside className="lg:sticky lg:top-4" data-testid="kotc-setup-summary">
        <div className="glass rounded-2xl p-4 sm:p-5 border border-primary/20 space-y-4">
          <div><p className="text-[10px] uppercase tracking-[.2em] text-primary font-bold">Ready check</p><h3 className="text-lg font-bold mt-1">Create Round 1</h3><p className="text-xs text-muted-foreground mt-1">RallyHub will generate the proposed courts next. You will review them before the timer starts.</p></div>
          <div className="rounded-xl bg-secondary/30 divide-y text-sm">
            <div className="flex justify-between gap-3 p-2.5"><span className="text-muted-foreground">Players</span><strong>{players.length}</strong></div>
            <div className="flex justify-between gap-3 p-2.5"><span className="text-muted-foreground">Active courts</span><strong>{courts}</strong></div>
            <div className="flex justify-between gap-3 p-2.5"><span className="text-muted-foreground">Bench</span><strong>{requiredBench}</strong></div>
            <div className="flex justify-between gap-3 p-2.5"><span className="text-muted-foreground">Scoring</span><strong className="text-right">{scoringSummary}</strong></div>
            <div className="flex justify-between gap-3 p-2.5"><span className="text-muted-foreground">Starting order</span><strong className="text-right">{seedingLabel[seedingSource]||seedingSource}</strong></div>
            <div className="flex justify-between gap-3 p-2.5"><span className="text-muted-foreground">Draw</span><strong>{drawLabel[drawMethod]||drawMethod}</strong></div>
          </div>
          {benchReady?<div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5"/><div><p className="text-xs font-semibold text-green-700">Ready to create the draw</p><p className="text-[10px] text-muted-foreground mt-0.5">Nothing starts until you review Round 1 and press Start Round 1.</p></div></div>:<div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3"><p className="text-xs font-semibold text-amber-700">Choose {selectedRemaining} more bench player{selectedRemaining===1?'':'s'}</p></div>}
          <Button data-testid="kotc-create-session" className="w-full min-h-12 text-base" onClick={createSession} disabled={creating||players.length<4||!benchReady}><Play className="w-4 h-4 mr-2"/>{creating?'Creating Round 1…':'Create Round 1'}</Button>
        </div>
      </aside>
    </div>
  </div>;
}
