import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import GlassCard from '@/components/shared/GlassCard';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, FileText, Link as LinkIcon, PlayCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getClub } from '@/data/directorySeed';

function iconFor(type) {
  if (type === 'video') return PlayCircle;
  if (['document', 'policy', 'guide'].includes(type)) return FileText;
  return LinkIcon;
}

export default function MemberLearn({ previewData = null }) {
  const [search, setSearch] = useState('');
  const { data: fetchedLearn = null, isLoading, error } = useQuery({
    queryKey: ['member-portal-learn'],
    queryFn: async () => {
      const res = await base44.functions.invoke('memberPortal', { action: 'learn' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.learn || null;
    },
    staleTime: 60_000,
    enabled: !previewData,
  });
  const learn = previewData || fetchedLearn;

  const directoryClub = learn?.club?.slug ? getClub(learn.club.slug) : null;
  const builtInLinks = useMemo(() => {
    const links = [];
    if (directoryClub?.website) links.push({ id:'club-website', title:'Club website', description:'Official club website', category:'Club Information', resource_type:'link', url:directoryClub.website });
    if (directoryClub?.shopUrl) links.push({ id:'club-shop', title:'Club shop', description:'Club clothing, equipment or merchandise', category:'Club Information', resource_type:'link', url:directoryClub.shopUrl });
    if (directoryClub?.slug) links.push({ id:'directory-profile', title:'Public club profile', description:'Venues, sessions and public club information on RallyHub', category:'Club Information', resource_type:'link', url:`/directory/${directoryClub.slug}` });
    return links;
  }, [directoryClub]);

  const resources = [...(learn?.resources || []), ...builtInLinks];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter(resource => `${resource.title || ''} ${resource.description || ''} ${resource.category || ''}`.toLowerCase().includes(q));
  }, [resources, search]);
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(resource => {
      const category = resource.category || 'Resources';
      if (!map.has(category)) map.set(category, []);
      map.get(category).push(resource);
    });
    return [...map.entries()];
  }, [filtered]);

  if (isLoading) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading resources…</div>;
  if (error) return <div className="glass rounded-xl p-6 text-sm text-destructive">{error.message || 'Could not load resources.'}</div>;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0 max-w-6xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{learn?.club?.name || 'RallyHub'}</p>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">Learn</h1>
        <p className="text-sm text-muted-foreground mt-1">Guides, coaching, rules, videos and useful club resources.</p>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search resources" className="pl-9 bg-secondary" /></div>

      {grouped.length === 0 && (
        <GlassCard className="text-center py-12">
          <BookOpen className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="font-semibold">No resources published yet</p>
          <p className="text-xs text-muted-foreground mt-1">Club guides, coaching material, videos and policies can be published here.</p>
        </GlassCard>
      )}

      {grouped.map(([category, rows]) => (
        <section key={category}>
          <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-bold">{category}</h2><Badge variant="outline" className="text-[9px]">{rows.length}</Badge></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map(resource => {
              const Icon = iconFor(resource.resource_type);
              const external = resource.url && /^https?:\/\//i.test(resource.url);
              const content = (
                <GlassCard className="h-full p-4 hover:bg-secondary/40 transition-colors">
                  {resource.image_url && <img src={resource.image_url} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
                    <div className="min-w-0 flex-1"><p className="text-sm font-bold">{resource.title}</p>{resource.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{resource.description}</p>}<p className="text-[10px] text-primary mt-3 inline-flex items-center gap-1">Open resource {external && <ExternalLink className="w-3 h-3" />}</p></div>
                  </div>
                </GlassCard>
              );
              if (!resource.url) return <div key={resource.id}>{content}</div>;
              return external ? <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer">{content}</a> : <a key={resource.id} href={resource.url}>{content}</a>;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
