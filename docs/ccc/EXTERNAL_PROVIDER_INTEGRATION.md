# CCC v2.1 — external provider integration boundary

**Clare Pickleball email and SumUp are existing active integrations to reuse in the core CCC build.** WhatsApp Business and optional SMS onboarding are deferred. Existing credentials must be verified through backend configuration checks, not exposed or duplicated. This document does not assert that any newly connected CCC journey is verified.

## Reuse
- `CommunicationChannelConfig` stores tenant-scoped channel/provider state; credentials must stay in backend secrets, never this entity or client bundles.
- `CommunicationDeliveryAttempt`, `CommunicationMessage`, `CommunicationConversation`, `CommunicationPreference`, `CommunicationSuppression`, `ConsentRecord`, and `CommunicationTemplate` remain the existing source of truth. Do not duplicate them.
- `communicationsEngine`, `memberMessaging`, `paymentGatewayWebhook` and the existing SumUp adapters remain the authoritative production routes.
- `src/lib/ccc/externalProviderContracts.js` defines pure readiness, dispatch-envelope and delivery-event contracts; it **does not** call providers or confer permission to send.

## Existing integrations — connect during core build
1. **Email:** reuse `communicationsEngine`, approved tenant brand kit, `CommunicationTemplate`, suppression and delivery records. Connect all new CCC lifecycle events through the existing approved email route; do not introduce a second mailer.
2. **SumUp:** reuse the existing tenant payment account, `SUMUP_API_KEY` / `SUMUP_MERCHANT_CODE` backend secrets, checkout and verification adapters, `paymentGatewayWebhook`, and `PaymentRecord`. Keep checkout, payment, attendance and booking states independent. Never assume paid from a redirect.
3. **Do not trigger a real charge, refund or external email merely to validate integration.** Production actions remain separately controlled.

## Deferred provider-onboarding backlog (not live)
1. Verify tenant-owned sender and official WhatsApp Business account, approved templates, inbound webhook signature and consent evidence; bind through existing Communications Centre.
2. Connect optional SMS gateway with backend-held credentials, consent and safe fallback; reuse existing KOTC SMS transport only where appropriate.
3. For new CCC journeys, verify existing SumUp adapter compatibility, delayed/repeated webhook handling, refund and reconciliation logic; no new SumUp onboarding is assumed.
4. Implement provider-specific adapters and verified webhook ingestion on the server, linked to the existing outbox and conversation records. No client-side secrets.
5. Enable one tenant/provider at a time after explicit approval, with delivery tracing, rate limits, retries, suppression and a rollback switch.

**Fail closed:** `disabled` and `test` are not production-ready. Unverified webhooks must not update delivery status. No auto-send, refund, identity merge or access grant is authorised by provider readiness alone.
