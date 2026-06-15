import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function RankingList({ items, onChange, disabled = false }) {
  const moveItem = (from, to) => {
    if (disabled || to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map(item => item.id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination || disabled) return;
    moveItem(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="ranking-list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={disabled}>
                {(dragProvided, snapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border border-border bg-secondary/60 p-3 transition-all',
                      snapshot.isDragging && 'border-primary bg-primary/10 shadow-2xl glow-green-sm'
                    )}
                  >
                    <div {...dragProvided.dragHandleProps} className={cn('text-muted-foreground', disabled && 'opacity-30')}>
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="w-9 text-center text-xs font-black text-primary">#{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{item.label}</p>
                      {item.sublabel && <p className="text-[11px] text-muted-foreground truncate">{item.sublabel}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" disabled={disabled || index === 0} onClick={() => moveItem(index, index - 1)}>
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" disabled={disabled || index === items.length - 1} onClick={() => moveItem(index, index + 1)}>
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}