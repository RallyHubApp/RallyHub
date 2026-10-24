import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CoachProfile, { CoachPortrait } from '@/components/directory/CoachProfile';
const parse = text => { try { return JSON.parse(text || '{}'); } catch { return {}; } };
export default function CoachesReview() {
 const [selected,setSelected]=useState(new Set()),[preview,setPreview]=useState(-1),[confirm,setConfirm]=useState(null),[busy,setBusy]=useState(false),[report,setReport]=useState([]);
 const allRef=useRef(null);
 const query=useQuery({queryKey:['coach-review'],queryFn:async()=>{
 const response=await base44.functions.invoke('directoryClaim',{action:'list_admin'});
 if(response.data?.success!==true)throw Error(response.data?.error||'Directory administration unavailable');
 const rows=(response.data.listingRecords||[]).filter(r=>r.listing_type==='coach'&&r.status==='active');
 const profiles=response.data.listingProfiles||[];
 return rows.filter(r=>!['heather-campbell-kelly','mark-topping'].includes(r.slug)).map(r=>({...r,coach:{...parse(r.base_json),...parse(profiles.find(p=>p.listing_slug===r.slug)?.public_json),name:r.name,slug:r.slug}}));
 }});
 const rows=query.data||[],eligible=rows.filter(r=>r.visibility==='preview_only');
 const previewSlug=rows[preview]?.slug;
 const previewQuery=useQuery({queryKey:['coach-stored-preview',previewSlug],enabled:!!previewSlug,staleTime:0,queryFn:async()=>{const response=await base44.functions.invoke('directoryListingProfile',{action:'private_get',listingSlug:previewSlug});if(!response.data?.success)throw Error(response.data?.error||'Could not load stored coach profile');return {...response.data.base,...response.data.profile,slug:previewSlug};}});
 useEffect(()=>{if(allRef.current)allRef.current.indeterminate=selected.size>0&&selected.size<eligible.length;},[selected.size,eligible.length]);
 const toggle=id=>setSelected(old=>{const next=new Set(old);next.has(id)?next.delete(id):next.add(id);return next;});
 const publish=async()=>{
 if(busy||!confirm?.length)return;
 setBusy(true);const results=[];
 for(const row of confirm){
 try{
 const review=await base44.functions.invoke('directoryClaim',{action:'list_admin'});
 if(review.data?.success!==true)throw Error(review.data?.error||'Could not recheck Directory listing');
 const fresh=(review.data.listingRecords||[]).find(item=>item.id===row.id);
 if(!fresh)throw Error('Listing no longer available');
 if(fresh.visibility!=='preview_only'||fresh.listing_type!=='coach')throw Error('Listing changed. Refresh and review again.');
 const res=await base44.functions.invoke('directoryClaim',{action:'set_visibility',listingSlug:row.slug,visibility:'public'});
 if(res.data?.success!==true)throw Error(res.data?.error||'Publication was not confirmed.');
 const verified=await base44.functions.invoke('directoryClaim',{action:'list_admin'});
 if(verified.data?.success!==true)throw Error(verified.data?.error||'Could not verify Directory listing visibility');
 const check=(verified.data.listingRecords||[]).find(item=>item.id===row.id);
 if(!check)throw Error('Listing verification failed');
 if(check.visibility!=='public')throw Error('Publication readback failed.');
 results.push({name:row.name,ok:true});
 setSelected(old=>{const n=new Set(old);n.delete(row.id);return n;});
 }catch(e){results.push({name:row.name,ok:false,error:e?.response?.data?.error||e.message});}
 }
 setReport(results);setConfirm(null);setBusy(false);await query.refetch();
 };
 return <section id="coaches" className="rounded-2xl border border-primary/30 p-4 sm:p-6 space-y-4" data-testid="coaches-review">
 <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold">Coaches Review</h2><p className="text-sm text-muted-foreground">{rows.length} coach profiles · {eligible.length} preview only. Review profiles before publishing.</p></div><Button variant="outline" onClick={()=>query.refetch()}>Refresh coaches</Button></div>
 {query.isLoading&&<p>Loading coaches…</p>}{query.isError&&<p role="alert">Could not load coaches. {query.error.message}</p>}
 {!query.isLoading&&rows.length!==14&&<p role="alert" className="text-amber-600">Expected 14 coaches; found {rows.length}. Check the register before publishing.</p>}
 <div className="flex flex-wrap items-center justify-between gap-4"><label className="flex gap-2 items-center"><input ref={allRef} type="checkbox" aria-label="Select All coaches" disabled={busy||!eligible.length} checked={eligible.length>0&&eligible.every(r=>selected.has(r.id))} onChange={e=>setSelected(e.target.checked?new Set(eligible.map(r=>r.id)):new Set())}/>Select All</label><Button disabled={busy||!selected.size} onClick={()=>setConfirm(eligible.filter(r=>selected.has(r.id)))}>Approve & Make Public ({selected.size})</Button></div>
 <div className="space-y-3">{rows.map((r,i)=><div key={r.id} data-testid="coach-row" className="rounded-xl border p-3 flex flex-wrap gap-3 items-start">
 <input type="checkbox" aria-label={'Select '+r.name} className="mt-2" disabled={busy||r.visibility!=='preview_only'} checked={selected.has(r.id)} onChange={()=>toggle(r.id)}/>
 <CoachPortrait coach={r.coach} small/><div className="min-w-0 flex-1 basis-44"><h3 className="font-bold">{r.name}</h3><p className="text-sm">{r.coach.town}, {r.county}</p><p className="text-xs font-bold text-primary">{r.visibility==='preview_only'?'Preview only':'Public'} · {r.status}</p><p className="mt-2 text-sm line-clamp-3">{r.coach.description||'Biography requires reconciliation'}</p><p className="text-sm">{(r.coach.qualifications||[]).join(' · ')||'Qualifications not separately supplied'}</p><p className="mt-1 text-xs text-amber-600">{!r.coach.photoUrl?'Photograph missing · ':''}{!r.coach.description?'Biography missing · ':''}Contact forwarding awaiting verification</p></div>
 <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>setPreview(i)}>Preview</Button><Button variant="outline" disabled={busy||r.visibility!=='preview_only'} onClick={()=>setConfirm([r])}>Approve</Button><a className="p-2 text-sm underline" href={'/directory/'+r.slug+'/edit'}>Edit coach</a></div>
 </div>)}</div>
 {report.length>0&&<div role="status" className="rounded-xl border p-3">{report.map(r=><p key={r.name}>{r.name}: {r.ok?'Published successfully':r.error}</p>)}</div>}
 <Dialog open={preview>=0} onOpenChange={open=>{if(!open)setPreview(-1)}}><DialogContent className="max-w-6xl h-[92dvh] flex flex-col p-3 sm:p-5"><DialogHeader><DialogTitle>{rows[preview]?.name} · {preview+1} of {rows.length}</DialogTitle><DialogDescription>Actual stored directory profile. Private contact details are excluded.</DialogDescription></DialogHeader><div className="flex gap-2"><Button variant="outline" disabled={preview<=0} onClick={()=>setPreview(i=>i-1)}>Previous</Button><Button variant="outline" disabled={preview>=rows.length-1} onClick={()=>setPreview(i=>i+1)}>Next</Button></div><div className="flex-1 overflow-y-auto p-1">{previewQuery.isLoading?<p>Loading stored coach profile…</p>:previewQuery.isError?<p role="alert">{previewQuery.error.message}</p>:previewQuery.data&&<CoachProfile key={previewSlug} coach={previewQuery.data} preview/>}</div><a className="text-sm underline" href={'/directory/'+previewSlug+'?preview=1'} target="_blank" rel="noreferrer">Open actual directory profile in a new tab</a></DialogContent></Dialog>
 <Dialog open={!!confirm} onOpenChange={open=>{if(!open&&!busy)setConfirm(null)}}><DialogContent><DialogHeader><DialogTitle>Make {confirm?.length||0} coach{confirm?.length===1?'':'es'} public?</DialogTitle><DialogDescription>Only these selected existing listings will become public. Unchecked coaches remain private.</DialogDescription></DialogHeader><ul className="max-h-48 overflow-auto">{confirm?.map(r=><li key={r.id}>{r.name}</li>)}</ul><p className="text-sm text-amber-600">Publication is your approval of the displayed profile. Contact forwarding remains disabled.</p><Button disabled={busy} onClick={publish}>{busy?'Publishing…':'Confirm: Approve & Make Public'}</Button><Button variant="outline" disabled={busy} onClick={()=>setConfirm(null)}>Cancel</Button></DialogContent></Dialog>
 </section>;
}
