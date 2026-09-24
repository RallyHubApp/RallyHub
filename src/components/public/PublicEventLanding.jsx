import React, { useState } from 'react';
import { CalendarDays, Crown, MapPin, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function formatEventDate(dateValue) {
  if (!dateValue) return 'Date to be confirmed';
  return new Date(dateValue).toLocaleDateString('en-IE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function PublicEventLanding({ tournament, players, callPublicRegister, onRefresh, liveIndicator }) {
  const [name, setName] = useState('');
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    const fullName = name.trim();
    if (!fullName) return;

    setRegistering(true);
    const result = await callPublicRegister({ tournamentId: tournament.id, full_name: fullName });
    setRegistering(false);

    if (result?.error || result?.success === false) {
      toast.error(result.error || 'Registration failed');
      return;
    }

    setName('');
    toast.success('You are registered for this event.');
    await onRefresh();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="glass rounded-3xl p-6 sm:p-8 border border-primary/10 glow-green">
          <div className="flex items-center justify-between gap-3 mb-6">
            <Badge className="bg-primary/15 text-primary border border-primary/20">RallyHub.ie Event</Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={liveIndicator ? 'text-primary' : ''}>●</span>
              Awaiting start
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Crown className="w-7 h-7 text-yellow-400" />
            </div>
            <div className="space-y-3 min-w-0">
              <div>
                <p className="text-sm text-primary font-semibold">King of the Court</p>
                <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">{tournament.name}</h1>
              </div>
              {tournament.description && (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{tournament.description}</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-8">
            <div className="glass rounded-2xl p-4">
              <CalendarDays className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-semibold text-foreground">{formatEventDate(tournament.start_date)}</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <MapPin className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Venue</p>
              <p className="text-sm font-semibold text-foreground">{tournament.location || 'Venue to be confirmed'}</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <Users className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Registered</p>
              <p className="text-sm font-semibold text-foreground">{players.length} players</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Register to play</h2>
            <p className="text-sm text-muted-foreground">Add your name before the host starts the session.</p>
          </div>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={event => setName(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && handleRegister()}
              placeholder="Your full name"
              className="bg-secondary border-border"
            />
            <Button onClick={handleRegister} disabled={!name.trim() || registering} className="bg-primary text-primary-foreground shrink-0">
              {registering ? 'Adding…' : <><UserPlus className="w-4 h-4" /> Join</>}
            </Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Players</h2>
          {players.length === 0 ? (
            <p className="text-sm text-muted-foreground">No players registered yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {players.map((player, index) => (
                <div key={player.id} className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">{index + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {(player.full_name || '?')[0]}
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{player.full_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}