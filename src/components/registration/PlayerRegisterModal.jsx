import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { UserPlus, CheckCircle2 } from 'lucide-react';

export default function PlayerRegisterModal({ open, onOpenChange, tournament, onRegistered }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.full_name.trim()) { toast.error('Please enter your name'); return; }
    setLoading(true);

    // Check if a player with this email already exists
    let player;
    if (form.email.trim()) {
      const existing = await base44.entities.Player.filter({ email: form.email.trim() });
      player = existing[0];
    }

    // Create player profile if not found
    if (!player) {
      player = await base44.entities.Player.create({
        full_name: form.full_name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        status: 'Active',
      });
    }

    // Register for tournament if not already registered
    const alreadyIn = tournament.player_ids?.includes(player.id);
    if (!alreadyIn) {
      await base44.entities.Tournament.update(tournament.id, {
        player_ids: [...(tournament.player_ids || []), player.id]
      });
    }

    setLoading(false);
    setDone(true);
    onRegistered?.();
  };

  const handleClose = () => {
    setDone(false);
    setForm({ full_name: '', email: '', phone: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Register for {tournament?.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your details to join the event
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <p className="text-foreground font-semibold">You're registered!</p>
            <p className="text-xs text-muted-foreground">
              Welcome to <strong>{tournament?.name}</strong>. The organiser will start the session shortly.
            </p>
            <Button onClick={handleClose} className="bg-primary text-primary-foreground w-full mt-2">Done</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Name *</label>
              <Input
                placeholder="Your full name"
                value={form.full_name}
                onChange={handle('full_name')}
                className="bg-secondary border-input"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Email (optional)</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handle('email')}
                className="bg-secondary border-input"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Phone (optional)</label>
              <Input
                type="tel"
                placeholder="+353..."
                value={form.phone}
                onChange={handle('phone')}
                className="bg-secondary border-input"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button
                onClick={submit}
                disabled={loading || !form.full_name.trim()}
                className="flex-1 bg-primary text-primary-foreground"
              >
                {loading ? <><div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-1" /> Registering…</> : 'Register'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}