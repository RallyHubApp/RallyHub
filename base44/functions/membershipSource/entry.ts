import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const SPOND_API_BASE = 'https://api.spond.com/core/v1';
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
function activeWindow(row:any){const now=Date.now();if(row?.starts_at&&Date.parse(row.starts_at)>now)return false;if(row?.ends_at&&Date.parse(row.ends_at)<now)return false;return true}
async function assertClubAdmin(base44:any,user:any,tenantId:string,clubId:string){
  if(user?.role==='admin') return true;
  const rows=await base44.asServiceRole.entities.ClubUserAccess.filter({tenant_id:tenantId,club_id:clubId,user_id:user.id,status:'active',permission_bundle:'club_admin'},'-updated_date',20);
  if((rows||[]).some(activeWindow)) return true;
  throw Object.assign(new Error('Club administrator access required'),{status:403});
}
async function first(base44:any,entity:string,filter:any){const rows=await base44.asServiceRole.entities[entity].filter(filter,'-updated_date',20);return rows?.[0]||null}

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

async function spondLogin(email:string,password:string){
  const res=await fetch(`${SPOND_API_BASE}/auth2/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  if(!res.ok){
    if([401,403].includes(res.status)) throw Object.assign(new Error('Spond sign-in was not accepted. Check the secure account credentials, or reconnect if Spond requires additional verification.'),{status:502,code:'SPOND_AUTH_FAILED'});
    if(res.status===429) throw Object.assign(new Error('Spond is temporarily rate-limiting sign-in. Try again shortly.'),{status:503,code:'SPOND_RATE_LIMIT'});
    throw Object.assign(new Error(`Spond sign-in failed with status ${res.status}.`),{status:502,code:'SPOND_AUTH_FAILED'});
  }
  const data=await res.json();
  const token=data?.accessToken?.token||data?.loginToken||data?.token;
  if(!token) throw Object.assign(new Error('Spond sign-in succeeded but no usable session token was returned.'),{status:502,code:'SPOND_TOKEN_MISSING'});
  return String(token);
}
async function spondToken(connection:any){
  const mode=clean(connection?.connection_mode||'credentials_login',40)||'credentials_login';
  const names=credentialNames(connection?.credential_reference);
  if(!names) throw Object.assign(new Error('This Spond Club connection has no secure credential reference.'),{status:409,code:'CREDENTIAL_REFERENCE_REQUIRED'});
  if(mode==='session_token'){
    const token=Deno.env.get(names.token);
    if(!token) throw Object.assign(new Error(`The secure Spond session secret ${names.token} is not configured.`),{status:409,code:'CREDENTIALS_NOT_CONFIGURED'});
    return token;
  }
  if(mode!=='credentials_login') throw Object.assign(new Error(`Spond connection mode “${mode}” is not implemented yet.`),{status:409,code:'CONNECTION_MODE_NOT_IMPLEMENTED'});
  const email=Deno.env.get(names.email),password=Deno.env.get(names.password);
  if(!email||!password) throw Object.assign(new Error(`Configure the backend secrets ${names.email} and ${names.password} for this Spond Club connection.`),{status:409,code:'CREDENTIALS_NOT_CONFIGURED'});
  return await spondLogin(email,password);
}
async function spondRequest(path:string,token:string){
  const res=await fetch(`${SPOND_API_BASE}${path}`,{headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}});
  if(!res.ok){
    if([401,403].includes(res.status)) throw Object.assign(new Error('The Spond session is no longer authorised. Reconnect the Spond Club account.'),{status:502,code:'SPOND_RECONNECT_REQUIRED'});
    if(res.status===429) throw Object.assign(new Error('Spond is temporarily rate-limiting this request. Try again shortly.'),{status:503,code:'SPOND_RATE_LIMIT'});
    throw Object.assign(new Error(`Spond request failed with status ${res.status}.`),{status:502,code:'SPOND_REQUEST_FAILED'});
  }
  return await res.json();
}
async function fetchSpondGroup(groupId:string,token:string){
  try{return await spondRequest(`/groups/${encodeURIComponent(groupId)}`,token)}catch(error:any){
    const groups=await spondRequest('/groups',token);
    const row=(Array.isArray(groups)?groups:[]).find((group:any)=>String(group?.id||'')===String(groupId));
    if(row) return row;
    throw error;
  }
}
function collectGroupMembers(group:any){
  const map=new Map<string,any>();
  const add=(member:any)=>{const id=clean(member?.id||member?.uid||member?.memberId,180);if(id&&!map.has(id))map.set(id,member)};
  (group?.members||[]).forEach(add);
  (group?.subGroups||[]).forEach((sub:any)=>(sub?.members||[]).forEach(add));
  return [...map.entries()].map(([id,member])=>({id,member}));
}
function normaliseSourceMember(source:any){
  const member=source?.member||{};
  const profile=member?.profile||{};
  const firstName=clean(profile?.firstName||profile?.first_name||member?.firstName||member?.first_name,120);
  const lastName=clean(profile?.lastName||profile?.last_name||member?.lastName||member?.last_name,120);
  const fallbackName=clean(profile?.name||profile?.displayName||member?.name||member?.displayName,220);
  const fullName=clean([firstName,lastName].filter(Boolean).join(' ')||fallbackName,220);
  const email=lower(profile?.email||profile?.emailAddress||member?.email||member?.emailAddress);
  const mobile=clean(profile?.phoneNumber||profile?.mobile||profile?.phone||member?.phoneNumber||member?.mobile||member?.phone,100);
  const dob=dateKey(profile?.dateOfBirth||profile?.birthDate||profile?.birthday||member?.dateOfBirth||member?.birthDate||member?.birthday);
  const roleValue=member?.role||member?.memberRole||profile?.role||'';
  const statusValue=member?.status||member?.membershipStatus||profile?.status||'';
  const roles=Array.isArray(member?.roles)?member.roles.map((value:any)=>typeof value==='string'?value:value?.name||value?.title||'').filter(Boolean):[];
  return {
    external_member_id:clean(source?.id,180),
    external_profile_id:clean(profile?.id||member?.profileId,180)||null,
    full_name:fullName||'Unnamed Spond member',
    first_name:firstName||null,last_name:lastName||null,
    email:email||null,mobile:mobile||null,date_of_birth:dob||null,
    gender:clean(profile?.gender||member?.gender,60)||null,
    source_status:clean(statusValue,80)||null,
    source_role:clean(roleValue,80)||null,
    source_roles:roles.slice(0,20),
    source_updated_at:clean(member?.updatedAt||member?.updatedTimestamp||profile?.updatedAt,80)||null
  };
}
function safeConnection(row:any){
  if(!row) return null;
  const capabilities=parseJson(row.capabilities_json,{});
  return {id:row.id,provider:row.provider,purpose:row.purpose,status:row.status,connection_mode:row.connection_mode||'credentials_login',credential_reference:row.credential_reference||null,external_group_id:row.external_group_id,external_group_name:row.external_group_name||null,sport_id:row.sport_id||null,sync_direction:row.sync_direction||null,capabilities,last_verified_at:row.last_verified_at||null,last_synced_at:row.last_synced_at||null,last_sync_summary:row.last_sync_summary||null,last_error:row.last_error||null};
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
      const state=connection?credentialState(connection.credential_reference,connection.connection_mode):user.role==='admin'?credentialState(clean(body.credentialReference||'SPOND',120),'credentials_login'):{configured:false,names:null};
      return Response.json({success:true,connection:safe,credentialsConfigured:state.configured,requiredSecretNames:state.names,canConfigureCredentialReference:user.role==='admin',defaultCredentialReference:user.role==='admin'?'SPOND':null,readOnly:true});
    }

    if(action==='discover_groups'){
      let credentialReference=connection?.credential_reference||'';
      let connectionMode=connection?.connection_mode||'credentials_login';
      if(user.role==='admin'&&body.credentialReference){credentialReference=credentialPrefix(body.credentialReference);connectionMode=clean(body.connectionMode||'credentials_login',40)}
      if(!credentialReference) return Response.json({error:'A platform administrator must configure the secure Spond credential reference first.'},{status:409});
      const token=await spondToken({credential_reference:credentialReference,connection_mode:connectionMode});
      const groups=await spondRequest('/groups',token);
      const simplified=(Array.isArray(groups)?groups:[]).map((group:any)=>({id:String(group?.id||''),name:clean(group?.name||'Spond group',220),member_count:Array.isArray(group?.members)?group.members.length:null})).filter((group:any)=>group.id).sort((a:any,b:any)=>a.name.localeCompare(b.name));
      return Response.json({success:true,groups:simplified,credentialReference,connectionMode,readOnly:true});
    }

    if(action==='save_connection'){
      const groupId=clean(body.groupId,180);
      if(!groupId) return Response.json({error:'Choose the Spond membership group first.'},{status:400});
      let credentialReference=connection?.credential_reference||'';
      let connectionMode=connection?.connection_mode||'credentials_login';
      if(user.role==='admin'){
        credentialReference=credentialPrefix(body.credentialReference||credentialReference||'SPOND');
        connectionMode=clean(body.connectionMode||connectionMode||'credentials_login',40);
      }else if(!connection){
        return Response.json({error:'A platform administrator must create the secure Spond Club connection before a club administrator can use it.'},{status:403});
      }
      if(!credentialReference) return Response.json({error:'Secure Spond credential reference required.'},{status:409});
      const token=await spondToken({credential_reference:credentialReference,connection_mode:connectionMode});
      const group=await fetchSpondGroup(groupId,token);
      if(!group?.id) return Response.json({error:'The selected Spond group could not be verified.'},{status:404});
      const now=new Date().toISOString();
      const data:any={tenant_id:tenantId,club_id:clubId,provider:'spond',purpose:'membership',external_group_id:String(group.id),external_group_name:clean(group.name||'Spond membership',220),sync_direction:'external_master',status:'active',connection_mode:connectionMode,credential_reference:credentialReference,capabilities_json:JSON.stringify({read_members:true,write_members:false,preview_only:true}),settings_json:JSON.stringify({surface:'spond_club'}),last_verified_at:now,last_error:'',last_sync_summary:'Spond Club connection verified. Member source remains read-only until import mapping is approved.'};
      if(body.sportId) data.sport_id=clean(body.sportId,180);
      const saved=connection?await base44.asServiceRole.entities.ExternalGroupConnection.update(connection.id,data):await base44.asServiceRole.entities.ExternalGroupConnection.create(data);
      try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:tenantId,club_id:clubId,user_id:user.id,action:'membership_source_connected',entity_type:'ExternalGroupConnection',entity_id:saved.id,scope_type:'club',scope_id:clubId,after_state:JSON.stringify({provider:'spond',purpose:'membership',external_group_id:String(group.id),external_group_name:group.name,connection_mode:connectionMode,credential_reference:credentialReference,read_only:true})})}catch{}
      return Response.json({success:true,connection:safeConnection(saved),memberCount:collectGroupMembers(group).length,readOnly:true});
    }

    if(action==='verify_connection'){
      if(!connection||connection.status==='disconnected') return Response.json({error:'No active Spond Club membership connection is configured.'},{status:404});
      try{
        const token=await spondToken(connection);
        const group=await fetchSpondGroup(String(connection.external_group_id),token);
        const count=collectGroupMembers(group).length,now=new Date().toISOString();
        const updated=await base44.asServiceRole.entities.ExternalGroupConnection.update(connection.id,{status:'active',external_group_name:clean(group?.name||connection.external_group_name,220),last_verified_at:now,last_error:'',last_sync_summary:`Verified read-only access to ${count} Spond source members.`});
        return Response.json({success:true,connection:safeConnection(updated),memberCount:count,readOnly:true});
      }catch(error:any){
        await base44.asServiceRole.entities.ExternalGroupConnection.update(connection.id,{status:'error',last_error:clean(error?.message||'Spond verification failed',500)}).catch(()=>{});
        throw error;
      }
    }

    if(action==='preview_members'){
      if(!connection||connection.status==='disconnected') return Response.json({error:'No active Spond Club membership connection is configured.'},{status:404});
      const token=await spondToken(connection);
      const group=await fetchSpondGroup(String(connection.external_group_id),token);
      const sourceMembers=collectGroupMembers(group).map(normaliseSourceMember);
      const [people,memberships,externalIdentities]=await Promise.all([
        base44.asServiceRole.entities.Person.filter({tenant_id:tenantId},'full_name',500),
        base44.asServiceRole.entities.ClubMembership.filter({tenant_id:tenantId,club_id:clubId},'member_id',500),
        base44.asServiceRole.entities.ExternalIdentity.filter({tenant_id:tenantId,club_id:clubId,provider:'spond'},'-last_seen_at',500)
      ]);
      const membershipByPerson=new Map((memberships||[]).map((row:any)=>[String(row.person_id),row]));
      const externalById=new Map((externalIdentities||[]).filter((row:any)=>row.external_person_id).map((row:any)=>[String(row.external_person_id),row]));
      const rows=sourceMembers.map((source:any)=>({...source,...matchSourceMember(source,people||[],membershipByPerson,externalById)}));
      const counts={total:rows.length,matched:0,person_without_membership:0,new:0,ambiguous:0};
      for(const row of rows){const key=String(row.match_status) as keyof typeof counts;if(key in counts&&(key!=='total'))counts[key]++}
      const now=new Date().toISOString();
      await base44.asServiceRole.entities.ExternalGroupConnection.update(connection.id,{status:'active',external_group_name:clean(group?.name||connection.external_group_name,220),last_verified_at:now,last_error:'',last_sync_summary:`Previewed ${rows.length} Spond source members; no RallyHub or Spond member records were changed.`}).catch(()=>{});
      return Response.json({success:true,source:{provider:'spond',surface:'spond_club',group_id:String(group?.id||connection.external_group_id),group_name:clean(group?.name||connection.external_group_name,220)},counts,rows,readOnly:true,previewedAt:now});
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
