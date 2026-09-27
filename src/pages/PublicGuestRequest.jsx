import React,{useEffect,useMemo,useState} from 'react';
import {useParams,useSearchParams,Link} from 'react-router-dom';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
import {AppearanceQuickButton} from '@/components/appearance/AppearanceControls';
import {CheckCircle2,CreditCard,RefreshCw,ShieldCheck,UserCheck,Users} from 'lucide-react';

function niceDate(value){
  if(!value)return '';
  try{return new Intl.DateTimeFormat('en-IE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00`))}
  catch{return value}
}

export default function PublicGuestRequest(){
  const {clubSlug}=useParams();
  const [params]=useSearchParams();
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [done,setDone]=useState(null);
  const [journey,setJourney]=useState('');
  const [memberVerified,setMemberVerified]=useState(null);
  const [memberForm,setMemberForm]=useState({fullName:'',email:'',mobile:'',sessionId:params.get('session')||'',bookingNote:''});
  const [guestForm,setGuestForm]=useState({fullName:'',email:'',mobile:'',ageConfirmed:false,experienceLevel:'',sessionId:params.get('session')||'',duprId:'',homeClub:''});

  useEffect(()=>{
    let active=true;
    setLoading(true);
    base44.functions.invoke('guestAccessJourney',{action:'public_get',clubSlug})
      .then(res=>{if(!active)return;if(res.data?.error)throw new Error(res.data.error);setData(res.data)})
      .catch(e=>{if(active)setError(e?.message||'Session booking is unavailable.')})
      .finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[clubSlug]);

  const guestSessions=useMemo(()=>{
    const all=data?.sessions||[];
    if(guestForm.experienceLevel==='beginner')return all.filter(s=>s.beginnerEligible);
    if(guestForm.experienceLevel==='experienced')return all.filter(s=>s.experiencedEligible);
    return [];
  },[data,guestForm.experienceLevel]);

  useEffect(()=>{
    if(guestForm.sessionId&&guestForm.experienceLevel&&!guestSessions.some(s=>s.id===guestForm.sessionId)){
      setGuestForm(f=>({...f,sessionId:''}));
    }
  },[guestForm.experienceLevel,guestSessions,guestForm.sessionId]);

  const setGuest=(k,v)=>setGuestForm(f=>({...f,[k]:v}));
  const setMember=(k,v)=>setMemberForm(f=>({...f,[k]:v}));

  const switchJourney=value=>{
    setJourney(value);
    setError('');
    setDone(null);
    if(value!=='member')setMemberVerified(null);
  };

  const checkMembership=async e=>{
    e?.preventDefault?.();
    setBusy(true);setError('');setMemberVerified(null);
    try{
      if(!memberForm.fullName.trim()&&!memberForm.email.trim()&&!memberForm.mobile.trim()){
        throw new Error('Enter your name, email or mobile number so RallyHub can check your membership.');
      }
      const res=await base44.functions.invoke('guestSessionBooking',{
        action:'public_member_lookup',clubSlug,
        fullName:memberForm.fullName,email:memberForm.email,mobile:memberForm.mobile,
      });
      if(res.data?.error)throw Object.assign(new Error(res.data.error),{code:res.data?.code});
      setMemberVerified(res.data);
      const requested=params.get('session')||'';
      const initial=(res.data?.sessions||[]).some(s=>s.id===requested)?requested:'';
      setMemberForm(f=>({...f,sessionId:f.sessionId&&res.data?.sessions?.some(s=>s.id===f.sessionId)?f.sessionId:initial}));
    }catch(e2){
      const responseData=e2?.response?.data||{};
      setError(responseData?.error||e2?.message||'RallyHub could not verify your membership.');
    }finally{setBusy(false)}
  };

  const submitMember=async e=>{
    e.preventDefault();setBusy(true);setError('');
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{
        action:'public_member_submit',clubSlug,
        fullName:memberForm.fullName,email:memberForm.email,mobile:memberForm.mobile,
        sessionId:memberForm.sessionId,bookingNote:memberForm.bookingNote,
      });
      if(res.data?.error)throw new Error(res.data.error);
      if(res.data?.paymentUrl){window.location.assign(res.data.paymentUrl);return}
      setDone({type:'member',...res.data});window.scrollTo({top:0,behavior:'smooth'});
    }catch(e2){setError(e2?.response?.data?.error||e2?.message||'Could not complete the member booking.');window.scrollTo({top:0,behavior:'smooth'})}
    finally{setBusy(false)}
  };

  const submitGuest=async e=>{
    e.preventDefault();setBusy(true);setError('');
    try{
      const res=await base44.functions.invoke('guestAccessJourney',{action:'public_submit',clubSlug,...guestForm});
      if(res.data?.error)throw new Error(res.data.error);
      setDone({type:'guest-request',...res.data});window.scrollTo({top:0,behavior:'smooth'});
    }catch(e2){setError(e2?.response?.data?.error||e2?.message||'Could not send your guest request.')}
    finally{setBusy(false)}
  };

  if(loading)return <div className="min-h-screen grid place-items-center bg-background"><RefreshCw className="h-7 w-7 animate-spin"/></div>;
  if(!data)return <div className="min-h-screen grid place-items-center bg-background p-5"><div className="glass max-w-md rounded-2xl p-6 text-center"><h1 className="text-xl font-black">Session booking unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p></div></div>;

  if(done?.type==='guest-request')return <div className="min-h-screen bg-background p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-50"/><div className="mx-auto max-w-xl glass rounded-2xl p-7 text-center"><RallyHubPublicBrand club={data.club} clubFirst pageLabel="Guest Request"/><CheckCircle2 className="mx-auto mt-6 h-12 w-12 text-primary"/><h1 className="mt-4 text-2xl font-black">Request sent</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{done.message}</p><Link to={`/directory/${clubSlug}`} className="mt-6 inline-flex rounded-xl border px-4 py-3 text-sm font-bold">Back to club directory page</Link></div></div>;

  if(done?.type==='member')return <div className="min-h-screen bg-background p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-50"/><div className="mx-auto max-w-xl glass rounded-2xl p-7 text-center"><RallyHubPublicBrand club={data.club} clubFirst pageLabel="Member Session"/><CheckCircle2 className="mx-auto mt-6 h-12 w-12 text-primary"/><h1 className="mt-4 text-2xl font-black">{done.bookingStatus==='cash_due'?'Place reserved':'Booking confirmed'}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{done.message}</p>{done.session&&<div className="mt-5 rounded-xl border bg-secondary/30 p-4 text-left text-sm"><p className="font-black">{niceDate(done.session.sessionDate)} · {done.session.startTime}{done.session.endTime?`–${done.session.endTime}`:''}</p><p className="mt-2 font-semibold">{done.session.venueName}</p><p className="text-muted-foreground">{done.session.venueAddress}</p></div>}<Link to={`/directory/${clubSlug}`} className="mt-6 inline-flex rounded-xl border px-4 py-3 text-sm font-bold">Back to club directory page</Link></div></div>;

  return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-50"/><div className="mx-auto max-w-2xl space-y-5">
    <header className="glass rounded-2xl p-6 text-center">
      <RallyHubPublicBrand club={data.club} clubFirst pageLabel="Session Booking"/>
      <h1 className="mt-5 text-2xl sm:text-3xl font-black">Book or request a session</h1>
      <p className="mt-2 text-sm text-muted-foreground">Existing club members can verify their membership and pay directly. Guests follow the normal guest request and approval process.</p>
    </header>

    {!journey&&<section className="grid gap-3 sm:grid-cols-2">
      <button type="button" onClick={()=>switchJourney('member')} className="glass rounded-2xl p-5 text-left hover:border-primary/50 border border-transparent transition-colors">
        <UserCheck className="h-6 w-6 text-primary"/><h2 className="mt-3 text-lg font-black">I’m an existing member</h2><p className="mt-1 text-sm text-muted-foreground">Can’t book through Spond? Verify your membership, choose the session and pay directly.</p>
      </button>
      <button type="button" onClick={()=>switchJourney('guest')} className="glass rounded-2xl p-5 text-left hover:border-primary/50 border border-transparent transition-colors">
        <Users className="h-6 w-6 text-primary"/><h2 className="mt-3 text-lg font-black">I’m a guest</h2><p className="mt-1 text-sm text-muted-foreground">Request a guest place. The club approves the visit before payment is taken.</p>
      </button>
    </section>}

    {error&&<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      <p>{error}</p>
      {journey==='member'&&/No membership record found/i.test(error)&&<Button type="button" variant="outline" size="sm" className="mt-3" onClick={()=>switchJourney('guest')}>Continue as a guest</Button>}
    </div>}

    {journey==='member'&&<form onSubmit={memberVerified?submitMember:checkMembership} className="space-y-5">
      <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black">Existing member</h2><p className="mt-1 text-xs text-muted-foreground">Enter any one or more of the details held by the club. RallyHub checks name, email and mobile against the membership database.</p></div><Button type="button" variant="ghost" size="sm" onClick={()=>switchJourney('')}>Change</Button></div>
        <div><Label htmlFor="memberFullName">Full name</Label><Input id="memberFullName" className="mt-1.5" value={memberForm.fullName} onChange={e=>{setMember('fullName',e.target.value);setMemberVerified(null)}} autoComplete="name"/></div>
        <div className="grid sm:grid-cols-2 gap-4"><div><Label htmlFor="memberEmail">Email</Label><Input id="memberEmail" type="email" className="mt-1.5" value={memberForm.email} onChange={e=>{setMember('email',e.target.value);setMemberVerified(null)}} autoComplete="email"/></div><div><Label htmlFor="memberMobile">Mobile</Label><Input id="memberMobile" type="tel" className="mt-1.5" value={memberForm.mobile} onChange={e=>{setMember('mobile',e.target.value);setMemberVerified(null)}} autoComplete="tel"/></div></div>
        {!memberVerified&&<Button type="submit" className="w-full min-h-12 font-black" disabled={busy}>{busy?<><RefreshCw className="mr-2 h-4 w-4 animate-spin"/>Checking…</>:<><ShieldCheck className="mr-2 h-4 w-4"/>Check my membership</>}</Button>}
      </section>

      {memberVerified&&<>
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 text-sm"><CheckCircle2 className="mr-2 inline h-4 w-4 text-green-600"/><strong>{memberVerified.message}</strong></div>
        <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
          <div><h2 className="text-lg font-black">Choose the session</h2><p className="mt-1 text-xs text-muted-foreground">Only upcoming Spond sessions you are invited to are shown. Your payment is recorded against the exact session you choose.</p></div>
          {(memberVerified.sessions||[]).length===0?<div className="rounded-xl border bg-secondary/30 p-4 text-sm text-muted-foreground">There are no payable Spond sessions currently showing for you. Only sessions you are invited to are available here.</div>:<div className="space-y-3">{(memberVerified.sessions||[]).map(s=><label key={s.id} className={`block cursor-pointer rounded-xl border p-4 ${memberForm.sessionId===s.id?'border-primary bg-primary/10':''}`}><div className="flex gap-3"><input type="radio" name="member-session" className="mt-1" checked={memberForm.sessionId===s.id} onChange={()=>setMember('sessionId',s.id)} required/><div className="min-w-0"><p className="font-black">{s.title||s.venueName}</p><p className="mt-1 text-sm">{s.venueName} · {s.day} · {s.start}{s.end?`–${s.end}`:''}</p><p className="mt-1 text-xs text-muted-foreground">{s.nextDate?niceDate(s.nextDate):''} · €{Number(s.price||0).toFixed(2)}{s.paymentMethod==='cash'?' cash':''}{s.responseStatus?` · Spond: ${s.responseStatus}`:''}</p></div></div></label>)}</div>}
          <div><Label htmlFor="memberNote">Anything you want the session host to know? <span className="font-normal text-muted-foreground">(optional)</span></Label><textarea id="memberNote" value={memberForm.bookingNote} onChange={e=>setMember('bookingNote',e.target.value)} rows={3} maxLength={1000} placeholder="For example: my phone was stolen so I couldn't book through Spond." className="mt-1.5 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"/></div>
        </section>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"><CreditCard className="mr-2 inline h-4 w-4 text-primary"/><strong>No guest forms or waivers are repeated.</strong> Once membership is confirmed, you go directly to payment for the selected session.</div>
        <Button type="submit" className="w-full min-h-12 font-black" disabled={busy||!memberForm.sessionId}>{busy?<><RefreshCw className="mr-2 h-4 w-4 animate-spin"/>Opening payment…</>:memberForm.sessionId?`Continue to payment · €${Number((memberVerified.sessions||[]).find(s=>s.id===memberForm.sessionId)?.price||0).toFixed(2)}`:'Choose a session to continue'}</Button>
      </>}
    </form>}

    {journey==='guest'&&<form onSubmit={submitGuest} className="space-y-5">
      <section className="glass rounded-2xl p-5 sm:p-6 space-y-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black">1. About you</h2><p className="mt-1 text-xs text-muted-foreground">Guest requests are checked by the club before payment.</p></div><Button type="button" variant="ghost" size="sm" onClick={()=>switchJourney('')}>Change</Button></div><div><Label htmlFor="guestFullName">Full name</Label><Input id="guestFullName" className="mt-1.5" value={guestForm.fullName} onChange={e=>setGuest('fullName',e.target.value)} required/></div><div className="grid sm:grid-cols-2 gap-4"><div><Label htmlFor="guestEmail">Email</Label><Input id="guestEmail" type="email" className="mt-1.5" value={guestForm.email} onChange={e=>setGuest('email',e.target.value)} required/></div><div><Label htmlFor="guestMobile">Mobile</Label><Input id="guestMobile" type="tel" className="mt-1.5" value={guestForm.mobile} onChange={e=>setGuest('mobile',e.target.value)} required/></div></div>{data.adultsOnly&&<label className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={guestForm.ageConfirmed} onChange={e=>setGuest('ageConfirmed',e.target.checked)} required/><span><strong>I confirm that I am {data.minimumAge||18} years of age or over.</strong></span></label>}</section>
      <section className="glass rounded-2xl p-5 sm:p-6 space-y-4"><h2 className="text-lg font-black">2. Playing experience</h2><div className="grid sm:grid-cols-2 gap-3"><button type="button" onClick={()=>setGuest('experienceLevel','beginner')} className={`rounded-xl border p-4 text-left ${guestForm.experienceLevel==='beginner'?'border-primary bg-primary/10':''}`}><strong>Beginner</strong><span className="mt-1 block text-xs text-muted-foreground">I am new to pickleball or still learning the basics</span></button><button type="button" onClick={()=>setGuest('experienceLevel','experienced')} className={`rounded-xl border p-4 text-left ${guestForm.experienceLevel==='experienced'?'border-primary bg-primary/10':''}`}><strong>Experienced pickleball player</strong><span className="mt-1 block text-xs text-muted-foreground">I already play pickleball regularly</span></button></div>{guestForm.experienceLevel==='experienced'&&<div className="grid sm:grid-cols-2 gap-4"><div><Label htmlFor="guestDupr">DUPR</Label><Input id="guestDupr" className="mt-1.5" value={guestForm.duprId} onChange={e=>setGuest('duprId',e.target.value)} placeholder="DUPR ID / rating, or No DUPR" required={data.requireDuprForExperienced}/></div><div><Label htmlFor="guestHomeClub">Club you normally play with</Label><Input id="guestHomeClub" className="mt-1.5" value={guestForm.homeClub} onChange={e=>setGuest('homeClub',e.target.value)} required={data.requireHomeClubForExperienced}/></div></div>}</section>
      {guestForm.experienceLevel&&<section className="glass rounded-2xl p-5 sm:p-6 space-y-4"><h2 className="text-lg font-black">3. Choose your session</h2>{guestForm.experienceLevel==='beginner'&&<p className="text-sm text-muted-foreground">Beginner guest places are currently available only at Ennistymon and Corofin.</p>}<div className="space-y-3">{guestSessions.map(s=><label key={s.id} className={`block cursor-pointer rounded-xl border p-4 ${guestForm.sessionId===s.id?'border-primary bg-primary/10':''}`}><div className="flex gap-3"><input type="radio" name="session" className="mt-1" checked={guestForm.sessionId===s.id} onChange={()=>setGuest('sessionId',s.id)} required/><div><p className="font-black">{s.venueName}</p><p className="mt-1 text-sm">{s.day} · {s.start}{s.end?`–${s.end}`:''}</p><p className="mt-1 text-xs text-muted-foreground">{s.level}{s.price?` · €${Number(s.price).toFixed(2)}`:''}{/cash/i.test(s.paymentMethod||'')?' · cash':''}</p></div></div></label>)}</div></section>}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"><ShieldCheck className="mr-2 inline h-4 w-4 text-primary"/><strong>No payment is taken with this request.</strong> If approved, {data.club?.name||'the club'} will send you a private link to complete the guest booking and payment.</div>
      <Button type="submit" className="w-full min-h-12 font-black" disabled={busy||!guestForm.experienceLevel||!guestForm.sessionId}>{busy?<><RefreshCw className="mr-2 h-4 w-4 animate-spin"/>Sending…</>:'Send guest request'}</Button>
    </form>}
  </div></div>;
}
