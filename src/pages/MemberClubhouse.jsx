import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlassCard from '@/components/shared/GlassCard';
import { Bell, ChevronRight, CircleUserRound, ExternalLink, Mail, MessageCircle, Pin, Search, Users } from 'lucide-react';
import { getClub } from '@/data/directorySeed';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MemberClubhouse({ previewData = null }) {
  const [search, setSearch] = useState('');
  const { data: fetchedClubhouse = null, isLoading, error } = useQuery({
    queryKey: ['member-portal-clubhouse'],
    queryFn: async () => {
      const res = await base44.functions.invoke('memberPortal', { action: 'clubhouse' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.clubhouse || null;
    },
    staleTime: 30_000,
    enabled: !previewData,
  });
  const clubhouse = previewData || fetchedClubhouse;

  const directoryClub = clubhouse?.club?.slug ? getClub(clubhouse.club.slug) : null;
  const players = clubhouse?.playerDirectory || [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (q ? players.filter(player => String(player.full_name || '').toLowerCase().includes(q)) : players).slice(0, 40);
  }, [players, search]);

  if (isLoading) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading Clubhouse…</div>;
  if (error) return <div className="glass rounded-xl p-6 text-sm text-destructive">{error.message || 'Could not load Clubhouse.'}</div>;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0 max-w-6xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{clubhouse?.club?.name || 'RallyHub'}</p>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">Clubhouse</h1>
        <p className="text-sm text-muted-foreground mt-1">Official updates, club conversation and people.</p>
      </div>

      <section className="grid sm:grid-cols-2 gap-3">
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold">Message the club</h2>
              <p className="text-xs text-muted-foreground mt-1">A clear route to the club while RallyHub direct messaging is being phased in.</p>
              {directoryClub?.contact?.email ? (
                <a href={`mailto:${directoryClub.contact.email}`} className="inline-flex mt-3"><Button size="sm" className="gap-1.5"><Mail className="w-3.5 h-3.5" /> Email club</Button></a>
              ) : <p className="text-xs text-muted-foreground mt-3">No public club contact is configured.</p>}
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Bell className="w-5 h-5 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold">Official updates</h2>
              <p className="text-xs text-muted-foreground mt-1">Posts can carry notices, posters, links, polls and event information without getting lost in chat.</p>
              <p className="text-xs text-primary font-semibold mt-3">{clubhouse?.posts?.length || 0} published update{clubhouse?.posts?.length === 1 ? '' : 's'}</p>
            </div>
          </div>
        </GlassCard>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <div><h2 className="text-sm font-bold">Official updates</h2><p className="text-xs text-muted-foreground mt-0.5">Important club information stays separate from general discussion.</p></div>
        </div>
        <div className="space-y-3">
          {(clubhouse?.posts || []).length === 0 && (
            <GlassCard className="text-center py-10">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="font-semibold">No club posts yet</p>
              <p className="text-xs text-muted-foreground mt-1">The bulletin system is ready for published club updates.</p>
            </GlassCard>
          )}
          {(clubhouse?.posts || []).map(post => (
            <GlassCard key={post.id} className="p-0 overflow-hidden">
              {post.image_url && <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" />}
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.is_pinned && <Badge className="text-[9px] bg-primary/15 text-primary"><Pin className="w-3 h-3 mr-1" />Pinned</Badge>}
                      <Badge variant="outline" className="text-[9px] capitalize">{String(post.post_type || 'post').replaceAll('_', ' ')}</Badge>
                    </div>
                    <h3 className="font-bold mt-2">{post.title}</h3>
                    {post.published_at && <p className="text-[11px] text-muted-foreground mt-1">{formatDate(post.published_at)}</p>}
                  </div>
                </div>
                {post.body && <p className="text-sm text-muted-foreground whitespace-pre-line mt-3">{post.body}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {post.link_url && <a href={post.link_url} target="_blank" rel="noreferrer"><Button variant="outline" size="sm" className="gap-1.5">Open link <ExternalLink className="w-3.5 h-3.5" /></Button></a>}
                  {post.comments_enabled && <span className="text-xs text-muted-foreground">Comments are enabled for this post</span>}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
          <div><h2 className="text-sm font-bold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Club people</h2><p className="text-xs text-muted-foreground mt-1">Only club-visible player information is shown here.</p></div>
          <div className="relative sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a member" className="pl-9 bg-secondary" /></div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map(player => (
            <div key={player.id} className="glass rounded-xl p-3 flex items-center gap-3">
              {player.avatar_url ? <img src={player.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border border-border" /> : <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center"><CircleUserRound className="w-5 h-5 text-primary" /></div>}
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{player.full_name}</p><p className="text-xs text-muted-foreground">Club member</p></div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
