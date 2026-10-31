# CCC v2.1 — external provider integration boundary

Provider onboarding is deferred until the core CCC build is complete. This is **not** an assertion that WhatsApp, SMS, email, or payment providers are live.

## Reuse
- `CommunicationChannelConfig` stores tenant-scoped channel/provider state; credentials must stay in backend secrets, never this entity or client bundles.
- `CommunicationDeliveryAttempt`, `CommunicationMessage`, `CommunicationConversation`, `CommunicationPreference`, `CommunicationSuppression`, `ConsentRecord`, and `CommunicationTemplate` remain the existing source of truth. Do not duplicate them.
- `communicationsEngine`, `memberMessaging`, `paymentGatewayWebhook` and the existing SumUp adapters remain the authoritative production routes.
- `src/lib/ccc/externalProviderContracts.js` defines pure readiness, dispatch-envelope and delivery-event contracts; it **does not** call providers or confer permission to send.

## Provider-onboarding backlog (not live)
1. Verify tenant-owned sender and official WhatsApp Business account, approved templates, inbound webhook signature and consent evidence; bind through existing Communications Centre.
2. Connect optional SMS gateway with backend-held credentials, consent and safe fallback; reuse existing KOTC SMS transport only where appropriate.
3. Verify provider payment credentials, sandbox checkout, signed webhook, delayed/repeated events, refund and reconciliation flows before enabling live.
4. Implement provider-specific adapters and verified webhook ingestion on the server, linked to the existing outbox and conversation records. No client-side secrets.
5. Enable one tenant/provider at a time after explicit approval, with delivery tracing, rate limits, retries, suppression and a rollback switch.

**Fail closed:** `disabled` and `test` are not production-ready. Unverified webhooks must not update delivery status. No auto-send, refund, identity merge or access grant is authorised by provider readiness alone.
