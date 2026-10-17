import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
for(const [source,copy] of [
 ['base44/functions/legacyTournamentManager/tournivalStateValidation.ts','base44/functions/tournivalHostAccess/tournivalStateValidation.ts'],
 ['base44/functions/guestSessionBooking/payments.ts','base44/functions/tournivalRegistration/payments.ts']
])assert.equal(read(copy),read(source),'Bundled function dependency out of sync: '+copy);
assert.match(read('base44/functions/tournivalHostAccess/entry.ts'),/from '\.\/tournivalStateValidation\.ts'/);
assert.match(read('base44/functions/tournivalRegistration/entry.ts'),/from '\.\/payments\.ts'/);
console.log('Tournival function bundle gate PASS: direct Base44 deployments have local dependencies.');
