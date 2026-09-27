export function normaliseSpondName(value='') {
  return String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}

export function normaliseSpondPhone(value='') {
  const digits=String(value ?? '').replace(/\D/g,'').replace(/^3530?/,'353');
  return digits;
}

export function spondRowIdentity(row={}) {
  const profile=row?.profile||{};
  const first=profile?.firstName||row?.firstName||'';
  const last=profile?.lastName||row?.lastName||'';
  const full=profile?.fullName||row?.fullName||row?.name||`${first} ${last}`;
  return {
    id:String(row?.memberId??row?.uid??row?.id??''),
    email:String(profile?.email??row?.email??'').trim().toLowerCase(),
    phone:normaliseSpondPhone(profile?.phoneNumber??profile?.mobile??row?.phoneNumber??row?.mobile??''),
    name:normaliseSpondName(full),
  };
}

function personIdentity(person={}) {
  const emails=[person?.primary_email,...(person?.alternate_emails||[])].map(v=>String(v||'').trim().toLowerCase()).filter(Boolean);
  const phones=[person?.mobile,...(person?.alternate_phones||[])].map(normaliseSpondPhone).filter(v=>v.length>=7);
  return {emails:new Set(emails),phones:new Set(phones),name:normaliseSpondName(person?.full_name||'')};
}

function looseNameCompatible(a,b) {
  const aa=normaliseSpondName(a).split(' ').filter(Boolean);
  const bb=normaliseSpondName(b).split(' ').filter(Boolean);
  if(aa.length<2||bb.length<2)return false;
  const aFirst=aa[0],bFirst=bb[0],aLast=aa.at(-1),bLast=bb.at(-1);
  return aLast===bLast&&aFirst&&bFirst&&aFirst[0]===bFirst[0];
}

export function findUniqueSpondPersonRow(rows=[],person={},memberId='') {
  const candidates=Array.isArray(rows)?rows.filter(Boolean):[];
  const wanted=personIdentity(person);
  const wantedId=String(memberId||'');
  const scored=[];
  for(const row of candidates){
    const identity=spondRowIdentity(row);
    let score=0;
    if(wantedId&&identity.id===wantedId)score=120;
    else if(identity.email&&wanted.emails.has(identity.email))score=110;
    else if(identity.phone&&[...wanted.phones].some(phone=>phone===identity.phone||(phone.length>=9&&identity.phone.length>=9&&phone.slice(-9)===identity.phone.slice(-9))))score=105;
    else if(identity.name&&wanted.name&&identity.name===wanted.name)score=100;
    else if(identity.name&&wanted.name&&looseNameCompatible(identity.name,wanted.name))score=60;
    if(score)scored.push({row,identity,score});
  }
  if(!scored.length)return null;
  const best=Math.max(...scored.map(x=>x.score));
  const winners=scored.filter(x=>x.score===best);
  // Never guess where the strongest available identity evidence is ambiguous.
  return winners.length===1?winners[0]:null;
}
