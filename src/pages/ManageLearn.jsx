import React, { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import GlassCard from '@/components/shared/GlassCard';
import MemberLearn from '@/pages/MemberLearn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  ArrowDown, ArrowLeft, ArrowUp, BookOpen, CheckCircle2, ExternalLink,
  FileText, Filter, LayoutList, Link2, MessageCircle, Pencil, Plus, Save,
  Search, Settings2, SlidersHorizontal, Upload, Video, X
} from 'lucide-react';
import { LEARN_RESOURCE_TYPES, LEARN_STARTER_CATEGORIES, resourceTypeLabel } from '@/lib/learnConfig';

const EMPTY_FORM = {
  id:'', title:'', description:'', category_id:'', category:'', resource_type:'guide',
  url:'', image_url:'', source_kind:'external_link', file_name:'', sort_order:10, status:'draft'
};
const EMPTY_CATEGORY = { id:'', name:'', description:'', icon_key:'book-open', sort_order:10, status:'active' };
const EMPTY_SETTINGS = {
  intro_text:'Guides, coaching, rules, videos and useful club resources.', feedback_enabled:true,
  contact_enabled:true, in_app_enabled:true, contact_name:'', contact_title:'', contact_email:'', whatsapp_number:''
};

function resourceIcon(type) {
  if (type === 'video') return Video;
  if (type === 'link') return Link2;
  return FileText;
}

function cleanForm(row = {}) {
  return {
    ...EMPTY_FORM, ...row, id:row.id || '', title:row.title || '', description:row.description || '',
    category_id:row.category_id || '', category:row.category || '', resource_type:row.resource_type || 'guide',
    url:row.url || '', image_url:row.image_url || '', source_kind:row.source_kind || (row.file_name ? 'uploaded_file' : 'external_link'),
    file_name:row.file_name || '', sort_order:Number(row.sort_order || 0), status:row.status || 'draft'
  };
}

export default function ManageLearn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const tenantId = user?.active_tenant_id;
  const clubId = user?.active_club_id;
  const canManage = user?.role === 'admin' || user?.active_club_role === 'club_admin';

  const [tab, setTab] = useState('library');
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState('');
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [libraryType, setLibraryType] = useState('all');
  const [libraryStatus, setLibraryStatus] = useState('active');
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [settingsForm, setSettingsForm] = useState(EMPTY_SETTINGS);
  const [settingsLoadedId, setSettingsLoadedId] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  const { data: resources = [], isLoading, error } = useQuery({
    queryKey:['manage-club-resources', tenantId, clubId],
    queryFn:() => base44.entities.ClubResource.filter({ tenant_id:tenantId, club_id:clubId }, 'sort_order', 500),
    enabled:!!tenantId && !!clubId && canManage,
  });
  const { data: categories = [] } = useQuery({
    queryKey:['learn-categories', tenantId, clubId],
    queryFn:() => base44.entities.ClubResourceCategory.filter({ tenant_id:tenantId, club_id:clubId }, 'sort_order', 100),
    enabled:!!tenantId && !!clubId && canManage,
  });
  const { data: settingsRows = [] } = useQuery({
    queryKey:['learn-settings', tenantId, clubId],
    queryFn:() => base44.entities.ClubLearnSettings.filter({ tenant_id:tenantId, club_id:clubId }, '-updated_date', 10),
    enabled:!!tenantId && !!clubId && canManage,
  });
  const { data: memberLearn = null } = useQuery({
    queryKey:['member-portal-learn'],
    queryFn:async()=>{ const res=await base44.functions.invoke('memberPortal',{action:'learn'}); if(res.data?.error) throw new Error(res.data.error); return res.data?.learn || null; },
    enabled:!!tenantId && !!clubId && canManage,
    staleTime:20_000,
  });

  const sortedCategories = useMemo(() => [...categories].sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0)||String(a.name||'').localeCompare(String(b.name||''))), [categories]);
  const categoryRank = useMemo(() => new Map(sortedCategories.map((row,index)=>[row.name,index])), [sortedCategories]);
  const sortedResources = useMemo(() => [...resources].sort((a,b)=>(categoryRank.get(a.category)??999)-(categoryRank.get(b.category)??999)||String(a.category||'').localeCompare(String(b.category||''))||Number(a.sort_order||0)-Number(b.sort_order||0)||String(a.title||'').localeCompare(String(b.title||''))), [resources, categoryRank]);
  const filteredResources = useMemo(() => {
    const q=librarySearch.trim().toLowerCase();
    return sortedResources
      .filter(row=>libraryStatus==='all' ? true : libraryStatus==='active' ? row.status!=='archived' : row.status===libraryStatus)
      .filter(row=>libraryCategory==='all'||row.category===libraryCategory)
      .filter(row=>libraryType==='all'||row.resource_type===libraryType)
      .filter(row=>!q||`${row.title||''} ${row.description||''} ${row.category||''} ${row.file_name||''} ${resourceTypeLabel(row.resource_type)}`.toLowerCase().includes(q));
  }, [sortedResources, librarySearch, libraryStatus, libraryCategory, libraryType]);

  React.useEffect(() => {
    const row=settingsRows?.[0];
    if (!row || settingsLoadedId===row.id) return;
    setSettingsLoadedId(row.id);
    setSettingsForm({ ...EMPTY_SETTINGS, ...row });
  }, [settingsRows, settingsLoadedId]);

  React.useEffect(() => {
    if (!form.category && sortedCategories.length) setForm(current=>({...current,category_id:sortedCategories[0].id,category:sortedCategories[0].name}));
  }, [sortedCategories, form.category]);

  const resetForm = () => {
    const maxOrder=resources.reduce((max,row)=>Math.max(max,Number(row.sort_order||0)),0);
    const first=sortedCategories.find(row=>row.status==='active') || sortedCategories[0];
    setForm({ ...EMPTY_FORM, category_id:first?.id||'', category:first?.name||'', sort_order:maxOrder+10 });
    setSelectedFile(null); setUploadMessage(''); if(fileInputRef.current) fileInputRef.current.value='';
  };
  const setField=(key,value)=>setForm(current=>({...current,[key]:value}));

  const chooseFile=(file)=>{
    setUploadMessage(''); if(!file)return;
    const name=String(file.name||''); const lower=name.toLowerCase(); const type=String(file.type||'').toLowerCase();
    const supported=type.startsWith('image/')||type==='application/pdf'||lower.endsWith('.pdf');
    if(!supported){setSelectedFile(null);setUploadMessage('Choose a PNG, JPG, WEBP or PDF file.');return;}
    if(!file.size||file.size>20*1024*1024){setSelectedFile(null);setUploadMessage('File must be 20 MB or smaller.');return;}
    setSelectedFile(file);
    setForm(current=>({...current,source_kind:'uploaded_file',file_name:name,resource_type:current.resource_type==='video'?'document':current.resource_type,title:current.title||name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ')}));
    setUploadMessage(`Selected: ${name} · ${(file.size/1024).toFixed(0)} KB`);
  };

  const saveResource=async()=>{
    if(!tenantId||!clubId)return toast.error('Choose an active RallyHub club first.');
    if(!form.title.trim())return toast.error('Add a title.');
    if(!form.category.trim())return toast.error('Choose a section.');
    if(form.source_kind==='external_link'&&!form.url.trim())return toast.error('Paste the resource link.');
    if(form.source_kind==='uploaded_file'&&!selectedFile&&!form.url)return toast.error('Choose a file to upload.');
    setSaving(true);
    try{
      let url=form.url.trim(); let imageUrl=form.image_url||''; let fileName=form.file_name||'';
      if(selectedFile){
        setUploadMessage(`Uploading ${selectedFile.name}…`);
        const request=base44.integrations.Core.UploadFile({file:selectedFile});
        const timeout=new Promise((_,reject)=>window.setTimeout(()=>reject(new Error('Upload timed out. Please try again.')),45000));
        const result=await Promise.race([request,timeout]);
        url=result?.file_url||result?.data?.file_url||''; if(!url)throw new Error(result?.data?.error||'No file URL returned');
        fileName=selectedFile.name; imageUrl=String(selectedFile.type||'').toLowerCase().startsWith('image/')?url:'';
      }
      const payload={tenant_id:tenantId,club_id:clubId,title:form.title.trim(),description:form.description.trim(),category_id:form.category_id||undefined,category:form.category.trim(),resource_type:form.resource_type,url,image_url:imageUrl||undefined,source_kind:form.source_kind,file_name:fileName||undefined,sort_order:Number(form.sort_order||0),status:form.status};
      if(form.id)await base44.entities.ClubResource.update(form.id,payload); else await base44.entities.ClubResource.create(payload);
      await Promise.all([queryClient.invalidateQueries({queryKey:['manage-club-resources',tenantId,clubId]}),queryClient.invalidateQueries({queryKey:['member-portal-learn']})]);
      toast.success(form.id?'Learn resource updated':'Learn resource added'); resetForm(); setTab('library');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not save resource');}finally{setSaving(false);}
  };

  const editResource=(row)=>{setForm(cleanForm(row));setSelectedFile(null);setUploadMessage(row.file_name?`Current file: ${row.file_name}`:'');if(fileInputRef.current)fileInputRef.current.value='';setTab('add');window.scrollTo({top:0,behavior:'smooth'});};
  const setResourceStatus=async(row,status)=>{try{await base44.entities.ClubResource.update(row.id,{status});await Promise.all([queryClient.invalidateQueries({queryKey:['manage-club-resources',tenantId,clubId]}),queryClient.invalidateQueries({queryKey:['member-portal-learn']})]);toast.success(status==='published'?'Published':status==='draft'?'Moved to draft':'Archived');}catch(e){toast.error(e?.message||'Could not update resource');}};
  const moveResource=async(row,direction)=>{
    const peers=resources.filter(item=>item.category===row.category&&item.status!=='archived').sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0)); const index=peers.findIndex(item=>item.id===row.id); const other=peers[index+direction]; if(!other)return;
    setMovingId(row.id); try{const a=Number(row.sort_order||index*10+10),b=Number(other.sort_order||(index+direction)*10+10);await Promise.all([base44.entities.ClubResource.update(row.id,{sort_order:b}),base44.entities.ClubResource.update(other.id,{sort_order:a})]);await queryClient.invalidateQueries({queryKey:['manage-club-resources',tenantId,clubId]});}catch(e){toast.error(e?.message||'Could not reorder resource');}finally{setMovingId('');}
  };

  const saveCategory=async()=>{
    if(!categoryForm.name.trim())return toast.error('Add a section name.'); setCategoryBusy(true);
    try{
      const old=categories.find(row=>row.id===categoryForm.id);
      const payload={tenant_id:tenantId,club_id:clubId,name:categoryForm.name.trim(),description:categoryForm.description.trim(),icon_key:categoryForm.icon_key||'book-open',sort_order:Number(categoryForm.sort_order||0),status:categoryForm.status||'active'};
      if(categoryForm.id){await base44.entities.ClubResourceCategory.update(categoryForm.id,payload);if(old&&old.name!==payload.name){const affected=resources.filter(row=>row.category_id===categoryForm.id||(!row.category_id&&row.category===old.name));await Promise.all(affected.map(row=>base44.entities.ClubResource.update(row.id,{category_id:categoryForm.id,category:payload.name})));}} else await base44.entities.ClubResourceCategory.create(payload);
      await Promise.all([queryClient.invalidateQueries({queryKey:['learn-categories',tenantId,clubId]}),queryClient.invalidateQueries({queryKey:['manage-club-resources',tenantId,clubId]}),queryClient.invalidateQueries({queryKey:['member-portal-learn']})]); setCategoryForm(EMPTY_CATEGORY); toast.success('Section saved');
    }catch(e){toast.error(e?.message||'Could not save section');}finally{setCategoryBusy(false);}
  };
  const addStarterCategories=async()=>{
    const existing=new Set(categories.map(row=>String(row.name||'').toLowerCase())); const missing=LEARN_STARTER_CATEGORIES.filter(([name])=>!existing.has(name.toLowerCase())); if(!missing.length)return toast.success('Starter sections are already in place.');
    setCategoryBusy(true); try{await Promise.all(missing.map(([name,description,icon],index)=>base44.entities.ClubResourceCategory.create({tenant_id:tenantId,club_id:clubId,name,description,icon_key:icon,sort_order:(categories.length+index+1)*10,status:'active'})));await queryClient.invalidateQueries({queryKey:['learn-categories',tenantId,clubId]});toast.success('Starter sections added');}catch(e){toast.error(e?.message||'Could not add starter sections');}finally{setCategoryBusy(false);}
  };
  const moveCategory=async(row,direction)=>{const peers=sortedCategories.filter(item=>item.status!=='archived');const index=peers.findIndex(item=>item.id===row.id);const other=peers[index+direction];if(!other)return;try{await Promise.all([base44.entities.ClubResourceCategory.update(row.id,{sort_order:Number(other.sort_order||0)}),base44.entities.ClubResourceCategory.update(other.id,{sort_order:Number(row.sort_order||0)})]);await Promise.all([queryClient.invalidateQueries({queryKey:['learn-categories',tenantId,clubId]}),queryClient.invalidateQueries({queryKey:['member-portal-learn']})]);}catch(e){toast.error(e?.message||'Could not reorder section');}};

  const saveSettings=async()=>{setSettingsSaving(true);try{const payload={tenant_id:tenantId,club_id:clubId,intro_text:settingsForm.intro_text.trim(),feedback_enabled:settingsForm.feedback_enabled!==false,contact_enabled:settingsForm.contact_enabled!==false,in_app_enabled:settingsForm.in_app_enabled!==false,contact_name:settingsForm.contact_name.trim(),contact_title:settingsForm.contact_title.trim(),contact_email:settingsForm.contact_email.trim(),whatsapp_number:settingsForm.whatsapp_number.trim(),updated_at:new Date().toISOString()};if(settingsLoadedId)await base44.entities.ClubLearnSettings.update(settingsLoadedId,payload);else{const created=await base44.entities.ClubLearnSettings.create(payload);setSettingsLoadedId(created.id||'');}await Promise.all([queryClient.invalidateQueries({queryKey:['learn-settings',tenantId,clubId]}),queryClient.invalidateQueries({queryKey:['member-portal-learn']})]);toast.success('Help & contact settings saved');}catch(e){toast.error(e?.message||'Could not save settings');}finally{setSettingsSaving(false);}};

  if(!canManage)return <div className="glass rounded-xl p-6 text-sm">Club administrator access required.</div>;
  if(!tenantId||!clubId)return <div className="glass rounded-xl p-6 text-sm">Choose an active RallyHub club before managing Learn.</div>;

  const previewData={club:memberLearn?.club||null,categories:sortedCategories.filter(row=>row.status==='active'),resources:resources.filter(row=>row.status==='published'),settings:{...EMPTY_SETTINGS,...settingsForm}};

  return <div className="mx-auto max-w-7xl space-y-5 pb-20 lg:pb-0">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><Link to="/app/learn" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"><ArrowLeft className="h-3.5 w-3.5" />Back to Learn</Link><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Club resources</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">Manage Learn</h1><p className="mt-1 text-sm text-muted-foreground">Build and maintain a searchable member resource library.</p></div><Button variant="outline" asChild><Link to="/app/learn"><BookOpen className="mr-2 h-4 w-4" />Member view</Link></Button></div>

    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-5">
        <TabsTrigger value="library" className="gap-1.5 py-2.5"><LayoutList className="h-4 w-4" />Library</TabsTrigger>
        <TabsTrigger value="add" className="gap-1.5 py-2.5"><Plus className="h-4 w-4" />Add Resource</TabsTrigger>
        <TabsTrigger value="sections" className="gap-1.5 py-2.5"><SlidersHorizontal className="h-4 w-4" />Sections</TabsTrigger>
        <TabsTrigger value="contact" className="gap-1.5 py-2.5"><MessageCircle className="h-4 w-4" />Help & Contact</TabsTrigger>
        <TabsTrigger value="preview" className="gap-1.5 py-2.5"><BookOpen className="h-4 w-4" />Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="library" className="mt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3"><GlassCard className="p-4"><p className="text-xs text-muted-foreground">Published</p><p className="mt-1 text-2xl font-black">{resources.filter(r=>r.status==='published').length}</p></GlassCard><GlassCard className="p-4"><p className="text-xs text-muted-foreground">Drafts</p><p className="mt-1 text-2xl font-black">{resources.filter(r=>r.status==='draft').length}</p></GlassCard><GlassCard className="p-4"><p className="text-xs text-muted-foreground">Sections</p><p className="mt-1 text-2xl font-black">{sortedCategories.filter(c=>c.status==='active').length}</p></GlassCard></div>
        <GlassCard className="p-3 sm:p-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={librarySearch} onChange={e=>setLibrarySearch(e.target.value)} placeholder="Search resources by title, description, section or file name"/></div><div className="mt-3 grid gap-2 sm:grid-cols-4"><Select value={libraryCategory} onValueChange={setLibraryCategory}><SelectTrigger><div className="flex items-center gap-2"><Filter className="h-3.5 w-3.5"/><SelectValue/></div></SelectTrigger><SelectContent><SelectItem value="all">All sections</SelectItem>{sortedCategories.map(c=><SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><Select value={libraryType} onValueChange={setLibraryType}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{LEARN_RESOURCE_TYPES.map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select><Select value={libraryStatus} onValueChange={setLibraryStatus}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="active">Published + drafts</SelectItem><SelectItem value="all">All statuses</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Drafts</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select><Button variant="ghost" onClick={()=>{setLibrarySearch('');setLibraryCategory('all');setLibraryType('all');setLibraryStatus('active');}}><X className="mr-1 h-4 w-4"/>Clear</Button></div><p className="mt-2 text-[11px] text-muted-foreground">{filteredResources.length} matching resources</p></GlassCard>
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-black">Resource library</h2><p className="text-xs text-muted-foreground">Members only see Published items.</p></div><Button onClick={()=>{resetForm();setTab('add');}}><Plus className="mr-1 h-4 w-4"/>Add resource</Button></div>
        {isLoading&&<GlassCard className="p-6 text-sm text-muted-foreground">Loading resources…</GlassCard>}{error&&<GlassCard className="p-6 text-sm text-destructive">{error.message||'Could not load resources.'}</GlassCard>}
        {!isLoading&&!error&&filteredResources.length===0&&<GlassCard className="p-8 text-center"><BookOpen className="mx-auto mb-2 h-7 w-7 text-muted-foreground"/><p className="font-semibold">No matching resources</p><p className="mt-1 text-xs text-muted-foreground">Change the filters or add a new resource.</p></GlassCard>}
        <div className="space-y-2">{filteredResources.map(row=>{const Icon=resourceIcon(row.resource_type);const peers=resources.filter(item=>item.category===row.category&&item.status!=='archived').sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0));const peerIndex=peers.findIndex(item=>item.id===row.id);return <GlassCard key={row.id} className={`p-3 sm:p-4 ${row.status==='archived'?'opacity-60':''}`}><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Icon className="h-4 w-4 text-primary"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{row.title}</p><Badge variant={row.status==='published'?'default':'outline'} className="text-[9px] capitalize">{row.status}</Badge><Badge variant="outline" className="text-[9px]">{row.category}</Badge></div>{row.description&&<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.description}</p>}<p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">{resourceTypeLabel(row.resource_type)}{row.file_name?` · ${row.file_name}`:''}</p></div><div className="flex shrink-0 items-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" disabled={peerIndex<=0||movingId===row.id} onClick={()=>moveResource(row,-1)}><ArrowUp className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="h-8 w-8" disabled={peerIndex<0||peerIndex>=peers.length-1||movingId===row.id} onClick={()=>moveResource(row,1)}><ArrowDown className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>editResource(row)}><Pencil className="h-4 w-4"/></Button></div></div>{row.status!=='archived'&&<div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3"><Button variant="outline" size="sm" onClick={()=>setResourceStatus(row,row.status==='published'?'draft':'published')}>{row.status==='published'?'Move to draft':<><CheckCircle2 className="mr-1 h-4 w-4"/>Publish</>}</Button><Button variant="ghost" size="sm" onClick={()=>setResourceStatus(row,'archived')}>Archive</Button>{row.url&&<a href={row.url} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Open source <ExternalLink className="h-3 w-3"/></a>}</div>}</GlassCard>})}</div>
      </TabsContent>

      <TabsContent value="add" className="mt-4"><GlassCard className="p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-black">{form.id?'Edit resource':'Add resource'}</h2><p className="mt-1 text-xs text-muted-foreground">Give each item a clear title and a short description so search works well.</p></div>{form.id&&<Button variant="ghost" size="sm" onClick={()=>{resetForm();setTab('library');}}><X className="mr-1 h-4 w-4"/>Cancel edit</Button>}</div><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Label>Title</Label><Input className="mt-1.5" value={form.title} onChange={e=>setField('title',e.target.value)} placeholder="e.g. King of the Court — 4 courts"/></div><div className="sm:col-span-2"><Label>Short description</Label><Textarea className="mt-1.5 min-h-20" value={form.description} onChange={e=>setField('description',e.target.value)} placeholder="What is this resource and when would a member use it?"/></div><div><Label>Section</Label><Select value={form.category_id||'none'} onValueChange={value=>{const category=sortedCategories.find(c=>c.id===value);if(category)setForm(current=>({...current,category_id:category.id,category:category.name}));}}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose section"/></SelectTrigger><SelectContent>{sortedCategories.filter(c=>c.status==='active').map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>{!sortedCategories.length&&<p className="mt-1 text-[11px] text-destructive">Create a section first.</p>}</div><div><Label>Resource type</Label><Select value={form.resource_type} onValueChange={value=>setField('resource_type',value)}><SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger><SelectContent>{LEARN_RESOURCE_TYPES.filter(([v])=>v!=='all').map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div><div><Label>Source</Label><Select value={form.source_kind} onValueChange={value=>{setField('source_kind',value);setSelectedFile(null);setUploadMessage('');}}><SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="external_link">Paste a link</SelectItem><SelectItem value="uploaded_file">Upload a file</SelectItem></SelectContent></Select></div><div><Label>Status</Label><Select value={form.status} onValueChange={value=>setField('status',value)}><SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>{form.source_kind==='external_link'?<div className="sm:col-span-2"><Label>Link</Label><Input className="mt-1.5" value={form.url} onChange={e=>setField('url',e.target.value)} placeholder="YouTube, Google Drive or another web link"/><p className="mt-1 text-[11px] text-muted-foreground">YouTube videos play inside Learn. Other links open in a new tab.</p></div>:<div className="sm:col-span-2 rounded-xl border border-dashed border-border bg-secondary/20 p-4"><Label>Upload PNG, JPG, WEBP or PDF</Label><div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf,.pdf" onChange={e=>chooseFile(e.target.files?.[0])} className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-primary-foreground"/>{form.url&&!selectedFile&&<a href={form.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline">Current file <ExternalLink className="h-3 w-3"/></a>}</div>{uploadMessage&&<p className="mt-2 text-xs text-muted-foreground">{uploadMessage}</p>}</div>}<div><Label>Display order</Label><Input className="mt-1.5" type="number" value={form.sort_order} onChange={e=>setField('sort_order',Number(e.target.value||0))}/></div><div className="flex items-end"><Button className="w-full" disabled={saving||!sortedCategories.length} onClick={saveResource}>{saving?<Upload className="mr-2 h-4 w-4 animate-pulse"/>:<Save className="mr-2 h-4 w-4"/>}{saving?'Saving…':form.id?'Save changes':'Add resource'}</Button></div></div></GlassCard></TabsContent>

      <TabsContent value="sections" className="mt-4 space-y-4"><GlassCard className="p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black">Learn sections</h2><p className="mt-1 text-xs text-muted-foreground">Sections are tenant-managed. Rename, reorder or hide them without changing code.</p></div><Button variant="outline" onClick={addStarterCategories} disabled={categoryBusy}>Add starter sections</Button></div></GlassCard><GlassCard className="p-4 sm:p-5"><div className="grid gap-3 sm:grid-cols-2"><div><Label>Section name</Label><Input className="mt-1.5" value={categoryForm.name} onChange={e=>setCategoryForm(v=>({...v,name:e.target.value}))} placeholder="e.g. Game Formats"/></div><div><Label>Status</Label><Select value={categoryForm.status} onValueChange={value=>setCategoryForm(v=>({...v,status:value}))}><SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="hidden">Hidden</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div><div className="sm:col-span-2"><Label>Short description</Label><Input className="mt-1.5" value={categoryForm.description} onChange={e=>setCategoryForm(v=>({...v,description:e.target.value}))} placeholder="Shown under the section heading in Learn"/></div><div><Label>Order</Label><Input className="mt-1.5" type="number" value={categoryForm.sort_order} onChange={e=>setCategoryForm(v=>({...v,sort_order:Number(e.target.value||0)}))}/></div><div className="flex items-end gap-2"><Button className="flex-1" onClick={saveCategory} disabled={categoryBusy}><Save className="mr-2 h-4 w-4"/>{categoryForm.id?'Save section':'Add section'}</Button>{categoryForm.id&&<Button variant="ghost" onClick={()=>setCategoryForm(EMPTY_CATEGORY)}>Cancel</Button>}</div></div></GlassCard><div className="space-y-2">{sortedCategories.map((row,index)=><GlassCard key={row.id} className={`p-4 ${row.status==='archived'?'opacity-60':''}`}><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{row.name}</p><Badge variant="outline" className="text-[9px] capitalize">{row.status}</Badge><Badge variant="outline" className="text-[9px]">{resources.filter(r=>r.category===row.name&&r.status!=='archived').length} resources</Badge></div>{row.description&&<p className="mt-1 text-xs text-muted-foreground">{row.description}</p>}</div><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" disabled={index===0} onClick={()=>moveCategory(row,-1)}><ArrowUp className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="h-8 w-8" disabled={index===sortedCategories.length-1} onClick={()=>moveCategory(row,1)}><ArrowDown className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>setCategoryForm({...EMPTY_CATEGORY,...row})}><Pencil className="h-4 w-4"/></Button></div></div></GlassCard>)}</div></TabsContent>

      <TabsContent value="contact" className="mt-4"><GlassCard className="p-4 sm:p-5"><div className="mb-5"><h2 className="font-black">Help, suggestions & contact</h2><p className="mt-1 text-xs text-muted-foreground">Control what members see at the top and bottom of Learn when they need help or want to suggest something.</p></div><div className="space-y-5"><div><Label>Learn introduction</Label><Textarea className="mt-1.5" rows={3} value={settingsForm.intro_text} onChange={e=>setSettingsForm(v=>({...v,intro_text:e.target.value}))}/></div><div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center justify-between gap-3 rounded-xl border p-4"><span><strong className="text-sm">Suggestions & feedback</strong><span className="mt-0.5 block text-xs text-muted-foreground">Shows a button that sends Learn feedback into RallyHub’s feedback queue.</span></span><Switch checked={settingsForm.feedback_enabled!==false} onCheckedChange={checked=>setSettingsForm(v=>({...v,feedback_enabled:checked}))}/></label><label className="flex items-center justify-between gap-3 rounded-xl border p-4"><span><strong className="text-sm">Contact area</strong><span className="mt-0.5 block text-xs text-muted-foreground">Shows contact options at the bottom of Learn.</span></span><Switch checked={settingsForm.contact_enabled!==false} onCheckedChange={checked=>setSettingsForm(v=>({...v,contact_enabled:checked}))}/></label></div><div className="grid gap-4 sm:grid-cols-2"><div><Label>Contact name</Label><Input className="mt-1.5" value={settingsForm.contact_name} onChange={e=>setSettingsForm(v=>({...v,contact_name:e.target.value}))}/></div><div><Label>Role / title</Label><Input className="mt-1.5" value={settingsForm.contact_title} onChange={e=>setSettingsForm(v=>({...v,contact_title:e.target.value}))}/></div><div><Label>Email</Label><Input className="mt-1.5" type="email" value={settingsForm.contact_email} onChange={e=>setSettingsForm(v=>({...v,contact_email:e.target.value}))}/></div><div><Label>WhatsApp number</Label><Input className="mt-1.5" value={settingsForm.whatsapp_number} onChange={e=>setSettingsForm(v=>({...v,whatsapp_number:e.target.value}))} placeholder="Prefer international format, e.g. +353…"/></div></div><label className="flex items-center justify-between gap-3 rounded-xl border p-4"><span><strong className="text-sm">In-app message button</strong><span className="mt-0.5 block text-xs text-muted-foreground">Links members straight to RallyHub Messages.</span></span><Switch checked={settingsForm.in_app_enabled!==false} onCheckedChange={checked=>setSettingsForm(v=>({...v,in_app_enabled:checked}))}/></label><Button onClick={saveSettings} disabled={settingsSaving}><Save className="mr-2 h-4 w-4"/>{settingsSaving?'Saving…':'Save Help & Contact'}</Button></div></GlassCard></TabsContent>

      <TabsContent value="preview" className="mt-4"><div className="rounded-2xl border bg-background p-3 sm:p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-black">Member preview</h2><p className="text-xs text-muted-foreground">Published resources only. Search, filters, sections and contact layout are shown exactly as members use them.</p></div><Badge variant="outline">Preview</Badge></div><MemberLearn previewData={previewData}/></div></TabsContent>
    </Tabs>
  </div>;
}
