import React, { useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Check, CheckCircle2, ChevronDown, Clock, Download, GripVertical, ImagePlus, ListChecks, Megaphone, Mic, MicOff, Minus, Play, Plus, RefreshCw, ShieldCheck, Trophy, Users, VolumeX } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { getRallyHubPaLevel, listRallyHubMicrophones, playRallyHubSignal, setRallyHubPaGain, speakRallyHub, startRallyHubPA, stopAllRallyHubAudio, stopRallyHubPA, unlockRallyHubAudio } from '@/lib/rallyHubHallAudio.js';
import { INTERCLUB_EVENT_LABEL, INTERCLUB_INTERNAL_FORMAT, INTERCLUB_MODULE_NAME } from '@/lib/interclubBranding';
import InterclubSpondImportModal from '@/components/clubchallenge/InterclubSpondImportModal';
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
  courts: 4, plannedPlayersTotal: 32, availableMinutes: 180, playMinutes: 10, changeoverMinutes: 2,
  includeBreak: true, breakMinutes: 20, breakAfterRound: 6,
  matchType: 'timed', target: 11, winBy: 1, drawsAllowed: true,
  compositionMode: 'open', showcaseEnabled: true, showcasePoints: 5, potEnabled: true, juniorDisplayMode: false,
};

function number(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function durationLabel(minutes) { const total = Math.max(0, Math.round(Number(minutes) || 0)); const h = Math.floor(total / 60); const m = total % 60; return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`; }
function genderKey(value) { const v = String(value || '').trim().toLowerCase(); return v.startsWith('f') ? 'female' : v.startsWith('m') ? 'male' : ''; }
function privacyName(name, junior) { if (!junior) return name || ''; const parts = String(name || '').trim().split(/\s+/).filter(Boolean); return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : (parts[0] || ''); }

function ClubBadge({ name, logo, primary, secondary }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 sm:px-3 py-2 bg-secondary/40 min-w-0 flex-1 sm:flex-none">
      {logo ? <img src={logo} alt={`${name || 'Club'} logo`} className="w-7 h-7 rounded-full object-contain bg-white p-0.5 shrink-0" /> : <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: primary || '#334155', color: secondary || '#fff' }}>{(name || '?').slice(0, 2).toUpperCase()}</span>}
      <span className="text-xs font-semibold text-foreground truncate min-w-0">{name}</span>
    </div>
  );
}

function TeamBuilder({ participants, clubAName, clubBName, locked, busy, onImportSpond, onAddManual, onSave, onSetRosterRole }) {
  const active = participants.filter(p => !['replaced','withdrawn','injured'].includes(p.status));
  const signature = active.map(p => `${p.id}:${p.side}:${p.event_rank}:${p.roster_role || 'rotation'}`).sort().join('|');
  const makeLanes = () => ({
    pool: active.filter(p => p.side === 'pool').sort((a,b)=>(a.event_rank||999)-(b.event_rank||999)).map(p => p.id),
    club_a: active.filter(p => p.side === 'club_a').sort((a,b)=>(a.event_rank||999)-(b.event_rank||999)).map(p => p.id),
    club_b: active.filter(p => p.side === 'club_b').sort((a,b)=>(a.event_rank||999)-(b.event_rank||999)).map(p => p.id),
  });
  const [lanes, setLanes] = useState(makeLanes);
  const [nameA, setNameA] = useState(clubAName || 'Team A');
  const [nameB, setNameB] = useState(clubBName || 'Team B');
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState(null);
  const [manualPool, setManualPool] = useState('');

  React.useEffect(() => {
    setLanes(makeLanes());
    setNameA(clubAName || 'Team A');
    setNameB(clubBName || 'Team B');
    setDirty(false);
  }, [signature, clubAName, clubBName]);

  const byId = new Map(active.map(p => [p.id, p]));
  const handleDragEnd = result => {
    if (!result.destination || locked || busy) return;
    const from = result.source.droppableId;
    const to = result.destination.droppableId;
    const next = { pool:[...lanes.pool], club_a:[...lanes.club_a], club_b:[...lanes.club_b] };
    const [id] = next[from].splice(result.source.index, 1);
    next[to].splice(result.destination.index, 0, id);
    setLanes(next);
    setDirty(true);
    setStatus(null);
  };
  const save = async () => {
    setStatus({state:'working',text:'Saving teams and rankings…'});
    try {
      await onSave?.({ poolIds:lanes.pool, clubAIds:lanes.club_a, clubBIds:lanes.club_b, clubAName:nameA, clubBName:nameB });
      setDirty(false);
      setStatus({state:'success',text:`Teams saved · ${lanes.club_a.length} in ${nameA} · ${lanes.club_b.length} in ${nameB}${lanes.pool.length ? ` · ${lanes.pool.length} still in Player Pool` : ''}.`});
    } catch (e) {
      setStatus({state:'error',text:e?.message || 'Could not save teams and rankings.'});
    }
  };
  const addPool = async () => {
    const name = manualPool.trim();
    if (!name || busy || locked) return;
    try { await onAddManual?.('pool', name); setManualPool(''); } catch {}
  };
  const lane = (id, title, ids, teamName, setTeamName) => (
    <Droppable droppableId={id}>
      {(provided, snapshot) => <div data-testid={`cc-team-lane-${id}`} ref={provided.innerRef} {...provided.droppableProps} className={cn('rounded-xl border bg-card p-3 min-h-[18rem] transition-colors', snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-border')}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            {id === 'pool' ? <><p className="text-sm font-semibold">Player Pool</p><p className="text-[10px] text-muted-foreground">Import both Spond events here, then drag players into the teams.</p></> :
              <><Label className="text-[10px]">Team name</Label><Input data-testid={`cc-team-name-${id}`} value={teamName} onChange={e => { setTeamName(e.target.value); setDirty(true); setStatus(null); }} disabled={locked || busy} className="mt-1 h-9 bg-secondary font-semibold" /><button type="button" onClick={() => onImportSpond?.(id)} disabled={locked || busy || dirty} className="mt-1 text-[10px] text-primary hover:underline disabled:opacity-40">Import a Spond event directly to this team</button></>}
          </div>
          <Badge variant="outline">{ids.length}</Badge>
        </div>
        {id === 'pool' && <div className="space-y-2 mb-3">
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => onImportSpond?.('pool')} disabled={locked || busy || dirty}><Download className="w-3.5 h-3.5 mr-1" />Import Spond Event</Button>
          <div className="grid grid-cols-[1fr_auto] gap-2"><Input placeholder="Add player manually" value={manualPool} onChange={e=>setManualPool(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPool()} disabled={locked || busy || dirty} className="h-9 bg-secondary" /><Button type="button" size="sm" onClick={addPool} disabled={locked || busy || dirty || !manualPool.trim()}><Plus className="w-4 h-4" /></Button></div>
        </div>}
        <div className="space-y-1 max-h-[34rem] overflow-auto">
          {ids.map((pid, i) => {
            const p = byId.get(pid);
            if (!p) return null;
            return <Draggable key={p.id} draggableId={p.id} index={i} isDragDisabled={locked || busy}>
              {(dragProvided, dragSnapshot) => <div data-testid={`cc-team-player-${p.id}`} ref={dragProvided.innerRef} {...dragProvided.draggableProps} className={cn('flex items-center gap-2 rounded-lg border border-border bg-secondary/60 p-2 min-h-11', dragSnapshot.isDragging && 'border-primary bg-primary/10 shadow-lg')}>
                <div data-testid={`cc-team-drag-${p.id}`} {...dragProvided.dragHandleProps} className="w-9 h-9 -ml-1 flex items-center justify-center rounded-md touch-none shrink-0 text-muted-foreground active:bg-primary/10"><GripVertical className="w-5 h-5" /></div>
                {id !== 'pool' && <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>}
                <span className="text-xs text-foreground flex-1 truncate">{p.display_name}</span>
                {id !== 'pool' && <Select value={p.roster_role || 'rotation'} onValueChange={async value => { setStatus({state:'working',text:`Updating ${p.display_name}…`}); try { await onSetRosterRole?.(p.id, value); setStatus({state:'success',text:`${p.display_name} set as ${value === 'reserve' ? 'Reserve' : 'Rotation'} player.`}); } catch (e) { setStatus({state:'error',text:e?.message || 'Could not update roster role.'}); } }} disabled={locked || busy || dirty}><SelectTrigger className="h-8 w-[102px] bg-background text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rotation">Rotation</SelectItem><SelectItem value="reserve">Reserve</SelectItem></SelectContent></Select>}
                {p.gender && <span className="text-[10px] text-muted-foreground">{p.gender}</span>}
              </div>}
            </Draggable>;
          })}
          {provided.placeholder}
          {!ids.length && <div className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">{id === 'pool' ? 'Import Spond attendees here' : 'Drag players here'}</div>}
        </div>
      </div>}
    </Droppable>
  );

  const roleOf = id => byId.get(id)?.roster_role || 'rotation';
  const rotationA = lanes.club_a.filter(id => roleOf(id) === 'rotation').length;
  const rotationB = lanes.club_b.filter(id => roleOf(id) === 'rotation').length;
  const reserveA = lanes.club_a.filter(id => roleOf(id) === 'reserve').length;
  const reserveB = lanes.club_b.filter(id => roleOf(id) === 'reserve').length;
  const balanced = rotationA > 0 && rotationA === rotationB;
  return <div className="space-y-3">
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><p className="text-sm font-semibold">Build the two teams</p><p className="text-xs text-muted-foreground">Drag players into the teams, rank them, then mark each team member as Rotation or Reserve. Rotation players are included in the draw; Reserves travel with the team but stay outside the scheduled rotation until activated.</p></div>
        <div className="flex flex-wrap gap-2 text-xs"><Badge variant="outline">{active.length} players</Badge><Badge variant="outline">A: {rotationA} rotation · {reserveA} reserve</Badge><Badge variant="outline">B: {rotationB} rotation · {reserveB} reserve</Badge><Badge className={balanced && lanes.pool.length===0 ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-700'}>{lanes.pool.length===0 && balanced ? 'Rotation squads balanced' : `${lanes.pool.length} unassigned`}</Badge></div>
      </div>
    </div>
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid xl:grid-cols-3 gap-3">
        {lane('pool','Player Pool',lanes.pool)}
        {lane('club_a',nameA,lanes.club_a,nameA,setNameA)}
        {lane('club_b',nameB,lanes.club_b,nameB,setNameB)}
      </div>
    </DragDropContext>
    <div className="rounded-xl border border-border bg-card p-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 text-xs text-muted-foreground">
        {lanes.pool.length ? `${lanes.pool.length} player${lanes.pool.length===1?'':'s'} still need a team.` : balanced ? `Ready: ${rotationA} rotation players per club${reserveA || reserveB ? ` · reserves ${reserveA}–${reserveB}` : ''}.` : 'The Rotation squads must contain the same number of players before the draw can be generated. Reserve numbers may differ.'}
        {dirty && <span className="ml-1 font-semibold text-amber-600">Unsaved changes.</span>}
      </div>
      <Button data-testid="cc-save-team-builder" onClick={save} disabled={locked || busy || !dirty || !nameA.trim() || !nameB.trim()} className="w-full sm:w-auto">{busy ? 'Saving…' : 'Save Teams & Rankings'}</Button>
    </div>
    {status && <div data-testid="cc-team-builder-status" className={cn('rounded-lg border p-3 text-xs font-semibold', status.state==='success'?'border-primary/30 bg-primary/10 text-primary':status.state==='error'?'border-destructive/30 bg-destructive/10 text-destructive':'border-amber-400/30 bg-amber-500/10 text-amber-700')}>{status.text}</div>}
  </div>;
}

function ScoreCard({ match, clubAName, clubBName, onSaved, networkOnline = true, onQueue, canScore = true, formatNames = null }) {
  const [a, setA] = useState(match.score_a ?? '');
  const [b, setB] = useState(match.score_b ?? '');
  const [saving, setSaving] = useState(false);
  const bInputRef = React.useRef(null);
  const saved = ['completed', 'draw'].includes(match.status);
  const setScore = setter => event => setter(String(event.target.value || '').replace(/\D/g, '').slice(0, 2));
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
    <div data-testid={`cc-score-card-r${match.round_number}-c${match.court_number}`} className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between"><span className="text-xs font-bold">Court {match.court_number}</span><Badge variant="outline">R{match.round_number}</Badge></div>
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-lg bg-secondary p-3 flex items-center gap-3"><div className="min-w-0 flex-1"><p className="text-[10px] text-muted-foreground">{clubAName}</p><p className="text-xs font-semibold truncate">{formatNames ? formatNames(match.club_a_names, 'club_a') : (match.club_a_names || []).join(' & ')}</p></div><Input data-testid={`cc-score-r${match.round_number}-c${match.court_number}-a`} inputMode="numeric" type="text" maxLength={2} value={a} onChange={setScore(setA)} onKeyDown={e => { if (e.key === 'Enter') bInputRef.current?.focus(); }} aria-label={`${clubAName} score`} className="w-16 h-11 text-center bg-background/80 border-2 border-muted-foreground/60 hover:border-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 text-lg font-bold tabular-nums shrink-0" /></div>
        <div className="rounded-lg bg-secondary p-3 flex items-center gap-3"><div className="min-w-0 flex-1"><p className="text-[10px] text-muted-foreground">{clubBName}</p><p className="text-xs font-semibold truncate">{formatNames ? formatNames(match.club_b_names, 'club_b') : (match.club_b_names || []).join(' & ')}</p></div><Input ref={bInputRef} data-testid={`cc-score-r${match.round_number}-c${match.court_number}-b`} inputMode="numeric" type="text" maxLength={2} value={b} onChange={setScore(setB)} onKeyDown={e => { if (e.key === 'Enter' && a !== '' && b !== '' && !saving) save(); }} aria-label={`${clubBName} score`} className="w-16 h-11 text-center bg-background/80 border-2 border-muted-foreground/60 hover:border-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 text-lg font-bold tabular-nums shrink-0" /></div>
      </div>
      <Button data-testid={`cc-save-score-r${match.round_number}-c${match.court_number}`} className="w-full h-11" onClick={save} disabled={!canScore || a === '' || b === '' || saving}>{!canScore ? 'Read-only' : saving ? 'Saving…' : !networkOnline ? 'Retain Offline Result' : saved ? 'Update Result' : 'Save Result'}</Button>
      {saved && <p className="text-[10px] text-muted-foreground text-center">Saved · {match.winner === 'draw' ? 'Draw' : match.winner === 'club_a' ? `${clubAName} win` : `${clubBName} win`}</p>}
    </div>
  );
}

export default function ClubChallengeView({ tournament, queryClient, isAdmin }) {
  const [tab, setTab] = useState('setup');
  const [setup, setSetup] = useState(DEFAULT_SETUP);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [logoUploading, setLogoUploading] = useState('');
  const [simLog, setSimLog] = useState([]);
  const [showcaseSelection, setShowcaseSelection] = useState({ aMale: '', aFemale: '', bMale: '', bFemale: '' });
  const [replacement, setReplacement] = useState({ mode:'new', outgoingId:'', candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'', reason:'', status:'withdrawn' });
  const [lateArrival, setLateArrival] = useState({ participantId: '', round: 1 });
  const [eventDayAdjust, setEventDayAdjust] = useState({ courts: 0, availableMinutes: 0 });
  const [eventDayProposal, setEventDayProposal] = useState(null);
  const [eventDayAdjustmentBusy, setEventDayAdjustmentBusy] = useState(false);
  const [eventDayAdjustmentStatus, setEventDayAdjustmentStatus] = useState(null);
  const [networkOnline, setNetworkOnline] = useState(() => navigator.onLine);
  const [pendingScores, setPendingScores] = useState(() => { try { return JSON.parse(localStorage.getItem(`cc-pending-${tournament.id}`) || '[]'); } catch { return []; } });
  const [timerNow, setTimerNow] = useState(Date.now());
  const [voiceMode, setVoiceMode] = useState(() => localStorage.getItem('cc-voice-mode') === 'off' ? 'off' : 'rallyhub_default');
  const [voices, setVoices] = useState([]);
  const [hallVolume, setHallVolume] = useState(() => { const v = Number(localStorage.getItem('cc-hall-volume')); return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1; });
  const [audioReady, setAudioReady] = useState(false);
  const [paActive, setPaActive] = useState(false);
  const [paStarting, setPaStarting] = useState(false);
  const [paInputLevel, setPaInputLevel] = useState(0);
  const [paGain, setPaGain] = useState(() => { const saved = localStorage.getItem('cc-pa-gain'); const v = saved === null ? NaN : Number(saved); return Number.isFinite(v) ? Math.min(1.5, Math.max(0, v)) : 0.55; });
  const [paMicLabel, setPaMicLabel] = useState('');
  const [microphones, setMicrophones] = useState([]);
  const [selectedMicId, setSelectedMicId] = useState(() => localStorage.getItem('cc-pa-mic-id') || 'default');
  const [paError, setPaError] = useState('');
  const [announcementDraft, setAnnouncementDraft] = useState('');
  const [announcementSpeaking, setAnnouncementSpeaking] = useState(false);
  const [announcementStatus, setAnnouncementStatus] = useState('');
  const [playerControlBusy, setPlayerControlBusy] = useState(false);
  const [playerControlStatus, setPlayerControlStatus] = useState(null);
  const [hostAction, setHostAction] = useState('');
  const [roundActionStatus, setRoundActionStatus] = useState(null);
  const hostBarAnchorRef = React.useRef(null);
  const hostBarInnerRef = React.useRef(null);
  const [hostBarPinned, setHostBarPinned] = useState(false);
  const [hostBarGeometry, setHostBarGeometry] = useState({ left: 0, width: 0, height: 0, top: 64 });
  const timerCommandRef = React.useRef(false);
  const sportingActionRef = React.useRef(false);
  const lastTimerAnnouncementRef = React.useRef(new Set());
  const wakeLockRef = React.useRef(null);
  const [roundLabels, setRoundLabels] = useState({});
  const [lastAnnouncement, setLastAnnouncement] = useState('');
  const [compressedTimer, setCompressedTimer] = useState({ running: false, step: -1, text: 'Not run' });
  const [displayMode, setDisplayMode] = useState(false);
  const [potVoterId, setPotVoterId] = useState('');
  const [potNomineeId, setPotNomineeId] = useState('');
  const [publicLinks, setPublicLinks] = useState(null);
  const [spondImportSide, setSpondImportSide] = useState('');

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
      showcaseEnabled: !!event.showcase_enabled, showcasePoints: event.showcase_points ?? s.showcasePoints, potEnabled: !!event.pot_enabled, juniorDisplayMode: !!event.junior_display_mode,
    }));
  }, [event?.id, event?.club_a_name, event?.club_b_name]);

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

  React.useEffect(() => {
    if (!event) return;
    try { setRoundLabels(event.round_labels_json ? JSON.parse(event.round_labels_json) : {}); }
    catch { setRoundLabels({}); }
  }, [event?.id, event?.round_labels_json]);

  const accessRole = isAdmin ? 'admin' : secureState?.accessRole || '';
  const permissions = isAdmin
    ? { canManage:true, canScore:true, canCorrectScore:true, canFinalise:true, displayOnly:false }
    : (secureState?.permissions || { canManage:false, canScore:false, canCorrectScore:false, canFinalise:false, displayOnly:false });
  const hasManagePermission = !!permissions.canManage;
  const eventReadOnly = ['completed','archived'].includes(event?.status);
  const canManageEvent = !!permissions.canManage && !eventReadOnly;
  const canScoreEvent = !!permissions.canScore && !eventReadOnly;
  const canFinaliseEvent = !!permissions.canFinalise && !eventReadOnly;
  const displayOnly = !!permissions.displayOnly;
  const { data: replacementCandidates = [], refetch: refetchReplacementCandidates } = useQuery({
    queryKey: ['club-challenge-replacement-candidates', event?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('manageClubChallengeParticipant', { eventId:event.id, action:'replacement_candidates' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.candidates || [];
    },
    enabled: !!event?.id && canManageEvent && ['in_progress','paused'].includes(event?.status),
    staleTime: 30000,
  });
  const poolPlayers = participants.filter(p => p.side === 'pool');
  const aPlayers = participants.filter(p => p.side === 'club_a');
  const bPlayers = participants.filter(p => p.side === 'club_b');
  const aRotationPlayers = aPlayers.filter(p => (p.roster_role || 'rotation') === 'rotation' || p.reserve_activated);
  const bRotationPlayers = bPlayers.filter(p => (p.roster_role || 'rotation') === 'rotation' || p.reserve_activated);
  const matchNames = (names, side) => (names || []).map(name => {
    const p = participants.find(x => x.side === side && x.display_name === name && !['withdrawn','injured','replaced'].includes(x.status));
    if (!p) return name;
    if (Array.isArray(p.covering_for_participant_ids) && p.covering_for_participant_ids.length) return `${name} · Cover`;
    if ((p.roster_role || 'rotation') === 'reserve' && p.reserve_activated) return `${name} · Reserve`;
    return name;
  }).join(' & ');
  const normalMatches = matches.filter(m => !m.is_showcase);
  const scheduleMaxRound = normalMatches.length ? Math.max(...normalMatches.map(m => Number(m.round_number || 0))) : 0;
  const plannedRounds = Number(event?.planned_rounds || 0) > 0 ? Number(event.planned_rounds) : scheduleMaxRound;
  const showcaseMatch = matches.find(m => m.is_showcase) || null;
  const locked = ['draw_approved', 'in_progress', 'paused', 'completed', 'archived'].includes(event?.status);
  const fairness = useMemo(() => { try { return event?.fairness_json ? JSON.parse(event.fairness_json) : null; } catch { return null; } }, [event?.fairness_json]);
  const score = useMemo(() => scoreFromMatchRecords(normalMatches, { winPoints: event?.win_points ?? 2, drawPoints: event?.draw_points ?? 1, lossPoints: event?.loss_points ?? 0 }), [normalMatches, event?.win_points, event?.draw_points, event?.loss_points]);
  const resolvedNormalCount = useMemo(() => normalMatches.filter(m => ['completed','draw','retired','forfeit','abandoned','not_played'].includes(m.status)).length, [normalMatches]);
  const unresolvedNormalCount = normalMatches.length - resolvedNormalCount;
  const overallScore = useMemo(() => {
    if (!showcaseMatch || showcaseMatch.showcase_mode === 'exhibition' || !['completed','draw'].includes(showcaseMatch.status) || !['club_a','club_b'].includes(showcaseMatch.winner)) return score;
    return applyShowcasePoints(score, { winner: showcaseMatch.winner === 'club_a' ? 'clubA' : 'clubB', points: Number(event?.showcase_points || 0) });
  }, [score, showcaseMatch, event?.showcase_points]);
  const rounds = [...new Set(normalMatches.map(m => Number(m.round_number)).filter(r => !plannedRounds || r <= plannedRounds))].sort((a, b) => a - b);
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
    const resyncVisibleTimer = () => {
      if (document.visibilityState !== 'visible') return;
      setTimerNow(Date.now());
      refetchEvent?.();
      refetchMatches?.();
    };
    document.addEventListener('visibilitychange', resyncVisibleTimer);
    window.addEventListener('focus', resyncVisibleTimer);
    return () => {
      document.removeEventListener('visibilitychange', resyncVisibleTimer);
      window.removeEventListener('focus', resyncVisibleTimer);
    };
  }, [refetchEvent, refetchMatches]);
  React.useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
  }, []);
  React.useEffect(() => { localStorage.setItem('cc-voice-mode', voiceMode); }, [voiceMode]);
  React.useEffect(() => { localStorage.setItem('cc-hall-volume', String(hallVolume)); }, [hallVolume]);
  React.useEffect(() => { localStorage.setItem('cc-pa-gain', String(paGain)); if (paActive) setRallyHubPaGain(paGain); }, [paGain, paActive]);
  React.useEffect(() => { localStorage.setItem('cc-pa-mic-id', selectedMicId); }, [selectedMicId]);
  React.useEffect(() => {
    if (tab !== 'live') { setHostBarPinned(false); return undefined; }
    const updateHostBar = () => {
      const anchor = hostBarAnchorRef.current;
      const inner = hostBarInnerRef.current;
      if (!anchor || !inner) return;
      const rect = anchor.getBoundingClientRect();
      const innerRect = inner.getBoundingClientRect();
      const top = window.innerWidth >= 640 ? 72 : 64;
      setHostBarPinned(rect.top <= top);
      setHostBarGeometry({ left: rect.left, width: rect.width, height: innerRect.height, top });
    };
    updateHostBar();
    window.addEventListener('scroll', updateHostBar, { passive: true });
    window.addEventListener('resize', updateHostBar);
    return () => {
      window.removeEventListener('scroll', updateHostBar);
      window.removeEventListener('resize', updateHostBar);
    };
  }, [tab, event?.id]);
  React.useEffect(() => {
    if (!paActive) { setPaInputLevel(0); return undefined; }
    const id = window.setInterval(() => setPaInputLevel(getRallyHubPaLevel()), 120);
    return () => window.clearInterval(id);
  }, [paActive]);
  React.useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const list = await listRallyHubMicrophones();
        if (!mounted) return;
        setMicrophones(list);
        if (selectedMicId !== 'default' && !list.some(mic => mic.deviceId === selectedMicId)) setSelectedMicId('default');
      } catch { /* browser may hide device details until mic permission is granted */ }
    };
    refresh();
    navigator.mediaDevices?.addEventListener?.('devicechange', refresh);
    return () => { mounted = false; navigator.mediaDevices?.removeEventListener?.('devicechange', refresh); };
  }, [selectedMicId]);
  React.useEffect(() => () => { wakeLockRef.current?.release?.(); stopAllRallyHubAudio(); }, []);
  React.useEffect(() => {
    if (['draw', 'live'].includes(tab) || !paActive) return;
    stopRallyHubPA();
    setPaActive(false);
  }, [tab, paActive]);
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
        compositionMode: setup.compositionMode, showcaseEnabled: setup.showcaseEnabled, showcasePoints: number(setup.showcasePoints, 5), potEnabled: setup.potEnabled, juniorDisplayMode: setup.juniorDisplayMode,
      }
    });
    try {
      if (event) await base44.entities.ClubChallengeEvent.update(event.id, { ...data, status: event.status, draw_version: event.draw_version || 0, current_round: event.current_round || 0 });
      else await base44.entities.ClubChallengeEvent.create(data);
      if (!tournament.tenant_id || !tournament.host_club_id || tournament.format !== INTERCLUB_INTERNAL_FORMAT || !tournament.inter_club) {
        await base44.entities.Tournament.update(tournament.id, { tenant_id: tenantId, host_club_id: hostClubId, format: INTERCLUB_INTERNAL_FORMAT, inter_club: true });
      }
      toast.success(`${INTERCLUB_EVENT_LABEL} setup saved`);
      await sync();
      setTab('teams');
    } catch (e) { toast.error(e?.message || 'Could not save setup'); }
    setSaving(false);
  };

  const uploadClubLogo = async (side, file) => {
    if (!file) return;
    setLogoUploading(side);
    try {
      const uploadRes = await base44.functions.invoke('secureCreditAction', { action: 'upload_image', purpose: 'club_challenge_logo', tournamentId: tournament.id, file });
      if (uploadRes.data?.error) throw new Error(uploadRes.data.error);
      const fileUrl = uploadRes.data?.file_url;
      if (!fileUrl) throw new Error('No file URL returned');
      const setupKey = side === 'A' ? 'clubALogo' : 'clubBLogo';
      const eventKey = side === 'A' ? 'club_a_logo_url' : 'club_b_logo_url';
      setSetup(s => ({ ...s, [setupKey]: fileUrl }));
      // Once an Interclub event exists, persist the logo immediately so a host
      // cannot lose it by navigating away after a successful upload.
      if (event?.id && isAdmin) {
        await base44.entities.ClubChallengeEvent.update(event.id, { [eventKey]: fileUrl });
        await refetchEvent();
      }
      toast.success(`${side === 'A' ? setup.clubAName : setup.clubBName} logo uploaded${event?.id ? ' and saved' : ''}`);
    } catch (e) { toast.error(e?.message || 'Could not upload logo'); }
    finally { setLogoUploading(''); }
  };

  const loadTestRoster = async () => {
    if (!event) { toast.error('Save Setup first.'); return; }
    if (!window.confirm(`Load 32 practice players? Existing unplayed ${INTERCLUB_EVENT_LABEL} participants and draw fixtures will be replaced. Practice players are clearly labelled and should not be used for a live event.`)) return;
    setSaving(true);
    try {
      const res = await base44.functions.invoke('loadClubChallengePracticeRoster', { eventId:event.id });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success('32 practice players loaded. You can now rehearse the full setup and draw journey.');
      await sync();
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not load practice players'); }
    setSaving(false);
  };

  const addManual = async (side, overrideName = '') => {
    const name = String(overrideName || '').trim();
    if (!event || !name || !canManageEvent) return;
    try {
      const res = await base44.functions.invoke('manageClubChallengeParticipant', { eventId:event.id, action:'add_manual', side, displayName:name });
      if (res.data?.error) throw new Error(res.data.error);
      await sync();
      return res.data;
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Could not add player');
      throw e;
    }
  };

  const organiseTeams = async ({ poolIds, clubAIds, clubBIds, clubAName, clubBName }) => {
    if (!event || !canManageEvent || sportingActionRef.current) return;
    sportingActionRef.current = true;
    setSaving(true);
    flushSync(() => setHostAction('Saving teams and rankings… one command sent'));
    try {
      const res = await base44.functions.invoke('manageClubChallengeParticipant', {
        eventId:event.id,
        action:'organise_teams',
        poolParticipantIds:poolIds,
        clubAParticipantIds:clubAIds,
        clubBParticipantIds:clubBIds,
        clubAName,
        clubBName,
      });
      if (res.data?.error) throw new Error(res.data.error);
      await sync();
      toast.success(`Teams saved · ${clubAIds.length} vs ${clubBIds.length}${poolIds.length ? ` · ${poolIds.length} still unassigned` : ''}`);
      return res.data;
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not save teams and rankings';
      toast.error(message);
      throw new Error(message);
    } finally {
      sportingActionRef.current = false;
      setSaving(false);
      setHostAction('');
    }
  };

  const setRosterRole = async (participantId, rosterRole) => {
    if (!event || !canManageEvent) throw new Error('Event manager permission required.');
    const res = await base44.functions.invoke('manageClubChallengeParticipant', { eventId:event.id, action:'set_roster_role', participantId, rosterRole });
    if (res.data?.error) throw new Error(res.data.error);
    await sync();
    toast.success(`${res.data.participantName} set as ${res.data.rosterRole === 'reserve' ? 'Reserve' : 'Rotation'} player.`);
    return res.data;
  };

  const calculateFormat = () => {
    if (poolPlayers.length || !aRotationPlayers.length || !bRotationPlayers.length || aRotationPlayers.length !== bRotationPlayers.length) return null;
    try {
      return calculateClubChallengeFormat({ clubAPlayerCount: aRotationPlayers.length, clubBPlayerCount: bRotationPlayers.length, courts: number(setup.courts), availableMinutes: number(setup.availableMinutes), playMinutes: number(setup.playMinutes), changeoverMinutes: number(setup.changeoverMinutes), includeBreak: setup.includeBreak, breakMinutes: number(setup.breakMinutes), breakAfterRound: number(setup.breakAfterRound) });
    } catch { return null; }
  };
  const formatInfo = calculateFormat();
  const previewFormatInfo = useMemo(() => {
    const actualA = aRotationPlayers.length;
    const actualB = bRotationPlayers.length;
    const plannedTotal = Math.max(8, Math.floor(number(setup.plannedPlayersTotal, 32) / 2) * 2);
    const plannedPerClub = plannedTotal / 2;
    const countA = actualA || plannedPerClub;
    const countB = actualB || plannedPerClub;
    try {
      return calculateClubChallengeFormat({
        clubAPlayerCount: countA, clubBPlayerCount: countB, courts: number(setup.courts), availableMinutes: number(setup.availableMinutes),
        playMinutes: number(setup.playMinutes), changeoverMinutes: number(setup.changeoverMinutes), includeBreak: setup.includeBreak,
        breakMinutes: number(setup.breakMinutes), breakAfterRound: number(setup.breakAfterRound),
      });
    } catch { return null; }
  }, [aRotationPlayers.length, bRotationPlayers.length, setup.plannedPlayersTotal, setup.courts, setup.availableMinutes, setup.playMinutes, setup.changeoverMinutes, setup.includeBreak, setup.breakMinutes, setup.breakAfterRound]);

  const generateDraw = async () => {
    if (!event || !canManageEvent || sportingActionRef.current) return;
    if (aRotationPlayers.length !== bRotationPlayers.length || aRotationPlayers.length < 4) { toast.error('For this draw, both clubs must have equal Rotation squads of at least 4. Reserve numbers may differ.'); return; }
    setSaving(true); sportingActionRef.current = true; setHostAction('Generating draw and fairness report… one command sent');
    try {
      const engA = [...aRotationPlayers].sort((x, y) => x.event_rank - y.event_rank).map((p, i) => ({ id: p.id, name: p.display_name, rank:i + 1, gender: p.gender }));
      const engB = [...bRotationPlayers].sort((x, y) => x.event_rank - y.event_rank).map((p, i) => ({ id: p.id, name: p.display_name, rank:i + 1, gender: p.gender }));
      const fi = calculateClubChallengeFormat({ clubAPlayerCount: engA.length, clubBPlayerCount: engB.length, courts: number(setup.courts), availableMinutes: number(setup.availableMinutes), playMinutes: number(setup.playMinutes), changeoverMinutes: number(setup.changeoverMinutes), includeBreak: setup.includeBreak, breakMinutes: number(setup.breakMinutes), breakAfterRound: number(setup.breakAfterRound) });
      const schedule = generateClubChallengeFixtures({ clubAPlayers: engA, clubBPlayers: engB, courts: number(setup.courts), rounds: fi.recommendedRounds });
      const report = analyseClubChallengeFairness({ schedule, clubAPlayers: engA, clubBPlayers: engB });
      const participantMap = Object.fromEntries(participants.map(p => [p.id, p]));
      const nextVersion = Number(event.draw_version || 0) + 1;
      const records = fixtureRecordsFromSchedule({ event: { ...event, draw_version: nextVersion }, schedule, participantMap });
      const res = await base44.functions.invoke('replaceClubChallengeDraw', { eventId:event.id, fixtures:records, fairness:report });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`${records.length} fixtures generated`);
      await sync();
      setTab('draw');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not generate draw'); }
    finally { setSaving(false); sportingActionRef.current = false; setHostAction(''); }
  };

  const approveDraw = async () => {
    if (!event || !fairness || !matches.length || sportingActionRef.current) return;
    if (fairness.duplicatePlayerRoundIssues || fairness.sameClubIntegrityIssues || !fairness.equalGames) { toast.error('Hard fairness checks must pass before approval.'); return; }
    sportingActionRef.current = true; setHostAction('Approving and locking draw… command sent');
    try {
      const res = await base44.functions.invoke('manageClubChallengeEvent', { eventId:event.id, action:'approve_draw' });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success('Draw approved and locked');
      await sync();
    } catch (e) { await refetchEvent(); toast.error(e?.message || 'Could not approve draw'); }
    finally { sportingActionRef.current = false; setHostAction(''); }
  };

  const startEvent = async () => {
    if (event?.status !== 'draw_approved' || sportingActionRef.current) return;
    sportingActionRef.current = true; setHostAction(`Starting ${INTERCLUB_EVENT_LABEL}… command sent`);
    try {
      await unlockHallAudio();
      const res = await base44.functions.invoke('manageClubChallengeEvent', { eventId:event.id, action:'start' });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`${INTERCLUB_EVENT_LABEL} started`);
      await sync(); setTab('live');
    } catch (e) { await refetchEvent(); toast.error(e?.message || `Could not start ${INTERCLUB_EVENT_LABEL}`); }
    finally { sportingActionRef.current = false; setHostAction(''); }
  };

  const timerAction = async (action, phase, extra = {}) => {
    if (!event || timerCommandRef.current) return false;
    timerCommandRef.current = true;
    setHostAction(action === 'start' ? `Starting ${phase || 'timer'}… command sent` : action === 'pause' ? 'Pausing timer… command sent' : action === 'resume' ? 'Resuming timer… command sent' : 'Updating timer… command sent');
    try {
      const res = await base44.functions.invoke('updateClubChallengeTimer', { eventId: event.id, action, phase, expectedRevision: Number(event.timer_revision || 0), ...extra });
      if (res.data?.conflict) { toast.error('Timer changed on another device. RallyHub has refreshed the authoritative timer.'); await refetchEvent(); return false; }
      if (res.data?.error) { toast.error(res.data.error); return false; }
      await refetchEvent();
      return true;
    } catch (e) {
      await refetchEvent();
      if (e?.response?.status === 409) toast.error('Timer changed on another device. Authoritative state reloaded.');
      else toast.error(e?.response?.data?.error || e?.message || 'Could not update timer');
      return false;
    } finally { timerCommandRef.current = false; setHostAction(''); }
  };

  const unlockHallAudio = async ({ test = false } = {}) => {
    try {
      const ctx = await unlockRallyHubAudio();
      setAudioReady(!!ctx && ctx.state === 'running');
      if (test) {
        playRallyHubSignal(ctx, 'start', hallVolume);
        window.setTimeout(() => speakRallyHub('Sound check. RallyHub Interclub ready.', { volume: hallVolume, voiceMode, voices }), 450);
        if ('vibrate' in navigator) navigator.vibrate(120);
      }
      return ctx;
    } catch { return null; }
  };
  const requestWakeLock = async () => {
    try { if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch { /* best effort */ }
  };
  const refreshMicrophones = async () => {
    try {
      const list = await listRallyHubMicrophones();
      setMicrophones(list);
      return list;
    } catch {
      setMicrophones([]);
      return [];
    }
  };
  const startPA = async () => {
    if (paStarting || paActive) return;
    setPaStarting(true);
    setPaError('');
    try {
      const available = await refreshMicrophones();
      if (selectedMicId !== 'default' && !available.some(mic => mic.deviceId === selectedMicId)) {
        throw new Error('The selected microphone is no longer available. Re-select it and try again.');
      }
      const info = await startRallyHubPA({ volume: paGain, deviceId: selectedMicId });
      setAudioReady(true);
      setPaMicLabel(info.micLabel || 'Default microphone');
      await refreshMicrophones();
      setPaActive(true);
      toast.success(`Live PA is on using ${info.micLabel || 'the selected microphone'}.`);
    } catch (error) {
      const message = error?.name === 'NotAllowedError'
        ? 'Microphone permission was blocked. Allow microphone access for RallyHub in the browser and try again.'
        : error?.name === 'NotFoundError'
          ? 'No microphone was found on this laptop.'
          : error?.name === 'NotReadableError'
            ? 'The microphone is busy in another app. Close the other microphone app and try again.'
            : (error?.message || 'RallyHub could not start the live PA microphone.');
      setPaError(message);
      toast.error(message);
    } finally { setPaStarting(false); }
  };
  const stopPA = () => {
    stopRallyHubPA();
    setPaInputLevel(0);
    setPaActive(false);
    toast.success('Live PA off.');
  };
  const silenceAudio = () => {
    stopAllRallyHubAudio();
    setPaInputLevel(0);
    setPaActive(false);
    toast.info('Live PA and spoken RallyHub audio stopped.');
  };
  const speak = (text, { signal = null } = {}) => {
    const ctx = window.__rallyhubAudioContext || null;
    if (signal) playRallyHubSignal(ctx, signal, hallVolume);
    if (!text || paActive || voiceMode === 'off') return !!signal;
    const spoken = speakRallyHub(text, { volume: hallVolume, voiceMode, voices });
    if (spoken) setLastAnnouncement(text);
    return spoken;
  };
  const announceCustom = async () => {
    const text = announcementDraft.trim();
    if (!text || announcementSpeaking) return;
    if (paActive) { toast.info('Turn off Live PA before playing a RallyHub voice announcement.'); return; }
    setAnnouncementSpeaking(true);
    setAnnouncementStatus('Attention chime…');
    try {
      const ctx = await unlockHallAudio();
      if (!ctx) throw new Error('RallyHub audio is not available in this browser.');

      playRallyHubSignal(ctx, 'announcement', hallVolume);
      window.setTimeout(() => {
        let started = false;
        const watchdog = window.setTimeout(() => {
          if (started) return;
          window.speechSynthesis?.cancel?.();
          setAnnouncementSpeaking(false);
          setAnnouncementStatus('Voice did not start — text kept for retry.');
          toast.error('The device voice did not start. Your announcement text has been kept.');
        }, 4500);
        const ok = speakRallyHub(text, {
          volume: hallVolume,
          voiceMode: 'rallyhub_default',
          voices,
          onStart: () => {
            started = true;
            window.clearTimeout(watchdog);
            setAnnouncementStatus('Speaking…');
          },
          onEnd: () => {
            window.clearTimeout(watchdog);
            if (!started) {
              setAnnouncementSpeaking(false);
              setAnnouncementStatus('Voice did not audibly start — text kept for retry.');
              toast.error('The browser ended the voice without starting it. Your text has been kept.');
              return;
            }
            setLastAnnouncement(text);
            setAnnouncementDraft('');
            setAnnouncementSpeaking(false);
            setAnnouncementStatus('Announcement played.');
            toast.success('Announcement played.');
          },
          onError: () => {
            window.clearTimeout(watchdog);
            setAnnouncementSpeaking(false);
            setAnnouncementStatus('Voice playback failed — text kept for retry.');
            toast.error('Voice playback failed. Your announcement text has been kept.');
          },
        });
        if (!ok) {
          window.clearTimeout(watchdog);
          setAnnouncementSpeaking(false);
          setAnnouncementStatus('Text-to-speech is unavailable — text kept for retry.');
          toast.error('Text-to-speech is unavailable in this browser.');
        }
      }, 2450);
    } catch (error) {
      setAnnouncementSpeaking(false);
      setAnnouncementStatus('Announcement could not start — text kept for retry.');
      toast.error(error?.message || 'Could not play the announcement. Your text has been kept so you can try again.');
    }
  };
  const roundLabel = round => roundLabels[round] || `Round ${round}`;
  const saveRoundLabel = async round => {
    if (!event || !canManageEvent) return;
    try {
      const res = await base44.functions.invoke('manageClubChallengeEvent', { eventId:event.id, action:'set_round_label', round, label:roundLabels[round] || '' });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not save round label'); }
  };
  const archiveEvent = async () => {
    if (!event || !hasManagePermission) return;
    try {
      const res = await base44.functions.invoke('manageClubChallengeEvent', { eventId:event.id, action:'archive' });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(`${INTERCLUB_EVENT_LABEL} archived.`);
      await sync();
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || `Could not archive ${INTERCLUB_EVENT_LABEL}`); }
  };
  const reopenEvent = async () => {
    if (!event || !hasManagePermission) return;
    try {
      const res = await base44.functions.invoke('manageClubChallengeEvent', { eventId:event.id, action:'reopen' });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(`${INTERCLUB_EVENT_LABEL} reopened to its completed result.`);
      await sync();
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || `Could not reopen ${INTERCLUB_EVENT_LABEL}`); }
  };
  const startPhase = async phase => {
    // The host's tap is the best chance to unlock mobile audio before the network await.
    await unlockHallAudio();
    if (await timerAction('start', phase)) {
      lastTimerAnnouncementRef.current = new Set();
      speak(phase === 'play' ? `${roundLabel(currentRound)}. Start round.` : phase === 'changeover' ? 'Changeover.' : `Your ${Number(event?.break_minutes || 20)} minute break starts now. Enjoy your break.`, { signal:'start' });
      requestWakeLock();
    }
  };
  const pauseTimer = async () => { if (await timerAction('pause')) { speak('Event paused.'); wakeLockRef.current?.release?.(); } };
  const resumeTimer = async () => { await unlockHallAudio(); if (await timerAction('resume')) { speak(String(timerState?.phase || '') === 'break' ? 'Break resumed.' : String(timerState?.phase || '') === 'changeover' ? 'Changeover resumed.' : `${roundLabel(currentRound)}. Resume play.`, { signal:'start' }); requestWakeLock(); } };
  const resetTimer = () => timerAction('reset');
  const preparedRoundMinutes = ['ready','play'].includes(String(timerState?.phase || '')) && Number(timerState?.round || 0) === Number(currentRound) && !timerState?.running && Number(timerState?.remaining_seconds || 0) > 0
    ? Math.max(1, Math.round(Number(timerState.remaining_seconds) / 60))
    : Number(event?.play_minutes || 10);
  const setRoundMinutes = async value => {
    const minutes = Math.max(1, Math.min(60, Math.round(Number(value) || Number(event?.play_minutes || 10))));
    if (!event || !canManageEvent || timerState?.running) return;
    try {
      const res = await base44.functions.invoke('updateClubChallengeTimer', { eventId:event.id, action:'set_round_minutes', minutes, expectedRevision:Number(event.timer_revision || 0) });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
      toast.success(`${roundLabel(currentRound)} set to ${minutes} minutes.`);
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not change this round duration'); await refetchEvent(); }
  };
  const fmtTimer = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const testVoice = () => unlockHallAudio({ test:true });
  React.useEffect(() => {
    if (!timerState?.running) return;
    const phase = timerState.phase || 'play';
    const announceOnce = (key, text, signal = 'warning') => {
      if (lastTimerAnnouncementRef.current.has(key)) return;
      lastTimerAnnouncementRef.current.add(key);
      speak(text, { signal });
    };
    const prefix = `${currentRound}-${phase}`;
    if (phase === 'play') {
      if (timerRemaining === 60) announceOnce(`${prefix}-60`, 'One minute remaining.');
      if (timerRemaining === 30) announceOnce(`${prefix}-30`, 'Thirty seconds.');
      if (timerRemaining === 10) announceOnce(`${prefix}-10`, 'Ten seconds.');
    } else if (phase === 'changeover') {
      if (timerRemaining === 30) announceOnce(`${prefix}-30`, 'Thirty seconds until the next round.');
      if (timerRemaining === 10) announceOnce(`${prefix}-10`, 'Ten seconds.');
    }
    if (timerRemaining <= 5 && timerRemaining > 0) announceOnce(`${prefix}-count-${timerRemaining}`, String(timerRemaining));
    if (timerRemaining === 0) {
      const scheduledBreakAfterThisRound = event?.include_break && Number(currentRound) === Number(event?.break_after_round || 0);
      const endMessage = phase === 'play'
        ? (scheduledBreakAfterThisRound ? `${roundLabel(currentRound)} finished. Your ${Number(event?.break_minutes || 20)} minute break is next. Please give in your scores.` : 'Round finished. Please give your scores.')
        : phase === 'changeover'
          ? 'Changeover finished. Next round ready.'
          : `Break finished. ${roundLabel(Number(currentRound) + 1)} is ready when the host is ready.`;
      announceOnce(`${prefix}-end`, endMessage, 'end');
      wakeLockRef.current?.release?.();
    }
  }, [timerRemaining, timerState?.running, timerState?.phase, currentRound, hallVolume, voiceMode, voices, event?.include_break, event?.break_after_round, event?.break_minutes]);
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
  const preparePublicLinks = async () => {
    if (!event || !hasManagePermission) return;
    try {
      const res = await base44.functions.invoke('manageClubChallengePublicLinks', { eventId:event.id });
      if (res.data?.error) { toast.error(res.data.error); return; }
      const origin = window.location.origin;
      setPublicLinks({ ...res.data, displayUrl:`${origin}/club-challenge/display/${res.data.displayToken}`, votingUrl:`${origin}/club-challenge/vote/${res.data.votingToken}` });
      toast.success('Public Hall Display and POT voting links are ready.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not prepare public links'); }
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
    if (!event || !canManageEvent || !replacement.outgoingId) { toast.error('Choose the player who is leaving.'); return; }
    const outgoing = participants.find(p => p.id === replacement.outgoingId);
    if (!outgoing) { toast.error('Choose the player who is leaving.'); return; }
    const mode = replacement.mode || 'new';
    const reserve = participants.find(p => p.id === replacement.reserveParticipantId);
    const cover = participants.find(p => p.id === replacement.coverParticipantId);
    const incomingName = mode === 'reserve' ? reserve?.display_name : mode === 'cover' ? cover?.display_name : replacement.incomingName.trim();
    if (mode === 'new' && !incomingName) { toast.error('Enter or choose the replacement player.'); return; }
    if (mode === 'reserve' && !reserve) { toast.error('Choose a team reserve.'); return; }
    if (mode === 'cover' && !cover) { toast.error('Choose an existing rotation player to cover.'); return; }
    if (sportingActionRef.current || playerControlBusy) return;
    sportingActionRef.current = true;
    setPlayerControlBusy(true);
    const workingText = mode === 'reserve'
      ? `Activating reserve ${incomingName} for ${outgoing.display_name} from Round ${currentRound}…`
      : mode === 'cover'
        ? `Rebalancing future fixtures with ${incomingName} covering ${outgoing.display_name}…`
        : `Replacing ${outgoing.display_name} with ${incomingName} from Round ${currentRound}…`;
    setPlayerControlStatus({ state:'working', text:workingText });
    setHostAction(`${workingText} command sent`);
    try {
      const action = mode === 'reserve' ? 'activate_reserve' : mode === 'cover' ? 'cover_existing' : 'replace';
      const res = await base44.functions.invoke('manageClubChallengeParticipant', {
        eventId:event.id, action, outgoingParticipantId:replacement.outgoingId,
        reserveParticipantId:replacement.reserveParticipantId, coverParticipantId:replacement.coverParticipantId,
        incomingName, incomingGender:replacement.incomingGender,
        incomingSourcePlayerId:replacement.incomingSourcePlayerId, incomingParticipantType:replacement.incomingParticipantType,
        reason:replacement.reason, withdrawalStatus:replacement.status,
      });
      if (res.data?.error) throw new Error(res.data.error);
      const message = mode === 'reserve'
        ? `${res.data.incomingName} activated from the Reserve bench for ${res.data.outgoingName} from Round ${res.data.effectiveRound}. ${res.data.affected} future fixture${res.data.affected === 1 ? '' : 's'} updated.`
        : mode === 'cover'
          ? `${res.data.incomingName} is covering ${res.data.outgoingName} from Round ${res.data.effectiveRound}. ${res.data.coverGames} fixture${res.data.coverGames === 1 ? '' : 's'} go directly to the cover player${res.data.rebalanced ? `; ${res.data.rebalanced} conflict${res.data.rebalanced === 1 ? '' : 's'} safely rebalanced through resting rotation players` : ''}. Completed results unchanged.`
          : `${res.data.outgoingName} replaced by ${res.data.incomingName} from Round ${res.data.effectiveRound}. ${res.data.affected} future fixture${res.data.affected === 1 ? '' : 's'} updated; completed results unchanged.`;
      setReplacement({ mode:'new', outgoingId:'', candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'', reason:'', status:'withdrawn' });
      setPlayerControlStatus({ state:'success', text:message });
      toast.success(message);
      await sync();
      await refetchReplacementCandidates();
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not apply player change';
      setPlayerControlStatus({ state:'error', text:message });
      toast.error(message);
    } finally {
      sportingActionRef.current = false;
      setPlayerControlBusy(false);
      setHostAction('');
    }
  };

  const withdrawWithoutReplacement = async () => {
    if (!event || !canManageEvent || !replacement.outgoingId) { toast.error('Choose the player who is withdrawing.'); return; }
    if (sportingActionRef.current || playerControlBusy) return;
    const outgoingName = participants.find(p => p.id === replacement.outgoingId)?.display_name || 'Player';
    sportingActionRef.current = true;
    setPlayerControlBusy(true);
    setPlayerControlStatus({ state:'working', text:`Withdrawing ${outgoingName} from Round ${currentRound} and continuing short…` });
    setHostAction(`Applying withdrawal from Round ${currentRound}… command sent`);
    try {
      const res = await base44.functions.invoke('manageClubChallengeParticipant', {
        eventId:event.id, action:'continue_short', outgoingParticipantId:replacement.outgoingId,
        reason:replacement.reason, withdrawalStatus:replacement.status,
      });
      if (res.data?.error) throw new Error(res.data.error);
      const message = `${res.data.outgoingName} withdrawn from Round ${res.data.effectiveRound}; ${res.data.affected} future match${res.data.affected === 1 ? '' : 'es'} marked Not Played.`;
      setReplacement({ mode:'new', outgoingId:'', candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'', reason:'', status:'withdrawn' });
      setPlayerControlStatus({ state:'success', text:message });
      toast.success(message);
      await sync();
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not continue short';
      setPlayerControlStatus({ state:'error', text:message });
      toast.error(message);
    } finally {
      sportingActionRef.current = false;
      setPlayerControlBusy(false);
      setHostAction('');
    }
  };
  const applyLateArrival = async () => {
    if (!event || !canManageEvent || !lateArrival.participantId) return;
    if (sportingActionRef.current || playerControlBusy) return;
    const participantName = participants.find(p => p.id === lateArrival.participantId)?.display_name || 'Player';
    const fromRound = Number(lateArrival.round || currentRound || 1);
    sportingActionRef.current = true;
    setPlayerControlBusy(true);
    setPlayerControlStatus({ state:'working', text:`Marking ${participantName} available from Round ${fromRound}…` });
    setHostAction(`Applying late arrival from Round ${fromRound}… command sent`);
    try {
      const res = await base44.functions.invoke('manageClubChallengeParticipant', {
        eventId:event.id, action:'late_arrival', participantId:lateArrival.participantId, fromRound,
      });
      if (res.data?.error) throw new Error(res.data.error);
      const message = `${res.data.participantName} marked available from Round ${res.data.fromRound}. Future draw impact still requires organiser review.`;
      setPlayerControlStatus({ state:'success', text:message });
      toast.success(message);
      await sync();
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not set late arrival';
      setPlayerControlStatus({ state:'error', text:message });
      toast.error(message);
    } finally {
      sportingActionRef.current = false;
      setPlayerControlBusy(false);
      setHostAction('');
    }
  };
  const proposeEventDayAdjustment = () => {
    setEventDayAdjustmentStatus(null);
    const courts = Number(eventDayAdjust.courts || event?.courts || 0), minutes = Number(eventDayAdjust.availableMinutes || event?.available_minutes || 0);
    if (!courts || !minutes || !plannedRounds) { toast.error('Enter available courts and remaining event minutes.'); return; }
    const terminal = ['completed','draw','retired','forfeit','abandoned','not_played'];
    const unresolvedInPlan = normalMatches.filter(m => Number(m.round_number) >= Number(currentRound) && Number(m.round_number) <= plannedRounds && !terminal.includes(m.status)).sort((a,b)=>(a.round_number-b.round_number)||(a.court_number-b.court_number));
    const unresolvedBeyondPlan = normalMatches.filter(m => Number(m.round_number) > plannedRounds && !terminal.includes(m.status)).sort((a,b)=>(a.round_number-b.round_number)||(a.court_number-b.court_number));
    const block = Number(event.play_minutes||10) + Number(event.changeover_minutes||2);
    const remainingBreakMinutes = event?.include_break && Number(currentRound) <= Number(event.break_after_round || 0) && Number(event.break_after_round || 0) < plannedRounds ? Number(event.break_minutes || 0) : 0;
    const timeRoundCapacity = Math.max(0, Math.floor(Math.max(0, minutes - remainingBreakMinutes) / Math.max(1, block)));
    const plannedRoundCapacity = Math.max(0, plannedRounds - Number(currentRound) + 1);
    const roundCapacity = Math.min(timeRoundCapacity, plannedRoundCapacity);
    const slots = roundCapacity * courts;
    const keep = unresolvedInPlan.slice(0, slots);
    const drop = [...unresolvedInPlan.slice(slots), ...unresolvedBeyondPlan];
    const changes = keep.map((m,i) => ({ id:m.id, oldRound:m.round_number, oldCourt:m.court_number, newRound:Number(currentRound) + Math.floor(i/courts), newCourt:(i%courts)+1 })).filter(x=>x.oldRound!==x.newRound || x.oldCourt!==x.newCourt);
    const proposalKey = [event?.id, currentRound, courts, minutes, plannedRounds, ...changes.map(c=>`${c.id}:${c.newRound}:${c.newCourt}`), ...drop.map(m=>`drop:${m.id}`)].join('|');
    const proposal = { courts, minutes, block, plannedRounds, roundCapacity, unresolved: unresolvedInPlan.length + unresolvedBeyondPlan.length, keepIds: keep.map(m=>m.id), dropIds: drop.map(m=>m.id), changes, proposalKey };
    setEventDayProposal(proposal);
    toast.info(`${keep.length} future matches fit within the approved ${plannedRounds}-round event; ${drop.length} would be marked Not Played. Review before confirming.`);
  };
  const confirmEventDayAdjustment = async () => {
    if (!eventDayProposal || !canManageEvent || eventDayAdjustmentBusy || sportingActionRef.current) return;
    const proposal = eventDayProposal;
    sportingActionRef.current = true;
    setEventDayAdjustmentBusy(true);
    setEventDayAdjustmentStatus({ state:'working', text:`Applying court & time changes… ${proposal.changes.length} fixture move${proposal.changes.length === 1 ? '' : 's'}, ${proposal.dropIds.length} Not Played.` });
    setHostAction('Applying court & time changes… command sent');
    try {
      const res = await base44.functions.invoke('updateClubChallengeSchedule', {
        eventId: event.id,
        courts: proposal.courts,
        availableMinutes: proposal.minutes,
        changes: proposal.changes,
        dropIds: proposal.dropIds,
        proposalKey: proposal.proposalKey,
      });
      if (res.data?.error) throw new Error(res.data.error);
      const changed = Number(res.data?.changed ?? proposal.changes.length);
      const dropped = Number(res.data?.dropped ?? proposal.dropIds.length);
      const message = res.data?.alreadyApplied
        ? 'These court & time changes were already applied. No duplicate schedule change was made.'
        : `Schedule updated: ${changed} future fixture position${changed === 1 ? '' : 's'} changed; ${dropped} marked Not Played. Event Pack marked out of date.`;
      setEventDayAdjustmentStatus({ state:'success', text:message });
      toast.success(message);
      setEventDayProposal(null);
      await sync();
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not confirm schedule adjustment';
      setEventDayAdjustmentStatus({ state:'error', text:message });
      toast.error(message);
    } finally {
      sportingActionRef.current = false;
      setEventDayAdjustmentBusy(false);
      setHostAction('');
    }
  };

  const finaliseEvent = async (winner, method, note = '') => {
    if (!event || !canFinaliseEvent || !['club_a','club_b','draw'].includes(winner)) return;
    if (event.pot_enabled && event.pot_status === 'open') { toast.error('Player of the Tournament voting is still open.'); return; }
    try {
      const res = await base44.functions.invoke('finaliseClubChallenge', { eventId:event.id, method });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(res.data?.winner === 'draw' ? `${INTERCLUB_EVENT_LABEL} finalised as an overall draw` : `${res.data?.winner === 'club_b' ? event.club_b_name : event.club_a_name} confirmed as ${INTERCLUB_EVENT_LABEL} winner`);
      await sync(); setTab('results');
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || `Could not finalise ${INTERCLUB_EVENT_LABEL}`);
    }
  };

  const resolveTieByMetrics = async () => {
    if (score.clubA !== score.clubB) { toast.info('The normal Interclub points are not tied.'); return; }
    const winner = resolveClubChallengeWinner(score, { allowDraw: false });
    if (winner === 'tiebreak_required') { toast.error('Cumulative point differential is also tied. Play the Showcase Final or record an overall draw if allowed.'); return; }
    await finaliseEvent(winner === 'clubA' ? 'club_a' : 'club_b', 'metrics', `Tie resolved by cumulative point differential (${score.gamePointDifference >= 0 ? '+' : ''}${score.gamePointDifference}).`);
  };

  const recordOverallDraw = async () => {
    if (!event?.allow_overall_draw) { toast.error('Overall draw is not enabled for this event.'); return; }
    if (score.clubA !== score.clubB) { toast.error('Overall draw can only be recorded when Interclub points are level.'); return; }
    await finaliseEvent('draw', 'overall_draw', 'Normal points and chosen tiebreak outcome left the Interclub Challenge level.');
  };

  const createShowcaseFinal = async () => {
    if (!canManageEvent) return;
    if (!event?.showcase_enabled) { toast.error('Showcase Final is not enabled in Setup.'); return; }
    const showcaseMode = score.clubA === score.clubB ? 'tiebreak' : 'exhibition';
    if (showcaseMode === 'tiebreak' && Number(event.showcase_points || 0) <= 0) { toast.error('Showcase tiebreak points must be greater than zero.'); return; }
    const ids = [showcaseSelection.aMale, showcaseSelection.aFemale, showcaseSelection.bMale, showcaseSelection.bFemale];
    if (ids.some(id => !id)) { toast.error('Nominate one male and one female player from each club.'); return; }
    try {
      const res = await base44.functions.invoke('createClubChallengeShowcase', {
        eventId: event.id,
        clubAMaleId: showcaseSelection.aMale,
        clubAFemaleId: showcaseSelection.aFemale,
        clubBMaleId: showcaseSelection.bMale,
        clubBFemaleId: showcaseSelection.bFemale,
        mode: showcaseMode,
      });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(showcaseMode === 'exhibition' ? 'Optional Showcase Final created · exhibition only' : 'Showcase tiebreak created');
      await sync(); setTab('results');
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Could not create Showcase Final');
    }
  };

  const finaliseShowcase = async () => {
    if (!showcaseMatch || !['completed'].includes(showcaseMatch.status) || !['club_a','club_b'].includes(showcaseMatch.winner)) { toast.error('Save the Showcase Final result first.'); return; }
    if (showcaseMatch.showcase_mode === 'exhibition') {
      await finaliseEvent(score.clubA > score.clubB ? 'club_a' : 'club_b', 'none', 'Optional Showcase Final played as an exhibition; normal Interclub result unchanged.');
      return;
    }
    await finaliseEvent(showcaseMatch.winner, 'showcase_final', `Showcase Final worth ${event.showcase_points} Interclub points decided the tied event.`);
  };

  const openOptionalShowcase = () => {
    setTab('results');
    window.setTimeout(() => document.getElementById('showcase-final-panel')?.scrollIntoView({ behavior:'smooth', block:'start' }), 50);
  };

  const advanceRound = async () => {
    if (sportingActionRef.current) return;
    const currentMatches = matches.filter(m => m.round_number === currentRound && !m.is_showcase);
    const unresolved = currentMatches.filter(m => !['completed', 'draw', 'retired', 'forfeit', 'abandoned', 'not_played'].includes(m.status));
    if (unresolved.length) { toast.error(`${unresolved.length} result${unresolved.length === 1 ? '' : 's'} still missing in Round ${currentRound}.`); return; }
    const maxRound = plannedRounds;
    const scheduledBreak = !!event?.include_break && Number(currentRound) === Number(event?.break_after_round || 0) && currentRound < maxRound;
    if (scheduledBreak && timerPhase !== 'break') {
      setRoundActionStatus({ state:'working', text:`Round ${currentRound} saved. Starting ${Number(event.break_minutes || 20)}-minute break…` });
      await unlockHallAudio();
      const ok = await timerAction('start', 'break');
      if (ok) {
        const message = `Round ${currentRound} saved ✓ · ${Number(event.break_minutes || 20)}-minute break started`;
        setRoundActionStatus({ state:'success', text:message });
        toast.success(message);
        speak(`Round ${currentRound} saved. Your ${Number(event.break_minutes || 20)} minute break starts now. Please make sure all scores are in. Enjoy your break.`, { signal:'start' });
        requestWakeLock();
      } else setRoundActionStatus({ state:'error', text:'Could not start the scheduled break.' });
      return;
    }
    if (scheduledBreak && timerPhase === 'break' && timerRemaining > 0) {
      toast.info(`Break in progress · ${fmtTimer(timerRemaining)} remaining. The host can shorten it or end it early.`);
      return;
    }
    sportingActionRef.current = true; setRoundActionStatus({ state:'working', text:currentRound < maxRound ? `Round ${currentRound} saved. Preparing Round ${currentRound + 1}…` : `Finalising ${INTERCLUB_EVENT_LABEL}…` }); setHostAction(currentRound < maxRound ? `Preparing Round ${currentRound + 1}… command sent` : `Finalising ${INTERCLUB_EVENT_LABEL}… command sent`);
    try {
      if (currentRound < maxRound) {
        const res = await base44.functions.invoke('updateClubChallengeRound', { eventId: event.id, nextRound: currentRound + 1 });
        if (res.data?.error) { toast.error(res.data.error); return; }
        const nextRound = currentRound + 1;
        const nextMatches = normalMatches.filter(m => m.round_number === nextRound && m.status !== 'not_played');
        const activeIds = new Set(nextMatches.flatMap(m => [...(m.club_a_participant_ids || []), ...(m.club_b_participant_ids || [])]));
        const restingCount = participants.filter(p => ['active','late'].includes(p.status) && !activeIds.has(p.id)).length;
        const message = `Round ${currentRound} saved ✓ · Round ${nextRound} ready · ${nextMatches.length} courts · ${restingCount} players resting`;
        setRoundActionStatus({ state:'success', text:message });
        toast.success(message);
        await refetchEvent();
      } else {
        if (resolvedNormalCount !== normalMatches.length) { toast.error('All normal match results must be resolved before the event can finish.'); return; }
        if (score.clubA === score.clubB) {
          toast.info('Normal Interclub points are tied. Choose Showcase Final, metrics, or overall draw in Results.');
          setTab('results');
          return;
        }
        await finaliseEvent(score.clubA > score.clubB ? 'club_a' : 'club_b', 'none', 'Clear winner after normal Interclub Challenge matches.');
      }
    } catch (e) { const message = e?.response?.data?.error || e?.message || `Could not advance ${INTERCLUB_EVENT_LABEL}`; setRoundActionStatus({ state:'error', text:message }); await refetchEvent(); toast.error(message); }
    finally { sportingActionRef.current = false; setHostAction(''); }
  };

  const endBreakEarly = async () => {
    if (!canManageEvent || sportingActionRef.current || !event || currentRound >= plannedRounds) return;
    const nextRound = currentRound + 1;
    sportingActionRef.current = true;
    setRoundActionStatus({ state:'working', text:`Ending break early and preparing Round ${nextRound}…` });
    setHostAction(`Ending break early → Round ${nextRound}… command sent`);
    try {
      const res = await base44.functions.invoke('updateClubChallengeRound', { eventId:event.id, nextRound, skipBreak:true });
      if (res.data?.error) throw new Error(res.data.error);
      await refetchEvent();
      const message = `Break ended early · Round ${nextRound} ready`;
      setRoundActionStatus({ state:'success', text:message });
      toast.success(message);
      speak(`Break finished. ${roundLabel(nextRound)} is ready.`, { signal:'start' });
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not end the break early';
      setRoundActionStatus({ state:'error', text:message });
      toast.error(message);
      await refetchEvent();
    } finally {
      sportingActionRef.current = false;
      setHostAction('');
    }
  };

  const adjustScheduledBreak = async deltaMinutes => {
    if (!canManageEvent || timerPhase !== 'break' || sportingActionRef.current) return;
    const ok = await timerAction('adjust_break', null, { minutes:deltaMinutes });
    if (ok) toast.success(`${Math.abs(deltaMinutes)} minutes ${deltaMinutes > 0 ? 'added to' : 'removed from'} the break.`);
  };

  const currentMatches = matches.filter(m => m.round_number === currentRound && !m.is_showcase && m.status !== 'not_played');
  const currentRoundSavedCount = currentMatches.filter(m => ['completed','draw','retired','forfeit','abandoned'].includes(m.status)).length;
  const currentRoundComplete = currentMatches.length > 0 && currentRoundSavedCount === currentMatches.length;
  const timerPhase = String(timerState?.phase || 'idle');
  const timerRunning = !!timerState?.running && timerRemaining > 0;
  const timerPaused = !!timerState && !timerState?.running && timerRemaining > 0 && ['play','changeover','break'].includes(timerPhase);
  const scheduledBreakHere = !!event?.include_break && Number(currentRound) === Number(event?.break_after_round || 0);
  const breakActive = scheduledBreakHere && timerPhase === 'break';
  const playFinished = timerPhase === 'play' && timerRemaining <= 0;
  const changeoverAvailable = timerPhase === 'play' && (!timerState?.running || timerRemaining <= 0);
  const outgoingPlayer = participants.find(p => p.id === replacement.outgoingId) || null;
  const availableReplacementCandidates = replacementCandidates.filter(c => !outgoingPlayer || c.side === outgoingPlayer.side);
  const gate3ParticipantIds = new Set(participants.filter(p => String(p.unique_identity_key || '').startsWith('gate3-')).map(p => p.id));
  const isGate3TestEvent = gate3ParticipantIds.size >= 8 && participants.every(p => String(p.unique_identity_key || '').startsWith('gate3-') || (p.replacement_for_participant_id && gate3ParticipantIds.has(p.replacement_for_participant_id)));
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
    const normal = matches.filter(m => !m.is_showcase && (!plannedRounds || Number(m.round_number) <= plannedRounds));
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
      const maxRound = plannedRounds || Math.max(...resetMatches.map(m => m.round_number));
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
    if (!window.confirm(`Reset all dummy ${INTERCLUB_EVENT_LABEL} match results back to the approved draw?`)) return;
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
  const populateFullPracticeResult = async () => {
    if (!event || !isGate3TestEvent || !matches.length || simulating) return;
    if (!window.confirm('TEST MODE: populate every normal result, Showcase Final and sample Player of Tournament votes so you can inspect the fully completed journey? This is restricted to dummy data.')) return;
    setSimulating(true);
    setHostAction('Populating full TEST MODE event… one server command sent');
    try {
      const res = await base44.functions.invoke('populateClubChallengePracticeScenario', { eventId:event.id, mode:'full_result' });
      if (res.data?.error) throw new Error(res.data.error);
      addSimLog(`Full TEST MODE result populated — ${res.data.normalMatches} normal matches${res.data.showcase ? ' + Showcase' : ''}${res.data.practiceVotes ? ` + ${res.data.practiceVotes} sample votes` : ''}`, 'pass');
      toast.success('TEST MODE fully populated. Review Draw, Live Event and Results screens.');
      await sync();
      setTab('results');
    } catch (e) { addSimLog(`Full TEST MODE population FAILED — ${e?.response?.data?.error || e?.message || e}`, 'fail'); toast.error(e?.response?.data?.error || e?.message || 'Could not populate full practice result'); }
    finally { setSimulating(false); setHostAction(''); }
  };
  const structuralChecks = useMemo(() => {
    const normal = matches.filter(m => !m.is_showcase);
    const terminal = ['completed','draw','retired','forfeit','abandoned','not_played'];
    const playableBeyondPlan = normal.filter(m => plannedRounds > 0 && Number(m.round_number) > plannedRounds && !terminal.includes(m.status)).length;
    return [
      ['Dummy roster', participants.length === 32],
      ['16 + 16 rotation players', aRotationPlayers.length === 16 && bRotationPlayers.length === 16],
      ['12 approved rounds', plannedRounds === 12],
      ['No playable fixture beyond approved plan', playableBeyondPlan === 0],
      ['48 original matches retained', normal.length === 48],
      ['Fairness hard checks', !!fairness && fairness.equalGames && !fairness.duplicatePlayerRoundIssues && !fairness.sameClubIntegrityIssues],
      ['Original draw · 6 games each', !!fairness && fairness.minGames === 6 && fairness.maxGames === 6],
    ];
  }, [matches, participants.length, aRotationPlayers.length, bRotationPlayers.length, fairness, plannedRounds]);
  const stageIndex = !event ? 0
    : event.status === 'draft' ? (participants.length ? 1 : 0)
    : event.status === 'draw_generated' || event.status === 'draw_approved' ? 2
    : event.status === 'in_progress' || event.status === 'paused' ? 3
    : event.status === 'completed' || event.status === 'archived' ? 5 : 0;
  const currentDisplayMatches = normalMatches.filter(m => m.round_number === currentRound && m.status !== 'not_played').sort((a,b) => a.court_number - b.court_number);
  const nextDisplayMatches = normalMatches.filter(m => m.round_number === currentRound + 1 && m.status !== 'not_played').sort((a,b) => a.court_number - b.court_number);
  const currentActiveIds = new Set(currentDisplayMatches.flatMap(m => [...(m.club_a_participant_ids || []), ...(m.club_b_participant_ids || [])]));
  const currentSittingOut = participants.filter(p => (p.status === 'active' || (p.status === 'late' && Number(p.available_from_round || 1) <= currentRound)) && !currentActiveIds.has(p.id));
  const currentSittingOutA = currentSittingOut.filter(p => p.side === 'club_a');
  const currentSittingOutB = currentSittingOut.filter(p => p.side === 'club_b');
  const potCounts = potVotes.filter(v => v.valid !== false).reduce((a,v) => ({ ...a, [v.nominee_participant_id]: (a[v.nominee_participant_id] || 0) + 1 }), {});
  const potWinnerNames = (event?.pot_winner_participant_ids || []).map(id => participants.find(p => p.id === id)?.display_name).filter(Boolean);

  if ((displayMode || displayOnly) && event) return (
    <div className="min-h-[75vh] bg-background p-4 sm:p-8 space-y-6">
      {!networkOnline && <div className="rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center">Connection lost — showing the last known state. RallyHub will resynchronise automatically when this device reconnects.</div>}
      <div className="flex justify-between items-start gap-4"><div><p className="text-sm uppercase tracking-[.2em] text-primary font-bold">{INTERCLUB_MODULE_NAME} · Hall Display</p><h1 className="text-3xl sm:text-5xl font-bold mt-2">{event.club_a_name} <span className="text-primary">{score.clubA} – {score.clubB}</span> {event.club_b_name}</h1></div>{!displayOnly && <Button variant="outline" onClick={() => setDisplayMode(false)}>Exit Display</Button>}</div>
      {scheduledBreakHere && !breakActive && <div className="rounded-2xl border-2 border-red-500 bg-red-600 p-5 text-center text-white shadow-xl"><p className="text-xl sm:text-3xl font-black uppercase tracking-wider">Break after this round · {event.break_minutes} minutes</p><p className="mt-2 text-sm sm:text-base text-white/90">Round {currentRound + 1} will wait until the scheduled break is finished or the host ends it early.</p></div>}
      <div className={cn('rounded-2xl border p-6 text-center', breakActive ? 'border-red-400 bg-red-600 text-white shadow-xl' : 'border-border bg-card')}><p className={cn('text-lg uppercase tracking-widest', breakActive ? 'font-black text-white' : 'text-muted-foreground')}>{breakActive ? 'BREAK NOW' : <>{roundLabel(currentRound)} · {timerState?.phase || 'idle'}</>}</p><p className="text-7xl sm:text-9xl font-bold tabular-nums mt-2">{fmtTimer(timerRemaining)}</p>{breakActive && <p className="mt-3 text-sm sm:text-lg text-white/90">Enjoy the break · Round {currentRound + 1} is up next</p>}</div>
      {!breakActive && <div><h2 className="text-xl font-bold mb-3">On Court Now</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{currentDisplayMatches.map(m => <div key={m.id} className="rounded-xl border border-border bg-card p-4"><p className="text-primary font-bold">Court {m.court_number}</p><p className="text-lg font-semibold mt-2">{(m.club_a_names||[]).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')}</p><p className="text-sm text-muted-foreground my-1">vs</p><p className="text-lg font-semibold">{(m.club_b_names||[]).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')}</p>{['completed','draw'].includes(m.status) && <p className="text-2xl font-bold mt-3">{m.score_a}–{m.score_b}</p>}</div>)}</div></div>}
      {!breakActive && currentSittingOut.length > 0 && <div className="rounded-xl border border-border bg-card/70 p-4"><h2 className="text-lg font-bold">Resting This Round</h2><div className="flex flex-wrap gap-2 mt-3">{currentSittingOut.map(p => <span key={p.id} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">{privacyName(p.display_name, !!event.junior_display_mode)}</span>)}</div></div>}
      <div><h2 className="text-xl font-bold mb-3">{breakActive ? 'After the Break' : 'Up Next'} · Round {currentRound + 1}</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{nextDisplayMatches.map(m => <div key={m.id} className="rounded-xl bg-secondary/50 p-4"><p className="font-bold">Court {m.court_number}</p><p className="text-sm mt-1">{(m.club_a_names||[]).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')} vs {(m.club_b_names||[]).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')}</p></div>)}</div></div>
      <p className="text-xs text-muted-foreground text-center">Read-only display · no email, phone or private participant information{event.junior_display_mode ? ' · junior privacy mode active' : ''}</p>
    </div>
  );

  return (
    <div data-testid="cc-root" className="space-y-4 print:space-y-0">
      {hostAction && <div className="print:hidden sticky top-2 z-40 rounded-xl border-2 border-primary/40 bg-background/95 p-3 shadow-lg"><p className="text-sm font-bold text-primary">{hostAction}</p><p className="text-xs text-muted-foreground mt-1">RallyHub has accepted your tap. Keep this screen open; the control stays locked until the action resolves.</p></div>}
      {event && ['draw_approved','in_progress','paused','completed'].includes(event.status) && <div className="hidden print:block bg-white text-black p-6"><div className="flex justify-between border-b pb-3"><div><h1 className="text-2xl font-bold">{INTERCLUB_MODULE_NAME} · Event Pack</h1><p>{event.club_a_name} vs {event.club_b_name}</p></div><div className="text-right text-xs"><p>Rules v{event.rules_version}</p><p>Draw v{event.draw_version} · Pack v{event.event_pack_version || event.draw_version}</p><p>{event.event_pack_stale ? 'OUT OF DATE' : 'APPROVED DRAW'}</p></div></div><div className="grid grid-cols-2 gap-6 mt-4"><div><h2 className="font-bold">{event.club_a_name}</h2>{aPlayers.slice().sort((a,b)=>a.event_rank-b.event_rank).map(p=><p key={p.id} className="text-xs">#{p.event_rank} {p.display_name}{(p.roster_role || 'rotation') === 'reserve' ? (p.reserve_activated ? ' · Reserve activated' : ' · Reserve') : ''}{Array.isArray(p.covering_for_participant_ids) && p.covering_for_participant_ids.length ? ' · Cover' : ''}</p>)}</div><div><h2 className="font-bold">{event.club_b_name}</h2>{bPlayers.slice().sort((a,b)=>a.event_rank-b.event_rank).map(p=><p key={p.id} className="text-xs">#{p.event_rank} {p.display_name}{(p.roster_role || 'rotation') === 'reserve' ? (p.reserve_activated ? ' · Reserve activated' : ' · Reserve') : ''}{Array.isArray(p.covering_for_participant_ids) && p.covering_for_participant_ids.length ? ' · Cover' : ''}</p>)}</div></div><h2 className="font-bold mt-5 mb-2">Approved Fixtures</h2><table className="w-full text-[10px] border-collapse"><thead><tr><th className="border p-1">Rnd</th><th className="border p-1">Court</th><th className="border p-1">{event.club_a_name}</th><th className="border p-1">Score</th><th className="border p-1">{event.club_b_name}</th></tr></thead><tbody>{normalMatches.slice().sort((a,b)=>(a.round_number-b.round_number)||(a.court_number-b.court_number)).map(m=><tr key={m.id}><td className="border p-1 text-center">{m.round_number}</td><td className="border p-1 text-center">{m.court_number}</td><td className="border p-1">{(m.club_a_names||[]).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')}</td><td className="border p-1 text-center">____ – ____</td><td className="border p-1">{(m.club_b_names||[]).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')}</td></tr>)}</tbody></table><div className="mt-4 text-xs"><p>Play: {event.play_minutes} min · Changeover: {event.changeover_minutes} min{event.include_break ? ` · Break: ${event.break_minutes} min after Round ${event.break_after_round}` : ''}</p><p className="mt-2">Manual final total: {event.club_a_name} ______  {event.club_b_name} ______</p>{event.showcase_enabled && <p className="mt-2">Showcase Final: ________________________________  Score: ______ – ______</p>}</div></div>}
      <div className="print:hidden glass rounded-xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-primary" /></div>
          <div><p className="font-semibold text-foreground">{INTERCLUB_MODULE_NAME}</p><p className="text-xs text-muted-foreground">{event ? `${INTERCLUB_EVENT_LABEL} · Status: ${event.status.replaceAll('_', ' ')}` : `Configure an ${INTERCLUB_EVENT_LABEL}`}</p></div>
        </div>
        {event && <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"><div className="grid grid-cols-[1fr_auto_1fr] sm:flex items-center gap-2 w-full lg:w-auto min-w-0"><ClubBadge name={event.club_a_name} logo={event.club_a_logo_url} primary={event.club_a_primary_colour} secondary={event.club_a_secondary_colour} /><span className="text-xs text-muted-foreground text-center">vs</span><ClubBadge name={event.club_b_name} logo={event.club_b_logo_url} primary={event.club_b_primary_colour} secondary={event.club_b_secondary_colour} /></div>{!networkOnline && <Badge className="bg-yellow-500/10 text-yellow-400">OFFLINE · not saved</Badge>}{pendingScores.length > 0 && <><Badge variant="outline">{pendingScores.length} unsynchronised</Badge>{networkOnline && <Button variant="outline" size="sm" onClick={retryPendingScores}>Retry Sync</Button>}</>}{['in_progress','paused','completed'].includes(event.status) && <Button variant="outline" size="sm" onClick={() => setDisplayMode(true)}>Hall Display</Button>}{hasManagePermission && <Button variant="outline" size="sm" onClick={preparePublicLinks}>Public Links / QR</Button>}{['draw_approved','in_progress','paused','completed'].includes(event.status) && <Button variant="outline" size="sm" onClick={printEventPack}>{event.event_pack_stale ? 'Print Event Pack · OUT OF DATE' : `Print Event Pack v${event.event_pack_version || event.draw_version || 1}`}</Button>}</div>}
      </div>

      {publicLinks && <div className="print:hidden rounded-xl border border-primary/20 bg-card p-4 space-y-4"><div><p className="text-sm font-semibold">Public {INTERCLUB_MODULE_NAME} Links</p><p className="text-xs text-muted-foreground">Use the Hall Display link on a TV/tablet. Players can scan the POT QR and use their personal 8-character code.</p></div><div className="grid md:grid-cols-2 gap-4"><div className="rounded-lg bg-secondary/40 p-4 flex gap-4 items-center"><QRCodeSVG value={publicLinks.displayUrl} size={104}/><div className="min-w-0"><p className="text-xs font-semibold">Hall Display</p><p className="text-[10px] text-muted-foreground break-all mt-1">{publicLinks.displayUrl}</p><Button size="sm" variant="outline" className="mt-2" onClick={() => navigator.clipboard?.writeText(publicLinks.displayUrl)}>Copy link</Button></div></div><div className="rounded-lg bg-secondary/40 p-4 flex gap-4 items-center"><QRCodeSVG value={publicLinks.votingUrl} size={104}/><div className="min-w-0"><p className="text-xs font-semibold">Player of Tournament Voting</p><p className="text-[10px] text-muted-foreground break-all mt-1">{publicLinks.votingUrl}</p><Button size="sm" variant="outline" className="mt-2" onClick={() => navigator.clipboard?.writeText(publicLinks.votingUrl)}>Copy link</Button></div></div></div>{event.pot_enabled && <details className="rounded-lg border border-border p-3"><summary className="text-xs font-semibold cursor-pointer">Player voting access codes ({publicLinks.voterCodes?.length || 0})</summary><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">{(publicLinks.voterCodes||[]).map(v=><div key={v.participantId} className="rounded bg-secondary/50 p-2 text-xs"><p className="truncate">{privacyName(v.displayName, !!event.junior_display_mode)}</p><p className="font-mono font-bold tracking-wider text-primary">{v.code}</p></div>)}</div></details>}</div>}

      <div className="print:hidden rounded-xl border border-border bg-card/50 p-2 sm:p-3">
        <div className="flex overflow-x-auto gap-1 sm:gap-2 -mx-1 px-1 pb-1 snap-x scrollbar-none">
          {TABS.map(([id, label], index) => {
            const complete = index < stageIndex;
            const current = index === stageIndex;
            return (
              <button key={id} data-testid={`cc-tab-${id}`} onClick={() => {
                if (id === 'teams' && !event) { toast.info('Save Setup first, then Teams will open.'); return; }
                if (id === 'draw' && !matches.length) { toast.info('Generate the draw from Teams first.'); return; }
                if (id === 'live' && !['in_progress','paused','completed','archived'].includes(event?.status)) { toast.info(`Approve the draw and start the ${INTERCLUB_EVENT_LABEL} first.`); return; }
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
            <div className="grid sm:grid-cols-[220px_1fr] gap-3 items-end">
              <div><Label className="text-xs">Planned total players</Label><Input type="number" min="8" step="2" value={setup.plannedPlayersTotal} onChange={e => setSetup(s => ({ ...s, plannedPlayersTotal: e.target.value }))} className="mt-1 bg-secondary" /><p className="text-[10px] text-muted-foreground mt-1">Used for the setup estimate until the real rosters are entered. Split equally between clubs.</p></div>
              {previewFormatInfo && <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center"><p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Estimated event duration</p><p className="text-3xl font-bold mt-1">{durationLabel(previewFormatInfo.structuredMinutes)}</p><p className="text-xs text-muted-foreground mt-1">{previewFormatInfo.recommendedRounds} rounds × {previewFormatInfo.playMinutes + previewFormatInfo.changeoverMinutes} min block{previewFormatInfo.break.enabled ? ` + ${previewFormatInfo.break.minutes} min break` : ''} · {previewFormatInfo.remainingMinutes} min contingency</p></div>}
            </div>
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
                      <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.showcaseEnabled} onChange={e => setSetup(s => ({ ...s, showcaseEnabled: e.target.checked }))} /> Showcase Final · tiebreak or optional exhibition</label>
              {setup.showcaseEnabled && <div className="flex items-center gap-2 min-h-10 rounded-lg bg-secondary/40 px-3"><Label className="text-xs whitespace-nowrap">Tiebreak points</Label><Input type="number" min="1" value={setup.showcasePoints} onChange={e => setSetup(s => ({ ...s, showcasePoints: e.target.value }))} className="h-8 w-20 bg-secondary" /></div>}
              <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.potEnabled} onChange={e => setSetup(s => ({ ...s, potEnabled: e.target.checked }))} /> Player of Tournament voting</label>
              <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.juniorDisplayMode} onChange={e => setSetup(s => ({ ...s, juniorDisplayMode: e.target.checked }))} /> Junior display privacy (first name + surname initial)</label>
            </div>
          </div>
          <Button data-testid="cc-save-setup" onClick={saveSetup} disabled={!isAdmin || saving || !!logoUploading} className="w-full h-11">{logoUploading ? 'Uploading logo…' : saving ? 'Saving…' : event ? 'Save & Continue to Teams' : 'Create & Continue to Teams'}</Button>
        </div>
      )}

      {tab === 'teams' && (
        <div className="space-y-4">
          {!event ? <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">Save Setup first.</div> : <>
            <div className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div><p className="text-sm font-semibold">Participants</p><p className="text-xs text-muted-foreground">Event ranks are independent of permanent RallyHub skill ratings.</p></div>
              <Button data-testid="cc-load-practice" variant="outline" className="w-full sm:w-auto min-h-11" onClick={loadTestRoster} disabled={locked || saving || !canManageEvent}><Users className="w-4 h-4 mr-2" />Practice with 32 Test Players</Button>
            </div>
            <TeamBuilder
              participants={participants}
              clubAName={setup.clubAName}
              clubBName={setup.clubBName}
              locked={locked}
              busy={saving || !!hostAction}
              onImportSpond={setSpondImportSide}
              onAddManual={addManual}
              onSave={organiseTeams}
              onSetRosterRole={setRosterRole}
            />
            {formatInfo ? <div className="glass rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center"><div><p className="text-xl font-bold">{formatInfo.recommendedRounds}</p><p className="text-[10px] text-muted-foreground">Rounds</p></div><div><p className="text-xl font-bold">{formatInfo.totalMatches}</p><p className="text-[10px] text-muted-foreground">Matches</p></div><div><p className="text-xl font-bold">{formatInfo.gamesRangeClubA.join('–')}</p><p className="text-[10px] text-muted-foreground">Games/player</p></div><div><p className="text-xl font-bold">{formatInfo.structuredMinutes}</p><p className="text-[10px] text-muted-foreground">Structured min</p></div><div><p className="text-xl font-bold">{formatInfo.remainingMinutes}</p><p className="text-[10px] text-muted-foreground">Contingency min</p></div></div> : participants.length > 0 && <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-700">Finish assigning every player, save the teams, and make the two Rotation squads equal before generating the draw. Reserve numbers may differ.</div>}
            <Button data-testid="cc-generate-draw" onClick={generateDraw} disabled={locked || saving || !formatInfo} className="w-full h-11"><ListChecks className="w-4 h-4 mr-2" />Generate Draw & Fairness Report</Button>
          </>}
        </div>
      )}

      {tab === 'draw' && (
        <div className="space-y-4">
          {!matches.length ? <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">Generate a draw from Teams & Ranking first.</div> : <>
            {fairness && <div className="glass rounded-xl p-5"><div className="flex items-center justify-between mb-4"><div><p className="text-sm font-semibold">Fairness Report</p><p className="text-xs text-muted-foreground">Schedule fairness checks</p></div><Badge className={(fairness.balancedGames ?? (Number(fairness.maxGames)-Number(fairness.minGames)<=1)) && !fairness.duplicatePlayerRoundIssues && !fairness.sameClubIntegrityIssues ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>{(fairness.balancedGames ?? (Number(fairness.maxGames)-Number(fairness.minGames)<=1)) && !fairness.duplicatePlayerRoundIssues && !fairness.sameClubIntegrityIssues ? (fairness.equalGames ? 'Fairness checks passed' : 'Fairness checks passed · 1-game rotation spread') : 'Review required'}</Badge></div><div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">{[['Matches',fairness.totalMatches],['Games min',fairness.minGames],['Games max',fairness.maxGames],['Partner repeats',fairness.repeatedPartnerPairs],['Max opponent repeat',fairness.maxOpponentRepeat],['Consecutive rests',fairness.consecutiveRestOccurrences],['Avg strength gap',Number(fairness.averageStrengthGap).toFixed(2)],['Max gap',fairness.maxStrengthGap]].map(([l,v]) => <div key={l} className="rounded-lg bg-secondary p-3"><p className="text-lg font-bold">{v}</p><p className="text-[10px] text-muted-foreground">{l}</p></div>)}</div></div>}
            <div className="space-y-3 max-h-[48rem] overflow-auto">{rounds.map(r => <div key={r} className="glass rounded-xl p-4"><div className="flex items-center justify-between mb-3"><p className="text-sm font-bold">Round {r}</p><span className="text-[10px] text-muted-foreground">{matches.filter(m => m.round_number === r).length} courts</span></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">{matches.filter(m => m.round_number === r).sort((a,b)=>a.court_number-b.court_number).map(m => <div key={m.id} className="rounded-lg bg-secondary p-3"><p className="text-[10px] font-bold text-primary mb-2">Court {m.court_number}</p><p className="text-xs">{matchNames(m.club_a_names, 'club_a')}</p><p className="text-[10px] text-muted-foreground my-1">vs</p><p className="text-xs">{matchNames(m.club_b_names, 'club_b')}</p></div>)}</div></div>)}</div>
            {event?.status === 'draw_approved' && <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-3"><div><p className="text-xs font-bold">Hall sound & PA check before play</p><p className="text-[10px] text-muted-foreground">Set the laptop audio output to the venue speaker. Start the microphone level low and raise it gradually to avoid acoustic feedback. The built-in laptop microphone is the simplest V1 choice, but you can select a USB/external microphone if needed.</p>{paMicLabel && paActive && <p className="text-[10px] text-muted-foreground mt-1">Active mic: {paMicLabel}</p>}{paError && <p className="text-[10px] text-destructive mt-1">{paError}</p>}</div><div className="grid sm:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_auto_auto] gap-2 items-end"><div><Label className="text-[10px]">Microphone</Label><Select value={selectedMicId} onValueChange={v => { setSelectedMicId(v); setPaError(''); setPaMicLabel(''); }} onOpenChange={open => { if (open && !paActive) refreshMicrophones(); }} disabled={paActive}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">System default microphone</SelectItem>{microphones.filter(mic => mic.deviceId && mic.deviceId !== 'default').map((mic, i) => <SelectItem key={mic.deviceId} value={mic.deviceId}>{mic.label || `Microphone ${i + 1}`}</SelectItem>)}</SelectContent></Select></div><Button data-testid="cc-prestart-sound-check" variant="outline" className="min-h-11" onClick={() => unlockHallAudio({test:true})}>{audioReady ? 'Test Sound Again ✓' : 'Test Sound'}</Button><Button data-testid="cc-prestart-pa-test" className="min-h-11" variant={paActive ? 'destructive' : 'default'} disabled={paStarting} onClick={paActive ? stopPA : startPA}>{paActive ? <><MicOff className="w-4 h-4 mr-2" />Stop PA</> : <><Mic className="w-4 h-4 mr-2" />{paStarting ? 'Starting…' : 'Test PA Mic'}</>}</Button></div><div className="grid sm:grid-cols-2 gap-3"><div className="rounded-lg bg-secondary/40 px-3 py-2"><Label className="text-xs">Live PA mic volume · {Math.round(paGain * 100)}%</Label><input aria-label="RallyHub pre-start PA microphone level" type="range" min="0" max="1.5" step="0.05" value={paGain} onChange={e => setPaGain(Number(e.target.value))} className="mt-2 w-full" /></div><div className="rounded-lg bg-secondary/40 px-3 py-2"><Label className="text-xs">RallyHub alerts & voice volume · {Math.round(hallVolume * 100)}%</Label><input aria-label="RallyHub pre-start hall sound volume" type="range" min="0" max="1" step="0.05" value={hallVolume} onChange={e => setHallVolume(Number(e.target.value))} className="mt-2 w-full" /></div></div></div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{event?.status === 'draw_generated' && <><Button variant="outline" className="w-full min-h-11" onClick={generateDraw} disabled={saving || !!hostAction}><RefreshCw className="w-4 h-4 mr-2" />Full Redraw</Button><Button data-testid="cc-approve-draw" className="w-full min-h-11" onClick={approveDraw} disabled={!!hostAction}><Check className="w-4 h-4 mr-2" />Approve Draw</Button></>}{event?.status === 'draw_approved' && <Button data-testid="cc-start-event" className="w-full" onClick={startEvent} disabled={!!hostAction}><Play className="w-4 h-4 mr-2" />Start {INTERCLUB_EVENT_LABEL}</Button>}</div>
          </>}
        </div>
      )}

      {tab === 'live' && (
        <div className="space-y-4">
          {!event || !['in_progress','paused','completed','archived'].includes(event.status) ? <div className="rounded-xl border border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">Approve the draw and start the {INTERCLUB_EVENT_LABEL} first.</div> : <>
            <div ref={hostBarAnchorRef} style={hostBarPinned ? { height: hostBarGeometry.height } : undefined}>
              <div
                ref={hostBarInnerRef}
                data-testid="cc-sticky-host-bar"
                data-pinned={hostBarPinned ? 'true' : 'false'}
                className={cn('rounded-xl border border-primary/30 bg-background/95 backdrop-blur px-3 py-2 shadow-lg', hostBarPinned && 'fixed z-20')}
                style={hostBarPinned ? { top: hostBarGeometry.top, left: hostBarGeometry.left, width: hostBarGeometry.width } : undefined}
              >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Badge className={breakActive ? 'bg-red-600 text-white' : 'bg-primary/10 text-primary'}>{breakActive ? 'BREAK' : `Round ${currentRound}/${plannedRounds}`}</Badge>
                <div className="font-bold tabular-nums text-lg sm:text-xl">{fmtTimer(timerRemaining)}</div>
                <div className="text-xs text-muted-foreground"><strong className="text-foreground">{currentRoundSavedCount}/{currentMatches.length}</strong> scores saved</div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { const panel = document.getElementById('cc-pa-panel'); if (panel instanceof HTMLDetailsElement) { panel.open = true; panel.scrollIntoView({ behavior:'smooth', block:'center' }); } }}><Mic className="w-4 h-4 mr-1" />PA</Button>
                  <Button size="sm" variant="outline" onClick={() => { const panel = document.getElementById('cc-player-controls'); if (panel instanceof HTMLDetailsElement) { panel.open = true; panel.scrollIntoView({ behavior:'smooth', block:'center' }); } }}><Users className="w-4 h-4 mr-1" />Players</Button>
                  {!['completed','archived'].includes(event.status) && (breakActive ? <Button size="sm" variant="destructive" disabled={!canManageEvent} onClick={timerRemaining > 0 ? endBreakEarly : advanceRound}>{timerRemaining > 0 ? `End Break → R${currentRound + 1}` : `Prepare R${currentRound + 1}`}</Button> : <>
                    {currentRoundComplete && currentRound >= plannedRounds && event.showcase_enabled && score.clubA !== score.clubB && !showcaseMatch && <Button size="sm" variant="outline" disabled={!canManageEvent} onClick={openOptionalShowcase}>Optional Showcase</Button>}
                    <Button size="sm" disabled={!canManageEvent || !currentRoundComplete} onClick={advanceRound}>{currentRoundComplete ? (scheduledBreakHere && currentRound < plannedRounds ? `Complete R${currentRound} → ${event.break_minutes}-min Break` : currentRound < plannedRounds ? `Complete Round ${currentRound}` : 'Finalise') : `${Math.max(0,currentMatches.length-currentRoundSavedCount)} score${Math.max(0,currentMatches.length-currentRoundSavedCount)===1?'':'s'} to save`}</Button>
                  </>)}
                </div>
              </div>
              {roundActionStatus && <div className={cn('mt-2 rounded-lg border px-3 py-2 text-xs font-semibold flex items-center gap-2', roundActionStatus.state === 'success' ? 'border-green-500/40 bg-green-500/10 text-green-500' : roundActionStatus.state === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-primary/30 bg-primary/5 text-primary')}>{roundActionStatus.state === 'working' ? <RefreshCw className="w-4 h-4 animate-spin" /> : roundActionStatus.state === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}<span>{roundActionStatus.text}</span></div>}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Live Event</p><p className="text-sm text-muted-foreground mt-1">Round {currentRound} of {plannedRounds}</p><p className="text-xl sm:text-2xl font-bold break-words mt-1">{event.club_a_name} {score.clubA} <span className="text-muted-foreground font-normal">–</span> {score.clubB} {event.club_b_name}</p></div><div className="flex gap-2 text-xs"><Badge variant="outline">{score.matchesWonA}W</Badge><Badge variant="outline">{score.draws}D</Badge><Badge variant="outline">{score.matchesWonB}W</Badge></div></div>{scheduledBreakHere && !breakActive && <div className="mt-3 rounded-lg border-2 border-red-500 bg-red-600 px-4 py-3 text-white shadow-lg"><div className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="text-sm font-black uppercase tracking-wide">Break next · {event.break_minutes} minutes</p><p className="mt-1 text-xs text-white/90">Scheduled immediately after Round {currentRound}. Round {currentRound + 1} will wait until the host ends the break.</p></div></div></div>}{breakActive && <div className="mt-3 rounded-lg border-2 border-red-400 bg-red-600 px-4 py-4 text-white shadow-lg"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-black uppercase tracking-widest">Break now</p><p className="mt-1 text-3xl font-black tabular-nums">{fmtTimer(timerRemaining)}</p><p className="mt-1 text-xs text-white/90">Round {currentRound + 1} is waiting. The host can shorten, extend or end the break.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={!canManageEvent || timerRemaining <= 60} onClick={() => adjustScheduledBreak(-5)}><Minus className="mr-1 h-4 w-4" />5 min</Button><Button size="sm" variant="secondary" disabled={!canManageEvent} onClick={() => adjustScheduledBreak(5)}><Plus className="mr-1 h-4 w-4" />5 min</Button><Button size="sm" variant="destructive" disabled={!canManageEvent} onClick={timerRemaining > 0 ? endBreakEarly : advanceRound}>{timerRemaining > 0 ? `End Break Early → Round ${currentRound + 1}` : `Prepare Round ${currentRound + 1}`}</Button></div></div></div>}</div>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Round at a Glance</p><p className="text-xs text-muted-foreground">On court, resting and up next — all in one place.</p></div><Badge variant="outline">R{currentRound}</Badge></div><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2">{currentDisplayMatches.map(m=><div key={`now-${m.id}`} className="rounded-lg border border-primary/20 bg-primary/5 p-3"><p className="text-xs font-bold text-primary">Court {m.court_number} · NOW</p><p className="text-xs font-semibold mt-2">{matchNames(m.club_a_names, 'club_a')}</p><p className="text-[10px] text-muted-foreground my-1">vs</p><p className="text-xs font-semibold">{matchNames(m.club_b_names, 'club_b')}</p></div>)}</div>{currentSittingOut.length>0&&<div><p className="text-xs font-semibold">Resting this round</p><div className="grid md:grid-cols-2 gap-2 mt-2"><div className="rounded-lg border border-border bg-secondary/30 p-3"><p className="text-xs font-bold text-primary">{event.club_a_name}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">{currentSittingOutA.map(p=><div key={p.id} className="rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium">{p.display_name}</div>)}</div></div><div className="rounded-lg border border-border bg-secondary/30 p-3"><p className="text-xs font-bold text-primary">{event.club_b_name}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">{currentSittingOutB.map(p=><div key={p.id} className="rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium">{p.display_name}</div>)}</div></div></div></div>}{nextDisplayMatches.length>0&&<div><p className="text-xs font-semibold">Up next · Round {currentRound+1}</p><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2 mt-2">{nextDisplayMatches.map(m=><div key={`next-${m.id}`} className="rounded-lg border border-border bg-secondary/40 p-3"><p className="text-xs font-bold">Court {m.court_number} · NEXT</p><p className="text-xs font-semibold mt-2">{matchNames(m.club_a_names, 'club_a')}</p><p className="text-[10px] text-muted-foreground my-1">vs</p><p className="text-xs font-semibold">{matchNames(m.club_b_names, 'club_b')}</p></div>)}</div></div>}</div>
            <div className="rounded-xl border border-primary/25 bg-card p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm font-semibold">{breakActive ? 'Break Timer' : 'Round Timer'}</p><p className="text-xs text-muted-foreground">{breakActive ? `${event.break_minutes}-minute scheduled break · Round ${currentRound + 1} waits` : `Round ${currentRound} of ${plannedRounds}`}</p></div>
                <Badge variant="outline">{['idle','ready'].includes(String(timerState?.phase || 'ready')) ? 'ready' : String(timerState?.phase || 'ready').replaceAll('_',' ')}</Badge>
              </div>
              <div className="text-center py-1"><p className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight">{fmtTimer(timerRemaining)}</p></div>
              {breakActive ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-xs font-semibold text-red-500">Host break controls</p><p className="text-[11px] text-muted-foreground">Shorten, extend or end the break to keep the event on time.</p></div><div className="flex flex-wrap items-center justify-center gap-2"><Button variant="outline" disabled={!canManageEvent || timerRemaining <= 60} onClick={() => adjustScheduledBreak(-5)}><Minus className="w-4 h-4 mr-1" />5 min</Button><Button variant="outline" disabled={!canManageEvent} onClick={() => adjustScheduledBreak(5)}><Plus className="w-4 h-4 mr-1" />5 min</Button><Button variant="destructive" disabled={!canManageEvent} onClick={timerRemaining > 0 ? endBreakEarly : advanceRound}>{timerRemaining > 0 ? `End Break Early` : `Prepare Round ${currentRound + 1}`}</Button></div></div> : <div className="rounded-lg bg-secondary/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-xs font-semibold">This round</p><p className="text-[11px] text-muted-foreground">Adjust before play or while paused.</p></div><div className="flex items-center justify-center gap-2"><Button variant="outline" size="icon" aria-label="Reduce this round by one minute" disabled={!canManageEvent || !!timerState?.running || preparedRoundMinutes <= 1} onClick={() => setRoundMinutes(preparedRoundMinutes - 1)}><Minus className="w-4 h-4" /></Button><p className="min-w-20 text-center text-2xl font-bold tabular-nums">{preparedRoundMinutes}:00</p><Button variant="outline" size="icon" aria-label="Add one minute to this round" disabled={!canManageEvent || !!timerState?.running || preparedRoundMinutes >= 60} onClick={() => setRoundMinutes(preparedRoundMinutes + 1)}><Plus className="w-4 h-4" /></Button></div></div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {timerRunning ? <Button data-testid="cc-timer-pause" className="min-h-12" disabled={!canManageEvent} onClick={pauseTimer}>Pause</Button> : timerPaused ? <Button data-testid="cc-timer-resume" className="min-h-12" disabled={!canManageEvent} onClick={resumeTimer}>Resume</Button> : playFinished ? <Button className="min-h-12" disabled={!canManageEvent} onClick={() => startPhase('changeover')}>Start Changeover</Button> : timerPhase === 'changeover' && timerRemaining <= 0 ? <Button className="min-h-12" disabled>Changeover complete</Button> : timerPhase === 'break' && timerRemaining <= 0 ? <Button className="min-h-12" disabled>Break complete</Button> : <Button data-testid="cc-timer-start-play" className="min-h-12" disabled={!canManageEvent || timerPhase === 'changeover' || timerPhase === 'break'} onClick={() => startPhase('play')}><Play className="w-4 h-4 mr-2" />Start Play</Button>}
                <Button variant="outline" className="min-h-12" disabled={!canManageEvent || !changeoverAvailable || playFinished} onClick={() => startPhase('changeover')}>{changeoverAvailable && !playFinished ? 'End Early → Changeover' : 'Changeover'}</Button>
                {breakActive ? <Button variant="destructive" className="min-h-12" disabled={!canManageEvent} onClick={timerRemaining > 0 ? endBreakEarly : advanceRound}>{timerRemaining > 0 ? `End Break → Round ${currentRound + 1}` : `Prepare Round ${currentRound + 1}`}</Button> : <Button variant="outline" className="min-h-12" disabled={!canManageEvent || !timerRunning || timerPhase !== 'play'} onClick={() => timerAction('add_minute')}>+1 minute</Button>}
                <details className="rounded-lg border border-border bg-secondary/20">
                  <summary className="cursor-pointer list-none min-h-12 px-4 flex items-center justify-center text-sm font-medium">Round options</summary>
                  <div className="border-t border-border p-3 space-y-3"><div><Label className="text-xs">Round label</Label><Input className="mt-1 bg-secondary" value={roundLabels[currentRound] || ''} onChange={e => setRoundLabels(r => ({ ...r, [currentRound]: e.target.value }))} onBlur={() => saveRoundLabel(currentRound)} disabled={!canManageEvent} placeholder={`Round ${currentRound}`} /></div><Button variant="outline" className="w-full" disabled={!canManageEvent} onClick={resetTimer}>Reset timer</Button></div>
                </details>
              </div>
              {!timerState && <p className="text-[11px] text-muted-foreground text-center">Start Play first. Changeover becomes available after play starts, so an accidental pre-round changeover cannot replace the match timer.</p>}
            </div>

            <div className={cn('rounded-xl border bg-card p-4 sm:p-5 space-y-3', currentRoundComplete ? 'border-primary/50' : 'border-border')}>
              <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Round {currentRound} Scores</p><p className={cn('text-xs', currentRoundComplete ? 'text-primary font-medium' : 'text-muted-foreground')}>{currentRoundComplete ? (scheduledBreakHere && !breakActive ? `Round ${currentRound} complete — ready to start the scheduled ${event.break_minutes}-minute break.` : breakActive ? `Round ${currentRound} saved — break in progress.` : `Round ${currentRound} complete — ready to advance.`) : 'Enter each court result as it comes in — you do not need to wait for the timer to finish.'}</p></div><Badge className={currentRoundComplete ? 'bg-primary/10 text-primary' : ''} variant={currentRoundComplete ? 'default' : 'outline'}>{currentRoundSavedCount}/{currentMatches.length} saved</Badge></div>
              <div className="grid md:grid-cols-2 gap-3">{currentMatches.sort((a,b)=>a.court_number-b.court_number).map(m => <ScoreCard key={`${m.id}-${m.revision}`} match={m} clubAName={event.club_a_name} clubBName={event.club_b_name} onSaved={refetchMatches} networkOnline={networkOnline} onQueue={queueOfflineScore} canScore={canScoreEvent} formatNames={matchNames} />)}</div>
              {roundActionStatus && <div className={cn('rounded-lg border px-3 py-2 text-xs font-semibold flex items-center gap-2', roundActionStatus.state === 'success' ? 'border-green-500/40 bg-green-500/10 text-green-500' : roundActionStatus.state === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-primary/30 bg-primary/5 text-primary')}>{roundActionStatus.state === 'working' ? <RefreshCw className="w-4 h-4 animate-spin" /> : roundActionStatus.state === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}<span>{roundActionStatus.text}</span></div>}
              {!['completed','archived'].includes(event.status) && (breakActive ? <Button className="w-full h-12" variant="destructive" disabled={!canManageEvent} onClick={timerRemaining > 0 ? endBreakEarly : advanceRound}>{timerRemaining > 0 ? `Break in progress · End Early & Prepare Round ${currentRound + 1}` : `Break complete · Prepare Round ${currentRound + 1}`}</Button> : currentRoundComplete && currentRound >= plannedRounds && event.showcase_enabled && score.clubA !== score.clubB && !showcaseMatch ? <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" className="h-12" disabled={!canManageEvent} onClick={openOptionalShowcase}><Trophy className="w-4 h-4 mr-2" />Play Optional Showcase Final</Button>
                <Button className="h-12" disabled={!canManageEvent} onClick={advanceRound}><CheckCircle2 className="w-4 h-4 mr-2" />Finalise {INTERCLUB_EVENT_LABEL}</Button>
              </div> : <Button className="w-full h-12" disabled={!canManageEvent || !currentRoundComplete} onClick={advanceRound}>{currentRoundComplete ? (scheduledBreakHere && currentRound < plannedRounds ? `Complete Round ${currentRound} & Start ${event.break_minutes}-min Break` : currentRound < plannedRounds ? `Complete Round ${currentRound} & Go to Round ${currentRound + 1}` : <><Trophy className="w-4 h-4 mr-2" />Finalise {INTERCLUB_EVENT_LABEL}</>) : `Save all ${currentMatches.length} results to complete Round ${currentRound}`}</Button>)}
            </div>

            <details id="cc-pa-panel" data-testid="cc-audio-pa-controller" className={cn('rounded-xl border overflow-hidden', paActive ? 'border-red-500/60 bg-red-500/5' : 'border-border bg-card')}>
              <summary className="cursor-pointer list-none p-4 sm:p-5 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">PA & Announcements</p><p className="text-xs text-muted-foreground">Open only when you need the microphone or an announcement.</p></div><div className="flex items-center gap-2"><Badge className={paActive ? 'bg-red-500/15 text-red-400' : audioReady ? 'bg-primary/10 text-primary' : ''} variant={paActive || audioReady ? 'default' : 'outline'}>{paActive ? 'PA LIVE' : audioReady ? 'AUDIO READY' : 'NOT TESTED'}</Badge><ChevronDown className="w-4 h-4 text-muted-foreground" /></div></summary>
              <div className="border-t border-border p-4 sm:p-5 space-y-3"><div className="flex justify-end"><Button variant="outline" size="sm" onClick={silenceAudio}><VolumeX className="w-4 h-4 mr-2" />Stop Audio</Button></div>
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2 items-end">
                <div><Label className="text-xs">Microphone</Label><Select value={selectedMicId} onValueChange={v => { setSelectedMicId(v); setPaError(''); setPaMicLabel(''); }} onOpenChange={open => { if (open && !paActive) refreshMicrophones(); }} disabled={paActive}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">System default microphone</SelectItem>{microphones.filter(mic => mic.deviceId && mic.deviceId !== 'default').map((mic, i) => <SelectItem key={mic.deviceId} value={mic.deviceId}>{mic.label || `Microphone ${i + 1}`}</SelectItem>)}</SelectContent></Select></div>
                <Button data-testid="cc-pa-toggle" className="h-11" variant={paActive ? 'destructive' : 'default'} disabled={!hasManagePermission || paStarting} onClick={paActive ? stopPA : startPA}>{paActive ? <><MicOff className="w-4 h-4 mr-2" />Stop PA</> : <><Mic className="w-4 h-4 mr-2" />{paStarting ? 'Starting PA…' : 'Start PA'}</>}</Button>
                <div className="rounded-lg bg-secondary/40 px-3 py-2"><Label className="text-xs">Live PA mic volume · {Math.round(paGain * 100)}%</Label><input aria-label="RallyHub live PA microphone level" type="range" min="0" max="1.5" step="0.05" value={paGain} onChange={e => setPaGain(Number(e.target.value))} className="mt-2 w-full" /></div>
                <div className="rounded-lg bg-secondary/40 px-3 py-2"><Label className="text-xs">RallyHub alerts & voice volume · {Math.round(hallVolume * 100)}%</Label><input aria-label="RallyHub live sound volume" type="range" min="0" max="1" step="0.05" value={hallVolume} onChange={e => setHallVolume(Number(e.target.value))} className="mt-2 w-full" /></div>
              </div>
              {paMicLabel && paActive && <p className="text-[11px] text-muted-foreground"><strong>Active microphone:</strong> {paMicLabel}{selectedMicId !== 'default' ? ' · external mic direct mode' : ''}</p>}
              {paActive && <div className="rounded-lg bg-secondary/40 px-3 py-2"><div className="flex items-center justify-between gap-3"><Label className="text-xs">Mic input</Label><span className="text-[10px] text-muted-foreground">Speak into the selected mic — this bar should move</span></div><div className="mt-2 h-2 rounded-full bg-background overflow-hidden border border-border"><div className="h-full bg-primary transition-[width] duration-100" style={{ width:`${Math.max(2, Math.round(paInputLevel * 100))}%` }} /></div></div>}
              {paError && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{paError}</div>}
              <div className="space-y-2"><p className="text-xs font-semibold">Voice announcements</p><div className="flex flex-col md:flex-row gap-2"><Button className="w-full md:w-36 md:shrink-0" variant="outline" disabled={!announcementDraft.trim() || paActive || announcementSpeaking} onClick={announceCustom}><Megaphone className="w-4 h-4 mr-2" />{announcementSpeaking ? 'Speaking…' : 'Announce'}</Button><Input type="text" name="rallyhub-announcement-text" autoComplete="off" inputMode="text" aria-autocomplete="none" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" value={announcementDraft} onChange={e => { setAnnouncementDraft(e.target.value); if (!announcementSpeaking) setAnnouncementStatus(''); }} onKeyDown={e => { if (e.key === 'Enter' && !announcementSpeaking) announceCustom(); }} placeholder="Announcement text…" className="bg-secondary" disabled={announcementSpeaking} /><Button variant="outline" className="w-full md:w-32 md:shrink-0" disabled={!lastAnnouncement || paActive || announcementSpeaking} onClick={() => speak(lastAnnouncement, { signal:'warning' })}>Repeat Last</Button></div>{announcementStatus && <p className="text-[11px] text-muted-foreground">{announcementStatus}</p>}</div></div>
            </details>

            <details id="cc-player-controls" className="rounded-xl border border-border bg-card overflow-hidden">
              <summary className="cursor-pointer list-none p-4 sm:p-5 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Player Controls</p><p className="text-xs text-muted-foreground">Injury, withdrawal, replacement or late arrival.</p></div><ChevronDown className="w-4 h-4 text-muted-foreground" /></summary>
              <div className="border-t border-border p-4 sm:p-5 space-y-4">
                <div className="rounded-lg bg-secondary/30 p-4 space-y-3">
                  <div><p className="text-sm font-semibold">Player Change</p><p className="text-xs text-muted-foreground">Choose how RallyHub should handle an injury or early departure. Completed results stay unchanged; only future unplayed fixtures can change.</p></div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div><Label className="text-xs">Player leaving</Label><Select value={replacement.outgoingId} onValueChange={v => { setPlayerControlStatus(null); setReplacement(r => ({ ...r, outgoingId:v, candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'' })); }} disabled={playerControlBusy}><SelectTrigger data-testid="cc-replacement-outgoing" className="mt-1 bg-secondary"><SelectValue placeholder="Choose player" /></SelectTrigger><SelectContent>{participants.filter(p => p.status === 'active' && ['club_a','club_b'].includes(p.side) && ((p.roster_role || 'rotation') === 'rotation' || p.reserve_activated)).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name} · {p.side === 'club_a' ? event.club_a_name : event.club_b_name}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label className="text-xs">Replacement route</Label><Select value={replacement.mode || 'new'} onValueChange={v => { setPlayerControlStatus(null); setReplacement(r => ({ ...r, mode:v, candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'' })); }} disabled={playerControlBusy || !replacement.outgoingId}><SelectTrigger data-testid="cc-replacement-mode" className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">New / registered replacement</SelectItem><SelectItem value="reserve">Activate team reserve</SelectItem><SelectItem value="cover">Existing rotation player covers</SelectItem></SelectContent></Select></div>
                    <div><Label className="text-xs">Reason</Label><Select value={replacement.status} onValueChange={v => setReplacement(r => ({ ...r, status:v }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="injured">Injured</SelectItem><SelectItem value="withdrawn">Withdrawn / unavailable</SelectItem></SelectContent></Select></div>
                    {(replacement.mode || 'new') === 'new' && <><div><Label className="text-xs">Registered available player</Label><Select value={replacement.candidateId || 'manual'} onValueChange={v => { setPlayerControlStatus(null); if (v === 'manual') { setReplacement(r => ({ ...r, candidateId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'' })); return; } const c = availableReplacementCandidates.find(x => x.id === v); if (c) setReplacement(r => ({ ...r, candidateId:c.id, incomingName:c.displayName || '', incomingGender:c.gender || '', incomingSourcePlayerId:c.sourcePlayerId || '', incomingParticipantType:c.participantType || '' })); }} disabled={playerControlBusy || !replacement.outgoingId}><SelectTrigger data-testid="cc-replacement-candidate" className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">Type a replacement manually</SelectItem>{availableReplacementCandidates.filter(c => c.side === participants.find(p=>p.id===replacement.outgoingId)?.side).map(c => <SelectItem key={c.id} value={c.id}>{c.displayName}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs">Replacement name</Label><Input data-testid="cc-replacement-name" value={replacement.incomingName} onChange={e => { setPlayerControlStatus(null); setReplacement(r => ({ ...r, candidateId:'', incomingName:e.target.value, incomingSourcePlayerId:'', incomingParticipantType:'' })); }} placeholder="Name" className="mt-1 bg-secondary" disabled={playerControlBusy} /></div><div><Label className="text-xs">Gender</Label><Select value={replacement.incomingGender || 'inherit'} onValueChange={v => setReplacement(r => ({ ...r, incomingGender:v === 'inherit' ? '' : v }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inherit">Inherit outgoing player</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div></>}
                    {replacement.mode === 'reserve' && <div className="lg:col-span-2"><Label className="text-xs">Team reserve</Label><Select value={replacement.reserveParticipantId} onValueChange={v => setReplacement(r => ({ ...r, reserveParticipantId:v }))} disabled={playerControlBusy || !replacement.outgoingId}><SelectTrigger data-testid="cc-team-reserve" className="mt-1 bg-secondary"><SelectValue placeholder="Choose reserve" /></SelectTrigger><SelectContent>{participants.filter(p => p.side === participants.find(x=>x.id===replacement.outgoingId)?.side && (p.roster_role || 'rotation') === 'reserve' && !p.reserve_activated && ['active','late'].includes(p.status) && Number(p.available_from_round || 1) <= currentRound).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name} · Reserve</SelectItem>)}</SelectContent></Select></div>}
                    {replacement.mode === 'cover' && <div className="lg:col-span-2"><Label className="text-xs">Existing rotation player to cover</Label><Select value={replacement.coverParticipantId} onValueChange={v => setReplacement(r => ({ ...r, coverParticipantId:v }))} disabled={playerControlBusy || !replacement.outgoingId}><SelectTrigger data-testid="cc-cover-player" className="mt-1 bg-secondary"><SelectValue placeholder="Choose cover player" /></SelectTrigger><SelectContent>{participants.filter(p => p.id !== replacement.outgoingId && p.side === participants.find(x=>x.id===replacement.outgoingId)?.side && ['active','late'].includes(p.status) && Number(p.available_from_round || 1) <= currentRound && ((p.roster_role || 'rotation') === 'rotation' || p.reserve_activated)).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select></div>}
                    <div><Label className="text-xs">Note</Label><Input value={replacement.reason} onChange={e => setReplacement(r => ({ ...r, reason:e.target.value }))} placeholder="Optional note" className="mt-1 bg-secondary" /></div>
                  </div>
                  {replacement.mode === 'reserve' && replacement.outgoingId && !participants.some(p => p.side === participants.find(x=>x.id===replacement.outgoingId)?.side && (p.roster_role || 'rotation') === 'reserve' && !p.reserve_activated && ['active','late'].includes(p.status) && Number(p.available_from_round || 1) <= currentRound) && <p className="text-[11px] text-muted-foreground">No unused team reserve is available from this round. Choose another route.</p>}
                  {replacement.mode === 'cover' && <p className="text-[11px] text-muted-foreground">RallyHub will use the chosen player wherever they are free. If they already have a fixture in the same round, a resting rotation player is inserted into the vacated slot so nobody can appear twice in one round.</p>}
                  <div className="flex flex-col sm:flex-row gap-2"><Button data-testid="cc-replace-player" className="w-full sm:w-auto" disabled={!canManageEvent || playerControlBusy || !replacement.outgoingId || ((replacement.mode || 'new') === 'new' && !replacement.incomingName.trim()) || (replacement.mode === 'reserve' && !replacement.reserveParticipantId) || (replacement.mode === 'cover' && !replacement.coverParticipantId)} onClick={applyReplacement}>{playerControlBusy ? 'Applying…' : replacement.mode === 'reserve' ? `Activate Reserve from Round ${currentRound}` : replacement.mode === 'cover' ? 'Use Cover & Rebalance' : `Replace from Round ${currentRound}`}</Button><Button variant="outline" className="w-full sm:w-auto" disabled={!canManageEvent || playerControlBusy || !replacement.outgoingId} onClick={withdrawWithoutReplacement}>Continue Short · No Replacement</Button></div>
                  {playerControlStatus && <div data-testid="cc-player-control-status" className={cn('rounded-lg border p-3 text-xs font-semibold', playerControlStatus.state === 'success' ? 'border-primary/30 bg-primary/10 text-primary' : playerControlStatus.state === 'error' ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-amber-400/30 bg-amber-500/10 text-amber-700')}>{playerControlStatus.text}</div>}
                </div>
                <div className="rounded-lg bg-secondary/30 p-4 space-y-3"><div><p className="text-sm font-semibold">Late Arrival</p><p className="text-xs text-muted-foreground">Set the first round a player is available. RallyHub will flag that the remaining draw may need review.</p></div><div className="grid sm:grid-cols-[1fr_120px_auto] gap-2"><Select value={lateArrival.participantId} onValueChange={v => setLateArrival(x => ({...x, participantId:v}))} disabled={playerControlBusy}><SelectTrigger className="bg-secondary"><SelectValue placeholder="Player" /></SelectTrigger><SelectContent>{participants.filter(p=>!['withdrawn','injured','replaced'].includes(p.status)).map(p=><SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select><Input type="number" min={currentRound||1} value={lateArrival.round} onChange={e=>setLateArrival(x=>({...x,round:e.target.value}))} className="bg-secondary" disabled={playerControlBusy} /><Button variant="outline" disabled={!canManageEvent || playerControlBusy || !lateArrival.participantId} onClick={applyLateArrival}>Set Round</Button></div></div>
              </div>
            </details>

            <details id="cc-court-time-controls" className="rounded-xl border border-border bg-card overflow-hidden">
              <summary className="cursor-pointer list-none p-4 sm:p-5 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Court & Time Changes</p><p className="text-xs text-muted-foreground">Use this if you lose or gain a court, or if less event time remains than planned.</p></div><ChevronDown className="w-4 h-4 text-muted-foreground" /></summary>
              <div className="border-t border-border p-4 sm:p-5">
                <div className="rounded-lg bg-secondary/30 p-4 space-y-3">
                  <div><p className="text-sm font-semibold">Preview the impact before changing anything</p><p className="text-xs text-muted-foreground">Enter the courts actually available now and the minutes remaining. RallyHub will show how many future matches still fit, which matches would move, and whether any would have to be marked Not Played. Completed results are never changed.</p></div>
                  <div className="grid sm:grid-cols-[140px_180px_auto] gap-2 items-end">
                    <div><Label className="text-xs">Courts available now</Label><Input data-testid="cc-courts-now" type="number" min="1" value={eventDayAdjust.courts} onChange={e=>{ setEventDayAdjustmentStatus(null); setEventDayAdjust(x=>({...x,courts:e.target.value})); }} placeholder={`${event.courts}`} className="mt-1 bg-secondary" disabled={eventDayAdjustmentBusy} /></div>
                    <div><Label className="text-xs">Minutes remaining</Label><Input data-testid="cc-minutes-remaining" type="number" min="1" value={eventDayAdjust.availableMinutes} onChange={e=>{ setEventDayAdjustmentStatus(null); setEventDayAdjust(x=>({...x,availableMinutes:e.target.value})); }} placeholder="e.g. 60" className="mt-1 bg-secondary" disabled={eventDayAdjustmentBusy} /></div>
                    <Button data-testid="cc-preview-schedule-change" variant="outline" disabled={!canManageEvent || eventDayAdjustmentBusy} onClick={proposeEventDayAdjustment}>Preview Impact</Button>
                  </div>
                  {eventDayProposal && <div className="rounded-lg bg-secondary/50 p-3 text-xs space-y-2"><p><strong>Proposed change:</strong> {eventDayProposal.unresolved - eventDayProposal.dropIds.length} future matches can still be played · {eventDayProposal.changes.length} move to a different round/court · {eventDayProposal.dropIds.length} would be marked Not Played.</p><p className="text-muted-foreground">Nothing changes until you press Confirm Changes. Completed results remain locked, and the existing Event Pack will be marked out of date.</p><div className="flex gap-2"><Button data-testid="cc-confirm-schedule-change" size="sm" disabled={!canManageEvent || eventDayAdjustmentBusy} onClick={confirmEventDayAdjustment}>{eventDayAdjustmentBusy ? 'Applying changes…' : 'Confirm Changes'}</Button><Button size="sm" variant="outline" disabled={eventDayAdjustmentBusy} onClick={()=>{ setEventDayProposal(null); setEventDayAdjustmentStatus({ state:'info', text:'Preview cancelled. No schedule changes were applied.' }); }}>Cancel</Button></div></div>}
                  {eventDayAdjustmentStatus && <div data-testid="cc-schedule-change-status" className={cn('rounded-lg border p-3 text-xs font-semibold', eventDayAdjustmentStatus.state === 'success' ? 'border-primary/30 bg-primary/10 text-primary' : eventDayAdjustmentStatus.state === 'error' ? 'border-destructive/30 bg-destructive/10 text-destructive' : eventDayAdjustmentStatus.state === 'working' ? 'border-amber-400/30 bg-amber-500/10 text-amber-700' : 'border-border bg-background/50 text-muted-foreground')}>{eventDayAdjustmentStatus.text}</div>}
                </div>
              </div>
            </details>
          </>}
        </div>
      )}

      {tab === 'simulator' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Gate 3 Test Simulator</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-2xl">Runs the real RallyHub Interclub scoring path against the dummy 16+16 roster so you can test 48 matches in seconds instead of entering every result by hand.</p>
              </div>
              <Badge className={isGate3TestEvent ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-400'}>{isGate3TestEvent ? 'Dummy event detected' : 'Dummy roster required'}</Badge>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {structuralChecks.map(([label, pass]) => (
              <div key={String(label)} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', pass ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive')}>{pass ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">!</span>}</div>
                <div><p className="text-xs font-semibold">{label}</p><p className="text-[10px] text-muted-foreground">{pass ? 'PASS' : 'Not ready'}</p></div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold">TEST MODE controls</p>
              <p className="text-xs text-muted-foreground mt-1">Use these only with the RallyHub dummy roster. The full-populate action uses one authorised server command so a host can inspect every populated screen without creating dozens of browser requests or risking Base44 rate-limit problems.</p>
            </div>
            <div className="rounded-xl border-2 border-primary/30 bg-primary/10 p-4"><p className="text-xs uppercase tracking-wider font-bold text-primary">First-time host rehearsal</p><p className="text-sm font-semibold mt-1">Populate the complete dummy event</p><p className="text-xs text-muted-foreground mt-1">Fills all normal scores, the Showcase Final and sample Player of Tournament votes, then opens Results. Afterward you can revisit Draw and Live Event to see those screens fully populated too.</p><Button data-testid="cc-populate-full" className="mt-3 w-full sm:w-auto min-h-11" disabled={!isGate3TestEvent || simulating || !matches.length} onClick={populateFullPracticeResult}><Trophy className="w-4 h-4 mr-2" />Populate Full Test Event</Button></div>
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
              <p><strong className="text-foreground">Tie — Use Metrics:</strong> forces equal Interclub points but a known cumulative point differential, so the no-final tiebreak calculation can be verified.</p>
              <p><strong className="text-foreground">Tie — Showcase Final:</strong> forces equal Interclub points and equal cumulative scoring, so RallyHub must require the Showcase/tiebreak final (or allow an overall draw if configured).</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Current simulated state</p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                <div className="rounded-lg bg-secondary p-3"><p className="text-xl font-bold">{score.completedMatches}</p><p className="text-[10px] text-muted-foreground">Results saved</p></div>
                <div className="rounded-lg bg-secondary p-3"><p className="text-xl font-bold">{unresolvedNormalCount}</p><p className="text-[10px] text-muted-foreground">Still unresolved</p></div>
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
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-4">{['completed','archived'].includes(event?.status) ? 'Final Result' : 'Current Result'}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">{event?.club_a_name} {overallScore.clubA}–{overallScore.clubB} {event?.club_b_name}</p>
                {['completed','archived'].includes(event?.status) && <div className="mt-3"><Badge className="bg-primary/10 text-primary">{event.showcase_resolved_winner === 'draw' ? 'Overall Draw' : `Winner: ${event.showcase_resolved_winner === 'club_b' ? event.club_b_name : event.club_a_name}`}</Badge>{event.showcase_resolved_winner !== 'draw' && <p className="text-xs text-muted-foreground mt-2">Runner-up: {event.showcase_resolved_winner === 'club_b' ? event.club_a_name : event.club_b_name}</p>}{hasManagePermission && <div className="mt-4">{event.status === 'completed' ? <Button variant="outline" onClick={archiveEvent}>Archive Interclub Challenge</Button> : <Button variant="outline" onClick={reopenEvent}>Reopen Archived Interclub Challenge</Button>}</div>}</div>}
                <div className="flex flex-wrap justify-center gap-2 mt-4"><Badge variant="outline">{score.completedMatches} normal results</Badge><Badge variant="outline">{score.matchesWonA} {event?.club_a_name} wins</Badge><Badge variant="outline">{score.draws} draws</Badge><Badge variant="outline">{score.matchesWonB} {event?.club_b_name} wins</Badge></div>
                <div className="grid grid-cols-3 gap-2 mt-4 max-w-lg mx-auto text-center"><div className="rounded-lg bg-secondary p-3"><p className="font-bold">{score.gamePointsA}</p><p className="text-[10px] text-muted-foreground">{event?.club_a_name} game points</p></div><div className="rounded-lg bg-secondary p-3"><p className="font-bold">{score.gamePointDifference >= 0 ? '+' : ''}{score.gamePointDifference}</p><p className="text-[10px] text-muted-foreground">A point differential</p></div><div className="rounded-lg bg-secondary p-3"><p className="font-bold">{score.gamePointsB}</p><p className="text-[10px] text-muted-foreground">{event?.club_b_name} game points</p></div></div>
                {showcaseMatch && ['completed'].includes(showcaseMatch.status) && <p className="text-xs text-primary mt-4">Showcase Final: {showcaseMatch.winner === 'club_a' ? event?.club_a_name : event?.club_b_name} +{event?.showcase_points} points</p>}
                {!['completed','archived'].includes(event?.status) && <p className="text-xs text-yellow-400 mt-4">Provisional — results are saved, but the event has not yet been finalised.</p>}
              </div>

              {resolvedNormalCount === normalMatches.length && !['completed','archived'].includes(event?.status) && score.clubA !== score.clubB && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold">Clear Winner Ready</p>
                  <p className="text-xs text-muted-foreground mt-1">All normal matches are complete and the Interclub points are not tied.</p>
                  <Button className="mt-4 w-full sm:w-auto" disabled={!canFinaliseEvent} onClick={() => finaliseEvent(score.clubA > score.clubB ? 'club_a' : 'club_b', 'none', 'Clear winner after normal Interclub Challenge matches.')}>{canFinaliseEvent ? 'Confirm Winner & Finalise' : 'Finalisation requires organiser permission'}</Button>
                </div>
              )}

              {resolvedNormalCount === normalMatches.length && !['completed','archived'].includes(event?.status) && score.clubA === score.clubB && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-yellow-400">Normal Interclub points are tied: {score.clubA}–{score.clubB}</p>
                    <p className="text-xs text-muted-foreground mt-1">Choose how to decide the event. Cumulative point differential is the default no-final metric.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <Button variant="outline" disabled={!canFinaliseEvent} onClick={resolveTieByMetrics}>Use Tiebreak Metrics</Button>
                    {event?.showcase_enabled && <Button disabled={!canManageEvent} onClick={() => document.getElementById('showcase-final-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Play Showcase Final</Button>}
                    {event?.allow_overall_draw && <Button variant="outline" disabled={!canFinaliseEvent} onClick={recordOverallDraw}>Record Overall Draw</Button>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Current point differential: {event?.club_a_name} {score.gamePointDifference >= 0 ? '+' : ''}{score.gamePointDifference}; {event?.club_b_name} {score.gamePointDifference <= 0 ? '+' : ''}{-score.gamePointDifference}.</p>
                </div>
              )}

              {canManageEvent && resolvedNormalCount === normalMatches.length && score.clubA === score.clubB && event?.showcase_enabled && !['completed','archived'].includes(event?.status) && (
                <div id="showcase-final-panel" className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div><p className="text-sm font-semibold">Showcase / Tiebreak Final</p><p className="text-xs text-muted-foreground mt-1">Nominate one male and one female player from each club. Winner receives {event.showcase_points} Interclub points.</p></div>
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
                      {['completed'].includes(showcaseMatch.status) && <Button className="w-full" disabled={!canFinaliseEvent} onClick={finaliseShowcase}>Apply {event.showcase_points} Points & Finalise {INTERCLUB_EVENT_LABEL}</Button>}
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
                      <span className="truncate text-right">{matchNames(m.club_a_names, 'club_a')}</span>
                      <span className="font-bold text-sm">{m.score_a ?? '–'}–{m.score_b ?? '–'}</span>
                      <span className="truncate">{matchNames(m.club_b_names, 'club_b')}</span>
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
      <InterclubSpondImportModal
        open={!!spondImportSide}
        onOpenChange={open => { if (!open) setSpondImportSide(''); }}
        tournament={tournament}
        event={event}
        side={spondImportSide}
        onImported={async result => {
          await sync();
          toast.success(`${result?.created || 0} Spond player${Number(result?.created || 0) === 1 ? '' : 's'} added to the Interclub roster`);
        }}
      />
      </div>
    </div>
  );
}
