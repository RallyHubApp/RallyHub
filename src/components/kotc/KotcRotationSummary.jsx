import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Minus, Users, ChevronRight, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function KotcRotationSummary({ movements, playerMap, nextRound, onContinue }) {
  // Group movements for display
  const promotions = movements.filter(m => m.direction === 'up');
  const relegations = movements.filter(m => m.direction === 'down');
  const staying = movements.filter(m => m.direction === 'stay');
  const benched = movements.filter(m => m.direction === 'bench');

  const groups = [
    {
      label: 'Moving Up',
      items: promotions,
      icon: ArrowUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      label: 'Staying',
      items: staying,
      icon: Minus,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
    {
      label: 'Moving Down',
      items: relegations,
      icon: ArrowDown,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/20',
    },
    {
      label: 'On Bench',
      items: benched,
      icon: Users,
      color: 'text-muted-foreground',
      bg: 'bg-secondary',
      border: 'border-border',
    },
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
        <p className="text-xs text-muted-foreground mt-1">Here's how players are moving</p>
      </div>

      {/* Movement groups */}
      {groups.map(group => (
        <div key={group.label} className={cn("glass rounded-xl p-4 border", group.border)}>
          <div className="flex items-center gap-2 mb-3">
            <group.icon className={cn("w-4 h-4", group.color)} />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {group.label}
            </span>
            <span className="text-xs text-muted-foreground ml-1">({group.items.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.items.map((m, i) => (
              <motion.div
                key={m.playerId + i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs", group.bg)}
              >
                <span className={cn("font-medium", group.color)}>
                  {playerMap[m.playerId] || m.playerId}
                </span>
                {m.fromCourt && m.toCourt && m.fromCourt !== m.toCourt && (
                  <span className="text-muted-foreground text-[10px]">
                    C{m.fromCourt} → C{m.toCourt}
                  </span>
                )}
                {m.fromCourt && m.toCourt && m.fromCourt === m.toCourt && (
                  <span className="text-muted-foreground text-[10px]">C{m.fromCourt}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Next round preview */}
      {nextRound && (
        <div className="glass rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Round {nextRound.roundNumber} Preview
          </p>
          {nextRound.courts.map(court => (
            <div key={court.courtNumber} className="flex items-center gap-2 text-xs">
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0",
                court.courtNumber === 1 ? "bg-yellow-500/20 text-yellow-400" : "bg-secondary text-muted-foreground"
              )}>
                {court.courtNumber}
              </div>
              <span className="text-foreground flex-1">
                {court.teamA.map(id => playerMap[id] || id).join(' & ')}
              </span>
              <span className="text-muted-foreground text-[10px]">vs</span>
              <span className="text-foreground flex-1 text-right">
                {court.teamB.map(id => playerMap[id] || id).join(' & ')}
              </span>
            </div>
          ))}
          {nextRound.bench.length > 0 && (
            <p className="text-[10px] text-muted-foreground pt-1">
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