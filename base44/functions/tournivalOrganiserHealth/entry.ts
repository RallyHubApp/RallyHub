import {createClientFromRequest} from 'npm:@base44/sdk@0.8.29';
import {reviewTournivalOrganiserHealth} from './healthReview.ts';
import {canReviewTournivalHealth} from './accessPolicy.ts';
const clean=(v:any)=>String(v??'').trim().slice(0,160);
Deno.serve(async(req)=>{
 if(req.method!=='POST')return Response.json({error:'POST required'},{status:405});
 try{
  const base44=createClientFromRequest(req),user=await base44.auth.me();
  if(!user)return Response.json({error:'Authentication required'},{status:401});
  const body=await req.json().catch(()=>({}));
  if(body.action!=='review')return Response.json({error:'Read-only review only'},{status:403});
  const tenantId=clean(body.tenantId),clubId=clean(body.clubId),tournamentId=clean(body.tournamentId);
  if(!tenantId||!clubId||!tournamentId)return Response.json({error:'Tenant, club and tournament required'},{status:400});
  const grants=await base44.asServiceRole.entities.ClubUserAccess.filter({tenant_id:tenantId,club_id:clubId,user_id:user.id,status:'active',permission_bundle:'club_admin'},'-updated_date',20);
  const allowed=canReviewTournivalHealth(user,grants,tenantId,clubId);
  if(!allowed)return Response.json({error:'Club administrator required'},{status:403});
  const tournaments=await base44.asServiceRole.entities.Tournament.filter({id:tournamentId,tenant_id:tenantId,host_club_id:clubId},'-created_date',2);
  if(!Array.isArray(tournaments)||tournaments.length!==1||String(tournaments[0].format).toLowerCase()!=='tournival')
   return Response.json({error:'Tournival not found in authorised club'},{status:404});
  const sessions=await base44.asServiceRole.entities.TournivalSession.filter({tournament_id:tournamentId,tenant_id:tenantId},'-created_at',10);
  if(!Array.isArray(sessions)||sessions.length>=10)return Response.json({error:'Complete session inventory unavailable',code:'TOURNIVAL_SESSION_INVENTORY_INCOMPLETE'},{status:503});
  return Response.json({success:true,review:reviewTournivalOrganiserHealth(tournaments[0],sessions)});
 }catch(error){console.error('Tournival organiser health read failed',error instanceof Error?error.message:'unknown');return Response.json({error:'Unable to verify organiser health safely'},{status:500});}
});
