import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  LogIn, Users, CalendarDays, ArrowRight, CheckCircle2,
  UserPlus, RefreshCw, ChevronRight, Loader2, AlertCircle, Eye, EyeOff
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
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(() => sessionStorage.getItem('rallyhub_spond_token') || '');

  // Groups + events
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Attendees
  const [attendees, setAttendees] = useState([]);
  const [waitingListCount, setWaitingListCount] = useState(0);
  const [matchChoices, setMatchChoices] = useState({});

  const invoke = (action, extra = {}) =>
    base44.functions.invoke('spondIntegration', { action, spondToken: token, ...extra });

  useEffect(() => {
    if (!open || !token || step !== 'login') return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const gr = await base44.functions.invoke('spondIntegration', { action: 'get_groups', spondToken: token });
        if (!cancelled && gr.data?.groups) {
          const last = localStorage.getItem('rallyhub_spond_group_id') || tournament?.kotc_spond_group_id || '';
          setGroups([...gr.data.groups].sort((a,b)=>Number(b.id===last)-Number(a.id===last)));
          setStep('select_group');
        }
      } catch {
        sessionStorage.removeItem('rallyhub_spond_token');
        if (!cancelled) setToken('');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, token, step]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('spondIntegration', { action: 'login', spondEmail: email, spondPassword: password });
      if (res.data?.token) {
        setToken(res.data.token);
        sessionStorage.setItem('rallyhub_spond_token', res.data.token);
        const gr = await base44.functions.invoke('spondIntegration', { action: 'get_groups', spondToken: res.data.token });
        const last = localStorage.getItem('rallyhub_spond_group_id') || tournament?.kotc_spond_group_id || '';
        setGroups([...(gr.data?.groups || [])].sort((a,b)=>Number(b.id===last)-Number(a.id===last)));
        setStep('select_group');
      } else {
        setError(res.data?.error || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    localStorage.setItem('rallyhub_spond_group_id', group.id);
    setLoading(true);
    setError('');
    try {
      const targetDate = String(tournament?.start_date || '').match(/\d{4}-\d{2}-\d{2}/)?.[0] || undefined;
      const res = await invoke('get_events', { groupId: group.id, targetDate });
      if (res.data?.events) {
        // Belt-and-braces date guard: Spond's internal API can surface scheduled
        // recurring-series records outside the requested range. Never trust that
        // filter alone. The browser independently enforces the exact RallyHub date
        // in Europe/Dublin before an occurrence is allowed into the picker.
        const irelandDate = value => {
          try {
            const parts = new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Dublin', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date(value));
            const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
            return `${p.year}-${p.month}-${p.day}`;
          } catch { return ''; }
        };
        const exactEvents = targetDate
          ? res.data.events.filter(ev => ev?.startTimestamp && irelandDate(ev.startTimestamp) === targetDate)
          : res.data.events;
        setEvents(exactEvents);
        if (targetDate && res.data.events.length !== exactEvents.length) {
          console.warn(`[RallyHub Spond] Rejected ${res.data.events.length - exactEvents.length} occurrence(s) outside ${targetDate}.`);
        }
        setStep('select_event');
      } else {
        setError(res.data?.error || 'Could not load events');
      }
    } catch (err) {
      setError(err?.message || 'Could not load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = async (event) => {
    setSelectedEvent(event);
    setLoading(true);
    setError('');
    try {
      const targetDate = String(tournament?.start_date || '').match(/\d{4}-\d{2}-\d{2}/)?.[0] || undefined;
      const res = await invoke('get_attendees', { groupId: selectedGroup.id, eventId: event.id, tournamentId: tournament.id, targetDate });
      if (res.data?.attendees) {
        setAttendees(res.data.attendees);
        setMatchChoices({});
        setWaitingListCount(Number(res.data.waitingListCount || 0));
        setStep('preview');
      } else {
        setError(res.data?.error || 'Could not load attendees');
      }
    } catch (err) {
      setError(err?.message || 'Could not load attendees');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setError('');
    try {
      const targetDate = String(tournament?.start_date || '').match(/\d{4}-\d{2}-\d{2}/)?.[0] || undefined;
      const res = await base44.functions.invoke('spondIntegration', {
        action: 'import_attendees',
        spondToken: token,
        tournamentId: tournament.id,
        groupId: selectedGroup.id,
        eventId: selectedEvent.id,
        targetDate,
        matchChoices: Object.entries(matchChoices).map(([spondId, playerId]) => ({ spondId, playerId })),
        replaceRoster: tournament?.format === 'King of the Court',
      });
      if (res.data?.success) {
        toast.success(`Imported ${res.data.created} new + ${res.data.matched} matched players!`);
        onImported(res.data);
        setStep('done');
      } else {
        setError(res.data?.error || 'Import failed');
      }
    } catch (err) {
      setError(err?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('login');
    setEmail('');
    setPassword('');
    setGroups([]);
    setSelectedGroup(null);
    setEvents([]);
    setSelectedEvent(null);
    setAttendees([]);
    setWaitingListCount(0);
    setMatchChoices({});
    setError('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };

  const newCount = attendees.filter(a => a.status === 'new').length;
  const matchedCount = attendees.filter(a => a.status === 'matched').length;
  const ambiguousCount = attendees.filter(a => a.status === 'ambiguous' && !matchChoices[a.spondId]).length;
  const recommendedCourts = recommendCourts(attendees.length);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 font-black text-xs">S</span>
            </div>
            {tournament?.format === 'King of the Court' ? 'Refresh roster from Spond' : 'Import from Spond'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {tournament?.format === 'King of the Court' ? 'Choose the exact Spond event and sync confirmed attendees into this session roster.' : 'Pull confirmed attendees from a Spond event directly into this tournament'}
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
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-secondary border-input pr-9"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Select the matching Spond occurrence from <strong className="text-foreground">{selectedGroup?.name}</strong>:
              </p>
              {tournament?.start_date && <p className="text-[11px] text-primary">Showing only Spond occurrences on the RallyHub session date: {new Date(`${String(tournament.start_date).slice(0,10)}T12:00:00`).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone:'Europe/Dublin' })}</p>}
            </div>
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
                        {ev.startTimestamp ? new Date(ev.startTimestamp).toLocaleString('en-IE', { timeZone:'Europe/Dublin', weekday:'short', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : ''}
                        {ev.location ? ` · ${ev.location}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-primary">{ev.attendingCount} going</p>
                    </div>
                  </button>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-6 space-y-1">
                    <p className="text-xs text-muted-foreground">No Spond occurrence found for this session date.</p>
                    <p className="text-[10px] text-muted-foreground">Use Refresh once. If it is still empty, check the RallyHub session date or choose the correct Spond group.</p>
                  </div>
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

                {waitingListCount > 0 && <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2.5 text-xs text-amber-500">{waitingListCount} waiting-list member{waitingListCount === 1 ? '' : 's'} excluded from the playing roster.</div>}
                {ambiguousCount > 0 && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">{ambiguousCount} attendee{ambiguousCount===1?' needs':'s need'} identity confirmation before the roster can be refreshed.</div>}

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
                <div className="max-h-56 overflow-auto space-y-1">
                  {attendees.map((a, i) => (
                    <div key={i} className="p-2 rounded-lg hover:bg-secondary transition-colors border border-transparent">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{a.fullName?.[0] || '?'}</div>
                        <span className="text-xs text-foreground flex-1 truncate">{a.fullName || 'Unknown'}</span>
                        <Badge className={cn('text-[10px] shrink-0', a.status === 'matched' ? 'bg-green-500/10 text-green-400 border-green-500/20' : a.status==='ambiguous'?'bg-destructive/10 text-destructive border-destructive/20':'bg-accent/10 text-accent border-accent/20')}>
                          {a.status === 'matched' ? <><CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" />matched</> : a.status==='ambiguous'?'check match':<><UserPlus className="w-2.5 h-2.5 mr-0.5 inline" />new guest</>}
                        </Badge>
                      </div>
                      {a.status==='ambiguous'&&<select className="mt-2 w-full h-9 rounded-md bg-secondary border border-border px-2 text-xs" value={matchChoices[a.spondId]||''} onChange={e=>setMatchChoices(prev=>({...prev,[a.spondId]:e.target.value}))}><option value="">Choose existing player…</option>{(a.candidates||[]).map(c=><option key={c.id} value={c.id}>{c.name}{c.email?` · ${c.email}`:''}</option>)}</select>}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep('select_event')}>Back</Button>
                  <Button
                    onClick={handleImport}
                    disabled={loading || attendees.length === 0 || ambiguousCount > 0}
                    className="bg-primary text-primary-foreground"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    {tournament?.format === 'King of the Court' ? `Refresh roster · ${attendees.length}` : `Import ${attendees.length} Players`}
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
              <p className="text-base font-semibold text-foreground">{tournament?.format === 'King of the Court' ? 'Roster refreshed' : 'Import complete'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {tournament?.format === 'King of the Court' ? 'Confirmed Spond attendees are now the session roster. Waiting-list players were not added.' : <>Players added to <strong className="text-foreground">{tournament.name}</strong>.</>}
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