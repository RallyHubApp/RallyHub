import { useEffect, useState } from 'react';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function PendingApprovalScreen({ status = 'pending' }) {
  const isRejected = status === 'rejected';
  const [checking, setChecking] = useState(false);
  const [detail, setDetail] = useState('');
  const recheckAccess = async (silent = false) => {
    if (!silent) setChecking(true);
    try {
      const account = await base44.auth.me();
      if (account?.approval_status !== 'approved') {
        if (!silent) setDetail(account?.approval_status === 'rejected' ? 'This account was rejected. Contact your club administrator.' : 'Approval is still pending.');
        return;
      }
      const grants = await base44.entities.ClubUserAccess.filter({ user_id: account.id, status: 'active' });
      const active = (grants || []).some(g => (!g.starts_at || Date.parse(g.starts_at) <= Date.now()) && (!g.ends_at || Date.parse(g.ends_at) >= Date.now()));
      if (!active) {
        setDetail('Your account is marked Approved, but a Club membership access link is still missing. Ask your administrator to complete the account link.');
        return;
      }
      await base44.functions.invoke('securityContext', { action: 'resolve_default' });
      window.location.reload();
    } catch (e) {
      if (!silent) setDetail(e?.response?.data?.error || e?.message || 'Could not check access. Please retry.');
    } finally {
      if (!silent) setChecking(false);
    }
  };
  useEffect(() => {
    if (isRejected) return undefined;
    const timer = window.setInterval(() => { recheckAccess(true); }, 20000);
    return () => window.clearInterval(timer);
  }, [isRejected]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6">
    <div className="glass rounded-2xl p-8 w-full max-w-sm space-y-6 text-center glow-green">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto"><Clock className={`w-7 h-7 ${isRejected ? 'text-destructive' : 'text-primary'}`} /></div>
      <div className="space-y-2"><h1 className="text-xl font-bold text-foreground">RallyHub</h1>
        {isRejected ? <><p className="text-sm font-semibold text-destructive">Access Denied</p><p className="text-sm text-muted-foreground">Your account has been rejected. Contact an administrator if this is a mistake.</p></> : <><p className="text-sm font-semibold text-foreground">Checking Club access</p><p className="text-sm text-muted-foreground">Once the administrator approves and links your account, this page will update automatically.</p></>}
        {detail && <p className="text-sm text-amber-600" role="status">{detail}</p>}
      </div>
      {!isRejected && <Button className="w-full gap-2" onClick={() => recheckAccess(false)} disabled={checking}><RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`}/>{checking ? 'Checking…' : 'Check access again'}</Button>}
      <Button variant="outline" className="w-full gap-2" onClick={() => base44.auth.logout('/')}><LogOut className="w-4 h-4"/>Sign Out</Button>
    </div>
  </div>;
}
