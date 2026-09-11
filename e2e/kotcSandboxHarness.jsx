import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KotcV2SessionView from '@/components/kotc/KotcV2SessionView';
import '@/index.css';

const players=Array.from({length:18},(_,i)=>({id:`sandbox-guest-${String(i+1).padStart(2,'0')}`,full_name:`Test Player ${String(i+1).padStart(2,'0')}`,is_guest:true,relationship_type:'guest'}));
const tournament={
  id:'sandbox-tournament',name:'KOTC Test Sandbox',format:'King of the Court',status:'Draft',player_ids:[],
  description:'RALLYHUB_KOTC_SANDBOX_V1\nIsolated RallyHub KOTC test event.',
  kotc_guest_roster:players.map(p=>({guest_id:p.id,display_name:p.full_name})),
};
const queryClient=new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false},mutations:{retry:false}}});
window.__RALLYHUB_KOTC_SANDBOX_E2E__={tournament,players};
ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <main className="min-h-screen bg-background p-3 sm:p-4 max-w-5xl mx-auto">
      <KotcV2SessionView tournament={tournament} players={players} queryClient={queryClient}/>
    </main>
  </QueryClientProvider>
);
