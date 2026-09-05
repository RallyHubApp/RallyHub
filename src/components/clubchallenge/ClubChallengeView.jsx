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
import { Check, CheckCircle2, Clock, GripVertical, ImagePlus, ListChecks, Play, Plus, RefreshCw, ShieldCheck, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  analyseClubChallengeFairness,
  applyShowcasePoints,
  calculateClubChallengeFormat,
  calculateClubChallengeScore,
  generateClubChallengeFixtures,
  resolveClubChallengeWinner,
} from '@/lib/clubChallengeEngine.js';
import {
  createChallengeEventDraft,
  fixtureRecordsFromSchedule,
  scoreFromMatchRecords,
} from '@/lib/clubChallengeWorkflow.js';

const TABS = [
  ['setup', 'Setup'],
  ['teams', 'Teams'],
  ['draw', 'Draw'],
  ['live', 'Live Event'],
  ['simulator', 'Simulator'],
  ['results', 'Results'],
];

const DEFAULT_SETUP = {
  clubAName: 'Clare Pickleball Club', clubALogo: '', clubAPrimary: '#2563eb', clubASecondary: '#facc15',
  clubBName: 'Galway Pickleball', clubBLogo: '', clubBPrimary: '#7f1d1d', clubBSecondary: '#f8fafc',
  courts: 4, availableMinutes: 180, playMinutes: 10, changeoverMinutes: 2,
  includeBreak: true, breakMinutes: 20, breakAfterRound: 6,
  matchType: 'timed', target: 11, winBy: 1, drawsAllowed: true,
  compositionMode: 'open', showcaseEnabled: true, showcasePoints: 5, potEnabled: true,
};

function number(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function genderKey(value) { const v = String(value || '').trim().toLowerCase(); return v.startsWith('f') ? 'female' : v.startsWith('m') ? 'male' : ''; }

function ClubBadge({ name, logo, primary, secondary }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 sm:px-3 py-2 bg-secondary/40 min-w-0 flex-1 sm:flex-none">
      {logo ? <img src={logo} alt={`${name || 'Club'} logo`} className="w-7 h-7 rounded-full object-contain bg-white p-0.5 shrink-0" /> : <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: primary || '#334155', color: secondary || '#fff' }}>{(name || '?').slice(0, 2).toUpperCase()}</span>}
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

function ScoreCard({ match, clubAName, clubBName, onSaved, networkOnline = true, onQueue, canScore = true }) {
  const [a, setA] = useState(match.score_a ?? '');
  const [b, setB] = useState(match.score_b ?? '');
  const [saving, setSaving] = useState(false);
  const saved = ['completed', 'draw'].includes(match.status);
  const save = async () => {
    const payload = { matchId: match.id, expectedRevision: match.revision || 0, scoreA: number(a), scoreB: number(b) };
    if (!networkOnline) { onQueue?.({ ...payload, queuedAt: new Date().toISOString(), clubAName, clubBName, matchLabel: `R${match.round_number} C${match.court_number}` }); toast.warning('Offline: result retained on this device as UNSYNCHRONISED.'); return; }
    setSaving(true);
    try {
      const res = await base44.functions.invoke('saveClubChallengeScore', payload);
      if (res.data?.conflict) {
        toast.error('Score conflict: this result changed on another device. Refresh and review it.');
      } else if (res.data?.error) {
        toast.error(res.data.error);
      } else {
        toast.success(saved ? 'Score corrected and audited' : 'Score saved');
        onSaved?.();
      }
    } catch (e) {
      if (!navigator.onLine || /network|fetch|offline/i.test(e?.message || '')) { onQueue?.({ ...payload, queuedAt: new Date().toISOString(), clubAName, clubBName, matchLabel: `R${match.round_number} C${match.court_number}` }); toast.warning('Connection lost: result retained locally as UNSYNCHRONISED.'); }
      else toast.error(e?.response?.data?.error || e?.message || 'Could not save score');
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
      <Button className="w-full h-11" onClick={save} disabled={!canScore || a === '' || b === '' || saving}>{!canScore ? 'Read-only' : saving ? 'Saving…' : !networkOnline ? 'Retain Offline Result' : saved ? 'Correct Result' : 'Save Result'}</Button>
      {saved && <p className="text-[10px] text-muted-foreground text-center">Revision {match.revision || 0} · {match.winner === 'draw' ? 'Draw' : match.winner === 'club_a' ? `${clubAName} win` : `${clubBName} win`}</p>}
    </div>
  );
}

export default function ClubChallengeView({ tournament, queryClient, isAdmin }) {
  const [tab, setTab] = useState('setup');
  const [setup, setSetup] = useState(DEFAULT_SETUP);
  const [manual, setManual] = useState({ club_a: '', club_b: '' });
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [logoUploading, setLogoUploading] = useState('');
  const [simLog, setSimLog] = useState([]);
  const [showcaseSelection, setShowcaseSelection] = useState({ aMale: '', aFemale: '', bMale: '', bFemale: '' });
  const [replacement, setReplacement] = useState({ outgoingId: '', incomingName: '', incomingGender: '', reason: '', status: 'withdrawn' });
  const [lateArrival, setLateArrival] = useState({ participantId: '', round: 1 });
  const [eventDayAdjust, setEventDayAdjust] = useState({ courts: 0, availableMinutes: 0 });
  const [eventDayProposal, setEventDayProposal] = useState(null);
  const [networkOnline, setNetworkOnline] = useState(() => navigator.onLine);
  const [pendingScores, setPendingScores] = useState(() => { try { return JSON.parse(localStorage.getItem(`cc-pending-${tournament.id}`) || '[]'); } catch { return []; } });
  const [timerNow, setTimerNow] = useState(Date.now());
  const [voiceMode, setVoiceMode] = useState(() => localStorage.getItem('cc-voice-mode') || 'irish_female');
  const [voices, setVoices] = useState([]);
  const [voiceMuted, setVoiceMuted] = useState(() => localStorage.getItem('cc-voice-muted') === 'true');
  const [roundLabels, setRoundLabels] = useState({});
  const [lastAnnouncement, setLastAnnouncement] = useState('');
  const [compressedTimer, setCompressedTimer] = useState({ running: false, step: -1, text: 'Not run' });
  const [displayMode, setDisplayMode] = useState(false);
  const [potVoterId, setPotVoterId] = useState('');
  const [potNomineeId, setPotNomineeId] = useState('');

  const { data: currentUser } = useQuery({ queryKey: ['cc-current-user'], queryFn: () => base44.auth.me() });
  const { data: hostClub } = useQuery({
    queryKey: ['cc-host-club', tournament.host_club_id || currentUser?.active_club_id],
    queryFn: async () => {
      const clubId = tournament.host_club_id || currentUser?.active_club_id;
      if (!clubId) return null;
      return (await base44.entities.Club.filter({ id: clubId }))[0] || null;
    },
    enabled: isAdmin && !!(tournament.host_club_id || currentUser?.active_club_id),
  });
  const { data: secureState, refetch: refetchSecureState } = useQuery({
    queryKey: ['club-challenge-secure-state', tournament.id, currentUser?.id],
    queryFn: async () => (await base44.functions.invoke('getClubChallengeState', { tournamentId: tournament.id })).data,
    enabled: !!currentUser && !isAdmin,
    refetchInterval: 5000,
  });
  const { data: adminEvent, refetch: refetchAdminEvent } = useQuery({
    queryKey: ['club-challenge-event', tournament.id],
    queryFn: async () => (await base44.entities.ClubChallengeEvent.filter({ tournament_id: tournament.id }))[0] || null,
    enabled: isAdmin,
    refetchInterval: 5000,
  });
  const event = isAdmin ? adminEvent : secureState?.event || null;
  const { data: adminParticipants = [], refetch: refetchAdminParticipants } = useQuery({
    queryKey: ['club-challenge-participants', event?.id],
    queryFn: () => event ? base44.entities.ClubChallengeParticipant.filter({ challenge_event_id: event.id }, 'event_rank', 100) : [],
    enabled: isAdmin && !!event?.id,
  });
  const participants = isAdmin ? adminParticipants : secureState?.participants || [];
  const { data: adminMatches = [], refetch: refetchAdminMatches } = useQuery({
    queryKey: ['club-challenge-matches', event?.id],
    queryFn: () => event ? base44.entities.ClubChallengeMatch.filter({ challenge_event_id: event.id }, 'round_number', 200) : [],
    enabled: isAdmin && !!event?.id,
  });
  const matches = isAdmin ? adminMatches : secureState?.matches || [];
  const refetchEvent = isAdmin ? refetchAdminEvent : refetchSecureState;
  const refetchParticipants = isAdmin ? refetchAdminParticipants : refetchSecureState;
  const refetchMatches = isAdmin ? refetchAdminMatches : refetchSecureState;
  const { data: potVotes = [], refetch: refetchPotVotes } = useQuery({
    queryKey: ['club-challenge-votes', event?.id],
    queryFn: () => event ? base44.entities.ClubChallengeVote.filter({ challenge_event_id: event.id }, '-cast_at', 200) : [],
    enabled: isAdmin && !!event?.id && !!event?.pot_enabled,
  });

  React.useEffect(() => {
    if (!event) return;
    setSetup(s => ({
      ...s,
      clubAName: event.club_a_name || s.clubAName, clubALogo: event.club_a_logo_url || s.clubALogo, clubAPrimary: event.club_a_primary_colour || s.clubAPrimary, clubASecondary: event.club_a_secondary_colour || s.clubASecondary,
      clubBName: event.club_b_name || s.clubBName, clubBLogo: event.club_b_logo_url || s.clubBLogo, clubBPrimary: event.club_b_primary_colour || s.clubBPrimary, clubBSecondary: event.club_b_secondary_colour || s.clubBSecondary,
      courts: event.courts ?? s.courts, availableMinutes: event.available_minutes ?? s.availableMinutes, playMinutes: event.play_minutes ?? s.playMinutes,
      changeoverMinutes: event.changeover_minutes ?? s.changeoverMinutes, includeBreak: event.include_break ?? s.includeBreak,
      breakMinutes: event.break_minutes ?? s.breakMinutes, breakAfterRound: event.break_after_round ?? s.breakAfterRound,
      matchType: event.normal_match_type || s.matchType, target: event.normal_target_points || s.target, winBy: event.normal_win_by || s.winBy,
      drawsAllowed: event.timed_draws_allowed !== false, compositionMode: event.composition_mode || s.compositionMode,
      showcaseEnabled: !!event.showcase_enabled, showcasePoints: event.showcase_points ?? s.showcasePoints, potEnabled: !!event.pot_enabled,
    }));
  }, [event?.id]);

  React.useEffect(() => {
    if (event || !hostClub) return;
    setSetup(s => ({ ...s, clubAName: hostClub.name || s.clubAName, clubALogo: hostClub.logo_url || s.clubALogo }));
  }, [event, hostClub?.id]);

  React.useEffect(() => {
    if (!event) return;
    setShowcaseSelection({
      aMale: event.showcase_club_a_male_id || '',
      aFemale: event.showcase_club_a_female_id || '',
      bMale: event.showcase_club_b_male_id || '',
      bFemale: event.showcase_club_b_female_id || '',
    });
  }, [event?.id, event?.showcase_club_a_male_id, event?.showcase_club_a_female_id, event?.showcase_club_b_male_id, event?.showcase_club_b_female_id]);

  const accessRole = isAdmin ? 'admin' : secureState?.accessRole || '';
  const canManageEvent = isAdmin || ['event_manager','event_host','owner','organiser'].includes(accessRole);
  const canScoreEvent = isAdmin || ['event_manager','event_host','scorer','owner','organiser'].includes(accessRole);
  const aPlayers = participants.filter(p => p.side === 'club_a');
  const bPlayers = participants.filter(p => p.side === 'club_b');
  const normalMatches = matches.filter(m => !m.is_showcase);
  const showcaseMatch = matches.find(m => m.is_showcase) || null;
  const locked = ['draw_approved', 'in_progress', 'paused', 'completed', 'archived'].includes(event?.status);
  const fairness = useMemo(() => { try { return event?.fairness_json ? JSON.parse(event.fairness_json) : null; } catch { return null; } }, [event?.fairness_json]);
  const score = useMemo(() => scoreFromMatchRecords(normalMatches, { winPoints: event?.win_points ?? 2, drawPoints: event?.draw_points ?? 1, lossPoints: event?.loss_points ?? 0 }), [normalMatches, event?.win_points, event?.draw_points, event?.loss_points]);
  const overallScore = useMemo(() => {
    if (!showcaseMatch || !['completed','draw'].includes(showcaseMatch.status) || !['club_a','club_b'].includes(showcaseMatch.winner)) return score;
    return applyShowcasePoints(score, { winner: showcaseMatch.winner === 'club_a' ? 'clubA' : 'clubB', points: Number(event?.showcase_points || 0) });
  }, [score, showcaseMatch, event?.showcase_points]);
  const rounds = [...new Set(normalMatches.map(m => m.round_number))].sort((a, b) => a - b);
  const currentRound = event?.current_round || 1;
  const timerState = useMemo(() => { try { return event?.timer_state_json ? JSON.parse(event.timer_state_json) : null; } catch { return null; } }, [event?.timer_state_json]);
  const timerRemaining = useMemo(() => {
    if (!timerState) return 0;
    const base = Number(timerState.remaining_seconds || 0);
    if (!timerState.running || !timerState.started_at) return Math.max(0, base);
    return Math.max(0, base - Math.floor((timerNow - new Date(timerState.started_at).getTime()) / 1000));
  }, [timerState, timerNow]);
  React.useEffect(() => {
    const id = window.setInterval(() => setTimerNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  React.useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
  }, []);
  React.useEffect(() => { localStorage.setItem('cc-voice-mode', voiceMode); }, [voiceMode]);
  React.useEffect(() => { localStorage.setItem('cc-voice-muted', String(voiceMuted)); }, [voiceMuted]);
  React.useEffect(() => {
    const online = () => setNetworkOnline(true), offline = () => setNetworkOnline(false);
    window.addEventListener('online', online); window.addEventListener('offline', offline);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
  }, []);
  React.useEffect(() => { localStorage.setItem(`cc-pending-${tournament.id}`, JSON.stringify(pendingScores)); }, [pendingScores, tournament.id]);

  const sync = async () => {
    await Promise.all([refetchEvent(), refetchParticipants(), refetchMatches(), event?.pot_enabled ? refetchPotVotes() : Promise.resolve()]);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
  };
  const queueOfflineScore = item => setPendingScores(q => [...q.filter(x => x.matchId !== item.matchId), item]);
  const retryPendingScores = async () => {
    if (!networkOnline || !pendingScores.length) return;
    const remaining = [], conflicts = [];
    for (const item of pendingScores) {
      try {
        const res = await base44.functions.invoke('saveClubChallengeScore', { matchId:item.matchId, expectedRevision:item.expectedRevision, scoreA:item.scoreA, scoreB:item.scoreB });
        if (res.data?.conflict || res.data?.error) { remaining.push(item); conflicts.push({ ...item, reason:res.data?.error || 'Revision conflict' }); }
      } catch (e) { remaining.push(item); conflicts.push({ ...item, reason:e?.response?.data?.error || e?.message || 'Retry failed' }); }
    }
    setPendingScores(remaining); await refetchMatches();
    if (!remaining.length) toast.success('All offline results synchronised successfully.'); else toast.error(`${remaining.length} offline result${remaining.length===1?'':'s'} need manual review; nothing was overwritten.`);
    if (conflicts.length) conflicts.forEach(c => addSimLog(`Offline conflict ${c.matchLabel}: ${c.reason}`, 'info'));
  };
  React.useEffect(() => { if (networkOnline && pendingScores.length) toast.info(`${pendingScores.length} unsynchronised result${pendingScores.length===1?'':'s'} ready to retry.`); }, [networkOnline]);

  const saveSetup = async () => {
    if (!isAdmin) return;
    const tenantId = tournament.tenant_id || currentUser?.active_tenant_id;
    const hostClubId = tournament.host_club_id || currentUser?.active_club_id;
    if (!tenantId) { toast.error('No active Tenant is attached to this event.'); return; }
    setSaving(true);
    const data = createChallengeEventDraft({
      tournament: { ...tournament, tenant_id: tenantId, host_club_id: hostClubId },
      hostClub: { id: hostClubId, name: setup.clubAName, logo_url: setup.clubALogo, primary_colour: setup.clubAPrimary, secondary_colour: setup.clubASecondary },
      opponent: { name: setup.clubBName, logo_url: setup.clubBLogo, primary_colour: setup.clubBPrimary, secondary_colour: setup.clubBSecondary },
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

  const uploadClubLogo = async (side, file) => {
    if (!file) return;
    setLogoUploading(side);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (!file_url) throw new Error('No file URL returned');
      setSetup(s => ({ ...s, [side === 'A' ? 'clubALogo' : 'clubBLogo']: file_url }));
      toast.success(`${side === 'A' ? setup.clubAName : setup.clubBName} logo uploaded`);
    } catch (e) { toast.error(e?.message || 'Could not upload logo'); }
    finally { setLogoUploading(''); }
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
    await base44.entities.ClubChallengeEvent.update(event.id, { status: 'draw_approved', draw_version: Number(event.draw_version || 0) + 1, draw_approved_at: new Date().toISOString(), draw_approved_by: currentUser?.id || '', event_pack_stale: false, event_pack_version: Number(event.draw_version || 0) + 1 });
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

  const timerAction = async (action, phase) => {
    if (!event) return false;
    try {
      const res = await base44.functions.invoke('updateClubChallengeTimer', { eventId: event.id, action, phase, expectedRevision: Number(event.timer_revision || 0) });
      if (res.data?.conflict) { toast.error('Timer changed on another device. RallyHub has refreshed the authoritative timer.'); await refetchEvent(); return false; }
      if (res.data?.error) { toast.error(res.data.error); return false; }
      await refetchEvent();
      return true;
    } catch (e) {
      if (e?.response?.status === 409) toast.error('Timer changed on another device. Refreshing authoritative timer.');
      else toast.error(e?.response?.data?.error || e?.message || 'Could not update timer');
      await refetchEvent();
      return false;
    }
  };

  const chooseVoice = mode => {
    if (!voices.length || mode === 'device_default') return null;
    const ie = voices.filter(v => /^en[-_]IE$/i.test(v.lang) || /irish|ireland/i.test(`${v.name} ${v.lang}`));
    const femaleHint = /female|siri.*(female|2)|moira|fiona|caitlin|orla|aoife/i;
    const maleHint = /male|siri.*(male|1)|liam|sean|colm|cian/i;
    if (mode === 'irish_female') return ie.find(v => femaleHint.test(v.name)) || ie.find(v => !maleHint.test(v.name)) || ie[0] || null;
    if (mode === 'irish_male') return ie.find(v => maleHint.test(v.name)) || ie.find(v => !femaleHint.test(v.name)) || ie[0] || null;
    return null;
  };
  const speak = (text, { force = false } = {}) => {
    if (!text || !('speechSynthesis' in window) || voiceMode === 'off' || (voiceMuted && !force)) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IE';
    const voice = chooseVoice(voiceMode);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    setLastAnnouncement(text);
    return true;
  };
  const roundLabel = round => roundLabels[round] || `Round ${round}`;
  const announcePhase = (phase, round = currentRound) => {
    const label = roundLabel(round);
    const text = phase === 'play' ? `${label}. Play. ${Number(event?.play_minutes || 10)} minutes.` : phase === 'changeover' ? `${label} complete. Changeover. ${Number(event?.changeover_minutes || 2)} minutes.` : `Scheduled break. ${Number(event?.break_minutes || 20)} minutes.`;
    speak(text);
  };
  const startPhase = async phase => { if (await timerAction('start', phase)) announcePhase(phase); };
  const pauseTimer = async () => { if (await timerAction('pause')) speak('Event paused.'); };
  const resumeTimer = async () => { if (await timerAction('resume')) speak(`${roundLabel(currentRound)}. Resume play.`); };
  const resetTimer = () => timerAction('reset');
  const fmtTimer = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const testVoice = () => speak(`${roundLabel(currentRound)}. Play. ${Number(event?.play_minutes || 10)} minutes.`, { force: true });
  const runCompressedTimerAudioTest = async () => {
    if (compressedTimer.running) return;
    const steps = [
      `${roundLabel(1)}. Play.`, `${roundLabel(1)} complete. Changeover.`, `${roundLabel(2)}. Play.`,
      'Event paused.', `${roundLabel(2)}. Resume play.`, `Scheduled break. ${Number(event?.break_minutes || 20)} minutes.`, `${roundLabel(3)}. Play.`
    ];
    setCompressedTimer({ running: true, step: 0, text: steps[0] });
    for (let i = 0; i < steps.length; i += 1) {
      setCompressedTimer({ running: true, step: i, text: steps[i] });
      speak(steps[i]);
      await new Promise(resolve => window.setTimeout(resolve, 1200));
    }
    setCompressedTimer({ running: false, step: steps.length - 1, text: 'PASS — compressed phase/announcement sequence completed' });
    addSimLog('Compressed timer/audio: PLAY → CHANGEOVER → PLAY → PAUSE → RESUME → BREAK → PLAY completed', 'pass');
  };

  const setPotStatus = async status => {
    if (!event || !canManageEvent || !['open','closed'].includes(status)) return;
    try {
      const action = status === 'open' ? 'open' : 'close';
      const res = await base44.functions.invoke('updateClubChallengePot', { eventId:event.id, action });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
      toast.success(status === 'open' ? 'Player of Tournament voting is open.' : 'Voting closed. Totals remain hidden until reveal.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not update voting status'); }
  };
  const castPotVote = async () => {
    if (!event || event.pot_status !== 'open' || !potVoterId || !potNomineeId) return;
    if (potVoterId === potNomineeId) { toast.error('Players cannot vote for themselves.'); return; }
    try {
      const res = await base44.functions.invoke('castClubChallengePotVote', { eventId:event.id, voterParticipantId:potVoterId, nomineeParticipantId:potNomineeId });
      if (res.data?.error) { toast.error(res.data.error); return; }
      setPotNomineeId('');
      if (isAdmin) await refetchPotVotes();
      toast.success('Vote recorded. Live totals remain hidden.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not record vote'); }
  };
  const revealPot = async () => {
    if (!event || !canManageEvent) return;
    try {
      const res = await base44.functions.invoke('updateClubChallengePot', { eventId:event.id, action:'reveal' });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
      toast.success(Number(res.data?.winnerCount || 0) > 1 ? 'Joint Player of Tournament result revealed.' : 'Player of Tournament result revealed.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not reveal voting result'); }
  };
  const printEventPack = async () => {
    if (!event || !['draw_approved','in_progress','paused','completed'].includes(event.status) || !normalMatches.length) { toast.error('Approve the draw before producing the Event Pack.'); return; }
    if (event.event_pack_stale) { toast.error('This pack is OUT OF DATE because fixtures changed. Re-approve the draw before printing a new authoritative pack.'); return; }
    await base44.entities.ClubChallengeEvent.update(event.id, { event_pack_generated_at: new Date().toISOString() });
    await refetchEvent();
    window.setTimeout(() => window.print(), 100);
  };
  const applyReplacement = async () => {
    if (!event || !replacement.outgoingId || !replacement.incomingName.trim()) { toast.error('Choose the outgoing player and enter the replacement name.'); return; }
    const outgoing = participants.find(p => p.id === replacement.outgoingId);
    if (!outgoing) return;
    const identityName = replacement.incomingName.trim().toLowerCase().replace(/\s+/g, ' ');
    if (participants.some(p => p.id !== outgoing.id && p.status === 'active' && p.display_name.trim().toLowerCase().replace(/\s+/g, ' ') === identityName)) { toast.error('That replacement name is already an active participant in this Club Challenge.'); return; }
    const effectiveRound = Math.max(1, currentRound);
    const now = new Date().toISOString();
    const incoming = await base44.entities.ClubChallengeParticipant.create({
      tenant_id: event.tenant_id, challenge_event_id: event.id, tournament_id: tournament.id,
      side: outgoing.side, display_name: replacement.incomingName.trim(), gender: replacement.incomingGender || outgoing.gender,
      event_rank: outgoing.event_rank, status: 'active', available_from_round: effectiveRound,
      replacement_for_participant_id: outgoing.id, replacement_effective_round: effectiveRound,
      unique_identity_key: `replacement-${outgoing.side}-${replacement.incomingName.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, 
    });
    await base44.entities.ClubChallengeParticipant.update(outgoing.id, {
      status: replacement.status, replaced_by_participant_id: incoming.id,
      withdrawn_at: now, withdrawal_reason: replacement.reason || replacement.status,
    });
    const affected = normalMatches.filter(m => m.round_number >= effectiveRound && !['completed','draw','retired','forfeit','abandoned','not_played'].includes(m.status) && ((m.club_a_participant_ids || []).includes(outgoing.id) || (m.club_b_participant_ids || []).includes(outgoing.id)));
    for (const m of affected) {
      const side = outgoing.side === 'club_a' ? 'club_a' : 'club_b';
      const idsKey = `${side}_participant_ids`, namesKey = `${side}_names`;
      const ids = [...(m[idsKey] || [])], names = [...(m[namesKey] || [])];
      const idx = ids.indexOf(outgoing.id);
      if (idx >= 0) { ids[idx] = incoming.id; names[idx] = incoming.display_name; }
      await base44.entities.ClubChallengeMatch.update(m.id, { [idsKey]: ids, [namesKey]: names, revision: Number(m.revision || 0) + 1 });
    }
    await base44.entities.ClubChallengeEvent.update(event.id, { event_pack_stale: true });
    await base44.entities.ClubChallengeAudit.create({
      tenant_id: event.tenant_id, challenge_event_id: event.id, action: 'participant_replaced', user_id: currentUser?.id || '', occurred_at: now,
      old_value_json: JSON.stringify({ participant_id: outgoing.id, name: outgoing.display_name, status: outgoing.status }),
      new_value_json: JSON.stringify({ participant_id: incoming.id, name: incoming.display_name, effective_round: effectiveRound, fixtures_changed: affected.length }),
      note: replacement.reason || `${replacement.status} replacement`,
    });
    setReplacement({ outgoingId: '', incomingName: '', incomingGender: '', reason: '', status: 'withdrawn' });
    toast.success(`${outgoing.display_name} replaced from Round ${effectiveRound}; ${affected.length} future fixture${affected.length === 1 ? '' : 's'} updated.`);
    await sync();
  };

  const withdrawWithoutReplacement = async () => {
    if (!event || !replacement.outgoingId) { toast.error('Choose the player who is withdrawing.'); return; }
    const outgoing = participants.find(p => p.id === replacement.outgoingId); if (!outgoing) return;
    const effectiveRound = Math.max(1, currentRound), now = new Date().toISOString();
    const affected = normalMatches.filter(m => m.round_number >= effectiveRound && !['completed','draw','retired','forfeit','abandoned','not_played'].includes(m.status) && ((m.club_a_participant_ids||[]).includes(outgoing.id) || (m.club_b_participant_ids||[]).includes(outgoing.id)));
    for (const m of affected) await base44.entities.ClubChallengeMatch.update(m.id, { status: 'not_played', winner: 'none', revision: Number(m.revision || 0) + 1 });
    await base44.entities.ClubChallengeParticipant.update(outgoing.id, { status: replacement.status === 'replaced' ? 'withdrawn' : replacement.status, withdrawn_at: now, withdrawal_reason: replacement.reason || 'Continued short without replacement' });
    await base44.entities.ClubChallengeEvent.update(event.id, { event_pack_stale: true });
    await base44.entities.ClubChallengeAudit.create({ tenant_id: event.tenant_id, challenge_event_id: event.id, action: 'participant_withdrawn_no_replacement', user_id: currentUser?.id || '', occurred_at: now, old_value_json: JSON.stringify({participant_id: outgoing.id, name: outgoing.display_name}), new_value_json: JSON.stringify({effective_round: effectiveRound, matches_not_played: affected.length}), note: replacement.reason || 'Organiser chose to continue short.' });
    setReplacement({ outgoingId: '', incomingName: '', incomingGender: '', reason: '', status: 'withdrawn' }); toast.success(`${outgoing.display_name} withdrawn; ${affected.length} future match${affected.length === 1 ? '' : 'es'} marked Not Played.`); await sync();
  };
  const applyLateArrival = async () => {
    if (!event || !lateArrival.participantId) return;
    const p = participants.find(x => x.id === lateArrival.participantId); if (!p) return;
    const fromRound = Math.max(currentRound || 1, Number(lateArrival.round || 1));
    await base44.entities.ClubChallengeParticipant.update(p.id, { status: 'late', available_from_round: fromRound });
    await base44.entities.ClubChallengeEvent.update(event.id, { event_pack_stale: true });
    await base44.entities.ClubChallengeAudit.create({ tenant_id: event.tenant_id, challenge_event_id: event.id, action: 'late_arrival_set', user_id: currentUser?.id || '', occurred_at: new Date().toISOString(), new_value_json: JSON.stringify({participant_id:p.id, available_from_round:fromRound}) });
    toast.success(`${p.display_name} marked available from Round ${fromRound}. Draw consequences require organiser review.`); await sync();
  };
  const proposeEventDayAdjustment = () => {
    const courts = Number(eventDayAdjust.courts || event?.courts || 0), minutes = Number(eventDayAdjust.availableMinutes || event?.available_minutes || 0);
    if (!courts || !minutes || !rounds.length) { toast.error('Enter available courts and remaining event minutes.'); return; }
    const unresolved = normalMatches.filter(m => m.round_number >= currentRound && !['completed','draw','retired','forfeit','abandoned','not_played'].includes(m.status)).sort((a,b)=>(a.round_number-b.round_number)||(a.court_number-b.court_number));
    const block = Number(event.play_minutes||10) + Number(event.changeover_minutes||2), slots = Math.max(0, Math.floor(minutes / Math.max(1, block)) * courts);
    const keep = unresolved.slice(0, slots), drop = unresolved.slice(slots);
    const changes = keep.map((m,i) => ({ id:m.id, oldRound:m.round_number, oldCourt:m.court_number, newRound:currentRound + Math.floor(i/courts), newCourt:(i%courts)+1 })).filter(x=>x.oldRound!==x.newRound || x.oldCourt!==x.newCourt);
    const proposal = { courts, minutes, block, unresolved: unresolved.length, keepIds: keep.map(m=>m.id), dropIds: drop.map(m=>m.id), changes };
    setEventDayProposal(proposal);
    toast.info(`${keep.length} future matches fit; ${drop.length} would be marked Not Played. Review before confirming.`);
  };
  const confirmEventDayAdjustment = async () => {
    if (!eventDayProposal || !canManageEvent) return;
    try {
      const res = await base44.functions.invoke('updateClubChallengeSchedule', {
        eventId: event.id,
        courts: eventDayProposal.courts,
        availableMinutes: eventDayProposal.minutes,
        changes: eventDayProposal.changes,
        dropIds: eventDayProposal.dropIds,
      });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(`Schedule adjusted: ${eventDayProposal.changes.length} future fixture positions changed; ${eventDayProposal.dropIds.length} marked Not Played.`);
      setEventDayProposal(null);
      await sync();
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Could not confirm schedule adjustment');
    }
  };

  const finaliseEvent = async (winner, method, note = '') => {
    if (!event || !['club_a','club_b','draw'].includes(winner)) return;
    if (event.pot_enabled && event.pot_status === 'open') { toast.error('Player of the Tournament voting is still open.'); return; }
    try {
      const res = await base44.functions.invoke('finaliseClubChallenge', { eventId:event.id, method });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(res.data?.winner === 'draw' ? 'Club Challenge finalised as an overall draw' : `${res.data?.winner === 'club_b' ? event.club_b_name : event.club_a_name} confirmed as Club Challenge winner`);
      await sync(); setTab('results');
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Could not finalise Club Challenge');
    }
  };

  const resolveTieByMetrics = async () => {
    if (score.clubA !== score.clubB) { toast.info('The normal Club Challenge points are not tied.'); return; }
    const winner = resolveClubChallengeWinner(score, { allowDraw: false });
    if (winner === 'tiebreak_required') { toast.error('Cumulative point differential is also tied. Play the Showcase Final or record an overall draw if allowed.'); return; }
    await finaliseEvent(winner === 'clubA' ? 'club_a' : 'club_b', 'metrics', `Tie resolved by cumulative point differential (${score.gamePointDifference >= 0 ? '+' : ''}${score.gamePointDifference}).`);
  };

  const recordOverallDraw = async () => {
    if (!event?.allow_overall_draw) { toast.error('Overall draw is not enabled for this event.'); return; }
    if (score.clubA !== score.clubB) { toast.error('Overall draw can only be recorded when Club Challenge points are level.'); return; }
    await finaliseEvent('draw', 'overall_draw', 'Normal points and chosen tiebreak outcome left the Club Challenge level.');
  };

  const createShowcaseFinal = async () => {
    if (!event?.showcase_enabled) { toast.error('Showcase Final is not enabled in Setup.'); return; }
    if (score.clubA !== score.clubB) { toast.error('The Showcase tiebreak is only needed when normal Club Challenge points are level.'); return; }
    if (Number(event.showcase_points || 0) <= 0) { toast.error('Showcase Final points must be greater than zero.'); return; }
    const ids = [showcaseSelection.aMale, showcaseSelection.aFemale, showcaseSelection.bMale, showcaseSelection.bFemale];
    if (ids.some(id => !id)) { toast.error('Nominate one male and one female player from each club.'); return; }
    try {
      const res = await base44.functions.invoke('createClubChallengeShowcase', {
        eventId: event.id,
        clubAMaleId: showcaseSelection.aMale,
        clubAFemaleId: showcaseSelection.aFemale,
        clubBMaleId: showcaseSelection.bMale,
        clubBFemaleId: showcaseSelection.bFemale,
      });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success('Showcase Final created');
      await sync(); setTab('results');
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Could not create Showcase Final');
    }
  };

  const finaliseShowcase = async () => {
    if (!showcaseMatch || !['completed'].includes(showcaseMatch.status) || !['club_a','club_b'].includes(showcaseMatch.winner)) { toast.error('Save the Showcase Final result first.'); return; }
    await finaliseEvent(showcaseMatch.winner, 'showcase_final', `Showcase Final worth ${event.showcase_points} Club Challenge points decided the tied event.`);
  };

  const advanceRound = async () => {
    const currentMatches = matches.filter(m => m.round_number === currentRound && !m.is_showcase);
    const unresolved = currentMatches.filter(m => !['completed', 'draw', 'retired', 'forfeit', 'abandoned', 'not_played'].includes(m.status));
    if (unresolved.length) { toast.error(`${unresolved.length} result${unresolved.length === 1 ? '' : 's'} still missing in Round ${currentRound}.`); return; }
    const maxRound = Math.max(...rounds);
    if (currentRound < maxRound) {
      const res = await base44.functions.invoke('updateClubChallengeRound', { eventId: event.id, nextRound: currentRound + 1 });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(`Round ${currentRound + 1} ready`);
      await refetchEvent();
    } else {
      if (score.completedMatches !== normalMatches.length) { toast.error('All normal match results must be resolved before the event can finish.'); return; }
      if (score.clubA === score.clubB) {
        toast.info('Normal Club Challenge points are tied. Choose Showcase Final, metrics, or overall draw in Results.');
        setTab('results');
        return;
      }
      await finaliseEvent(score.clubA > score.clubB ? 'club_a' : 'club_b', 'none', 'Clear winner after normal Club Challenge matches.');
    }
  };

  const currentMatches = matches.filter(m => m.round_number === currentRound && !m.is_showcase);
  const isGate3TestEvent = participants.length >= 8 && participants.every(p => String(p.unique_identity_key || '').startsWith('gate3-'));
  const addSimLog = (message, status = 'info') => setSimLog(log => [{ at: new Date().toLocaleTimeString('en-IE'), message, status }, ...log].slice(0, 12));
  const scoreForSimulation = (match, index = 0, mode = 'mixed') => {
    const pointsFormat = event?.normal_match_type === 'points';
    const target = Number(event?.normal_target_points || 11);
    const winBy = Number(event?.normal_win_by || 1);
    const aStrong = pointsFormat ? [target, Math.max(0, target - (winBy === 2 ? 4 : 3))] : [11, 8];
    const bNarrow = pointsFormat ? [Math.max(0, target - (winBy === 2 ? 2 : 1)), target] : [10, 11];
    const bStrong = pointsFormat ? [Math.max(0, target - (winBy === 2 ? 4 : 3)), target] : [8, 11];

    if (mode === 'clear_winner') return index < 28 ? aStrong : bStrong;
    if (mode === 'tie_metrics') return index < 24 ? aStrong : bNarrow;
    if (mode === 'tie_showcase') return index < 24 ? aStrong : bStrong;
    if (!pointsFormat && index % 7 === 0) return [8, 8];
    return index % 2 === 0 ? aStrong : bStrong;
  };
  const saveSimulatedMatch = async (match, index, mode = 'mixed') => {
    const [scoreA, scoreB] = scoreForSimulation(match, index, mode);
    const res = await base44.functions.invoke('saveClubChallengeScore', {
      matchId: match.id,
      expectedRevision: Number(match.revision || 0),
      scoreA, scoreB,
    });
    if (res.data?.error || res.data?.conflict) throw new Error(res.data?.error || 'Unexpected revision conflict during simulation');
  };
  const simulateMatches = async (targetMatches, label, mode = 'mixed') => {
    if (!isAdmin || !isGate3TestEvent) { toast.error('Simulator is restricted to the Gate 3 dummy roster.'); return; }
    const unresolved = targetMatches.filter(m => !['completed', 'draw'].includes(m.status));
    if (!unresolved.length) { toast.info('Those matches are already complete.'); return; }
    setSimulating(true);
    try {
      for (let i = 0; i < unresolved.length; i += 6) {
        const batch = unresolved.slice(i, i + 6);
        await Promise.all(batch.map((m, j) => saveSimulatedMatch(m, i + j, mode)));
      }
      addSimLog(`${label}: ${unresolved.length} results simulated`, 'pass');
      toast.success(`${unresolved.length} simulated results saved`);
      await sync();
      return true;
    } catch (e) {
      addSimLog(`${label}: FAILED — ${e?.message || e}`, 'fail');
      toast.error(e?.message || 'Simulation failed');
      return false;
    } finally { setSimulating(false); }
  };
  const simulateCurrentRound = () => simulateMatches(currentMatches, `Round ${currentRound}`);
  const resetDummyRecords = async () => {
    const normal = matches.filter(m => !m.is_showcase);
    const showcase = matches.filter(m => m.is_showcase);
    for (const m of showcase) await base44.entities.ClubChallengeMatch.delete(m.id);
    for (let i = 0; i < normal.length; i += 8) {
      await Promise.all(normal.slice(i, i + 8).map(m => base44.entities.ClubChallengeMatch.update(m.id, {
        status: 'scheduled', score_a: null, score_b: null, winner: 'none', revision: 0,
        scored_by_user_id: null, scored_at: null, last_corrected_by_user_id: null, last_corrected_at: null, correction_count: 0,
      })));
    }
    await base44.entities.ClubChallengeEvent.update(event.id, {
      status: 'draw_approved', current_round: 0, finalised_at: null,
      showcase_resolution_method: 'none', showcase_resolved_winner: 'none',
      showcase_club_a_male_id: null, showcase_club_a_female_id: null,
      showcase_club_b_male_id: null, showcase_club_b_female_id: null,
    });
    await base44.entities.Tournament.update(tournament.id, { status: 'Draft', finalised_at: null });
    return normal.map(m => ({ ...m, status: 'scheduled', score_a: null, score_b: null, winner: 'none', revision: 0 }));
  };
  const runEndScenario = async (mode, label) => {
    if (!isAdmin || !isGate3TestEvent) { toast.error('Simulator is restricted to the Gate 3 dummy roster.'); return; }
    setSimulating(true);
    try {
      const resetMatches = await resetDummyRecords();
      setSimulating(false);
      const success = await simulateMatches(resetMatches, label, mode);
      if (!success) return;
      const maxRound = Math.max(...resetMatches.map(m => m.round_number));
      await base44.entities.ClubChallengeEvent.update(event.id, { status: 'in_progress', current_round: maxRound });
      await sync();
      const planned = resetMatches.map((m, i) => {
        const [scoreA, scoreB] = scoreForSimulation(m, i, mode);
        return { scoreA, scoreB, status: scoreA === scoreB ? 'draw' : 'completed' };
      });
      const plannedScore = calculateClubChallengeScore(planned, { winPoints: event?.win_points ?? 2, drawPoints: event?.draw_points ?? 1, lossPoints: event?.loss_points ?? 0 });
      const metricWinner = resolveClubChallengeWinner(plannedScore, { allowDraw: false });
      addSimLog(`${label} PASS — ${plannedScore.clubA}-${plannedScore.clubB}; differential ${plannedScore.gamePointDifference >= 0 ? '+' : ''}${plannedScore.gamePointDifference}; no-final decision ${metricWinner}`, 'pass');
      setTab('results');
    } catch (e) {
      setSimulating(false);
      addSimLog(`${label}: FAILED — ${e?.message || e}`, 'fail');
      toast.error(e?.message || 'Scenario simulation failed');
    }
  };
  const runConflictProbe = async () => {
    if (!isAdmin || !isGate3TestEvent) { toast.error('Conflict probe is restricted to the Gate 3 dummy roster.'); return; }
    const match = matches.find(m => !m.is_showcase && !['completed','draw'].includes(m.status));
    if (!match) { toast.info('Reset the simulation first so an unplayed match is available.'); return; }
    setSimulating(true);
    try {
      const revision = Number(match.revision || 0);
      const [a, b] = scoreForSimulation(match, 2);
      const first = await base44.functions.invoke('saveClubChallengeScore', { matchId: match.id, expectedRevision: revision, scoreA: a, scoreB: b });
      if (first.data?.error || first.data?.conflict) throw new Error(first.data?.error || 'First edit unexpectedly conflicted');
      let conflictDetected = false;
      try {
        const second = await base44.functions.invoke('saveClubChallengeScore', { matchId: match.id, expectedRevision: revision, scoreA: b, scoreB: a });
        conflictDetected = !!second.data?.conflict;
      } catch (e) {
        conflictDetected = e?.response?.status === 409 || e?.status === 409 || !!e?.response?.data?.conflict;
      }
      if (!conflictDetected) throw new Error('Stale edit was not rejected');
      addSimLog(`Concurrency probe PASS on R${match.round_number} Court ${match.court_number}`, 'pass');
      toast.success('Concurrency protection PASS');
      await refetchMatches();
    } catch (e) {
      addSimLog(`Concurrency probe FAILED — ${e?.message || e}`, 'fail');
      toast.error(e?.message || 'Concurrency probe failed');
    } finally { setSimulating(false); }
  };
  const resetSimulation = async () => {
    if (!isAdmin || !isGate3TestEvent) { toast.error('Reset is restricted to the Gate 3 dummy roster.'); return; }
    if (!window.confirm('Reset all dummy Club Challenge match results back to the approved draw?')) return;
    setSimulating(true);
    try {
      await resetDummyRecords();
      setSimLog([]);
      addSimLog('Dummy event reset to approved draw', 'pass');
      toast.success('Simulation reset');
      await sync();
    } catch (e) { toast.error(e?.message || 'Could not reset simulation'); }
    finally { setSimulating(false); }
  };
  const structuralChecks = useMemo(() => {
    const normal = matches.filter(m => !m.is_showcase);
    const roundCount = new Set(normal.map(m => m.round_number)).size;
    return [
      ['Dummy roster', participants.length === 32],
      ['16 + 16 clubs', aPlayers.length === 16 && bPlayers.length === 16],
      ['12 rounds', roundCount === 12],
      ['48 matches', normal.length === 48],
      ['Fairness hard checks', !!fairness && fairness.equalGames && !fairness.duplicatePlayerRoundIssues && !fairness.sameClubIntegrityIssues],
      ['6 games each', !!fairness && fairness.minGames === 6 && fairness.maxGames === 6],
    ];
  }, [matches, participants.length, aPlayers.length, bPlayers.length, fairness]);
  const stageIndex = !event ? 0
    : event.status === 'draft' ? (participants.length ? 1 : 0)
    : event.status === 'draw_generated' || event.status === 'draw_approved' ? 2
    : event.status === 'in_progress' || event.status === 'paused' ? 3
    : event.status === 'completed' || event.status === 'archived' ? 5 : 0;
  const currentDisplayMatches = normalMatches.filter(m => m.round_number === currentRound).sort((a,b) => a.court_number - b.court_number);
  const nextDisplayMatches = normalMatches.filter(m => m.round_number === currentRound + 1).sort((a,b) => a.court_number - b.court_number);
  const potCounts = potVotes.filter(v => v.valid !== false).reduce((a,v) => ({ ...a, [v.nominee_participant_id]: (a[v.nominee_participant_id] || 0) + 1 }), {});
  const potWinnerNames = (event?.pot_winner_participant_ids || []).map(id => participants.find(p => p.id === id)?.display_name).filter(Boolean);

  if (displayMode && event) return (
    <div className="min-h-[75vh] bg-background p-4 sm:p-8 space-y-6">
      <div className="flex justify-between items-start gap-4"><div><p className="text-sm uppercase tracking-[.2em] text-primary font-bold">Club Challenge · Hall Display</p><h1 className="text-3xl sm:text-5xl font-bold mt-2">{event.club_a_name} <span className="text-primary">{score.clubA} – {score.clubB}</span> {event.club_b_name}</h1></div><Button variant="outline" onClick={() => setDisplayMode(false)}>Exit Display</Button></div>
      <div className="rounded-2xl border border-border bg-card p-6 text-center"><p className="text-lg uppercase tracking-widest text-muted-foreground">{roundLabel(currentRound)} · {timerState?.phase || 'idle'}</p><p className="text-7xl sm:text-9xl font-bold tabular-nums mt-2">{fmtTimer(timerRemaining)}</p></div>
      <div><h2 className="text-xl font-bold mb-3">On Court Now</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{currentDisplayMatches.map(m => <div key={m.id} className="rounded-xl border border-border bg-card p-4"><p className="text-primary font-bold">Court {m.court_number}</p><p className="text-lg font-semibold mt-2">{(m.club_a_names||[]).join(' & ')}</p><p className="text-sm text-muted-foreground my-1">vs</p><p className="text-lg font-semibold">{(m.club_b_names||[]).join(' & ')}</p>{['completed','draw'].includes(m.status) && <p className="text-2xl font-bold mt-3">{m.score_a}–{m.score_b}</p>}</div>)}</div></div>
      <div><h2 className="text-xl font-bold mb-3">Up Next</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{nextDisplayMatches.map(m => <div key={m.id} className="rounded-xl bg-secondary/50 p-4"><p className="font-bold">Court {m.court_number}</p><p className="text-sm mt-1">{(m.club_a_names||[]).join(' & ')} vs {(m.club_b_names||[]).join(' & ')}</p></div>)}</div></div>
      <p className="text-xs text-muted-foreground text-center">Read-only display · no email, phone or private participant information</p>
    </div>
  );

  return (
    <div className="space-y-4 print:space-y-0">
      {event && ['draw_approved','in_progress','paused','completed'].includes(event.status) && <div className="hidden print:block bg-white text-black p-6"><div className="flex justify-between border-b pb-3"><div><h1 className="text-2xl font-bold">Club Challenge Event Pack</h1><p>{event.club_a_name} vs {event.club_b_name}</p></div><div className="text-right text-xs"><p>Rules v{event.rules_version}</p><p>Draw v{event.draw_version} · Pack v{event.event_pack_version || event.draw_version}</p><p>{event.event_pack_stale ? 'OUT OF DATE' : 'APPROVED DRAW'}</p></div></div><div className="grid grid-cols-2 gap-6 mt-4"><div><h2 className="font-bold">{event.club_a_name}</h2>{aPlayers.slice().sort((a,b)=>a.event_rank-b.event_rank).map(p=><p key={p.id} className="text-xs">#{p.event_rank} {p.display_name}</p>)}</div><div><h2 className="font-bold">{event.club_b_name}</h2>{bPlayers.slice().sort((a,b)=>a.event_rank-b.event_rank).map(p=><p key={p.id} className="text-xs">#{p.event_rank} {p.display_name}</p>)}</div></div><h2 className="font-bold mt-5 mb-2">Approved Fixtures</h2><table className="w-full text-[10px] border-collapse"><thead><tr><th className="border p-1">Rnd</th><th className="border p-1">Court</th><th className="border p-1">{event.club_a_name}</th><th className="border p-1">Score</th><th className="border p-1">{event.club_b_name}</th></tr></thead><tbody>{normalMatches.slice().sort((a,b)=>(a.round_number-b.round_number)||(a.court_number-b.court_number)).map(m=><tr key={m.id}><td className="border p-1 text-center">{m.round_number}</td><td className="border p-1 text-center">{m.court_number}</td><td className="border p-1">{(m.club_a_names||[]).join(' & ')}</td><td className="border p-1 text-center">____ – ____</td><td className="border p-1">{(m.club_b_names||[]).join(' & ')}</td></tr>)}</tbody></table><div className="mt-4 text-xs"><p>Play: {event.play_minutes} min · Changeover: {event.changeover_minutes} min{event.include_break ? ` · Break: ${event.break_minutes} min after Round ${event.break_after_round}` : ''}</p><p className="mt-2">Manual final total: {event.club_a_name} ______  {event.club_b_name} ______</p>{event.showcase_enabled && <p className="mt-2">Showcase Final: ________________________________  Score: ______ – ______</p>}</div></div>}
      <div className="print:hidden glass rounded-xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-primary" /></div>
          <div><p className="font-semibold text-foreground">Club Challenge v1.0</p><p className="text-xs text-muted-foreground">{event ? `Status: ${event.status.replaceAll('_', ' ')}` : 'Configure the inter-club event'}</p></div>
        </div>
        {event && <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"><div className="grid grid-cols-[1fr_auto_1fr] sm:flex items-center gap-2 w-full lg:w-auto min-w-0"><ClubBadge name={event.club_a_name} logo={event.club_a_logo_url} primary={event.club_a_primary_colour} secondary={event.club_a_secondary_colour} /><span className="text-xs text-muted-foreground text-center">vs</span><ClubBadge name={event.club_b_name} logo={event.club_b_logo_url} primary={event.club_b_primary_colour} secondary={event.club_b_secondary_colour} /></div>{!networkOnline && <Badge className="bg-yellow-500/10 text-yellow-400">OFFLINE · not saved</Badge>}{pendingScores.length > 0 && <><Badge variant="outline">{pendingScores.length} unsynchronised</Badge>{networkOnline && <Button variant="outline" size="sm" onClick={retryPendingScores}>Retry Sync</Button>}</>}{['in_progress','paused','completed'].includes(event.status) && <Button variant="outline" size="sm" onClick={() => setDisplayMode(true)}>Hall Display</Button>}{['draw_approved','in_progress','paused','completed'].includes(event.status) && <Button variant="outline" size="sm" onClick={printEventPack}>{event.event_pack_stale ? 'Print Event Pack · OUT OF DATE' : `Print Event Pack v${event.event_pack_version || event.draw_version || 1}`}</Button>}</div>}
      </div>

      <div className="print:hidden rounded-xl border border-border bg-card/50 p-2 sm:p-3">
        <div className="flex overflow-x-auto gap-1 sm:gap-2 -mx-1 px-1 pb-1 snap-x scrollbar-none">
          {TABS.map(([id, label], index) => {
            const complete = index < stageIndex;
            const current = index === stageIndex;
            return (
              <button key={id} onClick={() => {
                if (id === 'teams' && !event) { toast.info('Save Setup first, then Teams will open.'); return; }
                if (id === 'draw' && !matches.length) { toast.info('Generate the draw from Teams first.'); return; }
                if (id === 'live' && !['in_progress','paused','completed'].includes(event?.status)) { toast.info('Approve the draw and start the Club Challenge first.'); return; }
                setTab(id);
              }} className={cn('group flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap min-h-10 snap-start transition-colors cursor-pointer', tab === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary')}>
                <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0', complete ? 'bg-primary text-primary-foreground border-primary' : current ? 'border-primary text-primary bg-primary/5' : 'border-border bg-secondary/40')}>
                  {complete ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="print:hidden contents">
      {tab === 'setup' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {[['A', 'Host Club', 'clubAName', 'clubAPrimary', 'clubASecondary'], ['B', 'Opponent Club', 'clubBName', 'clubBPrimary', 'clubBSecondary']].map(([side, label, nameKey, primaryKey, secondaryKey]) => (
              <div key={side} className="glass rounded-xl p-4 sm:p-5 space-y-3">
                <p className="text-sm font-semibold">{label}</p>
                <div><Label className="text-xs">Club name</Label><Input value={setup[nameKey]} onChange={e => setSetup(s => ({ ...s, [nameKey]: e.target.value }))} className="mt-1 bg-secondary" /></div>
                <div>
                  <Label className="text-xs">Club logo</Label>
                  <div className="mt-1 flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3">
                    {(side === 'A' ? setup.clubALogo : setup.clubBLogo) ? <img src={side === 'A' ? setup.clubALogo : setup.clubBLogo} alt={`${setup[nameKey]} logo`} className="w-12 h-12 rounded-lg object-contain bg-white p-1" /> : <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center"><ImagePlus className="w-5 h-5 text-muted-foreground" /></div>}
                    <div className="flex-1 min-w-0">
                      <Input type="file" accept="image/*" disabled={logoUploading === side} onChange={e => uploadClubLogo(side, e.target.files?.[0])} className="bg-secondary text-xs" />
                      <p className="text-[10px] text-muted-foreground mt-1">{side === 'A' ? 'Uses the saved host-club logo automatically when available; you can replace it for this event.' : 'Upload the visiting club logo for this event.'}</p>
                    </div>
                  </div>
                </div>
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
                      <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.showcaseEnabled} onChange={e => setSetup(s => ({ ...s, showcaseEnabled: e.target.checked }))} /> Showcase / Tiebreak Final</label>
              {setup.showcaseEnabled && <div className="flex items-center gap-2 min-h-10 rounded-lg bg-secondary/40 px-3"><Label className="text-xs whitespace-nowrap">Final points</Label><Input type="number" min="1" value={setup.showcasePoints} onChange={e => setSetup(s => ({ ...s, showcasePoints: e.target.value }))} className="h-8 w-20 bg-secondary" /></div>}
              <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.potEnabled} onChange={e => setSetup(s => ({ ...s, potEnabled: e.target.checked }))} /> Player of Tournament voting</label>
            </div>
          </div>
          <Button onClick={saveSetup} disabled={!isAdmin || saving} className="w-full h-11">{saving ? 'Saving…' : event ? 'Save & Continue to Teams' : 'Create & Continue to Teams'}</Button>
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
          {!event || !['in_progress','paused','completed'].includes(event.status) ? <div className="rounded-xl border border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">Approve the draw and Start Club Challenge first.</div> : <>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Live Event</p><p className="text-sm text-muted-foreground mt-1">Round {currentRound} of {Math.max(...rounds)}</p><p className="text-xl sm:text-2xl font-bold break-words mt-1">{event.club_a_name} {score.clubA} <span className="text-muted-foreground font-normal">–</span> {score.clubB} {event.club_b_name}</p></div><div className="flex gap-2 text-xs"><Badge variant="outline">{score.matchesWonA}W</Badge><Badge variant="outline">{score.draws}D</Badge><Badge variant="outline">{score.matchesWonB}W</Badge></div></div>{event.include_break && currentRound === event.break_after_round && <div className="mt-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-400"><Clock className="inline w-4 h-4 mr-1" />Scheduled {event.break_minutes}-minute break after this round.</div>}</div>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-sm font-semibold">Authoritative Event Timer</p><p className="text-xs text-muted-foreground">Persisted against the event; reopening or waking the browser recalculates from the saved timestamp.</p></div><Badge variant="outline">Rev {event.timer_revision || 0}</Badge></div>
              <div className="text-center py-2"><p className="text-xs uppercase tracking-wider text-muted-foreground">{roundLabel(currentRound)} · {timerState?.phase || 'idle'}</p><p className="text-4xl font-bold tabular-nums mt-1">{fmtTimer(timerRemaining)}</p></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 rounded-lg bg-secondary/40 p-3">
                <div><Label className="text-xs">Round label</Label><Input className="mt-1 bg-secondary" value={roundLabels[currentRound] || ''} onChange={e => setRoundLabels(r => ({ ...r, [currentRound]: e.target.value }))} placeholder={`Round ${currentRound}`} /></div>
                <div><Label className="text-xs">Voice</Label><Select value={voiceMode} onValueChange={setVoiceMode}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="irish_female">Irish Female</SelectItem><SelectItem value="irish_male">Irish Male</SelectItem><SelectItem value="device_default">Device Default</SelectItem><SelectItem value="off">Voice Off</SelectItem></SelectContent></Select></div>
                <div className="flex items-end"><Button variant="outline" className="w-full" onClick={testVoice}>Test Voice</Button></div>
                <div className="flex items-end gap-2"><Button variant="outline" className="flex-1" onClick={() => setVoiceMuted(v => !v)}>{voiceMuted ? 'Unmute Voice' : 'Mute Voice'}</Button><Button variant="outline" disabled={!lastAnnouncement} onClick={() => speak(lastAnnouncement, { force: true })}>Repeat</Button></div>
              </div>
              <p className="text-[10px] text-muted-foreground">Irish male/female uses an en-IE voice when the device exposes one; otherwise RallyHub falls back safely to the available device voice. Speech failure never stops the timer.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2"><Button variant="outline" disabled={!canManageEvent} onClick={() => startPhase('play')}>Start Play</Button><Button variant="outline" disabled={!canManageEvent} onClick={() => startPhase('changeover')}>Changeover</Button><Button variant="outline" disabled={!canManageEvent || !event.include_break} onClick={() => startPhase('break')}>Break</Button><Button variant="outline" disabled={!canManageEvent || !timerState?.running} onClick={pauseTimer}>Pause</Button><Button variant="outline" disabled={!canManageEvent || !timerState || timerState.running || timerRemaining <= 0} onClick={resumeTimer}>Resume</Button><Button variant="outline" disabled={!canManageEvent} onClick={() => timerAction('add_minute')}>+1 min</Button><Button variant="outline" disabled={!canManageEvent} onClick={resetTimer}>Reset</Button></div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
              <div><p className="text-sm font-semibold">Withdrawal / Injury / Replacement</p><p className="text-xs text-muted-foreground">Completed history is never changed. Replacement inherits the outgoing player's side and event rank; only future unplayed fixtures from the current round are updated.</p></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-2"><Select value={replacement.outgoingId} onValueChange={v => setReplacement(r => ({ ...r, outgoingId: v }))}><SelectTrigger className="bg-secondary"><SelectValue placeholder="Outgoing player" /></SelectTrigger><SelectContent>{participants.filter(p => p.status === 'active').map(p => <SelectItem key={p.id} value={p.id}>{p.display_name} · {p.side === 'club_a' ? event.club_a_name : event.club_b_name}</SelectItem>)}</SelectContent></Select><Input value={replacement.incomingName} onChange={e => setReplacement(r => ({ ...r, incomingName: e.target.value }))} placeholder="Replacement player name" className="bg-secondary" /><Select value={replacement.incomingGender || 'inherit'} onValueChange={v => setReplacement(r => ({ ...r, incomingGender: v === 'inherit' ? '' : v }))}><SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inherit">Inherit gender</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><Select value={replacement.status} onValueChange={v => setReplacement(r => ({ ...r, status: v }))}><SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="withdrawn">Withdrawn</SelectItem><SelectItem value="injured">Injured</SelectItem><SelectItem value="replaced">Replaced</SelectItem></SelectContent></Select><Input value={replacement.reason} onChange={e => setReplacement(r => ({ ...r, reason: e.target.value }))} placeholder="Reason / note" className="bg-secondary" /></div>
              <div className="flex flex-col sm:flex-row gap-2"><Button className="w-full sm:w-auto" disabled={!isAdmin || !replacement.outgoingId || !replacement.incomingName.trim()} onClick={applyReplacement}>Apply Replacement from Round {currentRound}</Button><Button variant="outline" className="w-full sm:w-auto" disabled={!isAdmin || !replacement.outgoingId} onClick={withdrawWithoutReplacement}>Continue Short · No Replacement</Button></div>
            </div>
            <div className="grid lg:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 space-y-3"><div><p className="text-sm font-semibold">Late Arrival</p><p className="text-xs text-muted-foreground">Record the first round a player is available; RallyHub flags that the remaining draw may need organiser review.</p></div><div className="grid sm:grid-cols-[1fr_120px_auto] gap-2"><Select value={lateArrival.participantId} onValueChange={v => setLateArrival(x => ({...x, participantId:v}))}><SelectTrigger className="bg-secondary"><SelectValue placeholder="Player" /></SelectTrigger><SelectContent>{participants.filter(p=>!['withdrawn','injured','replaced'].includes(p.status)).map(p=><SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select><Input type="number" min={currentRound||1} value={lateArrival.round} onChange={e=>setLateArrival(x=>({...x,round:e.target.value}))} className="bg-secondary" /><Button variant="outline" disabled={!isAdmin || !lateArrival.participantId} onClick={applyLateArrival}>Set Round</Button></div></div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-3"><div><p className="text-sm font-semibold">Court / Time Change Proposal</p><p className="text-xs text-muted-foreground">For a lost/added court or late running event. This calculates consequences first; it does not silently rewrite completed fixtures.</p></div><div className="grid sm:grid-cols-[120px_140px_auto] gap-2"><Input type="number" min="1" value={eventDayAdjust.courts} onChange={e=>setEventDayAdjust(x=>({...x,courts:e.target.value}))} placeholder={`${event.courts} courts`} className="bg-secondary" /><Input type="number" min="1" value={eventDayAdjust.availableMinutes} onChange={e=>setEventDayAdjust(x=>({...x,availableMinutes:e.target.value}))} placeholder="Minutes left" className="bg-secondary" /><Button variant="outline" disabled={!canManageEvent} onClick={proposeEventDayAdjustment}>Calculate Proposal</Button></div>{eventDayProposal && <div className="rounded-lg bg-secondary/50 p-3 text-xs space-y-2"><p><strong>Review:</strong> {eventDayProposal.unresolved - eventDayProposal.dropIds.length} matches retained · {eventDayProposal.changes.length} positions change · {eventDayProposal.dropIds.length} Not Played.</p><p className="text-muted-foreground">Completed results are locked. Event Pack becomes OUT OF DATE.</p><div className="flex gap-2"><Button size="sm" disabled={!canManageEvent} onClick={confirmEventDayAdjustment}>Confirm Changes</Button><Button size="sm" variant="outline" onClick={()=>setEventDayProposal(null)}>Cancel</Button></div></div>}</div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">{currentMatches.sort((a,b)=>a.court_number-b.court_number).map(m => <ScoreCard key={`${m.id}-${m.revision}`} match={m} clubAName={event.club_a_name} clubBName={event.club_b_name} onSaved={refetchMatches} networkOnline={networkOnline} onQueue={queueOfflineScore} canScore={canScoreEvent} />)}</div>
            {event.status !== 'completed' && <Button className="w-full h-11" disabled={!canManageEvent} onClick={advanceRound}>{currentRound < Math.max(...rounds) ? `Complete Round ${currentRound} & Go to Round ${currentRound + 1}` : <><Trophy className="w-4 h-4 mr-2" />Finalise Club Challenge</>}</Button>}
          </>}
        </div>
      )}

      {tab === 'simulator' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Gate 3 Test Simulator</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-2xl">Runs the real RallyHub Club Challenge scoring path against the dummy 16+16 roster so you can test 48 matches in seconds instead of entering every result by hand.</p>
              </div>
              <Badge className={isGate3TestEvent ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-400'}>{isGate3TestEvent ? 'Dummy event detected' : 'Dummy roster required'}</Badge>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {structuralChecks.map(([label, pass]) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', pass ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive')}>{pass ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">!</span>}</div>
                <div><p className="text-xs font-semibold">{label}</p><p className="text-[10px] text-muted-foreground">{pass ? 'PASS' : 'Not ready'}</p></div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold">Simulation controls</p>
              <p className="text-xs text-muted-foreground mt-1">These controls are deliberately restricted to events containing the Gate 3 dummy roster, so live club data cannot be bulk-scored by mistake.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <Button className="min-h-11" disabled={!isGate3TestEvent || simulating || !matches.length} onClick={() => runEndScenario('clear_winner', 'Clear winner after 48')}>Simulate 48 — Clear Winner</Button>
              <Button className="min-h-11" disabled={!isGate3TestEvent || simulating || !matches.length} onClick={() => runEndScenario('tie_metrics', 'Tie — decide by metrics')}>Simulate Tie — Use Metrics</Button>
              <Button className="min-h-11" disabled={!isGate3TestEvent || simulating || !matches.length} onClick={() => runEndScenario('tie_showcase', 'Tie — Showcase required')}>Simulate Tie — Showcase Final</Button>
              <Button variant="outline" className="min-h-11" disabled={!isGate3TestEvent || simulating || !currentMatches.length} onClick={simulateCurrentRound}>Simulate Round {currentRound}</Button>
              <Button variant="outline" className="min-h-11" disabled={!isGate3TestEvent || simulating || !matches.length} onClick={runConflictProbe}>Test Stale-Edit Conflict</Button>
              <Button variant="outline" className="min-h-11" disabled={!isGate3TestEvent || simulating || !matches.length} onClick={resetSimulation}><RefreshCw className={cn('w-4 h-4 mr-2', simulating && 'animate-spin')} />Reset Dummy Event</Button>
              <Button variant="outline" className="min-h-11" disabled={!isGate3TestEvent || compressedTimer.running} onClick={runCompressedTimerAudioTest}><Clock className="w-4 h-4 mr-2" />{compressedTimer.running ? 'Running Timer Test…' : 'Compressed Timer + Audio Test'}</Button>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 text-xs"><strong>Compressed timer/audio:</strong> <span className="text-muted-foreground">{compressedTimer.text}</span></div>
            <div className="rounded-lg bg-secondary/50 p-4 text-xs text-muted-foreground space-y-1">
              <p><strong className="text-foreground">Clear Winner:</strong> proves a normal 48-match result produces the correct winner and runner-up.</p>
              <p><strong className="text-foreground">Tie — Use Metrics:</strong> forces equal Club Challenge points but a known cumulative point differential, so the no-final tiebreak calculation can be verified.</p>
              <p><strong className="text-foreground">Tie — Showcase Final:</strong> forces equal Club Challenge points and equal cumulative scoring, so RallyHub must require the Showcase/tiebreak final (or allow an overall draw if configured).</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Current simulated state</p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                <div className="rounded-lg bg-secondary p-3"><p className="text-xl font-bold">{score.completedMatches}</p><p className="text-[10px] text-muted-foreground">Results saved</p></div>
                <div className="rounded-lg bg-secondary p-3"><p className="text-xl font-bold">{matches.filter(m => !m.is_showcase).length - score.completedMatches}</p><p className="text-[10px] text-muted-foreground">Still unresolved</p></div>
                <div className="rounded-lg bg-secondary p-3"><p className="text-xl font-bold">{score.clubA}–{score.clubB}</p><p className="text-[10px] text-muted-foreground">Club points</p></div>
                <div className="rounded-lg bg-secondary p-3"><p className="text-xl font-bold">{score.draws}</p><p className="text-[10px] text-muted-foreground">Drawn matches</p></div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Simulator log</p>
              <div className="mt-3 space-y-2 min-h-24">
                {simLog.length === 0 ? <p className="text-xs text-muted-foreground">No simulator actions run yet.</p> : simLog.map((item, i) => <div key={`${item.at}-${i}`} className="flex gap-2 text-xs"><span className="text-muted-foreground shrink-0">{item.at}</span><span className={item.status === 'pass' ? 'text-primary' : item.status === 'fail' ? 'text-destructive' : 'text-foreground'}>{item.message}</span></div>)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
            <strong className="text-primary">Timer/audio test:</strong> the compressed sequence exercises PLAY → CHANGEOVER → PLAY → PAUSE → RESUME → BREAK → PLAY with the selected free device voice. The authoritative live timer itself remains server-timestamped and revision-protected; this fast test is deliberately separate so it cannot alter a real event clock.
          </div>
        </div>
      )}

      {tab === 'results' && (
        <div className="space-y-4">
          {score.completedMatches > 0 ? (
            <>
              <div className="rounded-xl border border-border bg-card p-5 sm:p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><Trophy className="w-6 h-6 text-primary" /></div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-4">{event?.status === 'completed' ? 'Final Result' : 'Current Result'}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">{event?.club_a_name} {overallScore.clubA}–{overallScore.clubB} {event?.club_b_name}</p>
                {event?.status === 'completed' && <div className="mt-3"><Badge className="bg-primary/10 text-primary">{event.showcase_resolved_winner === 'draw' ? 'Overall Draw' : `Winner: ${event.showcase_resolved_winner === 'club_b' ? event.club_b_name : event.club_a_name}`}</Badge>{event.showcase_resolved_winner !== 'draw' && <p className="text-xs text-muted-foreground mt-2">Runner-up: {event.showcase_resolved_winner === 'club_b' ? event.club_a_name : event.club_b_name}</p>}</div>}
                <div className="flex flex-wrap justify-center gap-2 mt-4"><Badge variant="outline">{score.completedMatches} normal results</Badge><Badge variant="outline">{score.matchesWonA} {event?.club_a_name} wins</Badge><Badge variant="outline">{score.draws} draws</Badge><Badge variant="outline">{score.matchesWonB} {event?.club_b_name} wins</Badge></div>
                <div className="grid grid-cols-3 gap-2 mt-4 max-w-lg mx-auto text-center"><div className="rounded-lg bg-secondary p-3"><p className="font-bold">{score.gamePointsA}</p><p className="text-[10px] text-muted-foreground">{event?.club_a_name} game points</p></div><div className="rounded-lg bg-secondary p-3"><p className="font-bold">{score.gamePointDifference >= 0 ? '+' : ''}{score.gamePointDifference}</p><p className="text-[10px] text-muted-foreground">A point differential</p></div><div className="rounded-lg bg-secondary p-3"><p className="font-bold">{score.gamePointsB}</p><p className="text-[10px] text-muted-foreground">{event?.club_b_name} game points</p></div></div>
                {showcaseMatch && ['completed'].includes(showcaseMatch.status) && <p className="text-xs text-primary mt-4">Showcase Final: {showcaseMatch.winner === 'club_a' ? event?.club_a_name : event?.club_b_name} +{event?.showcase_points} points</p>}
                {event?.status !== 'completed' && <p className="text-xs text-yellow-400 mt-4">Provisional — results are saved, but the event has not yet been finalised.</p>}
              </div>

              {score.completedMatches === normalMatches.length && event?.status !== 'completed' && score.clubA !== score.clubB && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold">Clear Winner Ready</p>
                  <p className="text-xs text-muted-foreground mt-1">All normal matches are complete and the Club Challenge points are not tied.</p>
                  <Button className="mt-4 w-full sm:w-auto" onClick={() => finaliseEvent(score.clubA > score.clubB ? 'club_a' : 'club_b', 'none', 'Clear winner after normal Club Challenge matches.')}>Confirm Winner & Finalise</Button>
                </div>
              )}

              {score.completedMatches === normalMatches.length && event?.status !== 'completed' && score.clubA === score.clubB && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-yellow-400">Normal Club Challenge points are tied: {score.clubA}–{score.clubB}</p>
                    <p className="text-xs text-muted-foreground mt-1">Choose how to decide the event. Cumulative point differential is the default no-final metric.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <Button variant="outline" onClick={resolveTieByMetrics}>Use Tiebreak Metrics</Button>
                    {event?.showcase_enabled && <Button onClick={() => document.getElementById('showcase-final-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Play Showcase Final</Button>}
                    {event?.allow_overall_draw && <Button variant="outline" onClick={recordOverallDraw}>Record Overall Draw</Button>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Current point differential: {event?.club_a_name} {score.gamePointDifference >= 0 ? '+' : ''}{score.gamePointDifference}; {event?.club_b_name} {score.gamePointDifference <= 0 ? '+' : ''}{-score.gamePointDifference}.</p>
                </div>
              )}

              {score.completedMatches === normalMatches.length && score.clubA === score.clubB && event?.showcase_enabled && event?.status !== 'completed' && (
                <div id="showcase-final-panel" className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div><p className="text-sm font-semibold">Showcase / Tiebreak Final</p><p className="text-xs text-muted-foreground mt-1">Nominate one male and one female player from each club. Winner receives {event.showcase_points} Club Challenge points.</p></div>
                  {!showcaseMatch ? (
                    <>
                      <div className="grid lg:grid-cols-2 gap-4">
                        {[
                          ['club_a', event.club_a_name, aPlayers, 'aMale', 'aFemale'],
                          ['club_b', event.club_b_name, bPlayers, 'bMale', 'bFemale'],
                        ].map(([side, clubName, list, maleKey, femaleKey]) => <div key={side} className="rounded-lg bg-secondary/40 p-4 space-y-3"><p className="text-xs font-semibold">{clubName}</p><div><Label className="text-xs">Male nominee</Label><Select value={showcaseSelection[maleKey]} onValueChange={v => setShowcaseSelection(s => ({ ...s, [maleKey]: v }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue placeholder="Select male player" /></SelectTrigger><SelectContent>{list.filter(p => genderKey(p.gender) === 'male' && !['withdrawn','injured','replaced'].includes(p.status)).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs">Female nominee</Label><Select value={showcaseSelection[femaleKey]} onValueChange={v => setShowcaseSelection(s => ({ ...s, [femaleKey]: v }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue placeholder="Select female player" /></SelectTrigger><SelectContent>{list.filter(p => genderKey(p.gender) === 'female' && !['withdrawn','injured','replaced'].includes(p.status)).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select></div></div>)}
                      </div>
                      <Button className="w-full" onClick={createShowcaseFinal}>Create Showcase Final</Button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <ScoreCard key={`${showcaseMatch.id}-${showcaseMatch.revision}`} match={showcaseMatch} clubAName={event.club_a_name} clubBName={event.club_b_name} onSaved={sync} networkOnline={networkOnline} onQueue={queueOfflineScore} canScore={canScoreEvent} />
                      {['completed'].includes(showcaseMatch.status) && <Button className="w-full" onClick={finaliseShowcase}>Apply {event.showcase_points} Points & Finalise Club Challenge</Button>}
                    </div>
                  )}
                </div>
              )}

              {event?.pot_enabled && <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-sm font-semibold">Player of the Tournament</p><p className="text-xs text-muted-foreground">One vote per participant · no self-voting · totals hidden while voting is open.</p></div><Badge variant="outline">{event.pot_status || 'closed'}</Badge></div>
                {canManageEvent && <div className="flex flex-wrap gap-2">{event.pot_status !== 'open' && event.pot_status !== 'revealed' && <Button variant="outline" onClick={() => setPotStatus('open')}>Open Voting</Button>}{event.pot_status === 'open' && <Button variant="outline" onClick={() => setPotStatus('closed')}>Close Voting</Button>}{event.pot_status === 'closed' && <Button onClick={revealPot}>Reveal Result</Button>}</div>}
                {event.pot_status === 'open' && <div className="grid md:grid-cols-[1fr_1fr_auto] gap-2 items-end"><div><Label className="text-xs">Voting player</Label><Select value={potVoterId} onValueChange={setPotVoterId}><SelectTrigger className="mt-1 bg-secondary"><SelectValue placeholder="Select your name" /></SelectTrigger><SelectContent>{participants.filter(p => ['active','late'].includes(p.status)).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs">Your Player of Tournament</Label><Select value={potNomineeId} onValueChange={setPotNomineeId}><SelectTrigger className="mt-1 bg-secondary"><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent>{participants.filter(p => p.status !== 'replaced' && p.id !== potVoterId).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select></div><Button onClick={castPotVote} disabled={!potVoterId || !potNomineeId}>Cast Vote</Button></div>}
                {event.pot_status !== 'revealed' && <p className="text-xs text-muted-foreground">{isAdmin ? `${potVotes.length} vote${potVotes.length === 1 ? '' : 's'} securely recorded. ` : 'Votes are securely recorded. '}Individual totals are hidden.</p>}
                {event.pot_status === 'revealed' && <div className="rounded-lg bg-primary/10 p-4 text-center"><Trophy className="w-5 h-5 text-primary mx-auto" /><p className="font-bold mt-2">{potWinnerNames.length > 1 ? 'Joint Players of the Tournament' : 'Player of the Tournament'}</p><p className="text-lg mt-1">{potWinnerNames.join(' & ') || 'No valid votes'}</p>{isAdmin && potWinnerNames.map(name => { const p = participants.find(x => x.display_name === name); return <p key={name} className="text-xs text-muted-foreground">{name}: {potCounts[p?.id] || 0} votes</p>; })}</div>}
              </div>}

              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <p className="text-sm font-semibold mb-3">Match Results</p>
                <div className="space-y-2 max-h-[42rem] overflow-auto">
                  {normalMatches.filter(m => ['completed','draw','retired','forfeit','abandoned'].includes(m.status)).sort((a,b) => (a.round_number-b.round_number) || (a.court_number-b.court_number)).map(m => (
                    <div key={m.id} className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2 rounded-lg bg-secondary/50 p-3 text-xs">
                      <span className="font-bold text-primary">R{m.round_number} C{m.court_number}</span>
                      <span className="truncate text-right">{(m.club_a_names || []).join(' & ')}</span>
                      <span className="font-bold text-sm">{m.score_a ?? '–'}–{m.score_b ?? '–'}</span>
                      <span className="truncate">{(m.club_b_names || []).join(' & ')}</span>
                      <Badge variant="outline" className="text-[10px]">{m.status === 'draw' ? 'Draw' : m.winner === 'club_a' ? event?.club_a_name : m.winner === 'club_b' ? event?.club_b_name : m.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-5 sm:p-8 text-center"><Trophy className="w-8 h-8 text-muted-foreground/40 mx-auto" /><p className="text-sm font-semibold mt-3">No results recorded yet</p><p className="text-xs text-muted-foreground mt-1">Results will appear here as soon as matches are saved; finalisation is not required just to view them.</p></div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
