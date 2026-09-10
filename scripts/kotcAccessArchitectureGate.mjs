import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
let checks=0;
const assert=(condition,message)=>{checks++;if(!condition)throw new Error(`KOTC access architecture gate failed: ${message}`);};
const includes=(text,needle,message)=>assert(text.includes(needle),message||`missing ${needle}`);

const access=read('base44/functions/manageKotcSessionAccess/entry.ts');
const state=read('base44/functions/getKotcV2State/entry.ts');
const command=read('base44/functions/kotcCommand/entry.ts');
const scorer=read('base44/functions/kotcScorer/entry.ts');
const scorerLinks=read('base44/functions/manageKotcScorerLinks/entry.ts');
const results=read('base44/functions/kotcResultsShare/entry.ts');
const create=read('base44/functions/createKotcV2Session/entry.ts');
const role=read('src/hooks/useKotcRole.jsx');

// Super Admin / host boundary.
includes(access,"caller.role!=='admin'",'only platform admins may grant or revoke delegated host access');
includes(role,"user.role === 'admin'",'platform admin must resolve through KOTC role hook');
includes(role,"return 'super_admin'",'platform admin must resolve as KOTC super_admin');
includes(state,"currentAccessRole==='session_host'",'session_host must be a recognised state access role');
includes(state,"user.role==='admin'||currentAccessRole==='session_host'",'contact directory must be limited to admin/session_host');
includes(state,'entities.Person.filter','session contacts must come from canonical Person records');
includes(state,"participants||[]).map((p:any)=>p.player_id",'contact lookup must start from the session participant roster');

// Public live view: token first, no authentication requirement, and no private contact fields in public branch.
const publicStart=results.indexOf("if(action==='public_state')");
const authStart=results.indexOf('const user=await base44.auth.me()');
assert(publicStart>=0&&authStart>publicStart,'public_state must be handled before authenticated host actions');
const publicBranch=results.slice(publicStart,authStart);
assert(!/emergency_|emergency contact|\.mobile\b|phone:/i.test(publicBranch),'public live payload must not expose member phone/emergency fields');
includes(publicBranch,'KotcSessionShare.filter','public live state must require an active unguessable share token');
includes(publicBranch,"status:'active'",'public live share must be active');

// Delegated host may create session-scoped public/scoring links, but host delegation remains admin-only.
includes(results,"a.role!=='session_host'",'non-admin live-link generation must require session_host');
includes(scorerLinks,"a.role!=='session_host'",'non-admin scorer-link generation must require session_host');
assert(!scorerLinks.includes('manageKotcSessionAccess'),'scorer-link function must not grant host access');

// Player scorer must remain narrow and deadlock-safe.
includes(scorer,'This device is already scoring Court','one scorer device may hold only one court lease');
includes(scorer,'is being scored on another device','same-court scorer collision must be rejected');
includes(scorer,'expectedRevision','scorer save must use optimistic revision protection');
assert(!scorer.includes('generate_next_round'),'player scorer must never advance the sporting round');
assert(!scorer.includes('set_participant_status'),'player scorer must never change participant availability');

// Host is authoritative over a player scorer.
includes(command,"commandType === 'host_claim_score'",'host must have explicit scorer takeover command');
includes(command,'scoring_lock_owner:hostOwner','host takeover must own the court lease');
includes(command,'scoring_lock_owner:null','host save/correction must release the court lease');

// Membership is not inferred from Player existence.
includes(create,'entities.ClubRelationship.filter','session participant classification must consult club relationship');
includes(create,'participantTypeFor','session creation must classify permanent non-member Players');
includes(create,"rel==='booking_only'",'booking-only Player must be represented explicitly');
includes(create,"rel==='waiting_list'",'waiting-list Player must be represented explicitly');
includes(command,"p.participant_type!=='member'",'non-member participant types must be excluded from KOTC aggregates');
includes(command,"x.participant_type==='member'",'historical aggregate records must also be member-only');

// Historical corrections are controlled and do not mutate future draw history.
includes(command,"commandType === 'correct_match' && user.role === 'admin'",'finalised score corrections must require Super Admin');
includes(command,"action:'kotc_score_corrected'",'score correction must be audit logged');

console.log(`KOTC access/architecture gate: PASS\n${checks} role, privacy, scoring-lock, membership and correction checks, 0 failures.`);
