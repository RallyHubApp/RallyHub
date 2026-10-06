/**
 * RallyHub Communications Engine — Phase 1 pure policy core.
 * ADDITIVE ONLY: no module caller imports this until its adapter phase is approved.
 */
export const COMM_CHANNELS = Object.freeze(["email","whatsapp","in_app","push","sms","player_link"]);
export const COMM_KINDS = Object.freeze(["operational","transactional","campaign","poll","feedback","survey","rsvp","emergency"]);

export function assertScope(input = {}) {
  const { owner_scope, tenant_id } = input;
  if (!["platform","tenant"].includes(owner_scope)) throw new Error("COMM_SCOPE_INVALID");
  if (owner_scope === "tenant" && !tenant_id) throw new Error("COMM_TENANT_REQUIRED");
  return true;
}

export function recipientDedupeKey({ person_id, email, mobile, channel }) {
  const endpoint = channel === "email" ? String(email||"").trim().toLowerCase()
    : ["whatsapp","sms"].includes(channel) ? String(mobile||"").replace(/\s+/g,"")
    : String(person_id||"").trim();
  if (!endpoint) throw new Error("COMM_RECIPIENT_ENDPOINT_REQUIRED");
  return [channel, endpoint].join(":");
}

export function deliveryIdempotencyKey({ campaign_id, message_id, recipient_key, channel }) {
  if (![campaign_id,message_id,recipient_key,channel].every(Boolean)) throw new Error("COMM_IDEMPOTENCY_INPUT_REQUIRED");
  return [campaign_id,message_id,recipient_key,channel].join("|");
}

export function classifyConsent({ kind, channel, consent_status, suppressed=false }) {
  if (suppressed) return { eligible:false, reason:"suppressed" };
  if (!COMM_CHANNELS.includes(channel)) return { eligible:false, reason:"unsupported_channel" };
  const marketingLike = kind === "campaign";
  if (marketingLike && consent_status !== "accepted") return { eligible:false, reason:"marketing_permission_required" };
  return { eligible:true, reason:"eligible" };
}

export function canBypassQuietHours({ kind, priority }) {
  return kind === "emergency" || priority === "emergency";
}

export function validateDualEmail({ html_body, plain_text_body }) {
  const errors=[];
  if (!String(html_body||"").trim()) errors.push("html_required");
  if (!String(plain_text_body||"").trim()) errors.push("plain_text_required");
  return { ok: errors.length===0, errors };
}

export function campaignSendReadiness({ campaign, message, recipients=[] }) {
  const issues=[];
  try { assertScope(campaign); } catch(e) { issues.push(e.message); }
  if (!campaign?.purpose) issues.push("purpose_required");
  if (!campaign?.created_by_user_id) issues.push("creator_required");
  if (!message?.channel) issues.push("channel_required");
  if (message?.channel === "email") {
    const dual=validateDualEmail(message);
    issues.push(...dual.errors);
  }
  const eligible=recipients.filter(r=>r.eligibility_status==="eligible");
  if (!eligible.length) issues.push("no_eligible_recipients");
  return { ready:issues.length===0, issues, eligible_count:eligible.length, suppressed_count:recipients.length-eligible.length };
}

export function evaluateWorkflowStep({ goalAchieved=false, expired=false, consentWithdrawn=false, suppressed=false, condition=true }) {
  if (goalAchieved) return { action:"exit", reason:"goal_achieved" };
  if (expired) return { action:"exit", reason:"workflow_expired" };
  if (consentWithdrawn) return { action:"exit", reason:"consent_withdrawn" };
  if (suppressed) return { action:"exit", reason:"suppressed" };
  return condition ? { action:"continue", reason:"condition_met" } : { action:"branch", reason:"condition_not_met" };
}

export function validatePoll(poll={}) {
  const errors=[];
  if (!["poll","feedback","suggestion","survey","rsvp","availability"].includes(poll.poll_type)) errors.push("poll_type_invalid");
  if (!poll.title?.trim()) errors.push("title_required");
  if (!Array.isArray(poll.questions) || poll.questions.length===0) errors.push("question_required");
  const ids=(poll.questions||[]).map(q=>q.id).filter(Boolean);
  if (new Set(ids).size !== ids.length) errors.push("duplicate_question_id");
  return {ok:errors.length===0,errors};
}
