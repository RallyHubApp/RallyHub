import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateHostVenueMapping,validatePersonAccessLink} from '../../base44/functions/cccActivity/managementActions.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const ui=read('../../src/components/ccc/ClubExplicitLinkReview.jsx');
const backend=read('../../base44/functions/cccActivity/entry.ts');
const config={tenant_id:'t1',club_id:'c1',active:true,host_emails:['host@example.ie']};
const venue={id:'v1',tenant_id:'t1',club_id:'c1',status:'active'};
test('host mapping policy rejects wrong club, inactive config and conflicting assignment',()=>{
 assert.equal(validateHostVenueMapping(config,venue,{tenantId:'t1',clubId:'c1',expectedVenueId:'v1'}),null);
 assert.match(validateHostVenueMapping(config,{...venue,club_id:'c2'},{tenantId:'t1',clubId:'c1',expectedVenueId:'v1'}),/selected club/);
 assert.match(validateHostVenueMapping({...config,active:false},venue,{tenantId:'t1',clubId:'c1',expectedVenueId:'v1'}),/inactive/);
 assert.match(validateHostVenueMapping({...config,venue_id:'v2'},venue,{tenantId:'t1',clubId:'c1',expectedVenueId:'v1'}),/another venue/);
});
test('Person linking policy rejects cross-tenant, inactive and already linked access',()=>{
 const access={tenant_id:'t1',club_id:'c1',status:'active'},person={id:'p1',tenant_id:'t1'};
 assert.equal(validatePersonAccessLink(access,person,{tenantId:'t1',clubId:'c1',expectedPersonId:'p1'}),null);
 assert.match(validatePersonAccessLink(access,{...person,tenant_id:'t2'},{tenantId:'t1',clubId:'c1',expectedPersonId:'p1'}),/selected tenant/);
 assert.match(validatePersonAccessLink({...access,status:'revoked'},person,{tenantId:'t1',clubId:'c1',expectedPersonId:'p1'}),/active access/);
 assert.match(validatePersonAccessLink({...access,person_id:'p2'},person,{tenantId:'t1',clubId:'c1',expectedPersonId:'p1'}),/another person/);
});
test('confirmation UI requires independent verification and a reason, not one-click linking',()=>{
 assert.match(ui,/action\.endsWith\('_review'\)/);
 assert.match(ui,/reason\.trim\(\)\.length<12/);
 assert.match(ui,/!verified/);
 assert.match(ui,/Confirm and save change/);
 assert.match(ui,/confirmIdentityVerified:verified/);
 assert.match(ui,/confirmVenueVerified:verified/);
});
test('backend updates only existing scoped records and never creates new Person or host config',()=>{
 assert.match(backend,/ClubUserAccess\.updateMany\(\{id:accessId,tenant_id,club_id,status:'active',person_id:\{\$exists:false\}\}/);
 assert.match(backend,/MembershipVenueHostConfig\.updateMany\(\{id:configId,tenant_id,club_id,active:true,venue_id:\{\$exists:false\}\}/);
 assert.doesNotMatch(backend,/Person\.create\(/);
 assert.match(backend,/ccc\.person\.link/);assert.match(backend,/ccc\.host\.venue_map/);
});
