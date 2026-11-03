import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync('src/pages/CommunicationsCentre.jsx','utf8');
test('legacy composers render through the shared Basic brand renderer',()=>{assert.match(page,/const brandedPreview=renderBasicBrandedEmail\(/);assert.doesNotMatch(page,/const brandedPreview=isMembership\?/)});
test('guest approval preview uses sample data and no live private link',()=>{assert.match(page,/const isGuestApproval=selected.id==='guest_approved'/);assert.match(page,/Private booking\/payment link generated only for the approved guest/);assert.match(page,/actual venue-specific approved template/)});
test('all legacy composers show preview and identify summary-only catalogue entries',()=>{assert.match(page,/3\. Branded email preview/);assert.match(page,/legacySummaryOnly&&<p/);assert.match(page,/title="Branded communication email preview"/)});
