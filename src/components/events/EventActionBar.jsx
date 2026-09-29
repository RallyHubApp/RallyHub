import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarPlus, Check, Copy, ExternalLink, Mail, MessageCircle, QrCode, Share2, Users, Bookmark, BookmarkCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { downloadEventCalendar, eventPath, googleCalendarUrl, isWhatsAppRegistration, outlookCalendarUrl, registrationState } from '@/lib/event-utils';

export default function EventActionBar({ event, compact = false, initiallySaved = false, onSavedChange }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [shareOpen,setShareOpen]=useState(false);
  const [calendarOpen,setCalendarOpen]=useState(false);
  const [qrOpen,setQrOpen]=useState(false);
  const [interestOpen,setInterestOpen]=useState(false);
  const [interestEmail,setInterestEmail]=useState(user?.email||'');
  const [interestBusy,setInterestBusy]=useState(false);
  const [interestSent,setInterestSent]=useState(false);
  const [saved,setSaved]=useState(initiallySaved);
  const [busy,setBusy]=useState('');
  const [clubShared,setClubShared]=useState(false);
  const state=registrationState(event);
  const whatsAppRegistration=isWhatsAppRegistration(event);
  const invitationOnly=state.key==='invite_only';
  const futureInvitation=state.key==='full'&&state.futureInvitation===true;
  const path=eventPath(event);
  const url=useMemo(()=>typeof window!=='undefined'?`${window.location.origin}${path}`:`https://rallyhub.ie${path}`,[path]);
  const canClubShare=!!user?.active_club_id&&!!user?.active_tenant_id&&(user?.role==='admin'||user?.active_club_role==='club_admin');
  useEffect(()=>setSaved(!!initiallySaved),[initiallySaved]);

  const signIn=()=>navigate(`/login?returnTo=${encodeURIComponent(path)}`);
  const saveEvent=async(remindOpen=false)=>{
    if(!isAuthenticated)return signIn();
    try{
      setBusy(remindOpen?'remind':'save');
      const res=await base44.functions.invoke('eventEngagement',{action:remindOpen?'set_reminders':'save',eventId:event.id,reminders:remindOpen?{registrationOpen:true,registrationClosing:true,oneWeek:true,oneDay:false}:undefined});
      if(res.data?.error)throw new Error(res.data.error);
      setSaved(true);onSavedChange?.(true);
      toast.success(remindOpen?'Saved — registration reminders are on':'Event saved to My Events');
    }catch(e){toast.error(e?.message||'Could not save event')}finally{setBusy('')}
  };
  const unsave=async()=>{
    if(!isAuthenticated)return;
    try{setBusy('save');const res=await base44.functions.invoke('eventEngagement',{action:'unsave',eventId:event.id});if(res.data?.error)throw new Error(res.data.error);setSaved(false);onSavedChange?.(false);toast.success('Removed from My Events')}catch(e){toast.error(e?.message||'Could not remove event')}finally{setBusy('')}
  };
  const shareToClub=async()=>{
    if(!isAuthenticated)return signIn();
    try{setBusy('club');const payload={action:'share_to_club',eventId:event.id};if(user?.role==='admin'){payload.clubId=user.active_club_id;payload.tenantId=user.active_tenant_id}const res=await base44.functions.invoke('eventEngagement',payload);if(res.data?.error)throw new Error(res.data.error);setClubShared(true);toast.success('Shared with your club — members will see it in Play')}catch(e){toast.error(e?.message||'Could not share event to your club')}finally{setBusy('')}
  };
  const copy=async()=>{try{await navigator.clipboard.writeText(url);toast.success('Event link copied')}catch{toast.error('Could not copy link')}};
  const nativeShare=async()=>{if(!navigator.share)return;try{await navigator.share({title:event.name,text:event.event_public_summary||event.description||'',url})}catch(e){if(e?.name!=='AbortError')toast.error('Could not open device share')}};
  const sendFutureInvitation=async()=>{
    const email=String(interestEmail||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast.error('Enter a valid email address');
    try{
      setInterestBusy(true);
      const res=await base44.functions.invoke('eventInterest',{action:'future_invitation',eventId:event.id,eventSlug:event.event_slug,email,website:''});
      if(res.data?.error)throw new Error(res.data.error);
      setInterestSent(true);
      toast.success(res.data?.alreadySent?'Your earlier request is already with the organiser':'Request sent to the organiser through RallyHub');
    }catch(e){toast.error(e?.message||'Could not send your request')}finally{setInterestBusy(false)}
  };
  const openRegistration=()=>{
    if(state.key==='opening_soon')return saveEvent(true);
    if(!state.actionable)return;
    if(event.event_registration_mode==='contact'&&event.event_contact){const subject=state.key==='invite_only'?`Invitation request: ${event.name}`:`Event enquiry: ${event.name}`;const body=state.key==='invite_only'?`Hi,\n\nI would like to be considered for an invitation to ${event.name}.\n\nRallyHub event: ${url}\n\nThank you.`:`Hi,\n\nI have a question about ${event.name}.\n\nRallyHub event: ${url}\n\nThank you.`;window.location.href=`mailto:${event.event_contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;return}
    if(event.event_registration_url){
      if(whatsAppRegistration)toast.success('Opening WhatsApp — send the message to complete your registration');
      window.open(event.event_registration_url,'_blank','noopener,noreferrer');
    }
  };

  return <>
    <div className={`flex flex-wrap gap-2 ${compact?'':'w-full'}`}>
      {futureInvitation&&<Button onClick={()=>setInterestOpen(true)} className="min-h-11 bg-[#078e48] text-white hover:bg-[#067b3f]"><Mail className="mr-2 h-4 w-4"/>Request a future invitation</Button>}
      {(state.actionable||state.key==='opening_soon')&&<Button onClick={openRegistration} className="min-h-11 bg-[#078e48] text-white hover:bg-[#067b3f]" disabled={busy==='remind'}>{state.key==='opening_soon'?<><Bell className="mr-2 h-4 w-4"/>{busy==='remind'?'Saving…':'Remind me'}</>:invitationOnly?<><Mail className="mr-2 h-4 w-4"/>Request invitation</>:whatsAppRegistration?<><MessageCircle className="mr-2 h-4 w-4"/>WhatsApp to register</>:<><ExternalLink className="mr-2 h-4 w-4"/>Register / Book</>}</Button>}
      <Button variant="outline" className="min-h-11" onClick={saved?unsave:()=>saveEvent(false)} disabled={busy==='save'}>{saved?<BookmarkCheck className="mr-2 h-4 w-4 text-[#078e48]"/>:<Bookmark className="mr-2 h-4 w-4"/>}{busy==='save'?'Saving…':saved?'Saved':'Save event'}</Button>
      <Button variant="outline" className="min-h-11" onClick={()=>setCalendarOpen(true)}><CalendarPlus className="mr-2 h-4 w-4"/>Add to calendar</Button>
      <Button variant="outline" className="min-h-11" onClick={()=>setShareOpen(true)}><Share2 className="mr-2 h-4 w-4"/>Share</Button>
    </div>

    <Dialog open={interestOpen} onOpenChange={open=>{setInterestOpen(open);if(!open)setInterestSent(false)}}>
      <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Request a future invitation</DialogTitle><DialogDescription>This event is full. {event.host?.name||'The organiser'} runs invitation-only events. Enter your email and RallyHub will pass your interest to the organiser for a future event.</DialogDescription></DialogHeader>
        {interestSent?<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700">Sent ✓ The organiser has received your future-invitation request through RallyHub.</div>:<div className="space-y-3"><label className="block text-sm font-semibold">Email address<input type="email" autoComplete="email" value={interestEmail} onChange={e=>setInterestEmail(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm" placeholder="you@example.com"/></label><Button className="w-full bg-[#078e48] text-white hover:bg-[#067b3f]" onClick={sendFutureInvitation} disabled={interestBusy}>{interestBusy?'Sending through RallyHub…':'Send request'}</Button><p className="text-[11px] leading-5 text-muted-foreground">Your email is sent to the organiser for this request. RallyHub records that the enquiry was successfully generated through the event page so organisers can understand the value of their listing.</p></div>}
      </DialogContent>
    </Dialog>

    <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
      <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Add to calendar</DialogTitle><DialogDescription>Keep this event with the rest of your plans.</DialogDescription></DialogHeader>
        <div className="grid gap-2">
          <Button variant="outline" className="justify-start" onClick={()=>{downloadEventCalendar(event,url);setCalendarOpen(false);toast.success('Calendar file downloaded')}}>Apple / iCal (.ics)</Button>
          <Button variant="outline" className="justify-start" onClick={()=>window.open(googleCalendarUrl(event,url),'_blank','noopener,noreferrer')}>Google Calendar</Button>
          <Button variant="outline" className="justify-start" onClick={()=>window.open(outlookCalendarUrl(event,url),'_blank','noopener,noreferrer')}>Outlook Calendar</Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
      <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Share this event</DialogTitle><DialogDescription>Send it to a friend, your club or anyone outside RallyHub.</DialogDescription></DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(`${event.name} — ${url}`)}`,'_blank','noopener,noreferrer')}><Share2 className="mr-2 h-4 w-4"/>WhatsApp</Button>
          <Button variant="outline" onClick={()=>{window.location.href=`mailto:?subject=${encodeURIComponent(event.name)}&body=${encodeURIComponent(`Have a look at this event on RallyHub:\n${url}`)}`}}><Mail className="mr-2 h-4 w-4"/>Email</Button>
          <Button variant="outline" onClick={copy}><Copy className="mr-2 h-4 w-4"/>Copy link</Button>
          <Button variant="outline" onClick={()=>{setShareOpen(false);setQrOpen(true)}}><QrCode className="mr-2 h-4 w-4"/>QR code</Button>
          {typeof navigator!=='undefined'&&navigator.share&&<Button variant="outline" className="sm:col-span-2" onClick={nativeShare}><Share2 className="mr-2 h-4 w-4"/>Share using this device</Button>}
          {canClubShare&&<Button className="sm:col-span-2 bg-[#078e48] text-white hover:bg-[#067b3f]" onClick={shareToClub} disabled={busy==='club'||clubShared}><Users className="mr-2 h-4 w-4"/>{busy==='club'?'Sharing…':clubShared?<><Check className="mr-1 h-4 w-4"/>Shared with your club</>:'Share to my club'}</Button>}
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={qrOpen} onOpenChange={setQrOpen}>
      <DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Event QR code</DialogTitle><DialogDescription>Scan to open this event on RallyHub.</DialogDescription></DialogHeader><div className="flex justify-center rounded-xl bg-white p-5"><QRCodeSVG value={url} size={220} level="M" includeMargin /></div><Button variant="outline" onClick={copy}><Copy className="mr-2 h-4 w-4"/>Copy event link</Button></DialogContent>
    </Dialog>
  </>;
}
