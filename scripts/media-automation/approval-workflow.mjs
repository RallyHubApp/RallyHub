import {stageApprovedAsset,sha256} from './verified-sender.mjs';
export async function processApprovedArtifact({approval,artifactProvider,tokenProvider,receiptStore,fetchImpl=fetch}){
 if(!approval||approval.status!=='approved'||!approval.id||!approval.artifactId||!approval.sha256||approval.scope!=='platform')throw Error('Explicit platform artifact approval required');
 if(!artifactProvider?.getBytes||!tokenProvider?.getToken||!receiptStore?.withLock)throw Error('Secure integration providers required');
 return receiptStore.withLock({approvalId:approval.id,sha256:approval.sha256},async()=>{
  const prior=await receiptStore.find({approvalId:approval.id,sha256:approval.sha256});
  if(prior?.independentReadbackVerified)return {...prior,reusedExisting:true};
  const bytes=await artifactProvider.getBytes(approval.artifactId);
  if(!Buffer.isBuffer(bytes)||sha256(bytes)!==approval.sha256.toLowerCase())throw Error('Artifact bytes do not match approved digest');
  const token=await tokenProvider.getToken();
  return stageApprovedAsset({bytes,name:approval.name,expectedSha256:approval.sha256,token,approvalId:approval.id,receiptStore,fetchImpl});
 });
}
