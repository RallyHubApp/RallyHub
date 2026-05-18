import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, UserPlus, Trophy, Users, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function PublicRegister() {
  const tournamentId = window.location.pathname.split('/register/')[1];
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });

  const callPublicRegister = async (payload) => {
    const res = await fetch(`/api/functions/publicRegister`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  useEffect(() => {
    if (!tournamentId) return;
    callPublicRegister({ tournamentId, _probe: true })
      .then(data => {
        if (data?.tournament) {
          setTournament(data.tournament);
          setPlayerCount(data.tournament.player_count || 0);
        } else {
          setTournament(null);
        }
      })
      .catch(() => setTournament(null))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.full_name.trim()) { toast.error('Please enter your name'); return; }
    setSubmitting(true);
    const data = await callPublicRegister({
      tournamentId,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    setSubmitting(false);
    if (data?.success) {
      setPlayerCount(data.tournament?.player_count || playerCount);
      setDone(true);
    } else {
      toast.error(data?.error || 'Registration failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-foreground font-semibold">Tournament not found</p>
          <p className="text-sm text-muted-foreground">This registration link may be invalid or the event has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Brand header */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
          <span className="text-primary font-black text-base leading-none">RH</span>
        </div>
        <div>
          <span className="font-black text-lg text-foreground tracking-tight leading-none block">RallyHub</span>
          <span className="text-[10px] text-primary/70 font-medium tracking-widest uppercase">Pickleball</span>
        </div>
      </div>

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
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Full Name *</label>
                  <Input
                    placeholder="Your full name"
                    value={form.full_name}
                    onChange={handle('full_name')}
                    className="bg-secondary border-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Email (optional)</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handle('email')}
                    className="bg-secondary border-input"
                  />
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
                  disabled={submitting || !form.full_name.trim()}
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