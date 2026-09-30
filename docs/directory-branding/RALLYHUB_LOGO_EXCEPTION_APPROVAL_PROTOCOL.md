# RallyHub Directory Logo Exception-Approval Protocol

**Status:** Active operating protocol  
**Effective:** 30 September 2026  
**Applies to:** Directory logo discovery, staging, review, import and replacement batches.

## 1. Operating principle

RallyHub uses **exception approval**, not individual approval, for bulk club-logo work.

A candidate that passes all automatic source and asset checks is marked **APPROVE** by default. The reviewer does not need to approve every row individually. The reviewer only identifies exceptions by changing a row to:

- **REJECT** — the proposed logo is wrong and must not be imported;
- **HOLD** — the logo may be usable but needs further research or visual confirmation before import.

Anything left as **APPROVE** is included in the next controlled import batch.

## 2. Automatic APPROVE requirements

A logo may be defaulted to APPROVE only when all of the following are true:

1. The source is reasonably attributable to the exact club, normally the club's official website or official social-media profile.
2. The image is a logo/profile mark rather than a poster, event photograph, venue photograph or unrelated image.
3. The image file downloads successfully and is a valid non-empty image asset.
4. It is not a known social-network placeholder/default avatar.
5. Its file hash is not duplicated across another proposed club logo unless there is a documented reason.
6. The club-to-logo mapping is unambiguous enough for normal Directory use.
7. A source page and/or source image URL is retained in the audit evidence.
8. The original source file is staged before any live Directory record is changed.

## 3. Automatic HOLD conditions

The system must mark HOLD without requiring reviewer intervention when any of the following occurs:

- no reliable candidate can be found;
- Facebook/Instagram returns a generic/default profile image;
- the candidate appears to be a venue, leisure-centre, parent-company or governing-body logo rather than the club's own logo;
- a website candidate is ambiguous;
- the image is very small, badly cropped, poster-like or otherwise unsuitable;
- two clubs resolve to the same unexplained image hash;
- the source is third-party and cannot be independently matched to the club;
- the club identity itself is uncertain.

HOLD rows are never imported as part of the automatic batch.

## 4. Reviewer workflow

The review workbook and numbered visual review page use the same club numbers.

The reviewer scans the proposed APPROVE entries. No action is needed for a correct logo.

For exceptions, the reviewer reports the club number(s) or changes the Decision field:

- `REJECT` — exclude it and research again later;
- `HOLD` — exclude it from this import batch pending further checking.

The reviewer may also promote a HOLD candidate to APPROVE if they recognise it as the intended club branding.

## 5. Import manifest

Before import, RallyHub generates an immutable batch manifest containing only current APPROVE rows. Each entry records:

- review number;
- club slug and name;
- source page and source image;
- staged file path;
- file size;
- SHA-256 hash;
- confidence level;
- automatic QA result.

Any REJECT or HOLD change must regenerate the import manifest before records are updated.

## 6. Image preparation and distortion protection

The source image is never stretched to fit a fixed width and height independently.

For final RallyHub-owned assets:

- preserve the source aspect ratio;
- use a square presentation canvas only where needed;
- centre the artwork;
- use contain-style scaling rather than crop/stretch;
- keep transparent backgrounds when suitable;
- apply sensible internal padding;
- render Directory logos with `object-fit: contain` / equivalent;
- retain initials fallback when no approved logo exists.

A circular logo must remain circular, a shield must retain its proportions, and a wide wordmark must remain wide within the available canvas.

## 7. Controlled import

Approved logos are imported in a batch rather than manually through the asset uploader club-by-club.

The import process must:

1. use RallyHub-owned/local media as the final asset location;
2. avoid permanent Facebook/Instagram/CDN hot-links;
3. preserve existing good logos unless explicitly replacing them;
4. update only the intended club slug;
5. retain source/audit evidence;
6. continue past individual failures and record exceptions rather than aborting the entire batch.

## 8. Post-import QA

Before the batch is handed back as complete, RallyHub checks:

- every approved club has a resolvable final asset;
- no rejected/held club was changed;
- no duplicate or cross-club mapping error was introduced;
- no social-media hot-link remains as the final logo target;
- Directory cards render the logo without distortion;
- individual club profiles render correctly;
- mobile and desktop presentation is correct;
- fallback initials still work for clubs with no logo;
- persisted records survive refresh/reload;
- the intended production release is actually live after publication.

Testing follows the current RallyHub Master Testing Blueprint and Testing Control Pack. A batch is not called complete merely because the files were copied.

## 9. Completion report

The final report states exact counts, for example:

- listings reviewed;
- approved/imported;
- rejected;
- held;
- unresolved/no candidate;
- broken assets;
- duplicate mappings;
- production render failures.

The normal target is **zero broken assets, zero distorted renders and zero incorrect club-to-logo mappings** before user sign-off.
