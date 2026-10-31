import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Trophy, Crown, ArrowRight, Plus, Upload, BellRing, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import StatCard from '@/components/shared/StatCard';
import PageHeader from '@/components/shared/PageHeader';
import { addDays, format } from 'date-fns';
import MemberPortalDashboard from '@/components/member/MemberPortalDashboard';
import ClubCommandOverview from '@/components/ccc/ClubCommandOverview';
import ClubSchedulePanel from '@/components/ccc/ClubSchedulePanel';
import ClubActivityPlanner from '@/components/ccc/ClubActivityPlanner';
import ClubHostWorkspace from '@/components/ccc/ClubHostWorkspace';
import ClubPaymentPanel from '@/components/ccc/ClubPaymentPanel';
import ClubPostEventPanel from '@/components/ccc/ClubPostEventPanel';
import { READ_STALE_MS, READ_GC_MS, shouldRetryRead, readRetryDelay } from '@/lib/ccc/readResilience';

export default function Dashboard() {
  const { data: currentUser = null } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const isMemberView = !!currentUser && currentUser?.role !== 'admin' && currentUser?.active_club_role !== 'club_admin';

  const { data: memberCounts = null } = useQuery({
    queryKey: ['membership-dashboard-counts', currentUser?.active_tenant_id, currentUser?.active_club_id],
    queryFn: async () => {
      const res = await base44.functions.invoke('membershipRecord', { action: 'admin_dashboard_counts' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.counts || {};
    },
    enabled: !!currentUser && !isMemberView,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
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
    enabled: !!currentUser && !isMemberView
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
    enabled: !!currentUser && !isMemberView
  });

  const { data: clubLeaderboard = { rows: [] } } = useQuery({
    queryKey: ['performance-analytics-club'],
    queryFn: async () => {
      const res = await base44.functions.invoke('performanceAnalytics', { action: 'club' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    enabled: !!currentUser && !isMemberView
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

  const { data: membershipAttention = { approvalCount: 0, paymentFollowUpCount: 0 } } = useQuery({
    queryKey: ['membership-application-attention-count', currentUser?.active_tenant_id, currentUser?.active_club_id],
    queryFn: async () => {
      const res = await base44.functions.invoke('membershipApplication', { action: 'admin_count' });
      if (res.data?.error) throw new Error(res.data.error);
      return { approvalCount: Number(res.data?.approvalCount || 0), paymentFollowUpCount: Number(res.data?.paymentFollowUpCount ?? res.data?.pendingCount ?? 0) };
    },
    enabled: !!currentUser && (currentUser?.role === 'admin' || currentUser?.active_club_role === 'club_admin'),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
  });

  const pendingMembershipApplicationCount = membershipAttention.paymentFollowUpCount;
  const pendingMembershipDecisionCount = membershipAttention.approvalCount;

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

  const { data: pendingSessionBookingCount = 0 } = useQuery({
    queryKey: ['guest-access-requests','pending-count', currentUser?.active_tenant_id, currentUser?.active_club_id],
    queryFn: async () => {
      const res = await base44.functions.invoke('guestAccessJourney', { action: 'admin_pending_count' });
      if (res.data?.error) throw new Error(res.data.error);
      return Number(res.data?.pendingCount || 0);
    },
    enabled: !!currentUser && (currentUser?.role === 'admin' || currentUser?.active_club_role === 'club_admin'),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
  });

  const { data: clubSessions = [], isLoading: sessionsLoading, isError: sessionsError } = useQuery({
    queryKey: ['ccc-club-session-links', currentUser?.active_tenant_id, currentUser?.active_club_id],
    retry: shouldRetryRead,
    retryDelay: readRetryDelay,
    staleTime: READ_STALE_MS,
    gcTime: READ_GC_MS,
    refetchOnWindowFocus: false,
    queryFn: () => base44.entities.GuestSessionLink.filter({
      tenant_id: currentUser.active_tenant_id,
      club_id: currentUser.active_club_id
    }, '-session_date', 250),
    enabled: !!currentUser?.active_tenant_id && !!currentUser?.active_club_id && currentUser?.role === 'admin'
  });

  const { data: clubPayments = [], isLoading: paymentsLoading, isError: paymentsError } = useQuery({
    queryKey: ['ccc-club-payment-records', currentUser?.active_tenant_id, currentUser?.active_club_id],
    retry: shouldRetryRead,
    retryDelay: readRetryDelay,
    staleTime: READ_STALE_MS,
    gcTime: READ_GC_MS,
    refetchOnWindowFocus: false,
    queryFn: () => base44.entities.PaymentRecord.filter({
      tenant_id: currentUser.active_tenant_id,
      club_id: currentUser.active_club_id
    }, '-created_date', 250),
    enabled: !!currentUser?.active_tenant_id && !!currentUser?.active_club_id && currentUser?.role === 'admin'
  });

  const { data: guestBookings = [], isLoading: bookingsLoading, isError: bookingsError } = useQuery({
    queryKey: ['ccc-guest-bookings', currentUser?.active_tenant_id, currentUser?.active_club_id],
    retry: shouldRetryRead,
    retryDelay: readRetryDelay,
    staleTime: READ_STALE_MS,
    gcTime: READ_GC_MS,
    refetchOnWindowFocus: false,
    queryFn: () => base44.entities.GuestSessionBooking.filter({tenant_id:currentUser.active_tenant_id,club_id:currentUser.active_club_id}, '-created_date', 500),
    enabled: !!currentUser?.active_tenant_id && !!currentUser?.active_club_id && currentUser?.role === 'admin',
  });
  const { data: guestAttendance = [], isLoading: attendanceLoading, isError: attendanceError } = useQuery({
    queryKey: ['ccc-guest-attendance', currentUser?.active_tenant_id, currentUser?.active_club_id],
    retry: shouldRetryRead,
    retryDelay: readRetryDelay,
    staleTime: READ_STALE_MS,
    gcTime: READ_GC_MS,
    refetchOnWindowFocus: false,
    queryFn: () => base44.entities.GuestSessionAttendance.filter({tenant_id:currentUser.active_tenant_id,club_id:currentUser.active_club_id}, '-created_date', 500),
    enabled: !!currentUser?.active_tenant_id && !!currentUser?.active_club_id && currentUser?.role === 'admin',
  });
  const { data: followupAttempts = [], isLoading: followupLoading, isError: followupError } = useQuery({
    queryKey: ['ccc-followup-attempts', currentUser?.active_tenant_id, currentUser?.active_club_id],
    retry: shouldRetryRead,
    retryDelay: readRetryDelay,
    staleTime: READ_STALE_MS,
    gcTime: READ_GC_MS,
    refetchOnWindowFocus: false,
    queryFn: () => base44.entities.CommunicationDeliveryAttempt.filter({tenant_id:currentUser.active_tenant_id}, '-created_date', 500),
    enabled: !!currentUser?.active_tenant_id && !!currentUser?.active_club_id && currentUser?.role === 'admin',
  });

  const scheduleFrom = format(new Date(), 'yyyy-MM-dd');
  const scheduleTo = format(addDays(new Date(), 14), 'yyyy-MM-dd');

  const activeTournaments = tournaments.filter(t => t.status === 'In Progress' || t.status === 'Registration Open');
  const topPlayers = (clubLeaderboard.rows || []).slice(0, 5);

  if (isMemberView) return <MemberPortalDashboard />;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Club operations and sporting activity">
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

      <ClubCommandOverview membershipApprovals={pendingMembershipDecisionCount} membershipPayments={pendingMembershipApplicationCount} guestApprovals={pendingSessionBookingCount} directoryApprovals={pendingDirectoryApprovalCount} isPlatformAdmin={currentUser?.role === 'admin'} />

      {currentUser?.active_tenant_id && currentUser?.active_club_id && <ClubHostWorkspace key={'host:'+currentUser.active_tenant_id+':'+currentUser.active_club_id} tenantId={currentUser.active_tenant_id} clubId={currentUser.active_club_id} />}
      {currentUser?.role === 'admin' && <ClubActivityPlanner key={`${currentUser?.active_tenant_id||''}:${currentUser?.active_club_id||''}`} tenantId={currentUser?.active_tenant_id} clubId={currentUser?.active_club_id} />}

      {currentUser?.role === 'admin' && <ClubSchedulePanel tenantId={currentUser?.active_tenant_id} clubId={currentUser?.active_club_id} sessions={clubSessions} fromDate={scheduleFrom} toDate={scheduleTo} loading={sessionsLoading} error={sessionsError} />}

      {currentUser?.role === 'admin' && <ClubPaymentPanel tenantId={currentUser?.active_tenant_id} clubId={currentUser?.active_club_id} payments={clubPayments} loading={paymentsLoading} error={paymentsError} />}

      {currentUser?.role === 'admin' && <ClubPostEventPanel tenantId={currentUser?.active_tenant_id} clubId={currentUser?.active_club_id} sessions={clubSessions} bookings={guestBookings} attendance={guestAttendance} attempts={followupAttempts} fromDate={format(addDays(new Date(), -14), 'yyyy-MM-dd')} toDate={scheduleFrom} loading={sessionsLoading||bookingsLoading||attendanceLoading||followupLoading} error={sessionsError||bookingsError||attendanceError||followupError} />}

      {((currentUser?.role === 'admin' && (pendingMembershipApprovalCount > 0 || pendingDirectoryApprovalCount > 0)) || pendingMembershipApplicationCount > 0 || pendingMembershipDecisionCount > 0 || pendingSessionBookingCount > 0) && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pendingSessionBookingCount > 0 && (
            <Link
              to="/app/guest-bookings"
              className="block rounded-xl border border-violet-400/40 bg-violet-500/10 p-4 hover:bg-violet-500/15 transition-colors"
              aria-label={`Review ${pendingSessionBookingCount} pending session booking requests`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-400/20 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5 text-violet-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">Session Bookings</p>
                  <p className="text-sm text-muted-foreground">{pendingSessionBookingCount} {pendingSessionBookingCount === 1 ? 'request needs' : 'requests need'} your attention.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="min-w-7 h-7 px-2 rounded-full bg-violet-400 text-black text-sm font-black flex items-center justify-center">{pendingSessionBookingCount}</span>
                  <ArrowRight className="w-4 h-4 text-violet-300" />
                </div>
              </div>
            </Link>
          )}

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
                  <p className="font-bold text-foreground">Account approvals</p>
                  <p className="text-sm text-muted-foreground">{pendingMembershipApprovalCount} {pendingMembershipApprovalCount === 1 ? 'account needs' : 'accounts need'} your attention.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="min-w-7 h-7 px-2 rounded-full bg-amber-400 text-black text-sm font-black flex items-center justify-center">{pendingMembershipApprovalCount}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </div>
              </div>
            </Link>
          )}

          {pendingMembershipDecisionCount > 0 && (
            <Link to="/app/membership#membership-applications" className="block rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 hover:bg-amber-500/15 transition-colors" aria-label={`Review ${pendingMembershipDecisionCount} pending club membership approvals`}>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">Membership Approvals</p>
                  <p className="text-sm text-muted-foreground">{pendingMembershipDecisionCount} {pendingMembershipDecisionCount === 1 ? 'new member awaits' : 'new members await'} your decision.</p>
                </div>
                <span className="min-w-7 h-7 px-2 rounded-full bg-amber-400 text-black text-sm font-black flex items-center justify-center">{pendingMembershipDecisionCount}</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </div>
            </Link>
          )}

          {pendingMembershipApplicationCount > 0 && (
            <Link
              to="/app/membership#membership-applications"
              className="block rounded-xl border border-blue-400/40 bg-blue-500/10 p-4 hover:bg-blue-500/15 transition-colors"
              aria-label={`Review ${pendingMembershipApplicationCount} membership applications awaiting action`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-blue-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">Membership applications</p>
                  <p className="text-sm text-muted-foreground">{pendingMembershipApplicationCount} {pendingMembershipApplicationCount === 1 ? 'application needs' : 'applications need'} payment or follow-up.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="min-w-7 h-7 px-2 rounded-full bg-blue-400 text-black text-sm font-black flex items-center justify-center">{pendingMembershipApplicationCount}</span>
                  <ArrowRight className="w-4 h-4 text-blue-300" />
                </div>
              </div>
            </Link>
          )}

          {currentUser?.role === 'admin' && pendingDirectoryApprovalCount > 0 && (
            <Link
              to="/app/admin?tab=directory&focus=pending-actions"
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
        <StatCard title="Current Members" value={memberCounts?.currentMembers ?? "—"} icon={Users} delay={0} accentColor="primary" to="/app/membership" />
        <StatCard title="Active Tournaments" value={activeTournaments.length} icon={Trophy} delay={0.1} accentColor="accent" to="/app/tournaments" />
        <StatCard title="Leaderboard Players" value={(clubLeaderboard.rows || []).length} icon={Crown} delay={0.2} accentColor="chart-3" to="/app/leaderboard" />
        <StatCard title="DUPR Rated" value={players.filter(p => p.dupr_rating != null).length} icon={Crown} delay={0.3} accentColor="chart-4" to="/app/players" />
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