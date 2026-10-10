/** RallyHub immutable artwork gate. Usage: node scripts/verifyApprovedArtwork.mjs path/to/approval-lock.json */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const manifestPath=process.argv[2];
if(!manifestPath){console.error('Usage: node scripts/verifyApprovedArtwork.mjs <approval-lock.json>');process.exit(2)}
let manifest;
try{manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'))}catch(e){console.error('Cannot read approval lock:',e.message);process.exit(2)}
if(manifest.status!=='approved'||!Array.isArray(manifest.assets)||!manifest.assets.length){console.error('FAIL: signed-off approval lock with assets required');process.exit(1)}
let failures=0;
for(const a of manifest.assets){
  try{
    if(!a.path||!a.sha256||!a.width||!a.height||a.transparent!==true)throw Error('missing required approval fields');
    const file=path.resolve('public',a.path.replace(/^\/+/,''));
    if(!file.startsWith(path.resolve('public')+path.sep))throw Error('path outside public');
    const b=fs.readFileSync(file),hash=crypto.createHash('sha256').update(b).digest('hex');
    if(hash!==a.sha256)throw Error('SHA-256 mismatch');
    if(b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('expected transparent PNG (SVG requires separate approval workflow)');
    const w=b.readUInt32BE(16),h=b.readUInt32BE(20),type=b[25];
    if(w!==a.width||h!==a.height)throw Error(`dimension mismatch ${w}x${h}`);
    if(type!==4&&type!==6)throw Error('PNG does not support alpha channel');
    console.log('PASS byte-integrity + PNG metadata:',a.path,`${w}x${h}`);
  }catch(e){failures++;console.error('FAIL',a.path||'(unnamed)',e.message)}
}
console.log(failures?`BLOCKED: ${failures} failures`:'PASS: all approved bytes verified; visual QA still required');
if(failures)process.exit(1);
