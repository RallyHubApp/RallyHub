// Communications Centre canonical presentation standards.
// These records capture proven production renderers. They deliberately do not
// reimplement their HTML: source modules remain authoritative until a
// regression-matched shared renderer replaces them safely.
export const COMMUNICATION_PRESENTATION_STANDARDS=Object.freeze({
  rallyhub_platform:Object.freeze({
    id:"rallyhub_platform",
    label:"RallyHub Platform",
    ownerScope:"platform",
    status:"production-proven",
    canonicalSource:"base44/functions/directoryClaim/entry.ts",
    canonicalRenderer:"rallyHubEmailShell",
    rules:Object.freeze([
      "Email-safe table layout and inline styling",
      "RallyHub logo and brand colours come from the proven platform shell",
      "Purpose-specific title and body; do not force the strapline into every communication",
      "Signature, utility links and footer are presentation components, not editable body content",
      "Mobile behaviour must match the proven production output before migration"
    ])
  }),
  clare_basic:Object.freeze({
    id:"clare_basic",
    label:"Clare Pickleball Basic",
    ownerScope:"tenant",
    status:"production-proven",
    canonicalSource:"base44/functions/kotcResultsShare/entry.ts",
    canonicalRenderer:"basicBrandedEmailBodies",
    rules:Object.freeze([
      "Use the active Clare brand kit for logo, colours, typography and spacing",
      "Keep purpose content independent from the brand shell",
      "Preserve email-safe responsive behaviour",
      "Do not reconstruct approved assets in CSS"
    ])
  }),
  clare_enriched:Object.freeze({
    id:"clare_enriched",
    label:"Clare Pickleball Enriched",
    ownerScope:"tenant",
    status:"protected-production",
    canonicalSource:"base44/functions/interclubResultsEmail/resultsEmailTemplate.ts",
    referenceSource:"base44/functions/kotcResultsShare/entry.ts",
    canonicalRenderer:"protected Clare enriched shell",
    rules:Object.freeze([
      "Approved Clare logo on the left, dynamic purpose title in the centre and approved artwork on the right",
      "Use approved image assets exactly; do not redraw or approximate them with CSS",
      "Use the approved sliced clickable footer and utility links",
      "Header, footer and visual shell are protected; purpose body and approved CTA destinations are editable",
      "Personalisation must use recipient merge data, never literal sample names",
      "Mobile and desktop output must regression-match the approved shell"
    ])
  })
});

export function presentationStandardFor({scope="tenant",presentation="basic",brand=""}={}){
  if(scope==="platform"||brand==="RallyHub")return COMMUNICATION_PRESENTATION_STANDARDS.rallyhub_platform;
  return presentation==="designed"||presentation==="enriched"
    ? COMMUNICATION_PRESENTATION_STANDARDS.clare_enriched
    : COMMUNICATION_PRESENTATION_STANDARDS.clare_basic;
}

export const COMMUNICATIONS_CENTRE_RENDERING_PRINCIPLES=Object.freeze([
  "Communications Centre owns presentation standards; source modules own recipient/event data and delivery until safely migrated.",
  "Brand shell, purpose content, signature/footer and delivery/personalisation are separate concerns.",
  "Reuse a production-proven renderer before creating a new renderer.",
  "Never replace a proven email-safe table implementation with a visual CSS approximation.",
  "A renderer migration requires desktop/mobile preview comparison, test-send comparison and personalisation regression checks.",
  "Existing production senders stay intact until the Communications Centre output is proven equivalent."
]);
