import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
const clean=(v:any,n=500)=>String(v??'').trim().slice(0,n);
const norm=(v:any)=>clean(v).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const urlKey=(v:any)=>{try{const u=new URL(clean(v,1000));return u.protocol==='https:'?u.hostname.toLowerCase().replace(/^www\./,'')+u.pathname.replace(/\/$/,'').toLowerCase():''}catch{return ''}};
const same=(a:any,b:any)=>{
 const sourceA=urlKey(a.event_source_url||a.source_url),sourceB=urlKey(b.event_source_url||b.source_url);
 const exactUrl=!!sourceA&&sourceA===sourceB&&!sourceA.endsWith('/events');
 const dateA=String(a.start_date||'').slice(0,10),dateB=String(b.start_date||'').slice(0,10);
 const sameNameDate=!!dateA&&dateA===dateB&&norm(a.name)===norm(b.name);
 return exactUrl||sameNameDate;
};
Deno.serve(async req=>{
 try{
  const b=createClientFromRequest(req),user=await b.auth.me();
  if(!user||user.role!=='admin')return Response.json({error:'Super Admin only'},{status:403});
  const body=await req.json().catch(()=>({}));const action=clean(body.action,30);
  if(action==='list'){
   const [candidates,events]=await Promise.all([b.asServiceRole.entities.EventDiscoveryCandidate.list('-created_date',200),b.asServiceRole.entities.Tournament.list('-created_date',1000)]);
   return Response.json({success:true,candidates:candidates.map((c:any)=>({...c,duplicateEventId:events.find((e:any)=>e.status!=='Archived'&&same(c,e))?.id||null}))});
  }
  if(action==='propose'){
   const name=clean(body.name,240),start_date=clean(body.start_date,50),source_url=clean(body.source_url,1000);
   if(!name||!/^\d{4}-\d\d-\d\d/.test(start_date)||!urlKey(source_url))return Response.json({error:'Name, valid date and HTTPS official source required'},{status:400});
   const [events,candidates]=await Promise.all([b.asServiceRole.entities.Tournament.list('-created_date',1000),b.asServiceRole.entities.EventDiscoveryCandidate.list('-created_date',500)]);
   const proposal={name,start_date,source_url};
   const duplicate=events.find((e:any)=>e.status!=='Archived'&&same(proposal,e));
   if(duplicate)return Response.json({success:false,duplicate:true,existingEventId:duplicate.id},{status:409});
   const prior=candidates.find((c:any)=>same(proposal,c));
   if(prior)return Response.json({success:false,alreadyReviewed:true,status:prior.status,candidateId:prior.id},{status:409});
   const record=await b.asServiceRole.entities.EventDiscoveryCandidate.create({...proposal,end_date:clean(body.end_date,50),location:clean(body.location,400),country:clean(body.country,120)||'Ireland',organiser:clean(body.organiser,240),poster_url:clean(body.poster_url,1000),category:clean(body.category,80)||'other',status:'pending',notes:clean(body.notes,1000)});
   return Response.json({success:true,candidate:record});
  }
  if(action==='decide'){
   const id=clean(body.id,180),decision=clean(body.decision,30);
   if(!['held','rejected','approved'].includes(decision))return Response.json({error:'Invalid decision'},{status:400});
   const c=(await b.asServiceRole.entities.EventDiscoveryCandidate.filter({id},'-created_date',1))?.[0];
   if(!c)return Response.json({error:'Proposal not found'},{status:404});
   if(c.status==='approved'||c.status==='rejected')return Response.json({error:'Already decided',status:c.status},{status:409});
   if(decision!=='approved'){
    const updated=await b.asServiceRole.entities.EventDiscoveryCandidate.update(id,{status:decision,decision_by:user.id,decision_at:new Date().toISOString()});
    return Response.json({success:true,candidate:updated});
   }
   const events=await b.asServiceRole.entities.Tournament.list('-created_date',1000);
   const duplicate=events.find((e:any)=>e.status!=='Archived'&&same(c,e));
   if(duplicate){await b.asServiceRole.entities.EventDiscoveryCandidate.update(id,{status:'duplicate',matched_event_id:duplicate.id,decision_by:user.id,decision_at:new Date().toISOString()});return Response.json({error:'Event already exists; no duplicate created',existingEventId:duplicate.id},{status:409})}
   // Publishing requires an explicit valid host/tenant identity; never fabricate ownership.
   const host=clean(body.host_club_id,180),tenant=clean(body.tenant_id,180);
   if(!host||!tenant)return Response.json({error:'Choose an existing host club and tenant before approving publication'},{status:400});
   const clubs=await b.asServiceRole.entities.Club.filter({id:host,tenant_id:tenant,status:'active'},'-created_date',1);
   if(!clubs?.length)return Response.json({error:'Host club and tenant do not match'},{status:400});
   const slug=norm(c.name).replace(/\s+/g,'-').slice(0,100)+'-'+String(c.start_date).slice(0,10);
   const event=await b.asServiceRole.entities.Tournament.create({name:c.name,start_date:c.start_date,end_date:c.end_date||c.start_date,location:c.location||'',event_country:c.country||'Ireland',event_category:c.category||'other',event_slug:slug,event_source_url:c.source_url,event_image_url:c.poster_url||'',event_public_visible:true,event_member_visible:false,event_publish_status:'published',event_published_at:new Date().toISOString(),event_verified_organiser:false,status:'Published',format:'Event',tenant_id:tenant,host_club_id:host});
   await b.asServiceRole.entities.EventDiscoveryCandidate.update(id,{status:'approved',published_event_id:event.id,decision_by:user.id,decision_at:new Date().toISOString()});
   return Response.json({success:true,publishedEventId:event.id});
  }
  return Response.json({error:'Unknown action'},{status:400});
 }catch(e){console.error('eventDiscoveryApproval',e);return Response.json({error:'Event approval operation failed'},{status:500})}
});
