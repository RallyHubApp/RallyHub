import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Minus, Users, ChevronRight, Crown, Shuffle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Single court rotation card ───────────────────────────────────────────────
function CourtRotationCard({ destCourt, numCourts, pairA, pairB, teamA, teamB, playerMap }) {
  const isKing   = destCourt === 1;
  const isBottom = destCourt === numCourts;

  // Determine source labels
  let pairALabel = '';
  let pairBLabel = '';
  if (numCourts === 1) {
    pairALabel = 'Winners'; pairBLabel = 'Losers';
  } else if (numCourts === 2) {
    if (destCourt === 1) { pairALabel = 'C1 Winners (stayed)'; pairBLabel = 'C2 Winners (↑)'; }
    else                 { pairALabel = 'C1 Losers (↓)';       pairBLabel = 'C2 Losers (stayed)'; }
  } else {
    if (destCourt === 1) {
      pairALabel = 'C1 Winners (stayed)';
      pairBLabel = 'C2 Winners (↑)';
    } else if (destCourt === numCourts) {
      pairALabel = `C${numCourts - 1} Losers (↓)`;
      pairBLabel = `C${numCourts} Losers (stayed)`;
    } else {
      pairALabel = `C${destCourt + 1} Winners (↑)`;
      pairBLabel = `C${destCourt - 1} Losers (↓)`;
    }
  }

  const pairANames = pairA.map(id => playerMap[id] || id);
  const pairBNames = pairB.map(id => playerMap[id] || id);
  const teamANames = teamA.map(id => playerMap[id] || id);
  const teamBNames = teamB.map(id => playerMap[id] || id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: destCourt * 0.07 }}
      className={cn(
        'rounded-xl border p-3 space-y-2.5',
        isKing ? 'bg-yellow-500/5 border-yellow-500/25' : 'glass border-border'
      )}
    >
      {/* Court header */}
      <div className="flex items-center gap-2">
        <div className={cn(
          'w-6 h-6 rounded font-bold text-xs flex items-center justify-center shrink-0',
          isKing ? 'bg-yellow-500/20 text-yellow-400' : 'bg-secondary text-muted-foreground'
        )}>
          {destCourt}
        </div>
        {isKing && <Crown className="w-3 h-3 text-yellow-400" />}
        <span className="text-xs font-semibold text-foreground">
          Court {destCourt}{isKing ? ' — King Court' : ''}
        </span>
      </div>

      {/* Incoming pairs */}
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Incoming pairs</p>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-lg px-2 py-1.5 bg-primary/10 border border-primary/15">
            <p className="text-[9px] text-primary/70 font-medium mb-0.5">{pairALabel}</p>
            <p className="text-xs font-semibold text-primary">{pairANames.join(' + ')}</p>
          </div>
          <div className="rounded-lg px-2 py-1.5 bg-accent/10 border border-accent/15">
            <p className="text-[9px] text-accent/70 font-medium mb-0.5">{pairBLabel}</p>
            <p className="text-xs font-semibold text-accent">{pairBNames.join(' + ')}</p>
          </div>
        </div>
      </div>

      {/* Split & cross arrow */}
      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-dashed border-border/50" />
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground">
          <Shuffle className="w-2.5 h-2.5" />
          split &amp; cross
        </div>
        <div className="flex-1 border-t border-dashed border-border/50" />
      </div>

      {/* New teams */}
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">New match-up</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex-1 px-2 py-1 rounded-lg bg-secondary font-semibold text-foreground text-center">
            {teamANames.join(' & ')}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">vs</span>
          <span className="flex-1 px-2 py-1 rounded-lg bg-secondary font-semibold text-foreground text-center">
            {teamBNames.join(' & ')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function KotcRotationSummary({ movements, playerMap, nextRound, onContinue }) {
  const [showDetail, setShowDetail] = useState(true);

  const promotions  = movements.filter(m => m.direction === 'up');
  const relegations = movements.filter(m => m.direction === 'down');
  const staying     = movements.filter(m => m.direction === 'stay');
  const benched     = movements.filter(m => m.direction === 'bench');

  const numCourts = nextRound?.courts?.length || 0;

  // Build per-court rotation data for the visual cards
  // We infer pairA / pairB for each destination court from movements
  const moveMap = {};
  movements.forEach(m => { if (m.playerId) moveMap[m.playerId] = m; });

  // Group next-round court players by their source court
  const courtRotations = (nextRound?.courts || []).map(court => {
    const allIds = [...court.teamA, ...court.teamB];
    const bySource = {};
    allIds.forEach(id => {
      const src = moveMap[id]?.fromCourt;
      if (src != null) {
        if (!bySource[src]) bySource[src] = [];
        bySource[src].push(id);
      }
    });
    const sources = Object.keys(bySource).map(Number).sort((a, b) => a - b);
    const pairA = bySource[sources[0]] || [];
    const pairB = bySource[sources[1]] || sources[0] != null ? (bySource[sources[1]] || []) : [];
    return { court, pairA, pairB };
  });

  const movementGroups = [
    { label: 'Moving Up',    items: promotions,  icon: ArrowUp,   color: 'text-primary',          bg: 'bg-primary/10',     border: 'border-primary/20' },
    { label: 'Staying',      items: staying,     icon: Minus,     color: 'text-yellow-400',        bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' },
    { label: 'Moving Down',  items: relegations, icon: ArrowDown, color: 'text-destructive',       bg: 'bg-destructive/10', border: 'border-destructive/20' },
    { label: 'On Bench',     items: benched,     icon: Users,     color: 'text-muted-foreground',  bg: 'bg-secondary',      border: 'border-border' },
  ].filter(g => g.items.length > 0);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">

      {/* Header */}
      <div className="glass rounded-xl p-4 text-center">
        <Crown className="w-7 h-7 text-yellow-400 mx-auto mb-2" />
        <p className="text-base font-bold text-foreground">Round Complete!</p>
        <p className="text-xs text-muted-foreground mt-1">
          Winners move up · Losers move down · Every pair splits &amp; crosses
        </p>
      </div>

      {/* Movement flow — compact pill rows */}
      <div className="grid grid-cols-2 gap-2">
        {movementGroups.map(group => (
          <div key={group.label} className={cn('glass rounded-xl p-3 border', group.border)}>
            <div className="flex items-center gap-1.5 mb-2">
              <group.icon className={cn('w-3.5 h-3.5 shrink-0', group.color)} />
              <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider truncate">
                {group.label}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto shrink-0">({group.items.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {group.items.map((m, i) => (
                <motion.span
                  key={m.playerId + i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className={cn('px-2 py-0.5 rounded text-[10px] font-medium', group.bg, group.color)}
                >
                  {playerMap[m.playerId] || m.playerId}
                  {m.fromCourt && m.toCourt && m.fromCourt !== m.toCourt && (
                    <span className="opacity-60 ml-1">C{m.fromCourt}<ArrowRight className="inline w-2 h-2" />C{m.toCourt}</span>
                  )}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Toggle detail */}
      <button
        onClick={() => setShowDetail(s => !s)}
        className="w-full text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
      >
        <Shuffle className="w-3 h-3" />
        {showDetail ? 'Hide' : 'Show'} partner rotation detail
      </button>

      {/* Per-court rotation cards */}
      {showDetail && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-0.5">
            Partner Rotation — Court by Court
          </p>
          {courtRotations.map(({ court, pairA, pairB }) => (
            <CourtRotationCard
              key={court.courtNumber}
              destCourt={court.courtNumber}
              numCourts={numCourts}
              pairA={pairA}
              pairB={pairB}
              teamA={court.teamA}
              teamB={court.teamB}
              playerMap={playerMap}
            />
          ))}
        </div>
      )}

      {/* Full draw preview */}
      <div className="glass rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Round {nextRound?.roundNumber} — Full Draw
        </p>
        {(nextRound?.courts || []).map(court => (
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
        {(nextRound?.bench?.length > 0) && (
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
            Bench: {nextRound.bench.map(id => playerMap[id] || id).join(', ')}
          </p>
        )}
      </div>

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