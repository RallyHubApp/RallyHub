import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Minus, Users, ChevronRight, Crown, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Partner Split Arrow ─────────────────────────────────────────────────────
function PartnerSplitRow({ pair1, pair2, newTeamA, newTeamB, playerMap, destCourt, isKing }) {
  const [p1a, p1b] = pair1;
  const [p2a, p2b] = pair2;
  const aNames = newTeamA.map(id => playerMap[id] || id);
  const bNames = newTeamB.map(id => playerMap[id] || id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl p-3 space-y-2 border',
        isKing ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-secondary/60 border-border'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={cn(
          'w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0',
          isKing ? 'bg-yellow-500/20 text-yellow-400' : 'bg-secondary text-muted-foreground'
        )}>
          {destCourt}
        </div>
        {isKing && <Crown className="w-3 h-3 text-yellow-400" />}
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Court {destCourt} {isKing ? '— King Court' : ''}
        </span>
        <Shuffle className="w-3 h-3 text-accent ml-auto" />
      </div>

      {/* Before: old pairs */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-muted-foreground w-10 shrink-0">Before:</span>
        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
          {playerMap[p1a] || p1a} + {playerMap[p1b] || p1b}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-medium">
          {playerMap[p2a] || p2a} + {playerMap[p2b] || p2b}
        </span>
      </div>

      {/* Arrow */}
      <div className="flex items-center gap-1 text-muted-foreground text-[10px] pl-10">
        <div className="flex-1 border-t border-dashed border-border/60" />
        <Shuffle className="w-3 h-3 text-accent" />
        <span className="text-accent">split &amp; cross</span>
        <div className="flex-1 border-t border-dashed border-border/60" />
      </div>

      {/* After: new teams */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-muted-foreground w-10 shrink-0">After:</span>
        <span className="px-2 py-0.5 rounded bg-primary/15 text-foreground font-semibold">
          {aNames.join(' + ')}
        </span>
        <span className="text-muted-foreground text-[10px]">vs</span>
        <span className="px-2 py-0.5 rounded bg-primary/15 text-foreground font-semibold">
          {bNames.join(' + ')}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KotcRotationSummary({ movements, playerMap, nextRound, onContinue }) {
  const promotions = movements.filter(m => m.direction === 'up');
  const relegations = movements.filter(m => m.direction === 'down');
  const staying = movements.filter(m => m.direction === 'stay');
  const benched = movements.filter(m => m.direction === 'bench');

  // Build cross-pair display data from nextRound courts
  // We infer which courts had a full cross-pair by looking at the movements
  // A court had a cross-pair if it received players from TWO different source courts
  const courtPairings = nextRound?.courts || [];

  // Build movement lookup: playerId → { fromCourt, prevPartner }
  const moveMap = {};
  movements.forEach(m => { moveMap[m.playerId] = m; });

  // For each next-round court, determine if it was a cross-pair situation
  // by checking if players came from different source courts
  const crossPairCourts = courtPairings.map(court => {
    const allIds = [...court.teamA, ...court.teamB];
    const sourceCourts = [...new Set(allIds.map(id => moveMap[id]?.fromCourt).filter(Boolean))];
    const isCross = sourceCourts.length > 1;

    if (!isCross) return null;

    // Reconstruct which pairs came from which source court
    const bySource = {};
    allIds.forEach(id => {
      const src = moveMap[id]?.fromCourt;
      if (src) { if (!bySource[src]) bySource[src] = []; bySource[src].push(id); }
    });

    const sources = Object.keys(bySource).map(Number).sort((a, b) => a - b);
    if (sources.length < 2) return null;

    return {
      court,
      pair1: bySource[sources[0]] || [],
      pair2: bySource[sources[1]] || [],
    };
  }).filter(Boolean);

  const movementGroups = [
    { label: 'Moving Up', items: promotions, icon: ArrowUp, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { label: 'Staying', items: staying, icon: Minus, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { label: 'Moving Down', items: relegations, icon: ArrowDown, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
    { label: 'On Bench', items: benched, icon: Users, color: 'text-muted-foreground', bg: 'bg-secondary', border: 'border-border' },
  ].filter(g => g.items.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="glass rounded-xl p-4 text-center">
        <Crown className="w-7 h-7 text-yellow-400 mx-auto mb-2" />
        <p className="text-base font-bold text-foreground">Round Complete!</p>
        <p className="text-xs text-muted-foreground mt-1">
          Winners move up · Losers move down · All pairs split &amp; rotate
        </p>
      </div>

      {/* Movement summary pills */}
      <div className="grid grid-cols-2 gap-2">
        {movementGroups.map(group => (
          <div key={group.label} className={cn('glass rounded-xl p-3 border', group.border)}>
            <div className="flex items-center gap-1.5 mb-2">
              <group.icon className={cn('w-3.5 h-3.5', group.color)} />
              <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
                {group.label}
              </span>
              <span className="text-[10px] text-muted-foreground">({group.items.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {group.items.map((m, i) => (
                <motion.span
                  key={m.playerId + i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn('px-2 py-0.5 rounded text-[10px] font-medium', group.bg, group.color)}
                >
                  {playerMap[m.playerId] || m.playerId}
                  {m.fromCourt && m.toCourt && m.fromCourt !== m.toCourt && (
                    <span className="opacity-60 ml-1">C{m.fromCourt}→C{m.toCourt}</span>
                  )}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Partner Rotation section */}
      {crossPairCourts.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Partner Rotation — Split &amp; Cross
          </p>
          {crossPairCourts.map(({ court, pair1, pair2 }) => (
            <PartnerSplitRow
              key={court.courtNumber}
              pair1={pair1}
              pair2={pair2}
              newTeamA={court.teamA}
              newTeamB={court.teamB}
              playerMap={playerMap}
              destCourt={court.courtNumber}
              isKing={court.courtNumber === 1}
            />
          ))}
        </div>
      )}

      {/* Full next round preview */}
      {nextRound && (
        <div className="glass rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Round {nextRound.roundNumber} — Full Draw
          </p>
          {nextRound.courts.map(court => (
            <div key={court.courtNumber} className="flex items-center gap-2 text-xs">
              <div className={cn(
                'w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0',
                court.courtNumber === 1 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-secondary text-muted-foreground'
              )}>
                {court.courtNumber}
              </div>
              <span className="text-foreground font-medium flex-1">
                {court.teamA.map(id => playerMap[id] || id).join(' & ')}
              </span>
              <span className="text-muted-foreground text-[10px] shrink-0">vs</span>
              <span className="text-foreground font-medium flex-1 text-right">
                {court.teamB.map(id => playerMap[id] || id).join(' & ')}
              </span>
            </div>
          ))}
          {nextRound.bench.length > 0 && (
            <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
              Bench: {nextRound.bench.map(id => playerMap[id] || id).join(', ')}
            </p>
          )}
        </div>
      )}

      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        onClick={onContinue}
      >
        <ChevronRight className="w-4 h-4" />
        Start Round {nextRound?.roundNumber}
      </Button>
    </motion.div>
  );
}