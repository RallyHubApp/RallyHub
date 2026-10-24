/** Build a two-account direct entity security condition (Base44 simple-equality RLS). */
export function directorySuperAdminRls(firstId: string, secondId: string) {
  const valid = (id: unknown) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
  if (!valid(firstId) || !valid(secondId) || firstId === secondId) throw new Error('Two distinct verified immutable IDs required');
  return {
    $and: [
      { user_condition: { role: 'admin' } },
      { $or: [
        { user_condition: { id: firstId } },
        { user_condition: { id: secondId } },
      ] },
    ],
  };
}

/** Permit record owners only to read their individual access row, not Directory administration. */
export function directoryAccessReadRls(firstId: string, secondId: string) {
  return { $or: [
    { 'data.user_id': '{{user.id}}' },
    directorySuperAdminRls(firstId, secondId),
  ] };
}
