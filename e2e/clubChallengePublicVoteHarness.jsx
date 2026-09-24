import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import PublicClubChallengeVote from '@/pages/PublicClubChallengeVote';
import { AppearanceProvider } from '@/lib/AppearanceContext';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppearanceProvider><MemoryRouter initialEntries={['/club-challenge/vote/e2e-vote-token']}>
      <Routes><Route path="/club-challenge/vote/:token" element={<PublicClubChallengeVote />} /></Routes>
      <Toaster richColors position="top-center" />
    </MemoryRouter></AppearanceProvider>
  </React.StrictMode>
);