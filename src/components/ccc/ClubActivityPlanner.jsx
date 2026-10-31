import React,{useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {activityTypes} from '@/lib/ccc/activityContracts';
import {planActivityDraft} from '@/lib/ccc/activityWorkflow';
import {ACTIVITY_STEPS,newActivityDraft,activityWizardReview} from '@/lib/ccc/activityWizard';

/** Safe prototype: review and copy a proposed activity, no writes or sends. */
export default function ClubActivityPlanner({tenantId,clubId}){
 const [form,setForm]=useState(()=>newActivityDraft({tenantId,clubId}));
 const [step,setStep]=useState(0);
 const [registrationMode,setRegistrationMode]=useState('approval');
 const [paymentMethod,setPaymentMethod]=useState('none');
 const [hostName,setHostName]=useState('');
 const [templateId,setTemplateId]=useState('');
 const [copied,setCopied]=useState(false);
 const [saved,setSaved]=useState(null);
 const [saving,setSaving]=useState(false);
 const [saveError,setSaveError]=useState('');
 const [operationId,setOperationId]=useState(()=>globalThis.crypto?.randomUUID?.()||String(Date.now()));
 const queryClient=useQueryClient();
 const {data:venues=[],isLoading:venuesLoading,isError:venuesError}=useQuery({queryKey:['ccc-venues',tenantId,clubId],queryFn:()=>base44.entities.Venue.filter({tenant_id:tenantId,club_id:clubId,status:'active'},'name',100),enabled:!!tenantId&&!!clubId});
 const {data:savedDrafts=[]}=useQuery({queryKey:['ccc-activity-drafts',tenantId,clubId],queryFn:async()=>{const res=await base44.functions.invoke('cccActivity',{action:'list'});if(!res.data?.success)throw Error(res.data?.error||'Unable to load drafts');return res.data.activities||[]},enabled:!!tenantId&&!!clubId,retry:false});
 const scope={tenant_id:tenantId,club_id:clubId};
 const activity={...form,tenant_id:tenantId||'',club_id:clubId||''};
 const venue=venues.find(v=>v.id===activity.venue_id)||null;
 const host=hostName.trim()?{id:'preview-host',name:hostName.trim()}:null;
 const template=templateId.trim()?{id:templateId.trim()}:null;
 const review=activityWizardReview({form:activity,scope,venue,host,registrationMode,paymentMethod,approvedTemplate:template});
 const draftCheck=planActivityDraft({activity:{...activity,capacity:Number(activity.capacity)},scope,venue});
 const draftValid=draftCheck.valid&&!!venue;
 const update=(key,value)=>{setForm(old=>({...old,[key]:value}));setCopied(false)};
 const input=(key,label,type='text')=><label className="block text-sm font-medium">{label}<input type={type} value={form[key]??''} onChange={e=>update(key,e.target.value)} className="mt-1 block w-full rounded-lg border bg-background p-2 text-sm" /></label>;
 const selector=(label,value,set,options)=><label className="block text-sm font-medium">{label}<select value={value} onChange={e=>set(e.target.value)} className="mt-1 block w-full rounded-lg border bg-background p-2 text-sm">{options.map(v=><option key={v} value={v}>{v.replaceAll('_',' ')}</option>)}</select></label>;
 const save=async()=>{
  if(!draftValid||saving)return;setSaving(true);setSaveError('');
  try{const res=await base44.functions.invoke('cccActivity',{action:'save_draft',draft:{...review.activity,registration_mode:registrationMode,payment_method:paymentMethod},operationId,id:saved?.id,expectedRevision:saved?.revision});
   if(!res.data?.success)throw Error(res.data?.error||'Draft not saved');
   setSaved({id:res.data.id,revision:res.data.revision});queryClient.invalidateQueries({queryKey:['ccc-activity-drafts',tenantId,clubId]});
  }catch(e){setSaveError(e?.response?.data?.error||e?.message||'Unable to save draft')}finally{setSaving(false)}
 };
 const loadDraft=d=>{setForm({...d});setRegistrationMode(d.registration_mode||'approval');setPaymentMethod(d.payment_method||'none');setSaved({id:d.id,revision:d.revision});setStep(3);setSaveError('')};
 const copy=async()=>{
  const data={...review.activity,registration_mode:registrationMode,payment_method:paymentMethod,host_name:hostName,template_id:templateId,preview_only:true};
  try{await navigator.clipboard.writeText(JSON.stringify(data,null,2));setCopied(true)}catch{setCopied(false)}
 };
 return <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-label="Activity planner">
  <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">Activity planner</h2><p className="text-sm text-muted-foreground">Plan a session, clinic, event or tournament before publishing.</p></div><span className="rounded-full border px-3 py-1 text-xs font-semibold">Draft only · No publication or messages</span></div>
  {savedDrafts.length>0&&<div className="mt-3 flex flex-wrap gap-2" aria-label="Saved activity drafts">{savedDrafts.filter(d=>d.status==='draft').slice(0,10).map(d=><button type="button" key={d.id} onClick={()=>loadDraft(d)} className="rounded-lg border px-3 py-1 text-sm">Edit: {d.title}</button>)}</div>}
  <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Planner steps">{ACTIVITY_STEPS.map((name,i)=><button key={name} type="button" onClick={()=>setStep(i)} aria-current={step===i?'step':undefined} className={'rounded-lg border px-3 py-1.5 text-sm capitalize '+(step===i?'bg-primary text-primary-foreground':'hover:bg-muted')}>{i+1}. {name}</button>)}</div>
  {!tenantId||!clubId?<p className="mt-4 text-sm text-destructive">Select an active club before planning an activity.</p>:<div className="mt-4 space-y-4">
   {step===0&&<div className="grid gap-3 sm:grid-cols-2">{selector('Activity type',form.type,v=>update('type',v),activityTypes)}{input('sport','Sport')}{input('title','Activity title')}</div>}
   {step===1&&<div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">Venue<select value={form.venue_id||''} onChange={e=>update('venue_id',e.target.value)} disabled={venuesLoading||venuesError} className="mt-1 block w-full rounded-lg border bg-background p-2 text-sm"><option value="">{venuesLoading?'Loading venues…':venuesError?'Venues unavailable':'Select a club venue'}</option>{venues.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label>{input('capacity','Maximum participants','number')}{input('starts_at','Starts at','datetime-local')}{input('ends_at','Ends at','datetime-local')}</div>}
   {step===2&&<div className="grid gap-3 sm:grid-cols-2">{selector('Registration',registrationMode,setRegistrationMode,['approval','automatic','closed'])}{selector('Payment',paymentMethod,setPaymentMethod,['none','cash','online'])}<label className="block text-sm font-medium">Host name (preview)<input value={hostName} onChange={e=>setHostName(e.target.value)} className="mt-1 block w-full rounded-lg border bg-background p-2 text-sm" /></label><label className="block text-sm font-medium">Approved template ID (preview)<input value={templateId} onChange={e=>setTemplateId(e.target.value)} className="mt-1 block w-full rounded-lg border bg-background p-2 text-sm" /></label></div>}
   {step===3&&<div className="space-y-3 text-sm"><p className="font-semibold">{review.activity.title||'Untitled activity'} · {review.activity.type.replaceAll('_',' ')}</p><p>{review.activity.starts_at||'Start missing'} – {review.activity.ends_at||'End missing'} · Capacity {review.activity.capacity}</p><p className={review.valid?'text-emerald-600':'text-destructive'}>{draftValid?'Draft passes local checks':'Draft needs attention'}</p>{draftCheck.issues.length>0&&<ul className="list-disc pl-5">{draftCheck.issues.map(x=><li key={x}>{x.replaceAll('_',' ')}</li>)}</ul>}<p className={review.registrationReady?'text-emerald-600':'text-muted-foreground'}>{review.registrationReady?'Registration preflight passes':'Registration cannot open yet'}</p>{review.registrationIssues.length>0&&<ul className="list-disc pl-5">{review.registrationIssues.map(x=><li key={x}>{x.replaceAll('_',' ')}</li>)}</ul>}<button type="button" disabled={!draftValid||saving} onClick={save} className="mr-2 rounded-lg border px-3 py-2 font-semibold disabled:opacity-50">{saving?'Saving…':saved?'Update draft':'Save draft'}</button><button type="button" disabled={!review.valid} onClick={copy} className="rounded-lg bg-primary px-3 py-2 font-semibold text-primary-foreground disabled:opacity-50">{copied?'Draft copied':'Copy draft JSON'}</button>{saved&&<p role="status" className="text-sm text-emerald-600">Draft saved · revision {saved.revision}. Not published.</p>}{saveError&&<p role="alert" className="text-sm text-destructive">{saveError}</p>}<p className="text-xs text-muted-foreground">Saving creates an internal draft only. Host and template selections still require backend verification before registration can open. No booking, payment or email is triggered.</p></div>}
   <div className="flex justify-between gap-2"><button type="button" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Back</button><button type="button" disabled={step===ACTIVITY_STEPS.length-1} onClick={()=>setStep(s=>Math.min(ACTIVITY_STEPS.length-1,s+1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div>
  </div>}
 </section>;
}
