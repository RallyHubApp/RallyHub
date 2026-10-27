import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync('base44/functions/directoryLegalDocuments/entry.ts','utf8');
const page=readFileSync('src/pages/DirectoryLegalDocument.jsx','utf8');
const app=readFileSync('src/App.jsx','utf8');
const footers=['PublicCopyrightFooter.jsx','PublicSiteFooter.jsx'].map(f=>readFileSync('src/components/public/'+f,'utf8'));
const email=readFileSync('base44/shared/rallyHubPlatformEmail.ts','utf8');
test('public API fail-closed: only approved active legal policies can display',()=>{
  assert.match(backend,/status:'active'/);
  assert.match(backend,/r\.approved_at&&r\.approved_by_user_id/);
  assert.match(backend,/INTERNAL APPROVAL/);
  assert.match(backend,/status:404/);
  assert.doesNotMatch(backend,/action:'list_all'/);
});
test('only approved policy body and metadata are shown',()=>{
  assert.match(backend,/title:doc\.title,version:doc\.version,effectiveFrom:doc\.effective_from/);
  assert.match(page,/document\.bodyText/);
  assert.match(app,/<Route path="\/legal\/:type"/);
});
test('both RallyHub footers and Communications links include legal paths',()=>{
  for(const f of footers)for(const route of ['/legal/privacy','/legal/terms','/legal/cookies'])assert.ok(f.includes(route),'Missing '+route);
  for(const key of ['privacy','terms','cookies'])assert.match(email,new RegExp("key:'"+key+"'"));
});
