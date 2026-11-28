export function qualificationState(record,now=Date.now()){
 if(record.status!=='active'||!record.verified_by)return 'unverified';
 const expiry=Date.parse(record.expires_at);
 if(!Number.isFinite(expiry))return 'unverified';
 if(expiry<=now)return 'expired';
 return expiry-now<=30*86400000?'expiring':'current';
}
export function kitState(item,now=Date.now()){
 if(!Number.isFinite(item.quantity)||item.quantity<0||!Number.isFinite(item.minimum_quantity)||item.minimum_quantity<0)return 'invalid';
 if(item.expiry&&(!Number.isFinite(Date.parse(item.expiry))||Date.parse(item.expiry)<=now))return 'expiry_review';
 return item.quantity<=item.minimum_quantity?'replenish':'ready';
}
export function approvedGuidance(record){
 return record.status==='approved'&&!!record.reviewed_by&&Number.isFinite(Date.parse(record.reviewed_at))&&Number.isInteger(record.version)&&record.version>0&&!!record.source_url&&!!record.content;
}
