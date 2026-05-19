import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, Target, Calendar, Mail, Phone, MapPin, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PlayerProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const playerId = window.location.pathname.split('/players/')[1];

  const { data: player, isLoading } = useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      const players = await base44.entities.Player.filter({ id: playerId });
      return players[0];
    },
    enabled: !!playerId
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['player-matches', playerId],
    queryFn: () => base44.entities.Match.list('-created_date', 100),
    enabled: !!playerId
  });

  const { data: allTournaments = [] } = useQuery({
    queryKey: ['all-tournaments-profile'],
    queryFn: () => base44.entities.Tournament.list('-updated_date', 50),
    enabled: !!playerId
  });

  if (isLoading || !player) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const playerMatches = matches.filter(m =>
    m.team1_player_ids?.includes(playerId) || m.team2_player_ids?.includes(playerId)
  );

  // Extract KOTC round results for this player
  const kotcResults = [];
  allTournaments.forEach(t => {
    if (t.format !== 'King of the Court' || !t.kotc_state) return;
    let state;
    try { state = JSON.parse(t.kotc_state); } catch { return; }
    const results = state.results || {};
    state.rounds?.forEach(round => {
      const roundResults = results[round.roundNumber];
      if (!roundResults) return;
      round.courts?.forEach(court => {
        const inTeamA = court.teamA?.includes(playerId);
        const inTeamB = court.teamB?.includes(playerId);
        if (!inTeamA && !inTeamB) return;
        const result = roundResults[court.courtNumber];
        if (!result) return;
        const won = (inTeamA && result === 'A') || (inTeamB && result === 'B');
        const myTeam = inTeamA ? court.teamA : court.teamB;
        const oppTeam = inTeamA ? court.teamB : court.teamA;
        const playerMap = {};
        state.players?.forEach(p => { playerMap[p.id] = p.name; });
        kotcResults.push({
          key: `${t.id}-r${round.roundNumber}-c${court.courtNumber}`,
          tournamentName: t.name,
          date: t.start_date || t.updated_date,
          round: round.roundNumber,
          court: court.courtNumber,
          myTeamNames: myTeam.map(id => playerMap[id] || id).join(' & '),
          oppTeamNames: oppTeam.map(id => playerMap[id] || id).join(' & '),
          won,
        });
      });
    });
  });
  kotcResults.sort((a, b) => b.round - a.round);

  const winRate = player.matches_played > 0
    ? Math.round((player.wins / player.matches_played) * 100)
    : 0;

  const initials = (player.full_name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const ratingData = (player.rating_history || []).map(r => ({
    date: r.date,
    rating: r.rating
  }));

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/players" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Players
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 glow-green"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            {player.avatar_url ? (
              <img src={player.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">{initials}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{player.full_name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {player.club && <Badge className="bg-secondary text-secondary-foreground"><MapPin className="w-3 h-3 mr-1" />{player.club}</Badge>}
              {player.gender && <Badge variant="outline">{player.gender}</Badge>}
              {player.age_group && <Badge variant="outline">{player.age_group}</Badge>}
              <Badge className="bg-primary/20 text-primary">{player.status || 'Active'}</Badge>
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black font-mono text-primary">{(player.skill_rating || 3.0).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">DUPR Rating</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{player.wins || 0}</p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.15}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{player.losses || 0}</p>
              <p className="text-xs text-muted-foreground">Losses</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.2}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{winRate}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.25}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{player.matches_played || 0}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rating Chart */}
        <GlassCard delay={0.3}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Rating Progression</h3>
          {ratingData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ratingData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215 14% 50%)' }} />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fontSize: 10, fill: 'hsl(215 14% 50%)' }} />
                <Tooltip contentStyle={{ background: 'hsl(220 18% 8%)', border: '1px solid hsl(220 14% 16%)', borderRadius: 8, color: 'hsl(210 20% 95%)' }} />
                <Line type="monotone" dataKey="rating" stroke="hsl(142 76% 50%)" strokeWidth={2} dot={{ fill: 'hsl(142 76% 50%)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">Not enough data to chart</p>
          )}
        </GlassCard>

        {/* Contact Info */}
        <GlassCard delay={0.35}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Player Details</h3>
          <div className="space-y-3">
            {player.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{player.email}</span>
              </div>
            )}
            {player.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{player.phone}</span>
              </div>
            )}
            {player.preferred_position && (
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Position: {player.preferred_position}</span>
              </div>
            )}
            {player.partner_name && (
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Partner: {player.partner_name}</span>
              </div>
            )}
            {player.notes && (
              <div className="mt-3 p-3 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground">{player.notes}</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Recent Matches */}
      <GlassCard delay={0.4}>
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Matches</h3>
        {playerMatches.length === 0 && kotcResults.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No match history yet</p>
        ) : (
          <div className="space-y-2">
            {/* Standard matches */}
            {playerMatches.slice(0, 10).map(m => {
              const isTeam1 = m.team1_player_ids?.includes(playerId);
              const won = (isTeam1 && m.winner_team === 'team1') || (!isTeam1 && m.winner_team === 'team2');
              return (
                <div key={m.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {m.team1_names} vs {m.team2_names}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.scores?.map(s => `${s.team1}-${s.team2}`).join(', ')}
                    </p>
                  </div>
                  {m.status === 'Completed' && (
                    <Badge className={won ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}>
                      {won ? 'W' : 'L'}
                    </Badge>
                  )}
                </div>
              );
            })}

            {/* KOTC rounds */}
            {kotcResults.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-2">
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">King of the Court</p>
                </div>
                {kotcResults.map(r => (
                  <div key={r.key} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {r.myTeamNames} <span className="text-muted-foreground">vs</span> {r.oppTeamNames}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Crown className="w-2.5 h-2.5 text-yellow-400" />
                        {r.tournamentName} · Round {r.round}, Court {r.court}
                        {r.date && <span>· {new Date(r.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      </p>
                    </div>
                    <Badge className={r.won ? "bg-primary/20 text-primary ml-2 shrink-0" : "bg-destructive/20 text-destructive ml-2 shrink-0"}>
                      {r.won ? 'W' : 'L'}
                    </Badge>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}