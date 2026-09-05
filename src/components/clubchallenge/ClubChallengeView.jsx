import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Check, Clock, GripVertical, ListChecks, Play, Plus, RefreshCw, ShieldCheck, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  analyseClubChallengeFairness,
  calculateClubChallengeFormat,
  generateClubChallengeFixtures,
} from '@/lib/clubChallengeEngine.js';
import {
  createChallengeEventDraft,
  fixtureRecordsFromSchedule,
  finalisationIssues,
  scoreFromMatchRecords,
} from '@/lib/clubChallengeWorkflow.js';

const TABS = [
  ['setup', 'Setup'],
  ['teams', 'Teams & Ranking'],
  ['draw', 'Draw & Fairness'],
  ['live', 'Live Scoring'],
];

const DEFAULT_SETUP = {
  clubAName: 'Clare Pickleball Club', clubAPrimary: '#2563eb', clubASecondary: '#facc15',
  clubBName: 'Galway Pickleball', clubBPrimary: '#7f1d1d', clubBSecondary: '#f8fafc',
  courts: 4, availableMinutes: 180, playMinutes: 10, changeoverMinutes: 2,
  includeBreak: true, breakMinutes: 20, breakAfterRound: 6,
  matchType: 'timed', target: 11, winBy: 1, drawsAllowed: true,
  compositionMode: 'open', showcaseEnabled: true, showcasePoints: 5, potEnabled: true,
};

function number(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }

function ClubBadge({ name, primary, secondary }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 sm:px-3 py-2 bg-secondary/40 min-w-0 flex-1 sm:flex-none">
      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: primary || '#334155', color: secondary || '#fff' }}>{(name || '?').slice(0, 2).toUpperCase()}</span>
      <span className="text-xs font-semibold text-foreground truncate min-w-0">{name}</span>
    </div>
  );
}

function RankingList({ side, title, participants, locked, onReorder }) {
  const ordered = [...participants].sort((a, b) => (a.event_rank || 999) - (b.event_rank || 999));
  const handleDragEnd = result => {
    if (!result.destination || locked) return;
    const next = [...ordered];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    onReorder(side, next);
  };
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div><p className="text-sm font-semibold text-foreground">{title}</p><p className="text-[10px] text-muted-foreground">Strongest #1 → developing</p></div>
        <Badge variant="outline">{ordered.length}</Badge>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`cc-${side}`}>
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1 max-h-[32rem] overflow-auto">
              {ordered.map((p, i) => (
                <Draggable key={p.id} draggableId={p.id} index={i} isDragDisabled={locked}>
                  {(dragProvided, snapshot) => (
                    <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} className={cn('flex items-center gap-2 rounded-lg border border-border bg-secondary/60 p-2 min-h-11', snapshot.isDragging && 'border-primary bg-primary/10')}>
                      <div {...dragProvided.dragHandleProps} className={cn('w-9 h-9 -ml-1 flex items-center justify-center rounded-md touch-none shrink-0', locked ? 'opacity-30' : 'text-muted-foreground active:bg-primary/10')}><GripVertical className="w-5 h-5" /></div>
                      <span className="w-7 text-center text-xs font-bold text-primary">#{i + 1}</span>
                      <span className="text-xs text-foreground flex-1 truncate">{p.display_name}</span>
                      {p.gender && <span className="text-[10px] text-muted-foreground">{p.gender}</span>}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

function ScoreCard({ match, clubAName, clubBName, onSaved }) {
  const [a, setA] = useState(match.score_a ?? '');
  const [b, setB] = useState(match.score_b ?? '');
  const [saving, setSaving] = useState(false);
  const saved = ['completed', 'draw'].includes(match.status);
  const save = async () => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke('saveClubChallengeScore', {
        matchId: match.id,
        expectedRevision: match.revision || 0,
        scoreA: number(a), scoreB: number(b),
      });
      if (res.data?.conflict) {
        toast.error('Score conflict: this result changed on another device. Refresh and review it.');
      } else if (res.data?.error) {
        toast.error(res.data.error);
      } else {
        toast.success(saved ? 'Score corrected and audited' : 'Score saved');
        onSaved?.();
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Could not save score');
      onSaved?.();
    } finally { setSaving(false); }
  };
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between"><span className="text-xs font-bold">Court {match.court_number}</span><Badge variant="outline">R{match.round_number}</Badge></div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-stretch sm:items-center">
        <div className="rounded-lg bg-secondary p-3"><p className="text-[10px] text-muted-foreground">{clubAName}</p><p className="text-xs font-semibold">{(match.club_a_names || []).join(' & ')}</p></div>
        <span className="text-xs text-muted-foreground text-center self-center">vs</span>
        <div className="rounded-lg bg-secondary p-3"><p className="text-[10px] text-muted-foreground">{clubBName}</p><p className="text-xs font-semibold">{(match.club_b_names || []).join(' & ')}</p></div>
      </div>
      <div className="flex gap-2 items-center">
        <Input inputMode="numeric" type="number" min="0" value={a} onChange={e => setA(e.target.value)} className="text-center bg-secondary h-11 text-base" />
        <span>—</span>
        <Input inputMode="numeric" type="number" min="0" value={b} onChange={e => setB(e.target.value)} className="text-center bg-secondary h-11 text-base" />
      </div>
      <Button className="w-full h-11" onClick={save} disabled={a === '' || b === '' || saving}>{saving ? 'Saving…' : saved ? 'Correct Result' : 'Save Result'}</Button>
      {saved && <p className="text-[10px] text-muted-foreground text-center">Revision {match.revision || 0} · {match.winner === 'draw' ? 'Draw' : match.winner === 'club_a' ? `${clubAName} win` : `${clubBName} win`}</p>}
    </div>
  );
}

export default function ClubChallengeView({ tournament, queryClient, isAdmin }) {
  const [tab, setTab] = useState('setup');
  const [setup, setSetup] = useState(DEFAULT_SETUP);
  const [manual, setManual] = useState({ club_a: '', club_b: '' });
  const [saving, setSaving] = useState(false);

  const { data: currentUser } = useQuery({ queryKey: ['cc-current-user'], queryFn: () => base44.auth.me() });
  const { data: event, refetch: refetchEvent } = useQuery({
    queryKey: ['club-challenge-event', tournament.id],
    queryFn: async () => (await base44.entities.ClubChallengeEvent.filter({ tournament_id: tournament.id }))[0] || null,
  });
  const { data: participants = [], refetch: refetchParticipants } = useQuery({
    queryKey: ['club-challenge-participants', event?.id],
    queryFn: () => event ? base44.entities.ClubChallengeParticipant.filter({ challenge_event_id: event.id }, 'event_rank', 100) : [],
    enabled: !!event?.id,
  });
  const { data: matches = [], refetch: refetchMatches } = useQuery({
    queryKey: ['club-challenge-matches', event?.id],
    queryFn: () => event ? base44.entities.ClubChallengeMatch.filter({ challenge_event_id: event.id }, 'round_number', 200) : [],
    enabled: !!event?.id,
  });

  React.useEffect(() => {
    if (!event) return;
    setSetup(s => ({
      ...s,
      clubAName: event.club_a_name || s.clubAName, clubAPrimary: event.club_a_primary_colour || s.clubAPrimary, clubASecondary: event.club_a_secondary_colour || s.clubASecondary,
      clubBName: event.club_b_name || s.clubBName, clubBPrimary: event.club_b_primary_colour || s.clubBPrimary, clubBSecondary: event.club_b_secondary_colour || s.clubBSecondary,
      courts: event.courts ?? s.courts, availableMinutes: event.available_minutes ?? s.availableMinutes, playMinutes: event.play_minutes ?? s.playMinutes,
      changeoverMinutes: event.changeover_minutes ?? s.changeoverMinutes, includeBreak: event.include_break ?? s.includeBreak,
      breakMinutes: event.break_minutes ?? s.breakMinutes, breakAfterRound: event.break_after_round ?? s.breakAfterRound,
      matchType: event.normal_match_type || s.matchType, target: event.normal_target_points || s.target, winBy: event.normal_win_by || s.winBy,
      drawsAllowed: event.timed_draws_allowed !== false, compositionMode: event.composition_mode || s.compositionMode,
      showcaseEnabled: !!event.showcase_enabled, showcasePoints: event.showcase_points ?? s.showcasePoints, potEnabled: !!event.pot_enabled,
    }));
  }, [event?.id]);

  const aPlayers = participants.filter(p => p.side === 'club_a');
  const bPlayers = participants.filter(p => p.side === 'club_b');
  const locked = ['draw_approved', 'in_progress', 'paused', 'completed', 'archived'].includes(event?.status);
  const fairness = useMemo(() => { try { return event?.fairness_json ? JSON.parse(event.fairness_json) : null; } catch { return null; } }, [event?.fairness_json]);
  const score = useMemo(() => scoreFromMatchRecords(matches, { winPoints: event?.win_points ?? 2, drawPoints: event?.draw_points ?? 1, lossPoints: event?.loss_points ?? 0 }), [matches, event?.win_points, event?.draw_points, event?.loss_points]);
  const rounds = [...new Set(matches.map(m => m.round_number))].sort((a, b) => a - b);
  const currentRound = event?.current_round || 1;

  const sync = async () => {
    await Promise.all([refetchEvent(), refetchParticipants(), refetchMatches()]);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
  };

  const saveSetup = async () => {
    if (!isAdmin) return;
    const tenantId = tournament.tenant_id || currentUser?.active_tenant_id;
    const hostClubId = tournament.host_club_id || currentUser?.active_club_id;
    if (!tenantId) { toast.error('No active Tenant is attached to this event.'); return; }
    setSaving(true);
    const data = createChallengeEventDraft({
      tournament: { ...tournament, tenant_id: tenantId, host_club_id: hostClubId },
      hostClub: { id: hostClubId, name: setup.clubAName, primary_colour: setup.clubAPrimary, secondary_colour: setup.clubASecondary },
      opponent: { name: setup.clubBName, primary_colour: setup.clubBPrimary, secondary_colour: setup.clubBSecondary },
      setup: {
        courts: number(setup.courts, 4), availableMinutes: number(setup.availableMinutes, 180), playMinutes: number(setup.playMinutes, 10), changeoverMinutes: number(setup.changeoverMinutes, 2),
        includeBreak: setup.includeBreak, breakMinutes: number(setup.breakMinutes, 20), breakAfterRound: number(setup.breakAfterRound, 6),
        matchFormat: setup.matchType === 'timed' ? { type: 'timed', drawsAllowed: setup.drawsAllowed } : { type: 'points', target: number(setup.target, 11), winBy: number(setup.winBy, 1) },
        compositionMode: setup.compositionMode, showcaseEnabled: setup.showcaseEnabled, showcasePoints: number(setup.showcasePoints, 5), potEnabled: setup.potEnabled,
      }
    });
    try {
      if (event) await base44.entities.ClubChallengeEvent.update(event.id, { ...data, status: event.status, draw_version: event.draw_version || 0, current_round: event.current_round || 0 });
      else await base44.entities.ClubChallengeEvent.create(data);
      if (!tournament.tenant_id || !tournament.host_club_id || tournament.format !== 'Club Challenge' || !tournament.inter_club) {
        await base44.entities.Tournament.update(tournament.id, { tenant_id: tenantId, host_club_id: hostClubId, format: 'Club Challenge', inter_club: true });
      }
      toast.success('Club Challenge setup saved');
      await sync();
      setTab('teams');
    } catch (e) { toast.error(e?.message || 'Could not save setup'); }
    setSaving(false);
  };

  const clearParticipants = async () => {
    const existingMatches = matches.filter(m => ['completed', 'draw'].includes(m.status));
    if (existingMatches.length) throw new Error('Cannot clear players after results have been recorded.');
    for (const m of matches) await base44.entities.ClubChallengeMatch.delete(m.id);
    for (const p of participants) await base44.entities.ClubChallengeParticipant.delete(p.id);
  };

  const loadTestRoster = async () => {
    if (!event) { toast.error('Save Setup first.'); return; }
    if (!window.confirm('Load 16 Clare + 16 Galway test participants? Existing unplayed Club Challenge participants will be replaced.')) return;
    setSaving(true);
    try {
      await clearParticipants();
      const records = [];
      for (let i = 1; i <= 16; i++) {
        records.push({ tenant_id: event.tenant_id, challenge_event_id: event.id, tournament_id: tournament.id, side: 'club_a', display_name: `Clare Test ${String(i).padStart(2, '0')}`, event_rank: i, gender: i % 2 ? 'Male' : 'Female', status: 'active', available_from_round: 1, unique_identity_key: `gate3-clare-${i}` });
        records.push({ tenant_id: event.tenant_id, challenge_event_id: event.id, tournament_id: tournament.id, side: 'club_b', display_name: `Galway Test ${String(i).padStart(2, '0')}`, event_rank: i, gender: i % 2 ? 'Male' : 'Female', status: 'active', available_from_round: 1, unique_identity_key: `gate3-galway-${i}` });
      }
      await base44.entities.ClubChallengeParticipant.bulkCreate(records);
      await base44.entities.ClubChallengeEvent.update(event.id, { status: 'draft', fairness_json: '', draw_approved_at: null, draw_approved_by: null, event_pack_stale: true });
      toast.success('32 test participants loaded');
      await sync();
    } catch (e) { toast.error(e?.message || 'Could not load test roster'); }
    setSaving(false);
  };

  const addManual = async side => {
    const name = manual[side].trim();
    if (!event || !name) return;
    const sidePlayers = side === 'club_a' ? aPlayers : bPlayers;
    await base44.entities.ClubChallengeParticipant.create({ tenant_id: event.tenant_id, challenge_event_id: event.id, tournament_id: tournament.id, side, display_name: name, event_rank: sidePlayers.length + 1, status: 'active', available_from_round: 1, unique_identity_key: `${side}-${name.toLowerCase()}-${Date.now()}` });
    setManual(m => ({ ...m, [side]: '' }));
    await refetchParticipants();
  };

  const reorder = async (side, ordered) => {
    await Promise.all(ordered.map((p, i) => base44.entities.ClubChallengeParticipant.update(p.id, { event_rank: i + 1 })));
    await base44.entities.ClubChallengeEvent.update(event.id, { fairness_json: '', status: event.status === 'draw_generated' ? 'draft' : event.status, event_pack_stale: true });
    await sync();
  };

  const calculateFormat = () => {
    if (!aPlayers.length || !bPlayers.length) return null;
    try {
      return calculateClubChallengeFormat({ clubAPlayerCount: aPlayers.length, clubBPlayerCount: bPlayers.length, courts: number(setup.courts), availableMinutes: number(setup.availableMinutes), playMinutes: number(setup.playMinutes), changeoverMinutes: number(setup.changeoverMinutes), includeBreak: setup.includeBreak, breakMinutes: number(setup.breakMinutes), breakAfterRound: number(setup.breakAfterRound) });
    } catch { return null; }
  };
  const formatInfo = calculateFormat();

  const generateDraw = async () => {
    if (!event) return;
    if (aPlayers.length !== bPlayers.length || aPlayers.length < 4) { toast.error('For this draw, both clubs must have equal playable rosters of at least 4.'); return; }
    setSaving(true);
    try {
      const engA = [...aPlayers].sort((x, y) => x.event_rank - y.event_rank).map(p => ({ id: p.id, name: p.display_name, rank: p.event_rank, gender: p.gender }));
      const engB = [...bPlayers].sort((x, y) => x.event_rank - y.event_rank).map(p => ({ id: p.id, name: p.display_name, rank: p.event_rank, gender: p.gender }));
      const fi = calculateClubChallengeFormat({ clubAPlayerCount: engA.length, clubBPlayerCount: engB.length, courts: number(setup.courts), availableMinutes: number(setup.availableMinutes), playMinutes: number(setup.playMinutes), changeoverMinutes: number(setup.changeoverMinutes), includeBreak: setup.includeBreak, breakMinutes: number(setup.breakMinutes), breakAfterRound: number(setup.breakAfterRound) });
      const schedule = generateClubChallengeFixtures({ clubAPlayers: engA, clubBPlayers: engB, courts: number(setup.courts), rounds: fi.recommendedRounds });
      const report = analyseClubChallengeFairness({ schedule, clubAPlayers: engA, clubBPlayers: engB });
      const completed = matches.filter(m => ['completed', 'draw', 'retired', 'forfeit', 'abandoned'].includes(m.status));
      if (completed.length) throw new Error('Completed match history exists. Use Rebalance Remaining Fixtures rather than a full redraw.');
      for (const m of matches) await base44.entities.ClubChallengeMatch.delete(m.id);
      const participantMap = Object.fromEntries(participants.map(p => [p.id, p]));
      const nextVersion = Number(event.draw_version || 0) + 1;
      const records = fixtureRecordsFromSchedule({ event: { ...event, draw_version: nextVersion }, schedule, participantMap });
      await base44.entities.ClubChallengeMatch.bulkCreate(records);
      await base44.entities.ClubChallengeEvent.update(event.id, { status: 'draw_generated', fairness_json: JSON.stringify(report), current_round: 0, event_pack_stale: true });
      toast.success(`${records.length} fixtures generated`);
      await sync();
      setTab('draw');
    } catch (e) { toast.error(e?.message || 'Could not generate draw'); }
    setSaving(false);
  };

  const approveDraw = async () => {
    if (!event || !fairness || !matches.length) return;
    if (fairness.duplicatePlayerRoundIssues || fairness.sameClubIntegrityIssues || !fairness.equalGames) { toast.error('Hard fairness checks must pass before approval.'); return; }
    await base44.entities.ClubChallengeEvent.update(event.id, { status: 'draw_approved', draw_version: Number(event.draw_version || 0) + 1, draw_approved_at: new Date().toISOString(), draw_approved_by: currentUser?.id || '', event_pack_stale: true });
    toast.success('Draw approved and locked');
    await sync();
  };

  const startEvent = async () => {
    if (event?.status !== 'draw_approved') return;
    await base44.entities.ClubChallengeEvent.update(event.id, { status: 'in_progress', current_round: 1 });
    await base44.entities.Tournament.update(tournament.id, { status: 'In Progress' });
    toast.success('Club Challenge started');
    await sync(); setTab('live');
  };

  const advanceRound = async () => {
    const currentMatches = matches.filter(m => m.round_number === currentRound && !m.is_showcase);
    const unresolved = currentMatches.filter(m => !['completed', 'draw', 'retired', 'forfeit', 'abandoned', 'not_played'].includes(m.status));
    if (unresolved.length) { toast.error(`${unresolved.length} result${unresolved.length === 1 ? '' : 's'} still missing in Round ${currentRound}.`); return; }
    const maxRound = Math.max(...rounds);
    if (currentRound < maxRound) {
      await base44.entities.ClubChallengeEvent.update(event.id, { current_round: currentRound + 1 });
      toast.success(`Round ${currentRound + 1} ready`);
      await refetchEvent();
    } else {
      const issues = finalisationIssues({ matches, showcaseEnabled: event.showcase_enabled, showcaseComplete: !event.showcase_enabled, potEnabled: event.pot_enabled, potStatus: event.pot_status });
      if (issues.length) { toast.error(issues.join(' ')); return; }
      await base44.entities.ClubChallengeEvent.update(event.id, { status: 'completed', finalised_at: new Date().toISOString() });
      await base44.entities.Tournament.update(tournament.id, { status: 'Completed', finalised_at: new Date().toISOString() });
      toast.success('Club Challenge completed');
      await sync();
    }
  };

  const currentMatches = matches.filter(m => m.round_number === currentRound && !m.is_showcase);

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-primary" /></div>
          <div><p className="font-semibold text-foreground">Club Challenge v1.0</p><p className="text-xs text-muted-foreground">{event ? `Status: ${event.status.replaceAll('_', ' ')}` : 'Configure the inter-club event'}</p></div>
        </div>
        {event && <div className="grid grid-cols-[1fr_auto_1fr] sm:flex items-center gap-2 w-full lg:w-auto min-w-0"><ClubBadge name={event.club_a_name} primary={event.club_a_primary_colour} secondary={event.club_a_secondary_colour} /><span className="text-xs text-muted-foreground text-center">vs</span><ClubBadge name={event.club_b_name} primary={event.club_b_primary_colour} secondary={event.club_b_secondary_colour} /></div>}
      </div>

      <div className="flex overflow-x-auto gap-1 -mx-3 px-3 sm:mx-0 sm:px-0 pb-1 snap-x scrollbar-none">
        {TABS.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={cn('px-3 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap min-h-10 snap-start', tab === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary')}>{label}</button>)}
      </div>

      {tab === 'setup' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {[['A', 'Host Club', 'clubAName', 'clubAPrimary', 'clubASecondary'], ['B', 'Opponent Club', 'clubBName', 'clubBPrimary', 'clubBSecondary']].map(([side, label, nameKey, primaryKey, secondaryKey]) => (
              <div key={side} className="glass rounded-xl p-4 sm:p-5 space-y-3">
                <p className="text-sm font-semibold">{label}</p>
                <div><Label className="text-xs">Club name</Label><Input value={setup[nameKey]} onChange={e => setSetup(s => ({ ...s, [nameKey]: e.target.value }))} className="mt-1 bg-secondary" /></div>
                <div className="grid grid-cols-2 gap-3"><div><Label className="text-xs">Primary</Label><Input type="color" value={setup[primaryKey]} onChange={e => setSetup(s => ({ ...s, [primaryKey]: e.target.value }))} className="mt-1 h-10 bg-secondary" /></div><div><Label className="text-xs">Accent</Label><Input type="color" value={setup[secondaryKey]} onChange={e => setSetup(s => ({ ...s, [secondaryKey]: e.target.value }))} className="mt-1 h-10 bg-secondary" /></div></div>
              </div>
            ))}
          </div>
          <div className="glass rounded-xl p-4 sm:p-5 space-y-4">
            <p className="text-sm font-semibold">Event Configuration</p>
            <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[['Courts','courts'],['Available min','availableMinutes'],['Play min','playMinutes'],['Changeover min','changeoverMinutes'],['Break min','breakMinutes'],['Break after round','breakAfterRound']].map(([label,key]) => <div key={key}><Label className="text-xs">{label}</Label><Input type="number" value={setup[key]} onChange={e => setSetup(s => ({ ...s, [key]: e.target.value }))} className="mt-1 bg-secondary" /></div>)}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div><Label className="text-xs">Match format</Label><Select value={setup.matchType} onValueChange={v => setSetup(s => ({ ...s, matchType: v }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="timed">Timed</SelectItem><SelectItem value="points">Point based</SelectItem></SelectContent></Select></div>
              {setup.matchType === 'points' && <><div><Label className="text-xs">Target</Label><Select value={String(setup.target)} onValueChange={v => setSetup(s => ({ ...s, target: number(v) }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="11">11</SelectItem><SelectItem value="15">15</SelectItem></SelectContent></Select></div><div><Label className="text-xs">Win by</Label><Select value={String(setup.winBy)} onValueChange={v => setSetup(s => ({ ...s, winBy: number(v) }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem></SelectContent></Select></div></>}
              <div><Label className="text-xs">Composition</Label><Select value={setup.compositionMode} onValueChange={v => setSetup(s => ({ ...s, compositionMode: v }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="mixed_preferred">Mixed preferred</SelectItem><SelectItem value="mixed_required">Mixed required</SelectItem><SelectItem value="mens">Men's</SelectItem><SelectItem value="womens">Women's</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 lg:gap-4 text-xs">
              <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.includeBreak} onChange={e => setSetup(s => ({ ...s, includeBreak: e.target.checked }))} /> Scheduled break</label>
              {setup.matchType === 'timed' && <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.drawsAllowed} onChange={e => setSetup(s => ({ ...s, drawsAllowed: e.target.checked }))} /> Timed draws allowed</label>}
              <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.showcaseEnabled} onChange={e => setSetup(s => ({ ...s, showcaseEnabled: e.target.checked }))} /> Showcase Final ({setup.showcasePoints} pts)</label>
              <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.potEnabled} onChange={e => setSetup(s => ({ ...s, potEnabled: e.target.checked }))} /> Player of Tournament voting</label>
            </div>
          </div>
          <Button onClick={saveSetup} disabled={!isAdmin || saving} className="w-full h-11">{saving ? 'Saving…' : event ? 'Save Setup Changes' : 'Create Club Challenge'}</Button>
        </div>
      )}

      {tab === 'teams' && (
        <div className="space-y-4">
          {!event ? <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">Save Setup first.</div> : <>
            <div className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div><p className="text-sm font-semibold">Participants</p><p className="text-xs text-muted-foreground">Event ranks are independent of permanent RallyHub skill ratings.</p></div>
              <Button variant="outline" className="w-full sm:w-auto min-h-11" onClick={loadTestRoster} disabled={locked || saving}><Users className="w-4 h-4 mr-2" />Load 16+16 Gate 3 Test Roster</Button>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              {['club_a','club_b'].map(side => <div key={side} className="glass rounded-xl p-4"><div className="grid grid-cols-[1fr_auto] gap-2"><Input placeholder={`Add ${side === 'club_a' ? setup.clubAName : setup.clubBName} player`} value={manual[side]} onChange={e => setManual(m => ({ ...m, [side]: e.target.value }))} className="bg-secondary" /><Button className="w-11 h-11 p-0" onClick={() => addManual(side)} disabled={locked || !manual[side].trim()}><Plus className="w-4 h-4" /></Button></div></div>)}
            </div>
            <div className="grid lg:grid-cols-2 gap-4"><RankingList side="club_a" title={setup.clubAName} participants={aPlayers} locked={locked} onReorder={reorder} /><RankingList side="club_b" title={setup.clubBName} participants={bPlayers} locked={locked} onReorder={reorder} /></div>
            {formatInfo && <div className="glass rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center"><div><p className="text-xl font-bold">{formatInfo.recommendedRounds}</p><p className="text-[10px] text-muted-foreground">Rounds</p></div><div><p className="text-xl font-bold">{formatInfo.totalMatches}</p><p className="text-[10px] text-muted-foreground">Matches</p></div><div><p className="text-xl font-bold">{formatInfo.gamesRangeClubA.join('–')}</p><p className="text-[10px] text-muted-foreground">Games/player</p></div><div><p className="text-xl font-bold">{formatInfo.structuredMinutes}</p><p className="text-[10px] text-muted-foreground">Structured min</p></div><div><p className="text-xl font-bold">{formatInfo.remainingMinutes}</p><p className="text-[10px] text-muted-foreground">Contingency min</p></div></div>}
            <Button onClick={generateDraw} disabled={locked || saving || !formatInfo} className="w-full h-11"><ListChecks className="w-4 h-4 mr-2" />Generate Draw & Fairness Report</Button>
          </>}
        </div>
      )}

      {tab === 'draw' && (
        <div className="space-y-4">
          {!matches.length ? <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">Generate a draw from Teams & Ranking first.</div> : <>
            {fairness && <div className="glass rounded-xl p-5"><div className="flex items-center justify-between mb-4"><div><p className="text-sm font-semibold">Fairness Report</p><p className="text-xs text-muted-foreground">Gate 2 priorities applied</p></div><Badge className={fairness.equalGames && !fairness.duplicatePlayerRoundIssues ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>{fairness.equalGames && !fairness.duplicatePlayerRoundIssues ? 'Hard checks PASS' : 'Review required'}</Badge></div><div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">{[['Matches',fairness.totalMatches],['Games min',fairness.minGames],['Games max',fairness.maxGames],['Partner repeats',fairness.repeatedPartnerPairs],['Max opp repeat',fairness.maxOpponentRepeat],['Consecutive rests',fairness.consecutiveRestOccurrences],['Avg strength gap',Number(fairness.averageStrengthGap).toFixed(2)],['Max gap',fairness.maxStrengthGap]].map(([l,v]) => <div key={l} className="rounded-lg bg-secondary p-3"><p className="text-lg font-bold">{v}</p><p className="text-[10px] text-muted-foreground">{l}</p></div>)}</div></div>}
            <div className="space-y-3 max-h-[48rem] overflow-auto">{rounds.map(r => <div key={r} className="glass rounded-xl p-4"><div className="flex items-center justify-between mb-3"><p className="text-sm font-bold">Round {r}</p><span className="text-[10px] text-muted-foreground">{matches.filter(m => m.round_number === r).length} courts</span></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">{matches.filter(m => m.round_number === r).sort((a,b)=>a.court_number-b.court_number).map(m => <div key={m.id} className="rounded-lg bg-secondary p-3"><p className="text-[10px] font-bold text-primary mb-2">Court {m.court_number}</p><p className="text-xs">{(m.club_a_names || []).join(' & ')}</p><p className="text-[10px] text-muted-foreground my-1">vs</p><p className="text-xs">{(m.club_b_names || []).join(' & ')}</p></div>)}</div></div>)}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{event?.status === 'draw_generated' && <><Button variant="outline" className="w-full min-h-11" onClick={generateDraw} disabled={saving}><RefreshCw className="w-4 h-4 mr-2" />Full Redraw</Button><Button className="w-full min-h-11" onClick={approveDraw}><Check className="w-4 h-4 mr-2" />Approve Draw</Button></>}{event?.status === 'draw_approved' && <Button className="w-full" onClick={startEvent}><Play className="w-4 h-4 mr-2" />Start Club Challenge</Button>}</div>
          </>}
        </div>
      )}

      {tab === 'live' && (
        <div className="space-y-4">
          {!event || !['in_progress','paused','completed'].includes(event.status) ? <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">Approve the draw and Start Club Challenge first.</div> : <>
            <div className="glass rounded-xl p-4 sm:p-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm text-muted-foreground">Round {currentRound} of {Math.max(...rounds)}</p><p className="text-xl sm:text-2xl font-bold break-words">{event.club_a_name} {score.clubA} <span className="text-muted-foreground font-normal">–</span> {score.clubB} {event.club_b_name}</p></div><div className="flex gap-2 text-xs"><Badge variant="outline">{score.matchesWonA}W</Badge><Badge variant="outline">{score.draws}D</Badge><Badge variant="outline">{score.matchesWonB}W</Badge></div></div>{event.include_break && currentRound === event.break_after_round && <div className="mt-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-400"><Clock className="inline w-4 h-4 mr-1" />Scheduled {event.break_minutes}-minute break after this round.</div>}</div>
            <div className="grid md:grid-cols-2 gap-3">{currentMatches.sort((a,b)=>a.court_number-b.court_number).map(m => <ScoreCard key={`${m.id}-${m.revision}`} match={m} clubAName={event.club_a_name} clubBName={event.club_b_name} onSaved={refetchMatches} />)}</div>
            {event.status !== 'completed' && <Button className="w-full h-11" onClick={advanceRound}>{currentRound < Math.max(...rounds) ? `Complete Round ${currentRound} & Go to Round ${currentRound + 1}` : <><Trophy className="w-4 h-4 mr-2" />Finalise Club Challenge</>}</Button>}
            {event.status === 'completed' && <div className="glass rounded-xl p-8 text-center"><Trophy className="w-10 h-10 text-primary mx-auto mb-2" /><p className="text-xl font-bold">Club Challenge complete</p><p className="text-sm text-muted-foreground mt-1">Final normal-match score: {event.club_a_name} {score.clubA}–{score.clubB} {event.club_b_name}</p></div>}
          </>}
        </div>
      )}
    </div>
  );
}
