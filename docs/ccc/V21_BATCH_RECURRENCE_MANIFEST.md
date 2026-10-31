# CCC v2.1 — recurrence draft manifest

Added a scoped, read-only `recurrence_manifest` action for a saved draft, plus a planner control. The server reloads the authoritative draft and checks its revision, tenant, club, active venue/court, existing CCC activities, guest-session overlaps, completeness of both inventories and Europe/Dublin DST validity. The manifest includes up to 12 occurrence dates and stable operation IDs, but intentionally creates nothing.

Safety: a linked event, changed revision, non-draft status, ambiguous date, overlap, incomplete inventory or duplicate occurrence fails closed. Manifest `readyToCreate` is always false, because atomic slot reservation, external hall booking validation and live booking capacity checks are not yet implemented. No production records, payments, notifications or publications were changed.

Verification: 61 relevant backend, recurrence manifest and UI source tests passed; frontend build passed. Full CCC regression intentionally omitted per owner request. The Base44 SDK tests use a mocked backend, not a real production tenant. Formal A01–A20 acceptance remains open.
