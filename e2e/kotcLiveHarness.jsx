import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicKotcResults from '@/pages/PublicKotcResults';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MemoryRouter initialEntries={['/kotc-live/e2e-live-token']}>
      <Routes>
        <Route path="/kotc-live/:token" element={<PublicKotcResults />} />
      </Routes>
    </MemoryRouter>
  </React.StrictMode>
);
