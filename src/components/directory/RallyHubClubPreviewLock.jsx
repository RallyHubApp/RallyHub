import React, { useState } from 'react';
import { BarChart3, Crown, Lock, Trophy, Upload, Users, LayoutDashboard, Shield, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const FEATURES = [
  ['Dashboard', LayoutDashboard],
  ['Players & members', Users],
  ['Import players', Upload],
  ['Create competition', Trophy],
  ['Tournaments & competitions', Trophy],
  ['Club leaderboard', Crown],
  ['Analytics', BarChart3],
  ['Club administration', Shield],
];

const INTEREST_OPTIONS = [
  'Club & member management',
  'Sessions & attendance',
  'King of the Court',
  'RallyHub Interclub',
  'Tournaments & competitions',
  'Spond integration',
  'Leaderboards & player profiles',
];

export default function RallyHubClubPreviewLock({ listingSlug, clubName }) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    interestType: 'demo',
    contactPhone: user?.directory_mobile || '',
    features: [],
  });

  const show = () => { setDone(false); setOpen(true); };
  const toggle = feature => setForm(current => ({
    ...current,
    features: current.features.includes(feature)
      ? current.features.filter(item => item !== feature)
      : [...current.features, feature],
  }));

  const submit = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    setBusy(true);
    try {
      const res = await base44.functions.invoke('rallyHubClubInterest', {
        action: 'submit',
        listingSlug,
        clubName,
        contactName: user?.full_name || user?.display_name || '',
        contactEmail: user?.email || '',
        contactPhone: form.contactPhone,
        interestType: form.interestType,
        features: form.features,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setDone(true);
    } catch (error) {
      window.alert(error?.message || 'Could not add you to the RallyHub Club waiting list right now.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-border bg-muted/20 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /><h2 className="text-xl font-bold">RallyHub Club</h2></div>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">RallyHub Club is still under development. These features are shown so you can see what is planned, but they are not available for general use yet.</p>
          </div>
          <Button type="button" variant="outline" onClick={show} className="shrink-0">Join waiting list</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
          {FEATURES.map(([label, Icon]) => (
            <button key={label} type="button" onClick={show} className="rounded-xl border border-border bg-background/30 p-3 text-left opacity-55 hover:opacity-80 transition-opacity cursor-pointer">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground mt-2 flex items-center gap-1.5"><Lock className="w-3 h-3" /> {label}</p>
            </button>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          {done ? (
            <div className="py-3">
              <CheckCircle2 className="w-11 h-11 text-primary" />
              <h2 className="text-2xl font-black mt-4">You’re on the list</h2>
              <p className="text-sm text-muted-foreground mt-2">Thanks. We’ll contact you when RallyHub Club demos or further information become available.</p>
              <p className="text-xs text-muted-foreground mt-3">Your free RallyHub Directory listing remains completely separate and available.</p>
              <Button className="mt-5 w-full" onClick={() => setOpen(false)}>Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>RallyHub Club is still under development</DialogTitle>
                <DialogDescription>RallyHub Club is not yet available for general use. If you would like a demo, further information, or to be notified when it becomes available, join the waiting list.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                  <strong>Your Directory listing stays separate.</strong>
                  <span className="block text-muted-foreground mt-1">Joining this waiting list does not change your free RallyHub Directory access.</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">I’m interested in</p>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[['demo','A demo'],['information','More information'],['notify','Launch updates']].map(([value,label]) => (
                      <button key={value} type="button" onClick={() => setForm(v => ({...v, interestType:value}))} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${form.interestType===value?'border-primary bg-primary/10 text-primary':'border-border text-muted-foreground'}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold">Features you’d like to hear about</p>
                  <div className="grid sm:grid-cols-2 gap-2 mt-2">
                    {INTEREST_OPTIONS.map(feature => (
                      <label key={feature} className="flex items-start gap-2 rounded-lg border border-border p-2 text-xs cursor-pointer">
                        <input type="checkbox" checked={form.features.includes(feature)} onChange={() => toggle(feature)} className="mt-0.5" />
                        <span>{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold">Mobile number</label>
                  <input value={form.contactPhone} onChange={e => setForm(v => ({...v, contactPhone:e.target.value}))} placeholder="Optional mobile number" className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" />
                </div>
                <Button className="w-full" onClick={submit} disabled={busy}>{busy ? 'Adding you…' : 'Join the RallyHub Club waiting list'}</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
