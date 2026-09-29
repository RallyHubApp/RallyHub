import assert from 'node:assert/strict';
import {
  activeGrantSources,
  capabilityIncludes,
  entitlementMatchesContext,
  expiredGraceSources,
  expandDependencies,
  isWindowActive,
} from '../base44/functions/tenantEntitlements/policy.js';

let checks=0;
const ok=(value,message)=>{checks+=1;assert.ok(value,message);};
const eq=(actual,expected,message)=>{checks+=1;assert.equal(actual,expected,message);};
const NOW=Date.parse('2026-09-29T11:00:00Z');
const caps=new Map([
  ['platform.results',{key:'platform.results',depends_on_keys:[]}],
  ['platform.player_links',{key:'platform.player_links',depends_on_keys:[]}],
  ['platform.live_event_view',{key:'platform.live_event_view',depends_on_keys:[]}],
  ['platform.results_email',{key:'platform.results_email',depends_on_keys:['platform.results']}],
  ['integration.spond',{key:'integration.spond',depends_on_keys:[]}],
  ['tournament.king_of_the_court',{key:'tournament.king_of_the_court',depends_on_keys:['platform.player_links','platform.results','platform.live_event_view']}],
  ['tournament.rallyhub_interclub',{key:'tournament.rallyhub_interclub',depends_on_keys:['platform.player_links','platform.results','platform.live_event_view']}],
  ['test.nested',{key:'test.nested',depends_on_keys:['platform.results_email']}],
  ['test.cycle_a',{key:'test.cycle_a',depends_on_keys:['test.cycle_b']}],
  ['test.cycle_b',{key:'test.cycle_b',depends_on_keys:['test.cycle_a']}],
]);
const row=(overrides={})=>({
  id:'e1',tenant_id:'tenant-a',club_id:'club-a',capability_key:'tournament.king_of_the_court',
  entitlement_type:'trial',status:'active',starts_at:'2026-09-01T00:00:00Z',ends_at:'2026-10-31T23:59:59Z',...overrides,
});

// Time-window states.
ok(isWindowActive(row(),NOW),'active current entitlement must be active');
ok(!isWindowActive(row({status:'scheduled',starts_at:'2026-10-15T00:00:00Z'}),NOW),'scheduled entitlement must not be active');
ok(!isWindowActive(row({starts_at:'2026-10-15T00:00:00Z'}),NOW),'future active-labelled entitlement must not be active before starts_at');
ok(!isWindowActive(row({ends_at:'2026-09-01T00:00:00Z'}),NOW),'past entitlement must not be active');
ok(!isWindowActive(row({status:'suspended'}),NOW),'suspended entitlement must not be active');
ok(!isWindowActive(row({status:'revoked'}),NOW),'revoked entitlement must not be active');
ok(isWindowActive(row({status:'grace',ends_at:'2026-09-01T00:00:00Z',grace_ends_at:'2026-09-30T00:00:00Z'}),NOW),'grace entitlement before grace end must be active');
ok(!isWindowActive(row({status:'grace',ends_at:'2026-09-01T00:00:00Z',grace_ends_at:'2026-09-20T00:00:00Z'}),NOW),'grace entitlement after grace end must not be active');

// Club and event scoping.
ok(entitlementMatchesContext(row(),{clubId:'club-a'}),'club-scoped entitlement must match its club');
ok(!entitlementMatchesContext(row(),{clubId:'club-b'}),'club-scoped entitlement must reject another club');
ok(!entitlementMatchesContext(row(),{clubId:null}),'club-scoped entitlement must not become tenant-wide when club context is missing');
ok(entitlementMatchesContext(row({club_id:null}),{clubId:'club-b'}),'tenant-wide entitlement may apply to a club in its tenant');
const eventRow=row({entitlement_type:'one_event',one_event_id:'event-1'});
ok(entitlementMatchesContext(eventRow,{clubId:'club-a',eventId:'event-1'}),'one-event entitlement must match its event');
ok(!entitlementMatchesContext(eventRow,{clubId:'club-a',eventId:'event-2'}),'one-event entitlement must reject another event');
ok(!entitlementMatchesContext(eventRow,{clubId:'club-a'}),'one-event entitlement must reject missing event context');

// Capability dependency graph.
ok(capabilityIncludes('tournament.king_of_the_court','tournament.king_of_the_court',caps),'capability includes itself');
ok(capabilityIncludes('tournament.king_of_the_court','platform.results',caps),'KOTC must include Results dependency');
ok(capabilityIncludes('tournament.king_of_the_court','platform.player_links',caps),'KOTC must include Player Links dependency');
ok(!capabilityIncludes('platform.results','tournament.king_of_the_court',caps),'dependency relation must not run backwards');
ok(capabilityIncludes('test.nested','platform.results',caps),'nested dependencies must resolve transitively');
ok(capabilityIncludes('test.cycle_a','test.cycle_b',caps),'cyclic graph should still resolve direct dependency');
ok(!capabilityIncludes('test.cycle_a','platform.results',caps),'cyclic graph must terminate without inventing access');
const expanded=expandDependencies(['tournament.king_of_the_court'],caps);
ok(expanded.includes('platform.results')&&expanded.includes('platform.player_links')&&expanded.includes('platform.live_event_view'),'navigation expansion must include KOTC dependencies');

// Authoritative active grants preserve source scope through dependencies.
let sources=activeGrantSources([row()],'platform.results',caps,{clubId:'club-a',eventId:null,now:NOW});
eq(sources.length,1,'active KOTC trial should grant dependent Results inside matching club');
sources=activeGrantSources([row()],'platform.results',caps,{clubId:'club-b',eventId:null,now:NOW});
eq(sources.length,0,'KOTC dependency must not cross clubs');
sources=activeGrantSources([eventRow],'tournament.king_of_the_court',caps,{clubId:'club-a',eventId:'event-1',now:NOW});
eq(sources.length,1,'one-event KOTC must grant KOTC for matching event');
sources=activeGrantSources([eventRow],'platform.results',caps,{clubId:'club-a',eventId:'event-1',now:NOW});
eq(sources.length,1,'one-event KOTC must grant dependent Results for matching event');
sources=activeGrantSources([eventRow],'platform.results',caps,{clubId:'club-a',eventId:'event-2',now:NOW});
eq(sources.length,0,'one-event KOTC dependent Results must reject another event');
sources=activeGrantSources([eventRow],'platform.results',caps,{clubId:'club-a',eventId:null,now:NOW});
eq(sources.length,0,'one-event KOTC dependent Results must reject missing event context');
sources=activeGrantSources([row({status:'suspended'})],'platform.results',caps,{clubId:'club-a',now:NOW});
eq(sources.length,0,'suspended source must grant no dependency');
sources=activeGrantSources([row({status:'revoked'})],'platform.results',caps,{clubId:'club-a',now:NOW});
eq(sources.length,0,'revoked source must grant no dependency');
sources=activeGrantSources([row({status:'scheduled',starts_at:'2026-10-15T00:00:00Z'})],'platform.results',caps,{clubId:'club-a',now:NOW});
eq(sources.length,0,'future source must grant no dependency');
sources=activeGrantSources([row({capability_key:'integration.spond'})],'platform.results',caps,{clubId:'club-a',now:NOW});
eq(sources.length,0,'unrelated active entitlement must not grant Results');

// Expiry grace is explicit, status-bounded and equally scope-preserving.
const expired=row({status:'expired',ends_at:'2026-09-28T10:00:00Z'});
sources=expiredGraceSources([expired],'platform.results',caps,{clubId:'club-a',now:NOW});
eq(sources.length,1,'expired KOTC may supply live-event grace to dependent Results');
sources=expiredGraceSources([expired],'platform.results',caps,{clubId:'club-b',now:NOW});
eq(sources.length,0,'live-event grace must not cross clubs');
const expiredOneEvent=row({status:'expired',entitlement_type:'one_event',one_event_id:'event-1',ends_at:'2026-09-28T10:00:00Z'});
sources=expiredGraceSources([expiredOneEvent],'platform.results',caps,{clubId:'club-a',eventId:'event-1',now:NOW});
eq(sources.length,1,'one-event live grace must propagate to dependency for same event');
sources=expiredGraceSources([expiredOneEvent],'platform.results',caps,{clubId:'club-a',eventId:'event-2',now:NOW});
eq(sources.length,0,'one-event live grace must reject different event');
sources=expiredGraceSources([row({status:'suspended',ends_at:'2026-09-28T10:00:00Z'})],'platform.results',caps,{clubId:'club-a',now:NOW});
eq(sources.length,0,'suspended entitlement must never receive live-event grace');
sources=expiredGraceSources([row({status:'revoked',ends_at:'2026-09-28T10:00:00Z'})],'platform.results',caps,{clubId:'club-a',now:NOW});
eq(sources.length,0,'revoked entitlement must never receive live-event grace');
sources=expiredGraceSources([row({status:'scheduled',ends_at:'2026-09-28T10:00:00Z'})],'platform.results',caps,{clubId:'club-a',now:NOW});
eq(sources.length,0,'scheduled entitlement must never receive live-event grace');

console.log(`TENANT ENTITLEMENT POLICY SIMULATION PASS — ${checks} checks, 0 failures`);
console.log('Verified time windows, club isolation, one-event isolation, dependency scope propagation, suspension/revocation and live-event expiry grace.');
