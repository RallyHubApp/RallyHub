import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy, Zap, Wifi, BarChart2, ChevronRight, Check, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { computeLeaderboard } from '@/lib/tournivalEngine';

const STAGE_ORDER = ['QF', 'SF', 'Final', '3rd'];
const STAGE_LABELS = { QF: 'Quarter-Finals', SF: 'Semi-Finals', Final: 'Final', '3rd': '3rd/4th Playoff' };
const medals = ['🥇', '🥈', '🥉'];

// ── Score entry for a single court ────────────────────────────────────────────
function ScoreEntry({ court, playerMap, result, onSave, disabled }) {
  const [scoreA, setScoreA] = useState(result?.scoreA ?? '');
  const [scoreB, setScoreB] = useState(result?.scoreB ?? '');
  const [editing, setEditing] = useState(!result);

  // Reset if result prop changes (e.g. from remote poll)
  useEffect(() => {
    if (result && !editing) {
      setScoreA(result.scoreA ?? '');
      setScoreB(result.scoreB ?? '');
    }
  }, [result]);

  const teamANames = court.teamA.map(id => playerMap[id] || id).join(' & ');
  const teamBNames = court.teamB.map(id => playerMap[id] || id).join(' & ');
  const canSave = scoreA !== '' && scoreB !== '' && Number(scoreA) !== Number(scoreB);

  const handleSave = () => {
    const sA = Number(scoreA);
    const sB = Number(scoreB);
    if (sA === sB) return;
    onSave(court.courtNumber, { winner: sA > sB ? 'A' : 'B', scoreA: sA, scoreB: sB });
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass rounded-xl p-4 space-y-3', result && 'border border-primary/20')}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">Court {court.courtNumber}</span>
        {result && !editing && !disabled && (
          <button onClick={() => setEditing(true)} className="text-[10px] text-muted-foreground hover:text-primary underline">Edit</button>
        )}
        {result && !editing && <Check className="w-3.5 h-3.5 text-primary" />}
      </div>

      <div className={cn('rounded-lg p-3', result?.winner === 'A' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary')}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Team A</p>
        <p className="text-xs font-semibold text-foreground">{teamANames}</p>
      </div>
      <div className="text-center text-[10px] text-muted-foreground">vs</div>
      <div className={cn('rounded-lg p-3', result?.winner === 'B' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary')}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Team B</p>
        <p className="text-xs font-semibold text-foreground">{teamBNames}</p>
      </div>

      {editing && !disabled && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] text-muted-foreground font-medium">Enter scores:</p>
          <div className="flex items-center gap-2">
            <Input type="number" min={0} max={99} value={scoreA} onChange={e => setScoreA(e.target.value)}
              placeholder="A" className="h-8 text-sm text-center bg-secondary border-border" />
            <span className="text-xs text-muted-foreground font-bold shrink-0">—</span>
            <Input type="number" min={0} max={99} value={scoreB} onChange={e => setScoreB(e.target.value)}
              placeholder="B" className="h-8 text-sm text-center bg-secondary border-border" />
          </div>
          {scoreA !== '' && scoreB !== '' && Number(scoreA) === Number(scoreB) && (
            <p className="text-[10px] text-destructive">Scores cannot be equal — there must be a winner.</p>
          )}
          <Button size="sm" className="w-full h-8 text-xs bg-primary text-primary-foreground" onClick={handleSave} disabled={!canSave}>
            <Check className="w-3 h-3 mr-1" /> Save Result
          </Button>
        </div>
      )}

      {result && !editing && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <span className={cn('text-lg font-bold', result.winner === 'A' ? 'text-primary' : 'text-muted-foreground')}>{result.scoreA}</span>
          <span className="text-xs text-muted-foreground">—</span>
          <span className={cn('text-lg font-bold', result.winner === 'B' ? 'text-primary' : 'text-muted-foreground')}>{result.scoreB}</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Knockout match card ────────────────────────────────────────────────────────
function KnockoutMatchCard({ match, onSave, disabled }) {
  const [scoreA, setScoreA] = useState(match.result?.scoreA ?? '');
  const [scoreB, setScoreB] = useState(match.result?.scoreB ?? '');
  const [editing, setEditing] = useState(!match.result);

  const pair1Name = match.pair1 ? `${match.pair1.player1.name} & ${match.pair1.player2.name}` : 'TBD';
  const pair2Name = match.pair2 ? `${match.pair2.player1.name} & ${match.pair2.player2.name}` : 'TBD';
  const canSave = scoreA !== '' && scoreB !== '' && Number(scoreA) !== Number(scoreB);

  const handleSave = () => {
    const sA = Number(scoreA), sB = Number(scoreB);
    if (sA === sB) return;
    onSave(match.id, { winner: sA > sB ? 'A' : 'B', scoreA: sA, scoreB: sB });
    setEditing(false);
  };

  const result = match.result;
  const winner = result ? (result.winner === 'A' ? pair1Name : pair2Name) : null;

  return (
    <div className={cn('glass rounded-xl p-4 space-y-3', result && 'border border-primary/20')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-bold text-foreground">{match.label || match.id}</span>
        </div>
        {result && !editing && !disabled && (
          <button onClick={() => setEditing(true)} className="text-[10px] text-muted-foreground hover:text-primary underline">Edit</button>
        )}
      </div>

      <div className={cn('rounded-lg p-3', result?.winner === 'A' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary')}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Pair 1</p>
        <p className="text-xs font-semibold text-foreground">{pair1Name}</p>
      </div>
      <div className="text-center text-[10px] text-muted-foreground">vs</div>
      <div className={cn('rounded-lg p-3', result?.winner === 'B' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary')}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Pair 2</p>
        <p className="text-xs font-semibold text-foreground">{pair2Name}</p>
      </div>

      {editing && !disabled && match.pair1 && match.pair2 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Input type="number" min={0} max={99} value={scoreA} onChange={e => setScoreA(e.target.value)}
              placeholder="P1" className="h-8 text-sm text-center bg-secondary border-border" />
            <span className="text-xs text-muted-foreground font-bold shrink-0">—</span>
            <Input type="number" min={0} max={99} value={scoreB} onChange={e => setScoreB(e.target.value)}
              placeholder="P2" className="h-8 text-sm text-center bg-secondary border-border" />
          </div>
          <Button size="sm" className="w-full h-8 text-xs bg-primary text-primary-foreground" onClick={handleSave} disabled={!canSave}>
            <Check className="w-3 h-3 mr-1" /> Save Result
          </Button>
        </div>
      )}

      {result && !editing && (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center justify-center gap-3 flex-1">
            <span className={cn('text-lg font-bold', result.winner === 'A' ? 'text-primary' : 'text-muted-foreground')}>{result.scoreA}</span>
            <span className="text-xs text-muted-foreground">—</span>
            <span className={cn('text-lg font-bold', result.winner === 'B' ? 'text-primary' : 'text-muted-foreground')}>{result.scoreB}</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary truncate max-w-[120px]">{winner}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: 'scores', label: 'Scores', icon: ChevronRight },
  { id: 'standings', label: 'Standings', icon: BarChart2 },
  { id: 'knockout', label: 'Cup', icon: Trophy },
];

// ── Main public Tournival view ─────────────────────────────────────────────────
export default function PublicTournivalView({ tournament, players, liveIndicator, callPublicRegister, onRefresh }) {
  const state = tournament.kotc_state ? JSON.parse(tournament.kotc_state) : null;
  const [activeTab, setActiveTab] = useState(state?.knockoutState ? 'knockout' : state ? 'scores' : 'scores');
  const [submitting, setSubmitting] = useState(false);

  const playerMap = Object.fromEntries(players.map(p => [p.id, p.full_name || p.id]));
  const currentRound = state?.currentRound || 1;
  const totalRounds = state?.rounds?.length || 1;
  const round = state?.rounds?.[currentRound - 1];
  const roundResults = state?.results?.[currentRound] || {};
  const groupStageComplete = state && state.currentRound > (state.rounds?.length || 0);
  const hasKnockout = !!state?.knockoutState;
  const allRecorded = round?.courts?.every(c => roundResults[c.courtNumber]);
  const isLastGroupRound = currentRound >= totalRounds;

  const leaderboard = state
    ? computeLeaderboard(
        state.playerIds || players.map(p => p.id),
        state.rounds || [],
        state.results || {},
        playerMap
      )
    : [];

  // Save result for a group-stage court
  const handleSaveResult = async (courtNumber, result) => {
    const newResults = {
      ...state.results,
      [currentRound]: { ...(state.results[currentRound] || {}), [courtNumber]: result },
    };
    const newState = { ...state, results: newResults };
    await callPublicRegister({
      tournamentId: tournament.id,
      action: 'update_kotc',
      kotc_state: JSON.stringify(newState),
      kotc_current_round: state.kotc_current_round || currentRound,
      status: 'In Progress',
    });
    await onRefresh();
  };

  const handleCompleteRound = async () => {
    if (!allRecorded) return;
    setSubmitting(true);
    const nextRound = currentRound + 1;
    const isGroupComplete = nextRound > totalRounds;
    const newState = {
      ...state,
      currentRound: nextRound,
      status: isGroupComplete ? 'Group Complete' : 'In Progress',
    };
    await callPublicRegister({
      tournamentId: tournament.id,
      action: 'update_kotc',
      kotc_state: JSON.stringify(newState),
      kotc_current_round: nextRound,
      status: isGroupComplete ? 'Group Complete' : 'In Progress',
    });
    await onRefresh();
    setSubmitting(false);
    if (isGroupComplete) setActiveTab('standings');
  };

  // Save knockout result
  const handleKnockoutResult = async (matchId, result) => {
    const bracket = state.knockoutState.bracket.map(m => m.id === matchId ? { ...m, result } : m);
    const currentStageMatches = bracket.filter(m => m.stage === state.knockoutState.currentStage);
    const stageComplete = currentStageMatches.every(m => m.result);
    let newKnockoutState = { ...state.knockoutState, bracket };

    if (stageComplete) {
      const { createKnockoutBracket } = await import('@/lib/tournivalEngine');
      const nextStageMap = { QF: 'SF', SF: 'Final' };
      const nextStage = nextStageMap[state.knockoutState.currentStage];
      if (nextStage) {
        const winners = currentStageMatches.map(m => {
          const bm = bracket.find(b => b.id === m.id);
          return bm.result.winner === 'A' ? bm.pair1 : bm.pair2;
        });
        const newBracket = createKnockoutBracket(winners);
        const newMatches = newBracket.map((m, i) => ({
          id: `${nextStage}_${i}`,
          stage: nextStage,
          label: `${nextStage === 'SF' ? 'Semi' : 'Final'} ${i + 1}`,
          pair1: m.pair1, pair2: m.pair2, result: null,
        }));
        if (nextStage === 'Final') {
          const sfMatches = bracket.filter(m => m.stage === 'SF');
          if (sfMatches.length === 2) {
            const loser1 = sfMatches[0].result.winner === 'A' ? sfMatches[0].pair2 : sfMatches[0].pair1;
            const loser2 = sfMatches[1].result.winner === 'A' ? sfMatches[1].pair2 : sfMatches[1].pair1;
            newMatches.push({ id: '3rd_0', stage: '3rd', label: '3rd/4th Playoff', pair1: loser1, pair2: loser2, result: null });
          }
        }
        newKnockoutState = { ...newKnockoutState, bracket: [...bracket, ...newMatches], currentStage: nextStage };
      }
    }
    const newState = { ...state, knockoutState: newKnockoutState };
    await callPublicRegister({
      tournamentId: tournament.id,
      action: 'update_kotc',
      kotc_state: JSON.stringify(newState),
      kotc_current_round: state.kotc_current_round || currentRound,
      status: tournament.status,
    });
    await onRefresh();
  };

  if (!state) {
    return (
      <div className="text-center py-12 space-y-2">
        <Zap className="w-10 h-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">Tournament hasn't started yet.</p>
      </div>
    );
  }

  const visibleTabs = TABS.filter(t => {
    if (t.id === 'knockout') return hasKnockout;
    return true;
  });

  // Find champion
  const finalMatch = state.knockoutState?.bracket?.find(m => m.stage === 'Final' && m.result);
  const champion = finalMatch ? (finalMatch.result.winner === 'A' ? finalMatch.pair1 : finalMatch.pair2) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground truncate max-w-[180px]">{tournament.name}</p>
            <p className="text-xs text-muted-foreground">
              {hasKnockout ? 'Cup Stage' : groupStageComplete ? 'Group Stage Complete' : `Round ${currentRound} of ${totalRounds}`}
            </p>
          </div>
        </div>
        <div className={cn('flex items-center gap-1 text-[10px] transition-colors', liveIndicator ? 'text-primary' : 'text-muted-foreground')}>
          <Wifi className="w-3 h-3" /> Live
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 pb-1">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0',
              activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scores tab */}
      {activeTab === 'scores' && (
        <div className="space-y-4">
          {groupStageComplete ? (
            <div className="glass rounded-xl p-6 text-center space-y-2">
              <Trophy className="w-8 h-8 text-primary mx-auto" />
              <p className="text-sm font-bold text-foreground">Group Stage Complete</p>
              <p className="text-xs text-muted-foreground">Check Standings for final positions.</p>
            </div>
          ) : round ? (
            <>
              {/* Round progress dots */}
              <div className="glass rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Round {currentRound} <span className="text-muted-foreground font-normal">of {totalRounds}</span></span>
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: totalRounds }, (_, i) => (
                    <div key={i} className={cn('w-2 h-2 rounded-full transition-colors',
                      i + 1 < currentRound ? 'bg-primary' : i + 1 === currentRound ? 'bg-primary animate-pulse' : 'bg-secondary'
                    )} />
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {round.courts.map(court => (
                  <ScoreEntry
                    key={court.courtNumber}
                    court={court}
                    playerMap={playerMap}
                    result={roundResults[court.courtNumber]}
                    onSave={handleSaveResult}
                    disabled={false}
                  />
                ))}
              </div>

              {round.bench?.length > 0 && (
                <div className="glass rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Bench this round</p>
                  <div className="flex flex-wrap gap-2">
                    {round.bench.map(id => (
                      <Badge key={id} variant="outline" className="text-xs">{playerMap[id] || id}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className={cn('w-full gap-2 h-12', allRecorded ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'opacity-50')}
                onClick={handleCompleteRound}
                disabled={!allRecorded || submitting}
              >
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Saving…</>
                  : isLastGroupRound
                    ? <><Trophy className="w-4 h-4" /> Complete Group Stage</>
                    : <><ChevronRight className="w-4 h-4" /> Next Round</>
                }
              </Button>
            </>
          ) : null}
        </div>
      )}

      {/* Standings tab */}
      {activeTab === 'standings' && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem] gap-1 px-4 py-2 border-b border-border text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>#</span><span>Player</span>
            <span className="text-center">P</span>
            <span className="text-center">W</span>
            <span className="text-center">L</span>
            <span className="text-center">PF</span>
            <span className="text-right">Pts</span>
          </div>
          <div className="divide-y divide-border/50">
            {leaderboard.map((p, i) => (
              <div key={p.id} className={cn('grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem] gap-1 px-4 py-3 items-center', i === 0 && 'bg-primary/5')}>
                <span className={cn('text-xs font-bold', i < 3 ? 'text-lg leading-none' : 'text-muted-foreground')}>
                  {i < 3 ? medals[i] : i + 1}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {(p.name || '?')[0]}
                  </div>
                  <span className="text-xs font-medium text-foreground truncate">{p.name}</span>
                </div>
                <span className="text-xs text-muted-foreground text-center">{p.played}</span>
                <span className="text-xs text-primary font-semibold text-center">{p.wins}</span>
                <span className="text-xs text-muted-foreground text-center">{p.losses}</span>
                <span className="text-xs text-foreground text-center">{p.pf}</span>
                <div className="flex justify-end">
                  <Badge className={cn('text-[10px] px-1.5 py-0', i === 0 ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground')}>
                    {p.points}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Knockout tab */}
      {activeTab === 'knockout' && state.knockoutState && (
        <div className="space-y-6">
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Cup Matches</p>
              <p className="text-xs text-muted-foreground">{state.knockoutState.pairs.length} pairs · {state.knockoutState.currentStage}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seeded Pairs</p>
            <div className="space-y-2">
              {state.knockoutState.pairs.map((pair, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <Badge variant="outline" className="text-[10px] shrink-0">S{pair.seed}</Badge>
                  <span className="text-foreground flex-1 truncate">{pair.player1.name} & {pair.player2.name}</span>
                </div>
              ))}
            </div>
          </div>

          {(() => {
            const stageMatches = {};
            for (const m of state.knockoutState.bracket) {
              if (!stageMatches[m.stage]) stageMatches[m.stage] = [];
              stageMatches[m.stage].push(m);
            }
            return STAGE_ORDER.map(stage => {
              const matches = stageMatches[stage];
              if (!matches) return null;
              return (
                <motion.div key={stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-sm font-bold text-foreground mb-3">{STAGE_LABELS[stage]}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {matches.map(match => (
                      <KnockoutMatchCard
                        key={match.id}
                        match={match}
                        onSave={handleKnockoutResult}
                        disabled={false}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            });
          })()}

          {champion && (
            <div className="glass rounded-xl p-6 text-center glow-green">
              <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-lg font-bold text-foreground">🏆 Champions!</p>
              <p className="text-primary font-semibold mt-1">{champion.player1.name} & {champion.player2.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}