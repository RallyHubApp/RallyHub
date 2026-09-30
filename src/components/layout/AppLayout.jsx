import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, LogOut, UserCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AppearanceQuickButton } from '@/components/appearance/AppearanceControls';
import MemberBottomNav from '@/components/member/MemberBottomNav';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated, navigateToLogin } = useAuth();
  const isMemberExperience = !!user?.id && user?.role !== 'admin' && user?.active_club_role !== 'club_admin';
  const { data: headerProfile } = useQuery({
    queryKey: ['header-profile', user?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('memberPortal', { action: 'self' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.snapshot || null;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
  const headerPhoto = headerProfile?.person?.profile_photo_url || headerProfile?.player?.avatar_url || null;
  const headerPositionX = Number(headerProfile?.photoSettings?.positionX ?? 50);
  const headerPositionY = Number(headerProfile?.photoSettings?.positionY ?? 50);
  const headerZoom = Number(headerProfile?.photoSettings?.zoom ?? 1);

  const initials = (user?.full_name || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="w-full min-w-0 max-w-full lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 w-full max-w-full sm:h-16 glass-strong flex items-center justify-between px-3 sm:px-4 lg:px-6">
          {!isMemberExperience && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground w-10 h-10 -ml-1 flex items-center justify-center rounded-lg hover:bg-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <AppearanceQuickButton />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                    {headerPhoto ? (
                      <img src={headerPhoto} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${headerPositionX}% ${headerPositionY}%`, transform: `scale(${headerZoom})`, transformOrigin: `${headerPositionX}% ${headerPositionY}%` }} />
                    ) : initials}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-medium text-foreground leading-none">{user?.full_name || 'Player'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{user?.role || 'user'}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border w-48">
                <DropdownMenuItem asChild>
                  <Link to="/app/my-profile" className="flex items-center gap-2 cursor-pointer">
                    <UserCircle className="w-3.5 h-3.5" /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                  onClick={() => logout()}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={navigateToLogin} className="gap-1.5 bg-primary text-primary-foreground">
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </Button>
          )}
          </div>
        </header>

        <main className={`w-full min-w-0 max-w-full p-3 sm:p-4 lg:p-6 overflow-x-hidden ${isMemberExperience ? 'pb-24 lg:pb-6' : ''}`}>
          <Outlet />
        </main>
      </div>
      {isMemberExperience && <MemberBottomNav />}
    </div>
  );
}