import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Trophy, Swords, Crown, ArrowRight, Plus, Upload, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import StatCard from '@/components/shared/StatCard';
import PageHeader from '@/components/shared/PageHeader';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: currentUser = null } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players', currentUser?.active_tenant_id, currentUser?.active_club_id],
    queryFn: () => {
      const filters = {};
      if (currentUser?.active_tenant_id) filters.tenant_id = currentUser.active_tenant_id;
      if (currentUser?.active_club_id) filters.club_id = currentUser.active_club_id;
      return Object.keys(filters).length
        ? base44.entities.Player.filter(filters, 'full_name', 500)
        : base44.entities.Player.list('full_name', 500);
    },
    enabled: !!currentUser
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => base44.entities.Tournament.list('-created_date', 50)
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-created_date', 50)
  });

  const { data: pendingApprovalCount = 0 } = useQuery({
    queryKey: ['pending-approval-count'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminUserTools', { action: 'pending_approval_count' });
      if (res.data?.error) throw new Error(res.data.error);
      return Number(res.data?.pendingCount || 0);
    },
    enabled: currentUser?.role === 'admin',
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
  });

  const activeTournaments = tournaments.filter(t => t.status === 'In Progress' || t.status === 'Registration Open');
  const todayMatches = matches.filter(m => {
    if (!m.scheduled_time) return false;
    const d = new Date(m.scheduled_time).toDateString();
    return d === new Date().toDateString();
  });
  // Do not manufacture a 3.0 skill rating for unrated members. Until RallyHub has
  // verified DUPR data, the dashboard shows a neutral club roster preview rather
  // than presenting legacy/default skill values as a ranking.
  const topPlayers = [...players].filter(p => p.status === 'Active').sort((a, b) => String(a.full_name || '').localeCompare(String(b.full_name || ''))).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Pickleball tournament command center">
        <Link to="/app/players">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" /> Import Players
          </Button>
        </Link>
        <Link to="/app/tournaments?create=1">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Create Competition
          </Button>
        </Link>
      </PageHeader>

      {currentUser?.role === 'admin' && pendingApprovalCount > 0 && (
        <Link
          to="/app/admin?tab=approvals"
          className="block rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 hover:bg-amber-500/15 transition-colors"
          aria-label={`Review ${pendingApprovalCount} pending approvals`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">
                {pendingApprovalCount} {pendingApprovalCount === 1 ? 'approval needs' : 'approvals need'} your attention
              </p>
              <p className="text-sm text-muted-foreground">Tap here to review the pending RallyHub users.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="min-w-7 h-7 px-2 rounded-full bg-amber-400 text-black text-sm font-black flex items-center justify-center">
                {pendingApprovalCount}
              </span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Players" value={players.length} icon={Users} trend={`${players.filter(p => p.status === 'Active').length} active`} trendUp delay={0} accentColor="primary" />
        <StatCard title="Active Tournaments" value={activeTournaments.length} icon={Trophy} delay={0.1} accentColor="accent" />
        <StatCard title="Matches Today" value={todayMatches.length} icon={Swords} delay={0.2} accentColor="chart-3" />
        <StatCard title="DUPR Rated" value={players.filter(p => p.dupr_rating != null).length} icon={Crown} delay={0.3} accentColor="chart-4" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Club roster preview — not a rating leaderboard until genuine DUPR is connected */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Club Players</h3>
            <Link to="/app/players" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topPlayers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No players yet</p>}
            {topPlayers.map((player, i) => (
              <Link key={player.id} to={`/app/players/${player.id}`} className="flex items-center gap-3 group">
                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{(player.full_name || 'P')[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{player.full_name}</p>
                  <p className="text-xs text-muted-foreground">{player.club || 'No club'}</p>
                </div>
                {player.dupr_rating != null && <span className="text-sm font-bold font-mono text-primary">DUPR {Number(player.dupr_rating).toFixed(2)}</span>}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Active Tournaments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Active Tournaments</h3>
            <Link to="/app/tournaments" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeTournaments.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No active tournaments</p>}
            {activeTournaments.map(t => (
              <Link key={t.id} to={`/app/tournaments/${t.id}`} className="glass rounded-lg p-3 block hover:scale-[1.01] transition-transform">
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