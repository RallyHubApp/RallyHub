import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const entry=readFileSync(new URL('../../base44/functions/kotcResultsShare/entry.ts',import.meta.url),'utf8');
const router=readFileSync(new URL('../../base44/functions/kotcResultsShare/emailRouter.ts',import.meta.url),'utf8');
test('KOTC bulk send reuses verified mail configuration rather than reading config for every recipient',()=>{
 assert.match(entry,/sendWithConfiguredEmailTransport\(base44,mailScope,\{to:email,[^\n]*\},transportConfig\)/);
 assert.match(router,/const config = resolvedConfig \|\| await requireConfiguredEmailTransport/);
});
test('KOTC bulk send stops on Base44 rate limit, leaving unattempted recipients unsent',()=>{
 assert.match(entry,/if\(status==='failed'&&isRateLimit\(error\)\)break/);
 assert.match(entry,/if\(!resend&&priorEmails\.has\(email\)\)/);
});
