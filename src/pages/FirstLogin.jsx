import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FirstLogin() {
  const [step, setStep] = useState('verify'); // 'verify' | 'change' | 'done'
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState('');

  const baseUrl = (import.meta.env.VITE_BASE44_APP_BASE_URL || '').replace(/\/$/, '');

  const callFn = async (payload) => {
    const res = await fetch(`${baseUrl}/api/functions/tempPasswordLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email.trim() || !tempPassword.trim()) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    const result = await callFn({ email: email.trim(), tempPassword: tempPassword.trim(), action: 'verify' });
    setLoading(false);
    if (result.error) { toast.error(result.error); return; }
    setPlayerName(result.playerName || '');
    setStep('change');
  };

  const handleChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Clear the temp token on the server, then redirect to platform's built-in password reset
    const result = await callFn({ email: email.trim(), tempPassword: tempPassword.trim(), action: 'change_password' });
    setLoading(false);
    if (result.error) { toast.error(result.error); return; }
    setStep('done');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">RallyHub</h1>
          <p className="text-sm text-muted-foreground">Set your password to get started</p>
        </div>

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="glass rounded-xl p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" /> Enter Your Temp Password
              </h2>
              <p className="text-xs text-muted-foreground">Your admin has provided you with a temporary password. Enter it below.</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
                className="mt-1 bg-secondary border-border" required />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Temporary Password</Label>
              <Input value={tempPassword} onChange={e => setTempPassword(e.target.value)} placeholder="Enter temp password"
                className="mt-1 bg-secondary border-border font-mono" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">
              {loading ? 'Verifying…' : 'Continue'}
            </Button>
          </form>
        )}

        {step === 'change' && (
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">
                {playerName ? `Welcome, ${playerName.split(' ')[0]}! 👋` : 'Identity Verified'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Your temp password is valid. Now set a permanent password using the secure reset flow — we'll send a reset link to your email.
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
              <p>A password reset link will be sent to:</p>
              <p className="font-mono text-foreground mt-0.5">{email}</p>
            </div>
            <Button onClick={handleChange} disabled={loading} className="w-full bg-primary text-primary-foreground">
              {loading ? 'Processing…' : 'Send Password Reset Link'}
            </Button>
          </div>
        )}

        {step === 'done' && (
          <div className="glass rounded-xl p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Check Your Email!</h2>
              <p className="text-xs text-muted-foreground mt-1">
                We've sent a password reset link to <span className="font-mono text-foreground">{email}</span>.
                Click it to set your permanent password, then log in normally going forward.
              </p>
            </div>
            <Button className="w-full bg-primary text-primary-foreground" onClick={() => base44.auth.redirectToLogin()}>
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}