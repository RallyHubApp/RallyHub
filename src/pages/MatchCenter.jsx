import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Swords, Clock, CheckCircle2, Calendar, Crown, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import MatchScorer from '@/components/matches/MatchScorer';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function KotcRoundCard({ round, results, playerMap }) {
  const [expanded, setExpanded] = useState(true);
  const roundResults = results?.[round.roundNumber] || {};
  const hasResults = Object.keys(roundResults).length > 0;

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-foreground">Round {round.roundNumber}</span>
          {!hasResults && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">No results yet</Badge>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {round.courts.map(court => {
            const result = roundResults[court.courtNumber];
            const teamANames = court.teamA.map(id => playerMap[id] || id).join(' & ');
            const teamBNames = court.teamB.map(id => playerMap[id] || id).join(' & ');
            const aWon = result === 'A';
            const bWon = result === 'B';

            return (
              <div key={court.courtNumber} className="rounded-lg bg-secondary/50 p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Court {court.courtNumber}
                </p>
                <div className="flex items-center gap-2">
                  {/* Team A */}
                  <div className={cn(
                    'flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                    result
                      ? aWon ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                      : 'bg-secondary text-foreground'
                  )}>
                    <div className="flex items-center gap-1.5">
                      {aWon && <Trophy className="w-3 h-3 shrink-0" />}
                      <span>{teamANames}</span>
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground font-bold shrink-0">vs</span>

                  {/* Team B */}
                  <div className={cn(
                    'flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                    result
                      ? bWon ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                      : 'bg-secondary text-foreground'
                  )}>
                    <div className="flex items-center gap-1.5">
                      {bWon && <Trophy className="w-3 h-3 shrink-0" />}
                      <span>{teamBNames}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {round.bench?.length > 0 && (
            <p className="text-[10px] text-muted-foreground pt-1">
              Sitting out: {round.bench.map(id => playerMap[id] || id).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function KotcTournamentSection({ tournament, players }) {
  const [expanded, setExpanded] = useState(true);

  let kotcState = null;
  try { kotcState = tournament.kotc_state ? JSON.parse(tournament.kotc_state) : null; } catch {}
  if (!kotcState || !kotcState.rounds?.length) return null;

  const playerMap = {};
  (players || []).forEach(p => { playerMap[p.id] = p.full_name; });
  // Also use names from kotcState.players if available
  (kotcState.players || []).forEach(p => { if (!playerMap[p.id]) playerMap[p.id] = p.name; });

  const completedRounds = kotcState.rounds.filter(r => kotcState.results?.[r.roundNumber]);
  const allRounds = kotcState.rounds;

  return (
    <div className="space-y-3">
      <button
        className="w-full flex items-center justify-between p-3 glass rounded-xl hover:bg-secondary/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-foreground">{tournament.name}</span>
          <Badge className="text-[10px] bg-yellow-400/20 text-yellow-400">King of the Court</Badge>
          <span className="text-xs text-muted-foreground">{completedRounds.length}/{allRounds.length} rounds</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="space-y-2 pl-2">
          {allRounds.map(round => (
            <KotcRoundCard
              key={round.roundNumber}
              round={round}
              results={kotcState.results}
              playerMap={playerMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MatchCenter() {
  const queryClient = useQueryClient();

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-created_date', 100)
  });

  const { data: kotcTournaments = [] } = useQuery({
    queryKey: ['kotc-tournaments'],
    queryFn: () => base44.entities.Tournament.filter({ format: 'King of the Court' }, '-updated_date', 20)
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('-created_date', 200)
  });

  const liveMatches = matches.filter(m => m.status === 'In Progress');
  const scheduledMatches = matches.filter(m => m.status === 'Scheduled');
  const completedMatches = matches.filter(m => m.status === 'Completed');

  const kotcWithData = kotcTournaments.filter(t => {
    try { const s = t.kotc_state ? JSON.parse(t.kotc_state) : null; return s?.rounds?.length > 0; } catch { return false; }
  });

  const refreshMatches = () => queryClient.invalidateQueries({ queryKey: ['matches'] });

  return (
    <div className="space-y-6">
      <PageHeader title="Match Center" description="Live scoring and match management">
        <Badge className="bg-primary/20 text-primary text-xs">
          <Clock className="w-3 h-3 mr-1" /> {liveMatches.length} live
        </Badge>
      </PageHeader>

      <Tabs defaultValue="live">
        <TabsList className="bg-secondary flex-wrap h-auto gap-1">
          <TabsTrigger value="live" className="gap-1.5 text-xs">
            <Clock className="w-3 h-3" /> Live ({liveMatches.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-1.5 text-xs">
            <Calendar className="w-3 h-3" /> Scheduled ({scheduledMatches.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5 text-xs">
            <CheckCircle2 className="w-3 h-3" /> Completed ({completedMatches.length})
          </TabsTrigger>
          <TabsTrigger value="kotc" className="gap-1.5 text-xs">
            <Crown className="w-3 h-3" /> King of the Court {kotcWithData.length > 0 && `(${kotcWithData.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          {liveMatches.length === 0 ? (
            <EmptyState icon={Swords} title="No live matches" description="Start scoring a match from a tournament" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMatches.map(m => (
                <MatchScorer key={m.id} match={m} onUpdate={refreshMatches} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          {scheduledMatches.length === 0 ? (
            <EmptyState icon={Calendar} title="No scheduled matches" description="Generate fixtures from a tournament" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledMatches.map(m => (
                <MatchScorer key={m.id} match={m} onUpdate={refreshMatches} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedMatches.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No completed matches" description="Completed matches will appear here" />
          ) : (
            <div className="space-y-2">
              {completedMatches.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-lg p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.team1_names} <span className="text-muted-foreground">vs</span> {m.team2_names}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {m.scores?.map(s => `${s.team1}-${s.team2}`).join(', ')}
                    </p>
                  </div>
                  <Badge className="bg-primary/20 text-primary text-xs">
                    {m.winner_team === 'team1' ? m.team1_names : m.team2_names} won
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kotc" className="mt-4">
          {kotcWithData.length === 0 ? (
            <EmptyState icon={Crown} title="No King of the Court tournaments" description="Start a King of the Court tournament to see rounds here" />
          ) : (
            <div className="space-y-4">
              {kotcWithData.map(t => (
                <KotcTournamentSection key={t.id} tournament={t} players={allPlayers} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}