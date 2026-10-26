import React, {useState} from 'react';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import CoachProfile from './CoachProfile';
const fields=[['name','Name'],['photoUrl','Profile photograph URL'],['town','Town'],['county','County'],['description','Biography'],['qualifications','Qualifications and accreditations'],['coachingExperience','Coaching experience'],['coachingServices','Coaching services'],['areasServed','Areas served'],['website','Website (optional)'],['linkedin','LinkedIn (optional)'],['facebook','Facebook (optional)'],['instagram','Instagram (optional)'],['tiktok','TikTok (optional)']];
const arrays=new Set(['qualifications','coachingServices','areasServed']);
export default function CoachEditor({initial,slug}){
 const [form,setForm]=useState(initial),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[show,setShow]=useState(false);
 const save=async e=>{
 e.preventDefault();if(busy)return;setBusy(true);setMessage('');
 try{
 for(const key of ['photoUrl','website','linkedin','facebook','instagram','tiktok'])if(form[key]){const u=new URL(form[key]);if(!['https:','http:'].includes(u.protocol))throw Error('Use an HTTP or HTTPS URL for '+key);}
 const res=await base44.functions.invoke('directoryListingProfile',{action:'save',listingSlug:slug,profile:{...form,listingType:'coach',contact:{}},town:form.town,county:form.county});
 if(!res.data?.success)throw Error(res.data?.error||'Save was not confirmed');
 setMessage('Coach profile saved. Listing visibility has not changed.');
 }catch(e){setMessage('Save failed: '+(e?.response?.data?.error||e.message))}finally{setBusy(false)}
 };
 return <main className="mx-auto max-w-4xl p-4 sm:p-8 space-y-5"><a className="underline" href="/app/admin?tab=directory&focus=coaches#coaches">Back to Coaches Review</a><h1 className="text-2xl font-bold">Edit coach · {form.name}</h1><p className="text-sm">Coach profile fields. Private contact destinations are managed separately in Directory Contacts; enquiry forwarding awaits verification.</p><form onSubmit={save} className="space-y-4">{fields.map(([key,label])=><label className="block" key={key}><span className="block font-semibold mb-1">{label}{arrays.has(key)?' (one per line)':''}</span><textarea rows={key==='description'?7:arrays.has(key)?3:1} className="w-full rounded-lg border bg-background p-3" value={Array.isArray(form[key])?form[key].join('\n'):form[key]||''} onChange={e=>setForm(old=>({...old,[key]:arrays.has(key)?e.target.value.split('\n'):e.target.value}))}/></label>)}<div role="status">{message}</div><div className="flex gap-3"><Button disabled={busy}>{busy?'Saving…':'Save coach profile'}</Button><Button type="button" variant="outline" onClick={()=>setShow(!show)}>Preview changes</Button></div></form>{show&&<CoachProfile coach={form} preview/>}</main>
}
