import React from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, WifiOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { INTERCLUB_MODULE_NAME } from '@/lib/interclubBranding';
import RALLYHUB_LOGO_BASE64 from '@/assets/rallyhub-logo-approved.b64?raw';

const RALLYHUB_LOGO_URL = `data:image/webp;base64,${RALLYHUB_LOGO_BASE64.trim()}`;
const RALLYHUB_MARK_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

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
function PoweredByRallyHub(){ return <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/70"><span>Powered by</span><img src={RALLYHUB_LOGO_URL} alt="RallyHub" className="h-4 w-auto object-contain opacity-80"/></div>; }
function LiveEventBrand(){ return <div className="flex flex-col items-center justify-center"><div className="flex items-center gap-2"><img src={RALLYHUB_MARK_URL} alt="RallyHub logo" className="h-8 w-8 object-contain sm:h-9 sm:w-9"/><div className="text-left"><div className="text-lg sm:text-xl font-black leading-none tracking-[-.04em] text-[#081342]">Rally<span className="text-[#078e48]">Hub</span></div><div className="mt-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[.24em] text-[#0c1e53]">Interclub</div></div></div><p className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-[.2em] text-muted-foreground">Live Event View</p></div>; }
function VotingPrompt({ votingUrl, countdown, compact=false }){ if(!votingUrl) return null; return <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center"><div><p className="text-sm sm:text-lg font-black uppercase tracking-[.16em] text-primary">Players of the Tournament voting open</p><p className="mt-1 text-2xl sm:text-4xl font-black tabular-nums">{countdown}</p><p className="mt-1 text-xs sm:text-sm text-muted-foreground">Scan the QR or tap Vote now.</p><a href={votingUrl} className="mt-2 inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm">Vote now</a><a href={votingUrl} className="block mt-1 text-[10px] sm:text-xs text-primary underline underline-offset-2 break-all">Open voting link</a></div><div className="rounded-xl bg-white p-2 shadow-sm"><QRCodeSVG value={votingUrl} size={compact?86:104}/></div></div>; }

export default function PublicClubChallengeDisplay(){
  const { token } = useParams();
  const [data,setData]=React.useState(null), [error,setError]=React.useState(''), [disconnected,setDisconnected]=React.useState(false), [now,setNow]=React.useState(Date.now());
  const dataRef=React.useRef(null);
  React.useEffect(()=>{ dataRef.current=data; },[data]);
  const load=React.useCallback(async()=>{ try { const r=await base44.functions.invoke('getPublicClubChallengeDisplay',{token}); if(r.data?.error) throw new Error(r.data.error); setData(r.data); dataRef.current=r.data; setError(''); setDisconnected(false); } catch(e){ if(dataRef.current) setDisconnected(true); else setError(e?.response?.data?.error||e?.message||'Display unavailable'); } },[token]);
  const pollMs=data?.matches?.some(m=>m.is_showcase)?2000:5000;
  React.useEffect(()=>{ load(); const poll=setInterval(load,pollMs); const tick=setInterval(()=>setNow(Date.now()),1000); const off=()=>setDisconnected(true), on=()=>{setDisconnected(false);load();}; const visible=()=>{if(document.visibilityState==='visible'){setNow(Date.now());load();}}; window.addEventListener('offline',off); window.addEventListener('online',on); document.addEventListener('visibilitychange',visible); window.addEventListener('focus',visible); return()=>{clearInterval(poll);clearInterval(tick);window.removeEventListener('offline',off);window.removeEventListener('online',on);document.removeEventListener('visibilitychange',visible);window.removeEventListener('focus',visible);}; },[load,pollMs]);
  if(error&&!data) return <div className="min-h-screen bg-background text-foreground grid place-items-center p-6 text-center"><div><WifiOff className="mx-auto mb-3"/><p className="font-semibold">{error}</p></div></div>;
  if(!data) return <div className="min-h-screen bg-background text-foreground grid place-items-center"><RefreshCw className="animate-spin"/></div>;
  const {event,matches,participants=[]}=data, s=score(matches,event), round=Number(event.current_round||1), plannedRounds=Number(event.planned_rounds||0);
  const showcase=matches.find(m=>m.is_showcase)||null, showcaseActive=!!showcase&&['scheduled','in_progress','completed'].includes(showcase.status);
  const current=matches.filter(m=>!m.is_showcase&&m.status!=='not_played'&&m.round_number===round).sort((a,b)=>Number(a.court_number||0)-Number(b.court_number||0)), next=matches.filter(m=>!m.is_showcase&&m.status!=='not_played'&&m.round_number===round+1&&(!plannedRounds||round+1<=plannedRounds)).sort((a,b)=>Number(a.court_number||0)-Number(b.court_number||0));
  const activeIds=new Set(current.flatMap(m=>[...(m.club_a_participant_ids||[]),...(m.club_b_participant_ids||[])]));
  const resting=participants.filter(p=>((!p.status||p.status==='active')||(p.status==='late'&&Number(p.available_from_round||1)<=round))&&!activeIds.has(p.id));
  let timer={}; try{timer=event.timer_state_json?JSON.parse(event.timer_state_json):{};}catch{}
  const remaining=timer.running&&timer.started_at?Math.max(0,Number(timer.remaining_seconds||0)-Math.floor((now-new Date(timer.started_at).getTime())/1000)):Number(timer.remaining_seconds||0);
  const scheduledBreakHere=!!event.include_break&&round===Number(event.break_after_round||0), breakActive=scheduledBreakHere&&String(timer.phase||'')==='break';
  const sideChangeRecent=!!showcase?.side_change_at&&(now-new Date(showcase.side_change_at).getTime())<20000;
  const potCloseMs=event.pot_vote_closes_at?Date.parse(event.pot_vote_closes_at):NaN;
  const potRemaining=Number.isFinite(potCloseMs)?Math.max(0,Math.ceil((potCloseMs-now)/1000)):null;
  const potOpen=!!event.pot_enabled&&event.pot_status==='open'&&(potRemaining===null||potRemaining>0);
  const potCountdown=potRemaining===null?'MANUAL CLOSE':`${Math.floor(potRemaining/60)}:${String(potRemaining%60).padStart(2,'0')}`;
  const votingUrl=event.pot_voting_token?`${window.location.origin}/club-challenge/vote/${event.pot_voting_token}`:'';
  const potWinners=Array.isArray(event.pot_winners)?event.pot_winners:[];
  const potWinnersA=potWinners.filter(p=>p.side==='club_a');
  const potWinnersB=potWinners.filter(p=>p.side==='club_b');
  const completed=['completed','archived'].includes(event.status);
  const finalTitle=s.a===s.b?'Interclub Draw':`${s.a>s.b?event.club_a_name:event.club_b_name} win the Interclub`;

  if(completed&&!showcaseActive) return <div className="min-h-screen bg-background text-foreground p-5 sm:p-10 flex flex-col justify-center">
    {disconnected&&<div className="mb-4 rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known result.</div>}
    <div className="mx-auto w-full max-w-6xl text-center">
      <p className="text-sm sm:text-lg uppercase tracking-[.28em] text-primary font-black">{INTERCLUB_MODULE_NAME} · Final Result</p>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-10">
        <div className="order-2 sm:order-1 flex flex-col items-center gap-3 rounded-3xl border bg-card p-4 sm:p-5" style={{borderTopWidth:'8px',borderTopColor:event.club_a_primary_colour||'#2563eb',borderBottomWidth:'4px',borderBottomColor:event.club_a_secondary_colour||event.club_a_primary_colour||'#2563eb'}}>{event.club_a_logo_url&&<img src={event.club_a_logo_url} alt={`${event.club_a_name} logo`} className="w-24 h-24 sm:w-36 sm:h-36 object-contain rounded-2xl bg-white p-2"/>}<h2 className="text-2xl sm:text-5xl font-black">{event.club_a_name}</h2></div>
        <div className="order-1 col-span-2 sm:order-2 sm:col-span-1"><p className="text-xs sm:text-base uppercase tracking-widest text-muted-foreground">FINAL</p><p className="mt-2 text-6xl sm:text-9xl font-black tabular-nums text-primary">{s.a}–{s.b}</p></div>
        <div className="order-3 sm:order-3 flex flex-col items-center gap-3 rounded-3xl border bg-card p-4 sm:p-5" style={{borderTopWidth:'8px',borderTopColor:event.club_b_primary_colour||'#7f1d1d',borderBottomWidth:'4px',borderBottomColor:event.club_b_secondary_colour||event.club_b_primary_colour||'#7f1d1d'}}>{event.club_b_logo_url&&<img src={event.club_b_logo_url} alt={`${event.club_b_name} logo`} className="w-24 h-24 sm:w-36 sm:h-36 object-contain rounded-2xl bg-white p-2"/>}<h2 className="text-2xl sm:text-5xl font-black">{event.club_b_name}</h2></div>
      </div>
      <p className="mt-7 text-2xl sm:text-4xl font-black">{finalTitle}</p>
      {event.pot_status==='revealed'&&potWinners.length>0&&<div className="mt-8 rounded-3xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-8"><p className="text-sm sm:text-lg uppercase tracking-[.2em] text-primary font-black">Players of the Tournament</p><div className="mt-5 grid sm:grid-cols-2 gap-4"><div className="rounded-2xl bg-card border p-5"><p className="text-sm text-muted-foreground">{event.club_a_name}</p><p className="mt-2 text-xl sm:text-3xl font-black">{potWinnersA.map(p=>p.display_name).join(' & ')}</p></div><div className="rounded-2xl bg-card border p-5"><p className="text-sm text-muted-foreground">{event.club_b_name}</p><p className="mt-2 text-xl sm:text-3xl font-black">{potWinnersB.map(p=>p.display_name).join(' & ')}</p></div></div></div>}
      <PoweredByRallyHub />
    </div>
  </div>;

  if(showcaseActive) return <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 flex flex-col">
    {disconnected&&<div className="mb-3 rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known score. RallyHub will resynchronise automatically.</div>}
    {potOpen&&<div className="mb-3 rounded-2xl border-2 border-primary/40 bg-primary/10 px-4 py-3"><VotingPrompt votingUrl={votingUrl} countdown={potCountdown} compact /></div>}
    <header className="text-center shrink-0">
      <p className="text-xs sm:text-sm uppercase tracking-[.28em] text-primary font-black">{INTERCLUB_MODULE_NAME} · Showcase Final</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2"><Badge>{showcase.showcase_mode==='exhibition'?'OPTIONAL SHOWCASE · EXHIBITION':'SHOWCASE TIEBREAK'}</Badge><Badge variant="outline">First to {showcase.showcase_target_points||11} · win by {showcase.showcase_win_by||1}</Badge></div>
      <p className="mt-2 text-sm text-muted-foreground">Interclub result: {event.club_a_name} {s.a}–{s.b} {event.club_b_name}{showcase.showcase_mode==='exhibition'?' · unchanged by this exhibition':''}</p>
    </header>
    <main className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8 py-4 min-h-0">
      <section className="h-full rounded-3xl border bg-card flex flex-col items-center justify-center p-4 sm:p-8 text-center" style={{borderTopWidth:'10px',borderTopColor:event.club_a_primary_colour||'#2563eb'}}>
        {event.club_a_logo_url&&<img src={event.club_a_logo_url} alt={`${event.club_a_name} logo`} className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain rounded-2xl bg-white p-2 shadow-sm"/>}
        <h2 className="mt-3 text-xl sm:text-3xl lg:text-4xl font-black">{event.club_a_name}</h2>
        <p className="mt-2 text-sm sm:text-lg lg:text-xl text-muted-foreground font-semibold">{(showcase.club_a_names||[]).join(' & ')}</p>
        <p className="mt-4 sm:mt-6 text-[clamp(5rem,18vw,14rem)] leading-none font-black tabular-nums">{showcase.score_a??0}</p>
      </section>
      <div className="text-center self-center"><p className="text-xs sm:text-lg font-bold uppercase tracking-[.25em] text-muted-foreground">vs</p></div>
      <section className="h-full rounded-3xl border bg-card flex flex-col items-center justify-center p-4 sm:p-8 text-center" style={{borderTopWidth:'10px',borderTopColor:event.club_b_primary_colour||'#7f1d1d'}}>
        {event.club_b_logo_url&&<img src={event.club_b_logo_url} alt={`${event.club_b_name} logo`} className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain rounded-2xl bg-white p-2 shadow-sm"/>}
        <h2 className="mt-3 text-xl sm:text-3xl lg:text-4xl font-black">{event.club_b_name}</h2>
        <p className="mt-2 text-sm sm:text-lg lg:text-xl text-muted-foreground font-semibold">{(showcase.club_b_names||[]).join(' & ')}</p>
        <p className="mt-4 sm:mt-6 text-[clamp(5rem,18vw,14rem)] leading-none font-black tabular-nums">{showcase.score_b??0}</p>
      </section>
    </main>
    {sideChangeRecent&&<div className="shrink-0 rounded-2xl bg-red-600 px-4 py-4 sm:py-5 text-center text-3xl sm:text-5xl font-black text-white shadow-xl">CHANGE ENDS</div>}
    {showcase.status==='completed'&&<div className="shrink-0 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-4 text-center text-xl sm:text-3xl font-black">{showcase.winner==='club_a'?event.club_a_name:event.club_b_name} won the Showcase {showcase.score_a}–{showcase.score_b}</div>}
    {event.pot_status==='revealed'&&potWinners.length>0&&<div className="shrink-0 mt-3 rounded-2xl border border-primary/30 bg-card px-4 py-4 text-center"><p className="text-xs uppercase tracking-[.18em] text-primary font-black">Players of the Tournament</p><p className="mt-2 text-lg sm:text-2xl font-black">{event.club_a_name}: {potWinnersA.map(p=>p.display_name).join(' & ')} · {event.club_b_name}: {potWinnersB.map(p=>p.display_name).join(' & ')}</p></div>}
    <PoweredByRallyHub />
  </div>;

  return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 space-y-6">
    {disconnected&&<div className="sticky top-2 z-20 rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known state. RallyHub will resynchronise automatically.</div>}
    <header className="text-center"><LiveEventBrand/><div className="mt-3 grid grid-cols-2 sm:grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-8"><div className="order-2 sm:order-1 flex items-center justify-center sm:justify-end gap-2 sm:gap-3 min-w-0 rounded-2xl border bg-card px-2 sm:px-3 py-2" style={{borderTopWidth:'6px',borderTopColor:event.club_a_primary_colour||'#2563eb',borderBottomWidth:'3px',borderBottomColor:event.club_a_secondary_colour||event.club_a_primary_colour||'#2563eb'}}>{event.club_a_logo_url&&<img src={event.club_a_logo_url} alt="" className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl bg-white object-contain p-1"/>}<span className="text-lg sm:text-4xl font-black truncate">{event.club_a_name}</span></div><div className="order-1 col-span-2 sm:order-2 sm:col-span-1 flex items-center justify-center gap-2 sm:gap-3 py-1"><span className="text-5xl sm:text-7xl font-black tabular-nums whitespace-nowrap" style={{color:event.club_a_primary_colour||'#2563eb'}}>{s.a}</span><span className="text-4xl sm:text-6xl font-black text-muted-foreground">–</span><span className="text-5xl sm:text-7xl font-black tabular-nums whitespace-nowrap" style={{color:event.club_b_primary_colour||'#7f1d1d'}}>{s.b}</span></div><div className="order-3 sm:order-3 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 min-w-0 rounded-2xl border bg-card px-2 sm:px-3 py-2" style={{borderTopWidth:'6px',borderTopColor:event.club_b_primary_colour||'#7f1d1d',borderBottomWidth:'3px',borderBottomColor:event.club_b_secondary_colour||event.club_b_primary_colour||'#7f1d1d'}}><span className="text-lg sm:text-4xl font-black truncate">{event.club_b_name}</span>{event.club_b_logo_url&&<img src={event.club_b_logo_url} alt="" className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl bg-white object-contain p-1"/>}</div></div><div className="flex justify-center gap-2 mt-4"><Badge className={breakActive?'bg-red-600 text-white':''} variant={breakActive?'default':'outline'}>{breakActive?'BREAK':plannedRounds?`Round ${round}/${plannedRounds}`:`Round ${round}`}</Badge><Badge variant="outline">{String(timer.phase||'idle').toUpperCase()}</Badge><Badge className="text-lg tabular-nums">{fmt(remaining)}</Badge></div></header>
    {potOpen&&<div className="rounded-2xl border-2 border-primary/40 bg-primary/10 p-4"><VotingPrompt votingUrl={votingUrl} countdown={potCountdown}/></div>}
    {scheduledBreakHere&&!breakActive&&<div className="rounded-xl border-2 border-red-500 bg-red-600 p-5 text-center text-white shadow-xl"><p className="text-xl sm:text-3xl font-black uppercase tracking-wider">Break after this round · {event.break_minutes} minutes</p><p className="mt-2 text-sm sm:text-base text-white/90">Round {round+1} will wait until the scheduled break is finished or the host ends it early.</p></div>}
    {breakActive&&<div className="rounded-xl border-2 border-red-400 bg-red-600 p-6 text-center text-white shadow-xl"><p className="text-xl sm:text-3xl font-black uppercase tracking-[.2em]">Break now</p><p className="mt-3 text-6xl sm:text-8xl font-black tabular-nums">{fmt(remaining)}</p><p className="mt-3 text-sm sm:text-lg text-white/90">Enjoy the break · Round {round+1} is up next</p></div>}
    {showcaseActive&&<section className="rounded-2xl border-2 border-primary/40 bg-card p-5 sm:p-8 text-center shadow-lg"><div className="flex flex-wrap justify-center gap-2"><Badge>{showcase.showcase_mode==='exhibition'?'OPTIONAL SHOWCASE · EXHIBITION':'SHOWCASE TIEBREAK'}</Badge><Badge variant="outline">First to {showcase.showcase_target_points||11} · win by {showcase.showcase_win_by||1}</Badge></div><p className="mt-5 text-lg sm:text-2xl font-bold">{(showcase.club_a_names||[]).join(' & ')}</p><p className="my-2 text-xs uppercase tracking-widest text-muted-foreground">vs</p><p className="text-lg sm:text-2xl font-bold">{(showcase.club_b_names||[]).join(' & ')}</p><p className="mt-6 text-7xl sm:text-9xl font-black tabular-nums text-primary">{showcase.score_a??0} – {showcase.score_b??0}</p>{sideChangeRecent&&<div className="mt-6 rounded-xl bg-red-600 px-4 py-4 text-2xl sm:text-4xl font-black text-white">CHANGE ENDS</div>}{showcase.status==='completed'&&<p className="mt-5 text-xl font-bold">{showcase.winner==='club_a'?event.club_a_name:event.club_b_name} won the Showcase {showcase.score_a}–{showcase.score_b}</p>}{showcase.showcase_mode==='exhibition'&&<p className="mt-3 text-sm text-muted-foreground">Exhibition only · the Interclub result above is unchanged</p>}</section>}
    {!breakActive&&!showcaseActive&&<section><h2 className="text-lg font-bold mb-3">On Court Now</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{current.map(m=><div key={m.id} className="rounded-xl border border-border bg-card p-4"><p className="font-bold">Court {m.court_number}</p><p className="mt-2">{m.club_a_names.join(' & ')}</p><p className="text-xs text-muted-foreground my-1">vs</p><p>{m.club_b_names.join(' & ')}</p>{['completed','draw'].includes(m.status)&&<p className="text-xl font-bold text-primary mt-3">{m.score_a} – {m.score_b}</p>}</div>)}</div></section>}
    {!breakActive&&!showcaseActive&&resting.length>0&&<section className="rounded-xl border border-border bg-card/70 p-4"><h2 className="text-lg font-bold">Resting This Round</h2><div className="flex flex-wrap gap-2 mt-3">{resting.map(p=><span key={p.id} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">{p.display_name}</span>)}</div></section>}
    {!showcaseActive&&next.length>0&&<section><h2 className="text-lg font-bold mb-3">{breakActive?'After the Break':'Up Next'} · Round {round+1}</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{next.map(m=><div key={m.id} className="rounded-xl bg-secondary/50 p-3 text-sm"><b>Court {m.court_number}</b><p>{m.club_a_names.join(' & ')} vs {m.club_b_names.join(' & ')}</p></div>)}</div></section>}
    {event.junior_display_mode&&<p className="text-center text-xs text-muted-foreground">Junior privacy mode · surnames abbreviated.</p>}
    <PoweredByRallyHub />
  </div>;
}