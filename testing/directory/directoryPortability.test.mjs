import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync,unlinkSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {packageDirectoryArchive,inspectDirectoryArchive,directoryRestoreDryRun} from '../../base44/shared/directoryPortableExport.mjs';
const row=(id,extra={})=>({id,...extra});
test('portable Directory archive preserves independent relationships and redacts access credentials',()=>{
 const archive=packageDirectoryArchive({DirectoryListingRecord:[row('listing-1',{listing_slug:'clare'})],DirectoryPlayerSubscriber:[row('subscriber-1',{email:'fixture@example.test',unsubscribe_token:'secret-value',status:'active'})],DirectoryIdentityLink:[row('link-1',{directory_person_kind:'subscriber',directory_person_id:'subscriber-1',tenant_id:'tenant-fixture',tenant_person_id:'person-fixture',status:'proposed',purpose:'explicit user-approved connection'})],DirectoryContactEnquiry:[row('enquiry-1')],DirectoryEnquiryFollowup:[row('followup-1',{enquiry_id:'enquiry-1',status:'open'})]},'2026-10-25T12:00:00Z');
 assert.equal(archive.manifest.domain,'Directory');
 assert.equal(archive.entities.DirectoryPlayerSubscriber[0].unsubscribe_token,undefined);
 assert.equal(archive.entities.DirectoryPlayerSubscriber[0].email,'fixture@example.test');
 const inspection=inspectDirectoryArchive(archive);
 assert.equal(inspection.valid,true,inspection.issues.join(';'));
 const rehearsal=directoryRestoreDryRun(archive);
 assert.equal(rehearsal.restoreMode,'READ_ONLY_REHEARSAL');assert.equal(rehearsal.productionWrites,0);assert.equal(rehearsal.tenantRecordsIncluded,false);
});
test('invalid relationships, credential leakage, and activated links fail read-only restore checks',()=>{
 const archive=packageDirectoryArchive({DirectoryIdentityLink:[row('link-1',{directory_person_kind:'subscriber',directory_person_id:'unknown',status:'active'})],DirectoryContactEnquiry:[],DirectoryEnquiryFollowup:[row('followup-1',{enquiry_id:'missing'})]});
 archive.entities.DirectoryIdentityLink[0].access_token='secret';
 const inspection=inspectDirectoryArchive(archive);assert.equal(inspection.valid,false);
 assert.ok(inspection.issues.some(i=>i.startsWith('Unsafe credential field')));
 assert.ok(inspection.issues.some(i=>i.startsWith('Orphaned follow-up')));
 assert.ok(inspection.issues.some(i=>i.startsWith('Unverified activated')));
});
test('CLI extraction rehearsal consumes fixture without database writes',()=>{
 const archive=packageDirectoryArchive({DirectoryContactEnquiry:[row('fixture-enquiry')]});
 const file='/tmp/rallyhub-directory-rehearsal-fixture.json';
 try{writeFileSync(file,JSON.stringify(archive));const out=execFileSync('node',['scripts/directoryExportRehearsal.mjs',file],{encoding:'utf8'});assert.match(out,/"valid": true/);assert.match(out,/"productionWrites": 0/);}finally{try{unlinkSync(file)}catch{}}
});
