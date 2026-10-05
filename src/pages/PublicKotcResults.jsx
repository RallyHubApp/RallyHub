import React,{useCallback,useEffect,useRef,useState} from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs,TabsContent,TabsList,TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft,Bell,Crown,Mail,Menu,Minimize2,MonitorUp,Pencil,RefreshCw,Save,Share2,Trophy,WifiOff,X } from 'lucide-react';
import { AppearanceQuickButton } from '@/components/appearance/AppearanceControls';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
import KotcMyPlayerPanel from '@/components/kotc/KotcMyPlayerPanel';

function message(e){return e?.response?.data?.error||e?.data?.error||e?.message||'Live KOTC view unavailable';}
function fmt(v){const n=Math.max(0,Number(v||0));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;}
function hasScore(match){return match.team_a_score!=null&&match.team_b_score!=null;}

function KotcPodium({podium=[],large=false}){
  const ranked=(podium||[]).slice(0,3).map((player,index)=>({...player,place:index+1}));
  const sizeClass=index=>large
    ? (index===0?'min-h-52 sm:min-h-60 px-4 py-6':index===1?'min-h-44 sm:min-h-52 px-4 py-5':'min-h-40 sm:min-h-48 px-4 py-4')
    : (index===0?'min-h-40 sm:min-h-44 px-3 py-4':index===1?'min-h-36 sm:min-h-40 px-3 py-3.5':'min-h-32 sm:min-h-36 px-3 py-3');
  const medal=index=>index===0?'🥇':index===1?'🥈':'🥉';
  const place=index=>index===0?'1st':index===1?'2nd':'3rd';
  const medalClass=index=>large?(index===0?'text-5xl sm:text-6xl':index===1?'text-4xl sm:text-5xl':'text-3xl sm:text-4xl'):(index===0?'text-4xl sm:text-5xl':index===1?'text-3xl sm:text-4xl':'text-2xl sm:text-3xl');
  const nameClass=index=>large?(index===0?'text-xl sm:text-2xl':index===1?'text-lg sm:text-xl':'text-base sm:text-lg'):(index===0?'text-base sm:text-lg':index===1?'text-sm sm:text-base':'text-sm');
  return <div className={`grid grid-cols-3 ${large?'gap-3 sm:gap-5 max-w-5xl':'gap-2 max-w-3xl'} mx-auto items-end`} role="list" aria-label="Final podium">
    {ranked.map((p,index)=><div key={p.id} role="listitem" aria-label={`${place(index)} place: ${p.name}`} className={`rounded-xl border bg-card text-center flex flex-col justify-center ${sizeClass(index)}`}>
      <div className={medalClass(index)}>{medal(index)}</div>
      <p className="mt-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-muted-foreground">{place(index)}</p>
      <p title={p.name} className={`mt-1 font-black leading-tight break-words ${nameClass(index)}`}>{p.name}</p>
      <p className={`${large?'text-xs sm:text-sm':'text-[10px] sm:text-[11px]'} text-muted-foreground mt-2`}>{p.wins}W · {p.losses}L · {p.differential>0?'+':''}{p.differential}</p>
    </div>)}
  </div>;
}

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

function openScoreClientId(){const key='rallyhub-kotc-open-score-client';let id=sessionStorage.getItem(key);if(!id){id=`open_${crypto.randomUUID().replaceAll('-','')}`;sessionStorage.setItem(key,id);}return id;}
function OpenPlayerScoreCard({match,session,shareToken,onSaved}){const [a,setA]=useState(match.team_a_score??'');const [b,setB]=useState(match.team_b_score??'');const [serving,setServing]=useState(match.serving_side_at_horn||'');const [editing,setEditing]=useState(false);const [busy,setBusy]=useState(false);const clientId=useMemo(()=>openScoreClientId(),[]);const resolved=['completed','retired','abandoned','not_played'].includes(match.status);const claim=async()=>{if(resolved)return;try{setBusy(true);await base44.functions.invoke('kotcPlayerScore',{action:'claim',shareToken,deviceToken:clientId,matchId:match.id});setEditing(true);toast.success(`Court ${match.court} locked to this device`);}catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not claim this court.');await onSaved?.();}finally{setBusy(false);}};const cancel=async()=>{try{await base44.functions.invoke('kotcPlayerScore',{action:'release',shareToken,deviceToken:clientId,matchId:match.id});}catch{}setEditing(false);setA(match.team_a_score??'');setB(match.team_b_score??'');};const save=async()=>{if(a===''||b==='')return;try{setBusy(true);await base44.functions.invoke('kotcPlayerScore',{action:'save',shareToken,deviceToken:clientId,matchId:match.id,expectedRevision:Number(match.revision||0),teamAScore:Number(a),teamBScore:Number(b),servingSideAtHorn:Number(a)===Number(b)?serving:undefined});toast.success(`Court ${match.court} score saved`);setEditing(false);await onSaved?.();}catch(e){toast.error(e?.response?.data?.error||e?.message||'Score was not saved.');await onSaved?.();}finally{setBusy(false);}};return <div className="rounded-xl border bg-card p-4 space-y-3"><div className="flex justify-between items-center"><b>Court {match.court}</b><Badge variant="outline">{resolved?'SAVED':editing?'SCORING':'LIVE'}</Badge></div>{[['A',match.team_a,a,setA],['B',match.team_b,b,setB]].map(([side,names,value,setValue])=><div key={side} className="grid grid-cols-[1fr_84px] gap-3 items-center"><span>{names.join(' & ')}</span><Input inputMode="numeric" value={value} disabled={!editing||busy} onChange={e=>setValue(e.target.value.replace(/\D/g,'').slice(0,2))} className="h-12 text-center text-lg font-bold"/></div>)}{editing&&session.scoring_mode==='timed'&&a!==''&&b!==''&&Number(a)===Number(b)&&<Select value={serving} onValueChange={setServing}><SelectTrigger><SelectValue placeholder="Who was serving at the horn?"/></SelectTrigger><SelectContent><SelectItem value="A">Team A</SelectItem><SelectItem value="B">Team B</SelectItem></SelectContent></Select>}{resolved?<div className="rounded-lg bg-green-500/10 p-2 text-center text-sm font-semibold">✓ Score saved: {match.team_a_score}–{match.team_b_score}</div>:editing?<div className="grid grid-cols-2 gap-2"><Button onClick={save} disabled={busy||a===''||b===''||(session.scoring_mode==='timed'&&Number(a)===Number(b)&&!serving)}>Save Result</Button><Button variant="outline" onClick={cancel} disabled={busy}>Cancel</Button></div>:<Button className="w-full" onClick={claim} disabled={busy}>Enter Court {match.court} Score</Button>}</div>}

export default function PublicKotcResults(){
  const {token}=useParams();
  const navigate=useNavigate();
  const params=new URLSearchParams(window.location.search);
  const requestedManage=params.get('manage')==='1';
  const [data,setData]=useState(null),[error,setError]=useState(''),[offline,setOffline]=useState(false),[now,setNow]=useState(Date.now());
  const [hallMode,setHallMode]=useState(()=>params.get('display')==='1');
  const [historyRound,setHistoryRound]=useState(null);
  const [activeTab,setActiveTab]=useState('live');
  const [broadcastOpen,setBroadcastOpen]=useState(true);
  const [management,setManagement]=useState(null),[managementLoading,setManagementLoading]=useState(false),[hostMenuOpen,setHostMenuOpen]=useState(false),[correctionOpen,setCorrectionOpen]=useState(false),[sendingPlayers,setSendingPlayers]=useState(false);
  const [editingMatchId,setEditingMatchId]=useState(''),[editA,setEditA]=useState(''),[editB,setEditB]=useState(''),[editServing,setEditServing]=useState(''),[savingCorrection,setSavingCorrection]=useState(false);
  const dataRef=useRef(null);
  useEffect(()=>{dataRef.current=data;},[data]);
  const load=useCallback(async()=>{try{const r=await base44.functions.invoke('kotcResultsShare',{action:'public_state',token});if(r.data?.error)throw new Error(r.data.error);setData(r.data);dataRef.current=r.data;setError('');setOffline(false);}catch(e){if(dataRef.current)setOffline(true);else setError(message(e));}},[token]);
  const loadManagement=useCallback(async()=>{if(!requestedManage)return;try{setManagementLoading(true);const r=await base44.functions.invoke('kotcResultsShare',{action:'management_state',token});if(r.data?.canManage)setManagement(r.data);}catch{setManagement(null);}finally{setManagementLoading(false);}},[requestedManage,token]);
  useEffect(()=>{loadManagement();},[loadManagement]);
  useEffect(()=>{if(data?.broadcast?.id)setBroadcastOpen(true);},[data?.broadcast?.id]);
  useEffect(()=>{if(!data)return;const finishedNow=['completed','finalised'].includes(data.session?.status);const configured=Array.isArray(data.player_link?.tabs)&&data.player_link.tabs.length?data.player_link.tabs:['live','players','rounds','leaderboard','event_info'];const allowed=finishedNow?['results',...configured.filter(x=>!['live','scores'].includes(x))]:configured;if(!allowed.includes(activeTab))setActiveTab(finishedNow?'results':(allowed[0]||'live'));},[data?.session?.status,JSON.stringify(data?.player_link?.tabs||[]),activeTab]);
  const shareResults=async()=>{const url=`${window.location.origin}/kotc-live/${token}`;try{if(navigator.share){await navigator.share({title:`${data?.session?.name||'KOTC'} results`,text:'King of the Court results',url});return;}await navigator.clipboard.writeText(url);toast.success('Results link copied');}catch(e){if(e?.name!=='AbortError')toast.error('Could not share the results link.');}};
  const sendToPlayers=async()=>{if(!management?.sessionId||sendingPlayers)return;try{setSendingPlayers(true);const r=await base44.functions.invoke('kotcResultsShare',{action:'email_players',sessionId:management.sessionId,resend:false});toast.success(`Results sent: ${r.data?.sent||0} emailed${r.data?.alreadySent?`, ${r.data.alreadySent} already sent`:''}${r.data?.skipped?`, ${r.data.skipped} skipped`:''}`);}catch(e){toast.error(message(e));}finally{setSendingPlayers(false);}};
  const beginCorrection=m=>{setEditingMatchId(m.id);setEditA(String(m.team_a_score??''));setEditB(String(m.team_b_score??''));setEditServing(m.serving_side_at_horn||'');};
  const saveCorrection=async m=>{if(!management?.sessionId||savingCorrection||editA===''||editB==='')return;if(data?.session?.scoring_mode==='timed'&&Number(editA)===Number(editB)&&!editServing){toast.error('Choose which team was serving at the horn for a tied timed result.');return;}try{setSavingCorrection(true);const r=await base44.functions.invoke('kotcCommand',{sessionId:management.sessionId,commandId:`post-event-correction-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,commandType:'correct_match',matchId:m.id,expectedMatchRevision:Number(m.revision||0),teamAScore:Number(editA),teamBScore:Number(editB),servingSideAtHorn:Number(editA)===Number(editB)?editServing:undefined,reason:'Post-event host correction'});if(!r.data?.success&&r.data?.error)throw new Error(r.data.error);toast.success(`Round ${m.round_number} · Court ${m.court} corrected`);setEditingMatchId('');await Promise.all([load(),loadManagement()]);}catch(e){toast.error(message(e));}finally{setSavingCorrection(false);}};
  useEffect(()=>{let cancelled=false,pollTimer=null;const schedule=()=>{if(cancelled)return;const current=dataRef.current;if(['completed','finalised'].includes(current?.session?.status))return;const baseDelay=Math.max(5000,Number(current?.poll_after_ms||8000));const jitter=Math.floor(Math.random()*Math.min(2500,Math.max(600,baseDelay*0.25)));const delay=baseDelay+jitter;pollTimer=setTimeout(async()=>{await load();schedule();},delay);};load().then(schedule);const tick=setInterval(()=>setNow(Date.now()),1000);const off=()=>setOffline(true),on=()=>{setOffline(false);if(!['completed','finalised'].includes(dataRef.current?.session?.status))load();},visible=()=>{if(document.visibilityState==='visible'){setNow(Date.now());if(!['completed','finalised'].includes(dataRef.current?.session?.status))load();}};window.addEventListener('offline',off);window.addEventListener('online',on);document.addEventListener('visibilitychange',visible);return()=>{cancelled=true;if(pollTimer)clearTimeout(pollTimer);clearInterval(tick);window.removeEventListener('offline',off);window.removeEventListener('online',on);document.removeEventListener('visibilitychange',visible);};},[load]);
  const toggleHall=async next=>{setHallMode(next);try{const u=new URL(window.location.href);if(next)u.searchParams.set('display','1');else u.searchParams.delete('display');window.history.replaceState({},'',u);}catch{}try{if(next&&!document.fullscreenElement)await document.documentElement.requestFullscreen?.();if(!next&&document.fullscreenElement)await document.exitFullscreen?.();}catch{}};
  if(error&&!data)return <div className="min-h-screen bg-background text-foreground grid place-items-center p-4"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/><div className="glass rounded-xl p-5 max-w-md w-full text-center"><RallyHubPublicBrand moduleName="King of the Court" pageLabel="Live Event View"/><h1 className="font-bold mt-5">Live KOTC unavailable</h1><p className="text-sm text-muted-foreground mt-2">{error}</p></div></div>;
  if(!data)return <div className="min-h-screen bg-background text-foreground grid place-items-center"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/><div className="text-center"><RallyHubPublicBrand moduleName="King of the Court" pageLabel="Live Event View"/><RefreshCw className="animate-spin mx-auto mt-5"/></div></div>;

  const timer=data.timer||{};
  const remaining=timer.running&&timer.deadlineAt?Math.max(0,Math.ceil((Date.parse(timer.deadlineAt)-now)/1000)):Number(timer.remainingSeconds||0);
  const roundStatus=String(data.current_round?.status||data.session.status||'').replaceAll('_',' ').toUpperCase();
  const current=data.current_matches||[];
  const finished=['completed','finalised'].includes(data.session.status);
  const podium=data.podium||[];
  const historyRounds=[...new Set((data.matches||[]).map(m=>Number(m.round_number)))].sort((a,b)=>a-b);
  const selectedHistoryRound=historyRound&&historyRounds.includes(Number(historyRound))?Number(historyRound):(historyRounds.at(-1)||null);
  const historyMatches=selectedHistoryRound?(data.matches||[]).filter(m=>Number(m.round_number)===selectedHistoryRound):[];
  const configuredTabs=Array.isArray(data.player_link?.tabs)&&data.player_link.tabs.length?data.player_link.tabs:['live','players','rounds','leaderboard','event_info'];
  const visibleTabs=finished?['results',...configuredTabs.filter(x=>!['live','scores'].includes(x))]:configuredTabs;
  const tabLabels={results:'Results',live:'Live',players:'Players',rounds:'Rounds',scores:'Scores',leaderboard:'Leaderboard',event_info:'Event Info'};

  if(hallMode){
    return <div className="min-h-screen bg-background text-foreground p-4 sm:p-6" data-testid="public-kotc-hall-display">
      {offline&&<div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known state</div>}
      <main className="max-w-[1600px] mx-auto space-y-4">
        <header className="grid grid-cols-[1fr_auto] items-start gap-4">
          <div className="min-w-0"><RallyHubPublicBrand moduleName="King of the Court" pageLabel="Live Event View" club={data.club_brand} align="left"/><h1 className="text-2xl sm:text-4xl font-bold mt-2 truncate">{data.session.name}</h1></div>
          <div className="flex flex-col sm:flex-row items-end gap-2"><AppearanceQuickButton/><Button variant="outline" size="sm" onClick={()=>toggleHall(false)} data-testid="exit-hall-display"><Minimize2 className="w-4 h-4 mr-1"/>Exit Display</Button></div>
        </header>

        {!finished&&<section className="rounded-2xl border bg-card p-4 sm:p-5 text-center" data-testid="hall-round-timer">
          <div className="flex justify-center gap-2 flex-wrap"><Badge variant="outline" className="text-base">Round {data.session.current_round_number||'-'}</Badge><Badge variant="outline" className="text-base">{roundStatus||'WAITING'}</Badge></div>
          {data.session.scoring_mode==='timed'&&<p className="text-6xl sm:text-8xl font-bold tabular-nums leading-none mt-3">{fmt(remaining)}</p>}
          <p className="text-sm sm:text-base text-muted-foreground mt-2">{data.current_round?.status==='proposed'?'Court assignments are ready — waiting for the host to start the round.':'Time remaining in this round'}</p>
        </section>}

        {!finished&&(data.bench||[]).length>0&&<section className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center" data-testid="hall-bench"><p className="text-xs uppercase tracking-wider text-amber-500 font-bold">Bench This Round</p><p className="text-lg sm:text-xl font-bold mt-1">{data.bench.join(' · ')}</p></section>}

        {!finished&&current.length>0&&<section data-testid="hall-current-courts"><div className="flex items-center justify-between mb-2"><h2 className="text-lg sm:text-xl font-bold">{data.current_round?.status==='proposed'?'Round Ready':'On Court Now'}</h2><p className="text-sm text-muted-foreground">Scores appear as they are saved</p></div><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{current.map(m=><CourtCard key={`${m.round_number}-${m.court}`} match={m} large roundStatus={roundStatus}/>)}</div></section>}

        {finished&&podium.length>0&&<section data-testid="public-kotc-podium" className="space-y-5"><div className="text-center"><Trophy className="w-10 h-10 text-yellow-400 mx-auto"/><p className="text-xs uppercase tracking-[.25em] text-primary font-bold mt-2">Final Podium</p></div><KotcPodium podium={podium} large/></section>}

      </main>
    </div>;
  }

  return <div className="min-h-screen bg-background text-foreground p-3 sm:p-5"><main className="max-w-5xl mx-auto space-y-4">
    {offline&&<div className="sticky top-2 z-30 rounded-lg bg-yellow-500 text-black p-3 text-center font-semibold"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known state. RallyHub will resynchronise automatically.</div>}
    {requestedManage&&managementLoading&&<div className="glass rounded-xl p-3 text-sm text-muted-foreground">Checking host controls…</div>}
    {management?.canManage&&<section className="glass rounded-xl p-3 sm:p-4 space-y-3" data-testid="kotc-results-host-menu">
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.18em] text-primary font-bold">Host results management</p><p className="text-xs text-muted-foreground mt-0.5">Review, correct and share this finished session.</p></div><Button variant="outline" size="sm" onClick={()=>setHostMenuOpen(v=>!v)}><Menu className="w-4 h-4 mr-1"/>{hostMenuOpen?'Close':'Host Menu'}</Button></div>
      {hostMenuOpen&&<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button variant="outline" className="min-h-11" onClick={()=>navigate('/app/tournaments')}><ArrowLeft className="w-4 h-4 mr-1"/>Tournaments</Button>
        <Button variant="outline" className="min-h-11" onClick={()=>{setCorrectionOpen(v=>!v);setHostMenuOpen(false);}}><Pencil className="w-4 h-4 mr-1"/>Correct Results</Button>
        <Button variant="outline" className="min-h-11" onClick={shareResults}><Share2 className="w-4 h-4 mr-1"/>Share Results</Button>
        <Button className="min-h-11" onClick={sendToPlayers} disabled={sendingPlayers}><Mail className="w-4 h-4 mr-1"/>{sendingPlayers?'Sending…':'Send to Players'}</Button>
      </div>}
    </section>}
    {management?.canManage&&correctionOpen&&<section className="glass rounded-xl p-3 sm:p-4 space-y-3" data-testid="kotc-results-correction-panel">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Correct Results</h2><p className="text-xs text-muted-foreground mt-1">Choose a completed round and correct one court. Saving recalculates the standings and podium; historical court assignments do not change.</p></div><Button size="sm" variant="ghost" onClick={()=>{setCorrectionOpen(false);setEditingMatchId('');}}><X className="w-4 h-4"/></Button></div>
      <div className="flex gap-2 overflow-x-auto pb-1">{historyRounds.map(r=><Button key={`edit-${r}`} size="sm" variant={selectedHistoryRound===r?'default':'outline'} className="shrink-0" onClick={()=>{setHistoryRound(r);setEditingMatchId('');}}>Round {r}</Button>)}</div>
      <div className="grid md:grid-cols-2 gap-3">{(management.matches||[]).filter(m=>Number(m.round_number)===Number(selectedHistoryRound)).map(m=><div key={m.id} className="rounded-xl border p-3 space-y-3">
        <div className="flex items-center justify-between"><p className="font-semibold text-sm">Court {m.court}</p><Badge variant="outline">Round {m.round_number}</Badge></div>
        {editingMatchId===m.id?<>
          <div className="grid grid-cols-[1fr_82px] items-center gap-2"><span className="text-sm leading-tight">{m.team_a.join(' & ')}</span><Input type="number" min="0" max="99" value={editA} onChange={e=>setEditA(e.target.value)} className="text-center text-lg font-bold"/></div>
          <div className="grid grid-cols-[1fr_82px] items-center gap-2"><span className="text-sm leading-tight">{m.team_b.join(' & ')}</span><Input type="number" min="0" max="99" value={editB} onChange={e=>setEditB(e.target.value)} className="text-center text-lg font-bold"/></div>
          {data.session.scoring_mode==='timed'&&editA!==''&&editB!==''&&Number(editA)===Number(editB)&&<div className="rounded-lg border p-2"><p className="text-xs font-semibold mb-2">Who was serving at the horn?</p><div className="grid grid-cols-2 gap-2"><Button size="sm" variant={editServing==='A'?'default':'outline'} onClick={()=>setEditServing('A')}>Team A</Button><Button size="sm" variant={editServing==='B'?'default':'outline'} onClick={()=>setEditServing('B')}>Team B</Button></div></div>}
          <div className="grid grid-cols-2 gap-2"><Button onClick={()=>saveCorrection(m)} disabled={savingCorrection||editA===''||editB===''}><Save className="w-4 h-4 mr-1"/>{savingCorrection?'Saving…':'Save Correction'}</Button><Button variant="outline" onClick={()=>setEditingMatchId('')} disabled={savingCorrection}>Cancel</Button></div>
        </>:<>
          <div className="flex items-center justify-between gap-3 text-sm"><span>{m.team_a.join(' & ')}</span><strong>{m.team_a_score}</strong></div><div className="flex items-center justify-between gap-3 text-sm"><span>{m.team_b.join(' & ')}</span><strong>{m.team_b_score}</strong></div>
          <Button variant="outline" className="w-full" onClick={()=>beginCorrection(m)}><Pencil className="w-4 h-4 mr-1"/>Edit Court Result</Button>
        </>}
      </div>)}</div>
    </section>}
    <header className="glass rounded-xl p-5 text-center relative" style={{borderTopWidth:data.club_brand?.primary_colour?5:undefined,borderTopColor:data.club_brand?.primary_colour||undefined,borderBottomWidth:data.club_brand?.secondary_colour?2:undefined,borderBottomColor:data.club_brand?.secondary_colour||undefined}}>
      <div className="flex flex-wrap justify-center sm:absolute sm:right-3 sm:top-3 gap-2"><AppearanceQuickButton/><Button variant="outline" size="sm" onClick={()=>toggleHall(true)} data-testid="enter-hall-display"><MonitorUp className="w-4 h-4 mr-1"/>Live Event View</Button></div>
      <div className="flex justify-center"><RallyHubPublicBrand moduleName="King of the Court" pageLabel={finished?'Event Summary':'Live Event View'} club={data.club_brand}/></div>
      <Crown className="w-8 h-8 text-yellow-400 mx-auto mt-2 mb-1"/>
      <h1 className="text-xl sm:text-2xl font-bold">{data.session.name}</h1>
      <p className="text-[10px] uppercase tracking-[.22em] text-primary font-bold mt-1">{finished?'Final Results':'Live'}</p>
      <div className="flex flex-wrap gap-2 justify-center mt-3"><Badge variant="outline">Round {data.session.current_round_number||'-'}</Badge><Badge variant="outline">{roundStatus||'WAITING'}</Badge>{data.session.scoring_mode==='timed'&&!finished&&<Badge className="text-base tabular-nums">{fmt(remaining)}</Badge>}<Badge variant="outline">{data.completed_rounds} round{data.completed_rounds===1?'':'s'} completed</Badge></div>
      <p className="text-xs text-muted-foreground mt-3">{finished?'Final podium and completed round results. Full individual rankings are not published here.':'This page updates automatically as the host starts rounds and scores are saved.'}</p>
    </header>

    {data.broadcast&&<section className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-3" data-testid="kotc-player-broadcast"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-2"><Bell className="w-4 h-4 text-primary mt-0.5 shrink-0"/><div><p className="text-xs font-black uppercase tracking-wider text-primary">{data.broadcast.title||'KOTC Update'}</p>{broadcastOpen&&<><p className="text-sm mt-1 whitespace-pre-wrap">{data.broadcast.message}</p>{data.broadcast.expires_at&&<p className="text-[10px] text-muted-foreground mt-2">This update expires automatically.</p>}</>}</div></div><Button size="sm" variant="ghost" onClick={()=>setBroadcastOpen(v=>!v)}>{broadcastOpen?'Collapse':'Show'}</Button></div></section>}

    {data.player_link?.scoring_access==='open_players'&&activeTab==='scores'&&!finished?<section className="space-y-3" data-testid="kotc-open-player-scoring"><div className="glass rounded-xl p-3"><h2 className="font-semibold">Enter Your Court Score</h2><p className="text-xs text-muted-foreground mt-1">One person per court should enter the result. Tap your court below; the first device to start scoring locks that court until the result is saved or cancelled.</p></div><div className="grid lg:grid-cols-2 gap-4">{current.map(m=><OpenPlayerScoreCard key={m.id} match={m} session={data.session} shareToken={token} onSaved={load}/>)}</div></section>:<KotcMyPlayerPanel shareToken={token} data={data} onRefresh={load} showScoring={activeTab==='scores'}/>}

    <nav className="sticky top-2 z-20 rounded-xl border bg-background/95 p-2 shadow-sm backdrop-blur" aria-label="KOTC Player Link sections"><div className="flex gap-2 overflow-x-auto pb-0.5">{visibleTabs.map(key=><Button key={key} size="sm" variant={activeTab===key?'default':'outline'} className="shrink-0" onClick={()=>setActiveTab(key)}>{tabLabels[key]||key}</Button>)}</div></nav>

    {activeTab==='results'&&finished&&podium.length>0&&<section className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4" data-testid="public-kotc-podium"><div className="text-center"><Trophy className="w-8 h-8 text-yellow-400 mx-auto"/><p className="mt-2 text-xs sm:text-sm font-black uppercase tracking-[.18em] text-muted-foreground">Final Podium</p></div><KotcPodium podium={podium}/></section>}

    {activeTab==='live'&&!finished&&current.length>0&&<section className="space-y-3" data-testid="public-kotc-current-round"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">{data.current_round?.status==='proposed'?'Round Ready':'On Court Now'} · Round {data.current_round?.round_number}</h2><Badge variant="outline">{roundStatus}</Badge></div>{(data.bench||[]).length>0&&<div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3"><p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Bench This Round</p><p className="text-sm font-semibold mt-1">{data.bench.join(' · ')}</p></div>}<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{current.map(m=><CourtCard key={`${m.round_number}-${m.court}`} match={m} roundStatus={roundStatus}/>)}</div></section>}
    {activeTab==='live'&&!finished&&current.length===0&&<section className="glass rounded-xl p-5 text-center"><Crown className="w-7 h-7 text-yellow-400 mx-auto"/><h2 className="font-bold mt-2">KOTC is getting ready</h2><p className="text-sm text-muted-foreground mt-1">Round 1 will appear here as soon as the host creates the draw.</p></section>}

    {activeTab==='players'&&<section className="glass rounded-xl overflow-hidden" data-testid="kotc-player-list"><div className="p-3 border-b"><h2 className="font-semibold">Players</h2><p className="text-xs text-muted-foreground mt-0.5">Signed-up players for this KOTC.</p></div>{(data.participants||[]).map((p,i)=><div key={p.id} className="grid grid-cols-[42px_1fr_auto] items-center gap-2 p-3 border-b last:border-b-0"><span className="text-xs text-muted-foreground">{p.registration_order||p.seed_rank||i+1}</span><span className="font-medium text-sm">{p.display_name}</span><Badge variant="outline" className="text-[10px]">{String(p.status||'registered').replaceAll('_',' ')}</Badge></div>)}</section>}

    {activeTab==='scores'&&!finished&&<section className="space-y-3" data-testid="kotc-player-scores"><div className="glass rounded-xl p-3"><h2 className="font-semibold">Current Round Scores</h2><p className="text-xs text-muted-foreground mt-1">{data.player_link?.scoring_access==='verified_players'?'If you are verified, your own court score controls appear in My KOTC above.':'Scores are read-only for this session.'}</p></div>{current.length?<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{current.map(m=><CourtCard key={`score-${m.id}`} match={m} roundStatus={roundStatus}/>)}</div>:<div className="rounded-xl border p-4 text-sm text-muted-foreground text-center">No active round yet.</div>}</section>}

    {activeTab==='event_info'&&<section className="glass rounded-xl p-4 space-y-3" data-testid="kotc-event-info"><div><h2 className="font-semibold">Event Info</h2><p className="text-xs text-muted-foreground mt-1">King of the Court session details.</p></div><div className="grid sm:grid-cols-2 gap-3"><div className="rounded-lg border p-3"><p className="text-[10px] uppercase text-muted-foreground font-bold">Session</p><p className="font-semibold mt-1">{data.session.name}</p>{data.session.scheduled_start&&<p className="text-xs text-muted-foreground mt-1">{new Date(data.session.scheduled_start).toLocaleString()}</p>}</div><div className="rounded-lg border p-3"><p className="text-[10px] uppercase text-muted-foreground font-bold">Venue</p><p className="font-semibold mt-1">{data.venue?.name||'Venue to be confirmed'}</p>{data.venue?.address&&<p className="text-xs text-muted-foreground mt-1">{data.venue.address}{data.venue.postcode?` · ${data.venue.postcode}`:''}</p>}</div></div><div className="rounded-lg border p-3"><p className="text-[10px] uppercase text-muted-foreground font-bold">How it works</p><p className="text-sm mt-1">Your partners, opponents and court can change each round. The Live tab shows the current draw; Rounds keeps completed results; the Leaderboard shows progress when the host makes it visible.</p></div></section>}

    {activeTab==='results'&&finished&&<section className="glass rounded-xl overflow-hidden"><div className="p-3 border-b"><h2 className="font-semibold">Final Standings</h2></div><div className="grid grid-cols-[36px_1fr_42px_42px_58px] text-[10px] uppercase text-muted-foreground p-2 border-b"><span>#</span><span>Player</span><span>W</span><span>L</span><span>Diff</span></div>{(data.standings||[]).map(s=><div key={`final-${s.id}`} className="grid grid-cols-[36px_1fr_42px_42px_58px] p-2 border-b last:border-b-0 text-sm"><span>{s.rank}</span><span className="font-medium">{s.name}</span><span>{s.wins}</span><span>{s.losses}</span><span>{s.differential>0?'+':''}{s.differential}</span></div>)}</section>}

    {activeTab==='leaderboard'&&<section className="glass rounded-xl overflow-hidden"><div className="p-3 border-b flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400"/><h2 className="font-semibold">Live Standings</h2></div><div className="grid grid-cols-[36px_1fr_42px_42px_58px] text-[10px] uppercase text-muted-foreground p-2 border-b"><span>#</span><span>Player</span><span>W</span><span>L</span><span>Diff</span></div>{(data.standings||[]).map(s=><div key={s.id} className="grid grid-cols-[36px_1fr_42px_42px_58px] p-2 border-b last:border-b-0 text-sm"><span>{s.rank}</span><span className="font-medium">{s.name}</span><span>{s.wins}</span><span>{s.losses}</span><span>{s.differential>0?'+':''}{s.differential}</span></div>)}</section>}

    {activeTab==='rounds'&&historyRounds.length>0&&<section className="glass rounded-xl p-3 sm:p-4 space-y-3" data-testid="public-kotc-round-history"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div><h2 className="font-semibold">Round Results</h2><p className="text-xs text-muted-foreground mt-0.5">Choose a completed round to see every court result.</p></div><Badge variant="outline">Round {selectedHistoryRound}</Badge></div><div className="flex gap-2 overflow-x-auto pb-1">{historyRounds.map(r=><Button key={r} size="sm" variant={selectedHistoryRound===r?'default':'outline'} className="shrink-0" onClick={()=>setHistoryRound(r)}>Round {r}</Button>)}</div><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2">{historyMatches.map((m,i)=><div key={`${m.round_number}-${m.court}-${i}`} className="rounded-lg border p-3 text-sm"><p className="text-xs font-semibold mb-2">Court {m.court}</p><div className="flex items-center justify-between gap-3"><span className="min-w-0">{m.team_a.join(' & ')}</span><strong>{m.team_a_score}</strong></div><div className="text-[10px] uppercase text-muted-foreground my-1">vs</div><div className="flex items-center justify-between gap-3"><span className="min-w-0">{m.team_b.join(' & ')}</span><strong>{m.team_b_score}</strong></div></div>)}</div></section>}
  </main></div>;
}
