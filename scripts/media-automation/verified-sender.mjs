import { createHash } from 'node:crypto';
const ENDPOINT='https://rallyhub.ie/api/apps/6a01dc00702b7dd2a2978c28/functions/universalAssetIntake';
export const sha256=b=>createHash('sha256').update(b).digest('hex');
const allowedStorage=new Set(['base44.app','www.base44.app']);
function safeUrl(value,hosts){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||!hosts.has(u.hostname))throw Error('Untrusted URL');return u;}
export async function verifiedReadback(fileUrl,{fetchImpl=fetch}={}){
 const source=safeUrl(fileUrl,allowedStorage);
 let response=await fetchImpl(source.href,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(60000)});
 if(response.status===302){
  const location=response.headers.get('location');if(!location)throw Error('Missing storage redirect');
  const target=safeUrl(new URL(location,source).href,new Set(['media.base44.com']));
  response=await fetchImpl(target.href,{method:'GET',redirect:'error',signal:AbortSignal.timeout(60000)});
 }
 if(!response.ok||response.status>=300)throw Error('Storage readback HTTP '+response.status);
 return Buffer.from(await response.arrayBuffer());
}
export async function stageApprovedAsset({bytes,name,expectedSha256,token,approvalId,fetchImpl=fetch,receiptStore}){
 if(!Buffer.isBuffer(bytes)||!bytes.length||bytes.length>12000000)throw Error('Invalid media bytes');
 if(!/^[a-f0-9]{64}$/i.test(expectedSha256||'')||sha256(bytes)!==expectedSha256.toLowerCase())throw Error('Approval checksum mismatch');
 if(!token||token.length<32)throw Error('Missing secure credential');
 if(!approvalId||typeof approvalId!=='string')throw Error('Approval reference required');
 if(!name||typeof name!=='string')throw Error('Asset name required');
 const existing=await receiptStore?.find?.({approvalId,sha256:expectedSha256.toLowerCase()});
 if(existing?.independentReadbackVerified)return {...existing,reusedExisting:true};
 const response=await fetchImpl(ENDPOINT,{method:'POST',redirect:'error',signal:AbortSignal.timeout(60000),headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({scope:'platform',name,dataBase64:bytes.toString('base64'),expectedSha256})});
 if(!response.ok)throw Error('Intake HTTP '+response.status);
 let result;try{result=await response.json();}catch{throw Error('Invalid intake JSON');}
 if(result.success!==true||result.status!=='staged'||result.readbackVerified!==true||result.sha256!==expectedSha256.toLowerCase()||result.bytes!==bytes.length||typeof result.fileUrl!=='string')throw Error('Invalid intake receipt');
 const stored=await verifiedReadback(result.fileUrl,{fetchImpl});
 if(sha256(stored)!==expectedSha256.toLowerCase()||stored.length!==bytes.length)throw Error('Storage checksum mismatch');
 const receipt={approvalId,name,bytes:bytes.length,sha256:expectedSha256.toLowerCase(),fileUrl:result.fileUrl,status:'staged',independentReadbackVerified:true,verifiedAt:new Date().toISOString()};
 await receiptStore?.save?.(receipt);
 return receipt;
}
