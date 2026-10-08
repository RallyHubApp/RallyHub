import React,{useEffect,useMemo,useState} from 'react';
import {useParams,useSearchParams,Link} from 'react-router-dom';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
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
  const [guestForm,setGuestForm]=useState({fullName:'',email:'',mobile:'',ageConfirmed:false,experienceLevel:'',previousSports:[],sportingBackgroundNote:'',healthDeclarationApplies:null,medicalNote:'',sessionId:params.get('session')||'',duprId:'',homeClub:''});

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
  const togglePreviousSport=sport=>setGuestForm(f=>{
    const current=Array.isArray(f.previousSports)?f.previousSports:[];
    if(sport==='None of these')return {...f,previousSports:current.includes(sport)?[]:['None of these']};
    const withoutNone=current.filter(x=>x!=='None of these');
    return {...f,previousSports:withoutNone.includes(sport)?withoutNone.filter(x=>x!==sport):[...withoutNone,sport]};
  });
  const setMember=(k,v)=>setMemberForm(f=>({...f,[k]:v}));

  const chooseGuestType=level=>{setGuestForm(f=>({...f,experienceLevel:level,sessionId:'',...(level==='experienced'?{previousSports:[],sportingBackgroundNote:''}:{})}));switchJourney('guest');};
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

  const guestMissing=()=>{if(!guestForm.fullName.trim())return 'Enter your full name.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email.trim()))return 'Enter a valid email address.';if(!/^(?:08\d{8}|3538\d{8})$/.test(guestForm.mobile.replace(/\D/g,'')))return 'Enter a valid Irish mobile number (for example 087 123 4567).';if(data.adultsOnly&&!guestForm.ageConfirmed)return 'Confirm that you meet the minimum age requirement.';if(guestForm.experienceLevel==='beginner'&&!guestForm.previousSports.length)return 'Choose a previous sport or None of these.';if(guestForm.experienceLevel==='experienced'&&data.requireDuprForExperienced&&!guestForm.duprId.trim())return 'Enter your DUPR details or No DUPR.';if(guestForm.experienceLevel==='experienced'&&data.requireHomeClubForExperienced&&!guestForm.homeClub.trim())return 'Enter your home club.';if(typeof guestForm.healthDeclarationApplies!=='boolean')return 'Answer Yes or No to the health questions.';if(guestForm.healthDeclarationApplies&&!guestForm.medicalNote.trim())return 'Give brief details of your health declaration.';if(!guestForm.sessionId)return 'Choose an available session.';return '';};
  const submitGuest=async e=>{
    e.preventDefault();const missing=guestMissing();if(missing){setError(missing);window.scrollTo({top:0,behavior:'smooth'});return;}setBusy(true);setError('');
    try{
      const res=await base44.functions.invoke('guestAccessJourney',{action:'public_submit',clubSlug,...guestForm});
      if(res.data?.error)throw new Error(res.data.error);
      if(!res.data?.success)throw new Error('Request not confirmed. Please try again.');setDone({type:'guest-request',...res.data});window.scrollTo({top:0,behavior:'smooth'});
    }catch(e2){setError(e2?.response?.data?.error||e2?.message||'Could not send your guest request.');window.scrollTo({top:0,behavior:'smooth'})}
    finally{setBusy(false)}
  };

  if(loading)return <div className="min-h-screen grid place-items-center bg-background"><RefreshCw className="h-7 w-7 animate-spin"/></div>;
  if(!data)return <div className="min-h-screen grid place-items-center bg-background p-5"><div className="glass max-w-md rounded-2xl p-6 text-center"><h1 className="text-xl font-black">Session booking unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p></div></div>;

  if(done?.type==='guest-request')return <div className="min-h-screen bg-background p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-50"/><div className="mx-auto max-w-xl glass rounded-2xl p-7 text-center"><RallyHubPublicBrand club={data.club} clubFirst pageLabel="Guest Request"/><CheckCircle2 className="mx-auto mt-6 h-12 w-12 text-primary"/><h1 className="mt-4 text-2xl font-black">Request received — awaiting club approval</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{done.message}</p><Link to={`/directory/${clubSlug}`} className="mt-6 inline-flex rounded-xl border px-4 py-3 text-sm font-bold">Back to club directory page</Link></div></div>;

  if(done?.type==='member')return <div className="min-h-screen bg-background p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-50"/><div className="mx-auto max-w-xl glass rounded-2xl p-7 text-center"><RallyHubPublicBrand club={data.club} clubFirst pageLabel="Member Session"/><CheckCircle2 className="mx-auto mt-6 h-12 w-12 text-primary"/><h1 className="mt-4 text-2xl font-black">Booking confirmed</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{done.message}</p>{done.session&&<div className="mt-5 rounded-xl border bg-secondary/30 p-4 text-left text-sm"><p className="font-black">{niceDate(done.session.sessionDate)} · {done.session.startTime}{done.session.endTime?`–${done.session.endTime}`:''}</p><p className="mt-2 font-semibold">{done.session.venueName}</p><p className="text-muted-foreground">{done.session.venueAddress}</p></div>}<Link to={`/directory/${clubSlug}`} className="mt-6 inline-flex rounded-xl border px-4 py-3 text-sm font-bold">Back to club directory page</Link></div></div>;

  return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8"><AppearanceQuickButton className="fixed right-3 top-3 z-50"/><div className="mx-auto max-w-2xl space-y-5">
    <header className="glass rounded-2xl p-6 text-center">
      <RallyHubPublicBrand club={data.club} clubFirst pageLabel="Session Booking"/>
      <h1 className="mt-5 text-2xl sm:text-3xl font-black">Book or request a session</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose a guest visit, an experienced-player visit, or pay for an additional session as an existing member.</p>
    </header>

    {!journey&&<section className="grid gap-3 sm:grid-cols-3">
      <button type="button" onClick={()=>chooseGuestType('beginner')} className="glass rounded-2xl p-5 text-left hover:border-primary/50 border border-transparent transition-colors">
        <UserCheck className="h-6 w-6 text-primary"/><h2 className="mt-3 text-lg font-black">I’m a guest</h2><p className="mt-1 text-sm text-muted-foreground">I’m new to pickleball or learning the basics. Request a guest place, subject to club approval.</p>
      </button>
      <button type="button" onClick={()=>chooseGuestType('experienced')} className="glass rounded-2xl p-5 text-left hover:border-primary/50 border border-transparent transition-colors">
        <Users className="h-6 w-6 text-primary"/><h2 className="mt-3 text-lg font-black">I’m an experienced player</h2><p className="mt-1 text-sm text-muted-foreground">I already play pickleball. Request a guest place at an experienced session, subject to club approval.</p>
      </button>
      <button type="button" onClick={()=>switchJourney('member')} className="glass rounded-2xl p-5 text-left hover:border-primary/50 border border-transparent transition-colors">
        <UserCheck className="h-6 w-6 text-primary"/><h2 className="mt-3 text-lg font-black">I’m an existing member</h2><p className="mt-1 text-sm text-muted-foreground">Verify my membership to pay for an additional or unpaid session.</p>
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

    {journey==='guest'&&<form onSubmit={submitGuest} noValidate className="space-y-5">
      <section className="glass rounded-2xl p-5 sm:p-6 space-y-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black">1. About you</h2><p className="mt-1 text-xs text-muted-foreground">Guest requests are checked by the club before payment.</p></div><Button type="button" variant="ghost" size="sm" onClick={()=>switchJourney('')}>Change</Button></div><div><Label htmlFor="guestFullName">Full name</Label><Input id="guestFullName" className="mt-1.5" value={guestForm.fullName} onChange={e=>setGuest('fullName',e.target.value)} required/></div><div className="grid sm:grid-cols-2 gap-4"><div><Label htmlFor="guestEmail">Email</Label><Input id="guestEmail" type="email" className="mt-1.5" value={guestForm.email} onChange={e=>setGuest('email',e.target.value)} required/></div><div><Label htmlFor="guestMobile">Mobile</Label><Input id="guestMobile" type="tel" className="mt-1.5" value={guestForm.mobile} onChange={e=>setGuest('mobile',e.target.value)} required/></div></div>{data.adultsOnly&&<label className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={guestForm.ageConfirmed} onChange={e=>setGuest('ageConfirmed',e.target.checked)} required/><span><strong>I confirm that I am {data.minimumAge||18} years of age or over.</strong></span></label>}</section>
      <section className="glass rounded-2xl p-5 sm:p-6 space-y-4"><h2 className="text-lg font-black">2. Playing experience</h2><p className="text-sm text-muted-foreground">Selected: <strong>{guestForm.experienceLevel==='experienced'?'Experienced player':'Guest / beginner'}</strong>. Use Change above to choose a different route.</p>{guestForm.experienceLevel==='experienced'&&<div className="grid sm:grid-cols-2 gap-4"><div><Label htmlFor="guestDupr">DUPR</Label><Input id="guestDupr" className="mt-1.5" value={guestForm.duprId} onChange={e=>setGuest('duprId',e.target.value)} placeholder="DUPR ID / rating, or No DUPR" required={data.requireDuprForExperienced}/></div><div><Label htmlFor="guestHomeClub">Club you normally play with</Label><Input id="guestHomeClub" className="mt-1.5" value={guestForm.homeClub} onChange={e=>setGuest('homeClub',e.target.value)} required={data.requireHomeClubForExperienced}/></div></div>}</section>

      {guestForm.experienceLevel==='beginner'&&<section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
        <div><h2 className="text-lg font-black">3. Previous sporting experience</h2><p className="mt-1 text-sm text-muted-foreground">Please indicate if you have ever played any of these sports previously, even if only briefly or at school. Tick all that apply.</p></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{['Tennis','Badminton','Squash','Racketball','Padel','Table Tennis','None of these'].map(sport=><label key={sport} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm ${guestForm.previousSports.includes(sport)?'border-primary bg-primary/10':''}`}><input type="checkbox" checked={guestForm.previousSports.includes(sport)} onChange={()=>togglePreviousSport(sport)}/><span>{sport}</span></label>)}</div>
        <div><Label htmlFor="guestSportingBackground">Any other sporting history or background you think may be relevant? <span className="font-normal text-muted-foreground">(optional)</span></Label><textarea id="guestSportingBackground" value={guestForm.sportingBackgroundNote} onChange={e=>setGuest('sportingBackgroundNote',e.target.value)} rows={3} maxLength={1200} placeholder="Anything else you would like us to know about your sporting experience." className="mt-1.5 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"/></div>
      </section>}

      <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
        <div><h2 className="text-lg font-black">{guestForm.experienceLevel==='beginner'?'4':'3'}. Health & medical information</h2><p className="mt-1 text-xs text-muted-foreground">This information is only for authorised club/session organisers and helps the host support you safely.</p></div>
        <div className="space-y-3 rounded-xl border bg-secondary/20 p-4 text-sm leading-6">
          <p><strong>Are you currently receiving medical treatment for any serious illness, or taking heart or blood pressure medication?</strong></p>
          <p><strong>Have you had surgery or sustained an injury through sport or another activity that required medical intervention or treatment in the last 3 years?</strong></p>
          <p><strong>Do you have balance, hearing, sight or other health issues that might be pertinent?</strong></p>
        </div>
        <fieldset><legend className="text-sm font-bold">Does any of the above apply to you?</legend><div className="mt-3 flex flex-wrap gap-3"><label className={`flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm ${guestForm.healthDeclarationApplies===true?'border-primary bg-primary/10':''}`}><input type="radio" name="guest-health" checked={guestForm.healthDeclarationApplies===true} onChange={()=>setGuest('healthDeclarationApplies',true)} required/> Yes</label><label className={`flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm ${guestForm.healthDeclarationApplies===false?'border-primary bg-primary/10':''}`}><input type="radio" name="guest-health" checked={guestForm.healthDeclarationApplies===false} onChange={()=>{setGuest('healthDeclarationApplies',false);setGuest('medicalNote','')}} required/> No</label></div></fieldset>
        {guestForm.healthDeclarationApplies===true&&<div><Label htmlFor="guestMedicalNote">Please give brief details</Label><textarea id="guestMedicalNote" value={guestForm.medicalNote} onChange={e=>setGuest('medicalNote',e.target.value)} rows={4} maxLength={1600} required placeholder="Brief details for the session organiser." className="mt-1.5 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"/></div>}
      </section>

      {guestForm.experienceLevel&&<section className="glass rounded-2xl p-5 sm:p-6 space-y-4"><h2 className="text-lg font-black">{guestForm.experienceLevel==='beginner'?'5':'4'}. Choose your session</h2>{guestForm.experienceLevel==='beginner'&&<p className="text-sm text-muted-foreground">Beginner guest places are available at Ennistymon, Corofin, Clarecastle and Shannon, subject to session availability.</p>}{guestForm.experienceLevel==='experienced'&&<p className="text-sm text-muted-foreground">Experienced guest places shown here are the Ennis / Doora Barefield Monday and Thursday sessions. Other Clare venues are by request and may be offered separately by the club or session host.</p>}<div className="space-y-3">{guestSessions.map(s=><label key={s.id} className={`block rounded-xl border p-4 ${s.full?'cursor-not-allowed opacity-70':`cursor-pointer ${guestForm.sessionId===s.id?'border-primary bg-primary/10':''}`}`}><div className="flex gap-3"><input type="radio" name="session" className="mt-1" checked={guestForm.sessionId===s.id} onChange={()=>!s.full&&setGuest('sessionId',s.id)} disabled={s.full} required/><div><div className="flex flex-wrap items-center gap-2"><p className="font-black">{s.venueName}</p>{s.full&&<Badge variant="outline" className="border-amber-500/50 text-amber-700">{s.spondStatus==='waiting_list'?'FULL · waiting list':'FULL'}</Badge>}</div><p className="mt-1 text-sm">{s.day} · {s.start}{s.end?`–${s.end}`:''}</p><p className="mt-1 text-xs text-muted-foreground">{s.level}{s.price?` · €${Number(s.price).toFixed(2)}`:''}{/cash/i.test(s.paymentMethod||'')?' · cash':''}{s.full?' · Choose another available session':''}</p></div></div></label>)}</div></section>}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"><ShieldCheck className="mr-2 inline h-4 w-4 text-primary"/><strong>No payment is taken with this request.</strong> If approved, {data.club?.name||'the club'} will send you a private link to complete the guest booking and payment.</div>
      {guestMissing()&&<p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">To continue: {guestMissing()}</p>}
      <Button type="submit" className="w-full min-h-12 font-black" disabled={busy}>{busy?<><RefreshCw className="mr-2 h-4 w-4 animate-spin"/>Sending your request… please wait</>:'Send guest request'}</Button>
    </form>}
  </div></div>;
}