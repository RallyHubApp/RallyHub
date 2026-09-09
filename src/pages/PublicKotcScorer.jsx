import React,{useEffect,useState} from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown,RefreshCw,WifiOff,CheckCircle2 } from 'lucide-react';

function msg(e){return e?.response?.data?.error||e?.data?.error||e?.message||'Scorer link error';}
function fmt(v){const n=Math.max(0,Number(v||0));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;}
function CourtScore({match,session,token,onSaved}){
 const [a,setA]=useState(match.team_a_score??''),[b,setB]=useState(match.team_b_score??''),[serving,setServing]=useState('A'),[saving,setSaving]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setA(match.team_a_score??'');setB(match.team_b_score??'');setError('');},[match.id,match.revision,match.team_a_score,match.team_b_score]);
 const saved=['completed','retired','abandoned','not_played'].includes(match.status);
 const submit=async()=>{setSaving(true);setError('');try{const r=await base44.functions.invoke('kotcScorer',{action:'save',token,matchId:match.id,expectedRevision:match.revision,teamAScore:Number(a),teamBScore:Number(b),servingSideAtHorn:Number(a)===Number(b)?serving:undefined});if(r.data?.error)throw new Error(r.data.error);await onSaved();}catch(e){setError(msg(e));await onSaved();}finally{setSaving(false);}};
 return <div className="rounded-xl border bg-card p-4 space-y-3" data-testid={`scorer-court-${match.court}`}>
  <div className="flex items-center justify-between"><div className="flex items-center gap-2">{match.court===1&&<Crown className="w-4 h-4 text-yellow-400"/>}<b>Court {match.court}</b></div><Badge variant="outline">{saved?'SAVED':String(match.status||'').toUpperCase()}</Badge></div>
  <div className="grid grid-cols-[1fr_84px] gap-3 items-center"><span>{match.team_a.join(' & ')}</span><Input type="number" min="0" className="h-12 text-center text-lg font-bold" value={a} disabled={saved||saving} onChange={e=>setA(e.target.value)}/></div>
  <div className="grid grid-cols-[1fr_84px] gap-3 items-center"><span>{match.team_b.join(' & ')}</span><Input type="number" min="0" className="h-12 text-center text-lg font-bold" value={b} disabled={saved||saving} onChange={e=>setB(e.target.value)}/></div>
  {!saved&&session.scoring_mode==='timed'&&a!==''&&b!==''&&Number(a)===Number(b)&&<Select value={serving} onValueChange={setServing}><SelectTrigger><SelectValue placeholder="Serving side at horn"/></SelectTrigger><SelectContent><SelectItem value="A">Team A serving at horn</SelectItem><SelectItem value="B">Team B serving at horn</SelectItem></SelectContent></Select>}
  {saved?<div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2 text-sm text-green-500 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/>Result saved {match.team_a_score}–{match.team_b_score}</div>:<Button className="w-full min-h-12" onClick={submit} disabled={saving||a===''||b===''}>{saving?'Saving…':'Save Result'}</Button>}
  {error&&<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">{error}</div>}
 </div>;
}
export default function PublicKotcScorer(){
 const {token}=useParams();const [data,setData]=useState(null),[error,setError]=useState(''),[offline,setOffline]=useState(false),[now,setNow]=useState(Date.now());
 const load=async()=>{try{const r=await base44.functions.invoke('kotcScorer',{action:'state',token});if(r.data?.error)throw new Error(r.data.error);setData(r.data);setError('');setOffline(false);}catch(e){if(data)setOffline(true);else setError(msg(e));}};
 useEffect(()=>{load();const p=setInterval(load,2500),t=setInterval(()=>setNow(Date.now()),1000);const off=()=>setOffline(true),on=()=>{setOffline(false);load();};window.addEventListener('offline',off);window.addEventListener('online',on);window.addEventListener('focus',load);return()=>{clearInterval(p);clearInterval(t);window.removeEventListener('offline',off);window.removeEventListener('online',on);window.removeEventListener('focus',load);};},[token]);
 if(error&&!data)return <div className="min-h-screen bg-background grid place-items-center p-4"><div className="glass rounded-xl p-5 max-w-md"><h1 className="font-bold">Scorer link unavailable</h1><p className="text-sm text-muted-foreground mt-2">{error}</p></div></div>;
 if(!data)return <div className="min-h-screen bg-background grid place-items-center"><RefreshCw className="animate-spin"/></div>;
 const t=data.timer||{};const remaining=t.running&&t.deadlineAt?Math.max(0,Math.ceil((Date.parse(t.deadlineAt)-now)/1000)):Number(t.remainingSeconds||0);const live=data.session.status==='in_progress'&&data.round?.status==='started';
 return <div className="min-h-screen bg-background p-3 sm:p-5"><main className="max-w-4xl mx-auto space-y-4">
  {offline&&<div className="rounded-lg bg-yellow-500 text-black p-3 text-center font-semibold"><WifiOff className="inline w-4 h-4 mr-2"/>Connection lost — do not submit until reconnected.</div>}
  <header className="glass rounded-xl p-4 text-center"><p className="text-[10px] uppercase tracking-[.2em] text-primary font-bold">KOTC Scorer</p><h1 className="text-xl font-bold mt-1">{data.session.name}</h1><div className="flex gap-2 justify-center mt-3"><Badge variant="outline">Round {data.session.current_round_number||'-'}</Badge><Badge variant="outline">{live?'LIVE':String(data.round?.status||data.session.status).replaceAll('_',' ').toUpperCase()}</Badge>{data.session.scoring_mode==='timed'&&<Badge className="tabular-nums">{fmt(remaining)}</Badge>}</div><p className="text-xs text-muted-foreground mt-3">Scorer access can save current-round results only. Player changes, timer, draw, corrections and session controls remain with the host.</p></header>
  {data.bench?.length>0&&<div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3"><p className="text-[10px] uppercase text-amber-500 font-bold">Bench</p><p className="text-sm mt-1">{data.bench.join(' · ')}</p></div>}
  {!live&&<div className="glass rounded-xl p-4 text-center text-sm text-muted-foreground">Waiting for the host to start the round. This page updates automatically.</div>}
  <div className="grid lg:grid-cols-2 gap-4">{(data.matches||[]).map(m=><CourtScore key={m.id} match={m} session={data.session} token={token} onSaved={load}/>)}</div>
 </main></div>;
}