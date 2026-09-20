import React, { useMemo, useState } from 'react';
import { CheckCircle2, Lightbulb, MessageSquarePlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const TYPE_OPTIONS = [
  ['issue','Something isn’t working'],
  ['confusing','Something is confusing'],
  ['improvement','Suggestion or improvement'],
  ['feature_request','Feature request'],
  ['other','Other'],
];
const AREA_OPTIONS = [
  ['directory','Directory'],
  ['club_profile','Club profile'],
  ['sessions_venues','Sessions & venues'],
  ['login_access','Login & access'],
  ['rallyhub_club','RallyHub Club'],
  ['competitions','Competitions'],
  ['other','Other'],
];

export default function ClubFeedbackPanel({ listingSlug, clubName }) {
  const { user } = useAuth();
  const firstName = useMemo(() => {
    const name = String(user?.full_name || user?.display_name || '').trim();
    return name ? name.split(/\s+/)[0] : 'there';
  }, [user]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    feedbackType:'improvement',
    area:'directory',
    message:'',
    importance:'nice_to_have',
    contactOk:true,
  });

  const submit = async () => {
    if (!form.message.trim()) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke('clubFeedback', {
        action:'submit',
        listingSlug,
        clubName,
        feedbackType:form.feedbackType,
        area:form.area,
        message:form.message.trim(),
        importance:form.importance,
        contactOk:form.contactOk,
        pagePath:window.location.pathname + window.location.search,
        deviceType:window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1100 ? 'tablet' : 'desktop',
        userAgent:navigator.userAgent,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setDone(true);
    } catch (error) {
      window.alert(error?.message || 'Could not send your feedback right now.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" /><h2 className="text-xl font-bold">Help shape RallyHub</h2></div>
            <p className="text-sm text-muted-foreground mt-2">Found something confusing? Have an idea or feature you’d like to see? Send it directly to the RallyHub team.</p>
          </div>
          <Button type="button" onClick={() => { setDone(false); setOpen(true); }} className="gap-2 shrink-0"><MessageSquarePlus className="w-4 h-4" /> Send feedback</Button>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          {done ? (
            <div className="py-3">
              <CheckCircle2 className="w-11 h-11 text-primary" />
              <h2 className="text-2xl font-black mt-4">Thanks, {firstName}.</h2>
              <p className="text-sm text-muted-foreground mt-2">We appreciate your feedback. We’ll review it and make sure it is directed to the right place, whether that’s a fix, an improvement or our RallyHub development wishlist.</p>
              <Button className="mt-5 w-full" onClick={() => setOpen(false)}>Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Feedback & ideas</DialogTitle>
                <DialogDescription>Your name, club, email, page and device are attached automatically so you only need to tell us what you noticed.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">What type of feedback is this?</label>
                  <select value={form.feedbackType} onChange={e => setForm(v => ({...v,feedbackType:e.target.value}))} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {TYPE_OPTIONS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Which area?</label>
                  <select value={form.area} onChange={e => setForm(v => ({...v,area:e.target.value}))} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {AREA_OPTIONS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Tell us about it</label>
                  <Textarea value={form.message} onChange={e => setForm(v => ({...v,message:e.target.value}))} rows={7} className="mt-1" placeholder="What happened, what could be clearer, or what would you like RallyHub to do?" />
                </div>
                <div>
                  <label className="text-sm font-semibold">How important is this to your club?</label>
                  <select value={form.importance} onChange={e => setForm(v => ({...v,importance:e.target.value}))} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="nice_to_have">Nice to have</option>
                    <option value="important">Important</option>
                    <option value="blocking">Preventing us from doing something</option>
                  </select>
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-border p-3 cursor-pointer">
                  <input type="checkbox" checked={form.contactOk} onChange={e => setForm(v => ({...v,contactOk:e.target.checked}))} className="mt-1" />
                  <span className="text-sm"><strong>You can contact me about this feedback</strong><span className="block text-xs text-muted-foreground mt-0.5">Your signed-in email is used; you do not need to enter it again.</span></span>
                </label>
                <Button className="w-full" onClick={submit} disabled={busy || !form.message.trim()}>{busy ? 'Sending…' : 'Send feedback'}</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
