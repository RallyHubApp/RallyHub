import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicClubChallengeDisplay from '@/pages/PublicClubChallengeDisplay';
import { AppearanceProvider } from '@/lib/AppearanceContext';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppearanceProvider><MemoryRouter initialEntries={['/club-challenge/display/e2e-display-token']}>
      <Routes><Route path="/club-challenge/display/:token" element={<PublicClubChallengeDisplay />} /></Routes>
    </MemoryRouter></AppearanceProvider>
  </React.StrictMode>
);