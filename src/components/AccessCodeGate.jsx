import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Eye, EyeOff } from 'lucide-react';

const ACCESS_CODE = 'CLAREPBRH';
const STORAGE_KEY = 'rallyhub_access_granted';

export function useAccessGate() {
  const [granted, setGranted] = React.useState(() => {
    return localStorage.getItem(STORAGE_KEY) === '1';
  });

  const grant = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setGranted(true);
  };

  return { granted, grant };
}

export default function AccessCodeGate({ onGranted }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === ACCESS_CODE) {
      onGranted();
    } else {
      setError(true);
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="glass rounded-2xl p-8 w-full max-w-sm space-y-6 glow-green">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">RallyHub</h1>
          <p className="text-sm text-muted-foreground">Enter the access code to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Input
              autoFocus
              type={showCode ? 'text' : 'password'}
              placeholder="Access code"
              value={code}
              onChange={e => { setCode(e.target.value); setError(false); }}
              className={`bg-secondary border-border text-center font-mono tracking-widest uppercase text-lg pr-10 ${error ? 'border-destructive' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowCode(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-destructive text-center">Incorrect access code</p>}
          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={!code.trim()}>
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}