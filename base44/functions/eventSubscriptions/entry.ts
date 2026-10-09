import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';
import { sendWithConfiguredEmailTransport } from '../eventInterest/emailRouter.ts';
const emailOK=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const token=()=>crypto.randomUUID()+crypto.randomUUID();
const base='https://rallyhub.ie/events';
Deno.serve(async(req)=>{
 try {
  const b=createClientFromRequest(req),body=await req.json().catch(()=>({})),action=String(body.action||'');
  const entity=b.asServiceRole.entities.EventCalendarSubscriber;
  if(action==='subscribe'){
   if(body.website) return Response.json({success:true});
   const email=String(body.email||'').trim().toLowerCase();
   if(!emailOK(email)||email.length>254) return Response.json({error:'Valid email required'},{status:400});
   if(body.consent!==true) return Response.json({error:'Please agree to receive RallyHub event updates'},{status:400});
   const existing=await entity.filter({email},'-updated_date',1);
   if(existing[0]?.status==='active') return Response.json({success:true,alreadySubscribed:true});
   const now=new Date().toISOString(),confirm=token(),unsubscribe=token();
   const data={email,status:'pending',confirmation_token:confirm,unsubscribe_token:unsubscribe,consent_version:'events-v1',consent_at:now,source_event_id:String(body.eventId||'').slice(0,120),topics:['events']};
   const record=existing[0];
   if(record) await entity.update(record.id,data);else await entity.create(data);
   const url=`${base}?subscription=confirm&token=${encodeURIComponent(confirm)}`;
   try{await sendWithConfiguredEmailTransport(b,{scopeType:'platform',purpose:'directory'},{to:email,senderName:'RallyHub Events',subject:'Confirm your RallyHub event updates',textBody:`Confirm your RallyHub event updates by opening:\n${url}\n\nIf you did not request this, ignore this email.\n\nTo unsubscribe at any time: ${base}?subscription=unsubscribe&token=${encodeURIComponent(unsubscribe)}`});}
   catch(e){return Response.json({error:'Confirmation email could not be sent. Please try again later.'},{status:503});}
   return Response.json({success:true,pending:true});
  }
  if(action==='confirm'||action==='unsubscribe'){
   const value=String(body.token||'');if(value.length<40||value.length>180)return Response.json({error:'Invalid link'},{status:400});
   const key=action==='confirm'?'confirmation_token':'unsubscribe_token';
   const matches=await entity.filter({[key]:value},'-updated_date',1),record=matches[0];
   if(!record)return Response.json({error:'Link expired or invalid'},{status:404});
   if(action==='confirm'){
    if(record.status==='unsubscribed')return Response.json({error:'Subscription is inactive; please subscribe again'},{status:409});
    await entity.update(record.id,{status:'active',confirmed_at:new Date().toISOString(),confirmation_token:''});
   }else await entity.update(record.id,{status:'unsubscribed',unsubscribed_at:new Date().toISOString(),confirmation_token:'',unsubscribe_token:''});
   return Response.json({success:true,status:action==='confirm'?'active':'unsubscribed'});
  }
  return Response.json({error:'Unknown action'},{status:400});
 }catch(e){console.error('eventSubscriptions failed',e);return Response.json({error:'Subscription service unavailable'},{status:500});}
});
