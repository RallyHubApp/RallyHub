import React,{useCallback,useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import {base44} from '@/api/base44Client';
import {toast} from 'sonner';
import PublicTournivalPlayer from '@/pages/PublicTournivalPlayer';

export default function TournivalRegistrations({tournament,isAdmin}) {
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[working,setWorking]=useState(null),[error,setError]=useState('');
 const [preview,setPreview]=useState(null);
 const invoke=useCallback(async payload=>{
  const res=await base44.functions.invoke('legacyTournamentManager',{
   tournamentId:tournament.id,...payload
  });
  if(res?.data?.error)throw Error(res.data.error);
  return res.data||{};
 },[tournament.id]);
 const refresh=useCallback(async()=>{
  try{
   setLoading(true);setError('');
   const data=await invoke({action:'tournival_registrations'});
   setRows(data.registrations||[]);
  }catch(e){setError(e.message||'Cannot load registrations');}
  finally{setLoading(false);}
 },[invoke]);
 useEffect(()=>{refresh();},[refresh]);
 const act=async(row,action,more={})=>{
  if(working)return;
  try{
   setWorking(row.id);setError('');
   const data=await invoke({action,registrationId:row.id,...more});
   toast.success(data.message||'Registration updated');
   await refresh();
  }catch(e){setError(e.message||'Action failed');}finally{setWorking(null);}
 };
 const [invite,setInvite]=useState('');
 const prepareInvite=async()=>{
  try{
   const data=await invoke({action:'create_tournival_registration_link'});
   if(!data.success||!data.path)throw Error('Registration link unavailable');
   setInvite(tournament.name+' — '+(tournament.start_date||'')+' '+(tournament.event_start_time||'')+'–'+(tournament.event_end_time||'')+'\n'+(tournament.location||'')+'\nRegister: '+window.location.origin+data.path);
  }catch(e){setError(e.message);}
 };
 const withdraw=row=>{
  const reason=window.prompt('Reason for withdrawal (required):');
  if(reason?.trim().length>=3)act(row,'tournival_withdraw',{reason:reason.trim()});
 };
 return <section className="glass rounded-xl p-4 space-y-3">
  {preview&&<div role="dialog" aria-modal="true" aria-label="Organiser player page preview" className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-3 sm:p-8">
   <div className="mx-auto max-w-3xl rounded-xl bg-background p-3">
    <div className="mb-3 flex items-center justify-between gap-3"><div><strong>Organiser preview — {preview.player.name}</strong><p className="text-xs text-muted-foreground">Read-only preview. No payment required; no personal access link is issued.</p></div><Button onClick={()=>setPreview(null)}>Close preview</Button></div>
    <PublicTournivalPlayer previewData={preview}/>
   </div>
  </div>}
  <div className="flex justify-between items-center">
   <div><h3 className="font-semibold">Tournival Registrations & Check-in</h3>
    <p className="text-xs text-muted-foreground">Only confirmed and paid/free registrations may check in.</p></div>
   <Button size="sm" variant="outline" onClick={refresh}>Refresh</Button>
  </div>
  {isAdmin&&<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={prepareInvite}>Prepare WhatsApp invitation</Button>{invite&&<><Button variant="outline" onClick={()=>window.open('https://wa.me/?text='+encodeURIComponent(invite),'_blank','noopener,noreferrer')}>Share via WhatsApp</Button><Button variant="outline" onClick={()=>navigator.clipboard.writeText(invite).then(()=>toast.success('Invitation copied')).catch(()=>toast.error('Copy failed'))}>Copy invitation</Button></>}</div>}
  {!loading&&!error&&<p>{rows.filter(r=>['confirmed','pending_payment'].includes(r.status)).length}/{tournament.max_players||32} registered · {rows.filter(r=>r.status==='confirmed'&&['paid','not_required'].includes(r.paymentStatus)).length} paid/free</p>}
  {error&&<p role="alert" className="text-xs text-destructive">{error}</p>}
  {loading?<p className="text-xs">Loading registrations…</p>:
   <div className="space-y-2">
    {rows.length===0&&<p className="text-sm">No registered players yet.</p>}
    {rows.map(r=><article className="border border-border rounded-lg p-3 text-xs space-y-1" key={r.id}>
      <div className="flex justify-between gap-2"><span className="font-semibold">{r.name}</span>
       <span>{r.status?.replaceAll('_',' ')}</span></div>
      <p className="text-muted-foreground">{r.email} · Payment: {r.paymentStatus}</p>
      {r.waitlistPosition&&<p>Waitlist #{r.waitlistPosition}</p>}
      <p>{r.checkedIn?'Checked in':'Not checked in'}</p>
      {isAdmin&&<div className="flex gap-2">
       <Button size="sm" variant="outline" onClick={()=>setPreview({stage:'registration',event:{id:tournament.id,name:tournament.name,date:tournament.start_date,venue:tournament.location,startTime:tournament.event_start_time||'19:00',endTime:tournament.event_end_time||'22:00',mapUrl:tournament.event_map_url||'',arrivalInfo:tournament.event_player_info||'',contactPhone:tournament.event_contact_phone_keep_private?'':tournament.event_contact_phone||'',organiser:{name:'Clare Pickleball'}},player:{id:r.playerId,name:r.name,registrationStatus:r.status,paymentStatus:r.paymentStatus,checkedIn:r.checkedIn},matches:[],knockout:[],displayNames:{},finalised:false})}>View Player Page</Button>
       {r.status==='confirmed'&&['paid','not_required','simulated'].includes(r.paymentStatus)&&
        <Button disabled={!!working} size="sm" onClick={()=>act(r,'tournival_check_in',{checkedIn:!r.checkedIn})}>
          {r.checkedIn?'Undo check-in':'Check in'}</Button>}
       {r.status!=='withdrawn'&&<Button disabled={!!working} variant="outline" size="sm" onClick={()=>withdraw(r)}>Withdraw</Button>}
      </div>}
    </article>)}
   </div>}
 </section>;
}
