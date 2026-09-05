import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/shared/GlassCard';
import PageHeader from '@/components/shared/PageHeader';

export default function IsolationTest() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const runTest = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const res = await base44.functions.invoke('isolationSelfTest', {
        forbiddenTenantId: '6a9b7790bc4a8d299938bda9',
        forbiddenClubId: '6a9b779684daba85b3ffdeb5',
        forbiddenPlayerId: '6a9bf538dc339b887eccfa65'
      });
      setResult(res.data);
    } catch (e) {
      setError(e?.message || 'Test failed to run');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tenant Isolation Test" description="Temporary security verification screen" />
      <GlassCard>
        <div className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">Run this while logged in as the TBC Test PB user. It attempts to read, update and create Clare-owned data.</p>
          <Button onClick={runTest} disabled={running}>{running ? 'Running…' : 'Run Isolation Test'}</Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {result && (
            <div className="space-y-3">
              <p className={`text-lg font-bold ${result.all_pass ? 'text-green-400' : 'text-red-400'}`}>
                {result.all_pass ? 'ALL TESTS PASSED' : 'ONE OR MORE TESTS FAILED'}
              </p>
              <pre className="text-xs whitespace-pre-wrap break-words bg-black/30 rounded-lg p-3 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}