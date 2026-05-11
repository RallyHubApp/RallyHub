import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AddPlayerModal({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', gender: '', skill_rating: '3.0',
    age_group: '', club: '', preferred_position: '', notes: ''
  });
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name) { toast.error('Name is required'); return; }
    setSaving(true);
    await base44.entities.Player.create({
      ...form,
      skill_rating: Number(form.skill_rating) || 3.0,
      wins: 0, losses: 0, matches_played: 0, status: 'Active',
      rating_history: [{ date: new Date().toISOString().split('T')[0], rating: Number(form.skill_rating) || 3.0 }]
    });
    toast.success('Player added!');
    setSaving(false);
    onCreated?.();
    onOpenChange(false);
    setForm({ full_name: '', email: '', phone: '', gender: '', skill_rating: '3.0', age_group: '', club: '', preferred_position: '', notes: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Player</DialogTitle>
          <DialogDescription className="text-muted-foreground">Add a single player</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-foreground">Full Name *</Label>
            <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="bg-secondary border-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-foreground">Email</Label>
              <Input value={form.email} onChange={e => update('email', e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-foreground">Phone</Label>
              <Input value={form.phone} onChange={e => update('phone', e.target.value)} className="bg-secondary border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-foreground">Gender</Label>
              <Select value={form.gender} onValueChange={v => update('gender', v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground">Skill Rating</Label>
              <Input type="number" step="0.1" min="2.0" max="6.0" value={form.skill_rating} onChange={e => update('skill_rating', e.target.value)} className="bg-secondary border-border" />
            </div>
          </div>
          <div>
            <Label className="text-foreground">Club</Label>
            <Input value={form.club} onChange={e => update('club', e.target.value)} className="bg-secondary border-border" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? 'Adding...' : 'Add Player'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}