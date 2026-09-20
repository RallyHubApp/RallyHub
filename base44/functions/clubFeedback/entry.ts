import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean=(v:any,max=500)=>String(v??'').trim().slice(0,max);
const TYPES=new Set(['issue','confusing','improvement','feature_request','other']);
const AREAS=new Set(['directory','club_profile','sessions_venues','login_access','rallyhub_club','competitions','other']);
const IMPORTANCE=new Set(['nice_to_have','important','blocking']);
const STATUSES=new Set(['new','reviewing','wishlist','planned','in_progress','completed','closed']);

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me();
    if(!user) return Response.json({error:'Sign in required'},{status:401});
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action,40);

    if(action==='submit'){
      const listingSlug=clean(body.listingSlug,220);
      const clubName=clean(body.clubName,180);
      const message=clean(body.message,5000);
      const feedbackType=TYPES.has(body.feedbackType)?body.feedbackType:'other';
      const area=AREAS.has(body.area)?body.area:'other';
      const importance=IMPORTANCE.has(body.importance)?body.importance:'nice_to_have';
      if(!listingSlug||!clubName||!message) return Response.json({error:'Club and feedback are required'},{status:400});

      if(user.role!=='admin'){
        const access=await base44.asServiceRole.entities.DirectoryListingAccess.filter({
          listing_slug:listingSlug,user_id:user.id,status:'active'
        },'-created_date',10);
        if(!access?.length) return Response.json({error:'Verified Directory access required'},{status:403});
      }

      const now=new Date().toISOString();
      const row=await base44.asServiceRole.entities.ClubFeedback.create({
        user_id:user.id,
        person_name:clean(user.full_name||user.display_name||user.email,180),
        person_email:clean(user.email,240).toLowerCase(),
        listing_slug:listingSlug,
        club_name:clubName,
        feedback_type:feedbackType,
        area,
        message,
        importance,
        contact_ok:body.contactOk!==false,
        page_path:clean(body.pagePath,500),
        device_type:clean(body.deviceType,40),
        user_agent:clean(body.userAgent,800),
        status:'new',
        submitted_at:now,
        updated_at:now
      });
      return Response.json({success:true,id:row.id});
    }

    if(action==='my_list'){
      const listingSlug=clean(body.listingSlug,220);
      const rows=await base44.asServiceRole.entities.ClubFeedback.filter({
        user_id:user.id,listing_slug:listingSlug
      },'-submitted_at',100);
      return Response.json({success:true,rows});
    }

    if(action==='admin_list'){
      if(user.role!=='admin') return Response.json({error:'Admin access required'},{status:403});
      const rows=await base44.asServiceRole.entities.ClubFeedback.list('-submitted_at',500);
      return Response.json({success:true,rows});
    }

    if(action==='admin_update'){
      if(user.role!=='admin') return Response.json({error:'Admin access required'},{status:403});
      const feedbackId=clean(body.feedbackId,120);
      const status=STATUSES.has(body.status)?body.status:null;
      if(!feedbackId||!status) return Response.json({error:'Feedback item and valid status are required'},{status:400});
      const rows=await base44.asServiceRole.entities.ClubFeedback.filter({id:feedbackId});
      if(!rows?.[0]) return Response.json({error:'Feedback item not found'},{status:404});
      const now=new Date().toISOString();
      await base44.asServiceRole.entities.ClubFeedback.update(feedbackId,{
        status,
        admin_note:clean(body.adminNote,3000)||null,
        updated_by_user_id:user.id,
        updated_at:now
      });
      return Response.json({success:true,status,updatedAt:now});
    }

    return Response.json({error:'Unknown action'},{status:400});
  }catch(error){
    return Response.json({error:error?.message||'Unexpected error'},{status:500});
  }
});