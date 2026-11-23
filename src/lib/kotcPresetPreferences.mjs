export function suggestPresetCourts(people,rows,courtCount){
 const ids=people.map(p=>String(p.id));const allowed=new Set(ids);const preferences=new Map(rows.map(r=>[String(r.participant_id),r]));
 const used=new Set(),pairs=[];
 // Prefer mutual partner requests; then single partner requests; fill the remaining players deterministically.
 const candidates=[];
 for(const id of ids){const p=preferences.get(id);const other=String(p?.partner_id||'');if(other&&other!==id&&allowed.has(other)){const mutual=String(preferences.get(other)?.partner_id||'')===id;candidates.push({a:id,b:other,score:mutual?2:1});}}
 candidates.sort((a,b)=>b.score-a.score||ids.indexOf(a.a)-ids.indexOf(b.a));
 for(const c of candidates){if(!used.has(c.a)&&!used.has(c.b)){pairs.push([c.a,c.b]);used.add(c.a);used.add(c.b);}}
 const rest=ids.filter(id=>!used.has(id));while(rest.length>=2)pairs.push([rest.shift(),rest.shift()]);
 const courts=[];const available=[...pairs];const count=Math.min(courtCount,Math.floor(available.length/2));
 // Prefer opposing teams containing requested opponents; otherwise retain roster order.
 const faceScore=(a,b)=>a.reduce((sum,id)=>sum+b.reduce((n,other)=>n+(preferences.get(id)?.opponent_id===other?3:0)+(preferences.get(id)?.second_choice_id===other?1:0),0),0)+b.reduce((sum,id)=>sum+a.reduce((n,other)=>n+(preferences.get(id)?.opponent_id===other?3:0)+(preferences.get(id)?.second_choice_id===other?1:0),0),0);
 for(let i=0;i<count;i++){const a=available.shift();let best=0,bestScore=-1;for(let j=0;j<available.length;j++){const score=faceScore(a,available[j]);if(score>bestScore){bestScore=score;best=j;}}const b=available.splice(best,1)[0];courts.push({A:a,B:b});}
 return courts;
}
