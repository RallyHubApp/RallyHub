# RallyHub Directory Logo Batch — 15 October 2026

**Execution:** Facebook → Instagram → official website. Research and repository-only candidate capture; **no production changes or deployment**.

## Live Directory reconciliation

The current public `directoryListingProfile` response contains 47 states. Merging those with 84 seed entries by exact slug produces **104 distinct listings** (20 dynamic-only), of which **43 currently render a logo** and **61 have no effective logo**. The missing count includes **five imported seed logos hidden by `profile.logoUrl: null`**: Cobh, East Meath, Multyfarnham, Southside and Terenure. These five should be fixed through a controlled profile/seed fallback or explicitly approved profile update, not counted as new logo discovery. No existing logos were overwritten.

The 14 October visual queue says **31 imported**, **7 held** and **1 existing candidate not imported** (Lisburn). Five of those 31 imported entries are not actually visible due to the null-profile override. **Eyva's Invitational Series** has its approved logo in the existing dynamic profile, and no duplicate club record was created. Dublin 15 Pickleball was excluded after the live profile showed an existing logo, despite its seed logo being null.

## Today's ten missing-logo checks

| Club | Facebook result (priority 1) | Instagram result (priority 2) | Website result (priority 3) | Outcome |
|---|---|---|---|---|
| Moate Pickleball Club | [Official club page](https://www.facebook.com/p/Moate-Pickleball-Club-61570866419129/), distinctive circular logo | No independent account confirmed | Sports centre branding, not club | **Ready for artwork approval** |
| Bluestack Pickleball Club | [Official club page](https://www.facebook.com/p/Bluestack-Pickleball-100090729565053/), Bluestack wordmark/paddles | No independent account confirmed | No official site identified | **Ready for artwork approval** |
| PicklePub Club | [Official club page](https://www.facebook.com/share/1BhfxVQAhU/), distinct PicklePub crest | [picklepub.ireland](https://www.instagram.com/picklepub.ireland/) listed; direct profile content restricted | None | **Ready for artwork approval** |
| Lisburn Pickleball Club | [Official club page](https://www.facebook.com/LisburnPickleballClub/), Lisburn/Pickaholics emblem | [lisburnpickleballclub](https://www.instagram.com/lisburnpickleballclub/) indexed | [Club website](https://www.lisburnpickleball.club/); existing #21 candidate not imported | **Ready for artwork approval** |
| Coillte Pickleball Club | [Coillte Pickleballers](https://www.facebook.com/share/18YRb1HLuf/) page has a **team photograph**, not a logo | No independent account confirmed | None | **Hold — reject photo** |
| Castlerahan Pickleball Club | No identifiable club-specific account | None found | [Castlerahan Community](https://castlerahan.ie/pickleballbooking/) has bookings, not club logo | **Hold — parent branding** |
| Drogheda Pickleball | [Listed Facebook share](https://www.facebook.com/share/WLfRNxYQVFqnnNrD/) resolves to login-only | [droghedapickleball](https://www.instagram.com/droghedapickleball/) link in directory points to a story | None | **Hold — no verifiable logo** |
| Mostrim Pickleball | [Sports Hub Edgeworthstown](https://www.facebook.com/sportshubedgeworthstown) is parent facility; Mostrim Badminton posts mention pickleball | Parent Sports Hub Instagram | Community campus branding only | **Hold — parent branding** |
| Sports Lab Pickleball | [Sports Lab Portadown](https://www.facebook.com/sportslabportadown) is facility branding | None confirmed | Jones Jr Sports is parent business | **Hold — parent branding** |
| Achill Pickleball | No exact-name official club account found | None found | None | **Hold — no verifiable logo** |

Four official Facebook profile-logo images were visually checked and saved **only as repository review candidates** in `docs/directory-branding/candidates/2026-10-15/`, with SHA-256 readback. A Coillte group photograph is labelled as rejected evidence and **must never be used as a logo**. No new images were uploaded to permanent HTTPS storage because these four artworks have not been explicitly approved. The prior Lisburn review asset `21-lisburn-pickleball-club.png` actually contains WEBP bytes, which should be corrected if that candidate is ever selected.

## Release gate and next actions

1. Obtain explicit approval for the four club-specific social-media logos, then stage them in permanent HTTPS storage and verify downloaded checksums before a separate authorised Directory publish.
2. Correct the five null-profile overrides without replacing any approved artwork. The current public Directory merges `...club, ...profile`, so a null `profile.logoUrl` hides a valid seed `logoUrl`.
3. Continue social-first research across the **61 missing or hidden** logos, but distinguish actual missing artwork (56) from hidden existing logos (5). Never infer backlog completion from a ten-logo batch.
4. Do **not** change the daily automation to monthly until the full 104-listing reconciliation has every eligible logo present or a documented exclusion/hold.

**State:** Backlog incomplete. No production records changed. No site deployment.
