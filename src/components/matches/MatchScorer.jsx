import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function MatchScorer({ match, onUpdate }) {
  const scores = (match.scores && match.scores.length > 0) ? match.scores : [{ team1: 0, team2: 0 }];
  const [localScores, setLocalScores] = useState(scores);
  const currentGame = localScores.length - 1;

  const updateScore = async (team, delta) => {
    const updated = [...localScores];
    const newVal = Math.max(0, (updated[currentGame][team] || 0) + delta);
    updated[currentGame] = { ...updated[currentGame], [team]: newVal };
    setLocalScores(updated);

    await base44.entities.Match.update(match.id, {
      scores: updated,
      status: 'In Progress'
    });
    onUpdate?.();
  };

  const addGame = () => {
    setLocalScores([...localScores, { team1: 0, team2: 0 }]);
  };

  const completeMatch = async () => {
    let team1Wins = 0, team2Wins = 0;
    localScores.forEach(g => {
      if (g.team1 > g.team2) team1Wins++;
      else if (g.team2 > g.team1) team2Wins++;
    });
    const winner = team1Wins >= team2Wins ? 'team1' : 'team2';

    await base44.entities.Match.update(match.id, {
      scores: localScores,
      winner_team: winner,
      status: 'Completed'
    });
    toast.success('Match completed!');
    onUpdate?.();
  };

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Badge className={cn(
          "text-xs",
          match.status === 'In Progress' ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"
        )}>
          <Clock className="w-3 h-3 mr-1" />
          {match.status}
        </Badge>
        {match.court && <span className="text-xs text-muted-foreground">Court {match.court}</span>}
      </div>

      {/* Teams */}
      <div className="space-y-3">
        {['team1', 'team2'].map((team, ti) => (
          <div key={team} className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {team === 'team1' ? match.team1_names : match.team2_names || `Team ${ti + 1}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost" size="icon"
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
                onClick={() => updateScore(team, -1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-xl font-bold font-mono text-foreground w-8 text-center">
                {localScores[currentGame]?.[team] || 0}
              </span>
              <Button
                variant="ghost" size="icon"
                className="w-7 h-7 text-muted-foreground hover:text-primary"
                onClick={() => updateScore(team, 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Game scores */}
      {localScores.length > 1 && (
        <div className="flex gap-2">
          {localScores.map((g, i) => (
            <div key={i} className="text-xs text-muted-foreground bg-secondary rounded px-2 py-1">
              G{i + 1}: {g.team1}-{g.team2}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addGame} className="flex-1">
          <Plus className="w-3 h-3 mr-1" /> New Game
        </Button>
        <Button size="sm" onClick={completeMatch} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
        </Button>
      </div>
    </div>
  );
}