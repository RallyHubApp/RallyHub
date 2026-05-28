import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Hash, Play, Zap, Timer, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { estimateDuration, generateGroupFixtures } from '@/lib/tournivalEngine';
import TournivalSeedOrder from './TournivalSeedOrder';
import TournivalFixtures from './TournivalFixtures';
import { toast } from 'sonner';

const MATCH_FORMATS = [
  { value: 'timed_10', label: '10-min timed', icon: Timer, desc: 'Most points wins' },
  { value: 'timed_15', label: '15-min timed', icon: Timer, desc: 'Most points wins' },
  { value: 'first_11_by1', label: 'First to 11', icon: Hash, desc: 'Win by 1' },
  { value: 'first_11_by2', label: 'First to 11', icon: Hash, desc: 'Win by 2' },
];

export default function TournivalSetup({ players, tournament, onStart, isAdmin, locked, existingState, onSaveState }) {
  const [numCourts, setNumCourts] = useState(existingState?.numCourts || tournament.kotc_num_courts || 4);
  const [numRounds, setNumRounds] = useState(existingState?.numRounds || 4);
  const [matchFormat, setMatchFormat] = useState(existingState?.matchFormat || 'first_11_by1');
  const [seedOrder, setSeedOrder] = useState(existingState?.seedOrder || players.map(p => p.id));
  const [seedConfirmed, setSeedConfirmed] = useState(!!existingState?.seedOrderConfirmed);
  const [saving, setSaving] = useState(false);

  const numPlayers = players.length;
  const isValid = numPlayers >= 4;
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]));
  const orderedPlayers = seedOrder.map(id => playerMap[id]).filter(Boolean);
  const missingPlayers = players.filter(p => !seedOrder.includes(p.id));
  const fullOrderedPlayers = [...orderedPlayers, ...missingPlayers];
  const currentSeedIds = fullOrderedPlayers.map(p => p.id);
  const seedLocked = locked;

  const duration = estimateDuration({ numPlayers, numCourts, numRounds, matchFormat });
  const activePlayers = Math.min(numPlayers, numCourts * 4);
  const benchPlayers = Math.max(0, numPlayers - activePlayers);

  const handleStart = async () => {
    if (!isValid) { toast.error('Add at least 4 players to start.'); return; }
    if (!seedConfirmed) { toast.error('Confirm seed order before generating fixtures.'); return; }
    setSaving(true);
    await onStart({ numCourts: Number(numCourts), numRounds: Number(numRounds), matchFormat, seedOrder: currentSeedIds });
    setSaving(false);
  };

  const handleSeedReorder = (ids) => {
    setSeedOrder(ids);
    setSeedConfirmed(false);
  };

  const handleSortByRanking = () => {
    setSeedOrder([...fullOrderedPlayers].sort((a, b) => (b.skill_rating || 0) - (a.skill_rating || 0)).map(p => p.id));
    setSeedConfirmed(false);
  };

  const handleRandomise = () => {
    const shuffled = [...fullOrderedPlayers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setSeedOrder(shuffled.map(p => p.id));
    setSeedConfirmed(false);
  };

  const handleReset = () => {
    setSeedOrder(players.map(p => p.id));
    setSeedConfirmed(false);
  };

  const handleConfirmSeeds = async () => {
    setSeedConfirmed(true);
    if (onSaveState) {
      await onSaveState({ ...(existingState || {}), seedOrder: currentSeedIds, seedOrderConfirmed: true, seedOrderLocked: false, playerIds: currentSeedIds, results: existingState?.results || {}, currentRound: existingState?.currentRound || 0 });
    }
    toast.success('Seed order confirmed');
  };

  const handleUnlockSeeds = async () => {
    const ok = window.confirm('Unlocking seed order may change existing fixtures. Continue?');
    if (!ok || !existingState || !onSaveState) return;
    await onSaveState({ ...existingState, seedOrderLocked: false });
    toast.success('Seed order unlocked');
  };

  const previewRounds = seedConfirmed ? generateGroupFixtures(currentSeedIds, Number(numCourts), Number(numRounds)) : [];
  const previewMap = Object.fromEntries(players.map(p => [p.id, p.full_name || p.id]));

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Tournival Setup</p>
            <p className="text-xs text-muted-foreground">{numPlayers} players registered</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="glass rounded-lg p-3">
            <p className="text-xl font-bold text-foreground">{numPlayers}</p>
            <p className="text-[10px] text-muted-foreground">Players</p>
          </div>
          <div className="glass rounded-lg p-3">
            <p className="text-xl font-bold text-primary">{activePlayers}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </div>
          <div className="glass rounded-lg p-3">
            <p className={cn('text-xl font-bold', benchPlayers > 0 ? 'text-yellow-400' : 'text-primary')}>{benchPlayers}</p>
            <p className="text-[10px] text-muted-foreground">Bench</p>
          </div>
          <div className="glass rounded-lg p-3">
            <p className="text-xl font-bold text-accent">{duration.formatted}</p>
            <p className="text-[10px] text-muted-foreground">Est. duration</p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Session Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Number of Courts</Label>
            <Input
              type="number" min={1} max={8}
              value={numCourts}
              onChange={e => setNumCourts(Math.max(1, Math.min(8, Number(e.target.value))))}
              className="mt-1 bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Group Rounds</Label>
            <Select value={String(numRounds)} onValueChange={v => setNumRounds(Number(v))}>
              <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6].map(n => <SelectItem key={n} value={String(n)}>{n} rounds</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Match Format</Label>
          <div className="grid grid-cols-2 gap-2">
            {MATCH_FORMATS.map(f => (
              <label key={f.value} className={cn(
                'flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all',
                matchFormat === f.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
              )}>
                <input type="radio" name="matchFormat" value={f.value} checked={matchFormat === f.value}
                  onChange={() => setMatchFormat(f.value)} className="sr-only" />
                <f.icon className={cn('w-3.5 h-3.5 shrink-0', matchFormat === f.value ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <p className="text-xs font-medium text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Seed ordering */}
      <TournivalSeedOrder
        orderedPlayers={fullOrderedPlayers}
        locked={seedLocked}
        confirmed={seedConfirmed}
        isAdmin={isAdmin}
        onReorder={handleSeedReorder}
        onSortByRanking={handleSortByRanking}
        onRandomise={handleRandomise}
        onReset={handleReset}
        onConfirm={handleConfirmSeeds}
        onUnlock={handleUnlockSeeds}
      />

      {/* Draw preview */}
      {seedConfirmed && previewRounds.length > 0 && (
        <div className="space-y-3">
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Draw Preview</p>
              <p className="text-xs text-muted-foreground">Preview uses the confirmed seed order below.</p>
            </div>
          </div>
          <TournivalFixtures rounds={previewRounds} playerMap={previewMap} isAdmin={false} />
        </div>
      )}

      {/* Duration breakdown */}
      <div className="glass rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Estimated Timeline</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Group stage ({numRounds} rounds)</span>
            <span className="text-foreground font-medium">{duration.groupMinutes}min</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">QF + SF + Final + 3rd/4th</span>
            <span className="text-foreground font-medium">{duration.knockoutMinutes}min</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">{duration.formatted}</span>
          </div>
        </div>
      </div>

      {numPlayers < 4 && (
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Add at least 4 players to start a Tournival session.</p>
        </div>
      )}

      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12"
        onClick={handleStart}
        disabled={!isValid || saving || !seedConfirmed}
      >
        {saving
          ? <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Generating Fixtures…</>
          : <><Play className="w-4 h-4" /> {seedConfirmed ? 'Generate Fixtures & Start' : 'Confirm seed order first'}</>
        }
      </Button>
    </div>
  );
}