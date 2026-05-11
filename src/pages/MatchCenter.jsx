import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Swords, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import MatchScorer from '@/components/matches/MatchScorer';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function MatchCenter() {
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-created_date', 100)
  });

  const liveMatches = matches.filter(m => m.status === 'In Progress');
  const scheduledMatches = matches.filter(m => m.status === 'Scheduled');
  const completedMatches = matches.filter(m => m.status === 'Completed');

  const refreshMatches = () => queryClient.invalidateQueries({ queryKey: ['matches'] });

  return (
    <div className="space-y-6">
      <PageHeader title="Match Center" description="Live scoring and match management">
        <Badge className="bg-primary/20 text-primary text-xs">
          <Clock className="w-3 h-3 mr-1" /> {liveMatches.length} live
        </Badge>
      </PageHeader>

      <Tabs defaultValue="live">
        <TabsList className="bg-secondary">
          <TabsTrigger value="live" className="gap-1.5">
            <Clock className="w-3 h-3" /> Live ({liveMatches.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-1.5">
            <Calendar className="w-3 h-3" /> Scheduled ({scheduledMatches.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> Completed ({completedMatches.length})
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
      </Tabs>
    </div>
  );
}