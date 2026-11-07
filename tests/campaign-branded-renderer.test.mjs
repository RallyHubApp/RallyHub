import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const canonical=readFileSync('base44/functions/communicationsBasicRenderer.ts','utf8').replace(/^import \{rallyHubEmailShell\}.*\n/m,'').replace("if(/^rallyhub$/i.test(String(clubName||'').trim()))return rallyHubEmailShell({title:headerTitle||'RallyHub update',content:bodyHtml,footerNote:'RallyHub Directory'});",'');
const backend=readFileSync('base44/functions/communicationsEngine/clareBrandedRenderer.ts','utf8').replace(/^\/\/ Clare Pickleball renderer.*\n/,'');
test('bulk campaign renderer matches the tested branded preview renderer',()=>assert.equal(backend,canonical));
test('bulk sender uses complete Clare renderer and preserves unsubscribe footer',()=>{
 const source=readFileSync('base44/functions/communicationsEngine/entry.ts','utf8');
 assert.match(source,/renderBasicBrandedEmail\(substitute\(template\.html_template\),brand,null,'Clare Pickleball'/);
 assert.match(source,/unsubscribe here/);
 assert.doesNotMatch(source,/campaignEmailShell/);
});
test('renderer includes signature, utility links and branded logo',()=>{
 assert.match(backend,/basicSignatureBlock\(brandKit\)/);
 assert.match(backend,/basicUtilityBlock\(brandKit/);
 assert.match(backend,/brandKit\?\.logos\?\.primary/);
});
