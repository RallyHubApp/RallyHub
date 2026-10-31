import {createClientFromRequest} from 'npm:@base44/sdk@0.8.48';
const s=(v:any,n=180)=>String(v??'').trim().slice(0,n);
const types=new Set(['session','guest_session','taster','open_day','clinic','training','quick_play','tournament','tournival','kotc','interclub']);
const fail=(error:string,status=400)=>Response.json({success:false,error},{status});
Deno.serve(async req=>{
 if(req.method!=='POST')return fail('POST required',405);
 try{
  const sdk=createClientFromRequest(req),user=await sdk.auth.me().catch(()=>null);
  if(!user||user.role!=='admin')return fail('Admin access required',403);
  const tenant_id=s(user.active_tenant_id),club_id=s(user.active_club_id);
  if(!tenant_id||!club_id)return fail('Select a club',409);
  const body=await req.json().catch(()=>({})),entity=sdk.asServiceRole.entities.ClubActivity;
  if(body.action==='list')return Response.json({success:true,activities:await entity.filter({tenant_id,club_id},'-created_date',100)});
  if(body.action==='transition'){
   const id=s(body.id),to=s(body.to),revision=Number(body.expectedRevision);
   const record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record)return fail('Activity not found',404);
   if(!Number.isSafeInteger(revision)||record.revision!==revision)return fail('Activity changed; reload',409);
   const allowed:any={draft:['ready','cancelled'],ready:['draft','scheduled','cancelled'],scheduled:['cancelled'],cancelled:['archived']};
   if(!allowed[record.status]?.includes(to))return fail('Transition unavailable until downstream workflows are connected',409);
   if(to==='ready'||to==='scheduled'){
    const venue=(await sdk.asServiceRole.entities.Venue.filter({id:record.venue_id,tenant_id,club_id,status:'active'},'-created_date',1))?.[0];
    if(!venue)return fail('Club venue is no longer active',409);
    if(!Number.isFinite(Date.parse(record.starts_at))||Date.parse(record.ends_at)<=Date.parse(record.starts_at))return fail('Invalid schedule',409);
   }
   const updated=await entity.updateMany({id,tenant_id,club_id,status:record.status,revision},{$set:{status:to,revision:revision+1,updated_by_user_id:user.id}});
   if(updated.updated!==1)return fail('Activity changed; reload',409);
   return Response.json({success:true,id,status:to,revision:revision+1});
  }
  if(body.action!=='save_draft')return fail('Unsupported action');
  const f=body.draft||{},type=s(f.type),title=s(f.title,200),sport=s(f.sport),venue_id=s(f.venue_id);
  const starts_at=s(f.starts_at),ends_at=s(f.ends_at),capacity=Number(f.capacity);
  if(!types.has(type)||!title||!sport||!venue_id||!Number.isSafeInteger(capacity)||capacity<1)return fail('Invalid activity details');
  if(!Number.isFinite(Date.parse(starts_at))||!Number.isFinite(Date.parse(ends_at))||Date.parse(ends_at)<=Date.parse(starts_at))return fail('Invalid activity dates');
  const venues=await sdk.asServiceRole.entities.Venue.filter({id:venue_id,tenant_id,club_id,status:'active'},'-created_date',1);
  if(!venues?.length)return fail('Venue not in active club',403);
  const registration_mode=s(f.registration_mode||'approval'),payment_method=s(f.payment_method||'none');
  if(!['approval','automatic','closed'].includes(registration_mode)||!['none','cash','online'].includes(payment_method))return fail('Invalid policy');
  const payload={tenant_id,club_id,sport,type,title,venue_id,starts_at,ends_at,capacity,registration_mode,payment_method,host_user_id:s(f.host_user_id),communication_template_id:s(f.communication_template_id),updated_by_user_id:user.id};
  const id=s(body.id),revision=Number(body.expectedRevision);
  if(id){
   const existing=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!existing)return fail('Draft not found',404);
   if(existing.status!=='draft'||!Number.isSafeInteger(revision)||revision!==existing.revision)return fail('Draft changed; reload',409);
   const result=await entity.updateMany({id,tenant_id,club_id,status:'draft',revision},{$set:{...payload,revision:revision+1}});
   if(result.updated!==1)return fail('Draft changed; reload',409);
   return Response.json({success:true,id,revision:revision+1,status:'draft'});
  }
  const key=s(body.operationId,120);if(!key)return fail('Operation ID required');
  const prior=await entity.filter({tenant_id,club_id,idempotency_key:key},'-created_date',1);
  if(prior?.length)return Response.json({success:true,id:prior[0].id,revision:prior[0].revision,status:prior[0].status,reused:true});
  const created=await entity.create({...payload,status:'draft',revision:1,idempotency_key:key,created_by_user_id:user.id});
  return Response.json({success:true,id:created.id,revision:1,status:'draft'});
 }catch(e:any){return fail('Activity service unavailable',500)}
});
