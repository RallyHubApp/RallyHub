import React,{useEffect,useRef,useState} from 'react';
import {useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {base44} from '@/api/base44Client';
import BrandedHostFrame from '@/components/sporting/BrandedHostFrame';
import {CalendarDays,Clock3,MapPin,Users,Trophy,CheckCircle2} from 'lucide-react';

const CONSENT='tournival-participation-v1';
async function request(payload){
 const result=await base44.functions.invoke('tournivalRegistration',payload);
 return result?.data||{};
}
export default function PublicTournivalRegistration(){
 const {token}=useParams(),operationRef=useRef(crypto.randomUUID());
 const [event,setEvent]=useState(null),[result,setResult]=useState(null);
 const [loading,setLoading]=useState(true),[submitting,setSubmitting]=useState(false),[error,setError]=useState('');
 const [form,setForm]=useState({fullName:'',email:'',mobile:'',consent:false,duprConsent:false});
 useEffect(()=>{
  let active=true;
  request({token,action:'get'}).then(data=>{if(!active)return;
   if(data.success)setEvent(data.event);else setError(data.error||'Registration is unavailable.');
  }).catch(e=>active&&setError(e?.response?.data?.error||'Registration link could not be loaded.'))
   .finally(()=>active&&setLoading(false));
  return ()=>{active=false;};
 },[token]);
 const submit=async e=>{
  e.preventDefault();if(submitting)return;
  setError('');setSubmitting(true);
  try{
   const data=await request({...form,token,action:'register',consentVersion:CONSENT,operationId:operationRef.current});
   if(data.success){
     if(data.event)setEvent(data.event);
     setResult(data);
   }
   else setError(data.error||'Registration could not be completed.');
  }catch(e){setError(e?.response?.data?.error||'Unable to register safely. Please contact organiser.');}
  finally{setSubmitting(false);}
 };
 return <BrandedHostFrame
  playerMode
  tenantId="6a9b7790bc4a8d299938bda9"
  clubName="Clare Pickleball"
  title="Christmas Tournival 🎄"
  subtitle={event?.name||'Clare Pickleball · Festival Tournament'}
  activeTab="registration"
  onTab={()=>{}}
  playerTabs={[{key:'registration',label:'Registration'}]}
 >
  <div className="space-y-4" data-testid="tournival-registration-approved-frame">
   <section className="relative isolate overflow-hidden rounded-xl border border-[#d8b95d]/50 bg-[#08254a] text-white shadow-md" aria-label="Christmas Tournival invitation banner">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{background:'radial-gradient(ellipse at 85% 12%, rgba(249,203,23,.18), transparent 47%), radial-gradient(ellipse at 8% 100%, rgba(8,142,72,.20), transparent 50%)'}}/>
    <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full border border-[#f9cb17]/25 sm:h-64 sm:w-64" aria-hidden="true"/>
    <div className="pointer-events-none absolute -top-12 -right-8 h-36 w-36 rounded-full border border-[#f9cb17]/20 sm:h-48 sm:w-48" aria-hidden="true"/>
    <div className="relative px-5 py-7 text-center sm:px-10 sm:py-10">
     <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[.25em] text-[#f9cb17]">Clare Pickleball presents</p>
     <div className="mx-auto my-3 h-px w-20 bg-[#f9cb17]/75" aria-hidden="true"/>
     <h1 className="text-[clamp(1.7rem,5.5vw,3rem)] font-black uppercase tracking-tight leading-[1.08]">Christmas <span className="block text-[#f9cb17]">Tournival</span></h1>
     <p className="mt-3 text-sm sm:text-base font-semibold tracking-[.12em] uppercase text-white/95">Play. Compete. Celebrate.</p>
     <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-white/85">A festive pickleball celebration for all abilities. New partners, exciting knockouts and medals to be won.</p>
     <div className="mx-auto mt-5 flex w-fit items-center gap-2 text-[#f9cb17]" aria-hidden="true"><span className="h-px w-12 bg-current/60"/><span className="h-1.5 w-1.5 rotate-45 bg-current"/><span className="h-px w-12 bg-current/60"/></div>
    </div>
   </section>
   <section className="glass rounded-xl p-4 sm:p-5 space-y-4">
    {loading?<p>Loading registration…</p>:!event?<p role="alert">{error||'Event not found'}</p>:<>
     <div className="space-y-3">
      <h2 className="text-lg sm:text-xl font-black">{event.name}</h2>
      <div className="grid gap-2 text-sm">
       <p className="flex items-center gap-2"><CalendarDays className="w-4 h-4 shrink-0"/>{event.date}</p>
       <p className="flex items-center gap-2"><Clock3 className="w-4 h-4 shrink-0"/>7:00 pm – 10:00 pm</p>
       <p className="flex items-start gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5"/>{event.venue}</p>
       <p className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0"/>{event.registered} of {event.capacity} places reserved · {event.waitlisted} on waiting list</p>
      </div>
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 flex items-center justify-between"><span className="font-semibold">Entry fee</span><span className="font-black text-xl">{Number(event.fee||0)===0?'Free':`€${Number(event.fee).toFixed(2)}`}</span></div>
      <p className="text-sm text-muted-foreground">Enjoy 3–4 rounds with changing partners, followed by knockout games and gold, silver and bronze medals. Christmas jumpers and Santa hats encouraged!</p>
     </div>
     {result?<section className="space-y-3" aria-live="polite">
       <h2 className="font-semibold text-lg flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600"/>Registration received</h2>
       <p>Status: {result.registration?.status?.replaceAll('_',' ')}</p>
       <p>Payment: {result.registration?.paymentStatus?.replaceAll('_',' ')}</p>
       {result.registration?.checkoutUrl?
       <a href={result.registration.checkoutUrl} rel="noopener noreferrer" className="inline-block rounded-md bg-primary text-primary-foreground px-4 py-2">Proceed to secure payment</a>:
       result.registration?.paymentStatus==='pending'?<p>Payment checkout is pending. Your place has not been marked paid.</p>:null}
       {result.personalPath&&<a className="text-sm text-primary underline block" href={result.personalPath}>Open your personal tournament link — keep this link safe</a>}
       {result.message&&<p className="text-sm">{result.message}</p>}
       {result.registration?.paymentStatus==='pending'&&<p className="text-xs text-muted-foreground">Payment is confirmed only when the provider verifies it. Closing this page does not complete a payment.</p>}
      </section>:
      <form onSubmit={submit} className="space-y-3"><h2 className="font-black text-lg border-b pb-2">Join the Christmas Tournival</h2>
       <label className="block text-sm">Full name <Input required autoComplete="name" minLength={2} maxLength={120} value={form.fullName} onChange={e=>setForm(f=>({...f,fullName:e.target.value}))}/></label>
       <label className="block text-sm">Email <Input required type="email" autoComplete="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></label>
       <label className="block text-sm">Mobile <Input type="tel" autoComplete="tel" value={form.mobile} onChange={e=>setForm(f=>({...f,mobile:e.target.value}))}/></label>
       <label className="flex gap-2 text-xs"><input type="checkbox" required checked={form.consent} onChange={e=>setForm(f=>({...f,consent:e.target.checked}))}/>
        <span>I consent to my details being used for this tournament and agree to follow the published competition rules and organiser safety instructions.</span></label>
       <label className="flex gap-2 text-xs"><input type="checkbox" checked={form.duprConsent} onChange={e=>setForm(f=>({...f,duprConsent:e.target.checked}))}/>
        <span>Optional: I consent to eligible tournament results being prepared for DUPR reporting. A DUPR account is not required to participate, and reporting is subject to organiser and DUPR rules.</span></label>
       {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
       <Button className="w-full bg-[#073b74] hover:bg-[#052c56] text-white font-bold min-h-11" type="submit" disabled={submitting||!form.consent}>{submitting?'Registering…':'Register for the Christmas Tournival'}</Button>
      </form>}
    </>}
   </section>
  </div>
 </BrandedHostFrame>;
}
