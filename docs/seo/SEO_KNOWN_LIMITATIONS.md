# RallyHub SEO Known Limitations

## Platform API blocker

Base44 documentation available during this task did not provide a complete, reliable per-route SEO update API schema. A beta Update SEO settings API is mentioned, but the exact request payload and route addressing are not documented in the available result.

Impact: direct ChatGPT/backend SEO writes cannot be safely implemented yet.

## Live metadata mismatch

The nine required live URLs currently fail strict acceptance because live `<title>` and `<meta name="description">` do not match `src/lib/rallyhubShare.js`, and legacy branding remains present in live HTML.

## Dashboard/manual SEO settings

Manual Dashboard SEO edits can affect crawler HTML, as previously observed for Directory Help, but this is not a maintainable direct ChatGPT/backend flow.

## React-only SEO is insufficient

`Seo.jsx` updates metadata after React loads. Crawlers and social unfurlers need the initial HTTP HTML to contain the correct tags. Do not claim success from React/browser tags alone.

## Build/prerender is not live proof

`npm run build` plus prerender can produce correct local `dist` HTML, but the live site only changes after approved publication and cache refresh.

## Dynamic coverage gap

Current build scripts cover:

- fixed public pages;
- public directory index;
- county pages;
- directory club pages;
- venue pages.

Current build scripts do not prove coverage for:

- individual public event detail pages;
- individual tournament pages;
- future dynamic records not enumerated into the build.

## Sitemap discrepancy

Live `directory-sitemap.xml` has 273 URLs. `reports/seo/rallyhub-seo-master.json` has 272 HTML entries. The discrepancy is `/directory/player-updates`, present in the sitemap but absent from the exported HTML inventory.

## Existing backend bundle issue observed

While saving the baseline report with a tool-side filesystem write, the platform reported an unrelated existing bundle issue in `functions/eventSubscriptions` importing `../eventInterest/emailRouter.ts`. This task did not modify backend functions and did not fix that unrelated issue.