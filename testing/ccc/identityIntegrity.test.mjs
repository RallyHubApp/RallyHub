import test from 'node:test';
import assert from 'node:assert/strict';
import {identityIntegrity} from '../../base44/functions/cccActivity/identityIntegrity.mjs';
const a=(id,user_id,person_id,extra={})=>({id,tenant_id:'t1',club_id:'c1',status:'active',user_id,person_id,...extra});
test('detects one person claimed by different users and one user linked to different people',()=>{
 const result=identityIntegrity([a('a','u1','p1'),a('b','u2','p1'),a('c','u1','p2')],{tenantId:'t1',clubId:'c1',complete:true});
 assert.equal(result.duplicatePersonLinkCount,1);assert.equal(result.duplicateUserLinkCount,1);assert.equal(result.requiresReview,true);
 assert.equal(result.autoMergeEnabled,false);
});
test('repeated access rows for same user-person pair are not a conflict',()=>{
 const result=identityIntegrity([a('a','u1','p1'),a('b','u1','p1')],{tenantId:'t1',clubId:'c1',complete:true});
 assert.equal(result.duplicatePersonLinkCount,0);assert.equal(result.duplicateUserLinkCount,0);
});
test('inactive and other-club records are excluded; missing Person links flagged',()=>{
 const result=identityIntegrity([a('a','u1',''),a('b','u2','p1',{status:'revoked'}),a('c','u3','p1',{club_id:'c2'})],{tenantId:'t1',clubId:'c1',complete:true});
 assert.equal(result.unlinkedActiveCount,1);assert.equal(result.activeAccessCount,1);
});
test('incomplete access inventory remains review-required',()=>{
 const result=identityIntegrity([],{tenantId:'t1',clubId:'c1',complete:false});
 assert.equal(result.requiresReview,true);
});
