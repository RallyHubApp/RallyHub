import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function ScoreEntry({ court, roundNumber, playerMap, result, onSave, isTimed, disabled }) {
  const [scoreA, setScoreA] = useState(result?.scoreA ?? '');
  const [scoreB, setScoreB] = useState(result?.scoreB ?? '');
  const [editing, setEditing] = useState(!result);

  const teamANames = court.teamA.map(id => playerMap[id] || id).join(' & ');
  const teamBNames = court.teamB.map(id => playerMap[id] || id).join(' & ');

  const canSave = scoreA !== '' && scoreB !== '' && Number(scoreA) !== Number(scoreB);

  const handleSave = () => {
    const sA = Number(scoreA);
    const sB = Number(scoreB);
    if (sA === sB) return;
    const winner = sA > sB ? 'A' : 'B';
    onSave(court.courtNumber, { winner, scoreA: sA, scoreB: sB });
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass rounded-xl p-4 space-y-3',
        result && 'border border-primary/20'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">Court {court.courtNumber}</span>
        {result && !editing && !disabled && (
          <button onClick={() => setEditing(true)} className="text-[10px] text-muted-foreground hover:text-primary underline">Edit</button>
        )}
        {result && !editing && (
          <Check className="w-3.5 h-3.5 text-primary" />
        )}
      </div>

      {/* Team A */}
      <div className={cn('rounded-lg p-3', result?.winner === 'A' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary')}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Team A</p>
        <p className="text-xs font-semibold text-foreground">{teamANames}</p>
      </div>

      <div className="text-center text-[10px] text-muted-foreground">vs</div>

      {/* Team B */}
      <div className={cn('rounded-lg p-3', result?.winner === 'B' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary')}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Team B</p>
        <p className="text-xs font-semibold text-foreground">{teamBNames}</p>
      </div>

      {/* Score entry */}
      {editing && !disabled && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] text-muted-foreground font-medium">Enter scores:</p>
          <div className="flex items-center gap-2">
            <Input
              type="number" min={0} max={99}
              value={scoreA}
              onChange={e => setScoreA(e.target.value)}
              placeholder="A"
              className="h-8 text-sm text-center bg-secondary border-border"
            />
            <span className="text-xs text-muted-foreground font-bold shrink-0">—</span>
            <Input
              type="number" min={0} max={99}
              value={scoreB}
              onChange={e => setScoreB(e.target.value)}
              placeholder="B"
              className="h-8 text-sm text-center bg-secondary border-border"
            />
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

export default function TournivalScoring({ rounds, results, playerMap, currentRound, onSaveResult, onCompleteRound, isAdmin }) {
  const round = rounds[currentRound - 1];
  const roundResults = results[currentRound] || {};
  const allRecorded = round?.courts.every(c => roundResults[c.courtNumber]);
  const isLastGroupRound = currentRound >= rounds.length;

  if (!round) return null;

  return (
    <div className="space-y-4">
      {/* Round header */}
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Round {currentRound}
              <span className="text-muted-foreground font-normal"> of {rounds.length}</span>
            </p>
            <p className="text-xs text-muted-foreground">{round.courts.length} courts</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-1">
          {rounds.map((_, i) => (
            <div key={i} className={cn('w-2 h-2 rounded-full transition-colors',
              i + 1 < currentRound ? 'bg-primary' :
              i + 1 === currentRound ? 'bg-primary animate-pulse' : 'bg-secondary'
            )} />
          ))}
        </div>
      </div>

      {/* Courts */}
      <div className="grid sm:grid-cols-2 gap-3">
        {round.courts.map(court => (
          <ScoreEntry
            key={court.courtNumber}
            court={court}
            roundNumber={currentRound}
            playerMap={playerMap}
            result={roundResults[court.courtNumber]}
            onSave={onSaveResult}
            disabled={!isAdmin}
          />
        ))}
      </div>

      {/* Bench */}
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

      {/* Action */}
      {isAdmin && (
        <Button
          className={cn('w-full gap-2 h-12', allRecorded ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'opacity-50')}
          onClick={onCompleteRound}
          disabled={!allRecorded}
        >
          {isLastGroupRound
            ? <><Trophy className="w-4 h-4" /> Complete Group Stage</>
            : <><ChevronRight className="w-4 h-4" /> Next Round</>
          }
        </Button>
      )}
    </div>
  );
}