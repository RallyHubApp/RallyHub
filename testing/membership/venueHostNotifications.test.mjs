import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const dir=mkdtempSync(path.join(tmpdir(),'rallyhub-host-test-'));
const output=path.join(dir,'notifications.mjs');
execFileSync('./node_modules/.bin/esbuild',['base44/functions/membershipApplication/venueHostNotifications.ts','--bundle','--format=esm','--outfile='+output,'--log-level=error']);
const {notifyJoiningVenueHosts}=await import(pathToFileURL(output).href);
rmSync(dir,{recursive:true,force:true});
const config={tenant_id:'t',club_id:'c'},club={name:'Clare Pickleball'};
function harness({emails=[],fail=[],prior=[],venue='ennistymon',payment='paid'}={}){
 const sent=[],patches=[],messages=[];let current={id:'a',application_type:'new',primary_venue:venue,payment_status:payment,full_name:'Sample Member',host_notified_emails:prior};
 const db={asServiceRole:{entities:{MembershipVenueHostConfig:{filter:async()=>emails.length?[{host_emails:emails}]:[]},CommunicationTemplate:{filter:async()=>[{status:'approved',subject_template:'New member · {{PRIMARY_VENUE}}',plain_text_template:'{{MEMBER_NAME}} is {{MEMBERSHIP_STATUS}} at {{PRIMARY_VENUE}}',html_template:'<p>{{MEMBER_NAME}} is {{MEMBERSHIP_STATUS}} at {{PRIMARY_VENUE}}</p>',brand_kit_id:'kit'}]},CommunicationBrandKit:{filter:async()=>[{id:'kit',status:'active',contact:{name:'Club Chair',signoff:'Yours in sport,',role:'Chairperson'},colours:{primary:'#001e46',secondary:'#ffd900'},compliance_footer:{}}]},MembershipApplication:{update:async(_id,patch)=>{patches.push(patch);current={...current,...patch};return current;}}}}};
 const deps={emailKey:x=>x.toLowerCase().trim(),escapeHtml:x=>x,emailShell:({content})=>content,sendWithConfiguredEmailTransport:async(_db,_scope,msg)=>{if(fail.includes(msg.to))throw new Error('simulated failure');sent.push(msg.to);messages.push(msg)}};
 return {run:()=>notifyJoiningVenueHosts(db,config,club,current,deps),sent,patches,messages};
}
test('sent notification is idempotent',async()=>{const h=harness({emails:['a@example.ie','b@example.ie']});const r=await h.run();await h.run();assert.deepEqual(h.sent,['a@example.ie','b@example.ie']);assert.equal(r.host_notification_status,'sent')});
test('rendered host email includes approved tenant signature and footer',async()=>{const h=harness({emails:['a@example.ie','b@example.ie']});await h.run();assert.equal(h.sent.length,2);assert.ok(h.messages[0].htmlBody.includes('Club Chair'));assert.ok(h.messages[0].htmlBody.includes('Powered by'));assert.ok(h.messages[0].htmlBody.includes('Sample Member'));assert.equal(h.messages[0].subject,'New member · Ennistymon')});
test('no payment means no host email',async()=>{const h=harness({emails:['a@example.ie'],payment:'pending'});await h.run();assert.deepEqual(h.sent,[])});
test('Ennistymon sends to both distinct hosts',async()=>{const h=harness({emails:['a@example.ie','b@example.ie']});const r=await h.run();assert.deepEqual(h.sent,['a@example.ie','b@example.ie']);assert.equal(r.host_notification_status,'sent')});
test('known previously notified host is skipped',async()=>{const h=harness({emails:['a@example.ie','b@example.ie'],prior:['a@example.ie']});await h.run();assert.deepEqual(h.sent,['b@example.ie'])});
test('failure records status but preserves successfully notified host',async()=>{const h=harness({emails:['a@example.ie','b@example.ie'],fail:['b@example.ie']});const r=await h.run();assert.deepEqual(h.sent,['a@example.ie']);assert.equal(r.host_notification_status,'failed');assert.deepEqual(r.host_notified_emails,['a@example.ie'])});
test('missing recipients is flagged, no guessed address',async()=>{const h=harness();const r=await h.run();assert.equal(r.host_notification_status,'needs_configuration');assert.deepEqual(h.sent,[])});
test('Ennis never sends onboarding email',async()=>{const h=harness({emails:['a@example.ie'],venue:'ennis'});await h.run();assert.deepEqual(h.sent,[])});
