import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlayerCard({ player, index = 0 }) {
  const winRate = player.matches_played > 0
    ? Math.round((player.wins / player.matches_played) * 100)
    : 0;

  const initials = (player.full_name || 'P')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={`/players/${player.id}`}
        className="glass rounded-xl p-4 flex items-center gap-4 hover:scale-[1.01] transition-all duration-200 group block"
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          {player.avatar_url ? (
            <img src={player.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-primary font-bold text-sm">{initials}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {player.full_name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {player.club && (
              <span className="text-xs text-muted-foreground truncate">{player.club}</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold font-mono text-primary">
            {(player.skill_rating || 3.0).toFixed(1)}
          </p>
          <div className="flex items-center gap-1 justify-end">
            <span className="text-xs text-muted-foreground">
              {player.wins || 0}W-{player.losses || 0}L
            </span>
            {winRate > 50 ? (
              <TrendingUp className="w-3 h-3 text-primary" />
            ) : winRate > 0 ? (
              <TrendingDown className="w-3 h-3 text-destructive" />
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}