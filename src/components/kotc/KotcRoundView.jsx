import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Crown, Users, Clock, ChevronRight, Trophy, RefreshCw } from 'lucide-react';
import { generateNextRound, computeKotcLeaderboard, createKotcState, generateRound1 } from '@/lib/kingOfCourtEngine';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import KotcRotationSummary from './KotcRotationSummary';

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
export default function KotcRoundView({ tournament, players, queryClient }) {
  const [pendingResults, setPendingResults] = useState({});
  // clearedCourts tracks courts whose saved result was explicitly cleared so they can be re-entered
  const [clearedCourts, setClearedCourts] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // Rotation summary state: null | { movements, nextRound, nextState, isLast }
  const [rotationSummary, setRotationSummary] = useState(null);

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

  const currentRound = state.rounds[currentRoundNum - 1];
  if (!currentRound) return (
    <div className="glass rounded-xl p-8 text-center text-muted-foreground text-sm">
      Round data missing.
    </div>
  );

  const playerMap = Object.fromEntries(players.map(p => [p.id, p.full_name || p.id]));
  const numCourts = currentRound.courts.length;
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
    const newRound1 = generateRound1(freshState);
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
    const serialisable = { ...finalState, pairingHistory: finalState.pairingHistory || [] };

    await base44.entities.Tournament.update(tournament.id, {
      kotc_state: JSON.stringify(serialisable),
      kotc_current_round: isLast ? currentRoundNum : currentRoundNum + 1,
      status: isLast ? 'Completed' : 'In Progress',
    });

    toast.success(isLast ? 'Session complete! 🏆' : `Round ${currentRoundNum + 1} ready!`);
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

      {/* Timer */}
      <TimerDisplay scoreFormat={scoreFormat} />

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
            disabled={isCompleted}
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
        <Button
          className={cn(
            'w-full gap-2',
            allCourtsRecorded
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'opacity-50'
          )}
          onClick={handleCompleteRound}
          disabled={!allCourtsRecorded || submitting}
        >
          {submitting
            ? <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Processing…</>
            : isLastRound
              ? <><Trophy className="w-4 h-4" /> Finish Session</>
              : <><ChevronRight className="w-4 h-4" /> Complete Round & See Rotations</>
          }
        </Button>
      )}

      {isCompleted && (
        <div className="glass rounded-xl p-6 text-center space-y-2 glow-green">
          <Trophy className="w-10 h-10 text-primary mx-auto" />
          <p className="text-lg font-bold text-foreground">Session Complete!</p>
          <p className="text-sm text-muted-foreground">
            🏆 {leaderboard[0]?.name} — {leaderboard[0]?.wins} wins
          </p>
        </div>
      )}
    </div>
  );
}