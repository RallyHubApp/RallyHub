import React, { useMemo, useState } from 'react';
import { CheckCircle2, Lightbulb, MessageSquarePlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const TYPE_OPTIONS = [
  ['improvement','Suggestion or improvement'],
  ['feature_request','Suggest a resource / feature'],
  ['confusing','Something is confusing'],
  ['issue','Something is not working'],
  ['other','Other'],
];

export default function LearnFeedbackDialog({ club }) {
  const { user } = useAuth();
  const firstName = useMemo(() => {
    const name = String(user?.full_name || user?.display_name || '').trim();
    return name ? name.split(/\s+/)[0] : 'there';
  }, [user]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ feedbackType:'feature_request', message:'', importance:'nice_to_have', contactOk:true });

  const submit = async () => {
    if (!form.message.trim()) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke('clubFeedback', {
        action:'submit',
        listingSlug:club?.slug || club?.id || 'rallyhub-club',
        clubName:club?.name || 'RallyHub Club',
        feedbackType:form.feedbackType,
        area:'learn',
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
      <Button type="button" variant="outline" onClick={() => { setDone(false); setOpen(true); }} className="gap-2">
        <Lightbulb className="h-4 w-4" /> Suggest / feedback
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          {done ? (
            <div className="py-3">
              <CheckCircle2 className="h-11 w-11 text-primary" />
              <h2 className="mt-4 text-2xl font-black">Thanks, {firstName}.</h2>
              <p className="mt-2 text-sm text-muted-foreground">Your suggestion has been sent through RallyHub and added to the feedback queue.</p>
              <Button className="mt-5 w-full" onClick={() => setOpen(false)}>Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Suggestions & feedback</DialogTitle>
                <DialogDescription>Suggest a resource, flag something confusing, or tell us what would make Learn more useful.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">What would you like to send?</label>
                  <select value={form.feedbackType} onChange={e => setForm(v => ({...v,feedbackType:e.target.value}))} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {TYPE_OPTIONS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Tell us about it</label>
                  <Textarea value={form.message} onChange={e => setForm(v => ({...v,message:e.target.value}))} rows={7} className="mt-1" placeholder="For example: Could we add a simple guide for King of the Court on three courts?" />
                </div>
                <div>
                  <label className="text-sm font-semibold">How important is this to you?</label>
                  <select value={form.importance} onChange={e => setForm(v => ({...v,importance:e.target.value}))} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="nice_to_have">Nice to have</option>
                    <option value="important">Important</option>
                    <option value="blocking">Preventing me from doing something</option>
                  </select>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
                  <input type="checkbox" checked={form.contactOk} onChange={e => setForm(v => ({...v,contactOk:e.target.checked}))} className="mt-1" />
                  <span className="text-sm"><strong>You can contact me about this</strong><span className="mt-0.5 block text-xs text-muted-foreground">Your signed-in account is attached automatically.</span></span>
                </label>
                <Button className="w-full gap-2" onClick={submit} disabled={busy || !form.message.trim()}><MessageSquarePlus className="h-4 w-4" />{busy ? 'Sending…' : 'Send suggestion / feedback'}</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
