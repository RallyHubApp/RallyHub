import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { sendWithConfiguredEmailTransport } from '../membershipApplication/emailRouter.ts';
import { renderBasicBrandedEmail } from '../membershipApplication/communicationsBasicRenderer.ts';

const PENDING_MS = 30 * 60 * 1000;
const VERIFIED_MS = 18 * 60 * 60 * 1000;
function clean(v:any,max=240){return String(v??'').trim().slice(0,max);}
function randomHex(bytes=32){const b=new Uint8Array(bytes);crypto.getRandomValues(b);return Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('');}
function code4(){const b=new Uint32Array(1);crypto.getRandomValues(b);return String(1000+(b[0]%9000));}
async function sha256(v:string){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,'0')).join('');}
function validHostAccess(a:any,tenantId:string,sessionId:string){if(!a||a.status!=='active'||!['session_host','assistant_host'].includes(a.role))return false;if(String(a.tenant_id||'')!==String(tenantId)||String(a.session_id||'')!==String(sessionId))return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}
async function hostAllowed(base44:any,user:any,session:any){if(user?.role==='admin')return true;if(!user?.id)return false;const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'});return (grants||[]).some((g:any)=>validHostAccess(g,session.tenant_id,session.id));}
async function resolveShare(base44:any,shareToken:string){const share=(await base44.asServiceRole.entities.KotcSessionShare.filter({token:shareToken,status:'active'}))?.[0];if(!share)throw new Error('Player Link is invalid or revoked.');if(share.expires_at&&Date.parse(share.expires_at)<Date.now())throw new Error('Player Link has expired.');const session=(await base44.asServiceRole.entities.KotcSession.filter({id:share.session_id}))?.[0];if(!session)throw new Error('KOTC session not found.');return {share,session};}


const CODE_MS=10*60*1000;
const MAX_ATTEMPTS=5;
function maskEmail(s:string){const [local,domain]=s.split('@');return local&&domain?`${local.slice(0,2)}***@${domain}`:'registered email';}
async function memberForParticipant(base44:any,session:any,participant:any){
 if(!participant?.player_id)return null;
 const members=await base44.asServiceRole.entities.Member.filter({tenant_id:session.tenant_id,club_id:session.club_id,player_id:participant.player_id});
 const eligible=(members||[]).filter((m:any)=>m.membership_status==='paid_active'&&m.club_membership_id);
 if(eligible.length!==1)return null;
 const member=eligible[0];
 const membership=(await base44.asServiceRole.entities.ClubMembership.filter({id:member.club_membership_id,tenant_id:session.tenant_id,club_id:session.club_id}))?.[0];
 if(!membership||membership.membership_status!=='paid_active'||membership.relationship_type!=='member')return null;
 return {member,membership};
}
async function verifiedDevice(base44:any,session:any,participant:any,rawToken:string){
 if(!rawToken)return null;
 const linked=await memberForParticipant(base44,session,participant);if(!linked)return null;
 const hash=await sha256(rawToken);
 const rows=await base44.asServiceRole.entities.KotcMemberDevice.filter({tenant_id:session.tenant_id,club_id:session.club_id,membership_id:linked.membership.id,device_token_hash:hash,status:'active'});
 return rows?.[0]?{device:rows[0],linked}:null;
}
async function issueDevice(base44:any,session:any,participant:any,rawToken:string,method:string,approvedBy?:string){
 const linked=await memberForParticipant(base44,session,participant);if(!linked)throw new Error('Player membership is not verified. Ask the host for assistance.');
 const hash=await sha256(rawToken);const existing=(await base44.asServiceRole.entities.KotcMemberDevice.filter({membership_id:linked.membership.id,device_token_hash:hash}))?.[0];
 const patch={status:'active',approved_at:new Date().toISOString(),verification_method:method,approved_by_user_id:approvedBy||undefined,last_used_at:new Date().toISOString()};
 if(existing){await base44.asServiceRole.entities.KotcMemberDevice.update(existing.id,patch);return existing.id;}
 const row=await base44.asServiceRole.entities.KotcMemberDevice.create({tenant_id:session.tenant_id,club_id:session.club_id,membership_id:linked.membership.id,member_id:linked.member.id,player_id:participant.player_id,client_id:'verified',device_token_hash:hash,...patch});return row.id;
}
async function sendCodeEmail(base44:any,session:any,to:string,name:string,code:string){
 const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:session.tenant_id,clubId:session.club_id};
 const club=(await base44.asServiceRole.entities.Club.filter({id:session.club_id,tenant_id:session.tenant_id}))?.[0];
 const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({tenant_id:session.tenant_id,owner_scope:'tenant',status:'active'},'-updated_date',30);
 const kit=(kits||[]).find((k:any)=>!k.club_id||String(k.club_id)===String(session.club_id));
 if(!club||!kit)throw new Error('Approved club email branding is unavailable. No verification email was sent.');
 const html=renderBasicBrandedEmail(`<h1>Verify your KOTC device</h1><p>Hello ${String(name||'player').replace(/[<>&"']/g,'')},</p><p>Your one-time RallyHub code is <strong style="font-size:26px;letter-spacing:5px">${code}</strong>.</p><p>Enter this code on your KOTC page within 10 minutes. If you did not request it, ignore this message.</p>`,kit,club,club.name||'Clare Pickleball','KOTC device verification','Your one-time access code');
 await sendWithConfiguredEmailTransport(base44,scope,{to,subject:'Your KOTC verification code',textBody:`Your RallyHub KOTC verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore it.`,htmlBody:html});
}
async function handleMemberAction(base44:any,user:any,action:string,body:any,session:any,share:any){
 const participantId=clean(body.participantId,180),rawToken=clean(body.deviceToken,180);
 const participant=participantId?(await base44.asServiceRole.entities.KotcSessionParticipant.filter({id:participantId,session_id:session.id}))?.[0]:null;
 if(!participant||['withdrawn','replaced','no_show'].includes(participant.status))return Response.json({error:'Select a current player.'},{status:404});
 const linked=await memberForParticipant(base44,session,participant);
 if(!linked)return Response.json({error:'This player has no uniquely linked active membership record. Ask the host to check the membership link.'},{status:409});
 if(action==='member_state'){
   const verified=await verifiedDevice(base44,session,participant,rawToken);
   if(verified){
     const hash=await sha256(rawToken);
     const access=(await base44.asServiceRole.entities.KotcPlayerDeviceAccess.filter({session_id:session.id,share_id:share.id,participant_id:participant.id,device_token_hash:hash,status:'approved'}))?.[0];
     if(!access||access.expires_at&&Date.parse(access.expires_at)<Date.now()){
       const patch={tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,share_id:share.id,participant_id:participant.id,client_id:clean(body.clientId,180)||'member-device',device_token_hash:hash,verification_code:'',status:'approved',requested_at:new Date().toISOString(),approved_at:new Date().toISOString(),expires_at:new Date(Date.now()+VERIFIED_MS).toISOString()};
       if(access)await base44.asServiceRole.entities.KotcPlayerDeviceAccess.update(access.id,patch);else await base44.asServiceRole.entities.KotcPlayerDeviceAccess.create(patch);
     }
   }
   return Response.json({success:true,verified:!!verified,status:verified?'approved':'none',identity:verified?{participant_id:participant.id,player_id:participant.player_id,display_name:participant.display_name}:null});
 }
 if(action==='member_request'){
   const clientId=clean(body.clientId,180);if(!clientId||!rawToken.startsWith('kpd_'))return Response.json({error:'Device credential required.'},{status:400});
   const verified=await verifiedDevice(base44,session,participant,rawToken);
   if(verified)return Response.json({success:true,verified:true,status:'approved'});
   const email=clean(linked.member.primary_email,240);
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:'No valid membership email. Ask your host for assistance.'},{status:409});
   const recent=await base44.asServiceRole.entities.KotcMemberVerification.filter({membership_id:linked.membership.id,client_id},'-requested_at',10);
   if((recent||[]).some((v:any)=>v.status==='pending'&&Date.now()-Date.parse(v.requested_at)<60000))return Response.json({error:'Please wait one minute before requesting another code.'},{status:429});
   for(const v of recent||[])if(v.status==='pending')await base44.asServiceRole.entities.KotcMemberVerification.update(v.id,{status:'revoked'});
   const code=code4(),now=new Date().toISOString();const row=await base44.asServiceRole.entities.KotcMemberVerification.create({tenant_id:session.tenant_id,club_id:session.club_id,membership_id:linked.membership.id,participant_id:participant.id,session_id:session.id,client_id,device_token_hash:await sha256(rawToken),code_hash:await sha256(`${rowlessSalt(session)}:${code}`),delivery_channel:'email',destination_hint:maskEmail(email),status:'pending',attempts:0,requested_at:now,expires_at:new Date(Date.now()+CODE_MS).toISOString()});
   try{await sendCodeEmail(base44,session,email,participant.display_name,code);}catch(e){await base44.asServiceRole.entities.KotcMemberVerification.update(row.id,{status:'revoked'});throw e;}
   return Response.json({success:true,status:'pending',requestId:row.id,destination:maskEmail(email)});
 }
 if(action==='member_verify'){
   const code=clean(body.code,8),clientId=clean(body.clientId,180);if(!/^\d{4}$/.test(code))return Response.json({error:'Enter the four-digit code.'},{status:400});
   const rows=await base44.asServiceRole.entities.KotcMemberVerification.filter({membership_id:linked.membership.id,participant_id:participant.id,client_id,device_token_hash:await sha256(rawToken)},'-requested_at',10);
   const v=(rows||[]).find((x:any)=>x.status==='pending');if(!v)return Response.json({error:'Request a fresh verification code.'},{status:409});
   if(Date.parse(v.expires_at)<Date.now()){await base44.asServiceRole.entities.KotcMemberVerification.update(v.id,{status:'expired'});return Response.json({error:'Code expired. Request a new code.'},{status:410});}
   if(Number(v.attempts||0)>=MAX_ATTEMPTS)return Response.json({error:'Too many attempts. Contact your host.'},{status:429});
   const attempts=Number(v.attempts||0)+1;
   if(v.code_hash!==await sha256(`${rowlessSalt(session)}:${code}`)){await base44.asServiceRole.entities.KotcMemberVerification.update(v.id,{attempts,status:attempts>=MAX_ATTEMPTS?'locked':'pending'});return Response.json({error:'Incorrect code.'},{status:401});}
   await base44.asServiceRole.entities.KotcMemberVerification.update(v.id,{status:'verified',attempts,verified_at:new Date().toISOString()});
   await issueDevice(base44,session,participant,rawToken,'email');
   return Response.json({success:true,verified:true,status:'approved',identity:{participant_id:participant.id,player_id:participant.player_id,display_name:participant.display_name}});
 }
 return Response.json({error:'Unsupported verification action.'},{status:400});
}
function rowlessSalt(session:any){return String(session.id||'');}

Deno.serve(async req=>{try{
  const base44=createClientFromRequest(req);const body=await req.json().catch(()=>({}));const action=clean(body.action||'state',40);
  let user:any=null;try{user=await base44.auth.me();}catch{}

  if(['host_list','approve','revoke','member_host_list','member_host_approve','member_host_revoke'].includes(action)){
    if(!user)return Response.json({error:'Host sign-in required.'},{status:401});
    const sessionId=clean(body.sessionId,180);if(!sessionId)return Response.json({error:'sessionId required'},{status:400});
    const session=(await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}))?.[0];if(!session)return Response.json({error:'KOTC session not found.'},{status:404});
    if(!(await hostAllowed(base44,user,session)))return Response.json({error:'Session Host access required.'},{status:403});
    if(action==='member_host_list'){
      const rows=await base44.asServiceRole.entities.KotcMemberVerification.filter({session_id:session.id},'-requested_at',100);
      const pending=(rows||[]).filter((v:any)=>v.status==='pending'&&Date.parse(v.expires_at)>Date.now());
      const participants=await base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id});
      return Response.json({success:true,requests:pending.map((v:any)=>({id:v.id,participant_id:v.participant_id,display_name:(participants||[]).find((p:any)=>p.id===v.participant_id)?.display_name||'Player',destination:v.destination_hint,requested_at:v.requested_at}))});
    }
    if(action==='member_host_approve'||action==='member_host_revoke'){
      const requestId=clean(body.requestId,180);const v=(await base44.asServiceRole.entities.KotcMemberVerification.filter({id:requestId,session_id:session.id}))?.[0];
      if(!v||v.status!=='pending'||Date.parse(v.expires_at)<Date.now())return Response.json({error:'Pending verification not found or expired.'},{status:404});
      if(action==='member_host_revoke'){await base44.asServiceRole.entities.KotcMemberVerification.update(v.id,{status:'revoked'});return Response.json({success:true});}
      const participant=(await base44.asServiceRole.entities.KotcSessionParticipant.filter({id:v.participant_id,session_id:session.id}))?.[0];
      if(!participant)return Response.json({error:'Player not found.'},{status:404});
      const device=(await base44.asServiceRole.entities.KotcMemberDevice.filter({membership_id:v.membership_id,device_token_hash:v.device_token_hash}))?.[0];
      if(device)await base44.asServiceRole.entities.KotcMemberDevice.update(device.id,{status:'active',approved_by_user_id:user.id,approved_at:new Date().toISOString(),verification_method:'host'});
      else await base44.asServiceRole.entities.KotcMemberDevice.create({tenant_id:session.tenant_id,club_id:session.club_id,membership_id:v.membership_id,player_id:participant.player_id,client_id:v.client_id,device_token_hash:v.device_token_hash,status:'active',approved_at:new Date().toISOString(),approved_by_user_id:user.id,verification_method:'host'});
      await base44.asServiceRole.entities.KotcMemberVerification.update(v.id,{status:'verified',verified_at:new Date().toISOString(),approved_by_user_id:user.id});
      return Response.json({success:true,approved:true});
    }
    if(action==='host_list'){
      const rows=await base44.asServiceRole.entities.KotcPlayerDeviceAccess.filter({session_id:session.id},'-requested_at',100);
      const now=Date.now();const usable=(rows||[]).filter((r:any)=>r.status!=='revoked'&&(!r.expires_at||Date.parse(r.expires_at)>now));
      const pids=[...new Set(usable.map((r:any)=>String(r.participant_id||'')).filter(Boolean))];
      const participants=pids.length?await base44.asServiceRole.entities.KotcSessionParticipant.filter({id:{$in:pids}}):[];const names=Object.fromEntries((participants||[]).map((p:any)=>[p.id,p.display_name]));
      return Response.json({success:true,requests:usable.map((r:any)=>({id:r.id,participant_id:r.participant_id,display_name:names[r.participant_id]||'Player',verification_code:r.verification_code,status:r.status,requested_at:r.requested_at,approved_at:r.approved_at,expires_at:r.expires_at,client_id:r.client_id}))});
    }
    const requestId=clean(body.requestId,180);const row=(await base44.asServiceRole.entities.KotcPlayerDeviceAccess.filter({id:requestId,session_id:session.id}))?.[0];if(!row)return Response.json({error:'Verification request not found.'},{status:404});
    if(action==='revoke'){await base44.asServiceRole.entities.KotcPlayerDeviceAccess.update(row.id,{status:'revoked'});return Response.json({success:true});}
    if(row.status==='approved')return Response.json({success:true,alreadyApproved:true});
    if(row.expires_at&&Date.parse(row.expires_at)<Date.now())return Response.json({error:'This verification request has expired. Ask the player to request a new code.'},{status:410});
    const approvedAt=new Date().toISOString();await base44.asServiceRole.entities.KotcPlayerDeviceAccess.update(row.id,{status:'approved',approved_at:approvedAt,approved_by_user_id:user.id,expires_at:new Date(Date.now()+VERIFIED_MS).toISOString()});
    return Response.json({success:true,approved:true,participantId:row.participant_id});
  }

  const shareToken=clean(body.shareToken||body.token,180);if(!shareToken)return Response.json({error:'Player Link token required.'},{status:400});
  const {share,session}=await resolveShare(base44,shareToken);
  if(['member_state','member_request','member_verify'].includes(action))return await handleMemberAction(base44,user,action,body,session,share);

  if(action==='request'){
    const participantId=clean(body.participantId,180),clientId=clean(body.clientId,180);if(!participantId||!clientId)return Response.json({error:'Choose your name and try again.'},{status:400});
    const participant=(await base44.asServiceRole.entities.KotcSessionParticipant.filter({id:participantId,session_id:session.id}))?.[0];if(!participant||['withdrawn','replaced','no_show'].includes(participant.status))return Response.json({error:'That player is not available for verification in this session.'},{status:404});
    const existing=(await base44.asServiceRole.entities.KotcPlayerDeviceAccess.filter({session_id:session.id,participant_id:participant.id,client_id:clientId},'-requested_at',10))||[];
    for(const row of existing){if(row.status==='pending')try{await base44.asServiceRole.entities.KotcPlayerDeviceAccess.update(row.id,{status:'revoked'});}catch{}}
    const rawToken=`kpd_${randomHex(32)}`,hash=await sha256(rawToken),verificationCode=code4();let autoVerified=false;
    if(user?.id&&participant.player_id){try{const linked=(await base44.asServiceRole.entities.Player.filter({id:participant.player_id,user_id:user.id}))?.[0];autoVerified=!!linked;}catch{}}
    const requestedAt=new Date().toISOString();const expiresAt=new Date(Date.now()+(autoVerified?VERIFIED_MS:PENDING_MS)).toISOString();
    const row=await base44.asServiceRole.entities.KotcPlayerDeviceAccess.create({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,share_id:share.id,participant_id:participant.id,client_id:clientId,device_token_hash:hash,verification_code:verificationCode,status:autoVerified?'approved':'pending',requested_at:requestedAt,expires_at:expiresAt,approved_at:autoVerified?requestedAt:undefined,auto_verified_user_id:autoVerified?user.id:undefined});
    return Response.json({success:true,requestId:row.id,deviceToken:rawToken,verificationCode,displayName:participant.display_name,status:autoVerified?'approved':'pending',autoVerified});
  }

  if(action==='state'){
    const rawToken=clean(body.deviceToken,180);if(!rawToken)return Response.json({success:true,status:'none',verified:false});const hash=await sha256(rawToken);
    const rows=await base44.asServiceRole.entities.KotcPlayerDeviceAccess.filter({session_id:session.id,share_id:share.id,device_token_hash:hash},'-requested_at',5);const row=rows?.[0];if(!row)return Response.json({success:true,status:'none',verified:false});
    if(row.expires_at&&Date.parse(row.expires_at)<Date.now()){if(row.status!=='expired')try{await base44.asServiceRole.entities.KotcPlayerDeviceAccess.update(row.id,{status:'expired'});}catch{}return Response.json({success:true,status:'expired',verified:false});}
    const participant=(await base44.asServiceRole.entities.KotcSessionParticipant.filter({id:row.participant_id,session_id:session.id}))?.[0];
    if(!participant)return Response.json({success:true,status:'revoked',verified:false});
    return Response.json({success:true,status:row.status,verified:row.status==='approved',identity:row.status==='approved'?{participant_id:participant.id,player_id:participant.player_id||null,display_name:participant.display_name,status:participant.status}:null,verificationCode:row.status==='pending'?row.verification_code:undefined,requestId:row.id});
  }

  return Response.json({error:'Unknown identity action.'},{status:400});
}catch(error){console.error('kotcPlayerIdentity',error);return Response.json({error:(error as any)?.message||'Could not verify this KOTC player.'},{status:500});}});
