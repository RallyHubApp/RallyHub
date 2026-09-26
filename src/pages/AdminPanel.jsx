import React, { useEffect, useState } from 'react';
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
import { Search, Users, Swords, Link2, Edit2, Shield, CheckCircle2, UserCheck, Unlink, Mail, UserPlus, ShieldCheck, ShieldOff, Pencil, Send, Clock, XCircle, CheckCircle, Trash2, RefreshCw, Eye, MessageCircle, Copy, Upload } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import GlassCard from '@/components/shared/GlassCard';
import { useAuth } from '@/lib/AuthContext';
import MemberDashboardView from '@/components/member/MemberDashboardView';
import { directoryClubs } from '@/data/directorySeed';

export default function AdminPanel() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canAccessAdmin = user?.role === 'admin';
  const allowedAdminTabs = ['approvals', 'preview', 'directory', 'directory-contacts', 'directory-players', 'feedback', 'assets', 'users', 'players', 'matches', 'linking', 'invitations'];
  const requestedTab = searchParams.get('tab');
  const activeAdminTab = allowedAdminTabs.includes(requestedTab) ? requestedTab : 'approvals';
  const directoryFocus = searchParams.get('focus');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (activeAdminTab !== 'directory' || directoryFocus !== 'pending-actions') return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const target = document.querySelector('[data-directory-action="pending-claim"][data-has-pending="true"]')
        || document.querySelector('[data-directory-action="new-club"][data-has-pending="true"]');
      if (target) {
        window.clearInterval(timer);
        window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      } else if (attempts >= 50) {
        window.clearInterval(timer);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [activeAdminTab, directoryFocus]);
  const [assetUploading, setAssetUploading] = useState(false);
  const [assetUploadUrl, setAssetUploadUrl] = useState('');
  const [assetName, setAssetName] = useState('');
  const uploadSiteAsset = async (file) => {
    if (!file) return;
    setAssetUploading(true);
    try {
      const assetKey = assetName.trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
      if (!assetKey) throw new Error('Enter an asset name first');
      const res = await base44.functions.invoke('secureCreditAction', { action:'upload_image', purpose:'site_asset', assetKey, file });
      const url = res?.data?.file_url || res?.file_url;
      if (!url) throw new Error(res?.data?.error || 'No file URL returned');
      setAssetUploadUrl(url);
      toast.success('Asset uploaded and stored in RallyHub');
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Asset upload failed');
    } finally { setAssetUploading(false); }
  };
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
  const [membershipSearch, setMembershipSearch] = useState('');
  const [selectedMembershipPersonId, setSelectedMembershipPersonId] = useState('');
  const [previewUserId, setPreviewUserId] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [updatingRole, setUpdatingRole] = useState(null);
  const [updatingApproval, setUpdatingApproval] = useState(null);
  const [connectingMemberAccount, setConnectingMemberAccount] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [savingUserName, setSavingUserName] = useState(false);
  const [promotingPlayer, setPromotingPlayer] = useState(null);
  const [resetEmailUser, setResetEmailUser] = useState(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [reviewingDirectoryClaim, setReviewingDirectoryClaim] = useState(null);
  const [editingPendingDirectoryClaim, setEditingPendingDirectoryClaim] = useState(null);
  const [pendingDirectoryIdentityForm, setPendingDirectoryIdentityForm] = useState({ fullName:'', mobile:'' });
  const [savingPendingDirectoryIdentity, setSavingPendingDirectoryIdentity] = useState(false);
  const [reviewingNewDirectoryRequest, setReviewingNewDirectoryRequest] = useState(null);
  const [revokingDirectoryAccess, setRevokingDirectoryAccess] = useState(null);
  const [removingDirectoryListing, setRemovingDirectoryListing] = useState(null);
  const [directoryVisibilityBusy, setDirectoryVisibilityBusy] = useState(null);
  const [ownerInvite, setOwnerInvite] = useState({ listingSlug: '', contactName: '', contactPhone: '', contactEmail: '' });
  const [directoryClubSearch, setDirectoryClubSearch] = useState('');
  const [ownerInviteBusy, setOwnerInviteBusy] = useState('');
  const [ownerInviteResult, setOwnerInviteResult] = useState(null);
  const [testingClareMail, setTestingClareMail] = useState(false);
  const [approvingDirectoryInvitation, setApprovingDirectoryInvitation] = useState('');
  const [resendInviteBusy, setResendInviteBusy] = useState('');
  const [resendPreview, setResendPreview] = useState(null);
  const [welcomeBusy, setWelcomeBusy] = useState('');
  const [directoryContactSearch, setDirectoryContactSearch] = useState('');
  const [directoryPlayerSearch, setDirectoryPlayerSearch] = useState('');
  const [editingDirectoryContact, setEditingDirectoryContact] = useState(null);
  const [directoryContactEditForm, setDirectoryContactEditForm] = useState({ fullName: '', mobile: '' });
  const [savingDirectoryIdentity, setSavingDirectoryIdentity] = useState(false);
  const [directoryBroadcast, setDirectoryBroadcast] = useState({ subject: '', message: '', audience: 'service' });
  const [directoryBroadcastBusy, setDirectoryBroadcastBusy] = useState('');
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState('');

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

  const { data: membershipRows = [], isLoading: membershipRowsLoading } = useQuery({
    queryKey: ['admin-membership-records', user?.active_tenant_id, user?.active_club_id],
    queryFn: async () => {
      const res = await base44.functions.invoke('membershipRecord', { action: 'admin_list' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.rows || [];
    },
    enabled: canAccessAdmin && activeAdminTab === 'approvals' && !!user?.active_tenant_id && !!user?.active_club_id
  });

  const { data: selectedMembershipRecord = null, isLoading: selectedMembershipLoading, error: selectedMembershipError } = useQuery({
    queryKey: ['admin-membership-detail', selectedMembershipPersonId, user?.active_tenant_id, user?.active_club_id],
    queryFn: async () => {
      const res = await base44.functions.invoke('membershipRecord', { action: 'admin_detail', personId: selectedMembershipPersonId });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.record || null;
    },
    enabled: canAccessAdmin && activeAdminTab === 'membership' && !!selectedMembershipPersonId
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

  const { data: allClubUserAccesses = [] } = useQuery({
    queryKey: ['all-club-user-accesses'],
    queryFn: () => base44.entities.ClubUserAccess.list('-approved_at', 500),
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

  const { data: directoryVerification = { claims: [], accesses: [], listingRequests: [], listingRecords: [], listingProfiles: [], invitations: [] } } = useQuery({
    queryKey: ['directory-verification'],
    queryFn: async () => {
      const res = await base44.functions.invoke('directoryClaim', { action: 'list_admin' });
      if (res.data?.error) throw new Error(res.data.error);
      return { claims: res.data?.claims || [], accesses: res.data?.accesses || [], listingRequests: res.data?.listingRequests || [], listingRecords: res.data?.listingRecords || [], listingProfiles: res.data?.listingProfiles || [], invitations: res.data?.invitations || [] }; 
    },
    enabled: canAccessAdmin
  });

  const { data: directoryPlayerNetwork = { counts: {}, subscribers: [] } } = useQuery({
    queryKey: ['directory-player-network'],
    queryFn: async () => {
      const res = await base44.functions.invoke('directoryPlayerNetwork', { action: 'admin_list' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data || { counts: {}, subscribers: [] };
    },
    enabled: canAccessAdmin && activeAdminTab === 'directory-players'
  });

  const { data: clubFeedbackRows = [] } = useQuery({
    queryKey: ['club-feedback-admin'],
    queryFn: async () => {
      const res = await base44.functions.invoke('clubFeedback', { action: 'admin_list' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.rows || [];
    },
    enabled: canAccessAdmin
  });

  const updateFeedbackStatus = async (row, status) => {
    setUpdatingFeedbackId(row.id);
    try {
      const res = await base44.functions.invoke('clubFeedback', {
        action: 'admin_update',
        feedbackId: row.id,
        status,
        adminNote: row.admin_note || ''
      });
      if (res.data?.error) throw new Error(res.data.error);
      await queryClient.invalidateQueries({ queryKey: ['club-feedback-admin'] });
      toast.success('Feedback status updated');
    } catch (error) {
      toast.error(error?.message || 'Could not update feedback');
    } finally {
      setUpdatingFeedbackId('');
    }
  };

  const downloadFeedbackCsv = () => {
    const headings = ['Date','Person','Email','Club','Type','Area','Importance','Status','Feedback'];
    const rows = clubFeedbackRows.map(row => [
      row.submitted_at || '',
      row.person_name || '',
      row.person_email || '',
      row.club_name || '',
      row.feedback_type || '',
      row.area || '',
      row.importance || '',
      row.status || '',
      row.message || ''
    ]);
    const escape = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [headings, ...rows].map(row => row.map(escape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RallyHub_Club_Feedback_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
    const toastId = toast.loading(decision === 'approved' ? 'Approving Directory claim…' : 'Rejecting Directory claim…');
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'review', claimId, decision });
      if (res.data?.error) throw new Error(res.data.error);

      // Reflect the confirmed backend result immediately so the admin never has to refresh
      // to discover whether the key press worked. The normal refetch then reconciles the
      // complete Directory state (access records, listing verification and invitations).
      queryClient.setQueryData(['directory-verification'], current => current ? ({
        ...current,
        claims: (current.claims || []).map(claim => claim.id === claimId ? { ...claim, status: decision } : claim),
      }) : current);

      if (decision === 'approved') {
        toast.success(res.data?.welcomeEmail?.sent ? 'Directory claim approved and welcome email sent' : 'Directory claim approved', { id: toastId });
        if (res.data?.welcomeEmail?.error) toast.warning(`Access was approved, but the welcome email was not sent: ${res.data.welcomeEmail.error}`);
      } else {
        toast.success('Directory claim rejected', { id: toastId });
      }
      await queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
    } catch (error) {
      toast.error(error.message || 'Could not update directory claim', { id: toastId });
    } finally {
      setReviewingDirectoryClaim(null);
    }
  };

  const reviewNewDirectoryRequest = async (requestId, decision) => {
    setReviewingNewDirectoryRequest(requestId);
    const toastId = toast.loading(decision === 'approved' ? 'Approving and publishing new Directory club…' : 'Rejecting new Directory club…');
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'review_new', requestId, decision });
      if (res.data?.error) throw new Error(res.data.error);
      queryClient.setQueryData(['directory-verification'], current => current ? ({
        ...current,
        listingRequests: (current.listingRequests || []).map(request => request.id === requestId ? { ...request, status: decision } : request),
      }) : current);
      if (decision === 'approved') {
        toast.success(res.data?.welcomeEmail?.sent ? 'New club published, access granted and welcome email sent' : 'New club published and access granted', { id: toastId });
        if (res.data?.welcomeEmail?.error) toast.warning(`Access was granted, but the welcome email was not sent: ${res.data.welcomeEmail.error}`);
      } else {
        toast.success('New club request rejected', { id: toastId });
      }
      await queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
    } catch (error) {
      toast.error(error.message || 'Could not update new club request', { id: toastId });
    } finally {
      setReviewingNewDirectoryRequest(null);
    }
  };

  const setDirectoryVisibility = async (listing, visibility) => {
    if (!listing?.slug) return;
    setDirectoryVisibilityBusy(listing.slug);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action:'set_visibility', listingSlug:listing.slug, visibility });
      if (res.data?.error) throw new Error(res.data.error);
      await queryClient.invalidateQueries({ queryKey:['directory-verification'] });
      toast.success(visibility === 'preview_only' ? `${listing.name || 'Listing'} is now Preview only` : `${listing.name || 'Listing'} is now public`);
    } catch (error) {
      toast.error(error?.message || 'Could not change directory visibility');
    } finally {
      setDirectoryVisibilityBusy(null);
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

  const approveDirectoryInvitation = async (invitationId, accessRole = 'owner') => {
    setApprovingDirectoryInvitation(invitationId);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'approve_invitation', invitationId });
      if (res.data?.error) throw new Error(res.data.error);
      queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
      toast.success(res.data?.welcomeEmail?.sent ? `Directory ${accessRole === 'editor' ? 'editor' : 'owner'} access approved and welcome email sent` : `Directory ${accessRole === 'editor' ? 'editor' : 'owner'} access approved`);
      if (res.data?.welcomeEmail?.error) toast.warning(`Access was approved, but the welcome email was not sent: ${res.data.welcomeEmail.error}`);
    } catch (error) {
      toast.error(error.message || 'Could not approve this directory invitation yet');
    } finally {
      setApprovingDirectoryInvitation('');
    }
  };

  const directoryAdminListings = (() => {
    const bySlug = new Map();
    for (const club of directoryClubs || []) {
      if (!club?.slug) continue;
      const contacts = [club.contact, ...(club.secondaryContacts || [])].filter(Boolean).map(contact => ({
        name: String(contact?.name || '').trim(),
        phone: String(contact?.phone || '').trim(),
        email: String(contact?.email || '').trim(),
      }));
      const preferredContact = contacts.find(contact => contact.phone) || contacts.find(contact => contact.email) || contacts[0] || { name: '', phone: '', email: '' };
      bySlug.set(club.slug, {
        slug: club.slug,
        name: club.name,
        county: club.county || '',
        contacts,
        contactName: preferredContact.name,
        contactPhone: preferredContact.phone,
        contactEmail: preferredContact.email,
      });
    }
    for (const record of directoryVerification.listingRecords || []) {
      if (!record?.slug || record.status !== 'active') continue;
      let contacts = [];
      try {
        const parsed = record.trusted_contacts_json ? JSON.parse(record.trusted_contacts_json) : [];
        contacts = Array.isArray(parsed) ? parsed.map(contact => ({
          name: String(contact?.name || '').trim(),
          phone: String(contact?.phone || '').trim(),
          email: String(contact?.email || '').trim(),
        })) : [];
      } catch { contacts = []; }
      const preferredContact = contacts.find(contact => contact.phone) || contacts.find(contact => contact.email) || contacts[0] || { name: '', phone: '', email: '' };
      const existing = bySlug.get(record.slug) || {};
      bySlug.set(record.slug, {
        ...existing,
        slug: record.slug,
        name: record.name || existing.name || record.slug,
        county: record.county || existing.county || '',
        visibility: record.visibility || 'public',
        contacts: contacts.length ? contacts : (existing.contacts || []),
        contactName: preferredContact.name || existing.contactName || '',
        contactPhone: preferredContact.phone || existing.contactPhone || '',
        contactEmail: preferredContact.email || existing.contactEmail || '',
      });
    }

    // The editable Directory profile is the authoritative current public contact.
    // Overlay it last so a club contact edited after import (for example Dublin 15)
    // is used for new email/WhatsApp invitations instead of the original seed contact.
    for (const profileRow of directoryVerification.listingProfiles || []) {
      if (!profileRow?.listing_slug || profileRow.status !== 'active') continue;
      let publicProfile = null;
      try { publicProfile = profileRow.public_json ? JSON.parse(profileRow.public_json) : null; } catch { publicProfile = null; }
      const currentContact = publicProfile?.contact || null;
      if (!currentContact) continue;
      const latestContact = {
        name: String(currentContact.name || '').trim(),
        phone: String(currentContact.phone || '').trim(),
        email: String(currentContact.email || '').trim(),
      };
      if (!latestContact.name && !latestContact.phone && !latestContact.email) continue;
      const existing = bySlug.get(profileRow.listing_slug) || { slug: profileRow.listing_slug, name: profileRow.listing_slug, county: '', contacts: [] };
      bySlug.set(profileRow.listing_slug, {
        ...existing,
        // A saved profile contact replaces the imported contact for outreach.
        // Do not keep stale imported names/numbers available in the invite search.
        contacts: [latestContact],
        contactName: latestContact.name,
        contactPhone: latestContact.phone,
        contactEmail: latestContact.email,
      });
    }
    return [...bySlug.values()].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  })();

  const selectedOwnerInviteListing = directoryAdminListings.find(item => item.slug === ownerInvite.listingSlug) || null;
  const filteredDirectoryAdminListings = directoryAdminListings.flatMap(item => {
    const q = directoryClubSearch.trim().toLowerCase();
    if (!q) return [item];
    const qDigits = q.replace(/\D/g, '');
    const clubMatch = `${item.name} ${item.county}`.toLowerCase().includes(q);
    const matchedContact = (item.contacts || []).find(contact => {
      const text = `${contact.name} ${contact.phone} ${contact.email}`.toLowerCase();
      const phoneDigits = String(contact.phone || '').replace(/\D/g, '');
      return text.includes(q) || (qDigits.length >= 4 && phoneDigits.includes(qDigits));
    });
    return clubMatch || matchedContact ? [{ ...item, matchedContact: matchedContact || null }] : [];
  });
  const chooseDirectoryClubForInvite = (listing) => {
    const contact = listing.matchedContact || {
      name: listing.contactName || '',
      phone: listing.contactPhone || '',
      email: listing.contactEmail || '',
    };
    setOwnerInvite({
      listingSlug: listing.slug,
      contactName: contact.name || '',
      contactPhone: contact.phone || '',
      contactEmail: contact.email || '',
    });
    setOwnerInviteResult(null);
    setTimeout(() => document.getElementById('directory-claim-invite')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const directoryInviteMessage = ({ claimUrl, clubName, contactName, accessRole = 'owner' }) => {
    const firstName = String(contactName || '').trim().split(/\s+/)[0] || 'there';
    const editor = accessRole === 'editor';
    if (editor) {
      return `Hi ${firstName},\n\nYou’ve been invited as a *Directory Editor* for *${clubName}* on RallyHub. This gives you access to help maintain the club’s public Directory information only. It does not give access to RallyHub Club, tournaments, players or club administration.\n\n*Your secure editor link:*\n${claimUrl}\n\nThe link is personal to you, can only be used once and expires after 72 hours.\n\n*About RallyHub:*\nhttps://rallyhub.ie/about\n\n*Club Guide & Help:*\nhttps://rallyhub.ie/directory/help\n\nYours in sport,\n*Brian Moore*\nFounder, RallyHub\n📱 087 810 0333\n🌐 https://rallyhub.ie`;
    }
    return `Hi ${firstName},\n\nI’m getting in touch because I’ve put together a *free RallyHub Directory listing for ${clubName}* as part of a wider effort to improve information on pickleball clubs around Ireland, following David Molloy’s request for help updating the national club map.\n\nConall and I started RallyHub as a father-and-son project, originally to solve some of the practical things we needed for Clare Pickleball. It has grown from there, and the first public phase is the *RallyHub Club Directory* — helping players find clubs, venues and regular sessions around Ireland.\n\nI’ve already created the *${clubName}* listing, so most of the work is done. I’d simply like you to have a look, claim the listing and correct or add anything that needs updating.\n\nOnce verified, you’ll become the *Primary Directory Owner* for ${clubName}, which means you can manage the club’s public Directory information directly.\n\n*The Directory listing is completely free.*\nThere is no subscription, no catch and no obligation to use any other RallyHub services.\n\nRallyHub is also developing other optional club tools around session management, King of the Court, tournaments and events, but those are separate from your free Directory listing.\n\n*Your secure claim link:*\n${claimUrl}\n\nThe link is personal to you, can only be used once and expires after 72 hours.\n\nIf you’d like to have a quick look at RallyHub first:\n\n*About RallyHub:*\nhttps://rallyhub.ie/about\n\n*1-page Directory Explainer:*\nhttps://rallyhub.ie/directory/story\n\n*Club Guide & Help:*\nhttps://rallyhub.ie/directory/help\n\n*Quick Start Guide:*\nhttps://rallyhub.ie/directory/quick-start\n\nThere is also a *Feedback* area inside RallyHub, and I’m always happy to hear suggestions about what would genuinely be useful to clubs.\n\nIf you have any difficulty claiming the listing, just WhatsApp or call me.\n\nYours in sport,\n*Brian Moore*\nFounder, RallyHub\n📱 087 810 0333\n🌐 https://rallyhub.ie`;
  };

  const ownerInviteWhatsAppMessage = (args) => directoryInviteMessage({ ...args, accessRole: 'owner' });

  const whatsappDigitsForInvite = (phone, county = '') => {
    let digits = String(phone || '').replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0')) {
      const niCounties = new Set(['Antrim', 'Armagh', 'Down', 'Fermanagh', 'Londonderry', 'Derry', 'Tyrone']);
      digits = `${niCounties.has(String(county || '').trim()) ? '44' : '353'}${digits.slice(1)}`;
    }
    return digits;
  };

  const directoryWelcomeEmail = (access, accessUser) => {
    if (accessUser?.email) return accessUser.email;
    const claim = (directoryVerification.claims || []).find(c =>
      String(c.claimant_user_id || '') === String(access?.user_id || '') &&
      String(c.listing_slug || '') === String(access?.listing_slug || '')
    );
    if (claim?.claimant_email) return claim.claimant_email;
    const invite = (directoryVerification.invitations || []).find(i =>
      String(i.used_by_user_id || '') === String(access?.user_id || '') &&
      String(i.listing_slug || '') === String(access?.listing_slug || '')
    );
    return invite?.contact_email || '';
  };

  const directoryWelcomePhone = (access, accessUser) => {
    if (accessUser?.directory_mobile) return accessUser.directory_mobile;
    const claim = (directoryVerification.claims || []).find(c =>
      String(c.claimant_user_id || '') === String(access?.user_id || '') &&
      String(c.listing_slug || '') === String(access?.listing_slug || '')
    );
    if (claim?.claimant_phone) return claim.claimant_phone;
    const invite = (directoryVerification.invitations || []).find(i =>
      String(i.used_by_user_id || '') === String(access?.user_id || '') &&
      String(i.listing_slug || '') === String(access?.listing_slug || '')
    );
    return invite?.contact_phone || '';
  };

  const directoryWelcomeWhatsAppMessage = (access, accessUser) => {
    const firstName = String(accessUser?.full_name || accessUser?.display_name || '').trim().split(/\s+/)[0] || 'there';
    const clubName = access?.listing_name_snapshot || directoryAdminListings.find(x => x.slug === access?.listing_slug)?.name || 'your club';
    const manageUrl = `https://rallyhub.ie/directory/${encodeURIComponent(access?.listing_slug || '')}/edit`;
    return `Hi ${firstName},

Thanks for connecting with RallyHub. Your *${clubName}* Directory access is now ready.

You can manage the listing here:
${manageUrl}

If you use *Spond*, open *Enhanced listing*. You can connect your club’s Spond account, scan your upcoming events and import your regular venues and session times, which should save you a good bit of work.

If you need any help, just message me here. And if you have any thoughts or suggestions for making the Directory better, send me a text or voice note anytime, or use the Feedback button inside RallyHub.

Also, if you spot any *clubs, venues or regular sessions missing from the Directory*, please let me know. We’d be delighted to follow them up and invite them to be included.

Thanks again.

Brian`;
  };

  const sendDirectoryWelcomeAgain = async (access, accessUser) => {
    if (!access?.id) return;
    setWelcomeBusy(`email:${access.id}`);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action:'send_welcome_email', accessId:access.id });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`Welcome email sent to ${res.data?.to || directoryWelcomeEmail(access, accessUser) || 'Directory contact'}`);
    } catch (error) {
      toast.error(error?.message || 'Could not send the welcome email');
    } finally {
      setWelcomeBusy('');
    }
  };

  const openDirectoryWelcomeWhatsApp = (access, accessUser) => {
    const phone = directoryWelcomePhone(access, accessUser);
    if (!phone) return toast.error('No mobile number is saved for this Directory contact');
    const county = directoryAdminListings.find(x => x.slug === access?.listing_slug)?.county || '';
    const digits = whatsappDigitsForInvite(phone, county);
    if (!digits) return toast.error('The saved mobile number is not valid for WhatsApp');
    const message = directoryWelcomeWhatsAppMessage(access, accessUser);
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const openDirectoryContactEditor = row => {
    if (!row?.accesses?.length) return;
    setEditingDirectoryContact(row);
    setDirectoryContactEditForm({
      fullName: row.fullName || '',
      mobile: row.mobile || '',
    });
  };

  const saveDirectoryContactIdentity = async () => {
    const accessId = editingDirectoryContact?.accesses?.[0]?.id;
    if (!accessId) return;
    setSavingDirectoryIdentity(true);
    try {
      const res = await base44.functions.invoke('directoryClaim', {
        action: 'update_verified_identity',
        accessId,
        fullName: directoryContactEditForm.fullName,
        mobile: directoryContactEditForm.mobile,
      });
      if (res.data?.error) throw new Error(res.data.error);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['all-users'] }),
        queryClient.invalidateQueries({ queryKey: ['directory-verification'] }),
      ]);
      toast.success('Private Directory identity updated');
      setEditingDirectoryContact(null);
    } catch (error) {
      toast.error(error?.message || 'Could not update the private Directory identity');
    } finally {
      setSavingDirectoryIdentity(false);
    }
  };

  const openDirectoryContactWhatsApp = row => {
    if (!row?.mobile) return toast.error('No private mobile / WhatsApp number is saved for this contact');
    const county = row?.clubs?.[0]?.county || '';
    const digits = whatsappDigitsForInvite(row.mobile, county);
    if (!digits) return toast.error('The saved mobile number is not valid for WhatsApp');
    window.open(`https://wa.me/${digits}`, '_blank', 'noopener,noreferrer');
  };

  const downloadDirectoryContactsCsv = () => {
    const headings = ['Full name','Email','Mobile / WhatsApp','Clubs','Roles','Network updates opt-in'];
    const rows = directoryContactRows.map(row => [
      row.fullName || '',
      row.email || '',
      row.mobile || '',
      row.clubs.map(club => club.name).join(' | '),
      row.clubs.map(club => `${club.name}: ${club.role}`).join(' | '),
      row.networkUpdatesOptIn ? 'Yes' : 'No',
    ]);
    const csv = [headings, ...rows]
      .map(cols => cols.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rallyhub-directory-contacts-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyDirectoryWhatsAppNumbers = async () => {
    const numbers = [...new Set(directoryContactRows.map(row => row.mobile).filter(Boolean))];
    if (!numbers.length) return toast.error('No private mobile numbers are available');
    try {
      await navigator.clipboard.writeText(numbers.join('\n'));
      toast.success(`${numbers.length} Directory contact number${numbers.length === 1 ? '' : 's'} copied`);
    } catch {
      toast.error('Could not copy the Directory contact numbers');
    }
  };

  const sendDirectoryBroadcast = async (testOnly = false) => {
    const subject = directoryBroadcast.subject.trim();
    const message = directoryBroadcast.message.trim();
    if (!subject || !message) return toast.error('Enter both a subject and message');
    if (!testOnly) {
      const targetCount = directoryBroadcast.audience === 'opted_in'
        ? directoryContactRows.filter(row => row.email && row.networkUpdatesOptIn).length
        : directoryContactRows.filter(row => row.email).length;
      const audienceLabel = directoryBroadcast.audience === 'opted_in'
        ? 'verified Directory contacts who opted in to general/network updates'
        : 'all verified Directory owners and editors';
      const confirmed = window.confirm(`Send this email to ${targetCount} ${audienceLabel}?\n\nA test send first is recommended.`);
      if (!confirmed) return;
    }
    setDirectoryBroadcastBusy(testOnly ? 'test' : 'send');
    try {
      const res = await base44.functions.invoke('directoryClaim', {
        action: 'directory_broadcast_email',
        subject,
        message,
        audience: directoryBroadcast.audience,
        testOnly,
      });
      if (res.data?.error) throw new Error(res.data.error);
      if (testOnly) {
        toast.success(`Test email sent to ${res.data?.to || 'your admin email'}`);
      } else {
        toast.success(`Directory broadcast complete: ${res.data?.sent || 0} sent${res.data?.failed ? `, ${res.data.failed} failed` : ''}`);
      }
    } catch (error) {
      toast.error(error?.message || 'Could not send the Directory broadcast');
    } finally {
      setDirectoryBroadcastBusy('');
    }
  };

  const createOwnerWhatsAppInvite = async () => {
    if (!ownerInvite.listingSlug || !selectedOwnerInviteListing) return toast.error('Choose a club first');
    const activeAccess = activeDirectoryAccesses.find(a => a.listing_slug === ownerInvite.listingSlug && a.status === 'active' && a.role === 'owner') || activeDirectoryAccesses.find(a => a.listing_slug === ownerInvite.listingSlug && a.status === 'active');
    if (activeAccess) {
      const accessUser = allUsers.find(u => u.id === activeAccess.user_id);
      const phone = directoryWelcomePhone(activeAccess, accessUser);
      if (!phone) return toast.error('No mobile number is saved for this Directory contact');
      setOwnerInviteResult({ channel: 'whatsapp', clubName: selectedOwnerInviteListing.name, phone, county: selectedOwnerInviteListing.county, message: directoryWelcomeWhatsAppMessage(activeAccess, accessUser) });
      return toast.success('WhatsApp message ready — review the text below');
    }
    if (!ownerInvite.contactPhone.trim()) return toast.error('Enter the mobile number for WhatsApp');
    setOwnerInviteBusy('whatsapp');
    setOwnerInviteResult(null);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'create_claim_invite', listingSlug: ownerInvite.listingSlug, contactName: ownerInvite.contactName, contactPhone: ownerInvite.contactPhone, contactEmail: ownerInvite.contactEmail, channel: 'whatsapp' });
      if (res.data?.error) throw new Error(res.data.error);
      const message = ownerInviteWhatsAppMessage({ claimUrl: res.data.claimUrl, clubName: selectedOwnerInviteListing.name, contactName: ownerInvite.contactName });
      setOwnerInviteResult({ channel: 'whatsapp', claimUrl: res.data.claimUrl, expiresAt: res.data.expiresAt, message, clubName: selectedOwnerInviteListing.name, phone: ownerInvite.contactPhone, county: selectedOwnerInviteListing.county });
      queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
      toast.success('Secure owner invitation created — review the WhatsApp message below');
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message || 'Could not create the WhatsApp invitation');
    } finally {
      setOwnerInviteBusy('');
    }
  };

  const sendOwnerEmailInvite = async () => {
    if (!ownerInvite.listingSlug || !selectedOwnerInviteListing) return toast.error('Choose a club first');
    if (!ownerInvite.contactEmail.trim()) return toast.error('Enter the email address');
    setOwnerInviteBusy('email');
    setOwnerInviteResult(null);
    try {
      const res = await base44.functions.invoke('directoryClaim', {
        action: 'create_claim_invite', listingSlug: ownerInvite.listingSlug,
        contactName: ownerInvite.contactName, contactPhone: ownerInvite.contactPhone,
        contactEmail: ownerInvite.contactEmail, channel: 'email',
      });
      if (res.data?.error) throw new Error(res.data.error);
      const message = directoryInviteMessage({ claimUrl: res.data.claimUrl, clubName: selectedOwnerInviteListing.name, contactName: ownerInvite.contactName, accessRole: 'owner' }).replace(/\*/g, '');
      setOwnerInviteResult({ channel: 'email-preview', invitationId: res.data.invitationId, claimUrl: res.data.claimUrl, expiresAt: res.data.expiresAt, clubName: selectedOwnerInviteListing.name, email: ownerInvite.contactEmail, subject: `Your free RallyHub Directory listing – ${selectedOwnerInviteListing.name}`, message });
      queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
      toast.success('Email invitation prepared — review it before sending');
    } catch (error) { toast.error(error.message || 'Could not prepare the email invitation'); }
    finally { setOwnerInviteBusy(''); }
  };

  const sendPreparedEmail = async (preview, clear = 'owner') => {
    if (!preview?.invitationId || !preview?.email || !preview?.message) return;
    setResendInviteBusy(preview.invitationId);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'send_prepared_invitation_email', invitationId: preview.invitationId, claimUrl: preview.claimUrl, subject: preview.subject, message: preview.message });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`RallyHub Directory invitation sent to ${res.data?.email || preview.email}`);
      if (clear === 'owner') setOwnerInviteResult({ ...preview, channel: 'email-sent' }); else setResendPreview(null);
      queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
    } catch (error) { toast.error(error.message || 'Could not send the invitation'); }
    finally { setResendInviteBusy(''); }
  };

  const prepareInvitationResend = async (invite) => {
    setResendInviteBusy(invite.id);
    try {
      const res = await base44.functions.invoke('directoryClaim', { action: 'prepare_resend_invitation', invitationId: invite.id });
      if (res.data?.error) throw new Error(res.data.error);
      const message = directoryInviteMessage({ claimUrl: res.data.claimUrl, clubName: res.data.clubName, contactName: res.data.contactName, accessRole: res.data.accessRole });
      setResendPreview({ ...res.data, email: res.data.contactEmail, phone: res.data.contactPhone, county: directoryAdminListings.find(x => x.slug === res.data.listingSlug)?.county || '', subject: res.data.accessRole === 'editor' ? `RallyHub Directory editor invitation – ${res.data.clubName}` : `Your free RallyHub Directory listing – ${res.data.clubName}`, message: res.data.channel === 'email' ? message.replace(/\*/g, '') : message });
      queryClient.invalidateQueries({ queryKey: ['directory-verification'] });
      toast.success('Fresh 72-hour invitation prepared — review it before sending');
    } catch (error) { toast.error(error.message || 'Could not prepare the resend'); }
    finally { setResendInviteBusy(''); }
  };

  const openResendWhatsApp = () => {
    if (!resendPreview?.phone || !resendPreview?.message) return;
    const digits = whatsappDigitsForInvite(resendPreview.phone, resendPreview.county);
    if (!digits) return toast.error('The mobile number is not valid for WhatsApp');
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(resendPreview.message)}`, '_blank', 'noopener,noreferrer');
  };

  const testClareMailGateway = async () => {
    setTestingClareMail(true);
    try {
      const res = await base44.functions.invoke('directoryClaim', {
        action: 'test_clare_mail_gateway',
        to: user?.email,
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`Clare Pickleball test email sent to ${res.data?.to || user?.email}`);
    } catch (error) {
      toast.error(error.message || 'Could not send the Clare Pickleball test email');
    } finally {
      setTestingClareMail(false);
    }
  };

  const copyOwnerInviteMessage = async () => {
    if (!ownerInviteResult?.message) return;
    await navigator.clipboard.writeText(ownerInviteResult.message);
    toast.success('WhatsApp invitation copied');
  };

  const openOwnerInviteWhatsApp = () => {
    if (!ownerInviteResult?.message || !ownerInviteResult?.phone) return;
    const digits = whatsappDigitsForInvite(ownerInviteResult.phone, ownerInviteResult.county);
    if (!digits) return toast.error('The mobile number is not valid for WhatsApp');
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(ownerInviteResult.message)}`, '_blank', 'noopener,noreferrer');
  };

  const connectMemberAccount = async (targetUser, player, confirmNameMismatch = false) => {
    if (!targetUser?.id || !player?.person_id) return;
    setConnectingMemberAccount(targetUser.id);
    try {
      const res = await base44.functions.invoke('membershipRecord', {
        action: 'admin_connect_account',
        userId: targetUser.id,
        personId: player.person_id,
        confirmNameMismatch
      });
      if (res.data?.error) throw new Error(res.data.error);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['all-users'] }),
        queryClient.invalidateQueries({ queryKey: ['players'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-membership-records'] }),
        queryClient.invalidateQueries({ queryKey: ['club-membership-relationships'] }),
      ]);
      toast.success(`${targetUser.full_name || targetUser.email} approved and connected to ${player.full_name}.`);
    } catch (e) {
      toast.error(e?.message || 'Could not connect this member account.');
    } finally {
      setConnectingMemberAccount(null);
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

  const normaliseIdentityName = value => String(value || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim();
  const membershipCandidateForUser = targetUser => {
    const targetEmail = String(targetUser?.email || '').trim().toLowerCase();
    if (!targetEmail) return null;
    return clubPlayers.find(p =>
      p.person_id &&
      (!p.user_id || p.user_id === targetUser.id) &&
      String(p.email || p.linked_user_email || '').trim().toLowerCase() === targetEmail
    ) || null;
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
  const directoryClaimIdentityLooksComplete = claim => {
    const name = String(claim?.claimant_name || '').trim().toLowerCase().replace(/[^a-z0-9' -]+/g, ' ').replace(/\s+/g, ' ');
    const parts = name.split(' ').filter(Boolean);
    const blocked = new Set(['chair','chairperson','chairman','chairwoman','secretary','treasurer','organiser','organizer','owner','admin','administrator','committee','club','pickleball','contact','manager','captain','team']);
    const phoneDigits = String(claim?.claimant_phone || '').replace(/\D/g, '');
    return parts.length >= 2 && !parts.some(part => blocked.has(part)) && phoneDigits.length >= 8 && phoneDigits.length <= 15;
  };
  const directoryInvitationUsedForClaim = claim => {
    const invitations = (directoryVerification.invitations || []).filter(invite =>
      String(invite.listing_slug || '') === String(claim?.listing_slug || '')
    );
    const exactUsed = invitations.find(invite =>
      invite.status === 'used' &&
      String(invite.used_by_user_id || '') === String(claim?.claimant_user_id || '')
    );
    if (exactUsed) return exactUsed;
    const claimEmail = String(claim?.claimant_email || '').trim().toLowerCase();
    const emailRelated = invitations.find(invite =>
      claimEmail && String(invite.contact_email || '').trim().toLowerCase() === claimEmail
    );
    return emailRelated || invitations[0] || null;
  };
  const savePendingDirectoryIdentity = async () => {
    if (!editingPendingDirectoryClaim?.id) return;
    setSavingPendingDirectoryIdentity(true);
    try {
      const res = await base44.functions.invoke('directoryClaim', {
        action:'admin_update_pending_claim_identity',
        claimId: editingPendingDirectoryClaim.id,
        fullName: pendingDirectoryIdentityForm.fullName,
        mobile: pendingDirectoryIdentityForm.mobile,
      });
      if (res.data?.error) throw new Error(res.data.error);
      if (res.data?.claim) {
        queryClient.setQueryData(['directory-verification'], current => {
          if (!current) return current;
          return {
            ...current,
            claims: (current.claims || []).map(claim => claim.id === res.data.claim.id ? res.data.claim : claim),
          };
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey:['directory-verification'] }),
        queryClient.invalidateQueries({ queryKey:['all-users'] }),
      ]);
      toast.success('Private identity confirmed. You can now approve the Directory claim.');
      setEditingPendingDirectoryClaim(null);
    } catch (error) {
      toast.error(error?.message || 'Could not correct the verification details');
    } finally {
      setSavingPendingDirectoryIdentity(false);
    }
  };

  const pendingDirectoryClaims = directoryVerification.claims.filter(c => c.status === 'pending');
  const pendingNewDirectoryRequests = directoryVerification.listingRequests.filter(r => r.status === 'pending');
  const pendingDirectoryActionCount = pendingDirectoryClaims.length + pendingNewDirectoryRequests.length;
  const activeDirectoryAccesses = directoryVerification.accesses.filter(a => a.status === 'active');
  const directoryContactRows = (() => {
    const byUser = new Map();
    for (const access of activeDirectoryAccesses) {
      const userId = String(access.user_id || '');
      if (!userId) continue;
      const accessUser = allUsers.find(u => String(u.id) === userId) || null;
      const userClaims = (directoryVerification.claims || [])
        .filter(claim => String(claim.claimant_user_id || '') === userId)
        .sort((a, b) => Date.parse(String(b.created_date || '')) - Date.parse(String(a.created_date || '')));
      const latestClaim = userClaims[0] || null;
      const existing = byUser.get(userId) || {
        userId,
        fullName: latestClaim?.claimant_name || accessUser?.full_name || accessUser?.display_name || '',
        email: latestClaim?.claimant_email || accessUser?.email || '',
        mobile: latestClaim?.claimant_phone || accessUser?.directory_mobile || '',
        networkUpdatesOptIn: latestClaim?.network_updates_opt_in === true,
        publicNameOptOut: latestClaim?.public_name_opt_out === true,
        publicPhoneOptOut: latestClaim?.public_phone_opt_out === true,
        accesses: [],
        clubs: [],
      };
      const listing = directoryAdminListings.find(item => item.slug === access.listing_slug) || null;
      const publicLabel = listing?.contactName || '';
      existing.accesses.push(access);
      existing.clubs.push({
        slug: access.listing_slug,
        name: access.listing_name_snapshot || listing?.name || access.listing_slug,
        county: listing?.county || '',
        role: access.role === 'owner' ? 'Primary Owner' : 'Directory Editor',
        publicLabel,
      });
      byUser.set(userId, existing);
    }
    return [...byUser.values()].sort((a, b) => String(a.fullName || a.email).localeCompare(String(b.fullName || b.email)));
  })();
  const filteredDirectoryContactRows = directoryContactRows.filter(row => {
    const q = directoryContactSearch.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      row.fullName,
      row.email,
      row.mobile,
      ...row.clubs.flatMap(club => [club.name, club.county, club.role, club.publicLabel]),
    ].map(value => String(value || '').toLowerCase()).join(' ');
    return haystack.includes(q);
  });
  const directoryContactsWithEmail = directoryContactRows.filter(row => row.email).length;
  const optedInDirectoryContacts = directoryContactRows.filter(row => row.email && row.networkUpdatesOptIn).length;
  const directoryPlayerRows = directoryPlayerNetwork.subscribers || [];
  const filteredDirectoryPlayerRows = directoryPlayerRows.filter(row => {
    const q = directoryPlayerSearch.trim().toLowerCase();
    if (!q) return true;
    return [row.firstName,row.fullName,row.email,row.mobile,row.clubName,row.county,row.duprRating,row.status]
      .some(value => String(value ?? '').toLowerCase().includes(q));
  });
  const activeDirectoryPlayerRows = directoryPlayerRows.filter(row => row.status === 'active' && (row.emailOptIn || row.whatsappOptIn));

  const downloadDirectoryPlayerCsv = () => {
    const headings = ['First name','Email','Mobile / WhatsApp','Club','County','DUPR rating','Email opt-in','WhatsApp/SMS opt-in','Status','Consent date'];
    const rows = filteredDirectoryPlayerRows.map(row => [
      row.firstName || row.fullName || '', row.email || '', row.mobile || '', row.clubName || '', row.county || '',
      row.duprRating ?? '', row.emailOptIn ? 'Yes' : 'No', row.whatsappOptIn ? 'Yes' : 'No', row.status || '', row.consentAt || ''
    ]);
    const csv = [headings, ...rows].map(cols => cols.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rallyhub-player-network-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const copyDirectoryPlayerWhatsAppNumbers = async () => {
    const numbers = [...new Set(activeDirectoryPlayerRows.filter(row => row.whatsappOptIn && row.mobile).map(row => row.mobile))];
    if (!numbers.length) return toast.error('No opted-in WhatsApp numbers are available');
    try {
      await navigator.clipboard.writeText(numbers.join('\n'));
      toast.success(`${numbers.length} opted-in WhatsApp number${numbers.length === 1 ? '' : 's'} copied`);
    } catch {
      toast.error('Could not copy the WhatsApp numbers');
    }
  };

  const copyDirectoryPlayerEmails = async () => {
    const emails = [...new Set(activeDirectoryPlayerRows.filter(row => row.emailOptIn && row.email).map(row => row.email))];
    if (!emails.length) return toast.error('No opted-in email addresses are available');
    try {
      await navigator.clipboard.writeText(emails.join('\n'));
      toast.success(`${emails.length} opted-in email address${emails.length === 1 ? '' : 'es'} copied`);
    } catch {
      toast.error('Could not copy the email addresses');
    }
  };
  const activeClubAccessUserIds = new Set((allClubUserAccesses || []).filter(a => a.status === 'active').map(a => String(a.user_id)));
  const directoryOnlyUserIds = new Set(
    activeDirectoryAccesses
      .filter(a => a.user_id && !activeClubAccessUserIds.has(String(a.user_id)))
      .map(a => String(a.user_id))
  );
  const platformApprovalUsers = allUsers.filter(u =>
    u.role !== 'admin' &&
    u.account_scope !== 'directory' &&
    !directoryOnlyUserIds.has(String(u.id))
  );
  const pendingPlatformApprovalCount = platformApprovalUsers.filter(u => !u.approval_status || u.approval_status === 'pending').length;
  const directoryInvitationStillOutstanding = invite => {
    if (invite?.status !== 'pending') return false;
    const expiresAt = Date.parse(String(invite.expires_at || ''));
    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) return false;

    const inviteName = String(invite.contact_name || '').trim().toLowerCase();
    const invitePhone = String(invite.contact_phone || '').replace(/\D/g, '');
    const approvedClaim = (directoryVerification.claims || []).find(claim => {
      if (claim.status !== 'approved' || claim.listing_slug !== invite.listing_slug) return false;
      const hasActiveAccess = activeDirectoryAccesses.some(access =>
        access.listing_slug === claim.listing_slug &&
        String(access.user_id || '') === String(claim.claimant_user_id || '')
      );
      if (!hasActiveAccess) return false;
      const claimName = String(claim.claimant_name || '').trim().toLowerCase();
      const claimPhone = String(claim.claimant_phone || '').replace(/\D/g, '');
      const sameName = inviteName && claimName && inviteName === claimName;
      const samePhone = invitePhone && claimPhone &&
        invitePhone.slice(-9) === claimPhone.slice(-9);
      const sameUser = invite.used_by_user_id &&
        String(invite.used_by_user_id) === String(claim.claimant_user_id || '');
      return sameUser || samePhone || sameName;
    });
    return !approvedClaim;
  };
  const directoryInvitations = (directoryVerification.invitations || []).filter(directoryInvitationStillOutstanding).slice(0, 50);
  const pendingDirectoryInvitations = directoryInvitations;
  const activeDynamicDirectoryListings = directoryVerification.listingRecords.filter(record => record.status === 'active');
  const claimedDirectorySlugs = new Set(activeDirectoryAccesses.map(access => String(access.listing_slug || '')).filter(Boolean));
  const claimedDirectoryListingCount = directoryAdminListings.filter(listing => claimedDirectorySlugs.has(String(listing.slug))).length;
  const unclaimedDirectoryListingCount = Math.max(0, directoryAdminListings.length - claimedDirectoryListingCount);
  const directoryRegisteredUserIds = new Set([
    ...activeDirectoryAccesses.map(access => String(access.user_id || '')).filter(Boolean),
    ...(directoryVerification.claims || [])
      .filter(claim => ['pending','approved'].includes(claim.status))
      .map(claim => String(claim.claimant_user_id || '')).filter(Boolean),
  ]);
  const directoryRegisteredPeopleCount = directoryRegisteredUserIds.size;
  const directoryClaimRate = directoryAdminListings.length ? Math.round((claimedDirectoryListingCount / directoryAdminListings.length) * 100) : 0;
  const directoryNeedsAttentionCount = pendingDirectoryClaims.length + pendingNewDirectoryRequests.length;
  const directoryAttentionTarget = pendingDirectoryClaims.length ? 'directory-pending-claims' : 'directory-pending-actions';
  const scrollToDirectorySection = id => {
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  };
  const filteredMembershipRows = membershipRows.filter(row => {
    if (!membershipSearch.trim()) return true;
    const q = membershipSearch.toLowerCase();
    return [row.full_name,row.email,row.mobile,row.member_id,row.dupr_id].some(value => String(value || '').toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <PageHeader title={activeAdminTab === 'directory' ? 'Directory Admin' : activeAdminTab === 'directory-contacts' ? 'Directory Contacts' : activeAdminTab === 'directory-players' ? 'Player Network' : 'Admin Panel'} description={activeAdminTab === 'directory' ? 'Directory ownership, invitations, claims and listing access' : activeAdminTab === 'directory-contacts' ? 'Private verified owner and editor contact register' : activeAdminTab === 'directory-players' ? 'National opted-in pickleball player distribution list' : 'Site owner control panel'}>
        <Badge className="bg-destructive/20 text-destructive gap-1.5">
          <Shield className="w-3 h-3" /> Admin Only
        </Badge>
      </PageHeader>

      {/* Context-specific dashboard summary */}
      {activeAdminTab === 'directory' ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">
          <GlassCard role="button" tabIndex={0} onClick={() => scrollToDirectorySection('directory-clubs')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToDirectorySection('directory-clubs'); } }} delay={0} className="min-h-[112px] p-3 sm:p-4 text-left cursor-pointer select-none transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <p className="text-2xl sm:text-3xl font-black text-foreground">{directoryAdminListings.length}</p>
            <p className="mt-1 text-xs sm:text-sm font-semibold">Directory listings</p>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">All current club listings</p>
          </GlassCard>
          <GlassCard role="button" tabIndex={0} onClick={() => scrollToDirectorySection('directory-clubs')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToDirectorySection('directory-clubs'); } }} delay={0.03} className="min-h-[112px] p-3 sm:p-4 text-left cursor-pointer select-none transition hover:border-green-500/40 hover:bg-green-500/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <p className="text-2xl sm:text-3xl font-black text-green-500">{claimedDirectoryListingCount}</p>
            <p className="mt-1 text-xs sm:text-sm font-semibold">Claimed listings</p>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{directoryClaimRate}% of Directory</p>
          </GlassCard>
          <GlassCard role="button" tabIndex={0} onClick={() => scrollToDirectorySection('directory-clubs')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToDirectorySection('directory-clubs'); } }} delay={0.06} className="min-h-[112px] p-3 sm:p-4 text-left cursor-pointer select-none transition hover:border-amber-500/40 hover:bg-amber-500/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <p className="text-2xl sm:text-3xl font-black text-amber-500">{unclaimedDirectoryListingCount}</p>
            <p className="mt-1 text-xs sm:text-sm font-semibold">Still unclaimed</p>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Clubs still to connect</p>
          </GlassCard>
          <GlassCard role="button" tabIndex={0} onClick={() => scrollToDirectorySection('directory-verified-access')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToDirectorySection('directory-verified-access'); } }} delay={0.09} className="min-h-[112px] p-3 sm:p-4 text-left cursor-pointer select-none transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <p className="text-2xl sm:text-3xl font-black text-primary">{directoryRegisteredPeopleCount}</p>
            <p className="mt-1 text-xs sm:text-sm font-semibold">Registered people</p>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{directoryContactRows.length} verified with access</p>
          </GlassCard>
          <GlassCard role="button" tabIndex={0} onClick={() => scrollToDirectorySection(directoryAttentionTarget)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToDirectorySection(directoryAttentionTarget); } }} delay={0.12} className="min-h-[112px] p-3 sm:p-4 text-left cursor-pointer select-none transition hover:border-destructive/40 hover:bg-destructive/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <p className="text-2xl sm:text-3xl font-black text-destructive">{directoryNeedsAttentionCount}</p>
            <p className="mt-1 text-xs sm:text-sm font-semibold">Needs attention</p>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{pendingDirectoryClaims.length} claims · {pendingNewDirectoryRequests.length} new clubs</p>
          </GlassCard>
          <GlassCard role="button" tabIndex={0} onClick={() => scrollToDirectorySection('directory-outstanding-invitations')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToDirectorySection('directory-outstanding-invitations'); } }} delay={0.15} className="min-h-[112px] p-3 sm:p-4 text-left cursor-pointer select-none transition hover:border-blue-500/40 hover:bg-blue-500/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <p className="text-2xl sm:text-3xl font-black text-blue-500">{pendingDirectoryInvitations.length}</p>
            <p className="mt-1 text-xs sm:text-sm font-semibold">Invitations out</p>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Awaiting recipient / approval</p>
          </GlassCard>
        </div>
      ) : activeAdminTab === 'directory-players' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <GlassCard className="min-h-[112px] p-3 sm:p-4"><p className="text-2xl sm:text-3xl font-black text-foreground">{directoryPlayerNetwork.counts?.active || 0}</p><p className="mt-1 text-xs sm:text-sm font-semibold">Active players</p><p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Opted in to at least one channel</p></GlassCard>
          <GlassCard className="min-h-[112px] p-3 sm:p-4"><p className="text-2xl sm:text-3xl font-black text-primary">{directoryPlayerNetwork.counts?.email || 0}</p><p className="mt-1 text-xs sm:text-sm font-semibold">Email opt-ins</p><p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Available for email updates</p></GlassCard>
          <GlassCard className="min-h-[112px] p-3 sm:p-4"><p className="text-2xl sm:text-3xl font-black text-green-500">{directoryPlayerNetwork.counts?.whatsapp || 0}</p><p className="mt-1 text-xs sm:text-sm font-semibold">WhatsApp opt-ins</p><p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">Available for mobile updates</p></GlassCard>
          <GlassCard className="min-h-[112px] p-3 sm:p-4"><p className="text-2xl sm:text-3xl font-black text-amber-500">{directoryPlayerNetwork.counts?.counties || 0}</p><p className="mt-1 text-xs sm:text-sm font-semibold">Counties represented</p><p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">National reach</p></GlassCard>
        </div>
      ) : activeAdminTab === 'directory-contacts' ? null : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <GlassCard role="button" tabIndex={0} onClick={() => { window.location.href='/app/membership'; }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href='/app/membership'; } }} delay={0} className="text-center cursor-pointer select-none transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <p className="text-2xl font-bold text-foreground">{clubPlayerCount}</p>
            <p className="text-xs text-muted-foreground">Current Club Members</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">{paidActiveCount} paid · {complimentaryActiveCount} complimentary · {pendingMemberCount} pending</p>
          </GlassCard>
          <GlassCard role="button" tabIndex={0} onClick={() => setSearchParams({ tab:'linking' })} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSearchParams({ tab:'linking' }); } }} delay={0.05} className="text-center cursor-pointer select-none transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <p className="text-2xl font-bold text-primary">{linkedCount}</p>
            <p className="text-xs text-muted-foreground">Linked RallyHub Accounts</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Tap to manage account links</p>
          </GlassCard>
          <GlassCard role="button" tabIndex={0} onClick={() => setSearchParams({ tab:'linking' })} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSearchParams({ tab:'linking' }); } }} delay={0.1} className="text-center cursor-pointer select-none transition hover:border-amber-500/40 hover:bg-amber-500/5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <p className="text-2xl font-bold text-yellow-400">{unlinkedCount}</p>
            <p className="text-xs text-muted-foreground">Members Not Yet Linked</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Tap to review linking</p>
          </GlassCard>
        </div>
      )}

      <Tabs value={activeAdminTab} onValueChange={value => {
        if (value === 'approvals') return setSearchParams({});
        if (value === 'directory' && pendingDirectoryActionCount > 0) return setSearchParams({ tab: 'directory', focus: 'pending-actions' });
        setSearchParams({ tab: value });
      }}>
        <TabsList className="bg-secondary flex-wrap h-auto gap-1">
          <TabsTrigger value="approvals" className="text-xs gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Club Access Approvals
            {pendingPlatformApprovalCount > 0 && (
              <span className="ml-1 bg-yellow-500 text-black text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {pendingPlatformApprovalCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Member Preview
          </TabsTrigger>
          <TabsTrigger value="directory" className="text-xs gap-1.5" onClick={() => {
            if (activeAdminTab !== 'directory' || pendingDirectoryActionCount <= 0) return;
            const target = document.querySelector('[data-directory-action="pending-claim"][data-has-pending="true"]')
              || document.querySelector('[data-directory-action="new-club"][data-has-pending="true"]');
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>
            <UserCheck className="w-3.5 h-3.5" /> Directory Claims
            {pendingDirectoryActionCount > 0 && (
              <span className="ml-1 bg-amber-400 text-black text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">{pendingDirectoryActionCount}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="directory-contacts" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" /> Directory Contacts
          </TabsTrigger>
          <TabsTrigger value="directory-players" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" /> Player Network
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" /> Feedback
            {clubFeedbackRows.filter(row => row.status === 'new').length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">{clubFeedbackRows.filter(row => row.status === 'new').length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="assets" className="text-xs gap-1.5"><Upload className="w-3.5 h-3.5" /> Asset Uploader</TabsTrigger>
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
                <strong className="text-foreground">RallyHub Club access only.</strong> This tab does not approve Directory users. A user can enter the RallyHub Club application only when they have a separate active ClubUserAccess grant. Directory owners/editors are handled only under Directory Claims and cannot access tournaments, players, matches, leaderboards or other Club tools.
              </p>
            </div>
            {['pending', 'approved', 'rejected'].map(section => {
              const sectionUsers = platformApprovalUsers.filter(u => {
                const s = u.approval_status || 'pending';
                return s === section;
              });
              if (sectionUsers.length === 0) return null;
              return (
                <div key={section} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    {section === 'pending' ? '⏳ Pending' : section === 'approved' ? '✅ Approved' : '❌ Rejected'}
                  </p>
                  {sectionUsers.map((u, i) => {
                    const candidate = membershipCandidateForUser(u);
                    const nameMismatch = !!candidate &&
                      normaliseIdentityName(u.full_name || u.display_name) &&
                      normaliseIdentityName(candidate.full_name) &&
                      normaliseIdentityName(u.full_name || u.display_name) !== normaliseIdentityName(candidate.full_name);
                    return (
                      <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="glass rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between gap-3">
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
                            {!candidate && section !== 'approved' && (
                              <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                                disabled={updatingApproval === u.id}
                                onClick={() => setApprovalStatus(u.id, 'approved')}>
                                <CheckCircle className="w-3 h-3" />
                                {updatingApproval === u.id ? '…' : 'Approve'}
                              </Button>
                            )}
                            {section !== 'rejected' && u.id !== user?.id && (
                              <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
                                disabled={updatingApproval === u.id || connectingMemberAccount === u.id}
                                onClick={() => setApprovalStatus(u.id, 'rejected')}>
                                <XCircle className="w-3 h-3" />
                                {updatingApproval === u.id ? '…' : 'Reject'}
                              </Button>
                            )}
                            {section === 'approved' && u.id !== user?.id && (
                              <Button size="sm" variant="outline" className="h-7 text-xs text-muted-foreground gap-1"
                                disabled={updatingApproval === u.id || connectingMemberAccount === u.id}
                                onClick={() => setApprovalStatus(u.id, 'pending')}>
                                <Clock className="w-3 h-3" />
                                {updatingApproval === u.id ? '…' : 'Revoke'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {candidate && (
                          <div className={`rounded-lg border p-3 ${nameMismatch ? 'border-amber-400/40 bg-amber-500/10' : 'border-primary/25 bg-primary/5'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold">
                                  Membership email match: {candidate.full_name}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {nameMismatch
                                    ? `Account name “${u.full_name || u.display_name}” differs from membership name “${candidate.full_name}”. Confirm only if you have verified they are the same person.`
                                    : 'Name and verified email match the existing Clare member/player record.'}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                className="min-h-9 shrink-0"
                                disabled={connectingMemberAccount === u.id}
                                onClick={() => connectMemberAccount(u, candidate, nameMismatch)}
                              >
                                <Link2 className="w-3.5 h-3.5 mr-1" />
                                {connectingMemberAccount === u.id
                                  ? 'Connecting…'
                                  : nameMismatch
                                    ? 'Confirm identity & connect'
                                    : section === 'approved'
                                      ? 'Connect membership'
                                      : 'Approve & connect'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
            {platformApprovalUsers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No RallyHub Club users to review. Directory-only accounts are managed under Directory Claims.</p>
            )}
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
                <strong className="text-foreground">Directory access only.</strong> Approving a claim here grants permission to edit the relevant public Directory listing and nothing else. It does not grant RallyHub Club, tenant, tournament, player, match, leaderboard, analytics or admin access. Those require a completely separate ClubUserAccess/Tenant access process.
              </p>
            </div>

            <div id="directory-clubs" className="glass rounded-xl p-4 sm:p-5 space-y-4 scroll-mt-24">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Directory clubs</p>
                <h3 className="text-lg font-bold text-foreground mt-1">Contact a club and invite them to claim</h3>
                <p className="text-sm text-muted-foreground mt-1">Search by club, county, contact name, mobile or email. RallyHub will prefill the known contact details and create the secure claim link for you.</p>
              </div>
              <Input value={directoryClubSearch} onChange={e => setDirectoryClubSearch(e.target.value)} placeholder="Search club, contact name, mobile or email…" aria-label="Search Directory clubs and contacts" />
              <div className="max-h-72 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                {filteredDirectoryAdminListings.map(listing => {
                  const accesses = activeDirectoryAccesses.filter(access => access.listing_slug === listing.slug && access.status === 'active');
                  const pending = directoryInvitations.filter(invite => invite.listing_slug === listing.slug && ['pending','used'].includes(invite.status));
                  const status = accesses.length ? 'Claimed' : pending.length ? 'Invitation in progress' : 'Unclaimed';
                  const shownContact = listing.matchedContact || { name: listing.contactName, phone: listing.contactPhone, email: listing.contactEmail };
                  const contactSummary = [shownContact.name, shownContact.phone, shownContact.email].filter(Boolean).join(' · ');
                  return <div key={listing.slug} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background/20">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{listing.name}</p>
                      <p className="text-xs text-muted-foreground">{listing.county || 'County not set'} · {status}{pending.length ? ` · ${pending.length} active invitation${pending.length === 1 ? '' : 's'}` : ''}</p>
                      {contactSummary && <p className="mt-1 text-xs text-muted-foreground break-all">{contactSummary}</p>}
                    </div>
                    <Button type="button" size="sm" variant={ownerInvite.listingSlug === listing.slug ? 'default' : 'outline'} onClick={() => chooseDirectoryClubForInvite(listing)} className="shrink-0 gap-1"><UserPlus className="w-3.5 h-3.5" /> {ownerInvite.listingSlug === listing.slug ? 'Selected' : accesses.length ? 'Manage' : 'Contact / invite'}</Button>
                  </div>;
                })}
                {filteredDirectoryAdminListings.length === 0 && <p className="p-4 text-sm text-muted-foreground">No Directory clubs match that search.</p>}
              </div>
              <p className="text-xs text-muted-foreground">{directoryAdminListings.length} Directory clubs available · showing {filteredDirectoryAdminListings.length}</p>
            </div>

            <div id="directory-claim-invite" className="glass rounded-xl p-4 sm:p-5 space-y-4 border border-primary/25 scroll-mt-24">
              <div className="rounded-lg border border-blue-400/25 bg-blue-400/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Clare Pickleball tenant email</p>
                  <p className="text-xs text-muted-foreground mt-1">Send a private test to your admin email before RallyHub’s master Gmail connection is changed.</p>
                </div>
                <Button type="button" variant="outline" onClick={testClareMailGateway} disabled={testingClareMail} className="gap-2 shrink-0">
                  <Mail className="w-4 h-4" /> {testingClareMail ? 'Sending test…' : 'Send Clare test email'}
                </Button>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Club claim invitation</p>
                  <h3 className="text-lg font-bold text-foreground mt-1">Offer the club its free Directory listing</h3>
                  <p className="text-sm text-muted-foreground mt-1">The known contact details are filled automatically. Mobile/WhatsApp is preferred when available; email is used when that is the contact we have.</p>
                </div>
                <UserPlus className="w-5 h-5 text-primary shrink-0 mt-1" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="directory-owner-club">Club</Label>
                  <select id="directory-owner-club" value={ownerInvite.listingSlug} onChange={e => { const listing = directoryAdminListings.find(item => item.slug === e.target.value); if (listing) chooseDirectoryClubForInvite(listing); else { setOwnerInvite({ listingSlug: '', contactName: '', contactPhone: '', contactEmail: '' }); setOwnerInviteResult(null); } }} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Choose a club…</option>
                    {directoryAdminListings.map(listing => {
                      const claimed = activeDirectoryAccesses.some(access => access.listing_slug === listing.slug && access.status === 'active');
                      return <option key={listing.slug} value={listing.slug}>{listing.name}{listing.county ? ` · ${listing.county}` : ''}{claimed ? ' · claimed' : ' · unclaimed'}</option>;
                    })}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="directory-owner-name">Contact name</Label>
                  <Input id="directory-owner-name" value={ownerInvite.contactName} onChange={e => { setOwnerInvite(v => ({ ...v, contactName: e.target.value })); setOwnerInviteResult(null); }} placeholder="e.g. Mick Kelliher" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="directory-owner-phone">Mobile / WhatsApp</Label>
                  <Input id="directory-owner-phone" value={ownerInvite.contactPhone} onChange={e => { setOwnerInvite(v => ({ ...v, contactPhone: e.target.value })); setOwnerInviteResult(null); }} placeholder="e.g. 087 123 4567" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="directory-owner-email">Email <span className="text-muted-foreground">(required only for email invitation)</span></Label>
                  <Input id="directory-owner-email" type="email" value={ownerInvite.contactEmail} onChange={e => { setOwnerInvite(v => ({ ...v, contactEmail: e.target.value })); setOwnerInviteResult(null); }} placeholder="name@example.com" />
                </div>
              </div>

              {(ownerInvite.contactPhone || ownerInvite.contactEmail) && (
                <p className="text-xs text-muted-foreground">
                  Preferred contact: <strong className="text-foreground">{ownerInvite.contactPhone ? 'WhatsApp' : 'Email'}</strong>
                  {ownerInvite.contactPhone && ownerInvite.contactEmail ? ' · Email remains available as a fallback.' : ''}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {ownerInvite.contactPhone && (
                  <Button type="button" onClick={createOwnerWhatsAppInvite} disabled={!!ownerInviteBusy || !ownerInvite.listingSlug} className="gap-2">
                    <MessageCircle className="w-4 h-4" /> {ownerInviteBusy === 'whatsapp' ? 'Creating secure link…' : 'Create WhatsApp invitation'}
                  </Button>
                )}
                {ownerInvite.contactEmail && (
                  <Button type="button" variant={ownerInvite.contactPhone ? 'outline' : 'default'} onClick={sendOwnerEmailInvite} disabled={!!ownerInviteBusy || !ownerInvite.listingSlug} className="gap-2">
                    <Mail className="w-4 h-4" /> {ownerInviteBusy === 'email' ? 'Preparing email…' : 'Prepare email invitation'}
                  </Button>
                )}
                {!ownerInvite.contactPhone && !ownerInvite.contactEmail && <p className="text-sm text-amber-500">No mobile or email is stored for this club yet. Add one above before creating the invitation.</p>}
              </div>

              {ownerInviteResult?.channel === 'whatsapp' && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">WhatsApp message ready</p>
                    <p className="text-xs text-muted-foreground mt-1">Review or edit the wording before opening WhatsApp. WhatsApp bold formatting uses *asterisks* and will render correctly in the chat.</p>
                  </div>
                  <textarea value={ownerInviteResult.message} onChange={e => setOwnerInviteResult(v => ({ ...v, message: e.target.value }))} rows={15} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 font-sans" />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={openOwnerInviteWhatsApp} className="gap-2"><MessageCircle className="w-4 h-4" /> Open WhatsApp app</Button>
                    <Button type="button" variant="outline" onClick={copyOwnerInviteMessage} className="gap-2"><Copy className="w-4 h-4" /> Copy message</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Secure link expires {ownerInviteResult.expiresAt ? new Date(ownerInviteResult.expiresAt).toLocaleString('en-IE') : 'after 72 hours'} and can only be used once.</p>
                </div>
              )}

              {ownerInviteResult?.channel === 'email-preview' && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <p className="font-semibold">Email ready — review before sending</p>
                  <Input value={ownerInviteResult.subject} onChange={e => setOwnerInviteResult(v => ({ ...v, subject: e.target.value }))} aria-label="Email subject" />
                  <textarea value={ownerInviteResult.message} onChange={e => setOwnerInviteResult(v => ({ ...v, message: e.target.value }))} rows={18} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 font-sans" />
                  <Button type="button" onClick={() => sendPreparedEmail(ownerInviteResult, 'owner')} disabled={resendInviteBusy === ownerInviteResult.invitationId} className="gap-2"><Mail className="w-4 h-4" /> {resendInviteBusy === ownerInviteResult.invitationId ? 'Sending…' : 'Send reviewed email'}</Button>
                  <p className="text-xs text-muted-foreground">Nothing is emailed until you press Send reviewed email. The secure link expires after 72 hours.</p>
                </div>
              )}
              {ownerInviteResult?.channel === 'email-sent' && <div className="rounded-xl border border-green-400/25 bg-green-400/5 p-4 text-sm">Email invitation sent successfully.</div>}
            </div>

            <div id="directory-pending-actions" className="space-y-2 scroll-mt-24" data-directory-action="new-club" data-has-pending={pendingNewDirectoryRequests.length > 0 ? "true" : "false"}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">New club requests</p>
              {pendingNewDirectoryRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 px-1">No new clubs are waiting to be added.</p>
              ) : pendingNewDirectoryRequests.map(request => (
                <div key={request.id} aria-busy={reviewingNewDirectoryRequest === request.id} className={`glass rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition ${reviewingNewDirectoryRequest === request.id ? 'ring-2 ring-primary/35 bg-primary/5' : ''}`}>
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
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {reviewingNewDirectoryRequest === request.id && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary" role="status" aria-live="polite"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving decision…</span>}
                    <Button size="sm" disabled={reviewingNewDirectoryRequest === request.id} onClick={() => reviewNewDirectoryRequest(request.id, 'approved')} className="gap-1 min-w-[146px]">
                      {reviewingNewDirectoryRequest === request.id ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Publishing…</> : <><CheckCircle className="w-3.5 h-3.5" /> Approve & publish</>}
                    </Button>
                    <Button size="sm" variant="outline" disabled={reviewingNewDirectoryRequest === request.id} onClick={() => reviewNewDirectoryRequest(request.id, 'rejected')} className="gap-1 text-destructive border-destructive/30 min-w-[92px]">
                      {reviewingNewDirectoryRequest === request.id ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Working…</> : <><XCircle className="w-3.5 h-3.5" /> Reject</>}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Submitted & test listings</p>
              {activeDynamicDirectoryListings.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 px-1">No active database-backed Directory listings.</p>
              ) : activeDynamicDirectoryListings.map(listing => (
                <div key={listing.id || listing.slug} className="glass rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-foreground">{listing.name}</p><Badge variant="outline" className={(listing.visibility || 'public') === 'preview_only' ? 'border-amber-400/40 text-amber-500' : 'border-green-400/40 text-green-500'}>{(listing.visibility || 'public') === 'preview_only' ? 'Preview only' : 'Public'}</Badge></div>
                    <p className="text-sm text-muted-foreground">County {listing.county} · /directory/{listing.slug}</p>
                    <p className="text-xs text-muted-foreground mt-1">Preview-only listings stay available for authenticated testing but are excluded from the external Directory.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => window.open(`/directory/${listing.slug}?preview=1`, '_blank', 'noopener,noreferrer')}><Eye className="w-3.5 h-3.5" /> Preview</Button>
                    <Button size="sm" variant="outline" className="gap-1" disabled={directoryVisibilityBusy === listing.slug} onClick={() => setDirectoryVisibility(listing, (listing.visibility || 'public') === 'preview_only' ? 'public' : 'preview_only')}>{directoryVisibilityBusy === listing.slug ? 'Updating…' : (listing.visibility || 'public') === 'preview_only' ? 'Make Public' : 'Hide from Public'}</Button>
                    <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30" disabled={removingDirectoryListing === listing.slug} onClick={() => removeDirectoryListing(listing)}>
                      <Trash2 className="w-3.5 h-3.5" /> {removingDirectoryListing === listing.slug ? 'Removing…' : 'Remove listing'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div id="directory-pending-claims" className="space-y-2 scroll-mt-24" data-directory-action="pending-claim" data-has-pending={pendingDirectoryClaims.length > 0 ? "true" : "false"}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Pending verification</p>
              {pendingDirectoryClaims.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 px-1">No directory claims are waiting for review.</p>
              ) : pendingDirectoryClaims.map(claim => {
                const identityComplete = directoryClaimIdentityLooksComplete(claim);
                const adminIdentityConfirmed = !!claim.identity_admin_confirmed_at;
                const sourceInvite = directoryInvitationUsedForClaim(claim);
                return (
                <div key={claim.id} aria-busy={reviewingDirectoryClaim === claim.id} className={`glass rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition ${reviewingDirectoryClaim === claim.id ? 'ring-2 ring-primary/35 bg-primary/5' : ''}`}>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{claim.listing_name_snapshot}</p>
                      <Badge variant="outline" className={identityComplete ? 'border-green-400/40 text-green-400' : 'border-destructive/40 text-destructive'}>
                        {adminIdentityConfirmed ? 'Private identity confirmed by Super Admin' : identityComplete ? 'Identity details supplied' : 'Identity incomplete'}
                      </Badge>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/30 p-3 mt-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Private identity for verification</p>
                      <p className="text-sm text-foreground mt-1"><strong>{claim.claimant_name || '(no personal name supplied)'}</strong> <span className="text-muted-foreground">· {claim.claimant_role || 'role not supplied'}</span></p>
                      <p className="text-xs text-muted-foreground break-all mt-1">Email: {claim.claimant_email || '—'} · Mobile: {claim.claimant_phone || '—'}</p>
                      <p className="text-[11px] text-muted-foreground mt-2">Email matching is supporting evidence only. Approval still requires an identifiable person and a usable mobile number.</p>
                    </div>
                    {sourceInvite && (() => {
                      const invitePhoneDigits = String(sourceInvite.contact_phone || '').replace(/\D/g, '');
                      const claimPhoneDigits = String(claim.claimant_phone || '').replace(/\D/g, '');
                      const invitePhoneMatches = invitePhoneDigits && claimPhoneDigits &&
                        invitePhoneDigits.slice(-9) === claimPhoneDigits.slice(-9);
                      const inviteWasUsedByClaimant = sourceInvite.status === 'used' &&
                        String(sourceInvite.used_by_user_id || '') === String(claim.claimant_user_id || '');
                      return (
                        <div className={`rounded-lg border p-3 mt-2 text-xs ${inviteWasUsedByClaimant ? 'border-green-400/25 bg-green-400/5' : 'border-amber-400/40 bg-amber-400/10'}`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{inviteWasUsedByClaimant ? 'Original secure invitation used' : 'Related secure invitation — not used for this claim'}</p>
                            {!inviteWasUsedByClaimant && !adminIdentityConfirmed && <Badge variant="outline" className="border-amber-400/50 text-amber-400">Check identity</Badge>}
                            {!inviteWasUsedByClaimant && adminIdentityConfirmed && <Badge variant="outline" className="border-green-400/40 text-green-400">Admin verified separately</Badge>}
                          </div>
                          <p className="text-muted-foreground mt-1">
                            Sent to: {sourceInvite.contact_name || '(name not recorded)'}
                            {sourceInvite.contact_email ? ` · ${sourceInvite.contact_email}` : ''}
                            {sourceInvite.contact_phone ? ` · ${sourceInvite.contact_phone}` : ''}
                          </p>
                          {!inviteWasUsedByClaimant && !adminIdentityConfirmed && <p className="text-amber-500 mt-1 font-medium">This pending claim was created without consuming that secure invitation, so do not assume the claimant is the invited person.</p>}
                          {!inviteWasUsedByClaimant && adminIdentityConfirmed && <p className="text-muted-foreground mt-1">The invitation was not used for this claim, but the private identity has since been independently confirmed by Super Admin.</p>}
                          {sourceInvite.contact_phone && claim.claimant_phone && !invitePhoneMatches && !adminIdentityConfirmed && (
                            <p className="text-destructive mt-1 font-medium">Mobile mismatch: invitation {sourceInvite.contact_phone} · claim {claim.claimant_phone}</p>
                          )}
                        </div>
                      );
                    })()}
                    {claim.claimant_message && <p className="text-xs text-muted-foreground mt-2">“{claim.claimant_message}”</p>}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {adminIdentityConfirmed ? (
                        <Badge variant="outline" className="border-green-400/40 text-green-400">Admin verification is the approval basis</Badge>
                      ) : (
                        <>
                          <Badge variant="outline" className={claim.email_match ? 'border-green-400/40 text-green-300' : 'border-border text-muted-foreground'}>Known email match: {claim.email_match ? 'Yes' : 'No'}</Badge>
                          <Badge variant="outline" className={claim.name_match ? 'border-green-400/40 text-green-300' : 'border-border text-muted-foreground'}>Imported contact name match: {claim.name_match ? 'Yes' : 'No'}</Badge>
                          <Badge variant="outline" className={claim.phone_match ? 'border-green-400/40 text-green-300' : 'border-border text-muted-foreground'}>Imported contact phone match: {claim.phone_match ? 'Yes' : 'No'}</Badge>
                        </>
                      )}
                      <Badge variant="outline">Public name: {claim.public_name_opt_out ? 'Keep private' : 'No opt-out'}</Badge>
                      <Badge variant="outline">Public mobile: {claim.public_phone_opt_out ? 'Keep private' : 'No opt-out'}</Badge>
                      <Badge variant="outline" className={claim.network_updates_opt_in ? 'border-primary/40 text-primary' : 'border-border text-muted-foreground'}>Network updates: {claim.network_updates_opt_in ? 'Opted in' : 'No'}</Badge>
                    </div>
                    {!identityComplete && <p className="text-xs text-destructive mt-2 font-medium">Approval is blocked until the claimant supplies their own full name and a valid mobile number.</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {reviewingDirectoryClaim === claim.id && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary" role="status" aria-live="polite"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving decision…</span>}
                    <Button size="sm" variant="outline" disabled={reviewingDirectoryClaim === claim.id} onClick={() => {
                      setEditingPendingDirectoryClaim(claim);
                      setPendingDirectoryIdentityForm({ fullName: claim.claimant_name || '', mobile: claim.claimant_phone || '' });
                    }} className="gap-1">
                      <Pencil className="w-3.5 h-3.5" /> Correct verification details
                    </Button>
                    <Button size="sm" disabled={reviewingDirectoryClaim === claim.id || !identityComplete} onClick={() => reviewDirectoryClaim(claim.id, 'approved')} className="gap-1 min-w-[164px]" title={!identityComplete ? 'A real full name and valid mobile number are required before approval' : undefined}>
                      {reviewingDirectoryClaim === claim.id ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Approving…</> : <><CheckCircle className="w-3.5 h-3.5" /> Approve directory only</>}
                    </Button>
                    <Button size="sm" variant="outline" disabled={reviewingDirectoryClaim === claim.id} onClick={() => reviewDirectoryClaim(claim.id, 'rejected')} className="gap-1 text-destructive border-destructive/30 min-w-[92px]">
                      {reviewingDirectoryClaim === claim.id ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Working…</> : <><XCircle className="w-3.5 h-3.5" /> Reject</>}
                    </Button>
                  </div>
                </div>
              );})}
            </div>

            <Dialog open={!!editingPendingDirectoryClaim} onOpenChange={open => { if (!open && !savingPendingDirectoryIdentity) setEditingPendingDirectoryClaim(null); }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Correct pending verification details</DialogTitle>
                  <DialogDescription>
                    Use this only after you have independently confirmed who the person is. Correcting the private identity does not approve the claim and does not change the club’s public contact label.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Real full name</Label>
                    <Input value={pendingDirectoryIdentityForm.fullName} onChange={e => setPendingDirectoryIdentityForm(v => ({ ...v, fullName:e.target.value }))} placeholder="First name and surname" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Private mobile / WhatsApp</Label>
                    <Input type="tel" value={pendingDirectoryIdentityForm.mobile} onChange={e => setPendingDirectoryIdentityForm(v => ({ ...v, mobile:e.target.value }))} />
                  </div>
                  <div className="rounded-lg border border-border bg-background/40 p-3 text-xs text-muted-foreground">
                    Account email: <strong className="text-foreground">{editingPendingDirectoryClaim?.claimant_email || '—'}</strong><br />
                    Club: <strong className="text-foreground">{editingPendingDirectoryClaim?.listing_name_snapshot || '—'}</strong>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditingPendingDirectoryClaim(null)} disabled={savingPendingDirectoryIdentity}>Cancel</Button>
                    <Button type="button" onClick={savePendingDirectoryIdentity} disabled={savingPendingDirectoryIdentity || !pendingDirectoryIdentityForm.fullName.trim() || !pendingDirectoryIdentityForm.mobile.trim()}>
                      {savingPendingDirectoryIdentity ? 'Saving…' : 'Save correction'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div id="directory-outstanding-invitations" className="space-y-2 scroll-mt-24">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Owner invitations awaiting acceptance {pendingDirectoryInvitations.length ? `· ${pendingDirectoryInvitations.length}` : ''}</p>
              {directoryInvitations.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 px-1">No active directory invitations are awaiting acceptance.</p>
              ) : directoryInvitations.map(invite => {
                const inviter = allUsers.find(u => u.id === invite.created_by_user_id);
                const recipient = invite.contact_name || invite.contact_email || invite.contact_phone || 'Unnamed recipient';
                const statusClass = invite.status === 'pending' ? 'border-amber-400/40 text-amber-300' : invite.status === 'used' ? 'border-green-400/40 text-green-300' : 'border-border text-muted-foreground';
                return (
                  <div key={invite.id} className="glass rounded-lg p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{invite.listing_name_snapshot || invite.listing_slug}</p>
                        <Badge variant="outline" className={statusClass}>{invite.used_by_user_id ? 'Ready for approval' : 'Awaiting recipient'}</Badge>
                        <Badge variant="outline">{invite.access_role === 'owner' ? 'Primary Owner' : 'Directory Editor'}</Badge>
                        <Badge variant="outline">{invite.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">To: {recipient}{invite.contact_email && recipient !== invite.contact_email ? ` · ${invite.contact_email}` : ''}{invite.contact_phone && recipient !== invite.contact_phone ? ` · ${invite.contact_phone}` : ''}</p>
                      <p className="text-xs text-muted-foreground">Created by: {inviter?.full_name || inviter?.display_name || inviter?.email || invite.created_by_user_id}</p>
                      {invite.expires_at && <p className="text-xs text-muted-foreground">Expires: {new Date(invite.expires_at).toLocaleString('en-IE')}</p>}
                      {invite.used_at && <p className="text-xs text-green-400">Accepted: {new Date(invite.used_at).toLocaleString('en-IE')}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {invite.used_by_user_id && <Button size="sm" disabled={approvingDirectoryInvitation === invite.id} onClick={() => approveDirectoryInvitation(invite.id, invite.access_role)} className="gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> {approvingDirectoryInvitation === invite.id ? 'Approving…' : `Approve Directory ${invite.access_role === 'owner' ? 'Owner' : 'Editor'}`}
                      </Button>}
                      <Button size="sm" variant="outline" disabled={resendInviteBusy === invite.id} onClick={() => prepareInvitationResend(invite)}>
                        {resendInviteBusy === invite.id ? 'Preparing…' : 'Review & Resend'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>


            {resendPreview && (
              <div className="glass rounded-xl p-4 border border-primary/30 space-y-3">
                <div><p className="font-semibold">Review & Resend · {resendPreview.clubName}</p><p className="text-xs text-muted-foreground">{resendPreview.accessRole === 'editor' ? 'Directory Editor' : 'Primary Owner'} · {resendPreview.channel === 'whatsapp' ? 'WhatsApp' : 'Email'} · fresh 72-hour secure link created</p></div>
                {resendPreview.channel === 'email' && <Input value={resendPreview.subject} onChange={e => setResendPreview(v => ({ ...v, subject: e.target.value }))} aria-label="Resend email subject" />}
                <textarea value={resendPreview.message} onChange={e => setResendPreview(v => ({ ...v, message: e.target.value }))} rows={18} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 font-sans" />
                <div className="flex flex-wrap gap-2">
                  {resendPreview.channel === 'email' ? <Button type="button" onClick={() => sendPreparedEmail(resendPreview, 'resend')} disabled={resendInviteBusy === resendPreview.invitationId} className="gap-2"><Mail className="w-4 h-4" /> {resendInviteBusy === resendPreview.invitationId ? 'Sending…' : 'Send reviewed email'}</Button> : <Button type="button" onClick={openResendWhatsApp} className="gap-2"><MessageCircle className="w-4 h-4" /> Open reviewed WhatsApp</Button>}
                  <Button type="button" variant="outline" onClick={() => setResendPreview(null)}>Close</Button>
                </div>
              </div>
            )}

            <div id="directory-verified-access" className="space-y-2 scroll-mt-24">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Verified directory owners & editors</p>
              {activeDirectoryAccesses.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 px-1">No directory editor access has been granted yet.</p>
              ) : activeDirectoryAccesses.map(access => {
                const accessUser = allUsers.find(u => u.id === access.user_id);
                return (
                  <div key={access.id} className="glass rounded-lg p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-foreground">{access.listing_name_snapshot || access.listing_slug}</p><Badge variant="outline">{access.role === 'owner' ? 'Primary Owner' : 'Directory Editor'}</Badge></div>
                      <p className="text-xs text-muted-foreground truncate">{accessUser?.full_name || accessUser?.display_name || accessUser?.email || access.user_id}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{directoryWelcomeEmail(access, accessUser) || 'No email'}{directoryWelcomePhone(access, accessUser) ? ` · ${directoryWelcomePhone(access, accessUser)}` : ''}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1" disabled={welcomeBusy === `email:${access.id}` || !directoryWelcomeEmail(access, accessUser)} onClick={() => sendDirectoryWelcomeAgain(access, accessUser)}>
                        <Mail className="w-3.5 h-3.5" /> {welcomeBusy === `email:${access.id}` ? 'Sending…' : 'Send welcome email'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1" disabled={!directoryWelcomePhone(access, accessUser)} onClick={() => openDirectoryWelcomeWhatsApp(access, accessUser)}>
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp welcome
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-destructive border-destructive/30" disabled={revokingDirectoryAccess === access.id} onClick={() => revokeDirectoryAccess(access.id)}>
                        {revokingDirectoryAccess === access.id ? 'Revoking…' : 'Revoke directory access'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── DIRECTORY CONTACT REGISTER ── */}
        <TabsContent value="directory-contacts" className="mt-4">
          <div className="space-y-5">
            <div className="glass rounded-xl p-4 sm:p-5 border border-primary/20">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-foreground">Private verified Directory contact register</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is the RallyHub record of the real people behind Directory ownership and editing access. It is separate from the public club contact label, so a club can publish “Chairperson”, “Rackets Coach” or “Club Contact” while RallyHub privately retains the verified person’s full name, email and mobile / WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="glass rounded-xl p-4"><p className="text-2xl font-black">{directoryContactRows.length}</p><p className="text-xs text-muted-foreground mt-1">Verified people</p></div>
              <div className="glass rounded-xl p-4"><p className="text-2xl font-black">{directoryContactsWithEmail}</p><p className="text-xs text-muted-foreground mt-1">With email</p></div>
              <div className="glass rounded-xl p-4"><p className="text-2xl font-black">{optedInDirectoryContacts}</p><p className="text-xs text-muted-foreground mt-1">Opted in to general/network updates</p></div>
            </div>

            <div className="glass rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h3 className="font-bold text-foreground">Directory owners & editors</h3>
                  <p className="text-xs text-muted-foreground mt-1">Search by real name, email, mobile, club, county, role or public contact label.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={copyDirectoryWhatsAppNumbers} disabled={!directoryContactRows.length} className="gap-2"><Copy className="w-4 h-4" /> Copy WhatsApp numbers</Button>
                  <Button type="button" variant="outline" onClick={downloadDirectoryContactsCsv} disabled={!directoryContactRows.length}>Export CSV</Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input value={directoryContactSearch} onChange={e => setDirectoryContactSearch(e.target.value)} placeholder="Search name, email, mobile or club…" className="pl-9" />
              </div>
              <p className="text-xs text-muted-foreground">Showing {filteredDirectoryContactRows.length} of {directoryContactRows.length} verified people.</p>

              {filteredDirectoryContactRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No verified Directory contacts match that search.</div>
              ) : (
                <div className="space-y-3">
                  {filteredDirectoryContactRows.map(row => {
                    const identityComplete = directoryClaimIdentityLooksComplete({ claimant_name: row.fullName, claimant_phone: row.mobile });
                    return (
                      <div key={row.userId} className="rounded-xl border border-border bg-background/25 p-4">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-foreground">{row.fullName || '(name needs correction)'}</p>
                              <Badge variant="outline" className={identityComplete ? 'border-green-400/40 text-green-400' : 'border-destructive/40 text-destructive'}>{identityComplete ? 'Verified identity recorded' : 'Identity needs correction'}</Badge>
                              {row.networkUpdatesOptIn && <Badge variant="outline" className="border-primary/40 text-primary">Network updates opt-in</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 break-all">{row.email || 'No email'}{row.mobile ? ` · ${row.mobile}` : ' · No mobile'}</p>
                            <div className="mt-3 space-y-2">
                              {row.clubs.map(club => (
                                <div key={`${row.userId}:${club.slug}`} className="rounded-lg border border-border/70 bg-background/30 px-3 py-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold">{club.name}</span>
                                    <Badge variant="outline">{club.role}</Badge>
                                    {club.county && <span className="text-xs text-muted-foreground">{club.county}</span>}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Public contact label: <strong className="text-foreground">{club.publicLabel || 'Not set'}</strong></p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <Button type="button" size="sm" variant="outline" onClick={() => openDirectoryContactEditor(row)} className="gap-1"><Pencil className="w-3.5 h-3.5" /> Edit private identity</Button>
                            <Button type="button" size="sm" variant="outline" disabled={!row.email} onClick={() => { if (row.email) window.location.href = `mailto:${row.email}`; }} className="gap-1"><Mail className="w-3.5 h-3.5" /> Email</Button>
                            <Button type="button" size="sm" variant="outline" disabled={!row.mobile} onClick={() => openDirectoryContactWhatsApp(row)} className="gap-1"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="glass rounded-xl p-4 sm:p-5 space-y-4 border border-primary/20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Directory broadcast email</p>
                <h3 className="text-lg font-bold text-foreground mt-1">Message verified Directory contacts</h3>
                <p className="text-sm text-muted-foreground mt-1">Each person receives an individual email; addresses are never exposed to other recipients. Send a test to yourself before the full broadcast.</p>
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <select value={directoryBroadcast.audience} onChange={e => setDirectoryBroadcast(v => ({ ...v, audience:e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="service">All verified owners & editors ({directoryContactsWithEmail}) — Directory/service messages only</option>
                  <option value="opted_in">Opted-in contacts only ({optedInDirectoryContacts}) — general/network updates</option>
                </select>
                <p className="text-xs text-muted-foreground">{directoryBroadcast.audience === 'service' ? 'Use this for messages necessary to operate or support the RallyHub Directory.' : 'Use this for broader RallyHub, club-network or promotional updates. Only contacts who opted in are included.'}</p>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={directoryBroadcast.subject} onChange={e => setDirectoryBroadcast(v => ({ ...v, subject:e.target.value }))} maxLength={180} placeholder="RallyHub Directory update" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <textarea value={directoryBroadcast.message} onChange={e => setDirectoryBroadcast(v => ({ ...v, message:e.target.value }))} rows={10} maxLength={6000} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 font-sans" placeholder={"Hi {{first_name}},\n\nA quick update from RallyHub…"} />
                <p className="text-xs text-muted-foreground">Optional personalisation: <code>{'{{first_name}}'}</code>, <code>{'{{name}}'}</code> and <code>{'{{clubs}}'}</code>.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => sendDirectoryBroadcast(true)} disabled={!!directoryBroadcastBusy || !directoryBroadcast.subject.trim() || !directoryBroadcast.message.trim()} className="gap-2"><Mail className="w-4 h-4" /> {directoryBroadcastBusy === 'test' ? 'Sending test…' : 'Send test to me'}</Button>
                <Button type="button" onClick={() => sendDirectoryBroadcast(false)} disabled={!!directoryBroadcastBusy || !directoryBroadcast.subject.trim() || !directoryBroadcast.message.trim()} className="gap-2"><Send className="w-4 h-4" /> {directoryBroadcastBusy === 'send' ? 'Sending broadcast…' : 'Send broadcast'}</Button>
              </div>
              <p className="text-xs text-muted-foreground">WhatsApp is not automatically broadcast by RallyHub. Use <strong>Copy WhatsApp numbers</strong> above for a manually managed WhatsApp broadcast list.</p>
            </div>

            <Dialog open={!!editingDirectoryContact} onOpenChange={open => { if (!open && !savingDirectoryIdentity) setEditingDirectoryContact(null); }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit private Directory identity</DialogTitle>
                  <DialogDescription>This is the verified person behind the Directory access. It does not change any public club contact label, public email or public phone number.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Full name</Label>
                    <Input value={directoryContactEditForm.fullName} onChange={e => setDirectoryContactEditForm(v => ({ ...v, fullName:e.target.value }))} placeholder="First name and surname" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Private mobile / WhatsApp</Label>
                    <Input type="tel" value={directoryContactEditForm.mobile} onChange={e => setDirectoryContactEditForm(v => ({ ...v, mobile:e.target.value }))} placeholder="e.g. 087 123 4567" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Account email</Label>
                    <Input value={editingDirectoryContact?.email || ''} readOnly className="bg-background/40 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Email is the signed-in account identity and is not changed from this contact editor.</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditingDirectoryContact(null)} disabled={savingDirectoryIdentity}>Cancel</Button>
                    <Button type="button" onClick={saveDirectoryContactIdentity} disabled={savingDirectoryIdentity || !directoryContactEditForm.fullName.trim() || !directoryContactEditForm.mobile.trim()}>{savingDirectoryIdentity ? 'Saving…' : 'Save private identity'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        {/* ── NATIONAL PLAYER NETWORK TAB ── */}
        <TabsContent value="directory-players" className="mt-4">
          <div className="space-y-5">
            <div className="glass rounded-xl p-4 sm:p-5 border border-primary/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground">National RallyHub player network</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-3xl">Players join this list from the public Directory. It is completely separate from Clare Pickleball membership and club records. Use only the channels each player explicitly opted into.</p>
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={() => window.open('/directory#player-network','_blank','noopener,noreferrer')} className="shrink-0 gap-2"><Eye className="w-4 h-4" /> View public signup</Button>
              </div>
            </div>

            <div className="glass rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h3 className="font-bold text-foreground">Opted-in players</h3>
                  <p className="text-xs text-muted-foreground mt-1">Search by name, email, mobile, club, county or DUPR. Unsubscribed records remain visible as a suppression record so they are not accidentally re-added to a campaign.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={copyDirectoryPlayerEmails} disabled={!activeDirectoryPlayerRows.some(row => row.emailOptIn && row.email)} className="gap-2"><Copy className="w-4 h-4" /> Copy opted-in emails</Button>
                  <Button type="button" variant="outline" onClick={copyDirectoryPlayerWhatsAppNumbers} disabled={!activeDirectoryPlayerRows.some(row => row.whatsappOptIn && row.mobile)} className="gap-2"><Copy className="w-4 h-4" /> Copy opted-in WhatsApp numbers</Button>
                  <Button type="button" variant="outline" onClick={downloadDirectoryPlayerCsv} disabled={!filteredDirectoryPlayerRows.length}>Export filtered CSV</Button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input value={directoryPlayerSearch} onChange={e => setDirectoryPlayerSearch(e.target.value)} placeholder="Search player, club, county, email, mobile or DUPR…" className="pl-9" />
              </div>
              <p className="text-xs text-muted-foreground">Showing {filteredDirectoryPlayerRows.length} of {directoryPlayerRows.length} player records · {activeDirectoryPlayerRows.length} currently active.</p>

              {filteredDirectoryPlayerRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No player sign-ups match that search yet.</div>
              ) : (
                <div className="space-y-3">
                  {filteredDirectoryPlayerRows.map(row => {
                    const rawDigits = String(row.mobile || '').replace(/\D/g,'');
                    const whatsappDigits = rawDigits.startsWith('00') ? rawDigits.slice(2) : rawDigits.startsWith('0') ? `353${rawDigits.slice(1)}` : rawDigits;
                    const active = row.status === 'active' && (row.emailOptIn || row.whatsappOptIn);
                    return <div key={row.id} className={`rounded-xl border p-4 ${active ? 'border-border bg-background/25' : 'border-border/60 bg-background/10 opacity-75'}`}>
                      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-foreground">{row.firstName || row.fullName || 'Player'}</p>
                            <Badge variant="outline" className={active ? 'border-green-400/40 text-green-400' : 'border-muted text-muted-foreground'}>{active ? 'Active' : 'Unsubscribed'}</Badge>
                            {row.emailOptIn && <Badge variant="outline" className="border-primary/40 text-primary">Email opt-in</Badge>}
                            {row.whatsappOptIn && <Badge variant="outline" className="border-green-500/40 text-green-500">WhatsApp opt-in</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground break-all">{row.email || 'No email'}{row.mobile ? ` · ${row.mobile}` : ' · No mobile'}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {row.clubName && <span className="rounded-full border border-border px-2.5 py-1">{row.clubName}</span>}
                            {row.county && <span className="rounded-full border border-border px-2.5 py-1">County {row.county}</span>}
                            {row.duprRating !== null && row.duprRating !== undefined && row.duprRating !== '' && <span className="rounded-full border border-border px-2.5 py-1">DUPR {Number(row.duprRating).toFixed(2)}</span>}
                          </div>
                          {row.consentAt && <p className="mt-2 text-[11px] text-muted-foreground">Consent/preferences recorded {new Date(row.consentAt).toLocaleString('en-IE')}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <Button type="button" size="sm" variant="outline" disabled={!active || !row.emailOptIn || !row.email} onClick={() => { if (row.emailOptIn && row.email) window.location.href=`mailto:${row.email}`; }} className="gap-1"><Mail className="w-3.5 h-3.5" /> Email</Button>
                          <Button type="button" size="sm" variant="outline" disabled={!active || !row.whatsappOptIn || !whatsappDigits} onClick={() => { if (row.whatsappOptIn && whatsappDigits) window.open(`https://wa.me/${whatsappDigits}`,'_blank','noopener,noreferrer'); }} className="gap-1"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</Button>
                        </div>
                      </div>
                    </div>;
                  })}
                </div>
              )}
            </div>

            <div className="glass rounded-xl p-4 text-xs leading-5 text-muted-foreground">
              <strong className="text-foreground">Distribution rule:</strong> email only players with Email opt-in; WhatsApp/SMS only players with WhatsApp opt-in. Never use unsubscribed records as a live audience. The CSV includes consent status so external mailing tools can apply the same rule.
            </div>
          </div>
        </TabsContent>

        {/* ── CLUB FEEDBACK TAB ── */}
        <TabsContent value="feedback" className="mt-4">
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-foreground">Club feedback & development wishlist</h3>
                <p className="text-xs text-muted-foreground mt-1">Feedback submitted by verified Directory owners and editors is kept here with the person, club, area and importance attached.</p>
              </div>
              <Button type="button" variant="outline" onClick={downloadFeedbackCsv} disabled={!clubFeedbackRows.length} className="shrink-0">Export CSV</Button>
            </div>
            {clubFeedbackRows.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">No club feedback has been submitted yet.</div>
            ) : (
              <div className="space-y-3">
                {clubFeedbackRows.map(row => (
                  <div key={row.id} className="glass rounded-xl p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{row.person_name || 'Club representative'}</p>
                          <Badge variant="outline">{row.club_name || row.listing_slug}</Badge>
                          <Badge variant="outline">{String(row.feedback_type || 'feedback').replaceAll('_',' ')}</Badge>
                          {row.importance === 'blocking' && <Badge className="bg-destructive/15 text-destructive">Blocking</Badge>}
                          {row.importance === 'important' && <Badge className="bg-amber-400/15 text-amber-500">Important</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{row.person_email} · {String(row.area || 'other').replaceAll('_',' ')}</p>
                        <p className="text-sm text-foreground mt-3 whitespace-pre-wrap">{row.message}</p>
                        <p className="text-[11px] text-muted-foreground mt-3">{row.submitted_at ? new Date(row.submitted_at).toLocaleString('en-IE') : ''}{row.device_type ? ` · ${row.device_type}` : ''}{row.contact_ok === false ? ' · Do not contact' : ' · Contact permitted'}</p>
                      </div>
                      <div className="w-full lg:w-44 shrink-0">
                        <Label className="text-xs">Status</Label>
                        <Select value={row.status || 'new'} onValueChange={value => updateFeedbackStatus(row, value)} disabled={updatingFeedbackId === row.id}>
                          <SelectTrigger className="mt-1 h-9 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="reviewing">Reviewing</SelectItem>
                            <SelectItem value="wishlist">Wishlist</SelectItem>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="in_progress">In progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              {filteredUsers.map((u, i) => {
                const isDirectoryOnly = u.account_scope === 'directory' || directoryOnlyUserIds.has(String(u.id));
                return (
                  <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="glass rounded-lg p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {(u.full_name || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{u.display_name || u.full_name || '(no name)'}</p>
                          {isDirectoryOnly && <Badge variant="outline" className="text-[9px] border-primary/30 text-primary shrink-0">Directory only</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        {isDirectoryOnly && <p className="text-[10px] text-muted-foreground mt-0.5">No RallyHub Club, tournament or tenant access</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() => { setEditingUser(u); setEditUserName(u.display_name || u.full_name || ''); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Select value={u.kotc_role || (u.role === 'admin' ? 'super_admin' : 'player')} onValueChange={value => setKotcRole(u.id, value)} disabled={isDirectoryOnly || updatingRole === u.id || u.id === user?.id}>
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
                            disabled={isDirectoryOnly || updatingRole === u.id}
                            title={isDirectoryOnly ? 'Directory-only accounts cannot be promoted without separate RallyHub Club/Tenant access' : undefined}
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
                );
              })}
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
                    {p.person_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-primary"
                        title="Open complete membership record"
                        onClick={() => {
                          setSelectedMembershipPersonId(p.person_id);
                          setMembershipSearch(p.full_name || '');
                          setSearchParams({ tab: 'membership' });
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
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

        {/* ── ASSET UPLOADER TAB — RallyHub Super Admin only ── */}
        <TabsContent value="assets" className="mt-4">
          <GlassCard>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Upload className="w-4 h-4 text-primary" /> RallyHub Asset Uploader</h3>
            <p className="mt-2 text-xs text-muted-foreground">Securely upload approved production artwork to RallyHub. This area is available only inside the platform Admin Panel.</p>
            <div className="mt-4 max-w-md"><Label className="text-xs text-muted-foreground">Asset name</Label><Input value={assetName} onChange={e=>setAssetName(e.target.value)} placeholder="e.g. About page hero" className="mt-1 bg-secondary border-border" /></div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Upload className="mr-2 h-4 w-4" />{assetUploading ? 'Uploading…' : 'Upload approved asset'}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={assetUploading} onChange={e=>uploadSiteAsset(e.target.files?.[0])}/>
              </label>
              {assetUploadUrl && <Badge className="bg-green-500/15 text-green-500"><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Uploaded & stored</Badge>}
            </div>
            {assetUploadUrl && <div className="mt-3 break-all rounded-md bg-secondary p-3 text-[11px] text-muted-foreground">{assetUploadUrl}</div>}
          </GlassCard>
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