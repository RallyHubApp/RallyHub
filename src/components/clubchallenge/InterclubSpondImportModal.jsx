import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CalendarDays, CheckCircle2, ChevronRight, Loader2, LogIn, Users } from 'lucide-react';

export default function InterclubSpondImportModal({ open, onOpenChange, tournament, event, side, onImported }) {
  const clubName = side === 'pool' ? 'Player Pool' : side === 'club_b' ? event?.club_b_name : event?.club_a_name;
  const poolMode = side === 'pool';
  const [step, setStep] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem('rallyhub_spond_token') || ''; } catch { return ''; }
  });
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [waitingListCount, setWaitingListCount] = useState(0);
  const [result, setResult] = useState(null);

  const invoke = (action, extra = {}, authToken = token) =>
    base44.functions.invoke('spondIntegrationWorking', {
      action,
      interclubEventId: event?.id,
      interclubSide: side,
      ...(authToken ? { spondToken: authToken } : {}),
      ...extra,
    });

  useEffect(() => {
    if (!open || !event?.id || !token || step !== 'login') return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await invoke('get_groups');
        if (res.data?.error) throw new Error(res.data.error);
        if (!cancelled) {
          setGroups(res.data?.groups || []);
          setStep('group');
        }
      } catch {
        try { sessionStorage.removeItem('rallyhub_spond_token'); } catch {}
        if (!cancelled) setToken('');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, event?.id, side, token, step]);

  const login = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('spondIntegrationWorking', {
        action:'login',
        spondEmail:email.trim(),
        spondPassword:password,
        interclubEventId:event?.id,
        interclubSide:side,
      });
      if (res.data?.error) throw new Error(res.data.error);
      if (!res.data?.token) throw new Error('Spond did not return a connection token.');
      setToken(res.data.token);
      try { sessionStorage.setItem('rallyhub_spond_token', res.data.token); } catch {}
      const groupsRes = await invoke('get_groups', {}, res.data.token);
      if (groupsRes.data?.error) throw new Error(groupsRes.data.error);
      setGroups(groupsRes.data?.groups || []);
      setStep('group');
      setPassword('');
    } catch (e) {
      setError(e?.message || 'Could not connect to Spond.');
    } finally { setLoading(false); }
  };

  const chooseGroup = async group => {
    setSelectedGroup(group);
    setSelectedEvent(null);
    setAttendees([]);
    setError('');
    setLoading(true);
    try {
      const targetDate = String(tournament?.start_date || '').match(/\d{4}-\d{2}-\d{2}/)?.[0] || undefined;
      const res = await invoke('get_events', { groupId:group.id, targetDate });
      if (res.data?.error) throw new Error(res.data.error);
      setEvents(res.data?.events || []);
      setStep('event');
    } catch (e) {
      setError(e?.message || 'Could not load Spond events.');
    } finally { setLoading(false); }
  };

  const chooseEvent = async selected => {
    setSelectedEvent(selected);
    setError('');
    setLoading(true);
    try {
      const res = await invoke('get_attendees', {
        groupId:selectedGroup.id,
        eventId:selected.id,
        selectedStartTimestamp:selected.startTimestamp,
        selectedHeading:selected.heading,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setAttendees(res.data?.attendees || []);
      setWaitingListCount(Number(res.data?.waitingListCount || 0));
      setStep('preview');
    } catch (e) {
      setError(e?.message || 'Could not load Spond attendees.');
    } finally { setLoading(false); }
  };

  const importAttendees = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await invoke('import_interclub_attendees', {
        groupId:selectedGroup.id,
        eventId:selectedEvent.id,
        selectedStartTimestamp:selectedEvent.startTimestamp,
        selectedHeading:selectedEvent.heading,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setResult(res.data);
      setStep('done');
      onImported?.(res.data);
    } catch (e) {
      setError(e?.message || 'Could not import Spond attendees.');
    } finally { setLoading(false); }
  };

  const importAnother = () => {
    setStep('group');
    setError('');
    setSelectedGroup(null);
    setEvents([]);
    setSelectedEvent(null);
    setAttendees([]);
    setWaitingListCount(0);
    setResult(null);
  };

  const close = () => {
    onOpenChange(false);
    window.setTimeout(() => {
      setStep(token ? 'group' : 'login');
      setError('');
      setSelectedGroup(null);
      setEvents([]);
      setSelectedEvent(null);
      setAttendees([]);
      setWaitingListCount(0);
      setResult(null);
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-lg max-h-[92dvh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 font-black text-xs">S</span>
            Import {clubName || 'team'} from Spond
          </DialogTitle>
          <DialogDescription>
            {poolMode ? 'Choose a Spond event. RallyHub adds only people marked Going to the shared Player Pool; waiting-list players are excluded. You can repeat this for a second Spond event.' : 'Choose the Spond event. RallyHub imports only people marked Going into this Interclub team; waiting-list players are excluded.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
          {['Connect','Group','Event','Preview'].map((label,i) => {
            const order=['login','group','event','preview'];
            const current=step==='done'?4:order.indexOf(step);
            return <React.Fragment key={label}><span className={current>=i?'text-primary font-semibold':''}>{current>i?<CheckCircle2 className="w-3 h-3 inline mr-0.5"/>:null}{label}</span>{i<3&&<ChevronRight className="w-3 h-3 opacity-30"/>}</React.Fragment>;
          })}
        </div>

        {error && <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 flex gap-2 text-xs text-destructive"><AlertCircle className="w-4 h-4 shrink-0"/><span>{error}</span></div>}

        {step==='login' && <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Connect the Spond account that can see the event. RallyHub does not store the Spond password.</p>
          <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Spond email" />
          <PasswordInput value={password} onChange={e=>setPassword(e.target.value)} placeholder="Spond password" autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&login()} />
          <Button onClick={login} disabled={loading||!email.trim()||!password} className="w-full">{loading?<Loader2 className="w-4 h-4 mr-2 animate-spin"/>:<LogIn className="w-4 h-4 mr-2"/>}{loading?'Connecting…':'Connect Spond'}</Button>
        </div>}

        {step==='group' && <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Choose the Spond group that contains the event.</p>
          {groups.map(group=><button type="button" key={group.id} onClick={()=>chooseGroup(group)} disabled={loading} className="w-full rounded-lg border border-border bg-secondary/40 p-3 flex items-center gap-3 text-left hover:border-primary/40"><Users className="w-4 h-4 text-green-400"/><div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{group.name}</p><p className="text-[10px] text-muted-foreground">{group.memberCount} members</p></div><ChevronRight className="w-4 h-4"/></button>)}
          {!groups.length&&!loading&&<p className="text-xs text-muted-foreground py-4 text-center">No Spond groups found.</p>}
        </div>}

        {step==='event' && <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Choose the exact Spond event for {poolMode ? 'this player import' : clubName}.</p>
          {events.map(item=><button type="button" key={`${item.id}-${item.startTimestamp}`} onClick={()=>chooseEvent(item)} disabled={loading} className="w-full rounded-lg border border-border bg-secondary/40 p-3 flex gap-3 text-left hover:border-primary/40"><CalendarDays className="w-4 h-4 text-primary mt-0.5"/><div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{item.heading}</p><p className="text-[10px] text-muted-foreground">{item.startTimestamp?new Date(item.startTimestamp).toLocaleString('en-IE',{timeZone:'Europe/Dublin',weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}{item.location?` · ${item.location}`:''}</p></div><Badge variant="outline">{item.attendingCount} going</Badge></button>)}
          {!events.length&&!loading&&<p className="text-xs text-muted-foreground py-4 text-center">No upcoming Spond events were returned for this group.</p>}
          <Button variant="outline" size="sm" onClick={()=>setStep('group')}>Back</Button>
        </div>}

        {step==='preview' && <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2"><div className="rounded-lg bg-secondary/50 p-3 text-center"><p className="text-2xl font-bold">{attendees.length}</p><p className="text-[10px] text-muted-foreground">Going</p></div><div className="rounded-lg bg-secondary/50 p-3 text-center"><p className="text-2xl font-bold">{waitingListCount}</p><p className="text-[10px] text-muted-foreground">Waiting list excluded</p></div></div>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">{attendees.map(person=><div key={person.spondId} className="px-3 py-2 text-sm flex items-center justify-between gap-2"><span className="font-medium">{person.fullName}</span>{person.gender&&<span className="text-[10px] text-muted-foreground">{person.gender}</span>}</div>)}</div>
          <p className="text-[11px] text-muted-foreground">{poolMode ? 'These players will be added to the shared Player Pool. Import another Spond event if needed, then drag all players into the two teams and rank each team before generating the draw.' : `Imported players are added to ${clubName} at the bottom of the current event ranking. Reorder them before generating the draw.`}</p>
          <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={()=>setStep('event')} disabled={loading}>Back</Button><Button onClick={importAttendees} disabled={loading||!attendees.length}>{loading?<Loader2 className="w-4 h-4 mr-2 animate-spin"/>:null}{loading?'Importing…':`Import ${attendees.length} Going`}</Button></div>
        </div>}

        {step==='done' && <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-2">
          <p className="font-semibold text-primary">Spond roster imported</p>
          <p className="text-sm">{result?.created || 0} player{Number(result?.created||0)===1?'':'s'} added to {poolMode ? 'the Player Pool' : clubName}.</p>
          {result?.skipped>0&&<p className="text-xs text-muted-foreground">{result.skipped} already-present player{result.skipped===1?' was':'s were'} skipped safely.</p>}
          {result?.waitingListCount>0&&<p className="text-xs text-muted-foreground">{result.waitingListCount} waiting-list player{result.waitingListCount===1?' was':'s were'} not imported.</p>}
          {poolMode ? <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={close}>Done</Button><Button onClick={importAnother}>Import Another Spond Event</Button></div> : <Button onClick={close} className="w-full">Done</Button>}
        </div>}
      </DialogContent>
    </Dialog>
  );
}
