import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTION_COLORS = {
  Main: 'text-primary border-primary/30',
  Winners: 'text-primary border-primary/30',
  Losers: 'text-destructive border-destructive/30',
  Consolation: 'text-yellow-400 border-yellow-400/30',
  'Round Robin': 'text-accent border-accent/30',
  East: 'text-primary border-primary/30',
  North: 'text-green-400 border-green-400/30',
  West: 'text-orange-400 border-orange-400/30',
  South: 'text-purple-400 border-purple-400/30',
};

function MatchCard({ match, isWinner1, isWinner2 }) {
  const status = match.status;
  const isCompleted = status === 'Completed';
  const isLive = status === 'In Progress';
  const isBye = match.team2_names === 'BYE';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-lg border overflow-hidden w-52',
        isLive ? 'border-primary/60 glow-green-sm' : 'border-border',
        isBye && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-1 bg-secondary">
        <span className="text-[10px] font-mono text-muted-foreground">
          R{match.round} M{match.match_number}
        </span>
        {isLive && <span className="text-[10px] text-primary font-semibold animate-pulse">● LIVE</span>}
        {isCompleted && !isLive && <CheckCircle2 className="w-3 h-3 text-primary" />}
      </div>

      {/* Team 1 */}
      <div className={cn(
        'flex items-center justify-between px-2.5 py-2 border-b border-border',
        isWinner1 && isCompleted && 'bg-primary/8'
      )}>
        <div className="flex items-center gap-1.5 min-w-0">
          {isWinner1 && isCompleted && <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />}
          <span className={cn('text-xs truncate', isWinner1 && isCompleted ? 'font-semibold text-primary' : 'text-foreground')}>
            {match.team1_names || 'TBD'}
          </span>
        </div>
        <span className={cn('text-xs font-bold font-mono ml-1 shrink-0', isWinner1 && isCompleted ? 'text-primary' : 'text-muted-foreground')}>
          {match.scores?.map(s => s.team1).join(',')}
        </span>
      </div>

      {/* Team 2 */}
      <div className={cn(
        'flex items-center justify-between px-2.5 py-2',
        isWinner2 && isCompleted && 'bg-primary/8'
      )}>
        <div className="flex items-center gap-1.5 min-w-0">
          {isWinner2 && isCompleted && <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />}
          <span className={cn('text-xs truncate', isBye ? 'text-muted-foreground italic' : isWinner2 && isCompleted ? 'font-semibold text-primary' : 'text-foreground')}>
            {match.team2_names || 'TBD'}
          </span>
        </div>
        <span className={cn('text-xs font-bold font-mono ml-1 shrink-0', isWinner2 && isCompleted ? 'text-primary' : 'text-muted-foreground')}>
          {match.scores?.map(s => s.team2).join(',')}
        </span>
      </div>
    </motion.div>
  );
}

function RoundColumn({ round, matches, roundLabel }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {roundLabel || `Round ${round}`}
        </span>
      </div>
      <div className="flex flex-col gap-6 justify-around flex-1">
        {matches.map(match => {
          const isWinner1 = match.winner_team === 'team1';
          const isWinner2 = match.winner_team === 'team2';
          return (
            <MatchCard key={match.id || `${match.round}-${match.match_number}`} match={match} isWinner1={isWinner1} isWinner2={isWinner2} />
          );
        })}
      </div>
    </div>
  );
}

function SectionBracket({ section, matches, sectionLabel }) {
  const maxRound = Math.max(...matches.map(m => m.round || 1));
  const rounds = [];
  for (let r = 1; r <= maxRound; r++) {
    const rMatches = matches.filter(m => m.round === r);
    if (rMatches.length > 0) rounds.push({ round: r, matches: rMatches });
  }

  const roundLabels = {
    1: matches.length === 1 ? 'Final' : matches.length === 2 ? 'SF' : `Round 1`,
  };

  // Better labels by total matches in bracket
  const totalR1 = rounds[0]?.matches.length || 1;
  const getRoundLabel = (r, total) => {
    const matchesInRound = rounds.find(x => x.round === r)?.matches.length || 0;
    if (matchesInRound === 1) return 'Final';
    if (matchesInRound === 2) return 'Semi-Finals';
    if (matchesInRound === 4) return 'Quarter-Finals';
    return `Round ${r}`;
  };

  return (
    <div className="space-y-3">
      {sectionLabel && (
        <div className={cn('text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border w-fit', SECTION_COLORS[section] || 'text-muted-foreground border-border')}>
          {sectionLabel}
        </div>
      )}
      <div className="flex gap-8 items-start overflow-x-auto pb-2">
        {rounds.map(({ round, matches: rMatches }) => (
          <RoundColumn key={round} round={round} matches={rMatches} roundLabel={getRoundLabel(round, totalR1)} />
        ))}
      </div>
    </div>
  );
}

export default function BracketView({ matches, format }) {
  const sections = useMemo(() => {
    const map = {};
    matches.forEach(m => {
      const sec = m.section || 'Main';
      if (!map[sec]) map[sec] = [];
      map[sec].push(m);
    });
    return map;
  }, [matches]);

  const sectionOrder = ['Main', 'Winners', 'East', 'North', 'West', 'South', 'Losers', 'Consolation', 'Round Robin'];

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="space-y-2">
          <Circle className="w-12 h-12 text-muted-foreground/20 mx-auto" />
          <p className="text-sm text-muted-foreground">Draw not generated yet</p>
        </div>
      </div>
    );
  }

  // Round Robin — table view instead of bracket
  if (format === 'Round Robin') {
    const allEntries = [...new Set([
      ...matches.map(m => m.team1_names),
      ...matches.map(m => m.team2_names)
    ])].filter(Boolean);

    const results = {};
    allEntries.forEach(e => { results[e] = { w: 0, l: 0, played: 0 }; });
    matches.filter(m => m.status === 'Completed').forEach(m => {
      if (m.winner_team === 'team1') { results[m.team1_names].w++; results[m.team2_names].l++; }
      else if (m.winner_team === 'team2') { results[m.team2_names].w++; results[m.team1_names].l++; }
      results[m.team1_names].played++;
      results[m.team2_names].played++;
    });
    const ranked = allEntries.sort((a, b) => (results[b]?.w || 0) - (results[a]?.w || 0));

    return (
      <div className="space-y-4">
        {/* Standings */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_3rem_3rem_3rem_3rem] px-4 py-2 bg-secondary text-xs font-medium text-muted-foreground">
            <span>Pair / Player</span>
            <span className="text-center">P</span>
            <span className="text-center">W</span>
            <span className="text-center">L</span>
            <span className="text-center">Pts</span>
          </div>
          {ranked.map((name, i) => (
            <div key={name} className="grid grid-cols-[1fr_3rem_3rem_3rem_3rem] px-4 py-2.5 border-t border-border items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <span className="text-sm text-foreground font-medium truncate">{name}</span>
              </div>
              <span className="text-xs text-center text-muted-foreground">{results[name]?.played}</span>
              <span className="text-xs text-center text-primary font-bold">{results[name]?.w}</span>
              <span className="text-xs text-center text-destructive">{results[name]?.l}</span>
              <span className="text-xs text-center text-foreground font-bold">{results[name]?.w * 2}</span>
            </div>
          ))}
        </div>

        {/* Fixtures grid */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 flex-wrap">
            {matches.map((m, i) => (
              <MatchCard key={m.id || i} match={m} isWinner1={m.winner_team === 'team1'} isWinner2={m.winner_team === 'team2'} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const orderedSections = sectionOrder.filter(s => sections[s]);

  return (
    <div className="space-y-8 overflow-x-auto">
      {orderedSections.map(section => (
        <SectionBracket
          key={section}
          section={section}
          matches={sections[section]}
          sectionLabel={orderedSections.length > 1 ? section : null}
        />
      ))}
    </div>
  );
}