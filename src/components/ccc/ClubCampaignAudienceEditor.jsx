import React,{useState} from 'react';
import {base44} from '@/api/base44Client';
const sports=['Tennis','Badminton','Squash','Table Tennis','Padel','Racquetball','Pickleball','Other'];
export default function ClubCampaignAudienceEditor({activityId}){
 const [name,setName]=useState('Taster invitation - tennis and badminton');
 const [sources,setSources]=useState(['waiting_list']);
 const [selectedSports,setSelectedSports]=useState(['Tennis','Badminton']);
 const [dateMode,setDateMode]=useState('all');
 const [fromDate,setFromDate]=useState(''),[toDate,setToDate]=useState(''),[gender,setGender]=useState('');
 const [preview,setPreview]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const toggle=(arr,set,v)=>set(arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]);
 const filters={sources,sports:selectedSports,fromDate:dateMode==='range'?fromDate:'',toDate:dateMode==='range'?toDate:'',gender};
 const run=async action=>{setBusy(true);setMessage('');if(action==='audience_preview')setPreview(null);try{
  const r=await base44.functions.invoke('cccActivity',{action,activityId,name,filters});if(!r.data?.success)throw Error(r.data?.error||'Audience unavailable');
  if(action==='audience_preview')setPreview(r.data);else setMessage(`Saved ${r.data.count} audience contacts as a draft. No invitations sent.`);
 }catch(e){setMessage(e?.response?.data?.error||e.message||'Audience operation failed')}finally{setBusy(false)}};
 return <section className="rounded-xl border p-3 space-y-3" aria-label="Campaign audience builder">
  <h4 className="font-semibold">Campaign audience · CRM filters</h4>
  <p className="text-xs text-muted-foreground">Select one or more sources. Sport selections match ANY selected sport. Existing paid members are excluded from guest and waiting-list campaigns. Saving never sends messages.</p>
  <fieldset><legend className="text-sm font-medium">Contact sources</legend><div className="flex flex-wrap gap-3">{[['waiting_list','Waiting list'],['guests','Guests'],['members','Active members']].map(([v,label])=><label key={v} className="text-sm"><input type="checkbox" checked={sources.includes(v)} onChange={()=>{toggle(sources,setSources,v);setPreview(null)}}/> {label}</label>)}</div></fieldset>
  <fieldset><legend className="text-sm font-medium">Previous sports (any selected)</legend><div className="flex flex-wrap gap-3">{sports.map(v=><label key={v} className="text-sm"><input type="checkbox" checked={selectedSports.includes(v)} onChange={()=>{toggle(selectedSports,setSelectedSports,v);setPreview(null)}}/> {v}</label>)}</div></fieldset>
  <div><label className="text-sm">Joined date <select className="ml-2 rounded border p-2" value={dateMode} onChange={e=>{setDateMode(e.target.value);setPreview(null)}}><option value="all">All dates</option><option value="range">Date range</option></select></label></div>
  <div className="grid gap-2 sm:grid-cols-3">{dateMode==='range'&&<><label className="text-sm">Joined from<input className="block w-full rounded border p-2" type="date" value={fromDate} onChange={e=>{setFromDate(e.target.value);setPreview(null)}}/></label><label className="text-sm">Joined to<input className="block w-full rounded border p-2" type="date" value={toDate} onChange={e=>{setToDate(e.target.value);setPreview(null)}}/></label></>}<label className="text-sm">Gender (if recorded)<select className="block w-full rounded border p-2" value={gender} onChange={e=>{setGender(e.target.value);setPreview(null)}}><option value="">All</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></label></div>
  <label className="block text-sm">Audience name<input className="mt-1 block w-full rounded border p-2" value={name} onChange={e=>setName(e.target.value)}/></label>
  {!activityId&&<p className="text-sm text-amber-700">Save the activity draft on the Review step first, then return here to preview and save this audience.</p>}
  <div className="flex flex-wrap gap-2"><button className="rounded border px-3 py-2 text-sm" disabled={!activityId||!sources.length||busy} onClick={()=>run('audience_preview')}>Preview audience</button><button className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50" disabled={!activityId||!preview||!name.trim()||busy} onClick={()=>run('audience_save')}>Save audience draft</button></div>
  {preview&&<div role="status" className="text-sm"><strong>{preview.count} eligible contacts</strong><p>Exclusions: {Object.entries(preview.excluded||{}).map(([k,v])=>`${k.replaceAll('_',' ')} ${v}`).join(' · ')||'none'}</p><div className="mt-2 max-h-40 overflow-auto">{preview.recipients?.map(x=><p key={x.source+x.id}>{x.name} · {x.source.replaceAll('_',' ')}</p>)}</div></div>}
  {message&&<p role="status" className="text-sm">{message}</p>}
 </section>
}
