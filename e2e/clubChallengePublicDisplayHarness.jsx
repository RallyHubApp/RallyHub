import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicClubChallengeDisplay from '@/pages/PublicClubChallengeDisplay';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MemoryRouter initialEntries={['/club-challenge/display/e2e-display-token']}>
      <Routes><Route path="/club-challenge/display/:token" element={<PublicClubChallengeDisplay />} /></Routes>
    </MemoryRouter>
  </React.StrictMode>
);