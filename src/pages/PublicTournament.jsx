import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Clock, ChevronRight, Trophy, RotateCcw, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { generateNextRound, generateRound1, createKotcState, computeKotcLeaderboard } from '@/lib/kingOfCourtEngine';
import KotcRotationSummary from '@/components/kotc/KotcRotationSummary';

// ─── Timer ────────────────────────────────────────────────────────────────────
function TimerDisplay({ scoreFormat }) {
  const isTimed = scoreFormat?.startsWith('timed_');
  const minutes = isTimed ? parseInt(scoreFormat.split('_')[1]) : 0;
  const [seconds, setSeconds] = useState(minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, seconds]);

  if (!isTimed) return null;
  const pct = seconds / (minutes * 60);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4">
      <Clock className="w-5 h-5 text-primary shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-mono font-bold text-foreground">
            {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-muted-foreground">{minutes}-min round</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000', seconds < 60 ? 'bg-destructive' : 'bg-primary')}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>
      <Button size="sm" variant="outline" className="shrink-0" onClick={() => {
        if (seconds === 0) { setSeconds(minutes * 60); setRunning(false); }
        else setRunning(r => !r);
      }}>
        {running ? 'Pause' : seconds === 0 ? 'Reset' : 'Start'}
      </Button>
    </div>
  );
}

// ─── CourtCard ────────────────────────────────────────────────────────────────
function CourtCard({ court, playerMap, onResult, onClearResult, disabled, result }) {
  const teamANames = court.teamA.map(id => playerMap[id] || id).join(' & ');
  const teamBNames = court.teamB.map(id => playerMap[id] || id).join(' & ');
  const isKing = court.courtNumber === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: court.courtNumber * 0.05 }}
      className={cn('glass rounded-xl p-4 space-y-3', isKing && 'glow-green border border-primary/30')}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isKing && <Crown className="w-4 h-4 text-yellow-400" />}
          <span className="text-sm font-bold text-foreground">Court {court.courtNumber}</span>
          {isKing && <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400">King Court</Badge>}
        </div>
        {result && !disabled && (
          <button onClick={() => onClearResult(court.courtNumber)}
            className="text-[10px] text-muted-foreground hover:text-destructive transition-colors underline">
            Edit result
          </button>
        )}
      </div>

      {/* Team A */}
      <div className={cn('rounded-lg p-3 flex items-center justify-between', result === 'A' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary')}>
        <div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Team A</p>
          <p className="text-sm font-semibold text-foreground">{teamANames}</p>
        </div>
        {!disabled && !result && (
          <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-4"
            onClick={() => onResult(court.courtNumber, 'A')}>Won</Button>
        )}
        {result === 'A' && <Trophy className="w-4 h-4 text-primary" />}
      </div>

      <div className="text-center text-[10px] text-muted-foreground font-medium">vs</div>

      {/* Team B */}
      <div className={cn('rounded-lg p-3 flex items-center justify-between', result === 'B' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary')}>
        <div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Team B</p>
          <p className="text-sm font-semibold text-foreground">{teamBNames}</p>
        </div>
        {!disabled && !result && (
          <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-4"
            onClick={() => onResult(court.courtNumber, 'B')}>Won</Button>
        )}
        {result === 'B' && <Trophy className="w-4 h-4 text-primary" />}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PublicTournament() {
  const tournamentId = window.location.pathname.split('/t/')[1];
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingResults, setPendingResults] = useState({});
  const [clearedCourts, setClearedCourts] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [rotationSummary, setRotationSummary] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTournament = useCallback(async () => {
    const res = await base44.functions.invoke('publicRegister', { tournamentId, _probe: true });
    if (res.data?.tournament) {
      setTournament(res.data.tournament);
      setPlayers(res.data.players || []);
    }
    setLoading(false);
  }, [tournamentId]);

  useEffect(() => {
    if (tournamentId) fetchTournament();
  }, [tournamentId, fetchTournament]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-foreground font-semibold">Tournament not found</p>
          <p className="text-sm text-muted-foreground">This link may be invalid or the event has been removed.</p>
        </div>
      </div>
    );
  }

  const isKotc = tournament.format === 'King of the Court';
  const isStarted = tournament.status === 'In Progress' || tournament.status === 'Completed';
  const isCompleted = tournament.status === 'Completed';

  if (!isKotc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-foreground font-semibold">{tournament.name}</p>
          <p className="text-sm text-muted-foreground">Live scoring is only available for King of the Court format.</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Crown className="w-12 h-12 text-yellow-400/60 mx-auto" />
          <p className="text-foreground font-semibold">{tournament.name}</p>
          <p className="text-sm text-muted-foreground">The session hasn't started yet. Check back soon!</p>
          <Button variant="outline" size="sm" onClick={fetchTournament}>
            <RotateCcw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>
    );
  }

  const rawState = tournament.kotc_state ? JSON.parse(tournament.kotc_state) : null;
  const state = rawState ? { ...rawState, pairingHistory: rawState.pairingHistory || [] } : null;
  const currentRoundNum = tournament.kotc_current_round || 1;
  const maxRounds = tournament.kotc_num_rounds || 9;
  const scoreFormat = tournament.kotc_score_format || 'first_11';

  if (!state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">No session data found.</p>
      </div>
    );
  }

  const currentRound = state.rounds[currentRoundNum - 1];
  const playerMap = Object.fromEntries(players.map(p => [p.id, p.full_name || p.id]));
  const savedResults = state.results?.[currentRoundNum] || {};
  const roundResults = Object.fromEntries(
    Object.entries({ ...savedResults, ...pendingResults })
      .filter(([k]) => !clearedCourts.has(Number(k)))
  );
  const allCourtsRecorded = currentRound?.courts.every(c => roundResults[c.courtNumber]);
  const isLastRound = currentRoundNum >= maxRounds;

  const handleResult = (courtNumber, winner) => {
    setPendingResults(prev => ({ ...prev, [courtNumber]: winner }));
    setClearedCourts(prev => { const s = new Set(prev); s.delete(courtNumber); return s; });
  };

  const handleClearResult = (courtNumber) => {
    setPendingResults(prev => { const next = { ...prev }; delete next[courtNumber]; return next; });
    setClearedCourts(prev => new Set([...prev, courtNumber]));
  };

  const saveToServer = async (stateToSave, newRound, isLast) => {
    setSubmitting(true);
    const serialisable = { ...stateToSave, pairingHistory: stateToSave.pairingHistory || [] };
    await base44.functions.invoke('publicRegister', {
      tournamentId,
      action: 'update_kotc',
      kotc_state: JSON.stringify(serialisable),
      kotc_current_round: isLast ? currentRoundNum : currentRoundNum + 1,
      status: isLast ? 'Completed' : 'In Progress',
    });
    toast.success(isLast ? 'Session complete! 🏆' : `Round ${currentRoundNum + 1} ready!`);
    setSubmitting(false);
    // Refresh tournament data
    await fetchTournament();
    setPendingResults({});
    setClearedCourts(new Set());
  };

  const hasAnyResults = currentRoundNum === 1 && Object.keys(state?.results?.[1] || {}).length === 0 && Object.keys(pendingResults).length === 0;
  const canRefreshPairings = hasAnyResults && currentRoundNum === 1 && !isCompleted;

  const handleRefreshPairings = async () => {
    setRefreshing(true);
    const freshState = createKotcState({ players: state.players, numCourts: state.numCourts });
    const newRound1 = generateRound1(freshState, true);
    const newState = { ...freshState, rounds: [newRound1] };
    const serialisable = { ...newState, pairingHistory: newState.pairingHistory || [] };
    await base44.functions.invoke('publicRegister', {
      tournamentId,
      action: 'update_kotc',
      kotc_state: JSON.stringify(serialisable),
      kotc_current_round: 1,
      status: 'In Progress',
    });
    await fetchTournament();
    setRefreshing(false);
    toast.success('Pairings refreshed!');
  };

  const handleCompleteRound = () => {
    if (!allCourtsRecorded) { toast.error('Enter results for all courts first.'); return; }
    const mergedResults = { ...state.results, [currentRoundNum]: roundResults };
    const stateWithResults = { ...state, results: mergedResults };

    if (isLastRound) {
      saveToServer(stateWithResults, null, true);
      return;
    }

    const { nextRound, updatedState, movements } = generateNextRound(stateWithResults, currentRoundNum, roundResults);
    setRotationSummary({
      movements,
      nextRound,
      nextState: { ...updatedState, rounds: [...updatedState.rounds, nextRound] },
    });
  };

  const handleConfirmRotation = async () => {
    if (!rotationSummary) return;
    await saveToServer(rotationSummary.nextState, rotationSummary.nextRound, false);
    setRotationSummary(null);
  };

  const leaderboard = computeKotcLeaderboard({
    ...state,
    results: { ...state.results, [currentRoundNum]: roundResults },
  });

  // Show rotation summary
  if (rotationSummary) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-lg mx-auto">
          <div className="mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-bold text-foreground">{tournament.name}</span>
          </div>
          <KotcRotationSummary
            movements={rotationSummary.movements}
            playerMap={playerMap}
            nextRound={rotationSummary.nextRound}
            onContinue={handleConfirmRotation}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground truncate max-w-[180px]">{tournament.name}</p>
              <p className="text-xs text-muted-foreground">
                Round {currentRoundNum} <span className="opacity-60">of {maxRounds}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: maxRounds }, (_, i) => (
                <div key={i} className={cn('w-2 h-2 rounded-full transition-colors',
                  i + 1 < currentRoundNum ? 'bg-primary' :
                  i + 1 === currentRoundNum ? 'bg-primary animate-pulse' : 'bg-secondary'
                )} />
              ))}
            </div>
            {canRefreshPairings && (
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleRefreshPairings} disabled={refreshing}>
                <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
                {refreshing ? '…' : 'Reshuffle'}
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setShowLeaderboard(s => !s)}>
              <Trophy className="w-3.5 h-3.5" /> {showLeaderboard ? 'Hide' : 'Standings'}
            </Button>
          </div>
        </div>

        {/* Timer */}
        <TimerDisplay scoreFormat={scoreFormat} />

        {/* Leaderboard */}
        {showLeaderboard && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="glass rounded-xl p-4 overflow-hidden">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Standings</h4>
            <div className="space-y-1.5">
              {leaderboard.slice(0, 10).map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 text-xs">
                  <span className={cn('w-5 text-center font-bold', i === 0 ? 'text-yellow-400' : 'text-muted-foreground')}>{i + 1}</span>
                  <span className="flex-1 text-foreground truncate">{p.name}</span>
                  <span className="text-primary font-semibold">{p.wins}W</span>
                  <span className="text-muted-foreground">{p.losses}L</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Courts */}
        {currentRound && (
          <div className="grid sm:grid-cols-2 gap-3">
            {currentRound.courts.map(court => (
              <CourtCard
                key={court.courtNumber}
                court={court}
                playerMap={playerMap}
                onResult={handleResult}
                onClearResult={handleClearResult}
                disabled={isCompleted}
                result={roundResults[court.courtNumber]}
              />
            ))}
          </div>
        )}

        {/* Bench */}
        {currentRound?.bench.length > 0 && (
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bench this round</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentRound.bench.map(id => (
                <Badge key={id} variant="outline" className="text-xs text-muted-foreground">{playerMap[id] || id}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action */}
        {!isCompleted && (
          <Button
            className={cn('w-full gap-2 h-12 text-sm', allCourtsRecorded ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'opacity-50')}
            onClick={handleCompleteRound}
            disabled={!allCourtsRecorded || submitting}
          >
            {submitting
              ? <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Saving…</>
              : isLastRound
                ? <><Trophy className="w-4 h-4" /> Finish Session</>
                : <><ChevronRight className="w-4 h-4" /> Complete Round & Rotate</>
            }
          </Button>
        )}

        {isCompleted && (
          <div className="glass rounded-xl p-6 text-center space-y-2 glow-green">
            <Trophy className="w-10 h-10 text-primary mx-auto" />
            <p className="text-lg font-bold text-foreground">Session Complete!</p>
            <p className="text-sm text-muted-foreground">🏆 {leaderboard[0]?.name} — {leaderboard[0]?.wins} wins</p>
          </div>
        )}
      </div>
    </div>
  );
}