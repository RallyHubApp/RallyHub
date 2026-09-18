import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Search, Users, Swords, Link2, Edit2, Shield, CheckCircle2, UserCheck, Unlink, Mail, UserPlus, ShieldCheck, ShieldOff, Pencil, Send, Clock, XCircle, CheckCircle, Trash2, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import GlassCard from '@/components/shared/GlassCard';
import { useAuth } from '@/lib/AuthContext';
import MemberDashboardView from '@/components/member/MemberDashboardView';

export default function AdminPanel() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canAccessAdmin = user?.role === 'admin';
  const allowedAdminTabs = ['approvals', 'membership', 'preview', 'directory', 'users', 'players', 'matches', 'linking', 'invitations'];
  const requestedTab = searchParams.get('tab');
  const activeAdminTab = allowedAdminTabs.includes(requestedTab) ? requestedTab : 'approvals';
  const queryClient = useQueryClient();
  const [playerSearch, setPlayerSearch] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editForm, setEditForm] = useState(/** @type {any} */ ({}));
  const [saving, setSaving] = useState(false);
  const [assignMatchOpen, setAssignMatchOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [membershipSyncing, setMembershipSyncing] = useState(false);
  const [membershipSyncResult, setMembershipSyncResult] = useState(null);
  const [previewUserId, setPreviewUserId] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [updatingRole, setUpdatingRole] = useState(null);
  const [updatingApproval, setUpdatingApproval] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [savingUserName, setSavingUserName] = useState(false);
  const [promotingPlayer, setPromotingPlayer] = useState(null);
  const [resetEmailUser, setResetEmailUser] = useState(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [reviewingDirectoryClaim, setReviewingDirectoryClaim] = useState(null);
  const [reviewingNewDirectoryRequest, setReviewingNewDirectoryRequest] = useState(null);
  const [revokingDirectoryAccess, setRevokingDirectoryAccess] = useState(null);
  const [removingDirectoryListing, setRemovingDirectoryListing] = useState(null);

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('-created_date', 200),
    enabled: canAccessAdmin
  });

  const { data: clubMembershipRelationships = [] } = useQuery({
    queryKey: ['club-membership-relationships', user?.active_tenant_id, user?.active_club_id],
    queryFn: () => base44.entities.ClubRelationship.filter({
      tenant_id: user?.active_tenant_id,
      club_id: user?.active_club_id,
      relationship_type: 'member'
    }, '-updated_date', 500),
    enabled: canAccessAdmin && !!user?.active_tenant_id && !!user?.active_club_id
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminUserTools', { action: 'list_users' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.users || [];
    },
    enabled: canAccessAdmin
  });

  const previewTargetUserId = previewUserId || user?.id || '';
  const { data: memberPreview = null, isLoading: loadingMemberPreview, error: memberPreviewError } = useQuery({
    queryKey: ['admin-member-preview', previewTargetUserId],
    queryFn: async () => {
      const [res, leaderboardRes] = await Promise.all([
        base44.functions.invoke('memberPortal', { action: 'admin_preview', userId: previewTargetUserId }),
        base44.functions.invoke('getClubLeaderboard', {}),
      ]);
      if (res.data?.error) throw new Error(res.data.error);
      const snapshot = res.data?.snapshot || null;
      return snapshot ? { ...snapshot, clubLeaderboard: leaderboardRes.data?.rows || [] } : null;
    },
    enabled: canAccessAdmin && activeAdminTab === 'preview' && !!previewTargetUserId
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-created_date', 200),
    enabled: canAccessAdmin
  });

  const { data: directoryVerification = { claims: [], accesses: [], listingRequests: [], listingRecords: [], invitations: [] } } = useQuery({
    queryKey: ['directory-verification'],
    queryFn: async () => {
      const res = await base44.functions.invoke('directoryClaim', { action: 'list_admin' });
      if (res.data?.error) throw new Error(res.data.error);
      return { claims: res.data?.claims || [], accesses: res.data?.accesses || [], listingRequests: res.data?.listingRequests || [], listingRecords: res.data?.listingRecords || [], invitations: res.data?.invitations || [] }; 
    },
    enabled: canAccessAdmin
  });

  // Guard: platform/site admins only. KOTC event roles must not grant site-admin access.
  if (!canAccessAdmin) {
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

  const syncMembership = async () => {
    if (membershipSyncing) return;
    setMembershipSyncing(true);
    setMembershipSyncResult(null);
    try {
      const res = await base44.functions.invoke('syncClareMembershipGoogleSheet', { mode: 'sync' });
      if (res.data?.error) throw new Error(res.data.error);
      setMembershipSyncResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['club-membership-relationships'] });
      toast.success(res.data?.message || 'Membership sync complete');
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Membership sync failed';
      setMembershipSyncResult({ error: message });
      toast.error(message);
    } finally {
      setMembershipSyncing(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) { toast.error('Enter an email'); return; }
    setInviting(true);
    await (/** @type {any} */ (base44)).users.inviteUser(inviteEmail.trim(), inviteRole, { full_name: inviteName.trim() || undefined });
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

  const deleteUser = async (u) => {
    setDeletingUser(u.id);
    await base44.entities.User.delete(u.id);
    queryClient.invalidateQueries({ queryKey: ['all-users'] });
    toast.success(`User ${u.full_name || u.email} deleted`);
    setDeletingUser(null);
    setConfirmDeleteUser(null);
  };

  const sendPasswordReset = async (user) => {
    setSendingReset(true);
    try {
      await (/** @type {any} */ (base44)).auth.adminSendPasswordReset(user.email);
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
      console.error('Error sending reset:', error);
    } finally {
      setSendingReset(false);
    }
  };

  const setKotcRole = async (userId, kotcRole) => {
    setUpdatingRole(userId);
    try {
      const res = await base44.functions.invoke('adminUserTools', { action: 'set_kotc_role', userId, kotcRole });
      if (res.data?.error) throw new Error(res.data.error);
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast.success('KOTC role updated');
    } catch (error) {
      toast.error(error?.message || 'Could not update KOTC role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const reviewDirectoryClaim = async (claimId, decision) => {
    setReviewingDirectoryClaim(claimId);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'review', claimId, decision });
      if (res.data?.error) throw new Error(res.data.error);
      queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
      toast.success(decision === 'approved' ? 'Directory claim approved' : 'Directory claim rejected');
    } catch (error) {
      toast.error(error.message || 'Could not update directory claim');
    } finally {
      setReviewingDirectoryClaim(null);
    }
  };

  const reviewNewDirectoryRequest = async (requestId, decision) => {
    setReviewingNewDirectoryRequest(requestId);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'review_new', requestId, decision });
      if (res.data?.error) throw new Error(res.data.error);
      queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
      toast.success(decision === 'approved' ? 'New club published and editor access granted' : 'New club request rejected');
    } catch (error) {
      toast.error(error.message || 'Could not update new club request');
    } finally {
      setReviewingNewDirectoryRequest(null);
    }
  };

  const removeDirectoryListing = async (listing) => {
    if (!listing?.slug) return;
    const confirmed = window.confirm(`Remove ${listing.name || listing.slug} from the public directory?\n\nThis will archive the listing, hide it from the public directory and revoke its directory-editor access. Curated RallyHub seed listings cannot be removed with this action.`);
    if (!confirmed) return;
    setRemovingDirectoryListing(listing.slug);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'archive_listing', listingSlug: listing.slug });
      if (res.data?.error) throw new Error(res.data.error);
      queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
      toast.success(`${listing.name || 'Directory listing'} removed from the public directory`);
    } catch (error) {
      toast.error(error.message || 'Could not remove directory listing');
    } finally {
      setRemovingDirectoryListing(null);
    }
  };

  const revokeDirectoryAccess = async (accessId) => {
    setRevokingDirectoryAccess(accessId);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'revoke', accessId });
      if (res.data?.error) throw new Error(res.data.error);
      queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
      toast.success('Directory editor access revoked');
    } catch (error) {
      toast.error(error.message || 'Could not revoke directory access');
    } finally {
      setRevokingDirectoryAccess(null);
    }
  };

  const setApprovalStatus = async (userId, status) => {
    setUpdatingApproval(userId);
    const approvalRes = await base44.functions.invoke('adminUserTools', { action: 'set_approval', userId, status });
    if (approvalRes.data?.error) {
      toast.error(approvalRes.data.error);
      setUpdatingApproval(null);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['all-users'] });
    toast.success(`User ${status}`);
    setUpdatingApproval(null);
    // Notify the user by email if approved or rejected. The backend resolves the
    // recipient/name from userId so no caller-controlled email address is accepted.
    if (status === 'approved' || status === 'rejected') {
      base44.functions.invoke('notifyAdminsOnSignup', {
        notifyUserApproval: true,
        userId,
        status
      }).catch(() => {});
    }
  };

  const filteredUsers = allUsers.filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const activeClubId = user?.active_club_id || '';
  const activeTenantId = user?.active_tenant_id || '';
  const clubPlayers = players.filter(p => (!activeClubId || p.club_id === activeClubId) && (!activeTenantId || p.tenant_id === activeTenantId));
  const currentClubPlayers = clubPlayers.filter(p => p.relationship_type === 'member' && p.status === 'Active');
  const linkedCount = currentClubPlayers.filter(p => p.user_id).length;
  const clubPlayerCount = currentClubPlayers.length;
  const paidActiveCount = clubMembershipRelationships.filter(r => r.status === 'active' && r.membership_category === 'paid').length;
  const complimentaryActiveCount = clubMembershipRelationships.filter(r => r.status === 'active' && r.membership_category === 'complimentary').length;
  const pendingMemberCount = clubMembershipRelationships.filter(r => r.status === 'pending').length;
  const unlinkedCount = Math.max(0, clubPlayerCount - linkedCount);
  const pendingDirectoryClaims = directoryVerification.claims.filter(c => c.status === 'pending');
  const pendingNewDirectoryRequests = directoryVerification.listingRequests.filter(r => r.status === 'pending');
  const activeDirectoryAccesses = directoryVerification.accesses.filter(a => a.status === 'active');
  const directoryInvitations = (directoryVerification.invitations || []).slice(0, 50);
  const pendingDirectoryInvitations = directoryInvitations.filter(invite => invite.status === 'pending');
  const activeDynamicDirectoryListings = directoryVerification.listingRecords.filter(record => record.status === 'active');

  return (
    <div className="space-y-6">
      <PageHeader title={activeAdminTab === 'directory' ? 'Directory Admin' : 'Admin Panel'} description={activeAdminTab === 'directory' ? 'Directory ownership, invitations, claims and listing access' : 'Site owner control panel'}>
        <Badge className="bg-destructive/20 text-destructive gap-1.5">
          <Shield className="w-3 h-3" /> Admin Only
        </Badge>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard delay={0} className="text-center">
          <p className="text-2xl font-bold text-foreground">{clubPlayerCount}</p>
          <p className="text-xs text-muted-foreground">Current Clare Members</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">{paidActiveCount} paid · {complimentaryActiveCount} complimentary · {pendingMemberCount} pending</p>
        </GlassCard>
        <GlassCard delay={0.05} className="text-center">
          <p className="text-2xl font-bold text-primary">{linkedCount}</p>
          <p className="text-xs text-muted-foreground">Linked RallyHub Accounts</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">Current club only</p>
        </GlassCard>
        <GlassCard delay={0.1} className="text-center">
          <p className="text-2xl font-bold text-yellow-400">{unlinkedCount}</p>
          <p className="text-xs text-muted-foreground">Members Not Yet Linked</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">Current Clare members only</p>
        </GlassCard>
      </div>

      <Tabs value={activeAdminTab} onValueChange={value => setSearchParams(value === 'approvals' ? {} : { tab: value })}>
        <TabsList className="bg-secondary flex-wrap h-auto gap-1">
          <TabsTrigger value="approvals" className="text-xs gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Approvals
            {allUsers.filter(u => !u.approval_status || u.approval_status === 'pending').length > 0 && (
              <span className="ml-1 bg-yellow-500 text-black text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {allUsers.filter(u => !u.approval_status || u.approval_status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="membership" className="text-xs gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Membership Sync
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Member Preview
          </TabsTrigger>
          <TabsTrigger value="directory" className="text-xs gap-1.5">
            <UserCheck className="w-3.5 h-3.5" /> Directory Claims
            {(pendingDirectoryClaims.length + pendingNewDirectoryRequests.length + pendingDirectoryInvitations.length) > 0 && (
              <span className="ml-1 bg-amber-400 text-black text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">{pendingDirectoryClaims.length + pendingNewDirectoryRequests.length + pendingDirectoryInvitations.length}</span>
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
                Platform and club-app users must be approved before accessing protected RallyHub tools. Directory-only accounts do not need platform approval; their listing access is verified separately under Directory Claims.
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

        {/* ── MEMBERSHIP SYNC TAB ── */}
        <TabsContent value="membership" className="mt-4">
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">Clare Pickleball 2026–27 Membership</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sync paid active members from the Clare Pickleball Google membership spreadsheet into RallyHub.
                    RallyHub reads <strong>Form Responses 1</strong> and <strong>2026-27 Member Master</strong>, matches existing people first, and only creates a new member when no safe match exists.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground space-y-1">
                <p><span className="font-semibold text-foreground">Safe to press more than once.</span> Existing members are matched by membership ID, email, mobile, or name + DOB.</p>
                <p>Blank Google cells do not remove existing RallyHub data. Ambiguous matches are held for review rather than guessed.</p>
              </div>

              <Button
                data-testid="admin-membership-sync"
                className="w-full sm:w-auto min-h-11 gap-2"
                onClick={syncMembership}
                disabled={membershipSyncing}
                aria-busy={membershipSyncing}
              >
                <RefreshCw className={`w-4 h-4 ${membershipSyncing ? 'animate-spin' : ''}`} />
                {membershipSyncing ? 'Syncing Membership…' : 'Sync Membership Now'}
              </Button>

              {membershipSyncResult && !membershipSyncResult.error && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 space-y-2">
                  <p className="text-sm font-semibold text-green-600">{membershipSyncResult.message}</p>
                  {membershipSyncResult.addedMembers?.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Added:</span>{' '}
                      {membershipSyncResult.addedMembers.map(m => `${m.name}${m.membershipId ? ` (${m.membershipId})` : ''}`).join(', ')}
                    </div>
                  )}
                  {membershipSyncResult.needsReview?.length > 0 && (
                    <div className="text-xs text-amber-600">
                      {membershipSyncResult.needsReview.length} record{membershipSyncResult.needsReview.length === 1 ? '' : 's'} need manual review.
                    </div>
                  )}
                </div>
              )}

              {membershipSyncResult?.error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {membershipSyncResult.error}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── MEMBER PREVIEW TAB ── */}
        <TabsContent value="preview" className="mt-4">
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Member Preview</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Preview exactly the member dashboard without logging out or impersonating anyone. This is read-only: your Super Admin authentication and permissions never change.
                </p>
              </div>
              <div className="w-full lg:w-80">
                <Label className="text-xs text-muted-foreground">Preview as</Label>
                <Select value={previewTargetUserId} onValueChange={setPreviewUserId}>
                  <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue placeholder="Choose a member" /></SelectTrigger>
                  <SelectContent>
                    {[...allUsers]
                      .filter(u => u.id === user?.id || u.approval_status === 'approved')
                      .sort((a, b) => {
                        if (a.id === user?.id) return -1;
                        if (b.id === user?.id) return 1;
                        return String(a.full_name || a.display_name || a.email || '').localeCompare(String(b.full_name || b.display_name || b.email || ''));
                      })
                      .map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.id === user?.id ? `${u.full_name || u.display_name || u.email} (me as member)` : (u.full_name || u.display_name || u.email)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingMemberPreview ? (
              <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading member preview…</div>
            ) : memberPreviewError ? (
              <div className="glass rounded-xl p-6 text-sm text-destructive">{memberPreviewError.message || 'Could not load member preview.'}</div>
            ) : memberPreview ? (
              <div className="rounded-2xl border border-primary/20 bg-background/20 p-3 sm:p-5">
                <MemberDashboardView snapshot={memberPreview} preview />
              </div>
            ) : (
              <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Choose a member account to preview.</div>
            )}
          </div>
        </TabsContent>

        {/* ── DIRECTORY CLAIMS TAB ── */}
        <TabsContent value="directory" className="mt-4">
          <div className="space-y-5">
            <div className="glass rounded-lg p-3 flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Directory verification is separate from RallyHub Club membership and platform approval. An exact match to an authenticated account email can verify an unclaimed listing automatically. A known RallyHub platform admin may also auto-verify where both the trusted name and trusted phone match; other claims require administrator review.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">New club requests</p>
              {pendingNewDirectoryRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 px-1">No new clubs are waiting to be added.</p>
              ) : pendingNewDirectoryRequests.map(request => (
                <div key={request.id} className="glass rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary" /><p className="font-semibold text-foreground">{request.club_name}</p></div>
                    <p className="text-sm text-muted-foreground">{request.town ? `${request.town} · ` : ''}{request.county}</p>
                    {request.primary_venue && <p className="text-xs text-muted-foreground">Venue: {request.primary_venue}{request.address ? ` · ${request.address}` : ''}{request.venue_postcode ? ` · ${request.venue_postcode}` : ''}</p>}
                    <p className="text-xs text-muted-foreground break-all">Submitted by {request.claimant_name || '(no name)'} · {request.claimant_role || 'role not supplied'} · {request.claimant_email}</p>
                    {request.claimant_phone && <p className="text-xs text-muted-foreground">Phone: {request.claimant_phone}</p>}
                    <p className="text-xs text-muted-foreground">Network updates: {request.network_updates_opt_in ? 'Opted in' : 'No'}</p>
                    {(request.website || request.facebook || request.instagram) && (
                      <p className="text-xs text-muted-foreground break-all">Links: {[request.website, request.facebook, request.instagram].filter(Boolean).join(' · ')}</p>
                    )}
                    {request.notes && <p className="text-xs text-muted-foreground mt-2">“{request.notes}”</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" disabled={reviewingNewDirectoryRequest === request.id} onClick={() => reviewNewDirectoryRequest(request.id, 'approved')} className="gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {reviewingNewDirectoryRequest === request.id ? '…' : 'Approve & publish'}
                    </Button>
                    <Button size="sm" variant="outline" disabled={reviewingNewDirectoryRequest === request.id} onClick={() => reviewNewDirectoryRequest(request.id, 'rejected')} className="gap-1 text-destructive border-destructive/30">
                      <XCircle className="w-3.5 h-3.5" /> {reviewingNewDirectoryRequest === request.id ? '…' : 'Reject'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Published submitted listings</p>
              {activeDynamicDirectoryListings.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 px-1">No submitted directory listings are currently published.</p>
              ) : activeDynamicDirectoryListings.map(listing => (
                <div key={listing.id || listing.slug} className="glass rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{listing.name}</p>
                    <p className="text-sm text-muted-foreground">County {listing.county} · /directory/{listing.slug}</p>
                    <p className="text-xs text-muted-foreground mt-1">Submitted listings can be removed here without affecting RallyHub's curated seed directory records.</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30" disabled={removingDirectoryListing === listing.slug} onClick={() => removeDirectoryListing(listing)}>
                    <Trash2 className="w-3.5 h-3.5" /> {removingDirectoryListing === listing.slug ? 'Removing…' : 'Remove listing'}
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Pending verification</p>
              {pendingDirectoryClaims.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 px-1">No directory claims are waiting for review.</p>
              ) : pendingDirectoryClaims.map(claim => (
                <div key={claim.id} className="glass rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold text-foreground">{claim.listing_name_snapshot}</p>
                    <p className="text-sm text-foreground">{claim.claimant_name || '(no name)'} <span className="text-muted-foreground">· {claim.claimant_role || 'role not supplied'}</span></p>
                    <p className="text-xs text-muted-foreground break-all">{claim.claimant_email}{claim.claimant_phone ? ` · ${claim.claimant_phone}` : ''}</p>
                    {claim.claimant_message && <p className="text-xs text-muted-foreground mt-2">“{claim.claimant_message}”</p>}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant="outline" className={claim.email_match ? 'border-green-400/40 text-green-300' : 'border-border text-muted-foreground'}>Email match: {claim.email_match ? 'Yes' : 'No'}</Badge>
                      <Badge variant="outline" className={claim.name_match ? 'border-green-400/40 text-green-300' : 'border-border text-muted-foreground'}>Name match: {claim.name_match ? 'Yes' : 'No'}</Badge>
                      <Badge variant="outline" className={claim.phone_match ? 'border-green-400/40 text-green-300' : 'border-border text-muted-foreground'}>Phone match: {claim.phone_match ? 'Yes' : 'No'}</Badge>
                      <Badge variant="outline" className={claim.network_updates_opt_in ? 'border-primary/40 text-primary' : 'border-border text-muted-foreground'}>Network updates: {claim.network_updates_opt_in ? 'Opted in' : 'No'}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" disabled={reviewingDirectoryClaim === claim.id} onClick={() => reviewDirectoryClaim(claim.id, 'approved')} className="gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {reviewingDirectoryClaim === claim.id ? '…' : 'Approve'}
                    </Button>
                    <Button size="sm" variant="outline" disabled={reviewingDirectoryClaim === claim.id} onClick={() => reviewDirectoryClaim(claim.id, 'rejected')} className="gap-1 text-destructive border-destructive/30">
                      <XCircle className="w-3.5 h-3.5" /> {reviewingDirectoryClaim === claim.id ? '…' : 'Reject'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Directory invitations {pendingDirectoryInvitations.length ? `· ${pendingDirectoryInvitations.length} pending` : ''}</p>
              {directoryInvitations.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 px-1">No directory invitations have been created yet.</p>
              ) : directoryInvitations.map(invite => {
                const inviter = allUsers.find(u => u.id === invite.created_by_user_id);
                const recipient = invite.contact_name || invite.contact_email || invite.contact_phone || 'Unnamed recipient';
                const statusClass = invite.status === 'pending' ? 'border-amber-400/40 text-amber-300' : invite.status === 'used' ? 'border-green-400/40 text-green-300' : 'border-border text-muted-foreground';
                return (
                  <div key={invite.id} className="glass rounded-lg p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{invite.listing_name_snapshot || invite.listing_slug}</p>
                        <Badge variant="outline" className={statusClass}>{invite.status}</Badge>
                        <Badge variant="outline">{invite.access_role === 'owner' ? 'Primary Owner' : 'Directory Editor'}</Badge>
                        <Badge variant="outline">{invite.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">To: {recipient}{invite.contact_email && recipient !== invite.contact_email ? ` · ${invite.contact_email}` : ''}{invite.contact_phone && recipient !== invite.contact_phone ? ` · ${invite.contact_phone}` : ''}</p>
                      <p className="text-xs text-muted-foreground">Created by: {inviter?.full_name || inviter?.display_name || inviter?.email || invite.created_by_user_id}</p>
                      {invite.expires_at && <p className="text-xs text-muted-foreground">Expires: {new Date(invite.expires_at).toLocaleString('en-IE')}</p>}
                      {invite.used_at && <p className="text-xs text-green-400">Accepted: {new Date(invite.used_at).toLocaleString('en-IE')}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Verified directory owners & editors</p>
              {activeDirectoryAccesses.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 px-1">No directory editor access has been granted yet.</p>
              ) : activeDirectoryAccesses.map(access => {
                const accessUser = allUsers.find(u => u.id === access.user_id);
                return (
                  <div key={access.id} className="glass rounded-lg p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-foreground">{access.listing_name_snapshot || access.listing_slug}</p><Badge variant="outline">{access.role === 'owner' ? 'Primary Owner' : 'Directory Editor'}</Badge></div>
                      <p className="text-xs text-muted-foreground truncate">{accessUser?.full_name || accessUser?.display_name || accessUser?.email || access.user_id}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30" disabled={revokingDirectoryAccess === access.id} onClick={() => revokeDirectoryAccess(access.id)}>
                      {revokingDirectoryAccess === access.id ? 'Revoking…' : 'Revoke directory access'}
                    </Button>
                  </div>
                );
              })}
            </div>
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
                    <Select value={u.kotc_role || (u.role === 'admin' ? 'super_admin' : 'player')} onValueChange={value => setKotcRole(u.id, value)} disabled={updatingRole === u.id || u.id === user?.id}>
                      <SelectTrigger className="h-8 w-32 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="player">Player</SelectItem>
                      </SelectContent>
                    </Select>
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
                    {u.id !== user?.id && (
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => setConfirmDeleteUser(u)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
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

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!confirmDeleteUser} onOpenChange={(open) => { if (!open) setConfirmDeleteUser(null); }}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" /> Delete User
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to permanently delete <strong>{confirmDeleteUser?.full_name || confirmDeleteUser?.email}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setConfirmDeleteUser(null)}>Cancel</Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingUser === confirmDeleteUser?.id}
              onClick={() => deleteUser(confirmDeleteUser)}
            >
              {deletingUser === confirmDeleteUser?.id ? 'Deleting…' : 'Delete User'}
            </Button>
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