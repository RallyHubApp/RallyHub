import {createClientFromRequest} from 'npm:@base44/sdk@0.8.51';
Deno.serve(async req=>{
 try{
 const b=createClientFromRequest(req),u=await b.auth.me();if(!u)return Response.json({canEdit:false},{status:401});
 const body=await req.json().catch(()=>({}));const id=String(body.eventId||'').trim();if(!id)return Response.json({canEdit:false},{status:400});
 const rows=await b.asServiceRole.entities.Tournament.filter({id},'-created_date',1);const event=rows?.[0];if(!event)return Response.json({canEdit:false},{status:404});
 const admin=u.role==='admin';const clubAdmin=u.active_club_role==='club_admin'&&u.active_club_id===event.host_club_id&&u.active_tenant_id===event.tenant_id;
 let directoryEditor=false;
 if(!admin&&!clubAdmin&&event.host_club_id){const listing=await b.asServiceRole.entities.DirectoryListingRecord.filter({club_id:event.host_club_id},'-created_date',30).catch(()=>[]);for(const l of listing){const a=await b.asServiceRole.entities.DirectoryListingAccess.filter({listing_slug:l.slug,user_id:u.id,status:'active'},'-created_date',1).catch(()=>[]);if(a.length){directoryEditor=true;break}}}
 return Response.json({canEdit:admin||clubAdmin||directoryEditor,eventId:event.id,editUrl:admin||clubAdmin||directoryEditor?'/app/events?editEvent='+encodeURIComponent(event.id):null});
 }catch(e){console.error('eventEditAccess',e);return Response.json({canEdit:false},{status:500})}
});
