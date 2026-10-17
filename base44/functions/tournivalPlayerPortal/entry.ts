import {createClientFromRequest} from 'npm:@base44/sdk@0.8.29';
const clean=(v:any,max=120)=>String(v??'').trim().slice(0,max);
async function digest(v:string){
 const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));
 return Array.from(new Uint8Array(d),b=>b.toString(16).padStart(2,'0')).join('');
}
Deno.serve(async(req)=>{
 if(req.method!=='POST')return Response.json({error:'POST required'},{status:405});
 try{
  const base44=createClientFromRequest(req),body=await req.json().catch(()=>({}));
  const token=clean(body.token);
  if(!/^trp_[a-f0-9]{48}$/.test(token))return Response.json({error:'Invalid personal link'},{status:404});
  const links=await base44.asServiceRole.entities.TournivalAccessToken.filter({
   token_hash:await digest(token),token_type:'player'
  },'-created_at',5);
  const link=links?.find((r:any)=>!r.revoked_at&&(!r.expires_at||Date.parse(r.expires_at)>Date.now()));
  if(!link)return Response.json({error:'Personal link has expired or was revoked'},{status:404});
  const [tournaments,registrations]=await Promise.all([
   base44.asServiceRole.entities.Tournament.filter({id:link.tournament_id}),
   base44.asServiceRole.entities.TournivalRegistration.filter({
    id:link.registration_id,tournament_id:link.tournament_id,tenant_id:link.tenant_id
   })
  ]);
  const event=tournaments?.[0],registration=registrations?.[0];
  if(!event||!registration||event.tenant_id!==link.tenant_id||registration.player_id!==link.player_id||
     String(event.format).toLowerCase()!=='tournival')
    return Response.json({error:'Personal tournament record is unavailable'},{status:404});
  const sessions=await base44.asServiceRole.entities.TournivalSession.filter({
   tournament_id:event.id,tenant_id:event.tenant_id
  },'-created_at',5);
  if(sessions?.length>1)return Response.json({error:'Tournament state under reconciliation'},{status:409});
  const raw=sessions?.[0]?.state_json||event.tournival_state;
  let state:any=null;
  try{state=raw?(typeof raw==='string'?JSON.parse(raw):raw):null}catch{}
  const playerId=registration.player_id;
  const assigned=(state?.matches||[]).filter((m:any)=>[...(m.teamA||[]),...(m.teamB||[])].includes(playerId));
  const roundLegacy=(state?.rounds||[]).flatMap((r:any)=>r.courts.map((c:any,i:number)=>({
   id:`qualification:${r.roundNumber}:${i+1}`,round:r.roundNumber,court:c.courtNumber,
   teamA:c.teamA,teamB:c.teamB,result:state?.results?.[r.roundNumber]?.[c.courtNumber]||null
  }))).filter((m:any)=>[...m.teamA,...m.teamB].includes(playerId));
  const matches=assigned.length?assigned:roundLegacy;
  const knockout=(state?.knockoutState?.bracket||[]).filter((m:any)=>
    [m.pair1?.player1?.id,m.pair1?.player2?.id,m.pair2?.player1?.id,m.pair2?.player2?.id].includes(playerId));
  return Response.json({success:true,event:{id:event.id,name:event.name,date:event.start_date,venue:event.location,status:event.status},
   player:{id:playerId,name:registration.full_name,registrationStatus:registration.registration_status,
    paymentStatus:registration.payment_status,checkedIn:!!registration.checked_in_at},
   matches:matches.map((m:any)=>({id:m.id,round:m.round,court:m.court,status:m.status||'scheduled',
    teamA:m.teamA,teamB:m.teamB,result:m.result})),
   knockout:knockout.map((m:any)=>({id:m.id,stage:m.stage,result:m.result,pair1:m.pair1,pair2:m.pair2})),
   revision:state?.revision||0,finalised:state?.status==='Completed'});
 }catch(error){console.error('Tournival player portal error',(error as any)?.message||error);
  return Response.json({error:'Unable to retrieve personal tournament information'},{status:500});}
});
