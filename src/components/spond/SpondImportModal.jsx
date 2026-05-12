import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  LogIn, Users, CalendarDays, ArrowRight, CheckCircle2,
  UserPlus, RefreshCw, ChevronRight, Loader2, AlertCircle, X
} from 'lucide-react';

const STEPS = ['login', 'select_event', 'preview', 'done'];

function recommendCourts(playerCount) {
  if (playerCount <= 8) return 2;
  if (playerCount <= 12) return 3;
  if (playerCount <= 20) return 4;
  if (playerCount <= 28) return 5;
  return Math.floor(playerCount / 4);
}

export default function SpondImportModal({ open, onOpenChange, tournament, onImported }) {
  const [step, setStep] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  // Groups + events
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Attendees
  const [attendees, setAttendees] = useState([]);

  const invoke = (action, extra = {}) =>
    base44.functions.invoke('spondIntegration', { action, spondToken: token, ...extra });

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const res = await base44.functions.invoke('spondIntegration', { action: 'login', spondEmail: email, spondPassword: password });
    setLoading(false);
    if (res.data?.token) {
      setToken(res.data.token);
      // Fetch groups
      setLoading(true);
      const gr = await base44.functions.invoke('spondIntegration', { action: 'get_groups', spondToken: res.data.token });
      setLoading(false);
      setGroups(gr.data?.groups || []);
      setStep('select_group');
    } else {
      setError(res.data?.error || 'Login failed. Check your credentials.');
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setLoading(true);
    setError('');
    const res = await invoke('get_events', { groupId: group.id });
    setLoading(false);
    if (res.data?.events) {
      setEvents(res.data.events);
      setStep('select_event');
    } else {
      setError(res.data?.error || 'Could not load events');
    }
  };

  const handleSelectEvent = async (event) => {
    setSelectedEvent(event);
    setLoading(true);
    setError('');
    const res = await invoke('get_attendees', { groupId: selectedGroup.id, eventId: event.id });
    setLoading(false);
    if (res.data?.attendees) {
      setAttendees(res.data.attendees);
      setStep('preview');
    } else {
      setError(res.data?.error || 'Could not load attendees');
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setError('');
    const res = await base44.functions.invoke('spondIntegration', {
      action: 'import_attendees',
      spondToken: token,
      attendees,
      tournamentId: tournament.id,
    });
    setLoading(false);
    if (res.data?.success) {
      toast.success(`Imported ${res.data.created} new + ${res.data.matched} matched players!`);
      onImported(res.data);
      setStep('done');
    } else {
      setError(res.data?.error || 'Import failed');
    }
  };

  const reset = () => {
    setStep('login');
    setEmail('');
    setPassword('');
    setToken('');
    setGroups([]);
    setSelectedGroup(null);
    setEvents([]);
    setSelectedEvent(null);
    setAttendees([]);
    setError('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };

  const newCount = attendees.filter(a => a.status === 'new').length;
  const matchedCount = attendees.filter(a => a.status === 'matched').length;
  const recommendedCourts = recommendCourts(attendees.length);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 font-black text-xs">S</span>
            </div>
            Import from Spond
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pull confirmed attendees from a Spond event directly into this tournament
          </DialogDescription>
        </DialogHeader>

        {/* Step progress */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          {['Connect', 'Group', 'Event', 'Preview'].map((label, i) => {
            const stepKeys = ['login', 'select_group', 'select_event', 'preview'];
            const idx = stepKeys.indexOf(step);
            const done = idx > i || step === 'done';
            const active = idx === i;
            return (
              <React.Fragment key={label}>
                <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', done ? 'text-primary' : active ? 'text-foreground' : 'text-muted-foreground/50')}>
                  {done ? <CheckCircle2 className="w-3 h-3 inline mr-0.5" /> : null}{label}
                </span>
                {i < 3 && <ChevronRight className="w-3 h-3 shrink-0 opacity-30" />}
              </React.Fragment>
            );
          })}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-3">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* ── LOGIN ── */}
        {step === 'login' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Sign in with your Spond account to access your groups and events.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Spond Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-secondary border-input"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Spond Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary border-input"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleLogin} disabled={loading || !email || !password} className="bg-primary text-primary-foreground">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <LogIn className="w-4 h-4 mr-1" />}
                Connect Spond
              </Button>
            </div>
          </div>
        )}

        {/* ── SELECT GROUP ── */}
        {step === 'select_group' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Select the Spond group your event is in:</p>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-auto">
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGroup(g)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.memberCount} members</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
                {groups.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No groups found</p>
                )}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => setStep('login')}>Back</Button>
          </div>
        )}

        {/* ── SELECT EVENT ── */}
        {step === 'select_event' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Select an event from <strong className="text-foreground">{selectedGroup?.name}</strong>:
            </p>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-auto">
                {events.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => handleSelectEvent(ev)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <CalendarDays className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ev.heading}</p>
                      <p className="text-xs text-muted-foreground">
                        {ev.startTimestamp ? new Date(ev.startTimestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        {ev.location ? ` · ${ev.location}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-primary">{ev.attendingCount} going</p>
                    </div>
                  </button>
                ))}
                {events.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No upcoming events found</p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep('select_group')}>Back</Button>
              <Button variant="ghost" size="sm" onClick={() => handleSelectGroup(selectedGroup)} disabled={loading}>
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
            </div>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {step === 'preview' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="glass rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-foreground">{attendees.length}</p>
                    <p className="text-[10px] text-muted-foreground">Attendees</p>
                  </div>
                  <div className="glass rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-green-400">{matchedCount}</p>
                    <p className="text-[10px] text-muted-foreground">Matched</p>
                  </div>
                  <div className="glass rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-accent">{newCount}</p>
                    <p className="text-[10px] text-muted-foreground">New profiles</p>
                  </div>
                </div>

                {/* Court recommendation */}
                <div className="glass rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">{recommendedCourts}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Recommended: {recommendedCourts} courts</p>
                    <p className="text-[10px] text-muted-foreground">{attendees.length} players → {recommendedCourts * 4} active, {Math.max(0, attendees.length - recommendedCourts * 4)} on bench</p>
                  </div>
                </div>

                {/* Attendee list */}
                <div className="max-h-48 overflow-auto space-y-1">
                  {attendees.map((a, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary transition-colors">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {a.fullName?.[0] || '?'}
                      </div>
                      <span className="text-xs text-foreground flex-1 truncate">{a.fullName || 'Unknown'}</span>
                      {a.email && <span className="text-[10px] text-muted-foreground truncate max-w-[100px] hidden sm:block">{a.email}</span>}
                      <Badge className={cn('text-[10px] shrink-0', a.status === 'matched' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-accent/10 text-accent border-accent/20')}>
                        {a.status === 'matched' ? <><CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" />matched</> : <><UserPlus className="w-2.5 h-2.5 mr-0.5 inline" />new</>}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep('select_event')}>Back</Button>
                  <Button
                    onClick={handleImport}
                    disabled={loading || attendees.length === 0}
                    className="bg-primary text-primary-foreground"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Import {attendees.length} Players
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Import Complete!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Players added to <strong className="text-foreground">{tournament.name}</strong>.<br />
                Head to the setup tab to configure courts and generate the draw.
              </p>
            </div>
            <Button onClick={handleClose} className="bg-primary text-primary-foreground">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}