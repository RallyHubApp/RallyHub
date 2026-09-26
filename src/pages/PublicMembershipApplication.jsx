import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, RefreshCw, Repeat2, ShieldCheck, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';

const EMPTY_FORM = {
  fullName:'', fullPostalAddress:'', postalCode:'', email:'', mobile:'', dateOfBirth:'',
  emergencyContactName:'', emergencyContactRelationship:'', emergencyMobile:''
};

function money(value,currency='EUR'){
  try { return new Intl.NumberFormat('en-IE',{style:'currency',currency}).format(Number(value||0)); }
  catch { return '€' + Number(value||0).toFixed(2); }
}

function LegalBlock({ doc, checked, onChange }) {
  if (!doc) return null;
  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-border bg-secondary/20">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 mt-0.5 text-primary shrink-0" />
          <div>
            <h3 className="font-bold text-foreground">{doc.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">Version {doc.version}{doc.required ? ' · Required' : ' · Optional'}</p>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="max-h-80 overflow-y-auto rounded-xl bg-secondary/20 border border-border p-4 text-sm leading-6 whitespace-pre-wrap text-foreground/90">
          {doc.bodyText}
        </div>
        {doc.type !== 'photo_video' && (
          <label className="mt-4 flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={checked === true} onChange={e => onChange(e.target.checked)} className="mt-1 h-4 w-4" />
            <span className="text-sm font-medium leading-6">{doc.consentLabel || 'I have read and agree to this.'}</span>
          </label>
        )}
      </div>
    </section>
  );
}

export default function PublicMembershipApplication() {
  const { clubSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('choose');
  const [applicationType, setApplicationType] = useState('');
  const [lookup, setLookup] = useState({ email:'', dateOfBirth:'' });
  const [renewalToken, setRenewalToken] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [changedFields, setChangedFields] = useState([]);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [consents, setConsents] = useState({
    privacy:false, liability_waiver:false, code_of_conduct:false,
    health_declaration:false, membership_terms:false, photoVideo:''
  });
  const [application, setApplication] = useState(null);

  const club = config?.club || {};
  const legal = config?.legal || {};
  const feeLabel = useMemo(() => money(config?.membershipFee, config?.currency || 'EUR'), [config]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    base44.functions.invoke('membershipApplication',{action:'public_get',clubSlug})
      .then(res => {
        if (!active) return;
        if (res.data?.error) throw new Error(res.data.error);
        setConfig(res.data?.config || null);
      })
      .catch(err => { if (active) setError(err?.message || 'Membership applications are unavailable.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [clubSlug]);

  const statusToken = searchParams.get('application') || application?.publicToken || '';
  useEffect(() => {
    if (!config || !statusToken) return;
    let active = true;
    let timer;
    const check = async () => {
      try {
        const res = await base44.functions.invoke('membershipApplication',{action:'public_status',clubSlug,applicationToken:statusToken});
        if (!active || res.data?.error) return;
        const next = res.data?.application;
        if (next) {
          setApplication(next);
          setStep(next.paymentStatus === 'paid' || next.status === 'approved' ? 'complete' : 'payment');
        }
      } catch {}
    };
    check();
    timer = window.setInterval(check, 5000);
    return () => { active = false; if (timer) window.clearInterval(timer); };
  }, [config, clubSlug, statusToken]);

  const chooseType = type => {
    setError('');
    setApplicationType(type);
    if (type === 'renewal') setStep('renewal_lookup');
    else { setForm(EMPTY_FORM); setStep('details'); }
  };

  const verifyRenewal = async e => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await base44.functions.invoke('membershipApplication',{
        action:'public_lookup_renewal',clubSlug,email:lookup.email,dateOfBirth:lookup.dateOfBirth
      });
      if (res.data?.error) throw new Error(res.data.error);
      setRenewalToken(res.data?.renewalToken || '');
      setForm({ ...EMPTY_FORM, ...(res.data?.profile || {}) });
      setChangedFields([]);
      setReviewConfirmed(false);
      setStep('details');
    } catch (err) {
      setError(err?.message || 'We could not verify your renewal details.');
    } finally { setBusy(false); }
  };

  const updateField = (key,value) => {
    setForm(prev => ({...prev,[key]:value}));
    if (applicationType === 'renewal') setChangedFields(prev => prev.includes(key) ? prev : [...prev,key]);
  };

  const validateDetails = () => {
    if (!form.fullName.trim() || form.fullName.trim().split(/\s+/).length < 2) return 'Please enter your full name.';
    if (!form.fullPostalAddress.trim()) return 'Please enter your full postal address.';
    if (!form.postalCode.trim()) return 'Please enter your Eircode / postcode.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Please enter a valid email address.';
    if (form.mobile.replace(/\D/g,'').length < 8) return 'Please enter a valid mobile number.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) return 'Please enter your date of birth.';
    if (Number(config?.minimumAge||0) > 0) {
      const birth = new Date(`${form.dateOfBirth}T12:00:00Z`);
      const now = new Date();
      const eligible = new Date(Date.UTC(birth.getUTCFullYear()+Number(config.minimumAge),birth.getUTCMonth(),birth.getUTCDate(),12));
      if (!Number.isFinite(birth.getTime()) || now.getTime() < eligible.getTime()) return `${club?.name||'This club'} currently requires applicants to be ${config.minimumAge} or over.`;
    }
    if (!form.emergencyContactName.trim() || form.emergencyMobile.replace(/\D/g,'').length < 8) return 'Please provide an emergency contact name and mobile number.';
    if (applicationType === 'renewal' && !reviewConfirmed) return 'Please confirm that you have reviewed all of your details.';
    return '';
  };

  const goToDeclarations = e => {
    e.preventDefault();
    const message = validateDetails();
    if (message) { setError(message); return; }
    setError('');
    setStep('declarations');
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const submitApplication = async () => {
    const required = [
      ['privacy','Data Protection consent'],
      ['liability_waiver','Liability Waiver'],
      ['code_of_conduct','Code of Conduct'],
      ['health_declaration','Health Declaration'],
      ['membership_terms','Membership Conditions']
    ];
    const missing = required.find(([key]) => consents[key] !== true);
    if (missing) { setError('Please accept the ' + missing[1] + '.'); return; }
    if (!['yes','no'].includes(consents.photoVideo)) { setError('Please choose Yes or No for Photography/Video consent.'); return; }
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('membershipApplication',{
        action:'public_submit',clubSlug,applicationType,renewalToken,
        ...form,changedFields,dataReviewConfirmed:applicationType === 'renewal' ? reviewConfirmed : true,
        consents
      });
      if (res.data?.error) throw new Error(res.data.error);
      const next = res.data?.application;
      setApplication(next);
      if (next?.publicToken) {
        const params = new URLSearchParams(searchParams);
        params.set('application',next.publicToken);
        setSearchParams(params,{replace:true});
      }
      setStep(next?.paymentStatus === 'paid' || next?.status === 'approved' ? 'complete' : 'payment');
      window.scrollTo({top:0,behavior:'smooth'});
    } catch (err) {
      setError(err?.message || 'Your application could not be submitted.');
    } finally { setBusy(false); }
  };

  const retryPayment = async () => {
    if (!statusToken) return;
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('membershipApplication',{action:'public_retry_payment',clubSlug,applicationToken:statusToken});
      if (res.data?.error) throw new Error(res.data.error);
      setApplication(res.data?.application || null);
    } catch (err) {
      setError(err?.message || 'Could not create a new payment link.');
    } finally { setBusy(false); }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!config) return <div className="min-h-screen bg-background text-foreground flex flex-col"><main className="flex-1 container mx-auto max-w-2xl px-4 py-12"><div className="glass rounded-2xl p-6"><h1 className="text-xl font-bold">Membership unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error || 'Membership applications are not open at the moment.'}</p><Link to="/directory" className="inline-flex mt-5 text-primary font-semibold">Back to Directory</Link></div></main><PublicCopyrightFooter /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between gap-4">
          <Link to={'/directory/' + clubSlug} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Club page</Link>
          <div className="text-right text-xs text-muted-foreground">Powered by <strong>RallyHub</strong></div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-7 sm:py-10 space-y-6">
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 text-center shadow-sm" style={{borderTop:'7px solid ' + (club.primary_colour || '#2563eb')}}>
            {club.logo_url && <img src={club.logo_url} alt={(club.name || 'Club') + ' logo'} className="mx-auto h-20 w-20 rounded-2xl bg-white object-contain p-1.5 shadow-sm" />}
            <h1 className="mt-4 text-2xl sm:text-3xl font-black">{config.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{config.seasonLabel} · {feeLabel}</p>
          </section>

          {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

          {step === 'choose' && (
            <section className="space-y-4">
              <div><h2 className="text-xl font-bold">How are you applying?</h2><p className="mt-1 text-sm text-muted-foreground">Choose the option that applies to you.</p></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {config.allowNew && <button onClick={() => chooseType('new')} className="rounded-2xl border border-border bg-card p-5 text-left hover:border-primary/50 hover:bg-primary/5 transition"><UserPlus className="w-6 h-6 text-primary" /><div className="mt-3 text-lg font-bold">New Member</div><p className="mt-1 text-sm text-muted-foreground">I am applying to join this club.</p></button>}
                {config.allowRenewal && <button onClick={() => chooseType('renewal')} className="rounded-2xl border border-border bg-card p-5 text-left hover:border-primary/50 hover:bg-primary/5 transition"><Repeat2 className="w-6 h-6 text-primary" /><div className="mt-3 text-lg font-bold">Renewal</div><p className="mt-1 text-sm text-muted-foreground">I am renewing an existing membership.</p></button>}
              </div>
            </section>
          )}

          {step === 'renewal_lookup' && (
            <form onSubmit={verifyRenewal} className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
              <div><h2 className="text-xl font-bold">Find your existing membership</h2><p className="mt-1 text-sm text-muted-foreground">For privacy, enter the email address and date of birth held on your previous membership. We will then show your existing details for you to check and update.</p></div>
              <div><Label>Email address</Label><Input type="email" className="mt-1" value={lookup.email} onChange={e => setLookup(p => ({...p,email:e.target.value}))} autoComplete="email" required /></div>
              <div><Label>Date of birth</Label><Input type="date" className="mt-1" value={lookup.dateOfBirth} onChange={e => setLookup(p => ({...p,dateOfBirth:e.target.value}))} required /></div>
              <div className="flex flex-col sm:flex-row gap-2"><Button type="submit" disabled={busy} className="sm:flex-1">{busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Find my membership</Button><Button type="button" variant="outline" onClick={() => setStep('choose')}>Back</Button></div>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={goToDeclarations} className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
              <div><h2 className="text-xl font-bold">{applicationType === 'renewal' ? 'Check your membership details' : 'Your membership details'}</h2><p className="mt-1 text-sm text-muted-foreground">{applicationType === 'renewal' ? 'Please check every field below. Change anything that is no longer correct, then confirm you have reviewed your details.' : 'Please complete all of the membership details below.'}</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Label>Full name</Label><Input className="mt-1" value={form.fullName} onChange={e=>updateField('fullName',e.target.value)} autoComplete="name" /></div>
                <div className="sm:col-span-2"><Label>Full postal address</Label><textarea className="mt-1 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.fullPostalAddress} onChange={e=>updateField('fullPostalAddress',e.target.value)} autoComplete="street-address" /></div>
                <div><Label>Eircode / postcode</Label><Input className="mt-1" value={form.postalCode} onChange={e=>updateField('postalCode',e.target.value)} /></div>
                <div><Label>Date of birth</Label><Input type="date" className="mt-1" value={form.dateOfBirth} onChange={e=>updateField('dateOfBirth',e.target.value)} />{Number(config?.minimumAge||0)>0&&<p className="mt-1 text-xs text-muted-foreground">Membership is currently for people aged {config.minimumAge} or over.</p>}</div>
                <div><Label>Email address</Label><Input type="email" className="mt-1" value={form.email} onChange={e=>updateField('email',e.target.value)} autoComplete="email" /></div>
                <div><Label>Mobile number</Label><Input className="mt-1" value={form.mobile} onChange={e=>updateField('mobile',e.target.value)} autoComplete="tel" /></div>
                <div><Label>Emergency contact name</Label><Input className="mt-1" value={form.emergencyContactName} onChange={e=>updateField('emergencyContactName',e.target.value)} /></div>
                <div><Label>Relationship to you</Label><Input className="mt-1" value={form.emergencyContactRelationship} onChange={e=>updateField('emergencyContactRelationship',e.target.value)} placeholder="e.g. spouse, parent, friend" /></div>
                <div className="sm:col-span-2"><Label>Emergency contact mobile</Label><Input className="mt-1" value={form.emergencyMobile} onChange={e=>updateField('emergencyMobile',e.target.value)} /></div>
              </div>
              {applicationType === 'renewal' && <label className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 cursor-pointer"><input type="checkbox" checked={reviewConfirmed} onChange={e=>setReviewConfirmed(e.target.checked)} className="mt-1 h-4 w-4" /><span className="text-sm leading-6"><strong>I have checked all of my details above.</strong> I have corrected anything that has changed and confirm the information is now accurate.</span></label>}
              <div className="flex flex-col sm:flex-row gap-2"><Button type="submit" className="sm:flex-1">Save & continue</Button><Button type="button" variant="outline" onClick={() => setStep(applicationType === 'renewal' ? 'renewal_lookup' : 'choose')}>Back</Button></div>
            </form>
          )}

          {step === 'declarations' && (
            <section className="space-y-4">
              <div><h2 className="text-xl font-bold">Membership declarations & consents</h2><p className="mt-1 text-sm text-muted-foreground">The full club wording is shown below. Required declarations must be accepted before you can submit your application.</p></div>
              <LegalBlock doc={legal.privacy} checked={consents.privacy} onChange={v=>setConsents(p=>({...p,privacy:v}))} />
              <LegalBlock doc={legal.waiver} checked={consents.liability_waiver} onChange={v=>setConsents(p=>({...p,liability_waiver:v}))} />
              <LegalBlock doc={legal.code} checked={consents.code_of_conduct} onChange={v=>setConsents(p=>({...p,code_of_conduct:v}))} />
              <LegalBlock doc={legal.health} checked={consents.health_declaration} onChange={v=>setConsents(p=>({...p,health_declaration:v}))} />
              <LegalBlock doc={legal.terms} checked={consents.membership_terms} onChange={v=>setConsents(p=>({...p,membership_terms:v}))} />
              {legal.photo && <section className="rounded-2xl border border-border bg-card overflow-hidden"><div className="px-4 sm:px-5 py-4 border-b border-border bg-secondary/20"><h3 className="font-bold">{legal.photo.title}</h3><p className="text-xs text-muted-foreground mt-1">Optional choice · Version {legal.photo.version}</p></div><div className="p-4 sm:p-5"><div className="rounded-xl bg-secondary/20 border border-border p-4 text-sm leading-6 whitespace-pre-wrap">{legal.photo.bodyText}</div><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={()=>setConsents(p=>({...p,photoVideo:'yes'}))} className={'rounded-xl border px-4 py-3 text-sm font-semibold ' + (consents.photoVideo==='yes'?'border-primary bg-primary text-primary-foreground':'border-border bg-background')}>Yes, I consent</button><button type="button" onClick={()=>setConsents(p=>({...p,photoVideo:'no'}))} className={'rounded-xl border px-4 py-3 text-sm font-semibold ' + (consents.photoVideo==='no'?'border-primary bg-primary text-primary-foreground':'border-border bg-background')}>No, I do not consent</button></div></div></section>}
              <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between gap-3"><span className="font-bold">Membership fee</span><span className="text-xl font-black">{feeLabel}</span></div><p className="mt-2 text-sm text-muted-foreground">Your application will be recorded first. You will then continue to the club’s connected secure payment gateway.</p></div>
              <div className="flex flex-col sm:flex-row gap-2"><Button onClick={submitApplication} disabled={busy} className="sm:flex-1">{busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Submit membership application</Button><Button variant="outline" onClick={()=>setStep('details')} disabled={busy}>Back</Button></div>
            </section>
          )}

          {step === 'payment' && application && (
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7 text-center">
              <CreditCard className="mx-auto w-9 h-9 text-primary" />
              <h2 className="mt-3 text-xl font-black">Application received</h2>
              <p className="mt-2 text-sm text-muted-foreground">Reference <strong className="text-foreground">{application.confirmationCode}</strong>. Complete your membership payment to confirm your membership.</p>
              <div className="mt-5 rounded-xl bg-secondary/30 p-4"><div className="text-sm text-muted-foreground">Amount due</div><div className="mt-1 text-3xl font-black">{money(application.membershipFee,application.currency)}</div></div>
              {application.paymentUrl ? <a href={application.paymentUrl} className="mt-5 inline-flex min-h-12 w-full sm:w-auto items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-black text-primary-foreground hover:bg-primary/90">Pay {money(application.membershipFee,application.currency)} securely</a> : <Button onClick={retryPayment} disabled={busy} className="mt-5"><RefreshCw className={'w-4 h-4 mr-2 ' + (busy?'animate-spin':'')} />Create new payment link</Button>}
              <p className="mt-4 text-xs text-muted-foreground">This page checks the payment status automatically. You can safely return here after payment.</p>
            </section>
          )}

          {step === 'complete' && application && (
            <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 text-center">
              <CheckCircle2 className="mx-auto w-12 h-12 text-emerald-500" />
              <h2 className="mt-4 text-2xl font-black">Membership confirmed</h2>
              <p className="mt-2 text-sm text-muted-foreground">Thank you, {application.fullName}. Your {club.name} membership for {application.seasonLabel} is confirmed.</p>
              <div className="mt-5 text-sm"><span className="text-muted-foreground">Reference:</span> <strong>{application.confirmationCode}</strong></div>
              <p className="mt-4 text-sm text-muted-foreground">A confirmation email has been sent to you. The club also has the application in its RallyHub Membership Console.</p>
              <Link to={'/directory/' + clubSlug} className="mt-6 inline-flex"><Button variant="outline">Back to {club.name}</Button></Link>
            </section>
          )}
        </div>
      </main>
      <PublicCopyrightFooter />
    </div>
  );
}
