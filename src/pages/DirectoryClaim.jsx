import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, LockKeyhole, ShieldCheck, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getClub } from '@/data/directorySeed';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function DirectoryClaim() {
  const { slug } = useParams();
  const club = getClub(slug);
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const [claimantName, setClaimantName] = useState('');
  const [claimantRole, setClaimantRole] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [claimantMessage, setClaimantMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const returnTo = useMemo(() => `/directory/${slug}/claim`, [slug]);
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  const registerHref = `/register?returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    if (!user) return;
    setClaimantName(user.full_name || user.display_name || '');
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !club) return;
    let active = true;
    setLoadingStatus(true);
    base44.functions.invoke('directoryClaim', { action: 'status', listingSlug: club.slug })
      .then(res => {
        if (!active) return;
        if (res.data?.error) throw new Error(res.data.error);
        setStatus(res.data);
      })
      .catch(err => {
        if (active) setError(err.message || 'Could not load verification status.');
      })
      .finally(() => {
        if (active) setLoadingStatus(false);
      });
    return () => { active = false; };
  }, [isAuthenticated, club]);

  if (!club) return <Navigate to="/directory" replace />;

  const submitClaim = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke('directoryClaim', {
        action: 'submit',
        listingSlug: club.slug,
        claimantName,
        claimantRole,
        claimantPhone,
        claimantMessage,
      });
      if (res.data?.error) throw new Error(res.data.error);
      const refreshed = await base44.functions.invoke('directoryClaim', { action: 'status', listingSlug: club.slug });
      setStatus(refreshed.data || res.data);
    } catch (err) {
      setError(err.message || 'Could not submit your verification request.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasAccess = !!status?.hasAccess;
  const claimStatus = status?.claim?.status || null;
  const pending = claimStatus === 'pending';
  const rejected = claimStatus === 'rejected';

  return (
    <div className="min-h-screen bg-[#0a1628] text-foreground">
      <PublicDirectoryHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={`/directory/${club.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to {club.name}
        </Link>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          <section className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Directory verification</p>
                <h1 className="text-3xl font-black mt-1">Claim {club.name}</h1>
                <p className="text-muted-foreground mt-2">
                  Club representatives can request permission to maintain this public directory listing. Directory access is separate from RallyHub club membership and the RallyHub club-management app.
                </p>
              </div>
            </div>

            {isLoadingAuth || !authChecked ? (
              <div className="mt-8 rounded-xl border border-border bg-background/40 p-5 text-sm text-muted-foreground">Checking your sign-in…</div>
            ) : !isAuthenticated ? (
              <div className="mt-8 rounded-2xl border border-border bg-background/40 p-6">
                <h2 className="text-xl font-bold">Sign in to request access</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  A login is required only so RallyHub can identify and verify the person asking to edit this listing. You do not need to join a RallyHub Club or create a player profile.
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <Link to={loginHref}><Button>Sign in</Button></Link>
                  <Link to={registerHref}><Button variant="outline">Create directory account</Button></Link>
                </div>
              </div>
            ) : loadingStatus ? (
              <div className="mt-8 rounded-xl border border-border bg-background/40 p-5 text-sm text-muted-foreground">Loading verification status…</div>
            ) : hasAccess ? (
              <div className="mt-8 rounded-2xl border border-green-400/30 bg-green-400/10 p-6">
                <div className="flex items-center gap-2 text-green-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <h2 className="font-bold">Verified directory editor</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your account is verified for this directory listing only. This does not give you access to a RallyHub Club, player records or club-management tools.
                </p>
                <p className="text-sm text-foreground mt-4 font-medium">Listing editing tools are the next step in the directory rollout.</p>
              </div>
            ) : pending ? (
              <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
                <div className="flex items-center gap-2 text-amber-300">
                  <Clock3 className="w-5 h-5" />
                  <h2 className="font-bold">Verification requested</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  We could not automatically confirm your connection to this club. Your request is waiting for RallyHub review. We have not disclosed the contact information used for verification.
                </p>
              </div>
            ) : (
              <form onSubmit={submitClaim} className="mt-8 space-y-5">
                {rejected && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
                    Your previous request was not approved. You can submit a new request with clearer information about your role or connection to the club.
                  </div>
                )}

                {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

                <div className="space-y-2">
                  <Label htmlFor="claimantName">Your name</Label>
                  <Input id="claimantName" value={claimantName} onChange={e => setClaimantName(e.target.value)} required maxLength={160} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimantRole">Your role or connection to the club</Label>
                  <Input id="claimantRole" value={claimantRole} onChange={e => setClaimantRole(e.target.value)} placeholder="e.g. Chairperson, secretary, organiser" required maxLength={160} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimantPhone">Mobile number <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input id="claimantPhone" value={claimantPhone} onChange={e => setClaimantPhone(e.target.value)} placeholder="Your contact number" maxLength={80} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimantMessage">Anything that will help us verify you <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea id="claimantMessage" value={claimantMessage} onChange={e => setClaimantMessage(e.target.value)} placeholder="For example: I manage the club sessions and am the current secretary." maxLength={1500} rows={4} />
                </div>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? 'Checking verification…' : 'Request directory access'}
                </Button>
              </form>
            )}
          </section>

          <aside className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <LockKeyhole className="w-4 h-4 text-primary" />
                <h2 className="font-bold">How verification works</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p><strong className="text-foreground">1.</strong> We use your signed-in account identity.</p>
                <p><strong className="text-foreground">2.</strong> RallyHub compares it privately with trusted contact information already associated with the listing.</p>
                <p><strong className="text-foreground">3.</strong> If we cannot verify you safely, a RallyHub administrator reviews the request.</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <h2 className="font-bold">Directory access only</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Approval lets you manage this directory listing. It does not make you a RallyHub player, club member or club administrator.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
