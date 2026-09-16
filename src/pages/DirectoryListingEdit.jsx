import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, CheckCircle2, Plus, Save, Trash2 } from 'lucide-react';
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
const emptyVenue = index => ({ id: `venue-${Date.now()}-${index}`, name: '', shortName: '', address: '', eircode: '', indoor: true, courts: '', latitude: '', longitude: '', mapUrl: '', websiteUrl: '', playType: '' });
const emptySession = (venueId='') => ({ id: `session-${Date.now()}`, venueId, day: 'Monday', start: '19:00', end: '', meetTime: '', level: 'Club Session', price: '', capacity: '', host: '', showPublicJoinLink: false, publicJoinUrl: '' });

function mergeProfile(seed, override) {
  if (!override) return clone(seed);
  return {
    ...clone(seed),
    ...override,
    contact: { ...(seed.contact || {}), ...(override.contact || {}) },
    venues: Array.isArray(override.venues) ? override.venues : clone(seed.venues || []),
    sessions: Array.isArray(override.sessions) ? override.sessions : clone(seed.sessions || []),
  };
}

export default function DirectoryListingEdit() {
  const { slug } = useParams();
  const seed = getClub(slug);
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const [access, setAccess] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const returnTo = useMemo(() => `/directory/${slug}/edit`, [slug]);

  useEffect(() => {
    if (!seed || !isAuthenticated) return;
    let active = true;
    setLoading(true);
    Promise.all([
      base44.functions.invoke('directoryClaim', { action: 'status', listingSlug: seed.slug }),
      base44.functions.invoke('directoryListingProfile', { action: 'public_get', listingSlug: seed.slug }),
    ]).then(([statusRes, profileRes]) => {
      if (!active) return;
      if (statusRes.data?.error) throw new Error(statusRes.data.error);
      if (profileRes.data?.error) throw new Error(profileRes.data.error);
      setAccess(statusRes.data);
      setForm(mergeProfile(seed, profileRes.data?.profile || null));
    }).catch(err => {
      if (active) setError(err.message || 'Could not load this listing.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [seed, isAuthenticated]);

  if (!seed) return <Navigate to="/directory" replace />;

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const setContact = (key, value) => setForm(prev => ({ ...prev, contact: { ...(prev.contact || {}), [key]: value } }));
  const setVenue = (index, key, value) => setForm(prev => ({ ...prev, venues: prev.venues.map((v, i) => i === index ? { ...v, [key]: value } : v) }));
  const setSession = (index, key, value) => setForm(prev => ({ ...prev, sessions: prev.sessions.map((s, i) => i === index ? { ...s, [key]: value } : s) }));

  const save = async () => {
    setSaving(true); setSaved(false); setError('');
    try {
      const res = await base44.functions.invoke('directoryListingProfile', { action: 'save', listingSlug: seed.slug, profile: form });
      if (res.data?.error) throw new Error(res.data.error);
      setForm(mergeProfile(seed, res.data.profile || {}));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setError(err.message || 'Could not save listing changes.');
    } finally { setSaving(false); }
  };

  const addVenue = () => setForm(prev => ({ ...prev, venues: [...(prev.venues || []), emptyVenue((prev.venues || []).length + 1)] }));
  const removeVenue = index => setForm(prev => {
    const removed = prev.venues[index]?.id;
    const venues = prev.venues.filter((_, i) => i !== index);
    const fallback = venues[0]?.id || '';
    const sessions = prev.sessions.map(s => s.venueId === removed ? { ...s, venueId: fallback } : s).filter(s => s.venueId);
    return { ...prev, venues, sessions };
  });
  const addSession = () => setForm(prev => ({ ...prev, sessions: [...(prev.sessions || []), emptySession(prev.venues?.[0]?.id || '')] }));
  const removeSession = index => setForm(prev => ({ ...prev, sessions: prev.sessions.filter((_, i) => i !== index) }));

  return (
    <>
      <Seo title={`Edit ${seed.name} | RallyHub Directory`} description={`Manage the public RallyHub directory listing for ${seed.name}.`} path={`/directory/${seed.slug}/edit`} robots="noindex,nofollow" />
      <div className="min-h-screen bg-[#0a1628] text-foreground">
        <PublicDirectoryHeader />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to={`/directory/${seed.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back to public listing</Link>

          {isLoadingAuth || !authChecked ? (
            <div className="glass rounded-2xl p-6">Checking sign-in…</div>
          ) : !isAuthenticated ? (
            <div className="glass rounded-2xl p-6">
              <h1 className="text-2xl font-black">Sign in to edit this listing</h1>
              <p className="text-sm text-muted-foreground mt-2">Only a verified directory editor can make changes.</p>
              <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`}><Button className="mt-4">Sign in</Button></Link>
            </div>
          ) : loading ? (
            <div className="glass rounded-2xl p-6">Loading your directory access…</div>
          ) : !access?.hasAccess && user?.role !== 'admin' ? (
            <div className="glass rounded-2xl p-6">
              <h1 className="text-2xl font-black">Verification required</h1>
              <p className="text-sm text-muted-foreground mt-2">You need verified directory-editor access before you can edit this club.</p>
              <Link to={`/directory/${seed.slug}/claim`}><Button className="mt-4">Claim this listing</Button></Link>
            </div>
          ) : form ? (
            <div className="space-y-6">
              <section className="glass rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">Verified directory editor</p>
                    <h1 className="text-3xl sm:text-4xl font-black mt-1">Edit {seed.name}</h1>
                    <p className="text-sm text-muted-foreground mt-2">The club name and county stay fixed to protect the directory identity. You can update the public information below.</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/directory/${seed.slug}`}><Button variant="outline">Preview listing</Button></Link>
                    <Button onClick={save} disabled={saving} className="gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}</Button>
                  </div>
                </div>
                {saved && <div className="mt-4 rounded-xl border border-green-400/30 bg-green-400/10 p-3 text-sm text-green-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Changes saved to the public directory listing.</div>}
                {error && <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              </section>

              <section className="glass rounded-2xl p-6 space-y-5">
                <h2 className="text-xl font-bold">Public club information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea value={form.description || ''} onChange={e => setField('description', e.target.value)} rows={4} /></div>
                  <div className="space-y-2"><Label>Membership / joining status</Label><Input value={form.membershipStatus || ''} onChange={e => setField('membershipStatus', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Policy heading</Label><Input value={form.policyLabel || ''} onChange={e => setField('policyLabel', e.target.value)} /></div>
                  <div className="space-y-2 sm:col-span-2"><Label>Guest / attendance information</Label><Textarea value={form.guestPolicy || ''} onChange={e => setField('guestPolicy', e.target.value)} rows={3} /></div>
                  <div className="space-y-2"><Label>Website</Label><Input value={form.website || ''} onChange={e => setField('website', e.target.value)} placeholder="https://…" /></div>
                  <div className="space-y-2"><Label>Logo URL</Label><Input value={form.logoUrl || ''} onChange={e => setField('logoUrl', e.target.value)} placeholder="https://…" /></div>
                  <div className="space-y-2"><Label>Facebook</Label><Input value={form.facebook || ''} onChange={e => setField('facebook', e.target.value)} placeholder="https://…" /></div>
                  <div className="space-y-2"><Label>Instagram</Label><Input value={form.instagram || ''} onChange={e => setField('instagram', e.target.value)} placeholder="https://…" /></div>
                  <div className="space-y-2"><Label>Joining / waiting-list link</Label><Input value={form.waitingListUrl || ''} onChange={e => setField('waitingListUrl', e.target.value)} placeholder="https://…" /></div>
                  <div className="space-y-2"><Label>Joining button label</Label><Input value={form.joiningCtaLabel || ''} onChange={e => setField('joiningCtaLabel', e.target.value)} placeholder="e.g. Join waiting list" /></div>
                </div>
              </section>

              <section className="glass rounded-2xl p-6 space-y-5">
                <h2 className="text-xl font-bold">Club contact</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Contact name</Label><Input value={form.contact?.name || ''} onChange={e => setContact('name', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Contact email</Label><Input type="email" value={form.contact?.email || ''} onChange={e => setContact('email', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Contact phone</Label><Input value={form.contact?.phone || ''} onChange={e => setContact('phone', e.target.value)} /></div>
                  <div className="space-y-2"><Label>WhatsApp link</Label><Input value={form.contact?.whatsapp || ''} onChange={e => setContact('whatsapp', e.target.value)} placeholder="https://wa.me/…" /></div>
                </div>
              </section>

              <section className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /><h2 className="text-xl font-bold">Venues</h2></div><Button variant="outline" size="sm" onClick={addVenue} className="gap-1"><Plus className="w-4 h-4" /> Add venue</Button></div>
                {(form.venues || []).map((venue, index) => (
                  <div key={venue.id || index} className="rounded-xl border border-border bg-background/30 p-4 space-y-3">
                    <div className="flex items-center justify-between"><p className="font-semibold">Venue {index + 1}</p><Button variant="ghost" size="sm" onClick={() => removeVenue(index)} className="text-destructive gap-1"><Trash2 className="w-4 h-4" /> Remove</Button></div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1"><Label>Name</Label><Input value={venue.name || ''} onChange={e => setVenue(index, 'name', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Short name</Label><Input value={venue.shortName || ''} onChange={e => setVenue(index, 'shortName', e.target.value)} /></div>
                      <div className="space-y-1 sm:col-span-2"><Label>Address</Label><Input value={venue.address || ''} onChange={e => setVenue(index, 'address', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Eircode / postcode</Label><Input value={venue.eircode || ''} onChange={e => setVenue(index, 'eircode', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Courts</Label><Input type="number" min="1" value={venue.courts ?? ''} onChange={e => setVenue(index, 'courts', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Venue type</Label><select value={venue.indoor === true ? 'indoor' : venue.indoor === false ? 'outdoor' : 'unknown'} onChange={e => setVenue(index, 'indoor', e.target.value === 'indoor' ? true : e.target.value === 'outdoor' ? false : null)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option><option value="unknown">Not specified</option></select></div>
                      <div className="space-y-1"><Label>Play type</Label><Input value={venue.playType || ''} onChange={e => setVenue(index, 'playType', e.target.value)} placeholder="e.g. Pay to play" /></div>
                      <div className="space-y-1 sm:col-span-2"><Label>Map link</Label><Input value={venue.mapUrl || ''} onChange={e => setVenue(index, 'mapUrl', e.target.value)} placeholder="https://…" /></div>
                    </div>
                  </div>
                ))}
              </section>

              <section className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" /><h2 className="text-xl font-bold">Weekly sessions</h2></div><Button variant="outline" size="sm" onClick={addSession} disabled={!form.venues?.length} className="gap-1"><Plus className="w-4 h-4" /> Add session</Button></div>
                {!form.venues?.length && <p className="text-sm text-muted-foreground">Add a venue before adding sessions.</p>}
                {(form.sessions || []).map((session, index) => (
                  <div key={session.id || index} className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                      <div className="space-y-1"><Label>Day</Label><select value={session.day || 'Monday'} onChange={e => setSession(index, 'day', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{weekDays.map(day => <option key={day}>{day}</option>)}</select></div>
                      <div className="space-y-1"><Label>Venue</Label><select value={session.venueId || ''} onChange={e => setSession(index, 'venueId', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{form.venues.map(v => <option key={v.id} value={v.id}>{v.shortName || v.name || 'Venue'}</option>)}</select></div>
                      <div className="space-y-1"><Label>Start</Label><Input type="time" value={session.start || ''} onChange={e => setSession(index, 'start', e.target.value)} /></div>
                      <div className="space-y-1"><Label>End</Label><Input type="time" value={session.end || ''} onChange={e => setSession(index, 'end', e.target.value)} /></div>
                      <div className="space-y-1 lg:col-span-2"><Label>Session / level</Label><Input value={session.level || ''} onChange={e => setSession(index, 'level', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Price</Label><Input type="number" min="0" step="0.5" value={session.price ?? ''} onChange={e => setSession(index, 'price', e.target.value)} /></div>
                      <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => removeSession(index)} className="text-destructive gap-1"><Trash2 className="w-4 h-4" /> Remove</Button></div>
                    </div>
                  </div>
                ))}
              </section>

              <div className="sticky bottom-4 flex justify-end pointer-events-none"><Button onClick={save} disabled={saving} size="lg" className="pointer-events-auto gap-2 shadow-xl"><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}</Button></div>
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
}
