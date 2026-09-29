import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

export function normalizeKotcRole(user) {
  if (!user) return 'player';
  if (user.kotc_role) return user.kotc_role;
  if (user.role === 'admin') return 'super_admin';
  return 'player';
}

export default function useKotcRole() {
  const { user } = useAuth();
  const isOrdinaryUser = !!user?.id && user?.role !== 'admin';
  const { data: trialState = null } = useQuery({
    queryKey: ['my-rallyhub-trial-state', user?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('trialJourney', { action: 'my_state' });
      return res.data?.error ? null : (res.data || null);
    },
    enabled: isOrdinaryUser,
    staleTime: 15000,
  });

  return useMemo(() => {
    const storedRole = normalizeKotcRole(user);
    const directKotc = (trialState?.entitlements || []).some(entitlement =>
      entitlement.capability_key === 'tournament.king_of_the_court' &&
      ['active', 'grace'].includes(entitlement.status) &&
      (!entitlement.starts_at || Date.parse(entitlement.starts_at) <= Date.now()) &&
      (!entitlement.ends_at || Date.parse(entitlement.ends_at) >= Date.now())
    );
    const isActiveTrialHost = trialState?.hasTrial === true &&
      trialState?.journey?.status === 'active' &&
      !trialState?.journey?.expired &&
      directKotc;
    const role = isActiveTrialHost && storedRole === 'player' ? 'host' : storedRole;
    return {
      role,
      canManagePlayers: ['super_admin', 'admin', 'host'].includes(role),
      canRecordResults: ['super_admin', 'admin', 'host'].includes(role),
      canAccessAdmin: ['super_admin', 'admin'].includes(role),
      isTrialHost: isActiveTrialHost,
    };
  }, [user, trialState]);
}