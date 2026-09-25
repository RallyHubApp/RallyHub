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
        <div className="flex items-center gap-2">
          {gateway ? <Badge variant="outline" className="gap-1.5"><WalletCards className="w-3 h-3" />{label(gateway.provider)} · {label(gateway.status)}</Badge> : null}
          <Button variant="outline" size="sm" onClick={() => { refetchList(); queryClient.invalidateQueries({ queryKey: ['membership-console-meta'] }); }}>
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
                    <div><Label>RallyHub account</Label><Select value={rs.account} onValueChange={value => setFilters(f => ({ ...f, account: value }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="linked">Linked</SelectItem><SelectItem value="unlinked">Not linked</SelectItem></SelectContent></Select></div>
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
          <SheetHeader><SheetTitle>{detail?.person?.full_name || 'Member record'}</SheetTitle><SheetDescription>{detail?.membership?.member_id || 'No membership ID'} · {meta.club?.name || 'Club membership'}</SheetDescription></Sh
/*APPEND*/