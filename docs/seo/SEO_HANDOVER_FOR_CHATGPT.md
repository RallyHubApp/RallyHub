# SEO Handover for ChatGPT

## Read this first

This is the permanent handover for future authorised direct ChatGPT/backend work on RallyHub SEO.

## Current status

- A safe direct Base44 SEO write integration has **not** been implemented.
- The available Base44 docs mention Dashboard SEO settings and a beta Update SEO settings API, but do not provide enough schema detail to safely update per-route SEO records programmatically.
- Do not use private or guessed Base44 endpoints.
- Do not publish or edit live SEO settings without explicit approval.

## Files to inspect

- `src/lib/rallyhubShare.js`
- `src/components/public/Seo.jsx`
- `scripts/generateSeoSitemap.mjs`
- `scripts/prerenderSeoPages.mjs`
- `scripts/exportSeoMetaTags.mjs`
- `scripts/verifyRallyHubSharing.mjs`
- `reports/seo/rallyhub-seo-master.json`
- `reports/seo/rallyhub-seo-master.csv`
- `reports/seo/seo-verification-results.json`
- `docs/seo/SEO_INTEGRATION_ARCHITECTURE.md`
- `docs/seo/SEO_API_REFERENCE.md`
- `docs/seo/SEO_OPERATIONS_RUNBOOK.md`
- `docs/seo/SEO_TEST_EVIDENCE.md`
- `docs/seo/SEO_KNOWN_LIMITATIONS.md`
- `docs/seo/SEO_CHANGE_LOG.md`

## The nine acceptance URLs

1. https://rallyhub.ie/
2. https://rallyhub.ie/directory
3. https://rallyhub.ie/directory/help
4. https://rallyhub.ie/directory/quick-start
5. https://rallyhub.ie/directory/story
6. https://rallyhub.ie/directory/add
7. https://rallyhub.ie/about
8. https://rallyhub.ie/contact
9. https://rallyhub.ie/events

## What future ChatGPT may safely do after approval

1. Read repository files and docs.
2. Update source files if the requested change is repository-only and approved.
3. Generate dry-run exports and reports.
4. Run baseline live fetches as read-only evidence.
5. Prepare a proposed SEO payload once Base44 documents the API schema.

## What future ChatGPT must not do without explicit approval

- Publish/deploy.
- Change Base44 Marketing SEO settings.
- Change DNS or Search Console.
- Change secrets.
- Mutate tenant data.
- Replace artwork/branding assets.
- Use unsupported private Base44 APIs.
- Claim 9/9 live success before a live post-publication crawler test passes.

## Exact blocker from this task

No documented/authorised Base44 platform SEO write capability with complete per-route payload schema was available. The implementation stopped rather than guessing.

## Next safe action

Ask Base44/support or consult updated Base44 docs for the exact Update SEO settings API request schema and auth model. If complete docs are provided, implement a dry-run-first `seo-sync` tool with approval gate, audit log and rollback snapshot. If not, continue using Dashboard SEO manually and repository prerendering for code-published HTML.