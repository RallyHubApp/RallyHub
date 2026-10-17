import React,{useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
import {useAuth} from '@/lib/AuthContext';

const purposes=[
 ['tournival_registration_received','Registration received'],
 ['tournival_payment_required','Secure payment request'],
 ['tournival_payment_confirmed','Payment confirmed'],
 ['tournival_waitlist_added','Waitlist entry'],
 ['tournival_waitlist_promoted','Waitlist promotion'],
 ['tournival_host_invite','Host invitation'],
 ['tournival_results','Tournament results']
];
const empty=(purpose)=>({purpose,subject_template:'',plain_text_template:'',html_template:'',
 channel_templates:{email:{header_title:''},whatsapp:{text_template:''}}});
export default function TournivalTemplateManager(){
 const {user}=useAuth(),tenantId=user?.active_tenant_id,clubId=user?.active_club_id;
 const [rows,setRows]=useState([]),[kits,setKits]=useState([]),[purpose,setPurpose]=useState(purposes[0][0]);
 const [selected,setSelected]=useState(null),[draft,setDraft]=useState(empty(purposes[0][0]));
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=async()=>{
  if(!tenantId||!clubId)return;
  try{
   const [templates,brands]=await Promise.all([
    base44.entities.CommunicationTemplate.filter({owner_scope:'tenant',tenant_id:tenantId,module:'Tournival'},'-updated_date',100),
    base44.entities.CommunicationBrandKit.filter({owner_scope:'tenant',tenant_id:tenantId,status:'active'},'-updated_date',100)
   ]);
   setRows((templates||[]).filter(t=>!t.club_id||t.club_id===clubId));
   setKits((brands||[]).filter(k=>!k.club_id||k.club_id===clubId));
  }catch(e){setError(e.message||'Could not load tenant templates')}
 };
 useEffect(()=>{load()},[tenantId,clubId]);
 const choose=(p,record)=>{
  setPurpose(p);setSelected(record||null);
  setDraft(record?{...record,channel_templates:record.channel_templates||{email:{},whatsapp:{}}}:empty(p));
  setError('');setNotice('');
 };
 const edit=(field,value)=>setDraft(d=>({...d,[field]:value}));
 const updateChannel=(channel,field,value)=>setDraft(d=>({...d,channel_templates:{...d.channel_templates,
  [channel]:{...(d.channel_templates?.[channel]||{}),[field]:value}}}));
 const save=async()=>{
  setBusy(true);setError('');setNotice('');
  try{
   if(!tenantId||!clubId||!kits.length)throw Error('Choose a tenant club with an active Communications Centre brand kit');
   if(!draft.subject_template?.trim()||!draft.plain_text_template?.trim()||!draft.html_template?.trim())
    throw Error('Email subject, plain text and HTML body are all required');
   const kit=kits.find(k=>k.id===draft.brand_kit_id)||kits[0];
   const record={owner_scope:'tenant',tenant_id:tenantId,club_id:clubId,
    module:'Tournival',purpose,name:purposes.find(p=>p[0]===purpose)?.[1]||purpose,
    version:String(Date.now()),status:'draft',brand_kit_id:kit.id,
    subject_template:draft.subject_template,plain_text_template:draft.plain_text_template,
    html_template:draft.html_template,channel_templates:draft.channel_templates,
    created_by_user_id:user.id};
   let saved;
   if(selected?.status==='draft')saved=await base44.entities.CommunicationTemplate.update(selected.id,record);
   else saved=await base44.entities.CommunicationTemplate.create(record);
   await load();setSelected(saved);setDraft(saved);
   setNotice('Draft saved. Approved templates remain unchanged until you approve this version.');
  }catch(e){setError(e.message||'Unable to save Tournival template')}
  finally{setBusy(false)}
 };
 const approve=async()=>{
  if(selected?.status!=='draft'||!selected.id)return;
  const kit=kits.find(k=>k.id===selected.brand_kit_id);
  if(!kit)return setError('The selected brand kit must be active before approval.');
  if(!window.confirm('Approve this Tournival '+purpose+' template for future tenant communications?'))return;
  setBusy(true);setError('');setNotice('');
  try{
   const updated=await base44.entities.CommunicationTemplate.update(selected.id,{
    status:'approved',approved_by_user_id:user.id,approved_at:new Date().toISOString()
   });
   const older=rows.filter(r=>r.id!==selected.id&&r.purpose===purpose&&r.status==='approved'&&
    (!r.club_id||r.club_id===clubId));
   for(const previous of older)await base44.entities.CommunicationTemplate.update(previous.id,{status:'retired'});
   await load();setSelected(updated);setDraft(updated);
   setNotice('Tenant template approved for '+purposes.find(p=>p[0]===purpose)?.[1]+'.');
  }catch(e){setError(e.message||'Template approval needs reconciliation')}
  finally{setBusy(false)}
 };
 const matching=rows.filter(r=>r.purpose===purpose);
 return <section className="rounded-xl border bg-white p-5 space-y-4">
  <div><h2 className="font-bold text-lg">Tournival — tenant-approved templates</h2>
  <p className="text-sm text-muted-foreground mt-1">Draft and approve the message body for each Tournival event. The shared Communications Centre renderer supplies the club logo, colours, signature and footer. No messages are sent by saving or approving a template.</p></div>
  {!clubId&&<p role="alert" className="text-sm text-amber-700">Choose an active tenant club first.</p>}
  <div className="grid gap-3 md:grid-cols-2">
   <label className="text-sm font-semibold">Message purpose<select className="block border rounded-lg p-2 w-full mt-1" value={purpose} onChange={e=>choose(e.target.value,null)}>{purposes.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
   <label className="text-sm font-semibold">Saved version<select className="block border rounded-lg p-2 w-full mt-1" value={selected?.id||''} onChange={e=>choose(purpose,matching.find(r=>r.id===e.target.value)||null)}><option value="">New blank draft</option>{matching.map(t=><option key={t.id} value={t.id}>{t.status} · {t.version}</option>)}</select></label>
  </div>
  <div className="text-xs text-muted-foreground">Selected version: {selected?.status||'new draft'}. Editing an approved version creates a separate draft.</div>
  <label className="block text-sm">Active tenant brand kit<select className="block border rounded-lg p-2 w-full mt-1" value={draft.brand_kit_id||kits[0]?.id||''} onChange={e=>edit('brand_kit_id',e.target.value)}>{kits.map(k=><option key={k.id} value={k.id}>{k.name} · {k.version}</option>)}</select></label>
  <label className="block text-sm">Email subject<input className="block border rounded-lg p-2 w-full mt-1" value={draft.subject_template||''} onChange={e=>edit('subject_template',e.target.value)} placeholder="Use {{EVENT_NAME}}, {{FIRST_NAME}}..."/></label>
  <label className="block text-sm">Email body — HTML<textarea className="block border rounded-lg p-2 w-full mt-1 h-36 font-mono text-xs" value={draft.html_template||''} onChange={e=>edit('html_template',e.target.value)} placeholder="<p>Hello {{FIRST_NAME}}...</p>"/></label>
  <label className="block text-sm">Email body — plain text<textarea className="block border rounded-lg p-2 w-full mt-1 h-28" value={draft.plain_text_template||''} onChange={e=>edit('plain_text_template',e.target.value)}/></label>
  <label className="block text-sm">Email header title<input className="block border rounded-lg p-2 w-full mt-1" value={draft.channel_templates?.email?.header_title||''} onChange={e=>updateChannel('email','header_title',e.target.value)}/></label>
  <label className="block text-sm">Approved WhatsApp body (optional until channel configured)<textarea className="block border rounded-lg p-2 w-full mt-1 h-24" value={draft.channel_templates?.whatsapp?.text_template||''} onChange={e=>updateChannel('whatsapp','text_template',e.target.value)}/></label>
  <p className="text-xs text-muted-foreground">Action merge fields include {{PAYMENT_LINK}}, {{PLAYER_LINK}}, {{HOST_LINK}}, {{RESULTS_LINK}} and {{EVENT_LINK}}. Links are resolved from the triggering event, not stored as permanent tenant text.</p>
  {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
  {notice&&<p role="status" className="text-sm text-green-700">{notice}</p>}
  <div className="flex gap-2 flex-wrap">
   <button type="button" className="rounded-lg border px-4 py-2 text-sm font-bold" disabled={busy||!clubId} onClick={save}>{busy?'Working…':'Save as draft'}</button>
   <button type="button" className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-bold disabled:opacity-40" disabled={busy||selected?.status!=='draft'} onClick={approve}>Approve selected draft</button>
  </div>
 </section>;
}
