# RallyHub Directory legal approval audit — 27 October 2026

Status: PRE-APPROVAL. No policy publication or customer sends.

## Owner-confirmed details
- Operator is a partnership; partner legal names and formal business/trading name NOT YET SUPPLIED.
- Business contact postal address NOT ESTABLISHED.
- Privacy/legal email: rallyhubapp@gmail.com.
- Account minimum age: 18.
- Optional marketing: opt-in, separate from necessary service and claim communications.
- Do not disclose confidential security methods, algorithms, source code, database design or proprietary workflows.

## Draft records
RallyHubLegalAgreement: rallyhub_directory_privacy, rallyhub_directory_terms, rallyhub_directory_cookies; version 0.2-draft. No approved_at or active status.

## Source-verified findings
- SiteAnalytics.jsx provides Necessary only, Allow analytics, and Cookie settings.
- site-analytics.js gates GA4 and first-party event tracking behind granted analytics consent; uses visitor/session identifiers in browser storage.
- DirectoryClaim.jsx has optional networkUpdatesOptIn checkbox; backend stores network_updates_opt_in and related timestamp.
- Directory protected contact and enquiries: directoryListingProfile, directoryContactAction, DirectoryContactEndpoint and DirectoryContactEnquiry.
- Clare Pickleball retains separate ClubPolicy and ClubLegalDocument records.
- No explicit deletion schedule was found in inspected Directory files; check other jobs and providers before assuming none exists.

## Remaining approval blockers
1. Partnership partners' legal names, trading-name/CRO position, and compliant business postal address.
2. Final data-controller versus processor roles across Directory, tenant, coaches, suppliers and enquiry recipients.
3. Processor/data-transfer register for Base44, media hosting, mailing, analytics and other integrations, including DPAs and safeguards.
4. Purpose-specific lawful bases, legitimate-interest assessments and sources of business listing information.
5. Enforceable retention/deletion schedules for accounts, claims, enquiries, outreach, audits, identifiers and backups.
6. Live network, cookies and local/session storage inventory on Directory and tenant journeys before/after consent; test withdrawal.
7. Promotional opt-in segmentation, unsubscribes and consent evidence; no marketing without appropriate permission.
8. Verify the actual 18+ account sign-up restriction and separate treatment of any tenant juniors.
9. Verify current privacy notice and Terms accessibility in registration, claims, enquiries and acceptance version logs.
10. Irish legal and data-protection review, followed by explicit owner approval before deployment.

## Publication acceptance criteria
Public endpoint serves only active formally approved versions; internal notes never public. Footers, utility links, claims, contact and signup routes point to correct policies. Test mobile/logged-out access and separation of tenant club and sporting legal notices.
