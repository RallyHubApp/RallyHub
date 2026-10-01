import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicKotcScorer from '@/pages/PublicKotcScorer';
import { AppearanceProvider } from '@/lib/AppearanceContext';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppearanceProvider>
    <MemoryRouter initialEntries={['/kotc-score/e2e-player-score-token']}>
      <Routes><Route path="/kotc-score/:token" element={<PublicKotcScorer/>}/><Route path="/kotc-live/:token" element={<div data-testid="kotc-results-redirected">KOTC Results</div>}/></Routes>
    </MemoryRouter>
  </AppearanceProvider>
);