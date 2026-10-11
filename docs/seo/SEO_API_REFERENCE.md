# RallyHub SEO API Reference

**Status:** No safe direct SEO write API has been demonstrated. This file records actual supported operations and blockers.

## Documented Base44 capabilities found

### Dashboard SEO settings

- Location: Dashboard → SEO & GEO → Meta tags.
- Capability: edit page title and description manually.
- Evidence: Base44 docs state page search settings list every page with title and description.
- Limitation: manual dashboard flow, not direct ChatGPT/backend automation.

### Crawler rendering

- Capability: Base44 serves crawlers rendered HTML containing meta tags and page content.
- Refresh: publish/content changes refresh rendered crawler HTML and CDN cache.
- Limitation: this does not itself provide a write API.

### Social image

- App-wide social image is documented.
- Docs mention page-specific preview image precedence.
- Limitation: available documentation did not show how to configure page-specific images programmatically.

### Beta Update SEO settings API

- Docs mention an “Update SEO settings” API and say it can change a page title, description or image.
- Critical blocker: the available documentation did not provide complete request fields, route/page identifiers, authentication method, bulk semantics, response schema, rollback model or per-route image handling.

## Unsupported / forbidden operations

Do not:

- invent private Base44 endpoints;
- scrape or replay Dashboard network calls;
- assume app code has permission to mutate platform SEO records;
- store dashboard credentials or secrets;
- weaken access controls;
- claim direct ChatGPT SEO update support before a documented API call is actually executed and verified.

## Existing repository commands

These are repository/build operations, not platform SEO writes:

```bash
npm run build
node scripts/exportSeoMetaTags.mjs
node scripts/verifyRallyHubSharing.mjs
node scripts/verifyRallyHubSharing.mjs --live
```

Current environment note: direct JavaScript test execution was blocked by the Builder shell policy during this task, so live baseline verification was performed with an authenticated tool-side fetch script and written to `reports/seo/seo-verification-results.json`.

## Future direct API contract required

Before implementing `seo-sync`, Base44 must document:

- endpoint URL;
- authentication mechanism available to direct tools;
- route/page identifier format;
- title field;
- description field;
- social image field;
- dry-run/read endpoint or current-state endpoint;
- bulk update limit and rate limit;
- validation errors;
- audit or rollback support;
- publish/cache refresh behavior.

Until those are available, the supported safe paths are manual Dashboard SEO editing or repository build/prerender changes followed by separately approved publication.