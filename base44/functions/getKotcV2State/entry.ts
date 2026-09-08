import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

function validAccess(a:any, tenantId:string, sessionId:string){if(!a||a.status!=='active')return false;if(String(a.tenant_id||'')!==String(tenantId||''))return false;if(String(a.session_id||'')!==String(sessionId||''))return false;if(!['session_host','assistant_host','viewer'].includes(a.role))return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}

Deno.serve(async(req)=>{try{
 const base44=createClientFromRequest(req); const user=await base44.auth.me(); if(!user)return Response.json({error:'Unauthorized'},{status:401}); const body=await req.json().catch(()=>({}));
 const tournamentId=String(body.tournamentId||''); const sessionId=String(body.sessionId||''); if(!tournamentId&&!sessionId)return Response.json({error:'tournamentId or sessionId required'},{status:400});
 let sessions:any[]=[]; if(sessionId)sessions=await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}); else sessions=await base44.asServiceRole.entities.KotcSession.filter({tournament_id:tournamentId});
 const session=(sessions||[]).filter((s:any)=>!['cancelled'].includes(s.status)).sort((a:any,b:any)=>Date.parse(b.created_date||0)-Date.parse(a.created_date||0))[0]||null; if(!session)return Response.json({session:null,participants:[],rounds:[],slots:[],matches:[],events:[],courts:[],lease:null});
 let allowed=user.role==='admin'; let currentAccessRole=user.role==='admin'?'admin':null; if(!allowed){const access=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'});const valid=(access||[]).filter((a:any)=>validAccess(a,session.tenant_id,session.id));allowed=valid.length>0;currentAccessRole=valid[0]?.role||null;} if(!allowed)return Response.json({error:'KOTC session access required'},{status:403});
 const [participants,rounds,slots,matches,events,courts,leases,phases,fixedPairs]=await Promise.all([
  base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id},'seed_rank',100),
  base44.asServiceRole.entities.KotcRound.filter({session_id:session.id},'round_number',100),
  base44.asServiceRole.entities.KotcRoundSlot.filter({session_id:session.id},'round_number',500),
  base44.asServiceRole.entities.KotcMatch.filter({session_id:session.id},'round_number',500),
  base44.asServiceRole.entities.KotcParticipationEvent.filter({session_id:session.id},'round_number',500),
  base44.asServiceRole.entities.KotcSessionCourt.filter({session_id:session.id},'ladder_rank_default',20),
  base44.asServiceRole.entities.KotcHostLease.filter({session_id:session.id,status:'active'}),
  base44.asServiceRole.entities.KotcPartnershipPhase.filter({session_id:session.id},'phase_order',50),
  base44.asServiceRole.entities.KotcFixedPair.filter({session_id:session.id},'phase_order',100),
 ]);
 const lease=(leases||[]).sort((a:any,b:any)=>Number(b.lease_revision||0)-Number(a.lease_revision||0))[0]||null;
 let contactDirectory:any={};
 if(user.role==='admin'||currentAccessRole==='session_host'){
  const playerIds=(participants||[]).map((p:any)=>p.player_id).filter(Boolean);
  if(playerIds.length){const playerRecords=await base44.asServiceRole.entities.Player.filter({id:{$in:playerIds}});contactDirectory=Object.fromEntries((playerRecords||[]).map((p:any)=>[p.id,{phone:p.phone||'',emergency_contact:p.emergency_contact||''}]));}
 }
 return Response.json({session,participants,rounds,slots,matches,events,courts,lease,partnershipPhases:phases||[],fixedPairs:fixedPairs||[],contactDirectory,currentUserId:user.id,currentAccessRole,isAdmin:user.role==='admin'});
}catch(error){return Response.json({error:error?.message||'Unexpected KOTC state error'},{status:500});}});