import fs from 'node:fs';

let checks=0;
const assert=(condition,message)=>{checks++;if(!condition)throw new Error(`Trial journey architecture gate failed: ${message}`);};
const read=p=>fs.readFileSync(p,'utf8');
const includes=(text,needle,message)=>assert(text.includes(needle),message||`missing ${needle}`);

for(const name of ['RallyHubTrialApplication','RallyHubTrialJourney','RallyHubLegalAgreement','RallyHubAgreementAcceptance','TenantAccessPolicy','TenantEntitlement']){
  assert(fs.existsSync(`base44/entities/${name}.jsonc`),`${name} schema must exist`);
}
const application=read('base44/entities/RallyHubTrialApplication.jsonc');
const journey=read('base44/entities/RallyHubTrialJourney.jsonc');
const acceptance=read('base44/entities/RallyHubAgreementAcceptance.jsonc');
const service=read('base44/functions/trialJourney/entry.ts');
const servicePolicy=read('base44/functions/trialJourney/tenantCapability.ts');
const createKotc=read('base44/functions/createKotcV2Session/entry.ts');
const startKotc=read('base44/functions/startKotcRound/entry.ts');
const scorerLinks=read('base44/functions/manageKotcScorerLinks/entry.ts');
const spond=read('base44/functions/spondIntegrationWorking/entry.ts');
const app=read('src/App.jsx');
const portal=read('src/pages/TrialPortal.jsx');
const activate=read('src/pages/TrialActivate.jsx');
const admin=read('src/pages/TrialAdmin.jsx');
const apply=read('src/pages/TrialApply.jsx');
const role=read('src/hooks/useKotcRole.jsx');

// Application + approval are separate from access.
includes(application,'selected_capability_keys','approval must persist the exact selected capability set');
includes(application,'activation_token_hash','application must store a hash rather than the raw activation token');
includes(service,"status:'submitted'",'public application must begin submitted, not active');
includes(service,"enforcement_mode:'entitlements_required'",'approved external tenant must use entitlement enforcement');
includes(service,'trial_mode:true','approved external tenant must be identified as a trial tenant');
includes(service,'const rawToken=randomToken(),tokenHash=await sha256(rawToken)','approval must generate an unguessable raw token and persist only its hash');
assert(!application.includes('activation_token"'),'schema must not persist a raw activation token field');

// Agreement acceptance evidence.
for(const token of ['agreement_version','wording_hash','authority_confirmed','restricted_sharing_confirmed','ip_acknowledged','acceptance_evidence_json'])includes(acceptance,token,`acceptance must preserve ${token}`);
for(const token of ['authorityConfirmed','termsAccepted','restrictedSharingConfirmed','ipAcknowledged'])includes(service,token,`activation must require ${token}`);
includes(service,"The Trial & Evaluation Agreement has changed. Reload and review the current version.",'activation must reject a stale agreement version');
includes(service,"agreement_key:'rallyhub_trial_evaluation'",'activation must resolve the dedicated RallyHub trial agreement');
includes(service,'RallyHubAgreementAcceptance.filter({trial_application_id:row.id,user_id:user.id})','activation retry must reuse prior acceptance evidence');
includes(service,'if(existingJourney)','activation retry must reconcile an already-created journey');

// Trial identity is intentionally narrow: normal member identity plus explicit entitlements.
includes(service,"permission_bundle:'member'",'trial must not grant broad club_admin access');
includes(service,"active_club_role:'member'",'trial user profile must remain member-level for unrelated modules');
includes(service,"capability_key:key,entitlement_type:'trial'",'selected capabilities must be stored as explicit time-bound trial entitlements');
includes(service,"scope_type:'tenant',purpose:'club_comms'",'trial results mail transport must be tenant scoped');
includes(service,"provider:'base44_core'",'trial tenant may use RallyHub platform mail without borrowing another tenant gateway');
assert(!service.includes("sender_name:'Clare")&&!service.includes('Clare Pickleball'),'trial mail setup must not hard-code Clare branding');

// Demo and real event journeys.
includes(service,'RALLYHUB_KOTC_SANDBOX_V1','guided demo must use the server-recognised isolated KOTC sandbox marker');
includes(service,'counts_toward_leaderboard:false','trial demo/live bootstrap must not silently contaminate the KOTC leaderboard');
includes(service,"action==='create_demo_tournament'||action==='create_live_tournament'",'trial service must own controlled event bootstrap');
includes(service,'body.forceNew!==true','real KOTC creation must support reusing an active event rather than generating junk records');
includes(service,"body.forceNew",'trial must support a second real KOTC after the first pilot event');
includes(service,"String(tournament.tenant_id)!==String(journey.tenant_id)",'trial roster mutation must reject another tenant');
includes(service,"String(tournament.host_club_id)!==String(journey.club_id)",'trial roster mutation must reject another club');
includes(service,"tournament.format!=='King of the Court'",'trial roster mutation must not become a generic Tournament write proxy');

// Existing sporting engine is used, with only a permission/expiry gate in front.
includes(createKotc,"tenantCapabilityDecision(base44,user,'tournament.king_of_the_court'",'KOTC creation must verify entitlement server-side');
includes(createKotc,"capabilityDecision.reason==='active_entitlement'",'external KOTC creation must require an explicit active entitlement');
includes(createKotc,"ends_at:entitlementEnd",'pre-start KOTC host access must stop at trial expiry');
includes(createKotc,"const testMode=sandboxTournament||(user.role==='admin'&&Boolean(body.testMode));",'explicit Test Mode must remain Super Admin-only while the guided sandbox is forced safe');
includes(startKotc,'const now=nowIso();const firstSessionStart=!session.actual_first_round_start','live-event grace must be keyed to the genuine first sporting start');
assert(startKotc.indexOf("session=await retry('session start save'") < startKotc.indexOf("live-event host grace"),'live-event grace may only be granted after successful sporting start persistence');
includes(startKotc,'originalEnd>=Date.now()','an already-expired prepared event must not receive live-event grace');
includes(startKotc,'originalEnd+6*60*60*1000','a genuinely live event gets a bounded six-hour completion window');
includes(scorerLinks,'Math.min(normalExpiry,hostExpiry)','new scorer links must not outlive the time-limited host before the event starts');
includes(startKotc,"KotcScorerToken.update(token.id,{expires_at:graceEnd})",'existing scorer links for a live event must follow the event-specific grace window');

// Spond remains separately entitled.
includes(spond,"tenantCapabilityDecision(base44,user,'integration.spond'",'Spond must independently check its capability');
includes(spond,"spondEntitlement.reason === 'active_entitlement'",'legacy access alone must not make an ordinary member a Spond manager');
includes(service,"KotcSpondDraft.filter({tenant_id:journey.tenant_id,club_id:journey.club_id",'onboarding progress must only accept tenant/club-scoped Spond evidence');

// Expiry: no new work, historical data retained, live event protected.
includes(service,"status:'expired',ends_at:stamp",'forced expiry must expire the tenant entitlements');
includes(service,"const live=!!session.actual_first_round_start&&['in_progress','paused'].includes(session.status)",'expiry must distinguish a genuinely live KOTC from prepared sessions');
includes(service,'const sessionEnd=live?new Date(Date.now()+6*60*60*1000).toISOString():stamp','forced expiry must revoke prepared sessions but not kill an already-live event');
includes(portal,'Your RallyHub trial has ended','expired trial must get a clear dedicated screen');
includes(portal,'There is no automatic paid conversion in this pilot.','pilot must not imply automatic commercial conversion');
assert(!portal.includes('Subscribe now')&&!admin.includes('Convert to paid'),'conversion/payment controls must not be present in this pilot');

// UI isolation: trial shell precedes ordinary club app and exposes only the controlled path.
includes(app,'if (trialState?.hasTrial) return <TrialRoutes initialState={trialState} />;','trial users must enter the narrow trial shell before ordinary Club routes');
includes(app,'<Route index element={<TrialPortal initialState={initialState} />} />','trial shell must land on onboarding');
includes(app,'<Route path="*" element={<Navigate to="/app" replace />} />','trial shell must reject unrelated /app routes');
includes(app,"(!expired || liveEventGraceActive) && <Route path=\"tournaments/:id\"",'trial route must close at expiry except for a genuinely live event grace window');
includes(service,'liveEventGraceActive','trial state must expose whether a live KOTC grace grant is genuinely active');
includes(service,"app&&app.status==='activated'",'natural expiry must reconcile the application status as well as journey state');
includes(portal,'Finish live KOTC event','expiry UI must allow only an already-live KOTC to finish during grace');
includes(app,'<Route path="/trial/apply" element={<TrialApply />} />','public application route must exist');
includes(app,'<Route path="/trial/activate" element={<TrialActivate />} />','agreement activation route must require the authenticated route tree');
includes(app,'<Route path="trials" element={<TrialAdmin />} />','Super Admin must have controlled trial administration');
includes(apply,'Submit trial application','application UI must be explicit');
includes(activate,'Accept & Activate Trial','agreement acceptance and activation must be one deliberate action');
includes(portal,'Create guided demo','onboarding must make the safe demo the first practical step');
includes(portal,'Create another KOTC','trial architecture must support more than one KOTC event during the active trial');
includes(role,"trialState?.hasTrial === true",'KOTC host UI role must derive from active trial state');
includes(role,"storedRole === 'player' ? 'host' : storedRole",'trial must not persist a broad KOTC admin role just to render host controls');

// Request economy: shared cached state, no periodic polling.
includes(app,"queryKey: ['my-rallyhub-trial-state', user?.id]",'App gate must use the shared trial-state cache key');
includes(role,"queryKey: ['my-rallyhub-trial-state', user?.id]",'KOTC role must reuse the App trial-state cache');
includes(portal,"queryKey:['my-rallyhub-trial-state',user?.id]",'Trial portal must reuse the App trial-state cache');
assert(!portal.includes('refetchInterval')&&!admin.includes('refetchInterval'),'trial surfaces must not introduce idle polling');

console.log(`TRIAL JOURNEY ARCHITECTURE GATE PASS — ${checks} checks, 0 failures`);
console.log('Validated application/approval separation, legal evidence, narrow identity, KOTC/Spond entitlements, live-event expiry grace, expiry lockout, route isolation and request economy.');
