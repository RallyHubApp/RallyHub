import {readFile,realpath} from 'node:fs/promises';
import {resolve,relative,isAbsolute,basename} from 'node:path';
import {sha256} from './verified-sender.mjs';
// Provider for original ChatGPT conversation artifacts already mounted in an authorised runtime.
// Does not infer a path from an image ID; the runtime must supply an explicit mounted file path.
export function mountedArtifactProvider({root='/mnt/data'}={}){
 return {async getBytes(artifactId){
  if(typeof artifactId!=='string'||!artifactId.startsWith('mounted:'))throw Error('Verified mounted artifact reference required');
  const base=await realpath(root);
  const requested=resolve(base,artifactId.slice(8));
  const path=await realpath(requested);
  const rel=relative(base,path);
  if(rel.startsWith('..')||isAbsolute(rel)||!rel||basename(path).startsWith('.'))throw Error('Artifact outside authorised mount');
  const bytes=await readFile(path);
  if(!bytes.length||bytes.length>12*1024*1024)throw Error('Artifact size invalid');
  return bytes;
 }};
}
