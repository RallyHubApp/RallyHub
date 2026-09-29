import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import PublicInterclubTeamManager from '@/pages/PublicInterclubTeamManager';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<PublicInterclubTeamManager />} />
      </Routes>
    </BrowserRouter>
    <Toaster richColors position="top-center" />
  </React.StrictMode>
);