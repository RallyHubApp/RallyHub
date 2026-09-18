import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, Users, Trophy, Crown, 
  BarChart3, X, ChevronRight, UserCircle, Shield, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import useKotcRole from '@/hooks/useKotcRole';

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
  const { user } = useAuth();
  const { role } = useKotcRole();
  const canAccessAdmin = user?.role === 'admin';
  const isSuperAdmin = role === 'super_admin';

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
        "fixed top-0 left-0 h-full z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
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
            <span className="font-black text-base text-foreground tracking-tight">RallyHub</span>
          </Link>
          <button onClick={onToggle} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = item.path === '/app'
              ? location.pathname === '/app' || location.pathname === '/app/'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary glow-green-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className={cn("w-4.5 h-4.5", isActive && "text-primary")} />
                {item.label}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-3 pb-2 space-y-1">
          {[
            ...(isSuperAdmin ? [
              { path: '/directory', label: 'Switch to Directory', icon: MapPin },
              { path: '/app/admin?tab=directory', label: 'Directory Admin', icon: Shield }
            ] : []),
            { path: '/app/my-profile', label: 'My Profile', icon: UserCircle },
            ...(canAccessAdmin ? [{ path: '/app/admin', label: 'Admin Panel', icon: Shield, admin: true }] : [])
          ].map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? item.admin ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary glow-green-sm"
                    : item.admin ? "text-muted-foreground hover:text-destructive hover:bg-destructive/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.admin && pendingApprovalCount > 0 && (
                  <span
                    className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-black text-[11px] font-black flex items-center justify-center"
                    aria-label={`${pendingApprovalCount} pending approvals`}
                    title={`${pendingApprovalCount} pending approvals`}
                  >
                    {pendingApprovalCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="glass rounded-lg p-3">
            <p className="text-xs text-muted-foreground truncate">{user?.full_name || user?.email || 'RallyHub'}</p>
            <p className="text-xs text-primary font-medium mt-0.5">{role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : role === 'host' ? 'Host' : 'Player'}</p>
          </div>
        </div>
      </aside>
    </>
  );
}