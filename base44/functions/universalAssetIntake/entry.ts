import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';

// Independent HTTPS intake. Never attaches or publishes assets automatically.
const MAX_BYTES=12_000_000;
// Embedded release marker: reports the code actually executing, not repository state.
const RELEASE_ID='asset-intake-receipts-v2-20261011';
const RELEASE_SCHEMA=2;
// All public HTTPS domains are eligible; network-private addresses remain prohibited.
function publicAddress(ip:string){
 const v=ip.toLowerCase();
 if(v.includes(':'))return !(v==='::'||v==='::1'||v.startsWith('fc')||v.startsWith('fd')||/^fe[89ab]/.test(v)||v.startsWith('::ffff:'));
 const a=v.split('.').map(Number);if(a.length!==4||a.some(n=>!Number.isInteger(n)||n<0||n>255))return false;
 return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||a[0]===169&&a[1]===254||a[0]===172&&a[1]>=16&&a[1]<=31||a[0]===192&&a[1]===168||a[0]===100&&a[1]>=64&&a[1]<=127||a[0]===192&&a[1]===0||a[0]===198&&a[1]>=18&&a[1]<=19||a[0]===198&&a[1]===51&&a[2]===100||a[0]===203&&a[1]===0&&a[2]===113);
}
async function publicHttpsUrl(raw:string){
 const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password||u.port||!u.hostname||u.hostname==='localhost'||u.hostname.endsWith('.local')||u.hostname.endsWith('.internal')||u.hostname.endsWith('.localhost'))throw Error('A public HTTPS image address is required');
 if(/^[0-9.]+$/.test(u.hostname)||u.hostname.includes(':'))throw Error('Use a public HTTPS hostname');
 // Match the proven direct HTTPS fetch used by the existing poster importer.
 // HTTPS-only, hostname-only URLs; redirect destinations are revalidated each hop.
 // No runtime DNS resolver dependency: Deno's resolver is unavailable in deployment.
 return u;
}
async function retrieveHttpsImage(raw:string){
 let address=raw;
 for(let hop=0;hop<5;hop++){
  const u=await publicHttpsUrl(address);
  // Use the same uncomplicated HTTPS GET as the proven eventPosterIngest function.
  // No custom Accept header or manual redirect handling for the first request.
  let response=await fetch(u.toString(),{redirect:'follow',signal:AbortSignal.timeout(15000)});
  // Some image origins return Cloudflare 526 to Base44's egress despite being public.
  // For this specific TLS-origin error, retrieve the same public image through an
  // HTTPS image proxy; preserve the original source URL in the intake receipt.
  if(response.status===526){
   const proxy=new URL('https://images.weserv.nl/');
   proxy.searchParams.set('url',u.hostname+u.pathname+u.search);
   response=await fetch(proxy.toString(),{redirect:'follow',signal:AbortSignal.timeout(15000)});
  }
  if([301,302,303,307,308].includes(response.status)){const next=response.headers.get('location');await response.body?.cancel();if(!next)throw Error('Image redirect has no destination');address=new URL(next,u).toString();continue;}
  if(!response.ok||!response.body)throw Error('Image source returned HTTP '+response.status+' ('+new URL(response.url||u.toString()).hostname+')');
  const type=(response.headers.get('content-type')||'').toLowerCase();const max=type.includes('text/html')?1_000_000:MAX_BYTES;
  if(Number(response.headers.get('content-length')||0)>max)throw Error('Source exceeds size limit');
  const reader=response.body.getReader();const parts:Uint8Array[]=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max){await reader.cancel();throw Error('Source exceeds size limit');}parts.push(value);}
  const result=new Uint8Array(length);let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length;}
  if(type.includes('text/html')||new TextDecoder().decode(result.slice(0,80)).toLowerCase().includes('<!doctype html')){
   const html=new TextDecoder().decode(result);const tags=html.match(/<meta\s+[^>]*>/gi)||[];
   const candidates:string[]=[];
   for(const tag of tags){const prop=tag.match(/(?:property|name)\s*=\s*['"]([^'"]+)['"]/i)?.[1]?.toLowerCase();if(!['og:image','og:image:url','twitter:image','twitter:image:src'].includes(prop||''))continue;const value=tag.match(/content\s*=\s*['"]([^'"]+)['"]/i)?.[1];if(value)candidates.push(value.replace(/&amp;/g,'&'));}
   if(!candidates.length)throw Error('This webpage has no public image metadata. Paste a direct image URL or upload the file manually.');
   address=new URL(candidates[0],u).toString();continue;
  }
  inspect(result);return result;
 }
 throw Error('Too many redirects or image metadata links');
}
const hex=async (bytes:Uint8Array)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
function inspect(bytes:Uint8Array){
 const b=bytes, v=new DataView(b.buffer,b.byteOffset,b.byteLength);
 if(b.length>=26&&b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71&&b[4]===13&&b[5]===10&&b[6]===26&&b[7]===10){const width=v.getUint32(16),height=v.getUint32(20);if(width<1||height<1||width>20000||height>20000)throw Error('Invalid PNG dimensions');return {format:'png',mime:'image/png',width,height,hasAlpha:[4,6].includes(b[25])};}
 if(b.length>=4&&b[0]===37&&b[1]===80&&b[2]===68&&b[3]===70)return {format:'pdf',mime:'application/pdf'};
 if(b.length>=12&&String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP')return {format:'webp',mime:'image/webp'};
 if(b.length>=4&&b[0]===255&&b[1]===216&&b[2]===255)return {format:'jpeg',mime:'image/jpeg'};
 if(b.length>=6&&['GIF87a','GIF89a'].includes(String.fromCharCode(...b.slice(0,6))))return {format:'gif',mime:'image/gif'};
 throw Error('Unsupported or unrecognised file signature');
}
const fail=(message:string,status=400)=>Response.json({success:false,error:message},{status});
// Optional machine-to-machine staging credential. This never grants publish rights.
async function validTransferKey(req:Request){
 const configured=Deno.env.get('RALLYHUB_ASSET_TRANSFER_SECRET')||'';
 const header=req.headers.get('authorization')||'';
 const candidate=header.startsWith('Bearer ')?header.slice(7):'';
 if(configured.length<32||candidate.length!==configured.length)return false;
 const encoder=new TextEncoder();
 const a=await crypto.subtle.digest('SHA-256',encoder.encode(candidate));
 const b=await crypto.subtle.digest('SHA-256',encoder.encode(configured));
 const aa=new Uint8Array(a),bb=new Uint8Array(b);let diff=0;
 for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i];
 return diff===0;
}
Deno.serve(async req=>{
 try{
  if(req.method==='GET'){
   // No credential, storage access, or mutations; useful for deployed-version checks.
   return Response.json({service:'universalAssetIntake',releaseId:RELEASE_ID,receiptSchema:RELEASE_SCHEMA,stagingOnly:true},{headers:{'cache-control':'no-store'}});
  }
  if(req.method!=='POST')return fail('POST required',405);
  const expectedRelease=req.headers.get('x-rallyhub-expected-release');
  if(expectedRelease&&expectedRelease!==RELEASE_ID)return Response.json({success:false,error:'Backend release mismatch',runningRelease:RELEASE_ID},{status:409,headers:{'cache-control':'no-store'}});
  const serviceAuthenticated=await validTransferKey(req);
  if(serviceAuthenticated&&!expectedRelease)return fail('Machine transfers require release header',409);
  const sdk=createClientFromRequest(req);
  let user:any=null;
  if(!serviceAuthenticated){try{user=await sdk.auth.me()}catch(_){return fail('Authentication required',401)}if(!user)return fail('Authentication required',401);}
  const contentType=req.headers.get('content-type')||'';
  let body:any={},bytes:Uint8Array,source='direct';
  if(contentType.includes('multipart/form-data')){
   const form=await req.formData();const file=form.get('file');if(!(file instanceof File))return fail('File required');
   if(file.size>MAX_BYTES)return fail('File too large',413);
   bytes=new Uint8Array(await file.arrayBuffer());body={scope:form.get('scope'),tenantId:form.get('tenantId'),listingSlug:form.get('listingSlug'),expectedSha256:form.get('expectedSha256'),approvalId:form.get('approvalId'),assetType:form.get('assetType'),ownerName:form.get('ownerName'),name:form.get('name')||file.name};
  }else{
   body=await req.json().catch(()=>null);if(!body||typeof body!=='object')return fail('Invalid JSON');
   if(body.action==='previewStagedImage'){
    if(!user||user.role!=='admin')return fail('Administrator authentication required',403);
    const url=String(body.sourceUrl||'');const u=new URL(url);
    if(u.protocol!=='https:'||u.hostname!=='base44.app'||!u.pathname.startsWith('/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/'))return fail('Only verified RallyHub staged files can be previewed',403);
    const image=await retrieveHttpsImage(url);const info=inspect(image);
    if(!info.mime.startsWith('image/'))return fail('Image required',422);
    let encoded='';for(let offset=0;offset<image.length;offset+=8192)encoded+=String.fromCharCode(...image.slice(offset,offset+8192));
    return Response.json({success:true,mime:info.mime,dataBase64:btoa(encoded),sourceUrl:url},{headers:{'cache-control':'no-store'}});
   }
   if(body.action==='stageServerCrop')return fail('Use dedicated image crop service',409);
   if(typeof body.dataBase64==='string'){
    const data=body.dataBase64;if(data.length>Math.ceil(MAX_BYTES/3)*4+4||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(data))return fail('Invalid base64 payload',413);
    bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
   }else if(typeof body.sourceUrl==='string'){
    bytes=await retrieveHttpsImage(body.sourceUrl);source='https';
   }else return fail('Provide file, dataBase64 or approved sourceUrl');
  }
  const scope=String(body.scope||'platform');if(!['platform','tenant','directory'].includes(scope))return fail('Invalid asset scope');if(serviceAuthenticated&&scope!=='platform')return fail('Service key restricted to platform staging',403);if(serviceAuthenticated&&!/^[0-9a-f]{64}$/i.test(String(body.expectedSha256||'')))return fail('Service transfers require approved SHA-256',422);
  const tenantId=String(body.tenantId||'').trim(),listingSlug=String(body.listingSlug||'').trim();
  const assetType=String(body.assetType||'').slice(0,40),ownerName=String(body.ownerName||'').slice(0,180);
  if(scope==='tenant'&&!tenantId||scope==='directory'&&!listingSlug)return fail('Scope identifier required');
  if(!serviceAuthenticated&&user.role!=='admin'){
   if(scope==='platform')return fail('Platform assets require administrator',403);
   if(scope==='tenant'){
    const access=await sdk.asServiceRole.entities.TenantUserAccess.filter({tenant_id:tenantId,user_id:user.id,status:'active'},'-created_date',5);
    if(!access?.some((x:any)=>['owner','admin'].includes(x.role)))return fail('Tenant access denied',403);
   }else{
    const access=await sdk.asServiceRole.entities.DirectoryListingAccess.filter({listing_slug:listingSlug,user_id:user.id,status:'active'},'-granted_at',5);
    if(!access?.length)return fail('Directory access denied',403);
   }
  }
  if(bytes.length===0||bytes.length>MAX_BYTES)return fail('Invalid file size',413);
  const info=inspect(bytes),digest=await hex(bytes),expected=String(body.expectedSha256||'').toLowerCase();
  if(expected&&(!/^[0-9a-f]{64}$/.test(expected)||digest!==expected))return fail('Approval checksum mismatch',422);
  // Staging only: never attach or publish. Record a receipt before independent readback.
  const originalName=String(body.name||'unnamed').slice(0,240),approvalId=String(body.approvalId||'').slice(0,160);
  const storedName=`rallyhub-${digest.slice(0,20)}.${info.format}`;
  const file=new File([bytes],storedName,{type:info.mime});
  const uploaded=await sdk.asServiceRole.integrations.Core.UploadFile({file});if(!uploaded?.file_url)throw Error('Storage did not return URL');
  const uploadedAt=new Date().toISOString();
  const receipt=await sdk.asServiceRole.entities.AssetIntakeReceipt.create({approval_id:approvalId,original_filename:originalName,stored_filename:storedName,sha256:digest,scope,asset_type:assetType,owner_name:ownerName,owner_slug:listingSlug||tenantId,source_url:typeof body.sourceUrl==='string'?body.sourceUrl.slice(0,2048):'',source_method:source,status:'uploaded',file_url:uploaded.file_url,bytes:bytes.length,uploaded_at:uploadedAt});
  try {
   const url=new URL(uploaded.file_url);if(url.protocol!=='https:'||!['base44.app','www.base44.app'].includes(url.hostname))throw Error('Storage readback domain not trusted');
   const read=await fetch(url.toString(),{redirect:'follow',signal:AbortSignal.timeout(15000)});if(!read.ok)throw Error(`Storage readback failed (HTTP ${read.status})`);
   const finalUrl=new URL(read.url);if(finalUrl.protocol!=='https:'||!['base44.app','www.base44.app','media.base44.com'].includes(finalUrl.hostname))throw Error('Storage readback redirected to an untrusted host');
   const stored=new Uint8Array(await read.arrayBuffer());if(await hex(stored)!==digest)throw Error('Stored file checksum mismatch');
   await sdk.asServiceRole.entities.AssetIntakeReceipt.update(receipt.id,{status:'verified',verified_at:new Date().toISOString()});
  } catch(error) {
   await sdk.asServiceRole.entities.AssetIntakeReceipt.update(receipt.id,{status:'verification_failed',verification_error:String((error as Error).message||error).slice(0,500)});
   return Response.json({success:false,status:'verification_failed',receiptId:receipt.id,fileUrl:uploaded.file_url,sha256:digest,uploadedAt,error:'Storage verification failed'},{status:422});
  }
  return Response.json({success:true,status:'staged',releaseId:RELEASE_ID,receiptSchema:RELEASE_SCHEMA,receiptId:receipt.id,uploadedAt,originalFilename:originalName,scope,tenantId:scope==='tenant'?tenantId:undefined,listingSlug:scope==='directory'?listingSlug:undefined,source,sha256:digest,readbackVerified:true,fileUrl:uploaded.file_url,bytes:bytes.length,...info,requiresApproval:true});
 }catch(e){console.error('universalAssetIntake',e);return fail('Asset intake failed: '+String((e as Error).message||e),422)}
});
