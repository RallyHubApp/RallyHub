import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';

// Standalone, transport-neutral intake. Never attaches or publishes assets automatically.
const MAX_BYTES=12_000_000;
// Embedded release marker: reports the code actually executing, not repository state.
const RELEASE_ID='asset-intake-receipts-v2-20261011';
const RELEASE_SCHEMA=2;
const trustedHosts=new Set(['pickleballireland.ie','www.pickleballireland.ie','pickledsports.ie','www.pickledsports.ie','base44.app','www.base44.app']);
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
  if(!expectedRelease||expectedRelease!==RELEASE_ID)return Response.json({success:false,error:'Backend release mismatch',runningRelease:RELEASE_ID},{status:409,headers:{'cache-control':'no-store'}});
  const serviceAuthenticated=await validTransferKey(req);
  const sdk=createClientFromRequest(req);
  let user:any=null;
  if(!serviceAuthenticated){try{user=await sdk.auth.me()}catch(_){return fail('Authentication required',401)}if(!user)return fail('Authentication required',401);}
  const contentType=req.headers.get('content-type')||'';
  let body:any={},bytes:Uint8Array,source='direct';
  if(contentType.includes('multipart/form-data')){
   const form=await req.formData();const file=form.get('file');if(!(file instanceof File))return fail('File required');
   if(file.size>MAX_BYTES)return fail('File too large',413);
   bytes=new Uint8Array(await file.arrayBuffer());body={scope:form.get('scope'),tenantId:form.get('tenantId'),listingSlug:form.get('listingSlug'),expectedSha256:form.get('expectedSha256'),approvalId:form.get('approvalId'),name:form.get('name')||file.name};
  }else{
   body=await req.json().catch(()=>null);if(!body||typeof body!=='object')return fail('Invalid JSON');
   if(typeof body.dataBase64==='string'){
    const data=body.dataBase64;if(data.length>Math.ceil(MAX_BYTES/3)*4+4||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(data))return fail('Invalid base64 payload',413);
    bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
   }else if(typeof body.sourceUrl==='string'){
    const url=new URL(body.sourceUrl);if(url.protocol!=='https:'||!trustedHosts.has(url.hostname)||url.username||url.password||url.port)return fail('Untrusted source URL');
    const response=await fetch(url.toString(),{redirect:'manual',signal:AbortSignal.timeout(15000)});if(!response.ok)return fail('Source unavailable',422);
    const size=Number(response.headers.get('content-length')||0);if(size>MAX_BYTES)return fail('Source too large',413);
    bytes=new Uint8Array(await response.arrayBuffer());source='https';
   }else return fail('Provide file, dataBase64 or approved sourceUrl');
  }
  const scope=String(body.scope||'platform');if(!['platform','tenant','directory'].includes(scope))return fail('Invalid asset scope');if(serviceAuthenticated&&scope!=='platform')return fail('Service key restricted to platform staging',403);if(serviceAuthenticated&&!/^[0-9a-f]{64}$/i.test(String(body.expectedSha256||'')))return fail('Service transfers require approved SHA-256',422);
  const tenantId=String(body.tenantId||'').trim(),listingSlug=String(body.listingSlug||'').trim();
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
  const receipt=await sdk.asServiceRole.entities.AssetIntakeReceipt.create({approval_id:approvalId,original_filename:originalName,stored_filename:storedName,sha256:digest,scope,status:'uploaded',file_url:uploaded.file_url,bytes:bytes.length,uploaded_at:uploadedAt});
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
