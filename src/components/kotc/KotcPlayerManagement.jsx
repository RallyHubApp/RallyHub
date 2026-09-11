import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { RefreshCw, UserMinus, UserRoundPlus } from 'lucide-react';

export default function KotcPlayerManagement({ tournament, players, allPlayers, queryClient }) {
  const [mode, setMode] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [replaceFrom, setReplaceFrom] = useState('');
  const [replaceTo, setReplaceTo] = useState('');
  const [replaceSearch, setReplaceSearch] = useState('');
  const [newName, setNewName] = useState('');
  const availablePlayers = [...allPlayers]
    .filter(p => !tournament.player_ids?.includes(p.id))
    .sort((a,b) => String(a.full_name || '').localeCompare(String(b.full_name || ''), 'en', { sensitivity:'base' }));
  const replacementMatches = replaceSearch.trim()
    ? availablePlayers.filter(p => String(p.full_name || '').toLowerCase().includes(replaceSearch.trim().toLowerCase()))
    : availablePlayers;
  const guestRoster = tournament.kotc_guest_roster || [];
  const guestIds = new Set(guestRoster.map(g => g.guest_id));

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    queryClient.invalidateQueries({ queryKey: ['players'] });
  };

  const close = () => { setMode(null); setSelectedIds([]); setReplaceFrom(''); setReplaceTo(''); setReplaceSearch(''); setNewName(''); };

  const removePlayers = async () => {
    await base44.entities.Tournament.update(tournament.id, {
      player_ids: (tournament.player_ids || []).filter(id => !selectedIds.includes(id)),
      kotc_guest_roster: guestRoster.filter(g => !selectedIds.includes(g.guest_id)),
      kotc_player_order: (tournament.kotc_player_order || []).filter(id => !selectedIds.includes(id)),
    });
    toast.success(`${selectedIds.length} players removed`);
    close(); refresh();
  };

  const addGuest = async () => {
    const name = newName.trim();
    if (!name) return;
    const norm = name.toLowerCase().replace(/\s+/g, ' ');
    const existingMember = allPlayers.find(p => String(p.full_name || '').trim().toLowerCase().replace(/\s+/g, ' ') === norm);
    const existingGuest = guestRoster.find(g => String(g.display_name || '').trim().toLowerCase().replace(/\s+/g, ' ') === norm);
    if (existingMember) return toast.error(`${existingMember.full_name} already exists in the member/player directory. Add that player instead.`);
    if (existingGuest) return toast.error(`${existingGuest.display_name} is already on this guest roster.`);
    const guest = { guest_id: `guest_${crypto.randomUUID().replaceAll('-', '')}`, display_name: name, added_at: new Date().toISOString() };
    await base44.entities.Tournament.update(tournament.id, { kotc_guest_roster: [...guestRoster, guest], kotc_player_order: [] });
    toast.success(`${name} added as a one-off guest`);
    close(); refresh();
  };

  const replacePlayer = async () => {
    if (!replaceFrom || (!replaceTo && !newName.trim())) return;
    let memberIds = [...(tournament.player_ids || [])].filter(id => id !== replaceFrom);
    let guests = guestRoster.filter(g => g.guest_id !== replaceFrom);
    if (replaceTo) {
      if (!memberIds.includes(replaceTo)) memberIds.push(replaceTo);
    } else {
      const name = newName.trim();
      const norm = name.toLowerCase().replace(/\s+/g, ' ');
      const duplicate = allPlayers.find(p => String(p.full_name || '').trim().toLowerCase().replace(/\s+/g, ' ') === norm);
      if (duplicate) return toast.error(`A player named ${duplicate.full_name} already exists. Choose them from the directory instead of adding a guest.`);
      if (guests.some(g => String(g.display_name || '').trim().toLowerCase().replace(/\s+/g, ' ') === norm)) return toast.error(`${name} is already on this guest roster.`);
      guests.push({ guest_id: `guest_${crypto.randomUUID().replaceAll('-', '')}`, display_name: name, added_at: new Date().toISOString() });
    }
    await base44.entities.Tournament.update(tournament.id, { player_ids: memberIds, kotc_guest_roster: guests, kotc_player_order: [] });
    toast.success('Player replaced');
    close(); refresh();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setMode('guest')}><UserRoundPlus className="w-3 h-3 mr-1" /> Add Guest</Button>
        <Button variant="outline" size="sm" onClick={() => setMode('remove')}><UserMinus className="w-3 h-3 mr-1" /> Remove Player</Button>
        <Button variant="outline" size="sm" onClick={() => setMode('replace')}><RefreshCw className="w-3 h-3 mr-1" /> Replace Player</Button>
      </div>

      <Dialog open={!!mode} onOpenChange={open => !open && close()}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{mode === 'remove' ? 'Remove Player' : mode === 'guest' ? 'Add One-off Guest' : 'Replace Player'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Guests exist only in this KOTC event and never become club members or permanent Player records.</DialogDescription>
          </DialogHeader>

          {mode === 'remove' && <Picker players={players} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />}
          {mode === 'guest' && <Input placeholder="Guest player name" value={newName} onChange={e => setNewName(e.target.value)} className="bg-secondary border-border" />}
          {mode === 'replace' && (
            <div className="space-y-3">
              <select className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm" value={replaceFrom} onChange={e => setReplaceFrom(e.target.value)}>
                <option value="">Pick player to replace</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
              <Input data-testid="kotc-replacement-search" placeholder="Search replacement by name…" value={replaceSearch} onChange={e => setReplaceSearch(e.target.value)} className="bg-secondary border-border" />
              <select className="w-full h-10 rounded-md bg-secondary border border-border px-3 text-sm" value={replaceTo} onChange={e => setReplaceTo(e.target.value)}>
                <option value="">Pick replacement from active directory</option>
                {replacementMatches.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
              <p className="text-[10px] text-muted-foreground">Alphabetical local search — typing does not call Base44.</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-px bg-border flex-1" />or add a genuine one-off guest<span className="h-px bg-border flex-1" /></div>
              <Input placeholder="Guest / One-off Player name" value={newName} onChange={e => setNewName(e.target.value)} className="bg-secondary border-border" />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={close}>Cancel</Button>
            {mode === 'remove' && <Button onClick={removePlayers} disabled={!selectedIds.length} className="bg-destructive text-destructive-foreground">Remove</Button>}
            {mode === 'guest' && <Button onClick={addGuest} disabled={!newName.trim()} className="bg-primary text-primary-foreground"><UserRoundPlus className="w-4 h-4 mr-1" /> Add Guest</Button>}
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
        </label>
      ))}
      {players.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No available players</p>}
    </div>
  );
}