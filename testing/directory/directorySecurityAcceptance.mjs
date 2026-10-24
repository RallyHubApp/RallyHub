/** Run this before any Directory release. The exit code is intentionally non-zero while security is incomplete. */
import { readdirSync, readFileSync } from 'node:fs';
const files=readdirSync('base44/entities').filter(f=>/^Directory.*\.jsonc$/.test(f));
const hasBroadRole=v=>{
 if(!v || typeof v!=='object') return false;
 if(v.user_condition?.role === 'admin') return true;
 return Object.values(v).some(hasBroadRole);
};
const exposed=files.filter(f=>hasBroadRole(JSON.parse(readFileSync('base44/entities/'+f,'utf8')).rls));
const secrets=['RALLYHUB_DIRECTORY_SUPERADMIN_BRIAN_ID','RALLYHUB_DIRECTORY_SUPERADMIN_CONAL_ID'];
const ids=secrets.map(k=>process.env[k]||'');
const valid=ids.length===2&&ids.every(x=>/^[a-f0-9]{24}$/i.test(x))&&ids[0]!==ids[1];
if(exposed.length) console.error('FAIL: '+exposed.length+' Directory entities retain direct generic-admin RLS.');
if(!valid) console.error('NOT VERIFIED: Two distinct immutable super-admin account IDs not supplied to isolated release gate.');
if(exposed.length || !valid) {
 console.error('BLOCKED: Directory production security acceptance requires RLS remediation, live ID verification, and authenticated negative tests.');
 process.exitCode=1;
}else console.log('Source-level RLS and two-account prerequisites passed; authenticated tests still required.');
