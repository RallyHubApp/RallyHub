import assert from "node:assert/strict";
import fs from "node:fs";
const tpl=fs.readFileSync("base44/functions/interclubResultsEmail/resultsEmailTemplate.ts","utf8");
assert.match(tpl,/white-space:nowrap/);
assert.match(tpl,/font-size:25px/);
assert.match(tpl,/headerTitleLines/);
assert.match(tpl,/font-size:23px!important/);
console.log("PASS interclubGmailHeaderGate: intended title lines are nowrap with Gmail-safe sizing");
