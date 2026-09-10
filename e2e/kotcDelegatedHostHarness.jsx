import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import KotcV2SessionView from '@/components/kotc/KotcV2SessionView';
import '@/index.css';

const players=Array.from({length:4},(_,i)=>({id:`player-${i+1}`,full_name:`Host Player ${i+1}`,skill_rating:3+i/10}));
const tournament={id:'delegated-host-tournament',name:'Delegated Host KOTC',format:'King of the Court',status:'In Progress',player_ids:players.map(p=>p.id)};
const queryClient=new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false},mutations:{retry:false}}});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background p-3 sm:p-4 max-w-5xl mx-auto">
        <KotcV2SessionView tournament={tournament} players={players} queryClient={queryClient}/>
      </main>
    </QueryClientProvider>
  </React.StrictMode>
);
