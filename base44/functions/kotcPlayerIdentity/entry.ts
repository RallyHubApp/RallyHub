import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const PENDING_MS = 30 * 60 * 1000;
const VERIFIED_MS = 18 * 60 * 60 * 1000;
function clean(v:any,max=240){return String(v??'').trim().slice(0,max);}
function randomHex(bytes=32){const b=new Uint8Array(bytes);crypto.getRandomValues(b);return Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('');}
function code4(){const b=new Uint32Array(1);crypto.getRandomValues(b);return String(1000+(b[0]%9000));}
async function sha256(v:string){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,'0')).join('');}
function validHostAccess(a:any,tenantId:string,sessionId:string){if(!a||a.status!=='active'||!['session_host','assistant_host'].includes(a.role))return false;if(String(a.tenant_id||'')!==String(tenantId)||String(a.session_id||'')!==String(sessionId))return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}
async function hostAllowed(base44:any,user:any,session:any){if(user?.role==='admin')return true;if(!user?.id)return false;const grants=await base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'});return (grants||[]).some((g:any)=>validHostAccess(g,session.tenant_id,session.id));}
async function resolveShare(base44:any,shareToken:string){const share=(await base44.asServiceRole.entities.KotcSessionShare.filter({token:shareToken,status:'active'}))?.[0];if(!share)throw new Error('Player Link is invalid or revoked.');if(share.expires_at&&Date.parse(share.expires_at)<Date.now())throw new Error('Player Link has expired.');const session=(await base44.asServiceRole.entities.KotcSession.filter({id:share.session_id}))?.[0];if(!session)throw new Error('KOTC session not found.');return {share,session};}

Deno.serve(async req=>{try{
  const base44=createClientFromRequest(req);const body=await req.json().catch(()=>({}));const action=clean(body.action||'state',40);
  let user:any=null;try{user=await base44.auth.me();}catch{}

  if(['host_list','approve','revoke'].includes(action)){
    if(!user)return Response.json({error:'Host sign-in required.'},{status:401});
    const sessionId=clean(body.sessionId,180);if(!sessionId)return Response.json({error:'sessionId required'},{status:400});
    const session=(await base44.asServiceRole.entities.KotcSession.filter({id:sessionId}))?.[0];if(!session)return Response.json({error:'KOTC session not found.'},{status:404});
    if(!(await hostAllowed(base44,user,session)))return Response.json({error:'Session Host access required.'},{status:403});
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
