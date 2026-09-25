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
/*APPEND*/