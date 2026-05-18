import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Calendar, Mail } from 'lucide-react';
import GlassCard from '@/components/shared/GlassCard';

export default function AccessCodeValidationTab() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users-access'],
    queryFn: () => base44.entities.User.list('-created_date', 500)
  });

  const validatedUsers = users.filter(u => u.access_code_validated === true);
  const nonValidatedUsers = users.filter(u => !u.access_code_validated);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-primary">{validatedUsers.length}</p>
          <p className="text-xs text-muted-foreground">Validated Access</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-yellow-400">{nonValidatedUsers.length}</p>
          <p className="text-xs text-muted-foreground">Not Validated</p>
        </GlassCard>
      </div>

      {/* Validated Users List */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          Validated Users ({validatedUsers.length})
        </h3>
        {validatedUsers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No users have validated access yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-auto">
            {validatedUsers.map((u, i) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {u.display_name || u.full_name || '(no name)'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {u.access_code_validated_date && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(u.access_code_validated_date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                  <Badge className="text-[10px] bg-primary/20 text-primary">Validated</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Non-Validated Users List */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-yellow-400" />
          Not Validated ({nonValidatedUsers.length})
        </h3>
        {nonValidatedUsers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">All users have validated access</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-auto">
            {nonValidatedUsers.map((u, i) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                <div className="flex items-center gap-3 min-w-0">
                  <XCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {u.display_name || u.full_name || '(no name)'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">Pending</Badge>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}