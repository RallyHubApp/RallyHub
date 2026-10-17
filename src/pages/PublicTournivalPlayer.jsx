import React,{useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {base44} from '@/api/base44Client';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
import {CalendarDays,Clock3,MapPin,Phone,Info,ClipboardCheck,ListChecks,Trophy} from 'lucide-react';
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
 const stageIndex=['registration','fixtures','live','knockout','results'].indexOf(data?.stage||'registration');
 const mapLink=data?.event?.mapUrl||'';
 const rawPhone=data?.event?.contactPhone||'';
 const tel=rawPhone.replace(/[^+0-9]/g,'');
 const dateText=data?.event?.date?new Date(data.event.date+'T12:00:00Z').toLocaleDateString('en-IE',{
  weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'Date to be confirmed';

 const describeTeams=(match)=>{
  if(!match||!player)return null;
  const ownA=(match.teamA||[]).includes(player.id);
  const team=ownA?match.teamA||[]:match.teamB||[];
  const other=ownA?match.teamB||[]:match.teamA||[];
  const labels=ids=>ids.map(id=>data?.displayNames?.[id]||'Participant').join(' & ');
  return {partner:labels(team.filter(id=>id!==player.id)),
    opponents:labels(other),side:ownA?'A':'B'};
 };

 return <main className="min-h-screen bg-background text-foreground p-4"><div className="max-w-lg mx-auto space-y-4">
  <RallyHubPublicBrand moduleName="Tournival" pageLabel="My Player Link" club={data?.event?.organiser} clubFirst/>
  {loading?<p>Loading your tournament…</p>:error?<p role="alert" className="text-destructive">{error}</p>:data&&<>
   <nav aria-label="Player information" className="flex flex-wrap gap-2 rounded-xl border bg-card p-2 text-xs font-semibold">
    <span className="rounded-md bg-primary px-3 py-2 text-primary-foreground">Registration & Venue</span>
    {stageIndex>=1&&<span className="rounded-md bg-secondary px-3 py-2">Fixtures</span>}
    {stageIndex>=2&&<span className="rounded-md bg-secondary px-3 py-2">Live Matches</span>}
    {stageIndex>=3&&<span className="rounded-md bg-secondary px-3 py-2">Knockout</span>}
    {stageIndex>=4&&<span className="rounded-md bg-secondary px-3 py-2">Final Results</span>}
   </nav>
   <section className="glass rounded-xl p-5"><h1 className="text-xl font-bold">{data.event.name}</h1>
    <p className="mt-2 flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4 shrink-0"/> {dateText}</p>
    <p className="mt-1 flex items-center gap-2 text-sm"><Clock3 className="h-4 w-4 shrink-0"/> {data.event.startTime||'Time to be confirmed'}{data.event.endTime?'–'+data.event.endTime:''}</p>
    <p className="mt-2 font-semibold">{player.name}</p>
    <p className="text-sm">Registration: {player.registrationStatus?.replaceAll('_',' ')}</p>
    <p className="text-sm">Payment: {player.paymentStatus?.replaceAll('_',' ')}</p>
    {stageIndex>=2&&<p className="text-sm">Check-in: {player.checkedIn?'Checked in':'Awaiting check-in'}</p>}
   </section>
   <section className="glass rounded-xl p-5 space-y-3">
    <h2 className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4"/> Venue & Directions</h2>
    <p className="text-sm">{data.event.venue||'Venue to be confirmed by the organiser'}</p>
    {mapLink&&<a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Open directions in Google Maps</a>}
    {data.event.venue&&/st\.?\s*joseph|doora\s*barefield/i.test(data.event.venue)&&<img
      src="https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/3e5dfe5f6_StJosephsGAAParkingEntrance.png"
      alt="Parking and sports hall entrance directions at St Joseph’s Doora Barefield GAA"
      loading="lazy" className="w-full rounded-xl border bg-background object-contain"/>}
    {data.event.arrivalInfo&&<div className="rounded-lg border bg-secondary/30 p-4">
     <h3 className="text-sm font-bold">Parking & arrival information</h3>
     <p className="mt-2 whitespace-pre-line text-sm">{data.event.arrivalInfo}</p>
    </div>}
   </section>
   <section className="glass rounded-xl p-5 space-y-2">
    <h2 className="flex items-center gap-2 font-bold"><Info className="h-4 w-4"/> Event information & contact</h2>
    <p className="text-sm">Organised by {data.event.organiser?.name||'the tournament organiser'}.</p>
    {rawPhone&&<a href={'tel:'+tel} className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"><Phone className="h-4 w-4"/>Call event organiser: {rawPhone}</a>}
    <p className="text-xs text-muted-foreground">{stageIndex===0?'Your tournament details will appear here when the organiser publishes the next stage. Keep this link for updates.':'Updates will appear here as the event progresses.'}</p>
   </section>
   {stageIndex>=2&&upcoming&&<section className="glass rounded-xl p-5">
    <h2 className="font-semibold">Your next match</h2>
    <p className="text-sm">Round {upcoming.round} · {upcoming.court?'Court '+upcoming.court:'Court to be allocated'}</p>
    <p className="text-xs">Status: {upcoming.status}</p>
    {describeTeams(upcoming)&&<><p className="text-sm">Partner: {describeTeams(upcoming).partner}</p>
      <p className="text-sm">Opponents: {describeTeams(upcoming).opponents}</p></>}
   </section>}
   {stageIndex>=1&&<section className="glass rounded-xl p-5">
    <h2 className="font-semibold">Your qualification matches</h2>
    {data.matches?.length?data.matches.map(m=><div key={m.id} className="border-t border-border py-2 text-sm">
      Round {m.round} · Court {m.court||'TBC'} · {m.result?`${m.result.scoreA}–${m.result.scoreB}`:m.status||'scheduled'}
      {describeTeams(m)&&<p className="text-xs text-muted-foreground">Partner: {describeTeams(m).partner} · Opponents: {describeTeams(m).opponents}</p>}
    </div>):<p className="text-xs">Fixtures will appear after the draw is published.</p>}
   </section>}
   {stageIndex>=3&&<section className="glass rounded-xl p-5">
    <h2 className="font-semibold">Knockout and final</h2>
    {data.knockout?.length?data.knockout.map(m=><p key={m.id} className="text-xs">
      {m.stage}: {m.result?`${m.result.scoreA}–${m.result.scoreB}`:'Awaiting match'}
    </p>):<p className="text-xs">Qualifying places and knockout progress will appear here when confirmed.</p>}
   </section>}
   <p className="text-xs text-muted-foreground">Personal link — do not share. Updates are read-only and do not affect scores.</p>
   <Button variant="outline" onClick={()=>setRefreshCounter(x=>x+1)}>Refresh my information</Button>
  </>}
 </div></main>;
}
