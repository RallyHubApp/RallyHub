import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Trophy, Crown, ArrowRight, Plus, Upload, BellRing } from 'lucide-react';
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
    queryKey: ['dashboard-tournaments', currentUser?.active_tenant_id, currentUser?.active_club_id],
    queryFn: () => {
      const filters = {};
      if (currentUser?.active_tenant_id) filters.tenant_id = currentUser.active_tenant_id;
      if (currentUser?.active_club_id) filters.host_club_id = currentUser.active_club_id;
      return Object.keys(filters).length
        ? base44.entities.Tournament.filter(filters, '-created_date', 50)
        : [];
    },
    enabled: !!currentUser
  });

  const { data: clubLeaderboard = { rows: [] } } = useQuery({
    queryKey: ['club-leaderboard'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getClubLeaderboard', {});
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    enabled: !!currentUser
  });

  const { data: pendingMembershipApprovalCount = 0 } = useQuery({
    queryKey: ['pending-membership-approval-count'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminUserTools', { action: 'pending_approval_count' });
      if (res.data?.error) throw new Error(res.data.error);
      return Number(res.data?.pendingCount || 0);
    },
    enabled: currentUser?.role === 'admin',
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
  });

  const { data: pendingDirectoryApprovalCount = 0 } = useQuery({
    queryKey: ['pending-directory-approval-count'],
    queryFn: async () => {
      const res = await base44.functions.invoke('directoryClaim', { action: 'pending_admin_count' });
      if (res.data?.error) throw new Error(res.data.error);
      return Number(res.data?.pendingCount || 0);
    },
    enabled: currentUser?.role === 'admin',
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
  });

  const activeTournaments = tournaments.filter(t => t.status === 'In Progress' || t.status === 'Registration Open');
  const topPlayers = (clubLeaderboard.rows || []).slice(0, 5);

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

      {currentUser?.role === 'admin' && (pendingMembershipApprovalCount > 0 || pendingDirectoryApprovalCount > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {pendingMembershipApprovalCount > 0 && (
            <Link
              to="/app/admin?tab=approvals"
              className="block rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 hover:bg-amber-500/15 transition-colors"
              aria-label={`Review ${pendingMembershipApprovalCount} pending membership approvals`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-amber-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">Membership approvals</p>
                  <p className="text-sm text-muted-foreground">{pendingMembershipApprovalCount} {pendingMembershipApprovalCount === 1 ? 'approval needs' : 'approvals need'} your attention.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="min-w-7 h-7 px-2 rounded-full bg-amber-400 text-black text-sm font-black flex items-center justify-center">{pendingMembershipApprovalCount}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </div>
              </div>
            </Link>
          )}

          {pendingDirectoryApprovalCount > 0 && (
            <Link
              to="/app/admin?tab=directory"
              className="block rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4 hover:bg-emerald-500/15 transition-colors"
              aria-label={`Review ${pendingDirectoryApprovalCount} pending Directory approvals`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                  <BellRing className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">Directory approvals</p>
                  <p className="text-sm text-muted-foreground">{pendingDirectoryApprovalCount} {pendingDirectoryApprovalCount === 1 ? 'approval needs' : 'approvals need'} your attention.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="min-w-7 h-7 px-2 rounded-full bg-emerald-400 text-black text-sm font-black flex items-center justify-center">{pendingDirectoryApprovalCount}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Players" value={players.length} icon={Users} trend={`${players.filter(p => p.status === 'Active').length} active`} trendUp delay={0} accentColor="primary" />
        <StatCard title="Active Tournaments" value={activeTournaments.length} icon={Trophy} delay={0.1} accentColor="accent" />
        <StatCard title="Leaderboard Players" value={(clubLeaderboard.rows || []).length} icon={Crown} delay={0.2} accentColor="chart-3" />
        <StatCard title="DUPR Rated" value={players.filter(p => p.dupr_rating != null).length} icon={Crown} delay={0.3} accentColor="chart-4" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Club leaderboard preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Club Leaderboard</h3>
            <Link to="/app/leaderboard" className="text-xs text-primary hover:underline flex items-center gap-1">
              View leaderboard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topPlayers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No eligible competition results yet</p>}
            {topPlayers.map((player, i) => (
              <Link key={player.player_id} to={`/app/players/${player.player_id}`} className="flex items-center gap-3 group">
                <span className="text-xs font-bold text-muted-foreground w-5">{player.rank || i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{(player.full_name || 'P')[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{player.full_name}</p>
                  <p className="text-xs text-muted-foreground">{player.wins}W · {player.draws || 0}D · {player.losses}L · {player.matches_played} matches</p>
                </div>
                <span className="text-sm font-black font-mono text-primary">{player.leaderboard_points} pts</span>
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