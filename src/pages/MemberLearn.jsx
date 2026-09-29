import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import GlassCard from '@/components/shared/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen, ChevronDown, ExternalLink, FileText, Filter, Link as LinkIcon,
  Mail, MessageCircle, PlayCircle, Search, Settings2, X, MessageSquarePlus
} from 'lucide-react';
import { getClub } from '@/data/directorySeed';
import { useAuth } from '@/lib/AuthContext';
import LearnFeedbackDialog from '@/components/member/LearnFeedbackDialog';
import { LEARN_RESOURCE_TYPES, resourceTypeLabel } from '@/lib/learnConfig';

function iconFor(type) {
  if (type === 'video') return PlayCircle;
  if (['document', 'policy', 'guide', 'coaching'].includes(type)) return FileText;
  return LinkIcon;
}

function youtubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    let id = '';
    if (host === 'youtu.be') id = parsed.pathname.split('/').filter(Boolean)[0] || '';
    if (host.endsWith('youtube.com')) {
      if (parsed.pathname === '/watch') id = parsed.searchParams.get('v') || '';
      else if (parsed.pathname.startsWith('/shorts/')) id = parsed.pathname.split('/')[2] || '';
      else if (parsed.pathname.startsWith('/embed/')) id = parsed.pathname.split('/')[2] || '';
    }
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
  } catch {
    return null;
  }
}

function isImageUrl(url) {
  return /\.(png|jpe?g|webp|gif)(?:[?#].*)?$/i.test(String(url || ''));
}

function whatsappHref(number, timezone) {
  let digits = String(number || '').trim().replace(/[^0-9+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0') && timezone === 'Europe/Dublin') digits = `353${digits.slice(1)}`;
  digits = digits.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

export default function MemberLearn({ previewData = null }) {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.active_club_role === 'club_admin';
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [openCategories, setOpenCategories] = useState(new Set());
  const [openResources, setOpenResources] = useState(new Set());

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
  const categories = useMemo(() => [...(learn?.categories || [])].sort((a,b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || String(a.name || '').localeCompare(String(b.name || ''))), [learn?.categories]);
  const categoryRank = useMemo(() => new Map(categories.map((row,index) => [row.name, index])), [categories]);

  const directoryClub = learn?.club?.slug ? getClub(learn.club.slug) : null;
  const builtInLinks = useMemo(() => {
    const links = [];
    if (directoryClub?.website) links.push({ id:'club-website', title:'Club website', description:'Official club website', category:'Club Information', resource_type:'link', url:directoryClub.website, sort_order:9000 });
    if (directoryClub?.shopUrl) links.push({ id:'club-shop', title:'Club shop', description:'Club gear, sizes, offers and ordering information', category:'Club Information', resource_type:'link', url:'/app/shop', sort_order:9010 });
    if (directoryClub?.slug) links.push({ id:'directory-profile', title:'Public club profile', description:'Venues, sessions and public club information on RallyHub', category:'Club Information', resource_type:'link', url:`/directory/${directoryClub.slug}`, sort_order:9020 });
    return links;
  }, [directoryClub]);

  const resources = useMemo(() => [...(learn?.resources || []), ...builtInLinks], [learn?.resources, builtInLinks]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources
      .filter(resource => categoryFilter === 'all' || resource.category === categoryFilter)
      .filter(resource => typeFilter === 'all' || resource.resource_type === typeFilter)
      .filter(resource => !q || `${resource.title || ''} ${resource.description || ''} ${resource.category || ''} ${resourceTypeLabel(resource.resource_type)}`.toLowerCase().includes(q))
      .sort((a, b) => (categoryRank.get(a.category) ?? 999) - (categoryRank.get(b.category) ?? 999) || String(a.category || '').localeCompare(String(b.category || '')) || Number(a.sort_order || 0) - Number(b.sort_order || 0) || String(a.title || '').localeCompare(String(b.title || '')));
  }, [resources, search, categoryFilter, typeFilter, categoryRank]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(resource => {
      const category = resource.category || 'Resources';
      if (!map.has(category)) map.set(category, []);
      map.get(category).push(resource);
    });
    return [...map.entries()].sort(([a],[b]) => (categoryRank.get(a) ?? 999) - (categoryRank.get(b) ?? 999) || a.localeCompare(b));
  }, [filtered, categoryRank]);

  const filtersActive = !!search.trim() || categoryFilter !== 'all' || typeFilter !== 'all';
  useEffect(() => {
    if (!grouped.length) return;
    if (filtersActive) setOpenCategories(new Set(grouped.map(([category]) => category)));
    else setOpenCategories(current => current.size ? current : new Set([grouped[0][0]]));
  }, [grouped, filtersActive]);

  const toggleCategory = (category) => setOpenCategories(current => {
    const next = new Set(current);
    if (next.has(category)) next.delete(category); else next.add(category);
    return next;
  });
  const toggleResource = (id) => setOpenResources(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const clearFilters = () => { setSearch(''); setCategoryFilter('all'); setTypeFilter('all'); };

  if (isLoading) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading resources…</div>;
  if (error) return <div className="glass rounded-xl p-6 text-sm text-destructive">{error.message || 'Could not load resources.'}</div>;

  const settings = learn?.settings || {};
  const whatsapp = whatsappHref(settings.whatsapp_number, learn?.club?.timezone);

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-20 sm:space-y-6 lg:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{learn?.club?.name || 'RallyHub'}</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Learn</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{settings.intro_text || 'Guides, coaching, rules, videos and useful club resources.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.feedback_enabled !== false && (previewData ? <Button variant="outline" disabled className="gap-2"><MessageSquarePlus className="h-4 w-4" />Suggest / feedback</Button> : <LearnFeedbackDialog club={learn?.club} />)}
          {canManage && !previewData && <Button variant="outline" asChild><Link to="/app/learn/manage"><Settings2 className="mr-2 h-4 w-4" />Manage Learn</Link></Button>}
        </div>
      </div>

      <GlassCard className="p-3 sm:p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search titles, topics, rules, DUPR, King of the Court…" className="bg-background pl-9" /></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger><div className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-muted-foreground" /><SelectValue placeholder="All sections" /></div></SelectTrigger><SelectContent><SelectItem value="all">All sections</SelectItem>{categories.map(category => <SelectItem key={category.id || category.name} value={category.name}>{category.name}</SelectItem>)}</SelectContent></Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger><SelectValue placeholder="All resource types" /></SelectTrigger><SelectContent>{LEARN_RESOURCE_TYPES.map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
          <Button variant="ghost" disabled={!filtersActive} onClick={clearFilters} className="justify-start sm:justify-center"><X className="mr-1 h-4 w-4" />Clear filters</Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'resource' : 'resources'} found</p>
      </GlassCard>

      {grouped.length === 0 && (
        <GlassCard className="py-12 text-center">
          <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">{filtersActive ? 'No matching resources' : 'No resources published yet'}</p>
          <p className="mt-1 text-xs text-muted-foreground">{filtersActive ? 'Try changing or clearing the search and filters.' : 'Club guides, coaching material, videos and rules will appear here.'}</p>
          {filtersActive && <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Clear filters</Button>}
        </GlassCard>
      )}

      <div className="space-y-3">
        {grouped.map(([category, rows]) => {
          const categoryOpen = openCategories.has(category);
          const categoryInfo = categories.find(item => item.name === category);
          return (
            <GlassCard key={category} className="overflow-hidden p-0">
              <button type="button" onClick={() => toggleCategory(category)} className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5" aria-expanded={categoryOpen}>
                <div className="min-w-0 flex-1"><h2 className="font-black">{category}</h2>{categoryInfo?.description ? <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{categoryInfo.description}</p> : <p className="mt-0.5 text-xs text-muted-foreground">{rows.length} {rows.length === 1 ? 'resource' : 'resources'}</p>}</div>
                <Badge variant="outline" className="text-[9px]">{rows.length}</Badge>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoryOpen && (
                <div className="border-t border-border/70">
                  {rows.map((resource, index) => {
                    const Icon = iconFor(resource.resource_type);
                    const external = resource.url && /^https?:\/\//i.test(resource.url);
                    const expanded = openResources.has(resource.id);
                    const youtube = resource.resource_type === 'video' ? youtubeEmbedUrl(resource.url) : null;
                    const previewImage = resource.image_url || (isImageUrl(resource.url) ? resource.url : null);
                    return (
                      <div key={resource.id} className={index ? 'border-t border-border/60' : ''}>
                        <button type="button" onClick={() => toggleResource(resource.id)} className="flex w-full items-start gap-3 px-4 py-3.5 text-left sm:px-5" aria-expanded={expanded}>
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
                          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{resource.title}</p><span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{resourceTypeLabel(resource.resource_type)}</span></div>{resource.description && <p className={`mt-1 text-xs text-muted-foreground ${expanded ? '' : 'line-clamp-1'}`}>{resource.description}</p>}</div>
                          <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                        {expanded && (
                          <div className="px-4 pb-4 sm:px-5 sm:pb-5"><div className="space-y-3 rounded-xl bg-secondary/25 p-3 sm:ml-12 sm:p-4">
                            {youtube && <div className="aspect-video overflow-hidden rounded-lg bg-black"><iframe src={youtube} title={resource.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>}
                            {!youtube && previewImage && <div className="overflow-hidden rounded-lg border border-border bg-background/80"><img src={previewImage} alt={resource.title} className="max-h-[520px] w-full object-contain" /></div>}
                            {resource.url && (external ? <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">Open resource <ExternalLink className="h-3.5 w-3.5" /></a> : <a href={resource.url} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">Open resource</a>)}
                          </div></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {settings.contact_enabled !== false && (settings.in_app_enabled || settings.contact_email || whatsapp) && (
        <GlassCard className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Need help?</p><h2 className="mt-1 text-lg font-black">Contact {settings.contact_name || learn?.club?.name || 'the club'}</h2>{settings.contact_title && <p className="text-xs text-muted-foreground">{settings.contact_title}</p>}<p className="mt-2 text-sm text-muted-foreground">Can’t find what you need, or want to ask something about a resource? Get in touch directly.</p></div>
            <div className="flex flex-wrap gap-2">
              {settings.in_app_enabled && <Button asChild><Link to="/app/messages"><MessageCircle className="mr-2 h-4 w-4" />Message in app</Link></Button>}
              {settings.contact_email && <Button variant="outline" asChild><a href={`mailto:${settings.contact_email}`}><Mail className="mr-2 h-4 w-4" />Email</a></Button>}
              {whatsapp && <Button variant="outline" asChild><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</a></Button>}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
