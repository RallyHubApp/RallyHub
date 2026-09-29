import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import PublicInterclubTeamManager from '@/pages/PublicInterclubTeamManager';
import { AppearanceProvider } from '@/lib/AppearanceContext';
import '@/index.css';

window.history.replaceState({}, '', '/club-challenge/team-manager/cctm_0123456789abcdef0123456789abcdef');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppearanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/club-challenge/team-manager/:token" element={<PublicInterclubTeamManager />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </AppearanceProvider>
  </React.StrictMode>
);