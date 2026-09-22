import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2, Clock3, PlusCircle, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { directoryClubs, irelandCounties } from '@/data/directorySeed';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Seo from '@/components/public/Seo';

const normalise = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export default function AddDirectoryClub() {
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'admin';
  const [clubName, setClubName] = useState('');
  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [primaryVenue, setPrimaryVenue] = useState('');
  const [address, setAddress] = useState('');
  const [venuePostcode, setVenuePostcode] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [claimantRole, setClaimantRole] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [publishContact, setPublishContact] = useState(true);
  const [networkUpdatesOptIn, setNetworkUpdatesOptIn] = useState(false);
  const [notes, setNotes] = useState('');
  const [request, setRequest] = useState(null);
  const [dynamicClubs, setDynamicClubs] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const returnTo = '/directory/add';
  const loginHref = `/login?mode=directory&returnTo=${encodeURIComponent(returnTo)}`;
  const registerHref = `/register?mode=directory&returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    if (!user || user.role === 'admin') return;
    setClaimantName(user.full_name || user.display_name || '');
  }, [user]);

  useEffect(() => {
    let active = true;
    base44.functions.invoke('directoryListingProfile', { action: 'public_list' })
      .then(res => {
        if (!active || res.data?.error) return;
        const known = Object.entries(res.data?.listings || {}).filter(([, state]) => state?.base).map(([slug, state]) => ({ ...state.base, slug }));
        setDynamicClubs(known);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role === 'admin') return;
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
  }, [isAuthenticated, user?.role]);

  const exactExisting = useMemo(() => {
    if (!clubName.trim() || !county) return null;
    return [...directoryClubs, ...dynamicClubs].find(club => normalise(club.name) === normalise(clubName) && normalise(club.county) === normalise(county)) || null;
  }, [clubName, county, dynamicClubs]);

  const submit = async event => {
    event.preventDefault();
    setError('');
    if (exactExisting) return;
    setSubmitting(true);
    try {
      if (isSuperAdmin) {
        const res = await base44.functions.invoke('directoryClaim', {
          action: 'admin_create_unclaimed',
          clubName,
          county,
          town,
          primaryVenue,
          address,
          venuePostcode,
          website,
          facebook,
          instagram,
          contactName: claimantName,
          contactRole: claimantRole,
          contactEmail: claimantEmail,
          contactPhone: claimantPhone,
          publishContact,
          notes,
        });
        if (res.data?.error) throw new Error(res.data.error);
        if (!res.data?.listingSlug) throw new Error('The club was created but RallyHub did not return the listing address.');
        navigate(`/directory/${res.data.listingSlug}/edit?created=1`);
        return;
      }

      const res = await base44.functions.invoke('directoryClaim', {
        action: 'submit_new',
        clubName,
        county,
        town,
        primaryVenue,
        address,
        venuePostcode,
        website,
        facebook,
        instagram,
        claimantName,
        claimantRole,
        claimantPhone,
        publishContact,
        networkUpdatesOptIn,
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
  const removed = request?.status === 'removed';

  return (
    <>
      <Seo
        title="Add Your Pickleball Club to the RallyHub Ireland Directory"
        description="Can't find your pickleball club in RallyHub? Submit a club from anywhere on the island of Ireland for review and inclusion in the public RallyHub Club Directory."
        path="/directory/add"
      />
      <div className="min-h-screen bg-background text-foreground">
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
                <h1 className="text-3xl font-black mt-1">{isSuperAdmin ? 'Add an unclaimed club' : 'Add your club'}</h1>
                <p className="text-muted-foreground mt-2">
                  {isSuperAdmin
                    ? 'Create and pre-populate a public club listing without claiming it. Add the club contact now, then continue to the editor to upload the logo and complete any other details before sending the claim invitation.'
                    : "Can't find your club in the directory? Send us the basic details and RallyHub will review the listing before it is added."}
                </p>
              </div>
            </div>

            {isLoadingAuth || !authChecked ? (
              <div className="mt-8 rounded-xl border border-border bg-background/40 p-5 text-sm text-muted-foreground">Checking your sign-in…</div>
            ) : !isAuthenticated ? (
              <div className="mt-8 rounded-2xl border border-border bg-background/40 p-6">
                <h2 className="text-xl font-bold">Sign in to submit a club</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  We require a verified RallyHub account so we know who submitted the club and can contact you if we need to check the details. The same account can be used elsewhere in RallyHub, but submitting a Directory listing does not create a RallyHub Club or player membership.
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <Link to={loginHref}><Button>Sign in</Button></Link>
                  <Link to={registerHref}><Button variant="outline">Create RallyHub account</Button></Link>
                </div>
              </div>
            ) : loadingStatus ? (
              <div className="mt-8 rounded-xl border border-border bg-background/40 p-5 text-sm text-muted-foreground">Loading your request status…</div>
            ) : !isSuperAdmin && pending ? (
              <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
                <div className="flex items-center gap-2 text-amber-300"><Clock3 className="w-5 h-5" /><h2 className="font-bold">Club submitted for review</h2></div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your submission for <strong className="text-foreground">{request.club_name}</strong> has been saved and is waiting for RallyHub review. It is <strong className="text-foreground">not public or searchable yet</strong>. We check for duplicates before publishing a new listing, and RallyHub has automatically notified an administrator. You do not need to email us separately.
                </p>
                <p className="text-xs text-muted-foreground mt-3">After approval, this page will change to show <strong className="text-foreground">Edit your listing</strong> and <strong className="text-foreground">View public listing</strong>.</p>
              </div>
            ) : !isSuperAdmin && approved ? (
              <div className="mt-8 rounded-2xl border border-green-400/30 bg-green-400/10 p-6">
                <div className="flex items-center gap-2 text-green-300"><CheckCircle2 className="w-5 h-5" /><h2 className="font-bold">Your club is now in the directory</h2></div>
                <p className="text-sm text-muted-foreground mt-2">RallyHub approved the club and gave your account directory-editor access. Complete the public listing now so players see accurate contact, venue and session information.</p>
                {request.approved_listing_slug && <div className="mt-5 flex flex-wrap gap-2"><Link to={`/directory/${request.approved_listing_slug}/edit`}><Button>Edit your listing</Button></Link><Link to={`/directory/${request.approved_listing_slug}`}><Button variant="outline">View public listing</Button></Link></div>}
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 space-y-5">
                {!isSuperAdmin && (rejected || removed) && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
                    {removed
                      ? 'Your previous test/submitted listing is no longer published. You can submit another club if needed.'
                      : 'Your previous request was not added. You can submit again with corrected or clearer club information.'}
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
                    <Label htmlFor="address">Venue address <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street / venue address" maxLength={320} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venuePostcode">Eircode / postcode <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input id="venuePostcode" value={venuePostcode} onChange={e => setVenuePostcode(e.target.value.toUpperCase())} placeholder="e.g. V95 PD96 or BT…" maxLength={40} autoComplete="postal-code" />
                    <p className="text-xs text-muted-foreground">A full address or Eircode/postcode helps RallyHub place the venue accurately on the all-Ireland club map.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label htmlFor="website">Website <span className="text-muted-foreground font-normal">(optional)</span></Label><Input id="website" value={website} onChange={e => setWebsite(e.target.value)} maxLength={320} /></div>
                  <div className="space-y-2"><Label htmlFor="facebook">Facebook <span className="text-muted-foreground font-normal">(optional)</span></Label><Input id="facebook" value={facebook} onChange={e => setFacebook(e.target.value)} maxLength={320} /></div>
                  <div className="space-y-2"><Label htmlFor="instagram">Instagram <span className="text-muted-foreground font-normal">(optional)</span></Label><Input id="instagram" value={instagram} onChange={e => setInstagram(e.target.value)} maxLength={320} /></div>
                </div>

                <div className="border-t border-border pt-5">
                  <h2 className="font-bold mb-4">{isSuperAdmin ? 'Club contact' : 'About you'}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="claimantName">{isSuperAdmin ? 'Contact name' : 'Your name'}</Label><Input id="claimantName" value={claimantName} onChange={e => setClaimantName(e.target.value)} required maxLength={160} /></div>
                    <div className="space-y-2"><Label htmlFor="claimantRole">{isSuperAdmin ? 'Role / connection' : 'Your role / connection'}</Label><Input id="claimantRole" value={claimantRole} onChange={e => setClaimantRole(e.target.value)} placeholder="e.g. Chairperson, organiser" required={!isSuperAdmin} maxLength={160} /></div>
                    <div className="space-y-2 sm:col-span-2"><Label htmlFor="claimantEmail">Email address</Label>{isSuperAdmin ? <Input id="claimantEmail" type="email" value={claimantEmail} onChange={e => setClaimantEmail(e.target.value)} placeholder="Club contact email (optional)" /> : <Input id="claimantEmail" value={user?.email || ''} readOnly className="bg-background/40" />}<p className="text-xs text-muted-foreground">{isSuperAdmin ? 'Optional. If you have it, RallyHub can also send the claim link by email and use it as a trusted verification signal. A mobile number is enough to continue and use WhatsApp.' : 'This is your signed-in RallyHub email. It is used for the review and, if you leave the public-contact option selected below, it will also appear on the approved club listing.'}</p></div>
                    <div className="space-y-2"><Label htmlFor="claimantPhone">{isSuperAdmin ? 'Mobile / WhatsApp number' : 'Mobile number'}</Label><Input id="claimantPhone" type="tel" inputMode="tel" autoComplete="tel" value={claimantPhone} onChange={e => setClaimantPhone(e.target.value)} placeholder="e.g. 087 123 4567" required maxLength={80} /><p className="text-xs text-muted-foreground">Enter the number and continue to the next field; it is saved when you submit the form.</p></div>
                  </div>
                  <label className="mt-4 flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 cursor-pointer">
                    <input type="checkbox" checked={publishContact} onChange={e => setPublishContact(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
                    <span className="text-sm text-muted-foreground"><strong className="text-foreground">Use these as the public club contact details.</strong> {isSuperAdmin ? 'They will appear on the club profile, while the email is also retained as the trusted contact for the future claim.' : 'If the listing is approved, show my submitted name, email and mobile on the club profile. Untick this if you want to add different public contact details later.'}</span>
                  </label>
                  <div className="space-y-2 mt-4"><Label htmlFor="notes">Anything else we should know <span className="text-muted-foreground font-normal">(optional)</span></Label><Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} maxLength={1500} /></div>
                  {!isSuperAdmin && <label className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-background/30 p-4 cursor-pointer">
                    <input type="checkbox" checked={networkUpdatesOptIn} onChange={e => setNetworkUpdatesOptIn(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
                    <span className="text-sm text-muted-foreground"><strong className="text-foreground">Keep me connected with RallyHub.</strong> I’m happy to receive occasional directory, club-network and RallyHub updates by email. I can opt out at any time.</span>
                  </label>}
                </div>

                <Button type="submit" disabled={submitting || !!exactExisting} className="w-full sm:w-auto">
                  {submitting ? (isSuperAdmin ? 'Creating…' : 'Submitting…') : (isSuperAdmin ? 'Create unclaimed listing & continue' : 'Submit club for review')}
                </Button>
              </form>
            )}
          </section>

          <aside className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /><h2 className="font-bold">Directory only</h2></div>
              <p className="text-sm text-muted-foreground mt-3">{isSuperAdmin ? 'This creates a public Directory listing only. It remains unclaimed until the club representative signs in and claims it. It does not create a RallyHub tenant, RallyHub Club or player account.' : 'Adding a club here creates a request for a public directory listing. It does not create a RallyHub tenant, RallyHub Club or player account.'}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /><h2 className="font-bold">Already listed?</h2></div>
              <p className="text-sm text-muted-foreground mt-3">If you find your club in the directory, open the existing profile and choose <strong className="text-foreground">Claim this listing</strong> instead.</p>
              <Link to="/directory?manage=1" className="inline-flex mt-3 text-sm font-semibold text-primary hover:underline">Find and claim your club</Link>
            </div>
          </aside>
        </div>
      </main>
      <div className="px-4 pb-4"><PublicCopyrightFooter maxWidthClass="max-w-6xl" /></div>
      </div>
    </>
  );
}
