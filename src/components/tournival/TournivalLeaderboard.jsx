import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const medals = ['🥇', '🥈', '🥉'];

export default function TournivalLeaderboard({ leaderboard, onCreateKnockout, isAdmin, groupStageComplete }) {
  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Live Standings</p>
            <p className="text-xs text-muted-foreground">Points → PF → Diff</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem] gap-1 px-4 py-2 border-b border-border text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>#</span>
          <span>Player</span>
          <span className="text-center">P</span>
          <span className="text-center">W</span>
          <span className="text-center">L</span>
          <span className="text-center">PF</span>
          <span className="text-right">Pts</span>
        </div>

        <div className="divide-y divide-border/50">
          {leaderboard.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem] gap-1 px-4 py-3 items-center hover:bg-secondary/50 transition-colors',
                i === 0 && 'bg-primary/5'
              )}
            >
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
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create knockout */}
      {isAdmin && groupStageComplete && (
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12"
          onClick={onCreateKnockout}
        >
          <Trophy className="w-4 h-4" /> Create Cup Matches
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}