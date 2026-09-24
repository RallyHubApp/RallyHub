import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, UserPlus, Trophy, Users, Calendar, MapPin, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { AppearanceQuickButton } from '@/components/appearance/AppearanceControls';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';

export default function PublicRegister() {
  const tournamentId = window.location.pathname.split('/register/')[1];
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [clubBrand, setClubBrand] = useState(null);
  const [form, setForm] = useState({ phone: '' });

  const callPublicRegister = async (payload) => {
    try {
      const res = await base44.functions.invoke('publicRegister', payload);
      return res.data || {};
    } catch (error) {
      return { error: error?.response?.data?.error || error?.message || 'Registration request failed' };
    }
  };

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!tournamentId || !isAuthenticated) {
      setLoading(false);
      return;
    }
    callPublicRegister({ tournamentId, _probe: true })
      .then(data => {
        if (data?.tournament) {
          setTournament(data.tournament);
          setClubBrand(data.club_brand || null);
          setPlayerCount(data.tournament.player_count || 0);
        } else {
          setTournament(null);
        }
      })
      .catch(() => setTournament(null))
      .finally(() => setLoading(false));
  }, [tournamentId, isAuthenticated, isLoadingAuth]);

  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setSubmitting(true);
    const data = await callPublicRegister({
      tournamentId,
      phone: form.phone.trim(),
    });
    setSubmitting(false);
    if (data?.success) {
      setPlayerCount(data.tournament?.player_count || playerCount);
      setClubBrand(data.club_brand || clubBrand);
      setDone(true);
    } else {
      toast.error(data?.error || 'Registration failed');
    }
  };

  if (loading || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
        <div className="glass rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto">
            <LogIn className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-foreground font-bold">Sign in to register</p>
            <p className="text-sm text-muted-foreground mt-1">For security, tournament registration is linked to your RallyHub account.</p>
          </div>
          <Button onClick={navigateToLogin} className="w-full bg-primary text-primary-foreground">Sign in or create an account</Button>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
        <div className="text-center space-y-3">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-foreground font-semibold">Tournament not found</p>
          <p className="text-sm text-muted-foreground">This registration link may be invalid or the event has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4"><AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
      <div className="mb-8"><RallyHubPublicBrand moduleName={tournament.format || 'Tournament'} pageLabel="Registration" club={clubBrand}/></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Tournament card */}
        <div className="glass rounded-xl p-5 mb-4 glow-blue">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-foreground leading-tight">{tournament.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{tournament.format}</p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                {tournament.start_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(tournament.start_date), 'MMM d, yyyy')}
                  </span>
                )}
                {tournament.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {tournament.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {playerCount} registered
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form / success */}
        <div className="glass rounded-xl p-5">
          {done ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
              <p className="text-foreground font-bold text-lg">You're in!</p>
              <p className="text-sm text-muted-foreground">
                You're registered for <strong className="text-foreground">{tournament.name}</strong>.<br />
                The organiser will start the session shortly.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Register to play
              </h2>
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-secondary/60 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Registering as</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{user?.full_name || user?.display_name || user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Phone (optional)</label>
                  <Input
                    type="tel"
                    placeholder="+353..."
                    value={form.phone}
                    onChange={handle('phone')}
                    className="bg-secondary border-input"
                  />
                </div>
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground mt-2"
                >
                  {submitting
                    ? <><div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-1" /> Registering…</>
                    : 'Register for this event'
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}