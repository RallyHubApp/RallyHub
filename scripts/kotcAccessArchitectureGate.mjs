import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
let checks=0;
const assert=(condition,message)=>{checks++;if(!condition)throw new Error(`KOTC access architecture gate failed: ${message}`);};
const includes=(text,needle,message)=>assert(text.includes(needle),message||`missing ${needle}`);

const access=read('base44/functions/manageKotcSessionAccess/entry.ts');
const state=read('base44/functions/getKotcV2State/entry.ts');
const command=read('base44/functions/kotcCommand/entry.ts');
const scorer=read('base44/functions/kotcScorer/entry.ts');
const saveScore=read('base44/functions/saveKotcScore/entry.ts');
const startRound=read('base44/functions/startKotcRound/entry.ts');
const scorerLinks=read('base44/functions/manageKotcScorerLinks/entry.ts');
const results=read('base44/functions/kotcResultsShare/entry.ts');
const create=read('base44/functions/createKotcV2Session/entry.ts');
const role=read('src/hooks/useKotcRole.jsx');
const hostUi=read('src/components/kotc/KotcV2SessionView.jsx');
const scorerUi=read('src/pages/PublicKotcScorer.jsx');
const workflow=read('src/lib/kotcV2Workflow.js');

// Super Admin / host boundary.
includes(access,"caller.role!=='admin'",'only platform admins may grant or revoke delegated host access');
includes(role,"user.role === 'admin'",'platform admin must resolve through KOTC role hook');
includes(role,"return 'super_admin'",'platform admin must resolve as KOTC super_admin');
includes(state,"currentAccessRole==='session_host'",'session_host must be a recognised state access role');
includes(state,"user.role==='admin'||currentAccessRole==='session_host'",'contact directory must be limited to admin/session_host');
includes(state,'entities.Person.filter','session contacts must come from canonical Person records');
includes(state,"participants||[]).map((p:any)=>p.player_id",'contact lookup must start from the session participant roster');
includes(state,"person.emergency_contact_name||person.emergency_contact_raw||player.emergency_contact",'session contacts must fall back to the imported raw emergency name when structured name is empty');

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
includes(scorer,'scorer_correction_owner_client_id:clientId','successful player score must retain correction ownership for the saving device');
includes(scorer,'Only the scorer device that saved it, or the host','another player device must not reopen an already-saved court');
includes(scorer,'can_correct:RESOLVED.has(m.status)','scorer state must expose correction ability only to the saving device');
assert(!scorer.includes('generate_next_round'),'player scorer must never advance the sporting round');
assert(!scorer.includes('set_participant_status'),'player scorer must never change participant availability');

// KOTC pickleball score-entry ergonomics and server validation.
assert((hostUi.match(/maxLength=\{2\}/g)||[]).length>=2,'host score inputs must physically limit entry to two digits');
assert((scorerUi.match(/maxLength=\{2\}/g)||[]).length>=2,'player scorer inputs must physically limit entry to two digits');
includes(hostUi,'inputMode="numeric"','host score inputs must request the numeric mobile keypad');
includes(scorerUi,'inputMode="numeric"','player scorer inputs must request the numeric mobile keypad');
includes(saveScore,"KOTC scores cannot exceed 99.",'dedicated host score endpoint must reject scores above 99');
includes(scorer,"KOTC scores cannot exceed 99.",'player scorer endpoint must reject scores above 99');
includes(command,"KOTC scores cannot exceed 99.",'general correction/autosave path must reject scores above 99');
includes(workflow,"KOTC scores cannot exceed 99.",'sporting workflow validation must enforce the same two-digit score ceiling');

// Host is authoritative over a player scorer.
includes(command,"commandType === 'host_claim_score'",'host must have explicit scorer takeover command');
includes(command,'scoring_lock_owner:hostOwner','host takeover must own the court lease');
includes(command,'scoring_lock_owner:null','host correction must release the court lease');
includes(saveScore,'scoring_lock_owner:null','dedicated host score save must release the court lease');
includes(saveScore,'alreadySaved:true','score-save retry after a lost response must reconcile as success');
includes(saveScore,'AuditLog.create','dedicated score save retains best-effort audit support');
includes(saveScore,"console.warn('KOTC score audit skipped'",'score audit failure must not poison the sporting save');
includes(startRound,"round.status==='started'",'START ROUND retry after a lost response must be idempotent');

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

// Base44 provider resilience: use small recovery markers and batched writes.
includes(command,"recoveryModel:'authoritative_entities'",'recovery checkpoints must reference authoritative entities rather than copying the whole session');
assert(!command.includes('participationEvents:events')&&!command.includes('sessionCourts:courts'),'recovery checkpoints must not duplicate large live collections');
includes(command,'KotcRoundSlot.bulkCreate(slotCreates)','next-round slot creation must use Base44 bulkCreate');
includes(command,'KotcMatch.bulkCreate(matchCreates)','next-round match creation must use Base44 bulkCreate');
includes(command,'KotcSessionParticipant.bulkUpdate(participantUpdates)','next-round participant updates must use Base44 bulkUpdate');
includes(command,'KotcParticipationEvent.bulkCreate(participationEvents)','next-round participation events must be batched');
includes(command,'enforcePersistentLocks(finalSlots,activeLocks,new Set(eligible.map','active host pair locks must be enforced before next-round slots are persisted');
includes(command,"assignment_type:'locked_pair_override'",'automatic persistent-lock repair must be identifiable in the proposed draw');
includes(command,'was split between court and bench','an available locked pair must never be split between court and bench');
includes(command,'reached different destination courts. The round was not saved.','a pair lock must never be repaired by moving a player to an unearned court');
includes(command,'command-log finalisation skipped after successful sporting write','secondary command-log failure must not report sporting failure');

console.log(`KOTC access/architecture gate: PASS\n${checks} role, privacy, scoring-lock, membership and correction checks, 0 failures.`);
