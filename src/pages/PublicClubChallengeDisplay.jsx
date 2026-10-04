import React from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CheckCircle2, Clock3, Info, ListChecks, MapPin, RefreshCw, Trophy, Users, WifiOff } from 'lucide-react';
import { AppearanceQuickButton } from '@/components/appearance/AppearanceControls';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
const RALLYHUB_LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

function score(matches, event) {
  let a=0,b=0;
  for (const m of matches.filter(x=>!x.is_showcase && ['completed','draw'].includes(x.status))) {
    if (m.winner === 'club_a') { a += Number(event.win_points ?? 2); b += Number(event.loss_points ?? 0); }
    else if (m.winner === 'club_b') { b += Number(event.win_points ?? 2); a += Number(event.loss_points ?? 0); }
    else { a += Number(event.draw_points ?? 1); b += Number(event.draw_points ?? 1); }
  }
  return {a,b};
}
function individualPerformance(matches=[], participants=[]) {
  const byId=new Map(participants.map(p=>[String(p.id),p]));
  const stats={};
  const ensure=(id,side)=>stats[id]||(stats[id]={id,side,games_played:0,points_for:0,points_against:0,wins:0,draws:0,losses:0,point_diff:0});
  for(const m of matches){
    if(m.is_showcase||!['completed','draw','retired','forfeit'].includes(m.status)) continue;
    const a=Number(m.score_a||0),b=Number(m.score_b||0);
    for(const rawId of (m.club_a_participant_ids||[])){const id=String(rawId);const p=byId.get(id);if(!p||p.side!=='club_a')continue;const s=ensure(id,'club_a');s.games_played++;s.points_for+=a;s.points_against+=b;if(m.winner==='club_a')s.wins++;else if(m.winner==='draw')s.draws++;else s.losses++;}
    for(const rawId of (m.club_b_participant_ids||[])){const id=String(rawId);const p=byId.get(id);if(!p||p.side!=='club_b')continue;const s=ensure(id,'club_b');s.games_played++;s.points_for+=b;s.points_against+=a;if(m.winner==='club_b')s.wins++;else if(m.winner==='draw')s.draws++;else s.losses++;}
  }
  Object.values(stats).forEach(s=>{s.point_diff=s.points_for-s.points_against;});
  return stats;
}
function podiumForSide(stats,participants,side){
  return participants.filter(p=>p.side===side&&stats[String(p.id)]?.games_played>0).map(p=>({...p,...stats[String(p.id)]})).sort((a,b)=>b.points_for-a.points_for||b.wins-a.wins||b.point_diff-a.point_diff||String(a.display_name||'').localeCompare(String(b.display_name||''),'en',{sensitivity:'base'})).slice(0,3);
}
function TeamPodiums({event,podiumA=[],podiumB=[]}){
  const medal=index=>index===0?'🥇':index===1?'🥈':'🥉';
  const place=index=>index===0?'1st':index===1?'2nd':'3rd';
  const sizeClass=index=>index===0?'min-h-40 sm:min-h-44 h-40 sm:h-44 px-3 py-4':index===1?'min-h-36 sm:min-h-40 h-36 sm:h-40 px-3 py-3.5':'min-h-32 sm:min-h-36 h-32 sm:h-36 px-3 py-3';
  const medalClass=index=>index===0?'text-4xl sm:text-5xl':index===1?'text-3xl sm:text-4xl':'text-2xl sm:text-3xl';
  const nameClass=index=>index===0?'text-base sm:text-lg':index===1?'text-sm sm:text-base':'text-sm';
  return <section className="mt-6 grid gap-4 md:grid-cols-2" data-testid="interclub-team-podiums">
    {[[event.club_a_name,event.club_a_primary_colour,podiumA],[event.club_b_name,event.club_b_primary_colour,podiumB]].map(([name,colour,podium])=><div key={name} className="rounded-2xl border bg-card p-4 sm:p-5" style={{borderTopWidth:'7px',borderTopColor:colour||'#2563eb'}}>
      <p className="text-center text-xs font-black uppercase tracking-[.18em] text-muted-foreground">{name} · Top 3</p>
      <div className="mt-4 grid grid-cols-3 gap-2 items-end">{podium.map((p,index)=><div key={p.id} className={`rounded-xl border bg-background/50 text-center flex flex-col justify-center ${sizeClass(index)}`}>
        <div className={medalClass(index)}>{medal(index)}</div><p className="mt-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-muted-foreground">{place(index)}</p><p className={`mt-1 font-black leading-tight ${nameClass(index)}`}>{p.display_name}</p><p className="mt-2 text-[10px] sm:text-[11px] text-muted-foreground">{p.points_for} pts · {p.wins}W · {p.point_diff>0?'+':''}{p.point_diff}</p>
      </div>)}</div>
    </div>)}
  </section>;
}
function fmt(seconds){ const s=Math.max(0,Number(seconds||0)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`; }
function getDeviceId() {
  const key='rallyhub-pot-device-id';
  try {
    let id=localStorage.getItem(key);
    if(!id){ id=window.crypto?.randomUUID?.() || `rh-${Date.now()}-${Math.random().toString(36).slice(2)}`; localStorage.setItem(key,id); }
    return id;
  } catch { return window.crypto?.randomUUID?.() || `rh-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
}
function isPublicBase44Pressure(errorOrResponse){
  const status=Number(errorOrResponse?.response?.status||errorOrResponse?.status||0);
  const message=String(errorOrResponse?.response?.data?.error||errorOrResponse?.data?.error||errorOrResponse?.message||'').toLowerCase();
  return [429,502,503,504].includes(status)||message.includes('rate limit')||message.includes('burst')||message.includes('threshold')||message.includes('too many requests')||message.includes('temporarily unavailable')||message.includes('server busy')||message.includes('overload')||((status===0||!status)&&typeof navigator!=='undefined'&&navigator.onLine!==false&&(message.includes('failed to fetch')||message.includes('network error')||message.includes('timeout')));
}
async function loadPublicDisplayWithBackoff(token){
  for(let attempt=0;;attempt+=1){
    try{
      const response=await base44.functions.invoke('getPublicClubChallengeDisplay',{token});
      if(response?.data?.error&&isPublicBase44Pressure(response)){const error=new Error(response.data.error);error.response={status:429,data:response.data};throw error;}
      return response;
    }catch(error){
      if(attempt>=3||!isPublicBase44Pressure(error)) throw error;
      const wait=Math.min(6000,650*(2**attempt))+Math.floor(Math.random()*900);
      await new Promise(resolve=>window.setTimeout(resolve,wait));
    }
  }
}
function PoweredByRallyHub(){ return <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/70"><span>Powered by</span><img src={RALLYHUB_LOGO_URL} alt="RallyHub" className="h-4 w-auto object-contain opacity-80"/></div>; }
function LiveEventBrand({ event, pageLabel='Live Event View' }){
  if(event?.host_club) return <RallyHubPublicBrand club={event.host_club} clubFirst moduleName="Interclub" pageLabel={pageLabel}/>;
  return <RallyHubPublicBrand moduleName="Interclub" pageLabel={pageLabel}/>;
}
function VotingPrompt({ onVote, countdown }){ return <div className="text-center"><p className="text-sm sm:text-lg font-black uppercase tracking-[.16em] text-primary">Players of the Tournament voting open</p><p className="mt-1 text-2xl sm:text-4xl font-black tabular-nums">{countdown}</p><p className="mt-1 text-xs sm:text-sm text-muted-foreground">Voting is built into this player link.</p><button type="button" onClick={onVote} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-sm">Vote now</button></div>; }

let spotPrizeAudioContext=null;
function getSpotPrizeAudio(){
  if(typeof window==='undefined') return null;
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx) return null;
  if(!spotPrizeAudioContext) spotPrizeAudioContext=new AudioCtx();
  if(spotPrizeAudioContext.state==='suspended') spotPrizeAudioContext.resume().catch(()=>{});
  return spotPrizeAudioContext;
}
function spotPrizeTick(){
  const ctx=getSpotPrizeAudio(); if(!ctx) return;
  const osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.type='triangle'; osc.frequency.value=220+Math.random()*180;
  gain.gain.setValueAtTime(0.0001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.08,ctx.currentTime+0.01); gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+0.07);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+0.08);
}
function spotPrizeFanfare(){
  const ctx=getSpotPrizeAudio(); if(!ctx) return;
  [523.25,659.25,783.99,1046.5].forEach((frequency,i)=>{
    const osc=ctx.createOscillator(), gain=ctx.createGain(), start=ctx.currentTime+i*0.11;
    osc.type='sine'; osc.frequency.value=frequency;
    gain.gain.setValueAtTime(0.0001,start); gain.gain.exponentialRampToValueAtTime(0.16,start+0.02); gain.gain.exponentialRampToValueAtTime(0.0001,start+0.32);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(start); osc.stop(start+0.34);
  });
}

export default function PublicClubChallengeDisplay(){
  const { token } = useParams();
  const [data,setData]=React.useState(null), [error,setError]=React.useState(''), [disconnected,setDisconnected]=React.useState(false), [now,setNow]=React.useState(Date.now()), [view,setView]=React.useState('live');
  const [drawFlash,setDrawFlash]=React.useState(1);
  const [drawSoundEnabled,setDrawSoundEnabled]=React.useState(false);
  const [updateExpanded,setUpdateExpanded]=React.useState(true);
  const lastSpotPrizeWinnerCountRef=React.useRef(0);
  const [voteA,setVoteA]=React.useState(''), [voteB,setVoteB]=React.useState(''), [voteSaving,setVoteSaving]=React.useState(false), [voteDone,setVoteDone]=React.useState(false), [voteError,setVoteError]=React.useState('');
  const [deviceId]=React.useState(getDeviceId);
  const voteSavingRef=React.useRef(false);
  const dataRef=React.useRef(null);
  const initialViewSetRef=React.useRef(false);
  const lastLoadAtRef=React.useRef(0);
  const loadInFlightRef=React.useRef(false);
  const pollJitterRef=React.useRef(Math.floor(Math.random()*6000));
  React.useEffect(()=>{ dataRef.current=data; },[data]);
  const load=React.useCallback(async()=>{
    if(loadInFlightRef.current) return;
    loadInFlightRef.current=true;
    try {
      const r=await loadPublicDisplayWithBackoff(token);
      if(r.data?.error) throw new Error(r.data.error);
      setData(r.data); dataRef.current=r.data; lastLoadAtRef.current=Date.now();
      if(!initialViewSetRef.current){ if(['draft','draw_generated','draw_approved'].includes(r.data?.event?.status)) setView('contact'); else if(['in_progress','paused'].includes(r.data?.event?.status)) setView('live'); else if(['completed','archived'].includes(r.data?.event?.status)) setView('live'); initialViewSetRef.current=true; }
      setError(''); setDisconnected(false);
    } catch(e){ if(dataRef.current) setDisconnected(true); else setError(e?.response?.data?.error||e?.message||'Display unavailable'); }
    finally { loadInFlightRef.current=false; }
  },[token]);
  const publicStatus=String(data?.event?.status||'');
  const publicSpotStatus=String(data?.event?.spot_prize_status||'');
  const publicPotOpen=data?.event?.pot_status==='open';
  const publicCompleted=['completed','archived'].includes(publicStatus);
  const publicPreEvent=['draft','draw_generated','draw_approved'].includes(publicStatus);
  const publicHasShowcase=!!data?.matches?.some(m=>m.is_showcase);
  const jitter=pollJitterRef.current;
  // Keep every player device de-synchronised and deliberately conservative with
  // Base44 reads. The prize drum itself animates locally at 110 ms; phones only
  // need a modest refresh while the server-side draw is genuinely in progress.
  const pollMs=publicSpotStatus==='drawing'
    ? 4500+(jitter%2500)
    : publicPotOpen
      ? 12000+(jitter%4000)
      : publicCompleted
        ? 60000+jitter
      : publicPreEvent
        ? 30000+jitter
        : publicHasShowcase
          ? 12000+(jitter%4000)
          : 18000+jitter;
  React.useEffect(()=>{
    load();
    const poll=setInterval(()=>{ if(document.visibilityState==='visible') load(); },pollMs);
    const tick=setInterval(()=>setNow(Date.now()),1000);
    const off=()=>setDisconnected(true);
    const refreshIfStale=()=>{ setDisconnected(false); setNow(Date.now()); if(Date.now()-lastLoadAtRef.current>8000) load(); };
    const visible=()=>{ if(document.visibilityState==='visible') refreshIfStale(); };
    window.addEventListener('offline',off); window.addEventListener('online',refreshIfStale); document.addEventListener('visibilitychange',visible);
    return()=>{clearInterval(poll);clearInterval(tick);window.removeEventListener('offline',off);window.removeEventListener('online',refreshIfStale);document.removeEventListener('visibilitychange',visible);};
  },[load,pollMs]);
  React.useEffect(()=>{
    if(data?.event?.spot_prize_status!=='drawing') return undefined;
    const max=Math.max(1,(data?.participants||[]).filter(p=>['club_a','club_b'].includes(p.side)).length);
    const id=setInterval(()=>{ setDrawFlash(1+Math.floor(Math.random()*max)); if(drawSoundEnabled) spotPrizeTick(); },110);
    return()=>clearInterval(id);
  },[data?.event?.spot_prize_status,data?.participants?.length,drawSoundEnabled]);
  React.useEffect(()=>{
    const count=Array.isArray(data?.event?.spot_prize_winners)?data.event.spot_prize_winners.length:0;
    if(drawSoundEnabled&&count>lastSpotPrizeWinnerCountRef.current) spotPrizeFanfare();
    lastSpotPrizeWinnerCountRef.current=count;
  },[data?.event?.spot_prize_winners?.length,drawSoundEnabled]);
  React.useEffect(()=>{ if(data?.event?.tournament_update?.published_at) setUpdateExpanded(true); },[data?.event?.tournament_update?.published_at]);
  if(error&&!data) return <div className="min-h-screen bg-background text-foreground grid place-items-center p-6 text-center"><div><WifiOff className="mx-auto mb-3"/><p className="font-semibold">{error}</p></div></div>;
  if(!data) return <div className="min-h-screen bg-background text-foreground grid place-items-center"><RefreshCw className="animate-spin"/></div>;
  const {event,matches,participants=[]}=data, s=score(matches,event), round=Number(event.current_round||1), plannedRounds=Number(event.planned_rounds||0);
  const showcase=matches.find(m=>m.is_showcase)||null, showcaseActive=!!showcase&&['scheduled','in_progress','completed'].includes(showcase.status);
  const current=matches.filter(m=>!m.is_showcase&&m.status!=='not_played'&&m.round_number===round).sort((a,b)=>Number(a.court_number||0)-Number(b.court_number||0)), next=matches.filter(m=>!m.is_showcase&&m.status!=='not_played'&&m.round_number===round+1&&(!plannedRounds||round+1<=plannedRounds)).sort((a,b)=>Number(a.court_number||0)-Number(b.court_number||0));
  const activeIds=new Set(current.flatMap(m=>[...(m.club_a_participant_ids||[]),...(m.club_b_participant_ids||[])]));
  const resting=participants.filter(p=>((!p.status||p.status==='active')||(p.status==='late'&&Number(p.available_from_round||1)<=round))&&!activeIds.has(p.id));
  const restingA=resting.filter(p=>p.side==='club_a');
  const restingB=resting.filter(p=>p.side==='club_b');
  let timer={}; try{timer=event.timer_state_json?JSON.parse(event.timer_state_json):{};}catch{}
  const remaining=timer.running&&timer.started_at?Math.max(0,Number(timer.remaining_seconds||0)-Math.floor((now-new Date(timer.started_at).getTime())/1000)):Number(timer.remaining_seconds||0);
  const scheduledBreakHere=!!event.include_break&&round===Number(event.break_after_round||0), breakActive=scheduledBreakHere&&String(timer.phase||'')==='break';
  const sideChangeRecent=!!showcase?.side_change_at&&(now-new Date(showcase.side_change_at).getTime())<20000;
  const potCloseMs=event.pot_vote_closes_at?Date.parse(event.pot_vote_closes_at):NaN;
  const potRemaining=Number.isFinite(potCloseMs)?Math.max(0,Math.ceil((potCloseMs-now)/1000)):null;
  const potOpen=!!event.pot_enabled&&event.pot_status==='open'&&(potRemaining===null||potRemaining>0);
  const potCountdown=potRemaining===null?'MANUAL CLOSE':`${Math.floor(potRemaining/60)}:${String(potRemaining%60).padStart(2,'0')}`;
  const votingToken=event.pot_voting_token||'';
  const potWinners=Array.isArray(event.pot_winners)?event.pot_winners:[];
  const potWinnersA=potWinners.filter(p=>p.side==='club_a');
  const potWinnersB=potWinners.filter(p=>p.side==='club_b');
  const awardLabel=event.pot_method==='points'?'Top Points Scorer':'Player of the Tournament';
  const awardRevealed=event.pot_status==='revealed'&&potWinners.length>0;
  const spotPrizeEnabled=!!event.spot_prize_enabled;
  const spotPrizeWinners=Array.isArray(event.spot_prize_winners)?event.spot_prize_winners:[];
  const spotPrizeMax=spotPrizeEnabled?(event.spot_prize_mode==='per_team'?Number(event.spot_prize_count||1)*2:Number(event.spot_prize_count||1)):0;
  const spotPrizeComplete=spotPrizeEnabled&&event.spot_prize_status==='completed';
  const spotPrizeDrawing=spotPrizeEnabled&&event.spot_prize_status==='drawing';
  const completed=['completed','archived'].includes(event.status);
  const preEvent=['draft','draw_generated'].includes(event.status);
  const finalTitle=s.a===s.b?'Interclub Draw':`${s.a>s.b?event.club_a_name:event.club_b_name} win the Interclub`;
  const performance=individualPerformance(matches,participants);
  const podiumA=podiumForSide(performance,participants,'club_a');
  const podiumB=podiumForSide(performance,participants,'club_b');
  const alphabeticalTeamSort=(a,b)=>String(a.display_name||'').localeCompare(String(b.display_name||''),'en',{sensitivity:'base'});
  const teamAPlayers=participants.filter(p=>p.side==='club_a').sort(alphabeticalTeamSort);
  const teamBPlayers=participants.filter(p=>p.side==='club_b').sort(alphabeticalTeamSort);
  const voteAPlayers=participants.filter(p=>p.side==='club_a'&&((p.roster_role||'rotation')!=='reserve'||p.reserve_activated)).sort(alphabeticalTeamSort);
  const voteBPlayers=participants.filter(p=>p.side==='club_b'&&((p.roster_role||'rotation')!=='reserve'||p.reserve_activated)).sort(alphabeticalTeamSort);
  const resultMatches=matches.filter(m=>!m.is_showcase&&['completed','draw','retired','forfeit','abandoned'].includes(m.status)).sort((a,b)=>Number(a.round_number)-Number(b.round_number)||Number(a.court_number)-Number(b.court_number));
  const resultRounds=[...new Set(resultMatches.map(m=>Number(m.round_number)))].sort((a,b)=>a-b);
  const courtsCount=Math.max(Number(event.courts||0),...matches.filter(m=>!m.is_showcase).map(m=>Number(m.court_number||0)),1);
  const eventFormat=event.normal_match_type==='points'
    ? `First to ${event.normal_target_points||11} · win by ${event.normal_win_by||1}`
    : `Timed rounds · ${event.play_minutes||0} minutes · ${event.timed_draws_allowed===false?'no draws':'draws allowed'}`;
  const playerLabel = p => {
    if (p.reserve_activated && p.replacement_effective_round) return `Joined from Round ${p.replacement_effective_round}`;
    if (['withdrawn','replaced'].includes(p.status) && p.replacement_effective_round) return `Played through Round ${Math.max(1, Number(p.replacement_effective_round)-1)}`;
    if ((p.roster_role||'rotation')==='reserve') return 'Reserve';
    return '';
  };
  const castIntegratedVote=async()=>{
    if(voteSavingRef.current||!potOpen||!votingToken||!voteA||!voteB) return;
    voteSavingRef.current=true; setVoteSaving(true); setVoteError('');
    try {
      const r=await base44.functions.invoke('castPublicClubChallengePotVote',{token:votingToken,clubANomineeParticipantId:voteA,clubBNomineeParticipantId:voteB,voterDeviceId:deviceId});
      if(r.data?.error) throw new Error(r.data.error);
      setVoteDone(true);
    } catch(e) {
      setVoteError(e?.response?.data?.error||e?.message||'Vote could not be recorded');
      await load();
    } finally { voteSavingRef.current=false; setVoteSaving(false); }
  };
  const playerNav=<div className="sticky top-2 z-30 mx-auto mb-4 flex w-full max-w-4xl items-center gap-1 overflow-x-auto rounded-full border border-border bg-background/95 p-1.5 shadow-lg backdrop-blur">{preEvent?<><button onClick={()=>setView('contact')} className={`shrink-0 min-h-10 rounded-full px-4 text-sm font-bold inline-flex items-center gap-1.5 ${view==='contact'?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}><MapPin className="w-4 h-4"/>Venue & Contact</button><button onClick={()=>setView('info')} className={`shrink-0 min-h-10 rounded-full px-4 text-sm font-bold inline-flex items-center gap-1.5 ${view==='info'?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}><Info className="w-4 h-4"/>Event Info</button><button onClick={()=>setView('teams')} className={`shrink-0 min-h-10 rounded-full px-4 text-sm font-bold inline-flex items-center gap-1.5 ${view==='teams'?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}><Users className="w-4 h-4"/>Teams</button></>:<><button onClick={()=>setView('live')} className={`shrink-0 min-h-10 rounded-full px-4 text-sm font-bold ${view==='live'?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}>{completed?'Final':'Live'}</button><button onClick={()=>setView('results')} className={`shrink-0 min-h-10 rounded-full px-4 text-sm font-bold inline-flex items-center gap-1.5 ${view==='results'?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}><ListChecks className="w-4 h-4"/>{completed?'Summary':'Results'}</button>{spotPrizeEnabled?<button onClick={()=>setView('draw')} className={`shrink-0 min-h-10 rounded-full px-4 text-sm font-bold inline-flex items-center gap-1.5 ${view==='draw'?'bg-primary text-primary-foreground':spotPrizeComplete?'text-muted-foreground hover:bg-secondary':'bg-primary/10 text-primary hover:bg-primary/20'}`}><Trophy className="w-4 h-4"/>Draw{spotPrizeComplete?' · Complete':''}</button>:event.pot_enabled?<button onClick={()=>setView('vote')} className={`shrink-0 min-h-10 rounded-full px-4 text-sm font-bold inline-flex items-center gap-1.5 ${view==='vote'?'bg-primary text-primary-foreground':potOpen?'bg-primary/10 text-primary hover:bg-primary/20':'text-muted-foreground hover:bg-secondary'}`}><Trophy className="w-4 h-4"/>{awardRevealed?'Awards':'Vote'}{potOpen?' · Open':''}</button>:null}{!completed&&<button onClick={()=>setView('info')} className={`shrink-0 min-h-10 rounded-full px-4 text-sm font-bold inline-flex items-center gap-1.5 ${view==='info'?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}><Info className="w-4 h-4"/>Event Info</button>}<button onClick={()=>setView('teams')} className={`shrink-0 min-h-10 rounded-full px-4 text-sm font-bold inline-flex items-center gap-1.5 ${view==='teams'?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}><Users className="w-4 h-4"/>Teams</button>{!completed&&<button onClick={()=>setView('contact')} className={`shrink-0 min-h-10 rounded-full px-4 text-sm font-bold inline-flex items-center gap-1.5 ${view==='contact'?'bg-primary text-primary-foreground':'hover:bg-secondary'}`}><MapPin className="w-4 h-4"/>Venue & Contact</button>}</>}</div>;

  const rawTournamentUpdate=event.tournament_update;
  const updateExpiry=rawTournamentUpdate?.expires_at?Date.parse(rawTournamentUpdate.expires_at):NaN;
  const tournamentUpdate=rawTournamentUpdate&&(!Number.isFinite(updateExpiry)||updateExpiry>now)&&!((rawTournamentUpdate.expiry_mode||'event_start')==='event_start'&&['in_progress','paused','completed','archived'].includes(event.status))?rawTournamentUpdate:null;
  const tournamentUpdatePanel=tournamentUpdate?.message?<section data-testid="interclub-tournament-update" className="mb-5 rounded-2xl border-2 border-amber-400 bg-amber-50 p-3 sm:p-4 text-amber-950 shadow-sm dark:bg-amber-950/30 dark:text-amber-100">
    <div className="flex items-start gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0"/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em]">{tournamentUpdate.title||'Tournament Update'}</p>{tournamentUpdate.published_at&&<p className="mt-1 text-[10px] opacity-70">Updated {new Date(tournamentUpdate.published_at).toLocaleString('en-IE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>}</div><button type="button" onClick={()=>setUpdateExpanded(v=>!v)} className="shrink-0 rounded-md border border-amber-500/40 bg-white/50 px-2.5 py-1 text-[11px] font-black hover:bg-white/80 dark:bg-black/10">{updateExpanded?'Hide':'Show update'}</button></div>{updateExpanded&&<p className="mt-2 whitespace-pre-line text-sm sm:text-base font-semibold leading-6">{tournamentUpdate.message}</p>}</div></div>
  </section>:null;

  const publicAwardPanel=awardRevealed?<section className="mt-6 rounded-3xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-8 text-center shadow-sm">
    <p className="text-xs sm:text-sm font-black uppercase tracking-[.22em] text-primary">{awardLabel}</p>
    <p className="mt-2 text-xs text-muted-foreground">{event.pot_method==='points'?'Highest points total from the completed Interclub rounds':'Voted winner from each team'}</p>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-6">
      {[[event.club_a_name,event.club_a_logo_url,event.club_a_primary_colour,event.club_a_secondary_colour,potWinnersA],[event.club_b_name,event.club_b_logo_url,event.club_b_primary_colour,event.club_b_secondary_colour,potWinnersB]].map(([name,logo,primary,secondary,winners])=><div key={name} className="rounded-2xl border bg-card p-4 sm:p-6" style={{borderTopWidth:'7px',borderTopColor:primary||'#2563eb',borderBottomWidth:'3px',borderBottomColor:secondary||primary||'#2563eb'}}>
        {logo&&<img src={logo} alt={`${name} logo`} className="mx-auto h-14 w-14 sm:h-20 sm:w-20 rounded-xl bg-white object-contain p-1.5"/>}
        <p className="mt-3 text-xs sm:text-sm text-muted-foreground">{name}</p>
        <p className="mt-2 text-xl sm:text-3xl font-black leading-tight">{winners[0]?.display_name||'Winner'}</p>
        {event.pot_method==='points'&&winners[0]&&<p className="mt-2 text-xs sm:text-sm font-semibold text-muted-foreground">{winners[0].points_for||0} points · {winners[0].games_played||0} games · {winners[0].wins||0} wins</p>}
      </div>)}
    </div>
  </section>:null;

  const publicSpotPrizePanel=spotPrizeEnabled?<section className="mt-6 rounded-3xl border-2 border-amber-500/35 bg-amber-500/5 p-5 sm:p-8 text-center"><p className="text-xs sm:text-sm font-black uppercase tracking-[.22em] text-amber-700 dark:text-amber-300">Spot Prize Draw</p><p className="mt-2 text-sm text-muted-foreground">Random names from the event roster · completely separate from match results.</p>{spotPrizeDrawing?<div className="mt-6"><div className="relative mx-auto h-48 w-48 sm:h-64 sm:w-64 rounded-full border-8 border-secondary bg-card grid place-items-center overflow-hidden"><div className="absolute inset-3 rounded-full border-4 border-dashed border-primary animate-spin"/><div className="absolute inset-10 rounded-full border bg-background grid place-items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-muted-foreground">Drawing</p><p className="mt-1 text-6xl sm:text-8xl font-black tabular-nums text-primary">{drawFlash}</p></div></div></div><p className="mt-4 text-lg sm:text-2xl font-black">Drum spinning…</p><p className="mt-1 text-sm text-muted-foreground">Prize {spotPrizeWinners.length+1} is being drawn</p></div>:spotPrizeWinners.length?<div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{spotPrizeWinners.map(w=><div key={`${w.pull}-${w.participant_id}`} className="rounded-2xl border bg-card p-4"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Prize {w.pull}</p><p className="mt-1 text-3xl font-black">#{w.number}</p><p className="mt-2 text-lg font-black">{w.display_name}</p><p className="text-xs text-muted-foreground">{w.team_name}</p></div>)}</div>:<div className="mt-5 rounded-xl border bg-card p-5"><p className="font-black">Waiting for the host to start the draw</p><p className="mt-1 text-sm text-muted-foreground">Keep this screen open. Winners will appear here automatically.</p></div>}<p className="mt-4 text-xs font-semibold text-muted-foreground">{spotPrizeComplete?'Spot Prize Draw complete':`${spotPrizeWinners.length} of ${spotPrizeMax} prizes drawn`}</p></section>:null;

  if(view==='contact' && !completed) {
    const rawPhone=String(event.event_contact_phone||'').trim();
    const telDigits=rawPhone.replace(/[^+\d]/g,'');
    const localDigits=rawPhone.replace(/\D/g,'');
    const whatsAppDigits=localDigits.startsWith('0')?`353${localDigits.slice(1)}`:localDigits;
    return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-40 h-10 px-2 sm:px-3"/>{playerNav}<div className="mx-auto max-w-3xl">{tournamentUpdatePanel}<LiveEventBrand event={event} pageLabel="Venue & Contact"/><h1 className="mt-4 text-center text-2xl sm:text-3xl font-black">Getting Here & Event Help</h1><p className="mt-1 text-center text-sm text-muted-foreground">Travel details and a direct contact if you need help on the day.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><section className="rounded-2xl border bg-card p-5"><div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary"/><div><h2 className="font-black">Venue</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{event.event_venue||'Venue to be confirmed'}</p>{event.event_map_url&&<a href={event.event_map_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Open in Google Maps</a>}</div></div></section><section className="rounded-2xl border bg-card p-5"><h2 className="font-black">Need help?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">If you have a question, are having difficulty finding the venue, or are running late, contact the event organiser.</p>{rawPhone?<div className="mt-4 grid gap-2 sm:grid-cols-2"><a href={`tel:${telDigits}`} className="inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-sm font-bold hover:bg-secondary">Call {rawPhone}</a><a href={`https://wa.me/${whatsAppDigits}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">WhatsApp</a></div>:<p className="mt-4 text-sm text-muted-foreground">Contact number to be confirmed.</p>}</section></div>{event.event_player_info&&<section className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-5"><div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary"/><div className="min-w-0 flex-1"><h2 className="font-black">When you arrive</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{event.event_player_info}</p>{['clare-v-galway','test-clare-v-galway-20261002'].includes(event.event_slug)&&<img src="https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/3e5dfe5f6_StJosephsGAAParkingEntrance.png" alt="Parking and sports hall entrance directions at St Joseph’s Doora Barefield GAA" className="mt-4 w-full rounded-xl border bg-background object-contain" loading="eager"/>}</div></div></section>}<section className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center"><p className="text-sm font-bold">{event.event_date?new Date(`${event.event_date}T12:00:00Z`).toLocaleDateString('en-IE',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'Event date'} · {event.event_start_time||'—'}{event.event_end_time?`–${event.event_end_time}`:''}</p></section><PoweredByRallyHub /></div></div>;
  }

  if(view==='info' && !completed) return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-40 h-10 px-2 sm:px-3"/>{playerNav}<div className="mx-auto max-w-5xl">{tournamentUpdatePanel}<LiveEventBrand event={event} pageLabel="Event Briefing & Rules"/><h1 className="mt-4 text-center text-2xl sm:text-3xl font-black">Interclub Event Information</h1><p className="mt-1 text-center text-sm text-muted-foreground">{event.club_a_name} vs {event.club_b_name}</p>
    <section className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5"><h2 className="text-center text-sm font-black uppercase tracking-[.14em] text-primary">When & Where</h2><div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm"><div className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold">Date</p><p className="text-muted-foreground">{event.event_date ? new Date(`${event.event_date}T12:00:00Z`).toLocaleDateString('en-IE',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}) : 'To be confirmed'}</p></div></div><div className="flex items-start gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold">Time</p><p className="text-muted-foreground">{event.event_start_time || '—'}{event.event_end_time ? `–${event.event_end_time}` : ''}</p></div></div><div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary"/><div><p className="font-bold">Venue</p><p className="text-muted-foreground">{event.event_venue || 'To be confirmed'}</p>{event.event_map_url&&<a href={event.event_map_url} target="_blank" rel="noreferrer" className="mt-1 inline-block font-bold text-primary underline underline-offset-2">Open in Google Maps</a>}</div></div></div></section>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl border bg-card p-5"><h2 className="text-lg font-black">1. Format</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm sm:text-base"><li>{preEvent&&!plannedRounds?`${courtsCount} courts · round schedule will be confirmed before play`:`${courtsCount} courts, ${plannedRounds} rounds`}</li><li>{preEvent?'Pairs will be pre-drawn and appear here when the event starts':'Pairs are pre-drawn and shown on the schedule'}</li><li>{eventFormat}</li><li>Interclub scoring: {event.win_points??2} points for a win{Number(event.draw_points??1)?`, ${event.draw_points??1} for a draw`:''}</li></ul></section>
      <section className="rounded-2xl border bg-card p-5"><h2 className="text-lg font-black">2. During the Event</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm sm:text-base"><li>Be ready when your court is called</li><li>Keep to the published schedule</li><li>Change over promptly at the end of each round</li><li>Report scores to the host / desk</li><li>Enjoy the event and good sportsmanship</li></ul></section>
      <section className="rounded-2xl border bg-card p-5"><h2 className="text-lg font-black">3. Break</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm sm:text-base">{event.include_break?<><li>{event.break_minutes}-minute break after Round {event.break_after_round}</li><li>The host may shorten or end the break if needed</li><li>Be ready for Round {Number(event.break_after_round||0)+1}</li></>:<li>No scheduled mid-event break</li>}</ul></section>
      <section className="rounded-2xl border bg-card p-5"><h2 className="text-lg font-black">4. Substitutions / Withdrawals</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm sm:text-base"><li>Tell the host immediately if you cannot continue</li><li>A reserve or approved replacement may be used</li><li>Future fixtures can be adjusted without changing completed results</li></ul></section>
      <section className="rounded-2xl border bg-card p-5 md:col-span-2"><h2 className="text-lg font-black">5. Showcase Final (if included)</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm sm:text-base"><li>Each team selects two players of its choice to represent the team</li><li>Host chooses 11 or 15, win by 1 or 2</li><li>Any two eligible players from each club may be selected</li><li>An exhibition Showcase does not change the Interclub result</li></ul></section>
    </div>
    <section className="mt-5 rounded-2xl border bg-card p-5 sm:p-6"><h2 className="text-xl font-black">Interclub Etiquette</h2><ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm sm:text-base"><li><b>Greet all participants</b> and show courtesy and respect throughout the event</li><li><b>No ball is worth a fall.</b> Call <b>“Ball!”</b> clearly if your ball goes onto another court</li><li>When you hear <b>“Ball!”</b>, stop play immediately and return the ball safely. Please do not hit or roll it back through a court while a game is in progress</li><li><b>Server:</b> announce the score clearly before every serve</li><li>Make <b>fair, clear and prompt line calls</b>. If in doubt, <b>it’s in</b></li><li><b>Respect the call.</b> Fair play and sportsmanship are at the heart of the game</li><li><b>No replays</b> unless a stray ball comes onto your court and interrupts play</li><li>Handle disagreements calmly. If assistance is needed, <b>raise your hand and call an official</b></li><li>The <b>winning team should report the result promptly</b> to the Tournament Desk</li><li>Treat the <b>venue, courts and equipment</b> with respect</li><li><b>Have fun and enjoy the competition. May the best team win!</b></li></ul></section>
    <PoweredByRallyHub />
  </div></div>;

  if(view==='draw'&&spotPrizeEnabled) return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-40 h-10 px-2 sm:px-3"/>{playerNav}<div className="mx-auto max-w-3xl"><LiveEventBrand event={event} pageLabel="Spot Prize Draw"/><h1 className="mt-4 text-center text-3xl sm:text-5xl font-black">Names Out of the Hat</h1><p className="mt-2 text-center text-sm text-muted-foreground">{event.spot_prize_mode==='per_team'?`${event.spot_prize_count} prize${Number(event.spot_prize_count)===1?'':'s'} per team`:`${event.spot_prize_count} prize${Number(event.spot_prize_count)===1?'':'s'} from all eligible players`}</p><div className="mt-4 flex justify-center"><button type="button" onClick={()=>{ getSpotPrizeAudio(); setDrawSoundEnabled(v=>!v); }} className={`min-h-11 rounded-md border px-4 py-2 text-sm font-bold ${drawSoundEnabled?'bg-primary text-primary-foreground':'bg-card hover:bg-secondary'}`}>{drawSoundEnabled?'Hall sound ON':'Enable hall sound on this device'}</button></div><p className="mt-2 text-center text-[11px] text-muted-foreground">Use sound only on the laptop / hall display connected to the speaker. Player phones stay silent unless they enable it themselves.</p>{publicSpotPrizePanel}<PoweredByRallyHub /></div></div>;

  if(view==='vote') return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-40 h-10 px-2 sm:px-3"/>{playerNav}<div className="mx-auto max-w-xl"><LiveEventBrand event={event} pageLabel={event.pot_method==='points'&&event.pot_status==='revealed'?'Team Player Awards':'Players of the Tournament Voting'}/><div className="mt-5 rounded-2xl border bg-card p-5 sm:p-7 shadow-sm">
    <Trophy className="mx-auto h-10 w-10 text-primary"/><h1 className="mt-2 text-center text-2xl font-black">{event.pot_method==='points'&&event.pot_status==='revealed'?'Top Points Scorers':'Players of the Tournament'}</h1><p className="mt-2 text-center text-sm text-muted-foreground">{event.pot_method==='points'&&event.pot_status==='revealed'?'One top points scorer from each team.':'Choose one player from each team when voting is open.'}</p>
    {voteError&&<div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{voteError}</div>}
    {voteDone?<div className="mt-6 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-primary"/><h2 className="mt-3 text-xl font-black">Votes recorded</h2><p className="mt-2 text-sm text-muted-foreground">Thank you. Your choices for both teams have been recorded.</p><button type="button" onClick={()=>setView(completed?'results':'live')} className="mt-5 min-h-11 rounded-md border px-5 py-2 text-sm font-bold hover:bg-secondary">Back to {completed?'Summary':'Live Event'}</button></div>:potOpen?<>
      <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">{potRemaining===null?<p className="text-sm font-bold">Voting is open until the host closes it</p>:<div className="flex items-center justify-center gap-2"><Clock3 className="h-4 w-4 text-primary"/><span className="text-sm font-bold">Voting closes in {potCountdown}</span></div>}<p className="mt-1 text-[11px] text-muted-foreground">One ballot per phone/browser for this Interclub.</p></div>
      <div className="mt-5 space-y-4">
        <label className="block rounded-xl border p-4"><span className="font-black">{event.club_a_name}</span><span className="mt-1 block text-xs text-muted-foreground">Choose one player</span><select value={voteA} onChange={e=>setVoteA(e.target.value)} className="mt-3 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Select player</option>{voteAPlayers.map(p=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select></label>
        <label className="block rounded-xl border p-4"><span className="font-black">{event.club_b_name}</span><span className="mt-1 block text-xs text-muted-foreground">Choose one player</span><select value={voteB} onChange={e=>setVoteB(e.target.value)} className="mt-3 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Select player</option>{voteBPlayers.map(p=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select></label>
      </div>
      <button type="button" onClick={castIntegratedVote} disabled={!voteA||!voteB||voteSaving} className="mt-5 min-h-12 w-full rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{voteSaving?'Recording…':'Submit My Votes'}</button><p className="mt-3 text-center text-xs text-muted-foreground">Votes remain private. Results stay hidden until the host reveals them.</p>
    </>:<div className="mt-6 rounded-xl bg-secondary p-5 text-center"><p className="font-black">{event.pot_status==='revealed'?(event.pot_method==='points'?'Highest scorers confirmed':'Voting has finished'):'Voting is currently closed'}</p><p className="mt-2 text-sm text-muted-foreground">{event.pot_status==='revealed'?(event.pot_method==='points'?'The host chose the score-based team award.':'The host has completed the Player of the Tournament vote.'):'Come back to this Vote tab when the host opens voting. You do not need another link.'}</p>{awardRevealed&&<p className="mt-3 text-xs font-semibold text-primary">Results have been revealed below.</p>}</div>}
  </div>{publicAwardPanel}{publicSpotPrizePanel}<PoweredByRallyHub /></div></div>;

  if(view==='teams') return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-40 h-10 px-2 sm:px-3"/>{playerNav}<div className="mx-auto max-w-5xl">{tournamentUpdatePanel}<LiveEventBrand event={event} pageLabel={completed?'Event Summary':'Live Event View'}/><h1 className="mt-4 text-center text-2xl sm:text-3xl font-black">Teams</h1><p className="mt-1 text-center text-sm text-muted-foreground">{completed?'Final team lists, including any substitutions':'Current team lists for this Interclub'}</p><div className="mt-6 grid md:grid-cols-2 gap-4">{[[event.club_a_name,event.club_a_logo_url,event.club_a_primary_colour,teamAPlayers],[event.club_b_name,event.club_b_logo_url,event.club_b_primary_colour,teamBPlayers]].map(([name,logo,colour,players])=><section key={name} className="rounded-2xl border bg-card p-4 sm:p-5" style={{borderTopWidth:'7px',borderTopColor:colour||'#2563eb'}}><div className="flex items-center gap-3">{logo&&<img src={logo} alt="" className="w-14 h-14 rounded-xl bg-white object-contain p-1"/>}<h2 className="text-xl font-black">{name}</h2></div><div className="mt-4 divide-y divide-border">{players.filter(p=>(p.roster_role||'rotation')!=='reserve'||p.reserve_activated||['withdrawn','replaced'].includes(p.status)).map(p=><div key={p.id} className="flex items-center justify-between gap-3 py-2.5"><span className="font-semibold">{p.display_name}</span>{playerLabel(p)&&<Badge variant="outline" className="shrink-0">{playerLabel(p)}</Badge>}</div>)}</div>{players.some(p=>(p.roster_role||'rotation')==='reserve'&&!p.reserve_activated)&&<div className="mt-4 rounded-lg bg-secondary/50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Reserves</p>{players.filter(p=>(p.roster_role||'rotation')==='reserve'&&!p.reserve_activated).map(p=><p key={p.id} className="mt-2 font-semibold">{p.display_name}</p>)}</div>}</section>)}</div></div><PoweredByRallyHub /></div>;

  if(view==='results') return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-40 h-10 px-2 sm:px-3"/>{playerNav}<div className="mx-auto max-w-5xl"><LiveEventBrand event={event} pageLabel={completed?'Event Summary':'Live Event View'}/><h1 className="mt-4 text-center text-2xl sm:text-3xl font-black">{completed?'Interclub Summary':'Match Results'}</h1><p className="mt-1 text-center text-sm text-muted-foreground">{completed?'Final result, team podiums and every completed match, round by round':'Completed results remain available throughout and after the event'}</p>{completed&&<section className="mt-6 rounded-2xl border bg-card p-4 sm:p-6"><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6"><div className="text-center"><p className="font-black text-base sm:text-xl">{event.club_a_name}</p></div><div className="text-center"><p className="text-xs uppercase tracking-widest text-muted-foreground">Final</p><p className="text-4xl sm:text-6xl font-black tabular-nums">{s.a}–{s.b}</p></div><div className="text-center"><p className="font-black text-base sm:text-xl">{event.club_b_name}</p></div></div><p className="mt-4 text-center text-xl sm:text-2xl font-black text-primary">{finalTitle}</p>{potOpen&&<div className="mt-4 text-center"><button type="button" onClick={()=>setView('vote')} className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">Vote for Players of the Tournament</button></div>}</section>}{completed&&<TeamPodiums event={event} podiumA={podiumA} podiumB={podiumB}/>} {publicAwardPanel}{publicSpotPrizePanel}<div className="mt-6 space-y-5">{resultRounds.length?resultRounds.map(roundNumber=><section key={roundNumber} className="rounded-2xl border bg-card overflow-hidden"><div className="border-b bg-secondary/50 px-4 py-3"><h2 className="font-black">Round {roundNumber}</h2></div><div className="divide-y divide-border">{resultMatches.filter(m=>Number(m.round_number)===roundNumber).map(m=><div key={m.id} className="p-4 grid sm:grid-cols-[70px_1fr_72px] items-center gap-2 sm:gap-4"><Badge variant="outline" className="w-fit">Court {m.court_number}</Badge><div className="text-sm sm:text-base"><b>{(m.club_a_names||[]).join(' & ')}</b><span className="mx-2 text-muted-foreground">vs</span><b>{(m.club_b_names||[]).join(' & ')}</b></div><div className="text-2xl font-black tabular-nums sm:text-right">{m.score_a ?? '–'}–{m.score_b ?? '–'}</div></div>)}</div></section>):<div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">No results saved yet.</div>}</div></div><PoweredByRallyHub /></div>;

  if(completed&&!showcaseActive) return <div className="min-h-screen bg-background text-foreground p-5 sm:p-10 flex flex-col"><AppearanceQuickButton className="fixed right-3 top-3 z-40 h-10 px-2 sm:px-3"/>{playerNav}<div className="flex-1 flex flex-col justify-center">
    {disconnected&&<div className="mb-4 rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known result.</div>}
    <div className="mx-auto w-full max-w-6xl text-center">
      <LiveEventBrand event={event}/><p className="mt-3 text-sm sm:text-lg uppercase tracking-[.28em] text-primary font-black">Final Result</p>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-10">
        <div className="order-2 sm:order-1 flex flex-col items-center gap-3 rounded-3xl border bg-card p-4 sm:p-5" style={{borderTopWidth:'8px',borderTopColor:event.club_a_primary_colour||'#2563eb',borderBottomWidth:'4px',borderBottomColor:event.club_a_secondary_colour||event.club_a_primary_colour||'#2563eb'}}>{event.club_a_logo_url&&<img src={event.club_a_logo_url} alt={`${event.club_a_name} logo`} className="w-24 h-24 sm:w-36 sm:h-36 object-contain rounded-2xl bg-white p-2"/>}<h2 className="text-2xl sm:text-5xl font-black">{event.club_a_name}</h2></div>
        <div className="order-1 col-span-2 sm:order-2 sm:col-span-1"><p className="text-xs sm:text-base uppercase tracking-widest text-muted-foreground">FINAL</p><p className="mt-2 text-6xl sm:text-9xl font-black tabular-nums text-primary">{s.a}–{s.b}</p></div>
        <div className="order-3 sm:order-3 flex flex-col items-center gap-3 rounded-3xl border bg-card p-4 sm:p-5" style={{borderTopWidth:'8px',borderTopColor:event.club_b_primary_colour||'#7f1d1d',borderBottomWidth:'4px',borderBottomColor:event.club_b_secondary_colour||event.club_b_primary_colour||'#7f1d1d'}}>{event.club_b_logo_url&&<img src={event.club_b_logo_url} alt={`${event.club_b_name} logo`} className="w-24 h-24 sm:w-36 sm:h-36 object-contain rounded-2xl bg-white p-2"/>}<h2 className="text-2xl sm:text-5xl font-black">{event.club_b_name}</h2></div>
      </div>
      <div className="mt-7 flex flex-col items-center gap-3"><div className="text-3xl sm:text-4xl" aria-hidden="true">🎈🎉🏆🎉🎈</div><p className="text-3xl sm:text-5xl font-black text-primary">{finalTitle}</p><p className="text-sm sm:text-base font-bold text-muted-foreground">Congratulations to the winning team</p></div>
      <TeamPodiums event={event} podiumA={podiumA} podiumB={podiumB}/>
      <PoweredByRallyHub />
    </div></div>
  </div>;

  if(showcaseActive) return <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 flex flex-col"><AppearanceQuickButton className="fixed right-3 top-3 z-40 h-10 px-2 sm:px-3"/>{playerNav}
    {disconnected&&<div className="mb-3 rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known score. RallyHub will resynchronise automatically.</div>}
    {potOpen&&<div className="mb-3 rounded-2xl border-2 border-primary/40 bg-primary/10 px-4 py-3"><VotingPrompt onVote={()=>setView('vote')} countdown={potCountdown} /></div>}
    <header className="text-center shrink-0">
      <LiveEventBrand event={event}/><p className="mt-2 text-xs sm:text-sm uppercase tracking-[.28em] text-primary font-black">Showcase Final</p>
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
    {event.pot_status==='revealed'&&potWinners.length>0&&<div className="shrink-0 mt-3 rounded-2xl border border-primary/30 bg-card px-4 py-4 text-center"><p className="text-xs uppercase tracking-[.18em] text-primary font-black">{awardLabel}</p><p className="mt-2 text-lg sm:text-2xl font-black">{event.club_a_name}: {potWinnersA.map(p=>p.display_name).join(' & ')} · {event.club_b_name}: {potWinnersB.map(p=>p.display_name).join(' & ')}</p></div>}
    <PoweredByRallyHub />
  </div>;

  return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 space-y-6"><AppearanceQuickButton className="fixed right-3 top-3 z-40 h-10 px-2 sm:px-3"/>{playerNav}
    {tournamentUpdatePanel}
    {disconnected&&<div className="sticky top-2 z-20 rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — showing last known state. RallyHub will resynchronise automatically.</div>}
    <header className="text-center"><LiveEventBrand event={event}/><div className="mt-3 grid grid-cols-2 sm:grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-8"><div className="order-2 sm:order-1 flex items-center justify-center sm:justify-end gap-2 sm:gap-3 min-w-0 rounded-2xl border bg-card px-2 sm:px-3 py-2" style={{borderTopWidth:'6px',borderTopColor:event.club_a_primary_colour||'#2563eb',borderBottomWidth:'3px',borderBottomColor:event.club_a_secondary_colour||event.club_a_primary_colour||'#2563eb'}}>{event.club_a_logo_url&&<img src={event.club_a_logo_url} alt="" className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl bg-white object-contain p-1"/>}<span className="text-lg sm:text-4xl font-black truncate">{event.club_a_name}</span></div><div className="order-1 col-span-2 sm:order-2 sm:col-span-1 flex items-center justify-center gap-2 sm:gap-3 py-1"><span className="text-5xl sm:text-7xl font-black tabular-nums whitespace-nowrap" style={{color:event.club_a_primary_colour||'#2563eb'}}>{s.a}</span><span className="text-4xl sm:text-6xl font-black text-muted-foreground">–</span><span className="text-5xl sm:text-7xl font-black tabular-nums whitespace-nowrap" style={{color:event.club_b_primary_colour||'#7f1d1d'}}>{s.b}</span></div><div className="order-3 sm:order-3 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 min-w-0 rounded-2xl border bg-card px-2 sm:px-3 py-2" style={{borderTopWidth:'6px',borderTopColor:event.club_b_primary_colour||'#7f1d1d',borderBottomWidth:'3px',borderBottomColor:event.club_b_secondary_colour||event.club_b_primary_colour||'#7f1d1d'}}><span className="text-lg sm:text-4xl font-black truncate">{event.club_b_name}</span>{event.club_b_logo_url&&<img src={event.club_b_logo_url} alt="" className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl bg-white object-contain p-1"/>}</div></div><div className="flex justify-center gap-2 mt-4"><Badge className={breakActive?'bg-red-600 text-white':''} variant={breakActive?'default':'outline'}>{breakActive?'BREAK':plannedRounds?`Round ${round}/${plannedRounds}`:`Round ${round}`}</Badge><Badge variant="outline">{String(timer.phase||'idle').toUpperCase()}</Badge><Badge className="text-lg tabular-nums">{fmt(remaining)}</Badge></div></header>
    {potOpen&&<div className="rounded-2xl border-2 border-primary/40 bg-primary/10 p-4"><VotingPrompt onVote={()=>setView('vote')} countdown={potCountdown}/></div>}
    {publicAwardPanel}
    {scheduledBreakHere&&!breakActive&&<div className="rounded-xl border-2 border-red-500 bg-red-600 p-5 text-center text-white shadow-xl"><p className="text-xl sm:text-3xl font-black uppercase tracking-wider">Break after this round · {event.break_minutes} minutes</p><p className="mt-2 text-sm sm:text-base text-white/90">Round {round+1} will wait until the scheduled break is finished or the host ends it early.</p></div>}
    {breakActive&&<div className="rounded-xl border-2 border-red-400 bg-red-600 p-6 text-center text-white shadow-xl"><p className="text-xl sm:text-3xl font-black uppercase tracking-[.2em]">Break now</p><p className="mt-3 text-6xl sm:text-8xl font-black tabular-nums">{fmt(remaining)}</p><p className="mt-3 text-sm sm:text-lg text-white/90">Enjoy the break · Round {round+1} is up next</p></div>}
    {showcaseActive&&<section className="rounded-2xl border-2 border-primary/40 bg-card p-5 sm:p-8 text-center shadow-lg"><div className="flex flex-wrap justify-center gap-2"><Badge>{showcase.showcase_mode==='exhibition'?'OPTIONAL SHOWCASE · EXHIBITION':'SHOWCASE TIEBREAK'}</Badge><Badge variant="outline">First to {showcase.showcase_target_points||11} · win by {showcase.showcase_win_by||1}</Badge></div><p className="mt-5 text-lg sm:text-2xl font-bold">{(showcase.club_a_names||[]).join(' & ')}</p><p className="my-2 text-xs uppercase tracking-widest text-muted-foreground">vs</p><p className="text-lg sm:text-2xl font-bold">{(showcase.club_b_names||[]).join(' & ')}</p><p className="mt-6 text-7xl sm:text-9xl font-black tabular-nums text-primary">{showcase.score_a??0} – {showcase.score_b??0}</p>{sideChangeRecent&&<div className="mt-6 rounded-xl bg-red-600 px-4 py-4 text-2xl sm:text-4xl font-black text-white">CHANGE ENDS</div>}{showcase.status==='completed'&&<p className="mt-5 text-xl font-bold">{showcase.winner==='club_a'?event.club_a_name:event.club_b_name} won the Showcase {showcase.score_a}–{showcase.score_b}</p>}{showcase.showcase_mode==='exhibition'&&<p className="mt-3 text-sm text-muted-foreground">Exhibition only · the Interclub result above is unchanged</p>}</section>}
    {!breakActive&&!showcaseActive&&<section><h2 className="text-lg font-bold mb-3">On Court Now</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{current.map(m=><div key={m.id} className="rounded-xl border border-border bg-card p-4"><p className="font-bold mb-3">Court {m.court_number}</p><div className="space-y-2"><div className="rounded-lg border-l-4 px-3 py-2" style={{borderLeftColor:event.club_a_primary_colour||'#2563eb',background:`${event.club_a_primary_colour||'#2563eb'}12`}}><p className="text-[11px] font-black uppercase tracking-wide" style={{color:event.club_a_primary_colour||'#2563eb'}}>{event.club_a_name}</p><p className="mt-1 font-semibold">{m.club_a_names.join(' & ')}</p></div><div className="rounded-lg border-l-4 px-3 py-2" style={{borderLeftColor:event.club_b_primary_colour||'#7f1d1d',background:`${event.club_b_primary_colour||'#7f1d1d'}12`}}><p className="text-[11px] font-black uppercase tracking-wide" style={{color:event.club_b_primary_colour||'#7f1d1d'}}>{event.club_b_name}</p><p className="mt-1 font-semibold">{m.club_b_names.join(' & ')}</p></div></div>{['completed','draw'].includes(m.status)&&<p className="text-xl font-bold text-primary mt-3 text-center">{m.score_a} – {m.score_b}</p>}</div>)}</div></section>}
    {!breakActive&&!showcaseActive&&resting.length>0&&<section className="rounded-xl border border-border bg-card/70 p-4"><h2 className="text-lg font-bold">Resting This Round</h2><div className="mt-3 grid gap-3 md:grid-cols-2"><div className="rounded-xl border p-3" style={{borderTopWidth:'4px',borderTopColor:event.club_a_primary_colour||'#2563eb'}}><p className="text-sm font-black" style={{color:event.club_a_primary_colour||'#2563eb'}}>{event.club_a_name}</p><div className="mt-2 flex flex-wrap gap-2">{restingA.map(p=><span key={p.id} className="rounded-full border px-3 py-1.5 text-sm font-medium" style={{borderColor:event.club_a_primary_colour||'#2563eb',background:`${event.club_a_primary_colour||'#2563eb'}10`}}>{p.display_name}</span>)}</div></div><div className="rounded-xl border p-3" style={{borderTopWidth:'4px',borderTopColor:event.club_b_primary_colour||'#7f1d1d'}}><p className="text-sm font-black" style={{color:event.club_b_primary_colour||'#7f1d1d'}}>{event.club_b_name}</p><div className="mt-2 flex flex-wrap gap-2">{restingB.map(p=><span key={p.id} className="rounded-full border px-3 py-1.5 text-sm font-medium" style={{borderColor:event.club_b_primary_colour||'#7f1d1d',background:`${event.club_b_primary_colour||'#7f1d1d'}10`}}>{p.display_name}</span>)}</div></div></div></section>}
    {!showcaseActive&&next.length>0&&<section><h2 className="text-lg font-bold mb-3">{breakActive?'After the Break':'Up Next'} · Round {round+1}</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{next.map(m=><div key={m.id} className="rounded-xl bg-secondary/50 p-3 text-sm"><b>Court {m.court_number}</b><div className="mt-2 space-y-1.5"><div className="rounded-md border-l-4 px-2 py-1.5" style={{borderLeftColor:event.club_a_primary_colour||'#2563eb',background:`${event.club_a_primary_colour||'#2563eb'}10`}}><span className="block text-[10px] font-black uppercase" style={{color:event.club_a_primary_colour||'#2563eb'}}>{event.club_a_name}</span><span>{m.club_a_names.join(' & ')}</span></div><div className="rounded-md border-l-4 px-2 py-1.5" style={{borderLeftColor:event.club_b_primary_colour||'#7f1d1d',background:`${event.club_b_primary_colour||'#7f1d1d'}10`}}><span className="block text-[10px] font-black uppercase" style={{color:event.club_b_primary_colour||'#7f1d1d'}}>{event.club_b_name}</span><span>{m.club_b_names.join(' & ')}</span></div></div></div>)}</div></section>}
    {event.junior_display_mode&&<p className="text-center text-xs text-muted-foreground">Junior privacy mode · surnames abbreviated.</p>}
    <PoweredByRallyHub />
  </div>;
}