import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Mail, MessageCircle, Phone, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const LISTING_SLUG = 'clare-pickleball';

function StatusRow({ ok, children }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}
      <span className="text-foreground">{children}</span>
    </div>
  );
}

export default function ProtectedContactActionPreview() {
  const { user } = useAuth();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolverResult, setResolverResult] = useState(null);
  const [resolverBusy, setResolverBusy] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);

  const loadPreview = async () => {
    setLoading(true);
    setError('');
    setResolverResult(null);
    try {
      const res = await base44.functions.invoke('directoryContactAction', { action:'admin_preview', listingSlug:LISTING_SLUG });
      if (res.data?.error) throw new Error(res.data.error);
      setPreview(res.data || null);
    } catch (err) {
      setError(err?.message || 'Could not load the protected-contact preview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPreview(); }, []);

  if (user?.role !== 'admin') return <Navigate to="/app" replace />;

  const testResolve = async channel => {
    setResolverBusy(channel);
    setResolverResult(null);
    try {
      const res = await base44.functions.invoke('directoryContactAction', { action:'admin_test_resolve', listingSlug:LISTING_SLUG, channel });
      if (res.data?.error) throw new Error(res.data.error);
      setResolverResult(res.data || null);
    } catch (err) {
      setResolverResult({ error:err?.message || 'Resolver test failed.' });
    } finally {
      setResolverBusy('');
    }
  };

  const card = preview?.card;
  const checks = preview?.checks || {};

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Preview only · not live
            </div>
            <h1 className="text-3xl font-black tracking-tight">Protected Contact Actions</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">Step 2 architecture preview. The feature flag remains off and the live Directory has not been switched to this contact layer.</p>
          </div>
          <div className="flex gap-2">
            <a href="/directory/clare-pickleball" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted">
              Live profile <ExternalLink className="h-4 w-4" />
            </a>
            <Button variant="outline" onClick={loadPreview} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</div>}

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading protected-contact preview…</div>
        ) : card ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">What a visitor would see</p>
                  <h2 className="mt-2 text-2xl font-black">Contact {card.listingName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{card.contact.displayName} · {card.contact.role}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <button type="button" disabled={!card.actions.call || !!resolverBusy} onClick={() => testResolve('call')} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-primary-foreground transition-opacity disabled:opacity-40">
                    <Phone className="h-6 w-6" /><span className="font-bold">Call club</span>
                  </button>
                  <button type="button" disabled={!card.actions.whatsapp || !!resolverBusy} onClick={() => testResolve('whatsapp')} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-4 transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40">
                    <MessageCircle className="h-6 w-6 text-primary" /><span className="font-bold">WhatsApp club</span>
                  </button>
                  <button type="button" disabled={!card.actions.email} onClick={() => setEmailOpen(true)} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-4 transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40">
                    <Mail className="h-6 w-6 text-primary" /><span className="font-bold">Email club</span>
                  </button>
                </div>

                <div className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  <ShieldCheck className="mr-2 inline h-4 w-4 text-primary" />{card.privacyCopy}
                </div>

                {resolverResult && (
                  <div className={`mt-4 rounded-2xl border p-4 text-sm ${resolverResult.error ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                    {resolverResult.error ? resolverResult.error : (
                      <><strong>{resolverResult.channel === 'call' ? 'Call' : 'WhatsApp'} resolver passed.</strong> Destination available privately as {resolverResult.destinationMasked}; no raw destination was returned to this preview.</>
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg font-black">Preview safety check</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <StatusRow ok={checks.rawPhoneAbsent}>Raw phone number absent from the contact-card payload</StatusRow>
                  <StatusRow ok={checks.rawEmailAbsent}>Raw email address absent from the contact-card payload</StatusRow>
                  <StatusRow ok={checks.directDestinationAbsent}>No tel:, mailto: or WhatsApp destination in the contact-card payload</StatusRow>
                  <StatusRow ok={preview.liveDirectoryWired === false}>Live Directory is not wired to the new layer</StatusRow>
                  <StatusRow ok={preview.featureFlagEnabled === false}>Feature flag is OFF</StatusRow>
                  <StatusRow ok={preview.legacyPublicContactStillPresent === true}>Existing public contact remains untouched for this preview stage</StatusRow>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-border bg-card p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Private endpoint</p>
                <h2 className="mt-2 text-lg font-black">Stored behind the resolver</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Phone</span><strong>{preview.privateEndpointMasked?.phone}</strong></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Email</span><strong>{preview.privateEndpointMasked?.email}</strong></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">WhatsApp</span><strong>{preview.privateEndpointMasked?.whatsappConfigured ? 'Configured' : 'Not configured'}</strong></div>
                </div>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">Only masked diagnostics are returned on this admin preview. The public contact card receives availability, name/role and labels — not the underlying destinations.</p>
              </section>

              <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                <h2 className="font-black">Rollout state</h2>
                <p className="mt-2 text-sm leading-6">Protected endpoint created for Clare Pickleball. Email enquiries are designed to be sent by RallyHub and stored separately from general analytics. No live visitor currently uses this path.</p>
              </section>
            </aside>
          </div>
        ) : null}
      </div>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Email {card?.listingName || 'club'}</DialogTitle>
            <DialogDescription>The live version will send this through RallyHub without revealing the organiser email address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <label className="block text-sm font-semibold">Your name<input className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-normal" placeholder="Your name" /></label>
            <label className="block text-sm font-semibold">Your email<input type="email" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-normal" placeholder="you@example.com" /></label>
            <label className="block text-sm font-semibold">Message<textarea rows={5} className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 font-normal" placeholder="How can the club help?" /></label>
            <Button className="w-full" disabled>Send through RallyHub · disabled in preview</Button>
            <p className="text-center text-xs text-muted-foreground">No email will be sent from this preview screen.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
