import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const SPORT_PICKLEBALL_ID='6aa1246d0401bf144776c3f1';

const clean=(v:any)=>String(v??'').trim();
const csvCell=(v:any)=>{
  const s=String(v??'');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
};
const toDate=(v:any)=>{
  const s=clean(v);
  if(!s)return '';
  const m=s.match(/^(\d{4}-\d{2}-\d{2})/);
  if(m)return m[1];
  const d=new Date(s);
  return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10);
};
const fileSafe=(v:any)=>clean(v).replace(/[^a-z0-9._-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,90)||'rallyhub-event';

function duprRow({event,date,a1,a2,b1,b2,scoreA,scoreB}:any){
  // DUPR club match CSV template columns A:AC.
  // A-C and S are intentionally blank; External ID columns are intentionally blank.
  const cols=[
    '','','',
    'D',event,date,
    a1.name,a1.duprId,'',
    a2.name,a2.duprId,'',
    b1.name,b1.duprId,'',
    b2.name,b2.duprId,'',
    '',
    scoreA,scoreB,
    '','','','','','','',''
  ];
  return cols.map(csvCell).join(',');
}

async function sha256(text:string){
  const bytes=new TextEncoder().encode(text);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function playerDuprMap(base44:any, playerIds:string[]){
  const ids=[...new Set(playerIds.filter(Boolean))];
  if(!ids.length)return {};
  const rows=await base44.asServiceRole.entities.Player.filter({id:{$in:ids}});
  return Object.fromEntries((rows||[]).map((p:any)=>[String(p.id),{
    name:clean(p.full_name||p.name||'Player'),
    duprId:clean(p.dupr_id),
    personId:clean(p.person_id)
  }]));
}

async function generateKotc(base44:any, sessionId:string){
  const session=(await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}))?.[0];
  if(!session)throw new Error('KOTC session not found.');
  const tournament=session.tournament_id?(await base44.asServiceRole.entities.Tournament.filter({id:session.tournament_id}))?.[0]:null;
  const participants=await base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id},'seed_rank',500);
  const matches=await base44.asServiceRole.entities.KotcMatch.filter({session_id:session.id},'round_number',500);
  const playerMap=await playerDuprMap(base44,(participants||[]).map((p:any)=>clean(p.player_id)).filter(Boolean));
  const participantMap=Object.fromEntries((participants||[]).map((p:any)=>[String(p.id),{
    participant:p,
    player:p.player_id?playerMap[String(p.player_id)]:null
  }]));
  const date=toDate(session.actual_first_round_start||session.scheduled_start||tournament?.start_date||tournament?.created_date);
  if(!date)throw new Error('KOTC event date is unavailable; DUPR export requires a YYYY-MM-DD date.');
  const event=clean(session.name||tournament?.name||'RallyHub King of the Court');
  const rows:string[]=[]; const excluded:any[]=[];
  for(const match of matches||[]){
    if(match.status!=='completed'){excluded.push({matchId:match.id,reason:'not_completed'});continue;}
    if(match.team_a_score==null||match.team_b_score==null){excluded.push({matchId:match.id,reason:'missing_score'});continue;}
    if(!match.winner_side){excluded.push({matchId:match.id,reason:'no_winner'});continue;}
    const a=(match.team_a_participant_ids||[]).map((id:string)=>participantMap[String(id)]);
    const b=(match.team_b_participant_ids||[]).map((id:string)=>participantMap[String(id)]);
    if(a.length!==2||b.length!==2||a.some((x:any)=>!x)||b.some((x:any)=>!x)){excluded.push({matchId:match.id,reason:'invalid_doubles_roster'});continue;}
    const missing=[...a,...b].filter((x:any)=>!x.player?.duprId).map((x:any)=>clean(x.participant?.display_name)||'Unknown player');
    if(missing.length){excluded.push({matchId:match.id,reason:'missing_exact_dupr_id',players:missing});continue;}
    rows.push(duprRow({event,date,a1:a[0].player,a2:a[1].player,b1:b[0].player,b2:b[1].player,scoreA:match.team_a_score,scoreB:match.team_b_score}));
  }
  return {tenantId:session.tenant_id,clubId:session.club_id,sourceType:'kotc',sourceId:session.id,event,date,rows,excluded};
}

async function generateClubChallenge(base44:any,eventId:string){
  const challenge=(await base44.asServiceRole.entities.ClubChallengeEvent.filter({id:eventId}))?.[0];
  if(!challenge)throw new Error('Interclub event not found.');
  const tournament=challenge.tournament_id?(await base44.asServiceRole.entities.Tournament.filter({id:challenge.tournament_id}))?.[0]:null;
  const participants=await base44.asServiceRole.entities.ClubChallengeParticipant.filter({challenge_event_id:challenge.id},'event_rank',500);
  const matches=await base44.asServiceRole.entities.ClubChallengeMatch.filter({challenge_event_id:challenge.id},'round_number',500);
  const playerMap=await playerDuprMap(base44,(participants||[]).map((p:any)=>clean(p.source_player_id)).filter(Boolean));
  const participantMap=Object.fromEntries((participants||[]).map((p:any)=>[String(p.id),{
    participant:p,
    player:p.source_player_id?playerMap[String(p.source_player_id)]:null
  }]));
  const date=toDate(tournament?.start_date||challenge.finalised_at||challenge.created_date);
  if(!date)throw new Error('Interclub event date is unavailable; DUPR export requires a YYYY-MM-DD date.');
  const event=clean(tournament?.name||`${challenge.club_a_name||'Club A'} v ${challenge.club_b_name||'Club B'}`);
  const rows:string[]=[]; const excluded:any[]=[];
  for(const match of matches||[]){
    if(match.is_showcase){excluded.push({matchId:match.id,reason:'showcase_excluded'});continue;}
    if(match.status!=='completed'){excluded.push({matchId:match.id,reason:'not_completed'});continue;}
    if(match.score_a==null||match.score_b==null){excluded.push({matchId:match.id,reason:'missing_score'});continue;}
    if(!['club_a','club_b'].includes(String(match.winner||''))){excluded.push({matchId:match.id,reason:'draw_or_no_winner'});continue;}
    const a=(match.club_a_participant_ids||[]).map((id:string)=>participantMap[String(id)]);
    const b=(match.club_b_participant_ids||[]).map((id:string)=>participantMap[String(id)]);
    if(a.length!==2||b.length!==2||a.some((x:any)=>!x)||b.some((x:any)=>!x)){excluded.push({matchId:match.id,reason:'invalid_doubles_roster'});continue;}
    const missing=[...a,...b].filter((x:any)=>!x.player?.duprId).map((x:any)=>clean(x.participant?.display_name)||'Unknown player');
    if(missing.length){excluded.push({matchId:match.id,reason:'missing_exact_dupr_id',players:missing});continue;}
    rows.push(duprRow({event,date,a1:a[0].player,a2:a[1].player,b1:b[0].player,b2:b[1].player,scoreA:match.score_a,scoreB:match.score_b}));
  }
  return {tenantId:challenge.tenant_id,clubId:challenge.host_club_id,sourceType:'club_challenge',sourceId:challenge.id,event,date,rows,excluded};
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me();
    if(!user)return Response.json({error:'Unauthorized'},{status:401});
    if(user.role!=='admin')return Response.json({error:'Platform admin access required for Phase 1 DUPR export.'},{status:403});
    const body=await req.json().catch(()=>({}));
    const sourceType=clean(body.sourceType);
    const sourceId=clean(body.sourceId);
    if(!sourceId)return Response.json({error:'sourceId required'},{status:400});

    let result:any;
    if(sourceType==='kotc')result=await generateKotc(base44,sourceId);
    else if(sourceType==='club_challenge')result=await generateClubChallenge(base44,sourceId);
    else return Response.json({error:'Phase 1 supports sourceType kotc or club_challenge.'},{status:400});

    if(!result.rows.length){
      return Response.json({success:false,error:'No DUPR-importable matches were found.',event:result.event,date:result.date,excluded:result.excluded},{status:409});
    }
    const csv=result.rows.join('\r\n')+'\r\n';
    const hash=await sha256(csv);
    const generatedAt=new Date().toISOString();
    const exportRecord=await base44.asServiceRole.entities.SportProviderResultExport.create({
      tenant_id:result.tenantId,
      club_id:result.clubId,
      sport_id:SPORT_PICKLEBALL_ID,
      provider:'dupr',
      source_type:result.sourceType,
      source_id:result.sourceId,
      export_format:'dupr_match_csv',
      status:'generated',
      row_count:result.rows.length,
      excluded_count:result.excluded.length,
      content_hash:hash,
      generated_by_user_id:user.id,
      generated_at:generatedAt,
      notes:'Generated from authoritative RallyHub completed match records. CSV contains no DUPR credentials or tokens.'
    });
    const connections=await base44.asServiceRole.entities.SportProviderClubConnection.filter({club_id:result.clubId,provider:'dupr',status:'configured'},'-created_date',10);
    if(connections?.[0])await base44.asServiceRole.entities.SportProviderClubConnection.update(connections[0].id,{last_exported_at:generatedAt});

    return Response.json({
      success:true,
      provider:'dupr',
      phase:1,
      format:'dupr_match_csv',
      templateVersion:'club_match_csv_template_new',
      filename:`${fileSafe(result.event)}-${result.date}-DUPR.csv`,
      csv,
      rowCount:result.rows.length,
      excludedCount:result.excluded.length,
      excluded:result.excluded,
      contentHash:hash,
      exportId:exportRecord.id,
      instructions:'Upload this CSV in DUPR Club > Matches > Add Matches > Import Matches via CSV. Review excluded matches before upload.'
    });
  }catch(error){
    console.error('duprCsvExport failed',error);
    return Response.json({error:error?.message||'Unable to generate DUPR CSV export.'},{status:500});
  }
});
