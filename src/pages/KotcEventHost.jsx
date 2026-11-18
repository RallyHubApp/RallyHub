import React,{useState} from 'react';
import {useParams,useNavigate} from 'react-router-dom';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import KotcView from '@/components/kotc/KotcView';
import KotcHostGuide from '@/components/kotc/KotcHostGuide';
import BrandedHostFrame from '@/components/sporting/BrandedHostFrame';
import {useAuth} from '@/lib/AuthContext';
import {Button} from '@/components/ui/button';
export default function KotcEventHost(){
 const {tournamentId}=useParams(),navigate=useNavigate(),qc=useQueryClient();
 const {user,logout}=useAuth();
 const [activeTab,setActiveTab]=useState('run');
 const {data,isLoading,error,refetch}=useQuery({queryKey:['kotc-event-host',tournamentId],queryFn:async()=>{const r=await base44.functions.invoke('manageKotcEventHost',{action:'state',tournamentId});if(r.data?.error)throw Error(r.data.error);return r.data;},refetchInterval:6000,retry:false});
 if(isLoading)return <div className="min-h-screen flex items-center justify-center p-6">Opening KOTC host setup…</div>;
 if(error||!data?.tournament)return <div className="p-6">Host access unavailable: {error?.message||'Event not found'}</div>;
 const t=data.tournament,players=data.players||[],registered=players.filter(p=>(t.player_ids||[]).includes(p.id));
 const onTab=key=>{setActiveTab(key);if(key==='guide'||key==='run'){window.scrollTo({top:0,behavior:'smooth'});return;}const selector={players:'[data-testid="kotc-roster-action-help"]',courts:'#kotc-start-section',scores:'#kotc-start-section',more:'#kotc-start-section'}[key];setTimeout(()=>document.querySelector(selector)?.scrollIntoView({behavior:'smooth',block:'start'}),100);};
 return <BrandedHostFrame tenantId={t.tenant_id} title="King of the Court" subtitle={t.name} hostName={user?.full_name||user?.email} activeTab={activeTab} onTab={onTab} onSignOut={logout}>
  <div className="mb-3 flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/10 p-3"><span className="text-xs font-extrabold tracking-wide text-green-700">HOST MODE · PRE-SESSION SETUP</span><Button size="sm" variant="outline" onClick={()=>refetch()}>Refresh</Button></div>
  {activeTab==='guide'?<KotcHostGuide tenantId={t.tenant_id}/>:data.sessionId?<div className="rounded-xl border bg-card p-4 space-y-3"><p>Round 1 has been created. Continue in the session-specific Host Mode.</p><Button onClick={()=>navigate(`/kotc-host/${data.sessionId}`)}>Open Live Host Controls</Button></div>:<KotcView tournament={t} players={registered} allPlayers={players} queryClient={qc} delegatedHost/>}
 </BrandedHostFrame>;
}
