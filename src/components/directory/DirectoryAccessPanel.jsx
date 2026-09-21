import React, { useEffect, useState } from 'react';
import { Crown, Loader2, Mail, MessageCircle, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const whatsappDigits = (phone, county = '') => {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) {
    const ni = new Set(['Antrim', 'Armagh', 'Down', 'Fermanagh', 'Londonderry', 'Derry', 'Tyrone']);
    digits = `${ni.has(String(county || '').trim()) ? '44' : '353'}${digits.slice(1)}`;
  }
  return digits;
};

export default function DirectoryAccessPanel({ listingSlug, clubName, county = '' }) {
  const [people, setPeople] = useState([]);
  const [pending, setPending] = useState([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [invite, setInvite] = useState({ name: '', email: '', phone: '' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'access_list', listingSlug });
      if (res.data?.error) throw new Error(res.data.error);
      setPeople(res.data?.people || []);
      setPending(res.data?.pendingInvitations || []);
      setCanManage(!!res.data?.canManageAccess);
    } catch (err) {
      setError(err?.message || 'Could not load directory access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [listingSlug]);

  const sendInvite = async (channel, event) => {
    event?.preventDefault?.();
    setError(''); setMessage(''); setBusy(channel);
    try {
      if (channel === 'email' && !invite.email.trim()) throw new Error('Enter an email address to send an email invitation.');
      if (channel === 'whatsapp' && !invite.phone.trim()) throw new Error('Enter a mobile number to send a WhatsApp invitation.');
      const res = await base44.functions.invoke('directoryClaim', {
        action: 'invite_editor',
        listingSlug,
        contactName: invite.name,
        contactEmail: invite.email,
        contactPhone: invite.phone,
        channel,
      });
      if (res.data?.error) throw new Error(res.data.error);
      if (channel === 'whatsapp') {
        const digits = whatsappDigits(invite.phone, county);
        if (!digits) throw new Error('Enter a valid mobile number for WhatsApp.');
        const firstName = invite.name.trim().split(/\s+/)[0] || 'there';
        const text = `Hi ${firstName},\n\nAs you know, RallyHub started out as a father-and-son project between Conall and me, really just trying to solve some of the things we needed for Clare Pickleball. It has grown legs a bit since then, and we’re now building out the Directory with clubs around Ireland. I’ve also been asked about including events and a few other things that would be useful to clubs, so *Events is probably the next area we’ll develop if clubs feel there’s a need for it.*\n\nI’ve invited you as a *Directory Editor* for ${clubName} because I’d really value your help testing the editing side of it from a club user’s point of view.\n\nThis gives you Directory editing access only. It doesn’t give access to RallyHub Club, tournaments, players or club administration.\n\n*Your secure editor link:*\n${res.data?.claimUrl}\n\nThis link is for you personally, is single-use and expires after 72 hours.\n\nIf you want a quick look at RallyHub first:\n*About RallyHub:* https://rallyhub.ie/about\n*1-page Directory Explainer:* https://rallyhub.ie/directory/story\n\nIf you need a hand getting started:\n*Club Guide & Help:* https://rallyhub.ie/directory/help\n*Quick Start Guide:* https://rallyhub.ie/directory/quick-start\n\nThere’s also a *Feedback* area in RallyHub for anything you spot, suggestions or wishlist ideas. The Events page is under construction too, so if you have thoughts on what would actually be useful there, I’d really like to hear them.\n\nDon’t be afraid to tell me what doesn’t make sense — that’s exactly what this beta testing is for.\n\nThanks for helping me get this right.\n\nYours in sport,\n*Brian Moore*\n087 810 0333`;
        window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        setMessage(`Secure WhatsApp invitation opened for ${invite.phone}. The link expires after 72 hours and can only be used once.`);
      } else {
        setMessage(`Secure Directory Editor invitation emailed to ${res.data?.email || invite.email}. It expires after 72 hours and can only be used once.`);
      }
      setInvite({ name: '', email: '', phone: '' });
      await load();
    } catch (err) {
      setError(err?.message || 'Could not create the editor invitation.');
    } finally {
      setBusy('');
    }
  };

  const removeEditor = async person => {
    if (!window.confirm(`Remove ${person.name || person.email || 'this editor'} from ${clubName}? They will immediately lose Directory editing access.`)) return;
    setError(''); setMessage(''); setBusy(person.id);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'revoke_editor', listingSlug, accessId: person.id });
      if (res.data?.error) throw new Error(res.data.error);
      setMessage(`${person.name || 'Directory editor'} no longer has editing access.`);
      await load();
    } catch (err) {
      setError(err?.message || 'Could not remove this editor.');
    } finally {
      setBusy('');
    }
  };

  return (
    <section id="access" className="glass rounded-2xl p-6 space-y-5 scroll-mt-24">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold">People with access</h2>
          <p className="text-sm text-muted-foreground mt-1">The Primary Owner remains responsible for this listing. Directory Editors can update public club information but cannot transfer ownership or add/remove other editors.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background/35 p-4 text-sm text-muted-foreground flex gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p><strong className="text-foreground">Security:</strong> delegated access uses a single-use 72-hour invitation tied to the chosen email address or mobile number. A forwarded link cannot be accepted by somebody whose verified details do not match the invitation. Primary Owner access cannot be removed from this screen.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading authorised people…</div>
      ) : (
        <div className="space-y-2">
          {people.map(person => (
            <div key={person.id} className="rounded-xl border border-border bg-background/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold truncate">{person.name}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${person.role === 'owner' ? 'bg-primary/15 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                    {person.role === 'owner' ? <Crown className="w-3 h-3" /> : null}
                    {person.role === 'owner' ? 'Primary Owner' : 'Directory Editor'}
                  </span>
                  {person.isCurrentUser && <span className="text-xs text-muted-foreground">You</span>}
                </div>
                {person.email && <p className="text-xs text-muted-foreground mt-1">{person.email}</p>}
              </div>
              {canManage && person.role === 'editor' && (
                <Button type="button" variant="outline" size="sm" disabled={busy === person.id} onClick={() => removeEditor(person)} className="text-destructive gap-1.5 shrink-0">
                  {busy === person.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Remove access
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && canManage && (
        <div>
          <h3 className="text-sm font-semibold">Pending invitations</h3>
          <div className="mt-2 space-y-2">
            {pending.map(item => <div key={item.id} className="rounded-lg border border-dashed border-border px-3 py-2 text-sm"><strong>{item.name || item.email}</strong><span className="text-muted-foreground"> · invitation awaiting acceptance</span></div>)}
          </div>
        </div>
      )}

      {canManage && (
        <form onSubmit={event => sendInvite('email', event)} className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary" /><h3 className="font-bold">Invite a Directory Editor</h3></div>
            <p className="text-xs text-muted-foreground mt-1">Use this for a trusted committee member, administrator, webmaster or designer who will help keep the listing current.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1"><Label htmlFor="directory-editor-name">Name</Label><Input id="directory-editor-name" value={invite.name} onChange={e => setInvite(v => ({ ...v, name: e.target.value }))} placeholder="e.g. Club webmaster" /></div>
            <div className="space-y-1"><Label htmlFor="directory-editor-email">Email <span className="text-muted-foreground">(for email invite)</span></Label><Input id="directory-editor-email" type="email" value={invite.email} onChange={e => setInvite(v => ({ ...v, email: e.target.value }))} placeholder="name@example.com" /></div>
            <div className="space-y-1 sm:col-span-2"><Label htmlFor="directory-editor-phone">Mobile <span className="text-muted-foreground">(for WhatsApp invite)</span></Label><Input id="directory-editor-phone" value={invite.phone} onChange={e => setInvite(v => ({ ...v, phone: e.target.value }))} placeholder="e.g. 087 123 4567" /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={!!busy || !invite.email.trim()} className="gap-2">
              {busy === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {busy === 'email' ? 'Sending email…' : 'Invite by email'}
            </Button>
            <Button type="button" variant="outline" disabled={!!busy || !invite.phone.trim()} onClick={event => sendInvite('whatsapp', event)} className="gap-2">
              {busy === 'whatsapp' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              {busy === 'whatsapp' ? 'Opening WhatsApp…' : 'Invite by WhatsApp'}
            </Button>
          </div>
        </form>
      )}

      {message && <div aria-live="polite" className="rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">{message}</div>}
      {error && <div aria-live="polite" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    </section>
  );
}
