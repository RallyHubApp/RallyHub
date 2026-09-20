import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean=(v:any,max=500)=>String(v??'').trim().slice(0,max);

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
      const contactName=clean(body.contactName || user.full_name || user.display_name,160);
      const contactEmail=clean(body.contactEmail || user.email,240).toLowerCase();
      const contactPhone=clean(body.contactPhone || user.directory_mobile,80);
      const interestType=['demo','information','notify'].includes(body.interestType) ? body.interestType : 'notify';
      const features=Array.isArray(body.features) ? body.features.map((x:any)=>clean(x,80)).filter(Boolean).slice(0,20) : [];
      const notes=clean(body.notes,1200);
      if(!listingSlug || !clubName || !contactEmail) return Response.json({error:'Club and contact email are required'},{status:400});

      const existing=await base44.asServiceRole.entities.RallyHubClubInterest.filter({
        user_id:user.id, listing_slug:listingSlug, status:'waiting'
      },'-created_date',10);
      const firstName=(contactName || user.full_name || user.display_name || 'there').trim().split(/\s+/)[0] || 'there';
      if(existing?.[0]){
        await base44.asServiceRole.entities.RallyHubClubInterest.update(existing[0].id,{
          club_name:clubName, contact_name:contactName, contact_email:contactEmail,
          contact_phone:contactPhone || null, interest_type:interestType, features, notes:notes || null,
          submitted_at:new Date().toISOString()
        });
        return Response.json({
          success:true,alreadyJoined:true,id:existing[0].id,firstName,
          message:`Thanks, ${firstName}. We appreciate your interest in RallyHub Club. We’ll keep you updated when demos or further information become available.`
        });
      }

      const row=await base44.asServiceRole.entities.RallyHubClubInterest.create({
        user_id:user.id, listing_slug:listingSlug, club_name:clubName,
        contact_name:contactName, contact_email:contactEmail, contact_phone:contactPhone || null,
        interest_type:interestType, features, notes:notes || null, status:'waiting',
        submitted_at:new Date().toISOString()
      });
      return Response.json({
        success:true,id:row.id,firstName,
        message:`Thanks, ${firstName}. We appreciate your interest in RallyHub Club. We’ll keep you updated when demos or further information become available.`
      });
    }

    if(action==='status'){
      const listingSlug=clean(body.listingSlug,220);
      const rows=await base44.asServiceRole.entities.RallyHubClubInterest.filter({
        user_id:user.id, listing_slug:listingSlug, status:'waiting'
      },'-created_date',10);
      return Response.json({success:true,joined:!!rows?.length,interest:rows?.[0]||null});
    }

    if(action==='list_admin'){
      if(user.role!=='admin') return Response.json({error:'Admin access required'},{status:403});
      const rows=await base44.asServiceRole.entities.RallyHubClubInterest.list('-submitted_at',300);
      return Response.json({success:true,rows});
    }

    return Response.json({error:'Unknown action'},{status:400});
  }catch(error){
    return Response.json({error:error?.message||'Unexpected error'},{status:500});
  }
});