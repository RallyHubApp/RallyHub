# RallyHub Directory ↔ Sporting Engine: Public Events & Guests

**Architecture decision: APPROVED by owner, 24 October 2026.**
**Scope:** Directory Command Centre Phase 1 integration design. **This document is not deployment approval.**
**Governing baseline:** Directory Phase 1 Master Specification v1.0, 24 October 2026.

## Decision
Organiser, participant, account, tenant membership and event registration are independent relationships. Public-event participation never inherently requires membership of the organising tenant. Preserve the Directory as an independently owned, future-portable domain, and interact with the sporting engine only through explicit, scoped interfaces.

## Supported organiser/participant combinations
1. Tenant club organiser + its own member.
2. Tenant club organiser + guest, who need not be a member or tenant.
3. Independent Directory organiser + a member of an unrelated tenant.
4. Independent Directory organiser + external player, who need not belong to any tenant.

## Three operating modes
- **Promotion:** Directory event and external registration link; no sporting tenant created.
- **Registration:** Public event and event-specific registrations; no tenant membership required.
- **Sporting operation:** Explicit activation of competition capabilities; reuse sporting engine for draws, courts, scoring and results. A technical host identity may be provisioned only when genuinely necessary, scoped and audited. A technical host is not club membership or a public club listing.

## Optional guest-to-tenant-member conversion (owner clarification, 24 October 2026)
- Guest attendance or public event registration does **not** create tenant membership, a membership charge or member permissions.
- If a guest independently chooses to join a club, start that club's **existing membership application journey**, not an event-registration shortcut.
- With appropriate permission and the applicant's confirmation, prefill reusable guest/person contact details into the membership application. Preserve separate source records and an audit trail; never copy guest or Directory communication consent into membership consent.
- Collect or confirm all required membership fields and club-specific permissions, complete the normal approval and payment steps, and activate membership **only when the club's normal eligibility, approval and payment rules are satisfied**.
- Link the new tenant member identity to the existing guest/person reference where explicitly authorised. Prefer one authoritative tenant member record, not duplicate guest and member records within that tenant; retain prior guest/event history as separate relationships.
- Failure, abandonment or rejection of the application leaves the guest status and any existing event registration intact.

## Contract invariants
- Directory owns public listings, organiser profiles, discovery and Directory audience consent.
- Sporting domain owns competition state, scoring and results.
- Event registration references a participant and event independently of any optional membership.
- A person may be recognised across journeys by authorised identity linkage; profile field reuse requires appropriate permission/confirmation, without silent cross-domain overwrites.
- Tenant membership, guest participation and Directory subscriptions are not interchanged; consent and role permissions remain domain-specific.
- Read-only actions (including event list) must never provision tenants or clubs as a side effect.
- Public event discovery and ordinary guest entry never create tenant or club memberships.
- Provisioning of a necessary technical sporting host must be explicit, idempotent, logged and linked to the owning Directory event; no duplicate public listing or membership permissions.
- Any future conflicting use case requires a versioned contract amendment and regression tests.

## Acceptance journeys to implement
- Club member enters their club event without duplicate person or membership creation.
- External guest enters a club public event without becoming a member.
- A member of one tenant enters an independent Directory organiser's event without becoming a member of the organiser.
- External unassociated player enters a Directory event without tenant membership.
- Existing guest details may be suggested for reuse subject to permission and confirmation; the separate event registration is created only once.
- Guest elects to join: membership application is prefilled, then normal approval/payment creates or activates a single member record and explicitly links guest history.
- Abandoned/unpaid/declined membership application never activates tenant membership and does not remove guest event access.
- Promotion-only event read/list leaves tenant and club entity counts unchanged.
- Activate sporting capability and verify the optional technical host is scoped, reusable and non-public.
- Results made public through a scoped interface do not expose membership or private contact data.
- Negative tests: cross-tenant participant enumeration, unsolicited consent inheritance, duplicate registration, unauthorised editing and accidental automatic tenant creation.

## Current implementation gap (not claimed as fixed)
The Directory event `list` and `delete` paths now resolve only existing sporting hosts, without provisioning tenant or club records; editing an existing event also uses lookup-only host resolution. Creation of a new sporting-backed event retains the existing technical-host provisioning path until explicitly scoped sporting activation and Directory-owned promotion/registration are implemented. These are code changes with focused source tests; authenticated backend and browser journeys remain unverified. Separate Directory-owned registration persistence, technical-host provisioning policy and authenticated journeys require implementation/testing.
