# CCC v2.1 — targeted schedule integration batch

## Added
- `legacySessionReview.mjs` checks read-only existing GuestSessionLink sessions by tenant, club, session date, venue name/key and half-open local clock-time overlap. Closed sessions still count as hall reservations; archived sessions are ignored. Missing venue mapping or malformed times are flagged, not assumed safe.
- `cccActivity.recurrence_review` and `schedule_review` now include this legacy inventory and fail readiness closed on detected overlaps or incomplete inventory. Results are advisory and do not reserve courts or create sessions.
- Activity planner and recurrence preview display legacy guest-session conflicts alongside CCC conflicts.
- New tests cover cross-club isolation, closed/archived sessions, date boundaries, incomplete inventory and non-mutating backend behaviour.

## Verification scope (per owner request)
- Only affected backend integration, recurrence and legacy schedule tests run: 57 passed, 0 failed.
- Frontend Vite production build passed (dependency compile check).
- Full 328-test CCC regression intentionally not rerun in this batch. The previous full-suite result remains historical, not a current full-suite certification.

## Still outstanding
- No actual Base44 production deployment or live verification.
- Legacy venue name matching is advisory; external hall calendars and court-level legacy allocations are not represented.
- Daylight-saving handling, recurrence persistence and real capacity/booking concurrency remain open.
- Formal A01–A20 acceptance not completed.
