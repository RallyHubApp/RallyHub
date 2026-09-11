import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import ClubChallengeView from '@/components/clubchallenge/ClubChallengeView';
import '@/index.css';

const tournament = {
  id: 'e2e-club-challenge-tournament',
  name: 'E2E Club Challenge',
  format: 'Club Challenge',
  status: 'Draft',
  tenant_id: 'tenant-clare-e2e',
  host_club_id: 'club-clare-e2e',
  inter_club: true,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

window.__RALLYHUB_CC_E2E__ = { tournament };

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background p-3 sm:p-4 max-w-7xl mx-auto">
        <ClubChallengeView tournament={tournament} queryClient={queryClient} isAdmin={true} />
      </main>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  </React.StrictMode>
);