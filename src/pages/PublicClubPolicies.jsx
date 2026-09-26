import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Printer, RefreshCw, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
import { Button } from '@/components/ui/button';

const TYPE_LABELS={
  liability_waiver:'Participation & liability',
  code_of_conduct:'Code of Conduct',
  health_safety:'Health & safety',
  risk_assessment:'Risk assessment',
  venue_facilities:'Venue & facilities',
  accident_incident_emergency:'Accident & emergency',
  complaints_disciplinary:'Complaints & disciplinary',
  data_protection_privacy:'Data protection & privacy',
  adult_participation:'Adult participation',
  equality_inclusion:'Equality & inclusion',
  other:'Club policy',
};

function PolicyCard({doc}){
  return <article className="rounded-2xl border border-border bg-card overflow-hidden break-inside-avoid">
    <div className="p-4 sm:p-5 border-b border-border bg-secondary/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{TYPE_LABELS[doc.type]||'Club policy'}</p>
          <h2 className="mt-1 text-lg font-black leading-tight">{doc.title}</h2>
        </div>
        <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Version {doc.version}</span>
        {doc.effectiveFrom&&<span>Effective {new Date(doc.effectiveFrom+'T12:00:00').toLocaleDateString('en-IE')}</span>}
        {doc.reviewDueOn&&<span>Review by {new Date(doc.reviewDueOn+'T12:00:00').toLocaleDateString('en-IE')}</span>}
        {doc.jurisdiction&&<span>{doc.jurisdiction}</span>}
      </div>
    </div>
    <details className="group" open={doc.type==='code_of_conduct'}>
      <summary className="cursor-pointer list-none px-4 sm:px-5 py-3 text-sm font-bold text-primary print:hidden">Read full document</summary>
      <div className="px-4 sm:px-5 pb-5 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{doc.bodyText}</div>
    </details>
  </article>;
}

export default function PublicClubPolicies(){
  const {slug}=useParams();
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  useEffect(()=>{
    let active=true;
    setLoading(true);setError('');
    base44.functions.invoke('clubPolicyLibrary',{action:'public_get',clubSlug:slug})
      .then(res=>{if(!active)return;if(res.data?.error)throw new Error(res.data.error);setData(res.data);})
      .catch(err=>{if(active)setError(err?.message||'Policy library unavailable.');})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false};
  },[slug]);

  const documents=useMemo(()=>data?.documents||[],[data]);
  const club=data?.club||null;

  if(loading)return <div className="min-h-screen bg-background text-foreground grid place-items-center"><div className="text-center"><RefreshCw className="mx-auto h-7 w-7 animate-spin"/><p className="mt-3 text-sm text-muted-foreground">Loading club policies…</p></div></div>;

  return <div className="min-h-screen bg-background text-foreground flex flex-col">
    <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={`/directory/${slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4"/>Back to club page</Link>
        {data&&<Button variant="outline" className="gap-2" onClick={()=>window.print()}><Printer className="w-4 h-4"/>Print / Save PDF</Button>}
      </div>

      {error&&!data?<div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-6"><h1 className="text-xl font-black">Policy library unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p></div>:<>
        <header className="mt-5 rounded-3xl border border-border bg-card p-5 sm:p-8 text-center" style={{borderTop:`7px solid ${club?.primary_colour||'#2563eb'}`}}>
          <RallyHubPublicBrand club={club} clubFirst pageLabel="Policy Library"/>
          <ShieldCheck className="mx-auto mt-5 h-9 w-9 text-primary"/>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black">{club?.name} Policy Library</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">Published club policies and participation documents are held here so members and guests can access the current versions whenever they wish. You do not need to accept every supporting policy individually unless a registration or membership flow specifically asks you to do so.</p>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-2 print:block print:space-y-4">
          {documents.map(doc=><PolicyCard key={`${doc.source}-${doc.id}`} doc={doc}/>)}
        </div>
        {!documents.length&&<div className="mt-6 rounded-2xl border p-6 text-center text-sm text-muted-foreground">No public club policies are published yet.</div>}
        <p className="mt-6 text-xs leading-5 text-muted-foreground">These documents describe club policy and governance. They do not replace venue-specific emergency instructions, insurance terms or independent legal advice where required.</p>
      </>}
    </main>
    <div className="px-4 pb-4 print:hidden"><PublicCopyrightFooter maxWidthClass="max-w-5xl"/></div>
  </div>;
}
