import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MemberDashboardView from '@/components/member/MemberDashboardView';

export default function MemberPortalDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['member-portal-self'],
    queryFn: async () => {
      const res = await base44.functions.invoke('memberPortal', { action: 'self' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.snapshot || null;
    }
  });

  const { data: play = null, isLoading: isLoadingPlay } = useQuery({
    queryKey: ['member-portal-play'],
    queryFn: async () => {
      const res = await base44.functions.invoke('memberPortal', { action: 'play' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.play || null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const { data: performance = null, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['performance-analytics-self'],
    queryFn: async () => {
      const res = await base44.functions.invoke('performanceAnalytics', { action: 'self' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data || null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['member-announcements'],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke('memberPortal', { action: 'announcements' });
        return res.data?.announcements || [];
      } catch {
        return [];
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (isLoading) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading your RallyHub home…</div>;
  if (error) return <div className="glass rounded-xl p-6 text-sm text-destructive">{error.message || 'Could not load your RallyHub home.'}</div>;
  return <MemberDashboardView snapshot={data} play={play} playLoading={isLoadingPlay} performance={performance} performanceLoading={isLoadingPerformance} announcements={announcements} />;
}
