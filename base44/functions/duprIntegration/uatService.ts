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
 const expiry=Date.parse(record.token_expires_at||'');
 if(force||!Number.isFinite(expiry)||expiry<Date.now()+5*60_000){
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
  if(action==='uat_rating_events'){
   const events=[];
   for(const slot of slots){
    const record=await recordFor(b,slot,user.id);
    if(!record?.dupr_id||record.status!=='connected')continue;
    const rows=await entities(b).DuprRatingUatAudit.filter({provider_id:record.dupr_id},'-observed_at',25);
    events.push({slot,duprId:record.dupr_id,
     ratings:(rows||[]).map((r:any)=>({event:r.topic,observedAt:r.observed_at,
      singles:r.singles??null,doubles:r.doubles??null}))});
   }
   return reply({success:true,environment:'uat',events});
  }
  if(action==='uat_webhook_diagnostic'){
   const endpoint=Deno.env.get('DUPR_UAT_WEBHOOK_URL')||'';
   if(!endpoint)return fail('Webhook endpoint not configured',503);
   const response=await fetch(endpoint,{method:'GET',signal:AbortSignal.timeout(10000)});
   const post=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId:'uat-handshake',event:'TEST',message:{}}),signal:AbortSignal.timeout(10000)});
   const postText=(await post.text()).replace(/https?:\/\/[^\s"']+/g,'[redacted-url]').replace(/[a-f0-9]{64}/gi,'[redacted]').slice(0,360);
   const previewUrl=new URL(endpoint);
   previewUrl.hostname='rallyhub.base44.app';
   const preview=await fetch(previewUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId:'uat-handshake',event:'TEST',message:{}}),signal:AbortSignal.timeout(10000)});
   const previewText=(await preview.text()).slice(0,160);
   return reply({success:true,environment:'uat',handshakeStatus:response.status,postHandshakeStatus:post.status,postResponse:postText,previewPostStatus:preview.status,previewPostResponse:previewText,handshakePassed:response.status===200&&post.status===200});
  }
  if(action==='uat_register_webhook'){
   const webhookUrl=Deno.env.get('DUPR_UAT_WEBHOOK_URL')||'';
   const secret=Deno.env.get('DUPR_UAT_WEBHOOK_KEY')||'';
   let parsed:URL;
   try{parsed=new URL(webhookUrl);}catch{return fail('UAT webhook URL not configured',503);}
   if(parsed.protocol!=='https:'||!secret||parsed.searchParams.get('key')!==secret)
    return fail('Secure UAT webhook endpoint not configured',503);
   if(!parsed.pathname.endsWith('/duprUatWebhook'))return fail('Incorrect DUPR UAT webhook path',400);
   const bearer=await partnerToken();
   try{
    const registered=await duprRequest(UAT_PARTNER+'/v1.0/webhook',{
     method:'POST',token:bearer,body:{webhookUrl:parsed.toString(),topics:['RATING']}
    });
    return reply({success:true,registered:registered.status==='SUCCESS',topics:['RATING']});
   }catch(error){
    const providerStatus=Number((error as any)?.status||0);
    const diagnostic=String((error as any)?.providerMessage||'').replace(/https?:\/\/[^\s]+/g,'[redacted-url]').replace(/[a-f0-9]{64}/gi,'[redacted]').slice(0,350);
    return reply({success:false,error:'DUPR UAT webhook registration rejected',
     providerHttpStatus:providerStatus,providerDetail:diagnostic,
     requestId:String((error as any)?.requestId||'').slice(0,100)},502);
   }
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
  if(action==='uat_submit_match'){
   if(body.confirmUatTest!==true)return fail('Explicit UAT confirmation required',400);
   const preflight=await handleIndependentDuprUat('uat_match_preflight',{},b,user);
   const gate=await preflight!.json();
   if(!gate.ready)return fail('Four verified eligible test users and club organiser required',409);
   if(!gate.accounts?.some((a:any)=>a.slot===body.submitterSlot&&a.clubAdmin===true))return fail('DUPR submitting user must be club director or organiser',403);
   const match=body.match;
   const validation=validateMatch(match,true);
   if(!validation.ok)return fail('Invalid UAT match: '+validation.reason,400);
   if(match.matchSource!=='CLUB'||String(match.clubId)!==UAT_TEST_CLUB
    ||!String(match.identifier).startsWith('RH-UAT-'))
    return fail('UAT test club source and identifier required',403);
   const ids=new Set((gate.accounts||[]).map((a:any)=>a.duprId));
   const players=[match.teamA.player1,match.teamA.player2,match.teamB.player1,match.teamB.player2].filter(Boolean);
   if(players.some((id:string)=>!ids.has(id)))return fail('Only four verified UAT identities allowed',403);
   const previous=await entities(b).DuprUatSubmission.filter({identifier:match.identifier},'-submitted_at',5);
   if(previous?.length)return fail('Match identifier previously used or pending reconciliation',409);
   const reserved=await entities(b).DuprUatSubmission.create({
    identifier:match.identifier,status:'needs_reconciliation',submitted_by_user_id:user.id,
    submitted_at:now(),last_action_at:now()
   });
   const token=await partnerToken();
   const result=await duprRequest(UAT_PARTNER+'/match/v1.0/create',{method:'POST',token,body:match});
   const receipt=result.result||{};
   await entities(b).DuprUatSubmission.update(reserved.id,{
    match_code:String(receipt.matchCode||''),hashed_match_code:String(receipt.hashedMatchCode||''),
    status:receipt.matchCode?'submitted':'needs_reconciliation',last_action_at:now()
   });
   return reply({success:true,acknowledged:!!receipt.matchCode,identifier:match.identifier,
    matchCode:receipt.matchCode||null});
  }
  if(['uat_update_match','uat_delete_match'].includes(action)){
   if(body.confirmUatTest!==true)return fail('Explicit UAT confirmation required',400);
   const preflight=await handleIndependentDuprUat('uat_match_preflight',{},b,user);
   const gate=await preflight!.json();
   if(!gate.ready)return fail('Four verified test users and club organiser required',409);
   if(!gate.accounts?.some((a:any)=>a.slot===body.submitterSlot&&a.clubAdmin===true))return fail('DUPR submitting user must be club director or organiser',403);
   const identifier=String(body.identifier||body.match?.identifier||'');
   if(!identifier.startsWith('RH-UAT-'))return fail('Only UAT matches can be modified',403);
   const records=await entities(b).DuprUatSubmission.filter({identifier},'-submitted_at',5);
   if(records?.length!==1||!records[0].match_code||records[0].status==='deleted')
    return fail('Original DUPR acknowledgement required',409);
   const stored=records[0],token=await partnerToken();
   if(action==='uat_delete_match'){
    const receipt=await duprRequest(UAT_PARTNER+'/match/v1.0/delete',{method:'DELETE',token,
     body:{identifier,matchCode:stored.match_code}});
    await entities(b).DuprUatSubmission.update(stored.id,{status:'deleted',last_action_at:now()});
    return reply({success:true,identifier,deleted:receipt.status==='SUCCESS'});
   }
   const m=body.match;
   const valid=validateMatch(m,true);
   if(!valid.ok||m.identifier!==identifier||m.matchSource!=='CLUB'
    ||String(m.clubId)!==UAT_TEST_CLUB)return fail('Invalid UAT correction',400);
   const ids=new Set((gate.accounts||[]).map((a:any)=>a.duprId));
   if([m.teamA.player1,m.teamA.player2,m.teamB.player1,m.teamB.player2].filter(Boolean)
     .some((id:string)=>!ids.has(id)))return fail('Non-UAT identity in correction',403);
   const matchId=Number(stored.match_code);
   if(!Number.isSafeInteger(matchId))return fail('DUPR match ID requires review',409);
   const receipt=await duprRequest(UAT_PARTNER+'/match/v1.0/update',{method:'POST',token,body:{...m,matchId}});
   await entities(b).DuprUatSubmission.update(stored.id,{status:'updated',last_action_at:now()});
   return reply({success:true,identifier,updated:receipt.status==='SUCCESS'});
  }
  if(action==='uat_submit_batch'){
   if(body.confirmUatTest!==true)return fail('Explicit UAT confirmation required',400);
   const p=await handleIndependentDuprUat('uat_match_preflight',{},b,user);
   const gate=await p!.json();
   if(!gate.ready)return fail('Four verified UAT players and organiser required',409);
   if(!gate.accounts?.some((a:any)=>a.slot===body.submitterSlot&&a.clubAdmin===true))return fail('DUPR submitting user must be club director or organiser',403);
   const matches=body.matches;
   if(!Array.isArray(matches)||matches.length<1||matches.length>100)return fail('DUPR bulk limit is 1 to 100 matches');
   const ids=new Set((gate.accounts||[]).map((r:any)=>r.duprId)),seen=new Set<string>();
   for(const m of matches){
    const valid=validateMatch(m,true);
    if(!valid.ok)return fail('Invalid match in batch: '+valid.reason);
    if(m.matchSource!=='CLUB'||String(m.clubId)!==UAT_TEST_CLUB||!String(m.identifier).startsWith('RH-UAT-'))
     return fail('Batch requires unique UAT club identifiers',403);
    if(seen.has(m.identifier))return fail('Duplicate identifier inside batch',409);
    seen.add(m.identifier);
    if([m.teamA.player1,m.teamA.player2,m.teamB.player1,m.teamB.player2].filter(Boolean)
      .some((id:string)=>!ids.has(id)))return fail('Non-UAT player in batch',403);
    const existing=await entities(b).DuprUatSubmission.filter({identifier:m.identifier},'-submitted_at',2);
    if(existing?.length)return fail('Previously submitted identifier; reconcile before retry',409);
   }
   const submissionEntity=entities(b).DuprUatSubmission;
   const pending=[];
   for(const m of matches){
    pending.push(await submissionEntity.create({identifier:m.identifier,status:'needs_reconciliation',
      submitted_by_user_id:user.id,submitted_at:now(),last_action_at:now()}));
   }
   const token=await partnerToken();
   const result=await duprRequest(UAT_PARTNER+'/match/v1.0/batch',{method:'POST',token,body:matches});
   const successes=result.result?.successes||result.successes||[];
   const errors=result.result?.errors||result.errors||[];
   const receipts=[];
   for(const item of successes){
    const id=String(item.identifier||'');
    const position=matches.findIndex((m:any)=>m.identifier===id);
    if(position<0)continue;
    await submissionEntity.update(pending[position].id,{match_code:String(item.matchCode||''),
      hashed_match_code:String(item.hashedMatchCode||''),status:item.matchCode?'submitted':'needs_reconciliation',
      last_action_at:now()});
    receipts.push({identifier:id,matchCode:item.matchCode||null});
   }
   return reply({success:true,submitted:receipts,errors,acknowledged:receipts.length===matches.length&&errors.length===0});
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
