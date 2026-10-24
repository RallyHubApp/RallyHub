/** Directory Command Centre access is separate from general platform admin access.
 * Grant only to two independently verified immutable Base44 User IDs.
 * Authentication comes from the Base44 SDK, never from client-supplied IDs.
 */
export function isDirectorySuperAdmin(user: any, firstId: unknown, secondId: unknown): boolean {
  if (!user || user.role !== 'admin') return false;
  const valid = (id: unknown) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
  if (!valid(firstId) || !valid(secondId) || firstId === secondId) return false;
  return user.id === firstId || user.id === secondId;
}

// Verified read-only against Base44 User records on 24 October 2026.
// These are public identifiers, not authentication secrets. Never trust a client-supplied ID.
export const DIRECTORY_SUPERADMIN_USER_IDS = Object.freeze([
  '6a0b5afd3f4b9681265a1398', // Brian Moore
  '6a01dc00702b7dd2a2978c29', // Conall Moore
]);

export function authorisedDirectorySuperAdmin(user: any): boolean {
  return isDirectorySuperAdmin(user, DIRECTORY_SUPERADMIN_USER_IDS[0], DIRECTORY_SUPERADMIN_USER_IDS[1]);
}
