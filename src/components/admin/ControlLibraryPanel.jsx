import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { BookOpen, FileText, Search, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/shared/GlassCard';

export default function ControlLibraryPanel() {
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState(null);
  const [loadingId,setLoadingId]=useState('');
  const q=useQuery({
    queryKey:['control-library'],
    queryFn:async()=>{const r=await base44.functions.invoke('controlLibrary',{action:'list'}); if(r.data?.error) throw new Error(r.data.error); return r.data;},
    staleTime:60000
  });
  const docs=useMemo(()=>{const term=search.trim().toLowerCase(); return (q.data?.documents||[]).filter(d=>!term||[d.title,d.category,d.path,d.version].join(' ').toLowerCase().includes(term));},[q.data,search]);
  const openDoc=async d=>{setLoadingId(d.id); try {const r=await base44.functions.invoke('controlLibrary',{action:'get',id:d.id}); if(r.data?.error) throw new Error(r.data.error); setSelected(r.data.document);} finally {setLoadingId('');}};
  if(q.isLoading) return <GlassCard className="p-6"><p className="flex items-center gap-2 text-sm"><RefreshCw className="h-4 w-4 animate-spin"/>Loading secure control library…</p></GlassCard>;
  if(q.isError) return <GlassCard className="p-6"><p className="font-bold text-destructive">Control library unavailable</p><p className="mt-1 text-sm text-muted-foreground">{q.error?.message}</p></GlassCard>;
  return <div className="space-y-4">
    <GlassCard className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Super Admin · Protected</p><h2 className="mt-1 text-xl font-black">Development & Control Library</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Read-only access to RallyHub's controlled development documents. Repository files remain authoritative; this secure view is generated from those files.</p></div><Badge variant="outline" className="w-fit"><ShieldCheck className="mr-1 h-3.5 w-3.5"/>{q.data?.count||0} documents</Badge></div>
      <div className="relative mt-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={e=>setSearch(e.target.value)} className="pl-9" placeholder="Search control documents, testing, architecture, DUPR…"/></div>
    </GlassCard>
    <div className="grid gap-3 md:grid-cols-2">{docs.map(d=><GlassCard key={d.id} className="p-4"><div className="flex h-full flex-col"><div className="flex items-start gap-3"><div className="rounded-lg bg-primary/10 p-2"><FileText className="h-4 w-4 text-primary"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Badge variant="secondary">{d.category}</Badge>{d.version&&<Badge variant="outline">v{d.version}</Badge>}</div><h3 className="mt-2 font-bold leading-snug">{d.title}</h3><p className="mt-1 break-all text-[11px] text-muted-foreground">{d.path}</p></div></div><Button variant="outline" className="mt-4 w-full" disabled={loadingId===d.id} onClick={()=>openDoc(d)}>{loadingId===d.id?<RefreshCw className="mr-2 h-4 w-4 animate-spin"/>:<BookOpen className="mr-2 h-4 w-4"/>}{loadingId===d.id?'Opening…':'Open & read'}</Button></div></GlassCard>)}</div>
    {!docs.length&&<GlassCard className="p-8 text-center text-sm text-muted-foreground">No control documents match that search.</GlassCard>}
    {selected&&<div className="fixed inset-0 z-[100] bg-black/60 p-2 sm:p-6" role="dialog" aria-modal="true"><div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"><div className="flex items-start justify-between gap-3 border-b p-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">{selected.category}</p><h2 className="mt-1 text-lg font-black sm:text-xl">{selected.title}</h2><p className="mt-1 text-[11px] text-muted-foreground">{selected.path}{selected.version?\` · version \${selected.version}\`:''}</p></div><Button size="icon" variant="ghost" onClick={()=>setSelected(null)} aria-label="Close document"><X className="h-5 w-5"/></Button></div><div className="flex-1 overflow-y-auto p-4 sm:p-7"><article className="prose prose-sm dark:prose-invert max-w-none prose-headings:scroll-mt-4 prose-table:block prose-table:overflow-x-auto"><ReactMarkdown>{selected.content}</ReactMarkdown></article></div></div></div>}
  </div>;
}
