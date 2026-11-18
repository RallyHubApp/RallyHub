import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Tenant-specific approved artwork. Other clubs use their own guide rather than Clare branding.
const TENANT_HOST_INFOGRAPHICS = Object.freeze({
  '6a9b7790bc4a8d299938bda9': 'https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/5d3ebd495_rallyhub-71eb892f306fbb28d3d0.png',
});

const chapters = [
  { title: '1. Open the pre-session Host Link', steps: [
    'The organiser appoints you by searching for your club member record under Restricted Host Access, before Round 1 is created.',
    'Open the Pre-session Host Link supplied by the organiser and sign in with your own authorised RallyHub account. Do not use the Player Link for hosting.',
    'You can prepare the event without the organiser creating Round 1. If access is denied, ask the organiser to check your host appointment and account email.'
  ]},
  { title: '2. Refresh Spond and check attendance', steps: [
    'In the pre-session host setup, refresh the Spond event list and select the correct club session by date and time.',
    'Preview the respondents before importing. Check accepted players and resolve any missing or ambiguous player matches; do not assume every Spond response represents a player who will attend.',
    'Import the accepted players only after reviewing the preview and confirming the roster replacement. This can replace manually entered names, so check the current roster first.',
    'Review the resulting player list against actual arrivals. Add, remove or replace players as needed before generating the draw.'
  ]},
  { title: '3. Configure courts, scoring and session length', steps: [
    'Confirm the number of available courts and the number of players. Doubles requires four active players per court; additional players rotate through the bench.',
    'Set the hall/session duration and choose your scoring format: Timed rounds with a round timer, or points-based play (for example first to 11, win by one if that is the agreed format).',
    'For timed play, set the round duration (for example 10 minutes), check the sound output and test the audible signal. If the horn is inaudible, announce time manually.',
    'Choose the starting order and opening draw settings. Review the proposed bench and player balance before proceeding.'
  ]},
  { title: '4. Create Round 1 and check the draw', steps: [
    'Use the ready check and Generate / Create Round 1 only once. Wait for confirmation; do not tap repeatedly while the system is processing.',
    'Review every court, partners, opponents and the bench. Swap players or substitute a bench player if necessary, then save the round setup.',
    'Announce court allocations. Press START ROUND only when everyone is ready. The pre-session link hands over to the live Host Link after Round 1 is created.'
  ]},
  { title: '5. Run timed, first-to-11 and All-Change rounds', steps: [
    'Timed: start the timer, play until the horn, collect each court score and save it. For a tie at the horn, identify the serving side as required by RallyHub.',
    'First to 11: finish when a team reaches the configured target; if playing win by one, a one-point margin is enough. Record both team scores and save the result.',
    'All-Change: when the round ends, complete and verify all court scores, then prepare the next round and follow the newly displayed court and bench assignments. Do not manually assume every player changes courts.',
    'Check the new court layout and bench before starting the next round. Winners generally move towards Court 1; losers towards the higher-numbered courts.'
  ]},
  { title: '6. Scores, late arrivals and player changes', steps: [
    'The host can enter all scores. If Player Link scoring is enabled, one player per court can submit the score; the host remains responsible for checking results.',
    'To correct a saved result, use Edit result on the relevant court and save the correction before advancing.',
    'For a late arrival, add the player to the bench. For a departure, injury or temporary absence, use Live Roster Controls and set the correct player status.',
    'Before starting a round, select the outgoing player and replace them with an available bench player; save the layout. During live play, use Change players / bench · Live round, subject to score protection.',
    'Do not recreate the entire session to fix one player change.'
  ]},
  { title: '7. Optional finish and final results', steps: [
    'For timed sessions, Preset Finish is optional. If required, configure and save the finishing court layouts in advance; normal King of the Court continues until a preset is activated.',
    'Activate an available saved preset only when the current round results are complete. Otherwise use Prepare Next Round to continue normal play.',
    'At the end, check every intended result and the standings, then use Finish session. Share the final results link with players.'
  ]},
];
const problems = [
  ['Host Link says access denied', 'Ask the organiser to confirm your member record and RallyHub account were appointed for this event. The Player Link does not provide host permissions.'],
  ['Spond attendance looks wrong', 'Refresh the Spond list, confirm the correct event/date, preview respondents and check ambiguous matches before confirming an import.'],
  ['A score is missing', 'Check the player scoring device, use Refresh Player Scores, then record the missing score on the host score card if necessary.'],
  ['A score is wrong', 'Open the saved court result, select Edit result, correct it and save before moving to the next round.'],
  ['A player leaves during play', 'Use Live Roster Controls and Leave After This Round or Injured, as appropriate. Check when the change takes effect.'],
  ['Somebody arrives late', 'Open Live Roster Controls and Add to Bench. For someone already registered, use Arrived / Back Available. No redraw is needed.'],
  ['Replace a player before the round starts', 'Select the outgoing court player, choose an available bench player under Replace player · one step, then Confirm Replacement.'],
  ['Replace a player during a live round', 'Open Change players / bench · Live round. Select the outgoing court player and incoming bench player, then Save. Scored or claimed courts cannot be changed.'],
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
      <a href={infographicUrl} target="_blank" rel="noopener noreferrer" aria-label="Open host guide infographic full size"><img src={infographicUrl} alt="Clare Pickleball King of the Court host quick-start guide: host setup, Spond attendance, round configuration and live session controls" className="block w-full h-auto max-h-[850px] object-contain bg-white" loading="lazy" /></a>
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
