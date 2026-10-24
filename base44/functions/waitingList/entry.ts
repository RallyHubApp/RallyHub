import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { sendWithConfiguredEmailTransport } from './emailRouter.ts';
import { emailSignatureBlockHtml, emailUtilityMenuHtml } from './emailBrandBlocks.ts';
import { renderBasicBrandedEmail } from './communicationsBasicRenderer.ts';
// Shared email block styling; tenant colours/contact details are supplied by the active brand context.

const clean=(v:any,max=500)=>String(v??'').trim().replace(/\s+/g,' ').slice(0,max);
const raw=(v:any,max=4000)=>String(v??'').trim().slice(0,max);
const lower=(v:any)=>clean(v,240).toLowerCase();
const digits=(v:any)=>clean(v,80).replace(/\D/g,'');
const yesNo=(v:any)=>['yes','no'].includes(String(v||'').toLowerCase())?String(v).toLowerCase():'not_recorded';
const safeUrl=(v:any)=>{const value=clean(v,500);if(!value)return '';try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.toString():''}catch{return ''}};
const escapeHtml=(v:any)=>String(v??'').replace(/[&<>"']/g,(c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } as any)[c]);
const firstName=(v:any)=>clean(v,160).split(/\s+/).filter(Boolean)[0]||'there';

function ageOn(dobValue:any,dateValue:any){
  const dob=String(dobValue||''); if(!/^\d{4}-\d{2}-\d{2}$/.test(dob))return null;
  const date=new Date(dateValue); if(Number.isNaN(date.getTime()))return null;
  const [y,m,d]=dob.split('-').map(Number);
  let age=date.getUTCFullYear()-y;
  if((date.getUTCMonth()+1<m)||((date.getUTCMonth()+1===m)&&date.getUTCDate()<d))age--;
  return age>=0&&age<130?age:null;
}
function currentAge(dobValue:any){return ageOn(dobValue,new Date().toISOString())}
function externalId(){return `rw_${crypto.randomUUID().replaceAll('-','')}`}
async function first(base44:any,entity:string,filter:any,sort='-updated_date'){
  const rows=await base44.asServiceRole.entities[entity].filter(filter,sort,20);
  return rows?.[0]||null;
}
async function clubBrand(base44:any,clubId:string,tenantId:string){
  const club=await first(base44,'Club',{id:clubId,tenant_id:tenantId});
  if(!club)return null;
  const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({tenant_id:tenantId,owner_scope:'tenant',status:'active'},'-updated_date',30);
  const matches=(kits||[]).filter((k:any)=>!k.club_id||String(k.club_id)===String(clubId));
  if(matches.length!==1)throw new Error('Exactly one active approved tenant Communications Centre brand kit is required; no fallback permitted');
  const brandKit=matches[0];
  if(!brandKit.logos?.primary||!brandKit.compliance_footer?.powered_by_html)throw new Error('Approved tenant header/footer assets missing; no fallback permitted');
  return {id:club.id,name:club.name||'',slug:club.slug||'',brandKit,clubRecord:club};
}
async function activeConfig(base44:any,slug:string){
  const rows=await base44.asServiceRole.entities.ClubWaitingListConfig.filter({public_slug:slug,status:'active'},'-updated_date',20);
  return rows?.[0]||null;
}
async function configForClub(base44:any,tenantId:string,clubId:string){
  const rows=await base44.asServiceRole.entities.ClubWaitingListConfig.filter({tenant_id:tenantId,club_id:clubId},'-updated_date',20);
  return (rows||[]).find((r:any)=>r.status==='active')||(rows||[])[0]||null;
}
async function sportName(base44:any,id:string){
  if(!id)return 'sport';
  const sport=await first(base44,'Sport',{id});
  return sport?.name||'sport';
}
function safeConfig(config:any,club:any,sport:string){
  return {
    id:config.id,title:config.title||`${club?.name||'Club'} Waiting List`,programmeName:config.programme_name||'',description:config.description||'',
    publicSlug:config.public_slug,publicEntryUrl:safeUrl(config.public_entry_url),targetSportId:config.target_sport_id||'',targetSportName:sport,
    previousSportsOptions:Array.isArray(config.previous_sports_options)?config.previous_sports_options:[],
    askTargetSportExperience:config.ask_target_sport_experience!==false,askActivityBackground:config.ask_activity_background!==false,
    askMedicalInformation:config.ask_medical_information!==false,consentText:config.consent_text||'',photoVideoText:config.photo_video_text||'',club
  };
}
async function requireClubAdmin(base44:any){
  const user=await base44.auth.me(); if(!user)throw Object.assign(new Error('Authentication required'),{status:401});
  const tenantId=clean(user.active_tenant_id,160),clubId=clean(user.active_club_id,160);
  if(!tenantId||!clubId)throw Object.assign(new Error('Choose an active RallyHub club first.'),{status:400});
  if(user.role!=='admin'){
    const access=await base44.asServiceRole.entities.ClubUserAccess.filter({tenant_id:tenantId,club_id:clubId,user_id:user.id,status:'active',permission_bundle:'club_admin'},'-updated_date',20);
    if(!(access||[]).length)throw Object.assign(new Error('Club administrator access required'),{status:403});
  }
  return {user,tenantId,clubId};
}
const UTILITY_LINKS:any={
  website:{label:'Website',url:'https://clarepickleball.ie/'},
  directory:{label:'RallyHub Directory',url:'https://rallyhub.ie/directory'},
  events:{label:'Events',url:'https://rallyhub.ie/events'},
  feedback:{label:'Feedback',url:'https://rallyhub.ie/contact'},
  facebook:{label:'Facebook',url:'https://www.facebook.com/ClarePickleball/'},
  instagram:{label:'Instagram',url:'https://www.instagram.com/clarepickleball/'},
};
function emailShell(club:any,headline:string,content:string,options:any={}){
  if(!club?.brandKit)throw new Error('Approved tenant Communications Centre brand kit missing; email blocked');
  return renderBasicBrandedEmail(content,club.brandKit,club.clubRecord,club.name,'Waiting List',headline,'',options);
}
async function sendConfirmation(base44:any,config:any,club:any,sport:string,entry:any){
  const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:config.tenant_id,clubId:config.club_id};
  const date=new Intl.DateTimeFormat('en-IE',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(entry.first_joined_at));
  const subject=`You're on the ${club.name} waiting list`;
  const textBody=`Hi ${firstName(entry.full_name)},\n\nThanks for joining the ${club.name} waiting list. We will contact you as soon as a suitable place becomes available.\n\nBeing on the waiting list is not club membership.\n\n${config.signatory_name||club.name}${config.signatory_title?`\n${config.signatory_title}`:''}\n${club.name}\n\nPowered by RallyHub`;
  const htmlBody=emailShell(club,`You're on the waiting list, ${firstName(entry.full_name)}`,`<p style="font-size:15px;line-height:1.65;color:#374151">Thanks for joining the <strong>${escapeHtml(club.name)} waiting list</strong>.</p><p style="font-size:15px;line-height:1.65;color:#374151">We will contact you as soon as a suitable place becomes available.</p><p style="font-size:13px;line-height:1.6;color:#6b7280"><strong>This is not club membership.</strong></p>`,{signature:true,utility:false,utilityLinks:[]});
  try{await sendWithConfiguredEmailTransport(base44,scope,{to:entry.email,subject,textBody,htmlBody});}catch(e){console.error('waiting list confirmation email failed',e?.message||e)}
  if(config.notification_email){
    const adminText=`New waiting-list entry\n\nName: ${entry.full_name}\nJoined: ${date}\nTarget sport: ${sport}\nPrevious sports: ${(entry.previous_sports||[]).join(', ')||'Not recorded'}\nPlayed ${sport} before: ${entry.played_target_sport_before}\n\nReview in RallyHub > Membership > Waiting List.`;
    const adminHtml=emailShell(club,'New waiting-list entry',`<p style="font-size:15px;line-height:1.6"><strong>${escapeHtml(entry.full_name)}</strong> has joined the waiting list.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px"><tr><td style="padding:6px 0;color:#6b7280">Joined</td><td style="padding:6px 0;font-weight:700">${escapeHtml(date)}</td></tr><tr><td style="padding:6px 0;color:#6b7280">Previous sports</td><td style="padding:6px 0;font-weight:700">${escapeHtml((entry.previous_sports||[]).join(', ')||'Not recorded')}</td></tr><tr><td style="padding:6px 0;color:#6b7280">Played ${escapeHtml(sport)} before</td><td style="padding:6px 0;font-weight:700">${escapeHtml(entry.played_target_sport_before)}</td></tr></table>`);
    try{await sendWithConfiguredEmailTransport(base44,scope,{to:config.notification_email,subject:`New ${club.name} waiting-list entry`,textBody:adminText,htmlBody:adminHtml});}catch(e){console.error('waiting list admin email failed',e?.message||e)}
  }
}
function clientRow(row:any,index:number){
  return {...row,queue_position:index+1,current_age:currentAge(row.date_of_birth)};
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'public_get',80);

    if(action.startsWith('admin_')){
      let ctx; try{ctx=await requireClubAdmin(base44)}catch(e){return Response.json({error:e?.message||'Unauthorized'},{status:e?.status||403})}
      const {tenantId,clubId}=ctx;
      const config=await configForClub(base44,tenantId,clubId);
      if(!config)return Response.json({error:'Waiting list is not configured for this club.'},{status:404});
      const [club,sport]=await Promise.all([clubBrand(base44,clubId,tenantId),sportName(base44,config.target_sport_id)]);
      if(action==='admin_preview_email'){
        const signature=body.signature!==false;
        const utility=body.utility===true;
        const utilityLinks=Array.isArray(body.utilityLinks)?body.utilityLinks.map((x:any)=>clean(x,40)).slice(0,12):[];
        const html=emailShell(club,"You're on the waiting list, John",`<p style="font-size:15px;line-height:1.65;color:#374151">Thanks for joining the <strong>${escapeHtml(club.name)} waiting list</strong>.</p><p style="font-size:15px;line-height:1.65;color:#374151">We will contact you as soon as a suitable place becomes available.</p><p style="font-size:13px;line-height:1.6;color:#6b7280"><strong>This is not club membership.</strong></p>`,{signature,utility,utilityLinks});
        return Response.json({success:true,html,signature,utility,utilityLinks});
      }
      if(action==='admin_count'||action==='admin_list'){
        const all=await base44.asServiceRole.entities.WaitingListEntry.filter({tenant_id:tenantId,club_id:clubId},'first_joined_at',500);
        const active=(all||[]).filter((x:any)=>x.active!==false&&!['removed','declined','completed_course'].includes(String(x.status||'')));
        const inactive=(all||[]).filter((x:any)=>x.active===false);
        const counts={total:(all||[]).length,waiting:active.filter((x:any)=>x.status==='waiting').length,active:active.length,inactive:inactive.length,priority:active.filter((x:any)=>x.priority_flag===true).length,targetExperience:active.filter((x:any)=>x.played_target_sport_before==='yes').length,racketExperience:active.filter((x:any)=>x.has_racket_sport_experience===true).length,medicalProvided:active.filter((x:any)=>x.medical_response_status==='provided').length,review:active.filter((x:any)=>x.identity_review_required===true||(x.data_quality_flags||[]).length>0).length};
        const publicUrl=safeUrl(config.public_entry_url)||`https://rallyhub.ie/waiting-list/${encodeURIComponent(config.public_slug)}`;
        if(action==='admin_count')return Response.json({success:true,counts,oldestJoinedAt:active[0]?.first_joined_at||null,publicUrl});
        return Response.json({success:true,config:safeConfig(config,club,sport),counts,publicUrl,rows:(all||[]).map(clientRow)});
      }
      if(action==='admin_update'){
        const id=clean(body.entryId,160); const entry=await first(base44,'WaitingListEntry',{id,tenant_id:tenantId,club_id:clubId});
        if(!entry)return Response.json({error:'Waiting-list entry not found.'},{status:404});
        const patch:any={};
        if(body.status!==undefined&&['waiting','contacted','offered_course','booked_course','completed_course','deferred','declined','removed'].includes(String(body.status)))patch.status=String(body.status);
        if(body.priorityFlag!==undefined)patch.priority_flag=body.priorityFlag===true;
        if(body.priorityReason!==undefined)patch.priority_reason=clean(body.priorityReason,1000);
        if(body.adminNotes!==undefined)patch.admin_notes=raw(body.adminNotes,4000);
        if(body.identityReviewRequired!==undefined)patch.identity_review_required=body.identityReviewRequired===true;
        const updated=await base44.asServiceRole.entities.WaitingListEntry.update(entry.id,patch);
        return Response.json({success:true,entry:updated});
      }
      if(action==='admin_toggle_active'){
        const id=clean(body.entryId,160); const entry=await first(base44,'WaitingListEntry',{id,tenant_id:tenantId,club_id:clubId});
        if(!entry)return Response.json({error:'Waiting-list entry not found.'},{status:404});
        const makeActive=body.active===true;
        const now=new Date().toISOString();
        const patch:any=makeActive
          ? {active:true,reactivated_at:now}
          : {active:false,deactivated_at:now,deactivation_reason:clean(body.reason,1000)};
        const updated=await base44.asServiceRole.entities.WaitingListEntry.update(entry.id,patch);
        return Response.json({success:true,entry:updated});
      }
      return Response.json({error:'Invalid waiting-list admin action.'},{status:400});
    }

    const slug=clean(body.clubSlug||body.publicSlug,120);
    const config=await activeConfig(base44,slug);
    if(!config)return Response.json({error:'The waiting list is not currently open for this club.'},{status:404});
    const [club,sport]=await Promise.all([clubBrand(base44,config.club_id,config.tenant_id),sportName(base44,config.target_sport_id)]);
    if(action==='public_get')return Response.json({success:true,config:safeConfig(config,club,sport)});
    if(action!=='public_submit')return Response.json({error:'Invalid waiting-list action.'},{status:400});

    const fullName=clean(body.fullName,180),address=raw(body.fullPostalAddress,1200),postal=clean(body.postalCode,60),email=lower(body.email),mobile=clean(body.mobile,80),dob=clean(body.dateOfBirth,20);
    if(!fullName||fullName.split(/\s+/).length<2)return Response.json({error:'Please enter your full name.'},{status:400});
    if(!address||!postal)return Response.json({error:'Please enter your full postal address and Eircode / postcode.'},{status:400});
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return Response.json({error:'Please enter a valid email address.'},{status:400});
    if(digits(mobile).length<8)return Response.json({error:'Please enter a valid mobile number.'},{status:400});
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dob))return Response.json({error:'Please enter your date of birth.'},{status:400});
    if(body.gdprConsent!==true)return Response.json({error:'Please accept the data protection consent.'},{status:400});
    const photo=yesNo(body.photoVideoConsent); if(photo==='not_recorded')return Response.json({error:'Please choose Yes or No for photo/video consent.'},{status:400});
    const targetExp=yesNo(body.playedTargetSportBefore); if(config.ask_target_sport_experience!==false&&targetExp==='not_recorded')return Response.json({error:`Please tell us whether you have played ${sport} before.`},{status:400});
    const medicalAnswer=yesNo(body.medicalResponse); if(config.ask_medical_information!==false&&medicalAnswer==='not_recorded')return Response.json({error:'Please answer the health/medical information question.'},{status:400});
    const medicalNotes=raw(body.medicalNotes,2500); if(medicalAnswer==='yes'&&!medicalNotes)return Response.json({error:'Please add the relevant medical, injury or health information.'},{status:400});
    const activityLevel=['low','occasional','regular','very_active'].includes(String(body.activityLevel||''))?String(body.activityLevel):'not_recorded';
    const allowedSports=Array.isArray(config.previous_sports_options)?config.previous_sports_options.map(String):[];
    const previousSports=Array.isArray(body.previousSports)?body.previousSports.map((x:any)=>clean(x,80)).filter((x:string)=>x&&(!allowedSports.length||allowedSports.includes(x))).slice(0,30):[];
    const now=new Date().toISOString();
    const normalizedMobile=digits(mobile);
    const candidates=await base44.asServiceRole.entities.WaitingListEntry.filter({tenant_id:config.tenant_id,club_id:config.club_id},'first_joined_at',500);
    let existing=(candidates||[]).find((x:any)=>String(x.date_of_birth||'')===dob&&((lower(x.email)===email&&email)||(digits(x.mobile)===normalizedMobile&&normalizedMobile)))||null;
    const patch:any={config_id:config.id,target_sport_id:config.target_sport_id,status:existing?.status||'waiting',active:existing?existing.active!==false:true,last_response_at:now,full_name:fullName,full_postal_address:address,postal_code:postal,email,mobile,date_of_birth:dob,gdpr_consent:true,photo_video_consent:photo,previous_sports:previousSports,previous_sports_response_status:'recorded',has_racket_sport_experience:previousSports.length>0,other_sports_text:raw(body.otherSportsText,1000),played_target_sport_before:targetExp,target_sport_experience_duration:targetExp==='yes'?clean(body.targetSportExperienceDuration,120):'',target_sport_level:targetExp==='yes'?clean(body.targetSportLevel,120):'',activity_level:activityLevel,activity_background:raw(body.activityBackground,1500),medical_response_status:medicalAnswer==='yes'?'provided':'none',medical_information_provided:medicalAnswer==='yes',medical_notes:medicalAnswer==='yes'?medicalNotes:'',source_system:existing?.source_system||'rallyhub_waiting_list',source_response_count:Number(existing?.source_response_count||0)+1};
    let entry:any;
    if(existing){entry=await base44.asServiceRole.entities.WaitingListEntry.update(existing.id,patch)}
    else{entry=await base44.asServiceRole.entities.WaitingListEntry.create({tenant_id:config.tenant_id,club_id:config.club_id,first_joined_at:now,age_at_join:ageOn(dob,now),priority_flag:false,identity_review_required:false,data_quality_flags:[],source_external_id:externalId(),source_first_row:'rallyhub',...patch})}
    try{await base44.asServiceRole.entities.WaitingListSourceResponse.create({tenant_id:config.tenant_id,club_id:config.club_id,waiting_list_entry_id:entry.id,entry_source_external_id:entry.source_external_id||'',source_system:'rallyhub_waiting_list',source_file_name:'RallyHub public waiting-list form',source_row:crypto.randomUUID(),source_timestamp:now,source_account_email:email,full_name:fullName,full_postal_address:address,postal_code:postal,email,mobile_raw:mobile,mobile_normalized:normalizedMobile,date_of_birth:dob,gdpr_response:'Yes',previous_sports_response:previousSports.join(', '),raw_response_json:JSON.stringify({previousSports,otherSportsText:body.otherSportsText||'',playedTargetSportBefore:targetExp,targetSportExperienceDuration:body.targetSportExperienceDuration||'',targetSportLevel:body.targetSportLevel||'',activityLevel,activityBackground:body.activityBackground||'',medicalResponse:medicalAnswer,photoVideoConsent:photo}),imported_at:now})}catch(e){console.error('waiting list source response write failed',e?.message||e)}
    if(!existing)await sendConfirmation(base44,config,club,sport,entry);
    return Response.json({success:true,reused:!!existing,entry:{id:entry.id,fullName:entry.full_name,firstJoinedAt:entry.first_joined_at,status:entry.status},message:existing?'Your waiting-list details have been updated. Your original waiting-list timestamp has been kept.':'You have been added to the waiting list.'});
  }catch(error){console.error('waitingList error',error);return Response.json({error:error?.message||'Waiting-list request failed.'},{status:500})}
});
