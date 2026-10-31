/** Host delegation decision only; backend must authenticate and enforce it. */
const HOST_ACTIONS=new Set(['view_roster','mark_attendance','manage_session','record_score']);
export function hostAccessDecision({tenantId,clubId,sessionId,hostGrant,action,now}={}){
 const deny=reason=>({allowed:false,reason});
 if(!tenantId||!clubId||!sessionId)return deny('scope_required');
 if(!HOST_ACTIONS.has(action))return deny('action_not_supported');
 if(!hostGrant||hostGrant.tenant_id!==tenantId||hostGrant.club_id!==clubId||hostGrant.session_id!==sessionId)return deny('grant_not_found');
 if(hostGrant.revoked_at)return deny('grant_revoked');
 if(!hostGrant.expires_at||!now||!Number.isFinite(Date.parse(now))||!Number.isFinite(Date.parse(hostGrant.expires_at)))return deny('expiry_unverifiable');
 if(Date.parse(now)>=Date.parse(hostGrant.expires_at))return deny('grant_expired');
 if(!Array.isArray(hostGrant.allowed_actions)||!hostGrant.allowed_actions.includes(action))return deny('action_not_granted');
 return {allowed:true,reason:null};
}
