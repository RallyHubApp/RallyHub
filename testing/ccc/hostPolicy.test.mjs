import test from 'node:test';
import assert from 'node:assert/strict';
import {venueKey,venueHostMatches,isConfiguredHost} from '../../base44/functions/cccActivity/hostPolicy.mjs';
const venue={id:'venue-1',name:'Ennistymon',status:'active'};
const cfg={venue_key:'ennistymon',active:true,host_emails:['HOST@example.ie']};
test('legacy venue key maps exact canonical venue only',()=>{
 assert.equal(venueKey(' Ennis-tymon '),'ennistymon');
 assert.equal(venueHostMatches(cfg,venue),true);
 assert.equal(venueHostMatches({...cfg,venue_key:'ennis'},venue),false);
 assert.equal(venueHostMatches(cfg,{...venue,name:'Ennis'}),false);
 assert.equal(venueHostMatches(cfg,{...venue,status:'archived'}),false);
});
test('explicit venue id overrides legacy key, preventing misassigned hosts',()=>{
 assert.equal(venueHostMatches({...cfg,venue_id:'venue-2'},venue),false);
 assert.equal(venueHostMatches({...cfg,venue_id:'venue-1',venue_key:'ennis'},venue),true);
});
test('host email matching is exact, case-insensitive and active-only',()=>{
 assert.equal(isConfiguredHost([cfg],venue,' host@EXAMPLE.ie '),true);
 assert.equal(isConfiguredHost([cfg],venue,'other@example.ie'),false);
 assert.equal(isConfiguredHost([{...cfg,active:false}],venue,'host@example.ie'),false);
 assert.equal(isConfiguredHost([],venue,'host@example.ie'),false);
});
test('no partial venue matches or missing emails',()=>{
 assert.equal(isConfiguredHost([{...cfg,venue_key:'ennisty'}],venue,'host@example.ie'),false);
 assert.equal(isConfiguredHost([cfg],venue,''),false);
});
