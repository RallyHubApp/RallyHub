export type EmailScope = { scopeType:'tenant'; purpose:string; tenantId:string; clubId?:string|null };
async function resolve(base44:any,scope:EmailScope){
  const filter:any={scope_type:'tenant',purpose:scope.purpose,tenant_id:scope.tenantId}; if(scope.clubId) filter.club_id=scope.clubId;
  const rows=await base44.asServiceRole.entities.EmailTransportConfig.filter(filter,'-updated_date',20);
  const config=(rows||[]).find((r:any)=>r.status!=='disabled')||null;
  if(!config||config.status!=='configured') throw new Error('Club email transport is not configured.'); return config;
}
function b64(v:string){const bytes=new TextEncoder().encode(v);let s='';for(const x of bytes)s+=String.fromCharCode(x);return btoa(s);}
function mh(v:string){return `=?UTF-8?B?${b64(v)}?=`;}
function rawEmail(o:any){const boundary=`rh_${crypto.randomUUID().replaceAll('-','')}`;const h=[`From: ${mh(o.senderName)} <${o.senderEmail}>`,`To: ${o.to}`,`Reply-To: ${o.replyTo||o.senderEmail}`,`Subject: ${mh(o.subject)}`,'MIME-Version: 1.0'];return b64([...h,`Content-Type: multipart/alternative; boundary="${boundary}"`,'',`--${boundary}`,'Content-Type: text/plain; charset=UTF-8','',''+o.textBody,`--${boundary}`,'Content-Type: text/html; charset=UTF-8','',''+o.htmlBody,`--${boundary}--`,''].join('\r\n')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');}
export async function sendClubEmail(base44:any,scope:EmailScope,message:any){
  const c=await resolve(base44,scope);
  if(c.provider==='gmail_connector'){const {accessToken}=await base44.asServiceRole.connectors.getConnection('gmail');if(!accessToken)throw new Error('Gmail connector is not authorised.');const r=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({raw:rawEmail({to:message.to,senderEmail:c.sender_email,senderName:c.sender_name,replyTo:c.reply_to,subject:message.subject,textBody:message.textBody,htmlBody:message.htmlBody})})});const p=await r.json().catch(()=>({}));if(!r.ok)throw new Error(p?.error?.message||`Gmail send failed (${r.status})`);return;}
  if(c.provider==='google_apps_script'){const secret=c.secret_env_var?Deno.env.get(c.secret_env_var):'';if(!c.gateway_url||!secret)throw new Error('Club mail gateway is incomplete.');const r=await fetch(c.gateway_url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret,to:message.to,subject:message.subject,textBody:message.textBody,htmlBody:message.htmlBody,senderName:c.sender_name,replyTo:c.reply_to||c.sender_email})});const p=await r.json().catch(()=>({}));if(!r.ok||p?.ok===false)throw new Error(p?.error||`Club mail gateway failed (${r.status})`);return;}
  await base44.asServiceRole.integrations.Core.SendEmail({to:message.to,from_name:c.sender_name,subject:message.subject,body:message.textBody});
}
