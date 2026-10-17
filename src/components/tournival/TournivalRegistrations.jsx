import React,{useCallback,useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import {base44} from '@/api/base44Client';
import {toast} from 'sonner';

export default function TournivalRegistrations({tournament,isAdmin}) {
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[working,setWorking]=useState(null),[error,setError]=useState('');
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
 const withdraw=row=>{
  const reason=window.prompt('Reason for withdrawal (required):');
  if(reason?.trim().length>=3)act(row,'tournival_withdraw',{reason:reason.trim()});
 };
 return <section className="glass rounded-xl p-4 space-y-3">
  <div className="flex justify-between items-center">
   <div><h3 className="font-semibold">Tournival Registrations & Check-in</h3>
    <p className="text-xs text-muted-foreground">Only confirmed and paid/free registrations may check in.</p></div>
   <Button size="sm" variant="outline" onClick={refresh}>Refresh</Button>
  </div>
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
       {r.status==='confirmed'&&['paid','not_required','simulated'].includes(r.paymentStatus)&&
        <Button disabled={!!working} size="sm" onClick={()=>act(r,'tournival_check_in',{checkedIn:!r.checkedIn})}>
          {r.checkedIn?'Undo check-in':'Check in'}</Button>}
       {r.status!=='withdrawn'&&<Button disabled={!!working} variant="outline" size="sm" onClick={()=>withdraw(r)}>Withdraw</Button>}
      </div>}
    </article>)}
   </div>}
 </section>;
}
