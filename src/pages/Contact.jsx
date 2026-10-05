import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, MessageCircle, Send, CheckCircle2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Seo from '@/components/public/Seo';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';
import { base44 } from '@/api/base44Client';

const EMPTY={name:'',email:'',clubName:'',phone:'',category:'improvement',message:''};

export default function Contact() {
  const [form,setForm]=useState(EMPTY);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [done,setDone]=useState('');
  const set=(key,value)=>setForm(v=>({...v,[key]:value}));
  const submit=async(e)=>{
    e.preventDefault(); if(busy)return; setBusy(true);setError('');setDone('');
    try{
      const res=await base44.functions.invoke('rallyHubFeedback',{action:'public_contact',...form,pagePath:window.location.pathname,userAgent:navigator.userAgent});
      if(res.data?.error)throw new Error(res.data.error);
      setDone(res.data?.message||'Thanks. Your message has been sent to RallyHub.');
      setForm(EMPTY);
    }catch(err){setError(err?.response?.data?.error||err?.message||'Could not send your message.');}
    finally{setBusy(false)}
  };
  const whatsappText=encodeURIComponent('Hi Brian, I have some feedback / a suggestion for RallyHub.');
  return (
    <>
      <Seo title="Contact RallyHub | Feedback, Suggestions & Support" description="Send RallyHub feedback, suggestions, questions or support requests by form, email or WhatsApp." path="/contact" />
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-4xl px-4 pb-4 pt-10 sm:pt-14">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"><ArrowLeft className="w-4 h-4"/> Back to RallyHub</Link>
          <div className="glass rounded-2xl p-6 sm:p-10 space-y-7">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><MessageCircle className="w-6 h-6 text-primary"/></div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Contact RallyHub</h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">Got a suggestion, spotted something that could be better, need help, or just want to tell us what you think? Send it here. You can also email or WhatsApp Brian directly.</p>
            </div>

            <form onSubmit={submit} className="rounded-2xl border bg-card p-5 sm:p-6 space-y-4">
              <div><p className="text-sm font-black">Send feedback or a message</p><p className="mt-1 text-xs text-muted-foreground">Name, email, club and message are required so we know who we're hearing from and can reply if needed.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">Your name *<input required value={form.name} onChange={e=>set('name',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm" autoComplete="name"/></label>
                <label className="text-sm font-semibold">Email *<input required type="email" value={form.email} onChange={e=>set('email',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm" autoComplete="email"/></label>
                <label className="text-sm font-semibold">Club *<input required value={form.clubName} onChange={e=>set('clubName',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm" placeholder="e.g. Clare Pickleball"/></label>
                <label className="text-sm font-semibold">Mobile / WhatsApp <span className="font-normal text-muted-foreground">(optional)</span><input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm" autoComplete="tel"/></label>
                <label className="text-sm font-semibold sm:col-span-2">What is this about?<select value={form.category} onChange={e=>set('category',e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm"><option value="improvement">Suggestion / improvement</option><option value="feature_request">Feature idea</option><option value="bug">Something isn't working</option><option value="confusing">Something is confusing</option><option value="other">Other</option></select></label>
                <label className="text-sm font-semibold sm:col-span-2">Your message *<textarea required rows="7" value={form.message} onChange={e=>set('message',e.target.value)} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-3 text-sm leading-6" placeholder="Tell us what you spotted, what you'd like changed, or what you think would make RallyHub better."/></label>
              </div>
              {error&&<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              {done&&<div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm"><CheckCircle2 className="h-5 w-5 text-emerald-500"/>{done}</div>}
              <Button type="submit" disabled={busy} className="w-full sm:w-auto"><Send className="mr-2 h-4 w-4"/>{busy?'Sending…':'Send to RallyHub'}</Button>
            </form>

            <div className="grid gap-3 sm:grid-cols-2">
              <a href="mailto:rallyhubapp@gmail.com" className="rounded-xl border bg-card p-5 transition hover:border-primary/40"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10"><Mail className="h-5 w-5 text-primary"/></div><div><p className="font-bold">Email RallyHub</p><p className="text-sm text-primary">rallyhubapp@gmail.com</p></div></div></a>
              <a href={`https://wa.me/353878100333?text=${whatsappText}`} target="_blank" rel="noreferrer" className="rounded-xl border bg-card p-5 transition hover:border-primary/40"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10"><Phone className="h-5 w-5 text-primary"/></div><div><p className="font-bold">WhatsApp Brian</p><p className="text-sm text-primary">087 810 0333</p></div></div></a>
            </div>

            <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/about">Learn more about RallyHub</Link></Button><Button asChild variant="outline"><Link to="/directory">Explore the Directory</Link></Button></div>
          </div>
        </div>
        <div className="px-4 pb-4"><PublicCopyrightFooter maxWidthClass="max-w-4xl"/></div>
      </div>
    </>
  );
}
