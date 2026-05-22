import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Zap, Users, UserPlus, X, List, BarChart2, Trophy, Swords, ClipboardList, Link2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  generateGroupFixtures,
  computeLeaderboard,
  createKnockoutPairs,
  createKnockoutBracket,
} from '@/lib/tournivalEngine';
import TournivalSetup from './TournivalSetup';
import TournivalFixtures from './TournivalFixtures';
import TournivalScoring from './TournivalScoring';
import TournivalLeaderboard from './TournivalLeaderboard';
import TournivalKnockout from './TournivalKnockout';

const TABS = [
  { id: 'setup', label: 'Setup', icon: Zap },
  { id: 'fixtures', label: 'Fixtures', icon: List },
  { id: 'scores', label: 'Scores', icon: ClipboardList },
  { id: 'standings', label: 'Standings', icon: BarChart2 },
  { id: 'knockout', label: 'Cup', icon: Trophy },
];

// ── Player Entry Panel ────────────────────────────────────────────────────────
function PlayerPanel({ players, tournament, isAdmin, queryClient, onAddPlayer, onRemovePlayer, addingPlayer }) {
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAdding(true);
    await onAddPlayer(trimmed);
    setName('');
    setAdding(false);
  };

  const [linkCopied, setLinkCopied] = useState(false);
  const handleCopyLink = () => {
    const url = `${window.location.origin}/register/${tournament.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Players ({players.length})</span>
          </div>
          <Button variant="outline" size="sm" className={cn('text-xs gap-1', linkCopied && 'text-primary border-primary/40')} onClick={handleCopyLink}>
            {linkCopied ? <><Check className="w-3 h-3" /> Copied!</> : <><Link2 className="w-3 h-3" /> Reg Link</>}
          </Button>
        </div>

        {isAdmin && (
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Player name…"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 h-8 text-xs bg-secondary border-border"
            />
            <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground px-3 gap-1 shrink-0"
              disabled={!name.trim() || adding} onClick={handleAdd}>
              {adding
                ? <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                : <><UserPlus className="w-3 h-3" /> Add</>}
            </Button>
          </div>
        )}

        {players.length > 0 ? (
          <div className="space-y-1 max-h-72 overflow-auto">
            {players.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <span className="text-xs text-muted-foreground w-5 text-center shrink-0">{i + 1}</span>
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                  {(p.full_name || '?')[0]}
                </div>
                <span className="text-xs text-foreground flex-1 truncate">{p.full_name}</span>
                {isAdmin && (
                  <Button size="sm" variant="ghost"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => onRemovePlayer(p.id)}>
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">No players yet</p>
        )}
      </div>
    </div>
  );
}

// ── Main Orchestrator ─────────────────────────────────────────────────────────
export default function TournivalView({ tournament, players, allPlayers, queryClient, isAdmin }) {
  const [activeTab, setActiveTab] = useState('setup');

  // Parse state from tournament
  const state = useMemo(() => {
    if (!tournament.kotc_state) return null;
    try { return JSON.parse(tournament.kotc_state); } catch { return null; }
  }, [tournament.kotc_state]);

  const isStarted = !!state;
  const groupStageComplete = state && state.currentRound > (state.rounds?.length || 0);
  const hasKnockout = state?.knockoutState;

  // Decide default tab
  React.useEffect(() => {
    if (!state) { setActiveTab('setup'); return; }
    if (hasKnockout) { setActiveTab('knockout'); return; }
    if (groupStageComplete) { setActiveTab('standings'); return; }
    setActiveTab('scores');
  }, [!!state, groupStageComplete, hasKnockout]);

  const playerMap = Object.fromEntries(players.map(p => [p.id, p.full_name || p.id]));

  const saveState = async (newState) => {
    await base44.entities.Tournament.update(tournament.id, {
      kotc_state: JSON.stringify(newState),
      kotc_current_round: newState.currentRound,
      status: newState.status || 'In Progress',
    });
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStart = async ({ numCourts, numRounds, matchFormat }) => {
    const playerIds = players.map(p => p.id);
    const rounds = generateGroupFixtures(playerIds, numCourts, numRounds);
    const newState = {
      playerIds,
      numCourts,
      numRounds,
      matchFormat,
      rounds,
      results: {},
      currentRound: 1,
      status: 'In Progress',
    };
    await saveState(newState);
    toast.success('Fixtures generated! 🎾');
    setActiveTab('fixtures');
  };

  const handleReshuffle = async () => {
    if (!state) return;
    const rounds = generateGroupFixtures(state.playerIds, state.numCourts, state.numRounds);
    await saveState({ ...state, rounds, results: {}, currentRound: 1 });
    toast.success('Fixtures reshuffled!');
  };

  const handleSaveResult = async (courtNumber, result) => {
    const newResults = {
      ...state.results,
      [state.currentRound]: {
        ...(state.results[state.currentRound] || {}),
        [courtNumber]: result,
      },
    };
    await saveState({ ...state, results: newResults });
  };

  const handleCompleteRound = async () => {
    const nextRound = state.currentRound + 1;
    const isGroupComplete = nextRound > state.rounds.length;
    await saveState({
      ...state,
      currentRound: nextRound,
      status: isGroupComplete ? 'Group Complete' : 'In Progress',
    });
    if (isGroupComplete) {
      toast.success('Group stage complete! Create cup matches.');
      setActiveTab('standings');
    } else {
      toast.success(`Round ${nextRound} starting!`);
    }
  };

  const handleCreateKnockout = async () => {
    const leaderboard = computeLeaderboard(state.playerIds, state.rounds, state.results, playerMap);
    const pairs = createKnockoutPairs(leaderboard);
    const bracketMatchups = createKnockoutBracket(pairs);

    const bracket = bracketMatchups.map((m, i) => ({
      id: `${m.match}_${i}`,
      stage: m.match.startsWith('QF') ? 'QF' : m.match.startsWith('SF') ? 'SF' : m.match,
      label: `Match ${i + 1}`,
      pair1: m.pair1,
      pair2: m.pair2,
      result: null,
    }));

    const knockoutState = { pairs, bracket, currentStage: 'QF' };
    await saveState({ ...state, knockoutState });
    toast.success('Cup matches created!');
    setActiveTab('knockout');
  };

  const handleKnockoutResult = async (matchId, result) => {
    const bracket = state.knockoutState.bracket.map(m =>
      m.id === matchId ? { ...m, result } : m
    );
    // Auto-advance: check if stage is complete and generate next stage
    const currentStageMatches = bracket.filter(m => m.stage === state.knockoutState.currentStage);
    const stageComplete = currentStageMatches.every(m => m.result);
    let newKnockoutState = { ...state.knockoutState, bracket };

    if (stageComplete) {
      const nextStage = { QF: 'SF', SF: 'Final' }[state.knockoutState.currentStage];
      if (nextStage) {
        // Generate next stage matches from winners
        const winners = currentStageMatches.map(m => {
          const bracketMatch = bracket.find(b => b.id === m.id);
          return bracketMatch.result.winner === 'A' ? bracketMatch.pair1 : bracketMatch.pair2;
        });
        const newBracket = createKnockoutBracket(winners);
        const newMatches = newBracket.map((m, i) => ({
          id: `${nextStage}_${i}`,
          stage: nextStage,
          label: `${nextStage === 'SF' ? 'Semi' : 'Final'} ${i + 1}`,
          pair1: m.pair1,
          pair2: m.pair2,
          result: null,
        }));

        // 3rd/4th playoff from SF losers
        if (nextStage === 'Final') {
          const sfMatches = bracket.filter(m => m.stage === 'SF');
          if (sfMatches.length === 2) {
            const loser1 = sfMatches[0].result.winner === 'A' ? sfMatches[0].pair2 : sfMatches[0].pair1;
            const loser2 = sfMatches[1].result.winner === 'A' ? sfMatches[1].pair2 : sfMatches[1].pair1;
            newMatches.push({
              id: '3rd_0',
              stage: '3rd',
              label: '3rd/4th Playoff',
              pair1: loser1,
              pair2: loser2,
              result: null,
            });
          }
        }

        newKnockoutState = {
          ...newKnockoutState,
          bracket: [...bracket, ...newMatches],
          currentStage: nextStage,
        };
        toast.success(`${STAGE_LABELS[nextStage] || nextStage} matches ready!`);
      }
    }

    await saveState({ ...state, knockoutState: newKnockoutState });
  };

  const STAGE_LABELS = { QF: 'Semi-Finals', SF: 'Finals', Final: 'Champion' };

  const handleAddPlayer = async (name) => {
    const existing = allPlayers.find(p => p.full_name?.toLowerCase() === name.toLowerCase());
    let player = existing;
    if (!player) {
      player = await base44.entities.Player.create({ full_name: name, status: 'Active' });
    }
    const newIds = [...(tournament.player_ids || []), player.id];
    await base44.entities.Tournament.update(tournament.id, { player_ids: newIds });
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    queryClient.invalidateQueries({ queryKey: ['players'] });
    toast.success(`${name} added!`);
  };

  const handleRemovePlayer = async (playerId) => {
    const newIds = (tournament.player_ids || []).filter(id => id !== playerId);
    await base44.entities.Tournament.update(tournament.id, { player_ids: newIds });
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    toast.success('Player removed');
  };

  const leaderboard = state
    ? computeLeaderboard(state.playerIds || players.map(p => p.id), state.rounds || [], state.results || {}, playerMap)
    : [];

  const visibleTabs = isStarted
    ? TABS
    : TABS.filter(t => t.id === 'setup');

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 pb-1">
        {/* Players always visible */}
        <button
          onClick={() => setActiveTab('players')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0',
            activeTab === 'players' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
        >
          <Users className="w-3.5 h-3.5" /> Players ({players.length})
        </button>
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

      {/* Tab content */}
      {activeTab === 'players' && (
        <PlayerPanel
          players={players}
          tournament={tournament}
          isAdmin={isAdmin}
          queryClient={queryClient}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
        />
      )}

      {activeTab === 'setup' && (
        <TournivalSetup
          players={players}
          tournament={tournament}
          onStart={handleStart}
        />
      )}

      {activeTab === 'fixtures' && state && (
        <TournivalFixtures
          rounds={state.rounds || []}
          playerMap={playerMap}
          onReshuffle={handleReshuffle}
          isAdmin={isAdmin}
        />
      )}

      {activeTab === 'scores' && state && (
        <TournivalScoring
          rounds={state.rounds || []}
          results={state.results || {}}
          playerMap={playerMap}
          currentRound={state.currentRound || 1}
          onSaveResult={handleSaveResult}
          onCompleteRound={handleCompleteRound}
          isAdmin={isAdmin}
        />
      )}

      {activeTab === 'standings' && state && (
        <TournivalLeaderboard
          leaderboard={leaderboard}
          onCreateKnockout={handleCreateKnockout}
          isAdmin={isAdmin}
          groupStageComplete={groupStageComplete}
        />
      )}

      {activeTab === 'knockout' && state?.knockoutState && (
        <TournivalKnockout
          knockoutState={state.knockoutState}
          isAdmin={isAdmin}
          onSaveResult={handleKnockoutResult}
        />
      )}
    </div>
  );
}