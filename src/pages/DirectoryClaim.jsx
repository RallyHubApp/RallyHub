import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, LockKeyhole, ShieldCheck, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getClub } from '@/data/directorySeed';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Seo from '@/components/public/Seo';

export default function DirectoryClaim() {
  const { slug } = useParams();
  const location = useLocation();
  const seedClub = getClub(slug);
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const [dynamicClub, setDynamicClub] = useState(null);
  const [loadingClub, setLoadingClub] = useState(!seedClub);
  const [claimantName, setClaimantName] = useState('');
  const [claimantRole, setClaimantRole] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [claimantMessage, setClaimantMessage] = useState('');
  const [networkUpdatesOptIn, setNetworkUpdatesOptIn] = useState(false);
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const inviteToken = useMemo(() => new URLSearchParams(location.search).get('invite') || '', [location.search]);
  const returnTo = useMemo(() => `/directory/${slug}/claim${inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ''}`, [slug, inviteToken]);
  const loginHref = `/login?mode=directory&returnTo=${encodeURIComponent(returnTo)}`;
  const registerHref = `/register?mode=directory&returnTo=${encodeURIComponent(returnTo)}`;

  const club = seedClub || dynamicClub;

  useEffect(() => {
    if (seedClub) return;
    let active = true;
    setLoadingClub(true);
    base44.functions.invoke('directoryListingProfile', { action: 'public_get', listingSlug: slug })
      .then(res => {
        if (!active || res.data?.error) return;
        if (res.data?.base) setDynamicClub(res.data.base);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoadingClub(false); });
    return () => { active = false; };
  }, [seedClub, slug]);

  useEffect(() => {
    if (!user) return;
    setClaimantName(user.full_name || user.display_name || '');
    setClaimantPhone(user.directory_mobile || '');
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

  if (loadingClub && !club) return <div className="min-h-screen bg-background text-foreground"><PublicDirectoryHeader /><main className="container mx-auto px-4 py-10 max-w-4xl"><div className="glass rounded-2xl p-6">Loading club listing…</div></main></div>;
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
        networkUpdatesOptIn,
        inviteToken,
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
    <>
      <Seo
        title={`Claim ${club.name} Directory Listing | RallyHub`}
        description={`Verification page for authorised representatives requesting access to manage the ${club.name} public RallyHub directory listing.`}
        path={`/directory/${club.slug}/claim`}
        robots="noindex,follow"
      />
      <div className="min-h-screen bg-background text-foreground">
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
                {inviteToken && <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300"><strong>Secure invitation detected.</strong> This one-time link was sent by RallyHub for this club, usually by WhatsApp or email. If it came by WhatsApp, use the same mobile number. If it came by email, use the same email address. Once the invited detail matches your verified account, you can continue without waiting for a separate administrator approval.</div>}
              </div>
            </div>

            {isLoadingAuth || !authChecked ? (
              <div className="mt-8 rounded-xl border border-border bg-background/40 p-5 text-sm text-muted-foreground">Checking your sign-in…</div>
            ) : !isAuthenticated ? (
              <div className="mt-8 rounded-2xl border border-border bg-background/40 p-6">
                <h2 className="text-xl font-bold">{inviteToken ? 'First time on RallyHub?' : 'Sign in or create your RallyHub account'}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {inviteToken
                    ? 'If you do not already have a RallyHub account, create one first. For a WhatsApp invitation, use the same mobile number that received it. For an email invitation, use the same email address. You will also need access to that email so RallyHub can verify the account.'
                    : 'RallyHub uses one account system. We use your signed-in identity to verify the person asking to edit this listing. Directory editing is a permission on your account and does not automatically give access to RallyHub Club, tournaments or player records.'}
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  {inviteToken ? (
                    <>
                      <Link to={registerHref}><Button>Create RallyHub account</Button></Link>
                      <Link to={loginHref}><Button variant="outline">I already have an account</Button></Link>
                    </>
                  ) : (
                    <>
                      <Link to={loginHref}><Button>Sign in</Button></Link>
                      <Link to={registerHref}><Button variant="outline">Create RallyHub account</Button></Link>
                    </>
                  )}
                </div>
              </div>
            ) : loadingStatus ? (
              <div className="mt-8 rounded-xl border border-border bg-background/40 p-5 text-sm text-muted-foreground">Loading verification status…</div>
            ) : hasAccess ? (
              <div className="mt-8 rounded-2xl border border-green-400/30 bg-green-400/10 p-6">
                <div className="flex items-center gap-2 text-green-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <h2 className="font-bold">Directory access verified</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your RallyHub account now has permission to manage this directory listing. That permission does not give you access to a RallyHub Club, player records or club-management tools.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={`/directory/${club.slug}/edit`}>
                    <Button className="gap-2"><UserCheck className="w-4 h-4" /> Edit your listing</Button>
                  </Link>
                  <Link to={`/directory/${club.slug}`}>
                    <Button variant="outline">View public listing</Button>
                  </Link>
                </div>
              </div>
            ) : pending ? (
              <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
                <div className="flex items-center gap-2 text-amber-300">
                  <Clock3 className="w-5 h-5" />
                  <h2 className="font-bold">Verification requested</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  We could not automatically confirm your connection to this club. RallyHub has sent the verification request to an administrator for review. You do not need to email us separately, and the administrator contact address is not disclosed.
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
                  <Label htmlFor="claimantEmail">Email address</Label>
                  <Input id="claimantEmail" value={user?.email || ''} readOnly className="bg-background/40" />
                  <p className="text-xs text-muted-foreground">This is your signed-in RallyHub email. We use it for verification and contact about this listing.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimantPhone">Mobile number</Label>
                  <Input id="claimantPhone" value={claimantPhone} onChange={e => setClaimantPhone(e.target.value)} placeholder="Your contact number" required maxLength={80} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimantMessage">Anything that will help us verify you <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea id="claimantMessage" value={claimantMessage} onChange={e => setClaimantMessage(e.target.value)} placeholder="For example: I manage the club sessions and am the current secretary." maxLength={1500} rows={4} />
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-border bg-background/30 p-4 cursor-pointer">
                  <input type="checkbox" checked={networkUpdatesOptIn} onChange={e => setNetworkUpdatesOptIn(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
                  <span className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Keep me connected with RallyHub.</strong> I’m happy to receive occasional directory, club-network and RallyHub updates by email. I can opt out at any time.
                  </span>
                </label>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? 'Checking verification…' : (inviteToken ? 'Verify & continue' : 'Request directory access')}
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
    </>
  );
}
