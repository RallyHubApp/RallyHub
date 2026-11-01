import {createClientFromRequest} from 'npm:@base44/sdk@0.8.29';
import {reviewTournivalOrganiserHealth} from './healthReview.ts';
import {canReviewTournivalHealth} from './accessPolicy.ts';
import {readScopedTournivalRecords} from './scopedRead.mjs';
import {buildTournivalRecoveryPreview} from './recoveryPreview.ts';
import {summariseTournivalRecoveryEvidence} from './recoveryEvidence.ts';
import {commitTournivalMirrorRecovery} from './recoveryCommit.ts';
const clean=(v:any)=>String(v??'').trim().slice(0,160);
Deno.serve(async(req)=>{
 if(req.method!=='POST')return Response.json({error:'POST required'},{status:405});
 try{
  const base44=createClientFromRequest(req),user=await base44.auth.me();
  if(!user)return Response.json({error:'Authentication required'},{status:401});
  const body=await req.json().catch(()=>({}));
  if(!['review','preview_recovery','commit_recovery'].includes(body.action))return Response.json({error:'Unsupported organiser action'},{status:403});
  const tenantId=clean(body.tenantId),clubId=clean(body.clubId),tournamentId=clean(body.tournamentId);
  if(!tenantId||!clubId||!tournamentId)return Response.json({error:'Tenant, club and tournament required'},{status:400});
  let grants;
  try{grants=await readScopedTournivalRecords(base44.asServiceRole.entities.ClubUserAccess,
    {tenant_id:tenantId,club_id:clubId,user_id:user.id,status:'active',permission_bundle:'club_admin'});}
  catch{return Response.json({error:'Unable to verify complete organiser grants',code:'ORGANISER_GRANTS_INCOMPLETE'},{status:503});}
  const allowed=canReviewTournivalHealth(user,grants,tenantId,clubId);
  if(!allowed)return Response.json({error:'Club administrator required'},{status:403});
  let tournaments,sessions;
  try{
   [tournaments,sessions]=await Promise.all([
    readScopedTournivalRecords(base44.asServiceRole.entities.Tournament,{id:tournamentId,tenant_id:tenantId,host_club_id:clubId}),
    readScopedTournivalRecords(base44.asServiceRole.entities.TournivalSession,{tournament_id:tournamentId,tenant_id:tenantId,club_id:clubId})
   ]);
  }catch{return Response.json({error:'Complete tournament inventory unavailable',code:'TOURNIVAL_INVENTORY_INCOMPLETE'},{status:503});}
  if(tournaments.length!==1||String(tournaments[0].format).toLowerCase()!=='tournival')
   return Response.json({error:'Tournival not found in authorised club'},{status:404});
  if(body.action==='commit_recovery'){
   if(body.confirmRecovery!==true)return Response.json({error:'Explicit organiser confirmation required'},{status:400});
   // Re-read the authoritative session immediately before the compare-and-swap.
   // Refuse to project if a host has advanced the session since the preview.
   const latestSessions=await readScopedTournivalRecords(base44.asServiceRole.entities.TournivalSession,
    {tournament_id:tournamentId,tenant_id:tenantId,club_id:clubId});
   if(latestSessions.length!==1||sessions.length!==1||latestSessions[0].id!==sessions[0].id||
      latestSessions[0].state_revision!==sessions[0].state_revision||latestSessions[0].state_json!==sessions[0].state_json)
    return Response.json({error:'Session changed during recovery review; refresh',reason:'session_changed'},{status:409});
   const result=await commitTournivalMirrorRecovery({
    tournament:tournaments[0],sessions,
    expectedSessionRevision:body.expectedSessionRevision,
    expectedMirrorRevision:body.expectedMirrorRevision,
    confirm:true,
    updateMirror:(query:any,patch:any)=>base44.asServiceRole.entities.Tournament.updateMany(query,patch)
   });
   if(!result.committed)return Response.json({error:'Recovery not committed',reason:result.reason},{status:409});
   return Response.json({success:true,recovery:result});
  }
  if(body.action==='preview_recovery'){
   const preview=buildTournivalRecoveryPreview(tournaments[0],sessions);
   return Response.json({success:true,preview,evidence:summariseTournivalRecoveryEvidence(preview)});
  }
  return Response.json({success:true,review:reviewTournivalOrganiserHealth(tournaments[0],sessions)});
 }catch(error){console.error('Tournival organiser health read failed',error instanceof Error?error.message:'unknown');return Response.json({error:'Unable to verify organiser health safely'},{status:500});}
});
