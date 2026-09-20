import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean=(v:any,max=2000)=>String(v??'').trim().slice(0,max);
const firstName=(v:any)=>clean(v,160).split(/\s+/).filter(Boolean)[0] || 'there';

Deno.serve(async (req)=>{
  try{
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me();
    if(!user) return Response.json({error:'Sign in required'},{status:401});
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action,40);

    if(action==='submit'){
      const listingSlug=clean(body.listingSlug,220);
      const clubName=clean(body.clubName,180);
      const category=['bug','confusing','improvement','feature_request','other'].includes(body.category) ? body.category : 'other';
      const importance=['nice_to_have','important','blocking'].includes(body.importance) ? body.importance : 'important';
      const message=clean(body.message,4000);
      const area=clean(body.area,160);
      const contactOk=body.contactOk !== false;
      if(!listingSlug || !clubName || !message) return Response.json({error:'Club and feedback are required'},{status:400});

      const accesses=await base44.asServiceRole.entities.DirectoryListingAccess.filter({listing_slug:listingSlug,user_id:user.id,status:'active'});
      if(user.role!=='admin' && !accesses?.length) return Response.json({error:'Directory management access required'},{status:403});

      const personName=clean(user.full_name || user.display_name || user.email,160);
      const row=await base44.asServiceRole.entities.RallyHubFeedback.create({
        user_id:user.id,
        listing_slug:listingSlug,
        club_name:clubName,
        person_name:personName,
        person_email:clean(user.email,240).toLowerCase(),
        person_phone:clean(user.directory_mobile,80) || null,
        category,
        area:area || null,
        message,
        importance,
        contact_ok:contactOk,
        page_path:clean(body.pagePath,300) || null,
        user_agent:clean(body.userAgent,700) || null,
        status:'new',
        submitted_at:new Date().toISOString(),
        updated_at:new Date().toISOString(),
      });
      return Response.json({
        success:true,
        id:row.id,
        firstName:firstName(personName),
        message:`Thanks, ${firstName(personName)}. We appreciate your feedback. We’ll review it and make sure it is directed to the right place, whether that’s a fix, an improvement or our RallyHub development wishlist.`
      });
    }

    if(action==='my_list'){
      const listingSlug=clean(body.listingSlug,220);
      const rows=await base44.asServiceRole.entities.RallyHubFeedback.filter({user_id:user.id,listing_slug:listingSlug},'-submitted_at',100);
      return Response.json({success:true,rows});
    }

    if(action==='list_admin'){
      if(user.role!=='admin') return Response.json({error:'Admin access required'},{status:403});
      const rows=await base44.asServiceRole.entities.RallyHubFeedback.list('-submitted_at',500);
      return Response.json({success:true,rows});
    }

    if(action==='update_admin'){
      if(user.role!=='admin') return Response.json({error:'Admin access required'},{status:403});
      const feedbackId=clean(body.feedbackId,120);
      const rows=await base44.asServiceRole.entities.RallyHubFeedback.filter({id:feedbackId});
      const row=rows?.[0];
      if(!row) return Response.json({error:'Feedback item not found'},{status:404});
      const status=['new','reviewing','planned','in_progress','completed','closed'].includes(body.status) ? body.status : row.status;
      await base44.asServiceRole.entities.RallyHubFeedback.update(row.id,{
        status,
        admin_notes:clean(body.adminNotes,3000) || null,
        admin_reply:clean(body.adminReply,3000) || null,
        updated_at:new Date().toISOString(),
      });
      return Response.json({success:true});
    }

    return Response.json({error:'Unknown action'},{status:400});
  }catch(error){
    return Response.json({error:error?.message||'Unexpected error'},{status:500});
  }
});