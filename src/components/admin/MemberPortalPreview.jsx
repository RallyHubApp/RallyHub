import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Home, CalendarDays, MapPin, BookOpen, UserCircle, Smartphone, Monitor, Shield } from 'lucide-react';
import MemberDashboardView from '@/components/member/MemberDashboardView';
import MemberPlay from '@/pages/MemberPlay';
import MemberVenues from '@/pages/MemberVenues';
import MemberLearn from '@/pages/MemberLearn';
import GlassCard from '@/components/shared/GlassCard';
import { Badge } from '@/components/ui/badge';

const sections = [
  ['home', Home, 'Home'],
  ['play', CalendarDays, 'Play'],
  ['venues', MapPin, 'Venues'],
  ['learn', BookOpen, 'Learn'],
  ['me', UserCircle, 'Me'],
];

function MePreview({ snapshot }) {
  const person = snapshot?.person || {};
  const player = snapshot?.player || {};
  const member = snapshot?.member || {};
  const name = person.preferred_name || person.full_name || player.full_name || snapshot?.user?.full_name || 'Member';
  const photo = person.profile_photo_url || player.avatar_url || null;
  const initials = String(name).split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0,2).toUpperCase();
  const rows = [
    ['Membership', member.membership_status ? String(member.membership_status).replaceAll('_',' ') : 'Not linked'],
    ['Season', member.membership_season || '—'],
    ['Payment', member.payment_status ? String(member.payment_status).replaceAll('_',' ') : '—'],
    ['DUPR', player.dupr_rating != null ? Number(player.dupr_rating).toFixed(3) : player.dupr_id || '—'],
    ['Competitions', snapshot?.myCompetitions?.length || 0],
  ];
  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0 max-w-6xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{snapshot?.club?.name || 'RallyHub'}</p>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">Me</h1>
        <p className="text-sm text-muted-foreground mt-1">Your membership, playing profile and personal details.</p>
      </div>
      <GlassCard className="p-5">
        <div className="flex items-center gap-4">
          {photo ? <img src={photo} alt="" className="w-20 h-20 rounded-full object-cover border border-border" /> : <div className="w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-black">{initials}</div>}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black truncate">{name}</h2>
            <p className="text-sm text-muted-foreground truncate">{snapshot?.club?.name || 'Club member'}</p>
            {member.membership_status && <Badge className="mt-2 bg-primary/15 text-primary capitalize">{String(member.membership_status).replaceAll('_',' ')}</Badge>}
          </div>
        </div>
      </GlassCard>
      <div className="grid grid-cols-2 gap-3">
        {rows.map(([label,value]) => <GlassCard key={label} className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="font-black mt-1 capitalize">{value}</p></GlassCard>)}
      </div>
      <GlassCard>
        <h2 className="font-bold">Private member record</h2>
        <p className="text-xs text-muted-foreground mt-1">The live member can edit their permitted personal and playing details here. Super Admin preview remains read-only.</p>
      </GlassCard>
    </div>
  );
}

export default function MemberPortalPreview({ payload }) {
  const [section, setSection] = useState('home');
  const [device, setDevice] = useState('mobile');
  const snapshot = payload?.snapshot || null;
  const { data: performance = null, isLoading: performanceLoading } = useQuery({
    queryKey: ['member-preview-performance', snapshot?.player?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('performanceAnalytics', { action:'self', playerId:snapshot.player.id });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data || null;
    },
    enabled: !!snapshot?.player?.id,
    staleTime: 30_000,
  });

  const content = section === 'home'
    ? <MemberDashboardView snapshot={snapshot} play={payload?.play || null} performance={performance} performanceLoading={performanceLoading} preview />
    : section === 'play'
      ? <MemberPlay previewData={payload?.play || { items:[], club:snapshot?.club, spond:{ status:'not_configured', sessions:[] } }} />
      : section === 'venues'
        ? <MemberVenues />
        : section === 'learn'
          ? <MemberLearn previewData={payload?.learn || { resources:[], club:snapshot?.club }} />
          : <MePreview snapshot={snapshot} />;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-primary mt-0.5" />
          <div><p className="text-sm font-semibold">Read-only member preview</p><p className="text-xs text-muted-foreground">No impersonation, no session switching and no member data can be edited from this preview.</p></div>
        </div>
        <div className="inline-flex rounded-lg bg-secondary/70 p-1 self-start sm:self-auto">
          <button type="button" onClick={() => setDevice('mobile')} className={`h-9 px-3 rounded-md inline-flex items-center gap-1.5 text-xs font-semibold ${device === 'mobile' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}><Smartphone className="w-4 h-4" /> Mobile</button>
          <button type="button" onClick={() => setDevice('desktop')} className={`h-9 px-3 rounded-md inline-flex items-center gap-1.5 text-xs font-semibold ${device === 'desktop' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}><Monitor className="w-4 h-4" /> Desktop</button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-secondary/50 p-1">
        {sections.map(([key, Icon, label]) => (
          <button key={key} type="button" onClick={() => setSection(key)} className={`min-w-max flex-1 rounded-lg px-3 py-2 text-xs font-semibold inline-flex items-center justify-center gap-1.5 ${section === key ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}><Icon className="w-4 h-4" />{label}</button>
        ))}
      </div>

      <div className={device === 'mobile' ? 'mx-auto w-full max-w-[430px]' : 'w-full'}>
        <div className={device === 'mobile' ? 'rounded-[28px] border-[6px] border-foreground/10 bg-background shadow-xl overflow-hidden' : 'rounded-2xl border border-border bg-background overflow-hidden'}>
          <div className={device === 'mobile' ? 'max-h-[78vh] overflow-y-auto p-3 pt-4' : 'p-4 sm:p-6'}>
            {content}
          </div>
          {device === 'mobile' && (
            <div className="sticky bottom-0 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur px-1 py-1.5">
              {sections.map(([key, Icon, label]) => <button key={key} type="button" onClick={() => setSection(key)} className={`flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] ${section === key ? 'text-primary font-semibold' : 'text-muted-foreground'}`}><Icon className="w-4 h-4" />{label}</button>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
