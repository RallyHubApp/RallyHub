import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FORMATS = [
  'Round Robin', 'Single Elimination', 'Double Elimination',
  'Ladder League', 'King of the Court', 'Mixed Doubles'
];

export default function CreateTournamentModal({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState({
    name: '', format: '', start_date: '', end_date: '',
    location: '', max_players: '', description: '', prize_info: '',
    skill_range_min: '', skill_range_max: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.format) {
      toast.error('Name and format are required');
      return;
    }
    setSaving(true);
    await base44.entities.Tournament.create({
      ...form,
      max_players: form.max_players ? Number(form.max_players) : undefined,
      skill_range_min: form.skill_range_min ? Number(form.skill_range_min) : undefined,
      skill_range_max: form.skill_range_max ? Number(form.skill_range_max) : undefined,
      status: 'Draft',
      player_ids: []
    });
    toast.success('Tournament created!');
    setSaving(false);
    onCreated?.();
    onOpenChange(false);
    setForm({ name: '', format: '', start_date: '', end_date: '', location: '', max_players: '', description: '', prize_info: '', skill_range_min: '', skill_range_max: '' });
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Tournament</DialogTitle>
          <DialogDescription className="text-muted-foreground">Set up a new tournament</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-foreground">Name *</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Summer Open 2026" className="bg-secondary border-border" />
          </div>
          <div>
            <Label className="text-foreground">Format *</Label>
            <Select value={form.format} onValueChange={v => update('format', v)}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select format" /></SelectTrigger>
              <SelectContent>
                {FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-foreground">Start Date</Label>
              <Input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-foreground">End Date</Label>
              <Input type="date" value={form.end_date} onChange={e => update('end_date', e.target.value)} className="bg-secondary border-border" />
            </div>
          </div>
          <div>
            <Label className="text-foreground">Location</Label>
            <Input value={form.location} onChange={e => update('location', e.target.value)} placeholder="Venue" className="bg-secondary border-border" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-foreground">Max Players</Label>
              <Input type="number" value={form.max_players} onChange={e => update('max_players', e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-foreground">Min Rating</Label>
              <Input type="number" step="0.1" value={form.skill_range_min} onChange={e => update('skill_range_min', e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-foreground">Max Rating</Label>
              <Input type="number" step="0.1" value={form.skill_range_max} onChange={e => update('skill_range_max', e.target.value)} className="bg-secondary border-border" />
            </div>
          </div>
          <div>
            <Label className="text-foreground">Description</Label>
            <Textarea value={form.description} onChange={e => update('description', e.target.value)} className="bg-secondary border-border" rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? 'Creating...' : 'Create Tournament'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}