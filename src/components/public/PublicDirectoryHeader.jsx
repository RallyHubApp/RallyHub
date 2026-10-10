import { RALLYHUB_BRAND } from '@/lib/rallyhubBrand';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Menu, Search, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { AppearanceQuickButton } from '@/components/appearance/AppearanceControls';


export default function PublicDirectoryHeader() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const returnTo = `${location.pathname}${location.search || ''}`;
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  const displayName = user?.full_name || user?.display_name || user?.email || 'RallyHub account';
  const isSuperAdmin = user?.role === 'admin' && (!user?.kotc_role || user?.kotc_role === 'super_admin');
  const canUseClubApp = user?.role === 'admin' || (user?.approval_status === 'approved' && !!user?.active_tenant_id && !!user?.active_club_id);

  return (
    <header className="sticky top-0 z-[1001] border-b border-[#e7edef] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 xl:px-12">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img src={RALLYHUB_BRAND.withSignature} alt="RallyHub — Play Connect Belong" className="h-[56px] w-[205px] object-contain sm:w-[225px]" />
        </Link>

        <nav className="hidden items-center gap-[27px] text-[12px] font-semibold text-[#0d2258] lg:flex">
          <Link to="/" className="hover:text-[#078e48]">Home</Link>
          <Link to="/directory" className="hover:text-[#078e48]">Directory</Link>
          <Link to="/events" className="hover:text-[#078e48]">Events</Link>
          <Link to="/directory/help" className="hover:text-[#078e48]">Club Guide</Link>
          <Link to="/about" className="hover:text-[#078e48]">About</Link>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/directory" className="mr-1 rounded-full p-2 text-[#0b2258]" aria-label="Search directory">
            <Search className="h-5 w-5" />
          </Link>
          {!isAuthenticated ? (
            <>
              <Link to={loginHref}>
                <Button variant="outline" className="h-10 rounded-lg border-[#cbd7dc] bg-white px-5 text-[13px] font-bold text-[#0c2257] hover:bg-[#f7faf9]">
                  Log in
                </Button>
              </Link>
              <Link to="/directory/add">
                <Button className="h-10 rounded-lg bg-[#078e48] px-5 text-[13px] font-bold text-white shadow-[0_6px_15px_rgba(7,142,72,.18)] hover:bg-[#067b3f]">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="max-w-[170px] text-right leading-tight">
                <p className="text-[9px] uppercase tracking-wider text-[#738096]">Signed in</p>
                <p className="truncate text-[11px] font-semibold text-[#0c2257]" title={user?.email || displayName}>{displayName}</p>
              </div>
              <Button variant="outline" onClick={() => logout('/directory')} className="h-10 rounded-lg border-[#cbd7dc] px-4 text-[12px] font-bold text-[#0c2257]">Sign out</Button>
              {isSuperAdmin && <Button variant="outline" onClick={() => { window.location.href = '/app/admin?tab=directory'; }} className="h-10 rounded-lg border-[#cbd7dc] px-4 text-[12px] font-bold text-[#0c2257]">Directory Admin</Button>}
              {canUseClubApp && <Button onClick={() => { window.location.href = '/app'; }} className="h-10 rounded-lg bg-[#078e48] px-4 text-[12px] font-bold text-white hover:bg-[#067b3f]">Open RallyHub</Button>}
            </>
          )}
          <AppearanceQuickButton showLabel={false} />
        </div>

        <button type="button" aria-label="Menu" onClick={() => setMenuOpen(v => !v)} className="flex h-10 items-center gap-2 px-1 text-[#092152] lg:hidden">
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="hidden text-sm font-semibold sm:inline">Menu</span>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-full border-t border-[#e8edef] bg-white px-4 py-4 shadow-xl lg:hidden">
          <div className="mx-auto max-w-[1380px] space-y-1">
            {[
              ['Home','/'],
              ['Directory','/directory'],
              ['Events','/events'],
              ['Club Guide','/directory/help'],
              ['About','/about'],
            ].map(([label,to]) => (
              <Link key={label} to={to} onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-3 font-semibold text-[#0c2257] hover:bg-[#f4faf7]">
                {label}<ChevronRight className="h-4 w-4 text-[#078e48]" />
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <AppearanceQuickButton showLabel={false} />
              {!isAuthenticated ? (
                <>
                  <Link to={loginHref} onClick={() => setMenuOpen(false)} className="flex-1"><Button variant="outline" className="w-full">Log in</Button></Link>
                  <Link to="/directory/add" onClick={() => setMenuOpen(false)} className="flex-1"><Button className="w-full bg-[#078e48] text-white hover:bg-[#067b3f]">Get Started</Button></Link>
                </>
              ) : (
                <Button variant="outline" onClick={() => { setMenuOpen(false); logout('/directory'); }} className="flex-1">Sign out</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
