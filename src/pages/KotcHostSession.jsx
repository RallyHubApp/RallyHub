import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import KotcV2SessionView from '@/components/kotc/KotcV2SessionView';
import { Button } from '@/components/ui/button';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function KotcHostSession(){
  const { sessionId }=useParams();
  const queryClient=useQueryClient();
  const { user, logout }=useAuth();
  const {data:state,isLoading,error}=useQuery({
    queryKey:['kotc-host-state',sessionId],
    queryFn:async()=> (await base44.functions.invoke('getKotcV2State',{sessionId})).data,
    enabled:!!sessionId,
    refetchInterval:3000,
  });

  if(isLoading)return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-sm text-muted-foreground">Opening session host mode…</div></div>;
  if(error||!state?.session)return <div className="min-h-screen bg-background p-4 flex items-center justify-center"><div className="max-w-md w-full glass rounded-xl p-5 space-y-3"><h1 className="font-bold">Session access unavailable</h1><p className="text-sm text-muted-foreground">This host link is invalid, expired, revoked, or your account has not been granted access to this session.</p><Button variant="outline" onClick={()=>logout()}>Sign out</Button></div></div>;

  const session=state.session;
  const players=(state.participants||[]).map(p=>({id:p.player_id||p.id,full_name:p.display_name||'Player',skill_rating:p.rating_snapshot??null,dupr_rating:p.dupr_rating_snapshot??null}));
  const tournament={id:session.tournament_id,name:session.name,format:'King of the Court',status:session.status==='ready'?'In Progress':'In Progress',player_ids:players.map(p=>p.id)};

  return <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-40 glass-strong border-b border-border px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary"/><p className="text-xs uppercase tracking-wider text-primary font-semibold">Session Host Mode</p></div>
        <h1 className="font-bold text-sm sm:text-base truncate">{session.name}</h1>
        <p className="text-[10px] text-muted-foreground truncate">Restricted to this KOTC session only · {user?.full_name||user?.email||'Host'}</p>
      </div>
      <Button variant="outline" size="sm" onClick={()=>logout()}><LogOut className="w-4 h-4 mr-1"/>Sign out</Button>
    </header>
    <main className="p-3 sm:p-4 max-w-5xl mx-auto">
      <KotcV2SessionView tournament={tournament} players={players} queryClient={queryClient} sessionId={session.id}/>
    </main>
  </div>;
}
