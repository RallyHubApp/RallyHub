# RallyHub SEO Integration Architecture

**Date:** 2026-10-11  
**Production domain:** https://rallyhub.ie  
**Base44 app:** `6a01dc00702b7dd2a2978c28`  
**Status:** Architecture documented, live write integration **blocked** by missing documented per-route SEO API schema. No deployment or production SEO update performed.

## Objective

Create a centrally managed SEO and social-sharing system that future authorised direct ChatGPT/backend tools can maintain without repeated Builder use.

## Existing source-of-truth components

| Area | Current file | Role |
|---|---|---|
| Nine approved sharing records | `src/lib/rallyhubShare.js` | Approved social title and description for the nine acceptance routes. |
| Runtime SPA meta update | `src/components/public/Seo.jsx` | Updates browser-side meta tags after React loads. Useful for users, not sufficient by itself for crawlers. |
| Build-time sitemap | `scripts/generateSeoSitemap.mjs` | Generates `public/directory-sitemap.xml` from public directory records. |
| Build-time prerender | `scripts/prerenderSeoPages.mjs` | Injects crawler-readable HTML metadata into built `dist/**/index.html`. |
| Build metadata export | `scripts/exportSeoMetaTags.mjs` | Exports `reports/seo/rallyhub-seo-master.csv` and `.json`. |
| Live baseline verification | `reports/seo/seo-verification-results.json` | Saved live crawler baseline for nine required URLs. |

## Current architecture

1. `src/lib/rallyhubShare.js` defines the approved social sharing copy for fixed public pages.
2. Page components use `Seo.jsx` for browser-side metadata.
3. `npm run build` runs:
   - `node scripts/generateSeoSitemap.mjs`
   - `vite build`
   - `node scripts/prerenderSeoPages.mjs`
4. `prerenderSeoPages.mjs` injects crawler-readable HTML into built files, including public directory, county, club and venue pages.
5. `scripts/exportSeoMetaTags.mjs` exports the built metadata inventory.
6. Live crawler output is controlled by published/cached Base44 HTML plus Base44 Marketing SEO settings. It is not changed until publish/dashboard/API action.

## Platform capability audit result

Base44 documentation confirms:

- per-page SEO titles and descriptions can be edited in Dashboard → SEO & GEO → Meta tags;
- Base44 serves crawlers rendered pages and refreshes this after publish/content changes;
- republishing updates Base44/Cloudflare cache;
- a beta “Update SEO settings” API exists in documentation;
- the available docs do **not** provide a reliable request schema for per-route SEO records, route addressing, authentication requirements, rollback or bulk update semantics.

Therefore a safe direct ChatGPT/API bulk SEO writer could not be implemented in this attempt.

## Supported architecture once API is documented

When Base44 provides complete, documented SEO API fields and auth requirements, implement:

1. `seo-source` manifest generated from `src/lib/rallyhubShare.js` plus record-driven public pages.
2. `seo-preview` dry-run that reports route, current value, proposed value, validation status and image.
3. `seo-sync` gated update path requiring explicit production approval.
4. Audit log per change containing route, old values, new values, actor, timestamp and rollback token/snapshot.
5. Rollback command that restores the previous snapshot.
6. Live verification command that reruns Googlebot and Facebook/WhatsApp user-agent checks.

## Stop condition reached

No documented authorised per-route SEO write payload was available. Private/undocumented endpoints were not used. No app code was changed to fake platform SEO success. No publish or live SEO record update was performed.