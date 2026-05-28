import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, RotateCcw, Check, Lock, Unlock, GripVertical, ArrowDownAZ } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

export default function TournivalSeedOrder({
  orderedPlayers,
  locked,
  confirmed,
  isAdmin,
  onReorder,
  onSortByRanking,
  onRandomise,
  onReset,
  onConfirm,
  onUnlock,
}) {
  const handleDragEnd = (result) => {
    if (!result.destination || locked || !isAdmin) return;
    const next = [...orderedPlayers];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    onReorder(next.map(p => p.id));
  };

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Seed Order</h3>
            {locked ? (
              <Badge className="bg-primary/10 text-primary gap-1"><Lock className="w-3 h-3" /> Seed order locked</Badge>
            ) : confirmed ? (
              <Badge className="bg-accent/10 text-accent">Confirmed</Badge>
            ) : (
              <Badge variant="outline">Not confirmed</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Drag players into the exact Round 1 seed/ranking order.</p>
        </div>

        {isAdmin && !locked && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onSortByRanking}>
              <ArrowDownAZ className="w-3 h-3" /> Sort by ranking
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onRandomise}>
              <Shuffle className="w-3 h-3" /> Randomise
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onReset}>
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tournival-seeds">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 max-h-80 overflow-auto">
              {orderedPlayers.map((player, index) => (
                <Draggable key={player.id} draggableId={player.id} index={index} isDragDisabled={locked || !isAdmin}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border border-border bg-secondary/60 p-2.5 transition-all',
                        snapshot.isDragging && 'border-primary bg-primary/10 shadow-lg'
                      )}
                    >
                      <div {...dragProvided.dragHandleProps} className={cn('text-muted-foreground', (locked || !isAdmin) && 'opacity-30')}>
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="w-8 text-center text-xs font-bold text-primary">#{index + 1}</div>
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {(player.full_name || '?')[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{player.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">Current ranking: {player.skill_rating || 'Unrated'}</p>
                      </div>
                      <Badge className={player.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>
                        {player.status || 'Active'}
                      </Badge>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isAdmin && (
        <div className="flex gap-2">
          {locked ? (
            <Button variant="outline" className="w-full gap-2 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10" onClick={onUnlock}>
              <Unlock className="w-4 h-4" /> Unlock seed order
            </Button>
          ) : (
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2" onClick={onConfirm} disabled={orderedPlayers.length < 4}>
              <Check className="w-4 h-4" /> Confirm seed order
            </Button>
          )}
        </div>
      )}
    </div>
  );
}