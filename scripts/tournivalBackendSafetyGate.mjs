/**
 * Preflight guard for a REAL Base44 Tournival integration test.
 * Deliberately has no network/data writes. Refuses the production app.
 * The CLI must be separately authenticated and the isolated app provisioned.
 */
import assert from 'node:assert/strict';
const PRODUCTION_APP = '6a01dc00702b7dd2a2978c28';
export function validateIsolatedBase44Target({
  appId,productionAppId=PRODUCTION_APP,dataEnv,approvedIsolation
}) {
  if (!/^[a-f0-9]{24}$/i.test(String(appId||''))) throw Error('A valid isolated Base44 app ID is required');
  if (appId===productionAppId) throw Error('Refusing production RallyHub application');
  if (dataEnv!=='dev') throw Error('Remote acceptance tests require the isolated dev data environment');
  if (approvedIsolation!=='true') throw Error('Explicit isolation marker must be set after verifying the app has no production tenant records');
  return {isolated:true,appId,dataEnv};
}
if (process.argv[1]?.endsWith('tournivalBackendSafetyGate.mjs')) {
  const {strictEqual,throws}=assert;
  throws(()=>validateIsolatedBase44Target({appId:PRODUCTION_APP,dataEnv:'dev',approvedIsolation:'true'}),/production/);
  throws(()=>validateIsolatedBase44Target({appId:'aaaaaaaaaaaaaaaaaaaaaaaa',dataEnv:'prod',approvedIsolation:'true'}),/dev/);
  throws(()=>validateIsolatedBase44Target({appId:'aaaaaaaaaaaaaaaaaaaaaaaa',dataEnv:'dev'}),/isolation/);
  strictEqual(validateIsolatedBase44Target({
    appId:'aaaaaaaaaaaaaaaaaaaaaaaa',dataEnv:'dev',approvedIsolation:'true'
  }).isolated,true);
  if(process.env.TOURNIVAL_BACKEND_TARGET_CHECK==='1'){
    validateIsolatedBase44Target({
      appId:process.env.TOURNIVAL_TEST_APP_ID,
      dataEnv:process.env.TOURNIVAL_TEST_DATA_ENV,
      approvedIsolation:process.env.TOURNIVAL_TEST_ISOLATED
    });
  }
  console.log('Tournival remote backend safety preflight PASS; no records touched.');
}

// SumUp callback must be set on Tournival hosted checkout, as on guest booking.
