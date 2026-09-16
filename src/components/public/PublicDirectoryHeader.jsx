import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, LogIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

export default function PublicDirectoryHeader() {
  return (
    <header className="sticky top-0 z-[1001] border-b border-border/80 bg-[#0a1628]/95 backdrop-blur-xl">
      <div className="container mx-auto h-16 px-4 flex items-center gap-5">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src={LOGO_URL} alt="RallyHub" className="h-9 w-9" />
          <span className="font-black tracking-tight text-foreground">RallyHub</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          <NavLink to="/directory" className={({isActive}) => `px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Club Directory
          </NavLink>
          <NavLink to="/events" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            Events
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/directory" className="sm:hidden w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground">
            <Search className="w-5 h-5" />
          </Link>
          <Button size="sm" variant="outline" onClick={() => base44.auth.redirectToLogin('/app')} className="gap-1.5">
            <LogIn className="w-4 h-4" /> <span className="hidden xs:inline">Club app login</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
