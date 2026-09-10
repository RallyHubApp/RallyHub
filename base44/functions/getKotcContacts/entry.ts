import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const RUNTIME_VERSION='kotc-contacts-2026-09-10-r1';
function validAccess(a:any,tenantId:string,sessionId:string){if(!a||a.status!=='active'||String(a.tenant_id)!==String(tenantId)||String(a.session_id)!==String(sessionId)||a.role!=='session_host')return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}
function sleep(ms:number){return new Promise(resolve=>setTimeout(resolve,ms));}
function isRateLimit(error:any){return /rate limit|too many requests|\b429\b/i.test(String(error?.message||error||''));}
async function retry<T>(label:string,fn:()=>Promise<T>,attempts=4){let last:any;for(let i=0;i<attempts;i++){try{return await fn();}catch(error){last=error;if(!isRateLimit(error)||i===attempts-1)throw error;await sleep(Math.min(1200,180*Math.pow(2,i))+Math.floor(Math.random()*80));}}throw last;}

Deno.serve(async req=>{try{
 const base44=createClientFromRequest(req),user=await base44.auth.me();if(!user)return Response.json({error:'Unauthorized'},{status:401});
 const body=await req.json().catch(()=>({})),sessionId=String(body.sessionId||'');if(!sessionId)return Response.json({error:'sessionId required'},{status:400});
 const session=(await retry('session',()=>base44.asServiceRole.entities.KotcSession.filter({id:sessionId})))?.[0];if(!session)return Response.json({error:'Session not found'},{status:404});
 let allowed=user.role==='admin';if(!allowed){const grants=await retry('access',()=>base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'}));allowed=(grants||[]).some((a:any)=>validAccess(a,session.tenant_id,session.id));}if(!allowed)return Response.json({error:'KOTC host access required'},{status:403});
 const participants=await retry('participants',()=>base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id}));
 const playerIds=[...new Set((participants||[]).map((p:any)=>p.player_id).filter(Boolean))];const playerRecords=playerIds.length?await retry('players',()=>base44.asServiceRole.entities.Player.filter({id:{$in:playerIds}})):[];
 const personIds=[...new Set((playerRecords||[]).map((p:any)=>p.person_id).filter(Boolean))];const people=personIds.length?await retry('people',()=>base44.asServiceRole.entities.Person.filter({id:{$in:personIds}})):[];const personById=Object.fromEntries((people||[]).map((p:any)=>[p.id,p]));
 const contactDirectory=Object.fromEntries((playerRecords||[]).map((player:any)=>{const person=personById[player.person_id]||{};const emergencyName=String(person.emergency_contact_name||person.emergency_contact_raw||player.emergency_contact||'').trim();const emergencyRelationship=String(person.emergency_contact_relationship||'').trim();const emergencyMobile=String(person.emergency_mobile||'').trim();return[player.id,{phone:person.mobile||player.phone||'',emergency_name:emergencyName,emergency_relationship:emergencyRelationship,emergency_mobile:emergencyMobile,emergency_contact:[emergencyName,emergencyRelationship].filter(Boolean).join(' — ')||emergencyName||''}];}));
 return Response.json({success:true,contactDirectory,runtimeVersion:RUNTIME_VERSION});
}catch(error){return Response.json({error:(error as any)?.message||'Could not load KOTC contacts',runtimeVersion:RUNTIME_VERSION},{status:isRateLimit(error)?503:500});}});