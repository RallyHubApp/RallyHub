import React,{useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
/** No implicit identity or venue assignment: review and confirmation are separate actions. */
export default function ClubExplicitLinkReview({mode,tenantId,clubId,onComplete}){
 const person=mode==='person';
 const [first,setFirst]=useState(''),[second,setSecond]=useState(''),[reason,setReason]=useState(''),[verified,setVerified]=useState(false);
 const [review,setReview]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{setReview(null);setVerified(false);setReason('');setError('');setMessage('')},[mode,tenantId,clubId,first,second]);
 const params=person?{accessId:first.trim(),personId:second.trim()}:{configId:first.trim(),venueId:second.trim()};
 const call=async action=>{setBusy(true);setError('');setMessage('');try{
  const response=await base44.functions.invoke('cccActivity',{action,...params,...(action.endsWith('_confirm')?{reason:reason.trim(),...(person?{confirmIdentityVerified:verified}:{confirmVenueVerified:verified})}:{})});
  if(!response.data?.success)throw Error(response.data?.error||'Request could not be completed');
  if(action.endsWith('_review')){setReview(response.data);setVerified(false)}
  else{setReview(null);setVerified(false);setReason('');setMessage(response.data.alreadyLinked||response.data.alreadyMapped?'Already linked — no change made':'Confirmed and saved');onComplete?.()}
 }catch(e){setError(e?.response?.data?.error||e?.message||'Request failed')}finally{setBusy(false)}};
 const reviewAction=person?'person_link_review':'host_venue_review',confirmAction=person?'person_link_confirm':'host_venue_confirm';
 return <div className="rounded-xl border bg-card p-4" aria-label={person?'Explicit Person link review':'Host venue mapping review'}>
  <h3 className="font-semibold">{person?'Explicit Person linking':'Assign existing host configuration to a venue'}</h3>
  <p className="mt-1 text-sm text-muted-foreground">{person?'Only link after independently confirming that this is the same individual. Email or name similarity is not sufficient.':'Review the exact active venue before assigning an existing host configuration. This changes which venue its delegated hosts can access.'}</p>
  <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm">{person?'Club access record ID':'Host configuration ID'}<input value={first} onChange={e=>setFirst(e.target.value)} maxLength={180} className="mt-1 w-full rounded-lg border bg-background p-2" autoComplete="off"/></label><label className="text-sm">{person?'Person ID':'Active venue ID'}<input value={second} onChange={e=>setSecond(e.target.value)} maxLength={180} className="mt-1 w-full rounded-lg border bg-background p-2" autoComplete="off"/></label></div>
  <button type="button" disabled={busy||!first.trim()||!second.trim()} onClick={()=>call(reviewAction)} className="mt-3 rounded-lg border px-3 py-2 text-sm disabled:opacity-50">{busy?'Checking…':'Review exact records'}</button>
  {review&&<div className="mt-3 rounded-lg border p-3 text-sm"><p className="font-semibold">Review before confirming</p>{person?<><p>Access: {review.access?.id} · User: {review.access?.userId}</p><p>Person: {review.person?.name} · ID: {review.person?.id}</p><p>Existing Person link: {review.access?.personId||'None'}</p></>:<><p>Venue: {review.venue?.name} · ID: {review.venue?.id}</p><p>Existing key: {review.legacyVenueKey||'None'} · Configured hosts: {review.configuredHostCount}</p><p>Current venue ID: {review.currentVenueId||'None'}</p></>}
   <label className="mt-3 flex items-start gap-2"><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)} className="mt-1"/><span>{person?'I independently verified this individual against the club membership record.':'I verified the intended venue and its existing delegated-host configuration.'}</span></label>
   <label className="mt-3 block">Reason for change (minimum 12 characters)<textarea value={reason} onChange={e=>setReason(e.target.value)} maxLength={500} rows={2} className="mt-1 w-full rounded-lg border bg-background p-2"/></label>
   <button type="button" disabled={busy||!verified||reason.trim().length<12} onClick={()=>call(confirmAction)} className="mt-2 rounded-lg border border-amber-600 px-3 py-2 text-sm font-semibold disabled:opacity-50">{busy?'Saving…':'Confirm and save change'}</button>
  </div>}
  {error&&<p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}{message&&<p role="status" className="mt-2 text-sm">{message}</p>}
 </div>;
}
