import React,{useState} from 'react';
import {useParams} from 'react-router-dom';
import EventRegistrationDialog from '@/components/events/EventRegistrationDialog';
export default function PrivateEventBooking(){
 const {eventId,token}=useParams();const [open,setOpen]=useState(true);
 if(!/^[a-f0-9]{64}$/.test(token||''))return <main className="mx-auto max-w-xl p-8">Invalid invitation link.</main>;
 return <main className="mx-auto max-w-xl space-y-5 p-8"><h1 className="text-2xl font-bold">Clare Pickleball · Private event booking</h1><p>Complete the existing RallyHub registration and consents to reserve your place. Payment is securely processed by SumUp.</p><button type="button" className="rounded bg-blue-800 px-5 py-3 text-white" onClick={()=>setOpen(true)}>Book now</button><EventRegistrationDialog event={{id:eventId,name:'Clare Pickleball event'}} invitationToken={token} open={open} onOpenChange={setOpen}/></main>;
}
