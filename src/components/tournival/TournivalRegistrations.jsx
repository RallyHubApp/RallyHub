import React,{useCallback,useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import {base44} from '@/api/base44Client';
import {useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import PublicTournivalPlayer from '@/pages/PublicTournivalPlayer';

export default function TournivalRegistrations({tournament,isAdmin}) {
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[working,setWorking]=useState(null),[error,setError]=useState('');
 const queryClient=useQueryClient();
 const [adding,setAdding]=useState(false),[search,setSearch]=useState(''),[choices,setChoices]=useState([]),[selected,setSelected]=useState(''),[personalPath,setPersonalPath]=useState('');
 const [transfer,setTransfer]=useState(null),[targets,setTargets]=useState([]),[destination,setDestination]=useState('');
 const [preview,setPreview]=useState(null);
 const [reminder,setReminder]=useState(null);
 const invoke=useCallback(async payload=>{
  const res=await base44.functions.invoke('legacyTournamentManager',{
   tournamentId:tournament.id,...payload
  });
  if(res?.data?.error)throw Error(res.data.error);
  return res.data||{};
 },[tournament.id]);
 const refresh=useCallback(async()=>{
  setReminder(null);
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
   await queryClient.invalidateQueries();
  }catch(e){setError(e.message||'Action failed');}finally{setWorking(null);}
 };
 const add=async()=>{if(working||!selected)return;try{setWorking('add');setError('');const result=await invoke({action:'tournival_manual_add',playerId:selected,paymentMode:'complimentary'});setPersonalPath(result.personalPath||'');setAdding(false);setSelected('');await refresh();await queryClient.invalidateQueries();toast.success('Player registered');}catch(e){setError(e.message);}finally{setWorking(null);}};
 const find=async()=>{try{setSelected('');setChoices((await invoke({action:'tournival_manual_search',search})).players||[]);}catch(e){setError(e.message);}};
 const [invite,setInvite]=useState('');
 const prepareInvite=async()=>{
  try{
   const data=await invoke({action:'create_tournival_registration_link'});
   if(!data.success||!data.path)throw Error('Registration link unavailable');
   setInvite(tournament.name+' — '+(tournament.start_date||'')+' '+(tournament.event_start_time||'')+'–'+(tournament.event_end_time||'')+'\n'+(tournament.location||'')+'\nRegister: '+window.location.origin+data.path);
  }catch(e){setError(e.message);}
 };
 const prepareTransfer=async row=>{try{setError('');setDestination('');setTargets((await invoke({action:'tournival_transfer_targets'})).targets||[]);setTransfer(row);}catch(e){setError(e.message);}};
 const confirmTransfer=async()=>{if(!transfer||!destination||working)return;try{setWorking(transfer.id);setError('');const data=await invoke({action:'tournival_transfer',registrationId:transfer.id,targetTournamentId:destination});setTransfer(null);await refresh();await queryClient.invalidateQueries();toast.success(data.message||'Player transferred');}catch(e){setError(e.message);}finally{setWorking(null);}};
 const requestPayment=async row=>{
  if(working)return;
  setWorking(row.id);setError('');
  setReminder(null);
  try{
   const data=await invoke({action:'tournival_payment_reminder',registrationId:row.id});
   if(data.alreadyPaid){await refresh();toast.success('Payment already received and reconciled');return;}
   const amount=new Intl.NumberFormat('en-IE',{style:'currency',currency:data.currency}).format(data.amount);
   const message=`Hi ${String(data.name||'there').split(' ')[0]}, just a reminder that your payment of ${amount} for ${tournament.name} (${tournament.start_date||''}) is outstanding. Please complete your payment using your secure SumUp link: \n${data.checkoutUrl}\nThanks!`;

   setReminder({id:row.id,name:data.name,mobile:data.mobile,message});
  }catch(e){setError(e?.response?.data?.error||e.message||'Payment reminder unavailable');}finally{setWorking(null);}
 };
 const whatsappNumber=value=>{let n=String(value||'').replace(/[^0-9]/g,'');if(n.startsWith('00'))n=n.slice(2);else if(n.startsWith('0'))n='353'+n.slice(1);return /^[1-9][0-9]{7,14}$/.test(n)?n:'';};
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
  {isAdmin&&['Draft','Registration Open'].includes(tournament.status)&&<Button onClick={()=>setAdding(!adding)}>Add Player</Button>}
  {adding&&<div className="border rounded-lg p-3 space-y-2"><label>Search existing player<input className="block border rounded p-2 w-full" value={search} onChange={e=>setSearch(e.target.value)}/></label><Button onClick={find} disabled={search.trim().length<2}>Search</Button><select className="block border rounded p-2 w-full" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Select player</option>{choices.map(p=><option key={p.id} value={p.id}>{p.name} — {p.email}</option>)}</select><p className="text-sm">Complimentary — no payment required</p><Button disabled={!selected||!!working} onClick={add}>Confirm registration</Button></div>}
  {transfer&&<div className="border rounded-lg p-3 space-y-2"><strong>Transfer {transfer.name}</strong><p className="text-sm">Original payment and personal link retained. No additional payment.</p><select className="block border rounded p-2 w-full" value={destination} onChange={e=>setDestination(e.target.value)}><option value="">Select destination</option>{targets.map(t=><option key={t.id} value={t.id}>{t.name} — {t.date} {t.time} ({t.available} places)</option>)}</select>{!targets.length&&<p>No eligible destination with available places.</p>}<Button disabled={!destination||!!working} onClick={confirmTransfer}>Confirm transfer</Button> <Button variant="outline" disabled={!!working} onClick={()=>setTransfer(null)}>Cancel</Button></div>}
  {personalPath&&<p>Personal player link: <a className="underline" href={personalPath}>Open player page</a> <Button variant="outline" onClick={()=>navigator.clipboard.writeText(window.location.origin+personalPath)}>Copy link</Button></p>}
  {!loading&&!error&&(()=>{const active=rows.filter(r=>['confirmed','pending_payment'].includes(r.status)),cap=tournament.max_players||32;return <div className="space-y-2"><strong>{active.length}/{cap} registered · {Math.max(0,cap-active.length)} places left</strong><progress className="w-full" value={active.length} max={cap}/><div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">{[['Paid',active.filter(r=>r.paymentStatus==='paid').length],['Complimentary',active.filter(r=>r.paymentReference==='manual:complimentary').length],['Awaiting payment',active.filter(r=>r.status==='pending_payment').length],['Checked in',active.filter(r=>r.checkedIn).length],['Waitlist',rows.filter(r=>r.status==='waitlisted').length]].map(([label,n])=><div className="border rounded p-2" key={label}>{label}: <strong>{n}</strong></div>)}</div></div>})()}
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
      {isAdmin&&<div className="flex flex-wrap gap-2">
       <Button size="sm" variant="outline" onClick={()=>setPreview({stage:'registration',event:{id:tournament.id,name:tournament.name,date:tournament.start_date,venue:tournament.location,startTime:tournament.event_start_time||'19:00',endTime:tournament.event_end_time||'22:00',mapUrl:tournament.event_map_url||'',arrivalInfo:tournament.event_player_info||'',contactPhone:tournament.event_contact_phone_keep_private?'':tournament.event_contact_phone||'',organiser:{name:'Clare Pickleball'}},player:{id:r.playerId,name:r.name,registrationStatus:r.status,paymentStatus:r.paymentStatus,checkedIn:r.checkedIn},matches:[],knockout:[],displayNames:{},finalised:false})}>View Player Page</Button>
       {r.status==='confirmed'&&['paid','not_required','simulated'].includes(r.paymentStatus)&&
        <Button disabled={!!working} size="sm" onClick={()=>act(r,'tournival_check_in',{checkedIn:!r.checkedIn})}>
          {r.checkedIn?'Undo check-in':'Check in'}</Button>}
       {r.status==='confirmed'&&!r.checkedIn&&['paid','not_required','simulated'].includes(r.paymentStatus)&&['Draft','Registration Open'].includes(tournament.status)&&<Button disabled={!!working} variant="outline" size="sm" onClick={()=>prepareTransfer(r)}>Transfer Player</Button>}
       {r.status==='pending_payment'&&['pending','failed','expired'].includes(r.paymentStatus)&&<Button disabled={!!working} variant="outline" size="sm" onClick={()=>requestPayment(r)}>Request Payment via WhatsApp</Button>}
       {r.status!=='withdrawn'&&<Button disabled={!!working} variant="outline" size="sm" onClick={()=>withdraw(r)}>Withdraw</Button>}
      </div>}
      {isAdmin&&reminder?.id===r.id&&r.status==='pending_payment'&&['pending','failed','expired'].includes(r.paymentStatus)&&<div className="border rounded-lg p-3 space-y-2">
       <strong>Payment reminder for {reminder.name}</strong>
       <label className="block">WhatsApp mobile number (editable for this reminder)<input type="tel" className="block border rounded p-2 w-full" value={reminder.mobile} onChange={e=>setReminder({...reminder,mobile:e.target.value})}/></label>
       <p className="text-muted-foreground">Changing this number does not change the player's saved contact details.</p>
       <textarea aria-label="Payment reminder message" className="block border rounded p-2 w-full min-h-28" readOnly value={reminder.message}/>
       {!whatsappNumber(reminder.mobile)&&<p>Enter a valid number to open WhatsApp, or copy the message below.</p>}
       <div className="flex flex-wrap gap-2">
        {whatsappNumber(reminder.mobile)&&<><a className="underline p-2" href={'whatsapp://send?phone='+whatsappNumber(reminder.mobile)+'&text='+encodeURIComponent(reminder.message)}>Open WhatsApp app</a>
        <a className="underline p-2" href={'https://web.whatsapp.com/send?phone='+whatsappNumber(reminder.mobile)+'&text='+encodeURIComponent(reminder.message)} target="_blank" rel="noopener noreferrer">Open WhatsApp Web</a></>}
        <Button size="sm" variant="outline" onClick={()=>navigator.clipboard.writeText(reminder.message).then(()=>toast.success('Payment reminder copied')).catch(()=>toast.error('Copy failed'))}>Copy Payment Reminder</Button>
        <Button size="sm" variant="outline" onClick={()=>navigator.clipboard.writeText(reminder.message.match(/https:\/\/[^\s]+/)?.[0]||'').then(()=>toast.success('Payment link copied')).catch(()=>toast.error('Copy failed'))}>Copy Payment Link</Button>
        <Button size="sm" variant="outline" onClick={()=>setReminder(null)}>Close</Button>
       </div>
       <p>No message is sent until you press Send in WhatsApp.</p>
      </div>}
    </article>)}
   </div>}
 </section>;
}
