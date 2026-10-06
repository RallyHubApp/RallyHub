const normEmail=v=>String(v||"").trim().toLowerCase();
const normMobile=v=>String(v||"").replace(/[^+\d]/g,"");
export function evaluateRule(person,rule){
 const value=String(rule.field||"").split(".").reduce((v,k)=>v==null?undefined:v[k],person);
 const expected=rule.value;
 switch(rule.op){case"eq":return value===expected;case"neq":return value!==expected;case"in":return Array.isArray(expected)&&expected.includes(value);case"contains":return Array.isArray(value)?value.includes(expected):String(value??"").toLowerCase().includes(String(expected??"").toLowerCase());case"exists":return rule.value?value!=null:value==null;default:throw new Error("COMM_AUDIENCE_OPERATOR_INVALID")}
}
export function resolveAudience({people=[],definition={}}){
 const include=definition.include||[],exclude=definition.exclude||[];const logic=definition.logic==="OR"?"OR":"AND";
 return people.filter(p=>{const hits=include.map(r=>evaluateRule(p,r));const ok=!hits.length||(logic==="AND"?hits.every(Boolean):hits.some(Boolean));return ok&&!exclude.some(r=>evaluateRule(p,r))});
}
export function dedupeContacts(people=[]){
 const seen=new Set(),out=[],duplicates=[];
 for(const p of people){const key=p.person_id?"p:"+p.person_id:normEmail(p.email)?"e:"+normEmail(p.email):normMobile(p.mobile)?"m:"+normMobile(p.mobile):"";
  if(!key){out.push(p);continue} if(seen.has(key)){duplicates.push(p);continue} seen.add(key);out.push(p)}
 return {people:out,duplicates};
}
