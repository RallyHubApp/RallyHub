import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const TYPES:any={
  privacy:'rallyhub_directory_privacy',
  terms:'rallyhub_directory_terms',
  cookies:'rallyhub_directory_cookies',
};
const clean=(value:any,max=60)=>String(value??'').trim().slice(0,max);

Deno.serve(async(req)=>{
  try {
    const input=await req.json().catch(()=>({}));
    const type=clean(input?.type);
    if(input?.action!=='public_get'||!Object.hasOwn(TYPES,type))
      return Response.json({error:'Unknown legal document.'},{status:400});
    const app=createClientFromRequest(req);
    const rows=await app.asServiceRole.entities.RallyHubLegalAgreement.filter({
      agreement_key:TYPES[type],status:'active'
    },'-approved_at',20);
    const published=(rows||[]).filter((r:any)=>r.approved_at&&r.approved_by_user_id&&!String(r.body_text||'').includes('INTERNAL APPROVAL'));
    const doc=published[0];
    if(!doc)return Response.json({error:'This policy has not yet been published.'},{status:404,headers:{'Cache-Control':'no-store'}});
    return Response.json({
      success:true,
      document:{title:doc.title,version:doc.version,effectiveFrom:doc.effective_from||null,bodyText:doc.body_text}
    },{headers:{'Cache-Control':'public,max-age=300'}});
  } catch(e) {
    console.error('directoryLegalDocuments:',e);
    return Response.json({error:'Legal documents are temporarily unavailable.'},{status:500});
  }
});
