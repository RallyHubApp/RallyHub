import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Tenant-specific approved artwork. Other clubs use their own guide rather than Clare branding.
const TENANT_HOST_INFOGRAPHICS = Object.freeze({
  '6a9b7790bc4a8d299938bda9': 'https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/521f37ca9_rallyhub-c868d83e9bcd2c638fb9.png',
});

const chapters = [
  { title: '1. Before players arrive', steps: [
    'Open your personal host link and sign in with the authorised host account. This link controls only this KOTC session.',
    'Check the player list and how many usable courts are available. Four players are required for each active doubles court.',
    'Have a charged phone or tablet and a reliable connection. If using hall sound, pair the Bluetooth speaker with the host device, select it as the sound output, set the volume and test the audible signal before play.',
    'The host may record all court scores directly. Player scoring links are optional; tonight can be run entirely with host-entered results.'
  ]},
  { title: '2. Create the first-round draw', steps: [
    'Under Session settings enter Venue courts and Hall / session duration.',
    'Choose Timed rounds (set Round duration) or a points target. For Clare sessions, the usual target is 11.',
    'Under Round 1 setup choose Starting order (Roster, Manual, Genuine DUPR or Previous KOTC), then Round 1 draw (Balanced Ranking, Pure Random or Strict Ranking).',
    'Use Review player order if you need to adjust the starting order. Check the proposed bench when the roster exceeds the available court spaces.',
    'Read the Ready check summary and press Create Round 1. Do not press repeatedly while a request is being processed.'
  ]},
  { title: '3. Check courts and start play', steps: [
    'In the Host Round Editor, review every court and the Bench This Round list before starting.',
    'Quick two-tap change: tap one court player, then the other court player to swap positions without redrawing. To bring someone off the bench, tap the outgoing court player first, then the incoming bench player.',
    'Use Move court to drag an entire four-player court group to another court rank.',
    'Each team has Lock pair and Locked / Unlock controls. Locking a pair keeps those two players partnered in future round proposals. Unlock before making a change that would split them. This does not lock the entire court.',
    'After swapping players, making a bench substitution or moving a court, choose Save Round Setup and check the confirmation. For a completely new opening draw, use Return to Setup / Redo Round 1 Draw before play begins.',
    'Call out courts, partners and opponents after the saved layout is confirmed.',
    'For timed rounds, check the round minutes and test the Bluetooth speaker using Sound Check. Confirm the horn is audible across the hall; if not, use the on-screen timer and call time manually.',
    'Press START ROUND only when everyone is on court. The round timer is associated with the round start.'
  ]},
  { title: '4. Collect and verify scores', steps: [
    'For host-led scoring, collect each court’s final score when the horn sounds. Enter Team A and Team B scores on the host court score card, confirm the result and save each court. No player scoring link is required.',
    'If player scoring links are enabled for a future session, only one scorer should claim each court. The host can refresh player scores entered on another device.',
    'Check that every court has a saved score before preparing the next round. Use the host correction control for a result that has already been submitted.',
    'For a completed score that needs correction, choose Edit result, make the correction and save. Review the changed result before progressing.',
    'For timed rounds ending in a tie, select Team A or Team B as serving at the horn; RallyHub uses that to determine the winner. No drawn match result.'
  ]},
  { title: '5. Advance to the next round', steps: [
    'Check that every court has a saved result. Resolve any missing or incorrect score before advancing.',
    'Use the next-round preparation control when Round scores are complete. Wait for the confirmation; do not press again during a slow response.',
    'Review the next proposed court positions and bench list. Winners move towards Court 1 and losers towards the highest-numbered court.',
    'Make any permitted changes in the proposed round, call out the new courts and press START ROUND again.'
  ]},
  { title: '6. Late arrival, injury or early departure', steps: [
    'Open Session tools, then the Live Roster Controls / player controls.',
    'Select the affected player and choose the relevant action: Late / Not Arrived, No-show, Injured, Leave After This Round, Sit Out 1 Round, Temporarily Unavailable or Arrived / Back Available.',
    'When a round is live, many changes take effect from the next round so completed scores are preserved. Check the confirmation message.',
    'For an unstarted round, make a court-to-bench swap in the proposed round where necessary instead of redrawing all courts.',
    'If a change was accidental, use the available roster Undo control promptly. Confirm the new court/bench layout before starting the next round.'
  ]},
  { title: '7. Finish and share results', steps: [
    'After the final round, make sure all intended match results are saved and inspect the standings.',
    'Open Session tools and select Finish session. Confirm only when play is genuinely finished; unplayed matches may be recorded as not played.',
    'Use the Share results option to copy or share the session-specific results link. Communications tools may be available to authorised admins.'
  ]},
];
const problems = [
  ['A score is missing', 'Check the player scoring device, use Refresh Player Scores, then record the missing score on the host score card if necessary.'],
  ['A score is wrong', 'Open the saved court result, select Edit result, correct it and save before moving to the next round.'],
  ['A player leaves during play', 'Use Live Roster Controls and Leave After This Round or Injured, as appropriate. Check when the change takes effect.'],
  ['Somebody arrives late', 'Mark Arrived / Back Available in roster controls, then review the next proposed round and bench.'],
  ['The round will not advance', 'Check for outstanding results and any visible error. If the screen is still processing, wait and refresh the session state rather than repeatedly triggering the command.'],
  ['The timer or sound is not working', 'Check Bluetooth pairing, selected audio output and both volume controls, then try Sound Check. If the horn is still inaudible, use the on-screen timer and manually announce time. Do not assume an audible signal played.'],
];

export default function KotcHostGuide({compact=false,tenantId=''}) {
  const [opened,setOpened]=useState(0);
  const infographicUrl=TENANT_HOST_INFOGRAPHICS[String(tenantId)]||null;
  return <section className="space-y-4" data-testid="kotc-detailed-host-guide" aria-label="King of the Court host instructions">
    {infographicUrl&&<div className="rounded-2xl overflow-hidden border border-blue-900/20 bg-background" data-testid="kotc-host-infographic">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#073a75] text-white border-b-4 border-[#ffcc16]">
        <div><h2 className="text-base font-bold">Host quick-start infographic</h2><p className="text-xs text-blue-100">Visual overview — use the detailed instructions below for every step.</p></div>
        <a href={infographicUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2" download>Open full-size image</a>
      </div>
      <a href={infographicUrl} target="_blank" rel="noopener noreferrer" aria-label="Open host guide infographic full size"><img src={infographicUrl} alt="Clare Pickleball King of the Court host quick-start guide: seven steps from opening the host link through setup, rounds, scoring, player management and results" className="block w-full h-auto max-h-[850px] object-contain bg-white" loading="lazy" /></a>
    </div>}
    <div className="rounded-2xl overflow-hidden border border-blue-900/20">
      <div className="bg-[#073a75] text-white px-5 py-5 border-b-4 border-[#ffcc16]">
        <div className="text-xs uppercase tracking-[0.2em] text-[#ffdf59] font-semibold">Host instructions · King of the Court</div>
        <h2 className="text-xl sm:text-2xl font-bold mt-1 flex items-center gap-2"><BookOpen className="h-6 w-6"/> {compact?'Quick help':'Step-by-step host guide'}</h2>
        <p className="text-sm mt-2 text-blue-50">Follow each stage in order. This guide explains the existing RallyHub host controls, including what to do when something changes during play.</p>
      </div>
      <div className="p-3 sm:p-4 space-y-2 bg-blue-50/30">
        {chapters.map((chapter,index)=><div key={chapter.title} className="rounded-xl border bg-background overflow-hidden">
          <button type="button" className="w-full min-h-12 p-3 flex items-center justify-between gap-3 text-left" aria-expanded={opened===index} onClick={()=>setOpened(opened===index?-1:index)}>
            <span className="font-semibold text-sm sm:text-base">{chapter.title}</span>
            {opened===index?<ChevronUp className="w-5 h-5 shrink-0"/>:<ChevronDown className="w-5 h-5 shrink-0"/>}
          </button>
          {opened===index&&<ol className="border-t px-5 py-4 list-decimal pl-9 space-y-3 text-sm leading-relaxed">{chapter.steps.map((step,i)=><li key={i}>{step}</li>)}</ol>}
        </div>)}
      </div>
    </div>
    <div className="rounded-2xl border p-4 space-y-3">
      <h3 className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500"/> Troubleshooting during the session</h3>
      <div className="grid gap-2">{problems.map(([title,answer])=><details key={title} className="rounded-lg border p-3 bg-background"><summary className="font-semibold text-sm cursor-pointer">{title}</summary><p className="text-sm mt-2 text-muted-foreground">{answer}</p></details>)}</div>
    </div>
    <div className="rounded-xl border border-amber-400/30 bg-amber-50/60 dark:bg-amber-950/10 p-4 text-sm space-y-2">
      <p className="font-bold flex gap-2 items-center"><HelpCircle className="w-4 h-4"/> Sporting rules reminder</p>
      <p>Four players per doubles court. Target 11 for points-based games unless the session is configured differently. For timed games, a tie at the horn requires the serving side to be selected. Winners move towards Court 1; losers move towards the highest court. The round and bench assignments shown in RallyHub are the authoritative ones for this session.</p>
      <p className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5"/> <span>Check the result and court assignments before starting the next round. Never recreate the whole session to fix one attendance change.</span></p>
    </div>
  </section>;
}
