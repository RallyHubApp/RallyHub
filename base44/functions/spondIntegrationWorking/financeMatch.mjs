const stopWords = new Set(['gaa','club','community','centre','center','sports','sport','hall','co','county','ireland','road','rd','street','the']);

function normalise(value='') {
  return String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}

export function financeVenueTokens(value='') {
  return new Set(normalise(value).split(' ').filter(token=>token.length>1 && !stopWords.has(token)));
}

export function financeVenueSimilarity(rule, venue, event) {
  const sourceValues=[event?.location?.feature,event?.location?.name,event?.location?.address].filter(Boolean);
  const targetValues=[rule?.venue_name,venue?.name,venue?.address].filter(Boolean);
  let best=0;
  for(const sourceValue of sourceValues){
    const source=financeVenueTokens(sourceValue);
    if(!source.size)continue;
    for(const targetValue of targetValues){
      const target=financeVenueTokens(targetValue);
      if(!target.size)continue;
      let intersection=0;
      for(const token of source) if(target.has(token)) intersection++;
      const score=intersection/Math.min(source.size,target.size);
      if(score>best)best=score;
    }
  }
  return best;
}

export function financeRuleIsSelected(rule, selectedVenueIds=[]) {
  const values = selectedVenueIds instanceof Set ? [...selectedVenueIds] : (Array.isArray(selectedVenueIds) ? selectedVenueIds : []);
  if (!values.length) return true;
  return values.map(value=>String(value)).includes(String(rule?.venue_id || ''));
}

export function financeOccurrenceStartInWindow(event,minMs,maxMs) {
  // Spond may expose multiple lifecycle timestamps. meetupTimestamp is the actual
  // session time and must retain precedence; never choose a secondary timestamp
  // simply because it is earlier.
  const candidates=[event?.meetupTimestamp,event?.startTimestamp,event?.start_time].filter(Boolean);
  for(const value of candidates){
    const t=new Date(value).getTime();
    if(Number.isFinite(t)&&t>=minMs&&t<=maxMs) return value;
  }
  return '';
}

export function findFinanceRuleForEvent({event, activityDate, local, rulesByEvent, spondRules, venuesById}) {
  let rule=rulesByEvent.get(String(event?.id || ''));
  if(rule) return {rule,matchMode:'exact_event_id',score:1};
  const candidates=(spondRules||[])
    .filter(candidate => String(candidate.weekday || '') === String(local?.day || ''))
    .filter(candidate => String(candidate.start_time || '').slice(0,5) === String(local?.time || '').slice(0,5))
    .filter(candidate => !(candidate.effective_from && activityDate < candidate.effective_from))
    .filter(candidate => !(candidate.effective_to && activityDate > candidate.effective_to))
    .map(candidate => ({ candidate, score:financeVenueSimilarity(candidate, venuesById.get(String(candidate.venue_id || '')), event) }))
    .filter(row => row.score >= 0.5)
    .sort((a,b)=>b.score-a.score);
  if(candidates.length && (candidates.length===1 || candidates[0].score>candidates[1].score)) {
    return {rule:candidates[0].candidate,matchMode:'venue_day_time',score:candidates[0].score};
  }
  return {rule:null,matchMode:'',score:0};
}
