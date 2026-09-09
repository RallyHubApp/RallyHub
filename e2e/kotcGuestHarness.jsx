import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KotcV2SessionView from '@/components/kotc/KotcV2SessionView';
import '@/index.css';

const members=Array.from({length:17},(_,i)=>({id:`member-${String(i+1).padStart(2,'0')}`,full_name:`Member ${String(i+1).padStart(2,'0')}`}));
const guest={id:'guest-e2e',full_name:'Guest One',is_guest:true,relationship_type:'guest'};
const players=[...members,guest];
const tournament={id:'e2e-guest-tournament',name:'17 Members + 1 Guest',status:'Draft',player_ids:members.map(p=>p.id),kotc_guest_roster:[{guest_id:guest.id,display_name:guest.full_name}]};
const queryClient=new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false},mutations:{retry:false}}});
window.__RALLYHUB_GUEST_E2E__={players,tournament};
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><QueryClientProvider client={queryClient}><main className="min-h-screen bg-background p-3 max-w-5xl mx-auto"><KotcV2SessionView tournament={tournament} players={players} queryClient={queryClient}/></main></QueryClientProvider></React.StrictMode>);
