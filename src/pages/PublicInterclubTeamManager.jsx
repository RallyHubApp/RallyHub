import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
import { AppearanceQuickButton } from '@/components/appearance/AppearanceControls';
import { CheckCircle2, GripVertical, RefreshCw, Save } from 'lucide-react';
import { INTERCLUB_MODULE_NAME } from '@/lib/interclubBranding';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return String(value).slice(0,10);
  return date.toLocaleDateString('en-IE', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

function formatSaved(value) {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return date.toLocaleString('en-IE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
}

export default function PublicInterclubTeamManager() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const load = async (quiet=false) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('interclubTeamManager', { token, action:'get' });
      if (res.data?.error) throw new Error(res.data.error);
      setData(res.data);
      setPlayers((res.data?.players || []).map((p, index) => ({ ...p, rank:index + 1 })));
      setDirty(false);
      if (!quiet) setStatus('');
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'This team manager link is unavailable.');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);
  useEffect(() => {
    if (dirty || !data) return undefined;
    const id = window.setInterval(() => load(true), 20000);
    return () => window.clearInterval(id);
  }, [dirty, data?.event?.id, token]);

  const clubs = useMemo(() => data?.event ? [
    { name:data.event.clubAName, logo_url:data.event.clubALogo, primary_colour:data.event.clubAPrimary },
    { name:data.event.clubBName, logo_url:data.event.clubBLogo, primary_colour:data.event.clubBPrimary },
  ] : [], [data]);

  const updatePlayer = (id, patch) => {
    setPlayers(current => current.map(p => p.id === id ? { ...p, ...patch } : p));
    setDirty(true);
    setStatus('');
  };

  const onDragEnd = result => {
    if (!result.destination || result.destination.index === result.source.index) return;
    setPlayers(current => {
      const next = [...current];
      const [moved] = next.splice(result.source.index, 1);
      next.splice(result.destination.index, 0, moved);
      return next.map((p, index) => ({ ...p, rank:index + 1 }));
    });
    setDirty(true);
    setStatus('');
  };

  const save = async () => {
    if (saving || (!dirty && data?.event?.savedAt)) return;
    setSaving(true);
    setError('');
    setStatus('Saving current team…');
    try {
      const res = await base44.functions.invoke('interclubTeamManager', {
        token,
        action:'save',
        orderedParticipantIds:players.map(p => p.id),
        players:players.map(p => ({ id:p.id, playingCategory:p.playingCategory || '', rosterRole:p.rosterRole || 'rotation' })),
      });
      if (res.data?.error) throw new Error(res.data.error);
      setDirty(false);
      setData(current => current ? { ...current, event:{ ...current.event, savedAt:res.data.savedAt } } : current);
      setStatus(`Saved ${players.length} players. You can come back and edit this team again whenever the roster changes.`);
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not save this team.';
      setError(message);
      setStatus('');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center p-5">
      <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
      <div className="text-center"><RallyHubPublicBrand moduleName={INTERCLUB_MODULE_NAME} pageLabel="Team Manager"/><RefreshCw className="mx-auto mt-6 h-7 w-7 animate-spin"/></div>
    </div>
  );

  if (error && !data) return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center p-5">
      <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
      <div className="glass max-w-md rounded-2xl p-6 text-center"><RallyHubPublicBrand moduleName={INTERCLUB_MODULE_NAME} pageLabel="Team Manager"/><h1 className="mt-5 text-xl font-black">Team manager link unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p></div>
    </div>
  );

  const event = data?.event || {};
  const registeredCount = players.filter(p => p.registered).length;
  const rotationCount = players.filter(p => (p.rosterRole || 'rotation') === 'rotation').length;
  const reserveCount = players.length - rotationCount;

  return (
    <div className="min-h-screen bg-background text-foreground p-3 sm:p-7">
      <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="glass rounded-2xl p-5 sm:p-7 text-center">
          <RallyHubPublicBrand moduleName={INTERCLUB_MODULE_NAME} pageLabel="Team Manager" clubs={clubs}/>
          <h1 className="mt-5 text-2xl sm:text-3xl font-black">{event.teamName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{event.eventName}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {event.date && <span className="rounded-full bg-secondary px-3 py-1.5">{formatDate(event.date)}</span>}
            {event.venue && <span className="rounded-full bg-secondary px-3 py-1.5">{event.venue}</span>}
          </div>
        </header>

        <section className="glass rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">Current team</h2>
              <p className="mt-1 text-xs text-muted-foreground">Drag players into the correct ranking, set Social or Improver, choose Rotation or Reserve, then save. You can reopen this link and edit again when more players register or the team changes.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => load()} disabled={saving}><RefreshCw className="mr-2 h-4 w-4"/>Refresh roster</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{players.length} on roster</Badge>
            <Badge variant="outline">{registeredCount} registered</Badge>
            <Badge variant="outline">{rotationCount} rotation</Badge>
            <Badge variant="outline">{reserveCount} reserve</Badge>
            {event.savedAt ? <Badge className="bg-primary/10 text-primary">Saved {formatSaved(event.savedAt)}</Badge> : <Badge className="bg-amber-500/10 text-amber-700">Needs saving</Badge>}
          </div>
        </section>

        {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</div>}
        {status && <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm font-semibold text-primary">{status}</div>}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="team-manager-roster">
            {(provided, snapshot) => <div ref={provided.innerRef} {...provided.droppableProps} className={`space-y-2 rounded-2xl ${snapshot.isDraggingOver ? 'ring-2 ring-primary/30' : ''}`}>
              {players.map((p, index) => <Draggable key={p.id} draggableId={String(p.id)} index={index}>
                {(dragProvided, dragSnapshot) => <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} className={`glass rounded-xl p-3 sm:p-4 ${dragSnapshot.isDragging ? 'shadow-xl ring-2 ring-primary/30' : ''}`}>
                  <div className="grid grid-cols-[auto_auto_1fr] sm:grid-cols-[auto_auto_minmax(0,1fr)_140px_130px] items-center gap-2 sm:gap-3">
                    <button type="button" {...dragProvided.dragHandleProps} aria-label={`Move ${p.displayName}`} className="h-10 w-9 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:bg-secondary touch-none"><GripVertical className="h-5 w-5"/></button>
                    <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center font-black text-sm">{index + 1}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{p.displayName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                        {p.gender && <span>{p.gender}</span>}
                        {p.registered ? <span className="font-semibold text-primary">Registered ✓</span> : <span className="font-semibold text-amber-700">Awaiting registration</span>}
                      </div>
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <Select value={p.playingCategory || 'not_set'} onValueChange={value => updatePlayer(p.id, { playingCategory:value === 'not_set' ? '' : value })}>
                        <SelectTrigger className="bg-background h-10"><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="not_set">Level not set</SelectItem><SelectItem value="social">Social</SelectItem><SelectItem value="improver">Improver</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <Select value={p.rosterRole || 'rotation'} onValueChange={value => updatePlayer(p.id, { rosterRole:value })}>
                        <SelectTrigger className="bg-background h-10"><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="rotation">Rotation</SelectItem><SelectItem value="reserve">Reserve</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>}
              </Draggable>)}
              {provided.placeholder}
              {!players.length && <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">No players have registered for this team yet. Use Refresh roster as registrations arrive.</div>}
            </div>}
          </Droppable>
        </DragDropContext>

        <div className="sticky bottom-3 z-20 rounded-2xl border border-border bg-background/95 backdrop-blur p-3 shadow-xl flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 text-xs text-muted-foreground">{dirty ? <span className="font-bold text-amber-700">Unsaved changes</span> : event.savedAt ? <span className="inline-flex items-center gap-1 font-semibold text-primary"><CheckCircle2 className="h-3.5 w-3.5"/>Current team saved</span> : 'Review the team and save the current configuration.'}</div>
          <Button type="button" onClick={save} disabled={saving || !players.length || (!dirty && !!event.savedAt)} className="min-h-11 sm:min-w-44"><Save className="mr-2 h-4 w-4"/>{saving ? 'Saving…' : 'Save Team'}</Button>
        </div>

        <p className="pb-8 text-center text-[11px] text-muted-foreground">This link only manages this team for this Interclub event. It does not give access to the host club or other RallyHub areas.</p>
      </div>
    </div>
  );
}