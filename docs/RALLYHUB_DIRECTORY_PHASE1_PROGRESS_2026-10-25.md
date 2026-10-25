# Directory Command Centre — Phase 1 progress / release gate (25 October 2026)

Governing specification: `RallyHub Directory Command Centre — Phase 1 Master Specification v1.0` (24 October 2026). This document records observed source/test results only, not operational sign-off.

## Current work package: consolidated People & CRM inbox
- Existing Directory owners/editors and opted-in player subscribers share one searchable administration view but remain independent records.
- Backend read-only `admin_inbox` returns the latest 500 `DirectoryContactEnquiry`, `DirectoryContactAction`, and `DirectoryEnquiryFollowup` records after the immutable two-ID Directory super-admin check. No tenant people or guest records are queried.
- Directory-only follow-ups store `enquiry_id`, `open`/`in_progress`/`resolved` state, internal note and last editor/time. Original enquiry/delivery fields are never overwritten by a follow-up.
- The inbox distinguishes mail-provider acceptance from delivery to a recipient, and initiation of calls/WhatsApp actions from actual receipt.
- Source UI includes search, enquiry detail, action history, and explicit follow-up saves; no bulk sending or guest conversion introduced.

## Implementation outcomes
- Source/UI: completed in Base44 sandbox, **not published**.
- `DirectoryEnquiryFollowup`: local schema created; **not pushed** to Base44.
- `directoryContactAction`: updated source; **not deployed**.
- Smoke tests: build, lint, Directory test suite and source gate completed; authenticated Directory role matrix and new inbox runtime not verified.

## Remaining Phase 1 work and acceptance (do not represent as passed)
1. Admin access: signed-in Brian and Conall positive tests, third generic admin/listing owner/tenant/anonymous negative tests, direct entity RLS read/write tests and consent boundaries.
2. Contacts and enquiries: push/read-back 18th schema, deploy function in an owner-approved window, signed-in inbox+follow-up end-to-end, capture+forwarding/provider error and outcome reconciliation, duplicate handling, audit event history, pagination beyond 500 if needed.
3. Product scope: comprehensive Directory-only KPIs and review/failure queue; listings/profiles/bulk administration; authoritative people deduplication and optional explicit cross-domain links; marketing/social campaigns, branded preview/approval and transport/retry logs; first-party/provider attribution and external analytics connectors as available.
4. Technology/data: typecheck baseline/remediation, performance and accessible desktop/tablet/mobile browser acceptance, backup/restore and canonical Directory export with provenance, extraction rehearsal, schema counts and migration reconciliation.
5. Release: separate explicit production approval, verified backup, deployed backend/schema before frontend publication, controlled smoke tests and rollback/monitoring evidence.

No customer communication, production data mutation or live backend deployment was performed for this work package.
