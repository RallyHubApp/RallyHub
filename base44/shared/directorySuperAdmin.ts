/** Directory Command Centre access is separate from general platform admin access.
 * Configure only immutable, independently verified Base44 User IDs in backend secrets.
 * Missing, duplicated or malformed configuration DENIES access; names/emails never authorise.
 */
export function isDirectorySuperAdmin(user: any, firstId: unknown, secondId: unknown): boolean {
  if (!user || user.role !== 'admin') return false;
  const valid = (id: unknown) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
  if (!valid(firstId) || !valid(secondId) || firstId === secondId) return false;
  return user.id === firstId || user.id === secondId;
}

export function authorisedDirectorySuperAdmin(user: any): boolean {
  return isDirectorySuperAdmin(
    user,
    Deno.env.get('RALLYHUB_DIRECTORY_SUPERADMIN_BRIAN_ID'),
    Deno.env.get('RALLYHUB_DIRECTORY_SUPERADMIN_CONAL_ID'),
  );
}
