import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Crown, Users, Clock, ChevronRight, Trophy, RefreshCw, StopCircle } from 'lucide-react';
import { generateNextRound, computeKotcLeaderboard, createKotcState, generateRound1 } from '@/lib/kingOfCourtEngine';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import KotcRotationSummary from './KotcRotationSummary';
import KotcRoundRecovery from './KotcRoundRecovery';
import RoundTimer from './RoundTimer';
import PodiumResults from './PodiumResults';
import KotcLivePlayerControls from './KotcLivePlayerControls';
import useKotcRole from '@/hooks/useKotcRole';

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
      className={cn(
        'glass rounded-xl p-4 space-y-3',
        isKing && 'glow-green border border-primary/30'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isKing && <Crown className="w-4 h-4 text-yellow-400" />}
          <span className="text-sm font-bold text-foreground">Court {court.courtNumber}</span>
          {isKing && <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400">King Court</Badge>}
        </div>
        {result && !disabled && (
          <button
            onClick={() => onClearResult(court.courtNumber)}
            className="text-[10px] text-muted-foreground hover:text-destructive transition-colors underline"
          >
            Edit result
          </button>
        )}
      </div>

      {/* Team A */}
      <div className={cn(
        'rounded-lg p-2.5 flex items-center justify-between',
        result === 'A' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary'
      )}>
        <div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Team A</p>
          <p className="text-xs font-semibold text-foreground">{teamANames}</p>
        </div>
        {!disabled && !result && (
          <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onResult(court.courtNumber, 'A')}>Won</Button>
        )}
        {result === 'A' && <Trophy className="w-4 h-4 text-primary" />}
      </div>

      <div className="text-center text-[10px] text-muted-foreground font-medium">vs</div>

      {/* Team B */}
      <div className={cn(
        'rounded-lg p-2.5 flex items-center justify-between',
        result === 'B' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary'
      )}>
        <div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Team B</p>
          <p className="text-xs font-semibold text-foreground">{teamBNames}</p>
        </div>
        {!disabled && !result && (
          <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onResult(court.courtNumber, 'B')}>Won</Button>
        )}
        {result === 'B' && <Trophy className="w-4 h-4 text-primary" />}
      </div>
    </motion.div>
  );
}

// ─── TimerDisplay ─────────────────────────────────────────────────────────────
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
            className={cn('h-full rounded-full transition-all', seconds < 60 ? 'bg-destructive' : 'bg-primary')}
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KotcRoundView({ tournament, players, allPlayers = [], queryClient }) {
  const [pendingResults, setPendingResults] = useState({});
  // clearedCourts tracks courts whose saved result was explicitly cleared so they can be re-entered
  const [clearedCourts, setClearedCourts] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // Rotation summary state: null | { movements, nextRound, nextState, isLast }
  const [rotationSummary, setRotationSummary] = useState(null);
  const [confirmEndEarly, setConfirmEndEarly] = useState(false);
  const [canUndoLiveChange, setCanUndoLiveChange] = useState(false);
  const undoStateRef = useRef(null);
  const { canManagePlayers, canRecordResults } = useKotcRole();

  const rawState = tournament.kotc_state ? JSON.parse(tournament.kotc_state) : null;
  const state = rawState ? { ...rawState, pairingHistory: rawState.pairingHistory || [] } : null;
  const currentRoundNum = tournament.kotc_current_round || 1;
  const maxRounds = tournament.kotc_num_rounds || 9;
  const scoreFormat = tournament.kotc_score_format || 'first_11';

  if (!state) return (
    <div className="glass rounded-xl p-8 text-center text-muted-foreground text-sm">
      No session data found.
    </div>
  );

  const currentRound = state.rounds?.[currentRoundNum - 1];
  if (!currentRound) {
    return <KotcRoundRecovery
      state={state}
      currentRoundNum={currentRoundNum}
      tournament={tournament}
      queryClient={queryClient}
    />;
  }

  const playerMap = Object.fromEntries([...(players || []), ...(allPlayers || [])].map(p => [p.id, p.full_name || p.id]));
  const numCourts = currentRound.courts.length;
  const activePlayerIds = (state.players || []).filter(p => !(state.inactivePlayerIds || []).includes(p.id)).map(p => p.id);
  const savedResults = state.results?.[currentRoundNum] || {};
  // Build effective results: saved + pending, minus cleared
  const roundResults = Object.fromEntries(
    Object.entries({ ...savedResults, ...pendingResults })
      .filter(([k]) => !clearedCourts.has(Number(k)))
  );
  const allCourtsRecorded = currentRound.courts.every(c => roundResults[c.courtNumber]);
  const isLastRound = currentRoundNum >= maxRounds;
  const isCompleted = tournament.status === 'Completed';
  const canRefreshPairings = currentRoundNum === 1 && Object.keys(savedResults).length === 0 && Object.keys(pendingResults).length === 0;

  const handleRefreshPairings = async () => {
    setRefreshing(true);
    const enginePlayers = players.map(p => ({ id: p.id, name: p.full_name, rating: p.skill_rating || 3.0 }));
    const freshState = createKotcState({ players: enginePlayers, numCourts: currentRound.courts.length });
    const newRound1 = generateRound1(freshState, true);
    const newState = { ...state, rounds: [newRound1], pairingHistory: [] };
    await base44.entities.Tournament.update(tournament.id, {
      kotc_state: JSON.stringify(newState),
    });
    toast.success('Round 1 pairings refreshed!');
    setRefreshing(false);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
  };

  const handleResult = (courtNumber, winner) => {
    setPendingResults(prev => ({ ...prev, [courtNumber]: winner }));
    setClearedCourts(prev => { const s = new Set(prev); s.delete(courtNumber); return s; });
  };

  const handleClearResult = (courtNumber) => {
    setPendingResults(prev => {
      const next = { ...prev };
      delete next[courtNumber];
      return next;
    });
    setClearedCourts(prev => new Set([...prev, courtNumber]));
  };

  const persistLiveState = async (nextState, nextPlayerIds, message) => {
    undoStateRef.current = { state, playerIds: tournament.player_ids || [] };
    setCanUndoLiveChange(true);
    await base44.entities.Tournament.update(tournament.id, {
      kotc_state: JSON.stringify({ ...nextState, pairingHistory: (nextState.pairingHistory || []).slice(-50) }),
      player_ids: nextPlayerIds,
    });
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    queryClient.invalidateQueries({ queryKey: ['players'] });
  };

  const replaceIdFromCurrentRound = (rounds, oldId, newId) => rounds.map(round => (
    round.roundNumber < currentRoundNum ? round : {
      ...round,
      courts: round.courts.map(court => ({
        ...court,
        teamA: court.teamA.map(id => id === oldId ? newId : id),
        teamB: court.teamB.map(id => id === oldId ? newId : id),
      })),
      bench: (round.bench || []).map(id => id === oldId ? newId : id),
    }
  ));

  const handleLiveReplace = async (oldId, newId) => {
    const newPlayer = allPlayers.find(p => p.id === newId);
    const nextState = {
      ...state,
      players: (state.players || []).map(p => p.id === oldId ? { id: newId, name: newPlayer?.full_name || newId, rating: newPlayer?.skill_rating || 3.0 } : p),
      rounds: replaceIdFromCurrentRound(state.rounds || [], oldId, newId),
      playerOrder: (state.playerOrder || []).map(id => id === oldId ? newId : id),
      inactivePlayerIds: (state.inactivePlayerIds || []).filter(id => id !== newId),
    };
    const nextPlayerIds = (tournament.player_ids || []).map(id => id === oldId ? newId : id);
    await persistLiveState(nextState, nextPlayerIds, 'Player replaced without redrawing courts');
  };

  const handleLiveRemove = async (playerId) => {
    const benchReplacement = currentRound.bench?.find(id => id !== playerId);
    const nextRounds = (state.rounds || []).map(round => {
      if (round.roundNumber < currentRoundNum) return round;
      return {
        ...round,
        courts: round.courts.map(court => ({
          ...court,
          teamA: court.teamA.map(id => id === playerId ? benchReplacement : id).filter(Boolean),
          teamB: court.teamB.map(id => id === playerId ? benchReplacement : id).filter(Boolean),
        })),
        bench: (round.bench || []).filter(id => id !== playerId && id !== benchReplacement),
      };
    });
    const nextState = {
      ...state,
      inactivePlayerIds: [...new Set([...(state.inactivePlayerIds || []), playerId])],
      rounds: nextRounds,
    };
    await persistLiveState(nextState, tournament.player_ids || [], 'Player removed without redrawing history');
  };

  const handleAddLatePlayer = async (playerId) => {
    const player = allPlayers.find(p => p.id === playerId);
    const nextRounds = (state.rounds || []).map(round => round.roundNumber === currentRoundNum
      ? { ...round, bench: [...new Set([...(round.bench || []), playerId])] }
      : round
    );
    const nextState = {
      ...state,
      players: [...(state.players || []), { id: playerId, name: player?.full_name || playerId, rating: player?.skill_rating || 3.0 }],
      rounds: nextRounds,
      sitOutCounts: { ...(state.sitOutCounts || {}), [playerId]: Math.min(...Object.values(state.sitOutCounts || { base: 0 })) },
      playerOrder: [...(state.playerOrder || []), playerId],
    };
    await persistLiveState(nextState, [...new Set([...(tournament.player_ids || []), playerId])], 'Late player added to the bench');
  };

  const handleUndoLiveChange = async () => {
    if (!undoStateRef.current) return;
    await base44.entities.Tournament.update(tournament.id, {
      kotc_state: JSON.stringify(undoStateRef.current.state),
      player_ids: undoStateRef.current.playerIds,
    });
    undoStateRef.current = null;
    setCanUndoLiveChange(false);
    toast.success('Last live change undone');
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    queryClient.invalidateQueries({ queryKey: ['players'] });
  };

  // Called when organiser presses "Next Round" — compute rotation and show summary
  const handleCompleteRound = () => {
    if (!allCourtsRecorded) { toast.error('Enter results for all courts first.'); return; }

    const mergedResults = { ...state.results, [currentRoundNum]: roundResults };
    const stateWithResults = { ...state, results: mergedResults };

    if (isLastRound) {
      // No next round — go straight to saving
      handleSave(stateWithResults, null, null, true);
      return;
    }

    const { nextRound, updatedState, movements } = generateNextRound(
      stateWithResults,
      currentRoundNum,
      roundResults
    );

    setRotationSummary({
      movements,
      nextRound,
      nextState: { ...updatedState, rounds: [...updatedState.rounds, nextRound] },
      isLast: false,
    });
  };

  // Called when organiser confirms rotation summary → persist and advance
  const handleConfirmRotation = async () => {
    if (!rotationSummary) return;
    await handleSave(
      rotationSummary.nextState,
      rotationSummary.nextRound,
      rotationSummary.nextState.pairingHistory,
      false
    );
    setRotationSummary(null);
    setPendingResults({});
    setClearedCourts(new Set());
  };

  const handleSave = async (finalState, nextRound, _history, isLast) => {
    setSubmitting(true);
    // Trim pairingHistory to last 50 entries to prevent payload bloat
    const serialisable = { ...finalState, pairingHistory: (finalState.pairingHistory || []).slice(-50) };

    await base44.entities.Tournament.update(tournament.id, {
      kotc_state: JSON.stringify(serialisable),
      kotc_current_round: isLast ? currentRoundNum : currentRoundNum + 1,
      status: isLast ? 'Completed' : 'In Progress',
    });

    toast.success(isLast ? 'Session complete! 🏆' : confirmEndEarly ? 'Session ended early! 🏆' : `Round ${currentRoundNum + 1} ready!`);
    setSubmitting(false);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
  };

  const leaderboard = computeKotcLeaderboard({
    ...state,
    results: { ...state.results, [currentRoundNum]: roundResults },
  });

  // ── Show rotation summary between rounds ──
  if (rotationSummary) {
    return (
      <KotcRotationSummary
        movements={rotationSummary.movements}
        playerMap={playerMap}
        nextRound={rotationSummary.nextRound}
        onContinue={handleConfirmRotation}
      />
    );
  }

  // ── Normal round view ──
  return (
    <div className="space-y-4">
      {/* Round header */}
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Round {currentRoundNum}
              <span className="text-muted-foreground font-normal"> of {maxRounds}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {numCourts} courts · {currentRound.bench.length} on bench
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
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border" onClick={handleRefreshPairings} disabled={refreshing}>
              <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
              {refreshing ? 'Refreshing…' : 'Refresh Pairings'}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => setShowLeaderboard(s => !s)}>
            <Trophy className="w-3.5 h-3.5" /> {showLeaderboard ? 'Hide' : 'Standings'}
          </Button>
        </div>
      </div>

      {canManagePlayers && (
        <KotcLivePlayerControls
          players={players}
          allPlayers={allPlayers}
          activePlayerIds={activePlayerIds}
          canUndo={canUndoLiveChange}
          onReplace={handleLiveReplace}
          onRemove={handleLiveRemove}
          onAddLate={handleAddLatePlayer}
          onUndo={handleUndoLiveChange}
        />
      )}

      {/* Timer */}
      <RoundTimer disabled={!canRecordResults || isCompleted} />

      {/* Leaderboard */}
      {showLeaderboard && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass rounded-xl p-4 overflow-hidden"
        >
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Current Standings
          </h4>
          <div className="space-y-1.5">
            {leaderboard.slice(0, 10).map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 text-xs">
                <span className={cn('w-5 text-center font-bold', i === 0 ? 'text-yellow-400' : 'text-muted-foreground')}>
                  {i + 1}
                </span>
                <span className="flex-1 text-foreground truncate">{p.name}</span>
                <span className="text-primary font-semibold">{p.wins}W</span>
                <span className="text-muted-foreground">{p.losses}L</span>
                {p.sitOuts > 0 && (
                  <span className="text-yellow-500 text-[10px]">{p.sitOuts} sit</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Courts */}
      <div className="grid sm:grid-cols-2 gap-3">
        {currentRound.courts.map(court => (
          <CourtCard
            key={court.courtNumber}
            court={court}
            playerMap={playerMap}
            onResult={handleResult}
            onClearResult={handleClearResult}
            disabled={isCompleted || !canRecordResults}
            result={roundResults[court.courtNumber]}
          />
        ))}
      </div>

      {/* Bench */}
      {currentRound.bench.length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bench this round
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentRound.bench.map(id => (
              <Badge key={id} variant="outline" className="text-xs text-muted-foreground">
                {playerMap[id] || id}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Action button */}
      {!isCompleted && (
        <div className="space-y-2">
          <Button
            className={cn(
              'w-full gap-2',
              allCourtsRecorded
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'opacity-50'
            )}
            onClick={handleCompleteRound}
            disabled={!allCourtsRecorded || submitting || !canRecordResults}
          >
            {submitting && !confirmEndEarly
              ? <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Processing…</>
              : isLastRound
                ? <><Trophy className="w-4 h-4" /> Finish Session</>
                : <><ChevronRight className="w-4 h-4" /> Complete Round & See Rotations</>
            }
          </Button>

          {!isLastRound && !confirmEndEarly && (
            <Button
              variant="outline"
              className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 text-xs"
              onClick={() => setConfirmEndEarly(true)}
              disabled={submitting}
            >
              <StopCircle className="w-3.5 h-3.5" /> End Session Early (Time's Up)
            </Button>
          )}

          {confirmEndEarly && (
            <div className="glass rounded-xl p-4 border border-destructive/30 space-y-3">
              <p className="text-sm font-semibold text-foreground">End session after Round {currentRoundNum}?</p>
              <p className="text-xs text-muted-foreground">Results so far will be saved and final standings calculated from completed rounds.</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmEndEarly(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1"
                  disabled={submitting}
                  onClick={async () => {
                    const mergedResults = { ...state.results, [currentRoundNum]: roundResults };
                    const finalState = { ...state, results: mergedResults };
                    await handleSave(finalState, null, null, true);
                    setConfirmEndEarly(false);
                  }}
                >
                  {submitting
                    ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                    : <><StopCircle className="w-3.5 h-3.5" /> End Now</>
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isCompleted && (
        <PodiumResults leaderboard={leaderboard} tournamentName={tournament.name} />
      )}
    </div>
  );
}