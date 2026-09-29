export function dateMs(value){
  if(!value)return null;
  const n=Date.parse(String(value));
  return Number.isFinite(n)?n:null;
}

export function isWindowActive(row,now=Date.now()){
  if(!row)return false;
  if(!['active','grace'].includes(String(row.status||'')))return false;
  const start=dateMs(row.starts_at);
  const end=dateMs(row.ends_at);
  const graceEnd=dateMs(row.grace_ends_at);
  if(start!==null&&start>now)return false;
  if(row.status==='grace')return graceEnd===null||graceEnd>=now;
  if(end!==null&&end<now)return false;
  return true;
}

export function isExpiredByTime(row,now=Date.now()){
  const end=dateMs(row?.ends_at);
  return end!==null&&end<now;
}

export function expandDependencies(keys,caps){
  const out=new Set((keys||[]).filter(Boolean));
  const visit=(key)=>{
    const cap=caps.get(key);
    if(!cap)return;
    for(const dep of cap.depends_on_keys||[]){
      if(!out.has(dep)){out.add(dep);visit(dep);}
    }
  };
  [...out].forEach(visit);
  return [...out];
}

export function capabilityIncludes(sourceKey,targetKey,caps,seen=new Set()){
  if(!sourceKey||!targetKey)return false;
  if(sourceKey===targetKey)return true;
  if(seen.has(sourceKey))return false;
  seen.add(sourceKey);
  const cap=caps.get(sourceKey);
  if(!cap)return false;
  return (cap.depends_on_keys||[]).some(dep=>capabilityIncludes(dep,targetKey,caps,seen));
}

export function entitlementMatchesContext(row,{clubId=null,eventId=null}={}){
  if(!row)return false;
  if(row.club_id&&String(row.club_id)!==String(clubId||''))return false;
  if(row.entitlement_type==='one_event'){
    if(!eventId)return false;
    if(String(row.one_event_id||'')!==String(eventId))return false;
  }
  return true;
}

export function activeGrantSources(rows,targetKey,caps,{clubId=null,eventId=null,now=Date.now()}={}){
  return (rows||[]).filter(row=>
    isWindowActive(row,now)&&
    entitlementMatchesContext(row,{clubId,eventId})&&
    capabilityIncludes(row.capability_key,targetKey,caps)
  );
}

export function expiredGraceSources(rows,targetKey,caps,{clubId=null,eventId=null,now=Date.now()}={}){
  return (rows||[]).filter(row=>
    !['suspended','revoked'].includes(String(row.status||''))&&
    isExpiredByTime(row,now)&&
    entitlementMatchesContext(row,{clubId,eventId})&&
    capabilityIncludes(row.capability_key,targetKey,caps)
  );
}
