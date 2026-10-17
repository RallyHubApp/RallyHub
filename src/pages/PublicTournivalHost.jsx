import React,{useCallback,useEffect,useRef,useState} from 'react';
import {useParams} from 'react-router-dom';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import TournivalLiveScoring from '@/components/tournival/TournivalLiveScoring';
import TournivalTimingMonitor from '@/components/tournival/TournivalTimingMonitor';
import TournivalAnnouncements from '@/components/tournival/TournivalAnnouncements';
import TournivalHall from '@/components/tournival/TournivalHall';
import TournivalPrintPack from '@/components/tournival/TournivalPrintPack';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
/**
 * Delegated bearer link. Never asks a host to sign in as Super Admin.
 * Role is restricted by the backend: match scoring, court scheduling, timing
 * and in-app hall announcements, no payments, entity access or configuration.
 */
export default function PublicTournivalHost(){
 const {token}=useParams(),[snapshot,setSnapshot]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[tab,setTab]=useState('scores');
 const snapshotRef=useRef(null),busyRef=useRef(false);
 const invoke=useCallback(async(payload)=>{
  const res=await base44.functions.invoke('tournivalHostAccess',{token,...payload});
  if(res.data?.error)throw Error(res.data.error);
  return res.data||{};
 },[token]);
 const refresh=useCallback(async()=>{
  const data=await invoke({action:'get'});
  setSnapshot(data);snapshotRef.current=data;setError('');
  return data;
 },[invoke]);
 useEffect(()=>{
  let active=true;
  refresh().catch(e=>active&&setError(e.message||'Host link unavailable'));
  return()=>{active=false;};
 },[refresh]);
 const saveState=async(next,{correctionReason=''}={})=>{
  if(busyRef.current)throw Error('A host change is already saving; check confirmed state before retrying.');
  busyRef.current=true;setBusy(true);setError('');
  try{
   const current=snapshotRef.current?.state;
   if(!current)throw Error('Tournament state not loaded');
   const operationId=crypto.randomUUID();
   await invoke({action:'save',expectedRevision:current.revision||0,operationId,
    stateJson:JSON.stringify(next),correctionReason});
   await refresh(); // reconcile true committed state after save
  }catch(e){
   await refresh().catch(()=>{});
   setError(e.message||'Host save not confirmed; check latest state before retrying.');
   throw e;
  }finally{busyRef.current=false;setBusy(false);}
 };
 const state=snapshot?.state,playerMap=snapshot?.playerMap||{},event=snapshot?.event||{};
 const views=[
  ['scores','Courts & Scores'],['timing','Schedule'],['announcements','Announcements'],
  ['hall','Hall View'],['print','Print Pack']
 ];
 return <main className="min-h-screen bg-background text-foreground p-3 sm:p-5">
  <div className="max-w-5xl mx-auto space-y-4">
   <RallyHubPublicBrand moduleName="Tournival" pageLabel="Delegated Host"/>
   <div className="glass rounded-xl p-4">
    <h1 className="font-bold text-lg">{event.name||'Tournival — delegated host'}</h1>
    <p className="text-xs">Limited host link: scores, court allocations, timing and hall announcements. No financial, DUPR or tournament configuration privileges.</p>
    <div className="flex gap-2 mt-2"><Button size="sm" variant="outline" onClick={()=>refresh().catch(e=>setError(e.message))} disabled={busy}>Refresh authoritative scores</Button>
     <span className="text-xs">Revision {state?.revision||0}</span>
    </div>
   </div>
   {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
   {!state?<p>Loading secure host control…</p>:<>
    <nav className="flex overflow-x-auto gap-2" aria-label="Host sections">{views.map(([key,label])=>
      <Button key={key} variant={tab===key?'default':'outline'} size="sm" onClick={()=>setTab(key)}>{label}</Button>)}</nav>
    {tab==='scores'&&<TournivalLiveScoring state={state} playerMap={playerMap} onSaveState={saveState} isAdmin={!busy}/>}
    {tab==='timing'&&<TournivalTimingMonitor state={state} onSaveState={saveState} isAdmin={!busy}/>}
    {tab==='announcements'&&<TournivalAnnouncements state={state} playerMap={playerMap} tournament={event} onSaveState={saveState} isAdmin={!busy}/>}
    {tab==='hall'&&<TournivalHall state={state} tournament={event} playerMap={playerMap}/>}
    {tab==='print'&&<TournivalPrintPack state={state} tournament={event} playerMap={playerMap} currentRevision={state.revision}/>}
   </>}
  </div>
 </main>;
}
