import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Link2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function LinkPlayerModal({ open, onOpenChange, user, onLinked }) {
  const [search, setSearch] = useState('');
  const [linking, setLinking] = useState(null);

  const { data: players = [] } = useQuery({
    queryKey: ['players-for-linking'],
    queryFn: () => base44.entities.Player.list('-created_date', 200),
    enabled: open
  });

  // Filter out already-linked players, search by name or email
  const unlinked = players.filter(p => !p.user_id || p.user_id === user?.id);
  const filtered = unlinked.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.dupr_id?.includes(q);
  });

  const linkPlayer = async (player) => {
    setLinking(player.id);
    await base44.entities.Player.update(player.id, {
      user_id: user.id,
      linked_user_email: user.email
    });
    toast.success(`"${player.full_name}" linked to your account! All match history transferred.`);
    setLinking(null);
    onLinked?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" /> Link Existing Player Record
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Search for your manually-created player record to merge all historical data.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or DUPR ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>

        <div className="max-h-64 overflow-auto space-y-1.5 mt-1">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">No unlinked players found</p>
          )}
          {filtered.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {(p.full_name || 'P')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.full_name}</p>
                <div className="flex gap-1.5 mt-0.5 flex-wrap">
                  {p.email && <span className="text-[10px] text-muted-foreground">{p.email}</span>}
                  {p.club && <Badge className="text-[10px] h-4 bg-secondary">{p.club}</Badge>}
                  <span className="text-[10px] font-mono text-primary">{(p.skill_rating || 3.0).toFixed(1)}</span>
                </div>
              </div>
              <Button
                size="sm"
                className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs"
                onClick={() => linkPlayer(p)}
                disabled={linking === p.id}
              >
                {linking === p.id ? 'Linking…' : 'Link'}
              </Button>
            </div>
          ))}
        </div>

        <div className="glass rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Linking will merge all historical matches, stats and ratings from that player record into your account.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}