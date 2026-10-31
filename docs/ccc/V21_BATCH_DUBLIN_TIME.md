# CCC v2.1 — Dublin scheduling integration

## Implemented
- Europe/Dublin time-zone validation now runs in single-date and weekly CCC scheduling preflights. It rejects nonexistent and ambiguous local times across spring/autumn clock changes; ordinary summer and winter sessions resolve to the correct UTC instant.
- Explicit UTC/offset timestamps remain supported for legacy scheduling records; the validation does not silently reinterpret them as local wall-clock times.
- Weekly recurrence previews include per-occurrence local-time warnings and resolved UTC instants. Readiness is false when any week contains a DST gap, ambiguous clock time, or invalid actual duration.
- The activity planner displays local-time issues alongside CCC and legacy guest-session overlaps.
- Weekly preview ignores responses for a previously selected activity/date/number of weeks, preventing stale scheduling advice.
- All changes are advisory/read-only: no recurrence publication, court reservation or production data mutation.

## Targeted verification
- 65 tests passed: Dublin time review, recurrence boundaries, legacy guest-session overlap, UI source guards and mocked backend handler integration.
- Frontend build passed.
- Full CCC regression intentionally not run, per owner's targeted-testing instruction.

## Remaining
- Real Base44 tenant/club permission UAT, external hall calendar integration, atomic recurring-session creation and cancellation, capacity and provider payment acceptance.
- Time-zone scope currently fixed to Europe/Dublin; multi-region clubs require an explicit IANA zone policy before rollout.
- Production deployment/publish not authorised.
