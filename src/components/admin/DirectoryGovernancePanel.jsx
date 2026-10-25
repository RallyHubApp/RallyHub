import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Directory-only functions; server verifies two immutable super-admin IDs again.
// This component never calls platform/tenant people services or sends communications.
async function callDirectory(action, body = {}) {
  const response = await base44.functions.invoke('directoryGovernance', {action, ...body});
  if (!response?.data?.success) throw new Error(response?.data?.error || 'Directory action unavailable');
  return response.data;
}
const blank = {name:'',purpose:'tournaments_events',subject:'',bodyText:'',county:'',topic:'',clubSlug:'',utmCampaign:''};
function Field({label,value,onChange,placeholder='',type='text',required=false}) {
  return <label className="block space-y-1 text-xs font-semibold"><span>{label}</span><Input type={type} required={required} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} /></label>;
}
function CampaignsAndConsent({overview, refresh}) {
  const [form,setForm] = useState(blank);
  const [editingId,setEditingId] = useState('');
  const [preview,setPreview] = useState(null);
  const [deliveryPreflight,setDeliveryPreflight] = useState(null);
  const [busy,setBusy] = useState('');
  const [error,setError] = useState('');
  const [suppressionEmail,setSuppressionEmail] = useState('');
  const [suppressionReason,setSuppressionReason] = useState('Consent withdrawal');
  const change = (key,value) => {setForm(p=>({...p,[key]:value}));setPreview(null);setDeliveryPreflight(null);};
  const perform = async (label,work) => {setBusy(label);setError('');try{await work();await refresh();}catch(e){setError(e.message||'Directory operation failed');}finally{setBusy('');}};
  const selectCampaign = item => {setEditingId(item.id);setForm({name:item.name||'',purpose:item.purpose||'tournaments_events',subject:item.subject||'',bodyText:item.bodyText||'',county:item.county||'',topic:item.topic||'',clubSlug:item.clubSlug||'',utmCampaign:item.utmCampaign||''});setPreview(null);setDeliveryPreflight(null);};
  const save = () => perform('save',async()=>{const result=await callDirectory('admin_save_draft',{campaignId:editingId,...form});setEditingId(result.campaign.id);toast.success('Directory campaign draft saved');});
  const previewAudience = () => perform('preview',async()=>{if(!editingId)throw Error('Save the draft before previewing its audience');const data=await callDirectory('admin_preview_campaign',{campaignId:editingId});setPreview(data.preview);});
  const approve = () => perform('approve',async()=>{if(!editingId||!preview)throw Error('Preview the audience first');if(!window.confirm('Approve the Directory campaign content? This will NOT send any messages.'))return;await callDirectory('admin_approve_campaign',{campaignId:editingId,confirmApproval:true});toast.success('Content approved. Sending remains disabled.');});
  const deliveryCheck = () => perform('delivery-check',async()=>{if(!editingId)throw Error('Select an approved Directory campaign');const data=await callDirectory('admin_delivery_preflight',{campaignId:editingId});setDeliveryPreflight(data.preflight);});
  const prepareOnly = () => perform('delivery-prepare',async()=>{if(!editingId||!deliveryPreflight||deliveryPreflight.issues?.length)throw Error('Run a successful delivery preflight first');if(!window.confirm('Prepare consent-based delivery records? This does NOT send anything.'))return;const data=await callDirectory('admin_prepare_delivery',{campaignId:editingId,confirmPrepare:'PREPARE ONLY'});toast.success(`${data.newlyPrepared} prepared; ${data.alreadyPrepared} already prepared. Nothing sent.`);setDeliveryPreflight(data.preflight);});
  const suppress = () => perform('suppress',async()=>{await callDirectory('admin_suppress_email',{email:suppressionEmail,reason:suppressionReason});setSuppressionEmail('');toast.success('Directory-only email suppression saved');});
  return <div className="space-y-6">
    <div className="space-y-2"><h2 className="text-xl font-bold">Directory campaigns & consent</h2><p className="text-sm text-muted-foreground">Prepare a Directory campaign, segment subscribers by opt-in, review exclusions and approve content. **No email, WhatsApp or social publishing is enabled here.** This does not use Clare Pickleball membership lists.</p></div>
    <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
      <section className="rounded-xl border p-4 space-y-3"><h3 className="font-bold">Campaign drafts and approvals</h3>
        {(overview?.campaigns||[]).map(row=><button type="button" key={row.id} onClick={()=>selectCampaign(row)} className={`block w-full rounded-lg border p-3 text-left text-sm ${editingId===row.id?'border-primary':'border-border'}`}><strong>{row.name}</strong><span className="ml-2 text-xs text-muted-foreground">{row.status}</span><p className="text-xs text-muted-foreground">{row.purpose} · {row.channel}</p></button>)}
        {!overview?.campaigns?.length && <p className="text-sm text-muted-foreground">No Directory campaign drafts yet.</p>}
        <Button type="button" variant="outline" onClick={()=>{setEditingId('');setForm(blank);setPreview(null);}}>New campaign draft</Button>
      </section>
      <section className="rounded-xl border p-4 space-y-3"><h3 className="font-bold">{editingId?'Edit Directory campaign':'New Directory campaign'}</h3>
        <Field label="Campaign name" required value={form.name} onChange={v=>change('name',v)}/>
        <label className="block space-y-1 text-xs font-semibold">Purpose <select className="w-full rounded-md border bg-background p-2 text-sm" value={form.purpose} onChange={e=>change('purpose',e.target.value)}><option value="tournaments_events">Events and tournaments</option><option value="coaching">Coaching</option><option value="club_updates">Club updates</option></select></label>
        <Field label="Email subject" required value={form.subject} onChange={v=>change('subject',v)}/>
        <label className="block space-y-1 text-xs font-semibold">Plain-text email content<textarea className="min-h-32 w-full rounded-md border bg-background p-2 text-sm" value={form.bodyText} onChange={e=>change('bodyText',e.target.value)} maxLength={12000}/></label>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="County filter (optional)" value={form.county} onChange={v=>change('county',v)}/><Field label="Club slug filter (optional)" value={form.clubSlug} onChange={v=>change('clubSlug',v)}/><Field label="Topic filter (optional)" value={form.topic} onChange={v=>change('topic',v)} placeholder="tournaments_events"/><Field label="UTM campaign identifier" value={form.utmCampaign} onChange={v=>change('utmCampaign',v)}/></div>
        <p className="text-xs text-muted-foreground">Sender: rallyhubapp@gmail.com · Active Directory email consent only · 24-month consent freshness rule for this preview. A provider accepting an email does not mean delivered.</p>
        <div className="flex flex-wrap gap-2"><Button type="button" onClick={save} disabled={!!busy}>Save draft</Button><Button type="button" variant="outline" onClick={previewAudience} disabled={!editingId||!!busy}>Preview eligible audience</Button><Button type="button" variant="outline" onClick={approve} disabled={!editingId||!preview||!!busy}>Approve content only</Button></div>
        <section className="rounded-lg border border-border p-3 space-y-2" aria-label="Directory delivery preparation"><h4 className="font-bold text-sm">Controlled delivery preparation</h4><p className="text-xs text-muted-foreground">Approved campaigns only. Refreshes live consent and suppression eligibility before preparing auditable, deduplicated records. No email is dispatched or marked delivered.</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={!editingId||!!busy} onClick={deliveryCheck}>Run delivery preflight</Button><Button type="button" variant="outline" disabled={!editingId||!deliveryPreflight||deliveryPreflight.issues?.length>0||!!busy} onClick={prepareOnly}>Prepare records only (no sends)</Button></div>{deliveryPreflight&&<div className="rounded-md border p-2 text-xs"><p>{deliveryPreflight.eligibleCount} eligible · {deliveryPreflight.preparedCount} preparable · sending disabled</p>{(deliveryPreflight.issues||[]).map((issue,i)=><p key={i} className="text-destructive">{issue}</p>)}</div>}</section>
        {preview && <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-3 space-y-2"><strong>Audience preview: {preview.eligibleCount} eligible</strong><p className="text-xs">Excluded by consent, preferences, segmentation and suppression:</p><div className="grid grid-cols-2 gap-1 text-xs">{Object.entries(preview.excluded||{}).map(([key,count])=><span key={key}>{key.replaceAll(/([A-Z])/g,' $1')}: {count}</span>)}</div><p className="text-xs font-bold">Sending disabled · Preview does not contact recipients.</p><iframe sandbox="" title="Branded Directory campaign email preview" srcDoc={preview.html||''} className="h-96 w-full rounded-lg border bg-white" /></div>}
      </section>
    </div>
    <section className="rounded-xl border p-4 space-y-3"><h3 className="font-bold">Directory suppression register</h3><p className="text-sm text-muted-foreground">{overview?.suppressionCounts?.active??'—'} active suppression(s). Email addresses are hashed before they are stored in the protected Directory suppression entity.</p>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Email to suppress" type="email" value={suppressionEmail} onChange={setSuppressionEmail}/><Field label="Reason" value={suppressionReason} onChange={setSuppressionReason}/></div>
      <Button type="button" variant="outline" disabled={!!busy||!suppressionEmail} onClick={suppress}>Add Directory-only suppression</Button>
    </section>
    {error && <p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-destructive">{error}</p>}
  </div>;
}
function IdentityAndExport({overview,refresh}) {
  const [form,setForm]=useState({directoryPersonKind:'subscriber',directoryPersonId:'',tenantId:'',tenantPersonId:'',purpose:'',directoryConsentReference:'',tenantConsentReference:'',sourceProvenance:''});
  const [manifest,setManifest]=useState(null);
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');
  const change=(key,v)=>setForm(p=>({...p,[key]:v}));
  const execute=async(label,fn)=>{setBusy(label);setError('');try{await fn();await refresh();}catch(e){setError(e?.message||'Directory operation failed');}finally{setBusy('');}};
  const propose=()=>execute('link',async()=>{const result=await callDirectory('admin_propose_identity_link',form);toast.success(`Link proposal saved: ${result.linkId}. No tenant sync or permissions granted.`);setForm(p=>({...p,directoryPersonId:'',tenantPersonId:'',directoryConsentReference:'',tenantConsentReference:'',sourceProvenance:''}));});
  const revoke=linkId=>execute('revoke',async()=>{if(!window.confirm('Revoke this Directory identity-link proposal?'))return;await callDirectory('admin_revoke_identity_link',{linkId});toast.success('Directory link proposal revoked');});
  const loadManifest=()=>execute('manifest',async()=>{const data=await callDirectory('admin_export_manifest');setManifest(data.manifest);});
  const download=()=>execute('export',async()=>{
    if(!window.confirm('Export private Directory data to this device? Store the file securely and do not share it with club users.'))return;
    const data=await callDirectory('admin_export_snapshot',{confirmExport:'EXPORT DIRECTORY'});
    const file=new Blob([JSON.stringify(data.archive,null,2)],{type:'application/json'}),url=URL.createObjectURL(file),link=document.createElement('a');
    link.href=url;link.download=`rallyhub-directory-export-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
    toast.success('Directory snapshot downloaded; restore rehearsal remains a separate test');
  });
  return <div className="space-y-6">
    <h2 className="text-xl font-bold">Directory governance & portability</h2><p className="text-sm text-muted-foreground">Directory profiles, subscriptions and tenant memberships have independent consent and permissions. Proposed identity links are only references; they never merge records, grant club roles or activate syncing.</p>
    <section className="rounded-xl border p-4 space-y-3"><h3 className="font-bold">Explicit cross-domain identity-link proposals</h3><p className="text-xs text-muted-foreground">The tenant-side consent evidence must be independently verified before a proposed link can ever be activated. Activation is deliberately not available in this phase of the interface.</p>
      <label className="block text-xs font-semibold">Directory identity type<select className="mt-1 w-full rounded-md border bg-background p-2 text-sm" value={form.directoryPersonKind} onChange={e=>change('directoryPersonKind',e.target.value)}><option value="subscriber">Directory subscriber</option><option value="listing_access">Directory listing owner/editor access</option></select></label>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Directory record ID" value={form.directoryPersonId} onChange={v=>change('directoryPersonId',v)}/><Field label="Tenant ID" value={form.tenantId} onChange={v=>change('tenantId',v)}/><Field label="Tenant person ID" value={form.tenantPersonId} onChange={v=>change('tenantPersonId',v)}/><Field label="Link purpose" value={form.purpose} onChange={v=>change('purpose',v)}/><Field label="Directory consent evidence ID" value={form.directoryConsentReference} onChange={v=>change('directoryConsentReference',v)}/><Field label="Tenant consent evidence ID" value={form.tenantConsentReference} onChange={v=>change('tenantConsentReference',v)}/></div>
      <Field label="Source and verification provenance" value={form.sourceProvenance} onChange={v=>change('sourceProvenance',v)}/>
      <Button type="button" disabled={!!busy} onClick={propose}>Record link proposal (no sync)</Button>
      {(overview?.links||[]).map(link=><div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-xs" key={link.id}><span>{link.directoryPersonKind}: {link.directoryPersonId} → tenant {link.tenantId} · {link.status}<span className="block text-muted-foreground">{link.purpose}</span></span>{link.status==='proposed'&&<Button type="button" variant="outline" size="sm" disabled={!!busy} onClick={()=>revoke(link.id)}>Revoke proposal</Button>}</div>)}
    </section>
    <section className="rounded-xl border p-4 space-y-3"><h3 className="font-bold">Standalone Directory export</h3><p className="text-xs text-muted-foreground">Private super-admin-only snapshot of all Directory entities using cursor pagination. Authentication secrets and unsubscribe tokens are excluded and must be reissued in a restored environment; adapters are listed in the manifest.</p>
      <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={!!busy} onClick={loadManifest}>Reconcile export inventory</Button><Button type="button" disabled={!!busy||!manifest} onClick={download}>Download protected snapshot</Button></div>
      {manifest&&<div className="rounded-lg border p-3 space-y-1 text-xs"><strong>Export manifest: {manifest.entityNames?.length} entity types</strong><p>Generated: {manifest.generatedAt}</p><div className="grid gap-1 sm:grid-cols-2">{Object.entries(manifest.counts||{}).map(([name,count])=><div key={name}>{name}: {count}</div>)}</div><p>Standalone restore and identity-link verification remain mandatory before portability sign-off.</p></div>}
    </section>
    {error && <p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-destructive">{error}</p>}
  </div>;
}
export default function DirectoryGovernancePanel({mode='campaigns'}) {
  const queryClient=useQueryClient();
  const {data:overview,isLoading,isError,refetch}=useQuery({queryKey:['directory-governance-overview'],queryFn:()=>callDirectory('admin_overview'),retry:false,refetchOnWindowFocus:true});
  const refresh=async()=>{await queryClient.invalidateQueries({queryKey:['directory-governance-overview']});await refetch();};
  return <div className="glass rounded-xl p-4 sm:p-6 space-y-4">
    {isLoading && <p className="text-sm text-muted-foreground">Loading Directory governance…</p>}
    {isError && <div className="rounded-lg border border-destructive p-3 text-sm"><p>Directory governance is unavailable. The backend and schemas may not have been deployed.</p><Button type="button" variant="outline" className="mt-2" onClick={()=>refetch()}>Retry</Button></div>}
    {!isLoading&&!isError&&(mode==='campaigns'?<CampaignsAndConsent overview={overview} refresh={refresh}/>:<IdentityAndExport overview={overview} refresh={refresh}/>)}
  </div>;
}
