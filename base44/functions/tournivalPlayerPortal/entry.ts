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
  // The private link is stable, but its response is constrained by the
  // organiser's release stage. Default is always registration-only.
  const stages=['registration','fixtures','live','knockout','results'];
  const configured=String(event.tournival_player_stage||'registration');
  const selected=stages.includes(configured)?configured:'registration';
  // Never release live competition data until the event has started.
  const stage=['Draft','Registration Open'].includes(event.status)&&
    ['live','knockout','results'].includes(selected)?'registration':selected;
  const stageIndex=stages.indexOf(stage);
  const club=(await base44.asServiceRole.entities.Club.filter({
    id:event.host_club_id,tenant_id:event.tenant_id
  },'-updated_date',1))?.[0];
  const eventInfo={
    id:event.id,name:clean(event.name,180),date:event.start_date||'',
    venue:clean(event.location,240),status:event.status,
    startTime:clean(event.event_start_time,5),endTime:clean(event.event_end_time,5),
    mapUrl:/^https:\/\//.test(event.event_map_url||'')?clean(event.event_map_url,800):'',
    arrivalInfo:clean(event.event_player_info,2000),
    contactPhone:event.event_contact_phone_keep_private?'':clean(event.event_contact_phone,60),
    organiser:club?{
      id:club.id,name:clean(club.name,120),
      logo_url:clean(club.logo_url,1500),
      primary_colour:clean(club.primary_colour,32),
      secondary_colour:clean(club.secondary_colour,32)
    }:null
  };
  const receipt={
    success:true,stage,event:eventInfo,
    player:{id:registration.player_id,name:clean(registration.full_name,120),
      registrationStatus:registration.registration_status,
      paymentStatus:registration.payment_status,checkedIn:!!registration.checked_in_at}
  };
  if(stageIndex===0)return Response.json({...receipt,displayNames:{},matches:[],knockout:[],
    revision:0,finalised:false});
  const sessions=await base44.asServiceRole.entities.TournivalSession.filter({
   tournament_id:event.id,tenant_id:event.tenant_id
  },'-created_at',5);
  if(sessions?.length>1)return Response.json({error:'Tournament state under reconciliation'},{status:409});
  const raw=sessions?.[0]?.state_json||event.tournival_state;
  let state:any=null;
  try{state=raw?(typeof raw==='string'?JSON.parse(raw):raw):null}catch{}
  // Only non-sensitive roster display names: never return email, contact,
  // DUPR identity, fees or another player's registration details.
  const rosterIds=stageIndex>0&&Array.isArray(state?.playerIds)?state.playerIds:[];
  const roster=rosterIds.length?await base44.asServiceRole.entities.Player.filter({
    tenant_id:event.tenant_id
  },'-created_date',500):[];
  const displayNames=Object.fromEntries((roster||[]).filter((p:any)=>rosterIds.includes(p.id))
    .map((p:any)=>[p.id,clean(p.full_name,120)]));
  const playerId=registration.player_id;
  const assigned=(state?.matches||[]).filter((m:any)=>[...(m.teamA||[]),...(m.teamB||[])].includes(playerId));
  const roundLegacy=(state?.rounds||[]).flatMap((r:any)=>r.courts.map((c:any,i:number)=>({
   id:`qualification:${r.roundNumber}:${i+1}`,round:r.roundNumber,court:c.courtNumber,
   teamA:c.teamA,teamB:c.teamB,result:state?.results?.[r.roundNumber]?.[c.courtNumber]||null
  }))).filter((m:any)=>[...m.teamA,...m.teamB].includes(playerId));
  const matches=stageIndex>=1?(assigned.length?assigned:roundLegacy):[];
  const knockout=(stageIndex>=3?state?.knockoutState?.bracket||[]:[]).filter((m:any)=>
    [m.pair1?.player1?.id,m.pair1?.player2?.id,m.pair2?.player1?.id,m.pair2?.player2?.id].includes(playerId));
  return Response.json({...receipt,
   displayNames,
   matches:matches.map((m:any)=>({id:m.id,round:m.round,court:m.court,status:m.status||'scheduled',
    teamA:m.teamA,teamB:m.teamB,result:stageIndex>=2?m.result:null})),
   knockout:knockout.map((m:any)=>({id:m.id,stage:m.stage,result:stageIndex>=3?m.result:null,pair1:m.pair1,pair2:m.pair2})),
   revision:state?.revision||0,finalised:state?.status==='Completed'});
 }catch(error){console.error('Tournival player portal error',(error as any)?.message||error);
  return Response.json({error:'Unable to retrieve personal tournament information'},{status:500});}
});
