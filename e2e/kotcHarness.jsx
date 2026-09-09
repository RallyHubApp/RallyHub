import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KotcV2SessionView from '@/components/kotc/KotcV2SessionView';
import '@/index.css';

const players = Array.from({ length: 18 }, (_, index) => ({
  id: `player-${String(index + 1).padStart(2, '0')}`,
  full_name: `Player ${String(index + 1).padStart(2, '0')}`,
  dupr_rating: 3 + index / 20,
}));

const tournament = {
  id: 'e2e-kotc-tournament',
  name: 'E2E 18 Player KOTC',
  format: 'King of the Court',
  status: 'Draft',
  player_ids: players.map(player => player.id),
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

window.__RALLYHUB_KOTC_E2E__ = { tournament, players };

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background p-3 sm:p-4 max-w-5xl mx-auto">
        <KotcV2SessionView tournament={tournament} players={players} queryClient={queryClient} />
      </main>
    </QueryClientProvider>
  </React.StrictMode>
);
