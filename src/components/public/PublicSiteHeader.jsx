import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export const RALLYHUB_LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

const navItems = [
  ['Home','/'],
  ['Directory','/directory'],
  ['Clubs','/directory'],
  ['Events','/events'],
  ['About','/about'],
];

export default function PublicSiteHeader() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const loginTarget = isAuthenticated ? '/app' : `/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search || ''}`)}`;
  const isActive = to => to === '/' ? location.pathname === '/' : location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <header className="relative z-[1100] border-b border-[#e7edef] bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12">
        <Link to="/" className="flex items-center gap-2.5" aria-label="RallyHub home">
          <img src={RALLYHUB_LOGO_URL} alt="RallyHub" className="h-[48px] w-[48px] object-contain sm:h-[52px] sm:w-[52px]" />
          <div>
            <div className="text-[1.7rem] font-black leading-[.88] tracking-[-.045em] text-[#081342] sm:text-[2rem]">
              Rally<span className="text-[#078e48]">Hub</span>
            </div>
            <div className="mt-1.5 text-[7px] font-bold tracking-[.3em] text-[#0c1e53] sm:text-[8px]">
              PLAY <span className="text-[#0b914a]">•</span> CONNECT <span className="text-[#0b914a]">•</span> BELONG
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-[27px] text-[12px] font-semibold text-[#0d2258] lg:flex" aria-label="Main navigation">
          {navItems.map(([label,to]) => (
            <Link key={label} to={to} className={`border-b-2 py-[25px] transition-colors ${isActive(to) && !(label === 'Clubs' && location.pathname === '/directory') ? 'border-[#078e48] text-[#078e48]' : 'border-transparent hover:text-[#078e48]'}`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/directory" className="mr-1 rounded-full p-2 text-[#0b2258] hover:bg-[#f4faf7]" aria-label="Search"><Search className="h-5 w-5"/></Link>
          <Link to={loginTarget}>
            <Button variant="outline" className="h-10 rounded-lg border-[#cbd7dc] bg-white px-5 text-[13px] font-bold text-[#0c2257] hover:bg-[#f7faf9]">
              {isLoadingAuth ? 'Checking…' : isAuthenticated ? 'Open RallyHub' : 'Log in'}
            </Button>
          </Link>
          <Link to="/directory/add">
            <Button className="h-10 rounded-lg bg-[#078e48] px-5 text-[13px] font-bold text-white shadow-[0_6px_15px_rgba(7,142,72,.18)] hover:bg-[#067b3f]">
              Get Started
            </Button>
          </Link>
        </div>

        <button type="button" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)} className="flex h-10 items-center gap-2 px-1 text-[#092152] lg:hidden">
          <Search className="hidden h-5 w-5 sm:block"/>
          {menuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
          <span className="hidden text-sm font-semibold sm:inline">Menu</span>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-full border-t border-[#e8edef] bg-white px-4 py-4 shadow-xl lg:hidden">
          <div className="mx-auto max-w-[1380px] space-y-1">
            {navItems.map(([label,to]) => (
              <Link key={label} to={to} onClick={()=>setMenuOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-3 font-semibold text-[#0c2257] hover:bg-[#f4faf7]">
                {label}<ChevronRight className="h-4 w-4 text-[#078e48]"/>
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to={loginTarget} onClick={()=>setMenuOpen(false)}><Button variant="outline" className="w-full">{isAuthenticated ? 'Open RallyHub' : 'Log in'}</Button></Link>
              <Link to="/directory/add" onClick={()=>setMenuOpen(false)}><Button className="w-full bg-[#078e48] text-white hover:bg-[#067b3f]">Get Started</Button></Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
