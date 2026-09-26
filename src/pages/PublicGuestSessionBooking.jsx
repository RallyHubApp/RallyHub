import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
import { AppearanceQuickButton } from '@/components/appearance/AppearanceControls';
import { CheckCircle2, ExternalLink, MapPin, RefreshCw, ShieldCheck } from 'lucide-react';

const CLARE_FALLBACK_BRAND={
  name:'Clare Pickleball',
  logo_url:'https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/6e59058fc_ClarePBLogo.jpg',
  primary_colour:'#2667f2',
  secondary_colour:'#facc15',
};

const EMPTY={
  fullName:'',email:'',mobile:'',emergencyContactName:'',emergencyContactMobile:'',medicalNote:'',ageConfirmed:false,
  waiverAccepted:false,codeAccepted:false,privacyAcknowledged:false,cancellationAccepted:false,photoVideoConsent:'',
};

function niceDate(value){
  if(!value)return '';
  try{
    return new Intl.DateTimeFormat('en-IE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
      .format(new Date(`${value}T12:00:00`));
  }catch{return value}
}

export default function PublicGuestSessionBooking(){
  const { token }=useParams();
  const [params]=useSearchParams();
  const inviteToken=params.get('invite')||'';
  const isPaymentReturn=!!params.get('booking')&&params.get('payment')==='return';
  const [data,setData]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [loading,setLoading]=useState(true);
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState('');
  const [done,setDone]=useState(null);
  const [checkingPayment,setCheckingPayment]=useState(false);

  const load=async()=>{
    setLoading(true);setError('');
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'public_get',token,inviteToken});
      if(res.data?.error)throw new Error(res.data.error);
      setData(res.data);
      if(res.data?.inviteApproved){
        setForm(f=>({...f,fullName:f.fullName||res.data?.inviteName||'',email:f.email||res.data?.inviteEmail||'',mobile:f.mobile||res.data?.inviteMobile||''}));
      }
    }catch(e){setError(e?.response?.data?.error||e?.message||'This guest booking link is unavailable.')}
    finally{setLoading(false)}
  };

  useEffect(()=>{load()},[token,inviteToken]);

  useEffect(()=>{
    const bookingId=params.get('booking');
    if(!bookingId||params.get('payment')!=='return'||!data)return;
    let cancelled=false;
    const verify=async()=>{
      setCheckingPayment(true);setError('');
      for(let i=0;i<6&&!cancelled;i++){
        try{
          const res=await base44.functions.invoke('guestSessionBooking',{action:'public_status',token,bookingId});
          if(res.data?.error)throw new Error(res.data.error);
          const b=res.data?.booking;
          if(b?.paymentStatus==='paid'&&b?.bookingStatus==='confirmed'){
            setDone({type:'confirmed',...res.data});
            window.history.replaceState({},'',window.location.pathname);
            setCheckingPayment(false);
            return;
          }
        }catch(e){
          if(i===5)setError(e?.response?.data?.error||e?.message||'We could not verify the payment yet.');
        }
        await new Promise(r=>setTimeout(r,1800));
      }
      if(!cancelled)setCheckingPayment(false);
    };
    verify();
    return()=>{cancelled=true};
  },[data,params,token]);

  const set=(key,value)=>setForm(f=>({...f,[key]:value}));

  const submit=async(e)=>{
    e.preventDefault();
    if(submitting)return;
    setSubmitting(true);setError('');
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'public_submit',token,inviteToken,...form});
      if(res.data?.error)throw new Error(res.data.error);
      if(res.data?.paymentUrl){
        window.location.assign(res.data.paymentUrl);
        return;
      }
      setDone({type:res.data?.bookingStatus==='cash_due'?'cash':'confirmed',...res.data});
      window.scrollTo({top:0,behavior:'smooth'});
    }catch(e2){
      const responseData=e2?.response?.data||{};
      if(responseData?.approvalRequired){
        setData(prev=>prev?({...prev,approvalRequired:true}):prev);
        setError('The email or mobile number entered does not match this private invitation. You can still request the guest place through the normal club approval route.');
      }else{
        setError(responseData?.error||e2?.message||'Unable to complete the guest booking.');
      }
      window.scrollTo({top:0,behavior:'smooth'});
    }finally{setSubmitting(false)}
  };

  if(loading)return <div className="min-h-screen bg-background text-foreground grid place-items-center p-5">
    <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
    <div className="text-center"><RallyHubPublicBrand club={data?.clubBrand||CLARE_FALLBACK_BRAND} clubFirst pageLabel="Guest Session Booking"/><RefreshCw className="mx-auto mt-6 h-7 w-7 animate-spin"/></div>
  </div>;

  if(error&&!data)return <div className="min-h-screen bg-background text-foreground grid place-items-center p-5">
    <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
    <div className="glass max-w-md rounded-2xl p-6 text-center">
      <RallyHubPublicBrand club={data?.clubBrand||CLARE_FALLBACK_BRAND} clubFirst pageLabel="Guest Session Booking"/>
      <h1 className="mt-5 text-xl font-black">Booking unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error}</p>
    </div>
  </div>;

  const session=data?.session||{};
  const legal=data?.legal||{};
  const activeClubBrand=data?.clubBrand||CLARE_FALLBACK_BRAND;

  if(done)return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
    <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
    <div className="mx-auto max-w-xl">
      <div className="glass rounded-2xl p-6 sm:p-8 text-center">
        <RallyHubPublicBrand club={data?.clubBrand||CLARE_FALLBACK_BRAND} clubFirst pageLabel="Guest Session Booking"/>
        <CheckCircle2 className="mx-auto mt-7 h-12 w-12 text-primary"/>
        <h1 className="mt-4 text-2xl font-black">{done.type==='cash'?'Place reserved':'Booking confirmed'}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{done.message||'Your guest booking is confirmed.'}</p>
        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left text-sm">
          <p className="font-black">{niceDate(done.session?.sessionDate||session.sessionDate)} · {done.session?.startTime||session.startTime}</p>
          <p className="mt-2 font-semibold">{done.session?.venueName||session.venueName}</p>
          <p className="text-muted-foreground">{done.session?.venueAddress||session.venueAddress}</p>
          <p className="text-muted-foreground">{done.session?.eircode||session.eircode}</p>
          <a href={done.session?.mapsUrl||session.mapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 font-semibold text-primary">
            <MapPin className="h-4 w-4"/> View in Google Maps <ExternalLink className="h-3.5 w-3.5"/>
          </a>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">{done.type==='cash'?'The club organiser has been notified of your booking.':'A confirmation email has been sent.'} Cancellations made less than 24 hours before the session are non-refundable.</p>
      </div>
    </div>
  </div>;

  if(data?.approvalRequired&&!isPaymentReturn)return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
    <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
    <div className="mx-auto max-w-xl">
      <div className="glass rounded-2xl p-6 sm:p-8 text-center">
        <RallyHubPublicBrand club={data?.clubBrand||CLARE_FALLBACK_BRAND} clubFirst pageLabel="Guest Session Request"/>
        <ShieldCheck className="mx-auto mt-7 h-11 w-11 text-primary"/>
        <h1 className="mt-4 text-2xl font-black">Club approval required</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{error||'This is a public or forwarded booking link, so no payment will be taken yet. Request a guest place first and Clare Pickleball will approve the visit before sending a private payment link.'}</p>
        <div className="mt-5 rounded-xl border bg-secondary/30 p-4 text-left text-sm">
          <p className="font-black">{niceDate(session.sessionDate)} · {session.startTime}{session.endTime?`–${session.endTime}`:''}</p>
          <p className="mt-2 font-semibold">{session.venueName}</p>
          <p className="text-muted-foreground">{session.venueAddress} · {session.eircode}</p>
        </div>
        <a href={data.guestRequestUrl||`/directory/${activeClubBrand?.slug||'clare-pickleball'}`} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">Request a guest place</a>
        <p className="mt-3 text-xs text-muted-foreground">If Clare Pickleball sent you a private invitation, open the exact link from that message.</p>
      </div>
    </div>
  </div>;

  return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
    <AppearanceQuickButton className="fixed right-3 top-3 z-50 h-10 px-2 sm:px-3"/>
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="glass rounded-2xl p-5 sm:p-7 text-center">
        <RallyHubPublicBrand club={data?.clubBrand||CLARE_FALLBACK_BRAND} clubFirst pageLabel="Guest Session Booking"/>
        <h1 className="mt-5 text-2xl sm:text-3xl font-black">Guest Session</h1>
        <p className="mt-2 text-base font-bold">{niceDate(session.sessionDate)} · {session.startTime}{session.endTime?`–${session.endTime}`:''}</p>
        <div className="mx-auto mt-4 max-w-lg rounded-xl border bg-secondary/30 p-4 text-left">
          <p className="font-black">{session.venueName}</p>
          <p className="mt-1 text-sm text-muted-foreground">{session.venueAddress}</p>
          <p className="text-sm text-muted-foreground">{session.eircode}</p>
          <a href={session.mapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            <MapPin className="h-4 w-4"/> View in Google Maps <ExternalLink className="h-3.5 w-3.5"/>
          </a>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="rounded-full bg-primary/10 px-3 py-1.5 font-bold text-primary">Guest fee €{Number(session.feeAmount||0).toFixed(2)}</span>
          <span className="rounded-full bg-secondary px-3 py-1.5">{session.paymentMethod==='cash'?'Cash on arrival':'Secure SumUp payment'}</span>
          {data?.spotsRemaining!==null&&data?.spotsRemaining!==undefined&&<span className="rounded-full bg-secondary px-3 py-1.5">{data.spotsRemaining} places remaining</span>}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No RallyHub account is needed. This is a guest booking only and does not create club membership.</p>
      </header>

      {checkingPayment&&<div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm font-semibold"><RefreshCw className="mr-2 inline h-4 w-4 animate-spin"/>Checking your SumUp payment and confirming your place…</div>}
      {error&&<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</div>}

      <form onSubmit={submit} className="space-y-5">
        <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
          <div><h2 className="text-lg font-black">Your details</h2><p className="mt-1 text-xs text-muted-foreground">Used to administer this guest session and contact you if needed.</p></div>
          <div><Label htmlFor="name">Full name</Label><Input id="name" value={form.fullName} onChange={e=>set('fullName',e.target.value)} autoComplete="name" required className="mt-1.5 bg-secondary"/></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={e=>set('email',e.target.value)} autoComplete="email" required className="mt-1.5 bg-secondary"/></div>
            <div><Label htmlFor="mobile">Mobile</Label><Input id="mobile" type="tel" value={form.mobile} onChange={e=>set('mobile',e.target.value)} autoComplete="tel" required className="mt-1.5 bg-secondary"/></div>
          </div>
        </section>

        {Number(legal.minimumAge||0)>0&&<section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
          <div><h2 className="text-lg font-black">Age eligibility</h2><p className="mt-1 text-xs text-muted-foreground">{activeClubBrand?.name||'This club'} currently requires guest participants to be at least {legal.minimumAge}.</p></div>
          <label className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={form.ageConfirmed} onChange={e=>set('ageConfirmed',e.target.checked)} required/><span><strong>I confirm that I am {legal.minimumAge} years of age or over.</strong></span></label>
        </section>}

        <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
          <div><h2 className="text-lg font-black">Emergency contact</h2><p className="mt-1 text-xs text-muted-foreground">Only available to authorised club/session organisers.</p></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label htmlFor="emergencyName">Contact name</Label><Input id="emergencyName" value={form.emergencyContactName} onChange={e=>set('emergencyContactName',e.target.value)} required className="mt-1.5 bg-secondary"/></div>
            <div><Label htmlFor="emergencyMobile">Contact mobile</Label><Input id="emergencyMobile" type="tel" value={form.emergencyContactMobile} onChange={e=>set('emergencyContactMobile',e.target.value)} required className="mt-1.5 bg-secondary"/></div>
          </div>
          <div><Label htmlFor="medical">Anything an organiser should know in an emergency? <span className="font-normal text-muted-foreground">(optional)</span></Label><textarea id="medical" value={form.medicalNote} onChange={e=>set('medicalNote',e.target.value)} rows={3} maxLength={1200} className="mt-1.5 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"/></div>
        </section>

        <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/><h2 className="text-lg font-black">Waiver & club conduct</h2></div>{activeClubBrand?.slug&&<a href={`/directory/${activeClubBrand.slug}/policies`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline">View full club policy library</a>}</div>

          <details className="rounded-xl border bg-secondary/30 p-4"><summary className="cursor-pointer font-bold text-sm">{legal.waiverTitle}</summary><div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground">{legal.waiverText}</div></details>
          <label className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={form.waiverAccepted} onChange={e=>set('waiverAccepted',e.target.checked)} required/><span><strong>{legal.waiverConsentLabel || 'I have read and accept the Clare Pickleball Participation Declaration, Assumption of Risk & Liability Notice.'}</strong></span></label>

          <details className="rounded-xl border bg-secondary/30 p-4"><summary className="cursor-pointer font-bold text-sm">{legal.codeTitle}</summary><div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground">{legal.codeText}</div></details>
          <label className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={form.codeAccepted} onChange={e=>set('codeAccepted',e.target.checked)} required/><span><strong>{legal.codeConsentLabel || 'I have read and agree to abide by the Clare Pickleball Code of Conduct, Court Etiquette & Sportsmanship.'}</strong></span></label>
        </section>

        <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
          <div><h2 className="text-lg font-black">Privacy, photos & cancellation</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">{legal.privacyText}</p></div>
          <label className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={form.privacyAcknowledged} onChange={e=>set('privacyAcknowledged',e.target.checked)} required/><span>I understand how my information will be used for this guest booking.</span></label>
          <label className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={form.cancellationAccepted} onChange={e=>set('cancellationAccepted',e.target.checked)} required/><span><strong>I understand that cancellations made less than 24 hours before the session are non-refundable.</strong></span></label>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-bold">From time to time Clare Pickleball may take photographs or video at club activities for club communications and promotional purposes. Do you consent to your image being used?</p>
            <div className="mt-3 flex gap-5 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="photo" checked={form.photoVideoConsent==='yes'} onChange={()=>set('photoVideoConsent','yes')} required/> Yes</label>
              <label className="flex items-center gap-2"><input type="radio" name="photo" checked={form.photoVideoConsent==='no'} onChange={()=>set('photoVideoConsent','no')} required/> No</label>
            </div>
          </div>
        </section>

        {session.paymentMethod!=='cash'&&<div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center text-sm">
          <p className="font-black">Payment to {activeClubBrand?.name||'the club'}</p>
          <p className="mt-1 text-xs text-muted-foreground">Your payment is processed securely by SumUp. RallyHub provides the booking system.</p>
        </div>}
        <Button type="submit" className="w-full min-h-12 text-base font-bold" disabled={submitting||checkingPayment||!form.photoVideoConsent}>
          {submitting?<><RefreshCw className="mr-2 h-4 w-4 animate-spin"/>Saving…</>:session.paymentMethod==='cash'?`Reserve Place · €${Number(session.feeAmount||0).toFixed(2)} Cash`:`Continue to SumUp · €${Number(session.feeAmount||0).toFixed(2)}`}
        </Button>
        <p className="pb-8 text-center text-[11px] text-muted-foreground">Your place is confirmed after payment for online-payment sessions. For cash-on-arrival sessions, your place is reserved when this form is completed.</p>
      </form>
    </div>
  </div>;
}