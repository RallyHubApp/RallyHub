import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/PageHeader';
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
  AlertTriangle, CheckCircle2, Columns3, Download, FileText, Filter, Link2,
  Pencil, Plus, Printer, RefreshCw, Save, Search, ShieldCheck, Users, WalletCards, X
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
  const [editPerson, setEditPerson] = useState({});
  const [editMembership, setEditMembership] = useState({});
  const [editSports, setEditSports] = useState([]);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [qualificationOpen, setQualificationOpen] = useState(false);
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
      return existing ? { ...existing } : {
        sport_id: sport.id,
        status: 'active',
        experience_type: 'current',
        skill_level: '',
        playing_category: '',
        preferred_side: '',
        dupr_id: '',
        dupr_rating: '',
        dupr_singles_rating: '',
        dupr_doubles_rating: '',
        notes: ''
      };
    }));
  }, [detail, editOpen, meta.sports]);

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
    c
/*APPEND*/