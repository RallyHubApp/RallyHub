import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Users, Gauge, ArrowRight, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function PlayerSelect({ label, value, onChange, players, disabledIds = [] }) {
  return <div>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">{label}</p>
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="min-h-11"><SelectValue placeholder="Choose player" /></SelectTrigger>
      <SelectContent>{players.map(p => <SelectItem key={p.id} value={String(p.id)} disabled={disabledIds.includes(String(p.id))}>{p.full_name}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}

function PercentBar({ value, label }) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(value || 0) * 100)));
  return <div className="rounded-2xl border border-border p-4 sm:p-5 bg-secondary/20">
    <div className="flex items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="text-3xl sm:text-4xl font-black mt-1">{pct}%</p></div><Gauge className="w-6 h-6 text-primary"/></div>
    <div className="mt-4 h-3 rounded-full bg-secondary overflow-hidden"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{width:`${pct}%`}} /></div>
  </div>;
}

export default function MemberForecast() {
  const [a1,setA1]=useState(''),[a2,setA2]=useState(''),[b1,setB1]=useState(''),[b2,setB2]=useState('');
  const [result,setResult]=useState(null),[running,setRunning]=useState(false),[error,setError]=useState('');
  const { data, isLoading } = useQuery({
    queryKey:['performance-analytics-self'],
    queryFn: async()=>{const res=await base44.functions.invoke('performanceAnalytics',{action:'self'});if(res.data?.error)throw new Error(res.data.error);return res.data;},
    staleTime:60_000,
  });
  const players=data?.players||[];
  React.useEffect(()=>{if(!a1&&data?.profile?.player_id)setA1(String(data.profile.player_id));},[data,a1]);
  const chosen=useMemo(()=>[a1,a2,b1,b2].filter(Boolean),[a1,a2,b1,b2]);
  const ready=chosen.length===4&&new Set(chosen).size===4;
  const run=async()=>{if(!ready)return;setRunning(true);setError('');try{const res=await base44.functions.invoke('performanceAnalytics',{action:'forecast',teamAPlayerIds:[a1,a2],teamBPlayerIds:[b1,b2]});if(res.data?.error)throw new Error(res.data.error);setResult(res.data.forecast);}catch(e){setError(e?.message||'Could not calculate forecast.');}finally{setRunning(false);}};
  return <div className="space-y-5 max-w-5xl mx-auto">
    <PageHeader title="RallyHub Forecast" description="A fun match prediction that gets smarter as your club records more results" />

    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 flex items-start gap-3">
      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5"/><div><p className="font-bold">Forecast · Beta</p><p className="text-sm text-muted-foreground mt-1">This is a fun prediction based on the match data RallyHub has so far. Forecasts will become more accurate as more matches and player history are recorded.</p></div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <GlassCard>
        <div className="flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-primary"/><h2 className="font-black">Team 1</h2></div>
        <div className="space-y-3"><PlayerSelect label="Player" value={a1} onChange={v=>{setA1(v);setResult(null);}} players={players} disabledIds={[a2,b1,b2]}/><PlayerSelect label="Partner" value={a2} onChange={v=>{setA2(v);setResult(null);}} players={players} disabledIds={[a1,b1,b2]}/></div>
      </GlassCard>
      <GlassCard>
        <div className="flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-primary"/><h2 className="font-black">Team 2</h2></div>
        <div className="space-y-3"><PlayerSelect label="Player" value={b1} onChange={v=>{setB1(v);setResult(null);}} players={players} disabledIds={[a1,a2,b2]}/><PlayerSelect label="Partner" value={b2} onChange={v=>{setB2(v);setResult(null);}} players={players} disabledIds={[a1,a2,b1]}/></div>
      </GlassCard>
    </div>

    <div className="flex justify-center"><Button size="lg" onClick={run} disabled={!ready||running||isLoading} className="min-w-52">{running?'Calculating…':'Forecast this match'}<ArrowRight className="w-4 h-4 ml-2"/></Button></div>
    {error&&<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

    {result&&<section className="space-y-4" data-testid="rallyhub-forecast-result">
      <div className="grid md:grid-cols-2 gap-4"><PercentBar value={result.teamA?.win_probability} label={(result.teamA?.names||[]).join(' & ')}/><PercentBar value={result.teamB?.win_probability} label={(result.teamB?.names||[]).join(' & ')}/></div>
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Model confidence</p><p className="text-xl font-black mt-1">{result.confidence?.label || 'Low'}</p></div><Badge variant="outline">{result.confidence?.index || 0}% data confidence</Badge></div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4"><div className="rounded-xl bg-secondary/30 p-3"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Player history</p><p className="text-lg font-black mt-1">{result.confidence?.player_evidence || 0}%</p></div><div className="rounded-xl bg-secondary/30 p-3"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Matchup history</p><p className="text-lg font-black mt-1">{result.confidence?.context_evidence || 0}%</p></div></div>
      </GlassCard>
      <GlassCard>
        <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary"/><h3 className="font-bold">Why this forecast?</h3></div>
        <div className="mt-3 space-y-2">{(result.reasons||[]).map((reason,i)=><div key={i} className="rounded-xl border border-border p-3 text-sm"><span className="font-bold">{reason.side==='A'?'Team 1':reason.side==='B'?'Team 2':'Even'}:</span> <span className="text-muted-foreground">{reason.text}</span></div>)}</div>
        <p className="text-xs text-muted-foreground mt-4">{result.disclaimer}</p>
      </GlassCard>
    </section>}
  </div>;
}
