import React,{useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {Mail,RefreshCw,CheckCircle2} from 'lucide-react';

/**
 * Super-admin only: choose the coach recipients explicitly, review the selection,
 * and release only those checked. Empty selection is the safe default.
 */
export default function CoachInvitationBatch(){
  const queryClient=useQueryClient();
  const [selected,setSelected]=useState([]);
  const [reviewing,setReviewing]=useState(false);
  const [previews,setPreviews]=useState({});
  const [previewSlug,setPreviewSlug]=useState('');
  const [previewBusy,setPreviewBusy]=useState(false);
  const [previewError,setPreviewError]=useState('');
  const [customBySlug,setCustomBySlug]=useState({});
  const [personalising,setPersonalising]=useState(false);
  const [masterEditing,setMasterEditing]=useState(false);
  const [masterBusy,setMasterBusy]=useState(false);
  const [master,setMaster]=useState(null);
  const [masterSubject,setMasterSubject]=useState('');
  const [masterBody,setMasterBody]=useState('');
  const [masterMessage,setMasterMessage]=useState('');
  const [masterRendered,setMasterRendered]=useState(null);
  const [sending,setSending]=useState(false);
  const [results,setResults]=useState({});
  const {data,isLoading,isError,error,refetch}=useQuery({
    queryKey:['directory-coach-invitation-candidates'],
    queryFn:async()=>{
      const {data}=await base44.functions.invoke('directoryClaim',{action:'list_coach_invitation_candidates'});
      if(data?.error){const err=new Error(data.error);err.response={status:data.code==='DIRECTORY_RATE_LIMIT'?429:400};throw err;}
      return data;
    },
    staleTime:60_000,
    refetchOnWindowFocus:false,
    refetchOnMount:false,
    retry:(failures,error)=>failures<3 && (error?.response?.status===429 || /Rate limit exceeded|DIRECTORY_RATE_LIMIT|status code 429/i.test(error?.message||'')),
    retryDelay:attempt=>Math.min(10_000*(attempt+1),25_000),
  });
  const coaches=data?.candidates||[];
  const ready=coaches.filter(c=>c.inviteStatus==='ready' && !results[c.slug]?.sent);
  const selectedReady=useMemo(()=>ready.filter(c=>selected.includes(c.slug)),[ready,selected]);
  const toggle=slug=>{if(sending)return;setReviewing(false);setPreviews({});setPersonalising(false);setSelected(v=>v.includes(slug)?v.filter(x=>x!==slug):[...v,slug])};
  const chooseAll=()=>{if(sending)return;setSelected(ready.map(c=>c.slug));setReviewing(false);setPreviews({});setPersonalising(false)};
  const clear=()=>{if(sending)return;setSelected([]);setReviewing(false);setPreviews({});setPersonalising(false)};
  const loadPreviews=async()=>{
    if(!selectedReady.length||previewBusy||sending)return;
    setPreviewBusy(true);setPreviewError('');setReviewing(false);setPreviews({});setPersonalising(false);
    const all={};
    try{
      const templateResult=await base44.functions.invoke('directoryClaim',{action:'coach_invitation_template_get'});
      if(templateResult.data?.error||!templateResult.data?.approved)throw Error('Approved Communications Centre template unavailable');
      setMaster(templateResult.data);
      setMasterSubject(templateResult.data.draft?.subject||templateResult.data.approved.subject||'');
      setMasterBody(templateResult.data.draft?.body||templateResult.data.approved.body||'');
      setMasterRendered(null);
      for(const c of selectedReady){
        const override=customBySlug[c.slug]||{};
        const response=await base44.functions.invoke('directoryClaim',{action:'preview_coach_invitation',listingSlug:c.slug,...(override.body?{customText:override.body}:{}),...(override.subject?{customSubject:override.subject}:{})});
        if(response.data?.error||!response.data?.previewOnly||!response.data?.html)throw Error(c.name+': '+(response.data?.error||'HTML preview unavailable'));
        all[c.slug]=response.data;
      }
      setPreviews(all);
      setPreviewSlug(selectedReady[0].slug);
      setReviewing(true);
    }catch(err){setPreviewError(err?.response?.data?.error||err.message||'Could not load approved email preview');}
    finally{setPreviewBusy(false)}
  };
  const personalise=async()=>{
    const slug=previewSlug;
    const fields=customBySlug[slug]||{};
    if(!slug||!fields.body)return;
    setPreviewBusy(true);setPreviewError('');
    try{
      const {data}=await base44.functions.invoke('directoryClaim',{action:'preview_coach_invitation',listingSlug:slug,customText:fields.body,customSubject:fields.subject||''});
      if(data?.error||!data?.html)throw Error(data?.error||'Preview failed');
      setPreviews(v=>({...v,[slug]:data}));setPersonalising(false);
    }catch(e){setPreviews(v=>{const copy={...v};delete copy[slug];return copy});setPreviewError(e?.response?.data?.error||e.message)}
    finally{setPreviewBusy(false)}
  };
  const previewMaster=async()=>{
    if(!previewSlug)return;
    setMasterBusy(true);setMasterMessage('');setMasterRendered(null);
    try{
      const {data}=await base44.functions.invoke('directoryClaim',{action:'preview_coach_invitation',listingSlug:previewSlug,customText:masterBody,customSubject:masterSubject});
      if(data?.error||!data?.html)throw Error(data?.error||'Could not render master preview');
      setMasterRendered({html:data.html,subject:masterSubject,body:masterBody});
      setMasterMessage('This is how the edited master will appear. Save as Draft, then Approve.');
    }catch(e){setMasterMessage(e?.response?.data?.error||e.message)}
    finally{setMasterBusy(false)}
  };
  const saveMaster=async()=>{
    setMasterBusy(true);setMasterMessage('');
    try{
      const {data}=await base44.functions.invoke('directoryClaim',{action:'coach_invitation_template_save',subject:masterSubject,message:masterBody});
      if(data?.error)throw Error(data.error);
      setMaster(v=>({...v,draft:{id:data.id,subject:masterSubject,body:masterBody,version:'draft'}}));
      setMasterMessage('Saved in Communications Centre as a draft. The approved sending version is unchanged.');
    }catch(e){setMasterMessage(e?.response?.data?.error||e.message)}
    finally{setMasterBusy(false)}
  };
  const approveMaster=async()=>{
    if(!master?.draft?.id||masterBusy)return;
    if(!window.confirm('Approve this saved draft as the new master coaching invitation in Communications Centre? No emails will be sent.'))return;
    setMasterBusy(true);setMasterMessage('');
    try{
      const {data}=await base44.functions.invoke('directoryClaim',{action:'coach_invitation_template_approve',draftId:master.draft.id});
      if(data?.error)throw Error(data.error);
      setMasterMessage('New master approved in Communications Centre. Reload preview to see the approved version before sending.');
      setMaster(null);setPreviews({});setReviewing(false);setMasterEditing(false);
    }catch(e){setMasterMessage(e?.response?.data?.error||e.message)}
    finally{setMasterBusy(false)}
  };
  const send=async()=>{
    if(!reviewing||!selectedReady.length||sending||selectedReady.some(c=>!previews[c.slug]?.html))return;
    const count=selectedReady.length;
    if(!window.confirm('Send the approved RallyHub coach invitation to exactly '+count+' selected coach'+(count===1?'':'es')+' now? No other coaches will receive this email.'))return;
    setSending(true);
    let sent=0,failed=0;
    for(const c of selectedReady){
      try{
        const response=await base44.functions.invoke('directoryClaim',{
          action:'send_claim_invite',listingSlug:c.slug,
          contactName:c.contactName,contactEmail:c.contactEmail,
          ...(customBySlug[c.slug]?.body?{coachOverrideText:customBySlug[c.slug].body,coachOverrideSubject:customBySlug[c.slug].subject||''}:{}),
        });
        if(response.data?.error)throw Error(response.data.error);
        if(response.data?.sent!==true)throw Error('The server did not confirm delivery.');
        setResults(v=>({...v,[c.slug]:{sent:true,message:'Sent'}}));
        setSelected(v=>v.filter(x=>x!==c.slug));
        sent++;
      }catch(err){
        setResults(v=>({...v,[c.slug]:{sent:false,message:err?.response?.data?.error||err.message||'Delivery not confirmed'}}));
        failed++;
        // Stop the batch rather than continuing after a provider error, rate limit or timeout.
        break;
      }
    }
    setSending(false);
    setReviewing(false);
    await queryClient.invalidateQueries({queryKey:['directory-coach-invitation-candidates']});
    await queryClient.invalidateQueries({queryKey:['directory-verification']});
    if(failed)toast.error(sent+' sent; batch stopped after one failed or unconfirmed invitation. Check the status before retrying.');
    else toast.success(sent+' selected coach invitation'+(sent===1?'':'s')+' sent.');
  };
  return <section className="glass rounded-xl border border-primary/30 p-4 sm:p-5 space-y-4" data-testid="coach-invitation-batch">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/> Coach invitation mailing</h3>
        <p className="mt-1 text-sm text-muted-foreground">Select only the coaches you want in this batch. The other coaches remain unsent. Test profiles are excluded automatically.</p>
        <p className="mt-1 text-xs text-muted-foreground">Emails use the approved RallyHub branding and coach invitation in the <Link to="/app/communications" className="text-primary font-semibold underline">Communications Centre</Link>.</p>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={()=>{clear();refetch()}} disabled={sending}><RefreshCw className="mr-2 h-4 w-4"/> Refresh</Button>
    </div>
    {isLoading&&<p className="text-sm">Loading the coach contact list…</p>}
    {isError&&<p role="alert" className="text-sm text-destructive">Could not load the coach mailing list: {error?.response?.status===429?'Base44 is temporarily rate-limiting Directory requests. Use Refresh in a moment; your previous invitations are safe.':error?.message}</p>}
    {!isLoading&&!isError&&<>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold">{coaches.length} coaches · {ready.length} available · {selectedReady.length} selected</span>
        <Button type="button" size="sm" variant="outline" onClick={chooseAll} disabled={sending||!ready.length}>Select all available</Button>
        <Button type="button" size="sm" variant="ghost" onClick={clear} disabled={sending||!selected.length}>Clear selection</Button>
      </div>
      <div className="max-h-[520px] overflow-y-auto divide-y divide-border rounded-lg border border-border bg-background/40">
        {coaches.map(c=>{
          const available=c.inviteStatus==='ready'&&!results[c.slug]?.sent;
          const checked=available&&selected.includes(c.slug);
          const state=results[c.slug]?.sent?'Sent just now':results[c.slug]?.message||({ready:'Ready to invite',invited:'Invitation pending',accepted:'Invitation accepted',claimed:'Already claimed',no_email:'Email missing'}[c.inviteStatus]||'Check needed');
          return <label key={c.slug} className={'flex items-center gap-3 p-3 text-sm '+(available?'cursor-pointer hover:bg-secondary/40':'opacity-65')} data-testid={'coach-row-'+c.slug}>
            <input type="checkbox" checked={checked} disabled={!available||sending} onChange={()=>toggle(c.slug)} aria-label={'Select '+c.name} className="h-4 w-4 shrink-0 accent-primary"/>
            <span className="flex-1 min-w-0"><strong className="block">{c.name}</strong><span className="block text-xs text-muted-foreground truncate">{c.contactEmail||'No verified email'}</span></span>
            <span className="text-xs shrink-0 text-muted-foreground">{state}</span>
          </label>;
        })}
      </div>
      {masterMessage&&!masterEditing&&<p role="status" className="text-sm">{masterMessage}</p>}
      {previewError&&<p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{previewError}</p>}
      {reviewing&&selectedReady.length>0&&<div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3" data-testid="coach-invitation-review">
        <p className="text-sm font-bold">Personalised HTML email preview — {selectedReady.length} selected</p>
        <p className="text-xs text-muted-foreground">Generated by the same approved Communications Centre renderer used for sending. The preview button is intentionally inactive; a unique working invitation link is created only when you send.</p>
        <div className="flex flex-wrap gap-2">{selectedReady.map(c=><Button key={c.slug} type="button" size="sm" variant={previewSlug===c.slug?'default':'outline'} onClick={()=>setPreviewSlug(c.slug)}>{c.name}</Button>)}</div>
        <div className="rounded-lg border border-border bg-background p-3 text-sm">
          <p><strong>To:</strong> {previews[previewSlug]?.to}</p>
          <p><strong>Subject:</strong> {previews[previewSlug]?.subject}</p>
          <p className="mt-1 text-xs text-muted-foreground">Approved template: directory_claim_coaching · Preview only, not sent</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={()=>{setPersonalising(v=>!v);setMasterEditing(false);if(!customBySlug[previewSlug]?.body){setCustomBySlug(v=>({...v,[previewSlug]:{body:previews[previewSlug]?.rawBody||'',subject:previews[previewSlug]?.rawSubject||''}}))}}}>Personalise this coach</Button>
          <Button type="button" variant="outline" size="sm" onClick={()=>{setMasterEditing(v=>!v);setPersonalising(false)}}>Edit master template (Comms Centre)</Button>
        </div>
        {personalising&&<div className="space-y-2 rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-bold">Personalise {coaches.find(c=>c.slug===previewSlug)?.name} only</p>
          <p className="text-xs text-muted-foreground">Changes here affect this recipient only, not the master template. Keep the three double-braced fields intact.</p>
          <label className="block text-sm">Subject<input className="mt-1 w-full rounded border p-2" value={customBySlug[previewSlug]?.subject||''} onChange={e=>{setCustomBySlug(v=>({...v,[previewSlug]:{...v[previewSlug],subject:e.target.value}}));setPreviews(v=>{const z={...v};delete z[previewSlug];return z})}}/></label>
          <label className="block text-sm">Message<textarea rows={14} className="mt-1 w-full rounded border p-2" value={customBySlug[previewSlug]?.body||''} onChange={e=>{setCustomBySlug(v=>({...v,[previewSlug]:{...v[previewSlug],body:e.target.value}}));setPreviews(v=>{const z={...v};delete z[previewSlug];return z})}}/></label>
          <Button type="button" disabled={previewBusy} onClick={personalise}>{previewBusy?'Updating preview…':'Apply personalisation and preview'}</Button>
        </div>}
        {masterEditing&&<div className="space-y-2 rounded-lg border border-primary/30 bg-background p-3">
          <p className="text-sm font-bold">Master email template · Communications Centre</p>
          <p className="text-xs text-muted-foreground">Editing this changes the future default only after Save as Draft and Approve. It does not change any individual personalised message or send an email.</p>
          <label className="block text-sm">Master subject<input className="mt-1 w-full rounded border p-2" value={masterSubject} onChange={e=>{setMasterSubject(e.target.value);setMasterRendered(null)}}/></label>
          <label className="block text-sm">Master message<textarea rows={14} className="mt-1 w-full rounded border p-2" value={masterBody} onChange={e=>{setMasterBody(e.target.value);setMasterRendered(null)}}/></label>
          {masterMessage&&<p role="status" className="text-sm">{masterMessage}</p>}
          {masterRendered?.html&&<iframe title="Edited master email HTML preview" srcDoc={masterRendered.html} sandbox="" className="h-[600px] w-full rounded-lg border bg-white" data-testid="master-coach-html-preview"/>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={masterBusy||!masterBody||!masterSubject} onClick={previewMaster}>Preview edited master HTML</Button>
            <Button type="button" variant="outline" disabled={masterBusy||!masterRendered||masterRendered.body!==masterBody||masterRendered.subject!==masterSubject} onClick={saveMaster}>{masterBusy?'Saving…':'Save as Draft in Comms Centre'}</Button>
            <Button type="button" disabled={masterBusy||!masterRendered||!master?.draft?.id||masterRendered.body!==masterBody||masterRendered.subject!==masterSubject||masterBody!==master.draft.body||masterSubject!==master.draft.subject} onClick={approveMaster}>Approve saved template</Button>
            <Link to="/app/communications" className="self-center text-sm font-semibold text-primary underline">Open Communications Centre</Link>
          </div>
          <p className="text-xs text-muted-foreground">After approving, generate a fresh personalised HTML preview before sending.</p>
        </div>}
        {previews[previewSlug]?.html&&<iframe title={'Email preview for '+(coaches.find(c=>c.slug===previewSlug)?.name||'coach')} sandbox="" srcDoc={previews[previewSlug].html} className="h-[680px] w-full rounded-lg border border-border bg-white" data-testid="coach-html-preview"/>}
      </div>}
      <div className="flex flex-wrap gap-2">
        {!reviewing?<Button type="button" disabled={!selectedReady.length||sending||previewBusy} onClick={loadPreviews}>{previewBusy?'Loading exact HTML previews…':'Preview '+selectedReady.length+' selected email'+(selectedReady.length===1?'':'s')}</Button>:
        <Button type="button" disabled={!selectedReady.length||sending||personalising||masterEditing||previewBusy||selectedReady.some(c=>!previews[c.slug]?.html)} onClick={send}><Mail className="mr-2 h-4 w-4"/>{sending?'Sending…':'Send only '+selectedReady.length+' selected'}</Button>}
        {reviewing&&<Button type="button" variant="outline" disabled={sending} onClick={()=>{setReviewing(false);setPreviews({})}}>Back to selection</Button>}
      </div>
      <p className="text-xs text-muted-foreground"><CheckCircle2 className="inline mr-1 h-3.5 w-3.5"/>No messages are sent when selecting, reviewing or opening this panel. Sending requires the final button and confirmation.</p>
    </>}
  </section>;
}
