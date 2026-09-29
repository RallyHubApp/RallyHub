import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Loader2, Mail, MessageCircle, Phone, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react';
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
  const [actionState, setActionState] = useState({ call:'idle', whatsapp:'idle' });
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailPreviewState, setEmailPreviewState] = useState('idle');
  const [rollbackBusy, setRollbackBusy] = useState(false);
  const [rollbackMessage, setRollbackMessage] = useState('');

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
    if (resolverBusy || actionState[channel] === 'success') return;
    setResolverBusy(channel);
    setActionState(current => ({ ...current, [channel]:'working' }));
    setResolverResult(null);
    try {
      const res = await base44.functions.invoke('directoryContactAction', { action:'admin_test_resolve', listingSlug:LISTING_SLUG, channel });
      if (res.data?.error) throw new Error(res.data.error);
      setResolverResult(res.data || null);
      setActionState(current => ({ ...current, [channel]:'success' }));
      window.setTimeout(() => setActionState(current => ({ ...current, [channel]:'idle' })), 5000);
    } catch (err) {
      setResolverResult({ error:err?.message || 'Resolver test failed.' });
      setActionState(current => ({ ...current, [channel]:'error' }));
      window.setTimeout(() => setActionState(current => ({ ...current, [channel]:'idle' })), 5000);
    } finally {
      setResolverBusy('');
    }
  };

  const previewEmailResponse = () => {
    if (emailPreviewState === 'sending' || emailPreviewState === 'sent') return;
    setEmailPreviewState('sending');
    window.setTimeout(() => setEmailPreviewState('sent'), 700);
  };

  const actionLabel = channel => {
    const state = actionState[channel];
    if (state === 'working') return channel === 'call' ? 'Starting call…' : 'Opening WhatsApp…';
    if (state === 'success') return channel === 'call' ? 'Call opened ✓' : 'WhatsApp opened ✓';
    if (state === 'error') return 'Please try again';
    return channel === 'call' ? 'Call club' : 'WhatsApp club';
  };

  const rollbackToLegacy = async () => {
    if (rollbackBusy) return;
    setRollbackBusy(true);
    setRollbackMessage('');
    try {
      const res = await base44.functions.invoke('directoryContactAction', {
        action:'admin_set_rollout',
        listingSlug:LISTING_SLUG,
        mode:'legacy',
        fallbackEnabled:true,
        reason:'Manual super-admin rollback from protected-contact pilot.',
      });
      if (res.data?.error) throw new Error(res.data.error);
      setRollbackMessage('Clare Pickleball returned to legacy mode.');
      await loadPreview();
    } catch (err) {
      setRollbackMessage(err?.message || 'Could not roll Clare back to legacy mode.');
    } finally {
      setRollbackBusy(false);
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
                  <button type="button" disabled={!card.actions.call || !!resolverBusy || actionState.call === 'success'} onClick={() => testResolve('call')} aria-live="polite" className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-primary-foreground transition-opacity disabled:opacity-70">
                    {actionState.call === 'working' ? <Loader2 className="h-6 w-6 animate-spin" /> : actionState.call === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
                    <span className="font-bold">{actionLabel('call')}</span>
                    {actionState.call === 'working' && <span className="text-xs opacity-80">Please don’t tap again</span>}
                  </button>
                  <button type="button" disabled={!card.actions.whatsapp || !!resolverBusy || actionState.whatsapp === 'success'} onClick={() => testResolve('whatsapp')} aria-live="polite" className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-4 transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-70">
                    {actionState.whatsapp === 'working' ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : actionState.whatsapp === 'success' ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <MessageCircle className="h-6 w-6 text-primary" />}
                    <span className="font-bold">{actionLabel('whatsapp')}</span>
                    {actionState.whatsapp === 'working' && <span className="text-xs text-muted-foreground">Please don’t tap again</span>}
                  </button>
                  <button type="button" disabled={!card.actions.email} onClick={() => { setEmailPreviewState('idle'); setEmailOpen(true); }} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-4 transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40">
                    <Mail className="h-6 w-6 text-primary" /><span className="font-bold">Email club</span>
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Live behaviour: a tap changes state immediately, locks the action while it is being processed, then confirms that the phone/WhatsApp hand-off has opened. Email confirms only after RallyHub has successfully sent it.</p>

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
                  <StatusRow ok={preview.featureFlagEnabled === false}>Global feature flag is {preview.featureFlagEnabled ? 'ON' : 'OFF'}</StatusRow>
                  <StatusRow ok={['legacy','protected_pilot'].includes(preview.rolloutMode)}>Clare rollout mode is {String(preview.rolloutMode || 'legacy').replace('_',' ').toUpperCase()}</StatusRow>
                  <StatusRow ok={preview.fallbackEnabled === true}>Immediate per-listing fallback is armed</StatusRow>
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
                <div className="mt-4 rounded-2xl border border-border bg-background/70 p-3 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Pilot mode</span><strong>{String(preview.rolloutMode || 'legacy').replace('_',' ').toUpperCase()}</strong></div>
                  <div className="mt-2 flex justify-between gap-3"><span className="text-muted-foreground">Fallback</span><strong>{preview.fallbackEnabled ? 'ARMED' : 'OFF'}</strong></div>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">If the Clare pilot misbehaves, RallyHub can return this listing to legacy mode without changing any other club. The global feature flag remains a second kill switch.</p>
                {preview.rolloutMode !== 'legacy' && (
                  <Button type="button" variant="outline" className="mt-4 w-full border-amber-500/50 text-amber-700 dark:text-amber-300" disabled={rollbackBusy} onClick={rollbackToLegacy}>
                    {rollbackBusy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Rolling back…</> : 'Rollback Clare to legacy'}
                  </Button>
                )}
                {rollbackMessage && <p className="mt-2 text-xs font-semibold" aria-live="polite">{rollbackMessage}</p>}
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
            {emailPreviewState !== 'sent' ? (
              <>
                <label className="block text-sm font-semibold">Your name<input className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-normal" placeholder="Your name" /></label>
                <label className="block text-sm font-semibold">Your email<input type="email" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-normal" placeholder="you@example.com" /></label>
                <label className="block text-sm font-semibold">Message<textarea rows={5} className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 font-normal" placeholder="How can the club help?" /></label>
                <Button className="w-full" onClick={previewEmailResponse} disabled={emailPreviewState === 'sending'}>
                  {emailPreviewState === 'sending' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : 'Preview send response'}
                </Button>
                <p className="text-center text-xs text-muted-foreground">Preview only: no email is actually sent. In the live version the button stays locked until RallyHub confirms successful delivery.</p>
              </>
            ) : (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center" aria-live="polite">
                <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
                <p className="mt-3 text-lg font-black">Email sent ✓</p>
                <p className="mt-1 text-sm text-muted-foreground">Your enquiry has been sent through RallyHub. You do not need to press anything again.</p>
                <Button variant="outline" className="mt-4" onClick={() => setEmailOpen(false)}>Done</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
