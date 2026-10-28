import React,{useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {Mail,RefreshCw} from 'lucide-react';

export default function SupplierInvitationBatch(){
 const qc=useQueryClient();
 const [selected,setSelected]=useState([]);
 const [preview,setPreview]=useState(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [statuses,setStatuses]=useState({});
 const {data,isLoading,isError,refetch}=useQuery({
  queryKey:['supplier-invitation-candidates'],
  queryFn:async()=>{
   const {data}=await base44.functions.invoke('directoryClaim',{action:'list_supplier_invitation_candidates'});
   if(data?.error)throw Error(data.error);
   return data;
  },
  staleTime:60_000,refetchOnWindowFocus:false,refetchOnMount:false,retry:false
 });
 const rows=data?.candidates||[];
 const available=rows.filter(r=>r.status==='ready'&&!statuses[r.slug]?.sent);
 const picked=available.filter(r=>selected.includes(r.slug));
 const reset=()=>{setPreview(null);setError('')};
 const toggle=(slug)=>{setSelected(s=>s.includes(slug)?s.filter(x=>x!==slug):[...s,slug]);reset()};
 const loadPreview=async()=>{
  if(!picked.length||busy)return;
  setBusy(true);setError('');setPreview(null);
  try{
   const {data}=await base44.functions.invoke('directoryClaim',{action:'preview_supplier_invitation',listingSlug:picked[0].slug});
   if(data?.error||!data?.html||!data?.previewOnly)throw Error(data?.error||'Supplier HTML preview unavailable');
   setPreview(data);
  }catch(e){setError(e?.response?.data?.error||e.message||'Preview failed');}
  finally{setBusy(false)}
 };
 const approve=async()=>{
  if(!preview||preview.template?.status!=='draft'||busy)return;
  if(!window.confirm('Approve this reviewed supplier invitation template in the Communications Centre? No supplier emails will be sent.'))return;
  setBusy(true);setError('');
  try{
   const {data}=await base44.functions.invoke('directoryClaim',{action:'approve_supplier_invitation_template',templateId:preview.template.id});
   if(data?.error||!data?.approved)throw Error(data?.error||'Template approval not confirmed');
   toast.success('Supplier template approved in the Communications Centre. No emails sent.');
   setPreview(null);await refetch();
  }catch(e){setError(e?.response?.data?.error||e.message);}
  finally{setBusy(false)}
 };
 const send=async()=>{
  if(!preview||preview.template?.status!=='approved'||!picked.length||busy)return;
  if(!window.confirm('Send the approved supplier invitation to exactly '+picked.length+' selected supplier'+(picked.length===1?'':'s')+'? Each receives a unique personal claim link.'))return;
  setBusy(true);setError('');
  let sent=0;
  for(const candidate of picked){
   try{
    const {data}=await base44.functions.invoke('directoryClaim',{action:'send_claim_invite',listingSlug:candidate.slug,contactEmail:candidate.contactEmail,contactName:candidate.contactName||'there'});
    if(data?.error||data?.sent!==true)throw Error(data?.error||'Delivery not confirmed');
    setStatuses(prev=>({...prev,[candidate.slug]:{sent:true}}));
    setSelected(prev=>prev.filter(s=>s!==candidate.slug));
    sent++;
   }catch(e){
    setError('Stopped after '+sent+' confirmed send'+(sent===1?'':'s')+'. '+candidate.name+': '+(e?.response?.data?.error||e.message||'Delivery unconfirmed')+'. Check the invitation record before attempting a resend.');
    break;
   }
  }
  setPreview(null);setBusy(false);
  await qc.invalidateQueries({queryKey:['supplier-invitation-candidates']});
  if(sent)toast.success(sent+' supplier invitation'+(sent===1?'':'s')+' sent');
 };
 return <section className="glass rounded-xl border border-primary/30 p-4 sm:p-5 space-y-4" data-testid="supplier-invitation-batch">
  <div className="flex flex-wrap justify-between gap-3">
   <div><h3 className="text-lg font-bold flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/> Supplier invitation mailing</h3>
   <p className="text-sm text-muted-foreground mt-1">Three prepared supplier profiles only. Select recipients, preview one standard HTML email, then approve the master template before sending.</p></div>
   <Button size="sm" variant="outline" disabled={busy} onClick={()=>{reset();refetch()}}><RefreshCw className="mr-2 h-4 w-4"/> Refresh</Button>
  </div>
  {isLoading&&<p>Loading supplier list…</p>}
  {isError&&<p role="alert" className="text-destructive">Supplier list temporarily unavailable. Refresh to retry.</p>}
  {!isLoading&&!isError&&<>
   <div className="text-sm font-semibold">{rows.length} suppliers · {available.length} available · {picked.length} selected · Template: {data?.template?.status||'unavailable'}</div>
   <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={()=>{setSelected(available.map(c=>c.slug));reset()}} disabled={busy}>Select all available</Button><Button variant="ghost" size="sm" onClick={()=>{setSelected([]);reset()}} disabled={busy}>Clear selection</Button></div>
   <div className="rounded-lg border divide-y">
    {rows.map(c=><label key={c.slug} className="flex gap-3 items-center p-3 text-sm" data-testid={'supplier-row-'+c.slug}>
     <input type="checkbox" disabled={busy||c.status!=='ready'||!!statuses[c.slug]?.sent} checked={picked.some(x=>x.slug===c.slug)} onChange={()=>toggle(c.slug)} className="h-4 w-4 accent-primary"/>
     <span className="flex-1 min-w-0"><strong className="block">{c.name}</strong><span className="text-xs text-muted-foreground">{c.contactEmail}</span></span>
     <span className="text-xs text-muted-foreground">{statuses[c.slug]?.sent?'Sent':c.status==='ready'?'Ready':c.status}</span>
    </label>)}
   </div>
   {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
   {preview&&<div className="space-y-3 rounded-lg border p-3" data-testid="supplier-html-preview">
    <p className="font-bold">One standard HTML preview for {picked.length} selected supplier{picked.length===1?'':'s'}</p>
    <p className="text-xs text-muted-foreground">Sample: {preview.sampleName} · To: {preview.to} · Subject: {preview.subject}. Each actual invitation will use its own business name and secure claim link. Preview links are inactive.</p>
    <p className="text-xs font-semibold">Communications Centre template: {preview.template?.status} · {preview.template?.version}</p>
    <iframe title="Supplier invitation HTML preview" srcDoc={preview.html} sandbox="" className="w-full h-[710px] rounded-lg border bg-white"/>
   </div>}
   <div className="flex flex-wrap gap-2">
    <Button onClick={loadPreview} disabled={busy||!picked.length}>{busy?'Working…':'Preview one HTML email for '+picked.length+' selected'}</Button>
    {preview?.template?.status==='draft'&&<Button variant="outline" disabled={busy} onClick={approve}>Approve supplier template (no send)</Button>}
    {preview?.template?.status==='approved'&&<Button disabled={busy||!picked.length} onClick={send}>Send only {picked.length} selected</Button>}
   </div>
   <p className="text-xs text-muted-foreground">No email is sent by selecting, previewing or approving the template. Sending requires the final confirmation. Already-invited and claimed listings cannot be selected.</p>
  </>}
 </section>;
}
