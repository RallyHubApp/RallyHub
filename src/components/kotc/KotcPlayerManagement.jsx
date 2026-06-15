import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, RefreshCw, UserMinus, UserRoundPlus } from 'lucide-react';

export default function KotcPlayerManagement({ tournament, players, allPlayers, queryClient }) {
  const [mode, setMode] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [replaceFrom, setReplaceFrom] = useState('');
  const [replaceTo, setReplaceTo] = useState('');
  const [newName, setNewName] = useState('');
  const availablePlayers = allPlayers.filter(p => !tournament.player_ids?.includes(p.id));

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    queryClient.invalidateQueries({ queryKey: ['players'] });
  };

  const close = () => { setMode(null); setSelectedIds([]); setReplaceFrom(''); setReplaceTo(''); setNewName(''); };

  const addPlayers = async () => {
    await base44.entities.Tournament.update(tournament.id, { player_ids: [...new Set([...(tournament.player_ids || []), ...selectedIds])] });
    toast.success(`${selectedIds.length} players added`);
    close(); refresh();
  };

  const removePlayers = async () => {
    await base44.entities.Tournament.update(tournament.id, {
      player_ids: (tournament.player_ids || []).filter(id => !selectedIds.includes(id)),
      kotc_player_order: (tournament.kotc_player_order || []).filter(id => !selectedIds.includes(id)),
    });
    toast.success(`${selectedIds.length} players removed`);
    close(); refresh();
  };

  const replacePlayer = async () => {
    let targetId = replaceTo;
    if (!targetId && newName.trim()) {
      const created = await base44.entities.Player.create({ full_name: newName.trim(), status: 'Active', skill_rating: 3.0 });
      targetId = created.id;
    }
    if (!replaceFrom || !targetId) return;
    await base44.entities.Tournament.update(tournament.id, {
      player_ids: (tournament.player_ids || []).map(id => id === replaceFrom ? targetId : id),
      kotc_player_order: (tournament.kotc_player_order || []).map(id => id === replaceFrom ? targetId : id),
    });
    toast.success('Player replaced');
    close(); refresh();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setMode('add')}><Plus className="w-3 h-3 mr-1" /> Add Player</Button>
        <Button variant="outline" size="sm" onClick={() => setMode('remove')}><UserMinus className="w-3 h-3 mr-1" /> Remove Player</Button>
        <Button variant="outline" size="sm" onClick={() => setMode('replace')}><RefreshCw className="w-3 h-3 mr-1" /> Replace Player</Button>
      </div>

      <Dialog open={!!mode} onOpenChange={open => !open && close()}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{mode === 'add' ? 'Add Player' : mode === 'remove' ? 'Remove Player' : 'Replace Player'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Manage the roster before Round 1 starts.</DialogDescription>
          </DialogHeader>

          {mode === 'add' && <Picker players={availablePlayers} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />}
          {mode === 'remove' && <Picker players={players} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />}
          {mode === 'replace' && (
            <div className="space-y-3">
              <select className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm" value={replaceFrom} onChange={e => setReplaceFrom(e.target.value)}>
                <option value="">Pick player to replace</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
              <select className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm" value={replaceTo} onChange={e => setReplaceTo(e.target.value)}>
                <option value="">Pick replacement from directory</option>
                {availablePlayers.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-px bg-border flex-1" />or create new<span className="h-px bg-border flex-1" /></div>
              <Input placeholder="New player name" value={newName} onChange={e => setNewName(e.target.value)} className="bg-secondary border-border" />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={close}>Cancel</Button>
            {mode === 'add' && <Button onClick={addPlayers} disabled={!selectedIds.length} className="bg-primary text-primary-foreground">Add</Button>}
            {mode === 'remove' && <Button onClick={removePlayers} disabled={!selectedIds.length} className="bg-destructive text-destructive-foreground">Remove</Button>}
            {mode === 'replace' && <Button onClick={replacePlayer} disabled={!replaceFrom || (!replaceTo && !newName.trim())} className="bg-primary text-primary-foreground"><UserRoundPlus className="w-4 h-4 mr-1" /> Replace</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Picker({ players, selectedIds, setSelectedIds }) {
  return (
    <div className="max-h-72 overflow-auto space-y-1">
      {players.map(p => (
        <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer">
          <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))} />
          <span className="text-sm text-foreground flex-1">{p.full_name}</span>
          <span className="text-xs font-mono text-primary">{(p.skill_rating || 3).toFixed(1)}</span>
        </label>
      ))}
      {players.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No available players</p>}
    </div>
  );
}