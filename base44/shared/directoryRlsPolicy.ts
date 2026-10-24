/** Base44 direct-entity access policy for separately governed Directory records.
 * Privileged Directory operations use authenticated service-role backend functions,
 * which independently check the two immutable allowed user IDs.
 * Direct SDK access is denied by default, without embedding static identities in RLS.
 */
export function directoryServiceOnlyRls() {
  return {create:false, read:false, update:false, delete:false};
}

/** A listing owner/editor may read only their own access grants via the SDK. */
export function directoryAccessRls() {
  return {
    create:false,
    read:{ 'data.user_id':'{{user.id}}' },
    update:false,
    delete:false,
  };
}
