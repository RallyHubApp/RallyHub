import {UAT_PARTNER,UAT_PUBLIC,UAT_LOGIN,UAT_TEST_CLUB,duprRequest,basicDuprIdentity,entitled,canManageUatClub,validateMatch,sealTokens,unsealTokens} from './uatCore.ts';
const slots=['brian','marie','roisin','rallyhub'];
const reply=(body:unknown,status=200)=>Response.json(body,{status});
const fail=(message:string,status=400)=>reply({success:false,error:message},status);
const now=()=>new Date().toISOString();
function tokenSecret(){
 const key=Deno.env.get('DUPR_CLIENT_SECRET')||'';
 if(!key)throw Error('Missing DUPR secret');
 return key;
}
const entities=(b:any)=>b.asServiceRole.entities;
async function recordFor(b:any,slot:string,userId:string){
 const rows=await entities(b).DuprUatConnection.filter({test_slot:slot,owner_user_id:userId},'-created_date',5);
 if((rows||[]).length>1)throw Error('Duplicate DUPR UAT connection records require reconciliation');
 return rows?.[0]||null;
}
async function verify(bearer:string){
 return basicDuprIdentity(await duprRequest(UAT_PUBLIC+'/public/user/info',{token:bearer}));
}
async function refreshStored(b:any,record:any,force=false){
 if(!record?.encrypted_token_pair||record.status!=='connected')throw Error('UAT SSO required');
 const pair=await unsealTokens(record.encrypted_token_pair,tokenSecret());
 if(force||Date.parse(record.token_expires_at||'')<Date.now()+5*60_000){
  const data=await duprRequest(UAT_PUBLIC+'/auth/v2.0/refresh',{refreshToken:pair.refreshToken});
  const next=data?.result||{};
  if(typeof next.accessToken!=='string'||typeof next.refreshToken!=='string')
   throw Error('DUPR refresh did not rotate both tokens');
  pair.accessToken=next.accessToken;pair.refreshToken=next.refreshToken;
  await entities(b).DuprUatConnection.update(record.id,{
   encrypted_token_pair:await sealTokens(pair,tokenSecret()),
   token_expires_at:new Date(Date.now()+7*86400_000).toISOString(),
   refresh_expires_at:new Date(Date.now()+30*86400_000).toISOString(),
   last_tested_at:now()
  });
 }
 return pair.accessToken;
}
async function partnerToken(){
 const key=Deno.env.get('DUPR_CLIENT_KEY')||'',secret=Deno.env.get('DUPR_CLIENT_SECRET')||'';
 if(!key||!secret)throw Error('DUPR partner UAT credentials are not configured');
 const res=await fetch(UAT_PARTNER+'/auth/v1.0/token',{method:'POST',headers:{'x-authorization':btoa(key+':'+secret),Accept:'application/json'},signal:AbortSignal.timeout(10000)});
 const obj=await res.json().catch(()=>({}));
 const token=obj.token??obj.accessToken??obj.result?.token??obj.result?.accessToken;
 if(!res.ok||typeof token!=='string')throw Error('DUPR partner UAT authentication failed');
 return token;
}
function safeSlot(slot:any){
 const s=String(slot||'').toLowerCase();
 return slots.includes(s)?s:null;
}
export async function handleIndependentDuprUat(action:string,body:any,b:any,user:any):Promise<Response|null>{
 if(!action.startsWith('uat_'))return null;
 if(!user?.id||user.role!=='admin')return fail('Platform administrator required',403);
 try{
  if(action==='uat_sso_start'){
   if(!Deno.env.get('DUPR_CLIENT_KEY'))return fail('DUPR UAT client key missing',503);
   return reply({success:true,environment:'uat',url:UAT_LOGIN+'/login-external-app/'+btoa(Deno.env.get('DUPR_CLIENT_KEY')||'')});
  }
  if(action==='uat_sso_connect'){
   const slot=safeSlot(body.slot);
   if(!slot)return fail('Choose one of the four UAT slots');
   const accessToken=String(body.accessToken||body.userToken||''),refreshToken=String(body.refreshToken||'');
   if(!accessToken||!refreshToken||accessToken.length>8000||refreshToken.length>8000)return fail('Both DUPR tokens required');
   const id=await verify(accessToken);
   if(body.duprId&&String(body.duprId)!==id.duprId)return fail('DUPR ID differs from authenticated token',403);
   const existing=await recordFor(b,slot,user.id);
   if(existing?.dupr_id&&existing.dupr_id!==id.duprId)return fail('Different DUPR identity is already linked to this test slot',409);
   for(const other of slots.filter(s=>s!==slot)){
    const record=await recordFor(b,other,user.id);
    if(record?.status==='connected'&&record.dupr_id===id.duprId)return fail('This DUPR identity is linked to another UAT account',409);
   }
   const update={dupr_id:id.duprId,owner_user_id:user.id,test_slot:slot,
    verified_at:now(),sso_consent_at:now(),status:'connected',last_error:'',
    token_expires_at:new Date(Date.now()+7*86400_000).toISOString(),
    refresh_expires_at:new Date(Date.now()+30*86400_000).toISOString(),
    encrypted_token_pair:await sealTokens({accessToken,refreshToken},tokenSecret())};
   if(existing)await entities(b).DuprUatConnection.update(existing.id,update);
   else await entities(b).DuprUatConnection.create(update);
   return reply({success:true,slot,duprId:id.duprId,identityVerified:true,displayName:id.displayName});
  }
  if(action==='uat_accounts'){
   const result=[];
   for(const slot of slots){
    const row=await recordFor(b,slot,user.id);
    result.push({slot,linked:row?.status==='connected',duprId:row?.dupr_id||null,lastVerified:row?.verified_at||null});
   }
   return reply({success:true,environment:'uat',accounts:result,clubId:UAT_TEST_CLUB});
  }
  if(['uat_verify','uat_refresh','uat_subscribe_rating','uat_unsubscribe_rating','uat_disconnect'].includes(action)){
   const slot=safeSlot(body.slot);
   if(!slot)return fail('Invalid UAT slot');
   const row=await recordFor(b,slot,user.id);
   if(!row||row.status!=='connected')return fail('Complete DUPR SSO first',409);
   if(action==='uat_disconnect'){
    await entities(b).DuprUatConnection.update(row.id,{status:'revoked',encrypted_token_pair:'',last_tested_at:now()});
    return reply({success:true,slot,disconnected:true});
   }
   const access=await refreshStored(b,row,action==='uat_refresh');
   const person=await verify(access);
   if(person.duprId!==row.dupr_id)return fail('Connected DUPR identity changed; reconnect required',409);
   if(action==='uat_refresh')return reply({success:true,slot,identityVerified:true,refreshed:true,duprId:person.duprId});
   if(action==='uat_verify'){
    const entitlement=await duprRequest(UAT_PUBLIC+'/subscription/active',{method:'POST',token:access});
    const memberships=await duprRequest(UAT_PUBLIC+'/user/club/membership',{token:access});
    return reply({success:true,slot,identityVerified:true,duprId:person.duprId,
     basicEligible:entitled(entitlement?.result||entitlement),premiumEligible:entitled(entitlement?.result||entitlement,'premium'),
     verifiedEligible:entitled(entitlement?.result||entitlement,'verified'),
     clubAdmin:canManageUatClub(memberships?.result||memberships),clubId:UAT_TEST_CLUB});
   }
   const token=await partnerToken();
   const endpoint=UAT_PARTNER+'/user/v1.0/subscribe/webhook-event';
   const data=await duprRequest(endpoint,{method:action==='uat_subscribe_rating'?'POST':'DELETE',token,
    body:{duprIds:[person.duprId],topic:'RATING'}});
   return reply({success:true,slot,subscribed:action==='uat_subscribe_rating',acknowledgement:data?.status||'SUCCESS'});
  }
  if(action==='uat_match_preflight'){
   const rows=[];
   for(const slot of slots){
    const row=await recordFor(b,slot,user.id);
    if(!row||row.status!=='connected')return fail('All four UAT accounts must complete SSO first',409);
    const token=await refreshStored(b,row);
    const profile=await verify(token);
    if(profile.duprId!==row.dupr_id)return fail('A test account identity has changed',409);
    const ent=await duprRequest(UAT_PUBLIC+'/subscription/active',{method:'POST',token});
    const clubs=await duprRequest(UAT_PUBLIC+'/user/club/membership',{token});
    rows.push({slot,duprId:row.dupr_id,eligible:entitled(ent?.result||ent),
      clubAdmin:canManageUatClub(clubs?.result||clubs)});
   }
   const eligible=rows.every(r=>r.eligible),authorised=rows.some(r=>r.clubAdmin);
   return reply({success:true,environment:'uat',clubId:UAT_TEST_CLUB,eligible,authorised,
    accounts:rows,submissionPerformed:false,ready:eligible&&authorised});
  }
  if(action==='uat_validate_match'){
   const match=body.match;
   const result=validateMatch(match,body.clubAdmin===true);
   return reply({success:true,validation:result,submissionPerformed:false});
  }
  return fail('Unsupported independent DUPR UAT operation',400);
 }catch(err){
  const message=err instanceof Error?err.message:'Unknown error';
  console.warn('Independent DUPR UAT request failed',action,message.replace(/Bearer\s+\S+/gi,'Bearer [redacted]'));
  return fail('DUPR UAT request failed: '+(/DUPR UAT|verification|configured|SSO|required|expired|refresh|token protection/i.test(message)?message:'See server logs'),502);
 }
}
