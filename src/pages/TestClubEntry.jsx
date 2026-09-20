import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

const TEST_TENANT_ID = '6aaf73a47bf9803a01f74bb7';
const TEST_CLUB_ID = '6aaf73a6bd390e85fec04dc5';
const CLARE_TENANT_ID = '6a9b7790bc4a8d299938bda9';
const CLARE_CLUB_ID = '6a9b779684daba85b3ffdeb5';
const ALLOWED_EMAIL = 'brian.moore007@gmail.com';

export default function TestClubEntry() {
  const location = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState('working');
  const [error, setError] = useState('');
  const restore = new URLSearchParams(location.search).get('restore') === '1';

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!user?.email) return;
      if (String(user.email).toLowerCase() !== ALLOWED_EMAIL) {
        if (active) {
          setStatus('blocked');
          setError('This temporary test route is restricted to the designated Brian Moore test account.');
        }
        return;
      }
      try {
        const res = await base44.functions.invoke('securityContext', {
          action: 'activate',
          tenantId: restore ? CLARE_TENANT_ID : TEST_TENANT_ID,
          clubId: restore ? CLARE_CLUB_ID : TEST_CLUB_ID,
        });
        if (res.data?.error) throw new Error(res.data.error);
        if (!active) return;
        setStatus('done');
        window.setTimeout(() => {
          window.location.replace('/app');
        }, 700);
      } catch (err) {
        if (!active) return;
        setStatus('error');
        setError(err.message || 'Could not switch the temporary test club context.');
      }
    };
    run();
    return () => { active = false; };
  }, [user?.email, restore]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="glass rounded-2xl p-7 max-w-lg w-full text-center">
        {status === 'working' && (
          <>
            <Loader2 className="w-9 h-9 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-black mt-4">{restore ? 'Returning to Clare Pickleball' : 'Opening RallyHub Test Club'}</h1>
            <p className="text-sm text-muted-foreground mt-2">This is a temporary one-off acceptance-test route.</p>
          </>
        )}
        {status === 'done' && (
          <>
            <CheckCircle2 className="w-9 h-9 text-primary mx-auto" />
            <h1 className="text-2xl font-black mt-4">{restore ? 'Clare Pickleball restored' : 'Test club ready'}</h1>
            <p className="text-sm text-muted-foreground mt-2">Taking you to RallyHub now…</p>
          </>
        )}
        {(status === 'error' || status === 'blocked') && (
          <>
            <AlertTriangle className="w-9 h-9 text-amber-500 mx-auto" />
            <h1 className="text-2xl font-black mt-4">Test route unavailable</h1>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Link to="/" className="inline-block mt-5"><Button variant="outline">Back to RallyHub</Button></Link>
          </>
        )}
      </div>
    </div>
  );
}
