import React,{useEffect,useMemo,useState} from 'react';
import {useParams,useSearchParams,Link} from 'react-router-dom';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
import {AppearanceQuickButton} from '@/components/appearance/AppearanceControls';
import {CheckCircle2,RefreshCw,ShieldCheck} from 'lucide-react';

export default function PublicGuestRequest(){
  const {clubSlug}=useParams();
  const [params]=useSearchParams();
  const [data,setData]=useState(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(null);
  const [form,setForm]=useState({fullName:'',email:'',mobile:'',ageConfirmed:false,experienceLevel:'',sessionId:params.get('session')||'',duprId:'',homeClub:''});
  useEffect(()=>{let active=true;setLoading(true);base44.functions.invoke('guestAccessJourney',{action:'public_get',clubSlug}).then(res=>{if(!active)return;if(res.data?.error)throw new Error(res.data.error);setData(res.data)}).catch(e=>{if(active)setError(e?.message||'Guest requests are unavailable.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[clubSlug]);
  const sessions=useMemo(()=>{
    const all=data?.sessions||[];
    if(form.experienceLevel==='beginner')return all.filter(s=>s.beginnerEligible);
    if(form.experienceLevel==='experienced')return all.filter(s=>s.experiencedEligible);
    return [];
  },[data,form.experienceLevel]);
  useEffect(()=>{if(form.sessionId&&form.experienceLevel&& !sessions.some(s=>s.id===form.sessionId))setForm(f=>({...f,sessionId:''}))},[form.experienceLevel,sessions]);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{const res=await base44.functions.invoke('guestAccessJourney',{action:'public_submit',clubSlug,...form});if(res.data?.error)throw new Error(res.data.error);setDone(res.data);window.scrollTo({top:0,behavior:'smooth'})}catch(e2){setError(e2?.response?.data?.error||e2?.message||'Could not send your guest request.')}finally{setBusy(false)}};
  if(loading)return <div className="min-h-screen grid place-items-center bg-background"><RefreshCw className="h-7 w-7 animate-spin"/></div>;
  if(!data)return <div className="min-h-screen grid place-items-center bg-background p-5"><div className="glass max-w-md rounded-2xl p-6 text-center"><h1 className="text-xl font-black">Guest requests unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p></div></div>;
  if(done)return <div className="min-h-screen bg-background p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-50"/><div className="mx-auto max-w-xl glass rounded-2xl p-7 text-center"><RallyHubPublicBrand club={data.club} clubFirst pageLabel="Guest Request"/><CheckCircle2 className="mx-auto mt-6 h-12 w-12 text-primary"/><h1 className="mt-4 text-2xl font-black">Request sent</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{done.message}</p><Link to={`/directory/${clubSlug}`} className="mt-6 inline-flex rounded-xl border px-4 py-3 text-sm font-bold">Back to club directory page</Link></div></div>;
  return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-50"/><div className="mx-auto max-w-2xl space-y-5">
    <header className="glass rounded-2xl p-6 text-center"><RallyHubPublicBrand club={data.club} clubFirst pageLabel="Guest Request"/><h1 className="mt-5 text-2xl sm:text-3xl font-black">Request a guest place</h1><p className="mt-2 text-sm text-muted-foreground">Choose the type of player you are and the session you would like. Public guest requests are approved by the club before any payment is taken.</p></header>
    {error&&<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
    <form onSubmit={submit} className="space-y-5">
      <section className="glass rounded-2xl p-5 sm:p-6 space-y-4"><h2 className="text-lg font-black">1. About you</h2><div><Label>Full name</Label><Input className="mt-1.5" value={form.fullName} onChange={e=>set('fullName',e.target.value)} required/></div><div className="grid sm:grid-cols-2 gap-4"><div><Label>Email</Label><Input type="email" className="mt-1.5" value={form.email} onChange={e=>set('email',e.target.value)} required/></div><div><Label>Mobile</Label><Input type="tel" className="mt-1.5" value={form.mobile} onChange={e=>set('mobile',e.target.value)} required/></div></div>{data.adultsOnly&&<label className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={form.ageConfirmed} onChange={e=>set('ageConfirmed',e.target.checked)} required/><span><strong>I confirm that I am {data.minimumAge||18} years of age or over.</strong></span></label>}</section>
      <section className="glass rounded-2xl p-5 sm:p-6 space-y-4"><h2 className="text-lg font-black">2. Playing experience</h2><div className="grid sm:grid-cols-2 gap-3"><button type="button" onClick={()=>set('experienceLevel','beginner')} className={`rounded-xl border p-4 text-left ${form.experienceLevel==='beginner'?'border-primary bg-primary/10':''}`}><strong>Beginner</strong><span className="mt-1 block text-xs text-muted-foreground">I am new to pickleball or still learning the basics</span></button><button type="button" onClick={()=>set('experienceLevel','experienced')} className={`rounded-xl border p-4 text-left ${form.experienceLevel==='experienced'?'border-primary bg-primary/10':''}`}><strong>Experienced pickleball player</strong><span className="mt-1 block text-xs text-muted-foreground">I already play pickleball regularly</span></button></div>{form.experienceLevel==='experienced'&&<div className="grid sm:grid-cols-2 gap-4"><div><Label>DUPR</Label><Input className="mt-1.5" value={form.duprId} onChange={e=>set('duprId',e.target.value)} placeholder="DUPR ID / rating, or No DUPR" required={data.requireDuprForExperienced}/></div><div><Label>Club you normally play with</Label><Input className="mt-1.5" value={form.homeClub} onChange={e=>set('homeClub',e.target.value)} required={data.requireHomeClubForExperienced}/></div></div>}</section>
      {form.experienceLevel&&<section className="glass rounded-2xl p-5 sm:p-6 space-y-4"><h2 className="text-lg font-black">3. Choose your session</h2>{form.experienceLevel==='beginner'&&<p className="text-sm text-muted-foreground">Beginner guest places are currently available only at Ennistymon and Corofin.</p>}<div className="space-y-3">{sessions.map(s=><label key={s.id} className={`block cursor-pointer rounded-xl border p-4 ${form.sessionId===s.id?'border-primary bg-primary/10':''}`}><div className="flex gap-3"><input type="radio" name="session" className="mt-1" checked={form.sessionId===s.id} onChange={()=>set('sessionId',s.id)} required/><div><p className="font-black">{s.venueName}</p><p className="mt-1 text-sm">{s.day} · {s.start}{s.end?`–${s.end}`:''}</p><p className="mt-1 text-xs text-muted-foreground">{s.level}{s.price?` · €${Number(s.price).toFixed(2)}`:''}{/cash/i.test(s.paymentMethod||'')?' · cash':''}</p></div></div></label>)}</div></section>}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"><ShieldCheck className="mr-2 inline h-4 w-4 text-primary"/><strong>No payment is taken with this request.</strong> If approved, Clare Pickleball will send you a private link to complete the waiver, Code of Conduct and payment.</div>
      <Button type="submit" className="w-full min-h-12 font-black" disabled={busy||!form.experienceLevel||!form.sessionId}>{busy?<><RefreshCw className="mr-2 h-4 w-4 animate-spin"/>Sending…</>:'Send guest request'}</Button>
    </form>
  </div></div>;
}
