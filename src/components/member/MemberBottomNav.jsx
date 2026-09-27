import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, MapPin, MessageCircle, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import useMemberMessageUnread from '@/hooks/useMemberMessageUnread';

const items = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/play', label: 'Play', icon: CalendarDays },
  { to: '/app/venues', label: 'Venues', icon: MapPin },
  { to: '/app/messages', label: 'Messages', icon: MessageCircle, messages: true },
  { to: '/app/my-profile', label: 'Me', icon: UserRound },
];

export default function MemberBottomNav() {
  const { data: unread = 0 } = useMemberMessageUnread();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 pb-[env(safe-area-inset-bottom)]" aria-label="Member navigation">
      <div className="grid grid-cols-5 h-16">
        {items.map(({ to, label, icon: Icon, end, messages }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors min-w-0',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn('relative rounded-xl p-1.5', isActive && 'bg-primary/10')}><Icon className="w-5 h-5" />{messages && unread > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-black flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}</span>
                <span className="truncate max-w-full px-1">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
