import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean=(v:any,max=500)=>String(v??'').trim().slice(0,max);
const lower=(v:any)=>clean(v,240).toLowerCase();
const nameKey=(v:any)=>lower(v).replace(/[’‘]/g,"'").replace(/[^a-z0-9]+/g,' ').trim();

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
      const [members,people,players]=await Promise.all([
        base44.asServiceRole.entities.ClubMembership.filter({tenant_id:tenantId,club_id:clubId},'member_id',500),
        base44.asServiceRole.entities.Person.filter({tenant_id:tenantId},'full_name',500),
        base44.asServiceRole.entities.Player.filter({tenant_id:tenantId,club_id:clubId},'full_name',500)
      ]);
      const personMap=new Map((people||[]).map((p:any)=>[String(p.id),p]));
      const playerMap=new Map((players||[]).filter((p:any)=>p.person_id).map((p:any)=>[String(p.person_id),p]));
      const rows=(members||[]).map((m:any)=>{
        const p:any=personMap.get(String(m.person_id)), pl:any=playerMap.get(String(m.person_id));
        const age=ageFromDob(p?.date_of_birth);
        return {
          person_id:m.person_id,full_name:p?.full_name||pl?.full_name||'Member',alternate_names:m.alternate_names||[],email:p?.primary_email||pl?.email||null,
          mobile:p?.mobile||pl?.phone||null,date_of_birth:p?.date_of_birth||null,age,age_group:ageGroup(age),
          postal_code:p?.postal_code||null,member_id:m.member_id||null,membership_season:m.membership_season||null,
          membership_type:m.membership_type||null,membership_status:m.membership_status||null,payment_status:m.payment_status||null,
          payment_date:m.payment_date||null,membership_fee:m.membership_fee??null,dupr_id:pl?.dupr_id||null,
          dupr_rating:pl?.dupr_rating??null,skill_rating:pl?.skill_rating??null,linked:!!(p?.linked_user_id||pl?.user_id||pl?.linked_user_email),
          data_quality_flags:[...(p?.data_quality_flags||[]),...(m?.data_quality_flags||[])]
        };
      });
      return Response.json({success:true,rows,total:rows.length});
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
