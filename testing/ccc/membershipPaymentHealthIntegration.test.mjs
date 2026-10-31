import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/membershipRecord/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/pages/MembershipConsole.jsx',import.meta.url),'utf8');
const block=backend.slice(backend.indexOf("if(action==='admin_payment_health')"),backend.indexOf("if(action==='admin_verify_membership_payment')"));
test('admin payment review reads complete scoped ledger and returns advisory only',()=>{assert.match(block,/readScopedMembershipLedger/);assert.match(block,/assessMembershipPaymentHealth/);assert.doesNotMatch(block,/\.update\(|\.create\(/);});
test('payment review fails closed on incomplete payment ledger',()=>{assert.match(block,/MEMBERSHIP_PAYMENT_HISTORY_INCOMPLETE/);assert.match(block,/status:503/);});
test('membership payments tab exposes review action and issues',()=>{assert.match(ui,/action: 'admin_payment_health'/);assert.match(ui,/Review payment integrity/);assert.match(ui,/paymentHealth\.issues/);});
