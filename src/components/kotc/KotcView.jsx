import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Download, Link2, UserPlus, FileSpreadsheet, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import GlassCard from '@/components/shared/GlassCard';
import KotcSetup from './KotcSetup';
import KotcRoundView from './KotcRoundView';
import SpondImportModal from '@/components/spond/SpondImportModal';
import SpondXlsxImportModal from '@/components/spond/SpondXlsxImportModal';
import PlayerRegisterModal from '@/components/registration/PlayerRegisterModal';

export default function KotcView({ tournament, players, allPlayers, queryClient }) {
  const [addPlayersOpen, setAddPlayersOpen] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [spondOpen, setSpondOpen] = useState(false);
  const [xlsxOpen, setXlsxOpen] = useState(false);
  const [selfRegisterOpen, setSelfRegisterOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleShareLink = () => {
    // Build a clean public URL without any sandbox/preview prefixes
    const publicUrl = `https://${window.location.hostname.replace(/^[^.]+\./, '')}/t/${tournament.id}`;
    const url = publicUrl.includes('localhost') ? `${window.location.origin}/t/${tournament.id}` : publicUrl;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => prompt('Copy this link:', url));
  };

  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin')).catch(() => {});
  }, []);

  const isStarted = tournament.status === 'In Progress' || tournament.status === 'Completed';
  const availablePlayers = allPlayers.filter(p => !tournament.player_ids?.includes(p.id));

  const addPlayers = async () => {
    const newIds = [...(tournament.player_ids || []), ...selectedPlayerIds];
    await base44.entities.Tournament.update(tournament.id, { player_ids: newIds });
    toast.success(`${selectedPlayerIds.length} players added`);
    setSelectedPlayerIds([]);
    setAddPlayersOpen(false);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    queryClient.invalidateQueries({ queryKey: ['players'] });
  };

  return (
    <div id="kotc-start-section" className="space-y-6">
      {/* Player management */}
      {!isStarted && (
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Players ({players.length})</h3>
            <div className="flex gap-2 flex-wrap">
              {isAdmin ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleShareLink}
                    className={linkCopied ? 'text-primary border-primary/40' : ''}>
                    {linkCopied ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Link2 className="w-3 h-3 mr-1" /> Share Link</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSpondOpen(true)}>
                    <Download className="w-3 h-3 mr-1" /> Import Spond
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setXlsxOpen(true)}>
                    <FileSpreadsheet className="w-3 h-3 mr-1" /> Import XLSX
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAddPlayersOpen(true)}>
                    <Plus className="w-3 h-3 mr-1" /> Add Players
                  </Button>
                </>
              ) : (
                <Button size="sm" className="bg-primary text-primary-foreground gap-1" onClick={() => setSelfRegisterOpen(true)}>
                  <UserPlus className="w-3 h-3" /> Register to Play
                </Button>
              )}
            </div>
          </div>
          {players.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-xs text-muted-foreground">No players registered yet</p>
              <Button size="sm" onClick={() => setAddPlayersOpen(true)} className="bg-primary text-primary-foreground">Add Players</Button>
            </div>
          ) : (
            <div className="space-y-1">
              {players.map((p, i) => (
                <Link key={p.id} to={`/players/${p.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors group">
                  <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {(p.full_name || 'P')[0]}
                  </div>
                  <span className="text-xs font-medium text-foreground flex-1 group-hover:text-primary transition-colors">{p.full_name}</span>
                  <span className="text-xs font-mono text-primary">{(p.skill_rating || 3.0).toFixed(1)}</span>
                </Link>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Setup or live view */}
      {isStarted ? (
        <KotcRoundView tournament={tournament} players={players} queryClient={queryClient} />
      ) : (
        <KotcSetup tournament={tournament} players={players} onStarted={() => {}} queryClient={queryClient} />
      )}

      {/* Self-register modal */}
      <PlayerRegisterModal
        open={selfRegisterOpen}
        onOpenChange={setSelfRegisterOpen}
        tournament={tournament}
        onRegistered={() => {
          queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
          queryClient.invalidateQueries({ queryKey: ['players'] });
        }}
      />

      {/* Spond XLSX Import Modal */}
      <SpondXlsxImportModal
        open={xlsxOpen}
        onOpenChange={setXlsxOpen}
        tournament={tournament}
        onImported={() => {
          setXlsxOpen(false);
          queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
          queryClient.invalidateQueries({ queryKey: ['players'] });
        }}
      />

      {/* Spond Import Modal */}
      <SpondImportModal
        open={spondOpen}
        onOpenChange={setSpondOpen}
        tournament={tournament}
        onImported={() => {
          queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
          queryClient.invalidateQueries({ queryKey: ['players'] });
        }}
      />

      {/* Add Players Dialog */}
      <Dialog open={addPlayersOpen} onOpenChange={setAddPlayersOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Players</DialogTitle>
            <DialogDescription className="text-muted-foreground">Select players to register for King of the Court</DialogDescription>
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
    </div>
  );
}