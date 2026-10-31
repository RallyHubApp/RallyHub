import { invokeReadWithDeadline, shouldRetryRead, readRetryDelay, READ_STALE_MS, READ_GC_MS } from '@/lib/ccc/readResilience';
import EnnisDiamondSpondPilot from '@/components/spond/EnnisDiamondSpondPilot';
import GuestAttendanceFollowup from '@/components/communications/GuestAttendanceFollowup';
import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Archive, CalendarCheck, CheckCircle2, Copy, ExternalLink, History, Mail, MapPin, MessageCircle, RefreshCw, RotateCcw, ShieldCheck, Trash2, UserCheck, XCircle } from 'lucide-react';

function niceDate(value){
  if(!value)return '';
  try{return new Intl.DateTimeFormat('en-IE',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date(`${value}T12:00:00`))}
  catch{return value}
}
function copy(text,label='Copied'){
  navigator.clipboard.writeText(text).then(()=>toast.success(label)).catch(()=>toast.error('Could not copy'));
}
function whatsappNumber(value){
  let digits=String(value||'').replace(/\D/g,'');
  if(digits.startsWith('00'))digits=digits.slice(2);
  if(digits.startsWith('0'))digits=`353${digits.slice(1)}`;
  return digits;
}

export default function GuestBookings(){
  const { user }=useAuth();
  const qc=useQueryClient();
  const [templateKey,setTemplateKey]=useState('');
  const [sessionDate,setSessionDate]=useState('');
  const [capacity,setCapacity]=useState('');
  const [feeAmount,setFeeAmount]=useState('');
  const [notificationEmail,setNotificationEmail]=useState(user?.email||'');
  const [busy,setBusy]=useState('');
  const [expanded,setExpanded]=useState('');
  const [messagePreview,setMessagePreview]=useState(null);
  const [showArchived,setShowArchived]=useState(false);
  const [showPastAttendees,setShowPastAttendees]=useState(false);
  const [attendeeCentre,setAttendeeCentre]=useState('all');
  const [hostListSessionId,setHostListSessionId]=useState('');
  const [hostListExtras,setHostListExtras]=useState({});
  const [hostListAddName,setHostListAddName]=useState('');
  const [hostListAddEmail,setHostListAddEmail]=useState('');
  const [hostListAddMobile,setHostListAddMobile]=useState('');
  const [attendanceBusy,setAttendanceBusy]=useState('');
  const [attendeeTime,setAttendeeTime]=useState('all');
  const [recentOfferLinks,setRecentOfferLinks]=useState({});
  const [approvalSelections,setApprovalSelections]=useState({});
  const [approvalDates,setApprovalDates]=useState({});
  const [approvalFeedback,setApprovalFeedback]=useState({});
  const [editingGuest,setEditingGuest]=useState(null);
  const [guestDraft,setGuestDraft]=useState({});
  const [changeBooking,setChangeBooking]=useState(null);
  const [changeSlot,setChangeSlot]=useState('');
  const [changeDate,setChangeDate]=useState('');
  const invokeWithTimeout=(name,payload)=>invokeReadWithDeadline((service,args)=>base44.functions.invoke(service,args),name,payload);

  const {data:templateData={templates:[],sumupConfigured:false},isLoading:templatesLoading,isError:templatesError,refetch:retryTemplates}=useQuery({
    queryKey:['guest-session-templates'],
    retry:shouldRetryRead,
    retryDelay:readRetryDelay,
    staleTime:READ_STALE_MS,
    gcTime:READ_GC_MS,
    refetchOnWindowFocus:false,
    queryFn:async()=>{
      const res=await invokeWithTimeout('guestSessionBooking',{action:'admin_templates'});
      if(res.data?.error)throw new Error(res.data.error);
      return res.data;
    },
    enabled:user?.role==='admin',
  });

  const {data:listData={sessions:[],sumupConfigured:false},isLoading:listLoading,isError:listError,refetch:retryList}=useQuery({
    queryKey:['guest-session-admin-list'],
    retry:shouldRetryRead,
    retryDelay:readRetryDelay,
    staleTime:READ_STALE_MS,
    gcTime:READ_GC_MS,
    refetchOnWindowFocus:false,
    queryFn:async()=>{
      const res=await invokeWithTimeout('guestSessionBooking',{action:'admin_list'});
      if(res.data?.error)throw new Error(res.data.error);
      return res.data;
    },
    enabled:user?.role==='admin',
  });

  const {data:requestData={requests:[]},isLoading:requestsLoading,isError:requestsError,refetch:retryRequests}=useQuery({
    queryKey:['guest-access-requests'],
    retry:shouldRetryRead,
    retryDelay:readRetryDelay,
    staleTime:READ_STALE_MS,
    gcTime:READ_GC_MS,
    refetchOnWindowFocus:false,
    queryFn:async()=>{
      const res=await invokeWithTimeout('guestAccessJourney',{action:'admin_list'});
      if(res.data?.error)throw new Error(res.data.error);
      return res.data;
    },
    enabled:user?.role==='admin',
  });

  const selected=useMemo(()=>templateData.templates?.find(t=>t.key===templateKey)||null,[templateData,templateKey]);
  // Optimistic removal makes decisions visible immediately; the authoritative
  // server list is still refetched after every decision.
  const removePendingRequest=(id)=>{
    qc.setQueryData(['guest-access-requests'],old=>old?{...old,requests:(old.requests||[]).filter(r=>r.id!==id)}:old);
    setApprovalSelections(old=>{const next={...old};delete next[id];return next});
  };
  const refreshGuestRequests=async()=>{
    await Promise.allSettled([
      qc.invalidateQueries({queryKey:['guest-access-requests']}),
      qc.invalidateQueries({queryKey:['guest-access-requests','pending-count']}),
      qc.invalidateQueries({queryKey:['guest-session-admin-list']})
    ]);
    await qc.refetchQueries({queryKey:['guest-access-requests'],type:'active'});
  };
  const pendingRequests=useMemo(()=>[...(requestData.requests||[])].filter(r=>r.status==='pending_approval'),[requestData]);
  const approvedRequests=useMemo(()=>[...(requestData.requests||[])].filter(r=>r.status==='approved'),[requestData]);
  const sessions=useMemo(()=>[...(listData.sessions||[])].sort((a,b)=>`${b.sessionDate} ${b.startTime}`.localeCompare(`${a.sessionDate} ${a.startTime}`)),[listData.sessions]);
  const currentSessions=useMemo(()=>sessions.filter(s=>!s.archivedAt),[sessions]);
  const archivedSessions=useMemo(()=>sessions.filter(s=>!!s.archivedAt),[sessions]);
  const visibleSessions=showArchived?archivedSessions:currentSessions;
  const bookingRows=useMemo(()=>{
    const sessionById=new Map(sessions.map(s=>[s.id,s]));
    const booked=new Map();
    for(const s of sessions)for(const b of (s.bookings||[])){
      booked.set(b.id,{kind:'booking',key:`booking-${b.id}`,booking:b,session:s,fullName:b.fullName,email:b.email,mobile:b.mobile,sessionDate:s.sessionDate,day:s.weekday||'',start:s.startTime,end:s.endTime,venueName:s.venueName,bookingStatus:b.bookingStatus,paymentStatus:b.paymentStatus,amount:b.amount,paymentMethod:b.paymentMethod,bookingId:b.id,sumupCheckoutUrl:b.sumupCheckoutUrl||''});
    }
    // The paid booking is the financial record; accepted transfers change its current session.
    // Pending offers appear against their proposed date without treating them as accepted.
    const rows=[...booked.values()].map(row=>{
      const offer=listData.changeOffers?.[row.bookingId];
      if(offer?.status!=='pending')return row;
      const target=sessionById.get(offer.targetSessionId);
      if(!target)return row;
      return {...row,key:`offer-${row.bookingId}`,sessionDate:target.sessionDate,day:target.weekday||'',start:target.startTime,end:target.endTime,venueName:target.venueName,pendingAlternative:true,originalSessionDate:row.sessionDate,originalVenueName:row.venueName};
    });
    for(const request of approvedRequests){
      if(request.bookingId&&booked.has(request.bookingId))continue;
      rows.push({kind:'approved_request',key:`request-${request.id}`,request,fullName:request.fullName,email:request.email,mobile:request.mobile,sessionDate:request.approvedSessionDate,day:request.day,start:request.start,end:request.end,venueName:request.venueName,bookingStatus:request.bookingStatus||'approved',paymentStatus:request.paymentStatus||'not_started',amount:request.amount,paymentMethod:request.paymentMethod,bookingId:request.bookingId||'',sumupCheckoutUrl:request.sumupCheckoutUrl||''});
    }
    return rows.sort((a,b)=>`${b.sessionDate||''} ${b.start||''}`.localeCompare(`${a.sessionDate||''} ${a.start||''}`));
  },[approvedRequests,sessions,listData.changeOffers]);

  const todayIreland=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Dublin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const offerFor=row=>listData.changeOffers?.[row.bookingId]||null;
  const isPendingOffer=row=>offerFor(row)?.status==='pending';
  const pastBookingRows=bookingRows.filter(row=>row.sessionDate&&row.sessionDate<todayIreland()&&!isPendingOffer(row));
  const currentBookingRows=bookingRows.filter(row=>!(row.sessionDate&&row.sessionDate<todayIreland())||isPendingOffer(row));
  const centreOptions=[...new Set(bookingRows.map(row=>row.venueName).filter(Boolean))].sort();
  const timeOptions=[...new Set(bookingRows.filter(row=>attendeeCentre==='all'||row.venueName===attendeeCentre).map(row=>row.start).filter(Boolean))].sort();
  const visibleBookingRows=(showPastAttendees?pastBookingRows:currentBookingRows).filter(row=>(attendeeCentre==='all'||row.venueName===attendeeCentre)&&(attendeeTime==='all'||row.start===attendeeTime));
  const hostSession=sessions.find(s=>s.id===hostListSessionId)||null;
  const hostConfirmed=(hostSession?.bookings||[]).filter(b=>b.bookingStatus==='confirmed'||b.bookingStatus==='cash_due')
    .map(b=>({id:b.id,name:b.fullName||'',mobile:b.mobile||'',email:b.email||'',attendanceStatus:b.attendanceStatus||'unconfirmed',status:b.paymentStatus==='paid'?'Paid':b.paymentStatus==='cash_due'?'Cash due':'Confirmed'}))
    .sort((a,b)=>a.name.localeCompare(b.name));
  // Reuse both historic paid booking contacts and old guest requests for this
  // weekly session. Past bookings must never be presented as paid for today.
  const hostRequestCandidates=hostSession?(()=>{
    const normalize=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
    const identity=r=>normalize(r.fullName)+'|'+String(r.mobile||'').replace(/\D/g,'');
    const currentPeople=new Set((hostSession.bookings||[]).map(b=>identity(b)));
    const historicalBookings=sessions.filter(s=>s.id!==hostSession.id&&s.sessionLabel===hostSession.sessionLabel&&s.venueName===hostSession.venueName)
      .flatMap(s=>(s.bookings||[]).filter(b=>b.bookingStatus!=='cancelled'&&b.attendanceStatus!=='attended').map(b=>({
        id:'historical-booking-'+b.id,fullName:b.fullName||'',mobile:b.mobile||'',email:b.email||'',
        status:'historical_booking',previouslyPaid:b.paymentStatus==='paid',previousSessionDate:s.sessionDate
      })));
    const historicRequests=(requestData.requests||[]).filter(r=>r.sessionId===hostSession.sessionLabel&&(r.status==='approved'||r.status==='pending_approval'))
      .map(r=>({...r,previouslyPaid:false,previousSessionDate:r.approvedSessionDate||''}));
    const unique=new Map();
    // Historical bookings first, so a successful earlier payment is visible.
    for(const r of [...historicalBookings,...historicRequests]){
      const k=identity(r);
      if(!r.fullName||currentPeople.has(k))continue;
      if(!unique.has(k))unique.set(k,r);
    }
    return [...unique.values()].sort((a,b)=>String(a.fullName||'').localeCompare(String(b.fullName||'')));
  })():[];
  const toggleHostCandidate=(r,checked)=>{
    if(!hostSession)return;
    setHostListExtras(old=>{
      const current=old[hostSession.id]||[];
      const id=`candidate-${r.id}`;
      return {...old,[hostSession.id]:checked?[...current.filter(x=>x.id!==id),{id,name:r.fullName||'',mobile:r.mobile||'',email:r.email||''}]:current.filter(x=>x.id!==id)};
    });
  };
  const saveAttendance=async(bookingId,status)=>{
    if(!hostSession||attendanceBusy)return;
    setAttendanceBusy(bookingId);
    try{
      const response=await base44.functions.invoke('guestSessionBooking',{action:'attendance_save',sessionId:hostSession.id,bookingId,status});
      if(response.data?.error||response.data?.success!==true)throw Error(response.data?.error||'Attendance was not saved');
      qc.setQueryData(['guest-session-admin-list'],old=>old?{...old,sessions:(old.sessions||[]).map(session=>session.id!==hostSession.id?session:{...session,bookings:(session.bookings||[]).map(booking=>booking.id===bookingId?{...booking,attendanceStatus:status}:booking)})}:old);
      toast.success(status==='attended'?'Marked attended — kept in session history':status==='no_show'?'Marked no-show — payment preserved':status==='cancelled'?'Marked cancelled — review payment or transfer separately':'Attendance reset to unresolved');
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
    }catch(e){toast.error(e?.response?.data?.error||e.message||'Could not save attendance')}
    finally{setAttendanceBusy('')}
  };
  const hostExtras=hostListExtras[hostListSessionId]||[];
  const hostSeen=new Set(hostConfirmed.map(r=>(r.name.trim().toLowerCase()+'|'+String(r.mobile).replace(/\D/g,''))));
  const hostExpected=hostExtras.filter(r=>!hostSeen.has(r.name.trim().toLowerCase()+'|'+String(r.mobile).replace(/\D/g,'')));
  const hostListRows=[...hostConfirmed,...hostExpected.map(r=>({...r,status:'Expected — verify'}))];
  const hostListTitle=hostSession?`Clare Pickleball — Session Host List\n${niceDate(hostSession.sessionDate)} · ${hostSession.startTime}${hostSession.endTime?'–'+hostSession.endTime:''}\n${hostSession.venueName}\nRecorded: ${hostConfirmed.length} · Host-added (unverified): ${hostExpected.length}`:'';
  const hostListText=hostListTitle+'\n\n'+hostListRows.map((r,i)=>`${i+1}. ${r.name} | ${r.mobile||'—'} | ${r.email||'—'} | ${r.status}`).join('\n');
  const addHostExpected=()=>{
    const name=hostListAddName.trim(),mobile=hostListAddMobile.trim(),email=hostListAddEmail.trim();
    if(!hostSession||!name){toast.error('Choose a session and enter a name');return}
    if(hostListRows.some(r=>r.name.toLowerCase()===name.toLowerCase()&&(!mobile||String(r.mobile).replace(/\D/g,'')===mobile.replace(/\D/g,'')))){toast.error('This attendee is already on the host list');return}
    setHostListExtras(old=>({...old,[hostSession.id]:[...(old[hostSession.id]||[]),{id:`extra-${Date.now()}`,name,mobile,email}]}));
    setHostListAddName('');setHostListAddMobile('');setHostListAddEmail('');
    toast.success('Added to host preview as unverified — not a booking or payment');
  };

  const remindAlternative=async(row,channel='whatsapp')=>{
    const offer=offerFor(row);
    if(!offer||offer.status!=='pending'){toast.error('No pending alternative offer found');return;}
    const first=String(row.fullName||'').trim().split(/\s+/)[0]||'there';
    const message=`Hi ${first},\n\nA reminder of your proposed Clare Pickleball session:\n${offer.targetLabel||'Alternative session'}\n\nYour original payment is recorded. No further payment is required.\n\nPlease accept or decline using your private response link:\n{{confirmation_link}}\n\nYours in sport,\nBrian Moore\nChairperson, Clare Pickleball`;
    setMessagePreview({channel,request:{fullName:row.fullName,email:row.email,mobile:row.mobile},bookingId:row.bookingId,kind:'alternative_reminder',subject:'Clare Pickleball · Alternative session reminder',message});
  };
  const offerWhatsApp=(row,url)=>{
    const target=whatsappNumber(row.mobile);
    if(!target){navigator.clipboard?.writeText(url);toast.info('No mobile number saved. Copy the private offer link instead.');return}
    const first=String(row.fullName||'').split(/\s+/)[0]||'there';
    const msg='Hi '+first+', Clare Pickleball has offered you an alternative session. Your original payment is already recorded; no further payment is requested. Please choose Yes, I’m attending or decline using your private link: '+url;
    window.open('https://wa.me/'+target+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');
  };
  const createSession=async()=>{
    if(!templateKey||!sessionDate){toast.error('Choose a session slot and date');return}
    setBusy('create');
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{
        action:'admin_create',templateKey,sessionDate,capacity:capacity?Number(capacity):0,
        feeAmount:feeAmount===''?undefined:Number(feeAmount),notificationEmail:notificationEmail.trim()||user?.email||'',
      });
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
      toast.success('Guest session created. Create a private invitation for a specific guest, or use the public link if approval should be required.');
      setSessionDate('');setCapacity('');setFeeAmount('');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not create guest session')}
    finally{setBusy('')}
  };

  const createMagicLink=async(session)=>{
    const contact=window.prompt('Guest email OR mobile/WhatsApp number (required – the private link is locked to this contact)');
    if(contact===null)return;
    const value=contact.trim();
    if(!value){toast.error('Enter the guest email or mobile/WhatsApp number');return}
    const isEmail=value.includes('@');
    const recipientName=window.prompt('Guest first name or full name (optional)')||'';
    setBusy(`magic-${session.id}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_create_magic_invite',sessionId:session.id,recipientEmail:isEmail?value:'',recipientMobile:isEmail?'':value,recipientName:recipientName.trim()});
      if(res.data?.error)throw new Error(res.data.error);
      copy(res.data.magicInviteUrl,isEmail?'Private email-bound guest link copied':'Private mobile/WhatsApp-bound guest link copied');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not create private guest link')}
    finally{setBusy('')}
  };

  const startGuestEdit=request=>{
    setEditingGuest(request);
    setGuestDraft({fullName:request.fullName||'',email:request.email||'',mobile:request.mobile||'',homeClub:request.homeClub||'',duprId:request.duprId||'',sportingBackgroundNote:request.sportingBackgroundNote||''});
  };
  const saveGuestEdit=async()=>{
    if(!editingGuest)return;
    setBusy('save-guest-edit');
    try{
      const res=await base44.functions.invoke('guestAccessJourney',{action:'admin_edit_request',requestId:editingGuest.id,fields:guestDraft});
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-access-requests']});
      setEditingGuest(null);
      toast.success(res.data?.requiresResend?'Guest details saved. The old private link was revoked. Use Preview / resend email to issue a fresh one.':'Guest details saved');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not save guest details')}
    finally{setBusy('')}
  };

  const approveRequest=async(request)=>{
    const sessionId=approvalSelections[request.id]||request.sessionId||'';
    const sessionDate=approvalDates[request.id]||request.nextDate||'';
    if(sessionDate&&sessionDate<new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Dublin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())){toast.error('Choose today or a future session date.');return}
    if(!sessionId){toast.error('Choose the session you are offering');return}
    setBusy(`approve-${request.id}`);
    setApprovalFeedback(previous=>({...previous,[request.id]:{type:'working',message:'Checking availability and submitting approval…'}}));
    try{
      let res;
      try{
        res=await base44.functions.invoke('guestAccessJourney',{action:'admin_approve',requestId:request.id,sessionId,sessionDate});
      }catch(error){
        const detail=error?.response?.data||{};
        if(!detail.overrideAvailable)throw error;
        const warning=detail.warning||detail.error||'Members have priority.';
        if(!window.confirm(warning+'\n\nAre you sure you want to send it?')){
          setApprovalFeedback(previous=>({...previous,[request.id]:{type:'warning',message:'Guest approval cancelled; member priority retained.'}}));
          return;
        }
        res=await base44.functions.invoke('guestAccessJourney',{action:'admin_approve',requestId:request.id,sessionId,sessionDate,overrideMemberPriority:true});
      }
      if(res.data?.error)throw new Error(res.data.error);
      if(res.data?.success!==true)throw new Error('Approval was not confirmed by the server. Check the request before retrying.');
      const message=res.data.emailSent?'Approved — confirmation email sent.':'Approved, but confirmation email was not sent. Use the private link or resend the email.';
      removePendingRequest(request.id);
      setApprovalFeedback(previous=>({...previous,[request.id]:{type:'success',message}}));
      if(res.data.magicInviteUrl)copy(res.data.magicInviteUrl,'Private guest booking link copied');
      toast.success(message);
      try{await refreshGuestRequests()}catch(refreshError){toast.warning('Approved successfully; list refresh failed. Use Refresh to update.');}
    }catch(e){
      const rawMessage=e?.response?.data?.error||e?.message||'Approval could not be confirmed. Check the request before retrying.';
      const message=/rate limit|too many requests|429/i.test(rawMessage)?'Booking service rate limit reached. Do not press Approve again yet; check the request status before retrying.':rawMessage;
      setApprovalFeedback(previous=>({...previous,[request.id]:{type:'error',message}}));
      toast.error(message);
    }finally{setBusy('')}
  };

  const offerBookingChange=async()=>{
    if(!changeBooking||!changeSlot||!changeDate){toast.error('Choose a session and date');return}
    setBusy('change-offer');
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_change_offer',bookingId:changeBooking.bookingId,templateKey:changeSlot,sessionDate:changeDate});
      if(res.data?.error)throw new Error(res.data.error);
      if(!res.data?.success)throw new Error('Offer was not confirmed by the server.');
      if(res.data.offerUrl){
        setRecentOfferLinks(previous=>({...previous,[changeBooking.bookingId]:res.data.offerUrl}));
        if(window.confirm('Offer created'+(res.data.emailSent?' and emailed':'')+'. Open WhatsApp with the same alternative-session offer?'))offerWhatsApp(changeBooking,res.data.offerUrl);
      }
      if(res.data.emailSent)toast.success('Alternative session offer emailed.');
      else {toast.warning('Offer created, but email was not sent. Copy the private response link.');if(res.data.offerUrl)copy(res.data.offerUrl,'Private response link copied');}
      setChangeBooking(null);setChangeSlot('');setChangeDate('');
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not offer new session')}
    finally{setBusy('')}
  };

  const rejectRequest=async(request)=>{
    const reason=window.prompt(`Reason for declining ${request.fullName} (optional)`,'');
    if(reason===null)return;
    setBusy(`reject-${request.id}`);
    try{
      const res=await base44.functions.invoke('guestAccessJourney',{action:'admin_reject',requestId:request.id,reason});
      if(res.data?.error)throw new Error(res.data.error);
      if(res.data?.success!==true)throw new Error('Decline was not confirmed. The request has not been removed.');
      removePendingRequest(request.id);
      setApprovalFeedback(previous=>({...previous,[request.id]:{type:'success',message:'Guest request declined.'}}));
      toast.success(`${request.fullName} declined — removed from pending requests`);
      try{await refreshGuestRequests()}catch{toast.warning('Declined successfully; the latest list could not be refreshed.');}
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not decline guest request')}
    finally{setBusy('')}
  };

  const retractApproval=async(request)=>{
    const reason=window.prompt(`Retract ${request.fullName}'s approval? Their existing private booking/payment link will stop working.\n\nReason for the audit record:`,'Session no longer available');
    if(reason===null)return;
    if(!reason.trim()){toast.error('Enter a reason for retracting the approval');return}
    if(!window.confirm(`Retract the approval for ${request.fullName}?\n\nThis revokes the private invite and cancels any unpaid/incomplete booking. The request returns to Awaiting Approval so you can amend it and approve a different session.`))return;
    setBusy(`retract-${request.id}`);
    try{
      const res=await base44.functions.invoke('guestAccessJourney',{action:'admin_retract',requestId:request.id,reason:reason.trim()});
      if(res.data?.error)throw new Error(res.data.error);
      await Promise.all([qc.invalidateQueries({queryKey:['guest-access-requests']}),qc.invalidateQueries({queryKey:['guest-access-requests','pending-count']}),qc.invalidateQueries({queryKey:['guest-session-admin-list']})]);
      toast.success('Approval retracted. The old private link is revoked and the request is back awaiting approval.');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not retract approval')}
    finally{setBusy('')}
  };

  const approvedPrivateLink=async(request,{sendEmail=false,copyOnly=false}={})=>{
    setBusy(`${sendEmail?'resend':'link'}-${request.id}`);
    try{
      const res=await base44.functions.invoke('guestAccessJourney',{action:'admin_private_link',requestId:request.id,sendEmail});
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-access-requests']});
      if(sendEmail){
        if(res.data.emailSent)toast.success(`Booking link resent to ${request.email}`);
        else toast.error('RallyHub could not resend the email. Use WhatsApp or copy the private link.');
      }else if(copyOnly){
        copy(res.data.magicInviteUrl,'Private booking link copied');
      }
      return res.data;
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not prepare the private booking link');return null}
    finally{setBusy('')}
  };

  const previewApprovedMessage=async(request,channel)=>{
    const data=await approvedPrivateLink(request);
    if(!data?.magicInviteUrl)return;
    const first=String(request.fullName||'').split(/\s+/)[0]||'there';
    const sessionDate=data.sessionDate?niceDate(data.sessionDate):request.approvedSessionDate?niceDate(request.approvedSessionDate):'';
    const time=request.start?`${request.start}${request.end?`–${request.end}`:''}`:'';
    const fee=request.amount!==null&&request.amount!==undefined?`€${Number(request.amount||0).toFixed(2)} ${request.paymentMethod==='cash'?'hall contribution · cash to host':'online'}`:'';
    const whatsapp=`Clare Pickleball session booking\n\nHi ${first}, your guest request has been reviewed and approved.\n\n${sessionDate}${time?` · ${time}`:''}\n${request.venueName||''}${fee?`\n${fee}`:''}\n\nComplete your booking/payment using your private link:\n${data.magicInviteUrl}\n\nThis link is for you only. Please don't share it.\n\nHope you enjoy the session.\n\nYours in sport,\nBrian Moore\nChairperson, Clare Pickleball`;
    const emailSubject=`Clare Pickleball · Guest request approved · ${sessionDate}${request.start?` ${request.start}`:''}`;
    const emailBody=`Hi ${first},\n\nYour guest request has been reviewed and approved.\n\nDate: ${sessionDate}\nTime: ${time}\nVenue: ${request.venueName||''}${fee?`\nFee: ${fee}`:''}\n\nComplete your waiver, Code of Conduct and booking/payment using your private link:\n${data.magicInviteUrl}\n\nThis link is for you only. Please don't share it.\n\nHope you enjoy the session.\n\nYours in sport,\nBrian Moore\nChairperson, Clare Pickleball\n\nPowered by RallyHub`;
    setMessagePreview({channel,request,data,subject:emailSubject,message:channel==='email'?emailBody:whatsapp});
  };

  const sendPreviewedMessage=async()=>{
    const preview=messagePreview;
    if(!preview)return;
    if(preview.kind==='alternative_reminder'){
      setBusy('send-offer-preview');
      const popup=preview.channel==='whatsapp'?window.open('about:blank','_blank'):null;
      try{
        const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_offer_reminder',bookingId:preview.bookingId,channel:'whatsapp'});
        if(res.data?.error||!res.data?.offerUrl)throw new Error(res.data?.error||'Could not prepare response link');
        const message=preview.message.replace('{{confirmation_link}}',res.data.offerUrl);
        if(preview.channel==='whatsapp'){
          const target=whatsappNumber(preview.request.mobile);
          if(!target){popup?.close();await copy(message,'Reminder copied — no valid mobile number');}
          else if(popup)popup.location.href=`https://wa.me/${target}?text=${encodeURIComponent(message)}`;
          else {await copy(message,'Reminder copied — WhatsApp popup blocked');}
        }else{
          // Never claim edited email copy was sent through a backend that ignores edits.
          popup?.close();await copy(message,'Edited reminder copied; paste into your email client');
          toast.info('Edited email copied. Automated sending of edited email is not yet supported.');
        }
        setMessagePreview(null);
      }catch(e){popup?.close();toast.error(e?.response?.data?.error||e?.message||'Reminder could not be prepared');}
      finally{setBusy('');}
      return;
    }
    if(preview.channel==='email'){
      const sent=await approvedPrivateLink(preview.request,{sendEmail:true});
      if(sent?.emailSent)setMessagePreview(null);
      return;
    }
    const target=whatsappNumber(preview.request.mobile);
    if(!target){toast.error('No valid mobile number is saved for this guest');return}
    window.open(`https://wa.me/${target}?text=${encodeURIComponent(preview.message)}`,'_blank','noopener,noreferrer');
    setMessagePreview(null);
  };

  const whatsappBooking=async(row)=>{
    const target=whatsappNumber(row.mobile);
    if(!target){toast.error('No valid mobile number is saved for this booking');return}
    const first=String(row.fullName||'').split(/\s+/)[0]||'there';
    const when=`${row.sessionDate?niceDate(row.sessionDate):''}${row.start?` · ${row.start}${row.end?`–${row.end}`:''}`:''}`;
    const paymentLine=row.paymentStatus==='paid'?'Payment confirmed':row.paymentStatus==='cash_due'?'€5 hall contribution due to host':row.paymentStatus==='pending'?'Payment still pending':String(row.paymentStatus||'').replaceAll('_',' ');
    const action=row.sumupCheckoutUrl&&row.paymentStatus==='pending'?`\n\nComplete payment here:\n${row.sumupCheckoutUrl}`:'';
    const msg=`Clare Pickleball session booking\n\nHi ${first},\n${when}\n${row.venueName||''}\n${paymentLine}${action}\n\nRallyHub`;
    window.open(`https://wa.me/${target}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');
  };

  const archiveSession=async(session)=>{
    setBusy(`archive-${session.id}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_archive_session',sessionId:session.id,reason:'Archived from Session Bookings'});
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
      toast.success('Session archived');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not archive session')}
    finally{setBusy('')}
  };

  const restoreSession=async(session)=>{
    setBusy(`restore-${session.id}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_restore_session',sessionId:session.id});
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
      toast.success('Session restored');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not restore session')}
    finally{setBusy('')}
  };

  const deleteSession=async(session)=>{
    if(!window.confirm(`Permanently delete the ${niceDate(session.sessionDate)} ${session.startTime} session? Only test/empty sessions without confirmed or financial history can be deleted.`))return;
    setBusy(`delete-session-${session.id}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_delete_session',sessionId:session.id});
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
      toast.success('Test/empty session deleted');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not delete session')}
    finally{setBusy('')}
  };

  const deleteBooking=async(booking)=>{
    if(!window.confirm(`Delete the test/incomplete booking for ${booking.fullName}? Confirmed and financial bookings cannot be deleted.`))return;
    setBusy(`delete-booking-${booking.id}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_delete_booking',bookingId:booking.id});
      if(res.data?.error)throw new Error(res.data.error);
      await Promise.all([qc.invalidateQueries({queryKey:['guest-session-admin-list']}),qc.invalidateQueries({queryKey:['guest-access-requests']})]);
      toast.success('Test/incomplete booking deleted');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not delete booking')}
    finally{setBusy('')}
  };

  const shareMagicWhatsApp=async(session)=>{
    const recipientMobile=window.prompt('Guest mobile/WhatsApp number (required – the private link is locked to this number)');
    if(recipientMobile===null)return;
    if(recipientMobile.replace(/\D/g,'').length<8){toast.error('Enter a valid guest mobile/WhatsApp number');return}
    const recipientName=window.prompt('Guest first name or full name (optional)')||'';
    setBusy(`whatsapp-${session.id}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_create_magic_invite',sessionId:session.id,recipientMobile:recipientMobile.trim(),recipientName:recipientName.trim()});
      if(res.data?.error)throw new Error(res.data.error);
      const action=session.paymentMethod==='cash'?`Confirm place · €${Number(session.feeAmount||0).toFixed(2)} cash at venue`:`Book & pay €${Number(session.feeAmount||0).toFixed(2)}`;
      const msg=`Clare Pickleball guest session\n${niceDate(session.sessionDate)} · ${session.startTime}\n${session.venueName}\n\n${action}:\n${res.data.magicInviteUrl}\n\nThis private link is tied to your mobile number.`;
      const target=whatsappNumber(recipientMobile);
      window.open(`https://wa.me/${target}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not create private WhatsApp invitation')}
    finally{setBusy('')}
  };

  const emailInvite=async(session)=>{
    const recipientEmail=window.prompt('Guest email address');
    if(recipientEmail===null)return;
    if(!recipientEmail.trim()){toast.error('Enter the guest email address');return}
    const recipientName=window.prompt('Guest first name or full name (optional)')||'';
    setBusy(`invite-${session.id}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{
        action:'admin_send_invite',sessionId:session.id,recipientEmail:recipientEmail.trim(),recipientName:recipientName.trim(),
      });
      if(res.data?.error)throw new Error(res.data.error);
      toast.success('Clare Pickleball booking email sent');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not send booking email')}
    finally{setBusy('')}
  };

  const closeSession=async(id)=>{
    setBusy(`close-${id}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_close',sessionId:id});
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
      toast.success('Guest booking link closed');
    }catch(e){toast.error(e?.message||'Could not close link')}
    finally{setBusy('')}
  };

  const verifyPayment=async(bookingId)=>{
    setBusy(`verify-${bookingId}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_verify_payment',bookingId});
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
      toast.success(res.data.status==='paid'?'Payment confirmed':'Payment is still '+String(res.data.status||'pending'));
    }catch(e){toast.error(e?.message||'Could not verify payment')}
    finally{setBusy('')}
  };

  const markCashPaid=async(bookingId)=>{
    setBusy(`cash-${bookingId}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_mark_cash_paid',bookingId});
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
      toast.success('Cash marked paid');
    }catch(e){toast.error(e?.message||'Could not update cash payment')}
    finally{setBusy('')}
  };

  const resendEmails=async(bookingId)=>{
    setBusy(`email-${bookingId}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_resend_emails',bookingId});
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
      toast.success('Booking, organiser and host emails resent');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not resend booking emails')}
    finally{setBusy('')}
  };

  const emailHost=async(bookingId,hostName)=>{
    setBusy(`host-email-${bookingId}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_resend_host_email',bookingId});
      if(res.data?.error)throw new Error(res.data.error);
      toast.success(`Booking confirmation emailed to ${res.data?.hostName||hostName||'session host'}`);
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not email the session host')}
    finally{setBusy('')}
  };

  const whatsappHost=(session,booking)=>{
    const target=whatsappNumber(session.hostMobile);
    if(!target){toast.error('No mobile number is saved for this session host');return}
    window.open(`https://wa.me/${target}?text=${encodeURIComponent(booking.hostMessage)}`,'_blank','noopener,noreferrer');
  };

  const issueRefund=async(booking)=>{
    const available=Number(booking.refundableAmount||0);
    if(available<=0){toast.error('Nothing remains to refund');return}
    const raw=window.prompt(`Refund amount (maximum €${available.toFixed(2)})`,available.toFixed(2));
    if(raw===null)return;
    const amount=Math.round(Number(raw)*100)/100;
    if(!Number.isFinite(amount)||amount<=0||amount>available){toast.error(`Enter an amount between €0.01 and €${available.toFixed(2)}`);return}
    const reason=window.prompt('Reason for refund (kept in the RallyHub audit record)');
    if(reason===null)return;
    if(!reason.trim()){toast.error('A refund reason is required');return}
    const ok=window.confirm(`Issue a €${amount.toFixed(2)} refund through ${booking.provider||booking.paymentMethod}?\n\nGuest cancellations made less than 24 hours before the session are normally non-refundable. Only continue if this refund is appropriate or an authorised exception.\n\nThis action sends the refund to the original payment method.`);
    if(!ok)return;
    setBusy(`refund-${booking.id}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{
        action:'admin_refund_payment',bookingId:booking.id,refundAmount:amount,reason:reason.trim(),confirmRefund:true,
      });
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-session-admin-list']});
      toast.success(`€${Number(res.data.refundAmount||amount).toFixed(2)} refund issued`);
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not issue refund')}
    finally{setBusy('')}
  };

  const serviceStates = /** @type {[string,boolean,unknown,()=>Promise<any>][]} */ ([["Session settings",templatesLoading,templatesError,retryTemplates],["Session list",listLoading,listError,retryList],["Guest requests",requestsLoading,requestsError,retryRequests]]);
  if(user?.role!=='admin')return <div className="min-h-[50vh] grid place-items-center text-center"><div><ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/40"/><p className="mt-3 font-semibold">Admin access required</p></div></div>;
  if(templatesLoading&&listLoading&&requestsLoading)return <div className="mx-auto max-w-3xl p-6 space-y-3" role="status"><h1 className="text-xl font-bold">Session Bookings</h1><p className="text-sm text-muted-foreground">Some booking services are still loading or unavailable. You can retry them individually.</p>{serviceStates.map(([name,loading,failed,retry])=><div key={name} className="flex items-center justify-between gap-3 rounded-lg border p-3"><span>{name}: {failed?'Unavailable':loading?'Loading…':'Ready'}</span>{failed&&<Button type="button" variant="outline" size="sm" onClick={()=>retry()}>Retry</Button>}</div>)}</div>;

  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2"><CalendarCheck className="h-6 w-6 text-primary"/><h1 className="text-2xl sm:text-3xl font-black">Session Bookings</h1></div>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Manage member payment fallbacks and guest bookings. Existing members can verify against the membership database and pay directly; guests continue through the normal approval flow.</p>
      </div>
      <div className="flex flex-wrap gap-2"><a href="/app/communications?scope=tenant&source=session-bookings&template=guest_approved&returnTo=%2Fapp%2Fguest-bookings&label=Session%20Bookings"><Button size="sm" variant="outline">Open in Communications</Button></a><Badge variant="outline" className={templateData.sumupConfigured?'border-green-500/40 text-green-600':'border-amber-500/40 text-amber-600'}>
        {templateData.sumupConfigured?'SumUp connected':'SumUp setup required'}
      </Badge></div>
    </div>

    {(templatesError||listError||requestsError||templatesLoading||listLoading||requestsLoading)&&<div className="rounded-xl border border-amber-500/30 p-3 space-y-2"><p className="font-semibold text-sm">Some booking services are unavailable. Available records are shown below.</p>{serviceStates.filter(([,loading,error])=>loading||error).map(([name,loading,error,retry])=><div key={name} className="flex items-center justify-between gap-3 text-sm"><span>{name}: {loading?'Loading…':'Unavailable'}</span>{error&&<Button type="button" size="sm" variant="outline" onClick={()=>retry()}>Retry</Button>}</div>)}</div>}
    {user?.role==='admin'&&<EnnisDiamondSpondPilot/>}

    {!templateData.sumupConfigured&&<div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
      <strong>SumUp is not connected to RallyHub yet.</strong> You can create and test cash/waiver flows now. Doora Barefield and Ennistymon payment links will become live when the SumUp API key and merchant code are added to the backend.
    </div>}

    <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">Guest requests awaiting approval</h2><p className="mt-1 text-xs text-muted-foreground">These are Clare club guest-session requests, separate from the public Directory Player Network. They do not reach payment until you approve them.</p></div><Badge variant="outline">{pendingRequests.length} pending</Badge></div>
      {pendingRequests.length===0?<p className="text-sm text-muted-foreground">No guest requests are waiting for approval.</p>:pendingRequests.map(r=><div key={r.id} className="rounded-xl border bg-secondary/20 p-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-black">{r.fullName}</p><Badge variant="outline">{r.experienceLevel==='beginner'?'Beginner':'Experienced'}</Badge>{r.healthDeclarationApplies&&<Badge variant="outline" className="border-amber-500/40 text-amber-700">Health details supplied</Badge>}</div><p className="mt-1 text-sm text-muted-foreground">{r.email} · {r.mobile}</p><p className="mt-2 text-sm font-semibold">{r.venueName} · {r.day} {r.start}{r.end?`–${r.end}`:''}</p>{r.memberPrimaryVenue&&<p className="text-xs text-muted-foreground">Existing member primary venue: {r.memberPrimaryVenue}</p>}{r.experienceLevel==='experienced'&&<p className="mt-1 text-xs text-muted-foreground">Club: {r.homeClub||'—'} · DUPR: {r.duprId||'—'}</p>}<p className="mt-2 text-xs"><strong>Previous sports:</strong> {(r.previousSports||[]).join(', ')||'—'}</p>{r.sportingBackgroundNote&&<p className="mt-1 text-xs"><strong>Other sporting background:</strong> {r.sportingBackgroundNote}</p>}<p className="mt-1 text-xs"><strong>Health/medical:</strong> {r.healthDeclarationApplies?'Yes, details supplied':'No issues declared'}</p>{r.healthDeclarationApplies&&r.medicalNote&&<p className="mt-1 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-xs"><strong>Health details:</strong> {r.medicalNote}</p>}<p className="mt-1 text-xs text-muted-foreground">Next matching date: {r.nextDate||'RallyHub will use the next occurrence'}</p><div className="mt-4 rounded-xl border bg-background/70 p-3"><p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Offer this session</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{(templateData.templates||[]).map(s=>{const chosen=(approvalSelections[r.id]||r.sessionId)===s.key;return <label key={s.key} className={`flex cursor-pointer gap-2 rounded-lg border p-3 text-sm ${chosen?'border-primary bg-primary/10':''}`}><input type="radio" name={`approval-session-${r.id}`} className="mt-1" checked={chosen} onChange={()=>setApprovalSelections(prev=>({...prev,[r.id]:s.key}))}/><span><strong>{s.venueName}</strong><span className="block text-xs text-muted-foreground">{s.weekday} · {s.start}{s.end?`–${s.end}`:''} · €{Number(s.fee||0).toFixed(2)}{s.payment==='cash'?' cash to host':' online'}</span></span></label>})}</div><label className="mt-3 block text-sm font-semibold">Date to offer (choose a future date if this week is full)<Input aria-label={`Approval session date for ${r.fullName}`} className="mt-1 max-w-xs bg-background" type="date" value={approvalDates[r.id]||r.nextDate||''} onChange={e=>setApprovalDates(prev=>({...prev,[r.id]:e.target.value}))}/></label><p className="mt-1 text-xs text-muted-foreground">The private invitation and payment link will be for this date only. The date must match the selected session's weekday.</p></div></div><div className="flex flex-wrap gap-2"><Button size="sm" disabled={!!busy||approvalFeedback[r.id]?.type==='success'} onClick={()=>approveRequest(r)}>{busy===`approve-${r.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<UserCheck className="mr-1.5 h-3.5 w-3.5"/>}Approve & send private link</Button><Button size="sm" variant="outline" disabled={!!busy} onClick={()=>startGuestEdit(r)}>Edit details</Button><Button size="sm" variant="outline" disabled={!!busy} onClick={()=>rejectRequest(r)}><XCircle className="mr-1.5 h-3.5 w-3.5"/>Decline</Button>{approvalFeedback[r.id]&&<p role="status" aria-live="polite" className={`w-full rounded-lg border p-2 text-sm ${approvalFeedback[r.id].type==='error'?'border-red-500/40 text-red-700':approvalFeedback[r.id].type==='success'?'border-green-500/40 text-green-700':'border-border text-muted-foreground'}`}>{approvalFeedback[r.id].message}</p>}</div></div>
      </div>)}
    </section>

    {editingGuest&&<section className="glass rounded-xl border border-primary/40 p-5 space-y-3" role="region" aria-label="Edit guest request" id="guest-request-editor">
      <h3 className="font-black">Edit guest request — {editingGuest.fullName}</h3>
      <p className="text-xs text-muted-foreground">Club administrator changes are recorded. Correct the contact details before approving or resending a private booking link. An approved guest's old invitation is revoked if their name, email or mobile changes.</p>
      <div className="grid gap-3 sm:grid-cols-2">{[['fullName','Full name'],['email','Email address'],['mobile','Mobile number'],['homeClub','Home club'],['duprId','DUPR ID'],['sportingBackgroundNote','Sporting background']].map(([key,title])=><label key={key} className="space-y-1"><span className="text-sm font-medium">{title}</span><Input type={key==='email'?'email':'text'} value={guestDraft[key]||''} onChange={e=>setGuestDraft(prev=>({...prev,[key]:e.target.value}))}/></label>)}</div>
      <div className="flex flex-wrap gap-2"><Button disabled={!!busy} onClick={saveGuestEdit}>{busy==='save-guest-edit'?'Saving…':'Save changes'}</Button><Button variant="outline" disabled={!!busy} onClick={()=>setEditingGuest(null)}>Cancel</Button></div>
    </section>}
    <GuestAttendanceFollowup sessions={sessions}/>

    <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="text-lg font-black">Session Host List</h2><p className="mt-1 text-xs text-muted-foreground">A compact, screenshot-ready attendee list. Only confirmed/cash-due bookings are counted as recorded. Add expected attendees for a host reminder without creating a payment or booking.</p></div><Button size="sm" variant="outline" disabled={!hostSession} onClick={()=>copy(hostListText,'Host list copied — share only with the authorised host')}><Copy className="mr-1.5 h-4 w-4"/>Copy host list</Button></div>
      <label className="block text-sm font-semibold">Choose session<select aria-label="Session for host list" className="mt-2 block w-full max-w-xl rounded-lg border bg-background p-3" value={hostListSessionId} onChange={e=>setHostListSessionId(e.target.value)}><option value="">Select venue, date and time</option>{sessions.map(s=><option key={s.id} value={s.id}>{niceDate(s.sessionDate)} · {s.startTime} · {s.venueName}{s.archivedAt?' (archived)':''}</option>)}</select></label>
      {hostSession&&<>
        <div className="rounded-xl border bg-background p-4" aria-label="Session host screenshot list">
          <h3 className="font-black text-lg">Clare Pickleball · Session Host List</h3>
          <p className="mt-1 text-sm font-semibold">{niceDate(hostSession.sessionDate)} · {hostSession.startTime}{hostSession.endTime?`–${hostSession.endTime}`:''}</p><p className="text-sm">{hostSession.venueName}</p>
          <p className="mt-2 text-xs font-bold text-muted-foreground">{hostConfirmed.length} recorded · {hostExpected.length} host-added (unverified)</p>
          <div className="mt-3 space-y-2">{hostListRows.length?hostListRows.map((r,i)=><div key={r.id} className="flex items-start justify-between gap-2 border-t py-2 text-sm"><div className="min-w-0"><p className="font-bold">{i+1}. {r.name} <span className="font-normal text-muted-foreground">· {r.status}</span></p><p className="break-all text-xs text-muted-foreground">{r.mobile||'No mobile'} · {r.email||'No email'}</p></div>{String(r.id).startsWith('extra-')&&<Button size="sm" variant="ghost" aria-label={`Remove ${r.name} from preview`} onClick={()=>setHostListExtras(old=>({...old,[hostSession.id]:(old[hostSession.id]||[]).filter(x=>x.id!==r.id)}))}><XCircle className="h-4 w-4"/></Button>}</div>):<p className="text-sm text-muted-foreground">No confirmed bookings recorded for this session.</p>}</div>
        </div>
        <div className="rounded-lg border p-3 space-y-2"><h4 className="text-sm font-bold">Attendance reconciliation — recorded bookings</h4>
          <p className="text-xs text-muted-foreground">After the session, mark each booked guest Attended, No-show or Cancelled. A payment is not changed by an attendance update. Attended guests stay in historical records and no longer appear in the historical guest picker.</p>
          {(hostSession.bookings||[]).filter(b=>b.bookingStatus!=='cancelled').length?<div className="space-y-2">{(hostSession.bookings||[]).filter(b=>b.bookingStatus!=='cancelled').map(b=><div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm"><span className="font-semibold">{b.fullName} <span className="font-normal text-muted-foreground">· {b.paymentStatus==='paid'?'€'+Number(b.amount||0).toFixed(2)+' paid':b.paymentStatus||'Payment unverified'}</span></span><select aria-label={`Attendance status for ${b.fullName}`} className="rounded-md border bg-background p-2" disabled={!!attendanceBusy} value={b.attendanceStatus||'unconfirmed'} onChange={e=>saveAttendance(b.id,e.target.value)}><option value="unconfirmed">Not reconciled</option><option value="attended">Attended</option><option value="no_show">No-show</option><option value="cancelled">Cancelled</option></select></div>)}</div>:<p className="text-xs text-muted-foreground">No formal bookings to reconcile. Manually included people are preview-only and don't have attendance records.</p>}
          <p className="text-xs text-muted-foreground">{(hostSession.bookings||[]).filter(b=>b.bookingStatus!=='cancelled'&&b.attendanceStatus==='attended').length} attended · {(hostSession.bookings||[]).filter(b=>b.bookingStatus!=='cancelled'&&b.attendanceStatus==='no_show').length} no-show · {(hostSession.bookings||[]).filter(b=>b.bookingStatus!=='cancelled'&&b.attendanceStatus==='unconfirmed').length} unresolved</p>
        </div>
        <div className="rounded-lg border p-3 space-y-2"><h4 className="text-sm font-bold">Include from existing requests (manual arrangements)</h4><p className="text-xs text-muted-foreground">Tick anyone expected for this date, including guests who paid for an earlier session or were previously approved for this weekly slot. They are added to this host preview only; no payment, approval or booking is changed.</p>
          {hostRequestCandidates.length?hostRequestCandidates.map(r=><label key={r.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-2 text-sm"><input type="checkbox" className="h-4 w-4 shrink-0" checked={hostExtras.some(x=>x.id===`candidate-${r.id}`)} onChange={e=>toggleHostCandidate(r,e.target.checked)}/><span className="min-w-0"><strong>{r.fullName}</strong> <span className="text-xs text-muted-foreground">· {r.previouslyPaid?`Previously paid ${niceDate(r.previousSessionDate)}`:r.status==='pending_approval'?'Pending request':'Previously approved'} — payment not verified for this date</span><span className="block break-all text-xs text-muted-foreground">{r.mobile||'No mobile'} · {r.email||'No email'}</span></span></label>):<p className="text-xs text-muted-foreground">No other requests found for this weekly session. You can add a name below.</p>}
        </div>
        <div className="rounded-lg border p-3"><p className="text-sm font-semibold">Add somebody expected by the host (not yet recorded for this date)</p><div className="mt-2 grid gap-2 sm:grid-cols-3"><Input aria-label="Additional attendee name" placeholder="Full name" value={hostListAddName} onChange={e=>setHostListAddName(e.target.value)}/><Input aria-label="Additional attendee mobile" placeholder="Mobile (optional)" value={hostListAddMobile} onChange={e=>setHostListAddMobile(e.target.value)}/><Input aria-label="Additional attendee email" placeholder="Email (optional)" value={hostListAddEmail} onChange={e=>setHostListAddEmail(e.target.value)}/></div><Button size="sm" variant="outline" className="mt-2" onClick={addHostExpected}>Add to preview only</Button><p className="mt-2 text-xs text-muted-foreground">Host-added attendees are labelled unverified. This preview does not save bookings, confirm payment or send messages. Copy or screenshot only for an authorised host; mobile numbers and emails are personal data.</p></div>
      </>}
    </section>

    <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="text-lg font-black">Session attendees & payment status</h2><p className="mt-1 text-xs text-muted-foreground">One working list for approved guests, people awaiting payment and completed bookings. Use this if somebody says they did not receive their booking email.</p></div>
        <div className="flex gap-2"><Button size="sm" variant={!showPastAttendees?"default":"outline"} onClick={()=>setShowPastAttendees(false)}>Current ({currentBookingRows.length})</Button><Button size="sm" variant={showPastAttendees?"default":"outline"} onClick={()=>setShowPastAttendees(true)}>Past / archived ({pastBookingRows.length})</Button></div>
      </div>
      <div className="flex flex-wrap gap-2"><label className="text-sm">Centre <select aria-label="Filter attendees by centre" className="ml-2 rounded border p-2" value={attendeeCentre} onChange={e=>{setAttendeeCentre(e.target.value);setAttendeeTime('all')}}><option value="all">All centres</option>{centreOptions.map(v=><option key={v} value={v}>{v}</option>)}</select></label><label className="text-sm">Time <select aria-label="Filter attendees by time" className="ml-2 rounded border p-2" value={attendeeTime} onChange={e=>setAttendeeTime(e.target.value)}><option value="all">All times</option>{timeOptions.map(v=><option key={v} value={v}>{v}</option>)}</select></label><span className="self-center text-xs text-muted-foreground">{visibleBookingRows.length} attendees shown</span></div>
      {visibleBookingRows.length===0?<p className="text-sm text-muted-foreground">No bookings in this view.</p>:<div className="space-y-3">
        {visibleBookingRows.map(row=>{
          const awaitingBooking=row.kind==='approved_request'&&!row.bookingId;
          const paid=['paid','partially_refunded','refunded'].includes(row.paymentStatus);
          const paymentLabel=awaitingBooking?'Approved · booking not completed':row.paymentStatus==='pending'?'Payment pending':row.paymentStatus==='cash_due'?'Hall contribution due':paid?'Paid':String(row.paymentStatus||row.bookingStatus||'').replaceAll('_',' ');
          return <div key={row.key} className="rounded-xl border bg-secondary/20 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><p className="font-black">{row.fullName}</p><Badge variant="outline" className={paid?'border-green-500/40 text-green-600':awaitingBooking||row.paymentStatus==='pending'?'border-amber-500/40 text-amber-700':''}>{paymentLabel}</Badge>{row.pendingAlternative&&<Badge variant="outline">Awaiting acceptance — not yet confirmed</Badge>}{offerFor(row)&&<Badge variant="outline" className={offerFor(row).status==='accepted'?'border-green-500/40 text-green-700':'border-amber-500/40 text-amber-700'}>Alternative {offerFor(row).status}{offerFor(row).targetLabel?' · '+offerFor(row).targetLabel:''}</Badge>}</div>
                <p className="mt-1 text-sm text-muted-foreground">{row.email}{row.mobile?` · ${row.mobile}`:''}</p>
                <p className="mt-2 text-sm font-semibold">{row.sessionDate?niceDate(row.sessionDate):'Session date pending'}{row.start?` · ${row.start}${row.end?`–${row.end}`:''}`:''}</p>
                {row.pendingAlternative&&<p className="text-xs text-muted-foreground">Original paid booking: {niceDate(row.originalSessionDate)} · {row.originalVenueName}</p>}<p className="text-sm text-muted-foreground">{row.venueName||'Venue pending'}{row.amount!==null&&row.amount!==undefined?` · €${Number(row.amount||0).toFixed(2)}`:''}</p>
                {row.kind==='approved_request'&&row.request?.approvedAt&&<p className="mt-1 text-xs text-muted-foreground">Approved {new Date(row.request.approvedAt).toLocaleString('en-IE')}</p>}
                {row.kind==='booking'&&row.booking?.registeredAt&&<p className="mt-1 text-xs text-muted-foreground">Booking started {new Date(row.booking.registeredAt).toLocaleString('en-IE')}{row.booking?.paidAt?` · paid ${new Date(row.booking.paidAt).toLocaleString('en-IE')}`:''}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {!!row.bookingId&&row.bookingStatus!=='cancelled'&&<Button size="sm" variant="outline" onClick={()=>{setChangeBooking(row);setChangeSlot('');setChangeDate('')}}><CalendarCheck className="mr-1.5 h-3.5 w-3.5"/>Offer alternative</Button>}
                {row.kind==='approved_request'&&!row.bookingId&&<>
                  <Button size="sm" variant="outline" disabled={!!busy} onClick={()=>startGuestEdit(row.request)}>Edit details</Button>
                  <Button size="sm" variant="outline" disabled={busy===`link-${row.request.id}`} onClick={()=>previewApprovedMessage(row.request,'email')}><Mail className="mr-1.5 h-3.5 w-3.5"/>Preview / resend email</Button>
                  <Button size="sm" variant="outline" disabled={busy===`link-${row.request.id}`} onClick={()=>previewApprovedMessage(row.request,'whatsapp')}><MessageCircle className="mr-1.5 h-3.5 w-3.5"/>Preview WhatsApp</Button>
                  <Button size="sm" variant="outline" disabled={busy===`link-${row.request.id}`} onClick={()=>approvedPrivateLink(row.request,{copyOnly:true})}><Copy className="mr-1.5 h-3.5 w-3.5"/>Copy private link</Button>
                  <Button size="sm" variant="outline" className="text-destructive" disabled={busy===`retract-${row.request.id}`} onClick={()=>retractApproval(row.request)}>{busy===`retract-${row.request.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<RotateCcw className="mr-1.5 h-3.5 w-3.5"/>}Retract / amend</Button>
                </>}
                {row.kind==='approved_request'&&row.bookingId&&<>
                  <Button size="sm" variant="outline" onClick={()=>isPendingOffer(row)?remindAlternative(row,'whatsapp'):whatsappBooking(row)}><MessageCircle className="mr-1.5 h-3.5 w-3.5"/>{isPendingOffer(row)?'WhatsApp offer reminder':'WhatsApp'}</Button>
                  {row.sumupCheckoutUrl&&row.paymentStatus==='pending'&&<Button size="sm" variant="outline" onClick={()=>copy(row.sumupCheckoutUrl,'Payment link copied')}><Copy className="mr-1.5 h-3.5 w-3.5"/>Copy payment link</Button>}
                  {paid&&<Button size="sm" variant="outline" disabled={busy===`email-${row.bookingId}`} onClick={()=>isPendingOffer(row)?remindAlternative(row,'email'):resendEmails(row.bookingId)}>{busy===`email-${row.bookingId}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<Mail className="mr-1.5 h-3.5 w-3.5"/>}{isPendingOffer(row)?'Resend alternative offer':'Resend confirmation'}</Button>}
                  {row.paymentMethod==='sumup'&&!paid&&<Button size="sm" variant="outline" disabled={busy===`verify-${row.bookingId}`} onClick={()=>verifyPayment(row.bookingId)}>{busy===`verify-${row.bookingId}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<ShieldCheck className="mr-1.5 h-3.5 w-3.5"/>}Verify payment</Button>}
                  {row.kind==='approved_request'&&!paid&&<Button size="sm" variant="outline" className="text-destructive" disabled={busy===`retract-${row.request.id}`} onClick={()=>retractApproval(row.request)}>{busy===`retract-${row.request.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<RotateCcw className="mr-1.5 h-3.5 w-3.5"/>}Retract / amend</Button>}
                </>}
                {row.kind==='booking'&&<>
                  <Button size="sm" variant="outline" onClick={()=>isPendingOffer(row)?remindAlternative(row,'whatsapp'):whatsappBooking(row)}><MessageCircle className="mr-1.5 h-3.5 w-3.5"/>{isPendingOffer(row)?'WhatsApp offer reminder':'WhatsApp'}</Button>
                  {row.sumupCheckoutUrl&&row.paymentStatus==='pending'&&<Button size="sm" variant="outline" onClick={()=>copy(row.sumupCheckoutUrl,'Payment link copied')}><Copy className="mr-1.5 h-3.5 w-3.5"/>Copy payment link</Button>}
                  {paid&&<Button size="sm" variant="outline" disabled={busy===`email-${row.bookingId}`} onClick={()=>isPendingOffer(row)?remindAlternative(row,'email'):resendEmails(row.bookingId)}>{busy===`email-${row.bookingId}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<Mail className="mr-1.5 h-3.5 w-3.5"/>}{isPendingOffer(row)?'Resend alternative offer':'Resend confirmation'}</Button>}
                  {row.paymentMethod==='sumup'&&!paid&&<Button size="sm" variant="outline" disabled={busy===`verify-${row.bookingId}`} onClick={()=>verifyPayment(row.bookingId)}>{busy===`verify-${row.bookingId}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<ShieldCheck className="mr-1.5 h-3.5 w-3.5"/>}Verify payment</Button>}
                  {row.kind==='approved_request'&&!paid&&<Button size="sm" variant="outline" className="text-destructive" disabled={busy===`retract-${row.request.id}`} onClick={()=>retractApproval(row.request)}>{busy===`retract-${row.request.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<RotateCcw className="mr-1.5 h-3.5 w-3.5"/>}Retract / amend</Button>}
                </>}
              </div>
            </div>
          </div>;
        })}
      </div>}
    </section>

    {changeBooking&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg space-y-4 rounded-2xl border bg-background p-6 shadow-xl">
        <h2 className="text-xl font-black">Offer alternative to {changeBooking.fullName}</h2>
        <p className="text-sm text-muted-foreground">Their existing booking stays unchanged until they accept the private offer. Only equal-fee and matching-payment sessions can be transferred automatically.</p>
        <Label>New session</Label>
        <Select value={changeSlot} onValueChange={setChangeSlot}><SelectTrigger><SelectValue placeholder="Select venue and time"/></SelectTrigger><SelectContent className="z-[200] max-h-[min(60vh,24rem)]" position="popper" side="bottom" sideOffset={8}>{(templateData.templates||[]).map(t=><SelectItem key={t.key} value={t.key}>{t.venueName} · {t.weekday} {t.start}–{t.end} · €{Number(t.fee).toFixed(2)}</SelectItem>)}</SelectContent></Select>
        <Label>New date</Label><Input type="date" value={changeDate} onChange={e=>setChangeDate(e.target.value)}/>
        <div className="flex flex-wrap gap-2"><Button disabled={!!busy||!changeSlot||!changeDate} onClick={offerBookingChange}>{busy==='change-offer'&&<RefreshCw className="mr-2 h-4 w-4 animate-spin"/>}Send offer for guest acceptance</Button><Button variant="outline" disabled={!!busy} onClick={()=>setChangeBooking(null)}>Cancel</Button></div>
      </div>
    </div>}

    {messagePreview&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">{messagePreview.channel==='email'?'Email preview':'WhatsApp preview'}</p><h2 className="mt-1 text-xl font-black">Clare Pickleball guest booking</h2></div><Button size="sm" variant="ghost" onClick={()=>setMessagePreview(null)}>Close</Button></div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><div className="rounded-xl border p-3"><span className="text-xs text-muted-foreground">From</span><p className="font-bold">Clare Pickleball</p></div><div className="rounded-xl border p-3"><span className="text-xs text-muted-foreground">To</span><p className="font-bold break-all">{messagePreview.channel==='email'?messagePreview.request.email:messagePreview.request.mobile}</p></div></div>
        {messagePreview.channel==='email'&&<div className="mt-3 rounded-xl border p-3"><span className="text-xs text-muted-foreground">Subject</span><p className="mt-1 font-semibold">{messagePreview.subject}</p></div>}
        <div className="mt-3 rounded-xl border bg-secondary/20 p-4"><textarea aria-label="Edit message before sending" className="min-h-48 w-full resize-y rounded-lg border bg-background p-3 text-sm leading-6" value={messagePreview.message} onChange={e=>setMessagePreview(prev=>({...prev,message:e.target.value}))}/></div>
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground"><strong className="text-foreground">Branding:</strong> this communication is from Clare Pickleball. RallyHub appears only as the technology provider / “Powered by RallyHub”.</div>
        <div className="mt-4 flex flex-wrap gap-2"><Button onClick={sendPreviewedMessage}>{messagePreview.channel==='email'?<Mail className="mr-2 h-4 w-4"/>:<MessageCircle className="mr-2 h-4 w-4"/>}{messagePreview.channel==='email'?(messagePreview.kind==='alternative_reminder'?'Prepare edited email':'Send email'):'Open WhatsApp'}</Button><Button variant="outline" onClick={()=>copy(messagePreview.message,'Message copied')}><Copy className="mr-2 h-4 w-4"/>Copy message</Button><Button variant="ghost" onClick={()=>setMessagePreview(null)}>Cancel</Button></div>
      </div>
    </div>}

    <details className="glass rounded-2xl p-5 sm:p-6" >
      <summary className="cursor-pointer text-lg font-black">Create guest booking link <span className="ml-2 text-xs font-normal text-muted-foreground">Expand when needed</span></summary>
      <div className="mt-5 space-y-5">
      <div><h2 className="text-lg font-black">Create guest booking link</h2><p className="mt-1 text-xs text-muted-foreground">Choose the actual session date. RallyHub checks that it matches the weekday of the selected slot.</p></div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <Label>Session slot</Label>
          <Select value={templateKey} onValueChange={setTemplateKey}>
            <SelectTrigger className="mt-1.5 bg-secondary"><SelectValue placeholder="Choose venue and time"/></SelectTrigger>
            <SelectContent>{templateData.templates?.map(t=><SelectItem key={t.key} value={t.key}>{t.venueName} · {t.label} · €{Number(t.fee).toFixed(2)} {t.payment==='cash'?'cash':'online'}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Session date</Label><Input type="date" value={sessionDate} onChange={e=>setSessionDate(e.target.value)} className="mt-1.5 bg-secondary"/></div>
        <div><Label>Guest capacity <span className="font-normal text-muted-foreground">(optional)</span></Label><Input type="number" min="1" value={capacity} onChange={e=>setCapacity(e.target.value)} placeholder="Leave blank if not needed" className="mt-1.5 bg-secondary"/></div>
        <div><Label>Price (€)</Label><Input type="number" min="0.01" step="0.01" value={feeAmount} onChange={e=>setFeeAmount(e.target.value)} placeholder={selected?Number(selected.fee).toFixed(2):'5.50'} className="mt-1.5 bg-secondary"/><p className="mt-1 text-xs text-muted-foreground">Leave blank to use the session default. The payment gateway receives the price saved on this booking link.</p></div>
        <div><Label>Email booking confirmations to</Label><Input type="email" value={notificationEmail} onChange={e=>setNotificationEmail(e.target.value)} className="mt-1.5 bg-secondary"/></div>
      </div>

      {selected&&<div className="rounded-xl border bg-secondary/20 p-4 text-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <p className="font-black">{selected.venueName}</p>
            <p className="mt-1 text-muted-foreground">{selected.venueAddress}</p>
            <p className="text-muted-foreground">{selected.eircode}</p>
            <p className="mt-2 font-semibold">{selected.weekday} · {selected.start}–{selected.end} · €{Number(feeAmount===''?selected.fee:feeAmount||0).toFixed(2)} · {selected.payment==='cash'?'€5 hall contribution · cash to host':'SumUp'}</p>
          </div>
          <a href={selected.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-primary"><MapPin className="h-4 w-4"/> Google Maps <ExternalLink className="h-3.5 w-3.5"/></a>
        </div>
      </div>}

      <Button onClick={createSession} disabled={busy==='create'||!templateKey||!sessionDate} className="gap-2">
        {busy==='create'?<RefreshCw className="h-4 w-4 animate-spin"/>:<CalendarCheck className="h-4 w-4"/>}
        {busy==='create'?'Creating…':'Create guest session'}
      </Button>
      </div>
    </details>

    <details className="space-y-3">
      <summary className="cursor-pointer rounded-xl border bg-secondary/20 p-4 font-bold">Session booking links <span className="ml-2 text-xs font-normal text-muted-foreground">({sessions.length} links) · Expand to manage</span></summary>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-black">Session booking links</h2><p className="mt-1 text-xs text-muted-foreground">Past sessions are archived automatically and remain available for review. Test/empty sessions can be deleted; sessions with confirmed or financial history are retained.</p></div><div className="flex gap-2"><Button size="sm" variant={!showArchived?'default':'outline'} onClick={()=>setShowArchived(false)}>Current ({currentSessions.length})</Button><Button size="sm" variant={showArchived?'default':'outline'} onClick={()=>setShowArchived(true)}><History className="mr-1.5 h-3.5 w-3.5"/>Archived ({archivedSessions.length})</Button></div></div>
      {visibleSessions.length===0?<div className="glass rounded-2xl p-6 text-sm text-muted-foreground">{showArchived?'No archived sessions yet.':'No current guest booking links have been created yet.'}</div>:visibleSessions.map(s=>{
        const url=`${window.location.origin}/book/${s.token}`;
        const confirmed=(s.bookings||[]).filter(b=>['confirmed','cash_due'].includes(b.bookingStatus)).length;
        return <div key={s.id} className="glass rounded-2xl p-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black">{niceDate(s.sessionDate)} · {s.startTime}{s.endTime?`–${s.endTime}`:''}</h3>
                <Badge variant="outline">{s.archivedAt?'Archived':s.active?'Open':'Closed'}</Badge>
                <Badge variant="outline">{confirmed} booking{confirmed===1?'':'s'}</Badge>
              </div>
              <p className="mt-2 font-semibold">{s.venueName}</p>
              <p className="text-sm text-muted-foreground">{s.venueAddress}, {s.eircode}</p>
              <p className="mt-1 text-xs text-muted-foreground">€{Number(s.feeAmount).toFixed(2)} · {s.paymentMethod==='cash'?'Hall contribution · cash to host':'SumUp online payment'}{s.capacity?` · Capacity ${s.capacity}`:''}</p>
              {s.hostName&&<p className="mt-1 text-xs font-semibold text-muted-foreground">Host: {s.hostName}{s.hostEmail?` · ${s.hostEmail}`:''}{s.hostMobile?` · ${s.hostMobile}`:''}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={()=>copy(url,'Public approval-required guest link copied')}><Copy className="mr-1.5 h-3.5 w-3.5"/>Copy public link</Button>
              <Button size="sm" variant="outline" disabled={busy===`magic-${s.id}`} onClick={()=>createMagicLink(s)}>{busy===`magic-${s.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<Copy className="mr-1.5 h-3.5 w-3.5"/>}Create private link</Button>
              <Button size="sm" variant="outline" disabled={busy===`invite-${s.id}`} onClick={()=>emailInvite(s)}>{busy===`invite-${s.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<Mail className="mr-1.5 h-3.5 w-3.5"/>}Email booking link</Button>
              <Button size="sm" variant="outline" disabled={busy===`whatsapp-${s.id}`} onClick={()=>shareMagicWhatsApp(s)}>{busy===`whatsapp-${s.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<MessageCircle className="mr-1.5 h-3.5 w-3.5"/>}WhatsApp</Button>
              <a href={s.mapsUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><MapPin className="mr-1.5 h-3.5 w-3.5"/>Map</Button></a>
              {!s.archivedAt&&s.active&&<Button size="sm" variant="ghost" className="text-destructive" disabled={busy===`close-${s.id}`} onClick={()=>closeSession(s.id)}><XCircle className="mr-1.5 h-3.5 w-3.5"/>Close link</Button>}
              {!s.archivedAt&&<Button size="sm" variant="outline" disabled={busy===`archive-${s.id}`} onClick={()=>archiveSession(s)}><Archive className="mr-1.5 h-3.5 w-3.5"/>Archive</Button>}
              {s.archivedAt&&<Button size="sm" variant="outline" disabled={busy===`restore-${s.id}`} onClick={()=>restoreSession(s)}><RotateCcw className="mr-1.5 h-3.5 w-3.5"/>Restore</Button>}
              <Button size="sm" variant="ghost" className="text-destructive" disabled={busy===`delete-session-${s.id}`} onClick={()=>deleteSession(s)}><Trash2 className="mr-1.5 h-3.5 w-3.5"/>Delete test/empty</Button>
            </div>
          </div>

          <button type="button" className="mt-4 text-sm font-bold text-primary" onClick={()=>setExpanded(expanded===s.id?'':s.id)}>
            {expanded===s.id?'Hide bookings':`Show bookings (${(s.bookings||[]).length})`}
          </button>

          {expanded===s.id&&<div className="mt-4 space-y-3 border-t pt-4">
            {(s.bookings||[]).length===0?<p className="text-sm text-muted-foreground">No bookings yet.</p>:(s.bookings||[]).map(b=><div key={b.id} className="rounded-xl border bg-secondary/20 p-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><p className="font-black">{b.fullName}</p>
                    <Badge variant="outline">{b.participantType==='member'?'Member':'Guest'}</Badge>
                    <Badge variant="outline" className={b.paymentStatus==='paid'?'border-green-500/40 text-green-600':b.paymentStatus==='cash_due'?'border-amber-500/40 text-amber-600':''}>{b.paymentStatus}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{b.email} · {b.mobile}</p>
                  {b.participantType==='guest'&&<p className="mt-2 text-xs"><strong>Previous sports:</strong> {(b.previousSports||[]).join(', ')||'—'} · <strong>Health:</strong> {b.healthDeclarationApplies?'details supplied':'no issues declared'}</p>}
                  {b.participantType==='guest'&&b.sportingBackgroundNote&&<p className="mt-1 text-xs"><strong>Sporting background:</strong> {b.sportingBackgroundNote}</p>}
                  {b.participantType==='guest'&&b.healthDeclarationApplies&&b.medicalNote&&<p className="mt-1 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-xs"><strong>Health details:</strong> {b.medicalNote}</p>}
                  {b.bookingNote&&<p className="mt-2 rounded-lg border bg-background/60 p-2 text-xs"><strong>Note:</strong> {b.bookingNote}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">Ref {b.confirmationCode} · booked {b.registeredAt?new Date(b.registeredAt).toLocaleString('en-IE'):''}</p>
                  {Number(b.refundedAmount||0)>0&&<p className="mt-1 text-xs font-semibold text-amber-600">€{Number(b.refundedAmount).toFixed(2)} refunded · €{Number(b.refundableAmount||0).toFixed(2)} remaining refundable</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.hostMobile&&<Button size="sm" variant="outline" onClick={()=>whatsappHost(s,b)}><MessageCircle className="mr-1.5 h-3.5 w-3.5"/>WhatsApp host</Button>}
                  <Button size="sm" variant="outline" onClick={()=>copy(b.hostMessage,'Host message copied')}><Copy className="mr-1.5 h-3.5 w-3.5"/>Copy host message</Button>
                  {s.hostEmail&&(['paid','partially_refunded','refunded'].includes(b.paymentStatus)||(b.paymentMethod==='cash'&&b.bookingStatus==='cash_due'))&&<Button size="sm" variant="outline" disabled={busy===`host-email-${b.id}`} onClick={()=>emailHost(b.id,s.hostName)}>{busy===`host-email-${b.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<Mail className="mr-1.5 h-3.5 w-3.5"/>}Email host</Button>}
                  {b.paymentMethod==='sumup'&&!['paid','partially_refunded','refunded'].includes(b.paymentStatus)&&<Button size="sm" variant="outline" disabled={busy===`verify-${b.id}`} onClick={()=>verifyPayment(b.id)}>{busy===`verify-${b.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<ShieldCheck className="mr-1.5 h-3.5 w-3.5"/>}Verify payment</Button>}
                  {['paid','partially_refunded','refunded'].includes(b.paymentStatus)&&<Button size="sm" variant="outline" disabled={busy===`email-${b.id}`} onClick={()=>resendEmails(b.id)}>{busy===`email-${b.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<Mail className="mr-1.5 h-3.5 w-3.5"/>}Resend all emails</Button>}
                  {b.paymentMethod!=='cash'&&['paid','partially_refunded'].includes(b.paymentStatus)&&Number(b.refundableAmount||0)>0&&<Button size="sm" variant="outline" disabled={busy===`refund-${b.id}`} onClick={()=>issueRefund(b)}>{busy===`refund-${b.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<RotateCcw className="mr-1.5 h-3.5 w-3.5"/>}Refund</Button>}
                  {b.paymentMethod==='cash'&&b.paymentStatus!=='paid'&&<Button size="sm" variant="outline" disabled={busy===`cash-${b.id}`} onClick={()=>markCashPaid(b.id)}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5"/>Mark cash paid</Button>}
                  {!['paid','partially_refunded','refunded'].includes(b.paymentStatus)&&!['confirmed','cash_due'].includes(b.bookingStatus)&&<Button size="sm" variant="ghost" className="text-destructive" disabled={busy===`delete-booking-${b.id}`} onClick={()=>deleteBooking(b)}><Trash2 className="mr-1.5 h-3.5 w-3.5"/>Delete test/incomplete</Button>}
                </div>
              </div>
            </div>)}
          </div>}
        </div>;
      })}
    </details>
  </div>;
}