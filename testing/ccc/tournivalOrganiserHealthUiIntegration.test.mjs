import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../../src/components/tournival/TournivalView.jsx',import.meta.url),'utf8');
test('organiser integrity action uses scoped backend review',()=>{assert.match(src,/functions\.invoke\('tournivalOrganiserHealth'/);assert.match(src,/action:'review'/);assert.match(src,/tenantId:tournament\.tenant_id/);assert.match(src,/clubId:tournament\.host_club_id/);});
test('integrity review is visible only to organisers',()=>assert.match(src,/\{isAdmin && <section className="rounded-xl border border-border p-3 space-y-2"/));
test('review reports drift without invoking repair or save',()=>{assert.match(src,/No repair or score changes have been made/);assert.match(src,/organiserHealth\.issues/);});

test('stale integrity results from prior tournament are ignored',()=>{assert.match(src,/integrityRequest\.current === requestId/);assert.match(src,/integrityRequest\.current \+= 1/);});
test('recovery preview is separate and read-only',()=>{assert.match(src,/action:'preview_recovery'/);assert.match(src,/Preview recovery/);assert.match(src,/No records were changed/);});
