/**
 * Tournival V1 pure scheduling domain. No KOTC state, payment, network or
 * communication side effects. Server persistence must enforce compare-and-swap.
 */
const ids = match => [...(match.teamA || []), ...(match.teamB || [])];
export function indexTournivalMatches(rounds) {
  return rounds.flatMap(round => round.courts.map((court, i) => ({
    id: `qualification:${round.roundNumber}:${i + 1}`,
    round: round.roundNumber, order: i,
    teamA: [...court.teamA], teamB: [...court.teamB],
    status: 'waiting', court: null, revision: 0, result: null,
  })));
}

export function verifyCourtIntegrity(matches, courts) {
  const active = matches.filter(m => m.status === 'playing');
  const courtsSeen = new Set(), playersSeen = new Set();
  for (const m of active) {
    if (!Number.isInteger(m.court) || m.court < 1 || m.court > courts || courtsSeen.has(m.court)) {
      throw new Error('Court collision or invalid court assignment');
    }
    courtsSeen.add(m.court);
    for (const player of ids(m)) {
      if (playersSeen.has(player)) throw new Error('Player scheduled on overlapping matches');
      playersSeen.add(player);
    }
  }
  return true;
}

/**
 * Allocate eligible waiting matches to free courts, lowest round first.
 * No result is ever synthesised. A blocked fixture is skipped in favour of
 * a later eligible one, and matches already playing are untouched.
 */
/** @param {any[]} matches
 * @param {{courts?:number,unavailable?:number[],restUntil?:Record<string,number>,at?:number,paused?:boolean}} [options]
 */
export function scheduleTournivalCourts(matches, {
  courts, unavailable = [], restUntil = {}, at = Date.now(), paused = false,
} = {}) {
  if (!Number.isInteger(courts) || courts < 1) throw new Error('Invalid court count');
  verifyCourtIntegrity(matches, courts);
  if (paused) return { matches, assignments: [] };
  const blocked = new Set(unavailable);
  const active = matches.filter(m => m.status === 'playing');
  const occupied = new Set(active.map(m => m.court));
  const engaged = new Set(active.flatMap(ids));
  const next = matches.map(m => ({...m}));
  const assignments = [];
  const queue = next.filter(m => m.status === 'waiting')
    .sort((a,b) => a.round-b.round || a.order-b.order || a.id.localeCompare(b.id));
  for(let court=1;court<=courts;court++) {
    if(occupied.has(court))continue;
    const candidate=queue.find(m => m.status==='waiting' &&
      ids(m).length===4 && new Set(ids(m)).size===4 &&
      ids(m).every(p => !blocked.has(p) && !engaged.has(p) && (restUntil[p] ?? 0) <= at));
    if(!candidate)continue;
    candidate.status='playing';
    candidate.court=court;
    candidate.revision++;
    candidate.startedAt=at;
    assignments.push({matchId:candidate.id,court});
    for(const p of ids(candidate))engaged.add(p);
  }
  verifyCourtIntegrity(next,courts);
  return {matches:next,assignments};
}

/** Immutable, version-guarded, idempotent score mutation (transaction boundary). */
export function recordTournivalResult(matches, {
  matchId, expectedRevision, idempotencyKey, scoreA, scoreB, matchFormat = 'first_11_by1',
}, validate) {
  if(!idempotencyKey)throw new Error('Idempotency key required');
  const target=matches.find(m=>m.id===matchId);
  if(!target)throw new Error('Unknown match');
  if(target.operationKey===idempotencyKey) return {matches,duplicate:true,match:target};
  if(target.status!=='playing')throw new Error('Match not active');
  if(target.revision!==expectedRevision)throw new Error('Stale match revision');
  const valid=validate(scoreA,scoreB,matchFormat);
  if(!valid.valid)throw new Error(valid.error);
  const result={scoreA:Number(scoreA),scoreB:Number(scoreB),winner:Number(scoreA)>Number(scoreB)?'A':'B'};
  const changed={...target,status:'completed',court:null,finishedAt:Date.now(),
    result,revision:target.revision+1,operationKey:idempotencyKey};
  return {matches:matches.map(m=>m.id===matchId?changed:m),duplicate:false,match:changed};
}
