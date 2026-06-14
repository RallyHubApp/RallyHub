import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useRef } from 'react';
import PageNotFound from './lib/PageNotFound';
import { base44 } from '@/api/base44Client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Players from '@/pages/Players';
import PlayerProfile from '@/pages/PlayerProfile';
import Tournaments from '@/pages/Tournaments';
import TournamentDetail from '@/pages/TournamentDetail';
import MatchCenter from '@/pages/MatchCenter';
import Leaderboard from '@/pages/Leaderboard';
import Analytics from '@/pages/Analytics';
import MyProfile from '@/pages/MyProfile';
import AdminPanel from '@/pages/AdminPanel';
import PublicRegister from '@/pages/PublicRegister';
import PublicTournament from '@/pages/PublicTournament';
import Landing from '@/pages/Landing';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import PendingApprovalScreen from '@/components/PendingApprovalScreen';
import AndroidInstallPrompt from '@/components/AndroidInstallPrompt';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
        <span className="text-primary font-bold text-sm">RH</span>
      </div>
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
    </div>
  </div>
);

const AppAccessGate = () => {
  const { isLoadingPublicSettings, user } = useAuth();
  const notifiedRef = useRef(false);

  if (isLoadingPublicSettings) {
    return <LoadingScreen />;
  }

  if (user?.role === 'admin' || user?.approval_status === 'approved') {
    return <AuthenticatedRoutes />;
  }

  if (!notifiedRef.current && user && user.approval_status !== 'rejected') {
    notifiedRef.current = true;
    base44.functions.invoke('notifyAdminsOnSignup', { user }).catch(() => {});
  }

  return <PendingApprovalScreen status={user?.approval_status || 'pending'} />;
};


const AuthenticatedRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="players" element={<Players />} />
      <Route path="players/:id" element={<PlayerProfile />} />
      <Route path="tournaments" element={<Tournaments />} />
      <Route path="tournaments/:id" element={<TournamentDetail />} />
      <Route path="matches" element={<MatchCenter />} />
      <Route path="leaderboard" element={<Leaderboard />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="my-profile" element={<MyProfile />} />
      <Route path="admin" element={<AdminPanel />} />
    </Route>
    <Route path="*" element={<Navigate to="/app" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Public landing — no auth check, always accessible */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Public utility routes — no auth required */}
            <Route path="/register/:id" element={<PublicRegister />} />
            <Route path="/tournament/:id" element={<PublicTournament />} />
            <Route path="/tournament/:slug/:id" element={<PublicTournament />} />
            <Route path="/:slug/:id" element={<PublicTournament />} />
            <Route path="/t/:id" element={<PublicTournament />} />

            {/* Protected app routes */}
            <Route element={<ProtectedRoute fallback={<LoadingScreen />} unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route path="/app/*" element={<AppAccessGate />} />
              <Route path="/players" element={<Navigate to="/app/players" replace />} />
              <Route path="/players/:id" element={<LegacyRedirect prefix="/app/players/" paramKey="id" />} />
              <Route path="/tournaments" element={<Navigate to="/app/tournaments" replace />} />
              <Route path="/tournaments/:id" element={<LegacyRedirect prefix="/app/tournaments/" paramKey="id" />} />
              <Route path="/matches" element={<Navigate to="/app/matches" replace />} />
              <Route path="/leaderboard" element={<Navigate to="/app/leaderboard" replace />} />
              <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
              <Route path="/my-profile" element={<Navigate to="/app/my-profile" replace />} />
              <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
              <Route path="/dashboard" element={<Navigate to="/app" replace />} />
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
        <AndroidInstallPrompt />
      </QueryClientProvider>
    </AuthProvider>
  )
}

// Helper to redirect parameterised legacy routes like /players/:id → /app/players/:id
function LegacyRedirect({ prefix, paramKey }) {
  const params = new URLSearchParams(window.location.search);
  // Extract param from pathname
  const parts = window.location.pathname.split('/');
  const id = parts[parts.length - 1];
  return <Navigate to={`${prefix}${id}`} replace />;
}

export default App