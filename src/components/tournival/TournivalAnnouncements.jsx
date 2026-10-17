import React,{useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {playRallyHubSignal,speakRallyHubHall,unlockRallyHubAudio,getRallyHubAudioContext,stopAllRallyHubAudio} from '@/lib/rallyHubHallAudio';
import {base44} from '@/api/base44Client';
const TEMPLATES=[
 {key:'welcome',label:'Welcome',text:'Welcome to the Tournival. Please check in and listen for your court assignments.'},
 {key:'changeover',label:'Changeover',text:'Players, please clear your court safely for the next match.'},
 {key:'two_minutes',label:'Two-minute warning',text:'Two minutes remaining until the next planned break.'},
 {key:'break',label:'Break',text:'The tournament is on a scheduled break. Please return promptly when called.'},
 {key:'pause',label:'Pause',text:'Play is paused. Please remain safely off court until the host confirms resumption.'},
 {key:'resume',label:'Resume',text:'Play may resume on your assigned courts.'},
 {key:'final',label:'Final',text:'The Tournival final is ready. Players, please report to your assigned court.'}
];
/** Playback is optional. Failure never blocks sport or writes scores. */
export default function TournivalAnnouncements({tournament,state,isAdmin,onSaveState,playerMap={}}){
 const [text,setText]=useState(''),[volume,setVolume]=useState(0.8),[muted,setMuted]=useState(false);
 const [audioReady,setAudioReady]=useState(false),[failure,setFailure]=useState(''),[saving,setSaving]=useState(false);
 const announcements=state?.announcements||[];
 const speak=async source=>{
  const phrase=String(source||'').trim();if(!phrase||muted)return;
  setFailure('');
  try{
   if(!audioReady){await unlockRallyHubAudio();setAudioReady(true);}
   playRallyHubSignal(getRallyHubAudioContext(),'warning',volume);
   const accepted=await speakRallyHubHall(phrase,{volume,eventId:tournament.id});
   if(!accepted)setFailure('Audio unavailable. Text announcement remains visible.');
  }catch{setFailure('Audio unavailable. Text announcement remains visible. Check speakers and retry.');}
 };
 const broadcast=async()=>{
  const phrase=text.trim();if(!phrase||saving||!isAdmin)return;
  setSaving(true);setFailure('');
  const entry={id:crypto.randomUUID(),text:phrase,at:new Date().toISOString(),actor:'host',scope:'hall'};
  try{
   await onSaveState({...state,announcements:[...announcements,entry]});
   await speak(phrase);setText('');
  }catch(e){setFailure(e?.message||'Announcement could not be saved; no external communications sent.');}
  finally{setSaving(false);}
 };
 return <section className="glass rounded-xl p-4 space-y-3">
  <h3 className="font-semibold">Tournival Hall Announcements</h3>
  <p className="text-xs text-muted-foreground">Reuses RallyHub's Interclub audio. These notices are saved to event state and spoken locally if audio is available. They do not send email or WhatsApp.</p>
  <div className="flex flex-wrap gap-2">
   <Button size="sm" variant="outline" onClick={async()=>{try{await unlockRallyHubAudio();setAudioReady(true);setFailure('');}catch{setFailure('Unable to unlock audio on this device.');}}}>Enable Audio</Button>
   <Button size="sm" variant="outline" onClick={()=>{setMuted(x=>!x);stopAllRallyHubAudio();}}>{muted?'Unmute':'Mute'}</Button>
   <label className="text-xs flex items-center gap-2">Volume
    <input aria-label="Hall volume" type="range" min="0" max="1" step=".05" value={volume} onChange={e=>setVolume(Number(e.target.value))}/>
   </label>
  </div>
  <div className="flex flex-wrap gap-1">{TEMPLATES.map(t=>
   <Button variant="outline" size="sm" key={t.key} onClick={()=>setText(t.text)}>{t.label}</Button>)}</div>
  {state?.matches?.filter(m=>m.status==='playing').slice(0,8).map(m=>
   <Button variant="ghost" size="sm" key={m.id} onClick={()=>setText(
    `Court ${m.court}, ${[...m.teamA,...m.teamB].map(id=>playerMap[id]||id).join(', ')}. Please report to court ${m.court}.`
   )}>Court {m.court} call-up</Button>)}
  <Input aria-label="Hall announcement" value={text} maxLength={1000} placeholder="Hall announcement" onChange={e=>setText(e.target.value)}/>
  <div className="flex gap-2">
   <Button size="sm" disabled={!text.trim()||saving||!isAdmin} onClick={broadcast}>Save and announce</Button>
   <Button size="sm" variant="outline" disabled={!text.trim()} onClick={()=>speak(text)}>Audio preview</Button>
  </div>
  {failure&&<p role="alert" className="text-xs text-destructive">{failure}</p>}
  <div className="space-y-1 text-xs">{announcements.slice(-5).reverse().map(item=>
   <p key={item.id} className="border-b border-border py-1">{item.text} <span className="text-muted-foreground">{item.at}</span></p>)}</div>
 </section>;
}
