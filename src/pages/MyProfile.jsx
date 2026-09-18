import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { User, Calendar, Trophy, RefreshCw, Link2, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import GlassCard from '@/components/shared/GlassCard';
import ProfileAvatarUpload from '@/components/profile/ProfileAvatarUpload';
import LinkPlayerModal from '@/components/profile/LinkPlayerModal';

export default function MyProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  // Find the player record linked to the current user
  const { data: linkedPlayer, isLoading: loadingPlayer } = useQuery({
    queryKey: ['my-player', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const byUserId = await base44.entities.Player.filter({ user_id: user.id });
      if (byUserId.length > 0) return byUserId[0];
      const byEmail = await base44.entities.Player.filter({ linked_user_email: user.email });
      if (byEmail.length > 0) return byEmail[0];
      return null;
    },
    enabled: !!user
  });

  const { data: memberSnapshot } = useQuery({
    queryKey: ['member-profile-self', user?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('memberPortal', { action: 'self' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.snapshot || null;
    },
    enabled: !!user
  });

  const { data: allMatches = [] } = useQuery({
    queryKey: ['all-matches'],
    queryFn: () => base44.entities.Match.list('-created_date', 200)
  });

  const [form, setForm] = useState(/** @type {any} */ ({}));

  useEffect(() => {
    const person = memberSnapshot?.person;
    const player = memberSnapshot?.player || linkedPlayer;
    if (person || player || user) {
      setForm({
        full_name: person?.full_name || player?.full_name || user?.full_name || '',
        preferred_name: person?.preferred_name || '',
        primary_email: person?.primary_email || player?.email || user?.email || '',
        mobile: person?.mobile || player?.phone || '',
        date_of_birth: person?.date_of_birth || '',
        gender: person?.gender || player?.gender || '',
        address_line1: person?.address_line1 || person?.full_postal_address || '',
        address_line2: person?.address_line2 || '',
        town_city: person?.town_city || '',
        county_region: person?.county_region || '',
        postal_code: person?.postal_code || '',
        country: person?.country || '',
        preferred_language: person?.preferred_language || '',
        communication_preference: person?.communication_preference || '',
        emergency_contact_name: person?.emergency_contact_name || memberSnapshot?.member?.emergency_contact || '',
        emergency_contact_relationship: person?.emergency_contact_relationship || '',
        emergency_mobile: person?.emergency_mobile || memberSnapshot?.member?.emergency_mobile || '',
        secondary_emergency_contact_name: person?.secondary_emergency_contact_name || '',
        secondary_emergency_contact_mobile: person?.secondary_emergency_contact_mobile || '',
        profile_visibility: person?.profile_visibility || 'club',
        photo_visibility: person?.photo_visibility || 'club',
        age_group: player?.age_group || '',
        preferred_position: player?.preferred_position || '',
        dupr_id: player?.dupr_id || ''
      });
    }
  }, [memberSnapshot, linkedPlayer, user]);

  const activePlayer = memberSnapshot?.player || linkedPlayer;
  const playerId = activePlayer?.id;

  // My matches — where this player appears as a participant
  const myMatches = allMatches.filter(m => {
    if (!playerId && !user) return false;
    const pid = playerId;
    return (
      m.team1_player_ids?.includes(pid) ||
      m.team2_player_ids?.includes(pid)
    );
  });

  const upcoming = myMatches.filter(m => m.status === 'Scheduled' || m.status === 'In Progress');
  const completed = myMatches.filter(m => m.status === 'Completed');

  const wins = completed.filter(m => {
    const isTeam1 = m.team1_player_ids?.includes(playerId);
    return (isTeam1 && m.winner_team === 'team1') || (!isTeam1 && m.winner_team === 'team2');
  }).length;

  const saveProfile = async () => {
    setSaving(true);
    try {
      if (linkedPlayer || memberSnapshot?.player || memberSnapshot?.person) {
        const res = await base44.functions.invoke('memberPortal', { action: 'self_update', profile: form });
        if (res.data?.error) throw new Error(res.data.error);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['my-player'] }),
          queryClient.invalidateQueries({ queryKey: ['member-profile-self'] }),
          queryClient.invalidateQueries({ queryKey: ['member-portal-self'] }),
        ]);
        toast.success('Member profile updated');
      } else {
        await base44.entities.Player.create({
          full_name: form.full_name || user?.full_name || 'Member',
          email: form.primary_email || user?.email || '',
          phone: form.mobile || '',
          gender: form.gender || undefined,
          dupr_id: form.dupr_id || undefined,
          age_group: form.age_group || undefined,
          preferred_position: form.preferred_position || undefined,
          user_id: user.id,
          linked_user_email: user.email,
          wins: 0, losses: 0, matches_played: 0, status: 'Active',
          rating_history: []
        });
        await base44.auth.updateMe({ full_name: form.full_name || user?.full_name });
        await queryClient.invalidateQueries({ queryKey: ['my-player'] });
        await queryClient.invalidateQueries({ queryKey: ['member-profile-self'] });
        toast.success('Player profile created');
      }
      setEditing(false);
    } catch (e) {
      toast.error(e?.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  const syncDupr = () => {
    if (!form.dupr_id) { toast.error('Enter your DUPR ID first'); return; }
    if (!activePlayer) { toast.error('Save your profile first'); return; }
    toast.info('Live DUPR rating sync is not connected yet. Your DUPR ID can be saved in RallyHub, but ratings will not update automatically until the official DUPR API integration is enabled.');
  };

  const handleLinked = () => {
    queryClient.invalidateQueries({ queryKey: ['my-player'] });
    setLinkOpen(false);
  };

  const initials = (user?.full_name || user?.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const winRate = completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Review and update the personal and playing information RallyHub holds for you" />

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 glow-green">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <ProfileAvatarUpload
            currentUrl={activePlayer?.avatar_url}
            initials={initials}
            onUploaded={async (url) => {
              if (linkedPlayer) {
                await base44.entities.Player.update(linkedPlayer.id, { avatar_url: url });
                queryClient.invalidateQueries({ queryKey: ['my-player'] });
                toast.success('Avatar updated!');
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground">{user?.full_name || user?.email}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {(memberSnapshot?.club?.name || activePlayer?.club) && <Badge className="bg-secondary text-secondary-foreground text-xs">{memberSnapshot?.club?.name || activePlayer?.club}</Badge>}
              {activePlayer ? (
                <Badge className="bg-primary/20 text-primary text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Player linked</Badge>
              ) : (
                <Button variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={() => setLinkOpen(true)}>
                  <Link2 className="w-3 h-3" /> Link existing record
                </Button>
              )}
            </div>
          </div>
          <div className="text-center shrink-0">
            <p className="text-3xl font-black font-mono text-primary">
              {activePlayer?.dupr_rating != null ? Number(activePlayer.dupr_rating).toFixed(3) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">DUPR Rating</p>
            {activePlayer?.dupr_last_synced && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Synced {activePlayer.dupr_last_synced}</p>
            )}
            {activePlayer?.skill_rating != null && (
              <p className="text-[10px] text-muted-foreground mt-1">Club rating {Number(activePlayer.skill_rating).toFixed(1)}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard delay={0.1} className="text-center py-3">
          <p className="text-xl font-bold text-primary">{wins}</p>
          <p className="text-xs text-muted-foreground">Wins</p>
        </GlassCard>
        <GlassCard delay={0.15} className="text-center py-3">
          <p className="text-xl font-bold text-destructive">{completed.length - wins}</p>
          <p className="text-xs text-muted-foreground">Losses</p>
        </GlassCard>
        <GlassCard delay={0.2} className="text-center py-3">
          <p className="text-xl font-bold text-foreground">{winRate}%</p>
          <p className="text-xs text-muted-foreground">Win Rate</p>
        </GlassCard>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="bg-secondary">
          <TabsTrigger value="profile" className="text-xs gap-1.5"><User className="w-3.5 h-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="fixtures" className="text-xs gap-1.5"><Calendar className="w-3.5 h-3.5" /> Fixtures ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="results" className="text-xs gap-1.5"><Trophy className="w-3.5 h-3.5" /> Results ({completed.length})</TabsTrigger>
        </TabsList>

        {/* ── PROFILE TAB ── */}
        <TabsContent value="profile" className="mt-4">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Player Details</h3>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button size="sm" className="bg-primary text-primary-foreground" onClick={saveProfile} disabled={saving}>
                    {saving ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Saving…</> : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', field: 'full_name', type: 'text' },
                { label: 'Email', field: 'email', type: 'email' },
                { label: 'Phone', field: 'phone', type: 'tel' },
                { label: 'Club', field: 'club', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  {editing ? (
                    <Input
                      type={type}
                      value={form[field] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                      className="mt-1 bg-secondary border-border text-sm"
                    />
                  ) : (
                    <p className="text-sm text-foreground mt-1">{form[field] || '—'}</p>
                  )}
                </div>
              ))}
            </div>

            {/* DUPR section */}
            <div className="mt-5 pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">DUPR Integration</h4>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">DUPR ID</Label>
                  {editing ? (
                    <Input
                      value={form.dupr_id || ''}
                      onChange={e => setForm(prev => ({ ...prev, dupr_id: e.target.value }))}
                      placeholder="e.g. 12345678"
                      className="mt-1 bg-secondary border-border text-sm font-mono"
                    />
                  ) : (
                    <p className="text-sm font-mono text-foreground mt-1">{form.dupr_id || '—'}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncDupr}
                  disabled={!linkedPlayer}
                  className="shrink-0 gap-1.5"
                  title="Live DUPR rating sync will be enabled when the official DUPR API integration is available."
                >
                  <RefreshCw className="w-3 h-3" />
                  Sync DUPR
                </Button>
              </div>
              {!linkedPlayer ? (
                <p className="text-xs text-muted-foreground mt-2">Save your profile first to store your DUPR ID.</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">Live DUPR rating sync is not connected yet. Your DUPR ID can still be saved in RallyHub.</p>
              )}
            </div>
          </GlassCard>
        </TabsContent>

        {/* ── FIXTURES TAB ── */}
        <TabsContent value="fixtures" className="mt-4">
          <GlassCard>
            <h3 className="text-sm font-semibold text-foreground mb-4">Upcoming Fixtures</h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No upcoming matches scheduled</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((m, i) => {
                  const isTeam1 = m.team1_player_ids?.includes(playerId);
                  const opponent = isTeam1 ? m.team2_names : m.team1_names;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">vs {opponent || 'TBD'}</p>
                        {m.scheduled_time && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(m.scheduled_time).toLocaleDateString()} {new Date(m.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {m.court && <p className="text-xs text-muted-foreground">Court {m.court}</p>}
                      </div>
                      <Badge className={m.status === 'In Progress' ? 'bg-primary/20 text-primary animate-pulse' : 'bg-secondary text-secondary-foreground'}>
                        {m.status}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* ── RESULTS TAB ── */}
        <TabsContent value="results" className="mt-4">
          <GlassCard>
            <h3 className="text-sm font-semibold text-foreground mb-4">Match Results</h3>
            {completed.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No completed matches yet</p>
            ) : (
              <div className="space-y-2">
                {completed.map((m, i) => {
                  const isTeam1 = m.team1_player_ids?.includes(playerId);
                  const won = (isTeam1 && m.winner_team === 'team1') || (!isTeam1 && m.winner_team === 'team2');
                  const opponent = isTeam1 ? m.team2_names : m.team1_names;
                  const myScore = isTeam1 ? m.scores?.map(s => s.team1) : m.scores?.map(s => s.team2);
                  const theirScore = isTeam1 ? m.scores?.map(s => s.team2) : m.scores?.map(s => s.team1);
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                          won ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive')}>
                          {won ? 'W' : 'L'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">vs {opponent || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {m.scores?.map((s, j) => `${myScore?.[j]}-${theirScore?.[j]}`).join(', ')}
                          </p>
                        </div>
                      </div>
                      {m.created_date && (
                        <p className="text-xs text-muted-foreground shrink-0">
                          {new Date(m.created_date).toLocaleDateString()}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>

      <LinkPlayerModal
        open={linkOpen}
        onOpenChange={setLinkOpen}
        user={user}
        onLinked={handleLinked}
      />
    </div>
  );
}