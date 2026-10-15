# RallyHub social-first Directory logo discovery — revised 15 October 2026

## Audit finding

The September discovery script used **official website first**; Facebook and Instagram were attempted only if no website image existed or the website candidate was LOW confidence. It only attempted the social platforms if the Directory record already had a social URL. Facebook relied on `graph.facebook.com/<id>/picture` and Instagram on accessible `og:image` metadata. Login-gated content, missing URLs and blocked pages were silently treated as no candidate. Thus a manually discoverable logo could be missed. The original downloader also reused the same filename across sources, risking image overwrites. None of these limitations should be reported as “no logo exists”.

## Mandatory search order for future RallyHub logo discovery

1. Search **Facebook first**: recorded club Facebook page, plus indexed discovery by exact name, location/county and pickleball; review the official club page/profile mark, relevant posts, and official club/group identity. Record the actual page URL and the candidate image source separately. If inaccessible to automation, retain the lead for visual/manual review; never mark “no logo exists”.
2. Search **Instagram second**: recorded profile plus indexed search by exact club name, handle and county; review profile image and posts where publicly available. Flag stories and expiring image URLs for follow-up. Preserve source attribution.
3. Then search the **official website** and its `og:image`, header and logo resources as an independent confirmation or fallback. Do not let a generic website hero image suppress a better social logo.
4. Search across *all* missing-logo clubs, including those with no recorded Facebook or Instagram fields. Use a freshly generated current Directory audit for live runs; the old September audit is a historical baseline, not the complete current queue.
5. Do not confuse venue/operator, leisure centre, tennis club, governing body, event poster, or another club with the club's own identity. Facebook Graph photos and Instagram OG images are **HOLD until independently verified**, not automatic APPROVE. Identity evidence, image suitability, hash, duplicates and source URL must all pass.
6. Preserve existing approved 30-person review work. Do not reset existing review selections or overwrite September candidate files. Candidate stage is repository-only; live storage and publication require their own verified steps and applicable approval.


## Mandatory existing-logo skip (all upload origins)

Before any Facebook, Instagram or website search, reconcile every candidate against the current Directory state. If a listing already has a `logoUrl` / `logo_url` / effective logo (club-owner upload, Super Admin upload, prior RallyHub batch import, or any other origin), **SKIP** without replacing it or staging a duplicate. Also skip a stored seed logo hidden by a null profile override; report that separately for a safe display-fallback repair. A broken existing logo goes to a repair queue, **not** to the new-logo discovery/import path. The dated research manifest records each skipped slug and reason.

Do not use archived audit data for production decisions: provide a freshly reconciled current audit, and re-check actual Directory state again before any later staging/publication operation. Existing logos and their owners retain priority over auto-discovery.

## Execution and limits

`RALLYHUB_LOGO_AUDIT_PATH=docs/directory-branding/<fresh-audit>.json RALLYHUB_LOGO_BATCH_DATE=YYYY-MM-DD node scripts/sourceDirectoryLogoCandidates.mjs`

The script now searches social leads before the website and saves each source's image separately in a date-specific batch, plus a new dated research manifest. Searches can still be blocked or return incomplete results; the structured leads and source-specific outcomes must be followed by independent research. A successful automated pass is not proof of complete Facebook/Instagram coverage. Never silently treat login blocks as confirmed absence. Do not execute against the September audit and call it a current full-Directory sweep.
