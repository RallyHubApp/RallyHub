import React,{useCallback,useEffect,useRef,useState} from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Crown,Trophy,RefreshCw,WifiOff } from 'lucide-react';

function message(e){return e?.response?.data?.error||e?.data?.error||e?.message||'Live KOTC view unavailable';}
function fmt(v){const n=Math.max(0,Number(v||0));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;}

export default function PublicKotcResults(){
  const {token}=useParams();
  const [data,setData]=useState(null),[error,setError]=useState(''),[offline,setOffline]=useState(false),[now,setNow]=useState(Date.now());
  const dataRef=useRef(null);
  useEffect(()=>{dataRef.current=data;},[data]);
  const load=useCallback(async()=>{try{const r=await base44.functions.invoke('kotcResultsShare',{action:'public_state',token});if(r.data?.error)throw new Error(r.data.error);setData(r.data);dataRef.current=r.data;setError('');setOffline(false);}catch(e){if(dataRef.current)setOffline(true);else setError(message(e));}},[token]);
  useEffect(()=>{load();const poll=setInterval(load,3000),tick=setInterval(()=>setNow(Date.now()),1000);const off=()=>setOffline(true),on=()=>{setOffline(false);load();},visible=()=>{if(document.visibilityState==='visible'){setNow(Date.now());load();}};window.addEventListener('offline',off);window.addEventListener('online',on);window.addEventListener('focus',load);document.addEventListener('visibilitychange',visible);return()=>{clearInterval(poll);clearInterval(tick);window.removeEventListener('offline',off);window.removeEventListener('online',on);window.removeEventListener('focus',load);document.removeEventListener('visibilitychange',visible);};},[load]);
  if(error&&!data)return <div className="min-h-screen bg-background grid place-items-center p-4"><div className="glass rounded-xl p-5 max-w-md w-full"><h1 className="font-bold">Live KOTC unavailable</h1><p className="text-sm text-muted-foreground mt-2">{error}</p></div></div>;
  if(!data)return <div className="min-h-screen bg-background grid place-items-center"><RefreshCw className="animate-spin"/></div>;

  const timer=data.timer||{};
  const remaining=timer.running&&timer.deadlineAt?Math.max(0,Math.ceil((Date.parse(timer.deadlineAt)-now)/1000)):Number(timer.remainingSeconds||0);
  const roundStatus=String(data.current_round?.status||data.session.status||'').replaceAll('_',' ').toUpperCase();
  const current=data.current_matches||[];
  const finished=['completed','finalised'].includes(data.session.status);

  return <div className="min-h-screen bg-background p-3 sm:p-5"><main className="max-w-5xl mx-auto space-y-4">
    {offline&&<div className="sticky top-2 z-30 rounded-lg bg-yellow-500 text-black p-3 text-center font-semibold"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known state. RallyHub will resynchronise automatically.</div>}
    <header className="glass rounded-xl p-5 text-center">
      <p className="text-[10px] uppercase tracking-[.22em] text-primary font-bold">King of the Court · Live</p>
      <Crown className="w-8 h-8 text-yellow-400 mx-auto mt-2 mb-1"/>
      <h1 className="text-xl sm:text-2xl font-bold">{data.session.name}</h1>
      <div className="flex flex-wrap gap-2 justify-center mt-3"><Badge variant="outline">Round {data.session.current_round_number||'-'}</Badge><Badge variant="outline">{roundStatus||'WAITING'}</Badge>{data.session.scoring_mode==='timed'&&!finished&&<Badge className="text-base tabular-nums">{fmt(remaining)}</Badge>}<Badge variant="outline">{data.completed_rounds} round{data.completed_rounds===1?'':'s'} completed</Badge></div>
      <p className="text-xs text-muted-foreground mt-3">This page updates automatically as the host starts rounds and scores are saved.</p>
    </header>

    {finished&&(data.podium||[]).length>0&&<section className="space-y-3" data-testid="public-kotc-podium"><div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400"/><h2 className="font-bold">Podium</h2></div><div className="grid grid-cols-3 gap-2">{data.podium.map((p,i)=><div key={p.id} className={`glass rounded-xl p-3 text-center border ${i===0?'border-yellow-400/50':i===1?'border-slate-300/40':'border-amber-700/40'}`}><div className="text-2xl">{i===0?'🥇':i===1?'🥈':'🥉'}</div><p className="font-bold text-sm mt-1">{p.name}</p><p className="text-xs text-muted-foreground">{p.wins}W · {p.losses}L · {p.differential>0?'+':''}{p.differential}</p></div>)}</div></section>}

    {current.length>0&&<section className="space-y-3" data-testid="public-kotc-current-round"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">{finished?'Final Round':data.current_round?.status==='proposed'?'Round Ready':'On Court Now'} · Round {data.current_round?.round_number}</h2><Badge variant="outline">{roundStatus}</Badge></div>{(data.bench||[]).length>0&&<div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3"><p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Bench This Round</p><p className="text-sm font-semibold mt-1">{data.bench.join(' · ')}</p></div>}<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{current.map(m=>{const hasScore=m.team_a_score!=null&&m.team_b_score!=null;return <div key={`${m.round_number}-${m.court}`} className="rounded-xl border bg-card p-4" data-testid={`public-kotc-court-${m.court}`}><div className="flex items-center justify-between"><p className="font-bold">Court {m.court}</p><Badge variant="outline" className="text-[10px]">{m.status==='completed'?'SAVED':data.current_round?.status==='started'?'LIVE':'READY'}</Badge></div><div className="mt-3 flex justify-between gap-3"><span className="text-sm">{m.team_a.join(' & ')}</span>{hasScore&&<strong>{m.team_a_score}</strong>}</div><div className="text-[10px] uppercase text-muted-foreground my-1">vs</div><div className="flex justify-between gap-3"><span className="text-sm">{m.team_b.join(' & ')}</span>{hasScore&&<strong>{m.team_b_score}</strong>}</div>{!hasScore&&<p className="text-[10px] text-muted-foreground mt-3">{data.current_round?.status==='started'?'Awaiting result':'Players assigned'}</p>}</div>;})}</div></section>}

    <section className="glass rounded-xl overflow-hidden"><div className="p-3 border-b flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400"/><h2 className="font-semibold">{finished?'Final Standings':'Live Standings'}</h2></div><div className="grid grid-cols-[36px_1fr_42px_42px_58px] text-[10px] uppercase text-muted-foreground p-2 border-b"><span>#</span><span>Player</span><span>W</span><span>L</span><span>Diff</span></div>{(data.standings||[]).map(s=><div key={s.id} className="border-b last:border-b-0"><div className="grid grid-cols-[36px_1fr_42px_42px_58px] p-2 text-sm"><span>{s.rank}</span><span className="font-medium">{s.name}</span><span>{s.wins}</span><span>{s.losses}</span><span>{s.differential>0?'+':''}{s.differential}</span></div>{s.cumulative&&<div className="px-2 pb-2 pl-[44px] text-[10px] text-muted-foreground">Club KOTC overall: {s.cumulative.wins}W–{s.cumulative.losses}L · {s.cumulative.sessions_played} session{s.cumulative.sessions_played===1?'':'s'} · Court 1 rounds {s.cumulative.court1_rounds}</div>}</div>)}</section>

    {(data.matches||[]).length>0&&<section className="glass rounded-xl p-3 space-y-3"><h2 className="font-semibold">Completed Round History</h2>{data.matches.map((m,i)=><div key={`${m.round_number}-${m.court}-${i}`} className="rounded-lg border p-3 text-sm"><p className="text-xs text-muted-foreground mb-1">Round {m.round_number} · Court {m.court}</p><div className="flex items-center justify-between gap-3"><span>{m.team_a.join(' & ')}</span><strong>{m.team_a_score}</strong></div><div className="flex items-center justify-between gap-3"><span>{m.team_b.join(' & ')}</span><strong>{m.team_b_score}</strong></div></div>)}</section>}
  </main></div>;
}