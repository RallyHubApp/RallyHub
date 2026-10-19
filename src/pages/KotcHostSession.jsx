import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import KotcV2SessionView from '@/components/kotc/KotcV2SessionView';
import KotcHostGuide from '@/components/kotc/KotcHostGuide';
import BrandedHostFrame from '@/components/sporting/BrandedHostFrame';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

const tabSelectors={
  players:['#kotc-live-roster-controls','[data-testid="kotc-live-roster"]','[data-testid="kotc-round-editor"]'],
  courts:['[data-testid="kotc-round-editor"]','[data-testid="kotc-scores-courts"]','[data-testid="kotc-round-not-started"]'],
  scores:['[data-testid="kotc-scores-courts"]','[data-testid="kotc-round-editor"]'],
  more:['[data-testid="kotc-session-menu-panel"]','[data-testid="kotc-session-menu"]']
};
export default function KotcHostSession(){
  const {sessionId}=useParams();
  const [activeTab,setActiveTab]=useState('run');
  const queryClient=useQueryClient();
  const {user,logout}=useAuth();
  const {data:state,isLoading,error}=useQuery({
    queryKey:['kotc-host-state',sessionId],
    queryFn:async()=>{const result=await Promise.race([base44.functions.invoke('getKotcV2State',{sessionId}),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Session service did not respond within 15 seconds')),15000))]);if(result.data?.error)throw new Error(result.data.error);return result.data;},
    enabled:!!sessionId,retry:false,staleTime:Infinity,refetchOnWindowFocus:false
  });
  const {data:eventMeta}=useQuery({queryKey:['kotc-host-event-meta',state?.session?.tournament_id],queryFn:async()=>{
    const events=await base44.entities.Tournament.filter({id:state.session.tournament_id});return events?.[0]||null;
  },enabled:!!state?.session?.tournament_id,retry:false});
  if(isLoading)return <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb] text-sm">Opening session host mode…</div>;
  if(error||!state?.session)return <div className="min-h-screen bg-[#f4f7fb] p-4 flex items-center justify-center"><div className="max-w-md w-full rounded-xl bg-white border p-5 space-y-3"><h1 className="font-bold">Session access unavailable</h1><p className="text-sm">{error?.message||'This host link is invalid, expired, revoked, or your account has not been granted access.'}</p><div className="flex gap-2"><Button onClick={()=>queryClient.refetchQueries({queryKey:['kotc-host-state',sessionId]})}>Retry session</Button><Button variant="outline" onClick={()=>logout()}>Sign out</Button></div></div></div>;
  const session=state.session;
  const players=(state.participants||[]).map(p=>({id:p.player_id||p.id,full_name:p.display_name||'Player',skill_rating:p.rating_snapshot??null,dupr_rating:p.dupr_rating_snapshot??null}));
  const tournament={id:session.tournament_id,name:session.name,format:'King of the Court',status:'In Progress',player_ids:players.map(p=>p.id)};
  const scheduled=session.scheduled_start||eventMeta?.start_date;
  const dateLabel=scheduled?new Date(scheduled.includes('T')?scheduled:`${scheduled}T12:00:00`).toLocaleDateString('en-IE',{weekday:'short',day:'numeric',month:'short',year:'numeric'}):'';
  const subtitle=[session.custom_location||eventMeta?.location||'',dateLabel,eventMeta?.event_start_time||''].filter(Boolean).join(' · ');
  const onTab=key=>{
    setActiveTab(key);
    if(key==='guide'){window.scrollTo({top:0,behavior:'smooth'});return;}
    if(key==='run'){window.scrollTo({top:0,behavior:'smooth'});return;}
    if(key==='players')document.querySelector('[data-testid="kotc-live-roster"]')?.click();
    if(key==='more'&&!document.querySelector('[data-testid="kotc-session-menu-panel"]'))document.querySelector('[data-testid="kotc-session-menu"]')?.click();
    setTimeout(()=>{const target=(tabSelectors[key]||[]).map(s=>document.querySelector(s)).find(Boolean);if(target)target.scrollIntoView({behavior:'smooth',block:'start'});},100);
  };
  const communicationsUrl=user?.role==='admin'?`/app/communications?scope=tenant&source=kotc&sourceId=${encodeURIComponent(session.id)}&template=kotc_results&returnTo=${encodeURIComponent(`/kotc-host/${session.id}`)}&label=${encodeURIComponent(session.name||'KOTC')}`:null;
  return <BrandedHostFrame tenantId={session.tenant_id} title="King of the Court" subtitle={subtitle} roundNote={`${session.play_minutes||8}-minute rounds`} hostName={user?.full_name||user?.email} activeTab={activeTab} onTab={onTab} onSignOut={()=>logout()} communicationsUrl={communicationsUrl}>
    <div style={{display:activeTab==='guide'?'none':'block'}} aria-hidden={activeTab==='guide'}><KotcV2SessionView tournament={tournament} players={players} queryClient={queryClient} sessionId={session.id}/></div>
    {activeTab==='guide'&&<KotcHostGuide tenantId={session.tenant_id}/>}
  </BrandedHostFrame>;
}
