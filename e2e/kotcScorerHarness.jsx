import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicKotcScorer from '@/pages/PublicKotcScorer';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <MemoryRouter initialEntries={['/kotc-score/e2e-player-score-token']}>
    <Routes><Route path="/kotc-score/:token" element={<PublicKotcScorer/>}/></Routes>
  </MemoryRouter>
);