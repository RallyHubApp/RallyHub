import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function useMemberMessageUnread({enabled = true} = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['member-message-unread', user?.id, user?.active_tenant_id, user?.active_club_id],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke('memberMessaging', { action: 'unread_count' });
        if (res.data?.error) return 0;
        return Number(res.data?.count || 0);
      } catch {
        return 0;
      }
    },
    enabled: enabled && !!user?.id && !!user?.active_tenant_id && !!user?.active_club_id,
    staleTime: 2*60_000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
