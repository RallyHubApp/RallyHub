import { directoryServiceOnlyRls, directoryAccessRls } from './directoryRlsPolicy.ts';

/** Pure migration plan. Does not call Base44 APIs or mutate input objects. */
export function planDirectorySchemaRls(schema: any) {
  if (!schema?.name?.startsWith('Directory') || !schema?.rls) throw new Error('Directory entity RLS required');
  return {
    ...structuredClone(schema),
    rls: schema.name === 'DirectoryListingAccess' ? directoryAccessRls() : directoryServiceOnlyRls(),
  };
}
