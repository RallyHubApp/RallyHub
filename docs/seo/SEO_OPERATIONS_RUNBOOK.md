# RallyHub SEO Operations Runbook

## Authorisation boundary

Do not publish, deploy, edit Base44 Marketing SEO settings, change DNS, change Search Console, change secrets or mutate tenant data without explicit user approval.

## Read-only inspection

1. Inspect approved fixed-page copy:

```bash
cat src/lib/rallyhubShare.js
```

2. Inspect build/prerender scripts:

```bash
cat scripts/generateSeoSitemap.mjs
cat scripts/prerenderSeoPages.mjs
cat scripts/exportSeoMetaTags.mjs
cat scripts/verifyRallyHubSharing.mjs
```

3. Inspect exported inventory:

```bash
cat reports/seo/rallyhub-seo-master.json
cat reports/seo/rallyhub-seo-master.csv
cat reports/seo/seo-verification-results.json
```

## Build-time inventory flow

After approval for build-only verification:

```bash
npm run build
node scripts/exportSeoMetaTags.mjs
```

Expected export files:

- `reports/seo/rallyhub-seo-master.csv`
- `reports/seo/rallyhub-seo-master.json`

## Live baseline verification

Live verification is read-only but must be labelled baseline unless publication/SEO changes were approved and completed.

Required user agents:

- Googlebot: `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)`
- Facebook/WhatsApp: `facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)`

Required URLs:

1. https://rallyhub.ie/
2. https://rallyhub.ie/directory
3. https://rallyhub.ie/directory/help
4. https://rallyhub.ie/directory/quick-start
5. https://rallyhub.ie/directory/story
6. https://rallyhub.ie/directory/add
7. https://rallyhub.ie/about
8. https://rallyhub.ie/contact
9. https://rallyhub.ie/events

Compare title, description, canonical, Open Graph, Twitter/X tags, robots/indexing, HTTP status and absence of legacy branding.

## Rollback

No live SEO update was performed in this task, so there is no production rollback required.

If future repository SEO files are changed before publication, rollback is ordinary source control restore to the pre-task checkpoint.

If future Base44 Marketing SEO settings are changed manually, create a before/after export or screenshot record before saving so each route can be restored manually.

## Publication gate

A build pass is not live proof. Acceptance requires:

1. approved implementation;
2. approved publish/deploy;
3. live crawler fetch after cache refresh;
4. 9/9 acceptance URLs passing with both required user agents.