import {createClientFromRequest} from 'npm:@base44/sdk@0.8.48';
import {validRatingEnvelope} from './ratingEnvelope.ts';
/** Only the independent DUPR UAT webhook. Not installed in production. */
Deno.serve(async req=>{
 const secret=Deno.env.get('DUPR_UAT_WEBHOOK_KEY')||'';
 const clientId=Deno.env.get('DUPR_CLIENT_ID')||'';
 if(!secret||!clientId)return Response.json({error:'UAT webhook not configured'},{status:503});
 const provided=new URL(req.url).searchParams.get('key')||'';
 const enc=new TextEncoder();
 const a=enc.encode(provided),b=enc.encode(secret);
 let mismatch=a.length^b.length;
 for(let i=0;i<Math.max(a.length,b.length);i++)mismatch|=(a[i]||0)^(b[i]||0);
 if(mismatch!==0)return Response.json({error:'Unauthorized'},{status:401});
 // DUPR registration requires a prompt HTTPS 200 to its handshake.
 if(req.method==='GET')return Response.json({success:true,environment:'uat'});
 if(req.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
 let payload:any;
 try{payload=await req.json();}catch{return Response.json({error:'Invalid JSON'},{status:400});}
 if(payload?.event==='TEST'&&payload?.clientId===clientId)return Response.json({success:true,handshake:true});
 if(!validRatingEnvelope(payload,clientId))return Response.json({error:'Invalid DUPR rating envelope'},{status:400});
 const msg=payload.message||{};
 if(!/^[A-Za-z0-9]{6,12}$/.test(String(msg.duprId)))return Response.json({error:'Invalid DUPR ID'},{status:400});
 const base44=createClientFromRequest(req);
 const matched=await base44.asServiceRole.entities.DuprUatConnection.filter({dupr_id:msg.duprId,status:'connected'},'-verified_at',10);
 if(!matched?.length)return Response.json({success:true,ignored:true});
 const raw=JSON.stringify({clientId:payload.clientId,event:payload.event,message:msg});
 const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(raw)));
 const digest=Array.from(bytes).map(x=>x.toString(16).padStart(2,'0')).join('');
 const existing=await base44.asServiceRole.entities.DuprRatingUatAudit.filter({event_id:digest},'-created_date',1);
 if(existing?.length)return Response.json({success:true,duplicate:true});
 const rating=msg.rating||{};
 const number=(value:any)=>{
  const n=Number(value);
  return value==null||value===''||!Number.isFinite(n)?undefined:n;
 };
 const snapshot:any={
  event_id:digest,provider_id:String(msg.duprId),topic:String(payload.event),
  observed_at:new Date(typeof msg.timestamp==='number'?msg.timestamp*1000:Date.now()).toISOString(),
  connection_slot:String(matched[0].test_slot||''),
  raw_json:JSON.stringify({rating:msg.rating??null,metrics:msg.metrics??null}).slice(0,16000)
 };
 const singles=number(rating.singles),doubles=number(rating.doubles);
 if(singles!==undefined)snapshot.singles=singles;
 if(doubles!==undefined)snapshot.doubles=doubles;
 await base44.asServiceRole.entities.DuprRatingUatAudit.create(snapshot);
 return Response.json({success:true,environment:'uat'});
});
