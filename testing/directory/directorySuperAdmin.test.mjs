import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isDirectorySuperAdmin} from '../../base44/shared/directorySuperAdmin.ts';
const brian='aaaaaaaaaaaaaaaaaaaaaaaa';
const conal='bbbbbbbbbbbbbbbbbbbbbbbb';
for(const id of [brian,conal]) test('authorised immutable ID '+id[0],()=>assert.equal(isDirectorySuperAdmin({id,role:'admin'},brian,conal),true));
for(const [title,user,a,b] of [
 ['anonymous',null,brian,conal],['generic platform admin',{id:'cccccccccccccccccccccccc',role:'admin'},brian,conal],
 ['club admin',{id:brian,role:'club_admin'},brian,conal],['listing owner',{id:brian,role:'user'},brian,conal],
 ['missing first secret',{id:brian,role:'admin'},undefined,conal],['missing second secret',{id:brian,role:'admin'},brian,undefined],
 ['duplicate secrets',{id:brian,role:'admin'},brian,brian],['malformed secret',{id:brian,role:'admin'},'Brian Moore',conal]
]) test('denies '+title,()=>assert.equal(isDirectorySuperAdmin(user,a,b),false));
for(const f of ['directoryCategory','directoryContactAction','siteAnalytics','directoryPlayerNetwork'])test(f+' uses directory-only gate',()=>{
 const source=readFileSync('base44/functions/'+f+'/entry.ts','utf8');
 assert.match(source,/authorisedDirectorySuperAdmin\(user\)/);
 assert.match(source,/shared\/directorySuperAdmin\.ts/);
});
