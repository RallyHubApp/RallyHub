import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Crown, Zap, Flag, Trophy, ArrowLeft, ArrowRight, User, Users, Shuffle, Plus } from 'lucide-react';

const FEATURED_FORMATS = [
  { value: 'King of the Court', label: 'King of the Court', desc: 'Fast-moving court rotation for club sessions and social competition.', icon: Crown, accent: 'text-yellow-400 bg-yellow-500/10' },
  { value: 'Tournival', label: 'Tournival', desc: 'Group play followed by a seeded knockout competition.', icon: Zap, accent: 'text-accent bg-accent/10' },
  { value: 'Club Challenge', label: 'Club Challenge', desc: 'Two-club event with fairness, live scoring and event-day controls.', icon: Flag, accent: 'text-primary bg-primary/10' },
];

const OTHER_FORMATS = [
  { value: 'Round Robin', label: 'Round Robin' },
  { value: 'Single Elimination', label: 'Single Elimination' },
  { value: 'Double Elimination', label: 'Double Elimination' },
  { value: 'Consolation (FRLC)', label: 'Consolation (FRLC)' },
  { value: 'Compass Draw', label: 'Compass Draw' },
  { value: 'Ladder League', label: 'Ladder League' },
  { value: 'Mixed Doubles', label: 'Mixed Doubles' },
];

const PARTNERSHIP_TYPES = [
  { value: 'Singles', label: 'Singles', icon: User },
  { value: 'Fixed Partners', label: 'Fixed Partners', icon: Users },
  { value: 'Random Partners', label: 'Random Partners', icon: Shuffle },
];

const initialForm = {
  name: '', format: '', partnership_type: 'Singles', start_date: '', end_date: '',
  location: '', max_players: '', description: '', prize_info: '',
  skill_range_min: '', skill_range_max: '',
};

export default function CreateTournamentModal({ open, onOpenChange, onCreated, initialFormat = '' }) {
  const [step, setStep] = useState('format');
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [venues, setVenues] = useState([]);
  const [existingKotc, setExistingKotc] = useState([]);

  useEffect(() => {
    if (!open) return;
    setStep(initialFormat === 'King of the Court' ? 'kotc_choice' : initialFormat ? 'details' : 'format');
    setForm({ ...initialForm, format: initialFormat || '' });
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me().catch(() => null);
        if (!user?.active_tenant_id) return;
        const filters = { tenant_id: user.active_tenant_id, status: 'active' };
        if (user.active_club_id) filters.club_id = user.active_club_id;
        const rows = await base44.entities.Venue.filter(filters, 'name', 100);
        const tournamentRows = await base44.entities.Tournament.list('-updated_date', 100).catch(() => []);
        const kotcRows = (tournamentRows || []).filter(t => t.format === 'King of the Court' && !['Completed', 'Cancelled'].includes(t.status) && (!user.active_tenant_id || t.tenant_id === user.active_tenant_id) && (!user.active_club_id || t.host_club_id === user.active_club_id));
        if (!cancelled) { setVenues(rows || []); setExistingKotc(kotcRows); }
      } catch { if (!cancelled) setVenues([]); }
    })();
    return () => { cancelled = true; };
  }, [open, initialFormat]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const selectedFeatured = FEATURED_FORMATS.find(f => f.value === form.format);
  const selectedOther = OTHER_FORMATS.find(f => f.value === form.format);
  const selectedLabel = selectedFeatured?.label || selectedOther?.label || '';
  const usesGenericPartnership = !['King of the Court', 'Club Challenge', 'Tournival', 'Mixed Doubles'].includes(form.format);

  const chooseFormat = (format) => {
    update('format', format);
    setStep(format === 'King of the Court' ? 'kotc_choice' : 'details');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Competition name is required');
    if (!form.format) return toast.error('Choose a competition format');
    setSaving(true);
    try {
      const currentUser = await base44.auth.me().catch(() => null);
      const typedLocation = form.location.trim();
      let matchedVenue = venues.find(v => v.name?.trim().toLowerCase() === typedLocation.toLowerCase()) || null;
      if (typedLocation && !matchedVenue && currentUser?.active_tenant_id && currentUser?.active_club_id) {
        try {
          matchedVenue = await base44.entities.Venue.create({ tenant_id: currentUser.active_tenant_id, club_id: currentUser.active_club_id, name: typedLocation, status: 'active' });
          setVenues(v => [...v, matchedVenue].sort((a,b) => (a.name || '').localeCompare(b.name || '')));
        } catch (err) { console.warn('Venue could not be saved for reuse', err); }
      }

      const defaults = form.format === 'King of the Court'
        ? { kotc_num_courts: 4, kotc_num_rounds: 30, kotc_score_format: 'timed_8' }
        : form.format === 'Tournival'
          ? { kotc_num_courts: 4 }
          : {};

      const created = await base44.entities.Tournament.create({
        ...form,
        ...defaults,
        name: form.name.trim(),
        location: typedLocation,
        venue_id: matchedVenue?.id || undefined,
        inter_club: form.format === 'Club Challenge',
        partnership_type: form.format === 'Club Challenge' ? 'Random Partners' : form.partnership_type,
        tenant_id: currentUser?.active_tenant_id || undefined,
        host_club_id: currentUser?.active_club_id || undefined,
        max_players: form.max_players ? Number(form.max_players) : undefined,
        skill_range_min: form.skill_range_min ? Number(form.skill_range_min) : undefined,
        skill_range_max: form.skill_range_max ? Number(form.skill_range_max) : undefined,
        status: 'Draft',
        player_ids: [],
        partner_pairs: [],
      });
      toast.success(`${selectedLabel} created`);
      onCreated?.(created);
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || 'Could not create competition');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-2xl bg-card border-border max-h-[94dvh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
        {step === 'format' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground">Create Competition</DialogTitle>
              <DialogDescription className="text-muted-foreground">First choose what you want to run.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {FEATURED_FORMATS.map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => chooseFormat(item.value)}
                    className="group text-left rounded-2xl border border-border bg-secondary/30 p-4 hover:bg-secondary/60 hover:border-primary/40 transition-all min-h-[142px]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', item.accent)}><item.icon className="w-5 h-5" /></div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-3">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Other formats</p>
                    <p className="text-xs text-muted-foreground">Use these for standard tournament structures.</p>
                  </div>
                </div>
                <Select value="" onValueChange={chooseFormat}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Choose another format…" /></SelectTrigger>
                  <SelectContent>
                    {OTHER_FORMATS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        ) : step === 'kotc_choice' ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => setStep('format')} className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
                <div>
                  <DialogTitle className="text-foreground">King of the Court</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Start a new session or continue one you already set up.</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <Button type="button" className="w-full min-h-12 bg-primary text-primary-foreground" onClick={() => setStep('details')}><Plus className="w-4 h-4 mr-2" />New King of the Court</Button>
              <div className="rounded-xl border border-border bg-secondary/20 p-3">
                <p className="text-sm font-semibold text-foreground">Existing King of the Court</p>
                <p className="text-xs text-muted-foreground mt-1">Continue setup or resume an existing session.</p>
                <div className="space-y-2 mt-3 max-h-64 overflow-auto">
                  {existingKotc.length === 0 ? <p className="text-xs text-muted-foreground py-3 text-center">No existing KOTC sessions to continue.</p> : existingKotc.map(t => (
                    <button key={t.id} type="button" onClick={() => { onCreated?.(t); onOpenChange(false); }} className="w-full rounded-lg border border-border bg-card/50 p-3 text-left hover:border-primary/40 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-foreground truncate">{t.name}</span><Badge variant="outline" className="text-[10px] shrink-0">{t.status}</Badge></div>
                      <p className="text-xs text-muted-foreground mt-1">{t.start_date ? new Date(`${String(t.start_date).slice(0,10)}T12:00:00`).toLocaleDateString('en-IE',{weekday:'short',day:'numeric',month:'short'}) : 'Date not set'}{t.location ? ` · ${t.location}` : ''} · {(t.player_ids || []).length} players</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => setStep('format')} className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
                <div>
                  <DialogTitle className="text-foreground">{selectedLabel}</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Add the event details. Format-specific setup comes next.</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-foreground text-sm">Competition name *</Label>
                <Input autoFocus value={form.name} onChange={e => update('name', e.target.value)} placeholder={`e.g. ${selectedLabel} — Monday Night`} className="bg-secondary border-border mt-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-foreground text-sm">Date</Label>
                  <Input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-foreground text-sm">Venue</Label>
                  <Input list="rallyhub-venue-options" value={form.location} onChange={e => update('location', e.target.value)} placeholder="Choose or type a venue" className="bg-secondary border-border mt-1" />
                  <datalist id="rallyhub-venue-options">{venues.map(v => <option key={v.id} value={v.name}>{v.address || ''}</option>)}</datalist>
                </div>
              </div>

              {usesGenericPartnership && (
                <div>
                  <Label className="text-foreground text-sm">Partnership type</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    {PARTNERSHIP_TYPES.map(pt => (
                      <button key={pt.value} type="button" onClick={() => update('partnership_type', pt.value)} className={cn('rounded-xl border p-3 text-left transition-all', form.partnership_type === pt.value ? 'border-primary bg-primary/5' : 'border-border bg-secondary/20')}>
                        <pt.icon className={cn('w-4 h-4 mb-2', form.partnership_type === pt.value ? 'text-primary' : 'text-muted-foreground')} />
                        <p className="text-xs font-semibold text-foreground">{pt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!['King of the Court', 'Club Challenge', 'Tournival'].includes(form.format) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><Label className="text-foreground text-sm">Max players</Label><Input type="number" value={form.max_players} onChange={e => update('max_players', e.target.value)} className="bg-secondary border-border mt-1" /></div>
                  <div><Label className="text-foreground text-sm">Min rating</Label><Input type="number" step="0.1" value={form.skill_range_min} onChange={e => update('skill_range_min', e.target.value)} className="bg-secondary border-border mt-1" /></div>
                  <div><Label className="text-foreground text-sm">Max rating</Label><Input type="number" step="0.1" value={form.skill_range_max} onChange={e => update('skill_range_max', e.target.value)} className="bg-secondary border-border mt-1" /></div>
                </div>
              )}

              <div>
                <Label className="text-foreground text-sm">Description</Label>
                <Textarea value={form.description} onChange={e => update('description', e.target.value)} className="bg-secondary border-border mt-1" rows={2} />
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                After you create this competition, RallyHub will open the dedicated <span className="font-semibold text-foreground">{selectedLabel}</span> workspace for roster, courts, scoring and format-specific setup.
              </div>

              <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-card/95 backdrop-blur border-t border-border flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setStep('format')}><ArrowLeft className="w-4 h-4 mr-2" />Change format</Button>
                <Button type="submit" disabled={saving || !form.name.trim()} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">{saving ? 'Creating…' : `Create ${selectedLabel}`}</Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
