import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ArrowRight, GripVertical, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function PlayerRow({ player, index, checked, onToggle, disabled }) {
  return (
    <Draggable draggableId={player.id} index={index} isDragDisabled={disabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'flex items-center gap-3 rounded-xl border border-border bg-secondary/60 p-3 transition-all',
            snapshot.isDragging && 'border-primary bg-primary/10 shadow-2xl glow-green-sm',
            disabled && 'opacity-60'
          )}
        >
          <div {...provided.dragHandleProps} className="text-muted-foreground">
            <GripVertical className="w-4 h-4" />
          </div>
          <Checkbox checked={checked} onCheckedChange={() => onToggle(player.id)} disabled={disabled} />
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {(player.full_name || '?')[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{player.full_name}</p>
            <p className="text-[11px] text-muted-foreground">Rating {(player.skill_rating || 3).toFixed(1)}</p>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function RoundOneBenchSelector({ players, benchIds, maxBench, onBenchChange, onOrderChange }) {
  const benchSet = new Set(benchIds);
  const activePlayers = players.filter(player => !benchSet.has(player.id));
  const benchPlayers = benchIds.map(id => players.find(player => player.id === id)).filter(Boolean);

  const updateLists = (nextActive, nextBench) => {
    onBenchChange(nextBench.map(player => player.id));
    onOrderChange([...nextActive, ...nextBench].map(player => player.id));
  };

  const toggleBench = (playerId) => {
    if (benchSet.has(playerId)) {
      onBenchChange(benchIds.filter(id => id !== playerId));
      return;
    }
    if (benchIds.length >= maxBench) return;
    onBenchChange([...benchIds, playerId]);
  };

  const move = (source, destination) => {
    const lists = {
      active: [...activePlayers],
      bench: [...benchPlayers],
    };
    const [moved] = lists[source.droppableId].splice(source.index, 1);
    if (destination.droppableId === 'bench' && lists.bench.length >= maxBench) return;
    lists[destination.droppableId].splice(destination.index, 0, moved);
    updateLists(lists.active, lists.bench);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    move(result.source, result.destination);
  };

  if (maxBench <= 0) return null;

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Round 1 Bench</h3>
          <p className="text-xs text-muted-foreground mt-1">Tick players or drag them into the bench box.</p>
        </div>
        <Badge variant={benchIds.length === maxBench ? 'default' : 'outline'}>
          {benchIds.length}/{maxBench} selected
        </Badge>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          <Droppable droppableId="active">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Playing Round 1</p>
                {activePlayers.map((player, index) => (
                  <PlayerRow key={player.id} player={player} index={index} checked={false} onToggle={toggleBench} disabled={benchIds.length >= maxBench} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="hidden lg:flex pt-12 text-muted-foreground">
            <ArrowRight className="w-5 h-5" />
          </div>

          <Droppable droppableId="bench">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn('min-h-36 rounded-2xl border border-dashed border-border p-3 space-y-2', snapshot.isDraggingOver && 'border-primary bg-primary/5')}
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Bench Round 1
                </p>
                {benchPlayers.length === 0 && <p className="text-xs text-muted-foreground py-8 text-center">Drag players here</p>}
                {benchPlayers.map((player, index) => (
                  <PlayerRow key={player.id} player={player} index={index} checked onToggle={toggleBench} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
}