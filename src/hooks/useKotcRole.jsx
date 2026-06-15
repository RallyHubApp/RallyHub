import { useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';

export function normalizeKotcRole(user) {
  if (!user) return 'player';
  if (user.kotc_role) return user.kotc_role;
  if (user.role === 'admin') return 'super_admin';
  return 'player';
}

export default function useKotcRole() {
  const { user } = useAuth();

  return useMemo(() => {
    const role = normalizeKotcRole(user);
    return {
      role,
      canManagePlayers: ['super_admin', 'admin', 'host'].includes(role),
      canRecordResults: ['super_admin', 'admin', 'host'].includes(role),
      canAccessAdmin: ['super_admin', 'admin'].includes(role),
    };
  }, [user]);
}