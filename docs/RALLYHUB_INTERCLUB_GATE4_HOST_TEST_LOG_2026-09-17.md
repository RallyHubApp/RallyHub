# RallyHub Interclub — Gate 4 Host Test Log

**Date:** 17 September 2026  
**Scope:** Physical/manual host journey for RallyHub Interclub → Interclub Challenge.  
**Status:** IN PROGRESS — do not treat Gate 4 as complete until all physical retests and remaining host scenarios pass.

## Operating rule

Every issue found during the manual Gate 4 host test is recorded here. A finding is not closed merely because code was changed: where the issue is visual, audio, device-specific, timing-related or otherwise physical, it remains **PHYSICAL RETEST REQUIRED** until confirmed in the real Preview/device journey.

## Findings and status

| Area | Finding | Action / current state | Status |
|---|---|---|---|
| Setup / logos | Uploaded club logo could be lost when navigating after upload | Logo is now persisted immediately once an Interclub event exists | FIXED + previously retested |
| General accessibility | Dark-mode scrollbar was difficult to see | Wider high-contrast scrollbar and stable gutter added | FIXED + previously retested |
| Draw wording | Developer/test wording such as “Gate 2 priorities applied”, “Hard checks PASS”, “Max opp repeat” appeared to hosts | Changed to “Schedule fairness checks”, “Fairness checks passed”, “Max opponent repeat” | FIXED — visual retest later |
| Live hierarchy | Live page originally behaved like an admin console with too many equal-weight sections | Reordered to live score → at-a-glance → timer → scoring → collapsed support controls | FIXED + retested |
| Score entry position | Score boxes were below the player names rather than beside the teams | Shared ScoreCard redesigned so scores sit beside each team | FIXED + retested |
| Score visibility | Dark score inputs were difficult to see | Stronger grey two-pixel surround/focus treatment applied through shared ScoreCard | FIXED + retested |
| Score validation | Host could enter values such as 9466 | UI limited to two digits and backend rejects scores over 99 | FIXED + retested |
| Score status | Host needed clearer saved/update state | Cards now show Saved state and Update Result for corrections | FIXED + retested |
| Draw result | Timed draw such as 4–4 must remain valid | Win 2 / draw 1 each / loss 0 retained; no artificial winner forced | PASS |
| PA panel | PA controls took too much space in the normal scoring journey | PA & Announcements collapses by default | FIXED + retested |
| Audio labels | “Mic” and “RallyHub sound” were ambiguous | Renamed to “Live PA mic volume” and “RallyHub alerts & voice volume” | FIXED — visual retest later |
| Announcement audio | Chime could play without subsequent speech; volume slider did not consistently scale all RallyHub-generated audio | Speech sequencing hardened; chime and voice now follow RallyHub volume; chime shortened | FIXED + announcement physical retest passed after first repair |
| Default PA mic | System-default microphone works through speakers | No change required | PASS |
| External PA mic | USB/webcam mic showed input on the meter but produced no audible PA output | Explicitly selected external microphones now use direct capture mode with browser echo/noise/auto-gain processing disabled; default mic retains processed mode | PHYSICAL RETEST REQUIRED |
| External mic diagnosis | Host could not tell whether a selected mic was receiving signal | Live mic input meter added; selected active mic shown | FIXED + retested |
| Changeover | Host could accidentally start Changeover before play | Changeover is state-gated; Start Play is the valid initial action | FIXED + retested |
| Host navigation | Host had to hunt for controls while scrolling | Pinned/Floating Host Bar added with round, timer, saved-score count, PA, Players and Complete Round | FIXED + physical scroll retest passed |
| Host bar implementation | Initial CSS sticky implementation did not actually remain visible | Replaced with measured fixed/pinned behaviour plus placeholder; browser scroll assertion added | FIXED + physical retest passed |
| Host quick links | PA/Players buttons only scrolled to collapsed panels | Buttons now open the relevant panel and scroll it into view | FIXED — physical retest later |
| Round 2 → 3 fixtures | Round, court pairings, resting list, Up Next and overall score transitioned correctly | No change required | PASS |
| New-round timer state | Round 3 inherited the previous round’s paused 08:07 state | Round advance now authoritatively creates a fresh Ready timer using the configured round duration and clears paused event status | FIXED — PHYSICAL RETEST REQUIRED |
| Reset timer display | Reset showed 00:00 although Start Play subsequently began at 10:00 | Reset now stores Ready + configured duration; custom round-duration preparation also uses Ready state | FIXED — PHYSICAL RETEST REQUIRED |
| Initial live timer | A newly started event should show Round 1 ready at the configured duration before Start Play | Event start now creates Ready timer state immediately | FIXED — browser test added; physical retest later |
| Replacement control feedback | Clicking Replace from Round 3 appeared to do nothing | Immediate command acknowledgement, Applying state, duplicate-tap protection and persistent success/error message added | FIXED — PHYSICAL RETEST REQUIRED |
| Replacement sporting action | Manual injury replacement of Club A Test 01 with Brian Moore | Backend data check confirmed the action actually succeeded: outgoing player marked injured; replacement effective from Round 3; completed Round 1 stayed unchanged; future Round 3/5/7/9/11 fixtures changed | BACKEND VERIFIED |
| Replacement future-only rule | Completed history must not be rewritten | Backend implementation filters terminal matches and changes future unresolved fixtures only; browser journey assertion added | VERIFIED IN DATA + AUTOMATED TEST |
| Practice/Test Mode after a replacement | Replacing a dummy player could make the event stop being recognised as a Gate 3 practice event | Practice-event detection now accepts replacement descendants of the original dummy roster, client and server side | FIXED — browser host robot PASS |
| Player Controls discoverability | Injury/replacement controls were hidden under vague Event Changes wording | Separate Player Controls panel created | FIXED + retested |
| Reserve replacement | Prefer registered reserve/available player before manual typing | Same-club unused registered candidates offered first; manual replacement remains fallback | IMPLEMENTED; real reserve case still to test |
| Continue Short | Host can withdraw/injure player with no replacement | Existing server path retained; now has visible working/success/error feedback and duplicate-tap protection | PHYSICAL TEST PENDING |
| Late arrival | Host can set first available round | Existing server path retained; now has visible working/success/error feedback and duplicate-tap protection | PHYSICAL TEST PENDING |
| Court/time change | Host can preview impact before applying loss/gain of courts or reduced time | Preview and explicit Confirm Changes workflow present; completed results protected | PHYSICAL TEST PENDING |
| Persistence/recovery | Refresh/reopen/sleep/wake/network behaviour | Still to complete in Gate 4 host journey | PENDING |
| End-of-event | Results, Showcase/tie path, POT controls, Event Pack, finalise, archive/reopen | Still to complete in Gate 4 host journey | PENDING |
| Physical devices | Mobile, two-device scoring, scorer conflict, QR, offline retry, actual speaker/mic combinations | Still to complete after main host journey | PENDING |

## Automated coverage added/maintained during Gate 4

- Interaction robot covers sporting baseline, host/scorer permissions, two-digit scores, pinned host bar, PA, replacement/withdrawal/late-arrival presence, finalisation and public voting.
- Browser host robot now explicitly checks the pinned Host Bar by scrolling the page.
- Browser host journey now checks replacement acknowledgement, future-only replacement behaviour, initial Ready timer state and fresh Ready timer state after advancing a round.
- Current automated result after the latest Gate 4 fixes: lint PASS, build PASS, interaction robot **88 assertions PASS**, browser host/voter/Hall Display robot **3/3 PASS**.
- Public voter and public Hall Display robots remain part of the suite.

## Gate 4 exit rule

Do not mark the host portion of Gate 4 complete until the outstanding **PHYSICAL RETEST REQUIRED** and **PHYSICAL TEST PENDING** items above have been exercised in Preview from the host’s point of view. Automated PASS is supporting evidence, not a substitute for the real hall workflow.
