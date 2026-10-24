/** Run this before any Directory release. The exit code is intentionally non-zero while security is incomplete. */
import { readdirSync, readFileSync } from 'node:fs';
const files=readdirSync('base44/entities').filter(f=>/^Directory.*\.jsonc$/.test(f));
const hasBroadRole=v=>{
 if(!v || typeof v!=='object') return false;
 if(v.user_condition?.role === 'admin') return true;
 return Object.values(v).some(hasBroadRole);
};
const exposed=files.filter(f=>hasBroadRole(JSON.parse(readFileSync('base44/entities/'+f,'utf8')).rls));
const {DIRECTORY_SUPERADMIN_USER_IDS:ids}=await import('../../base44/shared/directorySuperAdmin.ts');
const valid=ids.length===2&&ids.every(x=>/^[a-f0-9]{24}$/i.test(x))&&ids[0]!==ids[1];
if(exposed.length) console.error('FAIL: '+exposed.length+' Directory entities retain direct generic-admin RLS.');
const risky=files.filter(f=>{
 const d=JSON.parse(readFileSync('base44/entities/'+f,'utf8'));
 const expected=d.name==='DirectoryListingAccess'?{'data.user_id':'{{user.id}}'}:false;
 return d.rls.create!==false||d.rls.update!==false||d.rls.delete!==false||JSON.stringify(d.rls.read)!==JSON.stringify(expected);
});
if(risky.length) console.error('FAIL: '+risky.length+' Directory entities violate service-only RLS and owner-read policy.');
if(!valid) console.error('BLOCKED: Two-account backend allowlist must be verified against Base44 Users.');
if(exposed.length || risky.length || !valid) {
 console.error('BLOCKED: Directory production security acceptance requires RLS remediation and authenticated negative tests.');
 process.exitCode=1;
}else console.log('Source-level RLS and two-account prerequisites passed; authenticated tests still required.');
