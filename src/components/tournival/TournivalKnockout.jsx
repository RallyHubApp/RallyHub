import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy, Check, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const STAGE_ORDER = ['QF', 'SF', 'Final', '3rd'];
const STAGE_LABELS = { QF: 'Quarter-Finals', SF: 'Semi-Finals', Final: 'Final', '3rd': '3rd/4th Playoff' };

function KnockoutMatch({ match, isAdmin, onSaveResult }) {
  const [scoreA, setScoreA] = useState(match.result?.scoreA ?? '');
  const [scoreB, setScoreB] = useState(match.result?.scoreB ?? '');
  const [editing, setEditing] = useState(!match.result);

  const pair1Name = match.pair1 ? `${match.pair1.player1.name} & ${match.pair1.player2.name}` : 'TBD';
  const pair2Name = match.pair2 ? `${match.pair2.player1.name} & ${match.pair2.player2.name}` : 'TBD';
  const canSave = scoreA !== '' && scoreB !== '' && Number(scoreA) !== Number(scoreB);

  const handleSave = () => {
    const sA = Number(scoreA);
    const sB = Number(scoreB);
    if (sA === sB) return;
    onSaveResult(match.id, { winner: sA > sB ? 'A' : 'B', scoreA: sA, scoreB: sB });
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
          {match.pair1?.seed && <Badge variant="outline" className="text-[10px]">S{match.pair1.seed} v S{match.pair2?.seed}</Badge>}
        </div>
        {result && !editing && isAdmin && (
          <button onClick={() => setEditing(true)} className="text-[10px] text-muted-foreground hover:text-primary underline">Edit</button>
        )}
      </div>

      <div className={cn('rounded-lg p-3', result?.winner === 'A' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary')}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Pair 1</p>
        <p className="text-xs font-semibold text-foreground">{pair1Name}</p>
        {match.pair1?.seed && <p className="text-[10px] text-muted-foreground mt-0.5">Seed {match.pair1.seed}</p>}
      </div>

      <div className="text-center text-[10px] text-muted-foreground">vs</div>

      <div className={cn('rounded-lg p-3', result?.winner === 'B' ? 'bg-primary/10 border border-primary/20' : 'bg-secondary')}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Pair 2</p>
        <p className="text-xs font-semibold text-foreground">{pair2Name}</p>
        {match.pair2?.seed && <p className="text-[10px] text-muted-foreground mt-0.5">Seed {match.pair2.seed}</p>}
      </div>

      {editing && isAdmin && match.pair1 && match.pair2 && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] text-muted-foreground font-medium">Enter scores:</p>
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

export default function TournivalKnockout({ knockoutState, isAdmin, onSaveResult, onAdvanceStage }) {
  if (!knockoutState) return null;

  const { pairs, bracket, currentStage } = knockoutState;

  // Group bracket by stage
  const stageMatches = {};
  for (const match of bracket) {
    if (!stageMatches[match.stage]) stageMatches[match.stage] = [];
    stageMatches[match.stage].push(match);
  }

  // Find champion
  const finalMatch = bracket.find(m => m.stage === 'Final' && m.result);
  const champion = finalMatch
    ? (finalMatch.result.winner === 'A' ? finalMatch.pair1 : finalMatch.pair2)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-yellow-500/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Cup Matches</p>
          <p className="text-xs text-muted-foreground">{pairs.length} pairs · {currentStage}</p>
        </div>
      </div>

      {/* Pairs list */}
      <div className="glass rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seeded Pairs</p>
        <div className="space-y-2">
          {pairs.map((pair, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <Badge variant="outline" className="text-[10px] shrink-0">S{pair.seed}</Badge>
              <span className="text-foreground flex-1 truncate">
                {pair.player1.name} & {pair.player2.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stages */}
      {STAGE_ORDER.map(stage => {
        const matches = stageMatches[stage];
        if (!matches) return null;
        return (
          <motion.div key={stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-bold text-foreground mb-3">{STAGE_LABELS[stage]}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {matches.map(match => (
                <KnockoutMatch
                  key={match.id}
                  match={match}
                  isAdmin={isAdmin}
                  onSaveResult={onSaveResult}
                />
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Champion banner */}
      {champion && (
        <div className="glass rounded-xl p-6 text-center glow-green">
          <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="text-lg font-bold text-foreground">🏆 Champions!</p>
          <p className="text-primary font-semibold mt-1">{champion.player1.name} & {champion.player2.name}</p>
        </div>
      )}
    </div>
  );
}