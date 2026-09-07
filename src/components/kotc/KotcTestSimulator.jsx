import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ChevronDown, ChevronUp, FlaskConical, Loader2, ShieldCheck, TriangleAlert } from 'lucide-react';

function message(error) {
  return error?.response?.data?.error || error?.data?.error || error?.message || 'Simulator failed unexpectedly.';
}

export default function KotcTestSimulator() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  if (user?.role !== 'admin') return null;

  const run = async mode => {
    setRunning(true);
    setError('');
    try {
      const payload = mode === 'quick'
        ? { rounds: 5, playerCounts: [15, 16, 17], courtLimits: [3, 4] }
        : { rounds: 9 };
      const response = await base44.functions.invoke('kotcSimulator', payload);
      setResult({ mode, ...(response.data || {}) });
    } catch (e) {
      setError(message(e));
    } finally {
      setRunning(false);
    }
  };

  return <div className="glass rounded-xl p-3 sm:p-4 space-y-3 border border-dashed border-primary/30">
    <button type="button" onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between gap-3 text-left">
      <div className="flex items-start gap-2">
        <FlaskConical className="w-4 h-4 text-primary mt-0.5" />
        <div>
          <p className="font-semibold text-sm">KOTC Test Simulator</p>
          <p className="text-xs text-muted-foreground mt-1">Admin-only engine checks. Runs in memory and does not alter tonight's session or player data.</p>
        </div>
      </div>
      {open ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
    </button>

    {open && <div className="pt-2 border-t border-border space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => run('quick')} disabled={running} className="min-h-11">
          {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FlaskConical className="w-4 h-4 mr-2" />}Quick 15/16/17 Test
        </Button>
        <Button onClick={() => run('full')} disabled={running} className="min-h-11">
          {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}Full Engine Test
        </Button>
      </div>

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex gap-2 text-xs text-destructive"><TriangleAlert className="w-4 h-4 shrink-0" />{error}</div>}
      {result && <div className="rounded-lg border p-3 space-y-2">
        <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">{result.mode === 'quick' ? 'Quick simulator' : 'Full simulator'}</p><Badge variant={result.passed ? 'default' : 'destructive'}>{result.passed ? 'PASS' : 'FAIL'}</Badge></div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-secondary/50 p-2"><p className="font-bold text-sm">{result.scenarioCount ?? '—'}</p><p className="text-[10px] text-muted-foreground">Scenarios</p></div>
          <div className="rounded-md bg-secondary/50 p-2"><p className="font-bold text-sm">{result.checkCount ?? '—'}</p><p className="text-[10px] text-muted-foreground">Checks</p></div>
          <div className="rounded-md bg-secondary/50 p-2"><p className="font-bold text-sm">{result.failureCount ?? '—'}</p><p className="text-[10px] text-muted-foreground">Failures</p></div>
        </div>
        {Array.isArray(result.failedChecks) && result.failedChecks.length > 0 && <div className="max-h-36 overflow-auto space-y-1">{result.failedChecks.slice(0, 20).map((item, i) => <p key={i} className="text-[11px] text-destructive">{item.scenario} · R{item.round}: {item.rule} — {item.details}</p>)}</div>}
      </div>}
      <p className="text-[10px] text-muted-foreground">This is Phase 1: automated production-engine invariants. Live phone/UI automation remains a separate later layer.</p>
    </div>}
  </div>;
}
