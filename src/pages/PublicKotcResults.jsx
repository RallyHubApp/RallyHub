import React,{useCallback,useEffect,useRef,useState} from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft,Crown,Mail,Menu,Minimize2,MonitorUp,Pencil,RefreshCw,Save,Share2,Trophy,WifiOff,X } from 'lucide-react';

function message(e){return e?.response?.data?.error||e?.data?.error||e?.message||'Live KOTC view unavailable';}
function fmt(v){const n=Math.max(0,Number(v||0));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;}
function hasScore(match){return match.team_a_score!=null&&match.team_b_score!=null;}

function CourtCard({match,large=false,roundStatus=''}){
  const scored=hasScore(match);
  return <div className={`rounded-xl border bg-card ${large?'p-5':'p-4'}`} data-testid={`public-kotc-court-${match.court}`}>
    <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2">{Number(match.court)===1&&<Crown className={`${large?'w-5 h-5':'w-4 h-4'} text-yellow-400`}/>}<p className={`${large?'text-xl':'text-base'} font-bold`}>Court {match.court}</p></div><Badge variant="outline" className={large?'text-sm':'text-[10px]'}>{match.status==='completed'?'SAVED':roundStatus==='STARTED'?'LIVE':'READY'}</Badge></div>
    <div className={`${large?'mt-4 text-lg':'mt-3 text-sm'} flex justify-between gap-3 items-start`}><span className="font-medium leading-tight">{match.team_a.join(' & ')}</span>{scored&&<strong className={large?'text-2xl':'text-base'}>{match.team_a_score}</strong>}</div>
    <div className={`${large?'text-sm my-2':'text-[10px] my-1'} uppercase text-muted-foreground`}>vs</div>
    <div className={`${large?'text-lg':'text-sm'} flex justify-between gap-3 items-start`}><span className="font-medium leading-tight">{match.team_b.join(' & ')}</span>{scored&&<strong className={large?'text-2xl':'text-base'}>{match.team_b_score}</strong>}</div>
    {!scored&&<p className={`${large?'text-sm mt-4':'text-[10px] mt-3'} text-muted-foreground`}>{roundStatus==='STARTED'?'Awaiting result':'Players assigned'}</p>}
  </div>;
}

export default function PublicKotcResults(){
  const {token}=useParams();
  const navigate=useNavigate();
  const params=new URLSearchParams(window.location.search);
  const requestedManage=params.get('manage')==='1';
  const [data,setData]=useState(null),[error,setError]=useState(''),[offline,setOffline]=useState(false),[now,setNow]=useState(Date.now());
  const [hallMode,setHallMode]=useState(()=>params.get('display')==='1');
  const [historyRound,setHistoryRound]=useState(null);
  const [management,setManagement]=useState(null),[managementLoading,setManagementLoading]=useState(false),[hostMenuOpen,setHostMenuOpen]=useState(false),[correctionOpen,setCorrectionOpen]=useState(false),[sendingPlayers,setSendingPlayers]=useState(false);
  const [editingMatchId,setEditingMatchId]=useState(''),[editA,setEditA]=useState(''),[editB,setEditB]=useState(''),[editServing,setEditServing]=useState(''),[savingCorrection,setSavingCorrection]=useState(false);
  const dataRef=useRef(null);
  useEffect(()=>{dataRef.current=data;},[data]);
  const load=useCallback(async()=>{try{const r=await base44.functions.invoke('kotcResultsShare',{action:'public_state',token});if(r.data?.error)throw new Error(r.data.error);setData(r.data);dataRef.current=r.data;setError('');setOffline(false);}catch(e){if(dataRef.current)setOffline(true);else setError(message(e));}},[token]);
  const loadManagement=useCallback(async()=>{if(!requestedManage)return;try{setManagementLoading(true);const r=await base44.functions.invoke('kotcResultsShare',{action:'management_state',token});if(r.data?.canManage)setManagement(r.data);}catch{setManagement(null);}finally{setManagementLoading(false);}},[requestedManage,token]);
  useEffect(()=>{loadManagement();},[loadManagement]);
  const shareResults=async()=>{const url=`${window.location.origin}/kotc-live/${token}`;try{if(navigator.share){await navigator.share({title:`${data?.session?.name||'KOTC'} results`,text:'King of the Court results',url});return;}await navigator.clipboard.writeText(url);toast.success('Results link copied');}catch(e){if(e?.name!=='AbortError')toast.error('Could not share the results link.');}};
  const sendToPlayers=async()=>{if(!management?.sessionId||sendingPlayers)return;try{setSendingPlayers(true);const r=await base44.functions.invoke('kotcResultsShare',{action:'email_players',sessionId:management.sessionId,resend:false});toast.success(`Results sent: ${r.data?.sent||0} emailed${r.data?.alreadySent?`, ${r.data.alreadySent} already sent`:''}${r.data?.skipped?`, ${r.data.skipped} skipped`:''}`);}catch(e){toast.error(message(e));}finally{setSendingPlayers(false);}};
  const beginCorrection=m=>{setEditingMatchId(m.id);setEditA(String(m.team_a_score??''));setEditB(String(m.team_b_score??''));setEditServing(m.serving_side_at_horn||'');};
  const saveCorrection=async m=>{if(!management?.sessionId||savingCorrection||editA===''||editB==='')return;if(data?.session?.scoring_mode==='timed'&&Number(editA)===Number(editB)&&!editServing){toast.error('Choose which team was serving at the horn for a tied timed result.');return;}try{setSavingCorrection(true);const r=await base44.functions.invoke('kotcCommand',{sessionId:management.sessionId,commandId:`post-event-correction-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,commandType:'correct_match',matchId:m.id,expectedMatchRevision:Number(m.revision||0),teamAScore:Number(editA),teamBScore:Number(editB),servingSideAtHorn:Number(editA)===Number(editB)?editServing:undefined,reason:'Post-event host correction'});if(!r.data?.success&&r.data?.error)throw new Error(r.data.error);toast.success(`Round ${m.round_number} · Court ${m.court} corrected`);setEditingMatchId('');await Promise.all([load(),loadManagement()]);}catch(e){toast.error(message(e));}finally{setSavingCorrection(false);}};
  useEffect(()=>{let cancelled=false,pollTimer=null;const schedule=()=>{if(cancelled)return;const current=dataRef.current;if(['completed','finalised'].includes(current?.session?.status))return;const delay=Math.max(5000,Number(current?.poll_after_ms||8000));pollTimer=setTimeout(async()=>{await load();schedule();},delay);};load().then(schedule);const tick=setInterval(()=>setNow(Date.now()),1000);const off=()=>setOffline(true),on=()=>{setOffline(false);if(!['completed','finalised'].includes(dataRef.current?.session?.status))load();},visible=()=>{if(document.visibilityState==='visible'){setNow(Date.now());if(!['completed','finalised'].includes(dataRef.current?.session?.status))load();}};window.addEventListener('offline',off);window.addEventListener('online',on);document.addEventListener('visibilitychange',visible);return()=>{cancelled=true;if(pollTimer)clearTimeout(pollTimer);clearInterval(tick);window.removeEventListener('offline',off);window.removeEventListener('online',on);document.removeEventListener('visibilitychange',visible);};},[load]);
  const toggleHall=async next=>{setHallMode(next);try{const u=new URL(window.location.href);if(next)u.searchParams.set('display','1');else u.searchParams.delete('display');window.history.replaceState({},'',u);}catch{}try{if(next&&!document.fullscreenElement)await document.documentElement.requestFullscreen?.();if(!next&&document.fullscreenElement)await document.exitFullscreen?.();}catch{}};
  if(error&&!data)return <div className="min-h-screen bg-background grid place-items-center p-4"><div className="glass rounded-xl p-5 max-w-md w-full"><h1 className="font-bold">Live KOTC unavailable</h1><p className="text-sm text-muted-foreground mt-2">{error}</p></div></div>;
  if(!data)return <div className="min-h-screen bg-background grid place-items-center"><RefreshCw className="animate-spin"/></div>;

  const timer=data.timer||{};
  const remaining=timer.running&&timer.deadlineAt?Math.max(0,Math.ceil((Date.parse(timer.deadlineAt)-now)/1000)):Number(timer.remainingSeconds||0);
  const roundStatus=String(data.current_round?.status||data.session.status||'').replaceAll('_',' ').toUpperCase();
  const current=data.current_matches||[];
  const finished=['completed','finalised'].includes(data.session.status);
  const podium=data.podium||[];
  const historyRounds=[...new Set((data.matches||[]).map(m=>Number(m.round_number)))].sort((a,b)=>a-b);
  const selectedHistoryRound=historyRound&&historyRounds.includes(Number(historyRound))?Number(historyRound):(historyRounds.at(-1)||null);
  const historyMatches=selectedHistoryRound?(data.matches||[]).filter(m=>Number(m.round_number)===selectedHistoryRound):[];

  if(hallMode){
    return <div className="min-h-screen bg-background text-foreground p-4 sm:p-6" data-testid="public-kotc-hall-display">
      {offline&&<div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known state</div>}
      <main className="max-w-[1600px] mx-auto space-y-4">
        <header className="grid grid-cols-[1fr_auto] items-start gap-4">
          <div className="min-w-0"><p className="text-xs uppercase tracking-[.25em] text-primary font-bold">King of the Court · Hall Display</p><h1 className="text-2xl sm:text-4xl font-bold mt-1 truncate">{data.session.name}</h1></div>
          <Button variant="outline" size="sm" onClick={()=>toggleHall(false)} data-testid="exit-hall-display"><Minimize2 className="w-4 h-4 mr-1"/>Exit Display</Button>
        </header>

        {!finished&&<section className="rounded-2xl border bg-card p-4 sm:p-5 text-center" data-testid="hall-round-timer">
          <div className="flex justify-center gap-2 flex-wrap"><Badge variant="outline" className="text-base">Round {data.session.current_round_number||'-'}</Badge><Badge variant="outline" className="text-base">{roundStatus||'WAITING'}</Badge></div>
          {data.session.scoring_mode==='timed'&&<p className="text-6xl sm:text-8xl font-bold tabular-nums leading-none mt-3">{fmt(remaining)}</p>}
          <p className="text-sm sm:text-base text-muted-foreground mt-2">{data.current_round?.status==='proposed'?'Court assignments are ready — waiting for the host to start the round.':'Time remaining in this round'}</p>
        </section>}

        {!finished&&(data.bench||[]).length>0&&<section className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center" data-testid="hall-bench"><p className="text-xs uppercase tracking-wider text-amber-500 font-bold">Bench This Round</p><p className="text-lg sm:text-xl font-bold mt-1">{data.bench.join(' · ')}</p></section>}

        {!finished&&current.length>0&&<section data-testid="hall-current-courts"><div className="flex items-center justify-between mb-2"><h2 className="text-lg sm:text-xl font-bold">{data.current_round?.status==='proposed'?'Round Ready':'On Court Now'}</h2><p className="text-sm text-muted-foreground">Scores appear as they are saved</p></div><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{current.map(m=><CourtCard key={`${m.round_number}-${m.court}`} match={m} large roundStatus={roundStatus}/>)}</div></section>}

        {finished&&podium.length>0&&<section data-testid="public-kotc-podium" className="space-y-5"><div className="text-center"><Trophy className="w-10 h-10 text-yellow-400 mx-auto"/><p className="text-xs uppercase tracking-[.25em] text-primary font-bold mt-2">Final Podium</p></div><div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">{podium.map((p,i)=><div key={p.id} className={`rounded-2xl border bg-card p-5 sm:p-7 text-center ${i===0?'border-yellow-400/60':i===1?'border-slate-300/40':'border-amber-700/50'}`}><div className="text-4xl sm:text-6xl">{i===0?'🥇':i===1?'🥈':'🥉'}</div><p className="text-xl sm:text-3xl font-bold mt-3 leading-tight">{p.name}</p><p className="text-sm sm:text-lg text-muted-foreground mt-2">{p.wins}W · {p.losses}L · {p.differential>0?'+':''}{p.differential}</p></div>)}</div></section>}

        {finished&&<section className="rounded-xl border bg-card p-3 max-w-5xl mx-auto"><div className="grid grid-cols-[42px_1fr_55px_55px_70px] text-xs uppercase text-muted-foreground p-2 border-b"><span>#</span><span>Player</span><span>W</span><span>L</span><span>Diff</span></div>{(data.standings||[]).slice(0,10).map(s=><div key={s.id} className="grid grid-cols-[42px_1fr_55px_55px_70px] p-2 border-b last:border-b-0 text-base"><span>{s.rank}</span><span className="font-semibold">{s.name}</span><span>{s.wins}</span><span>{s.losses}</span><span>{s.differential>0?'+':''}{s.differential}</span></div>)}</section>}
      </main>
    </div>;
  }

  return <div className="min-h-screen bg-background p-3 sm:p-5"><main className="max-w-5xl mx-auto space-y-4">
    {offline&&<div className="sticky top-2 z-30 rounded-lg bg-yellow-500 text-black p-3 text-center font-semibold"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known state. RallyHub will resynchronise automatically.</div>}
    <header className="glass rounded-xl p-5 text-center relative">
      <div className="sm:absolute sm:right-3 sm:top-3"><Button variant="outline" size="sm" onClick={()=>toggleHall(true)} data-testid="enter-hall-display"><MonitorUp className="w-4 h-4 mr-1"/>Hall Display</Button></div>
      <p className="text-[10px] uppercase tracking-[.22em] text-primary font-bold mt-3 sm:mt-0">King of the Court · {finished?'Final Results':'Live'}</p>
      <Crown className="w-8 h-8 text-yellow-400 mx-auto mt-2 mb-1"/>
      <h1 className="text-xl sm:text-2xl font-bold">{data.session.name}</h1>
      <div className="flex flex-wrap gap-2 justify-center mt-3"><Badge variant="outline">Round {data.session.current_round_number||'-'}</Badge><Badge variant="outline">{roundStatus||'WAITING'}</Badge>{data.session.scoring_mode==='timed'&&!finished&&<Badge className="text-base tabular-nums">{fmt(remaining)}</Badge>}<Badge variant="outline">{data.completed_rounds} round{data.completed_rounds===1?'':'s'} completed</Badge></div>
      <p className="text-xs text-muted-foreground mt-3">{finished?'These are the final saved results. This link remains available after the session.':'This page updates automatically as the host starts rounds and scores are saved.'}</p>
    </header>

    {finished&&podium.length>0&&<section className="space-y-3" data-testid="public-kotc-podium"><div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400"/><h2 className="font-bold">Podium</h2></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{podium.map((p,i)=><div key={p.id} className={`glass rounded-xl p-3 text-center border ${i===0?'col-span-2 sm:col-span-1 border-yellow-400/50':i===1?'border-slate-300/40':'border-amber-700/40'}`}><div className="text-2xl">{i===0?'🥇':i===1?'🥈':'🥉'}</div><p className="font-bold text-sm mt-1">{p.name}</p><p className="text-xs text-muted-foreground">{p.wins}W · {p.losses}L · {p.differential>0?'+':''}{p.differential}</p></div>)}</div></section>}

    {current.length>0&&<section className="space-y-3" data-testid="public-kotc-current-round"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">{finished?'Final Round':data.current_round?.status==='proposed'?'Round Ready':'On Court Now'} · Round {data.current_round?.round_number}</h2><Badge variant="outline">{roundStatus}</Badge></div>{(data.bench||[]).length>0&&<div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3"><p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Bench This Round</p><p className="text-sm font-semibold mt-1">{data.bench.join(' · ')}</p></div>}<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{current.map(m=><CourtCard key={`${m.round_number}-${m.court}`} match={m} roundStatus={roundStatus}/>)}</div></section>}

    <section className="glass rounded-xl overflow-hidden"><div className="p-3 border-b flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400"/><h2 className="font-semibold">{finished?'Final Standings':'Live Standings'}</h2></div><div className="grid grid-cols-[36px_1fr_42px_42px_58px] text-[10px] uppercase text-muted-foreground p-2 border-b"><span>#</span><span>Player</span><span>W</span><span>L</span><span>Diff</span></div>{(data.standings||[]).map(s=><div key={s.id} className="grid grid-cols-[36px_1fr_42px_42px_58px] p-2 border-b last:border-b-0 text-sm"><span>{s.rank}</span><span className="font-medium">{s.name}</span><span>{s.wins}</span><span>{s.losses}</span><span>{s.differential>0?'+':''}{s.differential}</span></div>)}</section>

    {historyRounds.length>0&&<section className="glass rounded-xl p-3 sm:p-4 space-y-3" data-testid="public-kotc-round-history"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div><h2 className="font-semibold">Round Results</h2><p className="text-xs text-muted-foreground mt-0.5">Choose a completed round to see every court result.</p></div><Badge variant="outline">Round {selectedHistoryRound}</Badge></div><div className="flex gap-2 overflow-x-auto pb-1">{historyRounds.map(r=><Button key={r} size="sm" variant={selectedHistoryRound===r?'default':'outline'} className="shrink-0" onClick={()=>setHistoryRound(r)}>Round {r}</Button>)}</div><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2">{historyMatches.map((m,i)=><div key={`${m.round_number}-${m.court}-${i}`} className="rounded-lg border p-3 text-sm"><p className="text-xs font-semibold mb-2">Court {m.court}</p><div className="flex items-center justify-between gap-3"><span className="min-w-0">{m.team_a.join(' & ')}</span><strong>{m.team_a_score}</strong></div><div className="text-[10px] uppercase text-muted-foreground my-1">vs</div><div className="flex items-center justify-between gap-3"><span className="min-w-0">{m.team_b.join(' & ')}</span><strong>{m.team_b_score}</strong></div></div>)}</div></section>}
  </main></div>;
}
