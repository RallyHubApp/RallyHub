import React from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';

export default function PublicInterclubCommittee(){
  const { token } = useParams();
  const [data,setData] = React.useState(null);
  const [error,setError] = React.useState('');
  React.useEffect(()=>{
    let active=true;
    base44.functions.invoke('getInterclubCommitteeBriefing',{token})
      .then(r=>{ if(!active)return; if(r.data?.error) throw new Error(r.data.error); setData(r.data); })
      .catch(e=>active&&setError(e?.response?.data?.error||e?.message||'Committee briefing unavailable'));
    return()=>{active=false};
  },[token]);
  if(error) return <div className="min-h-screen bg-background text-foreground grid place-items-center p-5"><div className="max-w-md rounded-2xl border bg-card p-6 text-center"><RallyHubPublicBrand moduleName="Interclub" pageLabel="Committee Briefing"/><p className="mt-5 font-bold">Committee link unavailable</p><p className="mt-2 text-sm text-muted-foreground">{error}</p></div></div>;
  if(!data) return <div className="min-h-screen bg-background grid place-items-center">Loading…</div>;
  return <div className="min-h-screen bg-background text-foreground p-4 sm:p-8"><div className="mx-auto max-w-3xl space-y-5"><div className="rounded-2xl border bg-card p-5 sm:p-7 text-center"><RallyHubPublicBrand moduleName="Interclub" pageLabel="Committee Briefing"/><p className="mt-2 text-xs font-black uppercase tracking-[.18em] text-primary">Committee event page</p><h1 className="mt-3 text-2xl sm:text-3xl font-black">{data.briefing.title}</h1><p className="mt-3 text-sm text-muted-foreground">{data.briefing.intro}</p></div><div className="rounded-2xl border bg-card p-5"><p className="font-bold">{data.event.clubA} vs {data.event.clubB}</p><p className="mt-2 text-sm text-muted-foreground">{data.event.date} · {data.event.startTime}{data.event.endTime?`–${data.event.endTime}`:''} · {data.event.venue}</p></div>{(data.briefing.sections||[]).length?data.briefing.sections.map((s,i)=><section key={i} className="rounded-2xl border bg-card p-5"><h2 className="text-lg font-black">{s.title||`Section ${i+1}`}</h2>{Array.isArray(s.items)&&<ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{s.items.map((x,j)=><li key={j}>{x}</li>)}</ul>}{s.text&&<p className="mt-3 text-sm leading-6">{s.text}</p>}</section>):<section className="rounded-2xl border border-dashed bg-card/50 p-6 text-center"><p className="font-bold">Committee checklist coming next</p><p className="mt-2 text-sm text-muted-foreground">The page is ready. The agreed jobs, checklist and practical notes will be added here.</p></section>}</div></div>;
}