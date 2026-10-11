# RallyHub SEO Test Evidence

## Test date

2026-10-11 UTC

## Test type

Live baseline only. No production change, no publication and no SEO dashboard/API update was performed.

## Evidence file

`reports/seo/seo-verification-results.json`

## Live baseline summary

- Acceptance URLs: 9
- User-agent rows: 18
- Passing user-agent rows: 0
- Failing user-agent rows: 18
- URLs passing both Googlebot and Facebook/WhatsApp checks: 0

## Key observations

1. All nine URLs returned HTTP 200 for both crawler user agents.
2. Canonicals were present and matched the tested URLs.
3. Indexing was allowed on all tested URLs.
4. Open Graph and Twitter values often matched `src/lib/rallyhubShare.js` for non-home pages.
5. HTML `<title>` and `<meta name="description">` often used separate search-oriented values, so strict expected-versus-actual failed.
6. The home page still returned legacy `og:site_name` as `RallyHub | Pickleball & Padel Management Platform` and default Base44/media image values.
7. Legacy branding text was still present in live HTML for the tested pages, so the legacy-branding absence check failed.

## Sitemap evidence

Live sitemap checks recorded in `reports/seo/seo-verification-results.json`:

- `https://rallyhub.ie/sitemap.xml`: HTTP 200, 28 URLs.
- `https://rallyhub.ie/directory-sitemap.xml`: HTTP 200, 273 URLs.

The existing exported build inventory had 272 HTML entries. The extra URL in the live directory sitemap is `/directory/player-updates`, which is included in `directory-sitemap.xml` but was not present in the 272-entry HTML export inventory.

## Event and tournament coverage

This task did not prove full dynamic event or tournament coverage.

Evidence from inspected scripts:

- `scripts/generateSeoSitemap.mjs` includes `/events` but does not enumerate individual event detail URLs.
- `scripts/prerenderSeoPages.mjs` injects `/events` but does not prerender individual event detail or tournament pages.
- The 272-entry report is dominated by fixed pages, county pages, directory club pages and venue pages.

Do not claim full event/tournament dynamic SEO coverage until actual event/tournament record routes are enumerated, prerendered and live-tested.

## Test limitation

The available Builder shell blocked direct JavaScript command execution for repository test scripts during this task. The live baseline was generated using a tool-side fetch script and saved as JSON evidence.