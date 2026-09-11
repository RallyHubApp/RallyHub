# RallyHub Code Health Cleanup — 11 Sep 2026

## Protected baseline
Checkpoint created before cleanup: `6aa457662426277623eec610` (`e9ce6c9a4f69f5cb7c94c646ca9672974610170a`).

## Rules used
- KOTC and Club Challenge sporting/runtime behaviour is protected by their existing gates and robots.
- Type fixes must be behaviour-neutral unless a real defect is separately proven.
- Untested or externally-entered code is preserved by default.
- Backend functions/entities are not removed from a static import scan because they may be invoked by name, token route, webhook, or external integration.
- Legacy code is deleted only when it is unreachable and clearly superseded by tested production code.

## Typecheck cleanup
Sitewide `npm run typecheck` reduced from 478 errors to 0.

Main root fixes:
- Corrected JS typing contracts for shared UI primitives (Button, Input, Label, Textarea, Select, Tabs, Dialog, OTP, Badge).
- Corrected optional/shared component prop inference (GlassCard, PageHeader, StatCard, EmptyState, AuthLayout).
- Added Vite/browser global typing for RallyHub hall audio and `import.meta.env`.
- Added type-only annotations around legacy Base44 SDK calls/results where runtime methods exist but SDK typings are incomplete.
- Preserved remote browser XLSX import behaviour; only suppressed unsupported static typing for the HTTPS ESM import.
- No sporting algorithm was changed by the typing cleanup.

## Removed as proven dead/superseded
- `e2e/kotc-completed-route-diagnostic.spec.mjs` — obsolete troubleshooting test; superseded by the current completed-route regression.
- `src/components/kotc/KotcRoundView.jsx` — legacy KOTC live UI, explicitly excluded by V2 architecture gate.
- `src/components/kotc/KotcSetup.jsx` — legacy KOTC setup UI, explicitly excluded by V2 architecture gate.
- `src/components/kotc/KotcTestSimulator.jsx` — unmounted legacy admin simulator UI; isolated sandbox + automated simulators supersede it.
- `src/components/kotc/KotcRoundRecovery.jsx` — reachable only from deleted legacy round view.
- `src/components/kotc/KotcLivePlayerControls.jsx` — reachable only from deleted legacy round view.
- `src/components/kotc/RoundOneBenchSelector.jsx` — reachable only from deleted legacy setup.
- `src/components/shared/RankingList.jsx` — reachable only from deleted legacy KOTC setup.
- `src/components/kotc/PodiumResults.jsx` — reachable only from deleted legacy KOTC round view.

## Deliberately preserved
- `src/lib/kingOfCourtEngine*` and `KotcRotationSummary` because active `PublicTournament` code still references them.
- KOTC V2 simulator/results/phases libraries because automated release scripts use them even if the browser import graph does not.
- Club Challenge and Tournival legacy/experimental code unless active replacement and coverage are proven.
- `AccessCodeGate`, `AccessCodeValidationTab`, auth-return helpers and OAuth consent code because auth/external entry paths require separate verification before deletion.
- Generated UI primitives that are currently unreferenced; they are low-risk library inventory and may support existing/future generated screens.
- All Base44 backend functions/entities; static browser imports are not a safe deletion signal for backend resources.

## Release requirement after cleanup
Before this cleanup is accepted, run: build, lint, typecheck, Club Challenge engine/interaction/browser robots, all KOTC sporting/security gates, and current KOTC browser journeys.
