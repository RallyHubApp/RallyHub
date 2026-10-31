# CCC v2.1 — host roster stale-response protection

The mobile host check-in workspace now tags each paginated roster request to the currently selected tenant, club and activity. If a host switches session while a continuation request is in flight, the old response is discarded rather than appended to the new session's roster. Paging state is reset on session changes, and old request errors are suppressed after scope changes. The authoritative backend continues to re-check delegated host venue access on each page request.

Two focused source tests passed and the frontend build passed. This is not live two-device mobile UAT. No production changes.
