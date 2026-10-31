CCC v2.1 — activity transition schedule enforcement

Implemented: advancing an activity from draft to ready, or from ready to scheduled, now checks the same scoped legacy GuestSessionLink inventory and Europe/Dublin time validity already used by schedule previews. A conflicting guest session, incomplete inventory, inactive venue, or invalid/ambiguous local time prevents transition before any activity update. Legacy guest-session matching is venue-level and advisory; it does not create a court reservation. The check is still read-before-write, not an atomic venue booking lock, so concurrent scheduling remains a release blocker.

Verification: 61 targeted backend integration, local time and legacy session tests passed, including two new transition rejection tests. Frontend build passed. Full CCC suite deliberately not rerun per owner request. No production deployment or live records changed.

Next: atomic venue-slot reservation or equivalent concurrency control, explicit recurrence draft batch creation with idempotency and audit, and integration acceptance in a test tenant. Do not claim booking concurrency is solved by this change.
