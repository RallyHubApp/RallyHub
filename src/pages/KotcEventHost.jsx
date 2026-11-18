import React from 'react';
import {useParams,useNavigate} from 'react-router-dom';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import KotcView from '@/components/kotc/KotcView';
import {Button} from '@/components/ui/button';
export default function KotcEventHost(){
 const {tournamentId}=useParams(),navigate=useNavigate(),qc=useQueryClient();
 const {data,isLoading,error,refetch}=useQuery({queryKey:['kotc-event-host',tournamentId],queryFn:async()=>{const r=await base44.functions.invoke('manageKotcEventHost',{action:'state',tournamentId});if(r.data?.error)throw Error(r.data.error);return r.data;},refetchInterval:6000,retry:false});
 if(isLoading)return <div className="p-6">Opening KOTC host setup…</div>;
 if(error)return <div className="p-6">Host access unavailable: {error.message}</div>;
 const t=data.tournament,players=data.players||[],registered=players.filter(p=>(t.player_ids||[]).includes(p.id));
 return <main className="max-w-5xl mx-auto p-3 sm:p-6 space-y-4"><div className="flex items-center justify-between"><strong>HOST MODE · {t.name}</strong><Button variant="outline" onClick={()=>refetch()}>Refresh</Button></div>{data.sessionId?<div className="space-y-3"><p>Round 1 has been created. Continue in your session-specific Host Mode.</p><Button onClick={()=>navigate(`/kotc-host/${data.sessionId}`)}>Open Live Host Controls</Button></div>:<KotcView tournament={t} players={registered} allPlayers={players} queryClient={qc} delegatedHost/>}</main>;
}
