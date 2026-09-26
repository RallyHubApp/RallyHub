import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean=(value:any,max=240)=>String(value??'').trim().slice(0,max);
const PUBLIC_LEGAL_TYPES=new Set(['liability_waiver','code_of_conduct']);

function safeLegal(doc:any){
  return {
    id:doc.id,
    source:'legal_document',
    type:doc.document_type,
    title:doc.title,
    version:doc.version,
    bodyText:doc.body_text,
    effectiveFrom:doc.effective_from||null,
    reviewDueOn:null,
    jurisdiction:'Ireland',
  };
}
function safePolicy(doc:any){
  return {
    id:doc.id,
    source:'club_policy',
    type:doc.policy_type,
    title:doc.title,
    version:doc.version,
    bodyText:doc.body_text,
    effectiveFrom:doc.effective_from||null,
    reviewDueOn:doc.review_due_on||null,
    jurisdiction:doc.jurisdiction||null,
  };
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'public_get',40);

    if(action==='public_get'){
      const clubSlug=clean(body.clubSlug,180).toLowerCase();
      if(!clubSlug) return Response.json({error:'Club is required.'},{status:400});
      const clubs=await base44.asServiceRole.entities.Club.filter({slug:clubSlug,status:'active'},'-updated_date',5);
      const club=clubs?.[0];
      if(!club) return Response.json({error:'No RallyHub policy library is published for this club.'},{status:404});

      const [legalDocs,policies]=await Promise.all([
        base44.asServiceRole.entities.ClubLegalDocument.filter({tenant_id:club.tenant_id,club_id:club.id,active:true},'-effective_from',100),
        base44.asServiceRole.entities.ClubPolicy.filter({tenant_id:club.tenant_id,club_id:club.id,status:'active',public_visible:true},'policy_type',100)
      ]);
      const legal=(legalDocs||[]).filter((doc:any)=>PUBLIC_LEGAL_TYPES.has(String(doc.document_type||''))).map(safeLegal);
      const policyRows=(policies||[]).filter((doc:any)=>!doc.is_sample_template).map(safePolicy);
      const documents=[...legal,...policyRows].sort((a:any,b:any)=>String(a.title||'').localeCompare(String(b.title||''),'en',{sensitivity:'base'}));
      return Response.json({
        success:true,
        club:{
          id:club.id,
          name:club.name,
          slug:club.slug,
          logo_url:club.logo_url||'',
          primary_colour:club.primary_colour||'',
          secondary_colour:club.secondary_colour||'',
        },
        documents,
        count:documents.length,
        note:'Published club policies and participation documents. Event-specific or membership-specific terms may also be shown in the relevant registration flow.'
      });
    }

    return Response.json({error:'Unknown policy library action.'},{status:400});
  }catch(error:any){
    console.error('[clubPolicyLibrary]',error?.message||String(error));
    return Response.json({error:error?.message||'Policy library request failed.'},{status:error?.status||500});
  }
});
