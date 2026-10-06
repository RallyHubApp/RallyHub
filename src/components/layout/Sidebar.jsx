import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, Users, Trophy, Crown,
  BarChart3, X, ChevronRight, UserCircle, Shield, MapPin, CalendarCheck, ContactRound, ClipboardList,
  CalendarDays, BookOpen, Home, MessageCircle, WalletCards
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import useKotcRole from '@/hooks/useKotcRole';
import useMemberMessageUnread from '@/hooks/useMemberMessageUnread';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

const navItems = [
  { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/players', label: 'Players', icon: Users },
  { path: '/app/tournaments', label: 'Tournaments', icon: Trophy },
  { path: '/app/leaderboard', label: 'Club Leaderboard', icon: Crown },
  { path: '/app/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useKotcRole();
  const canAccessAdmin = user?.role === 'admin';
  const canManageMembership = user?.role === 'admin' || user?.active_club_role === 'club_admin';
  const isMemberExperience = !!user?.id && user?.role !== 'admin' && user?.active_club_role !== 'club_admin';
  const isSuperAdmin = role === 'super_admin';
  const { data: memberMessageUnread = 0 } = useMemberMessageUnread();
  const memberNavItems = [
    { path: '/app', label: 'Home', icon: Home },
    { path: '/app/play', label: 'Play', icon: CalendarDays },
    { path: '/app/venues', label: 'Venues', icon: MapPin },
    { path: '/app/messages', label: 'Messages', icon: MessageCircle, messages: true },
    { path: '/app/learn', label: 'Learn', icon: BookOpen },
    { path: '/app/my-profile', label: 'Me', icon: UserCircle },
  ]; 
  const superAdminNavItems = [
    { path: '/app', label: 'Dashboard', icon: LayoutDashboard, section: 'SUPER ADMIN' },
    { path: '/app/admin', label: 'Admin Panel', icon: Shield, admin: true, section: 'SUPER ADMIN' },
    { path: '/app/admin?tab=directory', label: 'Directory Admin', icon: Shield, directoryAdmin: true, section: 'SUPER ADMIN' },
    { path: '/directory', label: 'Public Directory', icon: MapPin, section: 'SUPER ADMIN' },
    { path: '/app/messages', label: 'Member Messages', icon: MessageCircle, messages: true, section: 'CLUB OPERATIONS' },
    { path: '/app/membership', label: 'Membership', icon: ContactRound, section: 'CLUB OPERATIONS' },
    { path: '/app/finance', label: 'Finance Summary', icon: WalletCards, section: 'CLUB OPERATIONS' },
    { path: '/app/waiting-list', label: 'Waiting List', icon: ClipboardList, section: 'CLUB OPERATIONS' },
    { path: '/app/players', label: 'Players', icon: Users, section: 'CLUB OPERATIONS' },
    { path: '/app/guest-bookings', label: 'Session Bookings', icon: CalendarCheck, bookingApprovals: true, section: 'CLUB OPERATIONS' },
    { path: '/app/events', label: 'Events', icon: CalendarDays, section: 'CLUB OPERATIONS' },
    { path: '/app/tournaments', label: 'Tournaments', icon: Trophy, section: 'CLUB OPERATIONS' },
    { path: '/app/trials', label: 'Club Trials', icon: ClipboardList, section: 'CLUB OPERATIONS' },
    { path: '/app/leaderboard', label: 'Club Leaderboard', icon: Crown, section: 'CLUB OPERATIONS' },
    { path: '/app/learn/manage', label: 'Learn', icon: BookOpen, section: 'CLUB OPERATIONS' },
    { path: '/app/analytics', label: 'Analytics', icon: BarChart3, section: 'CLUB OPERATIONS' },
    { path: '/app/my-profile', label: 'My Profile', icon: UserCircle, section: 'ACCOUNT' }
  ];
  const mainNavItems = isMemberExperience ? memberNavItems : isSuperAdmin ? superAdminNavItems : [
    navItems[0],
    ...(canAccessAdmin ? [{ path: '/app/messages', label: 'Member Messages', icon: MessageCircle, messages: true }] : []),
    ...(canManageMembership ? [
      { path: '/app/membership', label: 'Membership', icon: ContactRound },
      { path: '/app/finance', label: 'Finance Summary', icon: WalletCards },
      { path: '/app/waiting-list', label: 'Waiting List', icon: ClipboardList },
      { path: '/app/events', label: 'Events', icon: CalendarDays },
      { path: '/app/learn/manage', label: 'Learn Resources', icon: BookOpen }
    ] : []),
    ...navItems.slice(1)
  ];

  const { data: pendingApprovalCount = 0 } = useQuery({
    queryKey: ['pending-approval-count'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminUserTools', { action: 'pending_approval_count' });
      if (res.data?.error) throw new Error(res.data.error);
      return Number(res.data?.pendingCount || 0);
    },
    enabled: canAccessAdmin,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
  });

  const { data: pendingBookingApprovalCount = 0 } = useQuery({
    queryKey: ['guest-access-requests', 'pending-count', user?.active_tenant_id, user?.active_club_id],
    queryFn: async () => {
      const res = await base44.functions.invoke('guestAccessJourney', { action: 'admin_pending_count' });
      if (res.data?.error) throw new Error(res.data.error);
      return Number(res.data?.pendingCount || 0);
    },
    enabled: canAccessAdmin && !!user?.active_tenant_id && !!user?.active_club_id,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true
  });

  const { data: pendingDirectoryAdminCount = 0 } = useQuery({
    queryKey: ['directory-verification', 'pending-count'],
    queryFn: async () => {
      const res = await base44.functions.invoke('directoryClaim', { action: 'pending_admin_count' });
      if (res.data?.error) throw new Error(res.data.error);
      return Number(res.data?.pendingCount || 0);
    },
    enabled: canAccessAdmin && isSuperAdmin,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
  });

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-[100dvh] z-50 w-[min(88vw,18rem)] lg:w-64 bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border">
          <Link to="/app" className="flex items-center gap-2.5">
            <img 
              src={LOGO_URL} 
              alt="RallyHub" 
              className="h-9 w-9 rounded-none"
            />
            <div className="leading-tight">
              <span className="block font-black text-base text-foreground tracking-tight">RallyHub</span>
              {isSuperAdmin && <span className="block mt-0.5 text-[9px] font-black tracking-[0.14em] text-primary">SUPER ADMIN</span>}
            </div>
          </Link>
          <button onClick={onToggle} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 px-3 space-y-1 [scrollbar-width:thin]">
          {mainNavItems.map((item, index) => {
            const currentAdminTab = new URLSearchParams(location.search).get('tab');
            const directoryAdmin = item.directoryAdmin || item.path === '/app/admin?tab=directory';
            const adminPanel = item.admin || item.path === '/app/admin';
            const isActive = item.path === '/app'
              ? location.pathname === '/app' || location.pathname === '/app/'
              : directoryAdmin
                ? location.pathname === '/app/admin' && currentAdminTab === 'directory'
                : adminPanel
                  ? location.pathname === '/app/admin' && currentAdminTab !== 'directory'
                  : location.pathname.startsWith(item.path);
            const showSection = isSuperAdmin && item.section && (index === 0 || mainNavItems[index - 1]?.section !== item.section);
            return (
              <React.Fragment key={item.path}>
                {showSection && (
                  <div className={cn("px-3 pb-1 text-[10px] font-black tracking-[0.16em] text-muted-foreground/70", index > 0 && "pt-4")}>
                    {item.section}
                  </div>
                )}
                <Link
                  to={item.path}
                  onClick={(event) => {
                    if (directoryAdmin) {
                      event.preventDefault();
                      navigate('/app/admin?tab=directory');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={cn(
                    "flex min-h-10 items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? adminPanel ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary glow-green-sm"
                      : adminPanel ? "text-muted-foreground hover:text-destructive hover:bg-destructive/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className={cn("w-4.5 h-4.5 shrink-0", isActive && !adminPanel && "text-primary")} />
                  <span className="truncate">{item.label}</span>
                  {item.messages && memberMessageUnread > 0 && (
                    <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center">{memberMessageUnread > 99 ? '99+' : memberMessageUnread}</span>
                  )}
                  {item.bookingApprovals && pendingBookingApprovalCount > 0 && (
                    <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center" aria-label={`${pendingBookingApprovalCount} session booking request${pendingBookingApprovalCount === 1 ? '' : 's'} awaiting approval`} title={`${pendingBookingApprovalCount} session booking request${pendingBookingApprovalCount === 1 ? '' : 's'} awaiting approval`}>{pendingBookingApprovalCount > 99 ? '99+' : pendingBookingApprovalCount}</span>
                  )}
                  {directoryAdmin && pendingDirectoryAdminCount > 0 && (
                    <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-black text-[11px] font-black flex items-center justify-center">{pendingDirectoryAdminCount}</span>
                  )}
                  {adminPanel && pendingApprovalCount > 0 && (
                    <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-black text-[11px] font-black flex items-center justify-center">{pendingApprovalCount}</span>
                  )}
                  {isActive && !item.messages && !item.bookingApprovals && !directoryAdmin && !adminPanel && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60 shrink-0" />
                  )}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-3 pb-2 space-y-1">
          {!isMemberExperience && !isSuperAdmin && [
            ...(isSuperAdmin ? [
              { path: '/directory', label: 'Switch to Directory', icon: MapPin },
              { path: '/app/admin?tab=directory', label: 'Directory Admin', icon: Shield }
            ] : []),
            ...(canAccessAdmin ? [{ path: '/app/guest-bookings', label: 'Session Bookings', icon: CalendarCheck, bookingApprovals: true }] : []),
            ...(canAccessAdmin ? [{ path: '/app/trials', label: 'Club Trials', icon: ClipboardList }] : []),
            { path: '/app/my-profile', label: 'My Profile', icon: UserCircle },
            ...(canAccessAdmin ? [{ path: '/app/admin', label: 'Admin Panel', icon: Shield, admin: true }] : [])
          ].map(item => {
            const directoryAdmin = item.path === '/app/admin?tab=directory';
            const adminPanel = item.path === '/app/admin';
            const currentAdminTab = new URLSearchParams(location.search).get('tab');
            const isActive = directoryAdmin
              ? location.pathname === '/app/admin' && currentAdminTab === 'directory'
              : adminPanel
                ? location.pathname === '/app/admin' && currentAdminTab !== 'directory'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(event) => {
                  if (directoryAdmin) {
                    event.preventDefault();
                    navigate('/app/admin?tab=directory');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? item.admin ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary glow-green-sm"
                    : item.admin ? "text-muted-foreground hover:text-destructive hover:bg-destructive/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.bookingApprovals && pendingBookingApprovalCount > 0 && (
                  <span
                    className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center"
                    aria-label={`${pendingBookingApprovalCount} session booking request${pendingBookingApprovalCount === 1 ? '' : 's'} awaiting approval`}
                    title={`${pendingBookingApprovalCount} session booking request${pendingBookingApprovalCount === 1 ? '' : 's'} awaiting approval`}
                  >
                    {pendingBookingApprovalCount > 99 ? '99+' : pendingBookingApprovalCount}
                  </span>
                )}
                {directoryAdmin && pendingDirectoryAdminCount > 0 && (
                  <span
                    className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-black text-[11px] font-black flex items-center justify-center"
                    aria-label={`${pendingDirectoryAdminCount} pending directory actions`}
                    title={`${pendingDirectoryAdminCount} pending directory actions`}
                  >
                    {pendingDirectoryAdminCount}
                  </span>
                )}
                {item.admin && pendingApprovalCount > 0 && (
                  <span
                    className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-black text-[11px] font-black flex items-center justify-center"
                    aria-label={`${pendingApprovalCount} pending club access approvals`}
                    title={`${pendingApprovalCount} pending club access approvals`}
                  >
                    {pendingApprovalCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="shrink-0 p-3 sm:p-4 border-t border-sidebar-border bg-sidebar">
          <div className="glass rounded-lg p-3">
            <p className="text-xs text-muted-foreground truncate">{user?.full_name || user?.email || 'RallyHub'}</p>
            <p className="text-xs text-primary font-medium mt-0.5">{role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : role === 'host' ? 'Host' : 'Player'}</p>
          </div>
        </div>
      </aside>
    </>
  );
}