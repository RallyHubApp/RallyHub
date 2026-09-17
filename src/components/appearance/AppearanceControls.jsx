import React from 'react';
import { MonitorCog, Sun, Contrast, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppearance } from '@/lib/AppearanceContext';

const OPTIONS = [
  { id: 'auto', label: 'Auto', icon: MonitorCog },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'hall', label: 'Hall', icon: Contrast },
  { id: 'dark', label: 'Dark', icon: Moon },
];

export function AppearanceSelector({ compact = false }) {
  const { mode, setMode } = useAppearance();
  return (
    <div className={cn('grid grid-cols-4 gap-1 rounded-lg border border-border bg-secondary/60 p-1', compact && 'min-w-[240px]')}>
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setMode(id)}
          aria-pressed={mode === id}
          title={`${label} appearance`}
          className={cn(
            'min-h-10 rounded-md px-2 py-1.5 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            mode === id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background'
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

export function AppearanceQuickButton({ showLabel = true, className }) {
  const { resolvedMode, cycleMode } = useAppearance();
  const active = OPTIONS.find(option => option.id === resolvedMode) || OPTIONS[3];
  const Icon = active.icon;
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={cycleMode}
      title="Change appearance: Light → Hall → Dark"
      aria-label={`Current appearance ${active.label}. Change appearance.`}
      className={cn('gap-1.5 border-border bg-card/80', className)}
    >
      <Icon className="w-4 h-4" />
      {showLabel && <span className="hidden sm:inline">{active.label}</span>}
    </Button>
  );
}

export function HostAppearanceControl() {
  const { resolvedMode, cycleMode } = useAppearance();
  const active = OPTIONS.find(option => option.id === resolvedMode) || OPTIONS[3];
  const Icon = active.icon;
  return (
    <button
      type="button"
      onClick={cycleMode}
      className="fixed right-3 top-3 z-[1200] min-h-11 rounded-xl border-2 border-border bg-card px-3 py-2 text-foreground shadow-lg flex items-center gap-2 font-semibold text-xs hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Host display appearance is ${active.label}. Tap to change.`}
      title="Host appearance: Light → Hall → Dark"
    >
      <Icon className="w-4 h-4" />
      <span>{active.label}</span>
    </button>
  );
}
