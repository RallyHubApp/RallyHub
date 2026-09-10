import React,{useEffect,useMemo,useRef,useState} from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown,RefreshCw,WifiOff,CheckCircle2,LockKeyhole,Pencil,X } from 'lucide-react';

function msg(e){return e?.response?.data?.error||e?.data?.error||e?.message||'Scorer link error';}
function fmt(v){const n=Math.max(0,Number(v||0));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;}
function getClientId(){const key='rallyhub-kotc-scorer-client';let id=sessionStorage.getItem(key);if(!id){id=`scorer_${crypto.randomUUID().replaceAll('-','')}`;sessionStorage.setItem(key,id);}return id;}

function CourtScore({match,session,token,clientId,onSaved}){
 const [a,setA]=useState(match.team_a_score??''),[b,setB]=useState(match.team_b_score??''),[serving,setServing]=useState(''),[saving,setSaving]=useState(false),[editing,setEditing]=useState(false),[locked,setLocked]=useState(match.lock_status==='mine'),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const heartbeat=useRef(null);
 const saved=['completed','retired','abandoned','not_played'].includes(match.status);
 const blocked=match.lock_status==='other'&&!locked;
 useEffect(()=>{if(!editing){setA(match.team_a_score??'');setB(match.team_b_score??'');setServing(match.serving_side_at_horn||'');}setLocked(match.lock_status==='mine');},[match.id,match.revision,match.team_a_score,match.team_b_score,match.serving_side_at_horn,match.lock_status]);
 useEffect(()=>{if(!locked){clearInterval(heartbeat.current);heartbeat.current=null;return;}heartbeat.current=setInterval(async()=>{try{await base44.functions.invoke('kotcScorer',{action:'heartbeat',token,matchId:match.id,clientId});}catch{setLocked(false);setEditing(false);setError('Your court edit lock expired. Tap Score/Edit again.');}},30000);return()=>{clearInterval(heartbeat.current);heartbeat.current=null;};},[locked,match.id,token,clientId]);
 const claim=async(forCorrection=false)=>{setError('');setNotice('');try{const r=await base44.functions.invoke('kotcScorer',{action:'claim',token,matchId:match.id,clientId});if(r.data?.error)throw new Error(r.data.error);setLocked(true);setEditing(true);setA(match.team_a_score??'');setB(match.team_b_score??'');setServing(match.serving_side_at_horn||'');setNotice(forCorrection?'Score unlocked for correction':'Court locked to this device');}catch(e){setError(msg(e));await onSaved();}};
 const release=async()=>{try{await base44.functions.invoke('kotcScorer',{action:'release',token,matchId:match.id,clientId});}catch{}setLocked(false);setEditing(false);setA(match.team_a_score??'');setB(match.team_b_score??'');setNotice('');await onSaved();};
 const submit=async()=>{if(!locked)return;if(session.scoring_mode==='timed'&&a!==''&&b!==''&&Number(a)===Number(b)&&!serving){setError('Choose which team was serving at the horn before saving a tied timed game.');return;}setSaving(true);setError('');setNotice('');try{const r=await base44.functions.invoke('kotcScorer',{action:saved?'correct':'save',token,matchId:match.id,clientId,expectedRevision:match.revision,teamAScore:Number(a),teamBScore:Number(b),servingSideAtHorn:Number(a)===Number(b)?serving:undefined});if(r.data?.error)throw new Error(r.data.error);setLocked(false);setEditing(false);setNotice(r.data?.message||'Score saved');await onSaved();}catch(e){setError(msg(e));await onSaved();}finally{setSaving(false);}};
 const canInput=editing&&locked&&!blocked;
 return <div className={`rounded-xl border bg-card p-4 space-y-3 ${locked?'ring-2 ring-primary/30 border-primary/50':''}`} data-testid={`scorer-court-${match.court}`}>
  <div className="flex items-center justify-between"><div className="flex items-center gap-2">{match.court===1&&<Crown className="w-4 h-4 text-yellow-400"/>}<b>Court {match.court}</b></div><Badge variant="outline">{blocked?'LOCKED':saved?'SAVED':locked?'EDITING':String(match.status||'').toUpperCase()}</Badge></div>
  {blocked&&<div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2 text-xs text-amber-600 flex gap-2 items-center"><LockKeyhole className="w-4 h-4 shrink-0"/>Another scorer is editing this court. It will unlock automatically if their device stops responding.</div>}
  <div className="grid grid-cols-[1fr_84px] gap-3 items-center"><span>{match.team_a.join(' & ')}</span><Input type="number" min="0" className="h-12 text-center text-lg font-bold" value={a} disabled={!canInput||saving} onChange={e=>setA(e.target.value)}/></div>
  <div className="grid grid-cols-[1fr_84px] gap-3 items-center"><span>{match.team_b.join(' & ')}</span><Input type="number" min="0" className="h-12 text-center text-lg font-bold" value={b} disabled={!canInput||saving} onChange={e=>setB(e.target.value)}/></div>
  {canInput&&session.scoring_mode==='timed'&&a!==''&&b!==''&&Number(a)===Number(b)&&<div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2"><p className="text-xs font-semibold mb-1">Tie at the horn — who was serving?</p><Select value={serving} onValueChange={setServing}><SelectTrigger><SelectValue placeholder="Choose serving team"/></SelectTrigger><SelectContent><SelectItem value="A">Team A serving at horn</SelectItem><SelectItem value="B">Team B serving at horn</SelectItem></SelectContent></Select></div>}
  {notice&&<div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2 text-sm font-semibold text-green-600 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/>{notice}</div>}
  {saved&&!editing&&<div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2 text-center text-sm font-semibold text-green-600">✓ Score saved: {match.team_a_score}–{match.team_b_score}</div>}
  {!saved&&!editing&&!blocked&&<Button className="w-full min-h-12" onClick={()=>claim(false)}><LockKeyhole className="w-4 h-4 mr-2"/>Score This Court</Button>}
  {saved&&!editing&&!blocked&&<Button variant="outline" className="w-full min-h-11" onClick={()=>claim(true)}><Pencil className="w-4 h-4 mr-2"/>Undo / Update Score</Button>}
  {editing&&<div className="grid grid-cols-2 gap-2"><Button className="min-h-12" onClick={submit} disabled={saving||a===''||b===''||(session.scoring_mode==='timed'&&Number(a)===Number(b)&&!serving)}>{saving?'Saving…':saved?'Save Updated Score':'Save Result'}</Button><Button variant="outline" className="min-h-12" onClick={release} disabled={saving}><X className="w-4 h-4 mr-1"/>Cancel</Button></div>}
  {error&&<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">{error}</div>}
 </div>;
}

export default function PublicKotcScorer(){
 const {token}=useParams();const clientId=useMemo(()=>getClientId(),[]);const [data,setData]=useState(null),[error,setError]=useState(''),[offline,setOffline]=useState(false),[now,setNow]=useState(Date.now());
 const dataRef=useRef(null);useEffect(()=>{dataRef.current=data;},[data]);
 const load=async()=>{try{const r=await base44.functions.invoke('kotcScorer',{action:'state',token,clientId});if(r.data?.error)throw new Error(r.data.error);setData(r.data);setError('');setOffline(false);}catch(e){if(dataRef.current)setOffline(true);else setError(msg(e));}};
 useEffect(()=>{load();const p=setInterval(load,2500),t=setInterval(()=>setNow(Date.now()),1000);const off=()=>setOffline(true),on=()=>{setOffline(false);load();};window.addEventListener('offline',off);window.addEventListener('online',on);window.addEventListener('focus',load);return()=>{clearInterval(p);clearInterval(t);window.removeEventListener('offline',off);window.removeEventListener('online',on);window.removeEventListener('focus',load);};},[token]);
 if(error&&!data)return <div className="min-h-screen bg-background grid place-items-center p-4"><div className="glass rounded-xl p-5 max-w-md"><h1 className="font-bold">Scorer link unavailable</h1><p className="text-sm text-muted-foreground mt-2">{error}</p></div></div>;
 if(!data)return <div className="min-h-screen bg-background grid place-items-center"><RefreshCw className="animate-spin"/></div>;
 const t=data.timer||{};const remaining=t.running&&t.deadlineAt?Math.max(0,Math.ceil((Date.parse(t.deadlineAt)-now)/1000)):Number(t.remainingSeconds||0);const live=data.session.status==='in_progress'&&data.round?.status==='started';const allSaved=(data.matches||[]).length>0&&(data.matches||[]).every(m=>['completed','retired','abandoned','not_played'].includes(m.status));
 return <div className="min-h-screen bg-background p-3 sm:p-5"><main className="max-w-4xl mx-auto space-y-4">
  {offline&&<div className="rounded-lg bg-yellow-500 text-black p-3 text-center font-semibold"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — do not submit until reconnected.</div>}
  <header className="glass rounded-xl p-4 text-center"><p className="text-[10px] uppercase tracking-[.2em] text-primary font-bold">KOTC Scorer</p><h1 className="text-xl font-bold mt-1">{data.session.name}</h1><div className="flex gap-2 justify-center mt-3"><Badge variant="outline">Round {data.session.current_round_number||'-'}</Badge><Badge variant="outline">{live?'LIVE':String(data.round?.status||data.session.status).replaceAll('_',' ').toUpperCase()}</Badge>{data.session.scoring_mode==='timed'&&<Badge className="tabular-nums">{fmt(remaining)}</Badge>}</div><p className="text-xs text-muted-foreground mt-3">Scorers can enter and correct current-round results only. The host controls players, bench, pairs, timer and round progression.</p></header>
  {allSaved&&live&&<div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center"><p className="font-bold text-green-600">✓ All court scores saved</p><p className="text-xs text-muted-foreground mt-1">Check your score now if needed. The session is waiting for the host to review and prepare the next round.</p></div>}
  {data.bench?.length>0&&<div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3"><p className="text-[10px] uppercase text-amber-500 font-bold">Bench</p><p className="text-sm mt-1">{data.bench.join(' · ')}</p></div>}
  {!live&&<div className="glass rounded-xl p-4 text-center text-sm text-muted-foreground">Waiting for the host to start the round. This page updates automatically.</div>}
  <div className="grid lg:grid-cols-2 gap-4">{(data.matches||[]).map(m=><CourtScore key={m.id} match={m} session={data.session} token={token} clientId={clientId} onSaved={load}/>)}</div>
 </main></div>;
}