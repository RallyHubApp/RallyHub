import React,{useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
import {useAuth} from '@/lib/AuthContext';
export default function TournivalAudiencePanel(){
 const {user}=useAuth();
 const [events,setEvents]=useState([]),[eventId,setEventId]=useState('');
 const [audience,setAudience]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [selectedKeys,setSelectedKeys]=useState([]),[statusFilter,setStatusFilter]=useState('all');
 const clubId=user?.active_club_id||'';
 useEffect(()=>{if(!user?.active_tenant_id)return;let alive=true;
  base44.entities.Tournament.filter({tenant_id:user.active_tenant_id,format:'Tournival'},'-created_date',100)
   .then(rows=>{if(alive)setEvents(rows||[])}).catch(e=>{if(alive)setError(e.message)});
  return()=>{alive=false};
 },[user?.active_tenant_id]);
 const refresh=async(id=eventId)=>{
  if(!id||!clubId)return;
  setBusy(true);setError('');setNotice('');
  try{
   const r=await base44.functions.invoke('communicationsEngine',{
    action:'tournival_audience',ownerScope:'tenant',tenantId:user.active_tenant_id,
    clubId,eventId:id,purpose:'tournival_results'
   });
   if(!r.data?.success)throw Error(r.data?.error||'Audience not available');
   setAudience(r.data.audience||[]);setSelectedKeys([]);
  }catch(e){setError(e?.response?.data?.error||e.message)}finally{setBusy(false)}
 };
 const filteredAudience=audience.filter(a=>statusFilter==='all'||a.deliveryStatus===statusFilter);
 const toggleSelected=(id)=>setSelectedKeys(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 const queueSelected=async()=>{
  const selected=filteredAudience.filter(a=>selectedKeys.includes(a.deliveryId||a.recipientId)&&a.eligibility==='eligible'&&a.deliveryStatus!=='suppressed');
  if(!selected.length)return;
  const reason=window.prompt('Audit reason for resending to the selected Tournival audience (at least 8 characters):','');
  if(!reason||reason.trim().length<8)return;
  if(!window.confirm('Queue '+selected.length+' selected recipient(s) for a new approved-template attempt? No messages will be sent yet.'))return;
  setBusy(true);setError('');setNotice('');let queued=0,skipped=0;
  try{for(const item of selected){
   const r=await base44.functions.invoke('communicationsEngine',{
    action:'resend_tournival',ownerScope:'tenant',tenantId:user.active_tenant_id,
    clubId,eventId,purpose:item.purpose,sourceRecordId:item.sourceRecordId,
    deliveryVersion:Number(item.attemptNumber||1)+1,resendReason:reason,
    operationId:crypto.randomUUID(),channel:item.channel,
    recipient:{id:item.sourceRecordId,name:item.name,email:item.email,mobile:item.mobile},fields:item.fields
   });
   if(r.data?.queued)queued++;else skipped++;
  }
   await refresh();
   setNotice(queued+' queued, '+skipped+' previously queued or skipped. No messages sent.');
  }catch(e){setError('Stopped after '+queued+' queued: '+(e?.response?.data?.error||e.message)+'; reload audience before retrying.')}
  finally{setBusy(false)}
 };
 const dispatch=async(item)=>{
  if(item.channel!=='email'||item.deliveryStatus!=='queued'||!item.deliveryId)return;
  if(!window.confirm('Send the selected queued email using the tenant Communications Centre sender? This will contact '+(item.email||item.name)+'.'))return;
  setBusy(true);setError('');setNotice('');
  try{
   const r=await base44.functions.invoke('communicationsEngine',{
    action:'dispatch_tournival',ownerScope:'tenant',tenantId:user.active_tenant_id,
    clubId,purpose:item.purpose,attemptId:item.deliveryId,confirmDispatch:true
   });
   if(!r.data?.success)throw Error(r.data?.error||'Dispatch was not confirmed');
   await refresh();
   setNotice('Email handed to the configured tenant sender and recorded as sent.');
  }catch(e){setError(e?.response?.data?.error||e.message)}
  finally{setBusy(false)}
 };
 const resend=async(item)=>{
  if(item.eligibility!=='eligible')return;
  const reason=window.prompt('Reason for this controlled resend (recorded in the audit):','');
  if(!reason||reason.trim().length<8)return;
  const version=Number(item.attemptNumber||1)+1;
  if(!window.confirm('Queue a new attempt for '+item.name+'? No message is sent automatically.'))return;
  setBusy(true);setError('');setNotice('');
  try{
   const r=await base44.functions.invoke('communicationsEngine',{
    action:'resend_tournival',ownerScope:'tenant',tenantId:user.active_tenant_id,
    clubId,eventId,purpose:item.purpose,sourceRecordId:item.sourceRecordId,
    deliveryVersion:version,resendReason:reason,operationId:crypto.randomUUID(),
    channel:item.channel,recipient:{id:item.sourceRecordId,name:item.name,email:item.email,mobile:item.mobile},
    fields:item.fields
   });
   if(!r.data?.success)throw Error(r.data?.error||'Cannot queue resend');
   await refresh();
   setNotice(r.data.duplicate?'This resend is already in the queue.':'Resend queued for authorised review; no message sent.');
  }catch(e){setError(e?.response?.data?.error||e.message)}finally{setBusy(false)}
 };
 return <section className="rounded-xl border p-4 space-y-3">
  <h3 className="font-bold">Tournival audience and delivery history</h3>
  <p className="text-sm text-muted-foreground">View saved recipients and message statuses. A controlled resend creates a new queued attempt using the approved tenant template. No automatic sending.</p>
  <div className="flex flex-wrap gap-2 items-center">
   <select aria-label="Tournival event" className="border rounded p-2" value={eventId} onChange={e=>{setEventId(e.target.value);setAudience([])}}><option value="">Select Tournival</option>{events.map(e=><option value={e.id} key={e.id}>{e.name}</option>)}</select>
   <button type="button" className="rounded border px-3 py-2" disabled={!eventId||busy||!clubId} onClick={()=>refresh()}>{busy?'Working…':'Load audience'}</button>
  </div>
  {!clubId&&<p className="text-sm text-amber-700">Choose a tenant club before reviewing its audience.</p>}
  {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
  {notice&&<p role="status" className="text-sm text-slate-700">{notice}</p>}
  <div className="flex flex-wrap items-center gap-2 text-sm"><label>Delivery status <select className="border rounded p-1" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All statuses</option>{['queued','sent','sending','failed','delivered','cancelled','suppressed'].map(v=><option key={v}>{v}</option>)}</select></label><button type="button" className="rounded border px-3 py-2" disabled={busy||selectedKeys.length===0} onClick={queueSelected}>Queue selected resends ({selectedKeys.length})</button></div>
  <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="text-left p-2">Select</th><th className="text-left p-2">Audience</th><th className="text-left p-2">Message</th><th className="text-left p-2">Delivery</th><th className="text-left p-2">Action</th></tr></thead><tbody>
  {filteredAudience.map(a=><tr key={a.deliveryId||a.recipientId} className="border-t"><td className="p-2"><input type="checkbox" aria-label={'Select '+a.name} disabled={busy||a.eligibility!=='eligible'||a.deliveryStatus==='suppressed'} checked={selectedKeys.includes(a.deliveryId||a.recipientId)} onChange={()=>toggleSelected(a.deliveryId||a.recipientId)}/></td><td className="p-2">{a.name}<div className="text-xs text-muted-foreground">{a.email||a.mobile}</div></td><td className="p-2">{a.purpose}</td><td className="p-2">{a.deliveryStatus} · attempt {a.attemptNumber}</td><td className="p-2"><button className="underline" type="button" disabled={busy||a.eligibility!=='eligible'||a.deliveryStatus==='suppressed'} onClick={()=>resend(a)}>Queue resend</button>{a.channel==='email'&&a.deliveryStatus==='queued'&&<button className="underline ml-3" type="button" disabled={busy} onClick={()=>dispatch(a)}>Send queued email</button>}</td></tr>)}
  {!audience.length&&<tr><td colSpan={5} className="p-3 text-muted-foreground">No queued Tournival recipients loaded.</td></tr>}
  </tbody></table></div>
 </section>;
}
