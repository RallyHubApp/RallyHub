import React,{useEffect,useRef,useState} from 'react';
import {useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {base44} from '@/api/base44Client';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';

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
   if(data.success)setResult(data);
   else setError(data.error||'Registration could not be completed.');
  }catch(e){setError(e?.response?.data?.error||'Unable to register safely. Please contact organiser.');}
  finally{setSubmitting(false);}
 };
 return <main className="min-h-screen bg-background text-foreground p-4">
  <div className="mx-auto max-w-lg space-y-4">
   <RallyHubPublicBrand moduleName="Tournival" pageLabel="Tournament Registration"/>
   <section className="glass rounded-2xl p-6 space-y-4">
    {loading?<p>Loading registration…</p>:!event?<p role="alert">{error||'Event not found'}</p>:<>
     <header><h1 className="text-xl font-bold">{event.name}</h1>
      <p className="text-sm text-muted-foreground">{event.date} · {event.venue}</p>
      <p className="text-sm">Registration: {event.registered}/{event.capacity} places · Waiting list {event.waitlisted}</p>
      <p className="text-sm font-semibold">Fee: {Number(event.fee||0)===0?'Free':`€${Number(event.fee).toFixed(2)}`}</p>
     </header>
     {result?<section className="space-y-3" aria-live="polite">
       <h2 className="font-semibold text-lg">Registration received</h2>
       <p>Status: {result.registration?.status?.replaceAll('_',' ')}</p>
       <p>Payment: {result.registration?.paymentStatus?.replaceAll('_',' ')}</p>
       {result.registration?.checkoutUrl?
       <a href={result.registration.checkoutUrl} rel="noopener noreferrer" className="inline-block rounded-md bg-primary text-primary-foreground px-4 py-2">Proceed to secure payment</a>:
       result.registration?.paymentStatus==='pending'?<p>Payment checkout is pending. Your place has not been marked paid.</p>:null}
       {result.personalPath&&<a className="text-sm text-primary underline block" href={result.personalPath}>Open your personal tournament link — keep this link safe</a>}
       {result.message&&<p className="text-sm">{result.message}</p>}
       <p className="text-xs text-muted-foreground">Payment is confirmed only when the provider verifies it. Closing this page does not complete a payment.</p>
      </section>:
      <form onSubmit={submit} className="space-y-3">
       <label className="block text-sm">Full name <Input required autoComplete="name" minLength={2} maxLength={120} value={form.fullName} onChange={e=>setForm(f=>({...f,fullName:e.target.value}))}/></label>
       <label className="block text-sm">Email <Input required type="email" autoComplete="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></label>
       <label className="block text-sm">Mobile <Input type="tel" autoComplete="tel" value={form.mobile} onChange={e=>setForm(f=>({...f,mobile:e.target.value}))}/></label>
       <label className="flex gap-2 text-xs"><input type="checkbox" required checked={form.consent} onChange={e=>setForm(f=>({...f,consent:e.target.checked}))}/>
        <span>I consent to my details being used for this tournament and agree to follow the published competition rules and organiser safety instructions.</span></label>
       <label className="flex gap-2 text-xs"><input type="checkbox" checked={form.duprConsent} onChange={e=>setForm(f=>({...f,duprConsent:e.target.checked}))}/>
        <span>Optional: I consent to eligible tournament results being prepared for DUPR reporting. A DUPR account is not required to participate, and reporting is subject to organiser and DUPR rules.</span></label>
       {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
       <Button className="w-full" type="submit" disabled={submitting||!form.consent}>{submitting?'Registering…':'Register for Tournival'}</Button>
      </form>}
    </>}
   </section>
  </div>
 </main>;
}
