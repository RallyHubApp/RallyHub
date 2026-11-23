export function suggestPresetCourts(people,rows,courtCount){
 const ids=people.map(p=>String(p.id));const allowed=new Set(ids);const preferences=new Map(rows.map(r=>[String(r.participant_id),r]));
 const used=new Set(),pairs=[];
 // Prefer mutual partner requests; then single partner requests; fill the remaining players deterministically.
 const candidates=[];
 for(const id of ids){const p=preferences.get(id);const other=String(p?.partner_id||'');if(other&&other!==id&&allowed.has(other)){const mutual=String(preferences.get(other)?.partner_id||'')===id;candidates.push({a:id,b:other,score:mutual?2:1});}}
 candidates.sort((a,b)=>b.score-a.score||ids.indexOf(a.a)-ids.indexOf(b.a));
 for(const c of candidates){if(!used.has(c.a)&&!used.has(c.b)){pairs.push([c.a,c.b]);used.add(c.a);used.add(c.b);}}
 const rest=ids.filter(id=>!used.has(id));while(rest.length>=2)pairs.push([rest.shift(),rest.shift()]);
 const courts=[];for(let i=0;i<Math.min(courtCount,Math.floor(pairs.length/2));i++)courts.push({A:pairs[2*i],B:pairs[2*i+1]});
 return courts;
}
