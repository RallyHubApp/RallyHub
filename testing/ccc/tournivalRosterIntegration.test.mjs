import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/tournivalHostAccess/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/pages/PublicTournivalHost.jsx',import.meta.url),'utf8');
test('delegated save rejects missing players before CAS mutation',()=>{const save=backend.indexOf("if(action!=='save')");const guard=backend.indexOf('TOURNIVAL_ROSTER_INCOMPLETE',save);const cas=backend.indexOf('TournivalSession.updateMany(',save);assert.ok(save>0&&guard>save&&cas>guard);});
test('host controls and save callback are disabled for incomplete roster',()=>{assert.match(ui,/hostWriteBlocked=Boolean\(snapshot\?\.health\?\.requiresReconciliation\|\|snapshot\?\.missingPlayerIds\?\.length\)/);assert.match(ui,/snapshotRef\.current\?\.missingPlayerIds\?\.length/);assert.match(ui,/isAdmin=\{!busy&&!hostWriteBlocked\}/);});
