import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean=(v:any,max=500)=>String(v??'').trim().slice(0,max);
const lower=(v:any)=>clean(v,240).toLowerCase();
const nameKey=(v:any)=>lower(v).replace(/[’‘]/g,"'").replace(/[^a-z0-9]+/g,' ').trim();
function parseJson(value:any,fallback:any={}){
  try{return typeof value==='string'&&value.trim()?JSON.parse(value):value&&typeof value==='object'?value:fallback}catch{return fallback}
}

function ageFromDob(value:any,onDate=new Date()){
  const s=clean(value,20);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y,m,d]=s.split('-').map(Number);
  let age=onDate.getFullYear()-y;
  if((onDate.getMonth()+1<m)||((onDate.getMonth()+1===m)&&onDate.getDate()<d)) age--;
  return age>=0&&age<130?age:null;
}
function ageGroup(age:any){
  if(age==null) return null;
  if(age<18) return 'Junior (U18)';
  if(age<35) return 'Open (18-34)';
  if(age<50) return 'Adult (35-49)';
  if(age<65) return 'Senior (50-64)';
  return 'Super Senior (65+)';
}
function activeWindow(row:any){
  const now=Date.now();
  if(row?.starts_at && Date.parse(row.starts_at)>now) return false;
  if(row?.ends_at && Date.parse(row.ends_at)<now) return false;
  return true;
}
async function assertClubAdmin(base44:any,user:any,tenantId:string,clubId:string){
  if(user?.role==='admin') return true;
  const rows=await base44.asServiceRole.entities.ClubUserAccess.filter({
    tenant_id:tenantId,club_id:clubId,user_id:user.id,status:'active',permission_bundle:'club_admin'
  },'-updated_date',20);
  if((rows||[]).some(activeWindow)) return true;
  throw Object.assign(new Error('Club administrator access required'),{status:403});
}
async function activeClubAccesses(base44:any,userId:string){
  const rows=await base44.asServiceRole.entities.ClubUserAccess.filter({user_id:userId,status:'active'},'-updated_date',50);
  return (rows||[]).filter(activeWindow);
}
async function isDirectoryOnlyAccount(base44:any,userId:string){
  const [clubAccess,directoryAccess]=await Promise.all([
    activeClubAccesses(base44,userId),
    base44.asServiceRole.entities.DirectoryListingAccess.filter({user_id:userId,status:'active'},'-updated_date',50)
  ]);
  return !clubAccess.length && !!directoryAccess?.length;
}
async function first(base44:any,entity:string,filter:any){
  const rows=await base44.asServiceRole.entities[entity].filter(filter,'-updated_date',20);
  return rows?.[0]||null;
}
function safePerson(p:any){
  if(!p) return null;
  const age=ageFromDob(p.date_of_birth);
  return {
    id:p.id,full_name:p.full_name||null,preferred_name:p.preferred_name||null,
    primary_email:p.primary_email||null,mobile:p.mobile||null,date_of_birth:p.date_of_birth||null,
    age,age_group:ageGroup(age),gender:p.gender||null,full_postal_address:p.full_postal_address||null,
    address_line1:p.address_line1||null,address_line2:p.address_line2||null,town_city:p.town_city||null,
    county_region:p.county_region||null,postal_code:p.postal_code||null,country:p.country||null,
    emergency_contact_name:p.emergency_contact_name||null,emergency_contact_relationship:p.emergency_contact_relationship||null,
    emergency_mobile:p.emergency_mobile||null,emergency_contact_raw:p.emergency_contact_raw||null,
    secondary_emergency_contact_name:p.secondary_emergency_contact_name||null,
    secondary_emergency_contact_mobile:p.secondary_emergency_contact_mobile||null,
    preferred_language:p.preferred_language||null,communication_preference:p.communication_preference||null,
    profile_visibility:p.profile_visibility||null,photo_visibility:p.photo_visibility||null,
    source_system:p.source_system||null,source_rows:p.source_rows||[],data_quality_flags:p.data_quality_flags||[],
    linked_user_id:p.linked_user_id||null
  };
}
function safeMembership(m:any){
  if(!m) return null;
  return {
    id:m.id,member_id:m.member_id||m.club_membership_id||null,membership_season:m.membership_season||null,
    membership_type:m.membership_type||null,membership_status:m.membership_status||null,
    relationship_type:m.relationship_type||null,payment_status:m.payment_status||null,payment_date:m.payment_date||null,
    membership_fee:m.membership_fee??m.membership_amount??null,join_date:m.join_date||null,renewal_date:m.renewal_date||null,
    expiry_date:m.expiry_date||null,previous_member_ids:m.previous_member_ids||[],alternate_names:m.alternate_names||[],
    alternate_emails:m.alternate_emails||[],duplicate_flag:m.duplicate_flag||null,admin_notes:m.admin_notes||null,
    source_system:m.source_system||null,source_rows:m.source_rows||m.source_row_refs||[],data_quality_flags:m.data_quality_flags||[]
  };
}
function safePlayer(p:any){
  if(!p) return null;
  return {
    id:p.id,full_name:p.full_name||null,email:p.email||null,phone:p.phone||null,gender:p.gender||null,
    dupr_id:p.dupr_id||null,dupr_rating:p.dupr_rating??null,dupr_last_synced:p.dupr_last_synced||null,
    skill_rating:p.skill_rating??null,preferred_position:p.preferred_position||null,age_group:p.age_group||null,
    status:p.status||null,relationship_type:p.relationship_type||null,relationship_status:p.relationship_status||null,
    user_id:p.user_id||null,linked_user_email:p.linked_user_email||null
  };
}
function dataQualityIssues(person:any,membership:any){
  const out:string[]=[];
  if(!clean(person?.primary_email,240)) out.push('missing_email');
  if(!clean(person?.mobile,80)) out.push('missing_mobile');
  if(!clean(person?.date_of_birth,20)) out.push('missing_date_of_birth');
  if(!clean(person?.full_postal_address||person?.address_line1,300)) out.push('missing_address');
  if(!clean(person?.postal_code,40)) out.push('missing_postcode');
  if(!clean(person?.emergency_contact_name||person?.emergency_contact_raw,240)) out.push('missing_emergency_contact');
  if(!clean(person?.emergency_mobile,80)) out.push('missing_emergency_mobile');
  if(!clean(membership?.member_id,120)) out.push('missing_membership_id');
  if(clean(membership?.duplicate_flag,240)) out.push('duplicate_review');
  return Array.from(new Set([...(person?.data_quality_flags||[]),...(membership?.data_quality_flags||[]),...out]));
}
function safeClub(c:any){
  if(!c) return null;
  return {id:c.id,tenant_id:c.tenant_id||null,name:c.name||null,slug:c.slug||null,timezone:c.timezone||null,logo_url:c.logo_url||null,primary_colour:c.primary_colour||null,secondary_colour:c.secondary_colour||null,public_contact_email:c.public_contact_email||null};
}
function safeSport(s:any){return s?{id:s.id,name:s.name||null,code:s.code||null,status:s.status||null}:null}
function sportSettings(clubSport:any){
  const settings=parseJson(clubSport?.settings_json,{});
  const rating=settings?.rating&&typeof settings.rating==='object'?settings.rating:{};
  return {
    ...settings,
    rating:{
      enabled:rating.enabled!==false,
      system:clean(rating.system,80)||null,
      label:clean(rating.label,80)||'External rating',
      id_label:clean(rating.id_label,80)||'Rating ID',
      legacy_adapter:clean(rating.legacy_adapter,40)||null,
      variants:Array.isArray(rating.variants)?rating.variants.slice(0,12):[]
    }
  };
}
function safeGateway(g:any){return g?{id:g.id,provider:g.provider||null,display_name:g.display_name||null,status:g.status||null,is_default:g.is_default===true,currency:g.currency||'EUR',supports_payments:g.supports_payments!==false,supports_refunds:g.supports_refunds===true}:null}
const MEMBERSHIP_STATUS=['paid_active','pending_payment','no_response','not_renewing','inactive','former_member'];
const RELATIONSHIP_TYPE=['member','guest','booking_only','waiting_list','inactive','former_member'];
const PAYMENT_STATUS=['paid','pending','failed','not_required','unknown'];

async function resolveSelf(base44:any,user:any){
  const tenantId=clean(user.active_tenant_id,180), clubId=clean(user.active_club_id,180), email=lower(user.email);
  let player=await first(base44,'Player',{user_id:user.id});
  if(!player&&email) player=await first(base44,'Player',{linked_user_email:email});
  if(!player&&email) player=await first(base44,'Player',{email});
  let person=await first(base44,'Person',{linked_user_id:user.id});
  if(!person&&player?.person_id) person=await first(base44,'Person',{id:player.person_id});
  if(!person&&email) person=await first(base44,'Person',{primary_email:email});
  const resolvedTenant=clean(tenantId||person?.tenant_id||player?.tenant_id,180);
  const resolvedClub=clean(clubId||player?.club_id,180);
  return {tenantId:resolvedTenant,clubId:resolvedClub,person,player};
}
async function sportingHistory(base44:any,tenantId:string,clubId:string,playerId:string){
  if(!playerId) return [];
  const history:any[]=[];

  const kotcParts=await base44.asServiceRole.entities.KotcSessionParticipant.filter({tenant_id:tenantId,club_id:clubId,player_id:playerId},'-created_date',500);
  const seenSessions=new Set<string>();
  for(const me of kotcParts||[]){
    const sid=String(me.session_id||'');
    if(!sid||seenSessions.has(sid)) continue;
    seenSessions.add(sid);
    const session=await first(base44,'KotcSession',{id:sid});
    if(!session||session.demo_mode||session.exclude_from_aggregates) continue;
    const [parts,matches]=await Promise.all([
      base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:sid},'display_name',100),
      base44.asServiceRole.entities.KotcMatch.filter({session_id:sid,status:'completed'},'round_number',500)
    ]);
    const names=new Map((parts||[]).map((p:any)=>[String(p.id),p.display_name||'Player']));
    const myPart=(parts||[]).find((p:any)=>String(p.player_id||'')===String(playerId));
    if(!myPart) continue;
    for(const m of matches||[]){
      const a=(m.team_a_participant_ids||[]).map(String), b=(m.team_b_participant_ids||[]).map(String);
      const mine=String(myPart.id);
      const inA=a.includes(mine), inB=b.includes(mine);
      if(!inA&&!inB) continue;
      const won=(inA&&m.winner_side==='A')||(inB&&m.winner_side==='B');
      const myIds=inA?a:b, oppIds=inA?b:a;
      history.push({
        id:'kotc:'+m.id,competition_type:'King of the Court',competition_id:sid,
        competition_name:session.name||'King of the Court',date:m.completed_at||session.actual_session_end||session.scheduled_start||session.created_date||null,
        round:m.round_number??null,court:m.ladder_court_rank??null,result:won?'win':'loss',
        score_for:Number(inA?m.team_a_score:m.team_b_score)||0,score_against:Number(inA?m.team_b_score:m.team_a_score)||0,
        partner_names:myIds.filter((x:string)=>x!==mine).map((x:string)=>names.get(x)||'Player'),
        opponent_names:oppIds.map((x:string)=>names.get(x)||'Player')
      });
    }
  }

  const challengeParts=await base44.asServiceRole.entities.ClubChallengeParticipant.filter({tenant_id:tenantId,source_player_id:playerId},'-created_date',500);
  const byEvent=new Map<string,any[]>();
  for(const p of challengeParts||[]){
    const eid=String(p.challenge_event_id||''); if(!eid) continue;
    if(!byEvent.has(eid)) byEvent.set(eid,[]);
    byEvent.get(eid)!.push(p);
  }
  for(const [eid,myParts] of byEvent){
    const event=await first(base44,'ClubChallengeEvent',{id:eid});
    if(!event) continue;
    const [allParts,matches,tournament]=await Promise.all([
      base44.asServiceRole.entities.ClubChallengeParticipant.filter({challenge_event_id:eid},'display_name',100),
      base44.asServiceRole.entities.ClubChallengeMatch.filter({challenge_event_id:eid},'round_number',500),
      event.tournament_id?first(base44,'Tournament',{id:event.tournament_id}):Promise.resolve(null)
    ]);
    const names=new Map((allParts||[]).map((p:any)=>[String(p.id),p.display_name||'Player']));
    const myIds=new Set((myParts||[]).map((p:any)=>String(p.id)));
    for(const m of matches||[]){
      if(!['completed','draw','retired','forfeit'].includes(String(m.status||''))||m.is_showcase) continue;
      const a=(m.club_a_participant_ids||[]).map(String), b=(m.club_b_participant_ids||[]).map(String);
      const myA=a.some((x:string)=>myIds.has(x)), myB=b.some((x:string)=>myIds.has(x));
      if(!myA&&!myB) continue;
      const isDraw=m.winner==='draw';
      const won=!isDraw&&((myA&&m.winner==='club_a')||(myB&&m.winner==='club_b'));
      const ownIds=myA?a:b, oppIds=myA?b:a;
      history.push({
        id:'interclub:'+m.id,competition_type:'RallyHub Interclub',competition_id:eid,
        competition_name:tournament?.name||`${event.club_a_name||'Club A'} vs ${event.club_b_name||'Club B'}`,
        date:m.scored_at||tournament?.start_date||event.finalised_at||event.created_date||null,
        round:m.round_number??null,court:m.court_number??null,result:isDraw?'draw':won?'win':'loss',
        score_for:Number(myA?m.score_a:m.score_b)||0,score_against:Number(myA?m.score_b:m.score_a)||0,
        partner_names:ownIds.filter((x:string)=>!myIds.has(x)).map((x:string)=>names.get(x)||'Player'),
        opponent_names:oppIds.map((x:string)=>names.get(x)||'Player')
      });
    }
  }

  const tournaments=await base44.asServiceRole.entities.Tournament.filter({tenant_id:tenantId},'-start_date',500);
  for(const t of tournaments||[]){
    if(t.format!=='Tournival'||t.status!=='Completed'||t.counts_toward_leaderboard!==true||!t.kotc_state) continue;
    let state:any=null; try{state=typeof t.kotc_state==='string'?JSON.parse(t.kotc_state):t.kotc_state;}catch{state=null;}
    if(!state) continue;
    for(const round of state.rounds||[]){
      const rr=state.results?.[round.roundNumber]||{};
      for(const court of round.courts||[]){
        const a=(court.teamA||[]).map(String),b=(court.teamB||[]).map(String);
        const inA=a.includes(String(playerId)),inB=b.includes(String(playerId));
        if(!inA&&!inB) continue;
        const result=rr?.[court.courtNumber]; if(!result||!['A','B'].includes(result.winner)) continue;
        const won=(inA&&result.winner==='A')||(inB&&result.winner==='B');
        const own=inA?a:b,opp=inA?b:a;
        const playerRows=await base44.asServiceRole.entities.Player.filter({tenant_id:tenantId,club_id:clubId},'full_name',500);
        const names=new Map((playerRows||[]).map((p:any)=>[String(p.id),p.full_name||'Player']));
        history.push({
          id:`tournival:${t.id}:${round.roundNumber}:${court.courtNumber}`,competition_type:'Tournival',competition_id:t.id,
          competition_name:t.name||'Tournival',date:t.end_date||t.start_date||t.created_date||null,
          round:round.roundNumber??null,court:court.courtNumber??null,result:won?'win':'loss',
          score_for:Number(inA?result.scoreA:result.scoreB)||0,score_against:Number(inA?result.scoreB:result.scoreA)||0,
          partner_names:own.filter((x:string)=>x!==String(playerId)).map((x:string)=>names.get(x)||'Player'),
          opponent_names:opp.map((x:string)=>names.get(x)||'Player')
        });
      }
    }
  }

  const matches=await base44.asServiceRole.entities.Match.filter({tenant_id:tenantId,status:'Completed'},'-created_date',500);
  const eligibleTournamentIds=new Set((tournaments||[]).filter((t:any)=>t.counts_toward_leaderboard===true&&t.status==='Completed'&&!['King of the Court','Tournival','Club Challenge'].includes(String(t.format||''))).map((t:any)=>String(t.id)));
  for(const m of matches||[]){
    if(!eligibleTournamentIds.has(String(m.tournament_id||''))) continue;
    const a=(m.team1_player_ids||[]).map(String),b=(m.team2_player_ids||[]).map(String);
    const inA=a.includes(String(playerId)),inB=b.includes(String(playerId)); if(!inA&&!inB) continue;
    const t=(tournaments||[]).find((x:any)=>String(x.id)===String(m.tournament_id));
    const won=(inA&&m.winner_team==='team1')||(inB&&m.winner_team==='team2');
    const scoreA=(m.scores||[]).reduce((n:number,g:any)=>n+Number(g.team1||0),0);
    const scoreB=(m.scores||[]).reduce((n:number,g:any)=>n+Number(g.team2||0),0);
    const playerRows=await base44.asServiceRole.entities.Player.filter({tenant_id:tenantId,club_id:clubId},'full_name',500);
    const names=new Map((playerRows||[]).map((p:any)=>[String(p.id),p.full_name||'Player']));
    const own=inA?a:b,opp=inA?b:a;
    history.push({
      id:'match:'+m.id,competition_type:t?.format||'Tournament',competition_id:m.tournament_id||null,
      competition_name:t?.name||'Tournament',date:m.completed_at||m.created_date||t?.start_date||null,
      round:m.round??null,court:m.court??null,result:won?'win':'loss',
      score_for:inA?scoreA:scoreB,score_against:inA?scoreB:scoreA,
      partner_names:own.filter((x:string)=>x!==String(playerId)).map((x:string)=>names.get(x)||'Player'),
      opponent_names:opp.map((x:string)=>names.get(x)||'Player')
    });
  }

  return history.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
}
async function fullRecord(base44:any,tenantId:string,clubId:string,person:any,player:any){
  if(!person) return null;
  const [membership,relationship,sports,consents,payments,training,qualifications,sources]=await Promise.all([
    first(base44,'ClubMembership',{tenant_id:tenantId,club_id:clubId,person_id:person.id}),
    first(base44,'ClubRelationship',{tenant_id:tenantId,club_id:clubId,person_id:person.id}),
    base44.asServiceRole.entities.SportProfile.filter({tenant_id:tenantId,person_id:person.id},'sport',100),
    base44.asServiceRole.entities.ConsentRecord.filter({tenant_id:tenantId,club_id:clubId,person_id:person.id},'-recorded_at',100),
    base44.asServiceRole.entities.PaymentRecord.filter({tenant_id:tenantId,club_id:clubId,person_id:person.id},'-payment_date',100),
    base44.asServiceRole.entities.TrainingRecord.filter({tenant_id:tenantId,person_id:person.id},'-completion_date',100),
    base44.asServiceRole.entities.Qualification.filter({tenant_id:tenantId,person_id:person.id},'-award_date',100),
    base44.asServiceRole.entities.MembershipSourceResponse.filter({tenant_id:tenantId,club_id:clubId,person_id:person.id},'source_row',100)
  ]);
  const history=await sportingHistory(base44,tenantId,clubId,player?.id||'');
  return {
    person:safePerson(person),membership:safeMembership(membership),relationship:relationship?{
      id:relationship.id,relationship_type:relationship.relationship_type,status:relationship.status,
      entry_route:relationship.entry_route||null,start_date:relationship.start_date||null,end_date:relationship.end_date||null,
      membership_id:relationship.membership_id||null,membership_type:relationship.membership_type||null,
      membership_season:relationship.membership_season||null,payment_status:relationship.payment_status||null,
      payment_date:relationship.payment_date||null,membership_amount:relationship.membership_amount??null,
      membership_category:relationship.membership_category||null,notes:relationship.notes||null
    }:null,
    player:safePlayer(player),sportProfiles:sports||[],consents:consents||[],payments:payments||[],
    training:training||[],qualifications:qualifications||[],sourceResponses:sources||[],sportingHistory:history
  };
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me();
    if(!user) return Response.json({error:'Authentication required'},{status:401});
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'self_record',80);

    if(action==='self_record'){
      if(user.role!=='admin'){
        if(user.approval_status!=='approved') return Response.json({error:'Approved RallyHub Club member access required'},{status:403});
        const accesses=await activeClubAccesses(base44,user.id);
        if(!accesses.length) return Response.json({error:'No RallyHub Club access. Directory access does not grant member access.'},{status:403});
      }
      const resolved=await resolveSelf(base44,user);
      if(!resolved.person) return Response.json({success:true,record:null});
      return Response.json({success:true,record:await fullRecord(base44,resolved.tenantId,resolved.clubId,resolved.person,resolved.player)});
    }

    if(action==='self_link'){
      if(user.role!=='admin'){
        if(user.approval_status!=='approved') return Response.json({error:'Approved RallyHub Club member access required'},{status:403});
        if(await isDirectoryOnlyAccount(base44,user.id)) return Response.json({error:'This is a Directory-only account. Club membership linking requires a separate RallyHub Club onboarding process.'},{status:403});
      }
      const playerId=clean(body.playerId,180);
      if(!playerId) return Response.json({error:'playerId required'},{status:400});
      const player=await first(base44,'Player',{id:playerId});
      if(!player||player.status==='Inactive') return Response.json({error:'Player record not found'},{status:404});
      if(player.user_id&&String(player.user_id)!==String(user.id)) return Response.json({error:'That player record is already linked to another account.'},{status:409});
      const person=player.person_id?await first(base44,'Person',{id:player.person_id}):null;
      const accountEmail=lower(user.email), recordEmail=lower(person?.primary_email||player.email);
      if(!accountEmail||accountEmail!==recordEmail) return Response.json({error:'For security, members may only link a record with the same verified email address.'},{status:409});
      const accountName=nameKey(user.full_name||user.display_name||''), recordName=nameKey(person?.full_name||player.full_name||'');
      const nameMismatch=!!(accountName&&recordName&&accountName!==recordName);
      const suppliedDob=clean(body.verifyDateOfBirth,20);
      const suppliedMobile=clean(body.verifyMobile,80).replace(/\s+/g,'');
      const recordMobile=clean(person?.mobile||player.phone,80).replace(/\s+/g,'');
      const dobMatch=!!(suppliedDob&&person?.date_of_birth&&suppliedDob===String(person.date_of_birth));
      const mobileMatch=!!(suppliedMobile&&recordMobile&&suppliedMobile===recordMobile);
      if(nameMismatch&&!dobMatch&&!mobileMatch){
        return Response.json({
          error:'Your verified email matches an existing member record, but the names differ. Enter the date of birth or mobile number already held by the club to confirm the identity.',
          code:'NAME_MISMATCH_REQUIRES_SECOND_FACTOR'
        },{status:409});
      }
      if(person?.linked_user_id&&String(person.linked_user_id)!==String(user.id)) return Response.json({error:'This member record is already linked to another account.'},{status:409});
      await base44.asServiceRole.entities.Player.update(player.id,{user_id:user.id,linked_user_email:accountEmail});
      if(person?.id) await base44.asServiceRole.entities.Person.update(person.id,{linked_user_id:user.id});
      if(nameMismatch&&person?.id){
        const membership=await first(base44,'ClubMembership',{tenant_id:player.tenant_id,club_id:player.club_id,person_id:person.id});
        if(membership){
          const aliases=Array.from(new Set([...(membership.alternate_names||[]), clean(user.full_name||user.display_name,180)].filter(Boolean)));
          await base44.asServiceRole.entities.ClubMembership.update(membership.id,{alternate_names:aliases});
        }
      }
      const tenantId=clean(player.tenant_id||person?.tenant_id,180), clubId=clean(player.club_id,180);
      if(tenantId&&clubId){
        const accessRows=await base44.asServiceRole.entities.ClubUserAccess.filter({tenant_id:tenantId,club_id:clubId,user_id:user.id},'-updated_date',20);
        const access=accessRows?.[0];
        const accessData={tenant_id:tenantId,club_id:clubId,user_id:user.id,person_id:person?.id||undefined,player_id:player.id,permission_bundle:'member',relationship_type:'member',status:'active',approved_by_user_id:user.id,approved_at:new Date().toISOString()};
        if(access) await base44.asServiceRole.entities.ClubUserAccess.update(access.id,accessData);
        else await base44.asServiceRole.entities.ClubUserAccess.create(accessData);
        await base44.asServiceRole.entities.User.update(user.id,{account_scope:'club',approval_status:'approved',active_tenant_id:tenantId,active_club_id:clubId,active_club_role:'member',security_context_updated_at:new Date().toISOString()});
      }
      return Response.json({success:true,player_id:player.id,person_id:person?.id||null,verification:nameMismatch?(dobMatch?'dob':'mobile'):'email_and_name'});
    }

    const tenantId=clean(body.tenantId||user.active_tenant_id,180);
    const clubId=clean(body.clubId||user.active_club_id,180);
    if(!tenantId||!clubId) return Response.json({error:'Active club context required'},{status:400});
    await assertClubAdmin(base44,user,tenantId,clubId);

    if(action==='admin_meta'){
      const [club,tenant,clubSports,allSports,gateways,views]=await Promise.all([
        first(base44,'Club',{id:clubId,tenant_id:tenantId}),
        first(base44,'Tenant',{id:tenantId}),
        base44.asServiceRole.entities.ClubSport.filter({tenant_id:tenantId,club_id:clubId,status:'active'},'-is_primary',100),
        base44.asServiceRole.entities.Sport.filter({status:'active'},'name',100),
        base44.asServiceRole.entities.PaymentGatewayAccount.filter({tenant_id:tenantId,club_id:clubId},'-is_default',50),
        base44.asServiceRole.entities.MembershipSavedView.filter({tenant_id:tenantId,club_id:clubId,user_id:user.id},'name',100)
      ]);
      const sportMap=new Map((allSports||[]).map((s:any)=>[String(s.id),s]));
      const configuredSports=(clubSports||[]).map((cs:any)=>({
        ...safeSport(sportMap.get(String(cs.sport_id))),
        club_sport_id:cs.id,
        is_primary:cs.is_primary===true,
        settings:sportSettings(cs)
      })).filter((x:any)=>x.id);
      return Response.json({
        success:true,
        tenant:tenant?{id:tenant.id,name:tenant.name||null,slug:tenant.slug||null,timezone:tenant.timezone||null}:null,
        club:safeClub(club),
        sports:configuredSports,
        gateways:(gateways||[]).map(safeGateway),
        membershipStatuses:MEMBERSHIP_STATUS,
        relationshipTypes:RELATIONSHIP_TYPE,
        paymentStatuses:PAYMENT_STATUS,
        fieldCatalog:[
          {key:'full_name',label:'Name',group:'Person',default:true},
          {key:'member_id',label:'Membership ID',group:'Membership',default:true},
          {key:'membership_status',label:'Membership status',group:'Membership',default:true},
          {key:'payment_status',label:'Payment status',group:'Membership',default:true},
          {key:'email',label:'Email',group:'Contact',default:true},
          {key:'mobile',label:'Mobile',group:'Contact',default:true},
          {key:'membership_type',label:'Membership type',group:'Membership',default:false},
          {key:'membership_season',label:'Season',group:'Membership',default:false},
          {key:'membership_fee',label:'Fee',group:'Membership',default:false},
          {key:'payment_date',label:'Payment date',group:'Membership',default:false},
          {key:'date_of_birth',label:'Date of birth',group:'Personal',default:false,sensitive:true},
          {key:'age',label:'Age',group:'Personal',default:false,sensitive:true},
          {key:'age_group',label:'Age group',group:'Personal',default:false},
          {key:'postal_code',label:'Postcode / Eircode',group:'Contact',default:false},
          {key:'emergency_contact',label:'Emergency contact',group:'Emergency',default:false,sensitive:true},
          {key:'emergency_mobile',label:'Emergency mobile',group:'Emergency',default:false,sensitive:true},
          {key:'primary_sport',label:'Primary sport',group:'Sport',default:true},
          {key:'skill_level',label:'Skill level',group:'Sport',default:false},
          {key:'external_rating',label:'External rating',group:'Sport',default:false},
          {key:'linked',label:'RallyHub account',group:'Access',default:true},
          {key:'quality_count',label:'Data issues',group:'Data quality',default:true}
        ],
        savedViews:(views||[]).map((v:any)=>({id:v.id,name:v.name,visible_fields:v.visible_fields||[],filters_json:v.filters_json||'{}',sort_field:v.sort_field||'full_name',sort_direction:v.sort_direction||'asc',is_default:v.is_default===true}))
      });
    }

    if(action==='admin_connect_account'){
      const userId=clean(body.userId,180), personId=clean(body.personId,180);
      if(!userId||!personId) return Response.json({error:'userId and personId required'},{status:400});
      const targetUsers=await base44.asServiceRole.entities.User.filter({id:userId},'-updated_date',10);
      const target=targetUsers?.[0];
      if(!target) return Response.json({error:'User account not found'},{status:404});
      const person=await first(base44,'Person',{id:personId,tenant_id:tenantId});
      const membership=await first(base44,'ClubMembership',{tenant_id:tenantId,club_id:clubId,person_id:personId});
      const player=await first(base44,'Player',{tenant_id:tenantId,club_id:clubId,person_id:personId});
      if(!person||!membership||!player) return Response.json({error:'Complete member/person/player record not found in this club.'},{status:404});
      const accountEmail=lower(target.email), recordEmail=lower(person.primary_email||player.email);
      if(!accountEmail||accountEmail!==recordEmail) return Response.json({error:'Account email does not match the membership record email. Verify identity before linking.',code:'EMAIL_MISMATCH'},{status:409});
      const accountName=nameKey(target.full_name||target.display_name||''), recordName=nameKey(person.full_name||player.full_name||'');
      const nameMismatch=!!(accountName&&recordName&&accountName!==recordName);
      const suppliedDob=clean(body.verifyDateOfBirth,20);
      const suppliedMobile=clean(body.verifyMobile,80).replace(/\s+/g,'');
      const recordMobile=clean(person.mobile||player.phone,80).replace(/\s+/g,'');
      const dobMatch=!!(suppliedDob&&person.date_of_birth&&suppliedDob===String(person.date_of_birth));
      const mobileMatch=!!(suppliedMobile&&recordMobile&&suppliedMobile===recordMobile);
      if(nameMismatch&&!dobMatch&&!mobileMatch){
        return Response.json({
          error:'Email matches but the account and membership names differ. Verify either date of birth or mobile before connecting.',
          code:'NAME_MISMATCH_REQUIRES_SECOND_FACTOR',
          account_name:target.full_name||target.display_name||null,
          record_name:person.full_name||player.full_name||null
        },{status:409});
      }
      const otherPerson=await first(base44,'Person',{linked_user_id:userId});
      if(otherPerson&&String(otherPerson.id)!==String(personId)) return Response.json({error:'This user account is already linked to a different person record.'},{status:409});
      const otherPlayer=await first(base44,'Player',{user_id:userId});
      if(otherPlayer&&String(otherPlayer.id)!==String(player.id)) return Response.json({error:'This user account is already linked to a different player record.'},{status:409});
      if(player.user_id&&String(player.user_id)!==String(userId)) return Response.json({error:'This player record is already linked to another user.'},{status:409});
      await base44.asServiceRole.entities.Person.update(person.id,{linked_user_id:userId});
      await base44.asServiceRole.entities.Player.update(player.id,{user_id:userId,linked_user_email:accountEmail});
      if(nameMismatch){
        const aliases=Array.from(new Set([...(membership.alternate_names||[]), clean(target.full_name||target.display_name,180)].filter(Boolean)));
        await base44.asServiceRole.entities.ClubMembership.update(membership.id,{alternate_names:aliases});
      }
      const accessRows=await base44.asServiceRole.entities.ClubUserAccess.filter({tenant_id:tenantId,club_id:clubId,user_id:userId},'-updated_date',20);
      const existingAccess=accessRows?.[0];
      const now=new Date().toISOString();
      const accessData={tenant_id:tenantId,club_id:clubId,user_id:userId,person_id:person.id,player_id:player.id,permission_bundle:'member',relationship_type:'member',status:'active',approved_by_user_id:user.id,approved_at:now};
      if(existingAccess) await base44.asServiceRole.entities.ClubUserAccess.update(existingAccess.id,accessData);
      else await base44.asServiceRole.entities.ClubUserAccess.create(accessData);
      await base44.asServiceRole.entities.User.update(userId,{account_scope:'club',approval_status:'approved',active_tenant_id:tenantId,active_club_id:clubId,active_club_role:'member',security_context_updated_at:now});
      try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:tenantId,club_id:clubId,user_id:user.id,action:'member_account_connected',entity_type:'Person',entity_id:person.id,scope_type:'Club',scope_id:clubId,after_state:JSON.stringify({target_user_id:userId,player_id:player.id,email_match:true,name_mismatch:nameMismatch,verification:nameMismatch?(dobMatch?'dob':'mobile'):'email_and_name'}),reason:nameMismatch?'Administrator verified changed-name identity with a second factor':'Administrator connected matching member account'});}catch{}
      return Response.json({success:true,user_id:userId,person_id:person.id,player_id:player.id,name_mismatch:nameMismatch,verification:nameMismatch?(dobMatch?'dob':'mobile'):'email_and_name'});
    }

    if(action==='admin_list'){
      const [members,people,players,sportProfiles,clubSports,allSports,relationships]=await Promise.all([
        base44.asServiceRole.entities.ClubMembership.filter({tenant_id:tenantId,club_id:clubId},'member_id',500),
        base44.asServiceRole.entities.Person.filter({tenant_id:tenantId},'full_name',500),
        base44.asServiceRole.entities.Player.filter({tenant_id:tenantId,club_id:clubId},'full_name',500),
        base44.asServiceRole.entities.SportProfile.filter({tenant_id:tenantId},'person_id',500),
        base44.asServiceRole.entities.ClubSport.filter({tenant_id:tenantId,club_id:clubId,status:'active'},'-is_primary',100),
        base44.asServiceRole.entities.Sport.filter({status:'active'},'name',100),
        base44.asServiceRole.entities.ClubRelationship.filter({tenant_id:tenantId,club_id:clubId},'person_id',500)
      ]);
      const personMap=new Map((people||[]).map((p:any)=>[String(p.id),p]));
      const playerMap=new Map((players||[]).filter((p:any)=>p.person_id).map((p:any)=>[String(p.person_id),p]));
      const profilesByPerson=new Map<string,any[]>();
      for(const sp of sportProfiles||[]){
        const k=String(sp.person_id||''); if(!k) continue;
        if(!profilesByPerson.has(k)) profilesByPerson.set(k,[]);
        profilesByPerson.get(k)!.push(sp);
      }
      const sportMap=new Map((allSports||[]).map((s:any)=>[String(s.id),s]));
      const configuredSportIds=new Set((clubSports||[]).map((cs:any)=>String(cs.sport_id)));
      const primarySportId=String((clubSports||[]).find((cs:any)=>cs.is_primary)?.sport_id||(clubSports||[])[0]?.sport_id||'');
      const relationshipMap=new Map((relationships||[]).map((r:any)=>[String(r.person_id),r]));
      const rows=(members||[]).map((m:any)=>{
        const p:any=personMap.get(String(m.person_id)), pl:any=playerMap.get(String(m.person_id)), rel:any=relationshipMap.get(String(m.person_id));
        const age=ageFromDob(p?.date_of_birth);
        const profiles=(profilesByPerson.get(String(m.person_id))||[]).filter((sp:any)=>!configuredSportIds.size||configuredSportIds.has(String(sp.sport_id)));
        const primaryProfile=profiles.find((sp:any)=>String(sp.sport_id)===primarySportId)||profiles[0]||null;
        const primarySport=primaryProfile?sportMap.get(String(primaryProfile.sport_id)):primarySportId?sportMap.get(primarySportId):null;
        const quality=dataQualityIssues(p,m);
        const externalRating=primaryProfile?.rating_value??primaryProfile?.dupr_doubles_rating??primaryProfile?.dupr_rating??null;
        return {
          person_id:m.person_id,full_name:p?.full_name||pl?.full_name||'Member',alternate_names:m.alternate_names||[],
          email:p?.primary_email||pl?.email||null,mobile:p?.mobile||pl?.phone||null,date_of_birth:p?.date_of_birth||null,
          age,age_group:ageGroup(age),postal_code:p?.postal_code||null,
          emergency_contact:p?.emergency_contact_name||p?.emergency_contact_raw||null,emergency_mobile:p?.emergency_mobile||null,
          member_id:m.member_id||null,membership_season:m.membership_season||null,membership_type:m.membership_type||null,
          membership_status:m.membership_status||null,relationship_type:m.relationship_type||rel?.relationship_type||null,
          payment_status:m.payment_status||rel?.payment_status||null,payment_date:m.payment_date||rel?.payment_date||null,
          membership_fee:m.membership_fee??rel?.membership_amount??null,membership_category:rel?.membership_category||null,
          primary_sport:primarySport?.name||primaryProfile?.sport||null,primary_sport_id:primaryProfile?.sport_id||primarySportId||null,
          skill_level:primaryProfile?.skill_level||null,playing_category:primaryProfile?.playing_category||null,
          external_rating:externalRating,external_rating_id:primaryProfile?.external_rating_id||primaryProfile?.dupr_id||null,
          rating_system:primaryProfile?.rating_system||null,
          sport_profiles:profiles.map((sp:any)=>({
            id:sp.id,sport_id:sp.sport_id,sport_name:sportMap.get(String(sp.sport_id))?.name||sp.sport||'Sport',
            status:sp.status||null,experience_type:sp.experience_type||null,skill_level:sp.skill_level||null,
            playing_category:sp.playing_category||null,preferred_side:sp.preferred_side||null,
            rating_system:sp.rating_system||null,external_rating_id:sp.external_rating_id||sp.dupr_id||null,
            rating_value:sp.rating_value??sp.dupr_doubles_rating??sp.dupr_rating??null,
            rating_metadata_json:sp.rating_metadata_json||null,rating_source:sp.rating_source||null,rating_last_synced:sp.rating_last_synced||sp.dupr_last_synced||null,
            dupr_id:sp.dupr_id||null,dupr_rating:sp.dupr_rating??null,dupr_singles_rating:sp.dupr_singles_rating??null,dupr_doubles_rating:sp.dupr_doubles_rating??null,
            notes:sp.notes||null
          })),
          linked:!!(p?.linked_user_id||pl?.user_id||pl?.linked_user_email),linked_user_id:p?.linked_user_id||pl?.user_id||null,
          quality_issues:quality,quality_count:quality.length,duplicate_flag:m.duplicate_flag||null,
          include_in_rallyhub:m.include_in_rallyhub!==false
        };
      });
      const counts={
        total:rows.length,
        active:rows.filter((r:any)=>r.membership_status==='paid_active').length,
        pending:rows.filter((r:any)=>r.membership_status==='pending_payment').length,
        unpaid:rows.filter((r:any)=>r.payment_status==='pending'||r.membership_status==='pending_payment').length,
        incomplete:rows.filter((r:any)=>r.quality_count>0).length,
        linked:rows.filter((r:any)=>r.linked).length,
        duplicateReview:rows.filter((r:any)=>r.quality_issues.includes('duplicate_review')).length
      };
      return Response.json({success:true,rows,total:rows.length,counts});
    }

    if(action==='admin_save_view'){
      const name=clean(body.name,120);
      if(!name) return Response.json({error:'View name required'},{status:400});
      const now=new Date().toISOString();
      const data={
        tenant_id:tenantId,club_id:clubId,user_id:user.id,name,
        visible_fields:Array.isArray(body.visibleFields)?body.visibleFields.map((x:any)=>clean(x,80)).filter(Boolean).slice(0,60):[],
        filters_json:JSON.stringify(body.filters&&typeof body.filters==='object'?body.filters:{}),
        sort_field:clean(body.sortField,80)||'full_name',
        sort_direction:body.sortDirection==='desc'?'desc':'asc',
        is_default:body.isDefault===true,updated_at:now
      };
      let view:any=null;
      const viewId=clean(body.viewId,180);
      if(viewId){
        view=await first(base44,'MembershipSavedView',{id:viewId,tenant_id:tenantId,club_id:clubId,user_id:user.id});
        if(!view) return Response.json({error:'Saved view not found'},{status:404});
        view=await base44.asServiceRole.entities.MembershipSavedView.update(view.id,data);
      }else{
        view=await base44.asServiceRole.entities.MembershipSavedView.create({...data,created_at:now});
      }
      if(data.is_default){
        const others=await base44.asServiceRole.entities.MembershipSavedView.filter({tenant_id:tenantId,club_id:clubId,user_id:user.id},'name',100);
        for(const other of others||[]) if(String(other.id)!==String(view.id)&&other.is_default) await base44.asServiceRole.entities.MembershipSavedView.update(other.id,{is_default:false});
      }
      return Response.json({success:true,view:{id:view.id,name:view.name,visible_fields:view.visible_fields||[],filters_json:view.filters_json||'{}',sort_field:view.sort_field||'full_name',sort_direction:view.sort_direction||'asc',is_default:view.is_default===true}});
    }

    if(action==='admin_delete_view'){
      const viewId=clean(body.viewId,180);
      const view=await first(base44,'MembershipSavedView',{id:viewId,tenant_id:tenantId,club_id:clubId,user_id:user.id});
      if(!view) return Response.json({error:'Saved view not found'},{status:404});
      await base44.asServiceRole.entities.MembershipSavedView.delete(view.id);
      return Response.json({success:true});
    }

    if(action==='admin_update'){
      const personId=clean(body.personId,180);
      if(!personId) return Response.json({error:'personId required'},{status:400});
      const person=await first(base44,'Person',{id:personId,tenant_id:tenantId});
      const membership=await first(base44,'ClubMembership',{tenant_id:tenantId,club_id:clubId,person_id:personId});
      if(!person||!membership) return Response.json({error:'Member not found in active club'},{status:404});
      const personInput=body.person&&typeof body.person==='object'?body.person:{};
      const membershipInput=body.membership&&typeof body.membership==='object'?body.membership:{};
      const personPatch:any={};
      const stringPersonFields=['full_name','preferred_name','primary_email','mobile','date_of_birth','gender','full_postal_address','address_line1','address_line2','town_city','county_region','postal_code','country','preferred_language','communication_preference','emergency_contact_name','emergency_contact_relationship','emergency_mobile','secondary_emergency_contact_name','secondary_emergency_contact_mobile'];
      for(const key of stringPersonFields){
        if(Object.prototype.hasOwnProperty.call(personInput,key)){
          const value=clean(personInput[key],key==='full_postal_address'?600:240);
          if(key==='date_of_birth'&&value&&!/^\d{4}-\d{2}-\d{2}$/.test(value)) return Response.json({error:'Date of birth must use YYYY-MM-DD.'},{status:400});
          personPatch[key]=value||null;
        }
      }
      const membershipPatch:any={};
      const stringMembershipFields=['member_id','membership_season','membership_type','join_date','renewal_date','expiry_date','duplicate_flag','admin_notes'];
      for(const key of stringMembershipFields){
        if(Object.prototype.hasOwnProperty.call(membershipInput,key)) membershipPatch[key]=clean(membershipInput[key],key==='admin_notes'?1200:240)||null;
      }
      if(Object.prototype.hasOwnProperty.call(membershipInput,'membership_status')){
        const v=clean(membershipInput.membership_status,60); if(!MEMBERSHIP_STATUS.includes(v)) return Response.json({error:'Invalid membership status.'},{status:400}); membershipPatch.membership_status=v;
      }
      if(Object.prototype.hasOwnProperty.call(membershipInput,'relationship_type')){
        const v=clean(membershipInput.relationship_type,60); if(!RELATIONSHIP_TYPE.includes(v)) return Response.json({error:'Invalid relationship type.'},{status:400}); membershipPatch.relationship_type=v;
      }
      if(Object.prototype.hasOwnProperty.call(membershipInput,'payment_status')){
        const v=clean(membershipInput.payment_status,60); if(!PAYMENT_STATUS.includes(v)) return Response.json({error:'Invalid payment status.'},{status:400}); membershipPatch.payment_status=v;
      }
      if(Object.prototype.hasOwnProperty.call(membershipInput,'payment_date')) membershipPatch.payment_date=clean(membershipInput.payment_date,20)||null;
      if(Object.prototype.hasOwnProperty.call(membershipInput,'membership_fee')){
        const n=Number(membershipInput.membership_fee); if(!Number.isFinite(n)||n<0) return Response.json({error:'Membership fee must be a valid non-negative amount.'},{status:400}); membershipPatch.membership_fee=Math.round(n*100)/100;
      }
      if(Object.prototype.hasOwnProperty.call(membershipInput,'include_in_rallyhub')) membershipPatch.include_in_rallyhub=membershipInput.include_in_rallyhub!==false;

      const changedFields=[...Object.keys(personPatch).map(k=>'person.'+k),...Object.keys(membershipPatch).map(k=>'membership.'+k)];
      if(Object.keys(personPatch).length) await base44.asServiceRole.entities.Person.update(person.id,personPatch);
      if(Object.keys(membershipPatch).length) await base44.asServiceRole.entities.ClubMembership.update(membership.id,membershipPatch);

      const relationship=await first(base44,'ClubRelationship',{tenant_id:tenantId,club_id:clubId,person_id:personId});
      const relationshipPatch:any={};
      if(membershipPatch.relationship_type) relationshipPatch.relationship_type=membershipPatch.relationship_type;
      if(membershipPatch.membership_status) relationshipPatch.status=['paid_active'].includes(membershipPatch.membership_status)?'active':membershipPatch.membership_status==='former_member'?'archived':'pending';
      if(membershipPatch.member_id!==undefined) relationshipPatch.membership_id=membershipPatch.member_id;
      if(membershipPatch.membership_type!==undefined) relationshipPatch.membership_type=membershipPatch.membership_type;
      if(membershipPatch.membership_season!==undefined) relationshipPatch.membership_season=membershipPatch.membership_season;
      if(membershipPatch.payment_status!==undefined) relationshipPatch.payment_status=membershipPatch.payment_status;
      if(membershipPatch.payment_date!==undefined) relationshipPatch.payment_date=membershipPatch.payment_date;
      if(membershipPatch.membership_fee!==undefined) relationshipPatch.membership_amount=membershipPatch.membership_fee;
      if(Object.prototype.hasOwnProperty.call(membershipInput,'membership_category')) relationshipPatch.membership_category=clean(membershipInput.membership_category,60)||null;
      if(relationship&&Object.keys(relationshipPatch).length) await base44.asServiceRole.entities.ClubRelationship.update(relationship.id,relationshipPatch);

      const configuredClubSports=await base44.asServiceRole.entities.ClubSport.filter({tenant_id:tenantId,club_id:clubId,status:'active'},'-is_primary',100);
      const allowedSportIds=new Set((configuredClubSports||[]).map((x:any)=>String(x.sport_id)));
      const clubSportBySportId=new Map((configuredClubSports||[]).map((x:any)=>[String(x.sport_id),x]));
      const submittedProfiles=Array.isArray(body.sportProfiles)?body.sportProfiles:[];
      for(const input of submittedProfiles){
        const sportId=clean(input?.sport_id,180);
        if(!sportId||!allowedSportIds.has(String(sportId))) continue;
        let profile=input?.id?await first(base44,'SportProfile',{id:clean(input.id,180),tenant_id:tenantId,person_id:personId}):await first(base44,'SportProfile',{tenant_id:tenantId,person_id:personId,sport_id:sportId});
        const configuredSettings=sportSettings(clubSportBySportId.get(String(sportId)));
        const ratingMeta=input?.rating_metadata&&typeof input.rating_metadata==='object'?input.rating_metadata:parseJson(input?.rating_metadata_json,{});
        const patch:any={
          sport_id:sportId,
          primary_club_id:clubId,
          status:['active','inactive'].includes(clean(input?.status,40))?clean(input.status,40):'active',
          experience_type:['current','previous','interested'].includes(clean(input?.experience_type,40))?clean(input.experience_type,40):'current',
          skill_level:clean(input?.skill_level,120)||null,
          playing_category:clean(input?.playing_category,120)||null,
          preferred_side:clean(input?.preferred_side,80)||null,
          rating_system:clean(input?.rating_system,80)||configuredSettings?.rating?.system||null,
          external_rating_id:clean(input?.external_rating_id,160)||null,
          rating_metadata_json:Object.keys(ratingMeta||{}).length?JSON.stringify(ratingMeta):null,
          rating_source:clean(input?.rating_source,160)||null,
          notes:clean(input?.notes,1000)||null
        };
        if(input?.rating_value===null||input?.rating_value==='') patch.rating_value=null;
        else if(input?.rating_value!==undefined){const n=Number(input.rating_value); if(Number.isFinite(n)) patch.rating_value=n;}
        // Provider-specific legacy fields are adapters only. They are not the authoritative multi-sport model.
        if(configuredSettings?.rating?.legacy_adapter==='dupr'){
          patch.dupr_id=patch.external_rating_id;
          patch.dupr_rating=patch.rating_value??null;
          const singles=ratingMeta?.singles, doubles=ratingMeta?.doubles;
          patch.dupr_singles_rating=singles===null||singles===''?null:Number.isFinite(Number(singles))?Number(singles):profile?.dupr_singles_rating??null;
          patch.dupr_doubles_rating=doubles===null||doubles===''?null:Number.isFinite(Number(doubles))?Number(doubles):patch.rating_value??profile?.dupr_doubles_rating??null;
        }
        if(profile) await base44.asServiceRole.entities.SportProfile.update(profile.id,patch);
        else await base44.asServiceRole.entities.SportProfile.create({tenant_id:tenantId,person_id:personId,...patch});
        changedFields.push('sport_profile.'+sportId);
      }

      // Player is a legacy competition adapter. Keep it in sync without making it authoritative.
      const player=await first(base44,'Player',{tenant_id:tenantId,club_id:clubId,person_id:personId});
      if(player){
        const playerPatch:any={};
        if(personPatch.full_name!==undefined) playerPatch.full_name=personPatch.full_name;
        if(personPatch.primary_email!==undefined) playerPatch.email=personPatch.primary_email;
        if(personPatch.mobile!==undefined) playerPatch.phone=personPatch.mobile;
        if(personPatch.gender!==undefined&&['Male','Female','Non-binary','Prefer not to say'].includes(personPatch.gender)) playerPatch.gender=personPatch.gender;
        const primarySportId=String((configuredClubSports||[]).find((x:any)=>x.is_primary)?.sport_id||(configuredClubSports||[])[0]?.sport_id||'');
        const primarySubmitted=submittedProfiles.find((x:any)=>String(x?.sport_id||'')===primarySportId);
        const primaryConfig=sportSettings(clubSportBySportId.get(primarySportId));
        if(primarySubmitted&&primaryConfig?.rating?.legacy_adapter==='dupr'){
          // Existing pickleball competition screens still consume legacy Player DUPR fields.
          // Only the configured adapter mirrors into them; SportProfile remains authoritative.
          if(primarySubmitted.external_rating_id!==undefined) playerPatch.dupr_id=clean(primarySubmitted.external_rating_id,160)||null;
          const rating=primarySubmitted.rating_value;
          if(rating!==undefined&&rating!==null&&rating!==''){const n=Number(rating);if(Number.isFinite(n)) playerPatch.dupr_rating=n;}
          if(primarySubmitted.skill_rating!==undefined){const n=Number(primarySubmitted.skill_rating);if(Number.isFinite(n)) playerPatch.skill_rating=n;}
        }
        if(Object.keys(playerPatch).length) await base44.asServiceRole.entities.Player.update(player.id,playerPatch);
      }

      try{
        await base44.asServiceRole.entities.AuditLog.create({
          tenant_id:tenantId,club_id:clubId,user_id:user.id,action:'membership_record_updated',
          entity_type:'Person',entity_id:personId,scope_type:'Club',scope_id:clubId,
          before_state:JSON.stringify({membership_status:membership.membership_status,payment_status:membership.payment_status}),
          after_state:JSON.stringify({changed_fields:Array.from(new Set(changedFields)),membership_status:membershipPatch.membership_status??membership.membership_status,payment_status:membershipPatch.payment_status??membership.payment_status}),
          reason:clean(body.reason,500)||'Membership Console update'
        });
      }catch{}
      const updatedPerson=await first(base44,'Person',{id:personId,tenant_id:tenantId});
      const updatedPlayer=await first(base44,'Player',{tenant_id:tenantId,club_id:clubId,person_id:personId});
      return Response.json({success:true,record:await fullRecord(base44,tenantId,clubId,updatedPerson,updatedPlayer)});
    }

    if(action==='admin_add_training'){
      const personId=clean(body.personId,180), trainingName=clean(body.trainingName,220), sportId=clean(body.sportId,180);
      if(!personId||!trainingName) return Response.json({error:'Person and training name are required.'},{status:400});
      const person=await first(base44,'Person',{id:personId,tenant_id:tenantId});
      if(!person||!await first(base44,'ClubMembership',{tenant_id:tenantId,club_id:clubId,person_id:personId})) return Response.json({error:'Member not found.'},{status:404});
      let sportName='';
      if(sportId){
        const clubSport=await first(base44,'ClubSport',{tenant_id:tenantId,club_id:clubId,sport_id:sportId,status:'active'});
        if(!clubSport) return Response.json({error:'Sport is not configured for this club.'},{status:409});
        sportName=clean((await first(base44,'Sport',{id:sportId}))?.name,120);
      }
      const status=['planned','attended','completed','not_completed','expired'].includes(clean(body.status,60))?clean(body.status,60):'completed';
      const row=await base44.asServiceRole.entities.TrainingRecord.create({
        tenant_id:tenantId,club_id:clubId,person_id:personId,sport:sportName||undefined,training_name:trainingName,
        level_category:clean(body.levelCategory,160)||undefined,provider:clean(body.provider,180)||undefined,
        coach_instructor:clean(body.coachInstructor,180)||undefined,start_date:clean(body.startDate,20)||undefined,
        completion_date:clean(body.completionDate,20)||undefined,venue:clean(body.venue,220)||undefined,status,
        result:clean(body.result,240)||undefined,certificate_number:clean(body.certificateNumber,180)||undefined,
        expiry_date:clean(body.expiryDate,20)||undefined,source_system:'rallyhub_membership_console',notes:clean(body.notes,1000)||undefined
      });
      try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:tenantId,club_id:clubId,user_id:user.id,action:'member_training_added',entity_type:'TrainingRecord',entity_id:row.id,scope_type:'Person',scope_id:personId,after_state:JSON.stringify({training_name:trainingName,status}),reason:'Added from Membership Console'});}catch{}
      return Response.json({success:true,row});
    }

    if(action==='admin_add_qualification'){
      const personId=clean(body.personId,180), title=clean(body.title,220), sportId=clean(body.sportId,180);
      if(!personId||!title) return Response.json({error:'Person and qualification title are required.'},{status:400});
      const person=await first(base44,'Person',{id:personId,tenant_id:tenantId});
      if(!person||!await first(base44,'ClubMembership',{tenant_id:tenantId,club_id:clubId,person_id:personId})) return Response.json({error:'Member not found.'},{status:404});
      let sportName='';
      if(sportId){
        const clubSport=await first(base44,'ClubSport',{tenant_id:tenantId,club_id:clubId,sport_id:sportId,status:'active'});
        if(!clubSport) return Response.json({error:'Sport is not configured for this club.'},{status:409});
        sportName=clean((await first(base44,'Sport',{id:sportId}))?.name,120);
      }
      const verification=['unverified','verified','expired'].includes(clean(body.verificationStatus,60))?clean(body.verificationStatus,60):'unverified';
      const row=await base44.asServiceRole.entities.Qualification.create({
        tenant_id:tenantId,club_id:clubId,person_id:personId,qualification_type:clean(body.qualificationType,160)||undefined,
        sport:sportName||undefined,title,level:clean(body.level,120)||undefined,governing_body:clean(body.governingBody,180)||undefined,
        award_date:clean(body.awardDate,20)||undefined,certificate_number:clean(body.certificateNumber,180)||undefined,
        expiry_date:clean(body.expiryDate,20)||undefined,verification_status:verification,source_system:'rallyhub_membership_console',notes:clean(body.notes,1000)||undefined
      });
      try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:tenantId,club_id:clubId,user_id:user.id,action:'member_qualification_added',entity_type:'Qualification',entity_id:row.id,scope_type:'Person',scope_id:personId,after_state:JSON.stringify({title,verification_status:verification}),reason:'Added from Membership Console'});}catch{}
      return Response.json({success:true,row});
    }

    if(action==='admin_detail'){
      const personId=clean(body.personId,180);
      if(!personId) return Response.json({error:'personId required'},{status:400});
      const person=await first(base44,'Person',{id:personId,tenant_id:tenantId});
      if(!person) return Response.json({error:'Member not found'},{status:404});
      const membership=await first(base44,'ClubMembership',{tenant_id:tenantId,club_id:clubId,person_id:personId});
      if(!membership) return Response.json({error:'Member is not in the active club context'},{status:404});
      const player=await first(base44,'Player',{tenant_id:tenantId,club_id:clubId,person_id:personId});
      return Response.json({success:true,record:await fullRecord(base44,tenantId,clubId,person,player)});
    }

    return Response.json({error:'Unknown action'},{status:400});
  }catch(error){
    console.error('membershipRecord error',error);
    return Response.json({error:(error as any)?.message||'Could not load membership record.'},{status:(error as any)?.status||500});
  }
});
