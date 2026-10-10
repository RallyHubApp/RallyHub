# Artwork staging (not production)
Do not put preview composites or cropped approval sheets here as production masters.
Ingest individually named source files without transformation. Create an approval-lock JSON
with status approved only AFTER the actual files are visually signed off. Store each
file's SHA-256, width, height and transparent=true. Run:
`node scripts/verifyApprovedArtwork.mjs <approval-lock.json>`
A PASS verifies exact file bytes and PNG metadata, not design fidelity, alpha pixel
coverage, typography, print suitability, or browser rendering. Those require visual QA.
No site references may be switched before separate explicit deployment approval.
