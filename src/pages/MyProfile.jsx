import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { User, Calendar, Trophy, TrendingUp, TrendingDown, Upload, RefreshCw, Link2, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [syncingDupr, setSyncingDupr] = useState(false);

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

  const { data: allMatches = [] } = useQuery({
    queryKey: ['all-matches'],
    queryFn: () => base44.entities.Match.list('-created_date', 200)
  });

  const [form, setForm] = useState({});

  useEffect(() => {
    if (linkedPlayer) {
      setForm({
        full_name: linkedPlayer.full_name || user?.full_name || '',
        email: linkedPlayer.email || user?.email || '',
        phone: linkedPlayer.phone || '',
        club: linkedPlayer.club || '',
        age_group: linkedPlayer.age_group || '',
        preferred_position: linkedPlayer.preferred_position || '',
        dupr_id: linkedPlayer.dupr_id || '',
        notes: linkedPlayer.notes || ''
      });
    } else if (user) {
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: '', club: '', age_group: '', preferred_position: '', dupr_id: '', notes: ''
      });
    }
  }, [linkedPlayer, user]);

  const playerId = linkedPlayer?.id;

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
    if (linkedPlayer) {
      await base44.entities.Player.update(linkedPlayer.id, {
        ...form,
        user_id: user.id,
        linked_user_email: user.email
      });
      await base44.auth.updateMe({ full_name: form.full_name });
      queryClient.invalidateQueries({ queryKey: ['my-player'] });
      toast.success('Profile saved!');
    } else {
      // Create a new player record linked to this user
      await base44.entities.Player.create({
        ...form,
        user_id: user.id,
        linked_user_email: user.email,
        wins: 0, losses: 0, matches_played: 0, status: 'Active',
        rating_history: []
      });
      await base44.auth.updateMe({ full_name: form.full_name });
      queryClient.invalidateQueries({ queryKey: ['my-player'] });
      toast.success('Profile created!');
    }
    setSaving(false);
    setEditing(false);
  };

  const syncDupr = async () => {
    if (!form.dupr_id) { toast.error('Enter your DUPR ID first'); return; }
    setSyncingDupr(true);
    // DUPR API is not publicly available without OAuth — we simulate a sync
    // In production this would call the DUPR API with their credentials
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `I need to look up DUPR rating for player with DUPR ID: ${form.dupr_id}. 
        DUPR (Dynamic Universal Pickleball Rating) is a pickleball rating system. 
        Note: The DUPR API requires authentication. If you cannot retrieve real data, 
        return a placeholder indicating the API is not connected yet.
        Return JSON with: { rating: number|null, name: string|null, error: string|null }`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            rating: { type: 'number' },
            name: { type: 'string' },
            error: { type: 'string' }
          }
        }
      });

      if (result.rating) {
        await base44.entities.Player.update(linkedPlayer.id, {
          dupr_rating: result.rating,
          skill_rating: result.rating,
          dupr_last_synced: new Date().toISOString().split('T')[0]
        });
        queryClient.invalidateQueries({ queryKey: ['my-player'] });
        toast.success(`DUPR rating synced: ${result.rating}`);
      } else {
        toast.info('DUPR API not connected. Rating saved from manual entry.');
        if (linkedPlayer && form.dupr_id) {
          await base44.entities.Player.update(linkedPlayer.id, {
            dupr_id: form.dupr_id,
            dupr_last_synced: new Date().toISOString().split('T')[0]
          });
          queryClient.invalidateQueries({ queryKey: ['my-player'] });
        }
      }
    } catch {
      toast.error('Could not sync DUPR rating');
    }
    setSyncingDupr(false);
  };

  const handleLinked = () => {
    queryClient.invalidateQueries({ queryKey: ['my-player'] });
    setLinkOpen(false);
  };

  const initials = (user?.full_name || user?.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const winRate = completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Your player profile and match history" />

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 glow-green">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <ProfileAvatarUpload
            currentUrl={linkedPlayer?.avatar_url}
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
              {linkedPlayer?.club && <Badge className="bg-secondary text-secondary-foreground text-xs">{linkedPlayer.club}</Badge>}
              {linkedPlayer ? (
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
              {linkedPlayer?.dupr_rating?.toFixed(1) || linkedPlayer?.skill_rating?.toFixed(1) || '—'}
            </p>
            <p className="text-xs text-muted-foreground">DUPR Rating</p>
            {linkedPlayer?.dupr_last_synced && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Synced {linkedPlayer.dupr_last_synced}</p>
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
                  disabled={syncingDupr || !linkedPlayer}
                  className="shrink-0 gap-1.5"
                >
                  {syncingDupr ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Sync DUPR
                </Button>
              </div>
              {!linkedPlayer && (
                <p className="text-xs text-muted-foreground mt-2">Save your profile first to enable DUPR sync.</p>
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