import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SPOND_API_BASE = 'https://api.spond.com/core/v1';

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

async function fetchEventOccurrence(groupId, eventId, token, hintStart='', hintHeading='') {
  try {
    return await spondRequest(`/sponds/${eventId}`, token);
  } catch (directError) {
    const hintTime = hintStart ? new Date(hintStart).getTime() : NaN;
    const centre = Number.isFinite(hintTime) ? hintTime : Date.now();
    const minStart = new Date(centre - 2 * 24 * 60 * 60 * 1000).toISOString();
    const maxStart = new Date(centre + 2 * 24 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams({groupId:String(groupId),minStartTimestamp:minStart,maxStartTimestamp:maxStart,max:'200',scheduled:'true',includeComments:'false',includeHidden:'false',addProfileInfo:'true'});
    const listed = await spondRequest(`/sponds?${params.toString()}`, token);
    const events = Array.isArray(listed) ? listed : [];
    const exactId = events.find(e => String(e.id) === String(eventId));
    if (exactId) return exactId;
    const exactHint = events.find(e => {
      const sameTime = hintStart && eventStart(e) && Math.abs(new Date(eventStart(e)).getTime() - new Date(hintStart).getTime()) < 60000;
      const sameHeading = hintHeading && String(e.heading||'').trim().toLowerCase() === String(hintHeading).trim().toLowerCase();
      return sameTime && sameHeading;
    });
    if (exactHint) return exactHint;
    throw new Error(`Spond occurrence could not be opened. ${directError?.message || ''}`.trim());
  }
}

async function fetchGroupForAttendees(groupId, token) {
  try {
    return await spondRequest(`/groups/${groupId}`, token);
  } catch (directError) {
    const groups = await spondRequest('/groups', token);
    const group = (Array.isArray(groups) ? groups : []).find(g => String(g.id) === String(groupId));
    if (group) return group;
    throw new Error(`Spond group details could not be loaded. ${directError?.message || ''}`.trim());
  }
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
function occurrenceStartInWindow(event,minMs,maxMs){
  const candidates=[event?.meetupTimestamp,event?.startTimestamp,event?.start_time].filter(Boolean);
  const valid=candidates.map(value=>({value,t:new Date(value).getTime()})).filter(x=>Number.isFinite(x.t)&&x.t>=minMs&&x.t<=maxMs).sort((a,b)=>a.t-b.t);
  return valid[0]?.value||'';
}
function irelandDate(value) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Dublin', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date(value));
    const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  } catch { return ''; }
}
function normaliseName(v=''){return String(v).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();}
function normaliseEmail(v=''){return String(v).trim().toLowerCase();}
function normalisePhone(v=''){return String(v).replace(/\D/g,'').replace(/^3530?/,'353');}
function collectResponseIds(event) {
  const accepted = new Set(); const waiting = new Set();
  (event.responses?.acceptedIds || []).forEach(id => accepted.add(id));
  (event.responses?.waitinglistIds || event.responses?.waitingListIds || []).forEach(id => waiting.add(id));
  (event.responses?.members || []).forEach(m => {
    const id=m.uid||m.id||m.memberId; const status=String(m.status||'').toLowerCase();
    if(['accepted','attending','going'].includes(status)) accepted.add(id);
    if(['waitinglist','waiting_list','waitlist'].includes(status)) waiting.add(id);
  });
  (event.responses?.responses || []).forEach(r => {
    const id=r.memberId||r.uid||r.id; const status=String(r.status||'').toLowerCase();
    if(['accepted','attending','going'].includes(status)) accepted.add(id);
    if(['waitinglist','waiting_list','waitlist'].includes(status)) waiting.add(id);
  });
  return {accepted,waiting};
}
function buildMemberMap(group){const map={};(group.members||[]).forEach(m=>{map[m.id]=m;});(group.subGroups||[]).forEach(sg=>(sg.members||[]).forEach(m=>{if(!map[m.id])map[m.id]=m;}));return map;}
function attendeeFromMember(memberId,member){const profile=member?.profile||{};const firstName=profile.firstName||member?.firstName||'';const lastName=profile.lastName||member?.lastName||'';const fullName=`${firstName} ${lastName}`.trim();if(!fullName)return null;return {spondId:memberId,firstName,lastName,fullName,email:profile.email||member.email||'',phoneNumber:profile.phoneNumber||member.phoneNumber||'',avatarUrl:profile.pictureUrl||null};}
function matchAttendee(attendee,players){
  const email=normaliseEmail(attendee.email),phone=normalisePhone(attendee.phoneNumber),name=normaliseName(attendee.fullName);
  const scored=new Map();
  for(const p of players){let score=0;if(email&&normaliseEmail(p.email)===email)score+=100;if(phone&&phone.length>=7&&normalisePhone(p.phone)===phone)score+=80;if(name&&normaliseName(p.full_name)===name)score+=40;if(score>0)scored.set(p.id,{player:p,score});}
  const ranked=[...scored.values()].sort((a,b)=>b.score-a.score);
  if(!ranked.length)return {status:'new',matched:null,candidates:[]};
  const top=ranked[0]; const tied=ranked.filter(x=>x.score===top.score);
  if(tied.length>1)return {status:'ambiguous',matched:null,candidates:tied.map(x=>({id:x.player.id,name:x.player.full_name,email:x.player.email||'',phone:x.player.phone||''}))};
  return {status:'matched',matched:top.player,candidates:[{id:top.player.id,name:top.player.full_name,email:top.player.email||'',phone:top.player.phone||''}]};
}

Deno.serve(async (req) => {
  try {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action, spondEmail, spondPassword, spondToken, groupId, eventId, targetDate, selectedStartTimestamp, selectedHeading } = body;

  const kotcRole = user.kotc_role || (user.role === 'admin' ? 'super_admin' : 'player');
  const isSpondManager = user.role === 'admin' || ['super_admin', 'admin', 'host'].includes(kotcRole);
  if (!isSpondManager) {
    return Response.json({ error: 'Forbidden: Spond host/admin access required' }, { status: 403 });
  }
  const activeTenantId = user.active_tenant_id || null;
  const activeClubId = user.active_club_id || null;
  if (user.role !== 'admin' && (!activeTenantId || !activeClubId)) {
    return Response.json({ error: 'Forbidden: active tenant/club context required' }, { status: 403 });
  }

  // ── Action: login ──
  if (action === 'login') {
    if (!spondEmail || !spondPassword) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }
    const token = await spondLogin(spondEmail, spondPassword);
    return Response.json({ token });
  }

  // All other actions require a token
  if (!spondToken) {
    return Response.json({ error: 'spondToken required' }, { status: 400 });
  }

  // ── Action: get_groups ──
  if (action === 'get_groups') {
    const groups = await spondRequest('/groups', spondToken);
    const simplified = groups.map(g => ({
      id: g.id,
      name: g.name,
      memberCount: g.members?.length || 0,
    }));
    return Response.json({ groups: simplified });
  }

  // ── Action: get_events ──
  if (action === 'get_events') {
    if (!groupId) return Response.json({ error: 'groupId required' }, { status: 400 });

    // Host workflow: show a bounded list of upcoming occurrences and let the host
    // choose the exact Spond event. This supports preparing Thursday's session on
    // Tuesday while still preventing distant recurring-series anchors (e.g. 2027)
    // from leaking into the picker.
    const now = new Date();
    const minStart = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
    const maxStart = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const preferredDate = typeof targetDate === 'string' ? (targetDate.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '') : '';
    const params = new URLSearchParams({
      groupId,
      minStartTimestamp: minStart,
      maxStartTimestamp: maxStart,
      max: '200',
      scheduled: 'true',
      includeComments: 'false',
      includeHidden: 'false',
      addProfileInfo: 'true',
    });
    const events = await spondRequest(`/sponds?${params.toString()}`, spondToken);
    const minMs=new Date(minStart).getTime(),maxMs=new Date(maxStart).getTime();
    const bounded=(Array.isArray(events)?events:[]).map(e=>({...e,_resolvedStartTimestamp:occurrenceStartInWindow(e,minMs,maxMs)})).filter(e=>e._resolvedStartTimestamp);
    const simplified = bounded
      .sort((a, b) => {
        const ad = irelandDate(a._resolvedStartTimestamp), bd = irelandDate(b._resolvedStartTimestamp);
        const ap = preferredDate && ad === preferredDate ? 0 : 1;
        const bp = preferredDate && bd === preferredDate ? 0 : 1;
        return ap - bp || new Date(a._resolvedStartTimestamp).getTime() - new Date(b._resolvedStartTimestamp).getTime();
      })
      .map(e => ({
        id: e.id,
        heading: e.heading,
        startTimestamp: e._resolvedStartTimestamp,
        sourceStartTimestamp: e.startTimestamp || '',
        meetupTimestamp: e.meetupTimestamp || '',
        endTimestamp: e.endTimestamp,
        location: e.location?.address || e.location?.feature || '',
        attendingCount: (e.responses?.acceptedIds || []).length,
        declinedCount: (e.responses?.declinedIds || []).length,
        unansweredCount: (e.responses?.unansweredIds || []).length,
      }));
    return Response.json({ events: simplified, preferredDate: preferredDate || null, windowStart:minStart, windowEnd:maxStart, rawCount: Array.isArray(events) ? events.length : 0 });
  }

  // ── Action: get_attendees ──
  if (action === 'get_attendees') {
    if (!groupId || !eventId) return Response.json({ error: 'groupId and eventId required' }, { status: 400 });
    const tournamentId=String(body.tournamentId||'');
    const [event, group] = await Promise.all([fetchEventOccurrence(groupId,eventId,spondToken,selectedStartTimestamp,selectedHeading),fetchGroupForAttendees(groupId,spondToken)]);
    const authoritativeStart=selectedStartTimestamp||eventStart(event);
    const selectedDate=irelandDate(authoritativeStart);
    if(!selectedDate)return Response.json({error:'Selected Spond event has no usable date/time.'},{status:409});
    let tournament=null;if(tournamentId)tournament=(await base44.asServiceRole.entities.Tournament.filter({id:tournamentId}))?.[0]||null;
    if(tournament&&user.role!=='admin'&&(tournament.tenant_id!==activeTenantId||tournament.host_club_id!==activeClubId))return Response.json({error:'Forbidden: tournament belongs to another tenant/club'},{status:403});
    const tenantId=tournament?.tenant_id||activeTenantId;const clubId=tournament?.host_club_id||activeClubId;
    const existingPlayers=tenantId&&clubId?await base44.asServiceRole.entities.Player.filter({tenant_id:tenantId,club_id:clubId}):[];
    const {accepted,waiting}=collectResponseIds(event);const memberMap=buildMemberMap(group);
    const attendees=[...accepted].map(id=>attendeeFromMember(id,memberMap[id])).filter(Boolean).map(attendee=>{const match=matchAttendee(attendee,existingPlayers);return {...attendee,existingPlayerId:match.matched?.id||null,existingPlayerName:match.matched?.full_name||null,duprRating:match.matched?.dupr_rating??null,status:match.status,candidates:match.candidates};});
    return Response.json({attendees,waitingListCount:waiting.size,event:{id:event.id,heading:event.heading,startTimestamp:authoritativeStart,location:event.location?.address||event.location?.feature||''}});
  }

  // ── Action: import_attendees ──
  if (action === 'import_attendees') {
    const tournamentId=String(body.tournamentId||''); const replaceRoster=body.replaceRoster===true;
    if(!tournamentId||!groupId||!eventId)return Response.json({error:'tournamentId, groupId and eventId required'},{status:400});
    const tournament=(await base44.asServiceRole.entities.Tournament.filter({id:tournamentId}))?.[0];
    if(!tournament)return Response.json({error:'Tournament not found'},{status:404});
    if(user.role!=='admin'&&(tournament.tenant_id!==activeTenantId||tournament.host_club_id!==activeClubId))return Response.json({error:'Forbidden: tournament belongs to another tenant/club'},{status:403});
    const [event,group]=await Promise.all([fetchEventOccurrence(groupId,eventId,spondToken,selectedStartTimestamp,selectedHeading),fetchGroupForAttendees(groupId,spondToken)]);
    const authoritativeStart=selectedStartTimestamp||eventStart(event);
    const selectedDate=irelandDate(authoritativeStart);
    if(!selectedDate)return Response.json({error:'Refusing roster sync: selected Spond event has no usable date/time.'},{status:409});
    const tenantId=tournament.tenant_id||activeTenantId; const clubId=tournament.host_club_id||activeClubId;
    if(!tenantId||!clubId)return Response.json({error:'Tournament is missing tenant/club ownership.'},{status:409});
    const scopedPlayers=await base44.asServiceRole.entities.Player.filter({tenant_id:tenantId,club_id:clubId}); const scopedIds=new Set(scopedPlayers.map(p=>p.id));
    const {accepted,waiting}=collectResponseIds(event); const memberMap=buildMemberMap(group);
    const sourceAttendees=[...accepted].map(id=>attendeeFromMember(id,memberMap[id])).filter(Boolean);
    const clientChoices=Object.fromEntries((body.matchChoices||[]).map(x=>[String(x.spondId),String(x.playerId||'')]));
    const allowedGuests=new Set((body.allowGuestSpondIds||[]).map(x=>String(x)));
    const rosterIds=new Set(replaceRoster?[]:(tournament.player_ids||[]).filter(id=>scopedIds.has(id))); let created=0,matched=0; const ambiguous=[]; const unresolved=[];
    for(const attendee of sourceAttendees){
      const match=matchAttendee(attendee,scopedPlayers); let player=null;
      const chosenId=clientChoices[String(attendee.spondId)]||'';
      if(chosenId){if(!scopedIds.has(chosenId))return Response.json({error:'Selected player match is outside this club.'},{status:403});player=scopedPlayers.find(p=>p.id===chosenId)||null;}
      else if(match.status==='matched') player=match.matched;
      else if(match.status==='ambiguous'){ambiguous.push({spondId:attendee.spondId,fullName:attendee.fullName,candidates:match.candidates});continue;}
      if(!player){
        if(!allowedGuests.has(String(attendee.spondId))){unresolved.push({spondId:attendee.spondId,fullName:attendee.fullName});continue;}
        player=await base44.asServiceRole.entities.Player.create({full_name:attendee.fullName,email:attendee.email||'',phone:attendee.phoneNumber||'',avatar_url:attendee.avatarUrl||'',status:'Active',relationship_type:'guest',relationship_status:'active',tenant_id:tenantId,club_id:clubId,wins:0,losses:0,matches_played:0});scopedPlayers.push(player);scopedIds.add(player.id);created++;
      }else matched++;
      rosterIds.add(player.id);
    }
    if(ambiguous.length||unresolved.length)return Response.json({error:'Resolve all unmatched player identities before refreshing the roster.',ambiguous,unresolved},{status:409});
    const now=new Date().toISOString(); const message=`Spond refresh: ${rosterIds.size} confirmed players (${matched} matched, ${created} new guests, ${waiting.size} waiting-list excluded).`;
    await base44.asServiceRole.entities.Tournament.update(tournamentId,{player_ids:[...rosterIds],start_date:selectedDate,kotc_spond_group_id:String(groupId),kotc_spond_event_id:String(eventId),kotc_last_import_message:message,kotc_last_imported_at:now});
    return Response.json({success:true,created,matched,total:rosterIds.size,waitingListCount:waiting.size,event:{id:event.id,heading:event.heading,startTimestamp:authoritativeStart,location:event.location?.address||event.location?.feature||''},message});
  }

  return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});