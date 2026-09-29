import React, { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowDown, ArrowLeft, ArrowUp, BookOpen, CheckCircle2, ExternalLink,
  FileText, Link2, Pencil, Plus, Save, Upload, Video, X
} from 'lucide-react';

export const LEARN_CATEGORY_SUGGESTIONS = [
  'Start Here',
  'Pickleball Basics',
  'Skills & Coaching',
  'Game Formats',
  'Rules & Officiating',
  'DUPR & Ratings',
  'Club Information',
];

const EMPTY_FORM = {
  id: '',
  title: '',
  description: '',
  category: 'Start Here',
  resource_type: 'guide',
  url: '',
  image_url: '',
  source_kind: 'external_link',
  file_name: '',
  sort_order: 10,
  status: 'draft',
};

function resourceIcon(type) {
  if (type === 'video') return Video;
  if (type === 'link') return Link2;
  return FileText;
}

function cleanForm(row = {}) {
  return {
    ...EMPTY_FORM,
    ...row,
    id: row.id || '',
    title: row.title || '',
    description: row.description || '',
    category: row.category || 'Start Here',
    resource_type: row.resource_type || 'guide',
    url: row.url || '',
    image_url: row.image_url || '',
    source_kind: row.source_kind || (row.file_name ? 'uploaded_file' : 'external_link'),
    file_name: row.file_name || '',
    sort_order: Number(row.sort_order || 0),
    status: row.status || 'draft',
  };
}

export default function ManageLearn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const tenantId = user?.active_tenant_id;
  const clubId = user?.active_club_id;
  const canManage = user?.role === 'admin' || user?.active_club_role === 'club_admin';

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState('');

  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ['manage-club-resources', tenantId, clubId],
    queryFn: () => base44.entities.ClubResource.filter({ tenant_id: tenantId, club_id: clubId }, 'sort_order', 500),
    enabled: !!tenantId && !!clubId && canManage,
  });

  const sortedResources = useMemo(() => [...resources].sort((a, b) => {
    const ai = LEARN_CATEGORY_SUGGESTIONS.indexOf(a.category);
    const bi = LEARN_CATEGORY_SUGGESTIONS.indexOf(b.category);
    const ac = ai === -1 ? 999 : ai;
    const bc = bi === -1 ? 999 : bi;
    return ac - bc || String(a.category || '').localeCompare(String(b.category || '')) || Number(a.sort_order || 0) - Number(b.sort_order || 0) || String(a.title || '').localeCompare(String(b.title || ''));
  }), [resources]);

  const resetForm = () => {
    const maxOrder = resources.reduce((max, row) => Math.max(max, Number(row.sort_order || 0)), 0);
    setForm({ ...EMPTY_FORM, sort_order: maxOrder + 10 });
    setSelectedFile(null);
    setUploadMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const chooseFile = (file) => {
    setUploadMessage('');
    if (!file) return;
    const name = String(file.name || '');
    const lower = name.toLowerCase();
    const type = String(file.type || '').toLowerCase();
    const supported = type.startsWith('image/') || type === 'application/pdf' || lower.endsWith('.pdf');
    if (!supported) {
      setSelectedFile(null);
      setUploadMessage('Choose a PNG, JPG, WEBP or PDF file.');
      return;
    }
    if (!file.size || file.size > 20 * 1024 * 1024) {
      setSelectedFile(null);
      setUploadMessage('File must be 20 MB or smaller.');
      return;
    }
    setSelectedFile(file);
    setForm(current => ({
      ...current,
      source_kind: 'uploaded_file',
      file_name: name,
      resource_type: current.resource_type === 'video' ? 'document' : current.resource_type,
      title: current.title || name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
    }));
    setUploadMessage(`Selected: ${name} · ${(file.size / 1024).toFixed(0)} KB`);
  };

  const saveResource = async () => {
    if (!tenantId || !clubId) return toast.error('Choose an active RallyHub club first.');
    if (!form.title.trim()) return toast.error('Add a title.');
    if (!form.category.trim()) return toast.error('Add a category.');
    if (form.source_kind === 'external_link' && !form.url.trim()) return toast.error('Paste the resource link.');
    if (form.source_kind === 'uploaded_file' && !selectedFile && !form.url) return toast.error('Choose a file to upload.');

    setSaving(true);
    try {
      let url = form.url.trim();
      let imageUrl = form.image_url || '';
      let fileName = form.file_name || '';

      if (selectedFile) {
        setUploadMessage(`Uploading ${selectedFile.name}…`);
        const request = base44.integrations.Core.UploadFile({ file: selectedFile });
        const timeout = new Promise((_, reject) => window.setTimeout(() => reject(new Error('Upload timed out. Please try again.')), 45000));
        const result = await Promise.race([request, timeout]);
        url = result?.file_url || result?.data?.file_url || '';
        if (!url) throw new Error(result?.data?.error || 'No file URL returned');
        fileName = selectedFile.name;
        if (String(selectedFile.type || '').toLowerCase().startsWith('image/')) imageUrl = url;
        else if (form.source_kind === 'uploaded_file') imageUrl = '';
      }

      const payload = {
        tenant_id: tenantId,
        club_id: clubId,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        resource_type: form.resource_type,
        url,
        image_url: imageUrl || undefined,
        source_kind: form.source_kind,
        file_name: fileName || undefined,
        sort_order: Number(form.sort_order || 0),
        status: form.status,
      };

      if (form.id) await base44.entities.ClubResource.update(form.id, payload);
      else await base44.entities.ClubResource.create(payload);

      await queryClient.invalidateQueries({ queryKey: ['manage-club-resources', tenantId, clubId] });
      await queryClient.invalidateQueries({ queryKey: ['member-portal-learn'] });
      toast.success(form.id ? 'Learn resource updated' : 'Learn resource added');
      resetForm();
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Could not save resource');
    } finally {
      setSaving(false);
    }
  };

  const editResource = (row) => {
    setForm(cleanForm(row));
    setSelectedFile(null);
    setUploadMessage(row.file_name ? `Current file: ${row.file_name}` : '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const archiveResource = async (row) => {
    try {
      await base44.entities.ClubResource.update(row.id, { status: 'archived' });
      await queryClient.invalidateQueries({ queryKey: ['manage-club-resources', tenantId, clubId] });
      await queryClient.invalidateQueries({ queryKey: ['member-portal-learn'] });
      if (form.id === row.id) resetForm();
      toast.success('Resource archived');
    } catch (e) {
      toast.error(e?.message || 'Could not archive resource');
    }
  };

  const moveResource = async (row, direction) => {
    const peers = resources
      .filter(item => item.category === row.category && item.status !== 'archived')
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || String(a.title || '').localeCompare(String(b.title || '')));
    const index = peers.findIndex(item => item.id === row.id);
    const otherIndex = index + direction;
    if (index < 0 || otherIndex < 0 || otherIndex >= peers.length) return;
    const other = peers[otherIndex];
    const aOrder = Number(row.sort_order || index * 10 + 10);
    const bOrder = Number(other.sort_order || otherIndex * 10 + 10);
    setMovingId(row.id);
    try {
      await Promise.all([
        base44.entities.ClubResource.update(row.id, { sort_order: bOrder }),
        base44.entities.ClubResource.update(other.id, { sort_order: aOrder }),
      ]);
      await queryClient.invalidateQueries({ queryKey: ['manage-club-resources', tenantId, clubId] });
      await queryClient.invalidateQueries({ queryKey: ['member-portal-learn'] });
    } catch (e) {
      toast.error(e?.message || 'Could not reorder resource');
    } finally {
      setMovingId('');
    }
  };

  if (!canManage) return <div className="glass rounded-xl p-6 text-sm">Club administrator access required.</div>;
  if (!tenantId || !clubId) return <div className="glass rounded-xl p-6 text-sm">Choose an active RallyHub club before managing Learn.</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-20 lg:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/app/learn" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"><ArrowLeft className="h-3.5 w-3.5" />Back to Learn</Link>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Club resources</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Manage Learn</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add videos, visuals, guides, rules and useful links for your members.</p>
        </div>
        <Button variant="outline" asChild><Link to="/app/learn"><BookOpen className="mr-2 h-4 w-4" />Member view</Link></Button>
      </div>

      <GlassCard className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="font-black">{form.id ? 'Edit resource' : 'Add resource'}</h2><p className="mt-1 text-xs text-muted-foreground">Keep the description short — one or two sentences is ideal.</p></div>
          {form.id && <Button variant="ghost" size="sm" onClick={resetForm}><X className="mr-1 h-4 w-4" />Cancel edit</Button>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Title</Label><Input className="mt-1.5" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. King of the Court — 4 courts" /></div>
          <div className="sm:col-span-2"><Label>Short description</Label><Textarea className="mt-1.5 min-h-20" value={form.description} onChange={e => setField('description', e.target.value)} placeholder="What is this resource and when would a member use it?" /></div>

          <div><Label>Section</Label><Input className="mt-1.5" list="learn-category-options" value={form.category} onChange={e => setField('category', e.target.value)} placeholder="Choose or type a section" /><datalist id="learn-category-options">{LEARN_CATEGORY_SUGGESTIONS.map(category => <option key={category} value={category} />)}</datalist></div>
          <div><Label>Resource type</Label><Select value={form.resource_type} onValueChange={value => setField('resource_type', value)}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="guide">Guide / visual</SelectItem><SelectItem value="document">Document</SelectItem><SelectItem value="coaching">Coaching</SelectItem><SelectItem value="policy">Rules / policy</SelectItem><SelectItem value="link">Useful link</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>

          <div><Label>Source</Label><Select value={form.source_kind} onValueChange={value => { setField('source_kind', value); setSelectedFile(null); setUploadMessage(''); }}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="external_link">Paste a link</SelectItem><SelectItem value="uploaded_file">Upload a file</SelectItem></SelectContent></Select></div>
          <div><Label>Status</Label><Select value={form.status} onValueChange={value => setField('status', value)}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>

          {form.source_kind === 'external_link' ? (
            <div className="sm:col-span-2"><Label>Link</Label><Input className="mt-1.5" value={form.url} onChange={e => setField('url', e.target.value)} placeholder="YouTube, Google Drive or another web link" /><p className="mt-1 text-[11px] text-muted-foreground">YouTube videos will play inside Learn. Other links open in a new tab.</p></div>
          ) : (
            <div className="sm:col-span-2 rounded-xl border border-dashed border-border bg-secondary/20 p-4">
              <Label>Upload PNG, JPG, WEBP or PDF</Label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf,.pdf" onChange={e => chooseFile(e.target.files?.[0])} className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-primary-foreground" />
                {form.url && !selectedFile && <a href={form.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline">Current file <ExternalLink className="h-3 w-3" /></a>}
              </div>
              {uploadMessage && <p className="mt-2 text-xs text-muted-foreground">{uploadMessage}</p>}
            </div>
          )}

          <div><Label>Display order</Label><Input className="mt-1.5" type="number" value={form.sort_order} onChange={e => setField('sort_order', Number(e.target.value || 0))} /><p className="mt-1 text-[11px] text-muted-foreground">Lower numbers appear first. You can also use the arrows below.</p></div>
          <div className="flex items-end"><Button className="w-full" disabled={saving} onClick={saveResource}>{saving ? <Upload className="mr-2 h-4 w-4 animate-pulse" /> : <Save className="mr-2 h-4 w-4" />}{saving ? 'Saving…' : form.id ? 'Save changes' : 'Add resource'}</Button></div>
        </div>
      </GlassCard>

      <div>
        <div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-black">Current resources</h2><p className="text-xs text-muted-foreground">{resources.length} total · members only see Published items.</p></div><Button variant="outline" size="sm" onClick={resetForm}><Plus className="mr-1 h-4 w-4" />New</Button></div>
        {isLoading && <GlassCard className="p-6 text-sm text-muted-foreground">Loading resources…</GlassCard>}
        {error && <GlassCard className="p-6 text-sm text-destructive">{error.message || 'Could not load resources.'}</GlassCard>}
        {!isLoading && !error && sortedResources.length === 0 && <GlassCard className="p-8 text-center"><BookOpen className="mx-auto mb-2 h-7 w-7 text-muted-foreground" /><p className="font-semibold">No Learn resources yet</p><p className="mt-1 text-xs text-muted-foreground">Add the first one above. Draft it first if you want to check the member view before publishing.</p></GlassCard>}
        <div className="space-y-2">
          {sortedResources.map(row => {
            const Icon = resourceIcon(row.resource_type);
            const peers = resources.filter(item => item.category === row.category && item.status !== 'archived').sort((a,b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
            const peerIndex = peers.findIndex(item => item.id === row.id);
            return (
              <GlassCard key={row.id} className={`p-3 sm:p-4 ${row.status === 'archived' ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{row.title}</p><Badge variant={row.status === 'published' ? 'default' : 'outline'} className="text-[9px] capitalize">{row.status}</Badge><Badge variant="outline" className="text-[9px]">{row.category}</Badge></div>
                    {row.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.description}</p>}
                    <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">{String(row.resource_type || 'resource').replaceAll('_',' ')}{row.file_name ? ` · ${row.file_name}` : ''}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={peerIndex <= 0 || movingId === row.id} onClick={() => moveResource(row, -1)} title="Move up"><ArrowUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={peerIndex < 0 || peerIndex >= peers.length - 1 || movingId === row.id} onClick={() => moveResource(row, 1)} title="Move down"><ArrowDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editResource(row)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                  </div>
                </div>
                {row.status !== 'archived' && <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3"><Button variant="outline" size="sm" onClick={() => base44.entities.ClubResource.update(row.id, { status: row.status === 'published' ? 'draft' : 'published' }).then(async () => { await queryClient.invalidateQueries({ queryKey:['manage-club-resources', tenantId, clubId] }); await queryClient.invalidateQueries({ queryKey:['member-portal-learn'] }); toast.success(row.status === 'published' ? 'Moved back to draft' : 'Published'); }).catch(e => toast.error(e?.message || 'Could not update status'))}>{row.status === 'published' ? 'Move to draft' : <><CheckCircle2 className="mr-1 h-4 w-4" />Publish</>}</Button><Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => archiveResource(row)}>Archive</Button>{row.url && <a href={row.url} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Open source <ExternalLink className="h-3 w-3" /></a>}</div>}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
