export type EmailScope =
  | { scopeType:'platform'; purpose:string }
  | { scopeType:'tenant'; purpose:string; tenantId:string; clubId?:string|null };

export async function resolveEmailTransport(base44:any, scope:EmailScope) {
  const filter:any={scope_type:scope.scopeType,purpose:scope.purpose};
  if(scope.scopeType==='tenant'){filter.tenant_id=scope.tenantId;if(scope.clubId)filter.club_id=scope.clubId;}
  const rows=await base44.asServiceRole.entities.EmailTransportConfig.filter(filter,'-updated_date',20);
  const config=(rows||[]).find((r:any)=>r.status!=='disabled')||null;
  if(!config) throw new Error(`No email transport is configured for ${scope.scopeType}:${scope.purpose}.`);
  return config;
}
export async function requireConfiguredEmailTransport(base44:any,scope:EmailScope){
  const c=await resolveEmailTransport(base44,scope);
  if(c.status!=='configured') throw new Error(`Email transport for ${scope.scopeType}:${scope.purpose} is not active yet.`);
  return c;
}
function utf8Base64(v:string){const bytes=new TextEncoder().encode(v);let b='';for(const x of bytes)b+=String.fromCharCode(x);return btoa(b)}
function mimeHeader(v:string){return `=?UTF-8?B?${utf8Base64(v)}?=`}
function gmailRawEmail({to,senderEmail,senderName,replyTo,subject,textBody,htmlBody}:any){
 const boundary=`rallyhub_${crypto.randomUUID().replace(/-/g,'')}`;
 const h=[`From: ${mimeHeader(senderName)} <${senderEmail}>`,`To: ${to}`,`Reply-To: ${replyTo||senderEmail}`,`Subject: ${mimeHeader(subject)}`,'MIME-Version: 1.0'];
 const mime=htmlBody?[...h,`Content-Type: multipart/alternative; boundary="${boundary}"`,'',`--${boundary}`,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: 8bit','',textBody,`--${boundary}`,'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: 8bit','',htmlBody,`--${boundary}--`,''].join('\r\n'):[...h,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: 8bit','',textBody].join('\r\n');
 return utf8Base64(mime).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
}
export async function sendWithConfiguredEmailTransport(base44:any,scope:EmailScope,message:{to:string;subject:string;textBody:string;htmlBody?:string|null;senderName?:string|null}){
 const c=await requireConfiguredEmailTransport(base44,scope); const senderName=String(message.senderName||c.sender_name||'RallyHub').trim();
 if(c.provider==='gmail_connector'){
  const {accessToken}=await base44.asServiceRole.connectors.getConnection('gmail'); if(!accessToken)throw new Error('The Gmail connector is not authorised.');
  const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({raw:gmailRawEmail({to:message.to,senderEmail:c.sender_email,senderName,replyTo:c.reply_to,subject:message.subject,textBody:message.textBody,htmlBody:message.htmlBody})})});
  const payload=await response.json().catch(()=>({})); if(!response.ok)throw new Error(payload?.error?.message||`Gmail send failed (${response.status})`); return {provider:c.provider,senderEmail:c.sender_email,payload};
 }
 if(c.provider==='google_apps_script'){
  const url=String(c.gateway_url||'').trim(), env=String(c.secret_env_var||'').trim(), secret=env?Deno.env.get(env):'';
  if(!url||!/^https:\/\//i.test(url))throw new Error('The tenant mail gateway URL is not configured.'); if(!secret)throw new Error('The tenant mail gateway secret is not configured.');
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret,to:message.to,subject:message.subject,textBody:message.textBody,htmlBody:message.htmlBody||'',senderName,replyTo:c.reply_to||c.sender_email})});
  const payload=await response.json().catch(()=>({})); if(!response.ok||payload?.ok===false)throw new Error(payload?.error||`Tenant mail gateway failed (${response.status})`); return {provider:c.provider,senderEmail:c.sender_email,payload};
 }
 if(c.provider==='base44_core'){await base44.asServiceRole.integrations.Core.SendEmail({to:message.to,from_name:senderName,subject:message.subject,body:message.textBody});return {provider:c.provider,senderEmail:c.sender_email};}
 throw new Error(`Email provider ${c.provider} is configured but its secure transport endpoint is not connected yet.`);
}
