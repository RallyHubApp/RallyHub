/** Explicit, auditable reference between two independently owned business domains.
 * This contract does not read, merge or overwrite profiles or consents.
 */
const ID = /^[a-zA-Z0-9_-]{4,128}$/;
const PURPOSES = new Set(['listing_club_reference','person_identity_reference']);
export function prepareDirectoryIdentityLink(input: any, approvedByUserId: string, timestamp: string) {
  if (!input || input.explicitlyApproved !== true) throw new Error('Explicit link approval required');
  const {directoryId,tenantId,purpose,provenance} = input;
  if (![directoryId,tenantId,approvedByUserId].every(v => typeof v === 'string' && ID.test(v))) throw new Error('Valid immutable domain and actor IDs required');
  if (!PURPOSES.has(purpose)) throw new Error('Unsupported identity-link purpose');
  if (typeof provenance !== 'string' || provenance.trim().length < 6 || provenance.length > 500) throw new Error('Link provenance required');
  if (typeof timestamp !== 'string' || !Number.isFinite(Date.parse(timestamp))) throw new Error('Valid approval timestamp required');
  return Object.freeze({directory_id:directoryId,tenant_id:tenantId,purpose,provenance:provenance.trim(),approved_by_user_id:approvedByUserId,approved_at:timestamp,status:'active'});
}
