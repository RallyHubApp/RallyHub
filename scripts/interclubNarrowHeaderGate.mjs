import assert from "node:assert/strict";
import fs from "node:fs";
const tpl=fs.readFileSync("base44/functions/interclubResultsEmail/resultsEmailTemplate.ts","utf8");
assert.match(tpl,/width="19%"/);
assert.match(tpl,/width="56%"/);
assert.match(tpl,/font-size:18px!important/);
assert.match(tpl,/white-space:nowrap/);
console.log("PASS interclubNarrowHeaderGate: narrow-width header geometry prevents title/image collision");
