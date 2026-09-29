# RallyHub External Tenant / Trial Architecture

## Hard rollout guardrail

Until the upcoming RallyHub Interclub is completed and signed off, this work is additive only.

**Do not refactor, rename, restructure or migrate the existing King of the Court, RallyHub Interclub / Club Challenge, Tournival or other live tournament engines as part of external-club trial work.**

The entitlement/trial/commercial layer must sit around the existing engines. Existing Clare behaviour remains legacy/full-access unless a tenant is explicitly migrated to entitlement enforcement.

## Core model

A club is a permanent RallyHub Tenant/Club. The tenant is not temporary; access to capabilities is temporary or commercial.

Access resolution is:

User -> Tenant/Club membership -> Role -> Tenant Access Policy -> Entitlements -> RallyHub capability.

Backend resource ownership / tenant isolation remains authoritative. Hiding navigation is never sufficient security.

## Capability catalogue

Tournament types are RallyHub competition engines and are separate from platform functions.

Initial tournament types:
- King of the Court
- RallyHub Interclub
- Tournival
- Ladder League (future/development)
- Future tournament types

Initial platform functions/integrations include:
- Club Events
- Membership
- Club App
- Directory
- Communications
- Spond integration
- Player links
- Live Event View
- Results
- Results email distribution
- Future functions/integrations

Capabilities use stable keys. Customer-facing labels can change without changing security keys.

## Entitlements

TenantEntitlement supports independent, time-bound capability access.

Types:
- trial
- paid
- beta
- pilot
- one_event
- manual
- subscription

Statuses:
- scheduled
- active
- grace
- suspended
- expired
- revoked

Capabilities may declare dependencies. The entitlement resolver expands dependencies without exposing them as customer-facing products.

Each entitlement can have its own start/end date, event scope and optional limits/quotas.

## Existing tenants / feature flag principle

TenantAccessPolicy.enforcement_mode controls migration:
- legacy_full_access: current behaviour, entitlement records do not block access
- entitlements_required: capability checks become authoritative

No existing tenant should be switched to entitlements_required as part of the foundation build.

## Trial lifecycle

Application -> Super Admin review/approval -> Trial & Evaluation Agreement acceptance -> Activation -> Guided onboarding/demo -> Live trial -> Expiry/extension -> Conversion or suspension.

Trial clock starts at activation rather than approval unless explicitly overridden.

Expiry disables host/admin use of expired capabilities but does not delete the tenant, users, history or stored configuration.

If a legitimately authorised event is already live when entitlement expires, TenantAccessPolicy may allow it to finish. No new event should start afterwards.

Historical published results may remain public/read-only based on tenant policy.

## Legal / acceptance

RallyHub legal agreements are platform-level and separate from tenant club waivers/policies.

Trial acceptance should record:
- exact agreement id/key/version
- wording hash
- user and tenant
- accepted timestamp
- authority confirmation
- restricted-sharing confirmation
- IP acknowledgement
- evidence snapshot

Marketing consent must be optional and separate.

Final legal wording must be reviewed by an Irish commercial/IP solicitor before public rollout.

## Tenant isolation

External tenants must never be able to read or mutate another tenant's:
- players/people
- events/tournaments
- scores/results
- Spond connections/groups/imports
- club admin configuration
- membership data
- communications
- audit records

Tenant isolation must be tested by deliberate URL/API/resource manipulation, not only through the visible UI.

## Spond

Spond remains tenant/club scoped. ExternalGroupConnection and related identities/sync records must use the external tenant/club boundary. No shared Clare connector context may be exposed to an external tenant.

Expiry/suspension must prevent new imports. Long-term implementation should disconnect/revoke tenant-specific provider access where appropriate.

## Onboarding / demo

Use isolated Demo Mode rather than contaminating real event history with fake players/events.

KOTC already supports demo_mode and exclude_from_aggregates. Guided onboarding should eventually include:
1. Accept/activate trial
2. Run guided KOTC demo with synthetic data
3. View host/player/live-result experiences
4. Connect Spond or add real players
5. Create first real event

Demo data must not send real email, affect stats, become public history or count as commercial usage.

## Self-service help

Provide:
- Host Quick Start
- Live Host Guide
- Player Link Guide
- Results Guide
- contextual in-product help
- onboarding checklist

The product should make the normal journey obvious without requiring Brian to coach each club manually.

## Conversion / commercial architecture

Trial conversion changes entitlements/subscription state on the same tenant. It must not create a second club/account.

Preserve:
- tenant/club
- users and roles
- configuration
- Spond connection where still authorised
- event history
- results

Commercial Plan is a bundle; Tenant Entitlement is the actual permission. Super Admin can override plan-derived entitlements.

Subscriptions are payment-provider-neutral and support trial/active/payment_due/grace/suspended/cancelled/expired.

Payment gateway choice and RallyHub banking setup are separate rollout dependencies and must not block trial architecture.

## Initial rollout

1. Foundation entities/resolver behind legacy-full-access default.
2. Regression test current app and RallyHub Interclub.
3. Create Ashbourne as first external tenant only after foundation passes.
4. Give only explicitly agreed capabilities.
5. Test tenant isolation and Spond isolation.
6. Add agreement/activation/onboarding UI.
7. David Malloy completes onboarding with minimal coaching; product friction is captured as product work.
8. Run first real external KOTC.
9. Test expiry/reinstatement/conversion.
10. Add a second external club to prove no Ashbourne-specific assumptions.
11. Only then broaden rollout and enable commercial payments/packages.

## Foundation entities added

- RallyHubCapability
- TenantAccessPolicy
- TenantEntitlement
- RallyHubTrialApplication
- RallyHubLegalAgreement
- RallyHubAgreementAcceptance
- RallyHubCommercialPlan
- RallyHubPlanCapability
- RallyHubSubscription

Backend resolver/admin service:
- base44/functions/tenantEntitlements/entry.ts

No existing tournament engine is called or modified by the entitlement service in this foundation phase.
