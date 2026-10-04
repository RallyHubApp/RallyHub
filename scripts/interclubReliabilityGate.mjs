import fs from 'node:fs';

const read = path => fs.readFileSync(path,'utf8');
const publicPage = read('src/pages/PublicClubChallengeDisplay.jsx');
const host = read('src/components/clubchallenge/ClubChallengeView.jsx');
const publicFn = read('base44/functions/getPublicClubChallengeDisplay/entry.ts');
const snapshotFn = read('base44/functions/refreshClubChallengePublicSnapshot/entry.ts');
const drawFn = read('base44/functions/manageClubChallengeSpotPrizeDraw/entry.ts');
const roundFn = read('base44/functions/updateClubChallengeRound/entry.ts');
const scoreFn = read('base44/functions/saveClubChallengeScore/entry.ts');
const updateFn = read('base44/functions/interclubTournamentUpdate/entry.ts');
const loadGate = read('scripts/interclubLiveLoadGate.mjs');
const updateSchema = read('base44/entities/InterclubTournamentUpdate.jsonc');
const drawSchema = read('base44/entities/ClubChallengeSpotPrizeDraw.jsonc');

const checks = [];
const check = (name, condition) => checks.push({name,condition:!!condition});

check('public link no 1-second server poll', !/spotDrawLive\s*\?\s*1000/.test(publicPage) && !/pollMs\s*=\s*1000/.test(publicPage));
check('public link retries transient Base44 pressure with jitter', publicPage.includes('loadPublicDisplayWithBackoff') && publicPage.includes('Math.random()*900') && publicPage.includes("message.includes('threshold')"));
check('spot draw polling only while drawing', publicPage.includes("publicSpotStatus==='drawing'"));
check('normal public polling remains jittered', publicPage.includes('18000+jitter'));
check('completed public polling slows down', publicPage.includes('60000+jitter'));
check('public snapshot fast path present', publicFn.includes('ClubChallengePublicSnapshot.filter({ display_token:displayToken, active:true }'));
check('legacy public path loads real tournament', publicFn.includes('entities.Tournament.filter({ id:event.tournament_id })'));
check('legacy public path loads real host club', publicFn.includes('entities.Club.filter({ id:event.host_club_id'));
check('authenticated snapshot refresher exists', snapshotFn.includes("Event manager permission required."));
check('snapshot refresher creates display token if missing', snapshotFn.includes('ClubChallengeDisplayToken.create'));
check('host defers snapshot refresh away from sporting action', host.includes('sportingActionRef.current || timerCommandRef.current'));
check('score merge schedules snapshot', /mergeSavedMatch[\s\S]{0,1000}schedulePublicSnapshotRefresh\(1800\)/.test(host));
check('timer action schedules snapshot', /const timerAction[\s\S]{0,5000}schedulePublicSnapshotRefresh\(1800\)/.test(host));
check('spot draw client sends operationId', host.includes("action:'begin_draw', operationId") && host.includes("action:'complete_draw', operationId"));
check('spot draw server requires operationId', drawFn.includes("operationId required for a spot-prize draw"));
check('spot draw completion replay is idempotent', drawFn.includes('last_completed_operation_id === operationId') && drawFn.includes('last_completed_winner_json'));
check('spot draw schema persists operation identity', drawSchema.includes('pending_operation_id') && drawSchema.includes('last_completed_operation_id'));
check('round advance duplicate retry is idempotent', roundFn.includes('alreadyApplied:true') && roundFn.includes('round === currentRound'));
check('score duplicate retry acknowledges an already-accepted write', scoreFn.includes('duplicateAcceptedWrite') && scoreFn.includes('alreadyApplied:true'));
check('Base44 pressure helper catches threshold/overload', host.includes("status === 429") && host.includes('[502,503,504]') && host.includes("message.includes('threshold')") && host.includes("message.includes('overload')"));
check('Base44 pressure helper retries busy responses as well as thrown errors', host.includes('response?.data?.error && isBase44RateLimitError(response)'));
check('Base44 pressure retry has backoff+jitter', host.includes('Math.min(8000, 800 * (2 ** attempt))') && host.includes('Math.random() * 350'));
check('ambiguous timer responses are not replayed', !/\['saveClubChallengeScore','updateClubChallengeTimer'/.test(host) && host.includes('Timer commands are retried on explicit Base44 capacity rejection'));
check('host registration polling disabled during live play', host.includes("refetchInterval: event && ['draft','draw_generated','draw_approved'].includes(event.status) ? 30000 : false"));
check('host live match polling reduced', host.includes("? 8000 : isAdmin && ['in_progress','paused'].includes(event?.status) ? 30000 : false"));
check('tournament update expiry schema exists', updateSchema.includes('expiry_mode') && updateSchema.includes('expires_at'));
check('tournament update supports event-start expiry', updateFn.includes("expiryMode=allowedExpiry.has") && updateFn.includes("'event_start'"));
check('host bulletin expiry control exists', host.includes('cc-tournament-update-expiry') && host.includes('Event starts · recommended'));
check('public bulletin is collapsible', publicPage.includes("updateExpanded?'Hide':'Show update'"));
check('public bulletin expiry applied in snapshot', snapshotFn.includes("expiryMode === 'event_start'") && snapshotFn.includes('update.expires_at'));
check('snapshot fast path re-checks bulletin expiry at read time', publicFn.includes('expiredAtStart') && publicFn.includes('expiredByTime'));
check('player UI hides a timed bulletin without waiting for another server write', publicPage.includes('updateExpiry') && publicPage.includes('updateExpiry>now'));
check('real Interclub load gate targets Player Link endpoint', loadGate.includes('/functions/getPublicClubChallengeDisplay'));
check('real Interclub load gate reaches 200 devices by default', loadGate.includes("'25,50,100,200'"));
check('load gate requires snapshot fast path', loadGate.includes('fallbackResponses') && loadGate.includes('snapshot fast path'));
check('load gate guards live RallyHub', loadGate.includes('RALLYHUB_LOAD_CONFIRM=YES'));
check('host pressure status is visible', host.includes('cc-base44-pressure-status'));

for (const item of checks) console.log(`${item.condition?'PASS':'FAIL'}  ${item.name}`);
const failed = checks.filter(item=>!item.condition);
if (failed.length) {
  console.error(`\nINTERCLUB RELIABILITY GATE FAIL — ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nINTERCLUB RELIABILITY GATE PASS — ${checks.length}/${checks.length} resilience checks.`);
