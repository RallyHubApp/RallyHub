import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

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
import AuthPage from '@/pages/AuthPage';
import FirstLogin from '@/pages/FirstLogin';
import AccessCodeGate, { useAccessGate } from '@/components/AccessCodeGate';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();
  const { granted, grant } = useAccessGate();

  // Public routes that don't require auth or access code
  const isPublicRoute = window.location.pathname.startsWith('/register/') || window.location.pathname.startsWith('/t/') || window.location.pathname === '/first-login';
  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/register/:id" element={<PublicRegister />} />
        <Route path="/t/:id" element={<PublicTournament />} />
        <Route path="/first-login" element={<FirstLogin />} />
      </Routes>
    );
  }

  // Landing page - show for unauthenticated users on root path
  if (window.location.pathname === '/' && !isAuthenticated) {
    return <Landing />;
  }

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">PB</span>
          </div>
          <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to auth page for login
      window.location.href = '/auth';
      return null;
    }
  }

  // User is authenticated - check access code but don't show gate UI yet
  // The granted state will be updated by useAccessGate hook
  if (!granted && isAuthenticated) {
    return <AccessCodeGate onGranted={grant} />;
  }

  // If still loading auth or access code validation, show loading
  if (isAuthenticated && !granted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">PB</span>
          </div>
          <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // User is authenticated AND has validated access code - show main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/players" element={<Players />} />
        <Route path="/players/:id" element={<PlayerProfile />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
        <Route path="/matches" element={<MatchCenter />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Auth page - login/signup */}
            <Route path="/auth" element={<AuthPage />} />
            {/* Landing page - public marketing page */}
            <Route path="/landing" element={<Landing />} />
            {/* All other routes (including /) handled by AuthenticatedApp */}
            <Route path="*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App