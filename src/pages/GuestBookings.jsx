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
import { CalendarCheck, CheckCircle2, Copy, ExternalLink, Mail, MapPin, MessageCircle, RefreshCw, RotateCcw, ShieldCheck, UserCheck, XCircle } from 'lucide-react';

function niceDate(value){
  if(!value)return '';
  try{return new Intl.DateTimeFormat('en-IE',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date(`${value}T12:00:00`))}
  catch{return value}
}
function copy(text,label='Copied'){
  navigator.clipboard.writeText(text).then(()=>toast.success(label)).catch(()=>toast.error('Could not copy'));
}
function shareWhatsApp(url,session){
  const action=session.paymentMethod==='cash'?'Reserve your place':`Book & pay €${Number(session.feeAmount||0).toFixed(2)}`;
  const msg=`Clare Pickleball guest session\n${niceDate(session.sessionDate)} · ${session.startTime}\n${session.venueName}\n\n${action}:\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');
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

  const {data:templateData={templates:[],sumupConfigured:false},isLoading:templatesLoading}=useQuery({
    queryKey:['guest-session-templates'],
    queryFn:async()=>{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_templates'});
      if(res.data?.error)throw new Error(res.data.error);
      return res.data;
    },
    enabled:user?.role==='admin',
  });

  const {data:listData={sessions:[],sumupConfigured:false},isLoading:listLoading}=useQuery({
    queryKey:['guest-session-admin-list'],
    queryFn:async()=>{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_list'});
      if(res.data?.error)throw new Error(res.data.error);
      return res.data;
    },
    enabled:user?.role==='admin',
  });

  const {data:requestData={requests:[]},isLoading:requestsLoading}=useQuery({
    queryKey:['guest-access-requests'],
    queryFn:async()=>{
      const res=await base44.functions.invoke('guestAccessJourney',{action:'admin_list'});
      if(res.data?.error)throw new Error(res.data.error);
      return res.data;
    },
    enabled:user?.role==='admin',
  });

  const selected=useMemo(()=>templateData.templates?.find(t=>t.key===templateKey)||null,[templateData,templateKey]);
  const pendingRequests=useMemo(()=>[...(requestData.requests||[])].filter(r=>r.status==='pending_approval'),[requestData]);
  const sessions=useMemo(()=>[...(listData.sessions||[])].sort((a,b)=>`${b.sessionDate} ${b.startTime}`.localeCompare(`${a.sessionDate} ${a.startTime}`)),[listData.sessions]);

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
      const s=res.data.session;
      const url=res.data.magicInviteUrl||`${window.location.origin}/book/${s.token}`;
      copy(url,'Private guest invitation link created and copied');
      toast.success('Guest session created');
      setSessionDate('');setCapacity('');setFeeAmount('');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not create guest session')}
    finally{setBusy('')}
  };

  const createMagicLink=async(session)=>{
    const recipientEmail=window.prompt('Guest email address (recommended – this binds the private link to that guest)')||'';
    const recipientName=recipientEmail?(window.prompt('Guest first name or full name (optional)')||''):'';
    setBusy(`magic-${session.id}`);
    try{
      const res=await base44.functions.invoke('guestSessionBooking',{action:'admin_create_magic_invite',sessionId:session.id,recipientEmail:recipientEmail.trim(),recipientName:recipientName.trim()});
      if(res.data?.error)throw new Error(res.data.error);
      copy(res.data.magicInviteUrl,'Private guest invitation link copied');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not create private guest link')}
    finally{setBusy('')}
  };

  const approveRequest=async(request)=>{
    const date=window.prompt(`Approve ${request.fullName} for which ${request.day}?`,request.nextDate||'');
    if(date===null)return;
    setBusy(`approve-${request.id}`);
    try{
      const res=await base44.functions.invoke('guestAccessJourney',{action:'admin_approve',requestId:request.id,sessionDate:date.trim()});
      if(res.data?.error)throw new Error(res.data.error);
      copy(res.data.magicInviteUrl,'Approved – private payment link copied');
      await Promise.all([qc.invalidateQueries({queryKey:['guest-access-requests']}),qc.invalidateQueries({queryKey:['guest-session-admin-list']})]);
      toast.success('Guest approved. Private booking/payment link copied.');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not approve guest request')}
    finally{setBusy('')}
  };

  const rejectRequest=async(request)=>{
    const reason=window.prompt(`Reason for declining ${request.fullName} (optional)`,'');
    if(reason===null)return;
    setBusy(`reject-${request.id}`);
    try{
      const res=await base44.functions.invoke('guestAccessJourney',{action:'admin_reject',requestId:request.id,reason});
      if(res.data?.error)throw new Error(res.data.error);
      await qc.invalidateQueries({queryKey:['guest-access-requests']});
      toast.success('Guest request declined');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not decline guest request')}
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
      toast.success('Clare Pickleball booking emails resent');
    }catch(e){toast.error(e?.response?.data?.error||e?.message||'Could not resend booking emails')}
    finally{setBusy('')}
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

  if(user?.role!=='admin')return <div className="min-h-[50vh] grid place-items-center text-center"><div><ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/40"/><p className="mt-3 font-semibold">Admin access required</p></div></div>;
  if(templatesLoading||listLoading||requestsLoading)return <div className="min-h-[50vh] grid place-items-center"><RefreshCw className="h-6 w-6 animate-spin"/></div>;

  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2"><CalendarCheck className="h-6 w-6 text-primary"/><h1 className="text-2xl sm:text-3xl font-black">Guest Bookings</h1></div>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Create a dated Clare Pickleball guest-session link. The guest completes their details, waiver, cancellation terms and payment without needing a RallyHub account.</p>
      </div>
      <Badge variant="outline" className={templateData.sumupConfigured?'border-green-500/40 text-green-600':'border-amber-500/40 text-amber-600'}>
        {templateData.sumupConfigured?'SumUp connected':'SumUp setup required'}
      </Badge>
    </div>

    {!templateData.sumupConfigured&&<div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
      <strong>SumUp is not connected to RallyHub yet.</strong> You can create and test cash/waiver flows now. Doora Barefield and Ennistymon payment links will become live when the SumUp API key and merchant code are added to the backend.
    </div>}

    <section className="glass rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">Guest requests awaiting approval</h2><p className="mt-1 text-xs text-muted-foreground">Requests coming from the public Directory do not reach payment until you approve them.</p></div><Badge variant="outline">{pendingRequests.length} pending</Badge></div>
      {pendingRequests.length===0?<p className="text-sm text-muted-foreground">No guest requests are waiting for approval.</p>:pendingRequests.map(r=><div key={r.id} className="rounded-xl border bg-secondary/20 p-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><p className="font-black">{r.fullName}</p><Badge variant="outline">{r.experienceLevel==='beginner'?'Beginner':'Experienced'}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{r.email} · {r.mobile}</p><p className="mt-2 text-sm font-semibold">{r.venueName} · {r.day} {r.start}{r.end?`–${r.end}`:''}</p>{r.experienceLevel==='experienced'&&<p className="mt-1 text-xs text-muted-foreground">Club: {r.homeClub||'—'} · DUPR: {r.duprId||'—'}</p>}<p className="mt-1 text-xs text-muted-foreground">Next matching date: {r.nextDate||'choose date'}</p></div><div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy===`approve-${r.id}`} onClick={()=>approveRequest(r)}>{busy===`approve-${r.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<UserCheck className="mr-1.5 h-3.5 w-3.5"/>}Approve & create private link</Button><Button size="sm" variant="outline" disabled={busy===`reject-${r.id}`} onClick={()=>rejectRequest(r)}><XCircle className="mr-1.5 h-3.5 w-3.5"/>Decline</Button></div></div>
      </div>)}
    </section>

    <section className="glass rounded-2xl p-5 sm:p-6 space-y-5">
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
            <p className="mt-2 font-semibold">{selected.weekday} · {selected.start}–{selected.end} · €{Number(feeAmount===''?selected.fee:feeAmount||0).toFixed(2)} · {selected.payment==='cash'?'cash on arrival':'SumUp'}</p>
          </div>
          <a href={selected.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-primary"><MapPin className="h-4 w-4"/> Google Maps <ExternalLink className="h-3.5 w-3.5"/></a>
        </div>
      </div>}

      <Button onClick={createSession} disabled={busy==='create'||!templateKey||!sessionDate} className="gap-2">
        {busy==='create'?<RefreshCw className="h-4 w-4 animate-spin"/>:<CalendarCheck className="h-4 w-4"/>}
        {busy==='create'?'Creating…':'Create & copy booking link'}
      </Button>
    </section>

    <section className="space-y-3">
      <div><h2 className="text-lg font-black">Guest sessions</h2><p className="mt-1 text-xs text-muted-foreground">Each link is tied to one date/time, so you always know exactly where the guest is booked.</p></div>
      {sessions.length===0?<div className="glass rounded-2xl p-6 text-sm text-muted-foreground">No guest booking links have been created yet.</div>:sessions.map(s=>{
        const url=`${window.location.origin}/book/${s.token}`;
        const confirmed=(s.bookings||[]).filter(b=>['confirmed','cash_due'].includes(b.bookingStatus)).length;
        return <div key={s.id} className="glass rounded-2xl p-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black">{niceDate(s.sessionDate)} · {s.startTime}{s.endTime?`–${s.endTime}`:''}</h3>
                <Badge variant="outline">{s.active?'Open':'Closed'}</Badge>
                <Badge variant="outline">{confirmed} guest{confirmed===1?'':'s'}</Badge>
              </div>
              <p className="mt-2 font-semibold">{s.venueName}</p>
              <p className="text-sm text-muted-foreground">{s.venueAddress}, {s.eircode}</p>
              <p className="mt-1 text-xs text-muted-foreground">€{Number(s.feeAmount).toFixed(2)} · {s.paymentMethod==='cash'?'Cash on arrival':'SumUp online payment'}{s.capacity?` · Capacity ${s.capacity}`:''}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={busy===`magic-${s.id}`} onClick={()=>createMagicLink(s)}>{busy===`magic-${s.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<Copy className="mr-1.5 h-3.5 w-3.5"/>}Create private link</Button>
              <Button size="sm" variant="outline" disabled={busy===`invite-${s.id}`} onClick={()=>emailInvite(s)}>{busy===`invite-${s.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<Mail className="mr-1.5 h-3.5 w-3.5"/>}Email booking link</Button>
              <Button size="sm" variant="outline" onClick={()=>shareWhatsApp(url,s)}><MessageCircle className="mr-1.5 h-3.5 w-3.5"/>WhatsApp</Button>
              <a href={s.mapsUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><MapPin className="mr-1.5 h-3.5 w-3.5"/>Map</Button></a>
              {s.active&&<Button size="sm" variant="ghost" className="text-destructive" disabled={busy===`close-${s.id}`} onClick={()=>closeSession(s.id)}><XCircle className="mr-1.5 h-3.5 w-3.5"/>Close link</Button>}
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
                    <Badge variant="outline" className={b.paymentStatus==='paid'?'border-green-500/40 text-green-600':b.paymentStatus==='cash_due'?'border-amber-500/40 text-amber-600':''}>{b.paymentStatus}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{b.email} · {b.mobile}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Ref {b.confirmationCode} · booked {b.registeredAt?new Date(b.registeredAt).toLocaleString('en-IE'):''}</p>
                  {Number(b.refundedAmount||0)>0&&<p className="mt-1 text-xs font-semibold text-amber-600">€{Number(b.refundedAmount).toFixed(2)} refunded · €{Number(b.refundableAmount||0).toFixed(2)} remaining refundable</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={()=>copy(b.hostMessage,'Host WhatsApp message copied')}><Copy className="mr-1.5 h-3.5 w-3.5"/>Copy host message</Button>
                  {b.paymentMethod==='sumup'&&!['paid','partially_refunded','refunded'].includes(b.paymentStatus)&&<Button size="sm" variant="outline" disabled={busy===`verify-${b.id}`} onClick={()=>verifyPayment(b.id)}>{busy===`verify-${b.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<ShieldCheck className="mr-1.5 h-3.5 w-3.5"/>}Verify payment</Button>}
                  {['paid','partially_refunded','refunded'].includes(b.paymentStatus)&&<Button size="sm" variant="outline" disabled={busy===`email-${b.id}`} onClick={()=>resendEmails(b.id)}>{busy===`email-${b.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<Mail className="mr-1.5 h-3.5 w-3.5"/>}Resend emails</Button>}
                  {b.paymentMethod!=='cash'&&['paid','partially_refunded'].includes(b.paymentStatus)&&Number(b.refundableAmount||0)>0&&<Button size="sm" variant="outline" disabled={busy===`refund-${b.id}`} onClick={()=>issueRefund(b)}>{busy===`refund-${b.id}`?<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<RotateCcw className="mr-1.5 h-3.5 w-3.5"/>}Refund</Button>}
                  {b.paymentMethod==='cash'&&b.paymentStatus!=='paid'&&<Button size="sm" variant="outline" disabled={busy===`cash-${b.id}`} onClick={()=>markCashPaid(b.id)}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5"/>Mark cash paid</Button>}
                </div>
              </div>
            </div>)}
          </div>}
        </div>;
      })}
    </section>
  </div>;
}