import React,{useEffect,useRef,useState} from 'react';
import {useParams} from 'react-router-dom';
import {base44} from '@/api/base44Client';
import TournivalHall from '@/components/tournival/TournivalHall';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
import {Button} from '@/components/ui/button';

export default function PublicTournivalHall(){
 const {id}=useParams(),[view,setView]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const rev=useRef(null),retries=useRef(0),[manual,setManual]=useState(0);
 useEffect(()=>{
  let mounted=true,timer;
  const refresh=async()=>{
   try{
    const res=await base44.functions.invoke('tournivalPublicRead',{
     tournamentId:id,...(rev.current===null?{}:{clientRevision:rev.current})
    });
    if(!mounted)return;
    const data=res?.data||{};
    if(data.error)throw Error(data.error);
    if(!data.unchanged){
     rev.current=data.revision??null;
     setView({event:data.event,state:data.state,playerMap:data.playerMap});
    }
    retries.current=0;setError('');setLoading(false);
   }catch(e){if(!mounted)return;setError(e.message||'Live Hall temporarily unavailable');
     retries.current=Math.min(6,retries.current+1);setLoading(false);
   }
   if(mounted){
    const delay=retries.current?Math.min(120000,15000*2**retries.current):(document.hidden?60000:20000);
    timer=setTimeout(refresh,delay+Math.floor(Math.random()*3000));
   }
  };
  refresh();
  return()=>{mounted=false;clearTimeout(timer);};
 },[id,manual]);
 return <main className="min-h-screen bg-background text-foreground p-4">
  <div className="max-w-5xl mx-auto space-y-4">
   <RallyHubPublicBrand moduleName="Tournival" pageLabel="Live Hall"/>
   {loading?<p>Loading Live Hall…</p>:view?<TournivalHall tournament={view.event} state={view.state} playerMap={view.playerMap||{}} />:null}
   {error&&<p className="text-xs text-destructive" role="alert">{error}</p>}
   <Button variant="outline" onClick={()=>setManual(n=>n+1)}>Refresh confirmed scores</Button>
   <p className="text-xs text-muted-foreground">Read-only spectator view. Only confirmed scores and published sporting details are displayed.</p>
  </div>
 </main>;
}
