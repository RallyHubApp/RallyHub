import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { tenantCapabilityDecision } from './tenantCapability.ts';

const APP_URL='https://rallyhub.ie';
const clean=(v:any,max=500)=>String(v??'').trim().slice(0,max);
const email=(v:any)=>clean(v,240).toLowerCase();
const nowIso=()=>new Date().toISOString();
const dayMs=24*60*60*1000;
function slugify(v:any){return clean(v,120).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70)||'club';}
function safeKeys(v:any){return Array.isArray(v)?[...new Set(v.map((x:any)=>clean(x,180)).filter(Boolean))]:[];}
function randomToken(){const b=new Uint8Array(32);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');}
async function sha256(value:string){const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');}
async function audit(base44:any,user:any,tenantId:string,action:string,type:string,id:string,state:any,reason=''){
  try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:tenantId||'platform',club_id:state?.club_id||undefined,user_id:user?.id||undefined,action,entity_type:type,entity_id:id,scope_type:type,scope_id:id,after_state:JSON.stringify(state||{}),reason});}catch(e){console.warn('trial audit skipped',action,(e as any)?.message||e)}
}
async function activeAgreement(base44:any){
  const rows=await base44.asServiceRole.entities.RallyHubLegalAgreement.filter({agreement_key:'rallyhub_trial_evaluation',status:'active'});
  return (rows||[]).sort((a:any,b:any)=>Date.parse(b.updated_date||b.created_date||0)-Date.parse(a.updated_date||a.created_date||0))[0]||null;
}
async function trialCapabilities(base44:any){
  const rows=await base44.asServiceRole.entities.RallyHubCapability.filter({trial_eligible:true});
  return (rows||[]).filter((r:any)=>r.status!=='retired');
}
async function getApplicationByToken(base44:any,rawToken:string){
  if(!rawToken)return null;const hash=await sha256(rawToken);
  const rows=await base44.asServiceRole.entities.RallyHubTrialApplication.filter({activation_token_hash:hash});
  return (rows||[])[0]||null;
}
async function ownJourney(base44:any,user:any){
  const rows=await base44.asServiceRole.entities.RallyHubTrialJourney.filter({user_id:user.id});
  return (rows||[]).sort((a:any,b:any)=>Date.parse(b.activated_at||b.created_date||0)-Date.parse(a.activated_at||a.created_date||0))[0]||null;
}
async function refreshJourney(base44:any,journey:any){
  if(!journey)return null;
  const expired=journey.expires_at&&Date.parse(journey.expires_at)<Date.now();
  let patch:any={};
  let demoSession:any=null,liveSession:any=null,resultsToken:string|null=null,liveEventGraceActive=false;
  if(journey.demo_tournament_id){
    const s=await base44.asServiceRole.entities.KotcSession.filter({tournament_id:journey.demo_tournament_id});demoSession=s?.[0]||null;
    if(demoSession&&['completed','finalised'].includes(demoSession.status)&&!journey.demo_completed_at)patch.demo_completed_at=demoSession.actual_session_end||demoSession.finalised_at||nowIso();
    if(demoSession?.id&&!journey.demo_session_id)patch.demo_session_id=demoSession.id;
  }
  if(journey.first_live_tournament_id){
    const s=await base44.asServiceRole.entities.KotcSession.filter({tournament_id:journey.first_live_tournament_id});liveSession=s?.[0]||null;
    if(liveSession?.id&&!journey.first_live_session_id)patch.first_live_session_id=liveSession.id;
    if(liveSession&&['completed','finalised'].includes(liveSession.status)&&!journey.first_live_event_completed_at)patch.first_live_event_completed_at=liveSession.actual_session_end||liveSession.finalised_at||nowIso();
    if(liveSession?.id){const shares=await base44.asServiceRole.entities.KotcSessionShare.filter({session_id:liveSession.id,status:'active'}).catch(()=>[]);if(shares?.length){resultsToken=String(shares[0].token||'')||null;if(!journey.results_published_at)patch.results_published_at=shares[0].updated_date||shares[0].created_date||nowIso();}}
  }
  const [spondConnections,spondDrafts]=await Promise.all([
    base44.asServiceRole.entities.ExternalGroupConnection.filter({tenant_id:journey.tenant_id,club_id:journey.club_id,provider:'spond',status:'active'}).catch(()=>[]),
    journey.first_live_tournament_id?base44.asServiceRole.entities.KotcSpondDraft.filter({tenant_id:journey.tenant_id,club_id:journey.club_id,tournament_id:journey.first_live_tournament_id}).catch(()=>[]):Promise.resolve([]),
  ]);
  const spondEvidence=spondConnections?.[0]||spondDrafts?.[0]||null;
  if(spondEvidence&&!journey.spond_connected_at)patch.spond_connected_at=spondEvidence.last_verified_at||spondEvidence.saved_at||spondEvidence.updated_date||nowIso();
  if(expired&&liveSession?.id&&['in_progress','paused'].includes(String(liveSession.status||''))){
    const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:liveSession.id,user_id:journey.user_id,status:'active'}).catch(()=>[]);
    liveEventGraceActive=(grants||[]).some((g:any)=>(!g.starts_at||Date.parse(g.starts_at)<=Date.now())&&(!g.ends_at||Date.parse(g.ends_at)>=Date.now()));
  }
  if(expired&&journey.status==='active')patch.status='expired';
  if(Object.keys(patch).length)journey=await base44.asServiceRole.entities.RallyHubTrialJourney.update(journey.id,{...patch,last_activity_at:nowIso()});
  if(expired&&journey.trial_application_id){
    const apps=await base44.asServiceRole.entities.RallyHubTrialApplication.filter({id:journey.trial_application_id}).catch(()=>[]);const app=apps?.[0];
    if(app&&app.status==='activated')await base44.asServiceRole.entities.RallyHubTrialApplication.update(app.id,{status:'expired',expired_at:app.expired_at||nowIso(),expires_at:journey.expires_at}).catch(()=>{});
  }
  return {...journey,expired,demoSession,liveSession,spondConnected:!!spondEvidence,resultsToken,liveEventGraceActive};
}
function publicApplication(row:any){return row?{id:row.id,club_name:row.club_name,contact_name:row.contact_name,contact_role:row.contact_role,status:row.status,trial_days:row.trial_days,selected_capability_keys:row.selected_capability_keys||[],activation_deadline:row.activation_deadline,activated_at:row.activated_at,expires_at:row.expires_at,tenant_id:row.tenant_id,club_id:row.club_id}:null;}

Deno.serve(async(req)=>{try{
  const base44=createClientFromRequest(req);
  const body=await req.json().catch(()=>({}));
  const action=clean(body.action,80)||'public_meta';
  const user=await base44.auth.me().catch(()=>null);

  if(action==='public_meta'){
    const caps=await trialCapabilities(base44);
    return Response.json({success:true,capabilities:caps.filter((c:any)=>c.customer_visible).map((c:any)=>({key:c.key,name:c.display_name,category:c.category,status:c.status,description:c.description||''})),defaultTrialDays:30});
  }

  if(action==='public_submit'){
    const clubName=clean(body.clubName,140),contactName=clean(body.contactName,140),contactRole=clean(body.contactRole,120),contactEmail=email(body.contactEmail),mobile=clean(body.contactMobile,80),intended=clean(body.intendedUse,3000);
    if(!clubName||!contactName||!contactEmail||!contactEmail.includes('@'))return Response.json({error:'Club name, contact name and a valid email are required.'},{status:400});
    if(body.authorityConfirmed!==true)return Response.json({error:'Confirm that you are authorised to apply on behalf of the club.'},{status:400});
    const caps=await trialCapabilities(base44);const allowed=new Set(caps.map((c:any)=>c.key));
    let requested=safeKeys(body.requestedCapabilityKeys).filter(k=>allowed.has(k));if(!requested.length)requested=['tournament.king_of_the_court'];
    if(body.usesSpond===true&&allowed.has('integration.spond')&&!requested.includes('integration.spond'))requested.push('integration.spond');
    const prior=await base44.asServiceRole.entities.RallyHubTrialApplication.filter({contact_email:contactEmail});
    const duplicate=(prior||[]).find((r:any)=>String(r.club_name||'').toLowerCase()===clubName.toLowerCase()&&!['declined','expired'].includes(r.status));
    if(duplicate)return Response.json({success:true,duplicate:true,applicationId:duplicate.id,status:duplicate.status});
    const row=await base44.asServiceRole.entities.RallyHubTrialApplication.create({club_name:clubName,contact_name:contactName,contact_role:contactRole,contact_email:contactEmail,contact_mobile:mobile,approx_membership:Number(body.approxMembership||0)||undefined,uses_spond:body.usesSpond===true,intended_use:intended,requested_start_date:body.requestedStartDate||undefined,requested_capability_keys:requested,authority_confirmed:true,status:'submitted',trial_days:30,submitted_at:nowIso()});
    await audit(base44,user,'platform','trial_application_submitted','RallyHubTrialApplication',row.id,row,'Controlled RallyHub trial application submitted');
    return Response.json({success:true,applicationId:row.id,status:row.status});
  }

  if(!user)return Response.json({error:'Authentication required'},{status:401});

  if(action==='activation_state'){
    const row=await getApplicationByToken(base44,clean(body.token,200));
    if(!row)return Response.json({error:'This activation link is invalid.'},{status:404});
    if(row.status==='activated'){const existing=(await base44.asServiceRole.entities.RallyHubTrialJourney.filter({trial_application_id:row.id}))?.[0];if(existing&&(user.role==='admin'||existing.user_id===user.id||email(user.email)===email(row.contact_email)))return Response.json({success:true,alreadyActivated:true,application:publicApplication(row),journey:await refreshJourney(base44,existing)});}
    if(!['approved','accepted'].includes(row.status))return Response.json({error:`This trial cannot be activated while its status is ${row.status}.`},{status:409});
    if(row.activation_deadline&&Date.parse(row.activation_deadline)<Date.now())return Response.json({error:'This activation link has expired. Ask RallyHub to issue a new one.'},{status:410});
    if(user.role!=='admin'&&email(user.email)!==email(row.contact_email))return Response.json({error:'Sign in with the email address used on the trial application.'},{status:403});
    const agreement=await activeAgreement(base44);if(!agreement)return Response.json({error:'No active RallyHub Trial & Evaluation Agreement is configured.'},{status:503});
    return Response.json({success:true,application:publicApplication(row),agreement:{id:agreement.id,title:agreement.title,version:agreement.version,wording_hash:agreement.wording_hash,body_text:agreement.body_text,jurisdiction:agreement.jurisdiction}});
  }

  if(action==='accept_activate'){
    const token=clean(body.token,200),row=await getApplicationByToken(base44,token);
    if(!row)return Response.json({error:'This activation link is invalid.'},{status:404});
    if(row.status==='activated'){const existing=(await base44.asServiceRole.entities.RallyHubTrialJourney.filter({trial_application_id:row.id}))?.[0];if(existing&&(user.role==='admin'||existing.user_id===user.id||email(user.email)===email(row.contact_email)))return Response.json({success:true,alreadyActivated:true,application:publicApplication(row),journey:await refreshJourney(base44,existing)});}
    if(!['approved','accepted'].includes(row.status))return Response.json({error:`This trial cannot be activated while its status is ${row.status}.`},{status:409});
    if(row.activation_deadline&&Date.parse(row.activation_deadline)<Date.now())return Response.json({error:'This activation link has expired.'},{status:410});
    if(user.role!=='admin'&&email(user.email)!==email(row.contact_email))return Response.json({error:'Sign in with the email address used on the trial application.'},{status:403});
    if(body.authorityConfirmed!==true||body.termsAccepted!==true||body.restrictedSharingConfirmed!==true||body.ipAcknowledged!==true)return Response.json({error:'All required trial confirmations must be accepted.'},{status:400});
    const agreement=await activeAgreement(base44);if(!agreement||clean(body.agreementId,180)!==agreement.id||clean(body.agreementVersion,80)!==agreement.version)return Response.json({error:'The Trial & Evaluation Agreement has changed. Reload and review the current version.'},{status:409});
    const existingJourney=(await base44.asServiceRole.entities.RallyHubTrialJourney.filter({trial_application_id:row.id}))?.[0];
    if(existingJourney){const recovered=await refreshJourney(base44,existingJourney);const repaired=row.status==='activated'?row:await base44.asServiceRole.entities.RallyHubTrialApplication.update(row.id,{status:'activated',applicant_user_id:user.id,activated_at:existingJourney.activated_at||nowIso(),expires_at:existingJourney.expires_at});return Response.json({success:true,alreadyActivated:true,journey:recovered,application:publicApplication(repaired)});}
    const activatedAt=nowIso(),trialDays=Math.max(1,Math.min(90,Number(row.trial_days||30))),expiresAt=new Date(Date.now()+trialDays*dayMs).toISOString();
    const acceptanceRows=await base44.asServiceRole.entities.RallyHubAgreementAcceptance.filter({trial_application_id:row.id,user_id:user.id});
    const acceptance=acceptanceRows?.[0]||await base44.asServiceRole.entities.RallyHubAgreementAcceptance.create({tenant_id:row.tenant_id,club_id:row.club_id,user_id:user.id,trial_application_id:row.id,agreement_id:agreement.id,agreement_key:agreement.agreement_key,agreement_version:agreement.version,wording_hash:agreement.wording_hash,authority_confirmed:true,restricted_sharing_confirmed:true,ip_acknowledged:true,accepted:true,accepted_at:activatedAt,user_agent:clean(body.userAgent||'',500),acceptance_evidence_json:JSON.stringify({authorityConfirmed:true,termsAccepted:true,restrictedSharingConfirmed:true,ipAcknowledged:true,agreementId:agreement.id,agreementVersion:agreement.version,wordingHash:agreement.wording_hash})});
    const tenantAccessRows=await base44.asServiceRole.entities.TenantUserAccess.filter({tenant_id:row.tenant_id,user_id:user.id});if(!tenantAccessRows?.some((a:any)=>a.status==='active'))await base44.asServiceRole.entities.TenantUserAccess.create({tenant_id:row.tenant_id,user_id:user.id,role:'owner',status:'active',approved_by_user_id:row.approved_by_user_id,approved_at:row.approved_at||activatedAt,starts_at:activatedAt,ends_at:expiresAt});
    const clubAccessRows=await base44.asServiceRole.entities.ClubUserAccess.filter({tenant_id:row.tenant_id,club_id:row.club_id,user_id:user.id});if(!clubAccessRows?.some((a:any)=>a.status==='active'))await base44.asServiceRole.entities.ClubUserAccess.create({tenant_id:row.tenant_id,club_id:row.club_id,user_id:user.id,permission_bundle:'member',relationship_type:'member',status:'active',approved_by_user_id:row.approved_by_user_id,approved_at:row.approved_at||activatedAt,starts_at:activatedAt,ends_at:expiresAt});
    const existingEntitlements=await base44.asServiceRole.entities.TenantEntitlement.filter({tenant_id:row.tenant_id});const selected=safeKeys(row.selected_capability_keys);for(const key of selected){const exists=(existingEntitlements||[]).some((e:any)=>e.club_id===row.club_id&&e.capability_key===key&&e.entitlement_type==='trial'&&!['revoked'].includes(e.status));if(!exists)await base44.asServiceRole.entities.TenantEntitlement.create({tenant_id:row.tenant_id,club_id:row.club_id,capability_key:key,entitlement_type:'trial',status:'active',starts_at:activatedAt,ends_at:expiresAt,granted_by_user_id:row.approved_by_user_id,grant_reason:`Controlled trial ${row.id}`,created_at:activatedAt,updated_at:activatedAt});}
    const mailConfigs=await base44.asServiceRole.entities.EmailTransportConfig.filter({scope_type:'tenant',purpose:'club_comms',tenant_id:row.tenant_id,club_id:row.club_id}).catch(()=>[]);
    if(!mailConfigs?.length){await base44.asServiceRole.entities.EmailTransportConfig.create({scope_type:'tenant',purpose:'club_comms',tenant_id:row.tenant_id,club_id:row.club_id,provider:'base44_core',status:'configured',sender_email:'rallyhubapp@gmail.com',sender_name:`${row.club_name} · RallyHub`,reply_to:'rallyhubapp@gmail.com',notes:`Controlled trial ${row.id}. Platform transport only; no access to another tenant's mail gateway.`});}
    const journey=await base44.asServiceRole.entities.RallyHubTrialJourney.create({trial_application_id:row.id,tenant_id:row.tenant_id,club_id:row.club_id,user_id:user.id,status:'active',activated_at:activatedAt,expires_at:expiresAt,agreement_acceptance_id:acceptance.id,last_activity_at:activatedAt});
    await base44.asServiceRole.entities.User.update(user.id,{account_scope:'club',approval_status:'approved',active_tenant_id:row.tenant_id,active_club_id:row.club_id,active_tenant_role:'owner',active_club_role:'member',security_context_updated_at:activatedAt});
    const updated=await base44.asServiceRole.entities.RallyHubTrialApplication.update(row.id,{status:'activated',applicant_user_id:user.id,activated_at:activatedAt,expires_at:expiresAt});
    await audit(base44,user,row.tenant_id,'trial_activated','RallyHubTrialApplication',row.id,updated,'Trial agreement accepted and time-limited access activated');
    return Response.json({success:true,journey,application:publicApplication(updated),redirect:'/app'});
  }

  if(action==='my_state'){
    let journey=await ownJourney(base44,user);if(!journey)return Response.json({success:true,hasTrial:false});journey=await refreshJourney(base44,journey);
    const app=(await base44.asServiceRole.entities.RallyHubTrialApplication.filter({id:journey.trial_application_id}))?.[0]||null;
    const [entitlements,tournamentRows]=await Promise.all([
      base44.asServiceRole.entities.TenantEntitlement.filter({tenant_id:journey.tenant_id}),
      base44.asServiceRole.entities.Tournament.filter({tenant_id:journey.tenant_id}),
    ]);
    const trialTournaments=(tournamentRows||[]).filter((t:any)=>String(t.host_club_id||'')===String(journey.club_id)&&t.format==='King of the Court').map((t:any)=>({id:t.id,name:t.name,status:t.status,start_date:t.start_date,created_date:t.created_date,is_demo:String(t.description||'').includes('RALLYHUB_KOTC_SANDBOX_V1')})).sort((a:any,b:any)=>Date.parse(b.created_date||0)-Date.parse(a.created_date||0));
    const daysRemaining=journey.expires_at?Math.max(0,Math.ceil((Date.parse(journey.expires_at)-Date.now())/dayMs)):null;
    return Response.json({success:true,hasTrial:true,journey,application:publicApplication(app),entitlements:(entitlements||[]).filter((e:any)=>!e.club_id||e.club_id===journey.club_id).map((e:any)=>({capability_key:e.capability_key,status:e.status,starts_at:e.starts_at,ends_at:e.ends_at,entitlement_type:e.entitlement_type})),trialTournaments,daysRemaining});
  }

  if(action==='create_demo_tournament'||action==='create_live_tournament'){
    let journey=await ownJourney(base44,user);journey=await refreshJourney(base44,journey);if(!journey||journey.expired||journey.status!=='active')return Response.json({error:'Your RallyHub trial is not active.'},{status:403});
    const access=await tenantCapabilityDecision(base44,user,'tournament.king_of_the_court',{tenantId:journey.tenant_id,clubId:journey.club_id});if(!access.allowed)return Response.json({error:'King of the Court is not enabled for this trial.'},{status:403});
    if(action==='create_demo_tournament'&&journey.demo_tournament_id){const existing=(await base44.asServiceRole.entities.Tournament.filter({id:journey.demo_tournament_id}))?.[0];if(existing)return Response.json({success:true,tournament:existing,reused:true});}
    if(action==='create_live_tournament'&&body.forceNew!==true){const clubTournaments=await base44.asServiceRole.entities.Tournament.filter({tenant_id:journey.tenant_id});const existing=(clubTournaments||[]).filter((t:any)=>String(t.host_club_id||'')===String(journey.club_id)&&t.format==='King of the Court'&&!String(t.description||'').includes('RALLYHUB_KOTC_SANDBOX_V1')&&!['Completed','Cancelled'].includes(t.status)).sort((a:any,b:any)=>Date.parse(b.created_date||0)-Date.parse(a.created_date||0))[0];if(existing)return Response.json({success:true,tournament:existing,reused:true});}
    const isDemo=action==='create_demo_tournament';
    const guestRoster=isDemo?Array.from({length:16},(_,i)=>({guest_id:`trial-demo-${journey.id}-${String(i+1).padStart(2,'0')}`,display_name:`Demo Player ${String(i+1).padStart(2,'0')}`})):[];
    const guestIds=guestRoster.map((g:any)=>g.guest_id);
    const tournament=await base44.asServiceRole.entities.Tournament.create({name:isDemo?'Guided KOTC Demo':clean(body.name,140)||'My First King of the Court',format:'King of the Court',status:'Draft',start_date:body.startDate||new Date().toISOString().slice(0,10),tenant_id:journey.tenant_id,host_club_id:journey.club_id,player_ids:[],kotc_guest_roster:guestRoster,kotc_player_order:guestIds,kotc_num_courts:isDemo?4:4,kotc_num_rounds:isDemo?4:9,kotc_score_format:'timed_8',counts_toward_leaderboard:false,description:isDemo?'RALLYHUB_KOTC_SANDBOX_V1\nControlled guided trial demo. Synthetic players only; excluded from real aggregates.':clean(body.description,1500)});
    const patch=isDemo?{demo_tournament_id:tournament.id,demo_started_at:nowIso(),last_activity_at:nowIso()}:{...(journey.first_live_tournament_id?{}:{first_live_tournament_id:tournament.id,first_live_event_created_at:nowIso()}),last_activity_at:nowIso()};
    await base44.asServiceRole.entities.RallyHubTrialJourney.update(journey.id,patch);
    await audit(base44,user,journey.tenant_id,isDemo?'trial_demo_created':'trial_live_kotc_created','Tournament',tournament.id,tournament,isDemo?'Synthetic guided KOTC demo':'Trial club created first live KOTC');
    return Response.json({success:true,tournament,reused:false});
  }

  if(action==='update_kotc_tournament'){
    let journey=await ownJourney(base44,user);journey=await refreshJourney(base44,journey);if(!journey||journey.expired||journey.status!=='active')return Response.json({error:'Your RallyHub trial is not active.'},{status:403});
    const tournamentId=clean(body.tournamentId,180);if(!tournamentId)return Response.json({error:'tournamentId required'},{status:400});
    const tournament=(await base44.asServiceRole.entities.Tournament.filter({id:tournamentId}))?.[0];if(!tournament||String(tournament.tenant_id)!==String(journey.tenant_id)||String(tournament.host_club_id)!==String(journey.club_id)||tournament.format!=='King of the Court')return Response.json({error:'This KOTC event is not part of your trial club.'},{status:403});
    const access=await tenantCapabilityDecision(base44,user,'tournament.king_of_the_court',{tenantId:journey.tenant_id,clubId:journey.club_id,eventId:tournamentId});if(!access.allowed)return Response.json({error:'King of the Court is not enabled for this trial.'},{status:403});
    const patch:any={};
    if(body.playerIds!==undefined){const ids=safeKeys(body.playerIds);if(ids.length>200)return Response.json({error:'Roster is too large.'},{status:400});patch.player_ids=ids;}
    if(body.playerOrder!==undefined){const ids=safeKeys(body.playerOrder);if(ids.length>200)return Response.json({error:'Player order is too large.'},{status:400});patch.kotc_player_order=ids;}
    if(body.guestRoster!==undefined){if(!Array.isArray(body.guestRoster)||body.guestRoster.length>200)return Response.json({error:'Guest roster is invalid.'},{status:400});patch.kotc_guest_roster=body.guestRoster.map((g:any)=>({guest_id:clean(g?.guest_id,180),display_name:clean(g?.display_name,160),added_at:g?.added_at||nowIso()})).filter((g:any)=>g.guest_id&&g.display_name);}
    if(!Object.keys(patch).length)return Response.json({error:'No supported KOTC changes supplied.'},{status:400});
    const saved=await base44.asServiceRole.entities.Tournament.update(tournament.id,patch);await base44.asServiceRole.entities.RallyHubTrialJourney.update(journey.id,{last_activity_at:nowIso()});return Response.json({success:true,tournament:saved});
  }

  if(action==='mark_progress'){
    let journey=await ownJourney(base44,user);if(!journey)return Response.json({error:'Trial journey not found'},{status:404});
    const key=clean(body.key,80),allowed:any={demo_completed_at:'demo_completed_at',spond_connected_at:'spond_connected_at',first_live_event_completed_at:'first_live_event_completed_at',results_published_at:'results_published_at',onboarding_dismissed_at:'onboarding_dismissed_at'};
    if(!allowed[key])return Response.json({error:'Unsupported progress key'},{status:400});
    journey=await base44.asServiceRole.entities.RallyHubTrialJourney.update(journey.id,{[allowed[key]]:nowIso(),last_activity_at:nowIso()});return Response.json({success:true,journey});
  }

  if(user.role!=='admin')return Response.json({error:'Super Admin access required'},{status:403});

  if(action==='admin_list'){
    const [applications,caps,agreement]=await Promise.all([base44.asServiceRole.entities.RallyHubTrialApplication.list('-created_date',200),trialCapabilities(base44),activeAgreement(base44)]);
    return Response.json({success:true,applications:applications||[],capabilities:caps||[],agreement:agreement?{id:agreement.id,title:agreement.title,version:agreement.version,status:agreement.status}:null});
  }

  if(action==='admin_approve'){
    const applicationId=clean(body.applicationId,180);let row=(await base44.asServiceRole.entities.RallyHubTrialApplication.filter({id:applicationId}))?.[0];if(!row)return Response.json({error:'Trial application not found'},{status:404});
    if(!['submitted','reviewing','approved'].includes(row.status))return Response.json({error:`Cannot approve a ${row.status} application.`},{status:409});
    const caps=await trialCapabilities(base44),allowed=new Set(caps.map((c:any)=>c.key));let selected=safeKeys(body.selectedCapabilityKeys).filter(k=>allowed.has(k));if(!selected.length)selected=safeKeys(row.requested_capability_keys).filter(k=>allowed.has(k));if(!selected.includes('tournament.king_of_the_court'))selected.unshift('tournament.king_of_the_court');if(row.uses_spond&&allowed.has('integration.spond')&&!selected.includes('integration.spond'))selected.push('integration.spond');
    let tenantId=row.tenant_id,clubId=row.club_id;
    if(!tenantId||!clubId){const suffix=row.id.slice(-6).toLowerCase();const tenant=await base44.asServiceRole.entities.Tenant.create({name:row.club_name,slug:`${slugify(row.club_name)}-${suffix}`,status:'active',timezone:'Europe/Dublin',notes:`Controlled RallyHub trial application ${row.id}`});const club=await base44.asServiceRole.entities.Club.create({tenant_id:tenant.id,name:row.club_name,slug:`${slugify(row.club_name)}-${suffix}`,status:'active',timezone:'Europe/Dublin',public_contact_email:row.contact_email,notes:`Controlled RallyHub trial application ${row.id}`});tenantId=tenant.id;clubId=club.id;await base44.asServiceRole.entities.TenantAccessPolicy.create({tenant_id:tenantId,enforcement_mode:'entitlements_required',trial_mode:true,allow_live_event_grace:true,historical_public_results_after_expiry:true,support_preview_enabled:true,notes:`Controlled trial ${row.id}`});}
    const rawToken=randomToken(),tokenHash=await sha256(rawToken),approvedAt=nowIso(),activationDeadline=new Date(Date.now()+14*dayMs).toISOString(),trialDays=Math.max(1,Math.min(90,Number(body.trialDays||row.trial_days||30)));
    row=await base44.asServiceRole.entities.RallyHubTrialApplication.update(row.id,{status:'approved',approved_by_user_id:user.id,approved_at:approvedAt,tenant_id:tenantId,club_id:clubId,trial_days:trialDays,selected_capability_keys:selected,activation_token_hash:tokenHash,activation_link_issued_at:approvedAt,activation_deadline:activationDeadline,notes:clean(body.notes,3000)||row.notes});
    const activationUrl=`${APP_URL}/trial/activate?token=${encodeURIComponent(rawToken)}`;
    let emailSent=false;try{await base44.asServiceRole.integrations.Core.SendEmail({to:row.contact_email,from_name:'RallyHub',subject:`${row.club_name} · RallyHub trial approved`,body:`Hi ${row.contact_name},\n\nYour controlled RallyHub trial has been approved.\n\nUse this link to sign in (or create your RallyHub account using ${row.contact_email}), review the RallyHub Trial & Evaluation Agreement and activate the ${trialDays}-day trial:\n\n${activationUrl}\n\nThe activation link expires in 14 days. Trial time starts when you accept the agreement and activate.\n\nPlease do not share this link or your RallyHub access with another club.\n\nYours in support,\nBrian Moore\nFounder, RallyHub`});emailSent=true;}catch(e){console.warn('trial approval email failed',(e as any)?.message||e)}
    await audit(base44,user,tenantId,'trial_application_approved','RallyHubTrialApplication',row.id,row,`Approved ${selected.join(', ')}`);
    return Response.json({success:true,application:row,activationUrl,emailSent});
  }

  if(action==='admin_decline'){
    const applicationId=clean(body.applicationId,180),row=(await base44.asServiceRole.entities.RallyHubTrialApplication.filter({id:applicationId}))?.[0];if(!row)return Response.json({error:'Trial application not found'},{status:404});const updated=await base44.asServiceRole.entities.RallyHubTrialApplication.update(row.id,{status:'declined',decline_reason:clean(body.reason,2000)});await audit(base44,user,row.tenant_id||'platform','trial_application_declined','RallyHubTrialApplication',row.id,updated,clean(body.reason,1000));return Response.json({success:true,application:updated});
  }

  if(action==='admin_reissue_activation'){
    const applicationId=clean(body.applicationId,180),row=(await base44.asServiceRole.entities.RallyHubTrialApplication.filter({id:applicationId}))?.[0];if(!row||row.status!=='approved')return Response.json({error:'Only an approved, not-yet-activated trial can be reissued.'},{status:409});const rawToken=randomToken(),tokenHash=await sha256(rawToken),stamp=nowIso(),activationDeadline=new Date(Date.now()+14*dayMs).toISOString();const updated=await base44.asServiceRole.entities.RallyHubTrialApplication.update(row.id,{activation_token_hash:tokenHash,activation_link_issued_at:stamp,activation_deadline:activationDeadline});return Response.json({success:true,application:updated,activationUrl:`${APP_URL}/trial/activate?token=${encodeURIComponent(rawToken)}`});
  }

  if(action==='admin_expire'){
    const applicationId=clean(body.applicationId,180),row=(await base44.asServiceRole.entities.RallyHubTrialApplication.filter({id:applicationId}))?.[0];if(!row||!row.tenant_id)return Response.json({error:'Activated trial not found'},{status:404});const stamp=new Date(Date.now()-60*1000).toISOString();
    const journeys=await base44.asServiceRole.entities.RallyHubTrialJourney.filter({trial_application_id:row.id});for(const j of journeys||[])await base44.asServiceRole.entities.RallyHubTrialJourney.update(j.id,{status:'expired',expires_at:stamp,last_activity_at:nowIso()});
    const ents=await base44.asServiceRole.entities.TenantEntitlement.filter({tenant_id:row.tenant_id});for(const e of ents||[]){if(!e.club_id||e.club_id===row.club_id)await base44.asServiceRole.entities.TenantEntitlement.update(e.id,{status:'expired',ends_at:stamp,updated_at:nowIso()});}
    const clubAccess=await base44.asServiceRole.entities.ClubUserAccess.filter({tenant_id:row.tenant_id,club_id:row.club_id});for(const a of clubAccess||[])await base44.asServiceRole.entities.ClubUserAccess.update(a.id,{ends_at:stamp});const tenantAccess=await base44.asServiceRole.entities.TenantUserAccess.filter({tenant_id:row.tenant_id});for(const a of tenantAccess||[])await base44.asServiceRole.entities.TenantUserAccess.update(a.id,{ends_at:stamp});
    const sessions=await base44.asServiceRole.entities.KotcSession.filter({tenant_id:row.tenant_id,club_id:row.club_id});for(const session of sessions||[]){const live=!!session.actual_first_round_start&&['in_progress','paused'].includes(session.status);const sessionEnd=live?new Date(Date.now()+6*60*60*1000).toISOString():stamp;const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,status:'active'});for(const grant of grants||[])await base44.asServiceRole.entities.KotcSessionAccess.update(grant.id,{ends_at:sessionEnd});const scorerTokens=await base44.asServiceRole.entities.KotcScorerToken.filter({session_id:session.id,status:'active'}).catch(()=>[]);for(const token of scorerTokens||[])await base44.asServiceRole.entities.KotcScorerToken.update(token.id,{expires_at:sessionEnd});}
    const updated=await base44.asServiceRole.entities.RallyHubTrialApplication.update(row.id,{status:'expired',expires_at:stamp,expired_at:nowIso()});await audit(base44,user,row.tenant_id,'trial_expired','RallyHubTrialApplication',row.id,updated,'Super Admin forced expiry for controlled trial/test');return Response.json({success:true,application:updated});
  }

  return Response.json({error:'Unknown trial journey action'},{status:400});
}catch(error:any){console.error('trialJourney error',error);return Response.json({error:error?.message||'Trial journey operation failed'},{status:error?.status||500});}});
