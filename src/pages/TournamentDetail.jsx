import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Users, Calendar, MapPin, Plus, Shuffle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import GlassCard from '@/components/shared/GlassCard';
import MatchScorer from '@/components/matches/MatchScorer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TournamentDetail() {
  const tournamentId = window.location.pathname.split('/tournaments/')[1];
  const queryClient = useQueryClient();
  const [addPlayersOpen, setAddPlayersOpen] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: async () => {
      const results = await base44.entities.Tournament.filter({ id: tournamentId });
      return results[0];
    },
    enabled: !!tournamentId
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('-skill_rating', 200)
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['tournament-matches', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      return base44.entities.Match.filter({ tournament_id: tournamentId }, '-created_date', 100);
    },
    enabled: !!tournamentId
  });

  if (isLoading || !tournament) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const registeredPlayers = allPlayers.filter(p => tournament.player_ids?.includes(p.id));
  const availablePlayers = allPlayers.filter(p => !tournament.player_ids?.includes(p.id));

  const addPlayers = async () => {
    const newIds = [...(tournament.player_ids || []), ...selectedPlayerIds];
    await base44.entities.Tournament.update(tournament.id, { player_ids: newIds });
    toast.success(`${selectedPlayerIds.length} players added`);
    setSelectedPlayerIds([]);
    setAddPlayersOpen(false);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
  };

  const generateFixtures = async () => {
    const players = registeredPlayers;
    if (players.length < 2) { toast.error('Need at least 2 players'); return; }

    const newMatches = [];
    if (tournament.format === 'Round Robin') {
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          newMatches.push({
            tournament_id: tournament.id,
            team1_player_ids: [players[i].id],
            team2_player_ids: [players[j].id],
            team1_names: players[i].full_name,
            team2_names: players[j].full_name,
            status: 'Scheduled',
            round: 1,
            scores: []
          });
        }
      }
    } else {
      // Simple bracket for elimination
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length - 1; i += 2) {
        newMatches.push({
          tournament_id: tournament.id,
          team1_player_ids: [shuffled[i].id],
          team2_player_ids: [shuffled[i + 1].id],
          team1_names: shuffled[i].full_name,
          team2_names: shuffled[i + 1].full_name,
          status: 'Scheduled',
          round: 1,
          match_number: Math.floor(i / 2) + 1,
          scores: []
        });
      }
    }

    await base44.entities.Match.bulkCreate(newMatches);
    await base44.entities.Tournament.update(tournament.id, { status: 'In Progress' });
    toast.success(`${newMatches.length} matches generated!`);
    queryClient.invalidateQueries({ queryKey: ['tournament-matches', tournamentId] });
    queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
  };

  const updateStatus = async (status) => {
    await base44.entities.Tournament.update(tournament.id, { status });
    queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
    toast.success(`Tournament status: ${status}`);
  };

  return (
    <div className="space-y-6">
      <Link to="/tournaments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tournaments
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 glow-blue">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{tournament.name}</h1>
              <Badge className={cn("text-xs", tournament.status === 'In Progress' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground')}>{tournament.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {tournament.format}</span>
              {tournament.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(tournament.start_date), 'MMM d, yyyy')}</span>}
              {tournament.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {tournament.location}</span>}
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {registeredPlayers.length} players</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setAddPlayersOpen(true)}><Plus className="w-3 h-3 mr-1" /> Add Players</Button>
            {registeredPlayers.length >= 2 && matches.length === 0 && (
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={generateFixtures}>
                <Shuffle className="w-3 h-3 mr-1" /> Generate Fixtures
              </Button>
            )}
            {tournament.status === 'Draft' && (
              <Button size="sm" variant="outline" onClick={() => updateStatus('Registration Open')}>
                <Play className="w-3 h-3 mr-1" /> Open Registration
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Registered Players */}
        <GlassCard delay={0.1}>
          <h3 className="text-sm font-semibold text-foreground mb-3">Registered Players ({registeredPlayers.length})</h3>
          <div className="space-y-2 max-h-80 overflow-auto">
            {registeredPlayers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No players registered</p>}
            {registeredPlayers.map(p => (
              <Link key={p.id} to={`/players/${p.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{(p.full_name || 'P')[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{p.full_name}</p>
                </div>
                <span className="text-xs font-mono text-primary">{(p.skill_rating || 3.0).toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </GlassCard>

        {/* Matches */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Matches ({matches.length})</h3>
          {matches.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-xs text-muted-foreground">No matches yet. Add players and generate fixtures to begin.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {matches.map(m => (
                <MatchScorer
                  key={m.id}
                  match={m}
                  onUpdate={() => {
                    queryClient.invalidateQueries({ queryKey: ['tournament-matches', tournamentId] });
                    queryClient.invalidateQueries({ queryKey: ['matches'] });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Players Dialog */}
      <Dialog open={addPlayersOpen} onOpenChange={setAddPlayersOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Players</DialogTitle>
            <DialogDescription className="text-muted-foreground">Select players to register</DialogDescription>
          </DialogHeader>
          <div className="max-h-64 overflow-auto space-y-1">
            {availablePlayers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">All players registered</p>}
            {availablePlayers.map(p => (
              <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPlayerIds.includes(p.id)}
                  onChange={e => {
                    setSelectedPlayerIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id));
                  }}
                  className="rounded"
                />
                <span className="text-sm text-foreground">{p.full_name}</span>
                <span className="text-xs font-mono text-primary ml-auto">{(p.skill_rating || 3.0).toFixed(1)}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddPlayersOpen(false)}>Cancel</Button>
            <Button onClick={addPlayers} disabled={selectedPlayerIds.length === 0} className="bg-primary text-primary-foreground">
              Add {selectedPlayerIds.length} Players
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}