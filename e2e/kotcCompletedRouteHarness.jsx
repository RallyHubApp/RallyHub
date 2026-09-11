import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/AuthContext';
import Tournaments from '@/pages/Tournaments';
import TournamentDetail from '@/pages/TournamentDetail';
import '@/index.css';

window.history.replaceState({},'','/app/tournaments');
const qc=new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false},mutations:{retry:false}}});
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/app/tournaments" element={<Tournaments/>}/>
            <Route path="/app/tournaments/:id" element={<TournamentDetail/>}/>
            <Route path="*" element={<Navigate to="/app/tournaments" replace/>}/>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
