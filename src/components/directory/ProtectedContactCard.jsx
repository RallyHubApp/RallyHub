import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Mail, MessageCircle, Phone, ShieldCheck, TriangleAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trackSiteEvent } from '@/lib/site-analytics';

const newRequestId = prefix => {
  try { return `${prefix}:${crypto.randomUUID()}`; } catch { return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2)}`; }
};

export default function ProtectedContactCard({ listingSlug, clubName, county, entityLabel = 'club' }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionState, setActionState] = useState({ call:'idle', whatsapp:'idle' });
  const [actionError, setActionError] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailState, setEmailState] = useState('idle');
  const [emailError, setEmailError] = useState('');
  const [emailForm, setEmailForm] = useState({ name:'', email:'', message:'', website:'' });
  const emailRequestId = useRef('');
  const activeRequests = useRef({ call:'', whatsapp:'' });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    base44.functions.invoke('directoryContactAction', { action:'public_card', listingSlug })
      .then(res => {
        if (!active) return;
        if (res.data?.error) throw new Error(res.data.error);
        setCard(res.data?.card || null);
      })
      .catch(err => { if (active) setLoadError(err?.message || 'Contact options are temporarily unavailable.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [listingSlug]);

  const clearLater = channel => window.setTimeout(() => {
    setActionState(current => ({ ...current, [channel]:'idle' }));
    activeRequests.current[channel] = '';
  }, 5000);

  const runAction = async channel => {
    if (actionState[channel] === 'working' || actionState[channel] === 'success') return;
    setActionError('');
    setActionState(current => ({ ...current, [channel]:'working' }));
    const requestId = activeRequests.current[channel] || newRequestId(channel);
    activeRequests.current[channel] = requestId;
    let pendingWindow = null;
    if (channel === 'whatsapp') {
      try { pendingWindow = window.open('', '_blank'); } catch {}
    }
    try {
      const res = await base44.functions.invoke('directoryContactAction', {
        action:'resolve', listingSlug, channel, requestId,
      });
      if (res.data?.error) throw new Error(res.data.error);
      const actionUrl = String(res.data?.actionUrl || '');
      if (!actionUrl) throw new Error('Contact hand-off was not available.');
      setActionState(current => ({ ...current, [channel]:'success' }));
      trackSiteEvent(channel === 'call' ? 'club_call_click' : 'club_whatsapp_click', {
        clubSlug:listingSlug,
        clubName,
        county,
        metadata:{ surface:'protected_contact', protected:true },
      });
      if (channel === 'whatsapp') {
        if (pendingWindow && !pendingWindow.closed) pendingWindow.location.href = actionUrl;
        else window.location.href = actionUrl;
      } else {
        window.location.href = actionUrl;
      }
      clearLater(channel);
    } catch (err) {
      try { if (pendingWindow && !pendingWindow.closed) pendingWindow.close(); } catch {}
      setActionState(current => ({ ...current, [channel]:'error' }));
      setActionError(err?.message || 'Could not start that contact action.');
      clearLater(channel);
    }
  };

  const labelFor = channel => {
    const state = actionState[channel];
    if (state === 'working') return channel === 'call' ? 'Starting call…' : 'Opening WhatsApp…';
    if (state === 'success') return channel === 'call' ? 'Call opened ✓' : 'WhatsApp opened ✓';
    if (state === 'error') return 'Please try again';
    return channel === 'call' ? `Call ${entityLabel}` : `WhatsApp ${entityLabel}`;
  };

  const openEmail = () => {
    setEmailState('idle');
    setEmailError('');
    emailRequestId.current = '';
    setEmailOpen(true);
  };

  const submitEmail = async event => {
    event.preventDefault();
    if (emailState === 'sending' || emailState === 'sent') return;
    setEmailState('sending');
    setEmailError('');
    if (!emailRequestId.current) emailRequestId.current = newRequestId('email');
    try {
      const res = await base44.functions.invoke('directoryContactAction', {
        action:'send_email',
        listingSlug,
        requestId:emailRequestId.current,
        name:emailForm.name,
        email:emailForm.email,
        message:emailForm.message,
        website:emailForm.website,
        sourcePath:window.location.pathname,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setEmailState('sent');
      trackSiteEvent('club_email_click', {
        clubSlug:listingSlug,
        clubName,
        county,
        metadata:{ surface:'protected_contact', protected:true, verifiedEnquiry:true },
      });
    } catch (err) {
      setEmailState('error');
      setEmailError(err?.message || 'Could not send your enquiry right now.');
    }
  };

  return (
    <>
      <section className="glass rounded-2xl p-5" aria-label={`Contact ${clubName}`}>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{entityLabel === 'club' ? 'Club contact' : 'Listing contact'}</p>
        <h2 className="text-xl font-bold mt-1">{card?.contact?.displayName ? `Contact ${card.contact.displayName}` : `Contact ${clubName}`}</h2>
        {card?.contact?.role && <p className="mt-1 text-sm text-muted-foreground">{card.contact.role}</p>}

        {loading ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border p-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading contact options…</div>
        ) : loadError || !card ? (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <div className="flex items-start gap-2"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span>Contact options are temporarily unavailable. Please try again shortly.</span></div>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {!card.actions?.call && !card.actions?.whatsapp && !card.actions?.email && (
              <div className="rounded-xl border border-border p-3 text-sm text-muted-foreground">No direct contact details have been supplied yet.</div>
            )}
            {card.actions?.call && (
              <button type="button" disabled={actionState.call === 'working' || actionState.call === 'success'} onClick={() => runAction('call')} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:border-primary/40 disabled:opacity-70" aria-live="polite">
                {actionState.call === 'working' ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : actionState.call === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Phone className="h-4 w-4 text-primary" />}
                <span className="text-sm font-semibold">{labelFor('call')}</span>
                {actionState.call === 'working' && <span className="ml-auto text-xs text-muted-foreground">Please don’t tap again</span>}
              </button>
            )}
            {card.actions?.whatsapp && (
              <button type="button" disabled={actionState.whatsapp === 'working' || actionState.whatsapp === 'success'} onClick={() => runAction('whatsapp')} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:border-primary/40 disabled:opacity-70" aria-live="polite">
                {actionState.whatsapp === 'working' ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : actionState.whatsapp === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <MessageCircle className="h-4 w-4 text-primary" />}
                <span className="text-sm font-semibold">{labelFor('whatsapp')}</span>
                {actionState.whatsapp === 'working' && <span className="ml-auto text-xs text-muted-foreground">Please don’t tap again</span>}
              </button>
            )}
            {card.actions?.email && (
              <button type="button" onClick={openEmail} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:border-primary/40">
                <Mail className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Email {entityLabel}</span>
              </button>
            )}
            {actionError && <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{actionError}</p>}
            <p className="pt-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-primary" />{card.privacyCopy}</p>
          </div>
        )}
      </section>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Email {clubName}</DialogTitle>
            <DialogDescription>Your enquiry is sent through RallyHub. The recipient’s email address is not published to your browser.</DialogDescription>
          </DialogHeader>
          {emailState === 'sent' ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center" aria-live="polite">
              <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
              <p className="mt-3 text-lg font-black">Email sent ✓</p>
              <p className="mt-1 text-sm text-muted-foreground">Your enquiry has been sent through RallyHub. You do not need to press anything again.</p>
              <Button variant="outline" className="mt-4" onClick={() => setEmailOpen(false)}>Done</Button>
            </div>
          ) : (
            <form onSubmit={submitEmail} className="space-y-4 pt-2">
              <label className="block text-sm font-semibold">Your name<input value={emailForm.name} onChange={e => setEmailForm(v => ({...v,name:e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-normal" placeholder="Your name" /></label>
              <label className="block text-sm font-semibold">Your email<input required type="email" value={emailForm.email} onChange={e => setEmailForm(v => ({...v,email:e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-normal" placeholder="you@example.com" /></label>
              <label className="block text-sm font-semibold">Message<textarea required minLength={5} rows={5} value={emailForm.message} onChange={e => setEmailForm(v => ({...v,message:e.target.value}))} className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 font-normal" placeholder="How can they help?" /></label>
              <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={emailForm.website} onChange={e => setEmailForm(v => ({...v,website:e.target.value}))} className="hidden" />
              {emailError && <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{emailError}</p>}
              <Button type="submit" className="w-full" disabled={emailState === 'sending'}>
                {emailState === 'sending' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : 'Send through RallyHub'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">The send button stays locked while RallyHub is processing your enquiry.</p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
