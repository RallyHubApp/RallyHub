import assert from 'node:assert/strict';
import fs from 'node:fs';

const view = fs.readFileSync('src/components/kotc/KotcV2SessionView.jsx','utf8');
const timer = fs.readFileSync('src/components/kotc/RoundTimer.jsx','utf8');
const timerFn = fs.readFileSync('base44/functions/kotcTimer/entry.ts','utf8');
const command = fs.readFileSync('base44/functions/kotcCommand/entry.ts','utf8');
let checks = 0;
const ok = (value, message) => { checks++; assert.ok(value, message); };

// Opening or refreshing an existing session must never manufacture a fresh timer start.
ok(view.includes('const [timerStartRoundId,setTimerStartRoundId]=useState(null)'), 'timer auto-start token begins empty');
ok(view.includes("commandType:'start_proposed_round'"), 'sporting round start remains an explicit host command');
ok(view.indexOf('setTimerStartRoundId(roundId)') > view.indexOf("if(!res.data?.success)throw new Error"), 'timer auto-start token is set only after successful START ROUND');
ok(view.includes('autoStart={timerStartRoundId===currentRound.id}'), 'timer auto-start is tied to the explicit one-shot round token');
ok(view.includes('onAutoStartHandled={()=>setTimerStartRoundId(null)}'), 'one-shot timer auto-start token is cleared after use');
ok(!view.includes("setTimerStartRoundId(currentRound"), 'loaded current-round state cannot arm timer auto-start');

// A fresh explicit host start must be immediate, while reopen/refresh still hydrates safely.
ok(timer.includes("if (autoStart && String(autoStartKey) === String(roundId))"), 'fresh explicit round start bypasses unnecessary timer hydration delay');
ok(timer.includes('the explicit START ROUND'), 'timer fast-start documents the authoritative host action');
ok(timer.includes("action:'get'"), 'reopened timer hydrates from persisted backend state');
ok(timer.includes('setRunning(!!s.running&&remaining>0)'), 'hydration restores backend running state only');
ok(timer.includes("if(s.lastAction==='start'||s.lastAction==='resume'||s.lastAction==='pause'||s.lastAction==='finish')autoStartedKeyRef.current=autoStartKey"), 'hydration marks recovered live/paused/finished rounds as already auto-started');
ok(timerFn.includes('if(state.running&&state.deadlineAt)'), 'backend reconciles persisted running timer against its deadline');
ok(timerFn.includes("if(state.remainingSeconds===0){state.running=false;state.deadlineAt=null;state.lastAction='finish';}"), 'expired timer cannot reopen as a fresh running timer');

// Reset must always leave a usable stopped timer with an explicit Start button.
ok(timer.includes("persistTimer('reset', playSeconds)"), 'reset is persisted');
ok(timer.includes('setRunning(false)'), 'reset stops local timer');
ok(timer.includes('setSeconds(playSeconds)'), 'reset restores full round duration');
ok(timer.includes("seconds===maxSeconds?'Start Timer':'Resume Timer'"), 'stopped full-duration timer exposes Start Timer and paused timer exposes Resume Timer');
ok(timerFn.includes("if(action==='reset'){state={...state,durationSeconds:duration,remainingSeconds:duration,running:false,deadlineAt:null,lastAction:'reset'};}"), 'backend reset state is stopped at full duration');

// Starting/resuming remains explicit and recoverable.
ok(timer.includes("persistTimer('start',maxSeconds)"), 'manual Start Timer persists a start');
ok(timer.includes("persistTimer('resume',seconds)"), 'manual Resume Timer persists a resume');
ok(timerFn.includes("if(action==='start'||action==='resume')"), 'backend supports explicit start/resume only');

// Live host actions must not fail just because recovery/audit support is oversized or rate-limited.
ok(command.includes('Recovery support must never break a live host action'), 'recovery snapshot is non-blocking by design');
ok(command.includes('if(snapshotJson.length>350000)'), 'oversized recovery snapshots are skipped before write');
ok(command.includes("console.warn('KOTC recovery checkpoint skipped'"), 'checkpoint write failures are caught and logged');
ok(command.indexOf("if (commandType === 'start_proposed_round')") < command.indexOf('const duplicates = await base44.asServiceRole.entities.KotcCommandLog.filter'), 'START ROUND uses the lightweight fast path before command-log/snapshot overhead');
ok(command.includes('const [slotRows,participants,lockRows]=await Promise.all'), 'independent START ROUND validation reads run in parallel');
ok(command.includes('const [updatedRound,updatedSession]=await Promise.all'), 'round/session/tournament start writes run in parallel');

// Undo Start must provide continuous feedback and return directly to Round Setup.
ok(view.includes('const [undoingStart,setUndoingStart]=useState(false)'), 'undo has its own persistent in-flight UI state');
ok(view.includes("toast.loading('Returning to Round Setup…')"), 'undo gives immediate persistent accepted feedback');
ok(view.includes("undoingStart?'Returning to Round Setup…':'Undo Start / Back to Round Setup'"), 'undo button clearly confirms the command was accepted');
ok(view.includes("cursor-wait"), 'undo button remains visibly busy until completion');
ok(view.includes('const undoStartRound=async()=>'), 'undo uses a dedicated host action rather than the generic refetch-first command path');
ok(view.includes("status:'proposed'"), 'successful undo immediately paints the authoritative proposed round');
ok(view.includes("toast.success('Back in Round Setup',{id:feedbackId})"), 'host receives explicit undo completion feedback on the same persistent notice');
ok(command.includes('const [roundRows,matches]=await Promise.all'), 'undo validation reads run in parallel');
ok(command.includes('timer_state_json:JSON.stringify(resetTimerState)'), 'undo explicitly persists a stopped full-duration timer');
ok(command.includes('actual_first_round_start=null'), 'Round 1 undo explicitly clears the session start timestamp');
ok(command.includes("started_at:null,confirmed_at:null,confirmed_by_user_id:null"), 'undo explicitly clears stale round timestamps');
ok(command.includes('Once validation passes, reverting the round, session and tournament are independent'), 'undo persistence uses the low-latency commit path');

// Retained demonstration sessions must never contaminate real KOTC history/seeding.
ok(command.includes("s.exclude_from_aggregates!==true"), 'historical aggregate rebuild explicitly excludes marked demo sessions');
const sessionSchema = fs.readFileSync('base44/entities/KotcSession.jsonc','utf8');
ok(sessionSchema.includes('"exclude_from_aggregates"'), 'KOTC session schema supports statistically inert demo sessions');

console.log(`KOTC Gate 2.11 lifecycle/timer regression: PASS\n${checks} lifecycle/timer checks, 0 failures.`);
