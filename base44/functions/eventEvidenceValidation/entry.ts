import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// Read-only evidence report. No entity write operations are permitted here.
const norm=(v:unknown)=>String(v??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const date=(v:unknown)=>String(v??'').slice(0,10);
const source=(v:unknown)=>{try{const u=new URL(String(v??''));if(!['https:','http:'].includes(u.protocol))return '';return u.hostname.toLowerCase().replace(/^www\./,'')+u.pathname.replace(/\/$/,'').toLowerCase()}catch{return ''}};
const record=(e:any)=>({id:e.id,name:e.name,start_date:e.start_date,end_date:e.end_date,location:e.location,event_source_url:e.event_source_url,event_publish_status:e.event_publish_status,event_status_override:e.event_status_override,event_slug:e.event_slug});
const compare=(a:any,b:any)=>{
 const evidence={name:!!norm(a.name)&&norm(a.name)===norm(b.name),start_date:!!date(a.start_date)&&date(a.start_date)===date(b.start_date),end_date:!!date(a.end_date)&&date(a.end_date)===date(b.end_date),venue:!!norm(a.location)&&norm(a.location)===norm(b.location),source_url:!!source(a.event_source_url)&&source(a.event_source_url)===source(b.event_source_url)};
 const sameEvent=evidence.name&&evidence.start_date&&(evidence.venue||evidence.source_url);
 const conflict=(evidence.source_url&&!evidence.start_date)||(evidence.name&&evidence.start_date&&!evidence.venue&&!!norm(a.location)&&!!norm(b.location));
 return {classification:sameEvent?'VERIFIED_DUPLICATE':conflict?'CONFLICT_REVIEW':'NO_MATCH',evidence};
};
Deno.serve(async(req)=>{
 try{
  if(req.method!=='POST')return Response.json({error:'POST required'},{status:405});
  const sdk=createClientFromRequest(req);const user=await sdk.auth.me();
  if(!user||user.role!=='admin')return Response.json({error:'Admin authentication required'},{status:403});
  const body=await req.json().catch(()=>({}));
  if(body.action!=='verify')return Response.json({error:'Only read-only verify action supported'},{status:400});
  const events:any[]=[];const pageSize=500;let complete=false;
  for(let page=0;page<20;page++){
   const batch=await sdk.asServiceRole.entities.Tournament.list('-created_date',pageSize,page*pageSize);
   if(!Array.isArray(batch))throw Error('Tournament query did not return records');
   events.push(...batch);
   if(batch.length<pageSize){complete=true;break}
  }
  if(!complete)return Response.json({success:false,verification:'INCOMPLETE',reason:'Pagination safety limit reached; no complete-database claims permitted',records_read:events.length},{status:409});
  const findings:any[]=[];
  for(let i=0;i<events.length;i++)for(let j=i+1;j<events.length;j++){
   if(!events[i].id||!events[j].id||events[i].id===events[j].id)continue;
   const match=compare(events[i],events[j]);
   if(match.classification!=='NO_MATCH')findings.push({...match,records:[record(events[i]),record(events[j])]});
  }
  return Response.json({success:true,verification:'COMPLETE',read_only:true,checked_at:new Date().toISOString(),records_read:events.length,verified_duplicates:findings.filter(x=>x.classification==='VERIFIED_DUPLICATE').length,conflicts:findings.filter(x=>x.classification==='CONFLICT_REVIEW').length,findings});
 }catch(e){console.error('eventEvidenceValidation',e);return Response.json({success:false,verification:'FAILED',error:'Unable to complete evidence verification'},{status:500})}
});
