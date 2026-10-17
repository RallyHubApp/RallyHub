import React,{useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {base44} from '@/api/base44Client';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
export default function PublicTournivalPlayer(){
 const {token}=useParams(),[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const [refreshCounter,setRefreshCounter]=useState(0);
 useEffect(()=>{
  let mounted=true,timeout;
  async function load(){
    try{
     const response=await base44.functions.invoke('tournivalPlayerPortal',{token,action:'get'});
     const next=response?.data||{};
     if(!mounted)return;
     if(next.error)throw Error(next.error);
     setData(next);setError('');setLoading(false);
     timeout=setTimeout(load,document.hidden?60000:30000);
    }catch(e){
     if(!mounted)return;
     setError(e?.message||'Cannot retrieve player information');setLoading(false);
     timeout=setTimeout(load,60000);
    }
  }
  load();
  return ()=>{mounted=false;clearTimeout(timeout);};
 },[token,refreshCounter]);
 const player=data?.player,upcoming=data?.matches?.find(m=>['waiting','playing','scheduled'].includes(m.status));
 return <main className="min-h-screen bg-background text-foreground p-4"><div className="max-w-lg mx-auto space-y-4">
  <RallyHubPublicBrand moduleName="Tournival" pageLabel="My Player Link"/>
  {loading?<p>Loading your tournament…</p>:error?<p role="alert" className="text-destructive">{error}</p>:data&&<>
   <section className="glass rounded-xl p-5"><h1 className="text-xl font-bold">{data.event.name}</h1>
    <p className="text-sm">{data.event.date} · {data.event.venue}</p>
    <p className="mt-2 font-semibold">{player.name}</p>
    <p className="text-sm">Registration: {player.registrationStatus?.replaceAll('_',' ')}</p>
    <p className="text-sm">Payment: {player.paymentStatus?.replaceAll('_',' ')}</p>
    <p className="text-sm">Check-in: {player.checkedIn?'Checked in':'Awaiting check-in'}</p>
   </section>
   {upcoming&&<section className="glass rounded-xl p-5">
    <h2 className="font-semibold">Your next match</h2>
    <p className="text-sm">Round {upcoming.round} · {upcoming.court?'Court '+upcoming.court:'Court to be allocated'}</p>
    <p className="text-xs">Status: {upcoming.status}</p>
   </section>}
   <section className="glass rounded-xl p-5">
    <h2 className="font-semibold">Your qualification matches</h2>
    {data.matches?.length?data.matches.map(m=><div key={m.id} className="border-t border-border py-2 text-sm">
      Round {m.round} · Court {m.court||'TBC'} · {m.result?`${m.result.scoreA}–${m.result.scoreB}`:m.status||'scheduled'}
    </div>):<p className="text-xs">Fixtures will appear after the draw is published.</p>}
   </section>
   <section className="glass rounded-xl p-5">
    <h2 className="font-semibold">Knockout and final</h2>
    {data.knockout?.length?data.knockout.map(m=><p key={m.id} className="text-xs">
      {m.stage}: {m.result?`${m.result.scoreA}–${m.result.scoreB}`:'Awaiting match'}
    </p>):<p className="text-xs">Qualifying places and knockout progress will appear here when confirmed.</p>}
   </section>
   <p className="text-xs text-muted-foreground">Personal link — do not share. Updates are read-only and do not affect scores.</p>
   <Button variant="outline" onClick={()=>setRefreshCounter(x=>x+1)}>Refresh my matches</Button>
  </>}
 </div></main>;
}
