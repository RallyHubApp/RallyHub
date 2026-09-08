import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Users, Download, UserPlus, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import GlassCard from '@/components/shared/GlassCard';
import KotcV2SessionView from './KotcV2SessionView';
import SpondImportModal from '@/components/spond/SpondImportModal';
import SpondXlsxImportModal from '@/components/spond/SpondXlsxImportModal';
import PlayerRegisterModal from '@/components/registration/PlayerRegisterModal';
import useKotcRole from '@/hooks/useKotcRole';
import KotcPlayerManagement from './KotcPlayerManagement';

export default function KotcView({ tournament, players, allPlayers, queryClient }) {
  const [addPlayersOpen, setAddPlayersOpen] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [spondOpen, setSpondOpen] = useState(false);
  const [xlsxOpen, setXlsxOpen] = useState(false);
  const [selfRegisterOpen, setSelfRegisterOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const { canManagePlayers } = useKotcRole();
  const { data: kotcState } = useQuery({
    queryKey: ['kotc-shell-state', tournament.id],
    queryFn: async () => (await base44.functions.invoke('getKotcV2State', { tournamentId: tournament.id })).data,
    refetchInterval: 3000,
  });
  const hasSession = !!kotcState?.session;

  const isStarted = hasSession || tournament.status === 'Completed';
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
    <div id="kotc-start-section" className="space-y-4">
      <GlassCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">King of the Court V2</p>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-1">{tournament.name}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {tournament.start_date ? new Date(`${String(tournament.start_date).slice(0,10)}T12:00:00`).toLocaleDateString('en-IE', { weekday:'short', day:'numeric', month:'short' }) : 'Session'}
              {tournament.location ? ` · ${tournament.location}` : ''}
            </p>
          </div>
          {hasSession && <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">CURRENT SESSION</span>}
        </div>
      </GlassCard>

      {/* Pre-session roster: keep the normal path short. Spond refresh is the primary action;
          manual/XLSX tools and the player list are available only when explicitly opened. */}
      {!isStarted && (
        <GlassCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Session Roster · {players.length} players</h3>
              <p className="text-xs text-muted-foreground mt-1">Refresh from Spond immediately before setup to capture late changes.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {canManagePlayers ? <Button size="sm" onClick={() => setSpondOpen(true)}>
                <Download className="w-3 h-3 mr-1" /> Refresh from Spond
              </Button> : <Button size="sm" className="bg-primary text-primary-foreground gap-1" onClick={() => setSelfRegisterOpen(true)}>
                <UserPlus className="w-3 h-3" /> Register to Play
              </Button>}
              {canManagePlayers && <Button variant="outline" size="sm" onClick={() => setRosterOpen(v => !v)}>
                {rosterOpen ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                Roster tools
              </Button>}
            </div>
          </div>

          {rosterOpen && canManagePlayers && <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setXlsxOpen(true)}><FileSpreadsheet className="w-3 h-3 mr-1" />Import Spond XLSX</Button>
              <Button variant="outline" size="sm" onClick={() => setAddPlayersOpen(true)}><UserPlus className="w-3 h-3 mr-1" />Add Player</Button>
              <KotcPlayerManagement tournament={tournament} players={players} allPlayers={allPlayers} queryClient={queryClient} />
            </div>
            {players.length === 0 ? <div className="text-center py-4"><Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2"/><p className="text-xs text-muted-foreground">No players on this session roster yet.</p></div> : <div className="grid sm:grid-cols-2 gap-1 max-h-64 overflow-auto">
              {players.map((p, i) => <div key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-secondary/30"><span className="text-[10px] font-bold text-muted-foreground w-5">{i + 1}</span><span className="text-xs font-medium flex-1 truncate">{p.full_name}</span>{p.dupr_rating != null && <span className="text-[10px] font-mono text-primary">DUPR {Number(p.dupr_rating).toFixed(2)}</span>}</div>)}
            </div>}
          </div>}
        </GlassCard>
      )}

      {/* KOTC V2 setup + live host view. Sporting state is server-authoritative. */}
      <KotcV2SessionView tournament={tournament} players={players} queryClient={queryClient} />

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