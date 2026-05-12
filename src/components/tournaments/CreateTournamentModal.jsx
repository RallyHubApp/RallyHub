import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Users, User, Shuffle, Crown } from 'lucide-react';

const FORMATS = [
  { value: 'Single Elimination', label: 'Single Elimination', desc: 'Classic knockout — lose once and you\'re out. Seeds placed to avoid early top clashes.' },
  { value: 'Double Elimination', label: 'Double Elimination', desc: 'Two lives — losers drop to a consolation bracket, guaranteeing at least 2 matches.' },
  { value: 'Consolation (FRLC)', label: 'Consolation (FRLC)', desc: 'First-round losers continue in a parallel consolation bracket. Guarantees 2 matches.' },
  { value: 'Round Robin', label: 'Round Robin', desc: 'Everyone plays everyone. Best for 4–12 entries. Fair ranking, more matches.' },
  { value: 'Compass Draw', label: 'Compass Draw', desc: 'Winners go North, losers go West/South. Guarantees 3–4 matches per player.' },
  { value: 'Ladder League', label: 'Ladder League', desc: 'Ongoing league ladder — challenge up or down.' },
  { value: 'King of the Court', label: 'King of the Court', desc: 'Winners stay on court, challengers rotate in.' },
  { value: 'Mixed Doubles', label: 'Mixed Doubles', desc: 'Fixed male/female pairs.' },
];

const PARTNERSHIP_TYPES = [
  { value: 'Singles', label: 'Singles', icon: User, desc: 'Individual players compete solo' },
  { value: 'Fixed Partners', label: 'Fixed Partners', icon: Users, desc: 'Pre-set doubles pairs (upload from spreadsheet)' },
  { value: 'Random Partners', label: 'Random Partners', icon: Shuffle, desc: 'Partners randomly assigned on the day' },
];

export default function CreateTournamentModal({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState({
    name: '', format: 'Single Elimination', partnership_type: 'Singles',
    inter_club: false, start_date: '', end_date: '',
    location: '', max_players: '', description: '', prize_info: '',
    skill_range_min: '', skill_range_max: '',
    kotc_num_courts: 4, kotc_num_rounds: 9, kotc_score_format: 'first_11',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.format) { toast.error('Name and format are required'); return; }
    setSaving(true);
    await base44.entities.Tournament.create({
      ...form,
      max_players: form.max_players ? Number(form.max_players) : undefined,
      skill_range_min: form.skill_range_min ? Number(form.skill_range_min) : undefined,
      skill_range_max: form.skill_range_max ? Number(form.skill_range_max) : undefined,
      kotc_num_courts: Number(form.kotc_num_courts) || 4,
      kotc_num_rounds: Number(form.kotc_num_rounds) || 9,
      status: 'Draft',
      player_ids: [],
      partner_pairs: []
    });
    toast.success('Tournament created!');
    setSaving(false);
    onCreated?.();
    onOpenChange(false);
    setForm({ name: '', format: 'Single Elimination', partnership_type: 'Singles', inter_club: false, start_date: '', end_date: '', location: '', max_players: '', description: '', prize_info: '', skill_range_min: '', skill_range_max: '', kotc_num_courts: 4, kotc_num_rounds: 9, kotc_score_format: 'first_11' });
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const selectedFormat = FORMATS.find(f => f.value === form.format);
  const isKotc = form.format === 'King of the Court';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Tournament</DialogTitle>
          <DialogDescription className="text-muted-foreground">Configure draw format and partnership type</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label className="text-foreground text-sm">Tournament Name *</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Summer Tournival 2026" className="bg-secondary border-border mt-1" />
          </div>

          {/* Draw Format */}
          <div>
            <Label className="text-foreground text-sm">Draw Format *</Label>
            <div className="grid gap-2 mt-1">
              {FORMATS.map(f => (
                <label key={f.value} className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  form.format === f.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                )}>
                  <input type="radio" name="format" value={f.value} checked={form.format === f.value} onChange={() => update('format', f.value)} className="mt-0.5 accent-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* King of the Court config */}
          {isKotc && (
            <div className="glass rounded-xl p-4 space-y-3 border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <p className="text-sm font-semibold text-foreground">King of the Court Settings</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Courts</Label>
                  <Input type="number" min={1} max={8} value={form.kotc_num_courts}
                    onChange={e => update('kotc_num_courts', e.target.value)}
                    className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rounds</Label>
                  <Select value={String(form.kotc_num_rounds)} onValueChange={v => update('kotc_num_rounds', v)}>
                    <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 rounds</SelectItem>
                      <SelectItem value="8">8 rounds</SelectItem>
                      <SelectItem value="9">9 rounds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Match Format</Label>
                <Select value={form.kotc_score_format} onValueChange={v => update('kotc_score_format', v)}>
                  <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timed_10">10-min timed rounds</SelectItem>
                    <SelectItem value="first_7">First to 7</SelectItem>
                    <SelectItem value="first_11">First to 11</SelectItem>
                    <SelectItem value="first_15">First to 15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Partnership Type */}
          <div>
            <Label className="text-foreground text-sm">Partnership Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {PARTNERSHIP_TYPES.map(pt => (
                <label key={pt.value} className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-lg border cursor-pointer transition-all text-center',
                  form.partnership_type === pt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                )}>
                  <input type="radio" name="partnership_type" value={pt.value} checked={form.partnership_type === pt.value} onChange={() => update('partnership_type', pt.value)} className="sr-only" />
                  <pt.icon className={cn('w-4 h-4', form.partnership_type === pt.value ? 'text-primary' : 'text-muted-foreground')} />
                  <p className="text-xs font-medium text-foreground">{pt.label}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Inter-club toggle */}
          <label className={cn(
            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
            form.inter_club ? 'border-accent bg-accent/5' : 'border-border'
          )}>
            <input type="checkbox" checked={form.inter_club} onChange={e => update('inter_club', e.target.checked)} className="accent-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Inter-Club Challenge</p>
              <p className="text-xs text-muted-foreground">Track club affiliations and generate club-vs-club results</p>
            </div>
          </label>

          {/* Dates + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-foreground text-sm">Start Date</Label>
              <Input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-foreground text-sm">End Date</Label>
              <Input type="date" value={form.end_date} onChange={e => update('end_date', e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-foreground text-sm">Location / Venue</Label>
            <Input value={form.location} onChange={e => update('location', e.target.value)} placeholder="Club name or address" className="bg-secondary border-border mt-1" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-foreground text-sm">Max Players</Label>
              <Input type="number" value={form.max_players} onChange={e => update('max_players', e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-foreground text-sm">Min Rating</Label>
              <Input type="number" step="0.1" value={form.skill_range_min} onChange={e => update('skill_range_min', e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-foreground text-sm">Max Rating</Label>
              <Input type="number" step="0.1" value={form.skill_range_max} onChange={e => update('skill_range_max', e.target.value)} className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-foreground text-sm">Description</Label>
            <Textarea value={form.description} onChange={e => update('description', e.target.value)} className="bg-secondary border-border mt-1" rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? 'Creating…' : 'Create Tournament'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}