import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Search, Users, Swords, Link2, Edit2, Shield, CheckCircle2, UserCheck, Unlink, Mail, UserPlus, ShieldCheck, ShieldOff, Pencil, KeyRound, Copy, RefreshCw, Send, Clock, XCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/shared/PageHeader';
import GlassCard from '@/components/shared/GlassCard';
import { useAuth } from '@/lib/AuthContext';

export default function AdminPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [playerSearch, setPlayerSearch] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [assignMatchOpen, setAssignMatchOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [updatingRole, setUpdatingRole] = useState(null);
  const [updatingApproval, setUpdatingApproval] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [savingUserName, setSavingUserName] = useState(false);
  const [tempPassPlayer, setTempPassPlayer] = useState(null);
  const [tempPassResult, setTempPassResult] = useState(null);
  const [generatingTemp, setGeneratingTemp] = useState(false);
  const [promotingPlayer, setPromotingPlayer] = useState(null);
  const [setPassUser, setSetPassUser] = useState(null);
  const [setPassPassword, setSetPassPassword] = useState('');
  const [settingPass, setSettingPass] = useState(false);
  const [resetEmailUser, setResetEmailUser] = useState(null);
  const [sendingReset, setSendingReset] = useState(false);

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('-created_date', 200)
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200)
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-created_date', 200)
  });

  // Guard: admin only
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <div className="space-y-3">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-foreground font-semibold">Admin Access Required</p>
          <p className="text-sm text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const filteredPlayers = players.filter(p => {
    if (!playerSearch) return true;
    const q = playerSearch.toLowerCase();
    return p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.dupr_id?.includes(q);
  });

  const openEdit = (player) => {
    setEditingPlayer(player);
    setEditForm({
      full_name: player.full_name || '',
      email: player.email || '',
      phone: player.phone || '',
      club: player.club || '',
      skill_rating: player.skill_rating || 3.0,
      dupr_id: player.dupr_id || '',
      dupr_rating: player.dupr_rating || '',
      status: player.status || 'Active',
      wins: player.wins || 0,
      losses: player.losses || 0,
      matches_played: player.matches_played || 0,
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    await base44.entities.Player.update(editingPlayer.id, {
      ...editForm,
      skill_rating: Number(editForm.skill_rating) || 3.0,
      dupr_rating: editForm.dupr_rating ? Number(editForm.dupr_rating) : undefined,
      wins: Number(editForm.wins) || 0,
      losses: Number(editForm.losses) || 0,
      matches_played: Number(editForm.matches_played) || 0,
    });
    queryClient.invalidateQueries({ queryKey: ['players'] });
    toast.success('Player updated!');
    setSaving(false);
    setEditingPlayer(null);
  };

  const unlinkPlayer = async (player) => {
    await base44.entities.Player.update(player.id, { user_id: null, linked_user_email: null });
    queryClient.invalidateQueries({ queryKey: ['players'] });
    toast.success('Player unlinked from account');
  };

  const assignMatchToPlayer = async (matchId, playerId, team) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    const update = {};
    if (team === 'team1') {
      update.team1_player_ids = [...(match.team1_player_ids || []), playerId].filter((v, i, a) => a.indexOf(v) === i);
    } else {
      update.team2_player_ids = [...(match.team2_player_ids || []), playerId].filter((v, i, a) => a.indexOf(v) === i);
    }
    await base44.entities.Match.update(matchId, update);
    queryClient.invalidateQueries({ queryKey: ['matches'] });
    toast.success('Player assigned to match!');
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) { toast.error('Enter an email'); return; }
    setInviting(true);
    await base44.users.inviteUser(inviteEmail.trim(), inviteRole, { full_name: inviteName.trim() || undefined });
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviteName('');
    setInviting(false);
  };

  const saveUserName = async () => {
    setSavingUserName(true);
    await base44.entities.User.update(editingUser.id, { display_name: editUserName.trim() });
    queryClient.invalidateQueries({ queryKey: ['all-users'] });
    toast.success('Name updated!');
    setSavingUserName(false);
    setEditingUser(null);
  };

  const setUserRole = async (userId, newRole) => {
    setUpdatingRole(userId);
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) { toast.error('User not found'); setUpdatingRole(null); return; }
    if (newRole === 'admin') {
      const res = await base44.functions.invoke('adminUserTools', { action: 'promote_to_admin', userEmail: targetUser.email });
      if (res.data?.error) { toast.error(res.data.error); setUpdatingRole(null); return; }
    } else {
      const res = await base44.functions.invoke('adminUserTools', { action: 'demote_to_user', userEmail: targetUser.email });
      if (res.data?.error) { toast.error(res.data.error); setUpdatingRole(null); return; }
    }
    queryClient.invalidateQueries({ queryKey: ['all-users'] });
    toast.success(`Role updated to ${newRole}`);
    setUpdatingRole(null);
  };

  const generateTempPassword = async (player) => {
    setGeneratingTemp(true);
    const res = await base44.functions.invoke('adminUserTools', { action: 'set_temp_password', playerId: player.id });
    setGeneratingTemp(false);
    if (res.data?.error) { toast.error(res.data.error); return; }
    setTempPassResult(res.data);
  };

  const promotePlayerToAdmin = async (player) => {
    setPromotingPlayer(player.id);
    const linkedEmail = player.linked_user_email || player.email;
    if (!linkedEmail) { toast.error('Player has no linked email'); setPromotingPlayer(null); return; }
    const res = await base44.functions.invoke('adminUserTools', { action: 'promote_to_admin', userEmail: linkedEmail });
    if (res.data?.error) { toast.error(res.data.error); setPromotingPlayer(null); return; }
    queryClient.invalidateQueries({ queryKey: ['all-users'] });
    toast.success(`${player.full_name} promoted to Admin`);
    setPromotingPlayer(null);
  };

  const handleSetPassword = async () => {
    if (!setPassUser || !setPassPassword.trim()) return;
    if (setPassPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSettingPass(true);
    try {
      const res = await base44.functions.invoke('adminUserTools', { action: 'set_password', userEmail: setPassUser.email, password: setPassPassword });
      if (res.data?.error) { 
        toast.error(res.data.error); 
        setSettingPass(false);
        return; 
      }
      toast.success(`Password set for ${setPassUser.full_name || setPassUser.email}`);
      setSetPassUser(null);
      setSetPassPassword('');
    } catch (error) {
      toast.error('Failed to set password. Please try again.');
      console.error('Error setting password:', error);
    } finally {
      setSettingPass(false);
    }
  };

  const sendPasswordReset = async (user) => {
    setSendingReset(true);
    try {
      await base44.auth.adminSendPasswordReset(user.email);
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
      console.error('Error sending reset:', error);
    } finally {
      setSendingReset(false);
    }
  };

  const setApprovalStatus = async (userId, status) => {
    setUpdatingApproval(userId);
    await base44.entities.User.update(userId, { approval_status: status });
    queryClient.invalidateQueries({ queryKey: ['all-users'] });
    toast.success(`User ${status}`);
    setUpdatingApproval(null);
  };

  const filteredUsers = allUsers.filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const linkedCount = players.filter(p => p.user_id).length;
  const unlinkedCount = players.length - linkedCount;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Panel" description="Site owner control panel">
        <Badge className="bg-destructive/20 text-destructive gap-1.5">
          <Shield className="w-3 h-3" /> Admin Only
        </Badge>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard delay={0} className="text-center">
          <p className="text-2xl font-bold text-foreground">{players.length}</p>
          <p className="text-xs text-muted-foreground">Total Players</p>
        </GlassCard>
        <GlassCard delay={0.05} className="text-center">
          <p className="text-2xl font-bold text-primary">{linkedCount}</p>
          <p className="text-xs text-muted-foreground">Linked to Accounts</p>
        </GlassCard>
        <GlassCard delay={0.1} className="text-center">
          <p className="text-2xl font-bold text-yellow-400">{unlinkedCount}</p>
          <p className="text-xs text-muted-foreground">Unlinked</p>
        </GlassCard>
      </div>

      <Tabs defaultValue="approvals">
        <TabsList className="bg-secondary flex-wrap h-auto gap-1">
          <TabsTrigger value="approvals" className="text-xs gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Approvals
            {allUsers.filter(u => !u.approval_status || u.approval_status === 'pending').length > 0 && (
              <span className="ml-1 bg-yellow-500 text-black text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {allUsers.filter(u => !u.approval_status || u.approval_status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs gap-1.5"><Shield className="w-3.5 h-3.5" /> Users & Roles</TabsTrigger>
          <TabsTrigger value="players" className="text-xs gap-1.5"><Users className="w-3.5 h-3.5" /> Players</TabsTrigger>
          <TabsTrigger value="matches" className="text-xs gap-1.5"><Swords className="w-3.5 h-3.5" /> Matches</TabsTrigger>
          <TabsTrigger value="linking" className="text-xs gap-1.5"><Link2 className="w-3.5 h-3.5" /> Account Links</TabsTrigger>
          <TabsTrigger value="invitations" className="text-xs gap-1.5"><Mail className="w-3.5 h-3.5" /> Invite Users</TabsTrigger>
        </TabsList>

        {/* ── APPROVALS TAB ── */}
        <TabsContent value="approvals" className="mt-4">
          <div className="space-y-3">
            <div className="glass rounded-lg p-3 flex items-start gap-2">
              <Clock className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Users who sign up must be approved before accessing the app. Approve or reject accounts below.
              </p>
            </div>
            {['pending', 'approved', 'rejected'].map(section => {
              const sectionUsers = allUsers.filter(u => {
                const s = u.approval_status || 'pending';
                return s === section && u.role !== 'admin';
              });
              if (sectionUsers.length === 0) return null;
              return (
                <div key={section} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    {section === 'pending' ? '⏳ Pending' : section === 'approved' ? '✅ Approved' : '❌ Rejected'}
                  </p>
                  {sectionUsers.map((u, i) => (
                    <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="glass rounded-lg p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {(u.full_name || u.email || 'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{u.full_name || '(no name)'}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {section !== 'approved' && (
                          <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                            disabled={updatingApproval === u.id}
                            onClick={() => setApprovalStatus(u.id, 'approved')}>
                            <CheckCircle className="w-3 h-3" />
                            {updatingApproval === u.id ? '…' : 'Approve'}
                          </Button>
                        )}
                        {section !== 'rejected' && u.id !== user?.id && (
                          <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
                            disabled={updatingApproval === u.id}
                            onClick={() => setApprovalStatus(u.id, 'rejected')}>
                            <XCircle className="w-3 h-3" />
                            {updatingApproval === u.id ? '…' : 'Reject'}
                          </Button>
                        )}
                        {section === 'approved' && u.id !== user?.id && (
                          <Button size="sm" variant="outline" className="h-7 text-xs text-muted-foreground gap-1"
                            disabled={updatingApproval === u.id}
                            onClick={() => setApprovalStatus(u.id, 'pending')}>
                            <Clock className="w-3 h-3" />
                            {updatingApproval === u.id ? '…' : 'Revoke'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })}
            {allUsers.filter(u => u.role !== 'admin').length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No users to review</p>
            )}
          </div>
        </TabsContent>

        {/* ── USERS & ROLES TAB ── */}
        <TabsContent value="users" className="mt-4">
          <div className="space-y-3">
            <div className="glass rounded-lg p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Manage roles for all registered users. Promote users to <strong className="text-foreground">Admin</strong> to give them full access to the admin panel and all management features.
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="pl-9 bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              {filteredUsers.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="glass rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {(u.full_name || u.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.display_name || u.full_name || '(no name)'}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-foreground shrink-0"
                      onClick={() => { setEditingUser(u); setEditUserName(u.display_name || u.full_name || ''); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Badge className={u.role === 'admin' ? 'bg-destructive/20 text-destructive text-[10px]' : 'bg-secondary text-muted-foreground text-[10px]'}>
                      {u.role === 'admin' ? <><ShieldCheck className="w-2.5 h-2.5 mr-0.5" />Admin</> : 'User'}
                    </Badge>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => { setSetPassUser(u); setSetPassPassword(''); }}>
                      <KeyRound className="w-3 h-3" /> Set Password
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => sendPasswordReset(u)}>
                      <Send className="w-3 h-3" /> {sendingReset && resetEmailUser?.email === u.email ? 'Sending…' : 'Reset Email'}
                    </Button>
                    {u.id !== user?.id && (
                      u.role === 'admin' ? (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                          disabled={updatingRole === u.id}
                          onClick={() => setUserRole(u.id, 'user')}>
                          <ShieldOff className="w-3 h-3 mr-1" />
                          {updatingRole === u.id ? '…' : 'Remove Admin'}
                        </Button>
                      ) : (
                        <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={updatingRole === u.id}
                          onClick={() => setUserRole(u.id, 'admin')}>
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {updatingRole === u.id ? '…' : 'Make Admin'}
                        </Button>
                      )
                    )}
                    {u.id === user?.id && <span className="text-[10px] text-muted-foreground">(you)</span>}
                  </div>
                </motion.div>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No users found</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── PLAYERS TAB ── */}
        <TabsContent value="players" className="mt-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or DUPR ID…"
                value={playerSearch}
                onChange={e => setPlayerSearch(e.target.value)}
                className="pl-9 bg-secondary border-border"
              />
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_4rem_5rem_auto] px-4 py-2.5 bg-secondary text-xs font-medium text-muted-foreground">
                <span>Player</span>
                <span>Email / Club</span>
                <span className="text-center">Rating</span>
                <span className="text-center">Account</span>
                <span />
              </div>
              {filteredPlayers.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-[1fr_1fr_4rem_5rem_auto] px-4 py-3 border-t border-border items-center hover:bg-secondary/50 transition-colors gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {(p.full_name || 'P')[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{p.full_name}</p>
                      {p.dupr_id && <p className="text-[10px] font-mono text-muted-foreground">DUPR: {p.dupr_id}</p>}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{p.email || '—'}</p>
                    {p.club && <p className="text-[10px] text-muted-foreground truncate">{p.club}</p>}
                  </div>
                  <p className="text-xs font-mono text-primary text-center">{(p.skill_rating || 3.0).toFixed(1)}</p>
                  <div className="text-center">
                    {p.user_id
                      ? <Badge className="text-[10px] bg-primary/20 text-primary"><UserCheck className="w-2.5 h-2.5 mr-0.5" />Linked</Badge>
                      : <Badge variant="outline" className="text-[10px] text-muted-foreground">Unlinked</Badge>
                    }
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Temp Password */}
                    {p.email && (
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-yellow-400" title="Generate temp password"
                        onClick={() => { setTempPassPlayer(p); setTempPassResult(null); }}>
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {/* Promote to Admin */}
                    {(p.user_id || p.linked_user_email) && (
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary" title="Promote to Admin"
                        disabled={promotingPlayer === p.id}
                        onClick={() => promotePlayerToAdmin(p)}>
                        {promotingPlayer === p.id
                          ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          : <ShieldCheck className="w-3.5 h-3.5" />}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(p)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── MATCHES TAB ── */}
        <TabsContent value="matches" className="mt-4">
          <div className="space-y-2">
            {matches.slice(0, 50).map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="glass rounded-lg p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {m.team1_names || 'TBD'} <span className="text-muted-foreground text-xs">vs</span> {m.team2_names || 'TBD'}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{m.status}</Badge>
                    {m.round && <Badge variant="outline" className="text-[10px]">R{m.round}</Badge>}
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {m.scores?.map(s => `${s.team1}-${s.team2}`).join(', ')}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">T1 IDs: {m.team1_player_ids?.length || 0}</span>
                    <span className="text-[10px] text-muted-foreground">T2 IDs: {m.team2_player_ids?.length || 0}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => { setSelectedMatch(m); setAssignMatchOpen(true); }}>
                  <Link2 className="w-3 h-3 mr-1" /> Assign
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ── ACCOUNT LINKS TAB ── */}
        <TabsContent value="linking" className="mt-4">
          <div className="space-y-3">
            <div className="glass rounded-lg p-3 flex items-start gap-2">
              <Link2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Here you can view all account links and manually unlink player records from user accounts.
                Players can link themselves from their own "My Profile" page.
              </p>
            </div>
            {players.filter(p => p.user_id).map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="glass rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">Linked to: {p.linked_user_email || p.user_id}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive shrink-0"
                  onClick={() => unlinkPlayer(p)}
                >
                  <Unlink className="w-3 h-3 mr-1" /> Unlink
                </Button>
              </motion.div>
            ))}
            {players.filter(p => p.user_id).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No linked accounts yet</p>
            )}
          </div>
        </TabsContent>

        {/* ── INVITATIONS TAB ── */}
        <TabsContent value="invitations" className="mt-4">
          <div className="space-y-4">
            <GlassCard>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> Invite a User
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Full Name</label>
                  <Input
                    type="text"
                    placeholder="John Smith"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="user@email.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="bg-secondary border-border"
                    onKeyDown={e => e.key === 'Enter' && sendInvite()}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Role</label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Player (user)</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={sendInvite} disabled={inviting || !inviteEmail.trim()} className="w-full bg-primary text-primary-foreground">
                  {inviting ? 'Sending…' : <><Mail className="w-3.5 h-3.5 mr-1" /> Send Invitation</>}
                </Button>
              </div>
            </GlassCard>

            {/* Quick-invite known admins */}
            <GlassCard>
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Invite Admins</h3>
              <div className="space-y-2">
                {['Conall.moore@icloud.com', 'Brian.moore007@gmail.com'].map(email => (
                  <div key={email} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                    <div>
                      <p className="text-xs font-medium text-foreground">{email}</p>
                      <p className="text-[10px] text-primary">Admin</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={async () => {
                        await base44.users.inviteUser(email, 'admin');
                        toast.success(`Admin invitation sent to ${email}`);
                      }}
                    >
                      <Mail className="w-3 h-3 mr-1" /> Invite
                    </Button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </TabsContent>

      </Tabs>

      {/* Edit Player Dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Player: {editingPlayer?.full_name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Update player details</DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Full Name', field: 'full_name' },
              { label: 'Email', field: 'email' },
              { label: 'Phone', field: 'phone' },
              { label: 'Club', field: 'club' },
              { label: 'Skill Rating', field: 'skill_rating', type: 'number' },
              { label: 'DUPR ID', field: 'dupr_id' },
              { label: 'DUPR Rating', field: 'dupr_rating', type: 'number' },
              { label: 'Wins', field: 'wins', type: 'number' },
              { label: 'Losses', field: 'losses', type: 'number' },
              { label: 'Matches Played', field: 'matches_played', type: 'number' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  type={type || 'text'}
                  value={editForm[field] || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                  className="mt-1 bg-secondary border-border text-sm"
                />
              </div>
            ))}
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(editingPlayer?.user_id || editingPlayer?.linked_user_email) && (
            <div className="mt-2 p-3 rounded-lg bg-secondary flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">Admin Access</p>
                  <p className="text-[10px] text-muted-foreground">Grant this player full admin access</p>
                </div>
              </div>
              <Button
                size="sm"
                className="shrink-0 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={promotingPlayer === editingPlayer?.id}
                onClick={async () => {
                  await promotePlayerToAdmin(editingPlayer);
                  setEditingPlayer(null);
                }}
              >
                {promotingPlayer === editingPlayer?.id
                  ? <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  : <><ShieldCheck className="w-3 h-3 mr-1" /> Grant Admin</>}
              </Button>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setEditingPlayer(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Name Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Display Name</DialogTitle>
            <DialogDescription className="text-muted-foreground">{editingUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Display Name</Label>
              <Input
                value={editUserName}
                onChange={e => setEditUserName(e.target.value)}
                placeholder="Enter a display name…"
                className="mt-1 bg-secondary border-border"
                onKeyDown={e => e.key === 'Enter' && saveUserName()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={saveUserName} disabled={savingUserName || !editUserName.trim()} className="bg-primary text-primary-foreground">
                {savingUserName ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Password Dialog */}
      <Dialog open={!!setPassUser} onOpenChange={(open) => { if (!open) { setSetPassUser(null); setSetPassPassword(''); } }}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" /> Set Password
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Set a permanent password for <strong>{setPassUser?.full_name || setPassUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Password</Label>
              <Input
                type="password"
                value={setPassPassword}
                onChange={e => setSetPassPassword(e.target.value)}
                placeholder="Enter password…"
                className="mt-1 bg-secondary border-border"
                onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Minimum 6 characters</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setSetPassUser(null); setSetPassPassword(''); }}>Cancel</Button>
              <Button onClick={handleSetPassword} disabled={settingPass || !setPassPassword.trim()} className="bg-primary text-primary-foreground">
                {settingPass ? 'Setting…' : 'Set Password'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Temp Password Dialog */}
      <Dialog open={!!tempPassPlayer} onOpenChange={(open) => { if (!open) { setTempPassPlayer(null); setTempPassResult(null); } }}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-yellow-400" /> Temp Password
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Generate a one-time temp password for <strong>{tempPassPlayer?.full_name}</strong>. Share it with them to use at <strong>/first-login</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!tempPassResult ? (
              <div className="space-y-3">
                <div className="glass rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                  <p>1. Generate a temp password below</p>
                  <p>2. Share it + the player's email with them</p>
                  <p>3. They visit <span className="font-mono text-primary">/first-login</span> to set their real password</p>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-foreground truncate">{tempPassPlayer?.email}</span>
                </div>
                <Button onClick={() => generateTempPassword(tempPassPlayer)} disabled={generatingTemp}
                  className="w-full bg-primary text-primary-foreground">
                  {generatingTemp
                    ? <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Generating…</>
                    : <><KeyRound className="w-4 h-4" /> Generate Temp Password</>}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Temp password for <strong className="text-foreground">{tempPassResult.playerName}</strong>:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-lg font-mono font-bold text-primary tracking-widest">{tempPassResult.tempPassword}</code>
                    <Button size="icon" variant="ghost" className="w-8 h-8 shrink-0"
                      onClick={() => { navigator.clipboard.writeText(tempPassResult.tempPassword); toast.success('Copied!'); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Share with player:</p>
                  <p>• Email: <span className="text-foreground font-mono">{tempPassResult.playerEmail}</span></p>
                  <p>• Temp password: <span className="text-foreground font-mono">{tempPassResult.tempPassword}</span></p>
                  <p>• URL: <span className="text-primary font-mono">{window.location.origin}/first-login</span></p>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs gap-1"
                  onClick={() => { setTempPassResult(null); }}>
                  <RefreshCw className="w-3 h-3" /> Generate Another
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Match Dialog */}
      <Dialog open={assignMatchOpen} onOpenChange={setAssignMatchOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Assign Player to Match</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedMatch?.team1_names} vs {selectedMatch?.team2_names}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-52 overflow-auto">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                <span className="text-sm text-foreground">{p.full_name}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-xs"
                    onClick={() => { assignMatchToPlayer(selectedMatch.id, p.id, 'team1'); setAssignMatchOpen(false); }}>
                    Team 1
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-xs"
                    onClick={() => { assignMatchToPlayer(selectedMatch.id, p.id, 'team2'); setAssignMatchOpen(false); }}>
                    Team 2
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}