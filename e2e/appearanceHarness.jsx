import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppearanceProvider } from '@/lib/AppearanceContext';
import { AppearanceQuickButton, AppearanceSelector } from '@/components/appearance/AppearanceControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import '@/index.css';

function Harness() {
  return (
    <AppearanceProvider>
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">RallyHub appearance test</h1>
            <AppearanceQuickButton />
          </div>
          <AppearanceSelector />
          <section data-testid="control-panel" className="glass rounded-xl p-4 sm:p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1"><label htmlFor="score">Score / number control</label><Input id="score" type="number" min="0" max="99" defaultValue="11" /></div>
              <div className="space-y-1"><label>Dropdown</label><Select defaultValue="one"><SelectTrigger aria-label="Test dropdown"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="one">Court one</SelectItem><SelectItem value="two">Court two</SelectItem></SelectContent></Select></div>
            </div>
            <label className="flex items-center gap-3"><Checkbox aria-label="Test checkbox" defaultChecked /><span>Visible checkbox</span></label>
            <div className="space-y-2"><label>Hall volume slider</label><Slider aria-label="Test slider" defaultValue={[55]} max={100} step={1} /></div>
            <div className="flex flex-wrap gap-2"><Button>Primary action</Button><Button variant="outline">Secondary action</Button><Button variant="destructive">Destructive action</Button></div>
          </section>
        </div>
      </main>
    </AppearanceProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Harness />);
