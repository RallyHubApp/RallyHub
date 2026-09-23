import React from 'react';

const RALLYHUB_LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';
const COPYRIGHT = '© 2026 RallyHub. All rights reserved.';

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function fmtDate(value) {
  if (!value) return '________________';
  try {
    return new Date(value + (String(value).length === 10 ? 'T12:00:00' : '')).toLocaleDateString('en-IE', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return String(value);
  }
}

function shortGender(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v.startsWith('f')) return 'F';
  if (v.startsWith('m')) return 'M';
  return '';
}

function BrandHeader({ event, tournament, title, subtitle }) {
  return <div className="rhpp-header">
    <div className="rhpp-brand">
      <img src={RALLYHUB_LOGO_URL} alt="RallyHub" />
    </div>
    <div className="rhpp-event-title">
      <div className="rhpp-kicker">INTERCLUB</div>
      <h1>{event.club_a_name} vs {event.club_b_name}</h1>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      <p className="rhpp-meta">{tournament?.location || 'Venue: __________________'} <span>│</span> Date: {fmtDate(tournament?.start_date)}</p>
    </div>
    <div className="rhpp-tagline">Play<br/>Connect<br/>Belong</div>
  </div>;
}

function Footer() {
  return <div className="rhpp-footer">
    <div className="rhpp-footer-wave" />
    <img src={RALLYHUB_LOGO_URL} alt="RallyHub" />
    <div className="rhpp-footer-copy">Powered by <strong>RallyHub</strong> <span>│</span> {COPYRIGHT}</div>
  </div>;
}

function Page({ children, className='' }) {
  return <section className={`rhpp-page ${className}`}>{children}</section>;
}

function fixtureFor(matches, round, court) {
  return matches.find(m => Number(m.round_number) === Number(round) && Number(m.court_number) === Number(court));
}

function PairNames({ names=[] }) {
  return <span>{names.join(' & ') || '—'}</span>;
}

function MasterScorePage({ event, tournament, matches, rounds, courts, pageIndex, totalPages }) {
  return <Page>
    <BrandHeader
      event={event}
      tournament={tournament}
      title="Master Score Sheet"
      subtitle={totalPages > 1 ? `Rounds ${rounds[0]}–${rounds[rounds.length - 1]} · Page ${pageIndex + 1} of ${totalPages}` : `${rounds.length} rounds · manual score backup`}
    />
    <table className="rhpp-score-table">
      <thead><tr><th className="rhpp-round-col">Round</th>{courts.map(c => <th key={c}>Court {c}</th>)}</tr></thead>
      <tbody>
        {rounds.map(round => <tr key={round}>
          <td className="rhpp-round-number">{round}</td>
          {courts.map(court => {
            const m = fixtureFor(matches, round, court);
            return <td key={court} className="rhpp-score-cell">
              {m ? <>
                <div className="rhpp-pair"><PairNames names={m.club_a_names || []}/></div>
                <div className="rhpp-score-boxes"><span></span><b>–</b><span></span></div>
                <div className="rhpp-pair"><PairNames names={m.club_b_names || []}/></div>
              </> : <div className="rhpp-empty">No match</div>}
            </td>;
          })}
        </tr>)}
      </tbody>
    </table>
    <div className="rhpp-score-notes">
      <div><strong>Notes</strong><div className="rhpp-lines"><i/><i/><i/></div></div>
      <div className="rhpp-reminder"><strong>Quick reminders</strong><p>Write the score here first if the desk is busy</p><p>Enter it in RallyHub as soon as practical</p><p>Keep this sheet as the paper backup</p></div>
    </div>
    <Footer />
  </Page>;
}

function participantAvailableInRound(p, round, lastScheduledById) {
  if ((p.roster_role || 'rotation') === 'reserve' && !p.reserve_activated) return false;
  const from = Number(p.available_from_round || p.replacement_effective_round || 1);
  if (round < from) return false;
  if (['withdrawn','injured','replaced'].includes(p.status)) {
    const last = Number(lastScheduledById[p.id] || 0);
    return last > 0 && round <= last;
  }
  return true;
}

function RoundSchedule({ event, matches, participants, round, courts, lastScheduledById }) {
  const roundMatches = matches.filter(m => Number(m.round_number) === round);
  const activeIds = new Set(roundMatches.flatMap(m => [...(m.club_a_participant_ids || []), ...(m.club_b_participant_ids || [])]));
  const resting = participants.filter(p => ['club_a','club_b'].includes(p.side) && participantAvailableInRound(p, round, lastScheduledById) && !activeIds.has(p.id));
  const restingA = resting.filter(p => p.side === 'club_a');
  const restingB = resting.filter(p => p.side === 'club_b');

  return <div className="rhpp-round-block">
    <div className="rhpp-round-title">Round {round}</div>
    <div className="rhpp-court-grid">
      {courts.map(court => {
        const m = fixtureFor(roundMatches, round, court);
        return <div className="rhpp-court-card" key={court}>
          <div className="rhpp-court-head">Court {court}</div>
          {m ? <div className="rhpp-court-body"><PairNames names={m.club_a_names || []}/><em>vs</em><PairNames names={m.club_b_names || []}/></div> : <div className="rhpp-court-body rhpp-empty">No match scheduled</div>}
        </div>;
      })}
    </div>
    <div className="rhpp-rest-title">Resting this round</div>
    <div className="rhpp-rest-grid">
      <div><strong style={{color:event.club_a_primary_colour || '#155eaa'}}>{event.club_a_name}</strong><p>{restingA.length ? restingA.map(p => p.display_name).join(' · ') : 'None'}</p></div>
      <div><strong style={{color:event.club_b_primary_colour || '#8b1e24'}}>{event.club_b_name}</strong><p>{restingB.length ? restingB.map(p => p.display_name).join(' · ') : 'None'}</p></div>
    </div>
    {event.include_break && Number(event.break_after_round) === round && <div className="rhpp-break">{event.break_minutes}-minute break after Round {round}</div>}
  </div>;
}

function MasterSchedulePage({ event, tournament, matches, participants, rounds, courts, pageIndex, totalPages, lastScheduledById }) {
  return <Page>
    <BrandHeader
      event={event}
      tournament={tournament}
      title="Master Schedule / Court Assignment"
      subtitle={totalPages > 1 ? `Rounds ${rounds[0]}–${rounds[rounds.length - 1]} · Page ${pageIndex + 1} of ${totalPages}` : null}
    />
    <div className="rhpp-schedule-stack">
      {rounds.map(round => <RoundSchedule key={round} event={event} matches={matches} participants={participants} round={round} courts={courts} lastScheduledById={lastScheduledById} />)}
    </div>
    <p className="rhpp-source-note">Auto-populated from the approved RallyHub draw and current round schedule.</p>
    <Footer />
  </Page>;
}

function RosterTable({ event, side, players }) {
  const isA = side === 'club_a';
  const name = isA ? event.club_a_name : event.club_b_name;
  const logo = isA ? event.club_a_logo_url : event.club_b_logo_url;
  const primary = isA ? event.club_a_primary_colour : event.club_b_primary_colour;
  const secondary = isA ? event.club_a_secondary_colour : event.club_b_secondary_colour;
  const rotation = players.filter(p => (p.roster_role || 'rotation') !== 'reserve').sort((a,b)=>Number(a.event_rank||999)-Number(b.event_rank||999));
  const reserves = players.filter(p => (p.roster_role || 'rotation') === 'reserve').sort((a,b)=>Number(a.event_rank||999)-Number(b.event_rank||999));

  return <div className="rhpp-roster">
    <div className="rhpp-roster-title" style={{background:secondary || '#eef4f8', borderTopColor:primary || '#155eaa'}}>
      {logo && <img src={logo} alt="" />}<strong>{name}</strong>
    </div>
    <table><thead><tr><th>No.</th><th>Player Name</th><th>M / F</th><th>Notes</th></tr></thead>
      <tbody>{Array.from({length:Math.max(16, rotation.length)},(_,i)=>{
        const p=rotation[i];
        return <tr key={i}><td>{p?.event_rank || i+1}</td><td>{p?.display_name || ''}</td><td>{p ? shortGender(p.gender) : ''}</td><td>{p && p.status !== 'active' ? p.status : ''}</td></tr>;
      })}</tbody>
    </table>
    <div className="rhpp-reserve-title">Reserves</div>
    <table className="rhpp-reserves"><tbody>{Array.from({length:Math.max(4,reserves.length)},(_,i)=>{
      const p=reserves[i]; return <tr key={i}><td>R{i+1}</td><td>{p?.display_name || ''}</td></tr>;
    })}</tbody></table>
  </div>;
}

function TeamRosterPage({ event, tournament, participants, roundsCount, courtsCount }) {
  const a = participants.filter(p => p.side === 'club_a');
  const b = participants.filter(p => p.side === 'club_b');
  const matchFormat = event.normal_match_type === 'timed'
    ? `Timed · ${event.play_minutes || 0} min${event.timed_draws_allowed === false ? ' · no draws' : ''}`
    : `First to ${event.normal_target_points || 11} · win by ${event.normal_win_by || 1}`;

  return <Page>
    <BrandHeader event={event} tournament={tournament} title="Team Roster & Reserves" />
    <div className="rhpp-roster-layout">
      <RosterTable event={event} side="club_a" players={a} />
      <RosterTable event={event} side="club_b" players={b} />
      <div className="rhpp-info-panel">
        <h3>Event Information</h3>
        <dl>
          <dt>Date</dt><dd>{fmtDate(tournament?.start_date)}</dd>
          <dt>Venue</dt><dd>{tournament?.location || '________________'}</dd>
          <dt>Format</dt><dd>{courtsCount} courts · {roundsCount} rounds</dd>
          <dt>Match format</dt><dd>{matchFormat}</dd>
          <dt>Break</dt><dd>{event.include_break ? `${event.break_minutes} minutes after Round ${event.break_after_round}` : 'No scheduled break'}</dd>
          <dt>Team size</dt><dd>{a.filter(p => (p.roster_role || 'rotation') !== 'reserve').length} / {b.filter(p => (p.roster_role || 'rotation') !== 'reserve').length} + reserves</dd>
        </dl>
        <div className="rhpp-day-notes"><h3>Notes / Changes on the Day</h3><i/><i/><i/><i/></div>
      </div>
    </div>
    <Footer />
  </Page>;
}

function BriefingPage({ event, tournament, roundsCount, courtsCount }) {
  const format = event.normal_match_type === 'timed'
    ? `Timed rounds · ${event.play_minutes || 0} minutes${event.timed_draws_allowed === false ? ' · no draws' : ' · draws allowed'}`
    : `First to ${event.normal_target_points || 11} · win by ${event.normal_win_by || 1}`;
  return <Page>
    <BrandHeader event={event} tournament={tournament} title="Event Briefing & Rules" />
    <div className="rhpp-rule-grid">
      <div className="rhpp-rule"><h3>1. Format</h3><ul><li>{courtsCount} courts, {roundsCount} rounds</li><li>Pairs are pre-drawn and shown on the schedule</li><li>{format}</li><li>Interclub scoring: {event.win_points ?? 2} points for a win{Number(event.draw_points ?? 1) ? `, ${event.draw_points ?? 1} for a draw` : ''}</li></ul></div>
      <div className="rhpp-rule"><h3>2. During the Event</h3><ul><li>Be ready when your court is called</li><li>Keep to the published schedule</li><li>Change over promptly at the end of each round</li><li>Report scores to the host / desk</li><li>Respect opponents, officials and volunteers</li></ul></div>
      <div className="rhpp-rule"><h3>3. Break</h3><ul>{event.include_break ? <><li>{event.break_minutes}-minute break after Round {event.break_after_round}</li><li>The host may shorten or end the break if the event is running late</li><li>Be ready for Round {Number(event.break_after_round || 0)+1}</li></> : <li>No scheduled mid-event break</li>}</ul></div>
      <div className="rhpp-rule"><h3>4. Substitutions / Withdrawals</h3><ul><li>Tell the host immediately if you cannot continue</li><li>A reserve or approved replacement may be used</li><li>Future fixtures can be adjusted without changing completed results</li><li>Host decisions are recorded in RallyHub</li></ul></div>
      <div className="rhpp-rule"><h3>5. Showcase Final (if included)</h3><ul><li>Separate points-based final, not a timed round</li><li>Host chooses 11 or 15, win by 1 or 2</li><li>Any two eligible players from each club may be selected</li><li>An exhibition Showcase does not change the Interclub result</li></ul></div>
      <div className="rhpp-rule rhpp-rule-highlight"><h3>Most importantly…</h3><p>Be fair, have fun, and represent your club with pride.</p></div>
    </div>
    <Footer />
  </Page>;
}

function FinalResultPage({ event, tournament, score, overallScore, showcaseMatch, courtsCount, roundsCount }) {
  const winner = overallScore.clubA === overallScore.clubB ? 'Overall draw' : (overallScore.clubA > overallScore.clubB ? event.club_a_name : event.club_b_name);
  return <Page>
    <BrandHeader event={event} tournament={tournament} title="Final Result / Sign-off" />
    <div className="rhpp-result-layout">
      <div className="rhpp-result-main">
        <div className="rhpp-team-score-grid">
          <div style={{borderTopColor:event.club_a_primary_colour || '#155eaa'}}>
            {event.club_a_logo_url && <img src={event.club_a_logo_url} alt="" />}<strong>{event.club_a_name}</strong><b>{overallScore.clubA}</b><small>Interclub points</small>
          </div>
          <div style={{borderTopColor:event.club_b_primary_colour || '#8b1e24'}}>
            {event.club_b_logo_url && <img src={event.club_b_logo_url} alt="" />}<strong>{event.club_b_name}</strong><b>{overallScore.clubB}</b><small>Interclub points</small>
          </div>
        </div>
        <div className="rhpp-result-stats">
          <div><b>{score.matchesWonA}</b><span>{event.club_a_name} wins</span></div>
          <div><b>{score.draws}</b><span>Draws</span></div>
          <div><b>{score.matchesWonB}</b><span>{event.club_b_name} wins</span></div>
          <div><b>{score.gamePointsA}</b><span>Points scored</span></div>
          <div><b>{score.gamePointDifference >= 0 ? '+' : ''}{score.gamePointDifference}</b><span>Point differential</span></div>
          <div><b>{score.gamePointsB}</b><span>Points scored</span></div>
        </div>
        {showcaseMatch && ['completed','draw'].includes(showcaseMatch.status) && <div className="rhpp-showcase-result">
          <strong>{showcaseMatch.showcase_mode === 'exhibition' ? 'Optional Showcase Final · Exhibition' : 'Showcase Tiebreak Final'}</strong>
          <b>{event.club_a_name} {showcaseMatch.score_a}–{showcaseMatch.score_b} {event.club_b_name}</b>
          <span>{(showcaseMatch.club_a_names || []).join(' & ')} vs {(showcaseMatch.club_b_names || []).join(' & ')}</span>
          <small>First to {showcaseMatch.showcase_target_points || 11} · win by {showcaseMatch.showcase_win_by || 1}{showcaseMatch.showcase_mode === 'exhibition' ? ' · Interclub result unchanged' : ''}</small>
        </div>}
        <div className="rhpp-winner">Final result: <strong>{winner}</strong></div>
      </div>
      <aside className="rhpp-signoff">
        <h3>Event Details</h3><p><b>Date:</b> {fmtDate(tournament?.start_date)}</p><p><b>Venue:</b> {tournament?.location || '________________'}</p><p><b>Format:</b> {courtsCount} courts · {roundsCount} rounds</p>
        <h3>Sign Off</h3><p>We confirm that the above result is correct.</p>
        <label>{event.club_a_name} Captain:<i/></label><label>{event.club_b_name} Captain:<i/></label><label>Host:<i/></label><label>Date:<i/></label>
      </aside>
    </div>
    <Footer />
  </Page>;
}

export default function InterclubPrintPack({ event, tournament, matches=[], participants=[], score, overallScore, showcaseMatch }) {
  if (!event) return null;
  const roundsCount = Math.max(Number(event.planned_rounds || 0), ...matches.filter(m => !m.is_showcase && Number(m.round_number || 0) <= Number(event.planned_rounds || 9999)).map(m => Number(m.round_number || 0)), 1);
  const rounds = Array.from({length:roundsCount},(_,i)=>i+1);
  const playable = matches.filter(m => !m.is_showcase && m.status !== 'not_played' && Number(m.round_number || 0) <= roundsCount);
  const maxCourt = Math.max(Number(event.courts || 0), ...playable.map(m => Number(m.court_number || 0)), 1);
  const courts = Array.from({length:maxCourt},(_,i)=>i+1);
  const lastScheduledById = {};
  playable.forEach(m => {
    [...(m.club_a_participant_ids || []), ...(m.club_b_participant_ids || [])].forEach(id => {
      lastScheduledById[id] = Math.max(Number(lastScheduledById[id] || 0), Number(m.round_number || 0));
    });
  });
  const scorePages = chunk(rounds, 12);
  const schedulePages = chunk(rounds, 2);

  return <div className="rhpp-root">
    <style>{`
      @page { size: A4 portrait; margin: 0; }
      @media print {
        html, body { background:#fff !important; }
        body { margin:0 !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .rhpp-page { break-after:page; page-break-after:always; }
        .rhpp-page:last-child { break-after:auto; page-break-after:auto; }
      }
      .rhpp-root{font-family:Arial,Helvetica,sans-serif;color:#0b2e59;background:#fff}
      .rhpp-page{position:relative;width:210mm;min-height:297mm;padding:8mm 9mm 19mm;box-sizing:border-box;background:#fff;color:#0b2e59;overflow:hidden}
      .rhpp-header{display:grid;grid-template-columns:45mm 1fr 30mm;align-items:start;border-bottom:1.5px solid #12a150;padding-bottom:3mm;margin-bottom:3mm;min-height:25mm}
      .rhpp-brand img{width:42mm;height:auto;display:block}
      .rhpp-event-title{text-align:center}.rhpp-kicker{font-size:11pt;font-weight:900;letter-spacing:.08em}.rhpp-event-title h1{font-size:15pt;line-height:1.05;margin:1mm 0 0}.rhpp-event-title h2{font-size:10pt;color:#0d5ca8;margin:.8mm 0 0}.rhpp-event-title>p:not(.rhpp-meta){font-size:7pt;margin:.6mm 0 0}.rhpp-meta{font-size:6.5pt;margin:1.1mm 0 0;color:#274a70}.rhpp-meta span{margin:0 1mm}.rhpp-tagline{text-align:right;font-size:10pt;font-style:italic;font-weight:700;line-height:1.05;color:#0d3e79}
      .rhpp-footer{position:absolute;left:9mm;right:9mm;bottom:5mm;height:11mm;display:flex;align-items:flex-end}.rhpp-footer-wave{position:absolute;left:0;right:0;top:0;border-top:1.2px solid #0b67b2;transform:skewY(-1deg)}.rhpp-footer img{width:27mm;height:auto;position:relative}.rhpp-footer-copy{margin-left:auto;font-size:5.6pt;color:#315579;position:relative}.rhpp-footer-copy span{margin:0 .8mm}
      .rhpp-score-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:6.4pt}.rhpp-score-table th{background:#07558d;color:white;padding:1.2mm .7mm;border:.3mm solid #d7e7f2}.rhpp-score-table td{border:.25mm solid #9bbbd0;height:15mm;padding:.7mm;vertical-align:middle}.rhpp-round-col{width:11mm}.rhpp-round-number{text-align:center;font-size:10pt;font-weight:900;background:#edf7fd}.rhpp-score-cell{text-align:center}.rhpp-pair{font-size:5.8pt;line-height:1.1;white-space:normal;overflow-wrap:anywhere}.rhpp-score-boxes{display:flex;justify-content:center;align-items:center;gap:1.2mm;margin:.7mm 0}.rhpp-score-boxes span{width:7mm;height:6mm;border:.4mm solid #4f7391;border-radius:1mm;display:inline-block}.rhpp-score-boxes b{font-size:7pt}.rhpp-empty{color:#8ba0b2;font-style:italic}.rhpp-score-notes{display:grid;grid-template-columns:1.3fr 1fr;gap:3mm;margin-top:3mm;font-size:6.5pt}.rhpp-score-notes>div{background:#f2f8fc;border-radius:2mm;padding:2mm}.rhpp-lines{display:grid;gap:2.5mm;margin-top:2mm}.rhpp-lines i{border-bottom:.25mm solid #6888a3}.rhpp-reminder p{margin:1mm 0}
      .rhpp-schedule-stack{display:grid;gap:3mm}.rhpp-round-block{border:.3mm solid #b7d3e4;border-radius:1.5mm;overflow:hidden}.rhpp-round-title{background:#07558d;color:#fff;font-size:12pt;font-weight:900;padding:1.4mm 2mm}.rhpp-court-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5mm;padding:1.5mm}.rhpp-court-card{border:.3mm solid #67a9d1;border-radius:1mm;overflow:hidden}.rhpp-court-head{text-align:center;background:#d9effb;font-size:8pt;font-weight:900;padding:.7mm}.rhpp-court-body{min-height:13mm;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:1mm;font-size:6.6pt;font-weight:600;line-height:1.25}.rhpp-court-body em{font-style:normal;color:#5a7185;font-size:5.8pt}.rhpp-rest-title{background:#dceef8;font-size:8pt;font-weight:900;padding:1mm 2mm}.rhpp-rest-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5mm;padding:1.5mm;font-size:6.2pt}.rhpp-rest-grid>div{border:.25mm solid #a9c4d5;padding:1.2mm}.rhpp-rest-grid strong{font-size:6.5pt}.rhpp-rest-grid p{margin:.7mm 0 0;line-height:1.3}.rhpp-break{text-align:center;background:#dff5cf;color:#0f5b2c;font-size:8pt;font-weight:900;padding:1.5mm}.rhpp-source-note{font-size:5.8pt;color:#365c78;margin:2.5mm 0 0}
      .rhpp-roster-layout{display:grid;grid-template-columns:1fr 1fr 44mm;gap:2.5mm}.rhpp-roster-title{border-top:2mm solid;display:flex;align-items:center;gap:2mm;padding:1.8mm;border-radius:2mm 2mm 0 0;font-size:9pt}.rhpp-roster-title img{width:9mm;height:9mm;object-fit:contain;background:#fff;border-radius:50%}.rhpp-roster table{width:100%;border-collapse:collapse;font-size:6pt}.rhpp-roster th{background:#07558d;color:white;padding:1mm}.rhpp-roster td{border:.25mm solid #9db9cb;height:5.2mm;padding:.5mm 1mm}.rhpp-roster td:first-child{width:9mm;text-align:center;font-weight:700}.rhpp-roster th:nth-child(3),.rhpp-roster td:nth-child(3){width:12mm;text-align:center}.rhpp-roster th:last-child{width:22mm}.rhpp-reserve-title{background:#dce8ef;padding:1mm 2mm;font-size:7pt;font-weight:900;margin-top:2mm}.rhpp-reserves td{height:5mm!important}.rhpp-info-panel{background:#f0f8fc;border-radius:2mm;padding:2.5mm;font-size:6.4pt}.rhpp-info-panel h3{font-size:8pt;margin:0 0 2mm}.rhpp-info-panel dl{margin:0}.rhpp-info-panel dt{font-weight:900;margin-top:2mm}.rhpp-info-panel dd{margin:.5mm 0 0}.rhpp-day-notes{margin-top:4mm}.rhpp-day-notes i{display:block;border-bottom:.25mm solid #7894aa;height:7mm}
      .rhpp-rule-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.rhpp-rule{border:.3mm solid #bfd7e7;border-radius:2mm;padding:3mm;min-height:43mm}.rhpp-rule h3{font-size:9pt;margin:0 0 2mm}.rhpp-rule ul{padding-left:5mm;margin:0;font-size:7pt;line-height:1.55}.rhpp-rule p{font-size:7.5pt;margin:0}.rhpp-rule-highlight{grid-column:1/-1;min-height:0;background:#eef9ee;border-color:#b7dfba;text-align:center}
      .rhpp-result-layout{display:grid;grid-template-columns:1fr 47mm;gap:3mm}.rhpp-team-score-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.rhpp-team-score-grid>div{border:.4mm solid #bfd5e4;border-top:2mm solid;border-radius:2mm;padding:3mm;text-align:center}.rhpp-team-score-grid img{width:15mm;height:15mm;object-fit:contain;display:block;margin:0 auto 1mm}.rhpp-team-score-grid strong{display:block;font-size:9pt}.rhpp-team-score-grid b{display:block;font-size:34pt;line-height:1;margin:2mm 0}.rhpp-team-score-grid small{font-size:6.5pt}.rhpp-result-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:2mm;margin-top:2.5mm}.rhpp-result-stats>div{border:.25mm solid #b7cad8;border-radius:1.5mm;padding:2mm;text-align:center}.rhpp-result-stats b{display:block;font-size:13pt}.rhpp-result-stats span{display:block;font-size:5.8pt}.rhpp-showcase-result{margin-top:3mm;background:#eff9ef;border:.3mm solid #aad7b1;border-radius:2mm;padding:2.5mm;text-align:center}.rhpp-showcase-result>*{display:block}.rhpp-showcase-result strong{font-size:7pt;color:#087e42}.rhpp-showcase-result b{font-size:9pt;margin-top:1mm}.rhpp-showcase-result span,.rhpp-showcase-result small{font-size:6pt;margin-top:.7mm}.rhpp-winner{margin-top:4mm;text-align:center;font-size:10pt}.rhpp-signoff{background:#f0f8fc;border-radius:2mm;padding:3mm;font-size:6.5pt}.rhpp-signoff h3{font-size:8pt;margin:0 0 2mm}.rhpp-signoff h3:not(:first-child){margin-top:5mm}.rhpp-signoff p{margin:1.5mm 0}.rhpp-signoff label{display:grid;grid-template-columns:auto 1fr;gap:2mm;margin-top:4mm}.rhpp-signoff i{border-bottom:.25mm solid #7894aa}
    `}</style>

    {scorePages.map((rs,i)=><MasterScorePage key={`score-${i}`} event={event} tournament={tournament} matches={playable} rounds={rs} courts={courts} pageIndex={i} totalPages={scorePages.length} />)}
    {schedulePages.map((rs,i)=><MasterSchedulePage key={`schedule-${i}`} event={event} tournament={tournament} matches={playable} participants={participants} rounds={rs} courts={courts} pageIndex={i} totalPages={schedulePages.length} lastScheduledById={lastScheduledById} />)}
    <TeamRosterPage event={event} tournament={tournament} participants={participants} roundsCount={roundsCount} courtsCount={courts.length} />
    <BriefingPage event={event} tournament={tournament} roundsCount={roundsCount} courtsCount={courts.length} />
    {['completed','archived'].includes(event.status) && <FinalResultPage event={event} tournament={tournament} score={score} overallScore={overallScore} showcaseMatch={showcaseMatch} courtsCount={courts.length} roundsCount={roundsCount} />}
  </div>;
}
