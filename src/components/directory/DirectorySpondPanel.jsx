import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Link2, Loader2, LogIn, RefreshCw, Unlink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sessionKey = s => [s.day, s.start, s.end || '', s.level || '', s.venueId || ''].join('|');
const normaliseClubName = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

export default function DirectorySpondPanel({ listingSlug, clubName = '', onImport }) {
  const { user } = useAuth();
  const [connection, setConnection] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [preview, setPreview] = useState(null);
  const [selectedSessions, setSelectedSessions] = useState(new Set());
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [savingConnection, setSavingConnection] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem('rallyhub_spond_token') || ''; } catch { return ''; }
  });

  const selectedGroup = useMemo(() => groups.find(g => String(g.id) === String(selectedGroupId)) || null, [groups, selectedGroupId]);

  useEffect(() => {
    let active = true;
    base44.functions.invoke('spondIntegrationWorking', { action:'directory_connection_status', listingSlug })
      .then(res => {
        if (!active || res.data?.error) return;
        setConnection(res.data?.connection || null);
        if (res.data?.connection?.spond_group_id) setSelectedGroupId(String(res.data.connection.spond_group_id));
      })
      .catch(() => {})
    return () => { active = false; };
  }, [listingSlug]);

  const invokeDirectory = async (action, extra = {}) => {
    const payload = { action, listingSlug, ...extra };
    if (token) payload.spondToken = token;
    const res = await base44.functions.invoke('spondIntegrationWorking', payload);
    if (res.data?.error) {
      const err = new Error(res.data.error);
      err.status = res.status;
      throw err;
    }
    return res.data;
  };

  const loadGroups = async () => {
    setLoadingGroups(true); setError(''); setMessage(''); setPreview(null);
    try {
      const data = await invokeDirectory('directory_get_groups');
      setGroups(data.groups || []);
      setNeedsLogin(false);
      const available = data.groups || [];
      const remembered = connection?.spond_group_id || selectedGroupId;
      if (remembered && available.some(g => String(g.id) === String(remembered))) {
        setSelectedGroupId(String(remembered));
        setMessage('Spond connected. The previously linked club group is selected.');
      } else {
        const wanted = normaliseClubName(clubName);
        const exact = available.find(g => normaliseClubName(g.name) === wanted);
        const close = !exact && wanted ? available.find(g => normaliseClubName(g.name).includes(wanted) || wanted.includes(normaliseClubName(g.name))) : null;
        const suggested = exact || close;
        if (suggested) {
          setSelectedGroupId(String(suggested.id));
          setMessage(`Spond connected. RallyHub matched this listing to “${suggested.name}”; scan the upcoming events to confirm.`);
        } else {
          setMessage(available.length ? 'Spond connected. Choose the club group to scan.' : 'Spond connected, but no groups were returned for this account.');
        }
      }
    } catch (err) {
      setNeedsLogin(true);
      setError(err.message || 'Could not load Spond groups.');
    } finally { setLoadingGroups(false); }
  };

  const login = async () => {
    if (!email.trim() || !password) { setError('Enter the Spond email and password for this club account.'); return; }
    setLoggingIn(true); setError(''); setMessage('');
    try {
      const res = await base44.functions.invoke('spondIntegrationWorking', { action:'login', spondEmail:email.trim(), spondPassword:password });
      if (res.data?.error) throw new Error(res.data.error);
      if (!res.data?.token) throw new Error('Spond did not return a connection token.');
      setToken(res.data.token);
      try { sessionStorage.setItem('rallyhub_spond_token', res.data.token); } catch {}
      setPassword('');
      setNeedsLogin(false);
      const groupsRes = await base44.functions.invoke('spondIntegrationWorking', { action:'directory_get_groups', listingSlug, spondToken:res.data.token });
      if (groupsRes.data?.error) throw new Error(groupsRes.data.error);
      const available = groupsRes.data?.groups || [];
      setGroups(available);
      const wanted = normaliseClubName(clubName);
      const exact = available.find(g => normaliseClubName(g.name) === wanted);
      const close = !exact && wanted ? available.find(g => normaliseClubName(g.name).includes(wanted) || wanted.includes(normaliseClubName(g.name))) : null;
      const suggested = exact || close;
      if (suggested) {
        setSelectedGroupId(String(suggested.id));
        setMessage(`Spond connected. RallyHub matched this listing to “${suggested.name}”; scan the upcoming events to confirm.`);
      } else {
        setMessage(available.length ? 'Spond connected. Choose the club group to scan.' : 'Spond connected, but no groups were returned for this account.');
      }
    } catch (err) {
      setError(err.message || 'Could not connect to Spond.');
    } finally { setLoggingIn(false); }
  };

  const scanEvents = async () => {
    if (!selectedGroupId) { setError('Choose the Spond group first.'); return; }
    setLoadingEvents(true); setError(''); setMessage('');
    try {
      const data = await invokeDirectory('directory_get_events', { groupId:selectedGroupId });
      setPreview(data.preview || { venues:[], sessions:[] });
      const defaults = new Set((data.preview?.sessions || []).filter(s => Number(s.occurrences || 0) >= 2).map(sessionKey));
      if (defaults.size === 0) (data.preview?.sessions || []).forEach(s => defaults.add(sessionKey(s)));
      setSelectedSessions(defaults);
      setMessage(`Found ${data.rawCount || 0} upcoming Spond event occurrence${Number(data.rawCount || 0) === 1 ? '' : 's'} and ${data.preview?.sessions?.length || 0} session pattern${Number(data.preview?.sessions?.length || 0) === 1 ? '' : 's'}.`);
    } catch (err) {
      setError(err.message || 'Could not read upcoming Spond events.');
    } finally { setLoadingEvents(false); }
  };

  const importSelected = async () => {
    if (!preview) return;
    const sessions = (preview.sessions || []).filter(s => selectedSessions.has(sessionKey(s)));
    if (!sessions.length) { setError('Select at least one Spond session to import.'); return; }
    setSavingConnection(true); setError(''); setMessage('');
    try {
      const usedVenueIds = new Set(sessions.map(s => s.venueId));
      const venues = (preview.venues || []).filter(v => usedVenueIds.has(v.id));
      const eventSync = await invokeDirectory('directory_sync_events', { groupId:selectedGroupId });
      const data = await invokeDirectory('directory_save_connection', {
        groupId:selectedGroupId,
        summary:`Imported ${sessions.length} directory session pattern${sessions.length === 1 ? '' : 's'} from Spond; ${eventSync.active || 0} upcoming event occurrence${Number(eventSync.active || 0) === 1 ? '' : 's'} retained for RallyHub calendar use.`
      });
      onImport?.({ venues, sessions, group:selectedGroup });
      setConnection(data.connection || connection);
      setMessage(`Imported ${sessions.length} Spond session pattern${sessions.length === 1 ? '' : 's'} into the Directory form and synced ${eventSync.active || 0} upcoming Spond event occurrence${Number(eventSync.active || 0) === 1 ? '' : 's'} for the RallyHub calendar. Press Save changes to publish the Directory sessions.`);
    } catch (err) {
      setError(err.message || 'Could not import the Spond sessions.');
    } finally { setSavingConnection(false); }
  };

  const disconnect = async () => {
    setDisconnecting(true); setError(''); setMessage('');
    try {
      await invokeDirectory('directory_disconnect');
      setConnection(null); setGroups([]); setSelectedGroupId(''); setPreview(null);
      setMessage('Spond disconnected from this Directory listing. Existing published venues and sessions were left unchanged.');
    } catch (err) {
      setError(err.message || 'Could not disconnect Spond.');
    } finally { setDisconnecting(false); }
  };

  const toggleSession = row => {
    const key = sessionKey(row);
    setSelectedSessions(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <section className="glass rounded-2xl p-6 space-y-4" id="spond">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><Link2 className="w-5 h-5 text-primary" /><h2 className="text-xl font-bold">Spond connection</h2></div>
          <p className="text-sm text-muted-foreground mt-1">Connect the club’s Spond group and pull regular venues and session times into this Directory listing. RallyHub never stores the Spond password.</p>
        </div>
        {connection ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300"><CheckCircle2 className="w-3.5 h-3.5" /> {connection.spond_group_name}</span>
            <Button type="button" size="sm" variant="ghost" className="text-xs text-destructive" onClick={disconnect} disabled={disconnecting}>{disconnecting ? 'Disconnecting…' : <><Unlink className="w-3.5 h-3.5 mr-1" />Disconnect</>}</Button>
          </div>
        ) : null}
      </div>

      {message && <div aria-live="polite" className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">{message}</div>}
      {error && <div aria-live="polite" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {needsLogin && (
        <div className="rounded-xl border border-border bg-background/30 p-4 space-y-3">
          <p className="text-sm font-semibold">{user?.role === 'admin' ? 'Use a Spond account for this connection' : 'Connect the club’s Spond account'}</p>
          <p className="text-xs text-muted-foreground">The password is used only to establish a temporary Spond session in this browser and is not saved by RallyHub.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label className="text-xs">Spond email</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">Spond password</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1" onKeyDown={e=>e.key==='Enter'&&login()} /></div>
          </div>
          <Button type="button" onClick={login} disabled={loggingIn} className="gap-2">{loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}{loggingIn ? 'Connecting…' : 'Connect Spond'}</Button>
        </div>
      )}

      {groups.length === 0 && !needsLogin ? (
        <Button type="button" variant="outline" onClick={loadGroups} disabled={loadingGroups} className="gap-2">
          {loadingGroups ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          {loadingGroups ? 'Connecting to Spond…' : connection ? 'Refresh Spond connection' : 'Connect Spond'}
        </Button>
      ) : null}

      {groups.length > 0 && (
        <div className="rounded-xl border border-border bg-background/30 p-4 space-y-4">
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <Label className="text-xs">Spond club group</Label>
              <Select value={selectedGroupId} onValueChange={value => { setSelectedGroupId(value); setPreview(null); setMessage(''); }}>
                <SelectTrigger className="mt-1 bg-background"><SelectValue placeholder="Choose a Spond group" /></SelectTrigger>
                <SelectContent>
                  {groups.map(group => <SelectItem key={group.id} value={String(group.id)}>{group.name}{group.memberCount ? ` · ${group.memberCount} members` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" onClick={scanEvents} disabled={!selectedGroupId || loadingEvents} className="gap-2">
              {loadingEvents ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loadingEvents ? 'Scanning events…' : 'Scan upcoming events'}
            </Button>
          </div>

          {preview && (
            <div className="space-y-3">
              <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs text-muted-foreground">
                RallyHub groups matching Spond occurrences by weekday, start/end time, venue and event name. Repeating patterns are selected automatically; one-off events can be selected manually if they are also regular club sessions.
              </div>
              {(preview.sessions || []).length === 0 ? <p className="text-sm text-muted-foreground py-3">No usable upcoming Spond sessions were found.</p> : (
                <div className="space-y-2">
                  {(preview.sessions || []).map(row => {
                    const venue = (preview.venues || []).find(v => v.id === row.venueId);
                    const checked = selectedSessions.has(sessionKey(row));
                    return (
                      <label key={sessionKey(row)} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${checked ? 'border-primary/40 bg-primary/5' : 'border-border bg-background/20'}`}>
                        <input type="checkbox" checked={checked} onChange={()=>toggleSession(row)} className="mt-1 h-4 w-4 accent-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{row.level}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{row.day} · {row.start}{row.end ? `–${row.end}` : ''} · {venue?.name || 'Venue'}{venue?.address ? ` · ${venue.address}` : ''}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{row.occurrences} upcoming occurrence{row.occurrences === 1 ? '' : 's'} detected{row.nextDate ? ` · next ${row.nextDate}` : ''}</p>
                        </div>
                        {row.occurrences >= 2 && <span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-1">Recurring</span>}
                      </label>
                    );
                  })}
                </div>
              )}
              <Button type="button" onClick={importSelected} disabled={savingConnection || selectedSessions.size === 0} className="gap-2">
                {savingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                {savingConnection ? 'Importing…' : `Import ${selectedSessions.size} selected session${selectedSessions.size === 1 ? '' : 's'}`}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
