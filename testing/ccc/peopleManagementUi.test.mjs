import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const page=read('../../src/pages/ClubCommandCentre.jsx');
const people=read('../../src/components/ccc/ClubPeopleBoard.jsx');
const management=read('../../src/components/ccc/ClubManagementBoard.jsx');
test('People and Management panels are embedded only for administrators',()=>{
 assert.match(page,/active==='people'&&admin&&<ClubPeopleBoard/);
 assert.match(page,/active==='management'&&admin&&<ClubManagementBoard/);
});
test('People overview uses scoped server inventory without direct PII queries',()=>{
 assert.match(people,/action:'people_summary'/);
 assert.match(people,/data\.access\.unlinkedPeople/);
 assert.doesNotMatch(people,/\.entities\.(Person|MembershipApplication|ClubUserAccess)\./);
 assert.match(people,/must not be added together as unique people/);
});
test('Management overview cannot approve templates or send messages',()=>{
 assert.match(management,/action:'management_summary'/);
 assert.match(management,/brandKitAssigned/);
 assert.match(management,/usesLegacyVenueKey/);
 assert.doesNotMatch(management,/\.update\(|\.create\(|sendEmail|sendSms/);
});
