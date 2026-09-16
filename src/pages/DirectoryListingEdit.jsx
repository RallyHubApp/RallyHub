import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building2, CalendarDays, CheckCircle2, Copy, ExternalLink, Globe2,
  Image as ImageIcon, Info, Loader2, MapPin, Plus, Save, Trash2, Upload, UserRound
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getClub, weekDays } from '@/data/directorySeed';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Seo from '@/components/public/Seo';

const clone = value => JSON.parse(JSON.stringify(value));
const emptyVenue = index => ({
  id: `venue-${Date.now()}-${index}`, name: '', shortName: '', address: '', eircode: '', indoor: null,
  courts: '', latitude: '', longitude: '', mapUrl: '', websiteUrl: '', playType: ''
});
const newSessionId = () => `session-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
const emptySession = venueId => ({
  id: newSessionId(), venueId: venueId || '', day: 'Monday', meetTime: '', start: '19:00', end: '',
  level: 'Club Session', price: '', paymentMethod: '', capacity: '', host: '', showPublicJoinLink: false, publicJoinUrl: ''
});

function mergeProfile(base, override) {
  if (!base) return null;
  if (!override) return clone(base);
  return {
    ...clone(base),
    ...override,
    contact: { ...(base.contact || {}), ...(override.contact || {}) },
    venues: Array.isArray(override.venues) ? override.venues : clone(base.venues || []),
    sessions: Array.isArray(override.sessions) ? override.sessions : clone(base.sessions || []),
  };
}

const isValidUrl = value => {
  if (!String(value || '').trim()) return true;
  try { return ['http:', 'https:'].includes(new URL(String(value).trim()).protocol); } catch { return false; }
};
const isValidEmail = value => !String(value || '').trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export default function DirectoryListingEdit() {
  const { slug } = useParams();
  const seed = getClub(slug);
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const [baseClub, setBaseClub] = useState(seed || null);
  const [access, setAccess] = useState(null);
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState('');
  const [loadingListing, setLoadingListing] = useState(true);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recentSessionId, setRecentSessionId] = useState('');
  const [sessionNotice, setSessionNotice] = useState('');
  const [error, setError] = useState('');
  const [validation, setValidation] = useState([]);
  const returnTo = useMemo(() => `/directory/${slug}/edit`, [slug]);
  const dirty = !!form && !!baseline && JSON.stringify(form) !== baseline;

  useEffect(() => {
    let active = true;
    setLoadingListing(true);
    base44.functions.invoke('directoryListingProfile', { action: 'public_get', listingSlug: slug })
      .then(res => {
        if (!active || res.data?.error) return;
        const resolvedBase = seed || res.data?.base || null;
        setBaseClub(resolvedBase);
        if (resolvedBase) {
          const merged = mergeProfile(resolvedBase, res.data?.profile || null);
          setForm(merged);
          setBaseline(JSON.stringify(merged));
        }
      })
      .catch(err => { if (active) setError(err.message || 'Could not load this listing.'); })
      .finally(() => { if (active) setLoadingListing(false); });
    return () => { active = false; };
  }, [slug, seed]);

  useEffect(() => {
    if (!isAuthenticated || !baseClub) return;
    let active = true;
    setLoadingAccess(true);
    base44.functions.invoke('directoryClaim', { action: 'status', listingSlug: slug })
      .then(res => {
        if (!active) return;
        if (res.data?.error) throw new Error(res.data.error);
        setAccess(res.data);
      })
      .catch(err => { if (active) setError(err.message || 'Could not check your directory access.'); })
      .finally(() => { if (active) setLoadingAccess(false); });
    return () => { active = false; };
  }, [isAuthenticated, baseClub, slug]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setField = (key, value) => { setSaved(false); setFieldState(prev => ({ ...prev, [key]: value })); };
  const setFieldState = updater => setForm(prev => typeof updater === 'function' ? updater(prev) : updater);
  const setContact = (key, value) => { setSaved(false); setForm(prev => ({ ...prev, contact: { ...(prev.contact || {}), [key]: value } })); };
  const setVenue = (index, key, value) => { setSaved(false); setForm(prev => ({ ...prev, venues: prev.venues.map((v, i) => i === index ? { ...v, [key]: value } : v) })); };
  const setSession = (index, key, value) => { setSaved(false); setForm(prev => ({ ...prev, sessions: prev.sessions.map((s, i) => i === index ? { ...s, [key]: value } : s) })); };

  const validate = () => {
    const issues = [];
    if (!String(form?.description || '').trim()) issues.push('Add a short public club description.');
    if (!isValidEmail(form?.contact?.email)) issues.push('The club contact email is not valid.');
    [
      ['Website', form?.website], ['Facebook', form?.facebook], ['Instagram', form?.instagram],
      ['Joining link', form?.waitingListUrl], ['WhatsApp link', form?.contact?.whatsapp]
    ].forEach(([label, value]) => { if (!isValidUrl(value)) issues.push(`${label} must be a full http:// or https:// link.`); });
    (form?.venues || []).forEach((venue, index) => {
      if (!String(venue.name || '').trim()) issues.push(`Venue ${index + 1} needs a name.`);
      if (!isValidUrl(venue.mapUrl)) issues.push(`Venue ${index + 1} map link is not valid.`);
      if (!isValidUrl(venue.websiteUrl)) issues.push(`Venue ${index + 1} website link is not valid.`);
    });
    (form?.sessions || []).forEach((session, index) => {
      if (!session.venueId) issues.push(`Session ${index + 1} needs a venue.`);
      if (!session.start) issues.push(`Session ${index + 1} needs a start time.`);
      if (session.showPublicJoinLink && !isValidUrl(session.publicJoinUrl)) issues.push(`Session ${index + 1} public join link is not valid.`);
      if (session.showPublicJoinLink && !String(session.publicJoinUrl || '').trim()) issues.push(`Session ${index + 1} needs a public join link or the join-link option should be switched off.`);
    });
    setValidation(issues);
    return issues.length === 0;
  };

  const save = async () => {
    if (!form || !validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true); setSaved(false); setError('');
    try {
      const res = await base44.functions.invoke('directoryListingProfile', { action: 'save', listingSlug: slug, profile: form });
      if (res.data?.error) throw new Error(res.data.error);
      const merged = mergeProfile(baseClub, res.data.profile || {});
      setForm(merged);
      setBaseline(JSON.stringify(merged));
      setValidation([]);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 5000);
    } catch (err) {
      setError(err.message || 'Could not save listing changes.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { setSaving(false); }
  };

  const uploadLogo = async file => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) { setError('Please choose an image file for the club logo.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Club logo must be 5 MB or smaller.'); return; }
    setUploadingLogo(true); setError(''); setSaved(false);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (!file_url) throw new Error('No file URL returned');
      setField('logoUrl', file_url);
    } catch (err) {
      setError(err?.message || 'Could not upload the club logo.');
    } finally { setUploadingLogo(false); }
  };

  const addVenue = () => { setSaved(false); setForm(prev => ({ ...prev, venues: [...(prev.venues || []), emptyVenue((prev.venues || []).length + 1)] })); };
  const removeVenue = index => {
    const venue = form?.venues?.[index];
    const linkedSessions = (form?.sessions || []).filter(s => s.venueId === venue?.id).length;
    const msg = linkedSessions ? `Remove ${venue?.name || 'this venue'}? ${linkedSessions} linked session${linkedSessions === 1 ? '' : 's'} will also be removed.` : `Remove ${venue?.name || 'this venue'}?`;
    if (!window.confirm(msg)) return;
    setSaved(false);
    setForm(prev => {
      const removed = prev.venues[index]?.id;
      const venues = prev.venues.filter((_, i) => i !== index);
      const sessions = prev.sessions.filter(s => s.venueId !== removed);
      return { ...prev, venues, sessions };
    });
  };
  const revealSession = (id, message) => {
    setRecentSessionId(id);
    setSessionNotice(message);
    window.setTimeout(() => document.getElementById(`session-card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    window.setTimeout(() => setRecentSessionId(current => current === id ? '' : current), 2200);
    window.setTimeout(() => setSessionNotice(current => current === message ? '' : current), 3200);
  };
  const addSession = () => {
    if (!form?.venues?.length) { setSessionNotice('Add a venue before adding a weekly session.'); return; }
    const created = emptySession(form.venues[0]?.id || '');
    setSaved(false);
    setForm(prev => ({ ...prev, sessions: [...(prev.sessions || []), created] }));
    revealSession(created.id, 'New blank session added — complete the details below.');
  };
  const cloneSession = index => {
    const source = form?.sessions?.[index];
    if (!source) return;
    const duplicated = { ...clone(source), id: newSessionId() };
    setSaved(false);
    setForm(prev => {
      const sessions = [...(prev.sessions || [])];
      sessions.splice(index + 1, 0, duplicated);
      return { ...prev, sessions };
    });
    revealSession(duplicated.id, 'Session duplicated — edit only the details that are different.');
  };
  const removeSession = index => {
    if (!window.confirm('Remove this weekly session?')) return;
    setSaved(false);
    setForm(prev => ({ ...prev, sessions: prev.sessions.filter((_, i) => i !== index) }));
  };

  if (!loadingListing && !baseClub) return <Navigate to="/directory" replace />;

  return (
    <>
      <Seo title={`Edit ${baseClub?.name || 'Directory Listing'} | RallyHub`} description="Manage a verified RallyHub public directory listing." path={`/directory/${slug}/edit`} robots="noindex,nofollow" />
      <div className="min-h-screen bg-[#0a1628] text-foreground">
        <PublicDirectoryHeader />
        <main className="container mx-auto px-4 py-7 max-w-6xl">
          <div className="flex items-center justify-between gap-3 mb-5">
            <Link to={`/directory/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to public listing</Link>
            {dirty && <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">Unsaved changes</span>}
          </div>

          {isLoadingAuth || !authChecked || loadingListing ? (
            <div className="glass rounded-2xl p-6">Loading directory editor…</div>
          ) : !isAuthenticated ? (
            <div className="glass rounded-2xl p-7 max-w-xl mx-auto text-center">
              <h1 className="text-2xl font-black">Sign in to manage this listing</h1>
              <p className="text-sm text-muted-foreground mt-2">Only a verified directory editor can make changes.</p>
              <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`}><Button className="mt-5">Sign in</Button></Link>
            </div>
          ) : loadingAccess ? (
            <div className="glass rounded-2xl p-6">Checking your directory access…</div>
          ) : !access?.hasAccess && user?.role !== 'admin' ? (
            <div className="glass rounded-2xl p-7 max-w-xl mx-auto text-center">
              <h1 className="text-2xl font-black">Verification required</h1>
              <p className="text-sm text-muted-foreground mt-2">You need verified directory-editor access before you can edit this club.</p>
              <Link to={`/directory/${slug}/claim`}><Button className="mt-5">Claim this listing</Button></Link>
            </div>
          ) : form ? (
            <div className="space-y-5">
              <section className="glass rounded-2xl p-6 sm:p-7 overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">Verified directory editor</p>
                    <h1 className="text-3xl sm:text-4xl font-black mt-1 truncate">{baseClub.name}</h1>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border px-2.5 py-1">County {baseClub.county}</span>
                      <span className="rounded-full border border-border px-2.5 py-1">{form.venues?.length || 0} venues</span>
                      <span className="rounded-full border border-border px-2.5 py-1">{form.sessions?.length || 0} weekly sessions</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 max-w-2xl">Keep the public listing accurate. Club name and county are locked to protect the directory identity.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Link to={`/directory/${slug}`}><Button variant="outline" className="gap-2"><ExternalLink className="w-4 h-4" /> View public listing</Button></Link>
                    <Button onClick={save} disabled={saving || !dirty} className="gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</Button>
                  </div>
                </div>
                <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 text-sm">
                  <a href="#basics" className="shrink-0 rounded-lg bg-background/50 border border-border px-3 py-2 hover:border-primary/40">Club info</a>
                  <a href="#contact" className="shrink-0 rounded-lg bg-background/50 border border-border px-3 py-2 hover:border-primary/40">Contact</a>
                  <a href="#venues" className="shrink-0 rounded-lg bg-background/50 border border-border px-3 py-2 hover:border-primary/40">Venues</a>
                  <a href="#sessions" className="shrink-0 rounded-lg bg-background/50 border border-border px-3 py-2 hover:border-primary/40">Sessions</a>
                </nav>
                {saved && <div className="mt-4 rounded-xl border border-green-400/30 bg-green-400/10 p-3 text-sm text-green-300 flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Changes are live in the public directory.</span><Link to={`/directory/${slug}`} className="font-semibold hover:underline">View updated listing</Link></div>}
                {error && <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                {validation.length > 0 && <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm"><p className="font-semibold text-amber-200">Please fix these before saving:</p><ul className="mt-2 list-disc pl-5 space-y-1 text-muted-foreground">{validation.map(item => <li key={item}>{item}</li>)}</ul></div>}
              </section>

              <section id="basics" className="glass rounded-2xl p-6 space-y-5 scroll-mt-24">
                <div className="flex items-center gap-2"><Info className="w-5 h-5 text-primary" /><h2 className="text-xl font-bold">Public club information</h2></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2"><Label>Club description</Label><Textarea value={form.description || ''} onChange={e => setField('description', e.target.value)} rows={4} placeholder="Tell players what your club is about, where you play and who you welcome." /><p className="text-xs text-muted-foreground">This is the main introduction players see in search and on your club page.</p></div>
                  <div className="space-y-2"><Label>Membership / joining status</Label><Input value={form.membershipStatus || ''} onChange={e => setField('membershipStatus', e.target.value)} placeholder="e.g. New members welcome" /></div>
                  <div className="space-y-2"><Label>Information heading</Label><Input value={form.policyLabel || ''} onChange={e => setField('policyLabel', e.target.value)} placeholder="e.g. Joining information" /></div>
                  <div className="space-y-2 sm:col-span-2"><Label>Guest / attendance information</Label><Textarea value={form.guestPolicy || ''} onChange={e => setField('guestPolicy', e.target.value)} rows={3} placeholder="What should someone know before attending?" /></div>
                  <div className="space-y-2"><Label>Website</Label><Input value={form.website || ''} onChange={e => setField('website', e.target.value)} placeholder="https://…" /></div>
                  <div className="space-y-2"><Label>Joining / waiting-list link</Label><Input value={form.waitingListUrl || ''} onChange={e => setField('waitingListUrl', e.target.value)} placeholder="https://…" /></div>
                  <div className="space-y-2"><Label>Joining button label</Label><Input value={form.joiningCtaLabel || ''} onChange={e => setField('joiningCtaLabel', e.target.value)} placeholder="e.g. Join waiting list" /></div>
                  <div className="space-y-2"><Label>Facebook page</Label><Input type="url" value={form.facebook || ''} onChange={e => setField('facebook', e.target.value)} placeholder="https://facebook.com/…" /><p className="text-xs text-muted-foreground">Only the Facebook button is shown publicly — not this full link as text.</p></div>
                  <div className="space-y-2"><Label>Instagram page</Label><Input type="url" value={form.instagram || ''} onChange={e => setField('instagram', e.target.value)} placeholder="https://instagram.com/…" /><p className="text-xs text-muted-foreground">Only the Instagram button is shown publicly — not this full link as text.</p></div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Club logo</Label>
                    <div className="rounded-xl border border-border bg-background/30 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      {form.logoUrl && isValidUrl(form.logoUrl) ? <img src={form.logoUrl} alt="Club logo preview" className="h-24 w-24 rounded-xl bg-white object-contain p-1 shrink-0" /> : <div className="h-24 w-24 rounded-xl border border-dashed border-border flex items-center justify-center shrink-0"><ImageIcon className="w-6 h-6 text-muted-foreground" /></div>}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                            {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {uploadingLogo ? 'Uploading…' : form.logoUrl ? 'Replace logo' : 'Upload logo'}
                            <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={e => { uploadLogo(e.target.files?.[0]); e.target.value = ''; }} />
                          </label>
                          {form.logoUrl && <Button type="button" variant="outline" onClick={() => setField('logoUrl', '')}>Remove logo</Button>}
                        </div>
                        <p className="text-xs text-muted-foreground">Public visitors see the logo image, not a raw logo-link field. JPG, PNG or other common image formats up to 5 MB.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="contact" className="glass rounded-2xl p-6 space-y-5 scroll-mt-24">
                <div className="flex items-center gap-2"><UserRound className="w-5 h-5 text-primary" /><h2 className="text-xl font-bold">Public club contact</h2></div>
                <p className="text-sm text-muted-foreground">These details are shown publicly. They can be different from the private contact details used to verify your account.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Contact name</Label><Input value={form.contact?.name || ''} onChange={e => setContact('name', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Contact email</Label><Input type="email" value={form.contact?.email || ''} onChange={e => setContact('email', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Contact phone</Label><Input value={form.contact?.phone || ''} onChange={e => setContact('phone', e.target.value)} placeholder="e.g. 087 123 4567" /></div>
                  <div className="space-y-2"><Label>WhatsApp link</Label><Input value={form.contact?.whatsapp || ''} onChange={e => setContact('whatsapp', e.target.value)} placeholder="https://wa.me/353…" /></div>
                </div>
              </section>

              <section id="venues" className="glass rounded-2xl p-6 space-y-4 scroll-mt-24">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /><h2 className="text-xl font-bold">Venues</h2></div><p className="text-sm text-muted-foreground mt-1">Add every regular place where the club plays.</p></div><Button variant="outline" size="sm" onClick={addVenue} className="gap-1"><Plus className="w-4 h-4" /> Add venue</Button></div>
                {(form.venues || []).length === 0 && <div className="rounded-xl border border-dashed border-border p-6 text-center"><MapPin className="w-6 h-6 mx-auto text-muted-foreground" /><p className="text-sm text-muted-foreground mt-2">No venues added yet.</p><Button variant="outline" size="sm" onClick={addVenue} className="mt-3">Add first venue</Button></div>}
                {(form.venues || []).map((venue, index) => (
                  <div key={venue.id || index} className="rounded-xl border border-border bg-background/30 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{venue.name || `Venue ${index + 1}`}</p><p className="text-xs text-muted-foreground">Venue {index + 1}</p></div><Button variant="ghost" size="sm" onClick={() => removeVenue(index)} className="text-destructive gap-1"><Trash2 className="w-4 h-4" /> Remove</Button></div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1"><Label>Name</Label><Input value={venue.name || ''} onChange={e => setVenue(index, 'name', e.target.value)} placeholder="Venue name" /></div>
                      <div className="space-y-1"><Label>Short name</Label><Input value={venue.shortName || ''} onChange={e => setVenue(index, 'shortName', e.target.value)} placeholder="Used on session cards" /></div>
                      <div className="space-y-1 sm:col-span-2"><Label>Address</Label><Input value={venue.address || ''} onChange={e => setVenue(index, 'address', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Eircode / postcode</Label><Input value={venue.eircode || ''} onChange={e => setVenue(index, 'eircode', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Courts</Label><Input type="number" min="1" value={venue.courts ?? ''} onChange={e => setVenue(index, 'courts', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Venue type</Label><select value={venue.indoor === true ? 'indoor' : venue.indoor === false ? 'outdoor' : 'unknown'} onChange={e => setVenue(index, 'indoor', e.target.value === 'indoor' ? true : e.target.value === 'outdoor' ? false : null)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="unknown">Not specified</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option></select></div>
                      <div className="space-y-1"><Label>Who can play here?</Label><select value={venue.playType || ''} onChange={e => setVenue(index, 'playType', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Not specified</option>{venue.playType && !['Members only','Members and invited guests','Guests welcome','Public / open play','Pay to play','Contact club'].includes(venue.playType) && <option value={venue.playType}>{venue.playType}</option>}<option value="Members only">Members only</option><option value="Members and invited guests">Members and invited guests</option><option value="Guests welcome">Guests welcome</option><option value="Public / open play">Public / open play</option><option value="Pay to play">Pay to play</option><option value="Contact club">Contact club</option></select><p className="text-xs text-muted-foreground">This is public and helps players know whether they may attend.</p></div>
                      <div className="space-y-1"><Label>Venue website</Label><Input value={venue.websiteUrl || ''} onChange={e => setVenue(index, 'websiteUrl', e.target.value)} placeholder="https://…" /></div>
                      <div className="space-y-1"><Label>Map link</Label><Input value={venue.mapUrl || ''} onChange={e => setVenue(index, 'mapUrl', e.target.value)} placeholder="https://maps…" /></div>
                    </div>
                  </div>
                ))}
              </section>

              <section id="sessions" className="glass rounded-2xl p-6 space-y-4 scroll-mt-24">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" /><h2 className="text-xl font-bold">Weekly sessions</h2></div><p className="text-sm text-muted-foreground mt-1">Keep recurring public sessions current. Duplicate a similar session to save retyping the same venue, level, price and booking details.</p></div><Button type="button" variant="outline" size="sm" onClick={addSession} disabled={!form.venues?.length} className="gap-1" data-testid="directory-add-session"><Plus className="w-4 h-4" /> Add blank session</Button></div>
                {sessionNotice && <div aria-live="polite" data-testid="directory-session-notice" className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">{sessionNotice}</div>}
                {!form.venues?.length && <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">Add a venue before adding weekly sessions.</div>}
                {(form.sessions || []).map((session, index) => (
                  <div id={`session-card-${session.id || index}`} data-testid="directory-session-card" key={session.id || index} className={`rounded-xl border bg-background/30 p-4 sm:p-5 space-y-4 transition-all ${recentSessionId === session.id ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{session.day} · {session.start || 'Time pending'} · {session.level || 'Club session'}</p><p className="text-xs text-muted-foreground">Weekly session {index + 1}</p></div><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="sm" onClick={() => cloneSession(index)} className="gap-1" data-testid="directory-clone-session"><Copy className="w-4 h-4" /> Duplicate</Button><Button type="button" variant="ghost" size="sm" onClick={() => removeSession(index)} className="text-destructive gap-1"><Trash2 className="w-4 h-4" /> Remove</Button></div></div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="space-y-1"><Label>Day</Label><select value={session.day || 'Monday'} onChange={e => setSession(index, 'day', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{weekDays.map(day => <option key={day}>{day}</option>)}</select></div>
                      <div className="space-y-1"><Label>Venue</Label><select value={session.venueId || ''} onChange={e => setSession(index, 'venueId', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{form.venues.map(v => <option key={v.id} value={v.id}>{v.shortName || v.name || 'Venue'}</option>)}</select></div>
                      <div className="space-y-1"><Label>Meet time <span className="text-muted-foreground">(optional)</span></Label><Input type="time" value={session.meetTime || ''} onChange={e => setSession(index, 'meetTime', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Start</Label><Input type="time" value={session.start || ''} onChange={e => setSession(index, 'start', e.target.value)} /></div>
                      <div className="space-y-1"><Label>End <span className="text-muted-foreground">(optional)</span></Label><Input type="time" value={session.end || ''} onChange={e => setSession(index, 'end', e.target.value)} /></div>
                      <div className="space-y-1 lg:col-span-2"><Label>Session / level</Label><Input value={session.level || ''} onChange={e => setSession(index, 'level', e.target.value)} placeholder="e.g. Social, Improver, Match Play" /></div>
                      <div className="space-y-1"><Label>Price (€)</Label><Input type="number" min="0" step="0.5" value={session.price ?? ''} onChange={e => setSession(index, 'price', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Payment</Label><select value={session.paymentMethod || ''} onChange={e => setSession(index, 'paymentMethod', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Not specified</option><option value="Cash">Cash</option><option value="Online">Online</option><option value="Pay at venue">Pay at venue</option><option value="Included in membership">Included in membership</option><option value="Contact club">Contact club</option></select></div>
                      <div className="space-y-1"><Label>Capacity</Label><Input type="number" min="1" value={session.capacity ?? ''} onChange={e => setSession(index, 'capacity', e.target.value)} /></div>
                      <div className="space-y-1 lg:col-span-2"><Label>Host / organiser <span className="text-muted-foreground">(optional)</span></Label><Input value={session.host || ''} onChange={e => setSession(index, 'host', e.target.value)} /></div>
                      <div className="lg:col-span-4 rounded-xl border border-border bg-background/40 p-3">
                        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={session.showPublicJoinLink === true} onChange={e => setSession(index, 'showPublicJoinLink', e.target.checked)} className="mt-1 h-4 w-4 accent-primary" /><span className="text-sm"><strong>Show a public booking / join link</strong><span className="block text-xs text-muted-foreground mt-0.5">Use this only if anyone viewing the directory is allowed to open the booking page.</span></span></label>
                        {session.showPublicJoinLink && <div className="mt-3"><Label>Public join link</Label><Input className="mt-1" value={session.publicJoinUrl || ''} onChange={e => setSession(index, 'publicJoinUrl', e.target.value)} placeholder="https://…" /></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              <div className="sticky bottom-3 z-20 rounded-2xl border border-border bg-[#0d1b2d]/95 backdrop-blur-xl p-3 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm"><p className="font-semibold">{dirty ? 'You have unsaved changes' : 'All changes saved'}</p><p className="text-xs text-muted-foreground">Changes become public as soon as you save.</p></div>
                <div className="flex gap-2"><Link to={`/directory/${slug}`}><Button variant="outline" className="gap-2"><Globe2 className="w-4 h-4" /> View listing</Button></Link><Button onClick={save} disabled={saving || !dirty} size="lg" className="gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}</Button></div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
}
