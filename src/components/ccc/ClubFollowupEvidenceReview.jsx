import React,{useEffect,useRef,useState} from 'react';
import {base44} from '@/api/base44Client';
import {followupEvidenceState} from '@/lib/ccc/followupEvidence';
/** Person-linked evidence only; never a delivery authorisation. */
export default function ClubFollowupEvidenceReview(){
 const [personId,setPersonId]=useState(''),[result,setResult]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const version=useRef(0);
 useEffect(()=>()=>{version.current++},[]);
 const change=value=>{version.current++;setPersonId(value);setResult(null);setError('');setBusy(false)};
 const review=async()=>{const request=++version.current;setBusy(true);setError('');setResult(null);try{const r=await base44.functions.invoke('cccActivity',{action:'person_communication_review',personId:personId.trim(),channel:'email',purpose:'marketing'});if(request!==version.current)return;if(!r.data?.success)throw Error(r.data?.error||'Evidence unavailable');setResult(followupEvidenceState(r.data))}catch(e){if(request===version.current)setError(e?.response?.data?.error||e?.message||'Evidence unavailable')}finally{if(request===version.current)setBusy(false)}};
 return <section className="mt-4 rounded-lg border p-3" aria-label="Linked person communication evidence"><h4 className="font-semibold">Linked person consent review</h4><p className="mt-1 text-xs text-muted-foreground">Use an exact verified Person ID, never a name or email guess. Review-only; endpoint suppression and template checks remain outstanding.</p><div className="mt-2 flex flex-wrap gap-2"><input aria-label="Verified Person ID" value={personId} onChange={e=>change(e.target.value)} className="rounded border bg-background p-2 text-sm"/><button type="button" disabled={!personId.trim()||busy} onClick={review} className="rounded border px-3 py-2 text-sm">{busy?'Checking…':'Review marketing evidence'}</button></div>{error&&<p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}{result&&<div className="mt-2 text-sm"><p className="font-semibold">Delivery not authorised</p><ul className="list-inside list-disc text-xs">{result.issues.map(i=><li key={i}>{i.replaceAll('_',' ')}</li>)}</ul></div>}</section>;
}
