import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  AlertTriangle, CheckCircle2, ClipboardCopy, Columns3, Download, ExternalLink, FileText, Filter, Link2,
  Mail, MessageCircle, Pencil, Plus, Printer, RefreshCw, Save, Search, ShieldCheck, Users, WalletCards, X
} from 'lucide-react';

const EMPTY_FILTERS = { membershipStatus: 'all', paymentStatus: 'all', account: 'all', quality: 'all', sport: 'all' };

const label = value => String(value || '')
  .replaceAll('_', ' ')
  .replace(/\b\w/g, c => c.toUpperCase());

const parseJson = (value, fallback = {}) => {
  try { return JSON.parse(value || '{}'); } catch { return fallback; }
};

const money = (value, currency = 'EUR') => {
  if (value === null || value === undefined || value === '') return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(value) || 0);
  } catch {
    return `${currency} ${Number(value) || 0}`;
  }
};

const cellValue = (row, key, currency) => {
  const value = row?.[key];
  if (key === 'membership_fee') return money(value, currency);
  if (key === 'linked') return value ? 'Linked' : 'Not linked';
  if (key === 'quality_count') return Number(value || 0) === 0 ? 'Complete' : String(value);
  if (['membership_status', 'payment_status', 'membership_type', 'relationship_type'].includes(key)) return label(value);
  if (key === 'external_rating' && value !== null && value !== undefined && value !== '') return Number(value).toFixed(2);
  return value ?? '—';
};

function StatCard({ title, value, icon: Icon, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass rounded-xl p-4 text-left transition hover:border-primary/40 ${active ? 'ring-1 ring-primary/40 bg-primary/5' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        {Icon ? <Icon className="w-4 h-4 text-primary" /> : null}
      </div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </button>
  );
}

function Info({ title, value, sensitive = false }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {title}{sensitive ? ' · private' : ''}
      </div>
      <div className="mt-0.5 text-sm break-words">{value || '—'}</div>
    </div>
  );
}

export default function MembershipConsole() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManage = user?.role === 'admin' || user?.active_club_role === 'club_admin';

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortField, setSortField] = useState('full_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [visibleFields, setVisibleFields] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [personId, setPersonId] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applicationBusyId, setApplicationBusyId] = useState('');
  const [editPerson, setEditPerson] = useState({});
  const [editMembership, setEditMembership] = useState({});
  const [editSports, setEditSports] = useState([]);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [qualificationOpen, setQualificationOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    full_name: '', primary_email: '', mobile: '', date_of_birth: '', member_id: '',
    membership_season: '', membership_type: '', membership_status: 'pending_payment',
    relationship_type: 'member', payment_status: 'pending', membership_fee: '',
    join_date: '', emergency_contact_name: '', emergency_contact_relationship: '', emergency_mobile: '',
    sport_ids: []
  });
  const [training, setTraining] = useState({ trainingName: '', sportId: '', status: 'completed', completionDate: '', provider: '', levelCategory: '', notes: '' });
  const [qualification, setQualification] = useState({ title: '', sportId: '', verificationStatus: 'unverified', level: '', governingBody: '', awardDate: '', expiryDate: '', notes: '' });

  const { data: meta = {}, isLoading: metaLoading } = useQuery({
    queryKey: ['membership-console-meta', user?.active_tenant_id, user?.active_club_id],
    queryFn: async () => {
      const response = await base44.functions.invoke('membershipRecord', { action: 'admin_meta' });
      if (response.data?.error) throw new Error(response.data.error);
      return response.data || {};
    },
    enabled: canManage
  });

  const { data: listData = { rows: [], counts: {} }, isLoading: listLoading, refetch: refetchList } = useQuery({
    queryKey: ['membership-console-list', user?.active_tenant_id, user?.active_club_id],
    queryFn: async () => {
      const response = await base44.functions.invoke('membershipRecord', { action: 'admin_list' });
      if (response.data?.error) throw new Error(response.data.error);
      return response.data || { rows: [], counts: {} };
    },
    enabled: canManage
  });

  const { data: applicationData = { applications: [], counts: {} }, isLoading: applicationsLoading, refetch: refetchApplications } = useQuery({
    queryKey: ['membership-applications', user?.active_tenant_id, user?.active_club_id],
    queryFn: async () => {
      const response = await base44.functions.invoke('membershipApplication', { action: 'admin_list' });
      if (response.data?.error) throw new Error(response.data.error);
      return response.data || { applications: [], counts: {} };
    },
    enabled: canManage,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
  });

  const { data: detail = null, isLoading: detailLoading, refetch: refetchDetail } = useQuery({
    queryKey: ['membership-console-detail', personId, user?.active_tenant_id, user?.active_club_id],
    queryFn: async () => {
      const response = await base44.functions.invoke('membershipRecord', { action: 'admin_detail', personId });
      if (response.data?.error) throw new Error(response.data.error);
      return response.data?.record || null;
    },
    enabled: canManage && !!personId
  });

  useEffect(() => {
    if (!meta.fieldCatalog?.length || visibleFields.length) return;
    const defaultView = (meta.savedViews || []).find(view => view.is_default);
    if (defaultView) {
      setVisibleFields(defaultView.visible_fields?.length ? defaultView.visible_fields : meta.fieldCatalog.filter(f => f.default).map(f => f.key));
      setFilters({ ...EMPTY_FILTERS, ...parseJson(defaultView.filters_json, {}) });
      setSortField(defaultView.sort_field || 'full_name');
      setSortDirection(defaultView.sort_direction || 'asc');
    } else {
      setVisibleFields(meta.fieldCatalog.filter(field => field.default).map(field => field.key));
    }
  }, [meta.fieldCatalog, meta.savedViews, visibleFields.length]);

  useEffect(() => {
    if (!detail || !editOpen) return;
    setEditPerson({ ...detail.person });
    setEditMembership({ ...detail.membership, membership_category: detail.relationship?.membership_category || '' });
    setEditSports((meta.sports || []).map(sport => {
      const existing = (detail.sportProfiles || []).find(profile => String(profile.sport_id) === String(sport.id));
      const ratingMeta = parseJson(existing?.rating_metadata_json, {});
      return existing ? {
        ...existing,
        rating_system: existing.rating_system || sport.settings?.rating?.system || '',
        external_rating_id: existing.external_rating_id || existing.dupr_id || '',
        rating_value: existing.rating_value ?? existing.dupr_doubles_rating ?? existing.dupr_rating ?? '',
        rating_metadata: {
          ...ratingMeta,
          ...(ratingMeta.singles === undefined && existing.dupr_singles_rating !== undefined ? { singles: existing.dupr_singles_rating } : {}),
          ...(ratingMeta.doubles === undefined && existing.dupr_doubles_rating !== undefined ? { doubles: existing.dupr_doubles_rating } : {})
        }
      } : {
        sport_id: sport.id,
        status: 'active',
        experience_type: 'current',
        skill_level: '',
        playing_category: '',
        preferred_side: '',
        rating_system: sport.settings?.rating?.system || '',
        external_rating_id: '',
        rating_value: '',
        rating_metadata: {},
        notes: ''
      };
    }));
  }, [detail, editOpen, meta.sports]);

  useEffect(() => {
    if (!meta.defaults && !(meta.sports || []).length) return;
    setNewMember(previous => {
      const sportIds = previous.sport_ids?.length
        ? previous.sport_ids
        : (meta.sports || []).filter(sport => sport.is_primary).map(sport => String(sport.id));
      return {
        ...previous,
        membership_season: previous.membership_season || meta.defaults?.membership_season || '',
        membership_fee: previous.membership_fee === '' && meta.defaults?.membership_fee != null ? String(meta.defaults.membership_fee) : previous.membership_fee,
        sport_ids: sportIds
      };
    });
  }, [meta.defaults, meta.sports]);

  const currency = meta.gateways?.find(g => g.is_default)?.currency || meta.gateways?.[0]?.currency || 'EUR';
  const gateway = meta.gateways?.find(g => g.is_default) || meta.gateways?.[0] || null;
  const primarySport = meta.sports?.find(s => s.is_primary) || meta.sports?.[0] || null;

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const result = (listData.rows || []).filter(row => {
      if (needle && ![
        row.full_name, row.email, row.mobile, row.member_id, row.external_rating_id, row.primary_sport,
        ...(row.alternate_names || [])
      ].some(value => String(value || '').toLowerCase().includes(needle))) return false;
      if (filters.membershipStatus !== 'all' && row.membership_status !== filters.membershipStatus) return false;
      if (filters.paymentStatus !== 'all' && row.payment_status !== filters.paymentStatus) return false;
      if (filters.account === 'linked' && !row.linked) return false;
      if (filters.account === 'unlinked' && row.linked) return false;
      if (filters.quality === 'issues' && Number(row.quality_count || 0) === 0) return false;
      if (filters.quality === 'complete' && Number(row.quality_count || 0) > 0) return false;
      if (filters.quality === 'duplicates' && !(row.quality_issues || []).includes('duplicate_review')) return false;
      if (filters.sport !== 'all' && !(row.sport_profiles || []).some(profile => String(profile.sport_id) === String(filters.sport))) return false;
      return true;
    });
    result.sort((a, b) => {
      const av = a?.[sortField];
      const bv = b?.[sortField];
      const comparison = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true, sensitivity: 'base' });
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    return result;
  }, [listData.rows, search, filters, sortField, sortDirection]);

  const exportRows = useMemo(() => selected.size ? rows.filter(row => selected.has(row.person_id)) : rows, [rows, selected]);

  if (!canManage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <ShieldCheck className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="font-semibold mt-3">Membership administrator access required</p>
        </div>
      </div>
    );
  }

  const openMember = row => {
    setPersonId(row.person_id);
    setDetailOpen(true);
  };

  const applyQuickFilter = name => {
    if (name === 'active') setFilters({ ...EMPTY_FILTERS, membershipStatus: 'paid_active' });
    else if (name === 'pending') setFilters({ ...EMPTY_FILTERS, membershipStatus: 'pending_payment' });
    else if (name === 'unpaid') setFilters({ ...EMPTY_FILTERS, paymentStatus: 'pending' });
    else if (name === 'issues') setFilters({ ...EMPTY_FILTERS, quality: 'issues' });
    else setFilters(EMPTY_FILTERS);
  };

  const toggleSelected = id => {
    setSelected(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(previous => previous.size === rows.length && rows.length
      ? new Set()
      : new Set(rows.map(row => row.person_id)));
  };

  const applySavedView = view => {
    setVisibleFields(view.visible_fields?.length ? view.visible_fields : meta.fieldCatalog.filter(f => f.default).map(f => f.key));
    setFilters({ ...EMPTY_FILTERS, ...parseJson(view.filters_json, {}) });
    setSortField(view.sort_field || 'full_name');
    setSortDirection(view.sort_direction || 'asc');
    toast.success(`View “${view.name}” applied`);
  };

  const saveView = async () => {
    const name = window.prompt('Name this membership view');
    if (!name?.trim()) return;
    try {
      const response = await base44.functions.invoke('membershipRecord', {
        action: 'admin_save_view',
        name: name.trim(),
        visibleFields,
        filters,
        sortField,
        sortDirection
      });
      if (response.data?.error) throw new Error(response.data.error);
      await queryClient.invalidateQueries({ queryKey: ['membership-console-meta'] });
      toast.success('Membership view saved');
    } catch (error) {
      toast.error(error?.message || 'Could not save view');
    }
  };

  const updateRecord = async () => {
    setSaving(true);
    try {
      const response = await base44.functions.invoke('membershipRecord', {
        action: 'admin_update',
        personId,
        person: editPerson,
        membership: editMembership,
        sportProfiles: editSports,
        reason: 'Updated in Membership Console'
      });
      if (response.data?.error) throw new Error(response.data.error);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['membership-console-list'] }),
        queryClient.invalidateQueries({ queryKey: ['membership-console-detail', personId] }),
        queryClient.invalidateQueries({ queryKey: ['admin-membership-records'] }),
        queryClient.invalidateQueries({ queryKey: ['players'] })
      ]);
      setEditOpen(false);
      toast.success('Membership record updated');
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || 'Could not update member');
    } finally {
      setSaving(false);
    }
  };

  const createMember = async () => {
    if (!newMember.full_name.trim()) return toast.error('Enter the member name');
    setSaving(true);
    try {
      const response = await base44.functions.invoke('membershipRecord', { action: 'admin_create_member', member: newMember });
      if (response.data?.error) throw new Error(response.data.error);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['membership-console-list'] }),
        queryClient.invalidateQueries({ queryKey: ['membership-console-meta'] }),
        queryClient.invalidateQueries({ queryKey: ['players'] })
      ]);
      setAddMemberOpen(false);
      setNewMember({
        full_name: '', primary_email: '', mobile: '', date_of_birth: '', member_id: '',
        membership_season: meta.defaults?.membership_season || '', membership_type: '',
        membership_status: 'pending_payment', relationship_type: 'member', payment_status: 'pending',
        membership_fee: meta.defaults?.membership_fee != null ? String(meta.defaults.membership_fee) : '',
        join_date: '', emergency_contact_name: '', emergency_contact_relationship: '', emergency_mobile: '',
        sport_ids: (meta.sports || []).filter(sport => sport.is_primary).map(sport => String(sport.id))
      });
      toast.success(response.data?.reusedExistingPerson ? 'Membership added to the existing RallyHub person' : 'Member added');
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || 'Could not add member');
    } finally {
      setSaving(false);
    }
  };

  const connectAccount = async () => {
    if (!personId) return;
    setSaving(true);
    try {
      const candidateResponse = await base44.functions.invoke('membershipRecord', { action: 'admin_account_candidate', personId });
      if (candidateResponse.data?.error) throw new Error(candidateResponse.data.error);
      if (candidateResponse.data?.alreadyLinked) {
        toast.success('This member is already linked to a RallyHub account');
        return;
      }
      const candidates = candidateResponse.data?.candidates || [];
      if (!candidates.length) {
        toast.info('No RallyHub account currently matches this member email');
        return;
      }
      if (candidates.length > 1) {
        toast.error('More than one RallyHub account matches this email. Review the user accounts before linking.');
        return;
      }
      const candidate = candidates[0];
      const recordName = detail?.person?.full_name || '';
      const candidateName = candidate.full_name || '';
      let verifyDateOfBirth = '';
      let verifyMobile = '';
      if (recordName && candidateName && recordName.trim().toLowerCase() !== candidateName.trim().toLowerCase()) {
        const factor = window.prompt('The RallyHub account name is "' + candidateName + '" but the member record is "' + recordName + '". Enter the member\'s date of birth (YYYY-MM-DD) or mobile number to verify the link.');
        if (!factor) return;
        if (/^\d{4}-\d{2}-\d{2}$/.test(factor.trim())) verifyDateOfBirth = factor.trim();
        else verifyMobile = factor.trim();
      }
      if (!window.confirm('Link ' + candidate.email + ' to ' + (recordName || 'this member') + '? This grants member access to the active club.')) return;
      const response = await base44.functions.invoke('membershipRecord', {
        action: 'admin_connect_account', personId, userId: candidate.id, verifyDateOfBirth, verifyMobile
      });
      if (response.data?.error) throw new Error(response.data.error);
      await Promise.all([
        refetchDetail(),
        queryClient.invalidateQueries({ queryKey: ['membership-console-list'] }),
        queryClient.invalidateQueries({ queryKey: ['pending-approval-count'] })
      ]);
      toast.success('RallyHub account linked to the existing member');
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || 'Could not link account');
    } finally {
      setSaving(false);
    }
  };

  const createMembershipPayment = async () => {
    if (!personId) return;
    setSaving(true);
    try {
      const response = await base44.functions.invoke('membershipRecord', { action: 'admin_create_membership_payment', personId });
      if (response.data?.error) throw new Error(response.data.error);
      const payment = response.data?.payment;
      if (payment?.checkout_url) {
        try {
          await navigator.clipboard.writeText(payment.checkout_url);
          toast.success(response.data?.reused ? 'Existing payment link copied' : 'Membership payment link created and copied');
        } catch {
          window.prompt('Copy this membership payment link', payment.checkout_url);
        }
      }
      await Promise.all([
        refetchDetail(),
        queryClient.invalidateQueries({ queryKey: ['membership-console-list'] })
      ]);
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || 'Could not create payment link');
    } finally {
      setSaving(false);
    }
  };

  const verifyMembershipPayment = async () => {
    if (!personId) return;
    setSaving(true);
    try {
      const response = await base44.functions.invoke('membershipRecord', { action: 'admin_verify_membership_payment', personId });
      if (response.data?.error) throw new Error(response.data.error);
      await Promise.all([
        refetchDetail(),
        queryClient.invalidateQueries({ queryKey: ['membership-console-list'] })
      ]);
      toast.success(response.data?.status === 'paid' ? 'Membership payment confirmed and membership activated' : 'Payment status: ' + label(response.data?.status || 'pending'));
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || 'Could not verify membership payment');
    } finally {
      setSaving(false);
    }
  };

  const runApplicationAction = async (application, action, channel = '') => {
    if (!application?.id) return;
    setApplicationBusyId(application.id);
    try {
      const response = await base44.functions.invoke('membershipApplication', {
        action,
        applicationId: application.id,
        ...(channel ? { channel } : {})
      });
      if (response.data?.error) throw new Error(response.data.error);
      if (channel === 'whatsapp' && response.data?.message) {
        try {
          await navigator.clipboard.writeText(response.data.message);
          toast.success('WhatsApp reminder copied');
        } catch {
          window.prompt('Copy this WhatsApp reminder', response.data.message);
        }
      } else if (action === 'admin_send_reminder') {
        toast.success('Payment reminder email sent');
      } else if (action === 'admin_verify_payment') {
        toast.success(response.data?.application?.paymentStatus === 'paid' ? 'Payment confirmed and membership activated' : 'Payment status checked');
      } else if (action === 'admin_resend_confirmation') {
        toast.success('Membership confirmation resent');
      } else if (action === 'admin_mark_no_response') {
        toast.success('Application marked no response');
      }
      await Promise.all([
        refetchApplications(),
        queryClient.invalidateQueries({ queryKey: ['membership-console-list'] }),
        queryClient.invalidateQueries({ queryKey: ['membership-application-attention-count'] })
      ]);
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || 'Could not update membership application');
    } finally {
      setApplicationBusyId('');
    }
  };

  const copyApplicationPaymentLink = async application => {
    if (!application?.paymentUrl) return;
    try {
      await navigator.clipboard.writeText(application.paymentUrl);
      toast.success('Membership payment link copied');
    } catch {
      window.prompt('Copy this membership payment link', application.paymentUrl);
    }
  };

  const addTraining = async () => {
    if (!training.trainingName.trim()) return toast.error('Enter the training name');
    setSaving(true);
    try {
      const response = await base44.functions.invoke('membershipRecord', { action: 'admin_add_training', personId, ...training });
      if (response.data?.error) throw new Error(response.data.error);
      await refetchDetail();
      setTrainingOpen(false);
      setTraining({ trainingName: '', sportId: '', status: 'completed', completionDate: '', provider: '', levelCategory: '', notes: '' });
      toast.success('Training record added');
    } catch (error) {
      toast.error(error?.message || 'Could not add training');
    } finally {
      setSaving(false);
    }
  };

  const addQualification = async () => {
    if (!qualification.title.trim()) return toast.error('Enter the qualification title');
    setSaving(true);
    try {
      const response = await base44.functions.invoke('membershipRecord', { action: 'admin_add_qualification', personId, ...qualification });
      if (response.data?.error) throw new Error(response.data.error);
      await refetchDetail();
      setQualificationOpen(false);
      setQualification({ title: '', sportId: '', verificationStatus: 'unverified', level: '', governingBody: '', awardDate: '', expiryDate: '', notes: '' });
      toast.success('Qualification added');
    } catch (error) {
      toast.error(error?.message || 'Could not add qualification');
    } finally {
      setSaving(false);
    }
  };

  const activeFields = (meta.fieldCatalog || []).filter(field => visibleFields.includes(field.key));

  const exportExcel = () => {
    const escape = value => String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const table = `<html><head><meta charset="UTF-8"></head><body><table border="1"><tr>${activeFields.map(f => `<th>${escape(f.label)}</th>`).join('')}</tr>${exportRows.map(row => `<tr>${activeFields.map(f => `<td>${escape(cellValue(row, f.key, currency))}</td>`).join('')}</tr>`).join('')}</table></body></html>`;
    const blob = new Blob([table], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(meta.club?.name || 'RallyHub').replace(/[^a-z0-9]+/gi, '_')}_Membership_${new Date().toISOString().slice(0, 10)}.xls`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const documentPdf = new jsPDF({ orientation: activeFields.length > 7 ? 'landscape' : 'portrait' });
    documentPdf.setFontSize(16);
    documentPdf.text(meta.club?.name || 'RallyHub', 14, 15);
    documentPdf.setFontSize(11);
    documentPdf.text('Membership Report', 14, 22);
    documentPdf.setFontSize(8);
    documentPdf.text(`Generated ${new Date().toLocaleString()} · ${exportRows.length} records`, 14, 28);
    autoTable(documentPdf, {
      startY: 33,
      head: [activeFields.map(field => field.label)],
      body: exportRows.map(row => activeFields.map(field => String(cellValue(row, field.key, currency) ?? ''))),
      styles: { fontSize: 7, cellPadding: 1.8 },
      headStyles: { fontStyle: 'bold' }
    });
    documentPdf.save(`${(meta.club?.name || 'RallyHub').replace(/[^a-z0-9]+/gi, '_')}_Membership_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const printReport = () => {
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (!popup) return toast.error('Allow pop-ups to print the report');
    const logo = meta.club?.logo_url ? `<img src="${meta.club.logo_url}" style="height:56px;max-width:90px;object-fit:contain">` : '';
    popup.document.write(`<!doctype html><html><head><title>Membership Report</title><style>
      body{font-family:Arial,sans-serif;color:#111;padding:24px}header{display:flex;align-items:center;gap:16px;margin-bottom:18px}
      h1{font-size:20px;margin:0}p{margin:3px 0;color:#555;font-size:12px}table{width:100%;border-collapse:collapse;font-size:10px}
      th,td{border:1px solid #ccc;padding:5px;text-align:left;vertical-align:top}th{background:#f3f5f7}
      @page{size:${activeFields.length > 7 ? 'landscape' : 'portrait'};margin:12mm}</style></head><body>
      <header>${logo}<div><h1>${meta.club?.name || 'RallyHub'} · Membership Report</h1><p>Generated ${new Date().toLocaleString()} · ${exportRows.length} records</p></div></header>
      <table><thead><tr>${activeFields.map(f => `<th>${f.label}</th>`).join('')}</tr></thead><tbody>
      ${exportRows.map(row => `<tr>${activeFields.map(f => `<td>${cellValue(row, f.key, currency)}</td>`).join('')}</tr>`).join('')}
      </tbody></table></body></html>`);
    popup.document.close();
    setTimeout(() => popup.print(), 300);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Membership Console"
        description={meta.club?.name ? `${meta.club.name} · canonical membership, sport and payment records` : 'Tenant membership administration'}
      >
        <div className="flex flex-wrap items-center gap-2">
          {gateway ? <Badge variant="outline" className="gap-1.5"><WalletCards className="w-3 h-3" />{label(gateway.provider)} · {label(gateway.status)}</Badge> : null}
          {applicationData.publicUrl ? <a href={applicationData.publicUrl} target="_blank" rel="noreferrer"><Button variant="outline" size="sm"><ExternalLink className="w-3.5 h-3.5 mr-1.5" />Membership form</Button></a> : null}
          <Button size="sm" onClick={() => setAddMemberOpen(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Add member</Button>
          <Button variant="outline" size="sm" onClick={() => { refetchList(); refetchApplications(); queryClient.invalidateQueries({ queryKey: ['membership-console-meta'] }); }}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh
          </Button>
        </div>
      </PageHeader>

      {(metaLoading || listLoading) ? (
        <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">Loading membership console…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <StatCard title="All records" value={listData.counts?.total ?? rows.length} icon={Users} onClick={() => applyQuickFilter('all')} />
            <StatCard title="Active" value={listData.counts?.active ?? 0} icon={CheckCircle2} onClick={() => applyQuickFilter('active')} active={filters.membershipStatus === 'paid_active'} />
            <StatCard title="Pending" value={listData.counts?.pending ?? 0} icon={WalletCards} onClick={() => applyQuickFilter('pending')} active={filters.membershipStatus === 'pending_payment'} />
            <StatCard title="Payment due" value={listData.counts?.unpaid ?? 0} icon={WalletCards} onClick={() => applyQuickFilter('unpaid')} active={filters.paymentStatus === 'pending'} />
            <StatCard title="Profile issues" value={listData.counts?.incomplete ?? 0} icon={AlertTriangle} onClick={() => applyQuickFilter('issues')} active={filters.quality === 'issues'} />
            <StatCard title="Linked accounts" value={listData.counts?.linked ?? 0} icon={Link2} onClick={() => setFilters({ ...EMPTY_FILTERS, account: 'linked' })} active={filters.account === 'linked'} />
          </div>

          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex flex-col xl:flex-row xl:items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, mobile, membership ID or rating ID…" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filters.membershipStatus} onValueChange={value => setFilters(f => ({ ...f, membershipStatus: value }))}>
                  <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All membership</SelectItem>{(meta.membershipStatuses || []).map(value => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filters.paymentStatus} onValueChange={value => setFilters(f => ({ ...f, paymentStatus: value }))}>
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All payments</SelectItem>{(meta.paymentStatuses || []).map(value => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filters.sport} onValueChange={value => setFilters(f => ({ ...f, sport: value }))}>
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All sports</SelectItem>{(meta.sports || []).map(sport => <SelectItem key={sport.id} value={String(sport.id)}>{sport.name}</SelectItem>)}</SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild><Button variant="outline"><Filter className="w-4 h-4 mr-1.5" />More</Button></PopoverTrigger>
                  <PopoverContent align="end" className="w-72 space-y-3">
                    <div><Label>RallyHub account</Label><Select value={filters.account} onValueChange={value => setFilters(f => ({ ...f, account: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="linked">Linked</SelectItem><SelectItem value="unlinked">Not linked</SelectItem></SelectContent></Select></div>
                    <div><Label>Data quality</Label><Select value={filters.quality} onValueChange={value => setFilters(f => ({ ...f, quality: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="complete">Complete</SelectItem><SelectItem value="issues">Needs attention</SelectItem><SelectItem value="duplicates">Duplicate review</SelectItem></SelectContent></Select></div>
                    <Button variant="outline" className="w-full" onClick={() => { setFilters(EMPTY_FILTERS); setSearch(''); }}><X className="w-3.5 h-3.5 mr-1.5" />Clear filters</Button>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild><Button variant="outline"><Columns3 className="w-4 h-4 mr-1.5" />Columns</Button></PopoverTrigger>
                  <PopoverContent align="end" className="w-80 max-h-[420px] overflow-y-auto">
                    <p className="text-xs font-semibold mb-2">Visible fields</p>
                    <div className="space-y-1.5">
                      {(meta.fieldCatalog || []).map(field => (
                        <label key={field.key} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary cursor-pointer">
                          <Checkbox checked={visibleFields.includes(field.key)} onCheckedChange={checked => setVisibleFields(previous => checked ? [...new Set([...previous, field.key])] : previous.filter(key => key !== field.key))} />
                          <span className="text-xs flex-1">{field.label}</span>
                          {field.sensitive ? <span className="text-[9px] text-amber-600">Sensitive</span> : null}
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Select value={sortField} onValueChange={setSortField}><SelectTrigger className="w-[170px] h-9"><SelectValue /></SelectTrigger><SelectContent>{(meta.fieldCatalog || []).map(field => <SelectItem key={field.key} value={field.key}>Sort: {field.label}</SelectItem>)}</SelectContent></Select>
                <Button variant="outline" size="sm" onClick={() => setSortDirection(direction => direction === 'asc' ? 'desc' : 'asc')}>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</Button>
                {(meta.savedViews || []).length ? (
                  <Select onValueChange={id => { const view = meta.savedViews.find(item => String(item.id) === id); if (view) applySavedView(view); }}>
                    <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Saved views" /></SelectTrigger>
                    <SelectContent>{meta.savedViews.map(view => <SelectItem key={view.id} value={String(view.id)}>{view.name}{view.is_default ? ' · default' : ''}</SelectItem>)}</SelectContent>
                  </Select>
                ) : null}
                <Button variant="outline" size="sm" onClick={saveView}><Save className="w-3.5 h-3.5 mr-1.5" />Save view</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={exportExcel}><Download className="w-3.5 h-3.5 mr-1.5" />Excel</Button>
                <Button variant="outline" size="sm" onClick={exportPdf}><FileText className="w-3.5 h-3.5 mr-1.5" />PDF</Button>
                <Button variant="outline" size="sm" onClick={printReport}><Printer className="w-3.5 h-3.5 mr-1.5" />Print</Button>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div><p className="font-semibold">Membership records</p><p className="text-xs text-muted-foreground">{rows.length} shown · {selected.size ? `${selected.size} selected` : 'exports use current filtered view'}</p></div>
              {primarySport ? <p className="text-xs text-muted-foreground">Primary sport: <strong className="text-foreground">{primarySport.name}</strong></p> : null}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="w-10"><Checkbox checked={rows.length > 0 && selected.size === rows.length} onCheckedChange={toggleAll} /></TableHead>
                  {activeFields.map(field => <TableHead key={field.key} className="whitespace-nowrap">{field.label}</TableHead>)}
                  <TableHead className="text-right">Open</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {!rows.length ? <TableRow><TableCell colSpan={activeFields.length + 2} className="text-center py-10 text-muted-foreground">No membership records match this view.</TableCell></TableRow> :
                    rows.map(row => (
                      <TableRow key={row.person_id} className="hover:bg-secondary/40">
                        <TableCell><Checkbox checked={selected.has(row.person_id)} onCheckedChange={() => toggleSelected(row.person_id)} /></TableCell>
                        {activeFields.map(field => (
                          <TableCell key={field.key} className={field.key === 'full_name' ? 'font-semibold whitespace-nowrap' : 'text-xs whitespace-nowrap'}>
                            {field.key === 'membership_status' ? <Badge variant="outline">{label(row.membership_status)}</Badge> :
                              field.key === 'payment_status' ? <Badge variant="outline">{label(row.payment_status)}</Badge> :
                              field.key === 'linked' ? (row.linked ? <Badge className="bg-primary/15 text-primary">Linked</Badge> : <Badge variant="outline">Not linked</Badge>) :
                              field.key === 'quality_count' ? (row.quality_count ? <Badge className="bg-amber-500/15 text-amber-700">{row.quality_count} issue{row.quality_count === 1 ? '' : 's'}</Badge> : <Badge variant="outline" className="text-green-700">Complete</Badge>) :
                              cellValue(row, field.key, currency)}
                          </TableCell>
                        ))}
                        <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => openMember(row)}>View</Button></TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader><SheetTitle>{detail?.person?.full_name || 'Member record'}</SheetTitle><SheetDescription>{detail?.membership?.member_id || 'No membership ID'} · {meta.club?.name || 'Club membership'}</SheetDescription></SheetHeader>
          {detailLoading ? <p className="mt-6 text-sm text-muted-foreground">Loading complete record…</p> : detail ? (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{label(detail.membership?.membership_status)}</Badge>
                <Badge variant="outline">{label(detail.membership?.payment_status)}</Badge>
                {(detail.person?.linked_user_id || detail.player?.user_id) ? <Badge className="bg-primary/15 text-primary"><Link2 className="w-3 h-3 mr-1" />RallyHub linked</Badge> : <Badge variant="outline">Not linked</Badge>}
                <div className="ml-auto flex flex-wrap gap-2">
                  {!(detail.person?.linked_user_id || detail.player?.user_id) ? <Button size="sm" variant="outline" disabled={saving} onClick={connectAccount}><Link2 className="w-3.5 h-3.5 mr-1.5" />Link RallyHub account</Button> : null}
                  <Button size="sm" onClick={() => setEditOpen(true)}><Pencil className="w-3.5 h-3.5 mr-1.5" />Edit record</Button>
                </div>
              </div>

              <Tabs defaultValue="profile">
                <TabsList className="flex flex-wrap h-auto gap-1 justify-start">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="membership">Membership</TabsTrigger>
                  <TabsTrigger value="sports">Sports</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                  <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                  <TabsTrigger value="consents">Consents</TabsTrigger>
                  <TabsTrigger value="history">Competition</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="pt-4"><div className="grid sm:grid-cols-2 gap-4">
                  <Info title="Email" value={detail.person?.primary_email} /><Info title="Mobile" value={detail.person?.mobile} />
                  <Info title="Date of birth" value={detail.person?.date_of_birth} sensitive /><Info title="Age / group" value={detail.person?.age != null ? `${detail.person.age} · ${detail.person.age_group || ''}` : null} sensitive />
                  <Info title="Address" value={detail.person?.full_postal_address || [detail.person?.address_line1, detail.person?.address_line2, detail.person?.town_city, detail.person?.county_region].filter(Boolean).join(', ')} />
                  <Info title="Postcode / Eircode" value={detail.person?.postal_code} />
                  <Info title="Emergency contact" value={[detail.person?.emergency_contact_name || detail.person?.emergency_contact_raw, detail.person?.emergency_contact_relationship].filter(Boolean).join(' · ')} sensitive />
                  <Info title="Emergency mobile" value={detail.person?.emergency_mobile} sensitive />
                </div></TabsContent>

                <TabsContent value="membership" className="pt-4"><div className="grid sm:grid-cols-2 gap-4">
                  <Info title="Membership ID" value={detail.membership?.member_id} /><Info title="Season" value={detail.membership?.membership_season} />
                  <Info title="Type" value={detail.membership?.membership_type} /><Info title="Status" value={label(detail.membership?.membership_status)} />
                  <Info title="Relationship" value={label(detail.membership?.relationship_type)} /><Info title="Category" value={label(detail.relationship?.membership_category)} />
                  <Info title="Fee" value={money(detail.membership?.membership_fee, currency)} /><Info title="Payment status" value={label(detail.membership?.payment_status)} />
                  <Info title="Payment date" value={detail.membership?.payment_date} /><Info title="Join date" value={detail.membership?.join_date} />
                  <Info title="Renewal date" value={detail.membership?.renewal_date} /><Info title="Expiry date" value={detail.membership?.expiry_date} />
                </div>{detail.membership?.admin_notes ? <div className="mt-4 rounded-lg bg-secondary/50 p-3 text-sm"><strong>Admin notes:</strong> {detail.membership.admin_notes}</div> : null}</TabsContent>

                <TabsContent value="sports" className="pt-4 space-y-3">
                  {!(detail.sportProfiles || []).length ? <p className="text-sm text-muted-foreground">No sport profile recorded.</p> :
                    detail.sportProfiles.map(profile => {
                      const sport = (meta.sports || []).find(item => String(item.id) === String(profile.sport_id));
                      return <div key={profile.id || profile.sport_id} className="rounded-xl border p-4">
                        <div className="flex items-center justify-between"><p className="font-semibold">{sport?.name || profile.sport || 'Sport'}</p><Badge variant="outline">{label(profile.status)}</Badge></div>
                        <div className="grid sm:grid-cols-3 gap-3 mt-3">
                          <Info title="Skill level" value={profile.skill_level} /><Info title="Playing category" value={profile.playing_category} />
                          {sport?.settings?.rating?.enabled !== false ? <>
                            <Info title={sport?.settings?.rating?.label || profile.rating_system || 'External rating'} value={profile.rating_value ?? profile.dupr_doubles_rating ?? profile.dupr_rating} />
                            <Info title={sport?.settings?.rating?.id_label || 'Rating ID'} value={profile.external_rating_id || profile.dupr_id} />
                            {(sport?.settings?.rating?.variants || []).map(variant => {
                              const metadata = parseJson(profile.rating_metadata_json, {});
                              const legacyValue = variant.key === 'singles' ? profile.dupr_singles_rating : variant.key === 'doubles' ? profile.dupr_doubles_rating : undefined;
                              return <Info key={variant.key} title={variant.label || label(variant.key)} value={metadata?.[variant.key] ?? legacyValue} />;
                            })}
                          </> : null}
                        </div>
                      </div>;
                    })}
                </TabsContent>

                <TabsContent value="payments" className="pt-4 space-y-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {detail.membership?.payment_status !== 'paid' && gateway?.supports_payments !== false ? <Button size="sm" onClick={createMembershipPayment} disabled={saving}><WalletCards className="w-3.5 h-3.5 mr-1.5" />Create / copy payment link</Button> : null}
                    {(detail.payments || []).some(payment => payment.purpose_type === 'membership' && payment.provider_checkout_id && payment.payment_status !== 'paid') ? <Button size="sm" variant="outline" onClick={verifyMembershipPayment} disabled={saving}><ShieldCheck className="w-3.5 h-3.5 mr-1.5" />Verify payment</Button> : null}
                  </div>
                  {!(detail.payments || []).length ? <p className="text-sm text-muted-foreground">No payment records.</p> :
                    detail.payments.map(payment => <div key={payment.id} className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{label(payment.purpose_type || payment.payment_type || 'Payment')}</p>
                        <p className="text-xs text-muted-foreground">{label(payment.provider || payment.payment_method)} {payment.payment_date ? ` · ${payment.payment_date}` : ''}</p>
                        {payment.provider_checkout_url && payment.payment_status !== 'paid' ? <button type="button" className="mt-1 text-xs text-primary hover:underline" onClick={async () => { try { await navigator.clipboard.writeText(payment.provider_checkout_url); toast.success('Payment link copied'); } catch { window.prompt('Copy payment link', payment.provider_checkout_url); } }}>Copy payment link</button> : null}
                      </div>
                      <div className="sm:text-right"><p className="font-semibold">{money(payment.amount, payment.currency || currency)}</p><Badge variant="outline">{label(payment.payment_status)}</Badge></div>
                    </div>)}
                  <p className="text-[11px] text-muted-foreground">Online membership payments are confirmed by the connected club gateway and activate the membership automatically. Verify payment remains a manual recovery tool.</p>
                </TabsContent>

                <TabsContent value="training" className="pt-4 space-y-3">
                  <div className="flex justify-end"><Button size="sm" onClick={() => setTrainingOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Add training</Button></div>
                  {!(detail.training || []).length ? <p className="text-sm text-muted-foreground">No training history recorded.</p> :
                    detail.training.map(item => <div key={item.id} className="rounded-lg border p-3"><div className="flex justify-between gap-2"><p className="font-semibold text-sm">{item.training_name}</p><Badge variant="outline">{label(item.status)}</Badge></div><p className="text-xs text-muted-foreground mt-1">{[item.sport, item.level_category, item.provider, item.completion_date].filter(Boolean).join(' · ')}</p></div>)}
                </TabsContent>

                <TabsContent value="qualifications" className="pt-4 space-y-3">
                  <div className="flex justify-end"><Button size="sm" onClick={() => setQualificationOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Add qualification</Button></div>
                  {!(detail.qualifications || []).length ? <p className="text-sm text-muted-foreground">No qualifications recorded.</p> :
                    detail.qualifications.map(item => <div key={item.id} className="rounded-lg border p-3"><div className="flex justify-between gap-2"><p className="font-semibold text-sm">{item.title}</p><Badge variant="outline">{label(item.verification_status)}</Badge></div><p className="text-xs text-muted-foreground mt-1">{[item.sport, item.level, item.governing_body, item.award_date].filter(Boolean).join(' · ')}</p></div>)}
                </TabsContent>

                <TabsContent value="consents" className="pt-4 grid md:grid-cols-2 gap-2">
                  {!(detail.consents || []).length ? <p className="text-sm text-muted-foreground">No consent records.</p> :
                    detail.consents.map(item => <div key={item.id} className="rounded-lg border p-3"><div className="flex justify-between gap-2"><p className="text-sm font-semibold">{label(item.consent_type)}</p><Badge variant="outline">{label(item.status)}</Badge></div><p className="text-xs text-muted-foreground mt-2">{item.response_text || 'No response text stored'}</p><p className="text-[10px] text-muted-foreground mt-2">Version {item.consent_version || '—'} · {item.recorded_at || 'date not recorded'}</p></div>)}
                </TabsContent>

                <TabsContent value="history" className="pt-4 space-y-2">
                  {!(detail.sportingHistory || []).length ? <p className="text-sm text-muted-foreground">No linked competition history yet.</p> :
                    detail.sportingHistory.slice(0, 100).map(item => <div key={item.id} className="rounded-lg border p-3"><div className="flex justify-between gap-2"><div><p className="text-sm font-semibold">{item.competition_name}</p><p className="text-xs text-muted-foreground">{item.competition_type} · {item.date ? String(item.date).slice(0, 10) : '—'} · Round {item.round ?? '—'}</p></div><Badge variant="outline">{label(item.result)}</Badge></div><p className="text-xs mt-2">{item.score_for}–{item.score_against}{item.partner_names?.length ? ` · Partner: ${item.partner_names.join(', ')}` : ''}</p></div>)}
                </TabsContent>
              </Tabs>
            </div>
          ) : <p className="mt-6 text-sm text-muted-foreground">No membership record selected.</p>}
        </SheetContent>
      </Sheet>

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              RallyHub checks the active tenant for an existing person first. If this person already exists as a guest or player, the new club membership is attached to that identity instead of creating a duplicate.
            </DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Full name</Label><Input className="mt-1" value={newMember.full_name} onChange={event => setNewMember(previous => ({ ...previous, full_name: event.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" className="mt-1" value={newMember.primary_email} onChange={event => setNewMember(previous => ({ ...previous, primary_email: event.target.value }))} /></div>
            <div><Label>Mobile</Label><Input className="mt-1" value={newMember.mobile} onChange={event => setNewMember(previous => ({ ...previous, mobile: event.target.value }))} /></div>
            <div><Label>Date of birth</Label><Input type="date" className="mt-1" value={newMember.date_of_birth} onChange={event => setNewMember(previous => ({ ...previous, date_of_birth: event.target.value }))} /></div>
            <div><Label>Membership ID</Label><Input className="mt-1" value={newMember.member_id} onChange={event => setNewMember(previous => ({ ...previous, member_id: event.target.value }))} /></div>
            <div><Label>Membership season</Label><Input className="mt-1" value={newMember.membership_season} onChange={event => setNewMember(previous => ({ ...previous, membership_season: event.target.value }))} /></div>
            <div><Label>Membership type</Label><Input className="mt-1" value={newMember.membership_type} onChange={event => setNewMember(previous => ({ ...previous, membership_type: event.target.value }))} /></div>
            <div><Label>Membership fee</Label><Input type="number" min="0" step="0.01" className="mt-1" value={newMember.membership_fee} onChange={event => setNewMember(previous => ({ ...previous, membership_fee: event.target.value }))} /></div>
            <div><Label>Membership status</Label><Select value={newMember.membership_status} onValueChange={value => setNewMember(previous => ({ ...previous, membership_status: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{(meta.membershipStatuses || []).map(value => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Payment status</Label><Select value={newMember.payment_status} onValueChange={value => setNewMember(previous => ({ ...previous, payment_status: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{(meta.paymentStatuses || []).map(value => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Relationship</Label><Select value={newMember.relationship_type} onValueChange={value => setNewMember(previous => ({ ...previous, relationship_type: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{(meta.relationshipTypes || []).map(value => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Join date</Label><Input type="date" className="mt-1" value={newMember.join_date} onChange={event => setNewMember(previous => ({ ...previous, join_date: event.target.value }))} /></div>
            <div><Label>Emergency contact</Label><Input className="mt-1" value={newMember.emergency_contact_name} onChange={event => setNewMember(previous => ({ ...previous, emergency_contact_name: event.target.value }))} /></div>
            <div><Label>Emergency relationship</Label><Input className="mt-1" value={newMember.emergency_contact_relationship} onChange={event => setNewMember(previous => ({ ...previous, emergency_contact_relationship: event.target.value }))} /></div>
            <div><Label>Emergency mobile</Label><Input className="mt-1" value={newMember.emergency_mobile} onChange={event => setNewMember(previous => ({ ...previous, emergency_mobile: event.target.value }))} /></div>
            <div className="sm:col-span-2">
              <Label>Sports</Label>
              <div className="mt-2 grid sm:grid-cols-2 gap-2">
                {(meta.sports || []).map(sport => {
                  const checked = (newMember.sport_ids || []).includes(String(sport.id));
                  return <label key={sport.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer hover:bg-secondary/40">
                    <Checkbox checked={checked} onCheckedChange={value => setNewMember(previous => ({
                      ...previous,
                      sport_ids: value
                        ? [...new Set([...(previous.sport_ids || []), String(sport.id)])]
                        : (previous.sport_ids || []).filter(id => String(id) !== String(sport.id))
                    }))} />
                    <span className="text-sm font-medium">{sport.name}</span>
                    {sport.is_primary ? <Badge variant="outline" className="ml-auto">Primary</Badge> : null}
                  </label>;
                })}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900 p-3 text-xs text-muted-foreground">
            Identity safety: RallyHub matches against the active tenant before creating a Person. Ambiguous matches are stopped for manual review.
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddMemberOpen(false)}>Cancel</Button><Button onClick={createMember} disabled={saving}>{saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}{saving ? 'Adding…' : 'Add member'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit membership record</DialogTitle>
            <DialogDescription>Personal details, club membership and sport profiles stay separate but are linked to one canonical person.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="person">
            <TabsList><TabsTrigger value="person">Person</TabsTrigger><TabsTrigger value="membership">Membership</TabsTrigger><TabsTrigger value="sports">Sports</TabsTrigger></TabsList>
            <TabsContent value="person" className="grid sm:grid-cols-2 gap-3 pt-3">
              {[
                ['full_name','Full name'],['preferred_name','Preferred name'],['primary_email','Email'],['mobile','Mobile'],
                ['date_of_birth','Date of birth'],['gender','Gender'],['full_postal_address','Postal address'],['postal_code','Postcode / Eircode'],
                ['emergency_contact_name','Emergency contact'],['emergency_contact_relationship','Relationship'],['emergency_mobile','Emergency mobile'],
                ['communication_preference','Communication preference']
              ].map(([key, title]) => <div key={key} className={key === 'full_postal_address' ? 'sm:col-span-2' : ''}><Label>{title}</Label><Input type={key === 'date_of_birth' ? 'date' : 'text'} className="mt-1" value={editPerson?.[key] || ''} onChange={event => setEditPerson(previous => ({ ...previous, [key]: event.target.value }))} /></div>)}
            </TabsContent>
            <TabsContent value="membership" className="grid sm:grid-cols-2 gap-3 pt-3">
              <div><Label>Membership ID</Label><Input className="mt-1" value={editMembership.member_id || ''} onChange={event => setEditMembership(previous => ({ ...previous, member_id: event.target.value }))} /></div>
              <div><Label>Season</Label><Input className="mt-1" value={editMembership.membership_season || ''} onChange={event => setEditMembership(previous => ({ ...previous, membership_season: event.target.value }))} /></div>
              <div><Label>Membership type</Label><Input className="mt-1" value={editMembership.membership_type || ''} onChange={event => setEditMembership(previous => ({ ...previous, membership_type: event.target.value }))} /></div>
              <div><Label>Membership status</Label><Select value={editMembership.membership_status || ''} onValueChange={value => setEditMembership(previous => ({ ...previous, membership_status: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{(meta.membershipStatuses || []).map(value => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Relationship type</Label><Select value={editMembership.relationship_type || ''} onValueChange={value => setEditMembership(previous => ({ ...previous, relationship_type: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{(meta.relationshipTypes || []).map(value => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Payment status</Label><Select value={editMembership.payment_status || ''} onValueChange={value => setEditMembership(previous => ({ ...previous, payment_status: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{(meta.paymentStatuses || []).map(value => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Membership fee</Label><Input type="number" min="0" step="0.01" className="mt-1" value={editMembership.membership_fee ?? ''} onChange={event => setEditMembership(previous => ({ ...previous, membership_fee: event.target.value }))} /></div>
              <div><Label>Payment date</Label><Input type="date" className="mt-1" value={editMembership.payment_date || ''} onChange={event => setEditMembership(previous => ({ ...previous, payment_date: event.target.value }))} /></div>
              <div><Label>Join date</Label><Input type="date" className="mt-1" value={editMembership.join_date || ''} onChange={event => setEditMembership(previous => ({ ...previous, join_date: event.target.value }))} /></div>
              <div><Label>Renewal date</Label><Input type="date" className="mt-1" value={editMembership.renewal_date || ''} onChange={event => setEditMembership(previous => ({ ...previous, renewal_date: event.target.value }))} /></div>
              <div><Label>Expiry date</Label><Input type="date" className="mt-1" value={editMembership.expiry_date || ''} onChange={event => setEditMembership(previous => ({ ...previous, expiry_date: event.target.value }))} /></div>
              <div className="sm:col-span-2"><Label>Admin notes</Label><Textarea className="mt-1" value={editMembership.admin_notes || ''} onChange={event => setEditMembership(previous => ({ ...previous, admin_notes: event.target.value }))} /></div>
            </TabsContent>
            <TabsContent value="sports" className="space-y-3 pt-3">
              {editSports.map((profile, index) => {
                const sport = (meta.sports || []).find(item => String(item.id) === String(profile.sport_id));
                return <div key={profile.id || profile.sport_id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-2"><p className="font-semibold">{sport?.name || 'Sport'}</p><Badge variant="outline">{label(profile.status)}</Badge></div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                    <div><Label>Status</Label><Select value={profile.status || 'active'} onValueChange={value => setEditSports(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, status: value } : item))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
                    <div><Label>Experience</Label><Select value={profile.experience_type || 'current'} onValueChange={value => setEditSports(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, experience_type: value } : item))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="current">Current</SelectItem><SelectItem value="previous">Previous</SelectItem><SelectItem value="interested">Interested</SelectItem></SelectContent></Select></div>
                    <div><Label>Skill level</Label><Input className="mt-1" value={profile.skill_level || ''} onChange={event => setEditSports(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, skill_level: event.target.value } : item))} /></div>
                    <div><Label>Playing category</Label><Input className="mt-1" value={profile.playing_category || ''} onChange={event => setEditSports(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, playing_category: event.target.value } : item))} /></div>
                    <div><Label>Preferred side / position</Label><Input className="mt-1" value={profile.preferred_side || ''} onChange={event => setEditSports(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, preferred_side: event.target.value } : item))} /></div>
                    {sport?.settings?.rating?.enabled !== false ? <>
                      <div><Label>Rating system</Label><Input className="mt-1" value={profile.rating_system || sport?.settings?.rating?.system || ''} onChange={event => setEditSports(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, rating_system: event.target.value } : item))} /></div>
                      <div><Label>{sport?.settings?.rating?.id_label || 'External rating ID'}</Label><Input className="mt-1" value={profile.external_rating_id || ''} onChange={event => setEditSports(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, external_rating_id: event.target.value } : item))} /></div>
                      <div><Label>{sport?.settings?.rating?.label || 'External rating'}</Label><Input type="number" step="0.01" className="mt-1" value={profile.rating_value ?? ''} onChange={event => setEditSports(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, rating_value: event.target.value } : item))} /></div>
                      {(sport?.settings?.rating?.variants || []).map(variant => <div key={variant.key}><Label>{variant.label || label(variant.key)}</Label><Input type="number" step="0.01" className="mt-1" value={profile.rating_metadata?.[variant.key] ?? ''} onChange={event => setEditSports(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, rating_metadata: { ...(item.rating_metadata || {}), [variant.key]: event.target.value } } : item))} /></div>)}
                    </> : null}
                    <div className="sm:col-span-2 lg:col-span-3"><Label>Sport notes</Label><Textarea className="mt-1" value={profile.notes || ''} onChange={event => setEditSports(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, notes: event.target.value } : item))} /></div>
                  </div>
                </div>;
              })}
            </TabsContent>
          </Tabs>
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={updateRecord} disabled={saving}>{saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}{saving ? 'Saving…' : 'Save changes'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={trainingOpen} onOpenChange={setTrainingOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add training record</DialogTitle><DialogDescription>Training is attached to the canonical person and may be reused by coaching, eligibility and event workflows.</DialogDescription></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><Label>Training name</Label><Input className="mt-1" value={training.trainingName} onChange={event => setTraining(previous => ({ ...previous, trainingName: event.target.value }))} /></div>
            <div><Label>Sport</Label><Select value={training.sportId || 'none'} onValueChange={value => setTraining(previous => ({ ...previous, sportId: value === 'none' ? '' : value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">General / not sport-specific</SelectItem>{(meta.sports || []).map(sport => <SelectItem key={sport.id} value={String(sport.id)}>{sport.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Status</Label><Select value={training.status} onValueChange={value => setTraining(previous => ({ ...previous, status: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{['planned','attended','completed','not_completed','expired'].map(value => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Completion date</Label><Input type="date" className="mt-1" value={training.completionDate} onChange={event => setTraining(previous => ({ ...previous, completionDate: event.target.value }))} /></div>
            <div><Label>Provider</Label><Input className="mt-1" value={training.provider} onChange={event => setTraining(previous => ({ ...previous, provider: event.target.value }))} /></div>
            <div><Label>Level / category</Label><Input className="mt-1" value={training.levelCategory} onChange={event => setTraining(previous => ({ ...previous, levelCategory: event.target.value }))} /></div>
            <div className="sm:col-span-2"><Label>Notes</Label><Textarea className="mt-1" value={training.notes} onChange={event => setTraining(previous => ({ ...previous, notes: event.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setTrainingOpen(false)}>Cancel</Button><Button onClick={addTraining} disabled={saving}>{saving ? 'Saving…' : 'Add training'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={qualificationOpen} onOpenChange={setQualificationOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add qualification</DialogTitle><DialogDescription>Qualifications stay attached to the canonical person and can support club roles, training and future sports.</DialogDescription></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><Label>Qualification title</Label><Input className="mt-1" value={qualification.title} onChange={event => setQualification(previous => ({ ...previous, title: event.target.value }))} /></div>
            <div><Label>Sport</Label><Select value={qualification.sportId || 'none'} onValueChange={value => setQualification(previous => ({ ...previous, sportId: value === 'none' ? '' : value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">General / not sport-specific</SelectItem>{(meta.sports || []).map(sport => <SelectItem key={sport.id} value={String(sport.id)}>{sport.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Verification</Label><Select value={qualification.verificationStatus} onValueChange={value => setQualification(previous => ({ ...previous, verificationStatus: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{['unverified','verified','expired'].map(value => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Level</Label><Input className="mt-1" value={qualification.level} onChange={event => setQualification(previous => ({ ...previous, level: event.target.value }))} /></div>
            <div><Label>Governing body / provider</Label><Input className="mt-1" value={qualification.governingBody} onChange={event => setQualification(previous => ({ ...previous, governingBody: event.target.value }))} /></div>
            <div><Label>Award date</Label><Input type="date" className="mt-1" value={qualification.awardDate} onChange={event => setQualification(previous => ({ ...previous, awardDate: event.target.value }))} /></div>
            <div><Label>Expiry date</Label><Input type="date" className="mt-1" value={qualification.expiryDate} onChange={event => setQualification(previous => ({ ...previous, expiryDate: event.target.value }))} /></div>
            <div className="sm:col-span-2"><Label>Notes</Label><Textarea className="mt-1" value={qualification.notes} onChange={event => setQualification(previous => ({ ...previous, notes: event.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setQualificationOpen(false)}>Cancel</Button><Button onClick={addQualification} disabled={saving}>{saving ? 'Saving…' : 'Add qualification'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
