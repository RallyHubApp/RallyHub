import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const SPOND_CLUB_API_BASE = 'https://api.spond.com/club/v1';
const clean = (value:any, max=500) => String(value ?? '').trim().slice(0, max);
const lower = (value:any) => clean(value, 240).toLowerCase();
const nameKey = (value:any) => lower(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const phoneKey = (value:any) => clean(value, 100).replace(/\D/g,'').replace(/^3530?/,'353');
const dateKey = (value:any) => {
  const s=clean(value,80);
  const iso=s.match(/^(\d{4}-\d{2}-\d{2})/);
  return iso?.[1] || s;
};
function parseJson(value:any,fallback:any={}){try{return typeof value==='string'&&value.trim()?JSON.parse(value):value&&typeof value==='object'?value:fallback}catch{return fallback}}
function boolish(value:any){return value===true||value===1||['true','1','yes','y'].includes(lower(value))}
function activeWindow(row:any){const now=Date.now();if(row?.starts_at&&Date.parse(row.starts_at)>now)return false;if(row?.ends_at&&Date.parse(row.ends_at)<now)return false;return true}
async function assertClubAdmin(base44:any,user:any,tenantId:string,clubId:string){
  if(user?.role==='admin') return true;
  const rows=await base44.asServiceRole.entities.ClubUserAccess.filter({tenant_id:tenantId,club_id:clubId,user_id:user.id,status:'active',permission_bundle:'club_admin'},'-updated_date',20);
  if((rows||[]).some(activeWindow)) return true;
  throw Object.assign(new Error('Club administrator access required'),{status:403});
}

function credentialPrefix(value:any){
  return clean(value,120).toUpperCase().replace(/[^A-Z0-9_]/g,'_').replace(/^_+|_+$/g,'');
}
function credentialNames(reference:any){
  const prefix=credentialPrefix(reference);
  if(!prefix) return null;
  return {prefix,email:`${prefix}_EMAIL`,password:`${prefix}_PASSWORD`,token:`${prefix}_TOKEN`};
}
function credentialState(reference:any,mode='credentials_login'){
  const names=credentialNames(reference);
  if(!names) return {configured:false,names:null};
  if(mode==='session_token') return {configured:!!Deno.env.get(names.token),names:{token:names.token}};
  return {configured:!!Deno.env.get(names.email)&&!!Deno.env.get(names.password),names:{email:names.email,password:names.password}};
}

async function parseResponse(res:Response){
  const text=await res.text();
  if(!text) return {};
  try{return JSON.parse(text)}catch{return {raw:text.slice(0,1000)}}
}
async function spondClubLogin(email:string,password:string){
  const res=await fetch(`${SPOND_CLUB_API_BASE}/login`,{
    method:'POST',
    headers:{Accept:'application/json','Content-Type':'application/json'},
    body:JSON.stringify({email,password})
  });
  const data=await parseResponse(res);
  if(!res.ok){
    const detail=clean(data?.error||data?.message||'',300);
    if(res.status===404) throw Object.assign(new Error(detail||'Spond Club could not find a profile for the configured account.'),{status:502,code:'SPOND_CLUB_PROFILE_NOT_FOUND'});
    if([401,403].includes(res.status)) throw Object.assign(new Error(detail||'Spond Club sign-in was not accepted. Check the secure account credentials.'),{status:502,code:'SPOND_CLUB_AUTH_FAILED'});
    if(res.status===429) throw Object.assign(new Error('Spond Club is temporarily rate-limiting sign-in. Try again shortly.'),{status:503,code:'SPOND_CLUB_RATE_LIMIT'});
    throw Object.assign(new Error(detail||`Spond Club sign-in failed with status ${res.status}.`),{status:502,code:'SPOND_CLUB_AUTH_FAILED'});
  }
  if(data?.loginToken) return String(data.loginToken);
  if(data?.token){
    const ending=clean(data?.phoneNumber||data?.maskedPhoneNumber||'',80);
    throw Object.assign(new Error(`Spond Club requires two-factor verification for this account${ending?` (${ending})`:''}. Complete an interactive Spond Club connection before RallyHub can continue.`),{status:409,code:'SPOND_CLUB_2FA_REQUIRED'});
  }
  throw Object.assign(new Error('Spond Club sign-in succeeded but no usable login token was returned.'),{status:502,code:'SPOND_CLUB_TOKEN_MISSING'});
}
async function spondClubToken(connection:any){
  const mode=clean(connection?.connection_mode||'credentials_login',40)||'credentials_login';
  const names=credentialNames(connection?.credential_reference);
  if(!names) throw Object.assign(new Error('This Spond Club connection has no secure credential reference.'),{status:409,code:'CREDENTIAL_REFERENCE_REQUIRED'});
  if(mode==='session_token'){
    const token=Deno.env.get(names.token);
    if(!token) throw Object.assign(new Error(`The secure Spond Club session secret ${names.token} is not configured.`),{status:409,code:'CREDENTIALS_NOT_CONFIGURED'});
    return token;
  }
  if(mode!=='credentials_login') throw Object.assign(new Error(`Spond Club connection mode “${mode}” is not implemented yet.`),{status:409,code:'CONNECTION_MODE_NOT_IMPLEMENTED'});
  const email=Deno.env.get(names.email),password=Deno.env.get(names.password);
  if(!email||!password) throw Object.assign(new Error(`Configure the backend secrets ${names.email} and ${names.password} for this Spond Club connection.`),{status:409,code:'CREDENTIALS_NOT_CONFIGURED'});
  return await spondClubLogin(email,password);
}
async function spondClubRequest(path:string,token:string,externalClubId=''){
  const headers:any={Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${token}`};
  if(externalClubId) headers['X-Spond-ClubId']=externalClubId;
  const res=await fetch(`${SPOND_CLUB_API_BASE}${path}`,{headers});
  const data=await parseResponse(res);
  if(!res.ok){
    const detail=clean(data?.error||data?.message||'',300);
    if([401,403].includes(res.status)) throw Object.assign(new Error(detail||'The Spond Club session is no longer authorised. Reconnect the Spond Club account.'),{status:502,code:'SPOND_CLUB_RECONNECT_REQUIRED'});
    if(res.status===429) throw Object.assign(new Error('Spond Club is temporarily rate-limiting this request. Try again shortly.'),{status:503,code:'SPOND_CLUB_RATE_LIMIT'});
    throw Object.assign(new Error(detail||`Spond Club request failed with status ${res.status}.`),{status:502,code:'SPOND_CLUB_REQUEST_FAILED'});
  }
  return data;
}
function arrayFromResponse(value:any,keys:string[]){
  if(Array.isArray(value)) return value;
  for(const key of keys) if(Array.isArray(value?.[key])) return value[key];
  if(Array.isArray(value?.data)) return value.data;
  if(Array.isArray(value?.items)) return value.items;
  if(Array.isArray(value?.content)) return value.content;
  return [];
}
function normaliseClub(club:any){
  return {
    id:clean(club?.id||club?.clubId||club?.club_id,180),
    name:clean(club?.name||club?.clubName||club?.title||'Spond Club',220),
    slug:clean(club?.slug||club?.shortName||club?.urlName||club?.identifier,180)||null,
    raw_status:clean(club?.status,80)||null
  };
}
async function discoverClubs(connection:any){
  const token=await spondClubToken(connection);
  const response=await spondClubRequest('/clubs',token);
  return {token,clubs:arrayFromResponse(response,['clubs']).map(normaliseClub).filter((club:any)=>club.id)};
}
function resolveConfiguredClub(connection:any,clubs:any[]){
  if(!clubs.length) return null;
  const externalClubId=clean(connection?.external_club_id,180);
  if(externalClubId){
    const exact=clubs.find((club:any)=>String(club.id)===externalClubId);
    if(exact) return exact;
  }
  const settings=parseJson(connection?.settings_json,{});
  const desiredSlug=lower(settings?.club_slug||settings?.clubSlug);
  if(desiredSlug){
    const slugMatch=clubs.find((club:any)=>lower(club.slug)===desiredSlug||lower(club.name).replace(/[^a-z0-9]+/g,'')===desiredSlug.replace(/[^a-z0-9]+/g,''));
    if(slugMatch) return slugMatch;
  }
  const desiredName=lower(settings?.club_name||settings?.clubName);
  if(desiredName){
    const nameMatch=clubs.find((club:any)=>lower(club.name)===desiredName);
    if(nameMatch) return nameMatch;
  }
  return clubs.length===1?clubs[0]:null;
}
async function resolveClubAndMembers(connection:any){
  const {token,clubs}=await discoverClubs(connection);
  const club=resolveConfiguredClub(connection,clubs);
  if(!club){
    throw Object.assign(new Error(clubs.length?`This Spond Club account can access ${clubs.length} clubs. Choose the correct club in RallyHub before verifying.`:'No Spond Clubs were returned for this account.'),{status:409,code:'SPOND_CLUB_SELECTION_REQUIRED',clubs});
  }
  const response=await spondClubRequest('/members',token,club.id);
  const members=arrayFromResponse(response,['members','results']);
  return {token,club,members};
}
function normaliseSourceMember(raw:any){
  const member=raw?.member||raw||{};
  const profile=member?.profile||member?.person||member?.user||{};
  const contact=member?.contactInfo||member?.contact||profile?.contactInfo||{};
  const firstName=clean(member?.firstName||member?.first_name||profile?.firstName||profile?.first_name,120);
  const lastName=clean(member?.lastName||member?.last_name||profile?.lastName||profile?.last_name,120);
  const fallbackName=clean(member?.fullName||member?.name||member?.displayName||profile?.fullName||profile?.name||profile?.displayName,220);
  const fullName=clean([firstName,lastName].filter(Boolean).join(' ')||fallbackName,220);
  const email=lower(member?.email||member?.emailAddress||profile?.email||profile?.emailAddress||contact?.email||contact?.emailAddress);
  const mobile=clean(member?.phoneNumber||member?.mobile||member?.phone||profile?.phoneNumber||profile?.mobile||profile?.phone||contact?.phoneNumber||contact?.mobile||contact?.phone,100);
  const dob=dateKey(member?.dateOfBirth||member?.birthDate||member?.birthday||profile?.dateOfBirth||profile?.birthDate||profile?.birthday);
  const roleValue=member?.role||member?.memberRole||profile?.role||'';
  const statusValue=member?.status||member?.membershipStatus||member?.state||profile?.status||'';
  const roles=Array.isArray(member?.roles)?member.roles.map((value:any)=>typeof value==='string'?value:value?.name||value?.title||'').filter(Boolean):[];
  const isDeactivated=boolish(member?.deleted)||boolish(member?.deactivated)||boolish(member?.isDeleted)||boolish(member?.isDeactivated);
  const isUnprocessed=!isDeactivated&&(boolish(member?.unprocessed)||boolish(member?.isUnprocessed)||lower(statusValue)==='pending');
  return {
    external_member_id:clean(member?.id||member?.memberId||member?.uid||profile?.memberId,180),
    external_profile_id:clean(profile?.id||member?.profileId||member?.personId,180)||null,
    full_name:fullName||'Unnamed Spond Club member',
    first_name:firstName||null,last_name:lastName||null,
    email:email||null,mobile:mobile||null,date_of_birth:dob||null,
    gender:clean(member?.gender||profile?.gender,60)||null,
    source_status:clean(statusValue,80)||null,
    source_role:clean(roleValue,80)||null,
    source_roles:roles.slice(0,20),
    source_lifecycle:isDeactivated?'deactivated':isUnprocessed?'unprocessed':'active',
    source_deactivated:isDeactivated,
    source_unprocessed:isUnprocessed,
    source_updated_at:clean(member?.updatedAt||member?.updatedTimestamp||profile?.updatedAt,80)||null
  };
}
function safeConnection(row:any){
  if(!row) return null;
  const capabilities=parseJson(row.capabilities_json,{});
  const settings=parseJson(row.settings_json,{});
  return {id:row.id,provider:row.provider,purpose:row.purpose,status:row.status,connection_mode:row.connection_mode||'credentials_login',credential_reference:row.credential_reference||null,external_club_id:row.external_club_id||null,external_club_name:settings?.external_club_name||null,external_group_id:row.external_group_id||null,external_group_name:row.external_group_name||null,sport_id:row.sport_id||null,sync_direction:row.sync_direction||null,capabilities,last_verified_at:row.last_verified_at||null,last_synced_at:row.last_synced_at||null,last_sync_summary:row.last_sync_summary||null,last_error:row.last_error||null};
}
async function membershipConnection(base44:any,tenantId:string,clubId:string){
  const rows=await base44.asServiceRole.entities.ExternalGroupConnection.filter({tenant_id:tenantId,club_id:clubId,provider:'spond',purpose:'membership'},'-updated_date',20);
  return (rows||[]).find((row:any)=>row.status!=='disconnected')||rows?.[0]||null;
}
function uniquePeople(rows:any[]){const map=new Map<string,any>();for(const row of rows||[])if(row?.id)map.set(String(row.id),row);return [...map.values()]}
function candidateSummary(person:any,membership:any){return {person_id:person.id,full_name:person.full_name||null,email:person.primary_email||null,mobile:person.mobile||null,member_id:membership?.member_id||null,membership_status:membership?.membership_status||null}}
function matchSourceMember(source:any,people:any[],membershipByPerson:Map<string,any>,externalById:Map<string,any>){
  const external=externalById.get(String(source.external_member_id));
  if(external?.person_id){
    const person=people.find((p:any)=>String(p.id)===String(external.person_id));
    if(person){const membership=membershipByPerson.get(String(person.id));return {match_status:membership?'matched':'person_without_membership',match_method:'external_id',matched_person_id:person.id,candidates:[candidateSummary(person,membership)]}}
  }
  const email=lower(source.email),phone=phoneKey(source.mobile),name=nameKey(source.full_name),dob=dateKey(source.date_of_birth);
  const emailMatches=email?people.filter((p:any)=>lower(p.primary_email)===email):[];
  const phoneMatches=phone&&phone.length>=7?people.filter((p:any)=>phoneKey(p.mobile)===phone):[];
  const nameDobMatches=name&&dob?people.filter((p:any)=>nameKey(p.full_name)===name&&dateKey(p.date_of_birth)===dob):[];
  const strong=uniquePeople([...emailMatches,...phoneMatches,...nameDobMatches]);
  if(strong.length===1){
    const person=strong[0],membership=membershipByPerson.get(String(person.id));
    const method=emailMatches.some((p:any)=>p.id===person.id)?'email':phoneMatches.some((p:any)=>p.id===person.id)?'mobile':'name_dob';
    return {match_status:membership?'matched':'person_without_membership',match_method:method,matched_person_id:person.id,candidates:[candidateSummary(person,membership)]};
  }
  if(strong.length>1) return {match_status:'ambiguous',match_method:'multiple_strong_matches',matched_person_id:null,candidates:strong.slice(0,10).map((p:any)=>candidateSummary(p,membershipByPerson.get(String(p.id))))};
  const nameMatches=name?people.filter((p:any)=>nameKey(p.full_name)===name):[];
  if(nameMatches.length>1) return {match_status:'ambiguous',match_method:'name_only',matched_person_id:null,candidates:nameMatches.slice(0,10).map((p:any)=>candidateSummary(p,membershipByPerson.get(String(p.id))))};
  return {match_status:'new',match_method:null,matched_person_id:null,candidates:[]};
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me();
    if(!user) return Response.json({error:'Authentication required'},{status:401});
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'status',80);
    const tenantId=clean(body.tenantId||user.active_tenant_id,180),clubId=clean(body.clubId||user.active_club_id,180);
    if(!tenantId||!clubId) return Response.json({error:'Active club context required'},{status:400});
    await assertClubAdmin(base44,user,tenantId,clubId);
    const connection=await membershipConnection(base44,tenantId,clubId);

    if(action==='status'){
      const safe=safeConnection(connection);
      const state=connection?credentialState(connection.credential_reference,connection.connection_mode):user.role==='admin'?credentialState(clean(body.credentialReference||'SPOND_CLUB',120),'credentials_login'):{configured:false,names:null};
      return Response.json({success:true,connection:safe,credentialsConfigured:state.configured,requiredSecretNames:state.names,canConfigureCredentialReference:user.role==='admin',defaultCredentialReference:user.role==='admin'?'SPOND_CLUB':null,readOnly:true});
    }

    if(action==='discover_clubs'||action==='discover_groups'){
      let credentialReference=connection?.credential_reference||'';
      let connectionMode=connection?.connection_mode||'credentials_login';
      if(user.role==='admin'&&body.credentialReference){credentialReference=credentialPrefix(body.credentialReference);connectionMode=clean(body.connectionMode||'credentials_login',40)}
      if(!credentialReference) return Response.json({error:'A platform administrator must configure the secure Spond Club credential reference first.'},{status:409});
      const {clubs}=await discoverClubs({credential_reference:credentialReference,connection_mode:connectionMode});
      return Response.json({success:true,clubs,groups:clubs,credentialReference,connectionMode,readOnly:true});
    }

    if(action==='save_connection'){
      const externalClubId=clean(body.externalClubId||body.clubId||body.groupId,180);
      if(!externalClubId) return Response.json({error:'Choose the Spond Club first.'},{status:400});
      let credentialReference=connection?.credential_reference||'';
      let connectionMode=connection?.connection_mode||'credentials_login';
      if(user.role==='admin'){
        credentialReference=credentialPrefix(body.credentialReference||credentialReference||'SPOND_CLUB');
        connectionMode=clean(body.connectionMode||connectionMode||'credentials_login',40);
      }else if(!connection){
        return Response.json({error:'A platform administrator must create the secure Spond Club connection before a club administrator can use it.'},{status:403});
      }
      if(!credentialReference) return Response.json({error:'Secure Spond Club credential reference required.'},{status:409});
      const {token,clubs}=await discoverClubs({credential_reference:credentialReference,connection_mode:connectionMode});
      const selected=clubs.find((club:any)=>String(club.id)===externalClubId);
      if(!selected) return Response.json({error:'The selected Spond Club could not be verified for this account.'},{status:404});
      const membersResponse=await spondClubRequest('/members',token,selected.id);
      const members=arrayFromResponse(membersResponse,['members','results']);
      const now=new Date().toISOString();
      const existingSettings=parseJson(connection?.settings_json,{});
      const settings={...existingSettings,surface:'spond_club',external_club_name:selected.name,club_slug:selected.slug||existingSettings?.club_slug||null};
      const data:any={tenant_id:tenantId,club_id:clubId,provider:'spond',purpose:'membership',external_club_id:selected.id,external_group_id:'',external_group_name:'',sync_direction:'rallyhub_master',status:'active',connection_mode:connectionMode,credential_reference:credentialReference,capabilities_json:JSON.stringify({read_members:true,write_members:false,preview_only:true}),settings_json:JSON.stringify(settings),last_verified_at:now,last_error:'',last_sync_summary:`Spond Club connection verified against ${members.length} source member records. Read-only preview mode remains enabled.`};
      if(body.sportId) data.sport_id=clean(body.sportId,180);
      const saved=connection?await base44.asServiceRole.entities.ExternalGroupConnection.update(connection.id,data):await base44.asServiceRole.entities.ExternalGroupConnection.create(data);
      try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:tenantId,club_id:clubId,user_id:user.id,action:'membership_source_connected',entity_type:'ExternalGroupConnection',entity_id:saved.id,scope_type:'club',scope_id:clubId,after_state:JSON.stringify({provider:'spond',purpose:'membership',external_club_id:selected.id,external_club_name:selected.name,connection_mode:connectionMode,credential_reference:credentialReference,read_only:true})})}catch{}
      return Response.json({success:true,connection:safeConnection(saved),memberCount:members.length,readOnly:true});
    }

    if(action==='verify_connection'){
      if(!connection||connection.status==='disconnected') return Response.json({error:'No Spond Club membership connection is configured.'},{status:404});
      try{
        const {club,members}=await resolveClubAndMembers(connection);
        const now=new Date().toISOString();
        const settings={...parseJson(connection.settings_json,{}),surface:'spond_club',external_club_name:club.name,club_slug:club.slug||parseJson(connection.settings_json,{})?.club_slug||null};
        const updated=await base44.asServiceRole.entities.ExternalGroupConnection.update(connection.id,{status:'active',external_club_id:club.id,external_group_id:'',external_group_name:'',settings_json:JSON.stringify(settings),last_verified_at:now,last_error:'',last_sync_summary:`Verified read-only Spond Club access to ${members.length} source member records.`});
        return Response.json({success:true,connection:safeConnection(updated),memberCount:members.length,readOnly:true});
      }catch(error:any){
        await base44.asServiceRole.entities.ExternalGroupConnection.update(connection.id,{status:'error',last_error:clean(error?.message||'Spond Club verification failed',500)}).catch(()=>{});
        if(error?.clubs) return Response.json({error:error.message,code:error.code,clubs:error.clubs},{status:error.status||409});
        throw error;
      }
    }

    if(action==='preview_members'){
      if(!connection||connection.status==='disconnected') return Response.json({error:'No Spond Club membership connection is configured.'},{status:404});
      const {club,members}=await resolveClubAndMembers(connection);
      const sourceMembers=(members||[]).map(normaliseSourceMember).filter((member:any)=>member.external_member_id);
      const [people,memberships,externalIdentities]=await Promise.all([
        base44.asServiceRole.entities.Person.filter({tenant_id:tenantId},'full_name',500),
        base44.asServiceRole.entities.ClubMembership.filter({tenant_id:tenantId,club_id:clubId},'member_id',500),
        base44.asServiceRole.entities.ExternalIdentity.filter({tenant_id:tenantId,club_id:clubId,provider:'spond'},'-last_seen_at',500)
      ]);
      const membershipByPerson=new Map((memberships||[]).map((row:any)=>[String(row.person_id),row]));
      const externalById=new Map((externalIdentities||[]).filter((row:any)=>row.external_person_id).map((row:any)=>[String(row.external_person_id),row]));
      const rows=sourceMembers.map((source:any)=>({...source,...matchSourceMember(source,people||[],membershipByPerson,externalById)}));
      const counts={total:rows.length,matched:0,person_without_membership:0,new:0,ambiguous:0};
      for(const row of rows){const key=String(row.match_status) as keyof typeof counts;if(key in counts&&key!=='total')counts[key]++}
      const now=new Date().toISOString();
      const settings={...parseJson(connection.settings_json,{}),surface:'spond_club',external_club_name:club.name,club_slug:club.slug||parseJson(connection.settings_json,{})?.club_slug||null};
      await base44.asServiceRole.entities.ExternalGroupConnection.update(connection.id,{status:'active',external_club_id:club.id,external_group_id:'',external_group_name:'',settings_json:JSON.stringify(settings),last_verified_at:now,last_error:'',last_sync_summary:`Previewed ${rows.length} Spond Club member records; no RallyHub or Spond records were changed.`}).catch(()=>{});
      return Response.json({success:true,source:{provider:'spond',surface:'spond_club',club_id:club.id,club_name:club.name},counts,rows,readOnly:true,previewedAt:now});
    }

    if(action==='disconnect'){
      if(!connection) return Response.json({success:true,connection:null});
      const updated=await base44.asServiceRole.entities.ExternalGroupConnection.update(connection.id,{status:'disconnected',last_error:'',last_sync_summary:'Spond Club membership source disconnected. No member data was changed.'});
      try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:tenantId,club_id:clubId,user_id:user.id,action:'membership_source_disconnected',entity_type:'ExternalGroupConnection',entity_id:connection.id,scope_type:'club',scope_id:clubId,after_state:JSON.stringify({provider:'spond',purpose:'membership'})})}catch{}
      return Response.json({success:true,connection:safeConnection(updated)});
    }

    return Response.json({error:`Unknown membership source action: ${action}`},{status:400});
  }catch(error:any){
    console.error('[membershipSource]',error?.code||'ERROR',error?.message||String(error));
    return Response.json({error:error?.message||'Membership source request failed',code:error?.code||'MEMBERSHIP_SOURCE_ERROR'},{status:error?.status||500});
  }
});
