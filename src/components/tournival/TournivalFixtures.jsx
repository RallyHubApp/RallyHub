import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { checkFairness } from '@/lib/tournivalEngine';
import { motion } from 'framer-motion';

function FairnessAlert({ issues, playerMap }) {
  const [open, setOpen] = useState(false);
  if (issues.length === 0) return (
    <div className="flex items-center gap-2 text-xs text-primary">
      <CheckCircle className="w-4 h-4" />
      All fixtures look fair — no repeated partners or matchups.
    </div>
  );

  return (
    <div className="space-y-2">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 text-xs text-yellow-400 w-full text-left">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span className="flex-1">{issues.length} fairness flag{issues.length > 1 ? 's' : ''} — tap to review</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="space-y-1 pl-6">
          {issues.slice(0, 10).map((issue, i) => {
            const [id1, id2] = issue.pair.split('|');
            const name1 = playerMap[id1] || id1;
            const name2 = playerMap[id2] || id2;
            return (
              <p key={i} className="text-[10px] text-muted-foreground">
                {issue.type === 'repeated_partner' ? '👫 Partners' : '⚔️ Opponents'}: {name1} & {name2}
                {' '}({issue.count}×)
              </p>
            );
          })}
          {issues.length > 10 && <p className="text-[10px] text-muted-foreground">…and {issues.length - 10} more</p>}
        </div>
      )}
    </div>
  );
}

function FixtureCourtCard({ court, roundNumber, playerMap, editingPlayerId, onReplacePlayer }) {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">Court {court.courtNumber}</span>
        <Badge variant="outline" className="text-[10px]">Round {roundNumber}</Badge>
      </div>

      {/* Team A */}
      <div className="bg-secondary rounded-lg p-3">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5">Team A</p>
        <div className="space-y-1">
          {court.teamA.map(id => (
            <div key={id} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {(playerMap[id] || '?')[0]}
              </div>
              <span className={cn('text-xs text-foreground', editingPlayerId === id && 'text-yellow-400')}>{playerMap[id] || id}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-[10px] text-muted-foreground font-medium">vs</div>

      {/* Team B */}
      <div className="bg-secondary rounded-lg p-3">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5">Team B</p>
        <div className="space-y-1">
          {court.teamB.map(id => (
            <div key={id} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {(playerMap[id] || '?')[0]}
              </div>
              <span className={cn('text-xs text-foreground', editingPlayerId === id && 'text-yellow-400')}>{playerMap[id] || id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TournivalFixtures({ rounds, playerMap, onReshuffle, reshuffling, isAdmin, onReplacePlayer, editingPlayerId, seedOrderLocked }) {
  const [showAll, setShowAll] = useState(false);
  const issues = checkFairness(rounds);
  const displayRounds = showAll ? rounds : rounds.slice(0, 1);

  return (
    <div className="space-y-4">
      {/* Fairness check */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fairness Check</p>
          {isAdmin && onReshuffle && (
            <Button variant="outline" size="sm" className="text-xs gap-1 h-7" onClick={onReshuffle} disabled={reshuffling || seedOrderLocked}>
              <RefreshCw className={cn('w-3 h-3', reshuffling && 'animate-spin')} />
              {seedOrderLocked ? 'Seed order locked' : 'Regenerate from seeds'}
            </Button>
          )}
        </div>
        <FairnessAlert issues={issues} playerMap={playerMap} />
      </div>

      {/* Rounds */}
      {displayRounds.map(round => (
        <motion.div key={round.roundNumber} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">{round.roundNumber}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Round {round.roundNumber}</span>
            {round.bench?.length > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Bench: {round.bench.map(id => playerMap[id] || id).join(', ')}</span>
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {round.courts.map(court => (
              <FixtureCourtCard
                key={court.courtNumber}
                court={court}
                roundNumber={round.roundNumber}
                playerMap={playerMap}
                editingPlayerId={editingPlayerId}
                onReplacePlayer={onReplacePlayer}
              />
            ))}
          </div>
        </motion.div>
      ))}

      {rounds.length > 1 && (
        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground gap-1" onClick={() => setShowAll(s => !s)}>
          {showAll ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all {rounds.length} rounds</>}
        </Button>
      )}
    </div>
  );
}