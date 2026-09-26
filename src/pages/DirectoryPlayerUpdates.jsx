import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function DirectoryPlayerUpdates(){
  const [params]=useSearchParams();
  const token=params.get('token')||'';
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [subscriber,setSubscriber]=useState(null);
  const [emailOptIn,setEmailOptIn]=useState(false);
  const [whatsappOptIn,setWhatsappOptIn]=useState(false);
  const [saved,setSaved]=useState('');

  useEffect(()=>{
    let active=true;
    setLoading(true);setError('');
    base44.functions.invoke('directoryPlayerNetwork',{action:'public_get_preferences',token})
      .then(res=>{
        if(!active)return;
        if(res.data?.error)throw new Error(res.data.error);
        const row=res.data?.subscriber||null;
        setSubscriber(row);setEmailOptIn(row?.emailOptIn===true);setWhatsappOptIn(row?.whatsappOptIn===true);
      })
      .catch(err=>{if(active)setError(err?.response?.data?.error||err?.message||'This preference link is unavailable.');})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false};
  },[token]);

  const save=async()=>{
    setBusy(true);setError('');setSaved('');
    try{
      const res=await base44.functions.invoke('directoryPlayerNetwork',{action:'public_update_preferences',token,emailOptIn,whatsappOptIn});
      if(res.data?.error)throw new Error(res.data.error);
      setSubscriber(res.data?.subscriber||subscriber);
      setSaved(res.data?.message||'Your preferences have been saved.');
    }catch(err){setError(err?.response?.data?.error||err?.message||'Could not update your preferences.');}
    finally{setBusy(false)}
  };

  return <div className="min-h-screen bg-background text-foreground flex flex-col">
    <PublicDirectoryHeader />
    <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        <div className="flex items-start gap-3"><ShieldCheck className="mt-1 h-6 w-6 text-primary shrink-0"/><div><p className="text-xs font-bold uppercase tracking-wider text-primary">RallyHub player updates</p><h1 className="mt-1 text-2xl font-black">Manage your update preferences</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Choose how RallyHub can contact you about worthwhile pickleball events, coaching and other opportunities around Ireland.</p></div></div>

        {loading?<div className="py-12 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-primary"/></div>:error&&!subscriber?<div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>:subscriber?<div className="mt-6 space-y-4">
          <div className="rounded-xl border bg-secondary/20 p-4 text-sm">
            <p><strong>{subscriber.firstName}</strong>{subscriber.clubName?` · ${subscriber.clubName}`:''}{subscriber.county?` · ${subscriber.county}`:''}</p>
            <p className="mt-1 text-xs text-muted-foreground">{subscriber.email||'No email stored'}{subscriber.mobile?` · ${subscriber.mobile}`:''}</p>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" checked={emailOptIn} onChange={e=>setEmailOptIn(e.target.checked)} className="mt-0.5 h-4 w-4"/><span><strong>Email updates</strong><span className="block text-xs text-muted-foreground mt-1">Occasional RallyHub pickleball updates by email.</span></span></label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" checked={whatsappOptIn} onChange={e=>setWhatsappOptIn(e.target.checked)} className="mt-0.5 h-4 w-4"/><span><strong>WhatsApp / SMS updates</strong><span className="block text-xs text-muted-foreground mt-1">Occasional RallyHub pickleball updates to your mobile.</span></span></label>
          {!emailOptIn&&!whatsappOptIn&&<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"><strong>Unsubscribe from all updates.</strong> Save with both options unticked and RallyHub will mark you as unsubscribed.</div>}
          {error&&<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
          {saved&&<div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm"><CheckCircle2 className="h-5 w-5 text-emerald-500"/>{saved}</div>}
          <Button onClick={save} disabled={busy} className="w-full">{busy?'Saving…':'Save preferences'}</Button>
          <p className="text-xs leading-5 text-muted-foreground">RallyHub uses these details only for relevant pickleball updates and service administration. Your information is not sold to advertisers or clubs.</p>
        </div>:null}
        <Link to="/directory" className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">Back to the RallyHub Directory</Link>
      </section>
    </main>
    <PublicCopyrightFooter />
  </div>;
}
