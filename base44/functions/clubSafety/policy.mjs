export function activeHost(grant,now=Date.now()){
 return !!grant&&grant.status==='active'&&['session_host','assistant_host'].includes(grant.role)&&(!grant.starts_at||Date.parse(grant.starts_at)<=now)&&(!grant.ends_at||Date.parse(grant.ends_at)>now);
}
export function validateReport(body){
 const errors=[];
 if(!['injury','medical','near_miss','hazard','other'].includes(body.type))errors.push('Invalid incident type');
 if(typeof body.description!=='string'||!body.description.trim()||body.description.length>4000)errors.push('Factual description required');
 if(typeof body.operationId!=='string'||!/^[a-zA-Z0-9_-]{16,80}$/.test(body.operationId))errors.push('Invalid operation identifier');
 if(typeof body.incidentAt!=='string'||!Number.isFinite(Date.parse(body.incidentAt))||Date.parse(body.incidentAt)>Date.now()+60000)errors.push('Invalid incident time');
 if(!Array.isArray(body.people)||body.people.length>30||body.people.some(p=>!p||typeof p.name!=='string'||!p.name.trim()||p.name.length>150||!['member','guest','other'].includes(p.type)))errors.push('Invalid people');
 for(const key of ['actions','outcome','witnesses','supplies'])if(typeof body[key]!=='string'||body[key].length>4000)errors.push('Invalid '+key);
 return errors;
}
