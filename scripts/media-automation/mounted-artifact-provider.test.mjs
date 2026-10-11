import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {mountedArtifactProvider} from './mounted-artifact-provider.mjs';
test('original mounted artwork bytes are returned without conversion',async()=>{
 const root=await mkdtemp(join(tmpdir(),'rallyhub-artifact-'));
 try{
  const bytes=Buffer.from([137,80,78,71,13,10,26,10,0,1,2,3,4]);
  await writeFile(join(root,'approved.png'),bytes);
  const retrieved=await mountedArtifactProvider({root}).getBytes('mounted:approved.png');
  assert.deepEqual(retrieved,bytes);
  assert.equal(createHash('sha256').update(retrieved).digest('hex'),createHash('sha256').update(bytes).digest('hex'));
 }finally{await rm(root,{recursive:true,force:true})}
});
test('rejects traversal and non-mounted identifiers',async()=>{
 const root=await mkdtemp(join(tmpdir(),'rallyhub-artifact-'));
 try{
  const provider=mountedArtifactProvider({root});
  await assert.rejects(provider.getBytes('chatgpt-image-id'),/mounted artifact/);
  await assert.rejects(provider.getBytes('mounted:../secret'),/ENOENT|outside authorised/);
 }finally{await rm(root,{recursive:true,force:true})}
});
test('rejects symlink escaping authorised mount',async()=>{
 const root=await mkdtemp(join(tmpdir(),'rallyhub-artifact-'));
 try{
  await symlink('/etc/hosts',join(root,'external.png'));
  await assert.rejects(mountedArtifactProvider({root}).getBytes('mounted:external.png'),/outside authorised/);
 }finally{await rm(root,{recursive:true,force:true})}
});
