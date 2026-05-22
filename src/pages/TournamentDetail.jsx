import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Users, Calendar, MapPin, Plus,
  Trophy, Upload, GitBranch, Swords, BarChart2, List, Flag,
  Pencil, Trash2, Link2, UserPlus, Check
} from 'lucide-react';
import PlayerRegisterModal from '@/components/registration/PlayerRegisterModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import GlassCard from '@/components/shared/GlassCard';
import MatchScorer from '@/components/matches/MatchScorer';
import BracketView from '@/components/tournaments/BracketView';
import InterClubUploadModal from '@/components/tournaments/InterClubUploadModal';
import KotcView from '@/components/kotc/KotcView';
import TournivalView from '@/components/tournival/TournivalView';
import SpondXlsxImportModal from '@/components/spond/SpondXlsxImportModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { generateDraw, buildEntries } from '@/lib/drawEngine';

const statusColors = {
  'Draft': 'bg-secondary text-secondary-foreground',
  'Registration Open': 'bg-accent/20 text-accent',
  'In Progress': 'bg-primary/20 text-primary',
  'Completed': 'bg-muted text-muted-foreground',
  'Cancelled': 'bg-destructive/20 text-destructive'
};

export default function TournamentDetail() {
  const tournamentId = window.location.pathname.split('/tournaments/')[1];
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [addPlayersOpen, setAddPlayersOpen] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [pairsUploadOpen, setPairsUploadOpen] = useState(false);
  const [xlsxOpen, setXlsxOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [selfRegisterOpen, setSelfRegisterOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [regLinkCopied, setRegLinkCopied] = useState(false);
  const [completing, setCompleting] = useState(false);

  const handleShareLink = () => {
    const url = `${window.location.origin}/tournament/${tournament?.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => prompt('Copy this link:', url));
  };

  const handleRegLink = () => {
    const url = `${window.location.origin}/register/${tournament?.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setRegLinkCopied(true);
      setTimeout(() => setRegLinkCopied(false), 2000);
    }).catch(() => prompt('Copy this link:', url));
  };

  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin')).catch(() => {});
  }, []);

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
      return base44.entities.Match.filter({ tournament_id: tournamentId }, 'round', 200);
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

  const isKotc = tournament.format === 'King of the Court';
  const isTournival = tournament.format === 'Tournival';
  const isFixedPartners = tournament.partnership_type === 'Fixed Partners';
  const isInterClub = tournament.inter_club;
  const registeredPlayers = allPlayers.filter(p => tournament.player_ids?.includes(p.id));
  const availablePlayers = allPlayers.filter(p => !tournament.player_ids?.includes(p.id));
  const pairs = tournament.partner_pairs || [];
  const entryCount = isFixedPartners ? pairs.length : registeredPlayers.length;

  const liveMatches = matches.filter(m => m.status === 'In Progress');
  const scheduledMatches = matches.filter(m => m.status === 'Scheduled');
  const completedMatches = matches.filter(m => m.status === 'Completed');

  // ── Club results for inter-club ──
  const clubResults = {};
  if (isInterClub) {
    matches.filter(m => m.status === 'Completed').forEach(m => {
      const c1 = m.club_team1 || 'Unknown';
      const c2 = m.club_team2 || 'Unknown';
      if (!clubResults[c1]) clubResults[c1] = { wins: 0, losses: 0 };
      if (!clubResults[c2]) clubResults[c2] = { wins: 0, losses: 0 };
      if (m.winner_team === 'team1') { clubResults[c1].wins++; clubResults[c2].losses++; }
      else if (m.winner_team === 'team2') { clubResults[c2].wins++; clubResults[c1].losses++; }
    });
  }

  // ── Add players ──
  const addPlayers = async () => {
    const newIds = [...(tournament.player_ids || []), ...selectedPlayerIds];
    await base44.entities.Tournament.update(tournament.id, { player_ids: newIds });
    toast.success(`${selectedPlayerIds.length} players added`);
    setSelectedPlayerIds([]);
    setAddPlayersOpen(false);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
    queryClient.invalidateQueries({ queryKey: ['players'] });
  };

  // ── Handle pairs from upload ──
  const handlePairsReady = async (rawPairs) => {
    // Try to match player names against the player DB, or create lightweight pair records
    const partnerPairs = rawPairs.map((pair, i) => ({
      player1_id: pair.player1_id || `ext_${i}_1`,
      player2_id: pair.player2_id || `ext_${i}_2`,
      pair_name: pair.pair_name || `${pair.player1_name} / ${pair.player2_name}`,
      club: pair.club || '',
      seed: pair.seed || null
    }));

    await base44.entities.Tournament.update(tournament.id, {
      partner_pairs: partnerPairs,
      partnership_type: 'Fixed Partners'
    });
    toast.success(`${partnerPairs.length} pairs loaded!`);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
  };

  // ── Generate draw ──
  const generateFixtures = async () => {
    const entries = buildEntries(tournament, allPlayers);
    if (entries.length < 2) {
      toast.error(isFixedPartners ? 'Upload at least 2 pairs first' : 'Add at least 2 players first');
      return;
    }
    setGenerating(true);
    const newMatches = generateDraw(tournament.format, tournament.id, entries);
    await base44.entities.Match.bulkCreate(newMatches);
    await base44.entities.Tournament.update(tournament.id, { status: 'In Progress' });
    toast.success(`${newMatches.length} matches generated (${tournament.format})!`);
    queryClient.invalidateQueries({ queryKey: ['tournament-matches', tournamentId] });
    queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
    setGenerating(false);
  };

  const refreshMatches = () => {
    queryClient.invalidateQueries({ queryKey: ['tournament-matches', tournamentId] });
    queryClient.invalidateQueries({ queryKey: ['matches'] });
  };

  const handleEdit = () => {
    setEditForm({
      name: tournament.name,
      location: tournament.location || '',
      start_date: tournament.start_date || '',
      end_date: tournament.end_date || '',
      description: tournament.description || '',
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    await base44.entities.Tournament.update(tournament.id, editForm);
    toast.success('Tournament updated');
    setEditOpen(false);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
  };

  const handleDelete = async () => {
    await base44.entities.Tournament.delete(tournament.id);
    toast.success('Tournament deleted');
    navigate('/app/tournaments');
  };

  const updateStatus = async (status) => {
    if (status === 'Completed') {
      setCompleting(true);
      try {
        const res = await base44.functions.invoke('completeTournament', { tournamentId: tournament.id });
        if (res.data?.error) {
          toast.error(res.data.error);
          return;
        }
        toast.success(`Tournament completed! ${res.data.updated} player${res.data.updated !== 1 ? 's' : ''} updated.`);
        queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
        queryClient.invalidateQueries({ queryKey: ['players'] });
        queryClient.invalidateQueries({ queryKey: ['matches'] });
        queryClient.invalidateQueries({ queryKey: ['tournament-matches', tournamentId] });
      } finally {
        setCompleting(false);
      }
    } else {
      await base44.entities.Tournament.update(tournament.id, { status });
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      toast.success(`Status: ${status}`);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/app/tournaments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tournaments
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 glow-blue">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{tournament.name}</h1>
              <Badge className={cn('text-xs', statusColors[tournament.status] || statusColors['Draft'])}>
                {tournament.status}
              </Badge>
              {isInterClub && <Badge className="text-xs bg-accent/20 text-accent"><Flag className="w-3 h-3 mr-1" />Inter-Club</Badge>}
              {isFixedPartners && <Badge className="text-xs bg-purple-500/20 text-purple-400"><Users className="w-3 h-3 mr-1" />Fixed Partners</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {tournament.format}</span>
              {tournament.partnership_type && tournament.partnership_type !== 'Singles' && (
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {tournament.partnership_type}</span>
              )}
              {tournament.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(tournament.start_date), 'MMM d, yyyy')}</span>}
              {tournament.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {tournament.location}</span>}
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {isFixedPartners ? `${pairs.length} pairs` : `${registeredPlayers.length} players`}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap shrink-0">
            {/* Self-register button — visible to everyone when registration is open */}
            {(tournament.status === 'Registration Open' || tournament.status === 'Draft') && !isAdmin && (
              <Button size="sm" className="bg-primary text-primary-foreground gap-1" onClick={() => setSelfRegisterOpen(true)}>
                <UserPlus className="w-3 h-3" /> Register to Play
              </Button>
            )}

            {isAdmin && (
              <>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeleteConfirmOpen(true)}>
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
                {/* Share links */}
                {isTournival ? (
                  <>
                    <Button variant="outline" size="sm" onClick={handleRegLink}
                      className={regLinkCopied ? 'text-primary border-primary/40' : ''}>
                      {regLinkCopied ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Link2 className="w-3 h-3 mr-1" /> Reg Link</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShareLink}
                      className={linkCopied ? 'text-accent border-accent/40' : ''}>
                      {linkCopied ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Link2 className="w-3 h-3 mr-1" /> Live View</>}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleShareLink}
                    className={linkCopied ? 'text-primary border-primary/40' : ''}>
                    {linkCopied ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Link2 className="w-3 h-3 mr-1" /> Share Link</>}
                  </Button>
                )}
              </>
            )}
            {isFixedPartners ? (
              <Button variant="outline" size="sm" onClick={() => setPairsUploadOpen(true)}>
                <Upload className="w-3 h-3 mr-1" /> Upload Pairs
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setXlsxOpen(true)}>
                  <Upload className="w-3 h-3 mr-1" /> Import XLSX
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAddPlayersOpen(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Add Players
                </Button>
              </>
            )}

            {!isKotc && entryCount >= 2 && matches.length === 0 && (
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={generateFixtures}
                disabled={generating}
              >
                {generating
                  ? <><div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-1" /> Generating…</>
                  : <><GitBranch className="w-3 h-3 mr-1" /> Generate Draw</>
                }
              </Button>
            )}
            {isKotc && tournament.status !== 'In Progress' && tournament.status !== 'Completed' && (
              <Button
                size="sm"
                className="bg-yellow-500/90 text-black hover:bg-yellow-400 gap-1"
                onClick={() => {
                  // Scroll to KotcSetup start button — trigger it programmatically via a ref or just scroll
                  document.getElementById('kotc-start-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play className="w-3 h-3" /> Start King of the Court
              </Button>
            )}

            {tournament.status === 'Draft' && (
              <Button size="sm" variant="outline" onClick={() => updateStatus('Registration Open')}>
                <Play className="w-3 h-3 mr-1" /> Open Registration
              </Button>
            )}
            {tournament.status === 'In Progress' && (
              <Button size="sm" variant="outline" onClick={() => updateStatus('Completed')} disabled={completing}>
                {completing
                  ? <><div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin mr-1" /> Completing…</>
                  : <><Trophy className="w-3 h-3 mr-1" /> Complete</>
                }
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {matches.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{completedMatches.length} of {matches.length} matches completed</span>
              <span>{liveMatches.length} live</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${matches.length > 0 ? (completedMatches.length / matches.length) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Inter-club summary */}
      {isInterClub && Object.keys(clubResults).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Flag className="w-3 h-3" /> Club Standings
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(clubResults)
              .sort((a, b) => b[1].wins - a[1].wins)
              .map(([club, r]) => (
                <div key={club} className="glass rounded-lg px-4 py-2.5 text-center min-w-[120px]">
                  <p className="text-sm font-bold text-foreground">{club}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-primary font-semibold">{r.wins}W</span>
                    {' '}-{' '}
                    <span className="text-destructive">{r.losses}L</span>
                  </p>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* ── King of the Court — dedicated view ── */}
      {isKotc && (
        <KotcView
          tournament={tournament}
          players={registeredPlayers}
          allPlayers={allPlayers}
          queryClient={queryClient}
        />
      )}

      {/* ── Tournival — dedicated view ── */}
      {isTournival && (
        <TournivalView
          tournament={tournament}
          players={registeredPlayers}
          allPlayers={allPlayers}
          queryClient={queryClient}
          isAdmin={isAdmin}
        />
      )}

      {/* Tabs — standard formats only */}
      {!isKotc && <Tabs defaultValue={matches.length > 0 ? 'draw' : 'players'}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="draw" className="gap-1.5 text-xs">
            <GitBranch className="w-3.5 h-3.5" /> Draw
          </TabsTrigger>
          <TabsTrigger value="matches" className="gap-1.5 text-xs">
            <Swords className="w-3.5 h-3.5" /> Matches
            {liveMatches.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {liveMatches.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="players" className="gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" />
            {isFixedPartners ? 'Pairs' : 'Players'} ({isFixedPartners ? pairs.length : registeredPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-1.5 text-xs">
            <BarChart2 className="w-3.5 h-3.5" /> Results
          </TabsTrigger>
        </TabsList>

        {/* ── DRAW TAB ── */}
        <TabsContent value="draw" className="mt-4">
          {matches.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center space-y-4">
              <GitBranch className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <div>
                <p className="text-foreground font-medium">Draw not yet generated</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isFixedPartners
                    ? pairs.length < 2 ? 'Upload at least 2 pairs, then click Generate Draw.' : 'Click Generate Draw to create the bracket.'
                    : registeredPlayers.length < 2 ? 'Add at least 2 players, then click Generate Draw.' : 'Click Generate Draw to create the bracket.'}
                </p>
              </div>
              {entryCount >= 2 && (
                <Button onClick={generateFixtures} disabled={generating} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <GitBranch className="w-4 h-4 mr-2" /> Generate {tournament.format} Draw
                </Button>
              )}
            </div>
          ) : (
            <div className="glass rounded-xl p-5 overflow-x-auto">
              <BracketView matches={matches} format={tournament.format} />
            </div>
          )}
        </TabsContent>

        {/* ── MATCHES TAB ── */}
        <TabsContent value="matches" className="mt-4 space-y-4">
          {liveMatches.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {liveMatches.map(m => <MatchScorer key={m.id} match={m} onUpdate={refreshMatches} />)}
              </div>
            </div>
          )}
          {scheduledMatches.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Scheduled</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scheduledMatches.map(m => <MatchScorer key={m.id} match={m} onUpdate={refreshMatches} />)}
              </div>
            </div>
          )}
          {matches.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-xs text-muted-foreground">No matches yet. Generate the draw first.</p>
            </div>
          )}
        </TabsContent>

        {/* ── PLAYERS / PAIRS TAB ── */}
        <TabsContent value="players" className="mt-4">
          <GlassCard>
            {isFixedPartners ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Partner Pairs ({pairs.length})</h3>
                  <Button variant="outline" size="sm" onClick={() => setPairsUploadOpen(true)}>
                    <Upload className="w-3 h-3 mr-1" /> Upload / Edit Pairs
                  </Button>
                </div>
                {pairs.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <Users className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs text-muted-foreground">No pairs uploaded yet</p>
                    <Button size="sm" onClick={() => setPairsUploadOpen(true)} className="bg-primary text-primary-foreground">
                      Upload Pairs Spreadsheet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-[2rem_1fr_1fr_4rem] text-xs text-muted-foreground font-medium px-2 mb-1">
                      <span>#</span><span>Pair</span><span>Club</span><span className="text-right">Seed</span>
                    </div>
                    {[...pairs]
                      .sort((a, b) => (a.seed || 999) - (b.seed || 999))
                      .map((pair, i) => {
                        const clubs = tournament.clubs_involved || [];
                        return (
                          <div key={i} className="grid grid-cols-[2rem_1fr_1fr_4rem] items-center px-2 py-2 rounded-lg hover:bg-secondary transition-colors">
                            <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                            <div>
                              <p className="text-xs font-semibold text-foreground">{pair.pair_name}</p>
                            </div>
                            <div>
                              {pair.club && (
                                <Badge className="text-[10px] bg-accent/10 text-accent">{pair.club}</Badge>
                              )}
                            </div>
                            <span className="text-xs font-mono text-primary text-right">
                              {pair.seed ? `#${pair.seed}` : '—'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Players ({registeredPlayers.length})</h3>
                  <Button variant="outline" size="sm" onClick={() => setAddPlayersOpen(true)}>
                    <Plus className="w-3 h-3 mr-1" /> Add Players
                  </Button>
                </div>
                {registeredPlayers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No players registered yet</p>
                ) : (
                  <div className="space-y-1">
                    {registeredPlayers.map((p, i) => (
                      <Link key={p.id} to={`/app/players/${p.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors group">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {(p.full_name || 'P')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">{p.full_name}</p>
                          {p.club && <p className="text-[10px] text-muted-foreground">{p.club}</p>}
                        </div>
                        <span className="text-xs font-mono text-primary">{(p.skill_rating || 3.0).toFixed(1)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </GlassCard>
        </TabsContent>

        {/* ── RESULTS TAB ── */}
        <TabsContent value="results" className="mt-4">
          {completedMatches.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center">
              <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No completed matches yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedMatches.map((m, i) => {
                const winner = m.winner_team === 'team1' ? m.team1_names : m.team2_names;
                const loser = m.winner_team === 'team1' ? m.team2_names : m.team1_names;
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="glass rounded-lg p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-primary truncate">{winner}</span>
                        <span className="text-xs text-muted-foreground">defeated</span>
                        <span className="text-sm text-muted-foreground truncate">{loser}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {m.scores?.map(s => `${s.team1}-${s.team2}`).join(', ')}
                        {m.section && m.section !== 'Main' && (
                          <span className="ml-2 opacity-60">[{m.section}]</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {m.round && <Badge variant="outline" className="text-[10px]">R{m.round}</Badge>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>}

      {/* Add Players Dialog (singles mode — standard formats only) */}
      <Dialog open={addPlayersOpen} onOpenChange={setAddPlayersOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Players</DialogTitle>
            <DialogDescription className="text-muted-foreground">Select players to register</DialogDescription>
          </DialogHeader>
          <div className="max-h-64 overflow-auto space-y-1">
            {availablePlayers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">All players are already registered</p>
            )}
            {availablePlayers.map(p => (
              <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPlayerIds.includes(p.id)}
                  onChange={e => setSelectedPlayerIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))}
                  className="rounded"
                />
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {(p.full_name || 'P')[0]}
                </div>
                <span className="text-sm text-foreground flex-1">{p.full_name}</span>
                <span className="text-xs font-mono text-primary">{(p.skill_rating || 3.0).toFixed(1)}</span>
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

      {/* XLSX Import Modal */}
      <SpondXlsxImportModal
        open={xlsxOpen}
        onOpenChange={setXlsxOpen}
        tournament={tournament}
        onImported={() => {
          setXlsxOpen(false);
          queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
          queryClient.invalidateQueries({ queryKey: ['players'] });
        }}
      />

      {/* Pairs Upload Modal */}
      <InterClubUploadModal
        open={pairsUploadOpen}
        onOpenChange={setPairsUploadOpen}
        onPairsReady={handlePairsReady}
      />

      {/* Edit Tournament Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Tournament</DialogTitle>
            <DialogDescription className="text-muted-foreground">Update tournament details</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { label: 'Name', key: 'name', type: 'text' },
              { label: 'Location', key: 'location', type: 'text' },
              { label: 'Start Date', key: 'start_date', type: 'date' },
              { label: 'End Date', key: 'end_date', type: 'date' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                <input
                  type={type}
                  value={editForm[key] || ''}
                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full h-9 rounded-md border border-input bg-secondary px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Description</label>
              <textarea
                value={editForm.description || ''}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-primary text-primary-foreground">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Self-register modal */}
      <PlayerRegisterModal
        open={selfRegisterOpen}
        onOpenChange={setSelfRegisterOpen}
        tournament={tournament}
        onRegistered={() => {
          queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
          queryClient.invalidateQueries({ queryKey: ['players'] });
        }}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Tournament?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently delete <strong className="text-foreground">{tournament?.name}</strong> and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}