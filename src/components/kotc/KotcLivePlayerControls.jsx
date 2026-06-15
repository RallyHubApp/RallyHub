import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, RefreshCw, RotateCcw, UserMinus } from 'lucide-react';

export default function KotcLivePlayerControls({ players, allPlayers, activePlayerIds, canUndo, onReplace, onRemove, onAddLate, onUndo }) {
  const [mode, setMode] = useState(null);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const activePlayers = players.filter(p => activePlayerIds.includes(p.id));
  const availablePlayers = allPlayers.filter(p => !players.some(current => current.id === p.id));

  const close = () => { setMode(null); setFromId(''); setToId(''); };

  const confirm = async () => {
    if (mode === 'replace') await onReplace(fromId, toId);
    if (mode === 'remove') await onRemove(fromId);
    if (mode === 'add') await onAddLate(toId);
    close();
  };

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live player management</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setMode('replace')}><RefreshCw className="w-3 h-3 mr-1" /> Replace Player</Button>
        <Button variant="outline" size="sm" onClick={() => setMode('remove')}><UserMinus className="w-3 h-3 mr-1" /> Remove No-show</Button>
        <Button variant="outline" size="sm" onClick={() => setMode('add')}><Plus className="w-3 h-3 mr-1" /> Add Late Player</Button>
        <Button variant="ghost" size="sm" disabled={!canUndo} onClick={onUndo}><RotateCcw className="w-3 h-3 mr-1" /> Undo Last Change</Button>
      </div>

      <Dialog open={!!mode} onOpenChange={open => !open && close()}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{mode === 'replace' ? 'Replace Player' : mode === 'remove' ? 'Remove No-show' : 'Add Late Player'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">This updates the live session without redrawing completed history.</DialogDescription>
          </DialogHeader>
          {(mode === 'replace' || mode === 'remove') && (
            <select className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm" value={fromId} onChange={e => setFromId(e.target.value)}>
              <option value="">Select current player</option>
              {activePlayers.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          )}
          {(mode === 'replace' || mode === 'add') && (
            <select className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm" value={toId} onChange={e => setToId(e.target.value)}>
              <option value="">Select replacement / late player</option>
              {availablePlayers.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground" disabled={(mode !== 'add' && !fromId) || (mode !== 'remove' && !toId)} onClick={confirm}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}