import React from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, RefreshCw, Trophy, WifiOff } from 'lucide-react';
import { AppearanceQuickButton } from '@/components/appearance/AppearanceControls';
import RallyHubModuleBrand from '@/components/branding/RallyHubModuleBrand';

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

  const speakComplete=()=>{
    setNotice('MATCH COMPLETE');
    try{ navigator.vibrate?.([80,60,120]); }catch{}
    if('speechSynthesis' in window){
      try{
        window.speechSynthesis.cancel();
        const u=new SpeechSynthesisUtterance('Match complete');
        u.rate=0.9; window.speechSynthesis.speak(u);
      }catch{}
    }
  };

  const act=async(action)=>{
    if(!data?.match || busy) return;
    const before={...data.match};
    const next={...before};
    if(action==='inc_a') next.score_a=Number(before.score_a||0)+1;
    if(action==='dec_a') next.score_a=Math.max(0,Number(before.score_a||0)-1);
    if(action==='inc_b') next.score_b=Number(before.score_b||0)+1;
    if(action==='dec_b') next.score_b=Math.max(0,Number(before.score_b||0)-1);

    setBusy(action);
    setData(d=>({...d,match:{...d.match,score_a:next.score_a,score_b:next.score_b}}));
    try{ navigator.vibrate?.(25); }catch{}

    try{
      const r=await base44.functions.invoke('updatePublicClubChallengeShowcaseScore',{token,action,expectedRevision:before.revision});
      if(r.data?.conflict){ await load(); setNotice('Score changed on another device — resynchronised'); return; }
      if(r.data?.error) throw new Error(r.data.error);
      setData(d=>({...d,match:{...d.match,...r.data.match}}));
      if(r.data?.sideChange) speakChange();
      if(r.data?.finished) speakComplete();
    }catch(e){
      setData(d=>({...d,match:before}));
      setNotice(`${errText(e)} · score restored`);
      await load();
    }finally{ setBusy(''); }
  };

  if(error&&!data) return <div className="min-h-screen bg-background text-foreground grid place-items-center p-5 text-center"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/><div className="max-w-sm"><RallyHubModuleBrand moduleName="Interclub" pageLabel="Showcase Scorer"/><WifiOff className="mx-auto mt-5 h-8 w-8"/><h1 className="mt-3 font-bold">Showcase scorer link unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p></div></div>;
  if(!data) return <div className="min-h-screen bg-background text-foreground grid place-items-center"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/><div className="text-center"><RallyHubModuleBrand moduleName="Interclub" pageLabel="Showcase Scorer"/><RefreshCw className="mx-auto mt-5 h-7 w-7 animate-spin"/></div></div>;

  const {event,match}=data;
  const complete=match.status==='completed';
  const format=`First to ${match.showcase_target_points} · win by ${match.showcase_win_by}`;
  return <div className="min-h-screen bg-background text-foreground p-3 sm:p-5"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
    <div className="mx-auto max-w-xl space-y-4">
      <header className="rounded-2xl border border-border bg-card p-4 text-center">
        <RallyHubModuleBrand moduleName="Interclub" pageLabel="Showcase Scorer"/>
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
          <div className="min-h-5 mb-2 text-[11px] font-semibold text-primary">{busy.endsWith(`_${side}`) ? 'Saving…' : ''}</div>
          <div className="grid grid-cols-2 gap-2">
            <Button aria-label={`Subtract point from ${club}`} aria-busy={busy===`dec_${side}`} variant="outline" className="h-16 text-xl" disabled={Number(score)<=0 || busy===`dec_${side}`} onClick={()=>act(`dec_${side}`)}><Minus className="h-7 w-7"/></Button>
            <Button aria-label={`Add point to ${club}`} aria-busy={busy===`inc_${side}`} className="h-16 text-xl" disabled={complete || busy===`inc_${side}`} onClick={()=>act(`inc_${side}`)}><Plus className="h-7 w-7"/></Button>
          </div>
        </div>)}
      </div>

      {complete&&<div className="rounded-2xl border border-primary/40 bg-primary/10 p-5 text-center"><Trophy className="mx-auto h-6 w-6 text-primary"/><p className="mt-2 text-lg font-bold">Showcase Final complete</p><p className="text-sm text-muted-foreground">{match.winner==='club_a'?event.club_a_name:event.club_b_name} won {match.score_a}–{match.score_b}</p><p className="mt-2 text-xs text-muted-foreground">If the last point was entered by mistake, use the minus button to correct it before the host finalises the event.</p></div>}

      <p className="text-center text-[11px] text-muted-foreground">Score synchronises automatically. Use − on the relevant team to correct a mistaken point.</p>
    </div>
  </div>;
}