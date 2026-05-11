import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Trophy, Swords, Crown, ArrowRight, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import StatCard from '@/components/shared/StatCard';
import PageHeader from '@/components/shared/PageHeader';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('-created_date', 100)
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => base44.entities.Tournament.list('-created_date', 50)
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-created_date', 50)
  });

  const activeTournaments = tournaments.filter(t => t.status === 'In Progress' || t.status === 'Registration Open');
  const todayMatches = matches.filter(m => {
    if (!m.scheduled_time) return false;
    const d = new Date(m.scheduled_time).toDateString();
    return d === new Date().toDateString();
  });
  const recentMatches = matches.filter(m => m.status === 'Completed').slice(0, 5);
  const topPlayers = [...players].sort((a, b) => (b.skill_rating || 0) - (a.skill_rating || 0)).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Pickleball tournament command center">
        <Link to="/players">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" /> Import Players
          </Button>
        </Link>
        <Link to="/tournaments">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" /> New Tournament
          </Button>
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Players" value={players.length} icon={Users} trend={`${players.filter(p => p.status === 'Active').length} active`} trendUp delay={0} accentColor="primary" />
        <StatCard title="Active Tournaments" value={activeTournaments.length} icon={Trophy} delay={0.1} accentColor="accent" />
        <StatCard title="Matches Today" value={todayMatches.length} icon={Swords} delay={0.2} accentColor="chart-3" />
        <StatCard title="Top Rating" value={topPlayers[0]?.skill_rating?.toFixed(1) || '—'} icon={Crown} delay={0.3} accentColor="chart-4" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Ranked */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Top Ranked</h3>
            <Link to="/leaderboard" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topPlayers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No players yet</p>}
            {topPlayers.map((player, i) => (
              <Link key={player.id} to={`/players/${player.id}`} className="flex items-center gap-3 group">
                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{(player.full_name || 'P')[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{player.full_name}</p>
                  <p className="text-xs text-muted-foreground">{player.club || 'No club'}</p>
                </div>
                <span className="text-sm font-bold font-mono text-primary">{(player.skill_rating || 3.0).toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Results */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Results</h3>
            <Link to="/matches" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentMatches.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No matches yet</p>}
            {recentMatches.map(match => (
              <div key={match.id} className="glass rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{match.team1_names || 'Team 1'}</p>
                    <p className="text-xs text-muted-foreground truncate">vs {match.team2_names || 'Team 2'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-foreground">
                      {match.scores?.map(s => `${s.team1}-${s.team2}`).join(', ') || '—'}
                    </p>
                    <Badge className="text-[10px] bg-primary/20 text-primary mt-1">
                      {match.winner_team === 'team1' ? match.team1_names : match.team2_names}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Tournaments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Active Tournaments</h3>
            <Link to="/tournaments" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeTournaments.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No active tournaments</p>}
            {activeTournaments.map(t => (
              <Link key={t.id} to={`/tournaments/${t.id}`} className="glass rounded-lg p-3 block hover:scale-[1.01] transition-transform">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.format}</p>
                  </div>
                  <Badge className="text-[10px] bg-accent/20 text-accent">{t.status}</Badge>
                </div>
                {t.start_date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(t.start_date), 'MMM d, yyyy')}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}