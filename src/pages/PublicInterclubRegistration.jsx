import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
import { AppearanceQuickButton } from '@/components/appearance/AppearanceControls';
import { CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { INTERCLUB_MODULE_NAME } from '@/lib/interclubBranding';

const EMPTY = {
  fullName:'',
  email:'',
  mobile:'',
  gender:'',
  emergencyContactName:'',
  emergencyContactMobile:'',
  medicalNote:'',
  waiverAccepted:false,
  codeAccepted:false,
  privacyAcknowledged:false,
  photoVideoConsent:'',
};

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return String(value).slice(0,10);
  return date.toLocaleDateString([], { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

export default function PublicInterclubRegistration() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('interclubGuestRegistration', { token, action:'get' });
      if (res.data?.error) throw new Error(res.data.error);
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'This registration link is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const clubs = useMemo(() => data?.event ? [
    { name:data.event.clubAName, logo_url:data.event.clubALogo, primary_colour:data.event.clubAPrimary },
    { name:data.event.clubBName, logo_url:data.event.clubBLogo, primary_colour:data.event.clubBPrimary },
  ] : [], [data]);

  const set = (key, value) => setForm(f => ({ ...f, [key]:value }));

  const submit = async e => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await base44.functions.invoke('interclubGuestRegistration', {
        token,
        action:'submit',
        ...form,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setDone(res.data);
      window.scrollTo({ top:0, behavior:'smooth' });
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || 'Unable to complete registration.');
      window.scrollTo({ top:0, behavior:'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center p-5">
      <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
      <div className="text-center">
        <RallyHubPublicBrand moduleName={INTERCLUB_MODULE_NAME} pageLabel="Guest Player Registration"/>
        <RefreshCw className="mx-auto mt-6 h-7 w-7 animate-spin"/>
      </div>
    </div>
  );

  if (error && !data) return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center p-5">
      <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
      <div className="glass max-w-md rounded-2xl p-6 text-center">
        <RallyHubPublicBrand moduleName={INTERCLUB_MODULE_NAME} pageLabel="Guest Player Registration"/>
        <h1 className="mt-5 text-xl font-black">Registration unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
      <div className="mx-auto max-w-xl">
        <div className="glass rounded-2xl p-6 sm:p-8 text-center">
          <RallyHubPublicBrand moduleName={INTERCLUB_MODULE_NAME} pageLabel="Guest Player Registration" clubs={clubs}/>
          <CheckCircle2 className="mx-auto mt-7 h-12 w-12 text-primary"/>
          <h1 className="mt-4 text-2xl font-black">{done.alreadyRegistered ? 'You are already registered' : 'Registration complete'}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{done.message}</p>
          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="font-bold">{done.event?.teamName}</p>
            <p className="mt-1 text-muted-foreground">{done.event?.eventName}</p>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">No RallyHub membership has been created. Your registration is for this Interclub event only.</p>
        </div>
      </div>
    </div>
  );

  const event = data?.event || {};
  const legal = data?.legal || {};

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
      <div className="mx-auto max-w-2xl space-y-5">
        <header className="glass rounded-2xl p-5 sm:p-7 text-center">
          <RallyHubPublicBrand moduleName={INTERCLUB_MODULE_NAME} pageLabel="Guest Player Registration" clubs={clubs}/>
          <h1 className="mt-5 text-2xl sm:text-3xl font-black">{event.eventName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Registering for <strong className="text-foreground">{event.teamName}</strong></p>
          {(event.date || event.venue) && <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {event.date && <span className="rounded-full bg-secondary px-3 py-1.5">{formatDate(event.date)}</span>}
            {event.venue && <span className="rounded-full bg-secondary px-3 py-1.5">{event.venue}</span>}
          </div>}
          <p className="mt-4 text-xs text-muted-foreground">This is an event registration only. You do not need a RallyHub account and this does not create club membership.</p>
        </header>

        {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</div>}

        <form onSubmit={submit} className="space-y-5">
          <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black">Your details</h2>
              <p className="mt-1 text-xs text-muted-foreground">Used only to administer this Interclub event.</p>
            </div>
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={form.fullName} onChange={e=>set('fullName',e.target.value)} autoComplete="name" required className="mt-1.5 bg-secondary"/>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={e=>set('email',e.target.value)} autoComplete="email" required className="mt-1.5 bg-secondary"/></div>
              <div><Label htmlFor="mobile">Mobile</Label><Input id="mobile" type="tel" value={form.mobile} onChange={e=>set('mobile',e.target.value)} autoComplete="tel" required className="mt-1.5 bg-secondary"/></div>
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={v=>set('gender',v)}>
                <SelectTrigger className="mt-1.5 bg-secondary"><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black">Emergency information</h2>
              <p className="mt-1 text-xs text-muted-foreground">Only available to event administrators.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label htmlFor="emergencyName">Emergency contact name</Label><Input id="emergencyName" value={form.emergencyContactName} onChange={e=>set('emergencyContactName',e.target.value)} required className="mt-1.5 bg-secondary"/></div>
              <div><Label htmlFor="emergencyMobile">Emergency contact mobile</Label><Input id="emergencyMobile" type="tel" value={form.emergencyContactMobile} onChange={e=>set('emergencyContactMobile',e.target.value)} required className="mt-1.5 bg-secondary"/></div>
            </div>
            <div>
              <Label htmlFor="medicalNote">Anything an organiser should know in an emergency? <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <textarea id="medicalNote" value={form.medicalNote} onChange={e=>set('medicalNote',e.target.value)} rows={3} maxLength={1200} className="mt-1.5 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Leave blank if there is nothing relevant."/>
            </div>
          </section>

          <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/><h2 className="text-lg font-black">Event waiver & conduct</h2></div>

            <details className="rounded-xl border bg-secondary/30 p-4">
              <summary className="cursor-pointer font-bold text-sm">{legal.waiverTitle || 'Event waiver'}</summary>
              <div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground">{legal.waiverText}</div>
            </details>
            <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4" checked={form.waiverAccepted} onChange={e=>set('waiverAccepted',e.target.checked)} required/>
              <span><strong>I have read and accept the event waiver and release conditions.</strong></span>
            </label>

            <details className="rounded-xl border bg-secondary/30 p-4">
              <summary className="cursor-pointer font-bold text-sm">{legal.codeTitle || 'Code of Conduct'}</summary>
              <div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground">{legal.codeText}</div>
            </details>
            <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4" checked={form.codeAccepted} onChange={e=>set('codeAccepted',e.target.checked)} required/>
              <span><strong>I have read and agree to follow the RallyHub Interclub Code of Conduct.</strong></span>
            </label>
          </section>

          <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black">Privacy & photos</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{legal.privacyText}</p>
            </div>
            <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4" checked={form.privacyAcknowledged} onChange={e=>set('privacyAcknowledged',e.target.checked)} required/>
              <span>I understand how my information will be used for this event.</span>
            </label>
            <div className="rounded-xl border p-4">
              <p className="text-sm font-bold">Photos or video may be taken during the event for event reporting and club/RallyHub publicity. Do you consent to your image being used?</p>
              <div className="mt-3 flex gap-5 text-sm">
                <label className="flex items-center gap-2"><input type="radio" name="photoVideo" value="yes" checked={form.photoVideoConsent==='yes'} onChange={()=>set('photoVideoConsent','yes')} required/> Yes</label>
                <label className="flex items-center gap-2"><input type="radio" name="photoVideo" value="no" checked={form.photoVideoConsent==='no'} onChange={()=>set('photoVideoConsent','no')} required/> No</label>
              </div>
            </div>
          </section>

          <Button type="submit" className="w-full min-h-12 text-base font-bold" disabled={submitting || !form.gender || !form.photoVideoConsent}>
            {submitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin"/>Submitting…</> : 'Complete Event Registration'}
          </Button>
          <p className="pb-8 text-center text-[11px] text-muted-foreground">Your Social / Improver category and team ranking are managed separately by the team organisers.</p>
        </form>
      </div>
    </div>
  );
}
