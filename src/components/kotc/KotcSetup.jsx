import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Users, Crown, Play, Clock, Hash } from 'lucide-react';
import { createKotcState, generateRound1, autoAllocateCourts } from '@/lib/kingOfCourtEngine';
import { cn } from '@/lib/utils';
import RankingList from '@/components/shared/RankingList';
import RoundOneBenchSelector from './RoundOneBenchSelector';

const SCORE_FORMATS = [
  { value: 'timed_8', label: '8-min rounds', icon: Clock, desc: '8 min play + 2 min rest' },
  { value: 'first_7', label: 'First to 7', icon: Hash, desc: 'Win by 1' },
  { value: 'first_11', label: 'First to 11', icon: Hash, desc: 'Win by 1' },
  { value: 'first_15', label: 'First to 11', icon: Hash, desc: 'Win by 2' },
];

export default function KotcSetup({ tournament, players, onStarted, queryClient }) {
  const defaultCourts = autoAllocateCourts(players.length);
  const storedOrder = tournament.kotc_player_order || players.map(p => p.id);
  const [numCourts, setNumCourts] = useState(String(tournament.kotc_num_courts || defaultCourts));
  const [numRounds, setNumRounds] = useState(tournament.kotc_num_rounds || 9);
  const [scoreFormat, setScoreFormat] = useState(tournament.kotc_score_format || 'first_11');
  const [playerOrder, setPlayerOrder] = useState(storedOrder);
  const [round1BenchIds, setRound1BenchIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const numCourtsNum = Math.max(1, Math.min(4, parseInt(numCourts) || defaultCourts));
  const activeSpots = numCourtsNum * 4;
  const numBench = Math.max(0, players.length - activeSpots);
  const isValid = players.length >= 4;
  const orderedPlayers = playerOrder
    .map(id => players.find(p => p.id === id))
    .filter(Boolean)
    .concat(players.filter(p => !playerOrder.includes(p.id)));

  useEffect(() => {
    setRound1BenchIds(ids => ids.filter(id => players.some(player => player.id === id)).slice(0, numBench));
  }, [numBench, players]);

  const handleStart = async () => {
    if (!isValid) { toast.error('Add at least 4 players to start.'); return; }
    setSaving(true);

    // Build initial engine state from confirmed host ranking
    const confirmedOrder = orderedPlayers.map(p => p.id);
    const enginePlayers = orderedPlayers.map(p => ({ id: p.id, name: p.full_name, rating: p.skill_rating || 3.0 }));
    let state = createKotcState({ players: enginePlayers, numCourts: numCourtsNum, playerOrder: confirmedOrder });
    const round1 = generateRound1(state, false, round1BenchIds);
    state = { ...state, rounds: [round1], benchQueue: round1BenchIds, recentBench: round1BenchIds };

    // Serialise — Sets aren't JSON-friendly
    const serialisable = { ...state, pairingHistory: [] };

    await base44.entities.Tournament.update(tournament.id, {
      status: 'In Progress',
      kotc_num_courts: numCourtsNum,
      kotc_num_rounds: Number(numRounds),
      kotc_score_format: scoreFormat,
      kotc_player_order: confirmedOrder,
      kotc_state: JSON.stringify(serialisable),
      kotc_current_round: 1,
    });
    toast.success('King of the Court started!');
    setSaving(false);
    onStarted?.();
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
  };

  return (
    <div className="space-y-6">
      {/* Player count summary */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Crown className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">King of the Court Setup</p>
            <p className="text-xs text-muted-foreground">{players.length} players registered</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="glass rounded-lg p-3">
            <p className="text-xl font-bold text-foreground">{players.length}</p>
            <p className="text-[10px] text-muted-foreground">Players</p>
          </div>
          <div className="glass rounded-lg p-3">
            <p className="text-xl font-bold text-primary">{numCourtsNum * 4}</p>
            <p className="text-[10px] text-muted-foreground">Active/Round</p>
          </div>
          <div className="glass rounded-lg p-3">
            <p className={cn("text-xl font-bold", numBench > 0 ? "text-yellow-400" : "text-primary")}>{numBench}</p>
            <p className="text-[10px] text-muted-foreground">Bench/Round</p>
          </div>
        </div>
      </div>

      {players.length > 0 && (
        <div className="glass rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Player Ranking</h3>
            <p className="text-xs text-muted-foreground mt-1">Rank players before Round 1. Drag rows or use Up/Down controls.</p>
          </div>
          <RankingList
            items={orderedPlayers.map(p => ({ id: p.id, label: p.full_name, sublabel: `Rating ${(p.skill_rating || 3).toFixed(1)}` }))}
            onChange={setPlayerOrder}
          />
        </div>
      )}

      <RoundOneBenchSelector
        players={orderedPlayers}
        benchIds={round1BenchIds}
        maxBench={numBench}
        onBenchChange={setRound1BenchIds}
        onOrderChange={setPlayerOrder}
      />

      {/* Config */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Session Configuration</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Number of Courts</Label>
            <Input
              type="number" min={1} max={4}
              value={numCourts}
              onChange={e => setNumCourts(e.target.value)}
              onBlur={e => setNumCourts(String(Math.max(1, Math.min(4, parseInt(e.target.value) || defaultCourts))))}
              className="mt-1 bg-secondary border-border"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Court 1 = King Court</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Total Rounds</Label>
            <Select value={String(numRounds)} onValueChange={v => setNumRounds(Number(v))}>
              <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 rounds</SelectItem>
                <SelectItem value="8">8 rounds</SelectItem>
                <SelectItem value="9">9 rounds</SelectItem>
                <SelectItem value="10">10 rounds</SelectItem>
                <SelectItem value="11">11 rounds</SelectItem>
                <SelectItem value="12">12 rounds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Match Format</Label>
          <div className="grid grid-cols-2 gap-2">
            {SCORE_FORMATS.map(f => (
              <label key={f.value} className={cn(
                'flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all',
                scoreFormat === f.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
              )}>
                <input type="radio" name="scoreFormat" value={f.value} checked={scoreFormat === f.value}
                  onChange={() => setScoreFormat(f.value)} className="sr-only" />
                <f.icon className={cn("w-3.5 h-3.5 shrink-0", scoreFormat === f.value ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <p className="text-xs font-medium text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {players.length < 4 && (
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Add at least 4 players to start a King of the Court session.</p>
        </div>
      )}

      {isValid && numBench > 0 && round1BenchIds.length !== numBench && (
        <div className="glass rounded-xl p-4 text-center border border-yellow-500/20">
          <p className="text-xs text-yellow-400">Choose {numBench} player{numBench === 1 ? '' : 's'} to bench in Round 1 before starting.</p>
        </div>
      )}

      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        onClick={handleStart}
        disabled={!isValid || saving || round1BenchIds.length !== numBench}
      >
        {saving
          ? <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Starting…</>
          : <><Play className="w-4 h-4" /> Start King of the Court</>
        }
      </Button>
    </div>
  );
}