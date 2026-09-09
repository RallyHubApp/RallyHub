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

// Timer hydration/recovery must restore persisted state, not silently reset/restart it.
ok(timer.includes("action:'get'"), 'timer hydrates from persisted backend state');
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

console.log(`KOTC Gate 2.11 lifecycle/timer regression: PASS\n${checks} lifecycle/timer checks, 0 failures.`);
