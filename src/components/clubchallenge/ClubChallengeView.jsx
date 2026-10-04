import React, { useMemo, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Check, CheckCircle2, ChevronDown, Clock, Download, GripVertical, ImagePlus, ListChecks, Megaphone, Mic, MicOff, Minus, Play, Plus, RefreshCw, Search, ShieldCheck, Trash2, Trophy, Upload, UserPlus, Users, Volume2, VolumeX } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { getRallyHubPaLevel, listRallyHubMicrophones, playRallyHubSignal, primeRallyHubHallSpeech, setRallyHubPaGain, speakRallyHubHall, startRallyHubPA, stopAllRallyHubAudio, stopRallyHubPA, unlockRallyHubAudio } from '@/lib/rallyHubHallAudio.js';
import { INTERCLUB_EVENT_LABEL, INTERCLUB_INTERNAL_FORMAT, INTERCLUB_MODULE_NAME, interclubPublicUrl } from '@/lib/interclubBranding';
import { prepareEventLogoDraft, prepareEventLogoDraftFromUrl, renderPositionedEventLogo } from '@/lib/eventLogoEditor';
import InterclubSpondImportModal from '@/components/clubchallenge/InterclubSpondImportModal';
import InterclubPrintPack from '@/components/clubchallenge/InterclubPrintPack';
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

const RALLYHUB_LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

const TABS = [
  ['setup', 'Setup'],
  ['teams', 'Teams'],
  ['draw', 'Draw'],
  ['live', 'Live Event'],
  ['simulator', 'Simulator'],
  ['results', 'Results'],
];

const DEFAULT_SETUP = {
  clubAName: 'Host Club', clubALogo: '', clubAPrimary: '#2563eb', clubASecondary: '#facc15',
  clubBName: 'Opponent Club', clubBLogo: '', clubBPrimary: '#7f1d1d', clubBSecondary: '#f8fafc',
  venue: '', scheduledStartTime: '', courts: 4, plannedPlayersTotal: 32, availableMinutes: 180, playMinutes: 10, changeoverMinutes: 2,
  includeBreak: true, breakMinutes: 20, breakAfterRound: 6,
  matchType: 'timed', target: 11, winBy: 1, drawsAllowed: true,
  compositionMode: 'open', showcaseEnabled: true, showcasePoints: 5, potEnabled: true, juniorDisplayMode: false,
  spotPrizeEnabled: false, spotPrizeMode: 'all_players', spotPrizeCount: 2,
};

function number(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function isBase44RateLimitError(error) {
  const status = Number(error?.response?.status || error?.status || 0);
  const message = String(error?.response?.data?.error || error?.message || error || '').toLowerCase();
  return [429,502,503,504].includes(status)
    || message.includes('rate limit')
    || message.includes('burst')
    || message.includes('threshold')
    || message.includes('too many requests')
    || message.includes('temporarily unavailable')
    || message.includes('overload')
    || message.includes('server busy');
}
async function invokeBase44Safely(name, payload, { retries = 5 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      const response = await base44.functions.invoke(name, payload);
      if (attempt > 0 && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('rallyhub:base44-pressure-recovered',{detail:{name,attempts:attempt}}));
      return response;
    } catch (error) {
      if (!isBase44RateLimitError(error) || attempt >= retries) throw error;
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('rallyhub:base44-pressure',{detail:{name,attempt:attempt+1,status:Number(error?.response?.status||error?.status||0),message:String(error?.response?.data?.error||error?.message||'Base44 busy')}}));
      const retryAfterHeader = Number(error?.response?.headers?.['retry-after'] || 0);
      const exponential = Math.min(8000, 800 * (2 ** attempt));
      const jitter = Math.floor(Math.random() * 350);
      const waitMs = retryAfterHeader > 0 ? retryAfterHeader * 1000 + jitter : exponential + jitter;
      await new Promise(resolve => window.setTimeout(resolve, waitMs));
      attempt += 1;
    }
  }
}
function durationLabel(minutes) { const total = Math.max(0, Math.round(Number(minutes) || 0)); const h = Math.floor(total / 60); const m = total % 60; return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`; }
function calculateIndividualPointStats(matches=[], participants=[]) {
  const byId = new Map(participants.map(p => [p.id, p]));
  const stats = {};
  const ensure = (id, side) => stats[id] || (stats[id] = { participantId:id, side, gamesPlayed:0, pointsFor:0, pointsAgainst:0, wins:0, draws:0, losses:0, pointDiff:0 });
  const terminal = new Set(['completed','draw','retired','forfeit']);
  for (const match of matches) {
    if (match.is_showcase || !terminal.has(match.status)) continue;
    const scoreA=Number(match.score_a||0), scoreB=Number(match.score_b||0);
    for (const id of (match.club_a_participant_ids||[])) { const p=byId.get(id); if (!p || p.side!=='club_a') continue; const s=ensure(id,'club_a'); s.gamesPlayed++; s.pointsFor+=scoreA; s.pointsAgainst+=scoreB; if(match.winner==='club_a')s.wins++;else if(match.winner==='draw')s.draws++;else s.losses++; }
    for (const id of (match.club_b_participant_ids||[])) { const p=byId.get(id); if (!p || p.side!=='club_b') continue; const s=ensure(id,'club_b'); s.gamesPlayed++; s.pointsFor+=scoreB; s.pointsAgainst+=scoreA; if(match.winner==='club_b')s.wins++;else if(match.winner==='draw')s.draws++;else s.losses++; }
  }
  Object.values(stats).forEach(s => { s.pointDiff=s.pointsFor-s.pointsAgainst; });
  return stats;
}
function clockLabel(ms) { if (!Number.isFinite(ms)) return ''; return new Date(ms).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); }
function bookingStartMs(tournament, event) { const date=String(tournament?.start_date||'').slice(0,10), time=String(event?.scheduled_start_time||'').trim(); if(!date||!/^\d{2}:\d{2}$/.test(time)) return NaN; const ms=new Date(`${date}T${time}:00`).getTime(); return Number.isFinite(ms)?ms:NaN; }
function privacyName(name, junior) { if (!junior) return name || ''; const parts = String(name || '').trim().split(/\s+/).filter(Boolean); return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : (parts[0] || ''); }

function parseCsvPlayers(text) {
  const source = String(text || '').replace(/^\uFEFF/, '');
  const firstLine = source.split(/\r?\n/, 1)[0] || '';
  const candidates = [',',';','\t'];
  const delimiter = candidates.sort((a,b)=>(firstLine.split(b).length)-(firstLine.split(a).length))[0];
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i=0;i<source.length;i++) {
    const ch = source[i];
    if (ch === '"') {
      if (quoted && source[i+1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === delimiter && !quoted) {
      row.push(field.trim()); field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && source[i+1] === '\n') i++;
      row.push(field.trim()); field = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  if (!rows.length) return [];

  const normaliseHeader = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ');
  const headers = rows[0].map(normaliseHeader);
  const indexOfAny = names => {
    for (const name of names) {
      const idx = headers.indexOf(name);
      if (idx >= 0) return idx;
    }
    return -1;
  };
  const nameIdx = indexOfAny(['name','full name','player name','player','member name','participant','attendee']);
  const firstIdx = indexOfAny(['first name','firstname','given name','forename']);
  const lastIdx = indexOfAny(['last name','lastname','surname','family name']);
  const genderIdx = indexOfAny(['gender','sex']);
  const hasHeader = nameIdx >= 0 || firstIdx >= 0 || lastIdx >= 0 || genderIdx >= 0;
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const seen = new Set();
  return dataRows.map(cols => {
    let displayName = nameIdx >= 0 ? cols[nameIdx] : '';
    if (!displayName && (firstIdx >= 0 || lastIdx >= 0)) displayName = [firstIdx >= 0 ? cols[firstIdx] : '', lastIdx >= 0 ? cols[lastIdx] : ''].filter(Boolean).join(' ');
    if (!displayName && !hasHeader) displayName = cols[0] || '';
    displayName = String(displayName || '').trim().replace(/\s+/g,' ');
    const key = displayName.toLowerCase();
    if (!displayName || seen.has(key)) return null;
    seen.add(key);
    return { displayName, gender: genderIdx >= 0 ? String(cols[genderIdx] || '').trim() : '' };
  }).filter(Boolean);
}

function ClubBadge({ name, logo, primary, secondary }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 sm:px-3 py-2 bg-secondary/40 min-w-0 flex-1 sm:flex-none">
      {logo ? <img src={logo} alt={`${name || 'Club'} logo`} className="w-7 h-7 rounded-full object-contain bg-white p-0.5 shrink-0" /> : <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: primary || '#334155', color: secondary || '#fff' }}>{(name || '?').slice(0, 2).toUpperCase()}</span>}
      <span className="text-xs font-semibold text-foreground truncate min-w-0">{name}</span>
    </div>
  );
}

function HallPoweredByRallyHub() {
  return <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/70"><span>Powered by</span><img src={RALLYHUB_LOGO_URL} alt="RallyHub" className="h-4 w-auto object-contain opacity-80" /></div>;
}

function TeamBuilder({ eventId, participants, clubAName, clubBName, locked, busy, needsRosterSave=false, clubPlayerCandidatesBySide = { club_a:[], club_b:[] }, clubPlayerCandidatesLoading = false, onImportSpond, onImportCsv, onAddClubPlayer, onAddGuest, onRemovePlayer, onSave, onSetRosterRole, onSetPlayingCategory, onSetGender, onEditDisplayName, onDirtyChange }) {
  const active = participants.filter(p => !['replaced','withdrawn','injured'].includes(p.status));
  const signature = active.map(p => `${p.id}:${p.side}:${p.event_rank}:${p.roster_role || 'rotation'}:${p.playing_category || ''}:${p.gender || ''}:${p.display_name || ''}`).sort().join('|');
  const makeLanes = () => ({
    pool: active.filter(p => p.side === 'pool').sort((a,b)=>(a.event_rank||999)-(b.event_rank||999)).map(p => p.id),
    club_a: active.filter(p => p.side === 'club_a').sort((a,b)=>(a.event_rank||999)-(b.event_rank||999)).map(p => p.id),
    club_b: active.filter(p => p.side === 'club_b').sort((a,b)=>(a.event_rank||999)-(b.event_rank||999)).map(p => p.id),
  });
  const draftKey = eventId ? `rallyhub-interclub-team-draft:${eventId}` : '';
  const participantIdSignature = active.map(p => String(p.id)).sort().join('|');
  const readDraft = () => {
    if (!draftKey) return null;
    try {
      const draft = JSON.parse(sessionStorage.getItem(draftKey) || 'null');
      if (!draft || draft.participantIdSignature !== participantIdSignature) return null;
      const allDraftIds = [...(draft.lanes?.pool || []), ...(draft.lanes?.club_a || []), ...(draft.lanes?.club_b || [])].map(String).sort().join('|');
      if (allDraftIds !== participantIdSignature) return null;
      return draft;
    } catch { return null; }
  };
  const initialDraft = readDraft();
  const [lanes, setLanes] = useState(() => initialDraft?.lanes || makeLanes());
  const [nameA, setNameA] = useState(() => initialDraft?.nameA || clubAName || 'Team A');
  const [nameB, setNameB] = useState(() => initialDraft?.nameB || clubBName || 'Team B');
  const [dirty, setDirty] = useState(() => !!initialDraft);
  const [status, setStatus] = useState(() => initialDraft ? {state:'working',text:'Recovered your unsaved team allocation and ranking draft.'} : null);
  const [manualPool, setManualPool] = useState('');
  const [poolOpen, setPoolOpen] = useState(false);
  const [clubSearch, setClubSearch] = useState({ club_a:'', club_b:'' });
  const [guestDraft, setGuestDraft] = useState({ club_a:{name:'',gender:''}, club_b:{name:'',gender:''} });
  const [rosterAction, setRosterAction] = useState('');
  const saveInFlightRef = React.useRef(false);

  React.useEffect(() => {
    if (saveInFlightRef.current) return;
    const draft = readDraft();
    if (draft) {
      setLanes(draft.lanes);
      setNameA(draft.nameA || clubAName || 'Team A');
      setNameB(draft.nameB || clubBName || 'Team B');
      setDirty(true);
      setStatus({state:'working',text:'Recovered your unsaved team allocation and ranking draft.'});
    } else {
      setLanes(makeLanes());
      setNameA(clubAName || 'Team A');
      setNameB(clubBName || 'Team B');
      setDirty(false);
    }
  }, [signature, clubAName, clubBName, eventId]);

  React.useEffect(() => {
    onDirtyChange?.(dirty);
    if (!draftKey || !dirty) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({
        participantIdSignature,
        lanes,
        nameA,
        nameB,
        savedAt:new Date().toISOString(),
      }));
    } catch {}
  }, [dirty, lanes, nameA, nameB, participantIdSignature, draftKey, onDirtyChange]);

  React.useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const byId = new Map(active.map(p => [p.id, p]));
  const genderStats = ids => {
    let male = 0, female = 0, unset = 0;
    ids.forEach(pid => {
      const value = String(byId.get(pid)?.gender || '').trim().toLowerCase();
      if (value.startsWith('m')) male++;
      else if (value.startsWith('f')) female++;
      else unset++;
    });
    return { male, female, unset };
  };
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
    saveInFlightRef.current = true;
    setStatus({state:'working',text:'Saving teams and rankings…'});
    try {
      await onSave?.({ poolIds:lanes.pool, clubAIds:lanes.club_a, clubBIds:lanes.club_b, clubAName:nameA, clubBName:nameB });
      if (draftKey) { try { sessionStorage.removeItem(draftKey); } catch {} }
      setDirty(false);
      setStatus({state:'success',text:`Teams saved · current rosters ${lanes.club_a.length} in ${nameA} · ${lanes.club_b.length} in ${nameB}${lanes.pool.length ? ` · ${lanes.pool.length} still in Player Pool` : ''}. You can keep editing and save again as players change.`});
    } catch (e) {
      setStatus({state:'error',text:e?.message || 'Could not save teams and rankings.'});
    } finally {
      saveInFlightRef.current = false;
    }
  };
  const addPool = async () => {
    const name = manualPool.trim();
    if (!name || busy || locked || dirty) return;
    try { setRosterAction('pool-guest'); await onAddGuest?.('pool', name, ''); setManualPool(''); } catch {} finally { setRosterAction(''); }
  };
  const filteredClubPlayers = side => {
    const term = String(clubSearch[side] || '').trim().toLowerCase();
    if (!term) return [];
    return (clubPlayerCandidatesBySide[side] || []).filter(p => String(p.displayName || '').toLowerCase().includes(term)).slice(0, 8);
  };
  const addClubPlayer = async (side, candidate) => {
    if (!candidate?.id || locked || busy || dirty) return;
    try {
      setRosterAction(`club-${side}-${candidate.id}`);
      await onAddClubPlayer?.(side, candidate.id);
      setClubSearch(s => ({ ...s, [side]:'' }));
      setStatus({state:'success',text:`${candidate.displayName} added to ${side === 'club_a' ? nameA : nameB}.`});
    } catch (e) { setStatus({state:'error',text:e?.message || 'Could not add club player.'}); }
    finally { setRosterAction(''); }
  };
  const addGuest = async side => {
    const draft = guestDraft[side] || {name:'',gender:''};
    const name = String(draft.name || '').trim();
    if (!name || locked || busy || dirty) return;
    try {
      setRosterAction(`guest-${side}`);
      await onAddGuest?.(side, name, draft.gender || '');
      setGuestDraft(s => ({ ...s, [side]:{name:'',gender:''} }));
      setStatus({state:'success',text:`Guest ${name} added to ${side === 'club_a' ? nameA : nameB}.`});
    } catch (e) { setStatus({state:'error',text:e?.message || 'Could not add guest.'}); }
    finally { setRosterAction(''); }
  };
  const removePlayer = async p => {
    if (!p?.id || locked || busy || dirty) return;
    if (!window.confirm(`Remove ${p.display_name} from this pre-draw roster?`)) return;
    try {
      setRosterAction(`remove-${p.id}`);
      await onRemovePlayer?.(p.id);
      setStatus({state:'success',text:`${p.display_name} removed from the pre-draw roster.`});
    } catch (e) { setStatus({state:'error',text:e?.message || 'Could not remove player.'}); }
    finally { setRosterAction(''); }
  };
  const moveAllPool = to => {
    if (!lanes.pool.length || locked || busy) return;
    setLanes(prev => ({ ...prev, [to]:[...prev[to], ...prev.pool], pool:[] }));
    setDirty(true);
    setStatus({state:'working',text:`All unassigned players moved to ${to === 'club_a' ? nameA : nameB}. Save Teams & Rankings to confirm.`});
  };
  const lane = (id, title, ids, teamName, setTeamName) => (
    <div data-testid={`cc-team-lane-${id}`} className="rounded-xl border border-border bg-card p-2.5 sm:p-3 min-h-[18rem] transition-colors min-w-0 overflow-hidden">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          {id === 'pool' ? <><p className="text-sm font-semibold">Unassigned Player Pool</p><p className="text-[10px] text-muted-foreground">Use this only for players who are not yet assigned. Add or import players directly into their team panels where possible.</p></> :
            <><Label className="text-[10px]">Team name</Label><Input data-testid={`cc-team-name-${id}`} value={teamName} onChange={e => { setTeamName(e.target.value); setDirty(true); setStatus(null); }} disabled={locked || busy} className="mt-1 h-9 bg-secondary font-semibold" />
              <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5 space-y-2">
                <div className="flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5 text-primary"/><p className="text-[10px] font-bold uppercase tracking-wide">Roster controls</p></div>
                <div className="relative"><Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground"/><Input data-testid={`cc-club-player-search-${id}`} value={clubSearch[id] || ''} onChange={e => setClubSearch(s => ({...s,[id]:e.target.value}))} placeholder="Search RallyHub club players" className="h-9 pl-8 bg-background text-xs" disabled={locked || busy || dirty}/></div>
                {!!clubSearch[id]?.trim() && <div className="max-h-40 overflow-auto rounded-md border bg-background p-1 space-y-1">{clubPlayerCandidatesLoading ? <p className="p-2 text-[10px] text-muted-foreground">Loading club players…</p> : filteredClubPlayers(id).length ? filteredClubPlayers(id).map(c => <button data-testid={`cc-add-club-player-${id}-${c.id}`} type="button" key={c.id} disabled={locked || busy || dirty || !!rosterAction} onClick={() => addClubPlayer(id,c)} className="w-full flex items-center justify-between gap-2 rounded px-2 py-2 text-left text-xs hover:bg-secondary disabled:opacity-50"><span className="truncate">{c.displayName}</span><span className="shrink-0 text-[9px] text-muted-foreground">{c.relationshipType === 'member' ? 'Club member' : String(c.relationshipType || '').replaceAll('_',' ')}</span></button>) : <p className="p-2 text-[10px] text-muted-foreground">No available RallyHub club player matches that search.</p>}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_112px_auto] gap-1.5"><Input data-testid={`cc-guest-name-${id}`} value={guestDraft[id]?.name || ''} onChange={e => setGuestDraft(s => ({...s,[id]:{...(s[id]||{}),name:e.target.value}}))} onKeyDown={e => { if (e.key === 'Enter') addGuest(id); }} placeholder="Guest name" className="h-9 bg-background text-xs" disabled={locked || busy || dirty}/><Select value={guestDraft[id]?.gender || 'not_set'} onValueChange={v => setGuestDraft(s => ({...s,[id]:{...(s[id]||{}),gender:v === 'not_set' ? '' : v}}))} disabled={locked || busy || dirty}><SelectTrigger className="h-9 bg-background text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="not_set">Gender optional</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Non-binary">Non-binary</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select><Button data-testid={`cc-add-guest-${id}`} type="button" size="sm" className="h-9" disabled={locked || busy || dirty || !!rosterAction || !guestDraft[id]?.name?.trim()} onClick={() => addGuest(id)}>Add Guest</Button></div>
                <p className="text-[9px] text-muted-foreground">Club players keep their RallyHub identity. A typed guest is event-only and does not become a club member.</p>
              </div>
              <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-1.5 mt-2">
                <Button type="button" variant="outline" size="sm" className="h-8 px-2 text-[10px]" onClick={() => onImportSpond?.(id)} disabled={locked || busy || dirty}><Download className="w-3 h-3 mr-1" />Import Spond</Button>
                <label className={cn('h-8 rounded-md border border-input bg-background px-2 text-[10px] font-medium inline-flex items-center justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground', (locked || busy || dirty) && 'opacity-50 pointer-events-none')}>
                  <Upload className="w-3 h-3 mr-1" />Import CSV
                  <input type="file" accept=".csv,text/csv,.txt,text/plain" className="hidden" disabled={locked || busy || dirty} onChange={async e => { const file=e.target.files?.[0]; e.target.value=''; if (!file) return; setStatus({state:'working',text:`Importing ${file.name} into ${teamName}…`}); try { const result=await onImportCsv?.(id,file); setStatus({state:'success',text:`${result?.created || 0} player${Number(result?.created || 0)===1?'':'s'} imported into ${teamName}${result?.skipped ? ` · ${result.skipped} duplicate${result.skipped===1?'':'s'} skipped` : ''}.`}); } catch (err) { setStatus({state:'error',text:err?.message || 'Could not import CSV.'}); } }} />
                </label>
              </div>
              {lanes.pool.length > 0 && <button type="button" onClick={() => moveAllPool(id)} disabled={locked || busy || dirty} className="mt-1.5 text-[10px] text-primary hover:underline disabled:opacity-40">Move all {lanes.pool.length} unassigned players to this team</button>}
            </>}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline">{ids.length}</Badge>
          {id !== 'pool' && (() => { const g=genderStats(ids); return <div className="flex flex-wrap justify-end gap-1 text-[9px]"><span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 font-semibold text-blue-700">M {g.male}</span><span className="rounded-full bg-pink-500/10 px-1.5 py-0.5 font-semibold text-pink-700">F {g.female}</span>{g.unset>0&&<span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 font-semibold text-amber-700">Not set {g.unset}</span>}</div>; })()}
        </div>
      </div>
      {id === 'pool' && <div className="space-y-2 mb-3">
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => onImportSpond?.('pool')} disabled={locked || busy || dirty}><Download className="w-3.5 h-3.5 mr-1" />Import Unassigned Spond Players</Button>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><Input placeholder="Add player manually" value={manualPool} onChange={e=>setManualPool(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPool()} disabled={locked || busy || dirty} className="h-9 bg-secondary" /><Button type="button" size="sm" onClick={addPool} disabled={locked || busy || dirty || !manualPool.trim()}><Plus className="w-4 h-4" /></Button></div>
      </div>}
      <Droppable droppableId={id}>
        {(provided, snapshot) => <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn('space-y-1 max-h-[34rem] min-h-[8rem] overflow-y-auto overscroll-contain rounded-lg p-0.5 transition-colors', snapshot.isDraggingOver && 'bg-primary/5 ring-1 ring-primary/30')}
          style={{ scrollBehavior:'smooth' }}
        >
          {ids.map((pid, i) => {
            const p = byId.get(pid);
            if (!p) return null;
            return <Draggable key={p.id} draggableId={p.id} index={i} isDragDisabled={locked || busy}>
              {(dragProvided, dragSnapshot) => <div data-testid={`cc-team-player-${p.id}`} ref={dragProvided.innerRef} {...dragProvided.draggableProps} className={cn('grid grid-cols-[36px_32px_minmax(0,1fr)_auto] sm:flex sm:items-center gap-2 rounded-lg border border-border bg-secondary/60 p-2 min-h-11 min-w-0', dragSnapshot.isDragging && 'border-primary bg-primary/10 shadow-lg')}>
                <div data-testid={`cc-team-drag-${p.id}`} {...dragProvided.dragHandleProps} className="w-9 h-9 -ml-1 flex items-center justify-center rounded-md touch-none shrink-0 text-muted-foreground active:bg-primary/10"><GripVertical className="w-5 h-5" /></div>
                {id !== 'pool' && <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>}
                <span className="text-xs text-foreground min-w-0 sm:flex-1 flex items-center gap-1.5"><span className="truncate">{p.display_name}{p.participant_type === 'guest' ? <span className="ml-1 text-[9px] text-amber-700">· Guest</span> : null}</span>{id !== 'pool' && <button type="button" className="shrink-0 text-[9px] font-semibold text-primary underline underline-offset-2 disabled:opacity-40" disabled={locked || busy || dirty || !!rosterAction} onClick={async () => { const next = window.prompt('Event screen name', p.display_name || ''); if (next === null || !next.trim() || next.trim() === p.display_name) return; setStatus({state:'working',text:`Updating ${p.display_name} screen name…`}); try { await onEditDisplayName?.(p.id,next.trim()); setStatus({state:'success',text:`Screen name updated to ${next.trim()}.`}); } catch(e) { setStatus({state:'error',text:e?.message || 'Could not update screen name.'}); } }}>Edit</button>}</span>
                {id !== 'pool' && <Select value={p.roster_role || 'rotation'} onValueChange={async value => { setStatus({state:'working',text:`Updating ${p.display_name}…`}); try { await onSetRosterRole?.(p.id, value); setStatus({state:'success',text:`${p.display_name} set as ${value === 'reserve' ? 'Reserve' : 'Rotation'} player.`}); } catch (e) { setStatus({state:'error',text:e?.message || 'Could not update roster role.'}); } }} disabled={locked || busy || dirty}><SelectTrigger className="h-8 w-[102px] max-sm:col-start-3 max-sm:w-full bg-background text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rotation">Rotation</SelectItem><SelectItem value="reserve">Reserve</SelectItem></SelectContent></Select>}
                {id !== 'pool' && <Select value={p.playing_category || 'not_set'} onValueChange={async value => { if (value === 'not_set') return; setStatus({state:'working',text:`Updating ${p.display_name} category…`}); try { await onSetPlayingCategory?.(p.id, value); setStatus({state:'success',text:`${p.display_name} set as ${value === 'social' ? 'Social' : 'Improver'}.`}); } catch (e) { setStatus({state:'error',text:e?.message || 'Could not update playing category.'}); } }} disabled={locked || busy || dirty}><SelectTrigger className="h-8 w-[92px] max-sm:col-start-4 max-sm:w-full bg-background text-[10px]"><SelectValue placeholder="Level" /></SelectTrigger><SelectContent><SelectItem value="not_set" disabled>Level</SelectItem><SelectItem value="social">Social</SelectItem><SelectItem value="improver">Improver</SelectItem></SelectContent></Select>}
                {id !== 'pool' && <Select value={p.gender || 'not_set'} onValueChange={async value => { const nextGender = value === 'not_set' ? '' : value; setStatus({state:'working',text:`Updating ${p.display_name} gender…`}); try { await onSetGender?.(p.id,nextGender); setStatus({state:'success',text:`${p.display_name} gender ${nextGender ? `set to ${nextGender}` : 'cleared'}.`}); } catch(e) { setStatus({state:'error',text:e?.message || 'Could not update gender.'}); } }} disabled={locked || busy || dirty}><SelectTrigger className="h-8 w-[82px] max-sm:col-start-3 max-sm:row-start-3 max-sm:w-full bg-background text-[10px]"><SelectValue placeholder="Gender" /></SelectTrigger><SelectContent><SelectItem value="not_set">Not set</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Non-binary">Non-binary</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select>}
                <button data-testid={`cc-remove-player-${p.id}`} type="button" title="Remove from pre-draw roster" aria-label={`Remove ${p.display_name} from roster`} disabled={locked || busy || dirty || !!rosterAction} onClick={() => removePlayer(p)} className="w-8 h-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 shrink-0 max-sm:col-start-4 max-sm:row-start-3 max-sm:justify-self-end"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>}
            </Draggable>;
          })}
          {provided.placeholder}
          {!ids.length && <div className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">{id === 'pool' ? 'Import Spond attendees here' : 'Drag players here'}</div>}
        </div>}
      </Droppable>
    </div>
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
        <div><p className="text-sm font-semibold">Build the two teams</p><p className="text-xs text-muted-foreground">Registered players appear directly in their team. Set Social / Improver, drag players into the current ranking and mark any Reserves. Save the current rosters whenever you need to — the teams do not have to be complete or equal to save. The equality check applies only when you later generate the draw.</p></div>
        <div className="flex flex-wrap items-center gap-2 text-xs"><Badge variant="outline">{active.length} players</Badge><Badge variant="outline">A: {rotationA} rotation · {reserveA} reserve</Badge><Badge variant="outline">B: {rotationB} rotation · {reserveB} reserve</Badge><Badge className={balanced && lanes.pool.length===0 ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-700'}>{lanes.pool.length ? `${lanes.pool.length} unassigned` : balanced ? 'Rotation squads balanced' : `Rotation squads ${rotationA}–${rotationB} · draw not ready`}</Badge><Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={()=>setPoolOpen(v=>!v)}>{poolOpen ? 'Hide Unassigned Pool' : `Unassigned Pool${lanes.pool.length ? ` (${lanes.pool.length})` : ''}`}</Button></div>
      </div>
    </div>
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={cn('grid gap-3', poolOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-2')}>
        {poolOpen && lane('pool','Player Pool',lanes.pool)}
        {lane('club_a',nameA,lanes.club_a,nameA,setNameA)}
        {lane('club_b',nameB,lanes.club_b,nameB,setNameB)}
      </div>
    </DragDropContext>
    <div className="rounded-xl border border-border bg-card p-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 text-xs text-muted-foreground">
        {lanes.pool.length ? `${lanes.pool.length} player${lanes.pool.length===1?'':'s'} still need a team. You can still save this working configuration.` : balanced ? `Current squads are balanced: ${rotationA} rotation players per club${reserveA || reserveB ? ` · reserves ${reserveA}–${reserveB}` : ''}.` : `Current squads are ${rotationA}–${rotationB}. You can save now; only the draw remains locked until the Rotation squads are equal.`}
        {dirty && <span className="ml-1 font-semibold text-amber-600">Unsaved changes.</span>}
      </div>
      <Button data-testid="cc-save-team-builder" onClick={save} disabled={locked || busy || (!dirty && !needsRosterSave) || !nameA.trim() || !nameB.trim()} className="w-full sm:w-auto">{busy ? 'Saving…' : 'Save Current Rosters & Rankings'}</Button>
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
      const res = await invokeBase44Safely('saveClubChallengeScore', payload);
      if (res.data?.conflict) {
        toast.error('Score conflict: this result changed on another device. Refresh and review it.');
        onSaved?.(null);
      } else if (res.data?.error) {
        toast.error(res.data.error);
      } else {
        toast.success(saved ? 'Score corrected and audited' : 'Score saved');
        onSaved?.(res.data?.match || null);
      }
    } catch (e) {
      if (!navigator.onLine || /network|fetch|offline/i.test(e?.message || '')) { onQueue?.({ ...payload, queuedAt: new Date().toISOString(), clubAName, clubBName, matchLabel: `R${match.round_number} C${match.court_number}` }); toast.warning('Connection lost: result retained locally as UNSYNCHRONISED.'); }
      else {
        toast.error(e?.response?.data?.error || e?.message || 'Could not save score');
        if (e?.response?.status === 409) onSaved?.(null);
      }
    } finally { setSaving(false); }
  };
  return (
    <div data-testid={`cc-score-card-r${match.round_number}-c${match.court_number}`} className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between"><span className="text-xs font-bold">Court {match.court_number}</span><Badge variant="outline">R{match.round_number}</Badge></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
  const [setup, setSetup] = useState(() => ({ ...DEFAULT_SETUP, venue: tournament.location || '' }));
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [logoUploading, setLogoUploading] = useState('');
  const [logoDraft, setLogoDraft] = useState(null);
  const [simLog, setSimLog] = useState([]);
  const [showcaseSelection, setShowcaseSelection] = useState({ a1: '', a2: '', b1: '', b2: '' });
  const [showcaseFormat, setShowcaseFormat] = useState({ targetPoints: 11, winBy: 1 });
  const [showcaseScorerLink, setShowcaseScorerLink] = useState('');
  const [replacement, setReplacement] = useState({ mode:'new', outgoingId:'', candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'', reason:'', status:'withdrawn', temporaryGames:1 });
  const [playerSearch, setPlayerSearch] = useState('');
  const [displayNameEdit, setDisplayNameEdit] = useState({ participantId:'', displayName:'' });
  const [displayNameBusy, setDisplayNameBusy] = useState(false);
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
  const [audioMuted, setAudioMuted] = useState(() => localStorage.getItem('cc-audio-muted') === 'true');
  const [audioReady, setAudioReady] = useState(false);
  const [hallVoiceEngine, setHallVoiceEngine] = useState('not-tested');
  const [hallVoiceSource, setHallVoiceSource] = useState(() => localStorage.getItem('cc-hall-voice-source') === 'browser' ? 'browser' : 'amplified');
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
  const [announcementByKey, setAnnouncementByKey] = useState({});
  const [playerControlBusy, setPlayerControlBusy] = useState(false);
  const [playerControlStatus, setPlayerControlStatus] = useState(null);
  const [quickReserveOutgoing, setQuickReserveOutgoing] = useState({});
  const [hostAction, setHostAction] = useState('');
  const [roundActionStatus, setRoundActionStatus] = useState(null);
  const [hostScoreRound, setHostScoreRound] = useState(null);
  const hostBarAnchorRef = React.useRef(null);
  const hostBarInnerRef = React.useRef(null);
  const lastHostVisibilityRefreshRef = React.useRef(0);
  const hostVisibilityRefreshInFlightRef = React.useRef(false);
  const [hostBarPinned, setHostBarPinned] = useState(false);
  const [hostBarGeometry, setHostBarGeometry] = useState({ left: 0, width: 0, height: 0, top: 64 });
  const timerCommandRef = React.useRef(false);
  const sportingActionRef = React.useRef(false);
  const lastTimerAnnouncementRef = React.useRef(new Set());
  const timerSpeechArmedRef = React.useRef(false);
  const autoRoundTransitionRef = React.useRef(new Set());
  const announcedRoundStartsRef = React.useRef(new Set());
  const lastShowcaseSideChangeRef = React.useRef('');
  const lastShowcaseCompleteRef = React.useRef('');
  const wakeLockRef = React.useRef(null);
  const [roundLabels, setRoundLabels] = useState({});
  const [lastAnnouncement, setLastAnnouncement] = useState('');
  const [compressedTimer, setCompressedTimer] = useState({ running: false, step: -1, text: 'Not run' });
  const [displayMode, setDisplayMode] = useState(false);
  const [potDuration, setPotDuration] = useState('10');
  const [potTiebreakUi, setPotTiebreakUi] = useState({});
  const [spotPrizeBusy, setSpotPrizeBusy] = useState(false);
  const potAutoCloseRef = React.useRef('');
  const [publicLinks, setPublicLinks] = useState(null);
  const publicSnapshotRefreshTimerRef = React.useRef(null);
  const publicSnapshotRefreshInFlightRef = React.useRef(false);
  const [base44Pressure, setBase44Pressure] = useState({ count:0, lastAt:null, recoveredAt:null, lastFunction:'' });
  const [tournamentUpdateDraft, setTournamentUpdateDraft] = useState('');
  const [tournamentUpdateTemplateId, setTournamentUpdateTemplateId] = useState('clare_interclub_approved');
  const [tournamentUpdateExpiryMode, setTournamentUpdateExpiryMode] = useState('event_start');
  const [tournamentUpdateCustomMinutes, setTournamentUpdateCustomMinutes] = useState(60);
  const [tournamentUpdateInfo, setTournamentUpdateInfo] = useState(null);
  const [tournamentUpdateBusy, setTournamentUpdateBusy] = useState(false);
  const [tournamentUpdatePreviewOpen, setTournamentUpdatePreviewOpen] = useState(false);
  const [tournamentUpdatePreviewHtml, setTournamentUpdatePreviewHtml] = useState('');
  const [tournamentUpdatePreviewBusy, setTournamentUpdatePreviewBusy] = useState(false);
  const [tournamentUpdateTestEmail, setTournamentUpdateTestEmail] = useState('');
  const [tournamentUpdateTestBusy, setTournamentUpdateTestBusy] = useState(false);
  const [registrationLinks, setRegistrationLinks] = useState({ club_a:'', club_b:'' });
  const [registrationLinkBusy, setRegistrationLinkBusy] = useState('');
  const [teamManagerLinks, setTeamManagerLinks] = useState({ club_a:'', club_b:'' });
  const [teamManagerLinkBusy, setTeamManagerLinkBusy] = useState('');
  const [spondImportSide, setSpondImportSide] = useState('');
  const [teamsDirty, setTeamsDirty] = useState(false);
  const [printPackOpen, setPrintPackOpen] = useState(false);
  const [printSelection, setPrintSelection] = useState({ score:true, handoverScore:false, schedule:false, roster:false, briefing:false, final:false, includeVotingQr:false });
  const [printOrientation, setPrintOrientation] = useState('recommended');

  const { data: currentUser } = useQuery({ queryKey: ['cc-current-user'], queryFn: () => base44.auth.me() });
  const { data: venueOptions = [], refetch: refetchVenueOptions } = useQuery({
    queryKey: ['cc-venues', tournament.tenant_id || currentUser?.active_tenant_id, tournament.host_club_id || currentUser?.active_club_id],
    queryFn: async () => {
      const filters = { status:'active' };
      const tenantId = tournament.tenant_id || currentUser?.active_tenant_id;
      const clubId = tournament.host_club_id || currentUser?.active_club_id;
      if (tenantId) filters.tenant_id = tenantId;
      if (clubId) filters.club_id = clubId;
      return await base44.entities.Venue.filter(filters, 'name', 100);
    },
    enabled: isAdmin && !!(tournament.tenant_id || currentUser?.active_tenant_id),
  });
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
    refetchInterval: 30000,
    refetchOnWindowFocus:false,
  });
  const { data: adminEvent, refetch: refetchAdminEvent } = useQuery({
    queryKey: ['club-challenge-event', tournament.id],
    queryFn: async () => (await base44.entities.ClubChallengeEvent.filter({ tournament_id: tournament.id }))[0] || null,
    enabled: isAdmin,
    refetchInterval: 30000,
    refetchOnWindowFocus:false,
  });
  const event = isAdmin ? adminEvent : secureState?.event || null;
  const { data: adminParticipants = [], refetch: refetchAdminParticipants } = useQuery({
    queryKey: ['club-challenge-participants', event?.id],
    queryFn: () => event ? base44.entities.ClubChallengeParticipant.filter({ challenge_event_id: event.id }, 'event_rank', 100) : [],
    enabled: isAdmin && !!event?.id,
  });
  const { data: interclubRegistrations = [], refetch: refetchInterclubRegistrations, isFetching: interclubRegistrationsLoading } = useQuery({
    queryKey: ['club-challenge-registrations', event?.id],
    queryFn: () => event ? base44.entities.InterclubGuestRegistration.filter({ challenge_event_id:event.id, status:'active' }, '-registered_at', 200) : [],
    enabled: isAdmin && !!event?.id,
    refetchInterval: event && ['draft','draw_generated','draw_approved'].includes(event.status) ? 30000 : false,
    refetchOnWindowFocus: event && ['draft','draw_generated','draw_approved'].includes(event.status),
  });
  const participants = isAdmin ? adminParticipants : secureState?.participants || [];
  const { data: adminMatches = [], refetch: refetchAdminMatches } = useQuery({
    queryKey: ['club-challenge-matches', event?.id],
    queryFn: () => event ? base44.entities.ClubChallengeMatch.filter({ challenge_event_id: event.id }, 'round_number', 200) : [],
    enabled: isAdmin && !!event?.id,
    refetchInterval: isAdmin && showcaseScorerLink ? 8000 : isAdmin && ['in_progress','paused'].includes(event?.status) ? 30000 : false,
    refetchOnWindowFocus:false,
  });
  const matches = isAdmin ? adminMatches : secureState?.matches || [];
  const { data: adminSpotPrizeDraw = null, refetch: refetchAdminSpotPrizeDraw } = useQuery({
    queryKey: ['club-challenge-spot-prize', event?.id],
    queryFn: async () => event ? (await base44.entities.ClubChallengeSpotPrizeDraw.filter({ challenge_event_id:event.id }, '-updated_date', 5))[0] || null : null,
    enabled: isAdmin && !!event?.id,
    refetchInterval: false,
    refetchOnWindowFocus:false,
  });
  const spotPrizeDraw = isAdmin ? adminSpotPrizeDraw : secureState?.spotPrizeDraw || null;
  const refetchSpotPrizeDraw = isAdmin ? refetchAdminSpotPrizeDraw : refetchSecureState;
  const refetchEvent = isAdmin ? refetchAdminEvent : refetchSecureState;
  const refetchParticipants = isAdmin ? refetchAdminParticipants : refetchSecureState;
  const refetchMatches = isAdmin ? refetchAdminMatches : refetchSecureState;
  const { data: potVotes = [], refetch: refetchPotVotes } = useQuery({
    queryKey: ['club-challenge-votes', event?.id],
    queryFn: () => event ? base44.entities.ClubChallengeVote.filter({ challenge_event_id: event.id }, '-cast_at', 200) : [],
    enabled: isAdmin && !!event?.id && !!event?.pot_enabled,
    refetchInterval: isAdmin && event?.pot_status === 'open' ? 15000 : false,
    refetchOnWindowFocus:false,
  });

  React.useEffect(() => {
    if (!event) return;
    setSetup(s => ({
      ...s,
      clubAName: event.club_a_name || s.clubAName, clubALogo: event.club_a_logo_url || s.clubALogo, clubAPrimary: event.club_a_primary_colour || s.clubAPrimary, clubASecondary: event.club_a_secondary_colour || s.clubASecondary,
      clubBName: event.club_b_name || s.clubBName, clubBLogo: event.club_b_logo_url || s.clubBLogo, clubBPrimary: event.club_b_primary_colour || s.clubBPrimary, clubBSecondary: event.club_b_secondary_colour || s.clubBSecondary,
      courts: event.courts ?? s.courts, availableMinutes: event.available_minutes ?? s.availableMinutes, scheduledStartTime:event.scheduled_start_time || s.scheduledStartTime, playMinutes: event.play_minutes ?? s.playMinutes,
      changeoverMinutes: event.changeover_minutes ?? s.changeoverMinutes, includeBreak: event.include_break ?? s.includeBreak,
      breakMinutes: event.break_minutes ?? s.breakMinutes, breakAfterRound: event.break_after_round ?? s.breakAfterRound,
      matchType: event.normal_match_type || s.matchType, target: event.normal_target_points || s.target, winBy: event.normal_win_by || s.winBy,
      drawsAllowed: event.timed_draws_allowed !== false, compositionMode: event.composition_mode || s.compositionMode,
      showcaseEnabled: !!event.showcase_enabled, showcasePoints: event.showcase_points ?? s.showcasePoints, potEnabled: !!event.pot_enabled, juniorDisplayMode: !!event.junior_display_mode,
      spotPrizeEnabled: spotPrizeDraw?.enabled ?? s.spotPrizeEnabled,
      spotPrizeMode: spotPrizeDraw?.mode || s.spotPrizeMode,
      spotPrizeCount: spotPrizeDraw?.prize_count ?? s.spotPrizeCount,
    }));
  }, [event?.id, event?.club_a_name, event?.club_b_name, spotPrizeDraw?.id, spotPrizeDraw?.enabled, spotPrizeDraw?.mode, spotPrizeDraw?.prize_count]);

  React.useEffect(() => {
    if (event || !hostClub) return;
    setSetup(s => ({ ...s, clubAName: hostClub.name || s.clubAName, clubALogo: hostClub.logo_url || s.clubALogo }));
  }, [event, hostClub?.id]);

  React.useEffect(() => {
    if (!event) return;
    setShowcaseSelection({
      a1: event.showcase_club_a_player_1_id || event.showcase_club_a_male_id || '',
      a2: event.showcase_club_a_player_2_id || event.showcase_club_a_female_id || '',
      b1: event.showcase_club_b_player_1_id || event.showcase_club_b_male_id || '',
      b2: event.showcase_club_b_player_2_id || event.showcase_club_b_female_id || '',
    });
  }, [event?.id, event?.showcase_club_a_player_1_id, event?.showcase_club_a_player_2_id, event?.showcase_club_b_player_1_id, event?.showcase_club_b_player_2_id, event?.showcase_club_a_male_id, event?.showcase_club_a_female_id, event?.showcase_club_b_male_id, event?.showcase_club_b_female_id]);

  React.useEffect(() => {
    if (!event) return;
    try { setRoundLabels(event.round_labels_json ? JSON.parse(event.round_labels_json) : {}); }
    catch { setRoundLabels({}); }
  }, [event?.id, event?.round_labels_json]);

  const isSuperAdmin = currentUser?.role === 'admin';
  const accessRole = isAdmin ? 'admin' : secureState?.accessRole || '';
  const permissions = isAdmin
    ? { canManage:true, canScore:true, canCorrectScore:true, canFinalise:true, displayOnly:false }
    : (secureState?.permissions || { canManage:false, canScore:false, canCorrectScore:false, canFinalise:false, displayOnly:false });
  const hasManagePermission = !!permissions.canManage;
  const eventReadOnly = ['completed','archived'].includes(event?.status);
  const canManageEvent = !!permissions.canManage && !eventReadOnly;
  const canManagePot = !!permissions.canManage && !!event && event.status !== 'archived';
  const canManageSpotPrize = !!permissions.canManage && !!event && event.status !== 'archived';
  const effectivePotStatus = event?.pot_status || (event?.pot_enabled ? 'closed' : 'disabled');
  const spotPrizeWinners = useMemo(() => { try { const v = spotPrizeDraw?.winners_json ? JSON.parse(spotPrizeDraw.winners_json) : []; return Array.isArray(v) ? v : []; } catch { return []; } }, [spotPrizeDraw?.winners_json]);
  const spotPrizeMaxPulls = spotPrizeDraw?.enabled ? (spotPrizeDraw.mode === 'per_team' ? Number(spotPrizeDraw.prize_count || 1) * 2 : Number(spotPrizeDraw.prize_count || 1)) : 0;
  const canScoreEvent = !!permissions.canScore && !eventReadOnly;
  const canCorrectScoreEvent = !!permissions.canCorrectScore && !!event && event.status !== 'archived';
  const canFinaliseEvent = !!permissions.canFinalise && !eventReadOnly;
  const displayOnly = !!permissions.displayOnly;
  const { data: clubPlayerCandidatesBySide = { club_a:[], club_b:[] }, refetch: refetchClubPlayerCandidates, isFetching: clubPlayerCandidatesLoading } = useQuery({
    queryKey: ['club-challenge-club-player-candidates', event?.id],
    queryFn: async () => {
      const [aRes,bRes] = await Promise.all([
        invokeBase44Safely('manageClubChallengeParticipant', { eventId:event.id, action:'club_player_candidates', side:'club_a' }),
        invokeBase44Safely('manageClubChallengeParticipant', { eventId:event.id, action:'club_player_candidates', side:'club_b' }),
      ]);
      if (aRes.data?.error) throw new Error(aRes.data.error);
      if (bRes.data?.error) throw new Error(bRes.data.error);
      return { club_a:aRes.data?.candidates || [], club_b:bRes.data?.candidates || [] };
    },
    enabled: !!event?.id && canManageEvent && ['draft','draw_generated'].includes(event?.status),
    staleTime: 15000,
  });
  const { data: replacementCandidates = [], refetch: refetchReplacementCandidates } = useQuery({
    queryKey: ['club-challenge-replacement-candidates', event?.id],
    queryFn: async () => {
      const res = await invokeBase44Safely('manageClubChallengeParticipant', { eventId:event.id, action:'replacement_candidates' });
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
  const isTemporarySub = p => !!p && String(p.unique_identity_key || '').startsWith('temporary-sub-');
  const participantForMatchName = (name, side) => participants.find(x => x.side === side && x.display_name === name && !['withdrawn','injured'].includes(x.status));
  const matchNames = (names, side) => (names || []).map(name => {
    const p = participantForMatchName(name, side);
    if (!p) return name;
    if (isTemporarySub(p)) return `${name} · TEMP SUB`;
    if (Array.isArray(p.covering_for_participant_ids) && p.covering_for_participant_ids.length) return `${name} · Cover`;
    if ((p.roster_role || 'rotation') === 'reserve' && p.reserve_activated) return `${name} · Reserve`;
    return name;
  }).join(' & ');
  const playerTreatment = p => {
    if (!p) return null;
    if (isTemporarySub(p)) return { label:'TEMP SUB', className:'border-amber-500/70 bg-amber-500/15 text-amber-800 dark:text-amber-200' };
    if (p.status === 'injured') return { label:'INJURED', className:'border-red-500/70 bg-red-500/15 text-red-800 dark:text-red-200' };
    if (p.status === 'withdrawn') return { label:'WITHDRAWN / UNAVAILABLE', className:'border-slate-500/60 bg-slate-500/15 text-slate-800 dark:text-slate-200' };
    if (p.status === 'replaced') return { label:'REPLACED', className:'border-slate-400/60 bg-slate-400/10 text-slate-700 dark:text-slate-300' };
    if (p.replacement_for_participant_id) return { label:'REPLACEMENT', className:'border-emerald-500/70 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200' };
    if (Array.isArray(p.covering_for_participant_ids) && p.covering_for_participant_ids.length) return { label:'COVER', className:'border-violet-500/70 bg-violet-500/15 text-violet-800 dark:text-violet-200' };
    if ((p.roster_role || 'rotation') === 'reserve' && p.reserve_activated) return { label:'RESERVE IN', className:'border-sky-500/70 bg-sky-500/15 text-sky-800 dark:text-sky-200' };
    if (p.status === 'late') return { label:`LATE · R${Number(p.available_from_round || 1)}`, className:'border-yellow-500/70 bg-yellow-500/15 text-yellow-800 dark:text-yellow-200' };
    return null;
  };
  const hostPlayerChipClass = p => playerTreatment(p)?.className || '';
  const normalMatches = matches.filter(m => !m.is_showcase);
  const scheduleMaxRound = normalMatches.length ? Math.max(...normalMatches.map(m => Number(m.round_number || 0))) : 0;
  const plannedRounds = Number(event?.planned_rounds || 0) > 0 ? Number(event.planned_rounds) : scheduleMaxRound;
  const showcaseMatch = matches.find(m => m.is_showcase) || null;
  React.useEffect(() => {
    if (!showcaseMatch) return;
    setShowcaseFormat({
      targetPoints: Number(showcaseMatch.showcase_target_points || 11),
      winBy: Number(showcaseMatch.showcase_win_by || 1),
    });
  }, [showcaseMatch?.id, showcaseMatch?.showcase_target_points, showcaseMatch?.showcase_win_by]);
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
  const scoreViewRound = rounds.includes(Number(hostScoreRound)) ? Number(hostScoreRound) : Number(currentRound);
  const plannedHandoverParticipants = participants.filter(p => p.replacement_for_participant_id && Number(p.replacement_effective_round || p.available_from_round || 0) > 0);
  const hasPlannedHandoverCopy = plannedHandoverParticipants.length > 0;
  const firstPlannedHandoverRound = hasPlannedHandoverCopy ? Math.min(...plannedHandoverParticipants.map(p => Number(p.replacement_effective_round || p.available_from_round))) : null;
  const handoverScorePages = hasPlannedHandoverCopy ? Math.max(1, Math.ceil(Math.max(1, plannedRounds) / 12)) : 0;
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
    const resyncVisibleTimer = async () => {
      if (document.visibilityState !== 'visible' || hostVisibilityRefreshInFlightRef.current) return;
      setTimerNow(Date.now());
      if (Date.now() - lastHostVisibilityRefreshRef.current < 8000) return;
      hostVisibilityRefreshInFlightRef.current = true;
      lastHostVisibilityRefreshRef.current = Date.now();
      try {
        await refetchEvent?.();
        await refetchMatches?.();
      } finally {
        hostVisibilityRefreshInFlightRef.current = false;
      }
    };
    document.addEventListener('visibilitychange', resyncVisibleTimer);
    return () => document.removeEventListener('visibilitychange', resyncVisibleTimer);
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
  React.useEffect(() => { localStorage.setItem('cc-audio-muted', String(audioMuted)); }, [audioMuted]);
  React.useEffect(() => { localStorage.setItem('cc-hall-voice-source', hallVoiceSource); }, [hallVoiceSource]);
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
  React.useEffect(() => () => { if (logoDraft?.url?.startsWith('blob:')) URL.revokeObjectURL(logoDraft.url); }, [logoDraft?.url]);
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
  React.useEffect(() => {
    const pressure = event => setBase44Pressure(current => ({ count:current.count + 1, lastAt:new Date().toISOString(), recoveredAt:current.recoveredAt, lastFunction:event?.detail?.name || current.lastFunction }));
    const recovered = event => setBase44Pressure(current => ({ ...current, recoveredAt:new Date().toISOString(), lastFunction:event?.detail?.name || current.lastFunction }));
    window.addEventListener('rallyhub:base44-pressure', pressure);
    window.addEventListener('rallyhub:base44-pressure-recovered', recovered);
    return () => { window.removeEventListener('rallyhub:base44-pressure', pressure); window.removeEventListener('rallyhub:base44-pressure-recovered', recovered); };
  }, []);

  const refreshPublicSnapshotNow = React.useCallback(async () => {
    if (!event?.id || publicSnapshotRefreshInFlightRef.current) return false;
    if (sportingActionRef.current || timerCommandRef.current) return false;
    publicSnapshotRefreshInFlightRef.current = true;
    try {
      const res = await invokeBase44Safely('refreshClubChallengePublicSnapshot', { eventId:event.id }, { retries:3 });
      if (res.data?.error) throw new Error(res.data.error);
      return true;
    } catch {
      return false;
    } finally {
      publicSnapshotRefreshInFlightRef.current = false;
    }
  }, [event?.id]);
  const schedulePublicSnapshotRefresh = React.useCallback((delayMs = 2500) => {
    if (!event?.id) return;
    if (publicSnapshotRefreshTimerRef.current) window.clearTimeout(publicSnapshotRefreshTimerRef.current);
    publicSnapshotRefreshTimerRef.current = window.setTimeout(async () => {
      publicSnapshotRefreshTimerRef.current = null;
      if (sportingActionRef.current || timerCommandRef.current) { schedulePublicSnapshotRefresh(1800); return; }
      const ok = await refreshPublicSnapshotNow();
      if (!ok) schedulePublicSnapshotRefresh(8000);
    }, delayMs);
  }, [event?.id, refreshPublicSnapshotNow]);
  React.useEffect(() => () => { if (publicSnapshotRefreshTimerRef.current) window.clearTimeout(publicSnapshotRefreshTimerRef.current); }, []);
  React.useEffect(() => {
    if (!event?.id || !hasManagePermission) return;
    schedulePublicSnapshotRefresh(1400);
  }, [event?.id, event?.updated_date, hasManagePermission, schedulePublicSnapshotRefresh]);

  const sync = async () => {
    // Serialise authoritative refreshes instead of firing Base44 reads in the same burst.
    await refetchEvent();
    await refetchParticipants();
    await refetchMatches();
    if (event?.pot_enabled) await refetchPotVotes();
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    schedulePublicSnapshotRefresh();
  };
  const mergeSavedMatch = async savedMatch => {
    if (!savedMatch) { await refetchMatches(); return; }
    if (isAdmin) {
      queryClient.setQueryData(['club-challenge-matches', event?.id], old => (old || []).map(m => m.id === savedMatch.id ? savedMatch : m));
    } else {
      queryClient.setQueryData(['club-challenge-secure-state', tournament.id, currentUser?.id], old => old ? ({ ...old, matches:(old.matches || []).map(m => m.id === savedMatch.id ? savedMatch : m) }) : old);
    }
    if (event?.status === 'completed') await refetchEvent();
    schedulePublicSnapshotRefresh(1800);
  };
  const queueOfflineScore = item => setPendingScores(q => [...q.filter(x => x.matchId !== item.matchId), item]);
  const retryPendingScores = async () => {
    if (!networkOnline || !pendingScores.length) return;
    const remaining = [], conflicts = [];
    for (const item of pendingScores) {
      try {
        const res = await invokeBase44Safely('saveClubChallengeScore', { matchId:item.matchId, expectedRevision:item.expectedRevision, scoreA:item.scoreA, scoreB:item.scoreB });
        if (res.data?.conflict || res.data?.error) { remaining.push(item); conflicts.push({ ...item, reason:res.data?.error || 'Revision conflict' }); }
      } catch (e) { remaining.push(item); conflicts.push({ ...item, reason:e?.response?.data?.error || e?.message || 'Retry failed' }); }
    }
    setPendingScores(remaining); await refetchMatches();
    if (pendingScores.length !== remaining.length) schedulePublicSnapshotRefresh(1800);
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
        courts: number(setup.courts, 4), availableMinutes: number(setup.availableMinutes, 180), scheduledStartTime:setup.scheduledStartTime, playMinutes: number(setup.playMinutes, 10), changeoverMinutes: number(setup.changeoverMinutes, 2),
        includeBreak: setup.includeBreak, breakMinutes: number(setup.breakMinutes, 20), breakAfterRound: number(setup.breakAfterRound, 6),
        matchFormat: setup.matchType === 'timed' ? { type: 'timed', drawsAllowed: setup.drawsAllowed } : { type: 'points', target: number(setup.target, 11), winBy: number(setup.winBy, 1) },
        compositionMode: setup.compositionMode, showcaseEnabled: setup.showcaseEnabled, showcasePoints: number(setup.showcasePoints, 5), potEnabled: setup.potEnabled, juniorDisplayMode: setup.juniorDisplayMode,
      }
    });
    try {
      const venueName = String(setup.venue || '').trim();
      let matchedVenue = venueOptions.find(v => String(v.name || '').trim().toLowerCase() === venueName.toLowerCase()) || null;
      if (venueName && !matchedVenue) {
        if (!hostClubId) throw new Error('Choose a host club before adding a new venue.');
        matchedVenue = await base44.entities.Venue.create({ tenant_id: tenantId, club_id: hostClubId, name: venueName, status:'active' });
        await refetchVenueOptions();
      }
      let savedEvent = event;
      if (event) savedEvent = await base44.entities.ClubChallengeEvent.update(event.id, { ...data, status: event.status, draw_version: event.draw_version || 0, current_round: event.current_round || 0 });
      else savedEvent = await base44.entities.ClubChallengeEvent.create(data);
      if (savedEvent?.id) {
        const spotRes = await invokeBase44Safely('manageClubChallengeSpotPrizeDraw', { eventId:savedEvent.id, action:'configure', enabled:!!setup.spotPrizeEnabled, mode:setup.spotPrizeMode, prizeCount:number(setup.spotPrizeCount,2) });
        if (spotRes.data?.error) throw new Error(spotRes.data.error);
      }
      const tournamentUpdate = {
        tenant_id: tenantId,
        host_club_id: hostClubId,
        format: INTERCLUB_INTERNAL_FORMAT,
        inter_club: true,
        location: venueName,
        venue_id: matchedVenue?.id || undefined,
      };
      await base44.entities.Tournament.update(tournament.id, tournamentUpdate);
      toast.success(`${INTERCLUB_EVENT_LABEL} setup saved`);
      // Move immediately, then refresh authoritative datasets serially. Base44 burst
      // limits are more dangerous on venue Wi-Fi than the small latency saving from
      // parallel reads; this path is part of the Interclub event-readiness gate.
      setTab('teams');
      await refetchEvent();
      await refetchSpotPrizeDraw?.();
      await refetchParticipants();
      await refetchMatches();
      queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
      schedulePublicSnapshotRefresh(1200);
    } catch (e) { toast.error(e?.message || 'Could not save setup'); }
    setSaving(false);
  };

  const chooseClubLogo = async (side, file) => {
    if (!file) return;
    setLogoUploading(side);
    try {
      const draft = await prepareEventLogoDraft(file);
      setLogoDraft({ ...draft, side });
    } catch (e) { toast.error(e?.message || 'Could not prepare logo'); }
    finally { setLogoUploading(''); }
  };

  const adjustCurrentClubLogo = async side => {
    const logo = side === 'A' ? setup.clubALogo : setup.clubBLogo;
    if (!logo) return;
    setLogoUploading(side);
    try {
      const draft = await prepareEventLogoDraftFromUrl(logo, `${side === 'A' ? setup.clubAName : setup.clubBName}-logo`);
      setLogoDraft({ ...draft, side });
    } catch (e) { toast.error(e?.message || 'Could not open the current logo for editing'); }
    finally { setLogoUploading(''); }
  };

  const resetClubLogoDraft = () => setLogoDraft(draft => draft ? { ...draft, zoom:1, offsetX:0, offsetY:0 } : draft);
  const cancelClubLogoDraft = () => setLogoDraft(null);

  const applyClubLogoDraft = async () => {
    if (!logoDraft?.side) return;
    const side = logoDraft.side;
    setLogoUploading(side);
    try {
      const positionedFile = await renderPositionedEventLogo(logoDraft, `${side === 'A' ? setup.clubAName : setup.clubBName}-event-logo`);
      const uploadRes = await base44.functions.invoke('secureCreditAction', { action:'upload_image', purpose:'club_challenge_logo', tournamentId:tournament.id, file:positionedFile });
      if (uploadRes.data?.error) throw new Error(uploadRes.data.error);
      const fileUrl = uploadRes.data?.file_url;
      if (!fileUrl) throw new Error('No file URL returned');
      const setupKey = side === 'A' ? 'clubALogo' : 'clubBLogo';
      const eventKey = side === 'A' ? 'club_a_logo_url' : 'club_b_logo_url';
      setSetup(s => ({ ...s, [setupKey]:fileUrl }));
      if (event?.id && isAdmin) {
        await base44.entities.ClubChallengeEvent.update(event.id, { [eventKey]:fileUrl, event_pack_stale:true });
        await refetchEvent();
      }
      setLogoDraft(null);
      toast.success(`${side === 'A' ? setup.clubAName : setup.clubBName} logo positioned and saved${event?.id ? ' to the event' : ''}.`);
    } catch (e) { toast.error(e?.message || 'Could not save positioned logo'); }
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
      // The command returns only a count, so the new roster still has to be read back.
      // Refetch participants first and render it immediately; fixture/event refreshes
      // are background reconciliation and must not block the roster appearing.
      await refetchParticipants();
      Promise.all([refetchMatches(), refetchEvent()]);
      queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not load practice players'); }
    setSaving(false);
  };

  const addClubPlayer = async (side, playerId) => {
    if (!event || !playerId || !canManageEvent) throw new Error('Event manager permission required.');
    try {
      const res = await invokeBase44Safely('manageClubChallengeParticipant', { eventId:event.id, action:'add_club_player', side, playerId });
      if (res.data?.error) throw new Error(res.data.error);
      await sync();
      await refetchClubPlayerCandidates();
      toast.success(`${res.data?.participant?.display_name || 'Club player'} added to the roster.`);
      return res.data;
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not add club player';
      toast.error(message);
      throw new Error(message);
    }
  };

  const addGuest = async (side, displayName, gender = '') => {
    const name = String(displayName || '').trim();
    if (!event || !name || !canManageEvent) throw new Error('Guest name and event manager permission are required.');
    try {
      const res = await invokeBase44Safely('manageClubChallengeParticipant', { eventId:event.id, action:'add_guest', side, displayName:name, incomingGender:gender });
      if (res.data?.error) throw new Error(res.data.error);
      await sync();
      await refetchClubPlayerCandidates();
      toast.success(`${name} added as an event guest.`);
      return res.data;
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not add guest';
      toast.error(message);
      throw new Error(message);
    }
  };

  const removePreDrawPlayer = async participantId => {
    if (!event || !participantId || !canManageEvent) throw new Error('Event manager permission required.');
    try {
      const res = await invokeBase44Safely('manageClubChallengeParticipant', { eventId:event.id, action:'remove_pre_draw', participantId });
      if (res.data?.error) throw new Error(res.data.error);
      await sync();
      await refetchClubPlayerCandidates();
      toast.success(`${res.data?.removedName || 'Player'} removed from the pre-draw roster.`);
      return res.data;
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not remove player';
      toast.error(message);
      throw new Error(message);
    }
  };

  const importCsv = async (side, file) => {
    if (!event || !file || !canManageEvent) throw new Error('Event manager permission required.');
    const text = await file.text();
    const players = parseCsvPlayers(text);
    if (!players.length) throw new Error('No player names could be read from that CSV. Use a Name column, or First Name and Last Name columns.');
    try {
      const res = await invokeBase44Safely('manageClubChallengeParticipant', {
        eventId:event.id,
        action:'bulk_add_manual',
        side,
        players,
      });
      if (res.data?.error) throw new Error(res.data.error);
      await sync();
      toast.success(`${res.data?.created || 0} CSV player${Number(res.data?.created || 0)===1?'':'s'} imported directly into ${side === 'club_a' ? event.club_a_name : event.club_b_name}.`);
      return res.data;
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not import CSV';
      toast.error(message);
      throw new Error(message);
    }
  };

  const organiseTeams = async ({ poolIds, clubAIds, clubBIds, clubAName, clubBName }) => {
    if (!event || !canManageEvent || sportingActionRef.current) return;
    sportingActionRef.current = true;
    setSaving(true);
    flushSync(() => setHostAction('Saving teams and rankings… one command sent'));
    try {
      const res = await invokeBase44Safely('manageClubChallengeParticipant', {
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
    const res = await invokeBase44Safely('manageClubChallengeParticipant', { eventId:event.id, action:'set_roster_role', participantId, rosterRole });
    if (res.data?.error) throw new Error(res.data.error);
    await sync();
    toast.success(`${res.data.participantName} set as ${res.data.rosterRole === 'reserve' ? 'Reserve' : 'Rotation'} player.`);
    return res.data;
  };

  const setPlayingCategory = async (participantId, playingCategory) => {
    if (!event || !canManageEvent) throw new Error('Event manager permission required.');
    const res = await invokeBase44Safely('manageClubChallengeParticipant', { eventId:event.id, action:'set_playing_category', participantId, playingCategory });
    if (res.data?.error) throw new Error(res.data.error);
    await sync();
    toast.success(`${res.data.participantName} set as ${res.data.playingCategory === 'social' ? 'Social' : 'Improver'}.`);
    return res.data;
  };

  const setParticipantGender = async (participantId, gender) => {
    if (!event || !canManageEvent) throw new Error('Event manager permission required.');
    const res = await invokeBase44Safely('manageClubChallengeParticipant', { eventId:event.id, action:'set_gender', participantId, gender });
    if (res.data?.error) throw new Error(res.data.error);
    await sync();
    toast.success(`${res.data.participantName} gender ${res.data.gender ? `set to ${res.data.gender}` : 'cleared'}.`);
    return res.data;
  };

  const editParticipantDisplayName = async (participantId, displayName) => {
    if (!event || !canManageEvent) throw new Error('Event manager permission required.');
    const res = await invokeBase44Safely('manageClubChallengeParticipant', { eventId:event.id, action:'rename_display', participantId, displayName });
    if (res.data?.error) throw new Error(res.data.error);
    await sync();
    toast.success(`${res.data.oldName || 'Player'} will display as ${res.data.participantName} for this event.`);
    return res.data;
  };

  const rostersSaved = !!event?.club_a_roster_saved_at && !!event?.club_b_roster_saved_at;
  const calculateFormat = () => {
    if (teamsDirty || !rostersSaved || poolPlayers.length || !aRotationPlayers.length || !bRotationPlayers.length || aRotationPlayers.length !== bRotationPlayers.length) return null;
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
    if (teamsDirty) { toast.error('Save the current roster and ranking changes before generating the draw.'); return; }
    if (!rostersSaved) { toast.error('Save both teams in their current form before generating the draw. You can keep editing and resaving until the rosters are final.'); return; }
    if (aRotationPlayers.length !== bRotationPlayers.length || aRotationPlayers.length < 4) { toast.error('For this draw, both clubs must have equal Rotation squads of at least 4. Reserve numbers may differ.'); return; }
    sportingActionRef.current = true;
    flushSync(() => { setSaving(true); setHostAction('Generating draw and fairness report… one command sent'); });
    await new Promise(resolve => window.setTimeout(resolve, 0));
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
      const res = await invokeBase44Safely('manageClubChallengeEvent', { eventId:event.id, action:'approve_draw' });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success('Draw approved and locked');
      await sync();
    } catch (e) { await refetchEvent(); toast.error(e?.message || 'Could not approve draw'); }
    finally { sportingActionRef.current = false; setHostAction(''); }
  };

  const unlockDraw = async () => {
    if (event?.status !== 'draw_approved' || sportingActionRef.current) return;
    if (!window.confirm('Unlock the approved draw for changes? The current print pack will be marked out of date until you approve the draw again.')) return;
    sportingActionRef.current = true; setHostAction('Unlocking draw for changes… command sent');
    try {
      const res = await invokeBase44Safely('manageClubChallengeEvent', { eventId:event.id, action:'unlock_draw' });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success('Draw unlocked. You can edit teams or rankings, then regenerate and approve again.');
      await sync();
      setTab('teams');
    } catch (e) {
      await refetchEvent();
      toast.error(e?.response?.data?.error || e?.message || 'Could not unlock draw');
    } finally {
      sportingActionRef.current = false;
      setHostAction('');
    }
  };

  const startEvent = async () => {
    if (event?.status !== 'draw_approved' || sportingActionRef.current) return;
    sportingActionRef.current = true; setHostAction(`Starting ${INTERCLUB_EVENT_LABEL}… command sent`);
    try {
      await unlockHallAudio();
      const res = await invokeBase44Safely('manageClubChallengeEvent', { eventId:event.id, action:'start' });
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
      const res = await invokeBase44Safely('updateClubChallengeTimer', { eventId: event.id, action, phase, expectedRevision: Number(event.timer_revision || 0), ...extra });
      if (res.data?.conflict) { toast.error('Timer changed on another device. RallyHub has refreshed the authoritative timer.'); await refetchEvent(); return false; }
      if (res.data?.error) { toast.error(res.data.error); return false; }
      const authoritativeEvent = res.data?.event || null;
      if (authoritativeEvent) queryClient.setQueryData(['club-challenge-event', tournament.id], authoritativeEvent);
      else {
        // Timer commands are already revision-protected on the server. Reflect the
        // accepted command locally immediately instead of making the visible clock
        // depend on a second network round-trip; the normal polling/refetch remains
        // the authority and will reconcile any difference.
        const current = timerState || {};
        const seconds = phase === 'break' ? Number(event.break_minutes || 20) * 60 : phase === 'changeover' ? Number(event.changeover_minutes || 2) * 60 : (Number(current.remaining_seconds || 0) > 0 && ['ready','play'].includes(current.phase) && !current.running ? Number(current.remaining_seconds) : Number(event.play_minutes || 10) * 60);
        // Keep the exact full duration visible for the first render. The one-second
        // ticker will begin decrementing on the next tick, rather than making a newly
        // started 20-minute break appear immediately as 19:59/19:58 on slower phones.
        const optimistic = action === 'start' ? { phase:phase || 'play', running:true, remaining_seconds:seconds, started_at:new Date().toISOString(), round:Number(event.current_round || 1), round_started:phase === 'play' ? true : !!current.round_started } : current;
        queryClient.setQueryData(['club-challenge-event', tournament.id], old => old ? ({ ...old, timer_state_json:JSON.stringify(optimistic), timer_revision:Number(old.timer_revision || event.timer_revision || 0) + 1 }) : old);
        refetchEvent();
      }
      schedulePublicSnapshotRefresh(1800);
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
        const testPhrase = 'Sound check. RallyHub Interclub ready.';
        // Start generating the hall-grade voice immediately while the cue plays.
        // If the provider is unavailable, speakRallyHubHall automatically falls
        // back to the device/browser voice so Test Sound still works.
        const prepared = hallVoiceSource === 'amplified'
          ? primeRallyHubHallSpeech(testPhrase, { eventId:event?.id || '' })
          : Promise.resolve(true);
        playRallyHubSignal(ctx, 'start', hallVolume);
        window.setTimeout(async () => {
          await prepared;
          await speakRallyHubHall(testPhrase, {
            volume:hallVolume,
            eventId:event?.id || '',
            voiceMode,
            voices,
            engineMode:hallVoiceSource,
            onEngine:setHallVoiceEngine,
          });
        }, 450);

        // Once the host deliberately runs the sound check, warm the short phrases
        // that must fire instantly during play. This does not alter the event clock.
        const commonHallPhrases = [
          '5', '4', '3', '2', '1',
          'Please hand in your scores.',
          'Changeover finished. Next round ready.',
          'Event paused.',
          'Break resumed.',
          'Changeover resumed.',
          'Match complete',
          'Change ends',
        ];
        if (hallVoiceSource === 'amplified') void primeRallyHubHallSpeech(commonHallPhrases, { eventId:event?.id || '' });
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
    setAudioMuted(true);
    toast.info('RallyHub event audio is OFF.');
  };
  const enableAudio = async () => {
    setAudioMuted(false);
    await unlockHallAudio();
    toast.success('RallyHub event audio is ON.');
  };
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke('announcementSettings', { action:'resolved', module:'interclub', tenantId:event?.tenant_id || undefined });
        if (!cancelled && res.data?.byKey) setAnnouncementByKey(res.data.byKey);
      } catch { /* current RallyHub wording remains the safe fallback */ }
    })();
    return () => { cancelled = true; };
  }, [event?.tenant_id]);

  const announcementText = (key, fallback, variables = {}) => {
    const item = announcementByKey?.[key];
    if (item?.enabled === false) return '';
    const source = item?.text || fallback || '';
    return String(source).replace(/\{([a-z0-9_]+)\}/gi, (_, variable) => variables[variable] === undefined || variables[variable] === null ? `{${variable}}` : String(variables[variable]));
  };

  const speak = (text, { signal = null } = {}) => {
    if (audioMuted) return false;
    const ctx = window.__rallyhubAudioContext || null;
    if (signal) playRallyHubSignal(ctx, signal, hallVolume);
    if (!text || paActive || voiceMode === 'off') return !!signal;
    void speakRallyHubHall(text, {
      volume:hallVolume,
      eventId:event?.id || '',
      voiceMode,
      voices,
      engineMode:hallVoiceSource,
      onEngine:setHallVoiceEngine,
    }).then(spoken => {
      if (spoken) setLastAnnouncement(text);
    });
    return true;
  };
  React.useEffect(() => {
    const changedAt = showcaseMatch?.side_change_at || '';
    if (!changedAt || lastShowcaseSideChangeRef.current === changedAt) return;
    lastShowcaseSideChangeRef.current = changedAt;
    if (Date.now() - new Date(changedAt).getTime() > 30000) return;
    speak(announcementText('side_change', 'Change ends'), { signal:'warning' });
  }, [showcaseMatch?.side_change_at]);

  React.useEffect(() => {
    if (showcaseMatch?.status !== 'completed') return;
    const completedAt = showcaseMatch.scored_at || (showcaseMatch.id + ':' + showcaseMatch.revision);
    if (!completedAt || lastShowcaseCompleteRef.current === completedAt) return;
    lastShowcaseCompleteRef.current = completedAt;
    if (showcaseMatch.scored_at && Date.now() - new Date(showcaseMatch.scored_at).getTime() > 30000) return;
    speak(announcementText('match_complete', 'Match complete'), { signal:'end' });
  }, [showcaseMatch?.status, showcaseMatch?.scored_at, showcaseMatch?.revision]);
  const announceCustom = async () => {
    const text = announcementDraft.trim();
    if (!text || announcementSpeaking) return;
    if (paActive) { toast.info('Turn off Live PA before playing a RallyHub voice announcement.'); return; }
    setAnnouncementSpeaking(true);
    setAnnouncementStatus('Preparing hall voice…');
    try {
      const ctx = await unlockHallAudio();
      if (!ctx) throw new Error('RallyHub audio is not available in this browser.');

      // Generate/normalise the voice while the attention chime plays so the
      // network round trip is normally hidden behind the cue.
      const prepared = hallVoiceSource === 'amplified'
        ? primeRallyHubHallSpeech(text, { eventId:event?.id || '' })
        : Promise.resolve(true);
      playRallyHubSignal(ctx, 'announcement', hallVolume);
      await Promise.all([
        prepared,
        new Promise(resolve => window.setTimeout(resolve, 2350)),
      ]);

      let started = false;
      const ok = await speakRallyHubHall(text, {
        volume:hallVolume,
        eventId:event?.id || '',
        voiceMode:'rallyhub_default',
        voices,
        engineMode:hallVoiceSource,
        onEngine:setHallVoiceEngine,
        onStart:() => {
          started = true;
          setAnnouncementStatus('Speaking…');
        },
        onEnd:() => {
          if (!started) {
            setAnnouncementSpeaking(false);
            setAnnouncementStatus('Voice did not audibly start — text kept for retry.');
            toast.error('The hall voice ended without starting. Your announcement text has been kept.');
            return;
          }
          setLastAnnouncement(text);
          setAnnouncementDraft('');
          setAnnouncementSpeaking(false);
          setAnnouncementStatus('Announcement played.');
          toast.success('Announcement played.');
        },
        onError:() => {
          setAnnouncementSpeaking(false);
          setAnnouncementStatus('Voice playback failed — text kept for retry.');
          toast.error('Voice playback failed. Your announcement text has been kept.');
        },
      });
      if (!ok) {
        setAnnouncementSpeaking(false);
        setAnnouncementStatus('Hall voice unavailable — text kept for retry.');
        toast.error('Hall voice is unavailable. Your announcement text has been kept.');
      }
    } catch (error) {
      setAnnouncementSpeaking(false);
      setAnnouncementStatus('Announcement could not start — text kept for retry.');
      toast.error(error?.message || 'Could not play the announcement. Your text has been kept so you can try again.');
    }
  };
  const roundLabel = round => roundLabels[round] || `Round ${round}`;

  React.useEffect(() => {
    if (!audioReady || !event?.id || voiceMode === 'off' || hallVoiceSource !== 'amplified') return;
    const label = roundLabels[currentRound] || `Round ${currentRound}`;
    const phrases = [
      announcementText('round_start', `${label}. ${label} starting now.`, { round_label:label }),
      announcementText('round_resume', `${label}. Resume play.`, { round_label:label }),
    ].filter(Boolean);
    if (event?.include_break && Number(currentRound) === Number(event?.break_after_round || 0)) {
      phrases.push(announcementText('scheduled_break_notice', `${label} finished. Your ${Number(event?.break_minutes || 20)} minute break is next. Please give in your scores.`, { round_label:label, break_minutes:Number(event?.break_minutes || 20) }));
    }
    void primeRallyHubHallSpeech(phrases, { eventId:event.id });
  }, [audioReady, currentRound, event?.id, event?.include_break, event?.break_after_round, event?.break_minutes, roundLabels, voiceMode, hallVoiceSource]);

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
    autoRoundTransitionRef.current.delete(`${currentRound}-${phase}`);
    // The host's tap is the best chance to unlock mobile audio before the network await.
    await unlockHallAudio();
    if (await timerAction('start', phase)) {
      lastTimerAnnouncementRef.current = new Set();
      if (phase === 'play') {
        timerSpeechArmedRef.current = true;
        if (!announcedRoundStartsRef.current.has(Number(currentRound))) {
          announcedRoundStartsRef.current.add(Number(currentRound));
          const label = roundLabel(currentRound);
          speak(announcementText('round_start', `${label}. ${label} starting now.`, { round_label:label }), { signal:'start' });
        }
      } else if (phase === 'changeover') {
        timerSpeechArmedRef.current = true;
        speak(announcementText('changeover_start', 'Changeover starting now.'), { signal:'start' });
      } else {
        timerSpeechArmedRef.current = true;
        speak(announcementText('break_start', `Your ${Number(event?.break_minutes || 20)} minute break starts now. Enjoy your break.`, { break_minutes:Number(event?.break_minutes || 20) }), { signal:'start' });
      }
      requestWakeLock();
    }
  };
  const pauseTimer = async () => { if (await timerAction('pause')) { timerSpeechArmedRef.current = false; speak(announcementText('event_paused', 'Event paused.')); wakeLockRef.current?.release?.(); } };
  const endRoundEarly = async () => { if (await timerAction('end_play')) { timerSpeechArmedRef.current = false; speak(announcementText('round_end_early', `Round ${currentRound} ended. Please hand in your scores.`, { round_number:Number(currentRound) })); wakeLockRef.current?.release?.(); } };
  const resumeTimer = async () => { await unlockHallAudio(); if (await timerAction('resume')) { timerSpeechArmedRef.current = true; const phase=String(timerState?.phase || ''); const label=roundLabel(currentRound); const text=phase==='break' ? announcementText('break_resume','Break resumed.') : phase==='changeover' ? announcementText('changeover_resume','Changeover resumed.') : announcementText('round_resume',`${label}. Resume play.`,{round_label:label}); speak(text, { signal:'start' }); requestWakeLock(); } };
  const resetTimer = async () => { timerSpeechArmedRef.current = false; return timerAction('reset'); };
  const preparedRoundMinutes = ['ready','play'].includes(String(timerState?.phase || '')) && Number(timerState?.round || 0) === Number(currentRound) && !timerState?.running && Number(timerState?.remaining_seconds || 0) > 0
    ? Math.max(1, Math.round(Number(timerState.remaining_seconds) / 60))
    : Number(event?.play_minutes || 10);
  const setRoundMinutes = async value => {
    const minutes = Math.max(1, Math.min(60, Math.round(Number(value) || Number(event?.play_minutes || 10))));
    if (!event || !canManageEvent || timerState?.running) return;
    try {
      const res = await invokeBase44Safely('updateClubChallengeTimer', { eventId:event.id, action:'set_round_minutes', minutes, expectedRevision:Number(event.timer_revision || 0) });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
      toast.success(`${roundLabel(currentRound)} set to ${minutes} minutes.`);
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not change this round duration'); await refetchEvent(); }
  };
  const setChangeoverMinutes = async value => {
    const minutes = Math.max(1, Math.min(10, Math.round(Number(value) || Number(event?.changeover_minutes || 2))));
    if (!event || !canManageEvent || (timerState?.running && String(timerState?.phase || '') === 'changeover')) return;
    try {
      const res = await invokeBase44Safely('updateClubChallengeTimer', { eventId:event.id, action:'set_changeover_minutes', minutes, expectedRevision:Number(event.timer_revision || 0) });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
      toast.success(`Changeover set to ${minutes} minute${minutes===1?'':'s'}.`);
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not change the changeover duration'); await refetchEvent(); }
  };
  const setBreakMinutes = async value => {
    const minutes = Math.max(1, Math.min(60, Math.round(Number(value) || Number(event?.break_minutes || 20))));
    if (!event || !canManageEvent || (timerState?.running && String(timerState?.phase || '') === 'break')) return;
    try {
      const res = await invokeBase44Safely('updateClubChallengeTimer', { eventId:event.id, action:'set_break_minutes', minutes, expectedRevision:Number(event.timer_revision || 0) });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
      toast.success(`Mid-event break set to ${minutes} minute${minutes===1?'':'s'}.`);
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not change the break duration'); await refetchEvent(); }
  };
  const fmtTimer = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const testVoice = () => unlockHallAudio({ test:true });
  React.useEffect(() => {
    if (!timerState?.running || !timerSpeechArmedRef.current || !['in_progress','paused'].includes(event?.status)) return;
    const phase = timerState.phase || 'play';
    const announceOnce = (key, text, signal = 'warning') => {
      if (lastTimerAnnouncementRef.current.has(key)) return;
      lastTimerAnnouncementRef.current.add(key);
      speak(text, { signal });
    };
    const prefix = `${currentRound}-${phase}`;
    if (phase === 'break' && Number(event?.break_minutes || 0) > 2 && timerRemaining === 120) {
      const nextRoundLabel = roundLabel(Number(currentRound) + 1);
      announceOnce(`${prefix}-two-minute-warning`, announcementText('break_two_minute_warning', `Two minutes remaining. Please return to court and be ready for ${nextRoundLabel}.`, { next_round_label:nextRoundLabel }));
    }
    if (timerRemaining <= 5 && timerRemaining > 0) announceOnce(`${prefix}-count-${timerRemaining}`, announcementText('countdown', String(timerRemaining), { seconds:timerRemaining }));
    if (timerRemaining === 0) {
      const nextRoundLabel = roundLabel(Number(currentRound) + 1);
      const endMessage = phase === 'play'
        ? announcementText('round_end', 'Please hand in your scores.')
        : phase === 'changeover'
          ? announcementText('changeover_end', 'Changeover finished. Next round ready.')
          : announcementText('break_end', `Break finished. ${nextRoundLabel} is ready when the host is ready.`, { next_round_label:nextRoundLabel });
      announceOnce(`${prefix}-end`, endMessage, 'end');
      timerSpeechArmedRef.current = false;
      wakeLockRef.current?.release?.();
    }
  }, [timerRemaining, timerState?.running, timerState?.phase, currentRound, hallVolume, voiceMode, voices, audioMuted, event?.include_break, event?.break_after_round, event?.break_minutes]);
  const runCompressedTimerAudioTest = async () => {
    if (compressedTimer.running) return;
    const r1=roundLabel(1), r2=roundLabel(2), r3=roundLabel(3), breakMinutes=Number(event?.break_minutes || 20);
    const steps = [
      announcementText('round_start', `${r1}. ${r1} starting now.`, { round_label:r1 }),
      ...[5,4,3,2,1].map(seconds => announcementText('countdown', String(seconds), { seconds })),
      announcementText('round_end', 'Please hand in your scores.'),
      announcementText('changeover_start', 'Changeover starting now.'),
      announcementText('round_start', `${r2}. ${r2} starting now.`, { round_label:r2 }),
      announcementText('event_paused', 'Event paused.'),
      announcementText('round_resume', `${r2}. Resume play.`, { round_label:r2 }),
      announcementText('break_start', `Your ${breakMinutes} minute break starts now. Enjoy your break.`, { break_minutes:breakMinutes }),
      announcementText('round_start', `${r3}. ${r3} starting now.`, { round_label:r3 })
    ].filter(Boolean);
    setCompressedTimer({ running: true, step: 0, text: steps[0] });
    for (let i = 0; i < steps.length; i += 1) {
      setCompressedTimer({ running: true, step: i, text: steps[i] });
      speak(steps[i]);
      await new Promise(resolve => window.setTimeout(resolve, 1200));
    }
    setCompressedTimer({ running: false, step: steps.length - 1, text: 'PASS — compressed phase/announcement sequence completed' });
    addSimLog('Compressed timer/audio: round start → 5-4-3-2-1 → scores prompt → changeover → pause/resume → break completed', 'pass');
  };

  const setPotStatus = async status => {
    if (!event || !canManagePot || !['open','closed'].includes(status)) return;
    try {
      const action = status === 'open' ? 'open' : 'close';
      const payload = { eventId:event.id, action };
      if (status === 'open') payload.durationMinutes = potDuration === 'manual' ? null : Number(potDuration);
      const res = await base44.functions.invoke('updateClubChallengePot', payload);
      if (res.data?.error) { toast.error(res.data.error); return; }
      potAutoCloseRef.current = '';
      await refetchEvent();
      if (isAdmin) await refetchPotVotes();
      toast.success(status === 'open'
        ? `Players of the Tournament voting is open${potDuration === 'manual' ? ' until you close it' : ` for ${potDuration} minutes`}.`
        : 'Voting closed. Totals remain hidden until reveal.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not update voting status'); }
  };

  const calculateHighestScorers = async () => {
    if (!event || !canManagePot) return;
    try {
      const res = await base44.functions.invoke('updateClubChallengePot', { eventId:event.id, action:'calculate_points' });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
      toast.success('Highest scoring player for each team calculated from the completed normal rounds.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not calculate highest scorers'); }
  };

  const extendPotVoting = async () => {
    if (!event || !canManagePot || event.pot_status !== 'open') return;
    try {
      const res = await base44.functions.invoke('updateClubChallengePot', { eventId:event.id, action:'extend', extraMinutes:5 });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
      toast.success('Voting extended by 5 minutes.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not extend voting'); }
  };

  const resetPotVoting = async () => {
    if (!event || !canManagePot) return;
    if (!window.confirm('Reset the player award choice? Any current voting ballots will be invalidated and you can choose Highest Scorers or Player Vote again.')) return;
    try {
      const res = await base44.functions.invoke('updateClubChallengePot', { eventId:event.id, action:'reset' });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
      if (isAdmin) await refetchPotVotes();
      toast.success(`Player award reset. ${Number(res.data?.invalidatedVotes || 0)} recorded team vote${Number(res.data?.invalidatedVotes || 0) === 1 ? '' : 's'} cleared from the live count.`);
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not reset voting'); }
  };

  const configureSpotPrizeDraw = async ({ enabled = setup.spotPrizeEnabled, mode = setup.spotPrizeMode, prizeCount = setup.spotPrizeCount } = {}) => {
    if (!event || !canManageSpotPrize) return false;
    setSpotPrizeBusy(true);
    try {
      const res = await invokeBase44Safely('manageClubChallengeSpotPrizeDraw', { eventId:event.id, action:'configure', enabled:!!enabled, mode, prizeCount:Number(prizeCount || 1) });
      if (res.data?.error) throw new Error(res.data.error);
      await refetchSpotPrizeDraw?.();
      setSetup(s => ({ ...s, spotPrizeEnabled:!!enabled, spotPrizeMode:mode, spotPrizeCount:Number(prizeCount || 1), ...(enabled ? { potEnabled:false } : {}) }));
      schedulePublicSnapshotRefresh(1200);
      toast.success(enabled ? 'Spot Prize Draw is ready.' : 'Spot Prize Draw disabled.');
      return true;
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not configure Spot Prize Draw'); return false; }
    finally { setSpotPrizeBusy(false); }
  };

  const drawNextSpotPrize = async () => {
    if (!event || !canManageSpotPrize || !spotPrizeDraw?.enabled || spotPrizeBusy) return;
    setSpotPrizeBusy(true);
    let raffleSoundTimer = null;
    try {
      // A deliberate Draw button press should always arm hall audio on the host laptop.
      // Clear any stale persisted mute flag first, then unlock Web Audio from this
      // user gesture so Chrome can route it to the current Windows/Bluetooth output.
      setAudioMuted(false);
      localStorage.setItem('cc-audio-muted', 'false');
      const ctx = await unlockHallAudio();
      setAudioReady(!!ctx && ctx.state === 'running');
      if (ctx) {
        playRallyHubSignal(ctx, 'warning', hallVolume * 0.55);
        raffleSoundTimer = window.setInterval(() => playRallyHubSignal(ctx, 'warning', hallVolume * 0.45), 220);
      }
      const operationId = window.crypto?.randomUUID?.() || `spot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const begin = await invokeBase44Safely('manageClubChallengeSpotPrizeDraw', { eventId:event.id, action:'begin_draw', operationId });
      if (begin.data?.error) throw new Error(begin.data.error);
      await refetchSpotPrizeDraw?.();
      // Publish the server-decided 'drawing' state once. Phones animate locally;
      // they do not hammer Base44 every second.
      await refreshPublicSnapshotNow();
      await new Promise(resolve => window.setTimeout(resolve, 4800));
      // Completion is idempotent for this operationId. If Base44 accepts the write
      // but its response is delayed/lost, every retry returns the same winner rather
      // than turning a successful draw into an apparent failure.
      const res = await invokeBase44Safely('manageClubChallengeSpotPrizeDraw', { eventId:event.id, action:'complete_draw', operationId }, { retries:5 });
      if (res.data?.error) throw new Error(res.data.error);
      if (raffleSoundTimer) { window.clearInterval(raffleSoundTimer); raffleSoundTimer = null; }
      const w = res.data?.winner;
      if (ctx && w) playRallyHubSignal(ctx, 'announcement', hallVolume);
      await refetchSpotPrizeDraw?.();
      schedulePublicSnapshotRefresh(500);
      if (w) toast.success(`Spot Prize ${w.pull}: #${w.number} ${w.display_name}`);
      if (res.data?.complete) toast.success('Spot Prize Draw complete.');
    } catch (e) {
      if (raffleSoundTimer) { window.clearInterval(raffleSoundTimer); raffleSoundTimer = null; }
      toast.error(e?.response?.data?.error || e?.message || 'Could not draw a spot prize');
    }
    finally { setSpotPrizeBusy(false); }
  };

  const testSpotPrizeSound = async () => {
    try {
      setAudioMuted(false);
      localStorage.setItem('cc-audio-muted', 'false');
      const ctx = await unlockHallAudio();
      setAudioReady(!!ctx && ctx.state === 'running');
      if (!ctx || ctx.state !== 'running') throw new Error('Browser audio did not start.');
      playRallyHubSignal(ctx, 'warning', hallVolume * 0.65);
      window.setTimeout(() => playRallyHubSignal(ctx, 'announcement', hallVolume), 450);
      toast.success('Draw sound test played on the host laptop output.');
    } catch (e) { toast.error(e?.message || 'Could not play draw sound on this device.'); }
  };

  const resetSpotPrizeDraw = async () => {
    if (!event || !canManageSpotPrize || !spotPrizeDraw?.enabled || spotPrizeBusy) return;
    setSpotPrizeBusy(true);
    try {
      const res = await invokeBase44Safely('manageClubChallengeSpotPrizeDraw', { eventId:event.id, action:'reset' });
      if (res.data?.error) throw new Error(res.data.error);
      if (isAdmin) queryClient.setQueryData(['club-challenge-spot-prize', event.id], res.data?.draw || { ...spotPrizeDraw, status:'ready', winners_json:'[]', draw_count:0, pending_winner_json:null, draw_started_at:null });
      await refetchSpotPrizeDraw?.();
      schedulePublicSnapshotRefresh(800);
      toast.success('Spot Prize Draw reset — all previous winners cleared.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not reset Spot Prize Draw'); }
    finally { setSpotPrizeBusy(false); }
  };

  const ensurePublicLinks = async ({ quiet = false } = {}) => {
    if (!event || !hasManagePermission) return null;
    try {
      const res = await base44.functions.invoke('manageClubChallengePublicLinks', { eventId:event.id });
      if (res.data?.error) { if (!quiet) toast.error(res.data.error); return null; }
      const links = { ...res.data, displayUrl:interclubPublicUrl(`/club-challenge/display/${res.data.displayToken}`), votingUrl:interclubPublicUrl(`/club-challenge/vote/${res.data.votingToken}`) };
      setPublicLinks(links);
      schedulePublicSnapshotRefresh(500);
      if (!quiet) toast.success('Live Event View and Players of the Tournament voting links are ready.');
      return links;
    } catch (e) {
      if (!quiet) toast.error(e?.response?.data?.error || e?.message || 'Could not prepare public links');
      return null;
    }
  };
  const preparePublicLinks = () => ensurePublicLinks();
  const loadTournamentUpdate = React.useCallback(async () => {
    if (!event?.id || !hasManagePermission) return;
    try {
      const res = await base44.functions.invoke('interclubTournamentUpdate', { eventId:event.id, action:'status', origin:window.location.origin });
      if (!res.data?.error) setTournamentUpdateInfo(res.data);
    } catch {}
  }, [event?.id, hasManagePermission]);
  React.useEffect(() => { loadTournamentUpdate(); }, [loadTournamentUpdate]);
  const previewTournamentUpdateEmail = async () => {
    const message=tournamentUpdateDraft.trim(); if(!event?.id||!message||tournamentUpdatePreviewBusy)return;
    setTournamentUpdatePreviewBusy(true);
    try { const res=await base44.functions.invoke('interclubTournamentUpdate',{eventId:event.id,action:'preview',message,templateId:tournamentUpdateTemplateId,origin:window.location.origin}); if(res.data?.error)throw new Error(res.data.error); setTournamentUpdatePreviewHtml(res.data?.previewHtml||''); setTournamentUpdatePreviewOpen(true); }
    catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not load email preview');}
    finally{setTournamentUpdatePreviewBusy(false);}
  };
  const sendTournamentUpdateTestEmail = async () => {
    const message = tournamentUpdateDraft.trim();
    const testEmail = tournamentUpdateTestEmail.trim();
    if (!event?.id || !message || !testEmail || tournamentUpdateTestBusy) return;
    setTournamentUpdateTestBusy(true);
    try {
      const res = await base44.functions.invoke('interclubTournamentUpdate', { eventId:event.id, action:'test_email', message, testEmail, templateId:tournamentUpdateTemplateId, origin:window.location.origin });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`Test email sent to ${res.data?.testEmail || testEmail}.`);
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not send test email'); }
    finally { setTournamentUpdateTestBusy(false); }
  };
  const publishTournamentUpdate = async (sendEmail) => {
    const message = tournamentUpdateDraft.trim();
    if (!event?.id || !message || tournamentUpdateBusy) return;
    if (sendEmail && !window.confirm(`Publish this Tournament Update and email ${Number(tournamentUpdateInfo?.emailRecipients || 0)} player email address${Number(tournamentUpdateInfo?.emailRecipients || 0)===1?'':'es'}?`)) return;
    setTournamentUpdateBusy(true);
    try {
      const res = await base44.functions.invoke('interclubTournamentUpdate', { eventId:event.id, action:'publish', title:'Tournament Update', message, templateId:tournamentUpdateTemplateId, expiryMode:tournamentUpdateExpiryMode, customMinutes:Number(tournamentUpdateCustomMinutes || 60), sendEmail:!!sendEmail, origin:window.location.origin });
      if (res.data?.error) throw new Error(res.data.error);
      setTournamentUpdateInfo(res.data);
      setTournamentUpdateDraft('');
      schedulePublicSnapshotRefresh(500);
      toast.success(sendEmail ? `Tournament Update published · ${res.data?.sent || 0} email${Number(res.data?.sent||0)===1?'':'s'} sent${res.data?.failed ? ` · ${res.data.failed} failed` : ''}.` : 'Tournament Update published to the Player Link.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not publish Tournament Update'); }
    finally { setTournamentUpdateBusy(false); }
  };
  const removeTournamentUpdate = async () => {
    if (!event?.id || tournamentUpdateBusy || !window.confirm('Remove the current Tournament Update from the Player Link? This does not recall any email already sent.')) return;
    setTournamentUpdateBusy(true);
    try { const res=await base44.functions.invoke('interclubTournamentUpdate',{eventId:event.id,action:'remove'}); if(res.data?.error)throw new Error(res.data.error); await loadTournamentUpdate(); schedulePublicSnapshotRefresh(500); toast.success('Tournament Update removed from the Player Link.'); }
    catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not remove Tournament Update');}
    finally{setTournamentUpdateBusy(false);}
  };
  const prepareRegistrationLink = async side => {
    if (!event || !hasManagePermission || !['club_a','club_b'].includes(side)) return;
    setRegistrationLinkBusy(side);
    try {
      const res = await base44.functions.invoke('manageInterclubRegistrationLink', { eventId:event.id, side });
      if (res.data?.error) throw new Error(res.data.error);
      const url = interclubPublicUrl(`/club-challenge/register/${res.data.token}`);
      setRegistrationLinks(current => ({ ...current, [side]:url }));
      toast.success(`${res.data.teamName || (side === 'club_a' ? event.club_a_name : event.club_b_name)} registration link is ready.`);
      return url;
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Could not prepare guest registration link');
      return '';
    } finally {
      setRegistrationLinkBusy('');
    }
  };
  const prepareTeamManagerLink = async side => {
    if (!event || !hasManagePermission || !['club_a','club_b'].includes(side)) return;
    setTeamManagerLinkBusy(side);
    try {
      const res = await base44.functions.invoke('manageInterclubTeamManagerLink', { eventId:event.id, side });
      if (res.data?.error) throw new Error(res.data.error);
      const url = interclubPublicUrl(`/club-challenge/team-manager/${res.data.token}`);
      setTeamManagerLinks(current => ({ ...current, [side]:url }));
      toast.success(`${res.data.teamName || (side === 'club_a' ? event.club_a_name : event.club_b_name)} team manager link is ready.`);
      return url;
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Could not prepare team manager link');
      return '';
    } finally {
      setTeamManagerLinkBusy('');
    }
  };
  const sharePublicLink = async (url, label) => {
    if (!url) return;
    const text = `${label} · ${event?.club_a_name || 'Team A'} vs ${event?.club_b_name || 'Team B'}`;
    if (navigator.share) {
      try { await navigator.share({ title:label, text, url }); return; }
      catch (e) { if (e?.name === 'AbortError') return; }
    }
    try { await navigator.clipboard?.writeText(url); toast.success(`${label} link copied.`); }
    catch { toast.error('Could not share or copy this link.'); }
  };
  const shareOnWhatsApp = (url, label) => {
    if (!url) return;
    const text = `${label} · ${event?.club_a_name || 'Team A'} vs ${event?.club_b_name || 'Team B'}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const prepareShowcaseScorerLink = async () => {
    if (!event || !showcaseMatch || !hasManagePermission) return;
    try {
      const res = await base44.functions.invoke('manageClubChallengeShowcaseScorerLink', { eventId:event.id });
      if (res.data?.error) { toast.error(res.data.error); return; }
      const url = interclubPublicUrl(`/club-challenge/showcase-score/${res.data.token}`);
      setShowcaseScorerLink(url);
      toast.success('Secure Showcase scorer link is ready.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not prepare Showcase scorer link'); }
  };

  const runPotTiebreak = async side => {
    if (!event || !canManagePot || event.pot_status !== 'closed') return;
    const candidates = side === 'club_a' ? potTopA : potTopB;
    if (candidates.length < 2) return;
    setPotTiebreakUi(s => ({ ...s, [side]:{ running:true, display:candidates[0]?.display_name || '' } }));
    try {
      const res = await base44.functions.invoke('updateClubChallengePot', { eventId:event.id, action:'tiebreak', side });
      if (res.data?.error) { toast.error(res.data.error); setPotTiebreakUi(s => ({ ...s, [side]:{ running:false, display:'' } })); return; }
      const selected = res.data?.selectedWinner;
      let step = 0;
      await new Promise(resolve => {
        const timer = window.setInterval(() => {
          step += 1;
          const candidate = candidates[step % candidates.length];
          setPotTiebreakUi(s => ({ ...s, [side]:{ running:true, display:candidate?.display_name || '' } }));
          if (step >= 10) { window.clearInterval(timer); resolve(); }
        }, 120);
      });
      setPotTiebreakUi(s => ({ ...s, [side]:{ running:false, display:selected?.display_name || 'Winner selected' } }));
      await refetchEvent();
      toast.success(`${side === 'club_a' ? event.club_a_name : event.club_b_name} tie-break winner selected. Reveal when ready.`);
    } catch (e) {
      setPotTiebreakUi(s => ({ ...s, [side]:{ running:false, display:'' } }));
      toast.error(e?.response?.data?.error || e?.message || 'Could not run tie-break');
    }
  };

  const revealPot = async () => {
    if (!event || !canManagePot) return;
    if (potTieUnresolved) { toast.error('Resolve the tied vote with Coin Toss before revealing the result.'); return; }
    try {
      const res = await base44.functions.invoke('updateClubChallengePot', { eventId:event.id, action:'reveal' });
      if (res.data?.error) { toast.error(res.data.error); return; }
      await refetchEvent();
      if (isAdmin) await refetchPotVotes();
      toast.success('Players of the Tournament results revealed.');
    } catch (e) { toast.error(e?.response?.data?.error || e?.message || 'Could not reveal voting result'); }
  };

  React.useEffect(() => {
    if (!event?.id || event.pot_status !== 'open' || !event.pot_vote_closes_at || !canManagePot) return;
    const closesAt = Date.parse(event.pot_vote_closes_at);
    if (!Number.isFinite(closesAt) || closesAt > timerNow) return;
    const key = `${event.id}:${event.pot_vote_closes_at}`;
    if (potAutoCloseRef.current === key) return;
    potAutoCloseRef.current = key;
    base44.functions.invoke('updateClubChallengePot', { eventId:event.id, action:'close' })
      .then(async res => {
        if (!res.data?.error) {
          await refetchEvent();
      if (isAdmin) await refetchPotVotes();
          toast.success('Voting closed automatically. Results remain hidden until reveal.');
        }
      })
      .catch(() => {});
  }, [event?.id, event?.pot_status, event?.pot_vote_closes_at, timerNow, canManagePot, isAdmin]);
  const printEventPack = () => {
    if (!event || !['draw_approved','in_progress','paused','completed'].includes(event.status) || !normalMatches.length) { toast.error('Approve the draw before producing the Event Pack.'); return; }
    if (event.event_pack_stale) toast.warning('Event Pack is OUT OF DATE because fixtures changed. You can still open and review it; re-approve the draw before treating it as the current authoritative pack.');
    setPrintOrientation('recommended');
    setPrintPackOpen(true);
  };
  const confirmPrintEventPack = async () => {
    const completed = ['completed','archived'].includes(event?.status);
    const selection = { ...printSelection, final: completed ? printSelection.final : false };
    if (!Object.values(selection).some(Boolean)) { toast.error('Choose at least one sheet to print.'); return; }

    if (selection.briefing && (!publicLinks?.displayUrl || (selection.includeVotingQr && !publicLinks?.votingUrl))) {
      const links = await ensurePublicLinks({ quiet:true });
      if (!links?.displayUrl || (selection.includeVotingQr && !links?.votingUrl)) { toast.error('Could not prepare the requested Event Pack links. Printing has been cancelled.'); return; }
      await new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    }

    await base44.entities.ClubChallengeEvent.update(event.id, { event_pack_generated_at: new Date().toISOString() });
    await refetchEvent();
    setPrintPackOpen(false);
    const selectedScoreSheets = Number(!!selection.score) + Number(!!selection.handoverScore);
    const scoreOnly = selectedScoreSheets === 1 && !selection.schedule && !selection.roster && !selection.briefing && !selection.final;
    const portraitOnly = selectedScoreSheets === 0;
    // Print from an isolated document. Printing the live app DOM can create anonymous
    // first/last pages around named @page sections in Chromium. The iframe contains
    // only the actual Event Pack sheets, so there is nothing else for the browser to paginate.
    await new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    const printRoot = document.querySelector('.rhpp-print-host .rhpp-root');
    if (!printRoot) { toast.error('Could not prepare the Event Pack for printing.'); return; }
    if (selection.briefing) {
      const qrDeadline = Date.now() + 5000;
      while (Date.now() < qrDeadline) {
        const qrs = Array.from(printRoot.querySelectorAll('.rhpp-briefing-page [data-rh-qr-ready]'));
        if (qrs.length && qrs.every(node => node.getAttribute('data-rh-qr-ready') === 'true')) break;
        await new Promise(resolve => window.setTimeout(resolve, 75));
      }
      const qrs = Array.from(printRoot.querySelectorAll('.rhpp-briefing-page [data-rh-qr-ready]'));
      if (!qrs.length || qrs.some(node => node.getAttribute('data-rh-qr-ready') !== 'true')) {
        toast.error('The Event Pack QR codes are not ready. Printing has been stopped rather than producing an unusable sheet.');
        return;
      }
    }
    const packCss = printRoot.querySelector(':scope > style')?.textContent || '';
    const pageHtml = Array.from(printRoot.querySelectorAll(':scope > .rhpp-page')).map(node => node.outerHTML).join('');
    if (!pageHtml) { toast.error('No Event Pack pages were selected.'); return; }
    const recommendedPageCss = scoreOnly
      ? '@page { size:297mm 210mm; margin:5mm; } .rhpp-page,.rhpp-score-page{page:auto!important}'
      : portraitOnly
        ? '@page { size:210mm 297mm; margin:5mm; } .rhpp-page,.rhpp-score-page{page:auto!important}'
        : '';
    const orientationPageCss = printOrientation === 'portrait'
      ? '@page { size:210mm 297mm; margin:5mm; } .rhpp-page,.rhpp-score-page{page:auto!important}'
      : printOrientation === 'landscape'
        ? '@page { size:297mm 210mm; margin:5mm; } .rhpp-page,.rhpp-score-page{page:auto!important}'
        : printOrientation === 'printer'
          ? '@page { margin:5mm; } .rhpp-page,.rhpp-score-page{page:auto!important}'
          : recommendedPageCss;
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none;';
    document.body.appendChild(iframe);
    const printDoc = iframe.contentDocument;
    printDoc.open();
    printDoc.write(`<!doctype html><html><head><base href="${window.location.origin}/"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0!important;padding:0!important;background:#fff!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}${packCss}${orientationPageCss}</style></head><body>${pageHtml}</body></html>`);
    printDoc.close();
    const images = Array.from(printDoc.images || []);
    await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.addEventListener('load', resolve, { once:true }); img.addEventListener('error', resolve, { once:true }); })));
    const cleanupPrintFrame = () => { if (iframe.isConnected) iframe.remove(); };
    iframe.contentWindow.addEventListener('afterprint', cleanupPrintFrame, { once:true });
    window.setTimeout(cleanupPrintFrame, 60000);
    window.setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 100);
  };
  const activateReserveQuick = async (reserveId, outgoingId) => {
    if (!event || !canManageEvent || !reserveId || !outgoingId || playerControlBusy || sportingActionRef.current) return;
    const reserve = participants.find(p => p.id === reserveId);
    const outgoing = participants.find(p => p.id === outgoingId);
    if (!reserve || !outgoing || reserve.side !== outgoing.side) { toast.error('Choose the outgoing player from the same team as the reserve.'); return; }
    sportingActionRef.current = true;
    setPlayerControlBusy(true);
    setPlayerControlStatus({ state:'working', text:`Putting ${reserve.display_name} in for ${outgoing.display_name} from Round ${currentRound}…` });
    try {
      const res = await invokeBase44Safely('manageClubChallengeParticipant', {
        eventId:event.id,
        action:'activate_reserve',
        outgoingParticipantId:outgoing.id,
        reserveParticipantId:reserve.id,
        withdrawalStatus:'withdrawn',
        reason:'Team reserve handover',
      });
      if (res.data?.error) throw new Error(res.data.error);
      const message = `${res.data.incomingName} is now in for ${res.data.outgoingName} from Round ${res.data.effectiveRound}. ${res.data.affected} future fixture${res.data.affected === 1 ? '' : 's'} updated; completed results unchanged.`;
      setPlayerControlStatus({ state:'success', text:message });
      setQuickReserveOutgoing(q => ({ ...q, [reserve.id]:'' }));
      toast.success(message);
      await sync();
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not activate reserve';
      setPlayerControlStatus({ state:'error', text:message });
      toast.error(message);
      await sync();
    } finally {
      sportingActionRef.current = false;
      setPlayerControlBusy(false);
    }
  };

  const applyReplacement = async () => {
    if (!event || !canManageEvent || !replacement.outgoingId) { toast.error('Choose the player who is leaving.'); return; }
    const outgoing = participants.find(p => p.id === replacement.outgoingId);
    if (!outgoing) { toast.error('Choose the player who is leaving.'); return; }
    const mode = replacement.mode || 'new';
    const reserve = participants.find(p => p.id === replacement.reserveParticipantId);
    const cover = participants.find(p => p.id === replacement.coverParticipantId);
    const incomingName = mode === 'reserve' ? reserve?.display_name : mode === 'cover' ? cover?.display_name : replacement.incomingName.trim();
    if (['new','temporary'].includes(mode) && !incomingName) { toast.error('Enter or choose the incoming player.'); return; }
    if (mode === 'reserve' && !reserve) { toast.error('Choose a team reserve.'); return; }
    if (mode === 'cover' && !cover) { toast.error('Choose an existing rotation player to cover.'); return; }
    if (sportingActionRef.current || playerControlBusy) return;
    sportingActionRef.current = true;
    setPlayerControlBusy(true);
    const workingText = mode === 'reserve'
      ? `Activating reserve ${incomingName} for ${outgoing.display_name} from Round ${currentRound}…`
      : mode === 'cover'
        ? `Rebalancing future fixtures with ${incomingName} covering ${outgoing.display_name}…`
        : mode === 'temporary'
          ? `Putting ${incomingName} in temporarily for ${outgoing.display_name} for the next ${Number(replacement.temporaryGames || 1)} game${Number(replacement.temporaryGames || 1) === 1 ? '' : 's'}…`
          : `Replacing ${outgoing.display_name} with ${incomingName} from Round ${currentRound}…`;
    setPlayerControlStatus({ state:'working', text:workingText });
    setHostAction(`${workingText} command sent`);
    try {
      const action = mode === 'reserve' ? 'activate_reserve' : mode === 'cover' ? 'cover_existing' : mode === 'temporary' ? 'temporary_sub' : 'replace';
      const res = await invokeBase44Safely('manageClubChallengeParticipant', {
        eventId:event.id, action, outgoingParticipantId:replacement.outgoingId,
        reserveParticipantId:replacement.reserveParticipantId, coverParticipantId:replacement.coverParticipantId,
        incomingName, incomingGender:replacement.incomingGender,
        incomingSourcePlayerId:replacement.incomingSourcePlayerId, incomingParticipantType:replacement.incomingParticipantType,
        temporaryGames:Number(replacement.temporaryGames || 1),
        reason:replacement.reason, withdrawalStatus:replacement.status,
      });
      if (res.data?.error) throw new Error(res.data.error);
      const message = mode === 'reserve'
        ? `${res.data.incomingName} activated from the Reserve bench for ${res.data.outgoingName} from Round ${res.data.effectiveRound}. ${res.data.affected} future fixture${res.data.affected === 1 ? '' : 's'} updated.`
        : mode === 'cover'
          ? `${res.data.incomingName} is covering ${res.data.outgoingName} from Round ${res.data.effectiveRound}. ${res.data.coverGames} fixture${res.data.coverGames === 1 ? '' : 's'} go directly to the cover player${res.data.rebalanced ? `; ${res.data.rebalanced} conflict${res.data.rebalanced === 1 ? '' : 's'} safely rebalanced through resting rotation players` : ''}. Completed results unchanged.`
          : mode === 'temporary'
            ? `${res.data.incomingName} is temporarily in for ${res.data.outgoingName} for ${res.data.affected} game${res.data.affected === 1 ? '' : 's'}${Array.isArray(res.data.rounds) && res.data.rounds.length ? ` (Round${res.data.rounds.length === 1 ? '' : 's'} ${res.data.rounds.join(', ')})` : ''}. ${res.data.outgoingName} remains active for later games.`
            : `${res.data.outgoingName} replaced by ${res.data.incomingName} from Round ${res.data.effectiveRound}. ${res.data.affected} future fixture${res.data.affected === 1 ? '' : 's'} updated; completed results unchanged.`;
      setReplacement({ mode:'new', outgoingId:'', candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'', reason:'', status:'withdrawn', temporaryGames:1 });
      setPlayerSearch('');
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

  const saveEventDisplayName = async () => {
    if (!event || !canManageEvent || !displayNameEdit.participantId || !displayNameEdit.displayName.trim() || displayNameBusy) return;
    const participant = participants.find(p => p.id === displayNameEdit.participantId);
    if (!participant) return;
    setDisplayNameBusy(true);
    setPlayerControlStatus({ state:'working', text:`Updating ${participant.display_name} for this event…` });
    try {
      const res = await invokeBase44Safely('manageClubChallengeParticipant', {
        eventId:event.id,
        action:'rename_display',
        participantId:participant.id,
        displayName:displayNameEdit.displayName.trim(),
      });
      if (res.data?.error) throw new Error(res.data.error);
      const message = `${res.data.oldName || participant.display_name} will display as ${res.data.participantName} for this event. Source registration details are unchanged.`;
      setPlayerControlStatus({ state:'success', text:message });
      toast.success(message);
      setDisplayNameEdit({ participantId:'', displayName:'' });
      await sync();
    } catch (e) {
      const message = e?.response?.data?.error || e?.message || 'Could not update event display name';
      setPlayerControlStatus({ state:'error', text:message });
      toast.error(message);
    } finally { setDisplayNameBusy(false); }
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
      const res = await invokeBase44Safely('manageClubChallengeParticipant', {
        eventId:event.id, action:'continue_short', outgoingParticipantId:replacement.outgoingId,
        reason:replacement.reason, withdrawalStatus:replacement.status,
      });
      if (res.data?.error) throw new Error(res.data.error);
      const message = `${res.data.outgoingName} withdrawn from Round ${res.data.effectiveRound}; ${res.data.affected} future match${res.data.affected === 1 ? '' : 'es'} marked Not Played.`;
      setReplacement({ mode:'new', outgoingId:'', candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'', reason:'', status:'withdrawn', temporaryGames:1 });
      setPlayerSearch('');
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
      const res = await invokeBase44Safely('manageClubChallengeParticipant', {
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
    flushSync(() => {
      setEventDayAdjustmentBusy(true);
      setEventDayAdjustmentStatus({ state:'working', text:`Applying court & time changes… ${proposal.changes.length} fixture move${proposal.changes.length === 1 ? '' : 's'}, ${proposal.dropIds.length} Not Played.` });
      setHostAction('Applying court & time changes… command sent');
    });
    try {
      const res = await invokeBase44Safely('updateClubChallengeSchedule', {
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
      const res = await invokeBase44Safely('finaliseClubChallenge', { eventId:event.id, method });
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
    const ids = [showcaseSelection.a1, showcaseSelection.a2, showcaseSelection.b1, showcaseSelection.b2];
    if (ids.some(id => !id) || new Set(ids).size !== 4) { toast.error('Select two distinct players from each club.'); return; }
    try {
      const res = await base44.functions.invoke('createClubChallengeShowcase', {
        eventId: event.id,
        clubAPlayer1Id: showcaseSelection.a1,
        clubAPlayer2Id: showcaseSelection.a2,
        clubBPlayer1Id: showcaseSelection.b1,
        clubBPlayer2Id: showcaseSelection.b2,
        mode: showcaseMode,
        targetPoints: Number(showcaseFormat.targetPoints),
        winBy: Number(showcaseFormat.winBy),
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

  const advanceRound = async ({ skipChangeover = false } = {}) => {
    if (sportingActionRef.current) return;
    const currentMatches = matches.filter(m => m.round_number === currentRound && !m.is_showcase);
    const unresolved = currentMatches.filter(m => !['completed', 'draw', 'retired', 'forfeit', 'abandoned', 'not_played'].includes(m.status));
    const maxRound = plannedRounds;
    const scheduledBreak = !!event?.include_break && Number(currentRound) === Number(event?.break_after_round || 0) && currentRound < maxRound;
    if (scheduledBreak && timerPhase !== 'break') {
      setRoundActionStatus({ state:'working', text:`Round ${currentRound} play finished. Starting ${Number(event.break_minutes || 20)}-minute break${unresolved.length ? ` · ${unresolved.length} score${unresolved.length === 1 ? '' : 's'} can be entered during the break` : ''}…` });
      await unlockHallAudio();
      const ok = await timerAction('start', 'break');
      if (ok) {
        const message = `Round ${currentRound} play finished ✓ · ${Number(event.break_minutes || 20)}-minute break started${unresolved.length ? ` · ${unresolved.length} score${unresolved.length === 1 ? '' : 's'} still to enter` : ''}`;
        setRoundActionStatus({ state:'success', text:message });
        toast.success(message);
        speak(announcementText('break_after_round_start', `Our ${Number(event.break_minutes || 20)} minute mid-event break starts now. Please return to court when the two minute warning is called.`, { round_label:roundLabel(currentRound), break_minutes:Number(event.break_minutes || 20) }), { signal:'start' });
        requestWakeLock();
      } else setRoundActionStatus({ state:'error', text:'Could not start the scheduled break.' });
      return;
    }
    if (scheduledBreak && timerPhase === 'break' && timerRemaining > 0) {
      toast.info(`Break in progress · ${fmtTimer(timerRemaining)} remaining. The host can shorten it or end it early.`);
      return;
    }
    sportingActionRef.current = true; setRoundActionStatus({ state:'working', text:currentRound < maxRound ? `Round ${currentRound} saved. Preparing Round ${currentRound + 1}…` : 'Normal rounds complete. Opening final options…' }); setHostAction(currentRound < maxRound ? `Preparing Round ${currentRound + 1}… command sent` : 'Opening final options…');
    try {
      if (currentRound < maxRound) {
        const res = await invokeBase44Safely('updateClubChallengeRound', { eventId: event.id, nextRound: currentRound + 1, allowPendingScores:true, skipChangeover });
        if (res.data?.error) { toast.error(res.data.error); return; }
        const nextRound = currentRound + 1;
        const nextMatches = normalMatches.filter(m => m.round_number === nextRound && m.status !== 'not_played');
        const activeIds = new Set(nextMatches.flatMap(m => [...(m.club_a_participant_ids || []), ...(m.club_b_participant_ids || [])]));
        const restingCount = participants.filter(p => ['active','late'].includes(p.status) && !activeIds.has(p.id)).length;
        const message = `Round ${nextRound} ready · ${nextMatches.length} courts · ${restingCount} players resting${unresolved.length ? ` · ${unresolved.length} Round ${currentRound} score${unresolved.length === 1 ? '' : 's'} still to enter` : ''}`;
        setRoundActionStatus({ state:'success', text:message });
        toast.success(message);
        setHostScoreRound(null);
        await refetchEvent();
      } else {
        if (resolvedNormalCount !== normalMatches.length) { toast.error('All normal match results must be resolved before the event can finish.'); return; }
        if (score.clubA === score.clubB) {
          toast.info('Normal Interclub points are tied. Choose Showcase Final, metrics, or overall draw in Results.');
        } else if (event.showcase_enabled) {
          toast.info('Normal rounds are complete. Choose Optional Showcase Final or confirm the Interclub winner in Results.');
        } else {
          toast.info('Normal rounds are complete. Review and confirm the final result in Results.');
        }
        setTab('results');
        return;
      }
    } catch (e) { const message = e?.response?.data?.error || e?.message || `Could not advance ${INTERCLUB_EVENT_LABEL}`; setRoundActionStatus({ state:'error', text:message }); await refetchEvent(); toast.error(message); }
    finally { sportingActionRef.current = false; setHostAction(''); }
  };

  React.useEffect(() => {
    if (!event || !canManageEvent || !['in_progress','paused'].includes(event.status)) return;
    if (timerRemaining !== 0 || timerState?.running !== true) return;
    const phase = String(timerState?.phase || '');
    const key = `${currentRound}-${phase}`;
    if (autoRoundTransitionRef.current.has(key)) return;
    autoRoundTransitionRef.current.add(key);

    // Physical transitions stay under host control. When play ends, RallyHub asks
    // for scores and waits for the host to start the changeover or scheduled break.
    // Once a host-started changeover/break finishes, RallyHub can safely prepare
    // the next round automatically without starting play.
    if (phase === 'changeover' && currentRound < plannedRounds) {
      window.setTimeout(() => advanceRound({ skipChangeover:true }), 150);
      return;
    }

    if (phase === 'break' && currentRound < plannedRounds) {
      window.setTimeout(() => advanceRound({ skipChangeover:true }), 150);
    }
  }, [timerRemaining, timerState?.running, timerState?.phase, currentRound, plannedRounds, event?.id, event?.status, event?.include_break, event?.break_after_round, canManageEvent]);

  const endBreakEarly = async () => {
    if (!canManageEvent || sportingActionRef.current || !event || currentRound >= plannedRounds) return;
    const nextRound = currentRound + 1;
    sportingActionRef.current = true;
    setRoundActionStatus({ state:'working', text:`Ending break early and preparing Round ${nextRound}…` });
    setHostAction(`Ending break early → Round ${nextRound}… command sent`);
    try {
      const res = await invokeBase44Safely('updateClubChallengeRound', { eventId:event.id, nextRound, skipBreak:true, allowPendingScores:true });
      if (res.data?.error) throw new Error(res.data.error);
      setHostScoreRound(null);
      await refetchEvent();
      const message = `Break ended early · Round ${nextRound} ready`;
      setRoundActionStatus({ state:'success', text:message });
      toast.success(message);
      speak(announcementText('break_ended_early', `Break finished. ${roundLabel(nextRound)} is ready.`, { next_round_label:roundLabel(nextRound) }), { signal:'start' });
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
  const scoreViewMatches = matches.filter(m => Number(m.round_number) === Number(scoreViewRound) && !m.is_showcase && m.status !== 'not_played');
  const scoreViewSavedCount = scoreViewMatches.filter(m => ['completed','draw','retired','forfeit','abandoned'].includes(m.status)).length;
  const scoreViewComplete = scoreViewMatches.length > 0 && scoreViewSavedCount === scoreViewMatches.length;
  const viewingHistoricalRound = Number(scoreViewRound) !== Number(currentRound);
  const canEditScoreView = event?.status === 'completed' || viewingHistoricalRound ? canCorrectScoreEvent : canScoreEvent;
  const terminalResultStatuses = ['completed','draw','retired','forfeit','abandoned','not_played'];
  const pendingPastMatches = normalMatches.filter(m => Number(m.round_number) < Number(currentRound) && !terminalResultStatuses.includes(m.status)).sort((a,b)=>Number(a.round_number)-Number(b.round_number)||Number(a.court_number)-Number(b.court_number));
  const allNormalResultsSaved = normalMatches.length > 0 && normalMatches.every(m => terminalResultStatuses.includes(m.status));
  const timerPhase = String(timerState?.phase || 'idle');
  const timerRunning = !!timerState?.running && timerRemaining > 0;
  const timerPaused = !!timerState && !timerState?.running && timerRemaining > 0 && ['play','changeover','break'].includes(timerPhase);
  const timerBelongsToCurrentRound = Number(timerState?.round || 0) === Number(currentRound);
  const roundStarted = timerBelongsToCurrentRound && (timerState?.round_started === true || (timerPhase === 'play' && (timerRunning || timerPaused || timerRemaining <= 0)) || ['changeover','break'].includes(timerPhase));
  const currentRoundScoringOpen = timerBelongsToCurrentRound && (currentRoundComplete || (timerPhase === 'play' && timerRemaining <= 0) || ['changeover','break'].includes(timerPhase));
  const scoreEntryVisible = event?.status === 'completed' || viewingHistoricalRound || currentRoundScoringOpen;
  const scheduledBreakHere = !!event?.include_break && Number(currentRound) === Number(event?.break_after_round || 0);
  const breakActive = scheduledBreakHere && timerPhase === 'break';
  const timingGuide = (() => {
    if (!event || !['in_progress','paused'].includes(event.status)) return null;
    const bookedStart = bookingStartMs(tournament, event);
    const bookedMinutes = Number(event.available_minutes || 0);
    if (!Number.isFinite(bookedStart) || bookedMinutes <= 0) return null;
    const hardFinish = bookedStart + bookedMinutes * 60000;
    const actualStart = event.actual_started_at ? Date.parse(event.actual_started_at) : NaN;
    const lateMinutes = Number.isFinite(actualStart) ? Math.max(0, Math.round((actualStart - bookedStart) / 60000)) : 0;
    const futureRounds = Math.max(0, Number(plannedRounds || 0) - Number(currentRound || 0));
    const playMinutes = Math.max(1, Number(event.play_minutes || 10));
    const changeoverMinutes = Math.max(0, Number(event.changeover_minutes || 0));
    let currentPlaySeconds = 0;
    if (['ready','idle'].includes(timerPhase)) currentPlaySeconds = Number(timerState?.remaining_seconds || playMinutes * 60);
    else if (timerPhase === 'play') currentPlaySeconds = Math.max(0, timerRemaining);
    const futurePlaySeconds = futureRounds * playMinutes * 60;
    let changeoverSeconds = futureRounds * changeoverMinutes * 60;
    if (timerPhase === 'changeover') changeoverSeconds = Math.max(0, timerRemaining) + Math.max(0, futureRounds - 1) * changeoverMinutes * 60;
    let breakSeconds = 0;
    const breakRound = Number(event.break_after_round || 0);
    if (event.include_break && breakRound > 0) {
      if (timerPhase === 'break') breakSeconds = Math.max(0, timerRemaining);
      else if (Number(currentRound) <= breakRound) breakSeconds = Math.max(0, Number(event.break_minutes || 0)) * 60;
    }
    const remainingSeconds = currentPlaySeconds + futurePlaySeconds + changeoverSeconds + breakSeconds;
    const projectedFinish = timerNow + remainingSeconds * 1000;
    const slackMinutes = Math.floor((hardFinish - projectedFinish) / 60000);
    const remainingRoundCount = Math.max(1, futureRounds + (currentPlaySeconds > 0 ? 1 : 0));
    const recommendations = [];
    if (slackMinutes < 0) {
      let recoveryNeeded = Math.abs(slackMinutes);
      const remainingChangeovers = futureRounds;
      const changeoverSaving = Math.max(0, changeoverMinutes - 1) * remainingChangeovers;
      if (changeoverSaving > 0) {
        recommendations.push(`Use 1-minute changeovers (saves up to ${changeoverSaving} min)`);
        recoveryNeeded = Math.max(0, recoveryNeeded - changeoverSaving);
      }
      const breakMinutesRemaining = Math.ceil(breakSeconds / 60);
      if (recoveryNeeded > 0 && breakMinutesRemaining > 0) {
        const targetBreak = Math.min(10, breakMinutesRemaining);
        const breakSaving = Math.max(0, breakMinutesRemaining - targetBreak);
        if (breakSaving > 0) {
          recommendations.push(`Shorten the remaining break to ${targetBreak} min (saves ${breakSaving} min)`);
          recoveryNeeded = Math.max(0, recoveryNeeded - breakSaving);
        }
      }
      if (recoveryNeeded > 0) {
        const cutPerRound = Math.max(1, Math.ceil(recoveryNeeded / remainingRoundCount));
        const suggestedPlay = Math.max(5, playMinutes - cutPerRound);
        recommendations.push(`Reduce remaining rounds to about ${suggestedPlay} min`);
      }
      if (event.showcase_enabled) recommendations.push('Treat the Showcase Final as optional unless time is recovered');
    }
    return {
      bookedStart, hardFinish, actualStart, lateMinutes, projectedFinish, slackMinutes,
      status: slackMinutes >= 10 ? 'on_track' : slackMinutes >= 0 ? 'tight' : 'recover',
      recommendations
    };
  })();
  const playFinished = timerPhase === 'play' && timerRemaining <= 0;
  const canPrepareNextRound = currentRoundComplete || playFinished || (timerPhase === 'changeover' && !timerState?.running);
  const missingCurrentScores = Math.max(0, currentMatches.length - currentRoundSavedCount);
  const missingAllScores = normalMatches.filter(m => !terminalResultStatuses.includes(m.status)).length;
  const advanceActionDisabled = currentRound < plannedRounds ? (!canManageEvent || !canPrepareNextRound) : (!canManageEvent || !allNormalResultsSaved);
  const advanceActionLabel = currentRound < plannedRounds
    ? (!canPrepareNextRound ? 'Round in play' : scheduledBreakHere ? `Start ${event?.break_minutes || 20}-min Break${missingCurrentScores ? ` · ${missingCurrentScores} score${missingCurrentScores === 1 ? '' : 's'} pending` : ''}` : `Prepare Round ${currentRound + 1}${missingCurrentScores ? ` · ${missingCurrentScores} score${missingCurrentScores === 1 ? '' : 's'} pending` : ''}`)
    : (!allNormalResultsSaved ? `${missingAllScores} score${missingAllScores === 1 ? '' : 's'} to save before Results` : score.clubA !== score.clubB ? 'Finish Interclub & Go to Results' : 'Go to Tie Resolution');
  const changeoverAvailable = timerPhase === 'play' && (!timerState?.running || timerRemaining <= 0);
  const outgoingPlayer = participants.find(p => p.id === replacement.outgoingId) || null;
  const availableReplacementCandidates = replacementCandidates.filter(c => !outgoingPlayer || c.side === outgoingPlayer.side);
  const unusedTeamReserves = participants.filter(p => ['club_a','club_b'].includes(p.side) && (p.roster_role || 'rotation') === 'reserve' && !p.reserve_activated && ['active','late'].includes(p.status) && Number(p.available_from_round || 1) <= currentRound);
  const gate3ParticipantIds = new Set(participants.filter(p => String(p.unique_identity_key || '').startsWith('gate3-')).map(p => p.id));
  const isGate3TestEvent = gate3ParticipantIds.size >= 8 && participants.every(p => String(p.unique_identity_key || '').startsWith('gate3-') || (p.replacement_for_participant_id && gate3ParticipantIds.has(p.replacement_for_participant_id)));
  const testEventLabel = [tournament?.name, tournament?.title, tournament?.description, event?.name, event?.description].filter(Boolean).join(' ');
  const isIsolatedTestEvent = /(^|\b)(TEST|ISOLATED TEST)(\b|\s|[-–—])/i.test(testEventLabel);
  const canQuickFillTestScores = !!isAdmin && isIsolatedTestEvent;
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
    if (!isAdmin || (!isGate3TestEvent && !isIsolatedTestEvent)) { toast.error('Simulator is restricted to isolated test events or the Gate 3 dummy roster.'); return; }
    const unresolved = targetMatches.filter(m => !['completed', 'draw'].includes(m.status));
    if (!unresolved.length) { toast.info('Those matches are already complete.'); return; }
    setSimulating(true);
    try {
      for (let i = 0; i < unresolved.length; i += 3) {
        const batch = unresolved.slice(i, i + 3);
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
  const jumpTestTimer = async seconds => {
    if (!canQuickFillTestScores || !timerState?.running) return;
    lastTimerAnnouncementRef.current = new Set();
    timerSpeechArmedRef.current = true;
    await timerAction('test_set_remaining', timerPhase, { seconds });
  };
  const resetDummyRecords = async () => {
    const normal = matches.filter(m => !m.is_showcase && (!plannedRounds || Number(m.round_number) <= plannedRounds));
    const showcase = matches.filter(m => m.is_showcase);
    for (const m of showcase) await base44.entities.ClubChallengeMatch.delete(m.id);
    for (let i = 0; i < normal.length; i += 3) {
      await Promise.all(normal.slice(i, i + 3).map(m => base44.entities.ClubChallengeMatch.update(m.id, {
        status: 'scheduled', score_a: null, score_b: null, winner: 'none', revision: 0,
        scored_by_user_id: null, scored_at: null, last_corrected_by_user_id: null, last_corrected_at: null, correction_count: 0,
      })));
    }
    await base44.entities.ClubChallengeEvent.update(event.id, {
      status: 'draw_approved', current_round: 0, finalised_at: null, actual_started_at:null,
      showcase_resolution_method: 'none', showcase_resolved_winner: 'none',
      showcase_club_a_male_id: null, showcase_club_a_female_id: null,
      showcase_club_b_male_id: null, showcase_club_b_female_id: null,
      showcase_club_a_player_1_id: null, showcase_club_a_player_2_id: null,
      showcase_club_b_player_1_id: null, showcase_club_b_player_2_id: null,
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
  const currentSittingOut = participants.filter(p => !isTemporarySub(p) && (p.status === 'active' || (p.status === 'late' && Number(p.available_from_round || 1) <= currentRound)) && !currentActiveIds.has(p.id));
  const currentSittingOutA = currentSittingOut.filter(p => p.side === 'club_a');
  const currentSittingOutB = currentSittingOut.filter(p => p.side === 'club_b');
  const playerStatusChanges = Array.from(new Map(participants.filter(p => ['club_a','club_b'].includes(p.side) && !!playerTreatment(p)).map(p => [`${p.side}:${String(p.display_name || '').trim().toLowerCase()}:${playerTreatment(p)?.label}`, p])).values());
  const validPotVotes = potVotes.filter(v => v.valid !== false);
  const potCounts = validPotVotes.reduce((a,v) => ({ ...a, [v.nominee_participant_id]: (a[v.nominee_participant_id] || 0) + 1 }), {});
  const potBallotCount = new Set(validPotVotes.map(v => v.voter_identity_key).filter(Boolean)).size;
  const potTeamVoteCount = validPotVotes.length;
  const potWinnerIds = event?.pot_winner_participant_ids || [];
  const potWinnersA = potWinnerIds.map(id => participants.find(p => p.id === id)).filter(p => p?.side === 'club_a');
  const potWinnersB = potWinnerIds.map(id => participants.find(p => p.id === id)).filter(p => p?.side === 'club_b');
  const individualPointStats = useMemo(() => calculateIndividualPointStats(normalMatches, participants), [normalMatches, participants]);
  const finalPodiumForSide = side => participants
    .filter(p => p.side === side && Number(individualPointStats[p.id]?.gamesPlayed || 0) > 0)
    .map(p => ({ ...p, performance:individualPointStats[p.id] }))
    .sort((a,b) => Number(b.performance?.pointsFor||0)-Number(a.performance?.pointsFor||0) || Number(b.performance?.wins||0)-Number(a.performance?.wins||0) || Number(b.performance?.pointDiff||0)-Number(a.performance?.pointDiff||0) || String(a.display_name||'').localeCompare(String(b.display_name||''),'en',{sensitivity:'base'}))
    .slice(0,3);
  const finalPodiumA = finalPodiumForSide('club_a');
  const finalPodiumB = finalPodiumForSide('club_b');
  const awardMethod = event?.pot_method || 'none';
  const awardTitle = awardMethod === 'points' ? 'Highest Scoring Players' : awardMethod === 'vote' ? 'Players of the Tournament' : 'Team Player Awards';
  const potTopCandidates = side => {
    const sidePlayers = participants.filter(p => p.side === side);
    const max = Math.max(0, ...sidePlayers.map(p => Number(potCounts[p.id] || 0)));
    return max > 0 ? sidePlayers.filter(p => Number(potCounts[p.id] || 0) === max) : [];
  };
  const potResultsForSide = side => participants
    .filter(p => p.side === side && Number(potCounts[p.id] || 0) > 0)
    .map(p => ({ ...p, voteCount:Number(potCounts[p.id] || 0) }))
    .sort((a,b) => b.voteCount - a.voteCount || String(a.display_name || '').localeCompare(String(b.display_name || '')));
  const potResultsA = potResultsForSide('club_a');
  const potResultsB = potResultsForSide('club_b');
  const potTopA = potTopCandidates('club_a');
  const potTopB = potTopCandidates('club_b');
  const potSavedA = potWinnersA[0] || null;
  const potSavedB = potWinnersB[0] || null;
  const potTieAUnresolved = event?.pot_status === 'closed' && potTopA.length > 1 && !potSavedA;
  const potTieBUnresolved = event?.pot_status === 'closed' && potTopB.length > 1 && !potSavedB;
  const potTieUnresolved = potTieAUnresolved || potTieBUnresolved;
  const potRemainingSeconds = event?.pot_status === 'open' && event?.pot_vote_closes_at
    ? Math.max(0, Math.ceil((Date.parse(event.pot_vote_closes_at) - timerNow) / 1000))
    : null;
  const potCountdownText = potRemainingSeconds === null
    ? 'Manual close'
    : `${Math.floor(potRemainingSeconds / 60)}:${String(potRemainingSeconds % 60).padStart(2, '0')}`;
  const showcaseDisplayActive = !!showcaseMatch && ['scheduled','in_progress','completed'].includes(showcaseMatch.status);
  const showcaseSideChangeRecent = !!showcaseMatch?.side_change_at && (timerNow - new Date(showcaseMatch.side_change_at).getTime()) < 20000;
  const displayVotingUrl = publicLinks?.votingUrl || '';
  const displayCompleted = ['completed','archived'].includes(event?.status);
  const displayFinalTitle = score.clubA === score.clubB ? 'Interclub Draw' : `${score.clubA > score.clubB ? event?.club_a_name : event?.club_b_name} win the Interclub`;

  if ((displayMode || displayOnly) && event && displayCompleted && !showcaseDisplayActive) return (
    <div className="min-h-screen bg-background p-5 sm:p-10 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-6xl text-center">
        <div className="flex items-start justify-between gap-4"><div className="flex-1"><p className="text-sm sm:text-lg uppercase tracking-[.28em] text-primary font-black">{INTERCLUB_MODULE_NAME} · Final Result</p></div>{!displayOnly && <Button variant="outline" onClick={() => setDisplayMode(false)}>Exit Display</Button>}</div>
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-10">
          <div className="flex flex-col items-center gap-3 rounded-3xl border bg-card p-5" style={{borderTopWidth:'8px',borderTopColor:event.club_a_primary_colour||'#2563eb',borderBottomWidth:'4px',borderBottomColor:event.club_a_secondary_colour||event.club_a_primary_colour||'#2563eb'}}>{event.club_a_logo_url&&<img src={event.club_a_logo_url} alt={`${event.club_a_name} logo`} className="w-24 h-24 sm:w-36 sm:h-36 object-contain rounded-2xl bg-white p-2"/>}<h2 className="text-2xl sm:text-5xl font-black">{event.club_a_name}</h2></div>
          <div><p className="text-xs sm:text-base uppercase tracking-widest text-muted-foreground">FINAL</p><p className="mt-2 text-6xl sm:text-9xl font-black tabular-nums text-primary">{score.clubA}–{score.clubB}</p></div>
          <div className="flex flex-col items-center gap-3 rounded-3xl border bg-card p-5" style={{borderTopWidth:'8px',borderTopColor:event.club_b_primary_colour||'#7f1d1d',borderBottomWidth:'4px',borderBottomColor:event.club_b_secondary_colour||event.club_b_primary_colour||'#7f1d1d'}}>{event.club_b_logo_url&&<img src={event.club_b_logo_url} alt={`${event.club_b_name} logo`} className="w-24 h-24 sm:w-36 sm:h-36 object-contain rounded-2xl bg-white p-2"/>}<h2 className="text-2xl sm:text-5xl font-black">{event.club_b_name}</h2></div>
        </div>
        <p className="mt-7 text-2xl sm:text-4xl font-black">{displayFinalTitle}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2" data-testid="cc-team-podiums">
          {[[event.club_a_name,event.club_a_primary_colour,finalPodiumA],[event.club_b_name,event.club_b_primary_colour,finalPodiumB]].map(([teamName,colour,podium])=><div key={teamName} className="rounded-3xl border bg-card p-4 sm:p-6" style={{borderTopWidth:'7px',borderTopColor:colour||'#2563eb'}}><p className="text-xs sm:text-sm font-black uppercase tracking-[.18em] text-muted-foreground">{teamName} · Top 3</p><div className="mt-4 grid grid-cols-3 gap-2 items-end">{podium.map((p,index)=><div key={p.id} className={`rounded-xl border flex flex-col justify-center ${index===0?'min-h-40 sm:min-h-44 px-3 py-4':index===1?'min-h-36 sm:min-h-40 px-3 py-3.5':'min-h-32 sm:min-h-36 px-3 py-3'}`}><div className={index===0?'text-4xl sm:text-5xl':index===1?'text-3xl sm:text-4xl':'text-2xl sm:text-3xl'}>{index===0?'🥇':index===1?'🥈':'🥉'}</div><p className="mt-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-muted-foreground">{index===0?'1st':index===1?'2nd':'3rd'}</p><p className={`mt-1 font-black leading-tight ${index===0?'text-base sm:text-lg':index===1?'text-sm sm:text-base':'text-sm'}`}>{privacyName(p.display_name, !!event.junior_display_mode)}</p><p className="mt-2 text-[10px] sm:text-xs text-muted-foreground">{p.performance?.pointsFor||0} pts · {p.performance?.wins||0}W · {(p.performance?.pointDiff||0)>0?'+':''}{p.performance?.pointDiff||0}</p></div>)}</div></div>)}
        </div>
        <HallPoweredByRallyHub />
      </div>
    </div>
  );

  if ((displayMode || displayOnly) && event) return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-4">
      {!networkOnline && <div className="rounded-lg bg-yellow-500 text-black px-4 py-3 font-semibold text-center">Connection lost — showing the last known state. RallyHub will resynchronise automatically when this device reconnects.</div>}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"><div className="flex-1 min-w-0 text-center"><p className="text-sm uppercase tracking-[.2em] text-primary font-bold">{INTERCLUB_MODULE_NAME} · Live Event View</p><div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-1.5 min-[390px]:gap-2 sm:gap-8"><div className="flex items-center justify-end gap-3 min-w-0 rounded-2xl border bg-card px-3 py-2" style={{borderTopWidth:'6px',borderTopColor:event.club_a_primary_colour||'#2563eb',borderBottomWidth:'3px',borderBottomColor:event.club_a_secondary_colour||event.club_a_primary_colour||'#2563eb'}}>{event.club_a_logo_url&&<img src={event.club_a_logo_url} alt="" className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl bg-white object-contain p-1"/>}<span className="text-lg sm:text-4xl font-black truncate">{event.club_a_name}</span></div><div className="flex items-center gap-2 sm:gap-3"><span className="text-4xl sm:text-7xl font-black tabular-nums whitespace-nowrap" style={{color:event.club_a_primary_colour||'#2563eb'}}>{score.clubA}</span><span className="text-3xl sm:text-6xl font-black text-muted-foreground">–</span><span className="text-4xl sm:text-7xl font-black tabular-nums whitespace-nowrap" style={{color:event.club_b_primary_colour||'#7f1d1d'}}>{score.clubB}</span></div><div className="flex items-center justify-start gap-3 min-w-0 rounded-2xl border bg-card px-3 py-2" style={{borderTopWidth:'6px',borderTopColor:event.club_b_primary_colour||'#7f1d1d',borderBottomWidth:'3px',borderBottomColor:event.club_b_secondary_colour||event.club_b_primary_colour||'#7f1d1d'}}><span className="text-lg sm:text-4xl font-black truncate">{event.club_b_name}</span>{event.club_b_logo_url&&<img src={event.club_b_logo_url} alt="" className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl bg-white object-contain p-1"/>}</div></div></div>{!displayOnly && <Button variant="outline" onClick={() => setDisplayMode(false)}>Exit Display</Button>}</div>
      {event.pot_enabled && event.pot_status === 'open' && <div className="rounded-2xl border-2 border-primary/40 bg-primary/10 p-4"><div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center"><div><p className="text-sm sm:text-lg font-black uppercase tracking-[.16em] text-primary">Players of the Tournament voting open</p><p className="mt-1 text-2xl sm:text-4xl font-black tabular-nums">{potCountdownText}</p><p className="mt-1 text-xs sm:text-sm text-muted-foreground">Scan the QR and choose one player from each team.</p></div>{displayVotingUrl&&<div className="rounded-xl bg-white p-2 shadow-sm"><QRCodeSVG value={displayVotingUrl} size={104}/></div>}</div></div>}
      {!showcaseDisplayActive && scheduledBreakHere && !breakActive && <div className="rounded-2xl border-2 border-red-500 bg-red-600 p-5 text-center text-white shadow-xl"><p className="text-xl sm:text-3xl font-black uppercase tracking-wider">Break after this round · {event.break_minutes} minutes</p><p className="mt-2 text-sm sm:text-base text-white/90">Round {currentRound + 1} will wait until the scheduled break is finished or the host ends it early.</p></div>}
      {showcaseDisplayActive ? <div className="flex min-h-[calc(100vh-10rem)] flex-col">
        <div className="flex flex-wrap justify-center gap-2"><Badge>{showcaseMatch.showcase_mode === 'exhibition' ? 'OPTIONAL SHOWCASE · EXHIBITION' : 'SHOWCASE TIEBREAK'}</Badge><Badge variant="outline">First to {showcaseMatch.showcase_target_points || 11} · win by {showcaseMatch.showcase_win_by || 1}</Badge></div>
        <div className="mt-4 flex-1 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-3 sm:gap-8">
          <div className="rounded-3xl border bg-card flex flex-col items-center justify-center p-4 sm:p-8 text-center" style={{borderTopWidth:'10px',borderTopColor:event.club_a_primary_colour||'#2563eb'}}>
            {event.club_a_logo_url && <img src={event.club_a_logo_url} alt={`${event.club_a_name} logo`} className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain rounded-2xl bg-white p-2 shadow-sm" />}
            <p className="mt-3 text-xl sm:text-3xl lg:text-4xl font-black">{event.club_a_name}</p>
            <p className="mt-2 text-sm sm:text-lg lg:text-xl text-muted-foreground font-semibold">{(showcaseMatch.club_a_names || []).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')}</p>
            <p className="mt-4 sm:mt-6 text-[clamp(5rem,18vw,14rem)] leading-none font-black tabular-nums">{showcaseMatch.score_a ?? 0}</p>
          </div>
          <div className="self-center text-xs sm:text-lg font-bold uppercase tracking-[.25em] text-muted-foreground">vs</div>
          <div className="rounded-3xl border bg-card flex flex-col items-center justify-center p-4 sm:p-8 text-center" style={{borderTopWidth:'10px',borderTopColor:event.club_b_primary_colour||'#7f1d1d'}}>
            {event.club_b_logo_url && <img src={event.club_b_logo_url} alt={`${event.club_b_name} logo`} className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain rounded-2xl bg-white p-2 shadow-sm" />}
            <p className="mt-3 text-xl sm:text-3xl lg:text-4xl font-black">{event.club_b_name}</p>
            <p className="mt-2 text-sm sm:text-lg lg:text-xl text-muted-foreground font-semibold">{(showcaseMatch.club_b_names || []).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')}</p>
            <p className="mt-4 sm:mt-6 text-[clamp(5rem,18vw,14rem)] leading-none font-black tabular-nums">{showcaseMatch.score_b ?? 0}</p>
          </div>
        </div>
        {showcaseSideChangeRecent && <div className="mt-4 rounded-2xl bg-red-600 px-4 py-4 text-center text-3xl sm:text-5xl font-black text-white shadow-xl">CHANGE ENDS</div>}
        {showcaseMatch.status === 'completed' && <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-4 text-center text-xl sm:text-3xl font-black">{showcaseMatch.winner === 'club_a' ? event.club_a_name : event.club_b_name} won the Showcase {showcaseMatch.score_a}–{showcaseMatch.score_b}</div>}
        {showcaseMatch.showcase_mode === 'exhibition' && <p className="mt-3 text-center text-sm text-muted-foreground">Exhibition only · the Interclub result above is unchanged</p>}
        <HallPoweredByRallyHub />
      </div> : <div className={cn('rounded-2xl border p-6 text-center', breakActive ? 'border-red-400 bg-red-600 text-white shadow-xl' : 'border-border bg-card')}><p className={cn('text-lg uppercase tracking-widest', breakActive ? 'font-black text-white' : 'text-muted-foreground')}>{breakActive ? 'BREAK NOW' : <>{roundLabel(currentRound)} · {timerState?.phase || 'idle'}</>}</p><p className="text-7xl sm:text-9xl font-bold tabular-nums mt-2">{fmtTimer(timerRemaining)}</p>{breakActive && <p className="mt-3 text-sm sm:text-lg text-white/90">Enjoy the break · Round {currentRound + 1} is up next</p>}</div>}
      {!showcaseDisplayActive && !breakActive && <div><h2 className="text-xl font-bold mb-3">On Court Now</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{currentDisplayMatches.map(m => <div key={m.id} className="rounded-xl border border-border bg-card p-4"><p className="text-primary font-bold">Court {m.court_number}</p><p className="text-lg font-semibold mt-2">{(m.club_a_names||[]).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')}</p><p className="text-sm text-muted-foreground my-1">vs</p><p className="text-lg font-semibold">{(m.club_b_names||[]).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')}</p>{['completed','draw'].includes(m.status) && <p className="text-2xl font-bold mt-3">{m.score_a}–{m.score_b}</p>}</div>)}</div></div>}
      {!showcaseDisplayActive && !breakActive && currentSittingOut.length > 0 && <div className="rounded-xl border border-border bg-card/70 p-4"><h2 className="text-lg font-bold">Resting This Round</h2><div className="flex flex-wrap gap-2 mt-3">{currentSittingOut.map(p => <span key={p.id} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">{privacyName(p.display_name, !!event.junior_display_mode)}</span>)}</div></div>}
      {!showcaseDisplayActive && <div><h2 className="text-xl font-bold mb-3">{breakActive ? 'After the Break' : 'Up Next'} · Round {currentRound + 1}</h2><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{nextDisplayMatches.map(m => <div key={m.id} className="rounded-xl bg-secondary/50 p-4"><p className="font-bold">Court {m.court_number}</p><p className="text-sm mt-1">{(m.club_a_names||[]).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')} vs {(m.club_b_names||[]).map(n => privacyName(n, !!event.junior_display_mode)).join(' & ')}</p></div>)}</div></div>}
      <p className="text-xs text-muted-foreground text-center">Read-only display · no email, phone or private participant information{event.junior_display_mode ? ' · junior privacy mode active' : ''}</p>
      <HallPoweredByRallyHub />
    </div>
  );

  return (
    <div data-testid="cc-root" className="space-y-4 print:space-y-0">
      {hostAction && <div className="print:hidden sticky top-2 z-40 rounded-xl border-2 border-primary/40 bg-background/95 p-3 shadow-lg"><p className="text-sm font-bold text-primary">{hostAction}</p><p className="text-xs text-muted-foreground mt-1">RallyHub has accepted your tap. Keep this screen open; the control stays locked until the action resolves.</p></div>}
      {typeof document !== 'undefined' && event && ['draw_approved','in_progress','paused','completed','archived'].includes(event.status) ? createPortal(
        <div className="rhpp-print-host"><InterclubPrintPack event={event} tournament={tournament} matches={matches} participants={participants} score={score} overallScore={overallScore} showcaseMatch={showcaseMatch} sections={printSelection} displayUrl={publicLinks?.displayUrl || ''} votingUrl={printSelection.includeVotingQr ? (publicLinks?.votingUrl || '') : ''} wifiSsid={venueOptions.find(v => String(v.id) === String(tournament?.venue_id || ''))?.wifi_ssid || ''} wifiPassword={venueOptions.find(v => String(v.id) === String(tournament?.venue_id || ''))?.wifi_password || ''} /></div>,
        document.body
      ) : null}
      {printPackOpen && <div className="print:hidden fixed inset-0 z-[100] bg-black/55 flex items-center justify-center p-4" onMouseDown={e => { if (e.target === e.currentTarget) setPrintPackOpen(false); }}>
        <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div><h2 className="text-lg font-bold">Choose sheets to print</h2><p className="text-xs text-muted-foreground mt-1">Only the sheets you select will be sent to the printer.</p></div>
            <button type="button" className="text-muted-foreground hover:text-foreground text-xl leading-none px-2" onClick={() => setPrintPackOpen(false)} aria-label="Close">×</button>
          </div>
          {event?.event_pack_stale && <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3"><p className="text-sm font-black text-amber-700 dark:text-amber-300">EVENT PACK · OUT OF DATE</p><p className="mt-1 text-xs text-muted-foreground">Fixtures have changed since this pack was last approved. You can still open, review and print the sheets; re-approve the draw before using the pack as the current authoritative event pack.</p></div>}
          <div className="space-y-2">
            {[
              { key:'score', label:'Master Score Sheet', pages:Math.max(1, Math.ceil(Math.max(1, plannedRounds) / 12)), orientation:'L', orientationLabel:'Landscape', note:'Blank score boxes for use during the event' },
              ...(hasPlannedHandoverCopy ? [{ key:'handoverScore', label:`Master Score Sheet · Handover from Round ${firstPlannedHandoverRound}`, pages:handoverScorePages, orientation:'L', orientationLabel:'Landscape', note:'Uses recorded replacements and the effective round automatically' }] : []),
              { key:'schedule', label:'Master Schedule / Court Assignment', pages:Math.max(1, Math.ceil(Math.max(1, plannedRounds) / 2)), orientation:'P', orientationLabel:'Portrait', note:'Two rounds per A4 page' },
              { key:'roster', label:'Team Rosters / Check-In', pages:2, orientation:'P', orientationLabel:'Portrait', note:'Private ranked host copy + alphabetical player check-in copy' },
              { key:'briefing', label:'Event Briefing & Rules', pages:1, orientation:'P', orientationLabel:'Portrait', note:'Rules, Interclub etiquette, player link and venue Wi‑Fi on one A4 page' },
              { key:'final', label:'Final Result / Sign-off', pages:1, orientation:'P', orientationLabel:'Portrait', note:['completed','archived'].includes(event?.status) ? 'Completed result and signatures' : 'Available after the event is completed', disabled:!['completed','archived'].includes(event?.status) },
            ].map(item => <label key={item.key} className={cn('flex items-start gap-3 rounded-xl border p-3 transition-colors', item.disabled ? 'opacity-50 cursor-not-allowed bg-muted/30' : 'cursor-pointer hover:bg-secondary/40', printSelection[item.key] && !item.disabled ? 'border-primary/50 bg-primary/5' : 'border-border')}>
              <input type="checkbox" className="mt-1 h-4 w-4 accent-current" checked={!!printSelection[item.key] && !item.disabled} disabled={item.disabled} onChange={e => setPrintSelection(prev => ({ ...prev, [item.key]:e.target.checked }))} />
              <span className="flex-1 min-w-0"><span className="flex items-center justify-between gap-3"><strong className="text-sm">{item.label}</strong><span className="flex items-center gap-2 whitespace-nowrap"><span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-secondary px-1.5 text-[10px] font-black" title={item.orientationLabel}>{item.orientation}</span><span className="text-xs font-semibold text-muted-foreground">{item.pages} page{item.pages === 1 ? '' : 's'}</span></span></span><span className="block text-[11px] text-muted-foreground mt-1">{item.note} · {item.orientationLabel}</span></span>
            </label>)}
          </div>
          {printSelection.briefing && <label className="mt-3 flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-3 cursor-pointer"><input type="checkbox" className="mt-1 h-4 w-4 accent-current" checked={!!printSelection.includeVotingQr} onChange={e=>setPrintSelection(prev=>({...prev,includeVotingQr:e.target.checked}))}/><span><strong className="text-sm">Include separate voting QR</strong><span className="block text-[11px] text-muted-foreground mt-0.5">Off by default. The normal Player Link remains in the pack.</span></span></label>}
          <div className="mt-3 rounded-xl border border-border bg-secondary/20 p-3">
            <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">Print orientation</p><p className="mt-0.5 text-[11px] text-muted-foreground">Recommended keeps the Master Score Sheet landscape and the other Event Pack sheets portrait. Choose Printer controls if you want the browser/printer orientation selector available.</p></div><span className="rounded-md border bg-background px-2 py-1 text-[10px] font-black">{printOrientation === 'recommended' ? 'AUTO' : printOrientation === 'landscape' ? 'L' : printOrientation === 'portrait' ? 'P' : 'PRINTER'}</span></div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[['recommended','Recommended'],['landscape','Landscape'],['portrait','Portrait'],['printer','Printer controls']].map(([value,label])=><button key={value} type="button" onClick={()=>setPrintOrientation(value)} className={cn('min-h-9 rounded-lg border px-2 py-1.5 text-[11px] font-semibold',printOrientation===value?'border-primary bg-primary/10 text-primary':'border-border bg-background hover:bg-secondary')}>{label}</button>)}
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-secondary/40 px-3 py-2 flex items-center justify-between gap-3 text-sm">
            <span>Selected print total</span>
            <strong>{(
              (printSelection.score ? Math.max(1, Math.ceil(Math.max(1, plannedRounds) / 12)) : 0) +
              (printSelection.handoverScore && hasPlannedHandoverCopy ? handoverScorePages : 0) +
              (printSelection.schedule ? Math.max(1, Math.ceil(Math.max(1, plannedRounds) / 2)) : 0) +
              (printSelection.roster ? 2 : 0) +
              (printSelection.briefing ? 1 : 0) +
              (printSelection.final && ['completed','archived'].includes(event?.status) ? 1 : 0)
            )} page{(
              (printSelection.score ? Math.max(1, Math.ceil(Math.max(1, plannedRounds) / 12)) : 0) +
              (printSelection.handoverScore && hasPlannedHandoverCopy ? handoverScorePages : 0) +
              (printSelection.schedule ? Math.max(1, Math.ceil(Math.max(1, plannedRounds) / 2)) : 0) +
              (printSelection.roster ? 2 : 0) +
              (printSelection.briefing ? 1 : 0) +
              (printSelection.final && ['completed','archived'].includes(event?.status) ? 1 : 0)
            ) === 1 ? '' : 's'}</strong>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-5">
            <Button variant="outline" onClick={() => setPrintPackOpen(false)}>Cancel</Button>
            <Button onClick={confirmPrintEventPack}>Print selected sheets</Button>
          </div>
        </div>
      </div>}
      <div className="print:hidden glass rounded-xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-primary" /></div>
          <div><p className="font-semibold text-foreground">{INTERCLUB_MODULE_NAME}</p><p className="text-xs text-muted-foreground">{event ? `${INTERCLUB_EVENT_LABEL} · Status: ${event.status.replaceAll('_', ' ')}` : `Configure an ${INTERCLUB_EVENT_LABEL}`}</p></div>
        </div>
        {event && <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"><div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:flex items-center gap-1.5 sm:gap-2 w-full lg:w-auto min-w-0"><ClubBadge name={event.club_a_name} logo={event.club_a_logo_url} primary={event.club_a_primary_colour} secondary={event.club_a_secondary_colour} /><span className="text-xs text-muted-foreground text-center">vs</span><ClubBadge name={event.club_b_name} logo={event.club_b_logo_url} primary={event.club_b_primary_colour} secondary={event.club_b_secondary_colour} /></div>{!networkOnline && <Badge className="bg-yellow-500/10 text-yellow-400">OFFLINE · not saved</Badge>}{pendingScores.length > 0 && <><Badge variant="outline">{pendingScores.length} unsynchronised</Badge>{networkOnline && <Button variant="outline" size="sm" onClick={retryPendingScores}>Retry Sync</Button>}</>}{['in_progress','paused','completed'].includes(event.status) && <Button variant="outline" size="sm" onClick={() => setDisplayMode(true)}>Live Event View</Button>}{hasManagePermission && <Button variant="outline" size="sm" onClick={preparePublicLinks}>Player Link / QR</Button>}{['draw_approved','in_progress','paused','completed'].includes(event.status) && <Button variant="outline" size="sm" onClick={printEventPack}>{event.event_pack_stale ? 'Print Sheets · OUT OF DATE' : `Print Sheets · Pack v${event.event_pack_version || event.draw_version || 1}`}</Button>}</div>}
      </div>
      {base44Pressure.count>0&&<div data-testid="cc-base44-pressure-status" className={cn('print:hidden rounded-lg border px-3 py-2 text-xs font-semibold',base44Pressure.recoveredAt&&(!base44Pressure.lastAt||Date.parse(base44Pressure.recoveredAt)>=Date.parse(base44Pressure.lastAt))?'border-emerald-500/30 bg-emerald-500/10 text-emerald-800':'border-amber-500/40 bg-amber-500/10 text-amber-800')}><span className="font-black">Base44 capacity protection:</span> {base44Pressure.count} transient pressure event{base44Pressure.count===1?'':'s'} detected{base44Pressure.lastFunction?` · last on ${base44Pressure.lastFunction}`:''}. {base44Pressure.recoveredAt&&(!base44Pressure.lastAt||Date.parse(base44Pressure.recoveredAt)>=Date.parse(base44Pressure.lastAt))?'RallyHub recovered automatically.':'RallyHub is retrying with backoff; do not double-tap the action.'}</div>}

      {event && hasManagePermission && <div data-testid="cc-tournament-update" className="print:hidden rounded-xl border border-amber-400/40 bg-amber-500/5 p-4 space-y-3"><div className="flex items-start gap-2"><Megaphone className="mt-0.5 h-5 w-5 text-amber-600"/><div><p className="text-sm font-black">Tournament Update</p><p className="text-xs text-muted-foreground">Publish a last-minute message to the Player Link. You can also email every active player who has an email address.</p></div></div><div className="space-y-1"><Label className="text-xs font-bold">Email template</Label><Select value={tournamentUpdateTemplateId} onValueChange={setTournamentUpdateTemplateId}><SelectTrigger className="w-full sm:max-w-md"><SelectValue placeholder="Choose email template"/></SelectTrigger><SelectContent>{(tournamentUpdateInfo?.templates?.length?tournamentUpdateInfo.templates:[{id:'clare_interclub_approved',name:'Clare v Galway Interclub — Approved'}]).map(t=><SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select><p className="text-[10px] text-muted-foreground">Locked approved artwork. Preview shows the same template used for sending.</p></div>{tournamentUpdateInfo?.update?.message&&<div className="rounded-lg border bg-background p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Currently live</p><p className="mt-1 whitespace-pre-line text-sm font-semibold">{tournamentUpdateInfo.update.message}</p><p className="mt-2 text-[10px] text-muted-foreground">{tournamentUpdateInfo.update.email_sent_at?`Email sent ${tournamentUpdateInfo.update.email_sent_count||0}/${tournamentUpdateInfo.update.email_recipient_count||0}`:'Published to Player Link only'} · {tournamentUpdateInfo.update.expiry_mode==='event_start'?'Banner hides when the event starts':tournamentUpdateInfo.update.expires_at?`Banner expires ${new Date(tournamentUpdateInfo.update.expires_at).toLocaleString('en-IE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}`:'Banner stays until removed'}</p></div>}{tournamentUpdateInfo?.update?.email_sent_at&&<div data-testid="cc-tournament-update-delivery-confirmation" className={cn('rounded-xl border p-4',Number(tournamentUpdateInfo.update.email_failed_count||0)>0?'border-amber-400/40 bg-amber-500/10 text-amber-800':'border-emerald-500/30 bg-emerald-500/10 text-emerald-800')}><p className="text-sm font-black">{Number(tournamentUpdateInfo.update.email_failed_count||0)>0?'Tournament Update sent with delivery issues':'Tournament Update sent successfully ✓'}</p><p className="mt-1 text-sm font-semibold">{Number(tournamentUpdateInfo.update.email_sent_count||0)} of {Number(tournamentUpdateInfo.update.email_recipient_count||0)} player email{Number(tournamentUpdateInfo.update.email_recipient_count||0)===1?'':'s'} sent{Number(tournamentUpdateInfo.update.email_failed_count||0)>0?` · ${Number(tournamentUpdateInfo.update.email_failed_count||0)} failed`:''}.</p><p className="mt-1 text-xs">The update is also published on the Player Link. The greyed-out button simply means the sent message box was cleared to prevent an accidental duplicate send.</p></div>}<textarea data-testid="cc-tournament-update-message" value={tournamentUpdateDraft} onChange={e=>setTournamentUpdateDraft(e.target.value)} maxLength={2000} rows={4} placeholder="Type the player update here…" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"/><div className="grid gap-2 sm:grid-cols-[minmax(0,260px)_140px_1fr] sm:items-end"><div><Label className="text-xs font-bold">Show on Player Link until</Label><Select value={tournamentUpdateExpiryMode} onValueChange={setTournamentUpdateExpiryMode}><SelectTrigger data-testid="cc-tournament-update-expiry" className="mt-1 bg-background"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="event_start">Event starts · recommended</SelectItem><SelectItem value="30m">30 minutes</SelectItem><SelectItem value="60m">1 hour</SelectItem><SelectItem value="120m">2 hours</SelectItem><SelectItem value="custom">Custom minutes</SelectItem><SelectItem value="manual">I remove it manually</SelectItem></SelectContent></Select></div>{tournamentUpdateExpiryMode==='custom'?<div><Label className="text-xs font-bold">Minutes</Label><Input type="number" min="5" max="1440" value={tournamentUpdateCustomMinutes} onChange={e=>setTournamentUpdateCustomMinutes(e.target.value)} className="mt-1 bg-background"/></div>:<div className="hidden sm:block"/>}<p className="text-[10px] text-muted-foreground sm:pb-2">Expiry only removes the banner from the Player Link. Any email already sent remains in the player’s inbox.</p></div><div className="flex flex-col sm:flex-row gap-2"><Button type="button" variant="outline" disabled={tournamentUpdateBusy||!tournamentUpdateDraft.trim()} onClick={()=>publishTournamentUpdate(false)}>Publish to Player Link</Button><Button type="button" variant="outline" disabled={!tournamentUpdateDraft.trim()||tournamentUpdatePreviewBusy} onClick={previewTournamentUpdateEmail}>{tournamentUpdatePreviewBusy?'Loading Preview…':'Preview Email'}</Button><div className="flex min-w-[280px] flex-1 gap-2"><input type="email" aria-label="Test email address" value={tournamentUpdateTestEmail} onChange={e=>setTournamentUpdateTestEmail(e.target.value)} placeholder="Test email address" className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"/><Button type="button" variant="outline" disabled={!tournamentUpdateDraft.trim()||!tournamentUpdateTestEmail.trim()||tournamentUpdateTestBusy} onClick={sendTournamentUpdateTestEmail}>{tournamentUpdateTestBusy?'Sending Test…':'Send Test Email'}</Button></div><Button data-testid="cc-publish-email-tournament-update" type="button" disabled={tournamentUpdateBusy||!tournamentUpdateDraft.trim()||!Number(tournamentUpdateInfo?.emailRecipients||0)} onClick={()=>publishTournamentUpdate(true)}>{tournamentUpdateBusy?'Publishing…':`Publish & Email Players (${Number(tournamentUpdateInfo?.emailRecipients||0)})`}</Button>{tournamentUpdateInfo?.update?.message&&<Button type="button" variant="ghost" disabled={tournamentUpdateBusy} onClick={removeTournamentUpdate}>Remove</Button>}</div><p className="text-[10px] text-muted-foreground">Active roster: {Number(tournamentUpdateInfo?.eligiblePlayers||participants.filter(p=>['club_a','club_b'].includes(p.side)&&!['withdrawn','replaced'].includes(p.status)).length)} players · {Number(tournamentUpdateInfo?.emailRecipients||0)} unique email recipients. Editing/publishing a new update never automatically resends an earlier email.</p></div>}
      {tournamentUpdatePreviewOpen && <div className="print:hidden fixed inset-0 z-[100] bg-black/60 p-4 flex items-center justify-center" onClick={()=>setTournamentUpdatePreviewOpen(false)}><div className="w-full max-w-3xl max-h-[94vh] overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="p-4 border-b flex items-center justify-between"><div><p className="font-black">Email Preview</p><p className="text-xs text-slate-500">Exact HTML used for sending · nothing has been sent</p></div><Button type="button" variant="outline" size="sm" onClick={()=>setTournamentUpdatePreviewOpen(false)}>Close</Button></div><iframe title="Tournament Update email preview" srcDoc={tournamentUpdatePreviewHtml} className="w-full h-[76vh] border-0 bg-white" sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"/></div></div>}
      {publicLinks && <div className="print:hidden rounded-xl border border-primary/20 bg-card p-4 space-y-4"><div><p className="text-sm font-semibold">Interclub Player Link</p><p className="text-xs text-muted-foreground">One player link for teams, event information, live/final results and Player of the Tournament voting when the host opens it.</p></div><div className="rounded-lg bg-secondary/40 p-4 flex flex-col sm:flex-row gap-4 items-center"><QRCodeSVG value={publicLinks.displayUrl} size={132} level="H" includeMargin/><div className="min-w-0 flex-1"><p className="text-xs font-semibold">Player Link</p><a href={publicLinks.displayUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary underline underline-offset-2 break-all mt-1 block">{publicLinks.displayUrl}</a><div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(publicLinks.displayUrl)}>Copy</Button>{isSuperAdmin && <><Button size="sm" variant="outline" onClick={() => sharePublicLink(publicLinks.displayUrl,'RallyHub Interclub Player Link')}>Share</Button><Button size="sm" variant="outline" onClick={() => shareOnWhatsApp(publicLinks.displayUrl,'RallyHub Interclub Player Link')}>WhatsApp</Button></>}</div></div></div></div>}

      <div className="print:hidden rounded-xl border border-border bg-card/50 p-2 sm:p-3">
        <div className="flex overflow-x-auto gap-1 sm:gap-2 -mx-1 px-1 pb-1 snap-x scrollbar-none">
          {TABS.map(([id, label], index) => {
            const complete = index < stageIndex;
            const current = index === stageIndex;
            return (
              <button key={id} data-testid={`cc-tab-${id}`} onClick={() => {
                if (tab === 'teams' && teamsDirty && id !== 'teams') { toast.warning('Save Teams & Rankings before leaving Teams. Your unsaved allocation and ranking draft is protected on this device.'); return; }
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
                    {(side === 'A' ? setup.clubALogo : setup.clubBLogo) ? <img src={side === 'A' ? setup.clubALogo : setup.clubBLogo} alt={`${setup[nameKey]} logo`} className="w-16 h-16 rounded-xl object-contain bg-white p-1 shrink-0" /> : <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0"><ImagePlus className="w-5 h-5 text-muted-foreground" /></div>}
                    <div className="flex-1 min-w-0 space-y-2">
                      <Input type="file" accept="image/*" disabled={logoUploading === side} onChange={e => { chooseClubLogo(side, e.target.files?.[0]); e.target.value=''; }} className="bg-secondary text-xs" />
                      {(side === 'A' ? setup.clubALogo : setup.clubBLogo) && <Button type="button" size="sm" variant="outline" disabled={logoUploading === side} onClick={() => adjustCurrentClubLogo(side)}>Resize / reposition current logo</Button>}
                      <p className="text-[10px] text-muted-foreground">{side === 'A' ? 'Uses the saved host-club logo automatically when available. RallyHub trims padding and lets you size and position it for this event.' : 'Upload the visiting club logo, then size and position it so both club crests have equal visual weight.'}</p>
                    </div>
                  </div>
                  {logoDraft?.side === side && <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4" data-testid={`cc-logo-editor-${side}`}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="shrink-0">
                        <p className="text-xs font-semibold mb-2">Logo preview</p>
                        <div className="relative h-40 w-40 overflow-hidden rounded-2xl border-2 border-border bg-white shadow-inner">
                          <img src={logoDraft.url} alt="Positioned club logo preview" draggable="false" className="absolute max-w-none select-none pointer-events-none" style={{
                            width: `${Math.max(1, logoDraft.width) * Math.min((160 * 0.88) / Math.max(1, logoDraft.width), (160 * 0.88) / Math.max(1, logoDraft.height)) * logoDraft.zoom}px`,
                            height: `${Math.max(1, logoDraft.height) * Math.min((160 * 0.88) / Math.max(1, logoDraft.width), (160 * 0.88) / Math.max(1, logoDraft.height)) * logoDraft.zoom}px`,
                            left:'50%', top:'50%', transform:`translate(calc(-50% + ${logoDraft.offsetX * 0.8}px), calc(-50% + ${logoDraft.offsetY * 0.8}px))`
                          }} />
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div><div className="flex items-center justify-between gap-2"><Label className="text-xs">Size</Label><span className="text-[10px] text-muted-foreground">{Math.round(logoDraft.zoom * 100)}%</span></div><input aria-label={`${label} logo size`} type="range" min="0.7" max="2" step="0.02" value={logoDraft.zoom} onChange={e => setLogoDraft(d => ({ ...d, zoom:Number(e.target.value) }))} className="mt-1 w-full accent-primary" /></div>
                        <div><div className="flex items-center justify-between gap-2"><Label className="text-xs">Move left / right</Label><span className="text-[10px] text-muted-foreground">{logoDraft.offsetX}</span></div><input aria-label={`${label} logo horizontal position`} type="range" min="-100" max="100" step="1" value={logoDraft.offsetX} onChange={e => setLogoDraft(d => ({ ...d, offsetX:Number(e.target.value) }))} className="mt-1 w-full accent-primary" /></div>
                        <div><div className="flex items-center justify-between gap-2"><Label className="text-xs">Move up / down</Label><span className="text-[10px] text-muted-foreground">{logoDraft.offsetY}</span></div><input aria-label={`${label} logo vertical position`} type="range" min="-100" max="100" step="1" value={logoDraft.offsetY} onChange={e => setLogoDraft(d => ({ ...d, offsetY:Number(e.target.value) }))} className="mt-1 w-full accent-primary" /></div>
                        <p className="text-[10px] text-muted-foreground">The saved file is a square, centred event logo. That keeps both clubs the same display size on the host screen, Live Event View and print pack.</p>
                        <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={resetClubLogoDraft}>Reset</Button><Button type="button" size="sm" variant="ghost" onClick={cancelClubLogoDraft}>Cancel</Button><Button type="button" size="sm" onClick={applyClubLogoDraft} disabled={logoUploading === side}>{logoUploading === side ? 'Saving logo…' : 'Apply logo'}</Button></div>
                      </div>
                    </div>
                  </div>}
                </div>
                <div className="grid grid-cols-2 gap-3"><div><Label className="text-xs">Primary</Label><Input type="color" value={setup[primaryKey]} onChange={e => setSetup(s => ({ ...s, [primaryKey]: e.target.value }))} className="mt-1 h-10 bg-secondary" /></div><div><Label className="text-xs">Accent</Label><Input type="color" value={setup[secondaryKey]} onChange={e => setSetup(s => ({ ...s, [secondaryKey]: e.target.value }))} className="mt-1 h-10 bg-secondary" /></div></div>
              </div>
            ))}
          </div>
          <div className="glass rounded-xl p-4 sm:p-5 space-y-4">
            <p className="text-sm font-semibold">Event Configuration</p>
            <div className="grid sm:grid-cols-[1fr_180px] gap-3">
              <div>
                <Label className="text-xs">Venue</Label>
                <Input data-testid="cc-venue" list="cc-venue-options" value={setup.venue} onChange={e => setSetup(s => ({ ...s, venue:e.target.value }))} placeholder="Choose or type a venue" className="mt-1 bg-secondary" />
                <datalist id="cc-venue-options">{venueOptions.map(v => <option key={v.id} value={v.name}>{v.address || ''}</option>)}</datalist>
                <p className="text-[10px] text-muted-foreground mt-1">Choose a saved club venue, or type a new venue and RallyHub will save it for reuse.</p>
              </div>
              <div>
                <Label className="text-xs">Hall booking start</Label>
                <Input data-testid="cc-scheduled-start-time" type="time" value={setup.scheduledStartTime || ''} onChange={e => setSetup(s => ({ ...s, scheduledStartTime:e.target.value }))} className="mt-1 bg-secondary" />
                <p className="text-[10px] text-muted-foreground mt-1">Used with Available min to protect the booked finish time.</p>
              </div>
            </div>
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
              <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.potEnabled} onChange={e => setSetup(s => ({ ...s, potEnabled:e.target.checked, ...(e.target.checked ? { spotPrizeEnabled:false } : {}) }))} /> Team player awards · choose Highest Scorer or Player Vote at the end</label>
              <div className="rounded-lg bg-secondary/40 px-3 py-2.5 space-y-2"><label className="flex items-center gap-3 min-h-8"><input className="w-4 h-4" type="checkbox" checked={setup.spotPrizeEnabled} onChange={e => setSetup(s => ({ ...s, spotPrizeEnabled:e.target.checked, ...(e.target.checked ? { potEnabled:false } : {}) }))} /><span className="text-sm">Spot Prize Draw · random names from the eligible event roster</span></label>{setup.spotPrizeEnabled&&<div className="grid sm:grid-cols-2 gap-2"><div><Label className="text-xs">Draw pool</Label><Select value={setup.spotPrizeMode} onValueChange={v=>setSetup(s=>({...s,spotPrizeMode:v}))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all_players">All players · one hat</SelectItem><SelectItem value="per_team">One team at a time</SelectItem></SelectContent></Select></div><div><Label className="text-xs">{setup.spotPrizeMode==='per_team'?'Prizes per team':'Number of prizes'}</Label><Input type="number" min="1" max={setup.spotPrizeMode==='per_team'?8:16} value={setup.spotPrizeCount} onChange={e=>setSetup(s=>({...s,spotPrizeCount:e.target.value}))} className="mt-1 bg-secondary" /></div></div>}<p className="text-[10px] text-muted-foreground">Independent of scores, rankings and sporting results. Winners are drawn server-side and shown live on player screens.</p></div>
              <label className="flex items-center gap-3 min-h-10 rounded-lg bg-secondary/40 px-3"><input className="w-4 h-4" type="checkbox" checked={setup.juniorDisplayMode} onChange={e => setSetup(s => ({ ...s, juniorDisplayMode: e.target.checked }))} /> Junior display privacy (first name + surname initial)</label>
            </div>
          </div>
          {event && <div className="glass rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div><p className="text-sm font-semibold">Interclub Player Link</p><p className="mt-1 text-xs text-muted-foreground">One link for teams, event information, live/final results and voting when it opens.</p></div>
              {!publicLinks && <Button type="button" size="sm" variant="outline" onClick={preparePublicLinks}>Prepare Player Link</Button>}
            </div>
            {publicLinks && <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4 flex flex-col sm:flex-row items-center gap-4">
              <QRCodeSVG value={publicLinks.displayUrl} size={124} level="H" includeMargin/>
              <div className="min-w-0 flex-1 w-full">
                <a href={publicLinks.displayUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline underline-offset-2 break-all">{publicLinks.displayUrl}</a>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(publicLinks.displayUrl)}>Copy Link</Button>
                  {isSuperAdmin && <><Button type="button" size="sm" variant="outline" onClick={() => sharePublicLink(publicLinks.displayUrl,'RallyHub Interclub Player Link')}>Share</Button><Button type="button" size="sm" variant="outline" onClick={() => shareOnWhatsApp(publicLinks.displayUrl,'RallyHub Interclub Player Link')}>WhatsApp</Button></>}
                </div>
              </div>
            </div>}
          </div>}
          <Button data-testid="cc-save-setup" onClick={saveSetup} disabled={!isAdmin || saving || !!logoUploading || !!logoDraft} className="w-full h-11">{logoDraft ? 'Apply or cancel logo edit first' : logoUploading ? 'Saving logo…' : saving ? 'Saving…' : event ? 'Save & Continue to Teams' : 'Create & Continue to Teams'}</Button>
        </div>
      )}

      {tab === 'teams' && (
        <div className="space-y-4">
          {!event ? <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">Save Setup first.</div> : <>
            <div className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div><p className="text-sm font-semibold">Participants</p><p className="text-xs text-muted-foreground">Event ranks are independent of permanent RallyHub skill ratings.</p></div>
              <Button data-testid="cc-load-practice" variant="outline" className="w-full sm:w-auto min-h-11" onClick={loadTestRoster} disabled={locked || saving || !canManageEvent}><Users className="w-4 h-4 mr-2" />Practice with 32 Test Players</Button>
            </div>
            <div className="glass rounded-xl p-4 sm:p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold">Guest Player Registration</p>
                <p className="mt-1 text-xs text-muted-foreground">Send the appropriate team link to guest or visiting players. Each player enters their own contact and emergency details and accepts the event waiver, Code of Conduct and privacy notice. They are added directly to that team as event-only players, not club members. Social / Improver and ranking stay under organiser control.</p>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {[
                  ['club_a', setup.clubAName || event.club_a_name || 'Team A'],
                  ['club_b', setup.clubBName || event.club_b_name || 'Team B'],
                ].map(([side, teamName]) => {
                  const url = registrationLinks[side];
                  const managerUrl = teamManagerLinks[side];
                  const savedAt = side === 'club_a' ? event.club_a_roster_saved_at : event.club_b_roster_saved_at;
                  return <div key={side} className="rounded-xl border border-border bg-secondary/30 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0"><p className="text-sm font-bold truncate">{teamName}</p><p className="text-[10px] text-muted-foreground">Guest registration link</p></div>
                      {!url && <Button type="button" size="sm" variant="outline" disabled={registrationLinkBusy === side || locked || !canManageEvent} onClick={() => prepareRegistrationLink(side)}>{registrationLinkBusy === side ? 'Preparing…' : 'Prepare Link'}</Button>}
                    </div>
                    {url && <div className="mt-3 flex flex-col sm:flex-row gap-3 items-center">
                      <QRCodeSVG value={url} size={96} level="H" includeMargin />
                      <div className="min-w-0 flex-1 w-full">
                        <a href={url} target="_blank" rel="noreferrer" className="block break-all text-[10px] text-primary underline underline-offset-2">{url}</a>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(url)}>Copy</Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => shareOnWhatsApp(url, `${teamName} Guest Registration`)}>WhatsApp</Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => window.open(url,'_blank','noopener,noreferrer')}>Open Form</Button>
                        </div>
                      </div>
                    </div>}
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold">Team Manager Link</p>{savedAt ? <Badge className="bg-primary/10 text-primary">Team saved</Badge> : <Badge className="bg-amber-500/10 text-amber-700">Needs saving</Badge>}</div><p className="mt-1 text-[10px] text-muted-foreground">Give this to the team captain/manager. They see only this team and can repeatedly edit rank, Social/Improver and Rotation/Reserve as registrations change.</p></div>
                        {!managerUrl && <Button data-testid={`cc-team-manager-link-${side}`} type="button" size="sm" variant="outline" disabled={teamManagerLinkBusy === side || locked || !canManageEvent} onClick={() => prepareTeamManagerLink(side)}>{teamManagerLinkBusy === side ? 'Preparing…' : 'Prepare Manager Link'}</Button>}
                      </div>
                      {managerUrl && <div className="mt-3 rounded-lg border border-primary/20 bg-background/70 p-3"><a href={managerUrl} target="_blank" rel="noreferrer" className="block break-all text-[10px] text-primary underline underline-offset-2">{managerUrl}</a><div className="mt-2 flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(managerUrl)}>Copy</Button><Button type="button" size="sm" variant="outline" onClick={() => shareOnWhatsApp(managerUrl, `${teamName} Team Manager`)}>WhatsApp</Button><Button type="button" size="sm" variant="ghost" onClick={() => window.open(managerUrl,'_blank','noopener,noreferrer')}>Open Manager View</Button></div></div>}
                    </div>
                  </div>;
                })}
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold">Registration results</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">These are stored against this Interclub event in the host club tenant. Visiting players remain event-only players, not Clare members.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{setup.clubAName || event.club_a_name || 'Team A'}: {interclubRegistrations.filter(r => r.side === 'club_a').length}</Badge>
                    <Badge variant="outline">{setup.clubBName || event.club_b_name || 'Team B'}: {interclubRegistrations.filter(r => r.side === 'club_b').length}</Badge>
                    <Button type="button" size="sm" variant="outline" onClick={() => { refetchInterclubRegistrations(); refetchParticipants(); }} disabled={interclubRegistrationsLoading || saving || !!hostAction}><RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${interclubRegistrationsLoading ? 'animate-spin' : ''}`} />Refresh</Button>
                  </div>
                </div>
                {interclubRegistrations.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No completed registration forms have been received yet.</p>
                ) : (
                  <div className="space-y-2">
                    {interclubRegistrations.map(r => {
                      const teamName = r.side === 'club_a' ? (setup.clubAName || event.club_a_name || 'Team A') : (setup.clubBName || event.club_b_name || 'Team B');
                      return <div key={r.id} className="rounded-lg border border-border bg-background/70 px-3 py-2.5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{r.full_name}</p><Badge variant="outline">{teamName}</Badge>{r.medical_note && <Badge variant="outline" className="border-amber-500/40 text-amber-700">Medical note supplied</Badge>}</div>
                          <p className="mt-1 text-xs text-muted-foreground break-all">{r.email}{r.mobile ? ` · ${r.mobile}` : ''}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground shrink-0">{r.registered_at ? new Date(r.registered_at).toLocaleString('en-IE') : ''}</p>
                      </div>;
                    })}
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">As players submit, RallyHub also adds them to the event roster. The form does not ask the player to grade themselves.</p>
              </div>
            </div>
            <TeamBuilder
              eventId={event.id}
              participants={participants}
              clubAName={setup.clubAName}
              clubBName={setup.clubBName}
              locked={locked}
              busy={saving || !!hostAction}
              needsRosterSave={!event.club_a_roster_saved_at || !event.club_b_roster_saved_at}
              clubPlayerCandidatesBySide={clubPlayerCandidatesBySide}
              clubPlayerCandidatesLoading={clubPlayerCandidatesLoading}
              onImportSpond={setSpondImportSide}
              onImportCsv={importCsv}
              onAddClubPlayer={addClubPlayer}
              onAddGuest={addGuest}
              onRemovePlayer={removePreDrawPlayer}
              onSave={organiseTeams}
              onSetRosterRole={setRosterRole}
              onSetPlayingCategory={setPlayingCategory}
              onSetGender={setParticipantGender}
              onEditDisplayName={editParticipantDisplayName}
              onDirtyChange={setTeamsDirty}
            />
            {formatInfo ? <div className="glass rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center"><div><p className="text-xl font-bold">{formatInfo.recommendedRounds}</p><p className="text-[10px] text-muted-foreground">Rounds</p></div><div><p className="text-xl font-bold">{formatInfo.totalMatches}</p><p className="text-[10px] text-muted-foreground">Matches</p></div><div><p className="text-xl font-bold">{formatInfo.gamesRangeClubA.join('–')}</p><p className="text-[10px] text-muted-foreground">Games/player</p></div><div><p className="text-xl font-bold">{formatInfo.structuredMinutes}</p><p className="text-[10px] text-muted-foreground">Structured min</p></div><div><p className="text-xl font-bold">{formatInfo.remainingMinutes}</p><p className="text-[10px] text-muted-foreground">Contingency min</p></div></div> : participants.length > 0 && <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-700">Working rosters can be saved at any time. The draw unlocks only when there are no unassigned players, both current team configurations are saved, and the Rotation squads are equal. Reserve numbers may differ.</div>}
            <Button data-testid="cc-generate-draw" onClick={generateDraw} disabled={locked || saving || !formatInfo} className="w-full h-11"><ListChecks className="w-4 h-4 mr-2" />Generate Draw & Fairness Report</Button>
          </>}
        </div>
      )}

      {tab === 'draw' && (
        <div className="space-y-4">
          {!matches.length ? <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">Generate a draw from Teams & Ranking first.</div> : <>
            {fairness && <div className="glass rounded-xl p-5"><div className="flex items-center justify-between mb-4"><div><p className="text-sm font-semibold">Fairness Report</p><p className="text-xs text-muted-foreground">Schedule fairness checks</p></div><Badge className={(fairness.balancedGames ?? (Number(fairness.maxGames)-Number(fairness.minGames)<=1)) && !fairness.duplicatePlayerRoundIssues && !fairness.sameClubIntegrityIssues ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>{(fairness.balancedGames ?? (Number(fairness.maxGames)-Number(fairness.minGames)<=1)) && !fairness.duplicatePlayerRoundIssues && !fairness.sameClubIntegrityIssues ? (fairness.equalGames ? 'Fairness checks passed' : 'Fairness checks passed · 1-game rotation spread') : 'Review required'}</Badge></div><div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">{[['Matches',fairness.totalMatches],['Games min',fairness.minGames],['Games max',fairness.maxGames],['Partner repeats',fairness.repeatedPartnerPairs],['Max opponent repeat',fairness.maxOpponentRepeat],['Consecutive rests',fairness.consecutiveRestOccurrences],['Avg strength gap',Number(fairness.averageStrengthGap).toFixed(2)],['Max gap',fairness.maxStrengthGap]].map(([l,v]) => <div key={l} className="rounded-lg bg-secondary p-3"><p className="text-lg font-bold">{v}</p><p className="text-[10px] text-muted-foreground">{l}</p></div>)}</div></div>}
            <div className="space-y-3 max-h-[48rem] overflow-auto">{rounds.map(r => <div key={r} className="glass rounded-xl p-4"><div className="flex items-center justify-between mb-3"><p className="text-sm font-bold">Round {r}</p><span className="text-[10px] text-muted-foreground">{matches.filter(m => m.round_number === r).length} courts</span></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">{matches.filter(m => m.round_number === r).sort((a,b)=>a.court_number-b.court_number).map(m => <div key={m.id} className="rounded-lg bg-secondary p-3"><p className="text-[10px] font-bold text-primary mb-2">Court {m.court_number}</p><p className="text-xs">{matchNames(m.club_a_names, 'club_a')}</p><p className="text-[10px] text-muted-foreground my-1">vs</p><p className="text-xs">{matchNames(m.club_b_names, 'club_b')}</p></div>)}</div></div>)}</div>
            {event?.status === 'draw_approved' && <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-3"><div><p className="text-xs font-bold">Hall sound & PA check before play</p><p className="text-[10px] text-muted-foreground">Set the laptop audio output to the venue speaker. Start the microphone level low and raise it gradually to avoid acoustic feedback. The built-in laptop microphone is the simplest V1 choice, but you can select a USB/external microphone if needed.</p>{paMicLabel && paActive && <p className="text-[10px] text-muted-foreground mt-1">Active mic: {paMicLabel}</p>}{paError && <p className="text-[10px] text-destructive mt-1">{paError}</p>}</div><div className="grid sm:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_auto_auto] gap-2 items-end"><div><Label className="text-[10px]">Microphone</Label><Select value={selectedMicId} onValueChange={v => { setSelectedMicId(v); setPaError(''); setPaMicLabel(''); }} onOpenChange={open => { if (open && !paActive) refreshMicrophones(); }} disabled={paActive}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">System default microphone</SelectItem>{microphones.filter(mic => mic.deviceId && mic.deviceId !== 'default').map((mic, i) => <SelectItem key={mic.deviceId} value={mic.deviceId}>{mic.label || `Microphone ${i + 1}`}</SelectItem>)}</SelectContent></Select></div><Button data-testid="cc-prestart-sound-check" variant="outline" className="min-h-11" onClick={() => unlockHallAudio({test:true})}>{audioReady ? 'Test Sound Again ✓' : 'Test Sound'}</Button><Button data-testid="cc-prestart-pa-test" className="min-h-11" variant={paActive ? 'destructive' : 'default'} disabled={paStarting} onClick={paActive ? stopPA : startPA}>{paActive ? <><MicOff className="w-4 h-4 mr-2" />Stop PA</> : <><Mic className="w-4 h-4 mr-2" />{paStarting ? 'Starting…' : 'Test PA Mic'}</>}</Button></div><div className="rounded-lg border border-border bg-secondary/30 p-3"><Label className="text-xs">Announcement voice</Label><Select value={hallVoiceSource} onValueChange={v => { setHallVoiceSource(v); setHallVoiceEngine('not-tested'); }}><SelectTrigger data-testid="cc-hall-voice-source" className="mt-1 bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="amplified">Amplified AI hall voice</SelectItem><SelectItem value="browser">Chrome / device voice</SelectItem></SelectContent></Select><p className="mt-1 text-[10px] text-muted-foreground">{hallVoiceSource === 'amplified' ? 'Louder, normalised hall announcements. Automatically falls back to Chrome if unavailable.' : 'Uses the laptop/browser speech voice directly. No external voice service required.'}</p></div><div className="grid sm:grid-cols-2 gap-3"><div className="rounded-lg bg-secondary/40 px-3 py-2"><Label className="text-xs">Live PA mic volume · {Math.round(paGain * 100)}%</Label><input aria-label="RallyHub pre-start PA microphone level" type="range" min="0" max="1.5" step="0.05" value={paGain} onChange={e => setPaGain(Number(e.target.value))} className="mt-2 w-full" /></div><div className="rounded-lg bg-secondary/40 px-3 py-2"><Label className="text-xs">RallyHub alerts & voice volume · {Math.round(hallVolume * 100)}%</Label><input aria-label="RallyHub pre-start hall sound volume" type="range" min="0" max="1" step="0.05" value={hallVolume} onChange={e => setHallVolume(Number(e.target.value))} className="mt-2 w-full" /></div></div></div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{event?.status === 'draw_generated' && <><Button variant="outline" className="w-full min-h-11" onClick={generateDraw} disabled={saving || !!hostAction}><RefreshCw className="w-4 h-4 mr-2" />Full Redraw</Button><Button data-testid="cc-approve-draw" className="w-full min-h-11" onClick={approveDraw} disabled={!!hostAction}><Check className="w-4 h-4 mr-2" />Approve Draw</Button></>}{event?.status === 'draw_approved' && <><Button variant="outline" className="w-full min-h-11" onClick={unlockDraw} disabled={!!hostAction}><RefreshCw className="w-4 h-4 mr-2" />Unlock Draw for Changes</Button><Button data-testid="cc-start-event" className="w-full min-h-11" onClick={startEvent} disabled={!!hostAction}><Play className="w-4 h-4 mr-2" />Start {INTERCLUB_EVENT_LABEL}</Button></>}</div>
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
                {scoreEntryVisible && <div className="text-xs text-muted-foreground"><strong className="text-foreground">{currentRoundSavedCount}/{currentMatches.length}</strong> current scores saved</div>}
                {pendingPastMatches.length > 0 && <Badge variant="outline" className="border-amber-500/50 text-amber-700">{pendingPastMatches.length} earlier score{pendingPastMatches.length === 1 ? '' : 's'} pending</Badge>}
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Button size="sm" variant={audioMuted ? 'destructive' : 'outline'} onClick={audioMuted ? enableAudio : silenceAudio}>{audioMuted ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}{audioMuted ? 'Audio OFF' : 'Audio ON'}</Button>
                  <Button size="sm" variant="outline" onClick={() => { const panel = document.getElementById('cc-pa-panel'); if (panel instanceof HTMLDetailsElement) { panel.open = true; panel.scrollIntoView({ behavior:'smooth', block:'center' }); } }}><Mic className="w-4 h-4 mr-1" />PA</Button>
                  <Button size="sm" variant="outline" onClick={() => { const panel = document.getElementById('cc-player-controls'); if (panel instanceof HTMLDetailsElement) { panel.open = true; panel.scrollIntoView({ behavior:'smooth', block:'center' }); } }}><Users className="w-4 h-4 mr-1" />Reserve / Player Change</Button>
                  {!['completed','archived'].includes(event.status) && !breakActive && !roundStarted && ['ready','idle'].includes(timerPhase) && <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={!canManageEvent} onClick={()=>startPhase('play')}><Play className="w-4 h-4 mr-1" />Start Round {currentRound} · In Play</Button>}
                  {!['completed','archived'].includes(event.status) && roundStarted && timerPhase === 'play' && <Badge className="bg-emerald-600 text-white">ROUND {currentRound} IN PLAY · {fmtTimer(timerRemaining)}</Badge>}
                  {!['completed','archived'].includes(event.status) && (breakActive ? <Button size="sm" variant="destructive" disabled={!canManageEvent} onClick={timerRemaining > 0 ? endBreakEarly : advanceRound}>{timerRemaining > 0 ? `End Break → R${currentRound + 1}` : `Prepare R${currentRound + 1}`}</Button> : <>
                    {currentRoundComplete && currentRound >= plannedRounds && event.showcase_enabled && score.clubA !== score.clubB && !showcaseMatch && <Button size="sm" variant="outline" disabled={!canManageEvent} onClick={openOptionalShowcase}>Play Optional Showcase Final</Button>}
                    {canPrepareNextRound && <Button size="sm" disabled={advanceActionDisabled} onClick={advanceRound}>{advanceActionLabel}</Button>}
                  </>)}
                </div>
              </div>
              {roundActionStatus && <div className={cn('mt-2 rounded-lg border px-3 py-2 text-xs font-semibold flex items-center gap-2', roundActionStatus.state === 'success' ? 'border-green-500/40 bg-green-500/10 text-green-500' : roundActionStatus.state === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-primary/30 bg-primary/5 text-primary')}>{roundActionStatus.state === 'working' ? <RefreshCw className="w-4 h-4 animate-spin" /> : roundActionStatus.state === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}<span>{roundActionStatus.text}</span></div>}
              </div>
            </div>
            <div data-testid="cc-host-round-nav" className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><p className="text-sm font-bold">Round navigation</p><p className="text-xs text-muted-foreground">Open any round to review its courts and scores. This never changes the live round or timer.</p></div>{viewingHistoricalRound && <Button size="sm" variant="outline" onClick={() => setHostScoreRound(null)}>Back to {event.status === 'completed' ? 'latest' : 'live'} Round {currentRound}</Button>}</div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{rounds.map(r => <Button key={`host-round-${r}`} data-testid={`cc-host-round-${r}`} size="sm" variant={Number(scoreViewRound) === Number(r) ? 'default' : 'outline'} className="shrink-0 min-w-12" onClick={() => setHostScoreRound(r)}>R{r}</Button>)}</div>
              {viewingHistoricalRound && <p className="mt-2 text-xs font-semibold text-amber-700">Viewing Round {scoreViewRound}. Operational controls remain on Round {currentRound}.</p>}
              {event.status === 'completed' && canCorrectScoreEvent && <p className="mt-2 text-xs text-muted-foreground">Completed event: authorised score corrections remain available and are audit logged.</p>}
            </div>
            {timingGuide && <div className={cn('rounded-xl border-2 p-4 sm:p-5', timingGuide.status === 'recover' ? 'border-amber-500/60 bg-amber-500/10' : timingGuide.status === 'tight' ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-emerald-500/40 bg-emerald-500/10')}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-black">Finish-on-Time Guide</p><Badge className={timingGuide.status === 'recover' ? 'bg-amber-600 text-white' : timingGuide.status === 'tight' ? 'bg-yellow-500 text-black' : 'bg-emerald-600 text-white'}>{timingGuide.status === 'recover' ? 'RECOVERY NEEDED' : timingGuide.status === 'tight' ? 'TIGHT' : 'ON TRACK'}</Badge></div>
                  <p className="mt-1 text-xs text-muted-foreground">Booked finish {clockLabel(timingGuide.hardFinish)} · projected finish {clockLabel(timingGuide.projectedFinish)}{timingGuide.lateMinutes > 0 ? ` · started ${timingGuide.lateMinutes} min late` : ''}</p>
                </div>
                <div className="text-left lg:text-right"><p className={cn('text-2xl font-black tabular-nums', timingGuide.slackMinutes < 0 ? 'text-amber-600' : 'text-emerald-600')}>{timingGuide.slackMinutes < 0 ? `${Math.abs(timingGuide.slackMinutes)} min over` : `${timingGuide.slackMinutes} min spare`}</p><p className="text-[10px] text-muted-foreground">Recalculates throughout the event</p></div>
              </div>
              {timingGuide.recommendations.length > 0 && <div className="mt-3 rounded-lg bg-background/70 p-3"><p className="text-xs font-bold">Recommended recovery</p><p className="mt-1 text-xs text-muted-foreground">{timingGuide.recommendations.join(' · ')}</p></div>}
            </div>}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Live Event</p><p className="text-sm text-muted-foreground mt-1">Round {currentRound} of {plannedRounds}</p><p className="text-xl sm:text-2xl font-bold break-words mt-1">{event.club_a_name} {score.clubA} <span className="text-muted-foreground font-normal">–</span> {score.clubB} {event.club_b_name}</p></div><div className="flex gap-2 text-xs"><Badge variant="outline">{score.matchesWonA}W</Badge><Badge variant="outline">{score.draws}D</Badge><Badge variant="outline">{score.matchesWonB}W</Badge></div></div>{scheduledBreakHere && !breakActive && <div className="mt-3 rounded-lg border-2 border-red-500 bg-red-600 px-4 py-3 text-white shadow-lg"><div className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="text-sm font-black uppercase tracking-wide">Break next · {event.break_minutes} minutes</p><p className="mt-1 text-xs text-white/90">Scheduled immediately after Round {currentRound}. Round {currentRound + 1} will wait until the host ends the break.</p></div></div></div>}{breakActive && <div className="mt-3 rounded-lg border-2 border-red-400 bg-red-600 px-4 py-4 text-white shadow-lg"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-black uppercase tracking-widest">Break now</p><p className="mt-1 text-3xl font-black tabular-nums">{fmtTimer(timerRemaining)}</p><p className="mt-1 text-xs text-white/90">Round {currentRound + 1} is waiting. The host can shorten, extend or end the break.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={!canManageEvent || timerRemaining <= 60} onClick={() => adjustScheduledBreak(-5)}><Minus className="mr-1 h-4 w-4" />5 min</Button><Button size="sm" variant="secondary" disabled={!canManageEvent} onClick={() => adjustScheduledBreak(5)}><Plus className="mr-1 h-4 w-4" />5 min</Button><Button size="sm" variant="destructive" disabled={!canManageEvent} onClick={timerRemaining > 0 ? endBreakEarly : advanceRound}>{timerRemaining > 0 ? `End Break Early → Round ${currentRound + 1}` : `Prepare Round ${currentRound + 1}`}</Button></div></div></div>}</div>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Round at a Glance</p><p className="text-xs text-muted-foreground">On court, resting and up next — all in one place.</p></div><Badge variant="outline">R{currentRound}</Badge></div><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2">{currentDisplayMatches.map(m=><div key={`now-${m.id}`} className="rounded-lg border border-border bg-background p-3"><p className="text-xs font-black">Court {m.court_number} · NOW</p><div className="mt-2 space-y-1.5"><div className="rounded-md border-l-4 px-2.5 py-2" style={{borderLeftColor:event.club_a_primary_colour||'#2563eb',background:`${event.club_a_primary_colour||'#2563eb'}10`}}><p className="text-[10px] font-black uppercase tracking-wide" style={{color:event.club_a_primary_colour||'#2563eb'}}>{event.club_a_name}</p><p className="text-xs font-semibold mt-1">{matchNames(m.club_a_names, 'club_a')}</p></div><div className="rounded-md border-l-4 px-2.5 py-2" style={{borderLeftColor:event.club_b_primary_colour||'#7f1d1d',background:`${event.club_b_primary_colour||'#7f1d1d'}10`}}><p className="text-[10px] font-black uppercase tracking-wide" style={{color:event.club_b_primary_colour||'#7f1d1d'}}>{event.club_b_name}</p><p className="text-xs font-semibold mt-1">{matchNames(m.club_b_names, 'club_b')}</p></div></div></div>)}</div>{currentSittingOut.length>0&&<div><p className="text-xs font-semibold">Resting this round</p><div className="grid md:grid-cols-2 gap-2 mt-2"><div className="rounded-lg border bg-background p-3" style={{borderTopWidth:'4px',borderTopColor:event.club_a_primary_colour||'#2563eb'}}><p className="text-xs font-black" style={{color:event.club_a_primary_colour||'#2563eb'}}>{event.club_a_name}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">{currentSittingOutA.map(p=><div key={p.id} className={cn('rounded-md border px-2.5 py-1.5 text-xs font-medium', hostPlayerChipClass(p))} style={isTemporarySub(p) ? undefined : {borderColor:event.club_a_primary_colour||'#2563eb',background:`${event.club_a_primary_colour||'#2563eb'}0d`}}>{p.display_name}{isTemporarySub(p) && <span className="ml-1 text-[9px] font-black uppercase">· Temp sub</span>}</div>)}</div></div><div className="rounded-lg border bg-background p-3" style={{borderTopWidth:'4px',borderTopColor:event.club_b_primary_colour||'#7f1d1d'}}><p className="text-xs font-black" style={{color:event.club_b_primary_colour||'#7f1d1d'}}>{event.club_b_name}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">{currentSittingOutB.map(p=><div key={p.id} className={cn('rounded-md border px-2.5 py-1.5 text-xs font-medium', hostPlayerChipClass(p))} style={isTemporarySub(p) ? undefined : {borderColor:event.club_b_primary_colour||'#7f1d1d',background:`${event.club_b_primary_colour||'#7f1d1d'}0d`}}>{p.display_name}{isTemporarySub(p) && <span className="ml-1 text-[9px] font-black uppercase">· Temp sub</span>}</div>)}</div></div></div></div>}{nextDisplayMatches.length>0&&<div><p className="text-xs font-semibold">Up next · Round {currentRound+1}</p><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2 mt-2">{nextDisplayMatches.map(m=><div key={`next-${m.id}`} className="rounded-lg border border-border bg-secondary/20 p-3"><p className="text-xs font-black">Court {m.court_number} · NEXT</p><div className="mt-2 space-y-1.5"><div className="rounded-md border-l-4 px-2 py-1.5" style={{borderLeftColor:event.club_a_primary_colour||'#2563eb',background:`${event.club_a_primary_colour||'#2563eb'}0d`}}><p className="text-[10px] font-black uppercase" style={{color:event.club_a_primary_colour||'#2563eb'}}>{event.club_a_name}</p><p className="text-xs font-semibold mt-1">{matchNames(m.club_a_names, 'club_a')}</p></div><div className="rounded-md border-l-4 px-2 py-1.5" style={{borderLeftColor:event.club_b_primary_colour||'#7f1d1d',background:`${event.club_b_primary_colour||'#7f1d1d'}0d`}}><p className="text-[10px] font-black uppercase" style={{color:event.club_b_primary_colour||'#7f1d1d'}}>{event.club_b_name}</p><p className="text-xs font-semibold mt-1">{matchNames(m.club_b_names, 'club_b')}</p></div></div></div>)}</div></div>}</div>
            {playerStatusChanges.length > 0 && <div className="rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Player status changes</p><p className="text-xs text-muted-foreground">Host-only visual markers for event-day player changes.</p></div><Badge variant="outline">{playerStatusChanges.length}</Badge></div><div className="mt-3 flex flex-wrap gap-2">{playerStatusChanges.map(p => { const treatment = playerTreatment(p); return <div key={`status-${p.id}`} className={cn('rounded-md border px-2.5 py-1.5 text-xs font-medium', treatment?.className)}><span>{p.display_name}</span><span className="ml-1 text-[9px] font-black uppercase">· {treatment?.label}</span></div>; })}</div></div>}
            {unusedTeamReserves.length > 0 && <div className="rounded-xl border-2 border-primary/35 bg-primary/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black">Quick Reserve Handover</p><p className="text-xs text-muted-foreground mt-1">Choose who is coming off and put the reserve in from this round onward. Completed results are untouched.</p></div><Badge variant="outline">{unusedTeamReserves.length} reserve{unusedTeamReserves.length===1?'':'s'} ready</Badge></div>
              <div className="grid md:grid-cols-2 gap-3">{unusedTeamReserves.map(reserve => { const sameSidePlayers = participants.filter(p => p.side === reserve.side && p.id !== reserve.id && ['active','late'].includes(p.status) && ((p.roster_role || 'rotation') === 'rotation' || p.reserve_activated)); const selected = quickReserveOutgoing[reserve.id] || ''; return <div key={`live-reserve-${reserve.id}`} className="rounded-lg border border-border bg-card p-3 space-y-2"><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{reserve.side === 'club_a' ? event.club_a_name : event.club_b_name}</p><p className="font-black">{reserve.display_name} <span className="font-normal text-muted-foreground">· Reserve</span></p></div><Select value={selected} onValueChange={v => setQuickReserveOutgoing(q => ({ ...q, [reserve.id]:v }))} disabled={playerControlBusy}><SelectTrigger className="bg-secondary"><SelectValue placeholder="Who is coming off?" /></SelectTrigger><SelectContent>{sameSidePlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select><Button className="w-full" disabled={!selected || playerControlBusy} onClick={() => activateReserveQuick(reserve.id, selected)}>{playerControlBusy ? 'Applying…' : `Put ${reserve.display_name} In Now`}</Button></div>; })}</div>
            </div>}


            {pendingPastMatches.length > 0 && <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-4 sm:p-5 space-y-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-amber-700">Earlier scores still to enter</p><p className="text-xs text-muted-foreground mt-1">Keep the current round moving. Enter these results here as they arrive from the courts.</p></div><Badge variant="outline" className="border-amber-500/50 text-amber-700">{pendingPastMatches.length} pending</Badge></div><div className="grid md:grid-cols-2 gap-3">{pendingPastMatches.map(m => <ScoreCard key={`pending-${m.id}-${m.revision}`} match={m} clubAName={event.club_a_name} clubBName={event.club_b_name} onSaved={mergeSavedMatch} networkOnline={networkOnline} onQueue={queueOfflineScore} canScore={canScoreEvent} formatNames={matchNames} />)}</div></div>}

            <div className={cn('rounded-xl border bg-card p-4 sm:p-5 space-y-3', scoreViewComplete ? 'border-primary/50' : 'border-border')}>
              {scoreEntryVisible && <><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-sm font-semibold">Round {scoreViewRound} Scores</p><p className={cn('text-xs', scoreViewComplete ? 'text-primary font-medium' : 'text-muted-foreground')}>{event.status === 'completed' ? 'Review the saved results. Authorised corrections are audited and update the calculated result and club leaderboard.' : viewingHistoricalRound ? `Review Round ${scoreViewRound}. Any authorised correction is audited; Round ${currentRound} remains the live operational round.` : scoreViewComplete ? (scheduledBreakHere && !breakActive ? `Round ${currentRound} complete — ready to start the scheduled ${event.break_minutes}-minute break.` : breakActive ? `Round ${currentRound} saved — break in progress.` : `Round ${currentRound} complete — ready to advance.`) : 'Enter each court result as it comes in — you do not need to wait for the timer to finish.'}</p></div><div className="flex items-center gap-2">{canQuickFillTestScores && !viewingHistoricalRound && !scoreViewComplete && <Button size="sm" variant="outline" disabled={simulating} onClick={simulateCurrentRound}>{simulating ? 'Filling…' : `TEST · Fill Round ${currentRound} Scores`}</Button>}<Badge className={scoreViewComplete ? 'bg-primary/10 text-primary' : ''} variant={scoreViewComplete ? 'default' : 'outline'}>{scoreViewSavedCount}/{scoreViewMatches.length} saved</Badge></div></div>
              <div className="grid md:grid-cols-2 gap-3">{scoreViewMatches.sort((a,b)=>a.court_number-b.court_number).map(m => <ScoreCard key={`${m.id}-${m.revision}`} match={m} clubAName={event.club_a_name} clubBName={event.club_b_name} onSaved={mergeSavedMatch} networkOnline={networkOnline} onQueue={queueOfflineScore} canScore={canEditScoreView} formatNames={matchNames} />)}</div></>}

              <div className="rounded-xl border border-primary/25 bg-card p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-sm font-semibold">{breakActive ? 'Break Timer' : 'Round Timer'}</p><p className="text-xs text-muted-foreground">{breakActive ? `${event.break_minutes}-minute scheduled break · Round ${currentRound + 1} waits` : `Round ${currentRound} of ${plannedRounds}`}</p></div>
                  <div className="flex items-center gap-1.5"><Badge variant="outline">{['idle','ready'].includes(String(timerState?.phase || 'ready')) ? 'ready' : String(timerState?.phase || 'ready').replaceAll('_',' ')}</Badge><Button size="icon" variant={audioMuted ? 'destructive' : 'outline'} className="h-7 w-7" aria-label={audioMuted ? 'Turn announcements on' : 'Mute announcements'} title={audioMuted ? 'Announcements muted · click to turn on' : 'Announcements on · click to mute'} onClick={audioMuted ? enableAudio : silenceAudio}>{audioMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}</Button></div>
                </div>
                <div className="text-center py-1"><p className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight">{fmtTimer(timerRemaining)}</p></div>
                {breakActive ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-xs font-semibold text-red-500">Host break controls</p><p className="text-[11px] text-muted-foreground">Shorten, extend or end the break to keep the event on time.</p></div><div className="flex flex-wrap items-center justify-center gap-2"><Button variant="outline" disabled={!canManageEvent || timerRemaining <= 60} onClick={() => adjustScheduledBreak(-5)}><Minus className="w-4 h-4 mr-1" />5 min</Button><Button variant="outline" disabled={!canManageEvent} onClick={() => adjustScheduledBreak(5)}><Plus className="w-4 h-4 mr-1" />5 min</Button><Button variant="destructive" disabled={!canManageEvent} onClick={timerRemaining > 0 ? endBreakEarly : advanceRound}>{timerRemaining > 0 ? `End Break Early` : `Prepare Round ${currentRound + 1}`}</Button></div></div> : <div className="rounded-lg bg-secondary/40 p-2.5 space-y-1.5"><div className="grid grid-cols-[1fr_auto] items-center gap-3"><div><p className="text-xs font-semibold">Round</p><p className="text-[10px] text-muted-foreground">Adjust before play or while paused</p></div><div className="flex items-center justify-center gap-1.5"><Button variant="outline" size="icon" className="h-8 w-8" aria-label="Reduce this round by one minute" disabled={!canManageEvent || !!timerState?.running || preparedRoundMinutes <= 1} onClick={() => setRoundMinutes(preparedRoundMinutes - 1)}><Minus className="w-3.5 h-3.5" /></Button><p className="min-w-14 text-center text-lg font-bold tabular-nums">{preparedRoundMinutes}</p><Button variant="outline" size="icon" className="h-8 w-8" aria-label="Add one minute to this round" disabled={!canManageEvent || !!timerState?.running || preparedRoundMinutes >= 60} onClick={() => setRoundMinutes(preparedRoundMinutes + 1)}><Plus className="w-3.5 h-3.5" /></Button></div></div><div className="border-t border-border/60 pt-1.5 grid grid-cols-[1fr_auto] items-center gap-3"><div><p className="text-xs font-semibold">Changeover</p><p className="text-[10px] text-muted-foreground">Applies to the next changeover</p></div><div className="flex items-center justify-center gap-1.5"><Button variant="outline" size="icon" className="h-8 w-8" aria-label="Reduce changeover by one minute" disabled={!canManageEvent || (timerState?.running && timerPhase==='changeover') || Number(event.changeover_minutes || 2) <= 1} onClick={() => setChangeoverMinutes(Number(event.changeover_minutes || 2) - 1)}><Minus className="w-3.5 h-3.5" /></Button><p className="min-w-14 text-center text-lg font-bold tabular-nums">{Number(event.changeover_minutes || 2)}</p><Button variant="outline" size="icon" className="h-8 w-8" aria-label="Add one minute to changeover" disabled={!canManageEvent || (timerState?.running && timerPhase==='changeover') || Number(event.changeover_minutes || 2) >= 10} onClick={() => setChangeoverMinutes(Number(event.changeover_minutes || 2) + 1)}><Plus className="w-3.5 h-3.5" /></Button></div></div>{event.include_break&&<div className="border-t border-border/60 pt-1.5 grid grid-cols-[1fr_auto] items-center gap-3"><div><p className="text-xs font-semibold">Mid-event break</p><p className="text-[10px] text-muted-foreground">Scheduled after Round {event.break_after_round || 6}</p></div><div className="flex items-center justify-center gap-1.5"><Button variant="outline" size="icon" className="h-8 w-8" aria-label="Reduce mid-event break by one minute" disabled={!canManageEvent || (timerState?.running && timerPhase==='break') || Number(event.break_minutes || 20) <= 1} onClick={() => setBreakMinutes(Number(event.break_minutes || 20) - 1)}><Minus className="w-3.5 h-3.5" /></Button><p className="min-w-14 text-center text-lg font-bold tabular-nums">{Number(event.break_minutes || 20)}</p><Button variant="outline" size="icon" className="h-8 w-8" aria-label="Add one minute to mid-event break" disabled={!canManageEvent || (timerState?.running && timerPhase==='break') || Number(event.break_minutes || 20) >= 60} onClick={() => setBreakMinutes(Number(event.break_minutes || 20) + 1)}><Plus className="w-3.5 h-3.5" /></Button></div></div>}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {timerRunning ? <Button data-testid="cc-timer-pause" className="min-h-12" disabled={!canManageEvent} onClick={pauseTimer}>Pause</Button> : timerPaused ? <Button data-testid="cc-timer-resume" className="min-h-12" disabled={!canManageEvent} onClick={resumeTimer}>Resume</Button> : playFinished && currentRound >= plannedRounds ? <Button className="min-h-12" disabled>Final round complete · no changeover</Button> : playFinished && scheduledBreakHere ? <Button data-testid="cc-start-break" className="min-h-12" disabled={!canManageEvent || currentRound >= plannedRounds} onClick={() => advanceRound()}>Start {Number(event.break_minutes || 20)}-min Mid-event Break</Button> : playFinished ? <Button data-testid="cc-start-changeover" className="min-h-12" disabled={!canManageEvent || currentRound >= plannedRounds} onClick={() => startPhase('changeover')}>Start {Number(event.changeover_minutes || 2)}-min Changeover</Button> : timerPhase === 'changeover' && timerRemaining <= 0 ? <Button className="min-h-12" disabled>Changeover complete</Button> : timerPhase === 'break' && timerRemaining <= 0 ? <Button className="min-h-12" disabled>Break complete</Button> : <Button data-testid="cc-timer-start-play" className="min-h-12 bg-emerald-600 text-white hover:bg-emerald-700" disabled={!canManageEvent || timerPhase === 'changeover' || timerPhase === 'break'} onClick={() => startPhase('play')}><Play className="w-4 h-4 mr-2" />Start Round {currentRound} · In Play</Button>}
                  {timerRunning && timerPhase === 'play' ? <Button data-testid="cc-end-round-early" variant="outline" className="min-h-12" disabled={!canManageEvent} onClick={endRoundEarly}>Host Override · End Round Early → Scores</Button> : playFinished && currentRound >= plannedRounds ? <div className="min-h-12 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 flex items-center justify-center text-center text-xs font-semibold text-emerald-700">Round {currentRound} finished · choose Showcase or Finish Interclub below</div> : playFinished && scheduledBreakHere ? <div className="min-h-12 rounded-md border border-red-500/30 bg-red-500/10 px-3 flex items-center justify-center text-center text-xs font-semibold text-red-600">Mid-event break follows · no normal changeover</div> : playFinished || timerPhase === 'changeover' ? <Button data-testid="cc-skip-changeover" variant="outline" className="min-h-12" disabled={!canManageEvent || currentRound >= plannedRounds} onClick={() => advanceRound({ skipChangeover:true })}>{`Skip Changeover → Prepare Round ${currentRound + 1}`}</Button> : <Button variant="outline" className="min-h-12" disabled={!canManageEvent || !changeoverAvailable} onClick={() => startPhase('changeover')}>{changeoverAvailable ? 'End Early → Changeover' : 'Changeover'}</Button>}
                  {breakActive ? <Button variant="destructive" className="min-h-12" disabled={!canManageEvent} onClick={timerRemaining > 0 ? endBreakEarly : advanceRound}>{timerRemaining > 0 ? `End Break → Round ${currentRound + 1}` : `Prepare Round ${currentRound + 1}`}</Button> : <Button variant="outline" className="min-h-12" disabled={!canManageEvent || !timerRunning || timerPhase !== 'play'} onClick={() => timerAction('add_minute')}>+1 minute</Button>}
                  {canQuickFillTestScores && timerRunning && <Button data-testid="cc-test-jump-10" variant="outline" className="min-h-12 border-dashed" onClick={() => jumpTestTimer(10)}>TEST · Jump to 10 sec</Button>}
                  {canQuickFillTestScores && timerRunning && timerPhase === 'break' && Number(event.break_minutes || 0) > 2 && <Button data-testid="cc-test-jump-205" variant="outline" className="min-h-12 border-dashed" onClick={() => jumpTestTimer(125)}>TEST · Jump to 2:05</Button>}
                  <details className="rounded-lg border border-border bg-secondary/20">
                    <summary className="cursor-pointer list-none min-h-12 px-4 flex items-center justify-center text-sm font-medium">Round options</summary>
                    <div className="border-t border-border p-3 space-y-3"><div><Label className="text-xs">Round label</Label><Input className="mt-1 bg-secondary" value={roundLabels[currentRound] || ''} onChange={e => setRoundLabels(r => ({ ...r, [currentRound]: e.target.value }))} onBlur={() => saveRoundLabel(currentRound)} disabled={!canManageEvent} placeholder={`Round ${currentRound}`} /></div><Button variant="outline" className="w-full" disabled={!canManageEvent} onClick={resetTimer}>Reset timer</Button></div>
                  </details>
                </div>
                {!timerState && <p className="text-[11px] text-muted-foreground text-center">Start Play first. Changeover becomes available after play starts, so an accidental pre-round changeover cannot replace the match timer.</p>}
              </div>
              {roundActionStatus && <div className={cn('rounded-lg border px-3 py-2 text-xs font-semibold flex items-center gap-2', roundActionStatus.state === 'success' ? 'border-green-500/40 bg-green-500/10 text-green-500' : roundActionStatus.state === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-primary/30 bg-primary/5 text-primary')}>{roundActionStatus.state === 'working' ? <RefreshCw className="w-4 h-4 animate-spin" /> : roundActionStatus.state === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}<span>{roundActionStatus.text}</span></div>}
              {!viewingHistoricalRound && event.status !== 'archived' && (breakActive || (allNormalResultsSaved && currentRound >= plannedRounds)) && <div className="rounded-xl border-2 border-amber-500/35 bg-amber-500/5 p-4 space-y-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black">{breakActive?'Spot Prize Draw · optional during break':'Optional Spot Prize Draw'}</p><p className="text-xs text-muted-foreground mt-1">{breakActive?'Host controlled. Run it now during the scheduled break if you want to avoid holding players back after the final result.':'Pure names-out-of-a-hat draw from the eligible event roster. It does not affect scores, rankings or the Interclub result.'}</p></div>{spotPrizeDraw?.enabled&&<Badge variant="outline">{spotPrizeWinners.length}/{spotPrizeMaxPulls} drawn</Badge>}</div>{!spotPrizeDraw?.enabled?<div className="grid sm:grid-cols-[1fr_150px_auto] gap-2 items-end"><div><Label className="text-xs">Draw pool</Label><Select value={setup.spotPrizeMode} onValueChange={v=>setSetup(s=>({...s,spotPrizeMode:v}))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all_players">All players · one hat</SelectItem><SelectItem value="per_team">One team at a time</SelectItem></SelectContent></Select></div><div><Label className="text-xs">{setup.spotPrizeMode==='per_team'?'Prizes per team':'Prizes'}</Label><Input type="number" min="1" max={setup.spotPrizeMode==='per_team'?8:16} value={setup.spotPrizeCount} onChange={e=>setSetup(s=>({...s,spotPrizeCount:e.target.value}))} className="mt-1 bg-secondary" /></div><Button disabled={!canManageSpotPrize||spotPrizeBusy} onClick={()=>configureSpotPrizeDraw({enabled:true,mode:setup.spotPrizeMode,prizeCount:setup.spotPrizeCount})}>{spotPrizeBusy?'Setting up…':'Set Up Draw'}</Button></div>:<><div className="flex flex-wrap gap-2">{spotPrizeWinners.map(w=><div key={`${w.pull}-${w.participant_id}`} className="rounded-lg border bg-card px-3 py-2 text-sm"><span className="text-[10px] uppercase tracking-wide text-muted-foreground">Prize {w.pull}</span><p className="font-black">#{w.number} · {w.display_name}</p><p className="text-[10px] text-muted-foreground">{w.team_name}</p></div>)}</div><div className="flex flex-col sm:flex-row gap-2"><Button variant="outline" disabled={spotPrizeBusy} onClick={testSpotPrizeSound}>{audioReady?'Test Draw Sound ✓':'Test Draw Sound'}</Button><Button className="sm:flex-1 h-12" disabled={!canManageSpotPrize||spotPrizeBusy||spotPrizeWinners.length>=spotPrizeMaxPulls} onClick={drawNextSpotPrize}>{spotPrizeWinners.length>=spotPrizeMaxPulls?'Spot Prize Draw Complete':spotPrizeBusy?'Drawing…':`Draw Prize ${spotPrizeWinners.length+1}`}</Button><Button variant="outline" disabled={!canManageSpotPrize||spotPrizeBusy||!spotPrizeWinners.length} onClick={resetSpotPrizeDraw}>Reset Draw</Button></div></>}</div>}
              {viewingHistoricalRound ? <Button className="w-full h-12" variant="outline" onClick={() => setHostScoreRound(null)}>Return to Round {currentRound}</Button> : !['completed','archived'].includes(event.status) && (breakActive ? <Button className="w-full h-12" variant="destructive" disabled={!canManageEvent} onClick={timerRemaining > 0 ? endBreakEarly : advanceRound}>{timerRemaining > 0 ? `Break in progress · End Early & Prepare Round ${currentRound + 1}` : `Break complete · Prepare Round ${currentRound + 1}`}</Button> : allNormalResultsSaved && currentRound >= plannedRounds && score.clubA !== score.clubB && event.showcase_enabled && !showcaseMatch ? <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3"><div><p className="text-sm font-black">Round {plannedRounds} complete — what would you like to do?</p><p className="text-xs text-muted-foreground mt-1">The normal Interclub result is decided. The optional final is available only if time allows.</p></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><Button variant="outline" className="h-12" disabled={!canManageEvent} onClick={openOptionalShowcase}><Trophy className="w-4 h-4 mr-2" />Play Optional Showcase Final</Button><Button className="h-12" disabled={!canManageEvent} onClick={advanceRound}>Review Final Result</Button></div></div> : canPrepareNextRound ? <Button className="w-full h-12" disabled={advanceActionDisabled} onClick={advanceRound}>{advanceActionLabel}</Button> : roundStarted ? <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-700">Round {currentRound} is in play · scores will open when the round ends</div> : null)}
            </div>



            <details id="cc-pa-panel" data-testid="cc-audio-pa-controller" className={cn('rounded-xl border overflow-hidden', paActive ? 'border-red-500/60 bg-red-500/5' : 'border-border bg-card')}>
              <summary className="cursor-pointer list-none p-4 sm:p-5 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">PA & Announcements</p><p className="text-xs text-muted-foreground">Open only when you need the microphone or an announcement.</p></div><div className="flex items-center gap-2"><Badge className={paActive ? 'bg-red-500/15 text-red-400' : audioReady ? 'bg-primary/10 text-primary' : ''} variant={paActive || audioReady ? 'default' : 'outline'}>{paActive ? 'PA LIVE' : audioReady ? 'AUDIO READY' : 'NOT TESTED'}</Badge><ChevronDown className="w-4 h-4 text-muted-foreground" /></div></summary>
              <div className="border-t border-border p-4 sm:p-5 space-y-3"><div className="flex justify-end"><Button variant="outline" size="sm" onClick={silenceAudio}><VolumeX className="w-4 h-4 mr-2" />Stop Audio</Button></div>
              <div className="rounded-lg border border-border bg-secondary/30 p-3"><Label className="text-xs">Announcement voice</Label><Select value={hallVoiceSource} onValueChange={v => { setHallVoiceSource(v); setHallVoiceEngine('not-tested'); }}><SelectTrigger data-testid="cc-hall-voice-source" className="mt-1 bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="amplified">Amplified AI hall voice</SelectItem><SelectItem value="browser">Chrome / device voice</SelectItem></SelectContent></Select><p className="mt-1 text-[10px] text-muted-foreground">{hallVoiceSource === 'amplified' ? 'Louder, normalised hall announcements. Automatically falls back to Chrome if unavailable.' : 'Uses the laptop/browser speech voice directly. No external voice service required.'}</p></div>
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2 items-end">
                <div><Label className="text-xs">Microphone</Label><Select value={selectedMicId} onValueChange={v => { setSelectedMicId(v); setPaError(''); setPaMicLabel(''); }} onOpenChange={open => { if (open && !paActive) refreshMicrophones(); }} disabled={paActive}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">System default microphone</SelectItem>{microphones.filter(mic => mic.deviceId && mic.deviceId !== 'default').map((mic, i) => <SelectItem key={mic.deviceId} value={mic.deviceId}>{mic.label || `Microphone ${i + 1}`}</SelectItem>)}</SelectContent></Select></div>
                <Button data-testid="cc-pa-toggle" className="h-11" variant={paActive ? 'destructive' : 'default'} disabled={!hasManagePermission || paStarting} onClick={paActive ? stopPA : startPA}>{paActive ? <><MicOff className="w-4 h-4 mr-2" />Stop PA</> : <><Mic className="w-4 h-4 mr-2" />{paStarting ? 'Starting PA…' : 'Start PA'}</>}</Button>
                <div className="rounded-lg bg-secondary/40 px-3 py-2"><Label className="text-xs">Live PA mic volume · {Math.round(paGain * 100)}%</Label><input aria-label="RallyHub live PA microphone level" type="range" min="0" max="1.5" step="0.05" value={paGain} onChange={e => setPaGain(Number(e.target.value))} className="mt-2 w-full" /></div>
                <div className="rounded-lg bg-secondary/40 px-3 py-2"><Label className="text-xs">RallyHub alerts & voice volume · {Math.round(hallVolume * 100)}%</Label><input aria-label="RallyHub live sound volume" type="range" min="0" max="1" step="0.05" value={hallVolume} onChange={e => setHallVolume(Number(e.target.value))} className="mt-2 w-full" /></div>
              </div>
              {paMicLabel && paActive && <p className="text-[11px] text-muted-foreground"><strong>Active microphone:</strong> {paMicLabel}{selectedMicId !== 'default' ? ' · external mic direct mode' : ''}</p>}
              {paActive && <div className="rounded-lg bg-secondary/40 px-3 py-2"><div className="flex items-center justify-between gap-3"><Label className="text-xs">Mic input</Label><span className="text-[10px] text-muted-foreground">Speak into the selected mic — this bar should move</span></div><div className="mt-2 h-2 rounded-full bg-background overflow-hidden border border-border"><div className="h-full bg-primary transition-[width] duration-100" style={{ width:`${Math.max(2, Math.round(paInputLevel * 100))}%` }} /></div></div>}
              {paError && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{paError}</div>}
              <div className="space-y-2"><p className="text-xs font-semibold">Voice announcements</p><div className="flex flex-col md:flex-row gap-2"><Button className="w-full md:w-36 md:shrink-0" variant="outline" disabled={!announcementDraft.trim() || paActive || announcementSpeaking} onClick={announceCustom}><Megaphone className="w-4 h-4 mr-2" />{announcementSpeaking ? 'Speaking…' : 'Announce'}</Button><Input type="text" name="rallyhub-announcement-text" autoComplete="off" inputMode="text" aria-autocomplete="none" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" value={announcementDraft} onChange={e => { setAnnouncementDraft(e.target.value); if (!announcementSpeaking) setAnnouncementStatus(''); }} onKeyDown={e => { if (e.key === 'Enter' && !announcementSpeaking) announceCustom(); }} placeholder="Announcement text…" className="bg-secondary" disabled={announcementSpeaking} /><Button variant="outline" className="w-full md:w-32 md:shrink-0" disabled={!lastAnnouncement || paActive || announcementSpeaking} onClick={() => speak(lastAnnouncement, { signal:'warning' })}>Repeat Last</Button></div>{announcementStatus && <p className="text-[11px] text-muted-foreground">{announcementStatus}</p>}<div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground"><span>{hallVoiceSource === 'amplified' ? 'Amplified hall announcements use an AI-generated announcer voice. If that service is unavailable, RallyHub automatically falls back to the device voice.' : 'Chrome / device voice is selected for announcements.'}</span>{hallVoiceEngine === 'amplified' && <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-700">AMPLIFIED VOICE READY</Badge>}{hallVoiceEngine === 'browser' && <Badge variant="outline" className="text-[9px] border-sky-500/40 text-sky-700">CHROME / DEVICE VOICE</Badge>}{hallVoiceEngine === 'browser-fallback' && <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-700">DEVICE VOICE FALLBACK</Badge>}</div></div></div>
            </details>

            <details id="cc-player-controls" className="rounded-xl border border-border bg-card overflow-hidden">
              <summary className="cursor-pointer list-none p-4 sm:p-5 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Player Changes & Reserves</p><p className="text-xs text-muted-foreground">Quick reserve handover, injury, withdrawal, replacement or late arrival.</p></div><ChevronDown className="w-4 h-4 text-muted-foreground" /></summary>
              <div className="border-t border-border p-4 sm:p-5 space-y-4">
                <details className="rounded-lg border border-border bg-secondary/20 p-3">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-xs font-semibold"><span>Player status colour key</span><ChevronDown className="w-4 h-4 text-muted-foreground" /></summary>
                  <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                    {[
                      ['TEMP SUB','amber','Temporary sub for 1–2 games'],
                      ['RESERVE IN','sky','Reserve activated into play'],
                      ['COVER','violet','Existing rotation player covering'],
                      ['REPLACEMENT','emerald','New permanent replacement'],
                      ['INJURED','red','Player injured'],
                      ['WITHDRAWN / UNAVAILABLE','slate','Player withdrawn or unavailable'],
                      ['REPLACED','slate','Original player replaced'],
                      ['LATE · R#','yellow','Available from a later round'],
                    ].map(([label,tone,help]) => {
                      const cls = tone === 'amber' ? 'border-amber-500/70 bg-amber-500/15 text-amber-800 dark:text-amber-200' : tone === 'sky' ? 'border-sky-500/70 bg-sky-500/15 text-sky-800 dark:text-sky-200' : tone === 'violet' ? 'border-violet-500/70 bg-violet-500/15 text-violet-800 dark:text-violet-200' : tone === 'emerald' ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200' : tone === 'red' ? 'border-red-500/70 bg-red-500/15 text-red-800 dark:text-red-200' : tone === 'yellow' ? 'border-yellow-500/70 bg-yellow-500/15 text-yellow-800 dark:text-yellow-200' : 'border-slate-500/60 bg-slate-500/15 text-slate-800 dark:text-slate-200';
                      return <div key={label} className={cn('rounded-md border px-2.5 py-2', cls)}><div className="font-black uppercase text-[10px]">{label}</div><div className="mt-0.5 text-[10px] font-medium opacity-90">{help}</div></div>;
                    })}
                  </div>
                </details>
                {unusedTeamReserves.length > 0 && <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3"><div><p className="text-sm font-bold">Quick Reserve Handover</p><p className="text-xs text-muted-foreground mt-1">For a planned reserve change: choose the player coming off, then press the handover button. Only future unplayed fixtures change.</p></div><div className="grid md:grid-cols-2 gap-3">{unusedTeamReserves.map(reserve => { const sameSidePlayers = participants.filter(p => p.side === reserve.side && p.id !== reserve.id && ['active','late'].includes(p.status) && ((p.roster_role || 'rotation') === 'rotation' || p.reserve_activated)); const selected = quickReserveOutgoing[reserve.id] || ''; return <div key={reserve.id} className="rounded-lg border border-border bg-card p-3 space-y-2"><div><p className="text-xs text-muted-foreground">Reserve ready · {reserve.side === 'club_a' ? event.club_a_name : event.club_b_name}</p><p className="font-bold">{reserve.display_name}</p></div><Select value={selected} onValueChange={v => setQuickReserveOutgoing(q => ({ ...q, [reserve.id]:v }))} disabled={playerControlBusy}><SelectTrigger data-testid={`cc-quick-reserve-outgoing-${reserve.id}`} className="bg-secondary"><SelectValue placeholder="Who is coming off?" /></SelectTrigger><SelectContent>{sameSidePlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select><Button data-testid={`cc-quick-reserve-activate-${reserve.id}`} className="w-full" disabled={!selected || playerControlBusy} onClick={() => activateReserveQuick(reserve.id, selected)}>Put {reserve.display_name} In Now</Button></div>; })}</div></div>}
                <div className="rounded-lg bg-secondary/30 p-4 space-y-3">
                  <div><p className="text-sm font-semibold">Event Display Name</p><p className="text-xs text-muted-foreground">Correct a spelling or shorten an imported full name for this event only. The original registration / Respond record is not changed.</p></div>
                  <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
                    <Select value={displayNameEdit.participantId} onValueChange={v => { const p = participants.find(x => x.id === v); setDisplayNameEdit({ participantId:v, displayName:p?.display_name || '' }); }} disabled={displayNameBusy}>
                      <SelectTrigger className="bg-secondary"><SelectValue placeholder="Choose player" /></SelectTrigger>
                      <SelectContent>{participants.filter(p => ['club_a','club_b'].includes(p.side) && !['replaced'].includes(p.status)).sort((a,b)=>String(a.display_name||'').localeCompare(String(b.display_name||''))).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input value={displayNameEdit.displayName} onChange={e => setDisplayNameEdit(x => ({ ...x, displayName:e.target.value }))} placeholder="Event display name" className="bg-secondary" disabled={!displayNameEdit.participantId || displayNameBusy} />
                    <Button variant="outline" disabled={!canManageEvent || displayNameBusy || !displayNameEdit.participantId || !displayNameEdit.displayName.trim()} onClick={saveEventDisplayName}>{displayNameBusy ? 'Saving…' : 'Save Name'}</Button>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/30 p-4 space-y-3">
                  <div><p className="text-sm font-semibold">Player Change</p><p className="text-xs text-muted-foreground">Choose how RallyHub should handle an injury or early departure. Completed results stay unchanged; only future unplayed fixtures can change.</p></div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div className="relative"><Label className="text-xs">Player leaving / sitting out</Label><Input data-testid="cc-replacement-outgoing" value={playerSearch} onChange={e => { const value = e.target.value; setPlayerSearch(value); setPlayerControlStatus(null); if (replacement.outgoingId) setReplacement(r => ({ ...r, outgoingId:'', candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'' })); }} placeholder="Type player name…" className="mt-1 bg-secondary" disabled={playerControlBusy} autoComplete="off" />{playerSearch.trim() && !replacement.outgoingId && <div className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-auto rounded-md border border-border bg-popover shadow-lg">{participants.filter(p => p.status === 'active' && ['club_a','club_b'].includes(p.side) && ((p.roster_role || 'rotation') === 'rotation' || p.reserve_activated) && String(p.display_name || '').toLowerCase().includes(playerSearch.trim().toLowerCase())).slice(0,8).map(p => <button key={p.id} type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-secondary flex items-center justify-between gap-3" onClick={() => { setPlayerSearch(p.display_name); setPlayerControlStatus(null); setReplacement(r => ({ ...r, outgoingId:p.id, candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'' })); }}><span className="font-medium truncate">{p.display_name}</span><span className="text-[10px] text-muted-foreground shrink-0">{p.side === 'club_a' ? event.club_a_name : event.club_b_name}</span></button>)}{!participants.some(p => p.status === 'active' && ['club_a','club_b'].includes(p.side) && ((p.roster_role || 'rotation') === 'rotation' || p.reserve_activated) && String(p.display_name || '').toLowerCase().includes(playerSearch.trim().toLowerCase())) && <div className="px-3 py-2 text-xs text-muted-foreground">No matching player</div>}</div>}{replacement.outgoingId && <p className="mt-1 text-[10px] text-primary">Selected · {participants.find(p => p.id === replacement.outgoingId)?.display_name}</p>}</div>
                    <div><Label className="text-xs">Replacement route</Label><Select value={replacement.mode || 'new'} onValueChange={v => { setPlayerControlStatus(null); setReplacement(r => ({ ...r, mode:v, candidateId:'', reserveParticipantId:'', coverParticipantId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'', temporaryGames:1 })); }} disabled={playerControlBusy || !replacement.outgoingId}><SelectTrigger data-testid="cc-replacement-mode" className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="temporary">Temporary sub · 1 or 2 games</SelectItem><SelectItem value="new">Permanent replacement</SelectItem><SelectItem value="reserve">Activate team reserve</SelectItem><SelectItem value="cover">Existing rotation player covers</SelectItem></SelectContent></Select></div>
                    {replacement.mode === 'temporary' ? <div><Label className="text-xs">How many games?</Label><Select value={String(replacement.temporaryGames || 1)} onValueChange={v => setReplacement(r => ({ ...r, temporaryGames:Number(v) }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Next 1 game only</SelectItem><SelectItem value="2">Next 2 games only</SelectItem></SelectContent></Select></div> : <div><Label className="text-xs">Reason</Label><Select value={replacement.status} onValueChange={v => setReplacement(r => ({ ...r, status:v }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="injured">Injured</SelectItem><SelectItem value="withdrawn">Withdrawn / unavailable</SelectItem></SelectContent></Select></div>}
                    {['new','temporary'].includes(replacement.mode || 'new') && <><div><Label className="text-xs">Registered available player</Label><Select value={replacement.candidateId || 'manual'} onValueChange={v => { setPlayerControlStatus(null); if (v === 'manual') { setReplacement(r => ({ ...r, candidateId:'', incomingName:'', incomingGender:'', incomingSourcePlayerId:'', incomingParticipantType:'' })); return; } const c = availableReplacementCandidates.find(x => x.id === v); if (c) setReplacement(r => ({ ...r, candidateId:c.id, incomingName:c.displayName || '', incomingGender:c.gender || '', incomingSourcePlayerId:c.sourcePlayerId || '', incomingParticipantType:c.participantType || '' })); }} disabled={playerControlBusy || !replacement.outgoingId}><SelectTrigger data-testid="cc-replacement-candidate" className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">Type a player manually</SelectItem>{availableReplacementCandidates.filter(c => c.side === participants.find(p=>p.id===replacement.outgoingId)?.side).map(c => <SelectItem key={c.id} value={c.id}>{c.displayName}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs">{replacement.mode === 'temporary' ? 'Temporary sub name' : 'Replacement name'}</Label><Input data-testid="cc-replacement-name" value={replacement.incomingName} onChange={e => { setPlayerControlStatus(null); setReplacement(r => ({ ...r, candidateId:'', incomingName:e.target.value, incomingSourcePlayerId:'', incomingParticipantType:'' })); }} placeholder="Name" className="mt-1 bg-secondary" disabled={playerControlBusy} /></div><div><Label className="text-xs">Gender</Label><Select value={replacement.incomingGender || 'inherit'} onValueChange={v => setReplacement(r => ({ ...r, incomingGender:v === 'inherit' ? '' : v }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inherit">Inherit outgoing player</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div></>}
                    {replacement.mode === 'reserve' && <div className="lg:col-span-2"><Label className="text-xs">Team reserve</Label><Select value={replacement.reserveParticipantId} onValueChange={v => setReplacement(r => ({ ...r, reserveParticipantId:v }))} disabled={playerControlBusy || !replacement.outgoingId}><SelectTrigger data-testid="cc-team-reserve" className="mt-1 bg-secondary"><SelectValue placeholder="Choose reserve" /></SelectTrigger><SelectContent>{participants.filter(p => p.side === participants.find(x=>x.id===replacement.outgoingId)?.side && (p.roster_role || 'rotation') === 'reserve' && !p.reserve_activated && ['active','late'].includes(p.status) && Number(p.available_from_round || 1) <= currentRound).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name} · Reserve</SelectItem>)}</SelectContent></Select></div>}
                    {replacement.mode === 'cover' && <div className="lg:col-span-2"><Label className="text-xs">Existing rotation player to cover</Label><Select value={replacement.coverParticipantId} onValueChange={v => setReplacement(r => ({ ...r, coverParticipantId:v }))} disabled={playerControlBusy || !replacement.outgoingId}><SelectTrigger data-testid="cc-cover-player" className="mt-1 bg-secondary"><SelectValue placeholder="Choose cover player" /></SelectTrigger><SelectContent>{participants.filter(p => p.id !== replacement.outgoingId && p.side === participants.find(x=>x.id===replacement.outgoingId)?.side && ['active','late'].includes(p.status) && Number(p.available_from_round || 1) <= currentRound && ((p.roster_role || 'rotation') === 'rotation' || p.reserve_activated)).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select></div>}
                    <div><Label className="text-xs">Note</Label><Input value={replacement.reason} onChange={e => setReplacement(r => ({ ...r, reason:e.target.value }))} placeholder="Optional note" className="mt-1 bg-secondary" /></div>
                  </div>
                  {replacement.mode === 'reserve' && replacement.outgoingId && !participants.some(p => p.side === participants.find(x=>x.id===replacement.outgoingId)?.side && (p.roster_role || 'rotation') === 'reserve' && !p.reserve_activated && ['active','late'].includes(p.status) && Number(p.available_from_round || 1) <= currentRound) && <p className="text-[11px] text-muted-foreground">No unused team reserve is available from this round. Choose another route.</p>}
                  {replacement.mode === 'cover' && <p className="text-[11px] text-muted-foreground">RallyHub will use the chosen player wherever they are free. If they already have a fixture in the same round, a resting rotation player is inserted into the vacated slot so nobody can appear twice in one round.</p>}
                  {replacement.mode === 'temporary' && <p className="text-[11px] text-muted-foreground">Temporary cover changes only this player's next 1 or 2 unresolved games. The original player stays active and automatically returns for their later scheduled games.</p>}
                  <div className="flex flex-col sm:flex-row gap-2"><Button data-testid="cc-replace-player" className="w-full sm:w-auto" disabled={!canManageEvent || playerControlBusy || !replacement.outgoingId || (['new','temporary'].includes(replacement.mode || 'new') && !replacement.incomingName.trim()) || (replacement.mode === 'reserve' && !replacement.reserveParticipantId) || (replacement.mode === 'cover' && !replacement.coverParticipantId)} onClick={applyReplacement}>{playerControlBusy ? 'Applying…' : replacement.mode === 'reserve' ? `Activate Reserve from Round ${currentRound}` : replacement.mode === 'cover' ? 'Use Cover & Rebalance' : replacement.mode === 'temporary' ? `Use Temporary Sub for ${Number(replacement.temporaryGames || 1)} Game${Number(replacement.temporaryGames || 1) === 1 ? '' : 's'}` : `Replace from Round ${currentRound}`}</Button><Button variant="outline" className="w-full sm:w-auto" disabled={!canManageEvent || playerControlBusy || !replacement.outgoingId} onClick={withdrawWithoutReplacement}>Continue Short · No Replacement</Button></div>
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
          <div className="flex items-center justify-start">
            <Button variant="outline" onClick={() => setTab('live')}><ArrowLeft className="w-4 h-4 mr-2" />Back to Live Event</Button>
          </div>
          {event?.pot_enabled && <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{awardTitle}</p>
                <p className="text-xs text-muted-foreground">One winner from each team. At the end choose either Highest Scoring Players or a Player Vote.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{effectivePotStatus}</Badge>
                {canManagePot && event.pot_status === 'open' && <Button data-testid="cc-close-pot-vote" size="sm" variant="destructive" onClick={() => setPotStatus('closed')}>Close Voting</Button>}
              </div>
            </div>

            {canManagePot && effectivePotStatus === 'closed' && !(awardMethod === 'vote' && potTeamVoteCount > 0) && <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
              <div><p className="text-xs font-bold uppercase tracking-wider">Choose the award method</p><p className="mt-1 text-xs text-muted-foreground">Highest Scorers uses the normal-round scores already saved in RallyHub. Player Vote uses one ballot per phone/browser.</p></div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-lg border bg-card p-4"><p className="font-semibold">Highest Scoring Players</p><p className="mt-1 text-xs text-muted-foreground">Adds the points scored by each player's pair in every normal-round match they played. Tie-break: match wins, then point differential.</p><Button className="mt-3 w-full" disabled={event.status !== 'completed'} onClick={calculateHighestScorers}>Calculate Highest Scorers</Button></div>
                <div className="rounded-lg border bg-card p-4"><p className="font-semibold">Player Vote</p><p className="mt-1 text-xs text-muted-foreground">Players choose one person from each team. Use this when you want the social Player of the Tournament award.</p><div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-end"><div className="flex-1"><Label className="text-xs">Voting window</Label><Select value={potDuration} onValueChange={setPotDuration}><SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="5">5 minutes</SelectItem><SelectItem value="10">10 minutes</SelectItem><SelectItem value="15">15 minutes</SelectItem><SelectItem value="manual">Manual close</SelectItem></SelectContent></Select></div><Button onClick={() => setPotStatus('open')}>Open Player Vote</Button></div></div>
              </div>
              {awardMethod === 'vote' && potTeamVoteCount > 0 && <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={potTieUnresolved} onClick={revealPot}>Reveal Vote Result</Button><Button variant="ghost" onClick={resetPotVoting}>Reset Award Choice</Button></div>}
              {awardMethod === 'vote' && potTeamVoteCount === 0 && <p className="text-xs text-muted-foreground">No usable ballots yet. You can reopen voting or use Highest Scorers instead.</p>}
            </div>}

            {event.pot_status === 'open' && <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div><p className="text-xs uppercase tracking-wider font-bold text-primary">Voting open</p><p className="text-2xl font-black tabular-nums mt-1">{potCountdownText}</p></div>
                {canManagePot && <div className="flex flex-wrap gap-2">
                  {event.pot_vote_closes_at && <Button variant="outline" onClick={extendPotVoting}>+5 Minutes</Button>}
                  <Button variant="destructive" onClick={() => setPotStatus('closed')}>Close Voting Now</Button>
                </div>}
              </div>
            </div>}

            {canManagePot && event.pot_status === 'closed' && awardMethod === 'vote' && potTeamVoteCount > 0 && <div className="rounded-xl border-2 border-primary/25 bg-primary/5 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-primary">Host-only voting results</p>
                  <p className="mt-1 text-sm text-muted-foreground">{potBallotCount} ballot{potBallotCount === 1 ? '' : 's'} · {potTeamVoteCount} team vote{potTeamVoteCount === 1 ? '' : 's'}. Individual voter choices remain private.</p>
                </div>
                <Badge variant="outline">Voting closed</Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {[[event.club_a_name,potResultsA,potTopA],[event.club_b_name,potResultsB,potTopB]].map(([clubName,results,leaders]) => <div key={clubName} className="rounded-lg border bg-card p-4">
                  <p className="font-bold">{clubName}</p>
                  <div className="mt-3 space-y-2">
                    {results.length ? results.map((player,index) => <div key={player.id} className="flex items-center justify-between gap-3 rounded-md bg-secondary/30 px-3 py-2">
                      <div className="min-w-0">
                        <span className="text-sm font-semibold truncate">{player.display_name}</span>
                        {index === 0 && leaders.length === 1 ? <Badge className="ml-2 align-middle">Leader</Badge> : null}
                        {index === 0 && leaders.length > 1 ? <Badge variant="outline" className="ml-2 align-middle">Tied lead</Badge> : null}
                      </div>
                      <span className="text-sm font-black tabular-nums">{player.voteCount} vote{player.voteCount === 1 ? '' : 's'}</span>
                    </div>) : <p className="text-sm text-muted-foreground">No votes recorded for this team.</p>}
                  </div>
                </div>)}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="ghost" onClick={resetPotVoting}>Reset Award Choice</Button>
                <Button disabled={potTieUnresolved} onClick={revealPot}>{potTieUnresolved ? 'Resolve Tie Before Reveal' : 'Reveal Winners'}</Button>
              </div>
              <p className="text-[11px] text-muted-foreground">These totals are visible to the host only. The Live Event View will not show the winners until you press Reveal Winners.</p>
            </div>}

            {event.pot_status === 'open' && awardMethod === 'vote' && <div className="text-xs text-muted-foreground">
              {isAdmin ? <><strong className="text-foreground">{potBallotCount}</strong> ballot{potBallotCount === 1 ? '' : 's'} received · <strong className="text-foreground">{potTeamVoteCount}</strong> team vote{potTeamVoteCount === 1 ? '' : 's'} recorded. </> : 'Votes are securely recorded. '}
              Running totals remain hidden until voting closes.
            </div>}

            {canManagePot && effectivePotStatus === 'closed' && (potTopA.length > 1 || potTopB.length > 1) && <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 space-y-3"><div><p className="text-sm font-bold text-amber-600">Tie detected in Player of the Tournament voting</p><p className="text-xs text-muted-foreground mt-1">Use a private RallyHub Coin Toss to select one winner from the tied top vote. The selected name stays hidden from the Live Event View until you press Reveal Results.</p></div><div className="grid sm:grid-cols-2 gap-3">{[['club_a',event.club_a_name,potTopA,potSavedA],['club_b',event.club_b_name,potTopB,potSavedB]].map(([side,clubName,candidates,saved]) => candidates.length > 1 ? <div key={side} className="rounded-lg border border-border bg-card p-4 text-center"><p className="text-xs font-semibold">{clubName}</p><p className="mt-2 text-xs text-muted-foreground">{candidates.map(p=>p.display_name).join(' · ')}</p>{saved ? <div className="mt-3"><Badge variant="outline">Coin toss complete</Badge><p className="mt-2 font-black">{saved.display_name}</p><p className="text-[10px] text-muted-foreground">Saved privately · ready to reveal</p></div> : <><div className="mt-3 min-h-8 font-black text-primary">{potTiebreakUi[side]?.display || 'Tie unresolved'}</div><Button className="mt-2 w-full" variant="outline" disabled={potTiebreakUi[side]?.running} onClick={() => runPotTiebreak(side)}>{potTiebreakUi[side]?.running ? 'Shuffling…' : 'Coin Toss'}</Button></>}</div> : null)}</div>{potTieUnresolved ? <p className="text-xs text-amber-700">Resolve each tied team before Reveal Results becomes available.</p> : <div className="text-center"><Button onClick={revealPot}>Reveal Results</Button></div>}</div>}

            {event.pot_status === 'revealed' && <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary/10 p-4 text-center">
                <Trophy className="w-5 h-5 text-primary mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">{event.club_a_name}</p>
                <p className="font-bold mt-1">{potWinnersA.length ? potWinnersA.map(p => p.display_name).join(' & ') : 'No winner'}</p>
                {isAdmin && potWinnersA.map(p => awardMethod === 'points' ? <p key={p.id} className="text-xs text-muted-foreground mt-1">{individualPointStats[p.id]?.pointsFor || 0} points · {individualPointStats[p.id]?.gamesPlayed || 0} games · {individualPointStats[p.id]?.wins || 0} wins</p> : <p key={p.id} className="text-xs text-muted-foreground mt-1">{potCounts[p.id] || 0} vote{(potCounts[p.id] || 0) === 1 ? '' : 's'}</p>)}
              </div>
              <div className="rounded-xl bg-primary/10 p-4 text-center">
                <Trophy className="w-5 h-5 text-primary mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">{event.club_b_name}</p>
                <p className="font-bold mt-1">{potWinnersB.length ? potWinnersB.map(p => p.display_name).join(' & ') : 'No winner'}</p>
                {isAdmin && potWinnersB.map(p => awardMethod === 'points' ? <p key={p.id} className="text-xs text-muted-foreground mt-1">{individualPointStats[p.id]?.pointsFor || 0} points · {individualPointStats[p.id]?.gamesPlayed || 0} games · {individualPointStats[p.id]?.wins || 0} wins</p> : <p key={p.id} className="text-xs text-muted-foreground mt-1">{potCounts[p.id] || 0} vote{(potCounts[p.id] || 0) === 1 ? '' : 's'}</p>)}
              </div>
              {canManagePot && <div className="sm:col-span-2 text-center"><Button variant="outline" onClick={resetPotVoting}>Choose Different Award Method</Button></div>}
            </div>}
          </div>}
          {score.completedMatches > 0 ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border bg-secondary/20 px-4 py-4 sm:px-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2.5">
                      <img src={RALLYHUB_LOGO_URL} alt="RallyHub logo" className="h-10 w-10 object-contain sm:h-11 sm:w-11" />
                      <div className="text-left">
                        <div className="text-xl font-black leading-none tracking-[-.04em] text-[#081342]">Rally<span className="text-[#078e48]">Hub</span></div>
                        <div className="mt-1 text-[6px] font-bold tracking-[.27em] text-[#0c1e53]">PLAY <span className="text-[#0b914a]">•</span> CONNECT <span className="text-[#0b914a]">•</span> BELONG</div>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] font-black uppercase tracking-[.24em] text-primary">RallyHub Interclub</p>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-foreground">{['completed','archived'].includes(event?.status) ? 'Final Result' : 'Interclub Result'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 p-3 sm:gap-5 sm:p-6">
                  <div className="flex min-w-0 flex-col items-center justify-center rounded-2xl border bg-background/70 p-3 text-center sm:p-4" style={{borderTopWidth:'6px',borderTopColor:event?.club_a_primary_colour || '#2563eb'}}>
                    {event?.club_a_logo_url ? <img src={event.club_a_logo_url} alt={`${event.club_a_name} logo`} className="h-14 w-14 rounded-xl bg-white object-contain p-1.5 shadow-sm sm:h-20 sm:w-20" /> : <div className="h-14 w-14 rounded-xl bg-secondary sm:h-20 sm:w-20" />}
                    <p className="mt-2 max-w-full break-words text-sm font-black leading-tight sm:text-xl">{event?.club_a_name}</p>
                    <p className="mt-1 text-[clamp(3rem,8vw,5.5rem)] font-black leading-none tabular-nums">{overallScore.clubA}</p>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Interclub points</p>
                  </div>

                  <div className="flex min-w-[3.5rem] items-center justify-center text-center sm:min-w-[6rem]">
                    <span className="text-xs font-black uppercase tracking-[.28em] text-muted-foreground sm:text-sm">VS</span>
                  </div>

                  <div className="flex min-w-0 flex-col items-center justify-center rounded-2xl border bg-background/70 p-3 text-center sm:p-4" style={{borderTopWidth:'6px',borderTopColor:event?.club_b_primary_colour || '#7f1d1d'}}>
                    {event?.club_b_logo_url ? <img src={event.club_b_logo_url} alt={`${event.club_b_name} logo`} className="h-14 w-14 rounded-xl bg-white object-contain p-1.5 shadow-sm sm:h-20 sm:w-20" /> : <div className="h-14 w-14 rounded-xl bg-secondary sm:h-20 sm:w-20" />}
                    <p className="mt-2 max-w-full break-words text-sm font-black leading-tight sm:text-xl">{event?.club_b_name}</p>
                    <p className="mt-1 text-[clamp(3rem,8vw,5.5rem)] font-black leading-none tabular-nums">{overallScore.clubB}</p>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Interclub points</p>
                  </div>
                </div>

                <div className="border-t border-border px-4 py-5 sm:px-6">
                  <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <p className="text-2xl font-black tabular-nums sm:text-3xl">{score.matchesWonA}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{event?.club_a_name} wins</p>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <p className="text-2xl font-black tabular-nums sm:text-3xl">{score.draws}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Draws</p>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <p className="text-2xl font-black tabular-nums sm:text-3xl">{score.matchesWonB}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{event?.club_b_name} wins</p>
                    </div>
                  </div>

                  <div className="mx-auto mt-3 grid max-w-3xl grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xl font-black tabular-nums sm:text-2xl">{score.gamePointsA}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Points scored</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xl font-black tabular-nums sm:text-2xl">{score.gamePointDifference >= 0 ? '+' : ''}{score.gamePointDifference}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Point differential</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xl font-black tabular-nums sm:text-2xl">{score.gamePointsB}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Points scored</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">{score.completedMatches} Interclub matches</Badge>
                    {['completed','archived'].includes(event?.status) && <Badge className="bg-primary/10 text-primary">{event.showcase_resolved_winner === 'draw' ? 'Overall Draw' : `Winner · ${event.showcase_resolved_winner === 'club_b' ? event.club_b_name : event.club_a_name}`}</Badge>}
                  </div>

                  {showcaseMatch && ['completed'].includes(showcaseMatch.status) && (
                    <div className="mx-auto mt-5 max-w-3xl rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">{showcaseMatch.showcase_mode === 'exhibition' ? 'Optional Showcase Final · Exhibition' : 'Showcase Tiebreak Final'}</p>
                      <p className="mt-2 text-lg font-black sm:text-xl">{event?.club_a_name} <span className="tabular-nums">{showcaseMatch.score_a ?? 0}–{showcaseMatch.score_b ?? 0}</span> {event?.club_b_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{(showcaseMatch.club_a_names || []).join(' & ')} vs {(showcaseMatch.club_b_names || []).join(' & ')}</p>
                      <p className="mt-2 text-[11px] font-semibold text-muted-foreground">First to {showcaseMatch.showcase_target_points || 11} · win by {showcaseMatch.showcase_win_by || 1}</p>
                      <p className="mt-2 text-xs font-semibold">{showcaseMatch.showcase_mode === 'exhibition' ? 'Exhibition only · the Interclub result above is unchanged' : `${showcaseMatch.winner === 'club_a' ? event?.club_a_name : event?.club_b_name} won the tiebreak Showcase`}</p>
                    </div>
                  )}

                  {['completed','archived'].includes(event?.status) ? (
                    <div className="mt-5 rounded-xl border border-primary/25 bg-primary/10 px-4 py-4 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Final Result</p>
                      <p className="mt-1 text-base font-black sm:text-lg">{event.showcase_resolved_winner === 'draw' ? 'Interclub finished as an overall draw' : `${event.showcase_resolved_winner === 'club_b' ? event.club_b_name : event.club_a_name} winners`}</p>
                      {event?.finalised_at && <p className="mt-1 text-[10px] text-muted-foreground">Finalised {new Date(event.finalised_at).toLocaleString('en-IE', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>}
                      {hasManagePermission && <div className="mt-4">{event.status === 'completed' ? <Button variant="outline" onClick={archiveEvent}>Archive Interclub Challenge</Button> : <Button variant="outline" onClick={reopenEvent}>Reopen Archived Interclub Challenge</Button>}</div>}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center">
                      <p className="text-xs font-semibold text-amber-600">Provisional · all results are saved, but the Interclub has not yet been finalised</p>
                    </div>
                  )}
                </div>
              </div>

              {resolvedNormalCount === normalMatches.length && !['completed','archived'].includes(event?.status) && score.clubA !== score.clubB && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold">Round {plannedRounds} complete — what would you like to do?</p>
                  <p className="text-xs text-muted-foreground mt-1">The normal Interclub result is decided. {event?.showcase_enabled ? 'Play the optional Showcase Final only if time allows, or finish now and continue to the final result.' : 'Continue to the final result.'}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    {event?.showcase_enabled && !showcaseMatch && <Button variant="outline" disabled={!canManageEvent} onClick={() => document.getElementById('showcase-final-panel')?.scrollIntoView({ behavior:'smooth', block:'start' })}>Play Optional Showcase Final</Button>}
                    <Button disabled={!canFinaliseEvent} onClick={() => finaliseEvent(score.clubA > score.clubB ? 'club_a' : 'club_b', 'none', 'Clear winner after normal Interclub Challenge matches.')}>{canFinaliseEvent ? 'Finish Interclub & Show Final Result' : 'Finalisation requires organiser permission'}</Button>
                  </div>
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

              {canManageEvent && resolvedNormalCount === normalMatches.length && event?.showcase_enabled && !['completed','archived'].includes(event?.status) && (
                <div id="showcase-final-panel" className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div><p className="text-sm font-semibold">{score.clubA === score.clubB ? 'Showcase / Tiebreak Final' : 'Optional Showcase Final'}</p><p className="text-xs text-muted-foreground mt-1">{score.clubA === score.clubB ? `Select any two eligible players from each club. The winner receives ${event.showcase_points} Interclub points and decides the tied event.` : 'Select any two eligible players from each club. This is an exhibition match only: it is recorded in RallyHub but does not add points or change the Interclub winner.'}</p></div>
                  {!showcaseMatch ? (
                    <>
                      <div className="rounded-lg bg-secondary/40 p-4">
                        <p className="text-xs font-semibold">1. Choose the Showcase format</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">The Showcase is points-based, not timed. Choose the format before selecting the four players.</p>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div><Label className="text-xs">Play to</Label><Select value={String(showcaseFormat.targetPoints)} onValueChange={v => setShowcaseFormat(s => ({ ...s, targetPoints:Number(v) }))}><SelectTrigger className="mt-1 bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="11">11 points</SelectItem><SelectItem value="15">15 points</SelectItem></SelectContent></Select></div>
                          <div><Label className="text-xs">Win by</Label><Select value={String(showcaseFormat.winBy)} onValueChange={v => setShowcaseFormat(s => ({ ...s, winBy:Number(v) }))}><SelectTrigger className="mt-1 bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1 point</SelectItem><SelectItem value="2">2 points</SelectItem></SelectContent></Select></div>
                        </div>
                        <p className="mt-3 text-xs font-semibold text-primary">First to {showcaseFormat.targetPoints} · win by {showcaseFormat.winBy} · change ends at {Number(showcaseFormat.targetPoints) === 15 ? 8 : 6}</p>
                      </div>
                      <p className="text-xs font-semibold">2. Select the players</p>
                      <div className="grid lg:grid-cols-2 gap-4">
                        {[
                          ['club_a', event.club_a_name, aPlayers, 'a1', 'a2'],
                          ['club_b', event.club_b_name, bPlayers, 'b1', 'b2'],
                        ].map(([side, clubName, list, player1Key, player2Key]) => {
                          const eligible = list.filter(p => !['withdrawn','injured','replaced'].includes(p.status));
                          return <div key={side} className="rounded-lg bg-secondary/40 p-4 space-y-3"><p className="text-xs font-semibold">{clubName}</p><div><Label className="text-xs">Player 1</Label><Select value={showcaseSelection[player1Key]} onValueChange={v => setShowcaseSelection(s => ({ ...s, [player1Key]: v }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent>{eligible.filter(p => p.id !== showcaseSelection[player2Key]).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs">Player 2</Label><Select value={showcaseSelection[player2Key]} onValueChange={v => setShowcaseSelection(s => ({ ...s, [player2Key]: v }))}><SelectTrigger className="mt-1 bg-secondary"><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent>{eligible.filter(p => p.id !== showcaseSelection[player1Key]).map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}</SelectContent></Select></div></div>;
                        })}
                      </div>
                      <Button className="w-full" onClick={createShowcaseFinal}>{score.clubA === score.clubB ? 'Create Tiebreak Showcase Final' : 'Create Optional Showcase Final'}</Button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                        <div className="flex flex-wrap justify-center gap-2"><Badge variant="outline">{showcaseMatch.showcase_mode === 'exhibition' ? 'Exhibition' : 'Tiebreak'}</Badge><Badge variant="outline">First to {showcaseMatch.showcase_target_points || 11} · win by {showcaseMatch.showcase_win_by || 1}</Badge></div>
                        <p className="mt-3 text-4xl font-black tabular-nums">{showcaseMatch.score_a ?? 0} – {showcaseMatch.score_b ?? 0}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{(showcaseMatch.club_a_names || []).join(' & ')} vs {(showcaseMatch.club_b_names || []).join(' & ')}</p>
                      </div>
                      {!showcaseScorerLink ? <Button variant="outline" className="w-full" onClick={prepareShowcaseScorerLink}>Prepare Referee Scorer Link / QR</Button> : <div className="rounded-xl border border-border bg-secondary/30 p-4 flex flex-col sm:flex-row gap-4 items-center"><QRCodeSVG value={showcaseScorerLink} size={112}/><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Referee live scorer</p><p className="mt-1 text-[10px] text-muted-foreground break-all">{showcaseScorerLink}</p><p className="mt-2 text-xs text-muted-foreground">Open this on the referee’s phone. The +/− score updates the Live Event View live and gives the change-ends alert at {Number(showcaseMatch.showcase_target_points || 11) === 15 ? 8 : 6}.</p><div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(showcaseScorerLink)}>Copy scorer link</Button><Button size="sm" variant="outline" onClick={() => window.open(showcaseScorerLink,'_blank','noopener,noreferrer')}>Open scorer</Button></div></div></div>}
                      <details className="rounded-lg border border-border bg-secondary/20">
                        <summary className="cursor-pointer px-4 py-3 text-xs font-semibold">Host fallback · enter final score manually</summary>
                        <div className="border-t border-border p-3"><ScoreCard key={`${showcaseMatch.id}-${showcaseMatch.revision}`} match={showcaseMatch} clubAName={event.club_a_name} clubBName={event.club_b_name} onSaved={sync} networkOnline={networkOnline} onQueue={queueOfflineScore} canScore={canScoreEvent} /></div>
                      </details>
                      {['completed'].includes(showcaseMatch.status) && <Button className="w-full" disabled={!canFinaliseEvent} onClick={finaliseShowcase}>{showcaseMatch.showcase_mode === 'exhibition' ? `Finalise ${INTERCLUB_EVENT_LABEL} · Showcase stays exhibition only` : `Apply ${event.showcase_points} Points & Finalise ${INTERCLUB_EVENT_LABEL}`}</Button>}
                    </div>
                  )}
                </div>
              )}

              

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
