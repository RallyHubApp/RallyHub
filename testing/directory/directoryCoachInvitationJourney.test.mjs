import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const claim=readFileSync('src/pages/DirectoryClaim.jsx','utf8');
const backend=readFileSync('base44/functions/directoryClaim/entry.ts','utf8');
const shell=readFileSync('base44/shared/rallyHubPlatformEmail.ts','utf8');
test('private invite route does not require public listing index',()=>{assert.match(claim,/inviteToken \? \{ slug, name:/); assert.match(backend,/listingType: listing\.listingType/); assert.match(claim,/res\.data\.listing\.listingType/)});
test('coach email places claim CTA ahead of support block',()=>{assert.match(shell,/\$\{button\}\s+\$\{afterActionContent\}/);assert.match(backend,/actionLabel: coachInvite \? 'Claim your coaching profile'/);assert.match(backend,/afterActionContent: coachInvite/);assert.match(backend,/More information and support/)});
test('mobile shell advertises light only and logo white backing',()=>{assert.match(shell,/color-scheme.*light only/);assert.match(shell,/RALLYHUB_EMAIL_LOGO/);assert.match(shell,/bgcolor="#ffffff"/)});

test('coach invitation accepts only email-bound active token and routes to guided editor',()=>{
 assert.match(backend,/if \(action === 'accept_coach_invitation'\)/);
 assert.match(backend,/normaliseEmail\(invitation\.contact_email\)!==userEmail/);
 assert.match(backend,/invitation\.status!=='pending'/);
 assert.match(backend,/Date\.parse\(invitation\.expires_at\)<Date\.now\(\)/);
 assert.match(backend,/otherOwners/);
 assert.match(claim,/action:'accept_coach_invitation'/);
 assert.match(claim,/edit\?guided=1/);
 assert.match(claim,/Sign in and open my profile/);
});
