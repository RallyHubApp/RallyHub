import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';
import { findFinanceRuleForEvent, financeOccurrenceStartInWindow, financeRuleIsSelected, financeSpondPatternKey } from '../spondIntegrationWorking/financeMatch.mjs';

// Independent tenant finance adapter. No Directory entities or listing-editor access.
const SPOND_API_BASE = 'https://api.spond.com/core/v1';
const clean = (value, max=500) => String(value ?? '').trim().slice(0,max);

async function spondRequest(path, token) {
  const res = await fetch(`${SPOND_API_BASE}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spond API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function spondLogin(username, password) {
  const res = await fetch(`${SPOND_API_BASE}/auth2/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: username, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spond login failed ${res.status}: ${text}`);
  }
  const data = await res.json();
  const token = data.accessToken?.token || data.loginToken || data.token;
  if (!token) throw new Error('Spond login did not return an access token');
  return token;
}

function eventStart(event){return event?._resolvedStartTimestamp||event?.meetupTimestamp||event?.startTimestamp||event?.start_time||'';}
function occurrenceStartInWindow(event,minMs,maxMs){return financeOccurrenceStartInWindow(event,minMs,maxMs);}
function irelandDate(value) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Dublin', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date(value));
    const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  } catch { return ''; }
}
function financeResponseMeta(event, feePerPerson=null) {
  const accepted = new Set((event?.responses?.acceptedIds || []).map(String));
  const declined = new Set((event?.responses?.declinedIds || []).map(String));
  const notes = new Map();
  const responseRows = [
    ...(Array.isArray(event?.responses?.members) ? event.responses.members : []),
    ...(Array.isArray(event?.responses?.responses) ? event.responses.responses : []),
    ...(Array.isArray(event?.responses?.declined) ? event.responses.declined : []),
    ...(Array.isArray(event?.comments) ? event.comments : []),
  ];
  for (const row of responseRows) {
    const id = String(row?.memberId || row?.uid || row?.id || row?.profileId || row?.userId || '');
    if (!id) continue;
    const status = String(row?.status || row?.response || row?.attendanceStatus || '').toLowerCase();
    if (['accepted','attending','going'].includes(status)) accepted.add(id);
    if (['declined','not_attending','not-attending','notgoing','not_going'].includes(status)) declined.add(id);
    const note = clean(row?.comment || row?.note || row?.message || row?.responseComment || row?.commentText || row?.text || '', 500);
    if (note) notes.set(id, note);
  }
  if (event?.responses?.comments && typeof event.responses.comments === 'object') {
    for (const [id, value] of Object.entries(event.responses.comments)) {
      const note = clean(typeof value === 'string' ? value : (value?.comment || value?.note || value?.message || value?.text || ''), 500);
      if (note) notes.set(String(id), note);
    }
  }
  const paidLanguage = /\b(already\s+paid|paid\s+(already|before|online|for)|payment\s+(made|sent|done)|have\s+paid|has\s+paid|i\s+paid|paid)\b/i;
  const negativeLanguage = /\b(not\s+paid|not\s+yet\s+paid|didn['’]?t\s+pay|did\s+not\s+pay|refund(?:ed)?|money\s+back|can['’]?t\s+pay|cannot\s+pay|unable\s+to\s+pay|will\s+pay\s+later|owe)\b/i;
  const fee = Number(feePerPerson);
  const feePatterns = Number.isFinite(fee) ? [fee.toFixed(2),String(fee).replace('.',','),`€${fee.toFixed(2)}`,`€${String(fee).replace('.',',')}`] : [];
  const paidDeclinedIds = [];
  const declinedNotes = [];
  for (const id of declined) {
    const note = notes.get(String(id)) || '';
    const mentionsConfiguredFee = !!note && feePatterns.some(value=>note.toLowerCase().includes(String(value).toLowerCase()));
    const paid = !!note && (paidLanguage.test(note) || mentionsConfiguredFee) && !negativeLanguage.test(note);
    if (paid) paidDeclinedIds.push(String(id));
    declinedNotes.push({ memberId:String(id), note, countedAsPaid:paid });
  }
  return { goingCount:accepted.size, declinedCount:declined.size, declinedPaidCount:paidDeclinedIds.length, declinedNotes };
}

function financialYearLabelFor(dateValue, startMonth=9, startDay=1) {
  const parts = String(dateValue || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parts) return '';
  const year = Number(parts[1]), month = Number(parts[2]), day = Number(parts[3]);
  const startsThisYear = month > startMonth || (month === startMonth && day >= startDay);
  const startYear = startsThisYear ? year : year - 1;
  return `${startYear}/${String(startYear + 1).slice(-2)}`;
}
function dublinParts(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-IE', {
    timeZone: 'Europe/Dublin', weekday:'long', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23'
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return { day:p.weekday, date:`${p.year}-${p.month}-${p.day}`, time:`${p.hour}:${p.minute}` };
}


function occurrenceStartInWindow(event,minMs,maxMs){return financeOccurrenceStartInWindow(event,minMs,maxMs);}

Deno.serve(async(req)=>{
 try{
  const base44=createClientFromRequest(req);
  const user=await base44.auth.me();
  if(!user || user.role!=='admin' || !user.active_tenant_id || !user.active_club_id)
   return Response.json({error:'Club finance administrator access required.'},{status:403});
  const body=await req.json().catch(()=>({}));
  const action=String(body.action||'');
  if(!['preview','sync'].includes(action))return Response.json({error:'Unsupported tenant Spond finance action.'},{status:400});
    if (action === 'preview' || action === 'sync') {
      const tenantId=String(user.active_tenant_id);
      const clubId=String(user.active_club_id);
      const bindings=await base44.asServiceRole.entities.SpondSessionBinding.filter({tenant_id:tenantId,club_id:clubId,active:true},'directory_session_key',200);
      const validGroups=new Set((bindings||[]).map(row=>String(row.spond_group_id||'')).filter(Boolean));
      const financeGroupId=String(body.groupId||'');
      if(!financeGroupId || !validGroups.has(financeGroupId)) return Response.json({error:'The Spond group is not linked to this tenant and club.'},{status:403});
      // Authenticate to the external system only after authorisation and group ownership checks.
      const email=Deno.env.get('SPOND_EMAIL');
      const password=Deno.env.get('SPOND_PASSWORD');
      if(!email||!password)return Response.json({error:'Spond tenant finance credentials unavailable.'},{status:503});
      const token=await spondLogin(email,password);
      const today = irelandDate(new Date().toISOString());
      const fromDate = clean(body.fromDate || `${new Date().getUTCFullYear()}-09-01`, 10);
      const toDate = clean(body.toDate || today, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(toDate) || fromDate > toDate) {
        return Response.json({ error:'Valid fromDate/toDate required (YYYY-MM-DD).' }, { status:400 });
      }
      const minStart = new Date(`${fromDate}T00:00:00.000Z`);
      minStart.setUTCDate(minStart.getUTCDate() - 1);
      const maxStart = new Date(`${toDate}T23:59:59.999Z`);
      maxStart.setUTCDate(maxStart.getUTCDate() + 1);
      const params = new URLSearchParams({
        groupId:financeGroupId,
        minStartTimestamp:minStart.toISOString(),
        maxStartTimestamp:maxStart.toISOString(),
        max:'500',
        scheduled:'true',
        includeComments:'true',
        includeHidden:'false',
        addProfileInfo:'false',
      });
      const raw = await spondRequest(`/sponds?${params.toString()}`, token);
      const minMs=minStart.getTime(), maxMs=maxStart.getTime();
      const selectedMonths = Array.isArray(body.selectedMonths) ? body.selectedMonths.map(Number).filter(value=>Number.isInteger(value)&&value>=1&&value<=12) : [];
      const selectedMonthSet = new Set(selectedMonths);
      const bounded=(Array.isArray(raw)?raw:[])
        .map(e=>({...e,_resolvedStartTimestamp:occurrenceStartInWindow(e,minMs,maxMs)}))
        .filter(e=>e._resolvedStartTimestamp)
        .filter(e=>{ const d=irelandDate(e._resolvedStartTimestamp); return d>=fromDate && d<=toDate; })
        .filter(e=>{ if(!selectedMonthSet.size)return true; const local=dublinParts(e._resolvedStartTimestamp); const month=Number(String(local?.date||'').slice(5,7)); return selectedMonthSet.has(month); });

      const [rules, venues] = await Promise.all([
        base44.asServiceRole.entities.ClubFinanceVenueRule.filter({ tenant_id:tenantId, club_id:clubId, active:true }, 'weekday', 500),
        base44.asServiceRole.entities.Venue.filter({ tenant_id:tenantId, club_id:clubId }, 'name', 500),
      ]);
      const rulesByEvent = new Map((rules || []).filter(r=>r.spond_event_id).map(r=>[String(r.spond_event_id),r]));
      const mappedPatternRules = (rules || []).filter(r=>r.income_source==='spond' && r.spond_pattern_key && (!r.spond_group_id || String(r.spond_group_id)===financeGroupId));
      const rulesByPattern = new Map(mappedPatternRules.map(r=>[String(r.spond_pattern_key),r]));
      const spondRules = (rules || []).filter(r=>r.income_source === 'spond');
      const strictPatternMapping = mappedPatternRules.length > 0;
      const venuesById = new Map((venues || []).map(v=>[String(v.id),v]));
      const selectedVenueIds = Array.isArray(body.selectedVenueIds) ? body.selectedVenueIds.map(value=>String(value)).filter(Boolean) : [];
      const selectedVenueSet = new Set(selectedVenueIds);
      const selectedOccurrenceKeys = Array.isArray(body.selectedOccurrenceKeys) ? body.selectedOccurrenceKeys.map(value=>String(value)).filter(Boolean) : [];
      const selectedOccurrenceSet = new Set(selectedOccurrenceKeys);
      const settings = (await base44.asServiceRole.entities.ClubFinanceSettings.filter({ tenant_id:tenantId, club_id:clubId }, '-updated_date', 5))?.[0] || null;
      const fyMonth = Number(settings?.financial_year_start_month || 9);
      const fyDay = Number(settings?.financial_year_start_day || 1);
      const allEntries = await base44.asServiceRole.entities.ClubFinanceEntry.filter({ tenant_id:tenantId, club_id:clubId }, '-activity_date', 1000);
      const existingBySource = new Map((allEntries || []).filter(row=>row.source_type==='spond_session' && row.source_id).map(row=>[String(row.source_id),row]));
      let created=0, updated=0, skipped=0, reviewCount=0;
      let exactMatches=0, scheduleMatches=0, unmatchedRule=0, missingFee=0, outsideEffectiveRange=0, ignoredNotSelected=0, ignoredNotChosen=0, selectedEventCount=0;
      const synced=[];
      const candidates=[];
      const syncedAt=new Date().toISOString();
      for (const event of bounded) {
        const start = eventStart(event);
        const activityDate = irelandDate(start);
        const local = dublinParts(start);
        if (!activityDate || !local) { skipped++; unmatchedRule++; continue; }
        const endLocal = dublinParts(event?.endTimestamp || '');
        const sourceVenueName = clean(event?.location?.feature || event?.location?.name || event?.location?.address || '', 220);
        const sourceVenueAddress = clean(event?.location?.address || '', 320);
        const eventPatternKey = financeSpondPatternKey({ heading:clean(event?.heading || 'Club Session',180), day:local.day, start:local.time, end:endLocal?.time||'', venueName:sourceVenueName, venueAddress:sourceVenueAddress });
        const patternRule = rulesByPattern.get(eventPatternKey) || null;
        const match = patternRule ? { rule:patternRule, matchMode:'directory_pattern', score:1 } : strictPatternMapping ? { rule:null, matchMode:'', score:0 } : findFinanceRuleForEvent({ event, activityDate, local, rulesByEvent, spondRules, venuesById });
        const rule = match.rule;
        const matchMode = match.matchMode;
        if (!rule) { skipped++; unmatchedRule++; continue; }
        if (!financeRuleIsSelected(rule, selectedVenueSet)) { ignoredNotSelected++; continue; }
        selectedEventCount++;
        if (matchMode === 'exact_event_id') exactMatches++; else scheduleMatches++;

        const feeMissing = rule.default_fee_per_person == null || rule.default_fee_per_person === '';
        const fee = feeMissing ? null : Number(rule.default_fee_per_person);
        const response = financeResponseMeta(event, fee);
        const paidPlaces = response.goingCount + response.declinedPaidCount;
        const durationHours = Number(rule.duration_minutes || 0) / 60;
        const venue = venuesById.get(String(rule.venue_id || ''));
        const liveHourlyRate = Number(venue?.hourly_hire_rate);
        const hourlyRate = Number.isFinite(liveHourlyRate) && liveHourlyRate >= 0 ? liveHourlyRate : Number(rule.cost_amount || 0);
        const expectedCost = Math.round((rule.cost_type === 'per_hour' ? hourlyRate * durationHours : Number(rule.cost_amount || 0)) * 100) / 100;
        const income = feeMissing ? null : Math.round(paidPlaces * Number(fee) * 100) / 100;
        const sourceId = `${String(event.id)}::${String(start)}`;
        const outsideRange = !!((rule.effective_from && activityDate < rule.effective_from) || (rule.effective_to && activityDate > rule.effective_to));
        if (outsideRange) outsideEffectiveRange++;
        if (feeMissing) missingFee++;
        const ready = !outsideRange && !feeMissing;
        const spondVenueName = clean(event?.location?.feature || event?.location?.name || event?.location?.address || '', 220);
        candidates.push({
          occurrenceKey:sourceId,
          activityDate,
          startTime:local?.time || rule.start_time || '',
          heading:String(event.heading || rule.session_label || 'Spond session'),
          spondVenueName,
          venueId:String(rule.venue_id || ''),
          venueName:rule.venue_name,
          sessionLabel:rule.session_label || String(event.heading || 'Spond session'),
          goingCount:response.goingCount,
          declinedPaidCount:response.declinedPaidCount,
          paidPlaces,
          feePerPerson:fee,
          incomeAmount:income,
          expectedCostAmount:expectedCost,
          netAmount:income == null ? null : Math.round((income-expectedCost)*100)/100,
          ready,
          reason:outsideRange ? 'Outside the configured session dates' : feeMissing ? 'Player fee is not set' : '',
          matchMode,
        });
        if (action === 'preview') continue;
        if (selectedOccurrenceSet.size && !selectedOccurrenceSet.has(sourceId)) { ignoredNotChosen++; continue; }
        if (outsideRange) { skipped++; continue; }
        if (feeMissing) { skipped++; continue; }

        const details = {
          spondGroupId:financeGroupId,
          spondEventId:String(event.id),
          heading:String(event.heading || ''),
          declinedCount:response.declinedCount,
          declinedResponses:response.declinedNotes,
          ruleId:rule.id,
          venueHourlyRate:Number.isFinite(liveHourlyRate) ? liveHourlyRate : null,
          matchMode,
        };
        reviewCount += response.declinedNotes.filter(row=>!row.countedAsPaid && !!row.note).length;
        const payload = {
          tenant_id:tenantId,
          club_id:clubId,
          activity_date:activityDate,
          activity_start_time:local?.time || rule.start_time || '',
          venue_id:rule.venue_id || '',
          venue_name:rule.venue_name,
          session_label:rule.session_label || String(event.heading || 'Spond session'),
          source_type:'spond_session',
          source_id:sourceId,
          venue_rule_id:rule.id,
          going_count:response.goingCount,
          declined_paid_count:response.declinedPaidCount,
          paid_places:paidPlaces,
          fee_per_person:Number(fee),
          income_amount:Number(income),
          expected_cost_amount:expectedCost,
          financial_year_label:financialYearLabelFor(activityDate,fyMonth,fyDay),
          source_details_json:JSON.stringify(details),
          last_synced_at:syncedAt,
        };
        const existing = existingBySource.get(sourceId);
        let saved;
        if (existing) {
          saved = await base44.asServiceRole.entities.ClubFinanceEntry.update(existing.id, payload);
          updated++;
        } else {
          saved = await base44.asServiceRole.entities.ClubFinanceEntry.create({ ...payload, cost_status:'expected', other_cost_amount:0 });
          created++;
        }
        synced.push({ id:saved.id, activityDate, startTime:payload.activity_start_time, venueName:payload.venue_name, sessionLabel:payload.session_label, goingCount:response.goingCount, declinedPaidCount:response.declinedPaidCount, paidPlaces, incomeAmount:Number(income), expectedCostAmount:expectedCost, netAmount:Math.round((Number(income)-expectedCost)*100)/100 });
      }
      if (action === 'preview') {
        return Response.json({
          success:true,
          preview:true,
          fromDate,
          toDate,
          candidates,
          fetchedCount:selectedEventCount,
          totalSpondEventsInRange:bounded.length,
          readyCount:candidates.filter(row=>row.ready).length,
          diagnostics:{ exactMatches, scheduleMatches, unmatchedRule, missingFee, outsideEffectiveRange, ignoredNotSelected },
          connection:{ groupId:financeGroupId, groupName:'' },
        });
      }
      return Response.json({
        success:true,
        fromDate,
        toDate,
        created,
        updated,
        skipped,
        reviewCount,
        synced,
        fetchedCount:selectedEventCount,
        totalSpondEventsInRange:bounded.length,
        matchedCount:synced.length,
        diagnostics:{ exactMatches, scheduleMatches, unmatchedRule, missingFee, outsideEffectiveRange, ignoredNotSelected, ignoredNotChosen },
        connection:{ groupId:financeGroupId, groupName:'' },
        syncedAt,
      });
    }


  return Response.json({error:'Unknown tenant finance action.'},{status:400});
 }catch(error){console.error('tenantSpondFinance failed',error?.message||error);return Response.json({error:'Tenant Spond Finance could not complete this request.'},{status:500});}
});
