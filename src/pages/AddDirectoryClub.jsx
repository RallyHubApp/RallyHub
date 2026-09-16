import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2, Clock3, PlusCircle, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { directoryClubs, irelandCounties } from '@/data/directorySeed';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const normalise = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export default function AddDirectoryClub() {
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const [clubName, setClubName] = useState('');
  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [primaryVenue, setPrimaryVenue] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [claimantRole, setClaimantRole] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [request, setRequest] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const returnTo = '/directory/add';
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  const registerHref = `/register?returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    if (!user) return;
    setClaimantName(user.full_name || user.display_name || '');
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    setLoadingStatus(true);
    base44.functions.invoke('directoryClaim', { action: 'new_status' })
      .then(res => {
        if (!active) return;
        if (res.data?.error) throw new Error(res.data.error);
        setRequest(res.data?.request || null);
      })
      .catch(err => {
        if (active) setError(err.message || 'Could not load your directory request status.');
      })
      .finally(() => { if (active) setLoadingStatus(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  const exactExisting = useMemo(() => {
    if (!clubName.trim() || !county) return null;
    return directoryClubs.find(club => normalise(club.name) === normalise(clubName) && normalise(club.county) === normalise(county)) || null;
  }, [clubName, county]);

  const submit = async event => {
    event.preventDefault();
    setError('');
    if (exactExisting) return;
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke('directoryClaim', {
        action: 'submit_new',
        clubName,
        county,
        town,
        primaryVenue,
        address,
        website,
        facebook,
        instagram,
        claimantName,
        claimantRole,
        claimantPhone,
        notes,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setRequest(res.data?.request || { status: 'pending', club_name: clubName, county, town });
    } catch (err) {
      setError(err.message || 'Could not submit this club for the directory.');
    } finally {
      setSubmitting(false);
    }
  };

  const pending = request?.status === 'pending';
  const approved = request?.status === 'approved';
  const rejected = request?.status === 'rejected';

  return (
    <div className="min-h-screen bg-[#0a1628] text-foreground">
      <PublicDirectoryHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/directory" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to club directory
        </Link>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <section className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <PlusCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">RallyHub Directory</p>
                <h1 className="text-3xl font-black mt-1">Add your club</h1>
                <p className="text-muted-foreground mt-2">
                  Can't find your club in the directory? Send us the basic details and RallyHub will review the listing before it is added.
                </p>
              </div>
            </div>

            {isLoadingAuth || !authChecked ? (
              <div className="mt-8 rounded-xl border border-border bg-background/40 p-5 text-sm text-muted-foreground">Checking your sign-in…</div>
            ) : !isAuthenticated ? (
              <div className="mt-8 rounded-2xl border border-border bg-background/40 p-6">
                <h2 className="text-xl font-bold">Sign in to submit a club</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  We require a verified account so we know who submitted the club and can contact you if we need to check the details. This does not create a RallyHub Club or player membership.
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <Link to={loginHref}><Button>Sign in</Button></Link>
                  <Link to={registerHref}><Button variant="outline">Create directory account</Button></Link>
                </div>
              </div>
            ) : loadingStatus ? (
              <div className="mt-8 rounded-xl border border-border bg-background/40 p-5 text-sm text-muted-foreground">Loading your request status…</div>
            ) : pending ? (
              <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
                <div className="flex items-center gap-2 text-amber-300"><Clock3 className="w-5 h-5" /><h2 className="font-bold">Club submitted for review</h2></div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your request for <strong className="text-foreground">{request.club_name}</strong> is waiting for RallyHub review. We check for duplicates before adding a new public listing.
                </p>
              </div>
            ) : approved ? (
              <div className="mt-8 rounded-2xl border border-green-400/30 bg-green-400/10 p-6">
                <div className="flex items-center gap-2 text-green-300"><CheckCircle2 className="w-5 h-5" /><h2 className="font-bold">Club request approved</h2></div>
                <p className="text-sm text-muted-foreground mt-2">The club has been approved for addition to the RallyHub Directory. Directory publishing is completed by RallyHub during this preview phase.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 space-y-5">
                {rejected && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
                    Your previous request was not added. You can submit again with corrected or clearer club information.
                  </div>
                )}
                {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="clubName">Club or group name</Label>
                    <Input id="clubName" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="e.g. Example Pickleball Club" required maxLength={180} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <select id="county" value={county} onChange={e => setCounty(e.target.value)} required className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select county</option>
                      {irelandCounties.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="town">Town / area</Label>
                    <Input id="town" value={town} onChange={e => setTown(e.target.value)} required maxLength={120} />
                  </div>
                </div>

                {exactExisting && (
                  <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm">
                    <p className="font-semibold text-foreground">We found this club already.</p>
                    <p className="text-muted-foreground mt-1">Open the existing listing instead of creating another one.</p>
                    <Link to={`/directory/${exactExisting.slug}`} className="inline-flex mt-3 font-semibold text-primary hover:underline">View {exactExisting.name}</Link>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryVenue">Primary venue <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input id="primaryVenue" value={primaryVenue} onChange={e => setPrimaryVenue(e.target.value)} maxLength={220} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Venue address / Eircode <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input id="address" value={address} onChange={e => setAddress(e.target.value)} maxLength={320} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label htmlFor="website">Website <span className="text-muted-foreground font-normal">(optional)</span></Label><Input id="website" value={website} onChange={e => setWebsite(e.target.value)} maxLength={320} /></div>
                  <div className="space-y-2"><Label htmlFor="facebook">Facebook <span className="text-muted-foreground font-normal">(optional)</span></Label><Input id="facebook" value={facebook} onChange={e => setFacebook(e.target.value)} maxLength={320} /></div>
                  <div className="space-y-2"><Label htmlFor="instagram">Instagram <span className="text-muted-foreground font-normal">(optional)</span></Label><Input id="instagram" value={instagram} onChange={e => setInstagram(e.target.value)} maxLength={320} /></div>
                </div>

                <div className="border-t border-border pt-5">
                  <h2 className="font-bold mb-4">About you</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="claimantName">Your name</Label><Input id="claimantName" value={claimantName} onChange={e => setClaimantName(e.target.value)} required maxLength={160} /></div>
                    <div className="space-y-2"><Label htmlFor="claimantRole">Your role / connection</Label><Input id="claimantRole" value={claimantRole} onChange={e => setClaimantRole(e.target.value)} placeholder="e.g. Chairperson, organiser" required maxLength={160} /></div>
                    <div className="space-y-2"><Label htmlFor="claimantPhone">Mobile number <span className="text-muted-foreground font-normal">(optional)</span></Label><Input id="claimantPhone" value={claimantPhone} onChange={e => setClaimantPhone(e.target.value)} maxLength={80} /></div>
                  </div>
                  <div className="space-y-2 mt-4"><Label htmlFor="notes">Anything else we should know <span className="text-muted-foreground font-normal">(optional)</span></Label><Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} maxLength={1500} /></div>
                </div>

                <Button type="submit" disabled={submitting || !!exactExisting} className="w-full sm:w-auto">
                  {submitting ? 'Submitting…' : 'Submit club for review'}
                </Button>
              </form>
            )}
          </section>

          <aside className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /><h2 className="font-bold">Directory only</h2></div>
              <p className="text-sm text-muted-foreground mt-3">Adding a club here creates a request for a public directory listing. It does not create a RallyHub tenant, RallyHub Club or player account.</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /><h2 className="font-bold">Already listed?</h2></div>
              <p className="text-sm text-muted-foreground mt-3">If you find your club in the directory, open the existing profile and choose <strong className="text-foreground">Claim this listing</strong> instead.</p>
              <Link to="/directory?manage=1" className="inline-flex mt-3 text-sm font-semibold text-primary hover:underline">Find and claim your club</Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
