import { directorySuperAdminRls } from './directoryRlsPolicy.ts';

/** Pure dry-run RLS migration. Never performs SDK or filesystem writes. */
export function planDirectorySchemaRls(schema: any, firstId: string, secondId: string) {
  if (!schema?.name?.startsWith('Directory') || !schema?.rls) throw new Error('Directory entity RLS required');
  const approved = directorySuperAdminRls(firstId, secondId);
  const replace = (value: any): any => {
    if (Array.isArray(value)) return value.map(replace);
    if (!value || typeof value !== 'object') return value;
    const keys = Object.keys(value);
    if (keys.length === 1 && value.user_condition?.role === 'admin' && Object.keys(value.user_condition).length === 1) {
      return structuredClone(approved);
    }
    return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,replace(child)]));
  };
  return { ...schema, rls: replace(schema.rls) };
}
