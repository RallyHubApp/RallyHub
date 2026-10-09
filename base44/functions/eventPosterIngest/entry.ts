import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';
const hosts=new Set(['pickleballireland.ie','www.pickleballireland.ie','base44.app','www.base44.app','pickledsports.ie','www.pickledsports.ie']);
function inspect(bytes:Uint8Array,type:string){
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let width=0,height=0,format='';
 if(bytes.length>=24&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71){format='png';width=v.getUint32(16);height=v.getUint32(20)}
 else if(bytes.length>=30&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'){
  format='webp';const sub=String.fromCharCode(...bytes.slice(12,16));
  if(sub==='VP8X'){width=1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16);height=1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16)}
  else if(sub==='VP8 '&&bytes.length>=30){width=v.getUint16(26,true)&0x3fff;height=v.getUint16(28,true)&0x3fff}
  else if(sub==='VP8L'&&bytes.length>=25){const n=v.getUint32(21,true);width=(n&0x3fff)+1;height=((n>>14)&0x3fff)+1}
 }else if(bytes.length>4&&bytes[0]===255&&bytes[1]===216){format='jpeg';let i=2;while(i+9<bytes.length){if(bytes[i]!==255){i++;continue}const marker=bytes[i+1];if(marker===216||marker===217){i+=2;continue}const len=(bytes[i+2]<<8)|bytes[i+3];if(len<2)break;if([192,193,194,195,198,199,201,202].includes(marker)){height=(bytes[i+5]<<8)|bytes[i+6];width=(bytes[i+7]<<8)|bytes[i+8];break}i+=2+len}}
 if(!width||!height||width>20000||height>20000)throw new Error('Image dimensions cannot be verified');
 return {format,width,height,qualityWarning:width<700||height<700||bytes.length<30000};
}
Deno.serve(async req=>{
 try{
  const b=createClientFromRequest(req),user=await b.auth.me();if(user?.role!=='admin')return Response.json({error:'Admin access required'},{status:403});
  const body=await req.json().catch(()=>({})),url=new URL(String(body.sourceUrl||''));
  if(url.protocol!=='https:'||!hosts.has(url.hostname)||url.username||url.password)return Response.json({error:'Source domain not approved'},{status:400});
  const response=await fetch(url.toString(),{redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)return Response.json({error:'Source poster unavailable'},{status:422});
  const length=Number(response.headers.get('content-length')||0);if(length>12_000_000)return Response.json({error:'Poster exceeds 12MB'},{status:413});
  const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length>12_000_000)return Response.json({error:'Poster exceeds 12MB'},{status:413});
  const info=inspect(bytes,response.headers.get('content-type')||'');
  if(info.qualityWarning)return Response.json({success:false,reviewRequired:true,sourceUrl:url.toString(),...info,error:'Source resolution is too low for automatic publishing'},{status:422});
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
  const file=new File([bytes],`event-poster-${digest.slice(0,16)}.${info.format}`,{type:`image/${info.format}`});
  const result=await b.asServiceRole.integrations.Core.UploadFile({file});
  if(!result?.file_url)throw new Error('Storage did not return a poster URL');
  // Verify stored bytes independently; a storage provider may re-encode the image.
  const storedUrl=new URL(result.file_url);
  if(storedUrl.protocol!=='https:'||!['base44.app','www.base44.app'].includes(storedUrl.hostname))throw new Error('Storage URL not trusted for verification');
  const storedResponse=await fetch(storedUrl.toString(),{redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!storedResponse.ok)throw new Error('Stored poster could not be read back');
  const storedBytes=new Uint8Array(await storedResponse.arrayBuffer());
  const storedHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',storedBytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
  if(storedHash!==digest)throw new Error('Stored poster differs from source; manual review required');
  return Response.json({success:true,originalUrl:result.file_url,sourceUrl:url.toString(),sha256:digest,bytes:bytes.length,...info,reviewRequired:false});
 }catch(e){console.error('poster intake',e);return Response.json({error:'Poster ingestion failed: '+String(e?.message||'unknown')},{status:422});}
});
