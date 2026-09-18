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

  if (isLoading) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading your member dashboard…</div>;
  if (error) return <div className="glass rounded-xl p-6 text-sm text-destructive">{error.message || 'Could not load your member dashboard.'}</div>;
  return <MemberDashboardView snapshot={data} />;
}
