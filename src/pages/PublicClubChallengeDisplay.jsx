import React from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, WifiOff } from 'lucide-react';

function score(matches, event) {
  let a=0,b=0;
  for (const m of matches.filter(x=>!x.is_showcase && ['completed','draw'].includes(x.status))) {
    if (m.winner === 'club_a') { a += Number(event.win_points ?? 2); b += Number(event.loss_points ?? 0); }
    else if (m.winner === 'club_b') { b += Number(event.win_points ?? 2); a += Number(event.loss_points ?? 0); }
    else { a += Number(event.draw_points ?? 1); b += Number(event.draw_points ?? 1); }
  }
  return {a,b};
}
function fmt(seconds){ const s=Math.max(0,Number(seconds||0)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`; }

export default function PublicClubChallengeDisplay(){
  const { token } = useParams();
  const [data,setData]=React.useState(null), [error,setError]=React.useState(''), [disconnected,setDisconnected]=React.useState(false), [now,setNow]=React.useState(Date.now());
  const load=React.useCallback(async()=>{ try { const r=await base44.functions.invoke('getPublicClubChallengeDisplay',{token}); if(r.data?.error) throw new Error(r.data.error); setData(r.data); setError(''); setDisconnected(false); } catch(e){ if(data) setDisconnected(true); else setError(e?.response?.data?.error||e?.message||'Display unavailable'); } },[token,data]);
  React.useEffect(()=>{ load(); const poll=setInterval(load,5000); const tick=setInterval(()=>setNow(Date.now()),1000); const off=()=>setDisconnected(true), on=()=>{setDisconnected(false);load();}; window.addEventListener('offline',off); window.addEventListener('online',on); return()=>{clearInterval(poll);clearInterval(tick);window.removeEventListener('offline',off);window.removeEventListener('online',on);}; },[token]);
  if(error&&!data) return <div className="min-h-screen bg-background text-foreground grid place-items-center p-6 text-center"><div><WifiOff className="mx-auto mb-3"/><p className="font-semibold">{error}</p></div></div>;
  if(!data) return <div className="min-h-screen bg-background text-foreground grid place-items-center"><RefreshCw className="animate-spin"/></div>;
  const {event,matches}=data, s=score(matches,event), round=Number(event.current_round||1);
  const current=matches.filter(m=>!m.is_showcase&&m.round_number===round), next=matches.filter(m=>!m.is_showcase&&m.round_number===round+1);
  let timer={}; try{timer=event.timer_state_json?JSON.parse(event.timer_state_json):{};}catch{}
  const remaining=timer.running&&timer.started_at?Math.max(0,Number(timer.remaining_seconds||0)-Math.floor((now-new Date(timer.started_at).getTime())/1000)):Number(timer.remaining_seconds||0);
  return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 space-y-6">
    {disconnected&&<div className="sticky top-2 z-20 rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known state. RallyHub will resynchronise automatically.</div>}
    <header className="text-center"><p className="text-xs uppercase tracking-[.25em] text-primary font-bold">Club Challenge · Hall Display</p><h1 className="text-3xl sm:text-6xl font-bold mt-3">{event.club_a_name} <span className="text-primary">{s.a} – {s.b}</span> {event.club_b_name}</h1><div className="flex justify-center gap-2 mt-4"><Badge variant="outline">Round {round}</Badge><Badge variant="outline">{String(timer.phase||'idle').toUpperCase()}</Badge><Badge className="text-lg tabular-nums">{fmt(remaining)}</Badge></div></header>
    <section><h2 className="text-lg font-bold mb-3">On Court Now</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{current.map(m=><div key={m.id} className="rounded-xl border border-border bg-card p-4"><p className="font-bold">Court {m.court_number}</p><p className="mt-2">{m.club_a_names.join(' & ')}</p><p className="text-xs text-muted-foreground my-1">vs</p><p>{m.club_b_names.join(' & ')}</p>{['completed','draw'].includes(m.status)&&<p className="text-xl font-bold text-primary mt-3">{m.score_a} – {m.score_b}</p>}</div>)}</div></section>
    {next.length>0&&<section><h2 className="text-lg font-bold mb-3">Up Next · Round {round+1}</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{next.map(m=><div key={m.id} className="rounded-xl bg-secondary/50 p-3 text-sm"><b>Court {m.court_number}</b><p>{m.club_a_names.join(' & ')} vs {m.club_b_names.join(' & ')}</p></div>)}</div></section>}
    {event.junior_display_mode&&<p className="text-center text-xs text-muted-foreground">Junior privacy mode · surnames abbreviated.</p>}
  </div>;
}