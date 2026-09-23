import React from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, RefreshCw, Trophy, WifiOff } from 'lucide-react';

function errText(e){ return e?.response?.data?.error || e?.data?.error || e?.message || 'Showcase scorer unavailable'; }

export default function PublicClubChallengeShowcaseScorer(){
  const { token }=useParams();
  const [data,setData]=React.useState(null);
  const [error,setError]=React.useState('');
  const [busy,setBusy]=React.useState('');
  const [notice,setNotice]=React.useState('');
  const load=React.useCallback(async()=>{
    try{
      const r=await base44.functions.invoke('getPublicClubChallengeShowcaseScore',{token});
      if(r.data?.error) throw new Error(r.data.error);
      setData(r.data); setError('');
    }catch(e){ setError(errText(e)); }
  },[token]);
  React.useEffect(()=>{ load(); const id=setInterval(load,5000); return()=>clearInterval(id); },[load]);

  const speakChange=()=>{
    setNotice('CHANGE ENDS');
    if('speechSynthesis' in window){
      try{
        window.speechSynthesis.cancel();
        const u=new SpeechSynthesisUtterance('Change ends');
        u.rate=0.9; window.speechSynthesis.speak(u);
      }catch{}
    }
    window.setTimeout(()=>setNotice(''),10000);
  };

  const act=async(action)=>{
    if(!data?.match || busy) return;
    setBusy(action);
    try{
      const r=await base44.functions.invoke('updatePublicClubChallengeShowcaseScore',{token,action,expectedRevision:data.match.revision});
      if(r.data?.conflict){ await load(); setNotice('Score changed on another device — refreshed'); return; }
      if(r.data?.error) throw new Error(r.data.error);
      setData(d=>({...d,match:{...d.match,...r.data.match}}));
      if(r.data?.sideChange) speakChange();
      else if(r.data?.finished) setNotice('MATCH COMPLETE');
    }catch(e){ setNotice(errText(e)); await load(); }
    finally{ setBusy(''); }
  };

  if(error&&!data) return <div className="min-h-screen bg-background text-foreground grid place-items-center p-5 text-center"><div className="max-w-sm"><WifiOff className="mx-auto h-8 w-8"/><h1 className="mt-3 font-bold">Showcase scorer link unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p></div></div>;
  if(!data) return <div className="min-h-screen bg-background text-foreground grid place-items-center"><RefreshCw className="h-7 w-7 animate-spin"/></div>;

  const {event,match}=data;
  const complete=match.status==='completed';
  const format=`First to ${match.showcase_target_points} · win by ${match.showcase_win_by}`;
  return <div className="min-h-screen bg-background text-foreground p-3 sm:p-5">
    <div className="mx-auto max-w-xl space-y-4">
      <header className="rounded-2xl border border-border bg-card p-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">RallyHub Interclub · Showcase Scorer</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2"><Badge variant="outline">{match.showcase_mode==='exhibition'?'Exhibition Showcase':'Tiebreak Showcase'}</Badge><Badge variant="outline">{format}</Badge></div>
        <p className="mt-3 text-xs text-muted-foreground">Tap + after each point. Use − immediately to correct a mistaken tap.</p>
      </header>

      {notice&&<div className="rounded-2xl border-2 border-amber-500 bg-amber-500/15 px-4 py-5 text-center text-2xl font-black tracking-wide text-amber-600">{notice}</div>}

      <div className="grid grid-cols-2 gap-3">
        {[
          ['a',event.club_a_name,match.club_a_names,match.score_a],
          ['b',event.club_b_name,match.club_b_names,match.score_b],
        ].map(([side,club,names,score])=><div key={side} className="rounded-2xl border border-border bg-card p-3 text-center">
          <p className="text-sm font-bold leading-tight">{club}</p>
          <p className="mt-1 min-h-8 text-[11px] leading-tight text-muted-foreground">{(names||[]).join(' & ')}</p>
          <p className="my-4 text-7xl font-black tabular-nums">{score}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button aria-label={`Subtract point from ${club}`} variant="outline" className="h-16 text-xl" disabled={busy||Number(score)<=0} onClick={()=>act(`dec_${side}`)}><Minus className="h-7 w-7"/></Button>
            <Button aria-label={`Add point to ${club}`} className="h-16 text-xl" disabled={busy||complete} onClick={()=>act(`inc_${side}`)}><Plus className="h-7 w-7"/></Button>
          </div>
        </div>)}
      </div>

      {complete&&<div className="rounded-2xl border border-primary/40 bg-primary/10 p-5 text-center"><Trophy className="mx-auto h-6 w-6 text-primary"/><p className="mt-2 text-lg font-bold">Showcase Final complete</p><p className="text-sm text-muted-foreground">{match.winner==='club_a'?event.club_a_name:event.club_b_name} won {match.score_a}–{match.score_b}</p><p className="mt-2 text-xs text-muted-foreground">If the last point was entered by mistake, use the minus button to correct it before the host finalises the event.</p></div>}

      <Button variant="outline" className="w-full h-12" onClick={load}><RefreshCw className="mr-2 h-4 w-4"/>Refresh score</Button>
    </div>
  </div>;
}