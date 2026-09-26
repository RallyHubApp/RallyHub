import React, { useMemo, useState } from 'react';
import { BellRing, CheckCircle2, Mail, MessageCircle, Share2, UserPlus2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { irelandCounties } from '@/data/directorySeed';

const EMPTY={
  firstName:'',email:'',mobile:'',county:'',clubChoice:'',otherClub:'',duprRating:'',emailOptIn:false,whatsappOptIn:false,website:''
};


export default function DirectoryPlayerNetworkPanel({ clubs=[] }){
  const [form,setForm]=useState(EMPTY);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [done,setDone]=useState(null);
  const [shareDraft,setShareDraft]=useState(null);

  const clubOptions=useMemo(()=>[...clubs]
    .filter(c=>c?.name)
    .sort((a,b)=>String(a.name).localeCompare(String(b.name))),[clubs]);

  const set=(key,value)=>setForm(prev=>({...prev,[key]:value}));
  const selectedClub=form.clubChoice==='other' ? null : clubOptions.find(c=>c.slug===form.clubChoice);
  const clubName=form.clubChoice==='other'?form.otherClub.trim():(selectedClub?.name||'');

  const submit=async(e)=>{
    e.preventDefault();
    if(busy)return;
    setBusy(true);setError('');
    try{
      const res=await base44.functions.invoke('directoryPlayerNetwork',{
        action:'public_subscribe',firstName:form.firstName,email:form.email,mobile:form.mobile,county:form.county,
        clubName,clubSlug:selectedClub?.slug||'',duprRating:form.duprRating,emailOptIn:form.emailOptIn,whatsappOptIn:form.whatsappOptIn,website:form.website
      });
      if(res.data?.error)throw new Error(res.data.error);
      setDone(res.data);
    }catch(err){setError(err?.response?.data?.error||err?.message||'Could not save your update preferences.');}
    finally{setBusy(false)}
  };

  const playerWhatsApp=`Hi, I came across RallyHub and thought you might like it.\n\nIt has a free Irish Pickleball Directory where you can find clubs, venues and regular sessions around Ireland, and you can also sign up to be notified about upcoming tournaments, events, coaching and other pickleball opportunities.\n\nLooks really useful, especially as it grows.\n\nHave a look here:\nhttps://rallyhub.ie/directory`;
  const playerEmail=`Hi,\n\nI came across RallyHub and thought you might find it useful.\n\nIt has a free Irish Pickleball Directory where players can find clubs, venues and regular playing sessions around Ireland.\n\nYou can also sign up for occasional updates about upcoming tournaments, social events, coaching and other pickleball opportunities.\n\nIt looks like it could become a really useful way of keeping up with what’s happening around Irish pickleball.\n\nHave a look here:\n\nhttps://rallyhub.ie/directory`;
  const clubWhatsApp=`Hi, I came across RallyHub’s new Irish Pickleball Directory and noticed our club isn’t on it yet.\n\nIt’s a free national directory for pickleball players to find clubs, venues and regular playing sessions around Ireland. Clubs can add or claim their listing for free and keep their own details up to date.\n\nI thought it might be worth getting our club listed too:\n\nhttps://rallyhub.ie/directory\n\nHave a look when you get a chance.`;
  const clubEmail=`Hi,\n\nI came across RallyHub’s new Irish Pickleball Directory and noticed our club isn’t on it yet.\n\nIt’s a free national directory helping pickleball players find clubs, venues and regular playing sessions around Ireland. Clubs can add or claim their listing for free and then keep their own information up to date.\n\nI thought it would be worth getting our club listed too.\n\nhttps://rallyhub.ie/directory\n\nHave a look when you get a chance.`;

  const openShare=(type,channel)=>{
    const isClub=type==='club';
    const isEmail=channel==='email';
    setShareDraft({
      type,channel,
      subject:isEmail?(isClub?'Free listing for our club on the RallyHub Pickleball Directory':'Thought you might like RallyHub'):'',
      message:isClub?(isEmail?clubEmail:clubWhatsApp):(isEmail?playerEmail:playerWhatsApp)
    });
  };
  const resetShare=()=>{
    if(!shareDraft)return;
    openShare(shareDraft.type,shareDraft.channel);
  };
  const sendShare=()=>{
    if(!shareDraft)return;
    if(shareDraft.channel==='whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(shareDraft.message)}`,'_blank','noopener,noreferrer');
    else window.location.href=`mailto:?subject=${encodeURIComponent(shareDraft.subject)}&body=${encodeURIComponent(shareDraft.message)}`;
  };

  return <section id="player-network" className="bg-[#f6faf9] border-y border-[#e0ece8]">
    <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-10 xl:px-12">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-2xl border border-[#cfe4d8] bg-white p-5 shadow-[0_8px_24px_rgba(8,24,77,.045)] sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f7ee] text-[#078e48]"><BellRing className="h-5 w-5"/></div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.09em] text-[#078e48]">For players across Ireland</p>
              <h2 className="mt-1 text-[24px] font-black tracking-[-.03em] text-[#07184c]">Playing pickleball? Stay in the loop.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52627d]">Get occasional RallyHub updates about tournaments, social events, coaching and other worthwhile pickleball opportunities. This is a national RallyHub player list and is completely separate from any individual club membership.</p>
            </div>
          </div>

          {done ? <div className="mt-5 rounded-xl border border-[#b8dfc7] bg-[#eef9f3] p-5">
            <div className="flex items-center gap-2 font-bold text-[#067b3f]"><CheckCircle2 className="h-5 w-5"/> You're on the RallyHub player update list</div>
            <p className="mt-2 text-sm text-[#405174]">{done.message}</p>
            {done.preferencesUrl&&<a href={done.preferencesUrl} className="mt-3 inline-flex text-sm font-bold text-[#07528a] hover:underline">Manage or unsubscribe from updates</a>}
          </div> : <form onSubmit={submit} className="mt-5 space-y-4">
            <input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>set('website',e.target.value)} className="hidden" aria-hidden="true" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-xs font-bold text-[#07184c]">First name
                <input value={form.firstName} onChange={e=>set('firstName',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#cfdde0] bg-[#fbfdfd] px-3 text-sm outline-none focus:border-[#078e48]" required autoComplete="given-name" />
              </label>
              <label className="text-xs font-bold text-[#07184c]">Email
                <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#cfdde0] bg-[#fbfdfd] px-3 text-sm outline-none focus:border-[#078e48]" autoComplete="email" placeholder="For email updates" />
              </label>
              <label className="text-xs font-bold text-[#07184c]">Mobile / WhatsApp
                <input type="tel" value={form.mobile} onChange={e=>set('mobile',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#cfdde0] bg-[#fbfdfd] px-3 text-sm outline-none focus:border-[#078e48]" autoComplete="tel" placeholder="For WhatsApp/SMS updates" />
              </label>
              <label className="text-xs font-bold text-[#07184c]">County
                <select value={form.county} onChange={e=>set('county',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#cfdde0] bg-[#fbfdfd] px-3 text-sm" required>
                  <option value="">Choose county…</option>
                  {irelandCounties.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold text-[#07184c]">Club
                <select value={form.clubChoice} onChange={e=>set('clubChoice',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#cfdde0] bg-[#fbfdfd] px-3 text-sm">
                  <option value="">No club / prefer not to say</option>
                  {clubOptions.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}
                  <option value="other">Other / not listed</option>
                </select>
              </label>
              <label className="text-xs font-bold text-[#07184c]">DUPR rating <span className="font-medium text-[#78859a]">(optional)</span>
                <input type="number" min="1" max="8" step="0.01" value={form.duprRating} onChange={e=>set('duprRating',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#cfdde0] bg-[#fbfdfd] px-3 text-sm outline-none focus:border-[#078e48]" placeholder="e.g. 3.45" />
              </label>
              {form.clubChoice==='other'&&<label className="text-xs font-bold text-[#07184c] sm:col-span-2 lg:col-span-3">Club name
                <input value={form.otherClub} onChange={e=>set('otherClub',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#cfdde0] bg-[#fbfdfd] px-3 text-sm outline-none focus:border-[#078e48]" placeholder="Enter your club name" />
              </label>}
            </div>

            <div className="rounded-xl border border-[#dbe6e8] bg-[#fbfdfd] p-4">
              <p className="text-xs font-extrabold text-[#07184c]">How would you like RallyHub to contact you?</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#dbe6e8] bg-white p-3 text-sm text-[#405174]"><input type="checkbox" checked={form.emailOptIn} onChange={e=>set('emailOptIn',e.target.checked)} className="mt-0.5 h-4 w-4"/><span><strong className="text-[#07184c]">Email me</strong> occasional RallyHub pickleball updates</span></label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#dbe6e8] bg-white p-3 text-sm text-[#405174]"><input type="checkbox" checked={form.whatsappOptIn} onChange={e=>set('whatsappOptIn',e.target.checked)} className="mt-0.5 h-4 w-4"/><span><strong className="text-[#07184c]">WhatsApp/SMS me</strong> occasional RallyHub pickleball updates</span></label>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-[#748196]">Choose at least one option. RallyHub will use these details only for relevant pickleball updates and service administration. We won't sell your information. You can change your preferences or unsubscribe at any time.</p>
            </div>
            {error&&<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            <button type="submit" disabled={busy} className="inline-flex h-11 items-center justify-center rounded-lg bg-[#078e48] px-5 text-sm font-bold text-white shadow-[0_7px_17px_rgba(7,142,72,.18)] hover:bg-[#067b3f] disabled:opacity-60">{busy?'Saving…':'Keep me updated'}</button>
          </form>}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#dbe6e8] bg-white p-5 shadow-[0_8px_24px_rgba(8,24,77,.04)]">
            <div className="flex items-center gap-2"><UserPlus2 className="h-5 w-5 text-[#078e48]"/><h3 className="font-black text-[#07184c]">Can't find your club?</h3></div>
            <p className="mt-2 text-sm leading-6 text-[#52627d]">Word of mouth will help us complete the Directory. Send a ready-made message to your club organiser. RallyHub never sees or stores the recipient's details.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <button type="button" onClick={()=>whatsappShare(clubShare)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#20a766] px-3 text-xs font-bold text-white"><MessageCircle className="h-4 w-4"/> WhatsApp my club</button>
              <button type="button" onClick={()=>emailShare('Free RallyHub pickleball club listing',clubShare)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#cbd7dc] bg-white px-3 text-xs font-bold text-[#07184c]"><Mail className="h-4 w-4"/> Email my club</button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dbe6e8] bg-white p-5 shadow-[0_8px_24px_rgba(8,24,77,.04)]">
            <div className="flex items-center gap-2"><Share2 className="h-5 w-5 text-[#07528a]"/><h3 className="font-black text-[#07184c]">Know another pickleball player?</h3></div>
            <p className="mt-2 text-sm leading-6 text-[#52627d]">Share the Directory and player update list with friends, clubs, tournament groups and WhatsApp communities.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <button type="button" onClick={()=>whatsappShare(playerShare)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#20a766] px-3 text-xs font-bold text-white"><MessageCircle className="h-4 w-4"/> Share on WhatsApp</button>
              <button type="button" onClick={()=>emailShare('RallyHub Irish Pickleball Directory',playerShare)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#cbd7dc] bg-white px-3 text-xs font-bold text-[#07184c]"><Mail className="h-4 w-4"/> Share by email</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
